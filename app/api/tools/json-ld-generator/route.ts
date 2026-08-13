// JSON-LD Generator API.
//
// POST /api/tools/json-ld-generator
//   { "url": "example.com", "refresh": false }
//
// Thin wrapper over the `json-ld-generator` engine in the Superflow backend.
// That engine reads the page, asks a model to write a schema.org block for it,
// then runs the same checks the JSON-LD Validator runs against its own output.
//
// This run costs real money, so two things follow. The cache is checked before
// the rate limiter, as everywhere else, and `refresh` is the only way to spend
// again on a URL already generated. And the backend keeps a monthly spend
// ceiling that fails closed: when it is reached the run comes back with
// `budget-exhausted` and a message written for the visitor. That is expected
// behaviour, not a fault, and it is passed through unchanged.
//
// Envelope: 200 on success, 4xx on every failure, always a JSON body carrying
// the backend's own `code` and `message`. Never a bare 500 and never a stack
// trace.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// having to block /tools/, where the human-facing page lives.

import type { NextRequest } from "next/server";
import {
  CACHE_TTL,
  invalidateCache,
  readCache,
  toolCacheKey,
  writeCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";
import { normalizeUrl } from "@/lib/toolkit/url";
import {
  isBackendConfigured,
  runToolViaBackend,
} from "@/lib/toolkit/superflow-api";
import type { JsonLdGeneratorReport } from "@/lib/tools/json-ld/types";

const TOOL_SLUG = "json-ld-generator";

/** The backend id this route runs. */
const BACKEND_TOOL_ID = "json-ld-generator";

/** A model call per run, so the tight per-IP budget applies. */
const RATE_TIER = "heavy" as const;

/** Bump when the cached shape changes so stale entries are ignored. */
const RESULT_VERSION = 1;

/** Node runtime, to match the rest of the tool routes. */
export const runtime = "nodejs";

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** What this route stores in the 24 hour cache and returns on a hit. */
type GeneratorPayload = {
  report: JsonLdGeneratorReport;
};

/** Failure codes that mean the caller sent something we cannot run. */
const BAD_REQUEST_CODES = new Set(["bad-request", "invalid-url"]);

/** Failure codes that mean "come back later" rather than "that is wrong". */
const RETRY_LATER_CODES = new Set(["rate-limited", "budget-exhausted"]);

/**
 * The HTTP status for a backend failure code.
 *
 * Kept to 4xx across the board. The UI reads `code`, not the status, and a
 * 5xx here would suggest this route broke when the truth is that the run did.
 *
 * @param code - The backend's own error code.
 */
function statusForCode(code: string): number {
  try {
    if (BAD_REQUEST_CODES.has(code)) return 400;
    if (RETRY_LATER_CODES.has(code)) return 429;
    return 422;
  } catch {
    return 422;
  }
}

/**
 * Builds a JSON response with no-store, since every body here is either
 * user-specific or already cached deliberately in KV.
 *
 * @param body - The payload.
 * @param status - HTTP status.
 */
function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (!isBackendConfigured()) {
      // There is no in-repo fallback engine for this tool, so saying so is
      // more useful than a generic failure that suggests the site is broken.
      return json(
        {
          ok: false,
          code: "not-configured",
          message:
            "The generator is not available right now. Try again in a moment.",
        },
        422,
      );
    }

    let payload: { url?: unknown; refresh?: unknown };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json(
        {
          ok: false,
          code: "bad-request",
          message: "Send a JSON body with a url.",
        },
        400,
      );
    }

    const rawUrl = typeof payload?.url === "string" ? payload.url : "";
    if (rawUrl.trim().length === 0) {
      return json(
        {
          ok: false,
          code: "bad-request",
          message: "Enter a URL to generate markup for.",
        },
        400,
      );
    }

    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: cacheUrl,
      version: RESULT_VERSION,
    });

    const refresh = payload?.refresh === true;

    // ── Cache first, before the rate limiter ─────────────────────────────
    // This matters more here than on the checkers. A cached generation is a
    // model call already paid for, so serving it should cost the visitor
    // neither a rate-limit slot nor us another few cents.
    if (!refresh) {
      const hit = await readCache<GeneratorPayload>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({
          ok: true,
          ...hit.data,
          cached: true,
          ageSeconds: hit.ageSeconds,
        });
      }
    }

    const ip = clientIpFrom(request.headers);
    const decision = await applyRateLimit({
      tool: TOOL_SLUG,
      ip,
      tier: RATE_TIER,
    });

    if (!decision.allowed) {
      return json(
        {
          ok: false,
          code: "rate-limited",
          message: decision.message,
          retryAfterSeconds: decision.retryAfterSeconds,
        },
        429,
      );
    }

    if (refresh) {
      await invalidateCache(cacheKey);
    }

    const result = await runToolViaBackend({
      toolId: BACKEND_TOOL_ID,
      url: rawUrl,
      clientIp: ip,
    });

    if (!result.ok) {
      return json(
        { ok: false, code: result.code, message: result.message },
        statusForCode(result.code),
      );
    }

    const report = result.data as JsonLdGeneratorReport | null;
    if (!report || typeof report !== "object") {
      return json(
        {
          ok: false,
          code: "internal",
          message: "The run finished without any markup. Try again in a moment.",
        },
        422,
      );
    }

    if (typeof report.error === "string" && report.error.length > 0) {
      return json({ ok: false, code: "unreachable", message: report.error }, 422);
    }

    // Markup is the entire product here. A report with nothing to copy is a
    // failure however well the run went, and rendering an empty code block
    // would be worse than saying so.
    const markup =
      typeof report.jsonLdString === "string" ? report.jsonLdString.trim() : "";
    if (markup.length === 0) {
      return json(
        {
          ok: false,
          code: "no-markup",
          message:
            "We could not build markup for that page. It may have too little content to describe. Try a page with more text on it.",
        },
        422,
      );
    }

    const stored: GeneratorPayload = { report };

    await writeCache(cacheKey, RESULT_VERSION, stored, CACHE_TTL.checker);
    if (typeof report.url === "string" && report.url.length > 0) {
      const finalKey = toolCacheKey({
        tool: TOOL_SLUG,
        url: report.url,
        version: RESULT_VERSION,
      });
      if (finalKey !== cacheKey) {
        await writeCache(finalKey, RESULT_VERSION, stored, CACHE_TTL.checker);
      }
    }

    return json({ ok: true, ...stored, cached: false, ageSeconds: 0 });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message:
          "Something went wrong building the markup. Try again in a moment.",
      },
      422,
    );
  }
}
