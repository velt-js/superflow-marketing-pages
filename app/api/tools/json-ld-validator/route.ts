// JSON-LD Validator API.
//
// POST /api/tools/json-ld-validator
//   { "url": "example.com", "refresh": false }
//
// Thin wrapper over the `json-ld-validator` engine in the Superflow backend.
// This route does not validate anything itself: it normalizes the URL for the
// cache key, spends a rate-limit slot, forwards the visitor's IP so the
// backend's own per-IP budget sees the caller rather than this server, and
// hands the terminal report back.
//
// Envelope: 200 on success, 4xx on every failure, always a JSON body carrying
// the backend's own `code` and `message`. The backend writes its failure copy
// for end users, so it is passed through rather than reworded. There is never
// a bare 500 and never a stack trace: this endpoint backs a no-login public
// tool, so an unhandled error is a stranger's first impression of Superflow.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// having to block /tools/, where the human-facing page lives.

import type { NextRequest } from "next/server";
import {
  CACHE_TTL,
  invalidateCache,
  readCache,
  toolCacheKey,
  writeCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";
import { normalizeUrl } from "@/lib/toolkit/url";
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
import type {
  JsonLdEnvelopeFinding,
  JsonLdValidatorReport,
} from "@/lib/tools/json-ld/types";

const TOOL_SLUG = "json-ld-validator";

/** The backend id this route runs. Not the same string as the slug by luck. */
const BACKEND_TOOL_ID = "json-ld-validator";

/** The backend renders the page in a browser, so this is a heavy run. */
const RATE_TIER = "heavy" as const;

/** Bump when the cached shape changes so stale entries are ignored. */
const RESULT_VERSION = 1;

/** Node runtime, to match the rest of the tool routes. */
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

/** What this route stores in the 24 hour cache and returns on a hit. */
type ValidatorPayload = {
  report: JsonLdValidatorReport;
  findings: JsonLdEnvelopeFinding[];
  totalFindings: number;
};

/** Failure codes that mean the caller sent something we cannot run. */
const BAD_REQUEST_CODES = new Set(["bad-request", "invalid-url"]);

/** Failure codes that mean "come back later" rather than "that is wrong". */
const RETRY_LATER_CODES = new Set(["rate-limited", "budget-exhausted"]);

/**
 * The HTTP status for a backend failure code.
 *
 * Kept to 4xx across the board. The UI reads `code`, not the status, and a
 * 5xx here would suggest this route broke when the truth is that the run did.
 *
 * @param code - The backend's own error code.
 */
function statusForCode(code: string): number {
  try {
    if (BAD_REQUEST_CODES.has(code)) return 400;
    if (RETRY_LATER_CODES.has(code)) return 429;
    return 422;
  } catch {
    return 422;
  }
}

/**
 * Builds a JSON response with no-store, since every body here is either
 * user-specific or already cached deliberately in KV.
 *
 * @param body - The payload.
 * @param status - HTTP status.
 */
function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (!isBackendConfigured()) {
      // There is no in-repo fallback engine for this tool, so saying so is
      // more useful than a generic failure that suggests the site is broken.
      return json(
        {
          ok: false,
          code: "not-configured",
          message:
            "The validator is not available right now. Try again in a moment.",
        },
        422,
      );
    }

    let payload: { url?: unknown; refresh?: unknown };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json(
        {
          ok: false,
          code: "bad-request",
          message: "Send a JSON body with a url.",
        },
        400,
      );
    }

    const ip = clientIpFrom(request.headers);

    // A body carrying a run id is the second half of a run this route already
    // started and budgeted. It is read, never re-dispatched, so polling costs
    // the caller nothing further.
    const runId = runIdFrom(payload);
    if (runId.length > 0) {
      return settle(
        await resumeRun({
          toolId: BACKEND_TOOL_ID,
          slug: TOOL_SLUG,
          runId,
          clientIp: ip,
          waitMs: waitBudgetFor(payload),
        }),
      );
    }

    const rawUrl = typeof payload?.url === "string" ? payload.url : "";
    if (rawUrl.trim().length === 0) {
      return json(
        {
          ok: false,
          code: "bad-request",
          message: "Enter a URL to check.",
        },
        400,
      );
    }

    // Normalize before the cache lookup so `example.com`, `https://example.com`,
    // and `https://example.com/` all share one entry. The backend re-validates
    // and runs its own SSRF guard, so this is only about key stability.
    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: cacheUrl,
      version: RESULT_VERSION,
    });

    const refresh = payload?.refresh === true;

    // ── Cache first, before the rate limiter ─────────────────────────────
    // A cached result costs us nothing, so serving one should not consume
    // anyone's hourly budget. It is also what makes a shared result link
    // load instantly for everyone who opens it.
    if (!refresh) {
      const hit = await readCache<ValidatorPayload>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({
          ok: true,
          ...hit.data,
          cached: true,
          ageSeconds: hit.ageSeconds,
        });
      }
    }

    // ── Rate limit the expensive path only ───────────────────────────────
    const decision = await applyRateLimit({
      tool: TOOL_SLUG,
      ip,
      tier: RATE_TIER,
    });

    if (!decision.allowed) {
      return json(
        {
          ok: false,
          code: "rate-limited",
          message: decision.message,
          retryAfterSeconds: decision.retryAfterSeconds,
        },
        429,
      );
    }

    if (refresh) {
      await invalidateCache(cacheKey);
    }

    return settle(
      await beginRun({
        toolId: BACKEND_TOOL_ID,
        slug: TOOL_SLUG,
        url: rawUrl,
        clientIp: ip,
        cacheKey,
        cacheUrl,
        waitMs: waitBudgetFor(payload),
      }),
    );
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message:
          "Something went wrong running the check. Try again in a moment.",
      },
      422,
    );
  }
}

