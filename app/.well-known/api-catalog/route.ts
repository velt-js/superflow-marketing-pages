// /.well-known/api-catalog - RFC 9727, served as application/linkset+json.
//
// One anchor per callable tool endpoint, each linking to the document that
// describes it. An agent that wants to CALL something rather than read about
// it starts here and never has to parse a marketing page.

import { NextResponse } from "next/server";

import { SITE_URL } from "@/app/_seo/schema";
import { MCP_PATH, availableToolApis } from "@/lib/tools/api-catalog";
import { toolPath } from "@/lib/tools/registry";

export const revalidate = 3600;

export function GET(): NextResponse {
  try {
    const linkset = [
      // The MCP server first: one endpoint that exposes every tool at once is
      // more useful than n individual ones to a client that speaks MCP.
      {
        anchor: `${SITE_URL}${MCP_PATH}`,
        "service-desc": [
          {
            href: `${SITE_URL}/.well-known/mcp/server-card.json`,
            type: "application/json",
            title: "MCP server card",
          },
        ],
        "service-doc": [
          {
            href: `${SITE_URL}/tools/mcp.md`,
            type: "text/markdown",
            title: "MCP and HTTP reference",
          },
        ],
        status: [{ href: `${SITE_URL}/tools`, title: "Superflow free tools" }],
      },
      ...availableToolApis().map((entry) => ({
        anchor: `${SITE_URL}${entry.path}`,
        "service-doc": [
          {
            href: `${SITE_URL}${toolPath(entry.slug)}.md`,
            type: "text/markdown",
            title: entry.title,
          },
        ],
        describedby: [
          {
            href: `${SITE_URL}/tools/mcp.md`,
            type: "text/markdown",
            title: "Request and response shapes",
          },
        ],
      })),
    ];

    return new NextResponse(JSON.stringify({ linkset }, null, 2), {
      headers: {
        "Content-Type": "application/linkset+json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse(JSON.stringify({ linkset: [] }), {
      headers: { "Content-Type": "application/linkset+json; charset=utf-8" },
    });
  }
}
