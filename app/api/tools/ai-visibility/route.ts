// AI Visibility Checker API.
//
// POST /api/tools/ai-visibility
//   { "url": "example.com", "refresh": false }
//
// Returns the full report, or a typed failure the UI renders as friendly
// copy. Never returns a stack trace and never returns an empty 500 body:
// this endpoint backs a no-login public tool, so an unhandled error is a
// stranger's first impression of Superflow.
//
// Lives under /api/ so it inherits the existing robots.txt disallow (see
// app/robots.txt/route.ts) without having to block /tools/, which is where
// the human-facing pages live.

import type { NextRequest } from "next/server";
import {
  runVisibilityCheck,
  REPORT_VERSION,
} from "@/lib/tools/ai-visibility/engine";
import {
  CACHE_TTL,
  readCache,
  toolCacheKey,
  writeCache,
  invalidateCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";
import { normalizeUrl } from "@/lib/toolkit/url";
import type { VisibilityReport } from "@/lib/tools/ai-visibility/types";

const TOOL_SLUG = "ai-visibility-checker";

/** The check does a headless render and several fetches, so it is heavy. */
const RATE_TIER = "heavy" as const;

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
export const runtime = "nodejs";

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

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
    let payload: { url?: unknown; refresh?: unknown };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json(
        { ok: false, code: "bad-request", message: "Send a JSON body with a url." },
        400,
      );
    }

    const rawUrl = typeof payload?.url === "string" ? payload.url : "";
    if (rawUrl.trim().length === 0) {
      return json(
        { ok: false, code: "bad-request", message: "Enter a URL to check." },
        400,
      );
    }

    // Normalize before the cache lookup so `example.com`, `https://example.com`,
    // and `https://example.com/` all share one entry. The engine re-validates
    // and runs the SSRF guard, so this is only about key stability.
    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: cacheUrl,
      version: REPORT_VERSION,
    });

    const refresh = payload?.refresh === true;

    // ── Cache first, before the rate limiter ─────────────────────────────
    // A cached result costs us nothing, so serving one should not consume
    // anyone's hourly budget. This is also what makes a shared report link
    // load instantly for everyone who opens it.
    if (!refresh) {
      const hit = await readCache<VisibilityReport>(cacheKey, REPORT_VERSION);
      if (hit) {
        return json({
          ok: true,
          report: hit.data,
          cached: true,
          ageSeconds: hit.ageSeconds,
        });
      }
    }

    // ── Rate limit the expensive path only ───────────────────────────────
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

    const result = await runVisibilityCheck(rawUrl);

    if (!result.ok) {
      return json(
        {
          ok: false,
          code: result.code,
          message: result.message,
          status: result.status,
          finalUrl: result.finalUrl,
        },
        result.code === "invalid-url" ? 400 : 422,
      );
    }

    // Cache under the key derived from what the user typed AND, when they
    // differ, under the post-redirect URL. Otherwise checking `example.com`
    // and `www.example.com` runs the whole suite twice.
    await writeCache(cacheKey, REPORT_VERSION, result.report, CACHE_TTL.checker);

    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: result.report.finalUrl,
      version: REPORT_VERSION,
    });
    if (finalKey !== cacheKey) {
      await writeCache(
        finalKey,
        REPORT_VERSION,
        result.report,
        CACHE_TTL.checker,
      );
    }

    return json({ ok: true, report: result.report, cached: false, ageSeconds: 0 });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message: "Something went wrong running the check. Try again in a moment.",
      },
      500,
    );
  }
}
