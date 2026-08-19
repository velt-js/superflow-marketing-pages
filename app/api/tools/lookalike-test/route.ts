// Lookalike Test.
//
// Server-backed: the benchmark and the comparison both live in the product
// backend as a built-in agent, so the free tool and the in-product agent run
// the same comparison.
//
// This route takes MORE than a URL — a benchmark pack, or up to three sites to
// compare against. Both are forwarded raw: the backend validates every
// comparison URL through the same SSRF guards as the subject URL and charges
// the per-domain budget to each, and duplicating that here would put the guard
// in two places that can disagree.

import type { NextRequest } from "next/server";
import { runPersonaReview } from "@/lib/tools/persona-review/run";

/**
 * A page load, a screenshot, up to three reference fetches, and an LLM call.
 * The backend's own budget bounds the run; this leaves room for the cold start
 * and the polling around it.
 */
export const maxDuration = 60;

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** Owns the cache entries and the hourly budget. */
const TOOL_SLUG = "lookalike-test";

/** The free-tool id, which is also the backend agent id. */
const BACKEND_TOOL_ID = "lookalike-test";

export async function POST(request: NextRequest): Promise<Response> {
  return runPersonaReview({
    request,
    slug: TOOL_SLUG,
    backendToolId: BACKEND_TOOL_ID,
    notConfiguredMessage:
      "The Lookalike Test is not available right now. Try again in a moment.",
    // Both optional. With neither, the backend falls back to its default pack
    // rather than refusing, so a bare `{ url }` is a valid request.
    extraFields: [
      { name: "packId", kind: "string" },
      // The form posts one comma-separated string; the backend takes an array
      // and refuses a bare string, so this split is what makes it work at all.
      { name: "compareUrls", kind: "list" },
    ],
  });
}
