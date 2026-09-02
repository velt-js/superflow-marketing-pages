// The shared runner behind every persona review endpoint and the Lookalike Test.
//
// The routes differ only by which lens they ask the backend for, so the
// normalize → cache → rate limit → run → cache sequence lives here once rather
// than being copied per persona. Adding a persona is a route file with two
// constants in it.
//
// THE ENDPOINT IS TWO REQUESTS, NOT ONE
//
// A review is a page load, a screenshot and an LLM call: measured against the
// production backend on 2026-09-02, the five personas took 118 to 153 seconds
// and the Lookalike Test 146. A Vercel route can run for 60. So the old shape —
// start the run and wait for it inside this request — could not return a review
// at all; it ran out the clock and answered "The check took too long" on every
// single call, for every persona, no matter how healthy the backend was.
//
// The wait now happens in the browser, which has no such ceiling:
//
//   POST { url }            → { ok, status: "pending", runId, pollIntervalSeconds }
//   POST { runId }          → { ok, status: "pending", ... } until it is done
//                           → { ok, status: "done", summary, findings, ... }
//
// A cached URL still answers with the review on the first POST, so the common
// case is unchanged.
//
// THREE THINGS THAT ARE NOT OBVIOUS
//
// 1. The cache is read BEFORE the limiter. A cached result costs us nothing, so
//    serving one should not spend anybody's hourly budget — which is also what
//    makes a shared result link load instantly for everyone who opens it.
// 2. Each persona gets its OWN cache key and its OWN budget. They are different
//    reviews of the same page, and a visitor who ran one should not find the
//    other already "cached" with the wrong lens, nor have it charged to them.
// 3. Only the START call spends the budget. Polls are reads of a run that was
//    already paid for, so a slow review does not cost a visitor ten of them.

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
import {
  isBackendConfigured,
  isPendingRun,
  pollToolRun,
  startToolRun,
} from "@/lib/toolkit/superflow-api";
import { recallRun, rememberRun } from "@/lib/toolkit/run-ticket";
import type { PersonaReviewPayload, PersonaFinding } from "./types";

/** One extra body field a tool forwards to the backend. */
export type ReviewExtraFieldSpec = {
  name: string;
  /** `list` splits a comma-separated string into the array the backend takes. */
  kind: "string" | "list";
};

/** Bump when the stored shape changes, so old entries are not read back. */
export const PERSONA_RESULT_VERSION = 1;

/** A full page load, a screenshot, and an LLM call. The expensive tier. */
const RATE_TIER = "heavy" as const;

/**
 * Ceiling on a caller-supplied run id. Firestore auto-ids are 20 characters;
 * this leaves room for a format change and still refuses a padded string.
 */
const MAX_RUN_ID_LENGTH = 128;

/** Failure codes that mean the caller sent something we cannot run. */
const BAD_REQUEST_CODES = new Set(["bad-request", "invalid-url"]);

/** Failure codes that mean "come back later" rather than "that is wrong". */
const RETRY_LATER_CODES = new Set(["rate-limited", "budget-exhausted"]);

/**
 * The HTTP status for a backend failure code.
 *
 * Kept to 4xx across the board. The UI reads `code`, not the status, and a 5xx
 * here would suggest this route broke when the truth is that the run did.
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
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

/**
 * Reads the findings array off the envelope, keeping only rows the UI can
 * render.
 *
 * Validated rather than cast: a finding with no title has no heading and no
 * stable React key, so it is dropped instead of rendered as a blank row.
 *
 * @param raw - The envelope's findings array, straight off the wire.
 */
function toPersonaFindings(raw: unknown[]): PersonaFinding[] {
  try {
    const findings: PersonaFinding[] = [];

    for (const entry of raw) {
      if (typeof entry !== "object" || entry === null) continue;
      const item = entry as Record<string, unknown>;

      const title = typeof item.title === "string" ? item.title.trim() : "";
      if (title.length === 0) continue;

      const severity =
        item.severity === "high" || item.severity === "medium" || item.severity === "low"
          ? item.severity
          : "medium";

      findings.push({
        title,
        description: typeof item.description === "string" ? item.description : "",
        severity,
        ...(typeof item.suggestion === "string" && item.suggestion.length > 0
          ? { suggestion: item.suggestion }
          : {}),
        ...(typeof item.targetText === "string" && item.targetText.length > 0
          ? { targetText: item.targetText }
          : {}),
      });
    }

    return findings;
  } catch {
    // A malformed findings array must not cost the reader the summary.
    return [];
  }
}

/**
 * Picks the declared extra fields off the request body.
 *
 * Values are forwarded as sent — the backend validates them, and re-checking
 * here would put the guard in two places that can disagree. Only the DECLARED
 * names are read, so an unrelated key in the body cannot reach the backend or
 * fragment the cache.
 *
 * @param payload - The parsed request body.
 * @param names - Field names this tool accepts.
 */
