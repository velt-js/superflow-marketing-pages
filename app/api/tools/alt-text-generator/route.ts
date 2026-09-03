// Alt Text Generator API.
//
// POST /api/tools/alt-text-generator
//   { "url": "example.com", "refresh": false }
//
// The work happens in the product backend: it reads the page, collects the
// images, and shows the first ten of them to a vision model, which writes a
// draft alt text for each. This route is the seam between the marketing site
// and that engine, adding the SSRF guard, the per-IP budget, and a cache.
//
// THIS ONE SPENDS MONEY, WHICH CHANGES TWO DECISIONS
//
// 1. The cache is a full day and it comes before the rate limiter, so a
//    shared link never re-runs the model. A cached answer costs nothing, so
//    it should not spend anybody's budget either.
// 2. `budget-exhausted` is passed through as the backend phrased it. The
//    monthly model spend is capped and the cap fails closed on purpose. That
//    is a known state with known copy, not an error worth dressing up.
//
// A run that finds problems is still a successful run. The backend reports
// the execution status as "failed" when a page has images missing alt text,
// which is a QA verdict about the page and not a fault in the run, so this
// route never reads that field.
//
// Envelope: every response is HTTP 200 JSON. Failures carry `error` with
// ready-to-render plain words plus a machine `errorCode`; there is never a
// bare 500 and never a stack trace.

