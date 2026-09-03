// llms.txt Generator API.
//
// POST /api/tools/llms-txt-generator
//   { "url": "example.com", "refresh": false }
//
// Inventories a site from its robots.txt, sitemaps, and homepage links, then
// writes the two documents the llmstxt.org convention names: `llms.txt`, an
// index, and `llms-full.txt`, the same site with page content inlined. The
// engine is the same built-in agent the product runs, reached through the
// free-tools start/poll contract in lib/toolkit/superflow-api.ts.
//
// No model is involved at any point. Generation is a deterministic transform
// of the site's own inventory, so two runs over an unchanged site produce the
// same bytes.
//
// Envelope: every response is JSON with an `ok` discriminator, and every
// failure carries the backend's own `code` and `message` where it produced
// them. There is never a bare 500 and never a stack trace.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// blocking /tools/, where the human-facing page lives.

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
import {
  parseLlmsTxtReport,
  type LlmsTxtReport,
} from "@/lib/tools/free-tools/reports";

const TOOL_SLUG = "llms-txt-generator";

/** The backend tool id. */
const TOOL_ID = "llms-txt-generator";

/**
 * A site-level crawl: robots.txt, up to five sitemaps, then up to fifteen
 * page conversions. Heavy by any measure, and the backend's own free-tool
 * budget is 10 runs an hour per IP, so the tiers agree.
 */
const RATE_TIER = "heavy" as const;

/** Bump when the stored shape changes so old cache entries are ignored. */
const REPORT_VERSION = 1;

/** Node runtime: the toolkit's URL helpers use node built-ins. */
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
          toolId: TOOL_ID,
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
        { ok: false, code: "bad-request", message: "Enter a site URL." },
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
      version: REPORT_VERSION,
    });

    const refresh = payload?.refresh === true;

    // ── Cache first, before the rate limiter ─────────────────────────────
    // Serving a cached pair of documents costs us nothing, so it should not
    // consume anyone's hourly budget. A 24 hour entry also matches the
    // privacy line every tool page carries.
    if (!refresh) {
      const hit = await readCache<LlmsTxtReport>(cacheKey, REPORT_VERSION);
      if (hit) {
        return json({
          ok: true,
          report: hit.data,
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

    if (!isBackendConfigured()) {
      return json(
        {
          ok: false,
          code: "not-configured",
          message:
            "The generator is not available right now. Try again in a moment.",
        },
        503,
      );
    }

    // The client IP rides along so the backend's own per-IP budget sees the
    // visitor rather than this server, which would otherwise look like one
    // very busy caller and rate limit everybody at once.
    return settle(
      await beginRun({
        toolId: TOOL_ID,
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
          "Something went wrong generating those files. Try again in a moment.",
      },
      500,
    );
  }
}

/**
 * Turns a settled run into the response the caller sees.
 *
 * Shared by the start and the poll paths, so the files are shaped, validated
 * and cached identically however the caller chose to wait for them.
 *
 * @param outcome - Whatever the run left the deferred layer as.
 */
async function settle(outcome: DeferredOutcome): Promise<Response> {
  try {
    if (outcome.kind === "pending") return json(pendingBody(outcome));

    if (outcome.kind === "failed") {
      return json(
        { ok: false, code: outcome.code, message: outcome.message },
        outcome.code === "invalid-url" ? 400 : 422,
      );
    }

    const report = parseLlmsTxtReport(outcome.result.data);
    if (!report || report.llmsTxt.trim().length === 0) {
      // Terminal with no index file is not a result. Refuse rather than hand
      // somebody an empty file to publish at their site root.
      return json(
        {
          ok: false,
          code: "backend-error",
          message:
            "The run finished but produced no llms.txt. Try again in a moment.",
        },
        422,
      );
    }

    await cacheReport(report, outcome.context);

    return json({ ok: true, report, cached: false, ageSeconds: 0 });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message:
          "Something went wrong generating those files. Try again in a moment.",
      },
      500,
    );
  }
}

/**
 * Caches the finished files under the key the START call chose, and under the
 * post-redirect URL when that differs. Otherwise `example.com` and
 * `www.example.com` each pay for a full site crawl.
 *
 * @param report - The finished files.
 * @param context - The run's recovered context, or null when it is gone.
 */
async function cacheReport(
  report: LlmsTxtReport,
  context: DeferredContext | null,
): Promise<void> {
  try {
    if (!context) return;

    await writeCache(context.cacheKey, REPORT_VERSION, report, CACHE_TTL.checker);

    const finalUrl = report.url || context.cacheUrl;
    if (finalUrl.length === 0) return;

    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: finalUrl,
      version: REPORT_VERSION,
    });
    if (finalKey !== context.cacheKey) {
      await writeCache(finalKey, REPORT_VERSION, report, CACHE_TTL.checker);
    }
  } catch {
    // A cache write is never worth failing a completed run over.
  }
}
