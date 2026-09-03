// The MCP server for the free tools: protocol, argument checking, dispatch.
//
// WHY MCP AT ALL
//
// Every one of these tools answers a question an agent asks constantly while
// working on a site: can AI read this page, what does this link look like when
// shared, what is this site built with, what should the alt text say. They
// already have HTTP endpoints. MCP is the difference between an agent that
// could call them if somebody wrote the glue and an agent that has them.
//
// The transport is Streamable HTTP (one POST per JSON-RPC message), and the
// server is stateless: no session id is issued, no SSE stream is held open,
// and nothing is remembered between calls. Every tool here is a pure function
// of its arguments, so there is no state worth keeping and no reason to make a
// client manage one.
//
// DISPATCH GOES BACK THROUGH THE PUBLIC HTTP ENDPOINT
//
// `tools/call` re-enters the site's own /api/tools/* route rather than calling
// the engines directly. That one extra hop buys a guarantee: an MCP caller and
// a curl caller run the exact same code, so the SSRF guard, the per-IP budget,
// the cache, and the error copy cannot drift between the two surfaces. The
// caller's IP is forwarded so the budget sees them, not this server.

import {
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  apiForMcpTool,
  availableToolApis,
  mcpToolDefinitions,
  type ToolApiEntry,
  type ToolInputSchema,
} from "@/lib/tools/api-catalog";
import { SITE_URL } from "@/app/_seo/schema";

/** JSON-RPC 2.0 error codes this server uses. */
const JSONRPC = {
  parseError: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internalError: -32603,
} as const;

/**
 * Ceiling on a single tool result, in characters of JSON.
 *
 * `generate_llms_txt` over a large site produces a genuinely enormous
 * document, and handing an agent half a megabyte of text costs it most of its
 * context for something it probably wanted to write to disk. Past this the
 * result is truncated and says so, with the endpoint to call directly for the
 * whole thing.
 */
const MAX_RESULT_CHARS = 200_000;

/** Headroom over the endpoint's own ceiling before the fetch is abandoned. */
const DISPATCH_GRACE_MS = 5_000;

/**
 * A note on slow runs, because the handling is deliberately minimal.
 *
 * The backend-run tools take from half a minute (social preview) to three
 * minutes (a persona review), and no serverless function can hold a request
 * open for the long end of that. The endpoint therefore waits as long as it
 * safely can and then answers `{ status: "pending", runId }`, which is a
 * healthy run, not a failure — so it passes through to the model untouched,
 * carrying the endpoint's own instructions to call the tool again with that
 * `runId`. Two calls collect anything the endpoint can start, whatever it
 * costs, and this server holds no request open longer than one already does.
 *
 * Polling here instead would put two of those waits inside one function
 * invocation, which is the ceiling this whole change exists to get out from
 * under.
 */

/**
 * Protocol revisions this server accepts from a client. All three are handled
 * identically here — nothing this server does differs between them — so the
 * client's own version is echoed back rather than forcing a downgrade.
 */
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
]);

/** What every client is told at handshake time. */
const INSTRUCTIONS = [
  "Superflow's free website tools, published with no account and no API key.",
  "",
  "Each tool takes a URL and answers about that one page or site: whether AI assistants can read it, how it renders when shared, what it is built with, what its structured data says, what its images should say.",
  "",
  "They are rate limited to 10 runs per hour per IP (60 for detect_tech_stack) and results are cached for 24 hours, so re-asking about a URL you already checked is free. Nothing you send is stored beyond that cache.",
  "",
  'The engines fetch, render, and crawl real pages, so a run can take a couple of minutes. A tool that is still running answers with `{ status: "pending", runId }` rather than a result: that is a healthy run, not an error. Call the same tool again with just that `runId` to collect it, as many times as it takes. Collecting costs no rate-limit slot; starting over does.',
].join("\n");

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
};

/** A response to send back, or null for a notification (nothing to send). */
export type JsonRpcResponse = Record<string, unknown> | null;

/**
 * Builds a JSON-RPC result envelope.
 *
 * @param id - The request id being answered.
 * @param result - The payload.
 */
