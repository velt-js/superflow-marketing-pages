// Aaron Epstein persona review.
//
// Server-backed: the lens lives in the product backend as a built-in agent, so
// the free tool and the in-product agent apply the same review. Everything
// except the two constants below is shared with the sibling personas — see
// lib/tools/persona-review/run.ts.

import type { NextRequest } from "next/server";
import { runPersonaReview } from "@/lib/tools/persona-review/run";

/**
 * This route no longer waits for the run: one request dispatches it, and each
 * later request reads it once. Both return in seconds. The generous ceiling is
 * headroom for a cold start on the backend callable, not a budget for the
 * review itself, which takes minutes and is waited on by the browser.
 */
export const maxDuration = 60;

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** Owns the cache entries and the hourly budget for this persona. */
const TOOL_SLUG = "review-like-aaron-epstein";

/** The free-tool id, which is also the backend agent id. */
const BACKEND_TOOL_ID = "review-like-aaron-epstein";

export async function POST(request: NextRequest): Promise<Response> {
  return runPersonaReview({
    request,
    slug: TOOL_SLUG,
    backendToolId: BACKEND_TOOL_ID,
    notConfiguredMessage:
      "The Aaron Epstein review is not available right now. Try again in a moment.",
  });
}
