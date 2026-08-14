// Markdown for Agents API.
//
// POST /api/tools/markdown-for-agents
//   { "url": "example.com", "refresh": false }
//
// Converts one page to CommonMark. The engine is the same built-in agent the
// product runs, reached through the free-tools start/poll contract in
// lib/toolkit/superflow-api.ts, so the free tool and the in-product agent can
// never drift apart. There is no in-repo fallback: without the backend
// configured this route says so plainly rather than half-answering.
//
// Envelope: every response is JSON with an `ok` discriminator, and every
// failure carries the backend's own `code` and `message` where it produced
// them, because its copy is written for end users. There is never a bare 500
// and never a stack trace. This endpoint backs a no-login public tool, so an
// unhandled error is a stranger's first impression of Superflow.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// blocking /tools/, where the human-facing page lives.

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
import {
  parseMarkdownForAgentsReport,
  type MarkdownForAgentsReport,
} from "@/lib/tools/free-tools/reports";

const TOOL_SLUG = "markdown-for-agents";

/** The backend tool id. Not the same string as the marketing slug by luck. */
const TOOL_ID = "markdown-for-agents";

/**
 * The backend's own free-tool budget is 10 runs an hour per IP, so the heavy
 * tier is the honest match. A looser limit here would only move the refusal
 * one hop later and phrase it worse.
 */
const RATE_TIER = "heavy" as const;

/** Bump when the stored shape changes so old cache entries are ignored. */
const REPORT_VERSION = 1;

/** Node runtime: the toolkit's URL helpers use node built-ins. */
export const runtime = "nodejs";

/**
 * The wait, in seconds, this function is allowed. The backend run plus its
 * cold start can take most of a minute (see OVERALL_TIMEOUT_MS in
 * lib/toolkit/superflow-api.ts, which sits at 55s); without this the platform
 * default decides, and a run that would have answered turns into an error
 * page instead of a report.
 */
export const maxDuration = 60;

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
        { ok: false, code: "bad-request", message: "Enter a URL to convert." },
        400,
      );
    }

    // Normalize before the cache lookup so `example.com`, `https://example.com`,
    // and `https://example.com/` all share one entry. The backend re-validates
    // and runs its own SSRF guard, so this is only about key stability.
    const normalized = normalizeUrl(rawUrl);
    const cacheUrl = normalized.ok ? normalized.url : rawUrl.trim();
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: cacheUrl,
      version: REPORT_VERSION,
    });

    const refresh = payload?.refresh === true;

    // ── Cache first, before the rate limiter ─────────────────────────────
    // A cached document costs us nothing, so serving one should not consume
    // anyone's hourly budget. This is also what makes a shared result link
    // load instantly for everyone who opens it.
    if (!refresh) {
      const hit = await readCache<MarkdownForAgentsReport>(
        cacheKey,
        REPORT_VERSION,
      );
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

    if (!isBackendConfigured()) {
      return json(
        {
          ok: false,
          code: "not-configured",
          message:
            "The converter is not available right now. Try again in a moment.",
        },
        503,
      );
    }

    // The client IP rides along so the backend's own per-IP budget sees the
    // visitor rather than this server, which would otherwise look like one
    // very busy caller and rate limit everybody at once.
    const result = await runToolViaBackend({
      toolId: TOOL_ID,
      url: rawUrl,
      clientIp: ip,
    });

    if (!result.ok) {
      return json(
        { ok: false, code: result.code, message: result.message },
        result.code === "invalid-url" ? 400 : 422,
      );
    }

    const report = parseMarkdownForAgentsReport(result.data);
    if (!report) {
      // Terminal with no document is not a result. Refuse rather than render
      // an empty page as if the site had nothing on it.
      return json(
        {
          ok: false,
          code: "backend-error",
          message:
            "The conversion finished but returned no document. Try again in a moment.",
        },
        422,
      );
    }

    if (report.markdown.trim().length === 0) {
      return json(
        {
          ok: false,
          code: "empty",
          message:
            "That page converted to an empty document. It is most likely built entirely by JavaScript in the browser, which a raw fetch cannot see.",
        },
        422,
      );
    }

    // Cache under the key derived from what the user typed AND, when they
    // differ, under the post-redirect URL. Otherwise converting `example.com`
    // and `www.example.com` runs the engine twice for one document.
    await writeCache(cacheKey, REPORT_VERSION, report, CACHE_TTL.checker);

    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: report.url || cacheUrl,
      version: REPORT_VERSION,
    });
    if (finalKey !== cacheKey) {
      await writeCache(finalKey, REPORT_VERSION, report, CACHE_TTL.checker);
    }

    return json({ ok: true, report, cached: false, ageSeconds: 0 });
  } catch {
    return json(
      {
        ok: false,
        code: "internal",
        message:
          "Something went wrong converting that page. Try again in a moment.",
      },
      500,
    );
  }
}