function ok(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

/**
 * Builds a JSON-RPC error envelope.
 *
 * @param id - The request id being answered.
 * @param code - A JSON-RPC error code.
 * @param message - Plain words. Models read these and retry on them.
 */
function fail(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/**
 * Checks and coerces one tool call's arguments against its schema.
 *
 * A model calling a tool sends strings where booleans belong often enough
 * that refusing them would be pedantry rather than safety, so "true" becomes
 * true and "10" becomes 10. Unknown keys are dropped rather than rejected:
 * the endpoint behind this ignores them anyway, and failing a whole run over
 * a stray argument helps nobody. What is refused is a missing required value
 * or a value of a type that cannot be salvaged, because those produce a
 * confusing answer rather than no answer.
 *
 * @param schema - The tool's input schema from the catalogue.
 * @param raw - The `arguments` object as the client sent it.
 */
export function coerceArguments(
  schema: ToolInputSchema,
  raw: unknown,
): { ok: true; args: Record<string, unknown> } | { ok: false; message: string } {
  try {
    const input =
      typeof raw === "object" && raw !== null && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};
    const args: Record<string, unknown> = {};

    for (const [key, property] of Object.entries(schema.properties)) {
      const value = input[key];
      if (value === undefined || value === null || value === "") continue;

      if (property.type === "string") {
        if (typeof value !== "string") {
          return { ok: false, message: `\`${key}\` must be a string.` };
        }
        if (property.enum && !property.enum.includes(value)) {
          return {
            ok: false,
            message: `\`${key}\` must be one of: ${property.enum.join(", ")}.`,
          };
        }
        args[key] = value;
        continue;
      }

      if (property.type === "boolean") {
        if (typeof value === "boolean") {
          args[key] = value;
        } else if (value === "true" || value === "false") {
          args[key] = value === "true";
        } else {
          return { ok: false, message: `\`${key}\` must be true or false.` };
        }
        continue;
      }

      const numeric = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numeric)) {
        return { ok: false, message: `\`${key}\` must be a number.` };
      }
      args[key] = numeric;
    }

    for (const key of schema.required ?? []) {
      if (args[key] === undefined) {
        return {
          ok: false,
          message: `\`${key}\` is required. Send it as: {"${key}": "..."}.`,
        };
      }
    }

    return { ok: true, args };
  } catch {
    return { ok: false, message: "Those arguments could not be read." };
  }
}

/**
 * Calls one tool's HTTP endpoint and returns what it said.
 *
 * Never throws. A transport failure comes back as a failed call with copy the
 * agent can act on, because an MCP client shows a tool error to a model that
 * then has to decide whether to retry.
 *
 * @param entry - The catalogue entry being called.
 * @param args - Already-coerced arguments.
 * @param origin - Absolute origin of this deployment.
 * @param clientIp - Forwarded so the endpoint's per-IP budget sees the caller.
 */
export async function callToolEndpoint({
  entry,
  args,
  origin,
  clientIp,
}: {
  entry: ToolApiEntry;
  args: Record<string, unknown>;
  origin: string;
  clientIp?: string;
}): Promise<{ failed: boolean; payload: unknown }> {
  try {
    const response = await fetch(`${origin}${entry.path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(
        entry.timeoutSeconds * 1000 + DISPATCH_GRACE_MS,
      ),
      cache: "no-store",
    });

    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      return {
        failed: true,
        payload: {
          error: `The ${entry.title} endpoint answered with something that was not JSON (HTTP ${response.status}).`,
        },
      };
    }

    // The suite uses two envelopes: `{ ok: false }` with a 4xx on the
    // report-style endpoints, and HTTP 200 with an `error` field on the ones
    // whose UI reads `.error` rather than the status. Both mean the run did
    // not produce an answer, and an agent should see both as a tool error.
    const record =
      typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : {};

    // A pending answer is neither of those: the run is healthy and still
    // going, so it is NOT a failure. It reaches the model with the endpoint's
    // own instructions for collecting it.
    const failed =
      record.status !== "pending" &&
      (!response.ok || record.ok === false || typeof record.error === "string");

    return { failed, payload };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      failed: true,
      payload: {
        error: timedOut
          ? `${entry.title} did not finish within ${entry.timeoutSeconds} seconds. The page may be slow or very large. Try again, or run it at ${SITE_URL}/tools/${entry.slug}.`
          : `${entry.title} could not be reached. Try again in a moment.`,
      },
    };
  }
}

/**
 * Serialises a tool result for the model, capped so one call cannot eat a
 * whole context window.
 *
 * @param entry - The tool that produced it.
 * @param payload - The endpoint's JSON body.
 */
function resultText(entry: ToolApiEntry, payload: unknown): string {
  try {
    const text = JSON.stringify(payload, null, 2);
    if (text.length <= MAX_RESULT_CHARS) return text;

    return [
      text.slice(0, MAX_RESULT_CHARS),
      "",
      `[Truncated at ${MAX_RESULT_CHARS} characters. Call POST ${SITE_URL}${entry.path} directly for the whole result.]`,
    ].join("\n");
  } catch {
    return String(payload);
  }
}

/**
 * Runs one `tools/call`.
 *
 * @param name - The tool the client named.
 * @param rawArgs - Its `arguments` object.
 * @param origin - Absolute origin of this deployment.
 * @param clientIp - The caller's IP.
 */
async function handleToolCall({
  name,
  rawArgs,
  origin,
  clientIp,
}: {
  name: unknown;
  rawArgs: unknown;
  origin: string;
  clientIp?: string;
}): Promise<{ result: Record<string, unknown> } | { error: string }> {
  if (typeof name !== "string" || name.length === 0) {
    return { error: "A tool name is required." };
  }

  const entry = apiForMcpTool(name);
  const available = availableToolApis().some((tool) => tool.mcpTool === name);
  if (!entry || !available) {
    const known = availableToolApis()
      .map((tool) => tool.mcpTool)
      .join(", ");
    return { error: `Unknown tool \`${name}\`. Available tools: ${known}.` };
  }

  const coerced = coerceArguments(entry.inputSchema, rawArgs);
  if (!coerced.ok) {
    // An argument problem is reported as a tool error rather than a JSON-RPC
    // error: the model is the one that can fix it, and only tool results are
    // reliably shown to it.
    return {
      result: {
        content: [{ type: "text", text: coerced.message }],
        isError: true,
      },
    };
  }

  const { failed, payload } = await callToolEndpoint({
    entry,
    args: coerced.args,
    origin,
    clientIp,
  });

  return {
    result: {
      content: [{ type: "text", text: resultText(entry, payload) }],
      ...(typeof payload === "object" && payload !== null && !Array.isArray(payload)
        ? { structuredContent: payload as Record<string, unknown> }
        : {}),
      isError: failed,
    },
  };
}

