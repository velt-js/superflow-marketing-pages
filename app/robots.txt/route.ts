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
import { MCP_PATH } from "@/lib/tools/api-catalog";

/**
 * AI and search crawlers explicitly welcomed with full access.
 *
 * Grouped by operator so a missing one is obvious. Two classes matter and are
 * easy to conflate: TRAINING crawlers (GPTBot, ClaudeBot, Applebot-Extended,
 * Google-Extended, CCBot, meta-externalagent) decide whether Superflow is in
 * the model at all, and RETRIEVAL agents (ChatGPT-User, Claude-User,
 * Perplexity-User, DuckAssistBot) fetch a page live to answer a question a
 * user is asking right now. Blocking either one costs a different thing, so
 * both are welcomed.
 *
 * CCBot is Common Crawl: it feeds a large share of every open training corpus,
 * which makes it the single highest-leverage entry in this list.
 */
const WELCOME_BOTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Google
  "Googlebot",
  "Google-Extended",
  "GoogleOther",
  // Microsoft
  "Bingbot",
  "msnbot",
  // Apple
  "Applebot",
  "Applebot-Extended",
  // Meta
  "FacebookBot",
  "meta-externalagent",
  "meta-externalfetcher",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Common Crawl, which feeds most open training corpora.
  "CCBot",
  // Others that identify themselves and respect robots.txt.
  "Amazonbot",
  "DuckAssistBot",
  "DuckDuckBot",
  "MistralAI-User",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Ai2Bot",
  "Ai2Bot-Dolma",
  "YouBot",
  "Diffbot",
  "omgili",
  "Timpibot",
  "Bytespider",
  "PetalBot",
  "Yandex",
];

const HOST = SITE_URL.replace("https://", "");

const BODY = `# ${HOST} robots.txt
# AI crawlers are explicitly welcome. Superflow wants to be in answers.

User-agent: *
Allow: /
# The MCP server is a published, documented endpoint that anyone may call, so
# it is allowed back out of the /api/ disallow below. Longest match wins, so
# this line beats it.
Allow: ${MCP_PATH}
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
# Markdown copy of any page: append .md to its path (homepage: /index.md),
#   or request the page with the header \`Accept: text/markdown\`.
# Free tools index: ${SITE_URL}/tools.md
# MCP server (Streamable HTTP, no account, no API key): ${SITE_URL}${MCP_PATH}
# Agent card: ${SITE_URL}/.well-known/agent-card.json
# MCP server card: ${SITE_URL}/.well-known/mcp/server-card.json
# API catalog (RFC 9727): ${SITE_URL}/.well-known/api-catalog
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
