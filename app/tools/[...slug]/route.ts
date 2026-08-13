// Markdown copies of the tool pages, served at /tools/<slug>.md.
//
// WHY A CATCH-ALL, AND WHY IT DOES NOT SWALLOW THE 404s
//
// The `.md` suffix is the convention agents look for, and Next.js has no way
// to route on a file extension, so this has to be a catch-all under /tools.
// Left as a normal dynamic route it would also catch every unknown /tools/*
// path and answer them itself, replacing the styled 404 with whatever this
// handler returned.
//
// `generateStaticParams` plus `dynamicParams = false` fixes that: the only
// paths this route serves are the ones listed below, every other path under
// /tools falls through to the app's own not-found page, and the documents are
// generated at build time and served from the CDN rather than invoking a
// function per request.
//
// Static tool pages still win over this route: Next.js resolves a literal
// segment before a dynamic one, so /tools/utm-builder reaches its page and
// only /tools/utm-builder.md reaches here.

import { TOOL_CONTENT, findToolContent } from "@/lib/tools/content";
import { toolToMarkdown } from "@/lib/tools/content/to-markdown";

/** Anything not produced by generateStaticParams gets the normal 404. */
export const dynamicParams = false;

/** Suffix that marks a request for the Markdown copy. */
const MD_SUFFIX = ".md";

/**
 * The Markdown paths this route serves, one per tool that actually works.
 */
export function generateStaticParams(): Array<{ slug: string[] }> {
  try {
    return TOOL_CONTENT.map((content) => ({ slug: [`${content.slug}${MD_SUFFIX}`] }));
  } catch {
    return [];
  }
}

/**
 * Serves one tool's Markdown copy.
 *
 * @param _request - Unused; the document does not vary by request.
 * @param context - Route params. `params` is a promise in Next 15 and later.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  try {
    const { slug } = await context.params;
    const segments = slug ?? [];

    // A nested path can only arrive if generateStaticParams grows one, but
    // answering it with the wrong document would be worse than refusing.
    if (segments.length !== 1) {
      return new Response("Not found", { status: 404 });
    }

    const requested = segments[0];
    if (!requested.endsWith(MD_SUFFIX)) {
      return new Response("Not found", { status: 404 });
    }

    const content = findToolContent(requested.slice(0, -MD_SUFFIX.length));
    if (!content) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(toolToMarkdown(content), {
      headers: {
        // text/markdown so a client that content-negotiates gets the right
        // type; charset because the copy contains typographic punctuation.
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
        // The human page is canonical. Without this an agent that also
        // crawls HTML could treat the two as competing documents.
        Link: `<${new URL(requested.slice(0, -MD_SUFFIX.length), "https://usesuperflow.ai/tools/").toString()}>; rel="canonical"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
