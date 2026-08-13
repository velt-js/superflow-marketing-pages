// GET /tools/mcp.md — the Markdown copy of the MCP and API reference.
//
// A literal route segment rather than an entry in the /tools/[...slug] catch-
// all, because that route generates its documents from the tool content
// registry and this document is not a tool: it is the reference for all of
// them. Next.js resolves a literal segment before a dynamic one, so this wins
// for /tools/mcp.md and the catch-all keeps serving /tools/<slug>.md.

import { mcpDocsToMarkdown } from "@/lib/tools/mcp/docs-markdown";
import { SITE_URL } from "@/app/_seo/schema";

/** Regenerated hourly; the content only changes when the catalogue does. */
export const revalidate = 3600;

export function GET(): Response {
  try {
    return new Response(mcpDocsToMarkdown(), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
        // The human page is canonical. Without this an agent that also crawls
        // HTML could treat the two as competing documents.
        Link: `<${SITE_URL}/tools/mcp>; rel="canonical"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