import type { NextRequest } from "next/server";
import {
  CACHE_TTL,
  invalidateCache,
  readCache,
  toolCacheKey,
  writeCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";
import { resolveUserUrl, URL_REJECTION_MESSAGES } from "@/lib/toolkit/url";
import { isBackendConfigured } from "@/lib/toolkit/superflow-api";
import {
  beginRun,
  pendingBody,
  resumeRun,
  runIdFrom,
  waitBudgetFor,
  type DeferredContext,
  type DeferredOutcome,
} from "@/lib/toolkit/deferred-run";

const TOOL_SLUG = "alt-text-generator";

/** The backend's tool id. */
const TOOL_ID = "alt-text-generator";

/** A vision model call per image. Firmly the heavy budget. */
const RATE_TIER = "heavy" as const;

/** Bump when the result shape changes so stale cache entries are ignored. */
const RESULT_VERSION = 1;

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
export const runtime = "nodejs";

/**
 * The wait, in seconds, this function is allowed. The backend run plus its
 * cold start can take most of a minute (see OVERALL_TIMEOUT_MS in
 * lib/toolkit/superflow-api.ts, which sits at 55s); without this the platform
 * default decides, and a run that would have answered turns into an error
 * page instead of a report.
 */
export const maxDuration = 60;

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/**
 * One image on the page.
 *
 * `hadAlt` and `currentAlt` are two separate facts and the UI must keep them
 * that way. `hadAlt: false` means there is no alt attribute at all, which is
 * a bug. `hadAlt: true` with an empty `currentAlt` means the author wrote
 * alt="" on purpose to mark the image as decorative, which is correct HTML.
 * Flattening the two into "no alt text" is the classic mistake here.
 */
export type AltTextImage = {
  src: string;
  hadAlt: boolean;
  currentAlt: string;
  suggestedAlt: string;
  isDecorative: boolean;
  /** Set when the image was listed but never shown to the model. */
  skippedReason?: string;
};

export type AltTextCounts = {
  /** Every image tag found on the page. */
  found: number;
  /** How many were actually sent to the model. */
  analyzed: number;
  /** How many had no alt attribute at all. */
  missingAlt: number;
  /** How many were listed but skipped. */
  skipped: number;
};

/** The report as the backend returns it. */
export type AltTextReport = {
  url?: string;
  requestedUrl?: string;
  httpStatus?: number;
  images: AltTextImage[];
  counts: AltTextCounts;
  /** The vision model that wrote the drafts. */
  model?: string;
  /** What the run cost, in millionths of a US dollar. */
  costMicroUsd?: number;
  durationMs?: number;
};

/** The successful result. Also exactly what the 24 hour cache stores. */
type AltTextResult = AltTextReport & {
  url: string;
  requestedUrl: string;
  /** When the page was read, ISO 8601. */
  checkedAt: string;
};

/**
 * Builds a JSON response. Always 200: the UI reads `.error`, not the status,
 * and a no-store header keeps intermediaries out of it.
 *
 * @param body - The payload.
 */
function json(body: unknown): Response {
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

/**
 * Narrows one untyped image entry.
 *
 * @param raw - One element of the backend's `images` array.
 */
function toImage(raw: unknown): AltTextImage | null {
  try {
    if (typeof raw !== "object" || raw === null) return null;
    const entry = raw as Record<string, unknown>;
    const src = typeof entry.src === "string" ? entry.src : "";
    if (src.length === 0) return null;

    return {
      src,
      // Absent means absent. Defaulting a missing `hadAlt` to true would
      // report a broken image as a deliberate decorative one.
      hadAlt: entry.hadAlt === true,
      currentAlt: typeof entry.currentAlt === "string" ? entry.currentAlt : "",
      suggestedAlt:
        typeof entry.suggestedAlt === "string" ? entry.suggestedAlt : "",
      isDecorative: entry.isDecorative === true,
      ...(typeof entry.skippedReason === "string" &&
      entry.skippedReason.length > 0
        ? { skippedReason: entry.skippedReason }
        : {}),
    };
  } catch {
    return null;
  }
}

/**
 * Narrows the backend's untyped terminal report to the fields we render.
 *
 * @param data - The terminal `data` payload from the backend.
 */
function toReport(data: unknown): AltTextReport {
  try {
    const empty: AltTextReport = {
      images: [],
      counts: { found: 0, analyzed: 0, missingAlt: 0, skipped: 0 },
    };
    if (typeof data !== "object" || data === null) return empty;
    const raw = data as Record<string, unknown>;

    const str = (key: string): string | undefined =>
      typeof raw[key] === "string" && (raw[key] as string).length > 0
        ? (raw[key] as string)
        : undefined;
    const num = (key: string): number | undefined =>
      typeof raw[key] === "number" && Number.isFinite(raw[key] as number)
        ? (raw[key] as number)
        : undefined;

    const images = Array.isArray(raw.images)
      ? raw.images
          .map(toImage)
          .filter((image): image is AltTextImage => image !== null)
      : [];

    const rawCounts =
      typeof raw.counts === "object" && raw.counts !== null
        ? (raw.counts as Record<string, unknown>)
        : {};
    const count = (key: string, fallback: number): number =>
      typeof rawCounts[key] === "number" &&
      Number.isFinite(rawCounts[key] as number)
        ? (rawCounts[key] as number)
        : fallback;

    return {
      url: str("url"),
      requestedUrl: str("requestedUrl"),
      httpStatus: num("httpStatus"),
      images,
      counts: {
        found: count("found", images.length),
        analyzed: count(
          "analyzed",
          images.filter((image) => image.skippedReason === undefined).length,
        ),
        missingAlt: count(
          "missingAlt",
          images.filter((image) => !image.hadAlt).length,
        ),
        skipped: count(
          "skipped",
          images.filter((image) => image.skippedReason !== undefined).length,
        ),
      },
      model: str("model"),
      costMicroUsd: num("costMicroUsd"),
      durationMs: num("durationMs"),
    };
  } catch {
    return {
      images: [],
      counts: { found: 0, analyzed: 0, missingAlt: 0, skipped: 0 },
    };
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let payload: { url?: unknown; refresh?: unknown };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json({
        error: "Send a JSON body with a url.",
        errorCode: "bad-request",
      });
    }

    const ip = clientIpFrom(request.headers);

    // A body carrying a run id is the second half of a run this route already
    // started and budgeted. It is read, never re-dispatched, so polling costs
    // the caller nothing further.
    const runId = runIdFrom(payload);
    if (runId.length > 0) {
      return settle(
        await resumeRun({
          toolId: TOOL_ID,
          slug: TOOL_SLUG,
          runId,
          clientIp: ip,
          waitMs: waitBudgetFor(payload),
        }),
        "",
      );
    }

    const rawUrl = typeof payload?.url === "string" ? payload.url : "";
    const refresh = payload?.refresh === true;

    // 1. Normalize and SSRF-check what the user typed.
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) {
      return json({
        error: URL_REJECTION_MESSAGES[resolved.reason],
        errorCode: "invalid-url",
      });
    }

    // 2. Cache first, before the rate limiter. This one matters more than
    //    usual: every miss is a real model call against a real budget.
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: resolved.url,
      version: RESULT_VERSION,
    });

    if (refresh) {
      await invalidateCache(cacheKey);
    } else {
      const hit = await readCache<AltTextResult>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({ ...hit.data, cached: true, ageSeconds: hit.ageSeconds });
      }
    }

    // 3. Rate limit per IP. The limiter fails open by design.
    const decision = await applyRateLimit({
      tool: TOOL_SLUG,
      ip,
      tier: RATE_TIER,
    });
    if (!decision.allowed) {
      return json({
        error: decision.message,
        errorCode: "rate-limited",
        retryAfterSeconds: decision.retryAfterSeconds,
      });
    }

    // 4. No in-repo fallback: the marketing site does not hold a model key,
    //    and inventing alt text without a model would be worse than nothing.
    if (!isBackendConfigured()) {
      return json({
        error:
          "The alt text service is not switched on in this environment. Try the hosted tool at usesuperflow.ai instead.",
        errorCode: "not-configured",
      });
    }

    // 5. Run it. Forwarding the caller IP keeps the backend's per-IP budget
    //    pointed at the visitor rather than at this server. A vision call over
    //    every image on a page takes about 52 seconds against production,
    //    close enough to what one serverless request may hold that this
    //    returns a handle whenever the caller is not willing to wait it out.
    return settle(
      await beginRun({
        toolId: TOOL_ID,
        slug: TOOL_SLUG,
        url: resolved.url,
        clientIp: ip,
        cacheKey,
        cacheUrl: resolved.url,
        waitMs: waitBudgetFor(payload),
      }),
      resolved.url,
    );
  } catch {
    return json({
      error:
        "Something went wrong on our side reading that page. Try again in a moment.",
      errorCode: "internal",
    });
  }
}

