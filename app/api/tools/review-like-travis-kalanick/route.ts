// Travis Kalanick persona review.
//
// Server-backed: the lens lives in the product backend as a built-in agent, so
// the free tool and the in-product agent apply the same review. Everything
// except the two constants below is shared with the sibling personas — see
// lib/tools/persona-review/run.ts.

import type { NextRequest } from "next/server";
import { runPersonaReview } from "@/lib/tools/persona-review/run";

/**
 * A page load, a screenshot and an LLM call. The backend's own budget is 30
 * seconds; this leaves room for the cold start and the polling around it.
 */
export const maxDuration = 60;

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** Owns the cache entries and the hourly budget for this persona. */
const TOOL_SLUG = "review-like-travis-kalanick";

/** The free-tool id, which is also the backend agent id. */
const BACKEND_TOOL_ID = "review-like-travis-kalanick";

export async function POST(request: NextRequest): Promise<Response> {
  return runPersonaReview({
    request,
    slug: TOOL_SLUG,
    backendToolId: BACKEND_TOOL_ID,
    notConfiguredMessage:
      "The Travis Kalanick review is not available right now. Try again in a moment.",
  });
}
