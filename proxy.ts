// Serves the Markdown copy of a page when the request asks for one.
//
// Two ways to ask, both of which an agent will try:
//
//   1. Suffix the URL:  GET /ai-review-agents.md
//   2. Negotiate:       GET /ai-review-agents   Accept: text/markdown
//
// Next.js cannot route on a file extension, and the HTML page already owns the
// unsuffixed path, so neither can be handled by a route handler alone. Both are
// rewritten here onto /api/md/<path>, which keeps the public URL the one the
// agent asked for.
//
// This file is `proxy.ts`, not `middleware.ts`: Next 16 renamed the convention.
// It runs on the Node.js runtime by default and the `runtime` segment option is
// not available here.
//
// ORDERING NOTE: next.config.ts `redirects` run BEFORE this file, and its
// `rewrites` run after, so the usesuperflow.com -> usesuperflow.ai redirects
// have already happened by the time a request arrives, and the Mintlify and
// host proxies in `rewrites` have not. The Mintlify docs (which publish their
// own .md copies) and the two proxied hosts are therefore skipped explicitly
// below - without that, /docs/foo.md would be answered by this app instead of
// by Mintlify.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Suffix that marks a request for the Markdown copy. */
const MD_SUFFIX = ".md";

/**
 * Hostnames reverse-proxied to another provider in next.config.ts. Their paths
 * are not this app's paths, so nothing here applies to them.
 */
const PROXIED_HOSTS = new Set(["status.usesuperflow.ai", "trust.usesuperflow.ai"]);

/**
 * Path prefixes this file never touches.
 *
 * `/docs` and the Mintlify asset paths are reverse-proxied to Mintlify, which
 * publishes its own Markdown copies. `/tools` keeps the hand-authored copies
 * served by app/tools/[...slug]/route.ts, which are generated at build time
 * and served from the CDN - routing them through here would replace a static
 * file with a function call and lose the rewrite the tool pages were built for.
 */
const SKIP_PREFIXES = [
  "/api/",
  "/_next/",
  "/_mintlify/",
  "/mintlify-assets/",
  "/docs",
  "/studio",
  "/preview/",
  "/tools/",
];

/** Exact paths with their own handler already. */
const SKIP_EXACT = new Set(["/tools.md", "/llms.txt", "/llms-full.txt", "/robots.txt", "/sitemap.xml"]);

/** True when the path belongs to something else. */
function isSkipped(pathname: string): boolean {
  if (SKIP_EXACT.has(pathname)) return true;
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix),
  );
}

/**
 * True when the client would rather have Markdown than HTML.
 *
 * Compares q-values rather than looking for the substring, so a browser
 * (`text/html,...,*​/*;q=0.8`) never negotiates into Markdown while an agent
 * sending `text/markdown, text/html;q=0.8` does.
 */
function prefersMarkdown(accept: string | null): boolean {
  try {
    if (!accept) return false;

    let markdown = -1;
    let html = -1;

    for (const entry of accept.split(",")) {
      const parts = entry.trim().split(";");
      const type = (parts[0] ?? "").trim().toLowerCase();
      if (!type) continue;

      let q = 1;
      for (const param of parts.slice(1)) {
        const match = /^\s*q=([0-9]*\.?[0-9]+)\s*$/i.exec(param);
        if (match) {
          const parsed = Number(match[1]);
          q = Number.isFinite(parsed) ? parsed : 0;
        }
      }

      if (type === "text/markdown" || type === "text/x-markdown") {
        markdown = Math.max(markdown, q);
      } else if (type === "text/html" || type === "application/xhtml+xml") {
        html = Math.max(html, q);
      }
    }

    return markdown > 0 && markdown >= html;
  } catch {
    return false;
  }
}

/**
 * True when the path looks like a page rather than a file.
 *
 * Content negotiation must not fire on an image or a JSON endpoint just
 * because the client sent a broad Accept header.
 */
function looksLikeAPage(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return !last.includes(".");
}

/**
 * Rewrites Markdown requests onto the generator.
 *
 * @param request - The incoming request.
 */
export function proxy(request: NextRequest): NextResponse {
  try {
    const { pathname } = request.nextUrl;

    if (PROXIED_HOSTS.has(request.headers.get("host") ?? "")) {
      return NextResponse.next();
    }
    if (isSkipped(pathname)) return NextResponse.next();

    // 1. Explicit .md suffix.
    if (pathname.endsWith(MD_SUFFIX)) {
      const base = pathname.slice(0, -MD_SUFFIX.length);
      // The homepage has no slug of its own, so it is published at /index.md.
      const target = base === "/index" || base === "" ? "" : base;
      const url = request.nextUrl.clone();
      url.pathname = `/api/md${target}`;
      return NextResponse.rewrite(url);
    }

    // 2. Content negotiation on the HTML page's own URL.
    if (looksLikeAPage(pathname) && prefersMarkdown(request.headers.get("accept"))) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/md${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  } catch {
    // Never let this file take the site down: an unexpected request shape
    // should render the normal page, not a 500.
    return NextResponse.next();
  }
}

export const config = {
  // Everything except static assets and the image optimizer. The function
  // itself does the finer filtering, so this only has to keep the proxy off
  // paths that can never be a page.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
