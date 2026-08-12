// MD5 hashing endpoint.
//
// Accepts text three ways so it is usable from a browser address bar, a
// `curl` one-liner, or a plain HTML form:
//
//   GET  /tools/md5?text=hello
//   POST /tools/md5  {"text":"hello"}      (application/json)
//   POST /tools/md5  hello                 (text/plain or any other type)
//   POST /tools/md5  text=hello            (application/x-www-form-urlencoded)
//
// Responds `{ md5, algorithm, bytes }`, where `bytes` is the UTF-8 byte
// length of the input that was hashed.
//
// Note on MD5: it is broken for anything security-related (collisions are
// cheap). It is still fine for what it is normally wanted for here —
// checksums, cache keys, dedupe keys, Gravatar-style identifiers. Do not
// use this to hash passwords or verify authenticity.
//
// Runs on the Node runtime (the default) because MD5 comes from
// `node:crypto`; the Edge runtime's Web Crypto has no MD5 digest.

import { createHash } from "node:crypto";

import type { NextRequest } from "next/server";

/** Largest input accepted, in UTF-8 bytes. */
const MAX_BYTES = 1024 * 1024;

/**
 * Open CORS: the endpoint is public, stateless, and reads no cookies or
 * auth, so there is nothing for a cross-origin caller to abuse beyond the
 * compute it is asking for.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const USAGE = {
  get: "/tools/md5?text=hello",
  postJson: `curl -X POST /tools/md5 -H 'Content-Type: application/json' -d '{"text":"hello"}'`,
  postRaw: "curl -X POST /tools/md5 -H 'Content-Type: text/plain' --data-binary 'hello'",
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "no-store",
      // robots.txt only disallows /api/, and blocking /tools/ wholesale
      // would also block any human-facing tool page added there later, so
      // keep this JSON endpoint out of search results header-side instead.
      "X-Robots-Tag": "noindex",
    },
  });
}

function fail(status: number, error: string): Response {
  return json({ error, usage: USAGE }, status);
}

/** Hashes `text`, or returns a 413 when it exceeds `MAX_BYTES`. */
function hashResponse(text: string): Response {
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > MAX_BYTES) {
    return fail(413, `Text is too large: ${bytes} bytes, limit is ${MAX_BYTES}.`);
  }

  return json({
    md5: createHash("md5").update(text, "utf8").digest("hex"),
    algorithm: "md5",
    bytes,
  });
}

export function GET(request: NextRequest): Response {
  // `.get()` distinguishes an absent `text` param (null → usage error) from
  // an explicitly empty one (`?text=` → hash of the empty string), which is
  // a legitimate thing to ask for.
  const text = request.nextUrl.searchParams.get("text");
  if (text === null) {
    return fail(400, "Missing `text` query parameter.");
  }

  return hashResponse(text);
}

export async function POST(request: NextRequest): Promise<Response> {
  // Reject oversized bodies before reading them into memory. The declared
  // length can lie or be absent (chunked uploads), so `hashResponse` still
  // checks the real byte count afterwards.
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
    return fail(413, `Body is too large: ${declaredLength} bytes, limit is ${MAX_BYTES}.`);
  }

  const contentType = request.headers.get("content-type") ?? "";

  let body: string;
  try {
    body = await request.text();
  } catch {
    return fail(400, "Could not read the request body.");
  }

  if (contentType.includes("application/json")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return fail(400, "Body is not valid JSON.");
    }

    const text = (parsed as { text?: unknown } | null)?.text;
    if (typeof text !== "string") {
      return fail(400, "JSON body must contain a `text` string, e.g. {\"text\":\"hello\"}.");
    }

    return hashResponse(text);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    // Hash the `text` field rather than the literal `text=hello` body, so a
    // plain HTML form posts here without surprising the caller.
    const text = new URLSearchParams(body).get("text");
    if (text === null) {
      return fail(400, "Form body must contain a `text` field.");
    }

    return hashResponse(text);
  }

  // Anything else (text/plain, no content type, octet-stream): the body is
  // the text.
  return hashResponse(body);
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