/**
 * Turns a settled run into the response the caller sees.
 *
 * Shared by the start and the poll paths, so a report is shaped, validated and
 * cached identically however the caller chose to wait for it.
 *
 * @param outcome - Whatever the run left the deferred layer as.
 */
async function settle(outcome: DeferredOutcome): Promise<Response> {
  try {
    if (outcome.kind === "pending") return json(pendingBody(outcome));

    if (outcome.kind === "failed") {
      return json(
        { ok: false, code: outcome.code, message: outcome.message },
        statusForCode(outcome.code),
      );
    }

    const report = outcome.result.data as JsonLdValidatorReport | null;
    if (!report || typeof report !== "object") {
      return json(
        {
          ok: false,
          code: "internal",
          message:
            "The check finished without a report. Try again in a moment.",
        },
        422,
      );
    }

    // The engine reports a page it could not read with `error` set rather
    // than by failing the run. Surfacing that as a failure is the honest
    // reading: there is no report to render, only a reason.
    if (typeof report.error === "string" && report.error.length > 0) {
      return json({ ok: false, code: "unreachable", message: report.error }, 422);
    }

    const stored: ValidatorPayload = {
      report,
      findings: (outcome.result.findings ?? []) as JsonLdEnvelopeFinding[],
      totalFindings: outcome.result.totalFindings ?? 0,
    };

    await cacheResult(stored, outcome.context);

    return json({ ok: true, ...stored, cached: false, ageSeconds: 0 });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message:
          "Something went wrong running the check. Try again in a moment.",
      },
      422,
    );
  }
}

/**
 * Caches a finished result under the key the START call chose, and under the
 * post-redirect URL when that differs, so `example.com` and `www.example.com`
 * do not each pay for a run.
 *
 * @param stored - The finished result.
 * @param context - The run's recovered context, or null when it is gone.
 */
async function cacheResult(
  stored: ValidatorPayload,
  context: DeferredContext | null,
): Promise<void> {
  try {
    if (!context) return;

    await writeCache(context.cacheKey, RESULT_VERSION, stored, CACHE_TTL.checker);

    const finalUrl = stored.report.finalUrl;
    if (typeof finalUrl !== "string" || finalUrl.length === 0) return;

    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: finalUrl,
      version: RESULT_VERSION,
    });
    if (finalKey !== context.cacheKey) {
      await writeCache(finalKey, RESULT_VERSION, stored, CACHE_TTL.checker);
    }
  } catch {
    // A cache write is never worth failing a completed check over.
  }
}
