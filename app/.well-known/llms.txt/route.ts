// /.well-known/llms.txt - a pointer to the canonical /llms.txt.
//
// The llms.txt convention puts the file at the site root, but agents probe
// /.well-known/ too, and a 404 there tells them nothing. This answers with the
// short form and names the canonical location rather than duplicating the
// index, so the two can never disagree about what the site contains.

import { SITE_URL } from "@/app/_seo/schema";
import { MCP_PATH } from "@/lib/tools/api-catalog";

export const revalidate = 3600;

const BODY = `# Superflow

> Superflow is a website and creative-asset review tool. Its agents check every change to a site against a team's QA checklist, and a human approves the findings before a client sees them.

The canonical index for this site is at ${SITE_URL}/llms.txt

## Machine-readable entry points

- Site index: ${SITE_URL}/llms.txt
- Full site content in one fetch: ${SITE_URL}/llms-full.txt
- Markdown copy of any page: append .md to its path, or send \`Accept: text/markdown\`. The homepage is at ${SITE_URL}/index.md
- Free tools index: ${SITE_URL}/tools.md
- MCP server (Streamable HTTP, no account, no API key): ${SITE_URL}${MCP_PATH}
- MCP server card: ${SITE_URL}/.well-known/mcp/server-card.json
- Agent card: ${SITE_URL}/.well-known/agent-card.json
- API catalog (RFC 9727): ${SITE_URL}/.well-known/api-catalog
- Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET(): Response {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