function collectExtras(
  payload: Record<string, unknown>,
  fields: ReviewExtraFieldSpec[],
): Record<string, unknown> {
  try {
    const extra: Record<string, unknown> = {};

    for (const field of fields) {
      const value = payload?.[field.name];
      if (value === undefined || value === null) continue;

      if (field.kind === "list") {
        // Accept both shapes: the browser form posts ONE comma-separated
        // string, while an API caller is more likely to post an array. The
        // backend takes an array and REFUSES a bare string, so without this
        // split every request that names a site fails validation.
        const list = Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : typeof value === "string"
            ? value.split(",").map((item) => item.trim())
            : [];
        const cleaned = list.filter((item) => item.length > 0);
        if (cleaned.length > 0) extra[field.name] = cleaned;
        continue;
      }

      if (typeof value === "string" && value.trim().length === 0) continue;
      extra[field.name] = value;
    }

    return extra;
  } catch {
    return {};
  }
}

/**
 * A stable, order-independent suffix for the cache key.
 *
 * Sorted so `{a, b}` and `{b, a}` are one entry rather than two, and JSON
 * rather than concatenated so a value containing a separator cannot collide
 * with a different pair of values — the forgeable-key bug class.
 *
 * @param extra - The collected extra fields.
 */
function extrasKeySuffix(extra: Record<string, unknown>): string {
  try {
    const keys = Object.keys(extra).sort();
    if (keys.length === 0) return "";
    return `::${JSON.stringify(keys.map((key) => [key, extra[key]]))}`;
  } catch {
    return "";
  }
}

/**
 * Runs one persona review for one URL, through the cache and the limiter.
 *
 * TWO REQUESTS, NOT ONE. A POST with no `runId` starts a run and answers
 * immediately with a handle; a POST carrying that handle reads the run once and
 * answers with either "still going" or the review. The browser drives the
 * cadence — see the module header for why the waiting cannot live here.
 *
 * @param request - The incoming request.
 * @param slug - The public tool slug; owns the cache entries and the budget.
 * @param backendToolId - The free-tool id to dispatch, which is also the agent id.
 * @param notConfiguredMessage - Copy shown when no backend is configured.
 */
export async function runPersonaReview({
  request,
  slug,
  backendToolId,
  notConfiguredMessage,
  extraFields = [],
}: {
  request: NextRequest;
  slug: string;
  backendToolId: string;
  notConfiguredMessage: string;
  /**
   * Body fields beyond `url` this tool forwards to the backend — the Lookalike
   * Test's `packId` and `compareUrls`. They also become part of the cache key:
   * comparing one page against two different benchmarks is two different
   * questions, and keying on the URL alone would answer the second with the
   * first one's report.
   */
  extraFields?: ReviewExtraFieldSpec[];
}): Promise<Response> {
  try {
    // There is no in-repo fallback engine for a persona review — the lens lives
    // in the backend agent — so saying so plainly beats a generic failure that
    // suggests the site is broken.
    if (!isBackendConfigured()) {
      return json({ ok: false, code: "not-configured", message: notConfiguredMessage }, 422);
    }

    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      return json({ ok: false, code: "bad-request", message: "Send a JSON body with a url." }, 400);
    }

    const ip = clientIpFrom(request.headers);

    // A body carrying a run id is the second half of a run this route already
    // started and budgeted. It is read, never re-dispatched, so it costs the
    // caller nothing further.
    const runId = typeof payload?.runId === "string" ? payload.runId.trim() : "";
    if (runId.length > 0) {
      return pollRun({ runId, slug, backendToolId, ip });
    }

    return startRun({ payload, slug, backendToolId, ip, extraFields });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message: "Something went wrong running the review. Try again in a moment.",
      },
      422,
    );
  }
}

/**
 * Serves a cached review, or dispatches a fresh run and hands back its handle.
 *
 * @param payload - The parsed request body.
 * @param slug - The public tool slug.
 * @param backendToolId - The free-tool id to dispatch.
 * @param ip - The caller's IP, for the budget and for the backend's own.
 * @param extraFields - Body fields beyond `url` this tool forwards.
 */
