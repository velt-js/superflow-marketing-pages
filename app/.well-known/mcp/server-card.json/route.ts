// /.well-known/mcp/server-card.json - describes the MCP server at /api/mcp.
//
// The tool list is generated from the same registry the server itself answers
// `tools/list` with (lib/tools/api-catalog.ts), so the card cannot advertise a
// tool the server does not have, or miss one it does.

import { NextResponse } from "next/server";

import { SITE_URL } from "@/app/_seo/schema";
import {
  MCP_PATH,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  mcpToolDefinitions,
} from "@/lib/tools/api-catalog";

export const revalidate = 3600;

export function GET(): NextResponse {
  try {
    const tools = mcpToolDefinitions();

    const card = {
      name: MCP_SERVER_NAME,
      description:
        "Superflow's free website and scheduling tools, published with no account and no API key. Website checks fetch, render, and crawl real pages; a slow run answers with a pending handle to collect later.",
      version: MCP_SERVER_VERSION,
      serverInfo: { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
      url: `${SITE_URL}${MCP_PATH}`,
      transport: "http",
      protocolVersion: MCP_PROTOCOL_VERSION,
      authentication: "none",
      capabilities: { tools: true, resources: false, prompts: false },
      documentationUrl: `${SITE_URL}/tools/mcp`,
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      })),
    };

    return NextResponse.json(card, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json(
      { name: MCP_SERVER_NAME, url: `${SITE_URL}${MCP_PATH}`, transport: "http" },
      { status: 200 },
    );
  }
}
