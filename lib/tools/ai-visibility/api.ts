// The shared runner behind every surface of the AI visibility engine.
//
// Three callers now want the same run: the AI Visibility Checker endpoint,
// the robots.txt AI Checker endpoint (the access-scoped view of it), and the
// MCP server, which calls both. Rather than have each repeat the normalize →
// cache → rate limit → run → cache sequence, they call this.
//
// TWO RULES THAT ARE NOT OBVIOUS
//
// 1. The cache key and the rate-limit bucket are the parent tool's for every
//    caller, on purpose. It is one run of one engine over one URL, so the
//    robots.txt view must not pay for a second run of work already done, and
//    must not hand somebody a second hourly budget by asking the same engine
//    the same question through a different door.
// 2. The cache is read BEFORE the limiter. A cached result costs us nothing,
//    so serving one should not spend anybody's budget — which is also what
//    makes a shared report link load instantly for everyone who opens it.

import {
  runVisibilityCheck,
  REPORT_VERSION,
} from "@/lib/tools/ai-visibility/engine";
import {
  CACHE_TTL,
  invalidateCache,
  readCache,
  toolCacheKey,
  writeCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit } from "@/lib/toolkit/ratelimit";
import { normalizeUrl } from "@/lib/toolkit/url";
import { isBackendConfigured } from "@/lib/toolkit/superflow-api";
import {
  beginRun,
  resumeRun,
  type DeferredContext,
  type DeferredOutcome,
} from "@/lib/toolkit/deferred-run";
import type {
  CategoryId,
  DegradedNotice,
  Finding,
  SerializableBotVerdict,
  VisibilityReport,
} from "@/lib/tools/ai-visibility/types";

/** The engine's own slug. Owns the cache entries and the hourly budget. */
export const VISIBILITY_TOOL_SLUG = "ai-visibility-checker";

/** The backend agent id. Not the marketing slug, which carries "-checker". */
const BACKEND_TOOL_ID = "ai-visibility";

/** Headless render, several fetches, a crawl of robots.txt and sitemaps. */
const RATE_TIER = "heavy" as const;

/** What a caller returns to the client: a status and a JSON body. */
export type VisibilityApiResponse = {
  status: number;
  body: Record<string, unknown>;
};

/** A successful run, before any caller has shaped it for its own envelope. */
export type VisibilityRunOutcome =
  | { ok: true; report: VisibilityReport; cached: boolean; ageSeconds: number }
  | {
      /**
       * Dispatched and still executing. The caller answers with the handle and
       * the client comes back for it — see lib/toolkit/deferred-run.ts for why
       * the waiting cannot happen inside one request.
       */
      ok: true;
      pending: true;
      runId: string;
      pollIntervalSeconds: number;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
      retryAfterSeconds?: number;
    };

/** True when an outcome is a handle rather than a report. */
export function isPendingVisibility(
  outcome: VisibilityRunOutcome,
): outcome is Extract<VisibilityRunOutcome, { pending: true }> {
  return outcome.ok === true && "pending" in outcome && outcome.pending === true;
}

/**
 * Runs the visibility engine for one URL, through the cache and the limiter.
 *
 * Never throws. Every failure comes back as `{ ok: false }` carrying copy
 * that is already written for an end user, because both callers put it in
 * front of strangers with no account and no support channel.
 *
 * @param rawUrl - The URL exactly as the caller sent it.
 * @param refresh - Skip the cache and spend a slot on a fresh run.
 * @param ip - The caller's IP, for the per-IP budget and to forward to the
 *   backend so its own budget sees the visitor rather than this server.
 */