/**
 * Turns a settled run into the response the caller sees.
 *
 * Shared by the start and the poll paths, so a result is shaped and cached
 * identically however the caller chose to wait for it.
 *
 * @param outcome - Whatever the run left the deferred layer as.
 * @param requestedUrl - The URL this request named, when it named one. Empty
 *   on the polling path, where the ticket carries it instead.
 */
async function settle(
  outcome: DeferredOutcome,
  requestedUrl: string,
): Promise<Response> {
  try {
    if (outcome.kind === "pending") return json(pendingBody(outcome));

    if (outcome.kind === "failed") {
      // Includes `budget-exhausted`, whose message is already written for a
      // reader. Pass the backend's own words through untouched.
      return json({
        ...(requestedUrl ? { requestedUrl } : {}),
        error: outcome.message,
        errorCode: outcome.code,
      });
    }

    const report = toReport(outcome.result.data);
    const startedFor = requestedUrl || outcome.context?.cacheUrl || "";

    // 6. A page with no images at all is a real answer, not a failure, so it
    //    is returned as a normal result and the UI says so in words.
    const result: AltTextResult = {
      ...report,
      url: report.url ?? startedFor,
      requestedUrl: report.requestedUrl ?? startedFor,
      checkedAt: new Date().toISOString(),
    };

    await cacheResult(result, outcome.context);

    return json({ ...result, cached: false, ageSeconds: 0 });
  } catch {
    return json({
      error:
        "Something went wrong on our side reading that page. Try again in a moment.",
      errorCode: "internal",
    });
  }
}

/**
 * Caches a finished result under the key the START call chose, and under the
 * post-redirect URL when that differs.
 *
 * @param result - The finished result.
 * @param context - The run's recovered context, or null when it is gone.
 */
async function cacheResult(
  result: AltTextResult,
  context: DeferredContext | null,
): Promise<void> {
  try {
    if (!context) return;

    await writeCache(context.cacheKey, RESULT_VERSION, result, CACHE_TTL.checker);

    if (!result.url) return;

    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: result.url,
      version: RESULT_VERSION,
    });
    if (finalKey !== context.cacheKey) {
      await writeCache(finalKey, RESULT_VERSION, result, CACHE_TTL.checker);
    }
  } catch {
    // A cache write is never worth failing a completed run over.
  }
}
