// The tools this site registers with the browser's WebMCP API.
//
// WHY THIS EXISTS
//
// The site already answers agents three ways: an MCP server at /api/mcp, a
// Markdown copy of every page, and the discovery documents in
// app/.well-known/. All three assume the agent arrived on its own and knows
// where to fetch. WebMCP covers the case none of them do - an agent driving
// the browser a person is actually looking at, on the page they are actually
// on. There is nothing to fetch and no endpoint to discover: the page hands
// the agent its tools directly.
//
// TWO GROUPS
//
// 1. Site tools, registered on every page. They answer "what is this page"
//    and "what else is here" from the Markdown copies the site already
//    publishes, so an agent can read the site without scraping the DOM.
// 2. The free tools, built from `lib/tools/api-catalog.ts` - the same entries
//    /api/mcp serves and the docs pages list. Name, description and input
//    schema come from there verbatim, so a tool cannot exist in one surface
//    and not the other, or drift in what it claims to take.
//
// Every tool here is read-only and unauthenticated. None of them act on the
// visitor's behalf, spend anything, or change state the visitor owns, which is
// why they all carry `readOnlyHint` and none carry `consequentialHint`.

import {
  availableToolApis,
  apiForTool,
  type ToolApiEntry,
  type ToolInputSchema,
} from "@/lib/tools/api-catalog";
import type { WebMcpTool } from "@/lib/webmcp/types";

/** How long a site tool waits on its own fetch before giving up. */
const SITE_TOOL_TIMEOUT_MS = 15_000;

/**
 * Reads a path on this site as Markdown.
 *
 * Uses the `.md` convention the site already publishes (see AGENTS.md), so
 * this returns the copy written for a machine rather than the rendered page
 * with its navigation and footer.
 *
 * @param path - Site-relative path, with or without a leading slash.
 * @param signal - Abort signal from the agent.
 * @returns The Markdown document.
 */
async function readMarkdown(path: string, signal?: AbortSignal): Promise<string> {
  const clean = `/${String(path ?? "").trim().replace(/^\/+/, "")}`.replace(/\/+$/, "") || "/";
  // The homepage has no slug of its own; it is published at /index.md.
  const target = clean === "/" ? "/index.md" : `${clean}.md`;

  const timeout = AbortSignal.timeout(SITE_TOOL_TIMEOUT_MS);
  const res = await fetch(target, {
    headers: { accept: "text/markdown, text/plain" },
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!res.ok) {
    throw new Error(
      `No page at ${clean} (HTTP ${res.status}). Call superflow_list_pages for the paths that exist.`,
    );
  }
  return res.text();
}

/** No arguments, spelled the way the schema type wants it. */
const NO_INPUT: ToolInputSchema = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};

/**
 * The tools every page registers.
 *
 * @returns Site-wide WebMCP tools.
 */
export function siteTools(): WebMcpTool[] {
  return [
    {
      name: "superflow_read_current_page",
      title: "Read the current page",
      description:
        "Return the page the visitor is looking at right now as Markdown, written for a machine rather than scraped from the rendered DOM. Use this instead of reading the page's HTML: it is the same content without the navigation, footer, and markup noise. Takes no arguments - it always reads the current URL.",
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      execute: async (_input, { signal }) => {
        const { pathname } = window.location;
        return { path: pathname, markdown: await readMarkdown(pathname, signal) };
      },
    },
    {
      name: "superflow_read_page",
      title: "Read any page on this site",
      description:
        "Return any page of usesuperflow.ai as Markdown, given its path. Use this to follow a link without navigating away from what the visitor is looking at - pricing, a comparison, a feature page, a blog post. Call superflow_list_pages first if you do not already know the path.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              'Site-relative path, for example "/pricing" or "/comparisons/superflow-vs-bugherd". Use "/" for the homepage. Paths only: this tool does not fetch other sites.',
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input, { signal }) => {
        const path = typeof input?.path === "string" ? input.path : "/";
        return { path, markdown: await readMarkdown(path, signal) };
      },
    },
    {
      name: "superflow_list_pages",
      title: "List this site's pages",
      description:
        "Return the site's own index of its pages, grouped and annotated - the llms.txt document. Use it to find the path for a topic before calling superflow_read_page. Takes no arguments.",
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      execute: async (_input, { signal }) => {
        const timeout = AbortSignal.timeout(SITE_TOOL_TIMEOUT_MS);
        const res = await fetch("/llms.txt", {
          headers: { accept: "text/plain" },
          signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        });
        if (!res.ok) throw new Error(`Could not read the page index (HTTP ${res.status}).`);
        return { index: await res.text() };
      },
    },
  ];
}

