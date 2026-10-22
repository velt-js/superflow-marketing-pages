// Website Status Checker API.
//
// POST /api/tools/website-status-checker
//   { "url": "example.com" }
//
// One live GET to the site, from our server, and a verdict: up when it
// answers with any status below 500, down on a 5xx, a timeout, or a refused
// connection. The engine is lib/toolkit/site-status.ts.
//
// NO CACHE, ON PURPOSE
//
// Every other checker caches its result for 24 hours because a site's
// favicon or schema rarely changes within a day. This one answers "is it up
// right now", and a cached "up" from this morning is exactly the wrong
// answer during an outage. The rate limit is what keeps a refresh loop from
// turning into a probe.
//
// Envelope: every response is HTTP 200 JSON. Failures carry `error` with
// ready-to-render plain words plus a machine `errorCode`; there is never a
// bare 500 and never a stack trace.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// blocking /tools/, where the human-facing page lives.

import type { NextRequest } from "next/server";
import { checkSiteStatus, type SiteStatusReport } from "@/lib/toolkit/site-status";
import { resolveUserUrl, URL_REJECTION_MESSAGES } from "@/lib/toolkit/url";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";

const TOOL_SLUG = "website-status-checker";

/** One fetch, no body read, no render: the generous per-IP budget applies. */
const RATE_TIER = "light" as const;

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
export const runtime = "nodejs";

/** Never cache the handler; the answer is only good for the moment it ran. */
export const dynamic = "force-dynamic";

/** What a successful run returns. */
export type SiteStatusPayload = SiteStatusReport & {
  /** The submitted URL after normalization, before any scheme fallback. */
  submittedUrl: string;
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

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let payload: { url?: unknown };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json({
        error: "Send a JSON body with a url.",
        errorCode: "bad-request",
      });
    }

    const rawUrl = typeof payload?.url === "string" ? payload.url : "";

    // 1. Normalize and SSRF-check what the user typed. Every rejection has
    //    friendly copy already written in the toolkit.
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) {
      return json({
        error: URL_REJECTION_MESSAGES[resolved.reason],
        errorCode: "invalid-url",
      });
    }

    // 2. Rate limit per IP. The limiter fails open by design, and its
    //    message says exactly when to come back.
    const ip = clientIpFrom(request.headers);
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

    // 3. One live check. The engine never throws; a dead site is a verdict.
    const report = await checkSiteStatus(resolved.url);
    const result: SiteStatusPayload = { submittedUrl: resolved.url, ...report };
    return json(result);
  } catch {
    return json({
      error:
        "Something went wrong on our side running the check. Try again in a moment.",
      errorCode: "internal",
    });
  }
}
