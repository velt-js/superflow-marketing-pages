// The MCP endpoint: POST /api/mcp
//
// Streamable HTTP transport for the free tools. Add it to any MCP client:
//
//   claude mcp add --transport http superflow https://usesuperflow.ai/api/mcp
//
// No account, no API key, no session. Each POST carries one JSON-RPC message
// and gets one answer; the protocol logic lives in lib/tools/mcp/server.ts and
// the tool list in lib/tools/api-catalog.ts.
//
// RESPONSE FORMAT
//
// The spec lets a server answer a POST with either `application/json` or an
// SSE stream. This one prefers JSON, because every response it produces is a
// single complete message with nothing to stream, and falls back to SSE only
// for a client that said it accepts event-stream and not JSON.
//
// GET and DELETE are answered 405 with an Allow header. GET would mean "open a
// server-initiated stream" and DELETE "end my session", and this server has
// neither streams nor sessions, so refusing is the honest answer — and the
// spec names 405 as the way to say so.

import type { NextRequest } from "next/server";
import {
  MCP_PATH,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  availableToolApis,
} from "@/lib/tools/api-catalog";
import { handleMcpMessage, type JsonRpcRequest } from "@/lib/tools/mcp/server";
import { clientIpFrom } from "@/lib/toolkit/ratelimit";
import { SITE_URL } from "@/app/_seo/schema";

/** Node runtime: dispatch re-enters routes that need `node:dns` and `node:net`. */
export const runtime = "nodejs";

/** Never cached: every call runs a tool. */
export const dynamic = "force-dynamic";

/**
 * Open CORS. The server is public, unauthenticated, and stateless, so there
 * is no cookie, token, or session for a hostile page to ride on — the worst a
 * cross-origin caller can do is spend its own IP's hourly budget. Browser MCP
 * clients need this to connect at all.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

const BASE_HEADERS: Record<string, string> = {
  ...CORS_HEADERS,
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
};

/**
 * The absolute origin to dispatch tool calls back through.
 *
 * Read from the forwarded headers rather than hardcoded, so a preview
 * deployment calls its own routes and not production's. `SITE_URL` is the last
 * resort, for a request that somehow arrives with no host at all.
 *
 * @param request - The incoming request.
 */
function originFrom(request: NextRequest): string {
  try {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (!host) return request.nextUrl.origin || SITE_URL;

    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");

    return `${proto}://${host}`;
  } catch {
    return SITE_URL;
  }
}

/**
 * Serialises one response, as JSON or as a single SSE event.
 *
 * @param body - The JSON-RPC response.
 * @param accept - The request's Accept header.
 */
function respond(body: unknown, accept: string): Response {
  const wantsSse =
    accept.includes("text/event-stream") && !accept.includes("application/json");

  if (!wantsSse) {
    return Response.json(body, { status: 200, headers: BASE_HEADERS });
  }

  return new Response(`event: message\ndata: ${JSON.stringify(body)}\n\n`, {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const accept = request.headers.get("accept") ?? "";

  try {
    let message: unknown;
    try {
      message = await request.json();
    } catch {
      return respond(
        {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Request body was not valid JSON." },
        },
        accept,
      );
    }

    const origin = originFrom(request);
    const clientIp = clientIpFrom(request.headers);

    // JSON-RPC batching was removed in the 2025-06-18 revision, but older
    // clients still send arrays. Handling them costs a map and keeps those
    // clients working.
    if (Array.isArray(message)) {
      const responses = await Promise.all(
        message.map((entry) =>
          handleMcpMessage({
            message: entry as JsonRpcRequest,
            origin,
            clientIp,
          }),
        ),
      );
      const answers = responses.filter((entry) => entry !== null);

      // An all-notification batch gets 202 with no body, same as a single one.
      if (answers.length === 0) {
        return new Response(null, { status: 202, headers: BASE_HEADERS });
      }
      return respond(answers, accept);
    }

    const response = await handleMcpMessage({
      message: message as JsonRpcRequest,
      origin,
      clientIp,
    });

    if (response === null) {
      return new Response(null, { status: 202, headers: BASE_HEADERS });
    }

    return respond(response, accept);
  } catch {
    return respond(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: "Something went wrong on our side." },
      },
      accept,
    );
  }
}

/**
 * GET has no meaning here (no server-initiated stream to open), so it answers
 * 405 — but with a body describing the server, because a human who pastes the
 * endpoint into a browser deserves better than an empty error.
 */
export function GET(): Response {
  return Response.json(
    {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      transport: "streamable-http",
      protocolVersion: MCP_PROTOCOL_VERSION,
      endpoint: `${SITE_URL}${MCP_PATH}`,
      documentation: `${SITE_URL}/tools/mcp`,
      authentication: "none",
      tools: availableToolApis().map((entry) => entry.mcpTool),
      message:
        "This is an MCP endpoint. Send JSON-RPC messages with POST, or add it to an MCP client: claude mcp add --transport http superflow " +
        `${SITE_URL}${MCP_PATH}`,
    },
    { status: 405, headers: { ...BASE_HEADERS, Allow: "POST, OPTIONS" } },
  );
}

/** No sessions to end. */
export function DELETE(): Response {
  return new Response(null, {
    status: 405,
    headers: { ...BASE_HEADERS, Allow: "POST, OPTIONS" },
  });
}

/** Preflight for the open CORS policy above. */
export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
