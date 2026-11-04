// Open Graph Video Checker API.
//
// POST /api/tools/og-video-checker
//   { "url": "example.com", "refresh": false }
//
// Fetches the page, reads its og:video declarations (arrays and all, the way
// ogp.me defines them), then fetches the first bytes of the video and the
// share image and reads what they really are. The engine is
// lib/toolkit/og-video.ts.
//
// Envelope: every response is HTTP 200 JSON. Failures carry `error` with
// ready-to-render plain words plus a machine `errorCode`; there is never a
// bare 500 and never a stack trace. Same contract as the Favicon Checker.
//
// RATE TIER
//
// `light`, like the Favicon Checker. A run makes at most five requests after
// the page (three videos and one image), each capped at a few hundred
// kilobytes, so it costs about what loading the page does. Nothing renders and
// no model runs.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// blocking /tools/, where the human-facing page lives.

import type { NextRequest } from "next/server";
import { checkOgVideo, type OgVideoReport } from "@/lib/toolkit/og-video";
import { fetchUrl, type FetchFailureReason } from "@/lib/toolkit/fetcher";
import { resolveUserUrl, URL_REJECTION_MESSAGES } from "@/lib/toolkit/url";
import {
  CACHE_TTL,
  invalidateCache,
  readCache,
  toolCacheKey,
  writeCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";

const TOOL_SLUG = "og-video-checker";

/** Fetch and header reads only, so the generous per-IP budget applies. */
const RATE_TIER = "light" as const;

/** Bump when the result shape changes so stale cache entries are ignored. */
const RESULT_VERSION = 1;

/** Statuses that mean a bot blocker answered instead of the site. */
const BLOCKED_STATUSES = new Set([403, 406, 429]);

/**
 * The tags are in `<head>`, at the top. Video pages tend to inline large
 * player config further down, so a head-sized read keeps a run cheap.
 */
const MAX_HTML_BYTES = 768 * 1024;

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
export const runtime = "nodejs";

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** The successful result. Also exactly what the 24 hour cache stores. */
type OgVideoResult = OgVideoReport & {
  /** The URL the check actually ran against, after redirects. */
  url: string;
  /** The submitted URL after normalization. */
  requestedUrl: string;
  /** HTTP status of the page response. */
  status: number;
  /** When the page was fetched, ISO 8601. */
  fetchedAt: string;
};

/** Plain-words copy for each way the fetch itself can fail. */
const FETCH_FAILURE_MESSAGES: Record<FetchFailureReason, string> = {
  timeout:
    "The site took too long to answer. It may be slow or down right now. Try again in a moment.",
  network:
    "We could not connect to that site. Check the URL is right and the site is online, then try again.",
  "too-many-redirects":
    "The site kept redirecting and never landed on a page, so there was no HTML to read.",
  "redirect-blocked":
    "The site redirected to an address that is not on the public internet, so we stopped there.",
  "invalid-redirect":
    "The site sent a redirect we could not follow, so there was no HTML to read.",
};

/**
 * Builds a JSON response. Always 200: the UI reads `.error`, not the status,
 * and a no-store header keeps intermediaries out of it.
 *
 * @param body - The payload.
 */
function json(body: unknown): Response {
  return Response.json(body, {
    status: 200,
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
      return json({
        error: "Send a JSON body with a url.",
        errorCode: "bad-request",
      });
    }

    const rawUrl = typeof payload?.url === "string" ? payload.url : "";
    const refresh = payload?.refresh === true;

    // 1. Normalize and SSRF-check what the user typed.
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) {
      return json({
        error: URL_REJECTION_MESSAGES[resolved.reason],
        errorCode: "invalid-url",
      });
    }

    // 2. Rate limit per IP. The limiter fails open by design.
    const ip = clientIpFrom(request.headers);
    const decision = await applyRateLimit({
      tool: TOOL_SLUG,
      ip,
      tier: RATE_TIER,
    });
    if (!decision.allowed) {
      return json({
        error: decision.message,
        errorCode: "rate-limited",
        retryAfterSeconds: decision.retryAfterSeconds,
      });
    }

    // 3. The 24 hour cache, keyed on the normalized URL.
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: resolved.url,
      version: RESULT_VERSION,
    });

    if (refresh) {
      await invalidateCache(cacheKey);
    } else {
      const hit = await readCache<OgVideoResult>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({ ...hit.data, cached: true, ageSeconds: hit.ageSeconds });
      }
    }

    // 4. Fetch the page through the guarded fetcher, which re-checks every
    //    redirect hop, caps the body, and never throws.
    const fetched = await fetchUrl({
      url: resolved.url,
      maxBytes: MAX_HTML_BYTES,
    });
    const fetchedAt = new Date().toISOString();

    if (!fetched.ok) {
      return json({
        requestedUrl: resolved.url,
        url: fetched.finalUrl,
        fetchedAt,
        error:
          FETCH_FAILURE_MESSAGES[fetched.reason] ??
          FETCH_FAILURE_MESSAGES.network,
        errorCode: fetched.reason,
      });
    }

    // 5. Bot protection answered, not the site. Running the checks on the
    //    challenge page would report a page with a working video as having
    //    none, so say what happened instead.
    if (BLOCKED_STATUSES.has(fetched.status)) {
      return json({
        requestedUrl: resolved.url,
        url: fetched.finalUrl,
        fetchedAt,
        error: `The site blocked our request with HTTP ${fetched.status}. This is usually bot protection in front of the site, not a problem with your tags. We could not read the page's HTML, so there was nothing to check.`,
        errorCode: "blocked",
      });
    }

    // 6. Run the engine. It owns every request after this one.
    const report = await checkOgVideo({
      html: fetched.body,
      url: fetched.finalUrl,
    });

    const result: OgVideoResult = {
      requestedUrl: resolved.url,
      url: fetched.finalUrl,
      ...report,
      status: fetched.status,
      fetchedAt,
    };

    // 7. Cache under what the user typed and, when different, under the
    //    post-redirect URL, so `example.com` and `www.example.com` share.
    await writeCache(cacheKey, RESULT_VERSION, result, CACHE_TTL.checker);
    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: result.url,
      version: RESULT_VERSION,
    });
    if (finalKey !== cacheKey) {
      await writeCache(finalKey, RESULT_VERSION, result, CACHE_TTL.checker);
    }

    return json({ ...result, cached: false, ageSeconds: 0 });
  } catch {
    return json({
      error:
        "Something went wrong on our side running the check. Try again in a moment.",
      errorCode: "internal",
    });
  }
}
