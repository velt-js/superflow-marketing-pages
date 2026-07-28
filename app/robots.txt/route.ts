// robots.txt — served as a route handler instead of the app/robots.ts
// metadata convention because that serializer cannot emit comments,
// per-bot groups in this layout, or the Host line. Mirrors the
// velt.dev robots.txt pattern: a permissive wildcard group plus
// explicitly-welcomed AI/search crawlers, so Superflow shows up in
// AI answers as well as classic search.
//
// Note on semantics: a crawler that matches a named group follows ONLY
// that group, so the named AI bots below are not bound by the wildcard
// group's disallows. That is deliberate (matching velt.dev) — /studio
// is auth-gated, /api returns JSON, and /preview pages are noindex, so
// there is nothing sensitive for them to pick up.

import { SITE_URL } from "@/app/_seo/schema";

/** AI and search crawlers explicitly welcomed with full access. */
const WELCOME_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
];

const HOST = SITE_URL.replace("https://", "");

const BODY = `# ${HOST} robots.txt
# AI crawlers are explicitly welcome. Superflow wants to be in answers.

User-agent: *
Allow: /
Disallow: /studio
Disallow: /studio/
Disallow: /api/
Disallow: /preview/

${WELCOME_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join("\n\n")}

Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}

# LLM-friendly endpoints
# llms.txt: ${SITE_URL}/llms.txt
# Full content: ${SITE_URL}/llms-full.txt
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