export async function runVisibility({
  rawUrl,
  refresh = false,
  ip,
  waitMs,
  runId = "",
}: {
  rawUrl: string;
  refresh?: boolean;
  ip?: string;
  /**
   * How long to hold this request open waiting for the run. Zero answers with
   * a handle as soon as the run is dispatched, which is what the browser wants.
   */
  waitMs: number;
  /** An already-dispatched run to read instead of starting a new one. */
  runId?: string;
}): Promise<VisibilityRunOutcome> {
  try {
    // A run id is the second half of a run already started and budgeted here.
    // It is read, never re-dispatched, so it costs the caller nothing further.
    if (runId.length > 0) {
      return settleVisibility(
        await resumeRun({
          toolId: BACKEND_TOOL_ID,
          slug: VISIBILITY_TOOL_SLUG,
          runId,
          clientIp: ip,
          waitMs,
        }),
      );
    }

    if (rawUrl.trim().length === 0) {
      return {
        ok: false,
        status: 400,
        code: "bad-request",
        message: "Enter a URL to check.",
      };
    }

    // Normalize before the cache lookup so `example.com`, `https://example.com`,
    // and `https://example.com/` all share one entry. The engine re-validates
    // and runs the SSRF guard, so this is only about key stability.
    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();
    const cacheKey = toolCacheKey({
      tool: VISIBILITY_TOOL_SLUG,
      url: cacheUrl,
      version: REPORT_VERSION,
    });

    if (!refresh) {
      const hit = await readCache<VisibilityReport>(cacheKey, REPORT_VERSION);
      if (hit) {
        return {
          ok: true,
          report: hit.data,
          cached: true,
          ageSeconds: hit.ageSeconds,
        };
      }
    }

    const decision = await applyRateLimit({
      tool: VISIBILITY_TOOL_SLUG,
      // Matches what `clientIpFrom` returns when it cannot identify a caller,
      // so an unidentifiable caller shares one bucket rather than escaping the
      // limit entirely.
      ip: ip ?? "unknown",
      tier: RATE_TIER,
    });

    if (!decision.allowed) {
      return {
        ok: false,
        status: 429,
        code: "rate-limited",
        message: decision.message,
        retryAfterSeconds: decision.retryAfterSeconds,
      };
    }

    if (refresh) {
      await invalidateCache(cacheKey);
    }

    // Prefer the shared engine in the product backend, so the free tool and
    // the in-product `ai-visibility` agent can never drift apart. The in-repo
    // engine is the fallback for local dev and for any deploy that predates
    // the backend release; it runs in-process, so it has no handle to hand
    // back and answers on the spot.
    if (!isBackendConfigured()) {
      const local = await runVisibilityCheck(rawUrl);
      if (!local.ok) {
        return {
          ok: false,
          status: local.code === "invalid-url" ? 400 : 422,
          code: local.code,
          message: local.message,
        };
      }
      await cacheReport(local.report, { cacheKey, cacheUrl });
      return { ok: true, report: local.report, cached: false, ageSeconds: 0 };
    }

    return settleVisibility(
      await beginRun({
        toolId: BACKEND_TOOL_ID,
        slug: VISIBILITY_TOOL_SLUG,
        url: rawUrl,
        clientIp: ip,
        cacheKey,
        cacheUrl,
        waitMs,
      }),
    );
  } catch {
    return {
      ok: false,
      status: 500,
      code: "internal",
      message: "Something went wrong running the check. Try again in a moment.",
    };
  }
}

/**
 * Turns a settled run into the outcome both callers already understand.
 *
 * @param outcome - Whatever the run left the deferred layer as.
 */
async function settleVisibility(
  outcome: DeferredOutcome,
): Promise<VisibilityRunOutcome> {
  try {
    if (outcome.kind === "pending") {
      return {
        ok: true,
        pending: true,
        runId: outcome.runId,
        pollIntervalSeconds: outcome.pollIntervalSeconds,
      };
    }

    if (outcome.kind === "failed") {
      return {
        ok: false,
        status: outcome.code === "invalid-url" ? 400 : 422,
        code: outcome.code,
        message: outcome.message,
      };
    }

    const report = outcome.result.report;
    if (!report) {
      return {
        ok: false,
        status: 422,
        code: "backend-error",
        message: "The check finished without a report. Try again in a moment.",
      };
    }

    await cacheReport(report, outcome.context);

    return { ok: true, report, cached: false, ageSeconds: 0 };
  } catch {
    return {
      ok: false,
      status: 500,
      code: "internal",
      message: "Something went wrong running the check. Try again in a moment.",
    };
  }
}

/**
 * Caches a finished report under the key the START call chose, and under the
 * post-redirect URL when that differs. Otherwise checking `example.com` and
 * `www.example.com` runs the whole suite twice.
 *
 * A run whose ticket has expired still returns its report; it just is not
 * stored, which costs the next visitor a re-run and nothing else.
 *
 * @param report - The finished report.
 * @param context - The run's recovered context, or null when it is gone.
 */
