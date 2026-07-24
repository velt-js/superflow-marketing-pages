// Global 404 handler — Next.js renders this for any route that doesn't match
// a page (after the next.config.ts `rewrites` fallback also fails to resolve
// a static /pages-html file). Instead of showing a 404 body, we immediately
// redirect every unknown URL to the homepage.
//
// Note: `redirect()` works by throwing a NEXT_REDIRECT signal that Next.js
// catches to issue the HTTP redirect, so it must NOT be wrapped in try/catch
// (doing so would swallow the signal and break the redirect).

import { redirect } from "next/navigation";

/**
 * Redirects any unmatched/404 route to the homepage.
 *
 * @returns {never} Never returns — `redirect` throws the NEXT_REDIRECT signal.
 */
export default function NotFound(): never {
  redirect("/");
}