/**
 * Handles one JSON-RPC message.
 *
 * Returns null for a notification, which the transport answers with 202 and
 * an empty body, per the Streamable HTTP spec.
 *
 * @param message - The parsed request.
 * @param origin - Absolute origin of this deployment.
 * @param clientIp - The caller's IP, forwarded to the tool endpoints.
 */
export async function handleMcpMessage({
  message,
  origin,
  clientIp,
}: {
  message: JsonRpcRequest;
  origin: string;
  clientIp?: string;
}): Promise<JsonRpcResponse> {
  const method = typeof message?.method === "string" ? message.method : "";
  const hasId = message?.id !== undefined && message?.id !== null;
  const id = (hasId ? (message.id as JsonRpcId) : null) as JsonRpcId;

  // Notifications carry no id and get no response, whatever they are. The one
  // that matters is notifications/initialized; the rest are safely ignored.
  if (!hasId) {
    return null;
  }

  if (method.length === 0) {
    return fail(id, JSONRPC.invalidRequest, "Missing `method`.");
  }

  try {
    switch (method) {
      case "initialize": {
        const params =
          typeof message.params === "object" && message.params !== null
            ? (message.params as Record<string, unknown>)
            : {};
        const asked =
          typeof params.protocolVersion === "string"
            ? params.protocolVersion
            : "";

        return ok(id, {
          // Echo the client's version when we can speak it, otherwise state
          // ours and let the client decide whether to continue — which is
          // exactly what the spec asks a server to do.
          protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.has(asked)
            ? asked
            : MCP_PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: {
            name: MCP_SERVER_NAME,
            title: "Superflow Free Tools",
            version: MCP_SERVER_VERSION,
          },
          instructions: INSTRUCTIONS,
        });
      }

      case "ping":
        return ok(id, {});

      case "tools/list":
        // No pagination: there are a dozen tools and there will not be
        // hundreds, so a nextCursor would be ceremony.
        return ok(id, { tools: mcpToolDefinitions() });

      case "tools/call": {
        const params =
          typeof message.params === "object" && message.params !== null
            ? (message.params as Record<string, unknown>)
            : {};

        const outcome = await handleToolCall({
          name: params.name,
          rawArgs: params.arguments,
          origin,
          clientIp,
        });

        return "error" in outcome
          ? fail(id, JSONRPC.invalidParams, outcome.error)
          : ok(id, outcome.result);
      }

      default:
        // Including resources/* and prompts/*: this server advertises neither
        // capability, so method-not-found is the correct answer rather than an
        // empty list that implies the capability exists.
        return fail(id, JSONRPC.methodNotFound, `Unknown method \`${method}\`.`);
    }
  } catch {
    return fail(
      id,
      JSONRPC.internalError,
      "Something went wrong handling that request.",
    );
  }
}

export const MCP_JSONRPC_CODES = JSONRPC;
export { INSTRUCTIONS as MCP_INSTRUCTIONS };
