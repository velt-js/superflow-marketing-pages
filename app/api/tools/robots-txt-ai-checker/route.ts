// robots.txt AI Checker API.
//
// POST /api/tools/robots-txt-ai-checker
//   { "url": "example.com", "refresh": false }
//
// The access-scoped view of the visibility engine, published as its own
// endpoint because "which AI crawlers can read this page, and why not" is the
// question people actually arrive with, and because an agent should not have
// to know that the answer is a subset of a bigger report.
//
// It runs the same engine, through the same cache entries and the same hourly
// budget (see lib/tools/ai-visibility/api.ts), so calling this and then the
// full checker on one URL costs one run, not two.
//
// The response is NOT a trimmed visibility report. It carries an access score
// rather than the page's overall score — a caller reading `score` off a
// response that only ran the access checks would publish a number that means
// something else — and it lifts the two things worth having, the per-crawler
// verdicts and the live firewall test, to the top level.
//
// Envelope: JSON with an `ok` discriminator on every path. Never a bare 500
// and never a stack trace.

import type { NextRequest } from "next/server";
import {
  isPendingVisibility,
  runVisibility,
  toAccessReport,
} from "@/lib/tools/ai-visibility/api";
import { clientIpFrom } from "@/lib/toolkit/ratelimit";
import {
  pendingBody,
  runIdFrom,
  waitBudgetFor,
} from "@/lib/toolkit/deferred-run";

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
 * Builds a JSON response.
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
        { ok: false, code: "bad-request", message: "Send a JSON body with a url." },
        400,
      );
    }

    const outcome = await runVisibility({
      rawUrl: typeof payload?.url === "string" ? payload.url : "",
      refresh: payload?.refresh === true,
      ip: clientIpFrom(request.headers),
      // A body carrying a run id reads a run this route already started and
      // budgeted, rather than dispatching a second one.
      runId: runIdFrom(payload),
      waitMs: waitBudgetFor(payload),
    });

    if (isPendingVisibility(outcome)) return json(pendingBody(outcome));

    if (!outcome.ok) {
      return json(
        {
          ok: false,
          code: outcome.code,
          message: outcome.message,
          ...(outcome.retryAfterSeconds !== undefined
            ? { retryAfterSeconds: outcome.retryAfterSeconds }
            : {}),
        },
        outcome.status,
      );
    }

    return json({
      ok: true,
      report: toAccessReport(outcome.report),
      cached: outcome.cached,
      ageSeconds: outcome.ageSeconds,
    });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message: "Something went wrong running the check. Try again in a moment.",
      },
      500,
    );
  }
}
