// Serves the Markdown copy of any marketing page.
//
// This route is never requested directly. proxy.ts rewrites `/<path>.md`, and
// requests that content-negotiate for Markdown, onto `/api/md/<path>`, which
// keeps the public URL the one an agent asked for while all the work happens
// in one handler. The /tools pages are the exception: they keep their own
// hand-authored copies at app/tools/[...slug]/route.ts, which the proxy leaves
// alone (see the comment there).
//
// Everything is derived from the same Sanity documents and data modules the
// HTML pages render, so the two can never drift.

import { NextResponse } from "next/server";

import { renderAgentDoc, absoluteUrl } from "@/lib/markdown/render";
import { resolveAgentDoc } from "@/lib/markdown/resolve";
import { SITE_URL } from "@/app/_seo/schema";
import { MCP_PATH } from "@/lib/tools/api-catalog";

// Matches the cadence of /llms.txt and /sitemap.xml: CMS-only edits reach the
// Markdown copies within the hour without waiting for a deploy.
export const revalidate = 3600;

/** Shared response headers for a successfully rendered document. */
function markdownHeaders(canonicalPath: string): HeadersInit {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    // The HTML page is canonical. Without this an agent that also crawls HTML
    // could treat the two as competing documents. Same header the tool copies
    // already send.
    Link: [
      `<${absoluteUrl(canonicalPath)}>; rel="canonical"`,
      `<${SITE_URL}/llms.txt>; rel="llms-txt"`,
      `<${SITE_URL}/llms-full.txt>; rel="llms-full-txt"`,
      `<${SITE_URL}/.well-known/agent-card.json>; rel="agent-card"`,
      `<${SITE_URL}${MCP_PATH}>; rel="mcp-server"`,
    ].join(", "),
    "X-Llms-Txt": "/llms.txt",
  };
}

/**
 * Renders one page's Markdown copy.
 *
 * @param _request - Unused; the document does not vary by request.
 * @param context - Route params. `params` is a promise in Next 15 and later.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<NextResponse> {
  let canonicalPath = "/";
  try {
    const { path } = await context.params;
    const segments = (path ?? []).filter(Boolean);
    canonicalPath = segments.length === 0 ? "/" : `/${segments.join("/")}`;

    const doc = await resolveAgentDoc(canonicalPath);
    if (!doc) {
      // A 404 here is the right answer: the page does not exist, and serving a
      // stub would tell an agent a URL is real when it is not.
      return new NextResponse(
        `# Not found\n\nNo page is published at ${absoluteUrl(canonicalPath)}.\n\nThe site index is at ${SITE_URL}/llms.txt\n`,
        {
          status: 404,
          headers: { "Content-Type": "text/markdown; charset=utf-8" },
        },
      );
    }

    return new NextResponse(renderAgentDoc(doc), {
      headers: markdownHeaders(doc.path),
    });
  } catch {
    return new NextResponse(
      `# Superflow\n\nThis document could not be rendered. The page itself is at ${absoluteUrl(canonicalPath)}\n`,
      {
        status: 200,
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      },
    );
  }
}