/**
 * Wraps one free-tool endpoint as a WebMCP tool.
 *
 * The description carries the rate limit and the timeout for the same reason
 * `mcpToolDefinitions()` does: an agent told a call can take 60 seconds waits
 * for it instead of retrying three times and spending the hourly budget.
 *
 * @param entry - The catalogue entry to wrap.
 * @returns The tool descriptor.
 */
function freeTool(entry: ToolApiEntry): WebMcpTool {
  const deferred = "runId" in entry.inputSchema.properties;
  return {
    name: entry.mcpTool,
    title: entry.title,
    description: [
      entry.description,
      "",
      `Returns ${entry.returns}. Limit: ${entry.rateLimit}. Allow up to ${entry.timeoutSeconds}s for a response. Free, no account, no API key.`,
      ...(deferred
        ? [
            "",
            'Pass `url` to start a run. A slow run answers with `{ status: "pending", runId }` instead of a result: call this same tool again with just that `runId` to collect it, as many times as it takes. Collecting costs no rate-limit slot.',
          ]
        : []),
    ].join("\n"),
    inputSchema: entry.inputSchema,
    annotations: { readOnlyHint: true, openWorldHint: true },
    execute: async (input, { signal }) => {
      // The endpoint's own timeout is the contract; this is the ceiling a
      // caller should wait, taken from the same entry the docs quote.
      const timeout = AbortSignal.timeout(entry.timeoutSeconds * 1000);
      const res = await fetch(entry.path, {
        method: entry.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input ?? {}),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });

      // Hand back the body either way: these endpoints explain refusals
      // (a private URL, a spent rate limit) in JSON, and an agent that is
      // shown the reason can fix the call instead of retrying blindly.
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* Not JSON. Return the text as-is. */
      }
      if (!res.ok) {
        throw new Error(
          `${entry.title} refused the call (HTTP ${res.status}): ${
            typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)
          }`,
        );
      }
      return body;
    },
  };
}

/**
 * The free tools to register for a given path.
 *
 * Registering all fourteen on every page would bury the site tools in a list
 * an agent has to read on a page about pricing. So: the tool the visitor is
 * looking at, on its own page; the whole suite where the suite is the subject;
 * and nothing extra anywhere else. Agents that want all of them regardless
 * have /api/mcp, which is what that server is for.
 *
 * @param pathname - The current path.
 * @returns The catalogue entries to register.
 */
export function freeToolsForPath(pathname: string): WebMcpTool[] {
  try {
    const path = (pathname || "/").replace(/\/+$/, "") || "/";
    const live = availableToolApis();

    // The tools index and the MCP documentation page are ABOUT the suite.
    if (path === "/tools" || path === "/tools/mcp") return live.map(freeTool);

    const match = /^\/tools\/([^/]+)$/.exec(path);
    if (match) {
      const entry = apiForTool(match[1]);
      // `apiForTool` finds entries whose engine is not trustworthy yet, which
      // is exactly what `availableToolApis` filters out. Register only if live.
      if (entry && live.some((candidate) => candidate.slug === entry.slug)) {
        return [freeTool(entry)];
      }
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Everything to register for a path: the site tools plus whatever free tools
 * that page warrants.
 *
 * @param pathname - The current path.
 * @returns The full tool list for the page.
 */
export function toolsForPath(pathname: string): WebMcpTool[] {
  try {
    return [...siteTools(), ...freeToolsForPath(pathname)];
  } catch {
    return [];
  }
}
