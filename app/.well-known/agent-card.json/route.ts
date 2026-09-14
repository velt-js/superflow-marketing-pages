// /.well-known/agent-card.json - an A2A-style agent card.
//
// WHY THIS EXISTS
//
// An agent that lands on usesuperflow.ai has no way to discover that the site
// publishes callable tools, a Markdown copy of every page, and an MCP server,
// unless something at a well-known location tells it. This is that something:
// one fetch at a path agents already probe, describing what is here and where
// the machine-readable entry points are.
//
// The skills listed are the real ones: each maps to a document that exists.
// A card advertising a capability the site does not have is worse than no card.

import { NextResponse } from "next/server";

import { SITE_URL } from "@/app/_seo/schema";
import { MCP_PATH, availableToolApis } from "@/lib/tools/api-catalog";

export const revalidate = 3600;

export function GET(): NextResponse {
  try {
    const toolCount = availableToolApis().length;

    const card = {
      name: "Superflow",
      description:
        "Superflow is a website and creative-asset review tool. Its agents check every change to a site against a team's QA checklist, and a human approves the findings before a client sees them. The site also publishes a set of free, callable web-quality tools that need no account.",
      url: SITE_URL,
      version: "1.0.0",
      protocolVersion: "0.3",
      preferredTransport: "HTTP+JSON",
      supportedInterfaces: [
        { url: SITE_URL, protocolBinding: "HTTP+JSON", protocolVersion: "0.3" },
      ],
      provider: { organization: "Superflow", url: SITE_URL },
      documentationUrl: `${SITE_URL}/docs`,
      capabilities: { streaming: false, pushNotifications: false },
      defaultInputModes: ["text/plain"],
      defaultOutputModes: ["text/plain", "text/markdown"],
      skills: [
        {
          id: "superflow-free-tools",
          name: "Superflow free tools",
          description: `${toolCount} callable tools for checking whether AI systems can read a site, validating structured data, capturing screenshots, and everyday web work. No account and no API key. Available over MCP (Streamable HTTP) and as plain HTTP endpoints.`,
          tags: ["seo", "ai-visibility", "structured-data", "screenshots", "web-quality"],
          url: `${SITE_URL}/tools/mcp.md`,
        },
        {
          id: "superflow-product",
          name: "Superflow product reference",
          description:
            "What Superflow does, what it reviews, what it costs, how it handles data, and how it compares to other review tools. Every page publishes a Markdown copy at its own path plus .md.",
          tags: ["product", "pricing", "security", "comparisons"],
          url: `${SITE_URL}/llms.txt`,
        },
      ],
      // Not part of the A2A schema, but an agent that reads this card is
      // exactly the reader that wants these, and burying them costs a fetch.
      endpoints: {
        mcp: `${SITE_URL}${MCP_PATH}`,
        llmsTxt: `${SITE_URL}/llms.txt`,
        llmsFullTxt: `${SITE_URL}/llms-full.txt`,
        apiCatalog: `${SITE_URL}/.well-known/api-catalog`,
        mcpServerCard: `${SITE_URL}/.well-known/mcp/server-card.json`,
        sitemap: `${SITE_URL}/sitemap.xml`,
        markdownConvention:
          "Append .md to any page path, or send Accept: text/markdown. The homepage is at /index.md.",
      },
    };

    return NextResponse.json(card, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json({ name: "Superflow", url: SITE_URL }, { status: 200 });
  }
}
