// Social Preview Checker API.
//
// POST /api/tools/social-preview
//   { "url": "example.com", "refresh": false }
//
// The engine is not in this repo. It lives in the Superflow product backend
// as an agent service, so the free tool and the in-product agent read the
// same tags by the same rules and cannot drift apart. This route is the seam:
// normalize, cache, rate limit, hand off to the deferred runner, and shape
// the answer.
//
// Envelope: every response is HTTP 200 JSON carrying `ok`. Failures carry the
// backend's own `code` and `message`, which are written for end users, and
// there is never a bare 500 and never a stack trace. This endpoint backs a
// no-login public tool, so an unhandled error is a stranger's first
// impression of Superflow.
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
  normalizeReport,
  REPORT_VERSION,
  type SocialPreviewReport,
} from "@/lib/tools/social-preview/report";

const TOOL_SLUG = "social-preview-checker";

/** The tool id the backend registers this engine under. */
const BACKEND_TOOL_ID = "social-preview";

/**
 * The run itself is one fetch and a parse, which would normally be the light
 * tier. It sits on the heavy tier anyway because the backend applies its own
 * free-tool budget of 10 runs per hour per IP, and that is the number that
 * actually binds. Matching it here means a visitor meets one limit with one
 * explanation, instead of passing our gate and then being refused by a
 * service they have never heard of.
 */
const RATE_TIER = "heavy" as const;

/** Node runtime, for parity with the other tool routes. */
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
 * Builds a JSON response. Always 200: the UI reads `ok`, not the status, and
 * no-store keeps intermediaries out of a body that is either user-specific or
 * already cached deliberately in KV.
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

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let payload: { url?: unknown; refresh?: unknown };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json({
        ok: false,
        code: "bad-request",
        message: "Send a JSON body with a url.",
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
      return json({
        ok: false,
        code: "bad-request",
        message: "Enter a URL to check.",
      });
    }

    if (!isBackendConfigured()) {
      // There is no in-repo fallback engine for this tool, so say so plainly
      // rather than answering with an empty report.
      return json({
        ok: false,
        code: "not-configured",
        message:
          "The preview checker is not available right now. Try again in a few minutes.",
      });
    }

    const refresh = payload?.refresh === true;

    // Normalize before the cache lookup so `example.com`, `https://example.com`,
    // and `https://example.com/` all share one entry. The backend re-validates
    // the URL, so this is only about key stability.
    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: cacheUrl,
      version: REPORT_VERSION,
    });

    // ── Cache first, before the rate limiter ─────────────────────────────
    // A cached result costs us nothing, so serving one should not consume
    // anyone's hourly budget. This is also what makes a shared result link
    // load instantly for everyone who opens it.
    if (!refresh) {
      const hit = await readCache<SocialPreviewReport>(cacheKey, REPORT_VERSION);
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
      return json({
        ok: false,
        code: "rate-limited",
        message: decision.message,
        retryAfterSeconds: decision.retryAfterSeconds,
      });
    }

    if (refresh) {
      await invalidateCache(cacheKey);
    }

    // The client IP is forwarded so the backend's own per-IP budget sees the
    // visitor rather than this server, which would otherwise share one budget
    // across everybody.
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
    return json({
      ok: false,
      code: "internal",
      message: "Something went wrong running the check. Try again in a moment.",
    });
  }
}

/**
 * Turns a settled run into the response the caller sees.
 *
 * Shared by the start and the poll paths, so a report is shaped and cached
 * identically however the caller chose to wait for it.
 *
 * @param outcome - Whatever the run left the deferred layer as.
 */
async function settle(outcome: DeferredOutcome): Promise<Response> {
  try {
    if (outcome.kind === "pending") return json(pendingBody(outcome));

    if (outcome.kind === "failed") {
      // The backend's refusals (invalid-url, rate-limited, unreachable) are
      // already written for end users. Pass its own words through.
      return json({ ok: false, code: outcome.code, message: outcome.message });
    }

    // Findings ride the run envelope beside `data`, so they are merged in
    // here and the cache holds one object.
    const report = normalizeReport(outcome.result.data, outcome.result.findings);
    if (!report) {
      return json({
        ok: false,
        code: "empty-report",
        message:
          "The check finished but returned nothing we could render. Try again in a moment.",
      });
    }

    await cacheReport(report, outcome.context);

    return json({ ok: true, report, cached: false, ageSeconds: 0 });
  } catch {
    return json({
      ok: false,
      code: "internal",
      message: "Something went wrong running the check. Try again in a moment.",
    });
  }
}

/**
 * Caches a finished report under the key the START call chose, and under the
 * post-redirect URL when that differs. Otherwise checking `example.com` and
 * `www.example.com` each pay for a run.
 *
 * @param report - The finished report.
 * @param context - The run's recovered context, or null when it is gone.
 */
async function cacheReport(
  report: SocialPreviewReport,
  context: DeferredContext | null,
): Promise<void> {
  try {
    if (!context) return;

    await writeCache(context.cacheKey, REPORT_VERSION, report, CACHE_TTL.checker);

    if (report.url.length === 0) return;

    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: report.url,
      version: REPORT_VERSION,
    });
    if (finalKey !== context.cacheKey) {
      await writeCache(finalKey, REPORT_VERSION, report, CACHE_TTL.checker);
    }
  } catch {
    // A cache write is never worth failing a completed check over.
  }
}
