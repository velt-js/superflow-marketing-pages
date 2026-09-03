// AI Visibility Checker API.
//
// POST /api/tools/ai-visibility
//   { "url": "example.com", "refresh": false }
//
// Returns the full report, or a typed failure the UI renders as friendly
// copy. Never returns a stack trace and never returns an empty 500 body:
// this endpoint backs a no-login public tool, so an unhandled error is a
// stranger's first impression of Superflow.
//
// The run itself — normalize, cache, rate limit, engine, cache again — lives
// in lib/tools/ai-visibility/api.ts, because the robots.txt AI Checker
// endpoint and the MCP server drive the same engine and must share its cache
// entries and its hourly budget rather than open a second door to it.
//
// Lives under /api/ so it inherits the existing robots.txt disallow (see
// app/robots.txt/route.ts) without having to block /tools/, which is where
// the human-facing pages live.

import type { NextRequest } from "next/server";
import { isPendingVisibility, runVisibility } from "@/lib/tools/ai-visibility/api";
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
      report: outcome.report,
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
