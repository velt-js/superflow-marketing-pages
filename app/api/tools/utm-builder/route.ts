// UTM Builder API.
//
// POST /api/tools/utm-builder
//   { "url": "example.com/pricing", "source": "newsletter", "medium": "email",
//     "campaign": "spring launch" }
//
// GET /api/tools/utm-builder?url=example.com&source=newsletter&medium=email
//
// The browser tool does this work locally and nothing it builds ever leaves
// the page. This endpoint exists for the other two callers — a script and an
// agent over MCP — which have no browser to run it in.
//
// WHAT IT DOES NOT DO
//
// No fetch, no storage, no logging of the URL. The whole call is a pure
// transform of the arguments (lib/tools/utm/build.ts), which is also why it
// carries no rate limit: there is nothing here to exhaust but CPU, and the
// same convention rules run in every visitor's browser already.
//
// A campaign URL leaks more than people expect — unannounced launches,
// unsigned partners, private landing pages — so if you can run the browser
// tool instead of this endpoint, do.
//
// Envelope: HTTP 200 with `ok: true` and the built URL, or a 400 with `ok:
// false` and a message. Validation problems that are not fatal (an unknown
// medium, PII in a campaign name) come back inside `issues` on a successful
// build, because the link is still buildable and the warning is the point.

import type { NextRequest } from "next/server";
import {
  DEFAULT_CONVENTION,
  EMPTY_PARAMS,
  UTM_FIELDS,
  buildCampaignUrl,
  channelForMedium,
  type UtmCaseRule,
  type UtmConvention,
  type UtmParams,
  type UtmSpaceRule,
} from "@/lib/tools/utm/build";

/** Pure string work; no `node:` APIs, no network. */
export const runtime = "nodejs";

/**
 * Open CORS, matching /tools/md5. The endpoint is public, stateless, reads no
 * cookies and no auth, and stores nothing, so there is nothing a cross-origin
 * caller could abuse beyond the microseconds of CPU it is asking for.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const USAGE = {
  get: "/api/tools/utm-builder?url=example.com/pricing&source=newsletter&medium=email&campaign=spring_launch",
  post: `curl -sS /api/tools/utm-builder -H 'Content-Type: application/json' -d '{"url":"example.com/pricing","source":"newsletter","medium":"email","campaign":"spring launch"}'`,
};

/** Every value the caller can send, from either a JSON body or a query. */
type UtmInput = {
  url: string;
  params: UtmParams;
  convention: UtmConvention;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "no-store",
      // robots.txt already disallows /api/, but a header-side noindex is what
      // actually keeps a JSON body out of results if that ever changes.
      "X-Robots-Tag": "noindex",
    },
  });
}

/** Reads a string field, tolerating a missing or non-string value. */
function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Builds the convention from whatever the caller sent, falling back to the
 * default for anything absent or unrecognised. An unknown `caseRule` is not
 * an error worth refusing a build over: the default is the safe choice and
 * the built URL still says what it did in `convention`.
 *
 * @param source - Raw field lookups from the body or the query string.
 */
function readConvention(source: (key: string) => unknown): UtmConvention {
  const caseRule = str(source("caseRule"));
  const spaceRule = str(source("spaceRule"));
  const strip = source("stripPunctuation");

  return {
    caseRule: (caseRule === "lower" || caseRule === "preserve"
      ? caseRule
      : DEFAULT_CONVENTION.caseRule) as UtmCaseRule,
    spaceRule: (spaceRule === "underscore" ||
    spaceRule === "hyphen" ||
    spaceRule === "preserve"
      ? spaceRule
      : DEFAULT_CONVENTION.spaceRule) as UtmSpaceRule,
    // A query string has no booleans, so `?stripPunctuation=false` arrives as
    // the string "false" — which is truthy, and would silently do the
    // opposite of what the caller asked for.
    stripPunctuation:
      typeof strip === "boolean"
        ? strip
        : strip === "false"
          ? false
          : strip === "true"
            ? true
            : DEFAULT_CONVENTION.stripPunctuation,
  };
}

/**
 * Collects the destination, the six utm fields, and the convention.
 *
 * @param source - Raw field lookups from the body or the query string.
 */
function readInput(source: (key: string) => unknown): UtmInput {
  const params: UtmParams = { ...EMPTY_PARAMS };
  for (const field of UTM_FIELDS) {
    params[field] = str(source(field)).trim();
  }

  return {
    url: str(source("url")).trim(),
    params,
    convention: readConvention(source),
  };
}

/**
 * Builds the link and shapes the response.
 *
 * @param input - The destination, the values, and the convention.
 */
function respond(input: UtmInput): Response {
  if (input.url.length === 0) {
    return json(
      {
        ok: false,
        code: "bad-request",
        message: "Send a url to tag.",
        usage: USAGE,
      },
      400,
    );
  }

  const result = buildCampaignUrl({
    url: input.url,
    params: input.params,
    convention: input.convention,
  });

  // An empty URL with an error issue means the destination itself was
  // rejected — not a web address, not http(s), no domain. That is a 400 with
  // the builder's own copy rather than a "successful" build of nothing.
  if (result.url.length === 0) {
    const fatal = result.issues.find((issue) => issue.level === "error");
    return json(
      {
        ok: false,
        code: fatal?.id ?? "invalid-url",
        message: fatal?.message ?? "That does not look like a web address.",
        usage: USAGE,
      },
      400,
    );
  }

  return json({
    ok: true,
    url: result.url,
    normalized: result.normalized,
    // Null means GA4 will not recognise the medium and the traffic lands in
    // Unassigned, which is the single most common way a campaign disappears.
    // The matching issue in `issues` says so in words.
    channel: channelForMedium(result.normalized.medium),
    convention: input.convention,
    issues: result.issues,
  });
}

export function GET(request: NextRequest): Response {
  try {
    const query = request.nextUrl.searchParams;
    return respond(readInput((key) => query.get(key) ?? undefined));
  } catch {
    return json(
      { ok: false, code: "internal", message: "Could not build that link.", usage: USAGE },
      500,
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      return json(
        {
          ok: false,
          code: "bad-request",
          message: "Send a JSON body with a url.",
          usage: USAGE,
        },
        400,
      );
    }

    return respond(readInput((key) => payload?.[key]));
  } catch {
    return json(
      { ok: false, code: "internal", message: "Could not build that link.", usage: USAGE },
      500,
    );
  }
}

/** Preflight for the open CORS policy above. */
export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
