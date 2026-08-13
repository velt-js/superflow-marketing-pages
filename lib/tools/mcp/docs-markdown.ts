// The Markdown copy of /tools/mcp, served at /tools/mcp.md.
//
// Written for the reader who is most likely to fetch it: an agent that has
// been told these tools exist and now needs the endpoint, the tool names, and
// the argument shapes, without reading a marketing page to get them. So this
// is not a transcription of the page — it drops the per-client setup prose a
// machine cannot act on and keeps the contract.
//
// Generated from the same catalogue the MCP server answers `tools/list` with,
// so it cannot describe a tool the server does not serve.

import { SITE_URL } from "@/app/_seo/schema";
import {
  MCP_PATH,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  availableToolApis,
} from "@/lib/tools/api-catalog";
import { toolPath } from "@/lib/tools/registry";

/** Escapes the characters that would break out of a Markdown table cell. */
function cell(value: string): string {
  try {
    return value.replace(/\|/g, "\\|").replace(/\n+/g, " ");
  } catch {
    return value;
  }
}

/**
 * Renders the MCP and API reference as one Markdown document.
 */
export function mcpDocsToMarkdown(): string {
  try {
    const endpoint = `${SITE_URL}${MCP_PATH}`;
    const tools = availableToolApis();
    const lines: string[] = [];

    lines.push("# Superflow free tools: MCP server and HTTP API", "");
    lines.push(
      `> ${tools.length} free website tools, available as MCP tools and as plain HTTP endpoints. No account, no API key, no OAuth.`,
      "",
    );
    lines.push(
      `This is the Markdown copy of ${SITE_URL}/tools/mcp, published for AI agents and scripts.`,
      "",
    );

    lines.push("## MCP", "");
    lines.push(`- Endpoint: \`${endpoint}\``);
    lines.push("- Transport: Streamable HTTP (one JSON-RPC message per POST)");
    lines.push(`- Protocol version: \`${MCP_PROTOCOL_VERSION}\``);
    lines.push(`- Server name: \`${MCP_SERVER_NAME}\``);
    lines.push("- Authentication: none");
    lines.push("- Sessions: none. The server is stateless.", "");

    lines.push("Add it to a client:", "");
    lines.push("```bash", `claude mcp add --transport http superflow ${endpoint}`, "```", "");
    lines.push("Or, in any client that takes a JSON config:", "");
    lines.push(
      "```json",
      JSON.stringify(
        { mcpServers: { superflow: { type: "http", url: endpoint } } },
        null,
        2,
      ),
      "```",
      "",
    );

    lines.push("## Tools", "");
    lines.push("| Tool | Arguments | Endpoint | Limit | Timeout |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const entry of tools) {
      const args = Object.entries(entry.inputSchema.properties)
        .map(([key]) =>
          entry.inputSchema.required?.includes(key) ? key : `${key}?`,
        )
        .join(", ");
      lines.push(
        `| \`${cell(entry.mcpTool)}\` | ${cell(args)} | \`${entry.method} ${entry.path}\` | ${cell(entry.rateLimit)} | ${entry.timeoutSeconds}s |`,
      );
    }
    lines.push("");

    for (const entry of tools) {
      lines.push(`### ${entry.mcpTool}`, "");
      lines.push(entry.description, "");
      lines.push(`Returns \`${entry.returns}\`.`, "");
      lines.push("```bash");
      lines.push(
        `curl -sS ${SITE_URL}${entry.path} -H 'Content-Type: application/json' -d '${JSON.stringify(entry.sample)}'`,
      );
      lines.push("```", "");
      lines.push(`Human page: ${SITE_URL}${toolPath(entry.slug)}`, "");
    }

    lines.push("## Limits and privacy", "");
    lines.push(
      "- Rate limits are per IP, per hour, and stated per tool above. A cached result does not spend a slot.",
    );
    lines.push(
      "- Results are cached for 24 hours keyed on the URL. Send `\"refresh\": true` to run again.",
    );
    lines.push(
      "- Failures are always JSON: either `{ ok: false, code, message }` with a 4xx, or HTTP 200 with an `error` and `errorCode`. Never a stack trace, never an empty 500.",
    );
    lines.push(
      "- Nothing is stored beyond that cache. There is no account and no history. Screenshots are held in a bucket behind a link that expires in about 24 hours.",
    );
    lines.push(
      "- Only public URLs are accepted. Private networks, localhost, and non-http(s) schemes are refused with `invalid-url`.",
      "",
    );

    lines.push("## About", "");
    lines.push(
      `These tools are published free by Superflow at ${SITE_URL}/tools. Superflow is a website and creative-asset review tool: its agents check every page of a site against a team's own rules and report what changed. See ${SITE_URL}.`,
      "",
    );

    return lines.join("\n");
  } catch {
    // A reference document is a convenience surface. A stub beats a 500 on a
    // URL an agent is fetching to learn how to call us.
    return `# Superflow free tools: MCP server\n\n> MCP endpoint: ${SITE_URL}${MCP_PATH}\n`;
  }
}