async function cacheReport(
  report: VisibilityReport,
  context: DeferredContext | null,
): Promise<void> {
  try {
    if (!context) return;

    await writeCache(context.cacheKey, REPORT_VERSION, report, CACHE_TTL.checker);

    const finalUrl = report.finalUrl || context.cacheUrl;
    if (!finalUrl) return;

    const finalKey = toolCacheKey({
      tool: VISIBILITY_TOOL_SLUG,
      url: finalUrl,
      version: REPORT_VERSION,
    });
    if (finalKey !== context.cacheKey) {
      await writeCache(finalKey, REPORT_VERSION, report, CACHE_TTL.checker);
    }
  } catch {
    // A cache write is never worth failing a completed check over.
  }
}

/**
 * The access-scoped report the robots.txt AI Checker endpoint returns.
 *
 * A trimmed `VisibilityReport` would have been simpler and dishonest: it
 * carries a `score` and a `grade` for the whole page, and a caller reading
 * `score` off a response that only ran the access checks would report a
 * number that means something else. So this is its own shape, and the two
 * things a caller actually wants from a robots.txt check — the per-crawler
 * verdicts and the firewall result — are lifted to the top level rather than
 * left buried in a finding's `detail`.
 */
export type AccessReport = {
  requestedUrl: string;
  finalUrl: string;
  hostname: string;
  httpStatus: number;
  /** Points earned across the access checks only. */
  accessScore: {
    points: number;
    maxPoints: number;
    passCount: number;
    warnCount: number;
    failCount: number;
  } | null;
  /** Every AI and search crawler tested, with the rule that decided it. */
  crawlers: SerializableBotVerdict[];
  /**
   * The live firewall test: the page requested once as a browser and once as
   * an AI crawler. Null when the check could not run.
   */
  firewall: {
    browserStatus: number | null;
    botStatus: number | null;
    blocked: boolean;
  } | null;
  /** The access findings, each with why it matters and how to fix it. */
  findings: Finding[];
  /** Set when some checks could not run. Not an error. */
  degraded: DegradedNotice[];
  /** Epoch milliseconds. */
  checkedAt: number;
};

/** The scoring group the robots.txt view reports on. */
const ACCESS: CategoryId = "access";

/**
 * Narrows a full report to the crawler-access view.
 *
 * @param report - The full report from `runVisibility`.
 */
export function toAccessReport(report: VisibilityReport): AccessReport {
  try {
    const findings = (report.findings ?? []).filter(
      (finding) => finding.category === ACCESS,
    );
    const category = (report.categories ?? []).find(
      (entry) => entry.id === ACCESS,
    );

    const botTable = findings.find(
      (finding) => finding.detail?.kind === "bot-table",
    )?.detail;
    const firewall = findings.find(
      (finding) => finding.detail?.kind === "firewall",
    )?.detail;

    return {
      requestedUrl: report.requestedUrl,
      finalUrl: report.finalUrl,
      hostname: report.hostname,
      httpStatus: report.httpStatus,
      accessScore: category
        ? {
            points: category.points,
            maxPoints: category.maxPoints,
            passCount: category.passCount,
            warnCount: category.warnCount,
            failCount: category.failCount,
          }
        : null,
      crawlers: botTable?.kind === "bot-table" ? botTable.verdicts : [],
      firewall:
        firewall?.kind === "firewall"
          ? {
              browserStatus: firewall.browserStatus,
              botStatus: firewall.botStatus,
              blocked: firewall.blocked,
            }
          : null,
      findings,
      degraded: report.degraded ?? [],
      checkedAt: report.checkedAt,
    };
  } catch {
    // Better a thin report than a 500 on a public endpoint. The caller still
    // gets the URLs it asked about and an empty crawler table it can see is
    // empty, rather than a stack trace.
    return {
      requestedUrl: report.requestedUrl,
      finalUrl: report.finalUrl,
      hostname: report.hostname,
      httpStatus: report.httpStatus,
      accessScore: null,
      crawlers: [],
      firewall: null,
      findings: [],
      degraded: [],
      checkedAt: report.checkedAt,
    };
  }
}