async function startRun({
  payload,
  slug,
  backendToolId,
  ip,
  extraFields,
}: {
  payload: Record<string, unknown>;
  slug: string;
  backendToolId: string;
  ip: string;
  extraFields: ReviewExtraFieldSpec[];
}): Promise<Response> {
  try {
    const rawUrl = typeof payload?.url === "string" ? payload.url : "";
    if (rawUrl.trim().length === 0) {
      return json({ ok: false, code: "bad-request", message: "Enter a URL to review." }, 400);
    }

    // Normalize before the cache lookup so `example.com`, `https://example.com`
    // and `https://example.com/` share one entry. The backend re-validates and
    // runs its own SSRF guard, so this is only about key stability.
    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();

    // The extra fields are part of the QUESTION, so they are part of the key.
    // Without this, "compare me against Linear" and "compare me against Stripe"
    // share an entry and the second visitor is handed the first one's report.
    const extra = collectExtras(payload, extraFields);
    const cacheKey = toolCacheKey({
      tool: slug,
      url: `${cacheUrl}${extrasKeySuffix(extra)}`,
      version: PERSONA_RESULT_VERSION,
    });

    const refresh = payload?.refresh === true;

    if (!refresh) {
      const hit = await readCache<PersonaReviewPayload>(cacheKey, PERSONA_RESULT_VERSION);
      if (hit) {
        return json({ ok: true, status: "done", ...hit.data, cached: true, ageSeconds: hit.ageSeconds });
      }
    }

    const decision = await applyRateLimit({ tool: slug, ip, tier: RATE_TIER });

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

    const started = await startToolRun({
      toolId: backendToolId,
      url: rawUrl,
      clientIp: ip,
      ...(Object.keys(extra).length > 0 ? { extra } : {}),
    });

    if (!started.ok) {
      return json(
        { ok: false, code: started.code, message: started.message },
        statusForCode(started.code),
      );
    }

    // Which question this run answers is decided HERE and nowhere else. The
    // poll below reads it back rather than trusting the caller to restate it —
    // see lib/toolkit/run-ticket.ts.
    await rememberRun({ runId: started.runId, slug, cacheKey });

    return json({
      ok: true,
      status: "pending",
      runId: started.runId,
      pollIntervalSeconds: started.pollIntervalSeconds,
    });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message: "Something went wrong running the review. Try again in a moment.",
      },
      422,
    );
  }
}

/**
 * Reads a run once and answers with the review, a failure, or "still going".
 *
 * @param runId - The handle from the start call.
 * @param slug - The public tool slug.
 * @param backendToolId - The free-tool id the run belongs to.
 * @param ip - The caller's IP, forwarded for the backend's poll budget.
 */
async function pollRun({
  runId,
  slug,
  backendToolId,
  ip,
}: {
  runId: string;
  slug: string;
  backendToolId: string;
  ip: string;
}): Promise<Response> {
  try {
    // A run id is a Firestore auto-id, so anything appreciably longer is not
    // one. Refusing it here keeps a padded string out of the KV lookup and
    // out of the backend call.
    if (runId.length > MAX_RUN_ID_LENGTH) {
      return json({ ok: false, code: "bad-request", message: "That run id is not valid." }, 400);
    }

    const polled = await pollToolRun({ toolId: backendToolId, runId, clientIp: ip });

    if (isPendingRun(polled)) {
      return json({
        ok: true,
        status: "pending",
        runId,
        pollIntervalSeconds: polled.pollIntervalSeconds,
      });
    }

    if (!polled.ok) {
      return json(
        { ok: false, code: polled.code, message: polled.message },
        statusForCode(polled.code),
      );
    }

    // A findings-shaped agent writes no report, so the backend wraps its prose
    // as `{ summary }`. Both shapes are handled: a persona that later grows a
    // real report keeps working here.
    const data = (polled.data ?? {}) as { summary?: unknown };
    const summary = typeof data.summary === "string" ? data.summary.trim() : "";
    const findings = toPersonaFindings((polled.findings ?? []) as unknown[]);

    // A review with neither a verdict nor a single finding is not a review. It
    // means the run completed but produced nothing renderable, and showing an
    // empty page would read as "your page is perfect" — the opposite of true.
    if (summary.length === 0 && findings.length === 0) {
      return json(
        {
          ok: false,
          code: "internal",
          message: "The review finished without a verdict. Try again in a moment.",
        },
        422,
      );
    }

    const stored: PersonaReviewPayload = {
      summary,
      findings,
      totalFindings: polled.totalFindings ?? findings.length,
    };

    // Cached under the key the START call chose. A run whose ticket has expired
    // (or whose KV is not configured) still returns its review; it just is not
    // stored, which costs the next visitor a re-run and nothing else.
    const ticket = await recallRun({ runId, slug });
    if (ticket) {
      await writeCache(ticket.cacheKey, PERSONA_RESULT_VERSION, stored, CACHE_TTL.checker);
    }

    return json({ ok: true, status: "done", ...stored, cached: false, ageSeconds: 0 });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message: "Something went wrong running the review. Try again in a moment.",
      },
      422,
    );
  }
}
