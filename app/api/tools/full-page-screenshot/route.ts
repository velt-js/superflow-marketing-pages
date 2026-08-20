// Full Page Screenshot API.
//
// POST /api/tools/full-page-screenshot
//   { "url": "example.com", "refresh": false }
//
// The capture itself happens in the product backend: a headless browser
// scrolls the whole page so lazy-loaded content actually renders, stitches
// the result, and uploads the PNG to our bucket. This route is the seam
// between the marketing site and that engine, adding the SSRF guard, the
// per-IP budget, and a short cache.
//
// TWO THINGS THIS ROUTE DELIBERATELY DOES NOT DO
//
// 1. It does not proxy the image. The backend hands back a signed bucket URL
//    and we pass it straight to the browser, which loads it directly. Piping
//    a multi-megabyte PNG through a serverless function would double the
//    bandwidth, add seconds of latency, and buy nothing.
// 2. It does not cache for 24 hours like the other checkers. The signed URL
//    expires in about a day, so a day-old cache entry would hand somebody a
//    link that dies while they are looking at it. One hour is the ceiling
//    here, and CACHE_TTL.screenshot exists for exactly this reason.
//
// Envelope: every response is HTTP 200 JSON. Failures carry `error` with
// ready-to-render plain words plus a machine `errorCode`; there is never a
// bare 500 and never a stack trace. This endpoint backs a no-login public
// tool, so an unhandled error is a stranger's first impression of Superflow.

import type { NextRequest } from "next/server";
import {
  CACHE_TTL,
  invalidateCache,
  readCache,
  toolCacheKey,
  writeCache,
} from "@/lib/toolkit/cache";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";
import { cacheVersionFor } from "@/lib/tools/share/cache-versions";
import { resolveUserUrl, URL_REJECTION_MESSAGES } from "@/lib/toolkit/url";
import {
  isBackendConfigured,
  runToolViaBackend,
} from "@/lib/toolkit/superflow-api";

const TOOL_SLUG = "full-page-screenshot";

/** The backend's tool id. Not the same string as the page slug by accident. */
const TOOL_ID = "full-page-screenshot";

/** A headless render of a whole page. Firmly the heavy budget. */
const RATE_TIER = "heavy" as const;

/**
 * The version this tool's cache entries carry.
 *
 * Read from the shared table rather than declared here: the Open Graph card
 * and the badge endpoint read these same entries, and a version bumped in one
 * place and not the other fails silently. Bump it in
 * lib/tools/share/cache-versions.ts.
 */
const RESULT_VERSION = cacheVersionFor(TOOL_SLUG);

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
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
 * The capture as the backend reports it.
 *
 * Only `imageUrl` is load bearing. Everything else is displayed when present
 * and skipped when absent, so a backend that adds or drops a field cannot
 * break the page.
 */
export type ScreenshotReport = {
  /** Signed bucket URL for the PNG. Short lived, see `expiresAt`. */
  imageUrl?: string;
  /** ISO 8601 or epoch ms, whichever the backend sends. */
  expiresAt?: string | number;
  /** Size of the PNG in bytes. */
  bytes?: number;
  /** Capture height in CSS pixels. A full page, so usually very tall. */
  height?: number;
  /** Capture width in CSS pixels, when the backend reports it. */
  width?: number;
  /** Which viewport was used, e.g. "desktop". */
  deviceType?: string;
  /** How long the capture took, server side. */
  durationMs?: number;
  /** The URL actually captured, after redirects. */
  url?: string;
  /** The submitted URL after normalization. */
  requestedUrl?: string;
};

/** The successful result. Also exactly what the one hour cache stores. */
type ScreenshotResult = ScreenshotReport & {
  /** Always present, even when the backend omits its own `url`. */
  url: string;
  requestedUrl: string;
  /** When the capture was taken, ISO 8601. */
  capturedAt: string;
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

/**
 * Narrows the backend's untyped terminal report to the fields we render.
 *
 * Unknown fields are dropped rather than spread through, so the cached
 * envelope stays the shape this route's own version number describes.
 *
 * @param data - The terminal `data` payload from the backend.
 */
function toReport(data: unknown): ScreenshotReport {
  try {
    if (typeof data !== "object" || data === null) return {};
    const raw = data as Record<string, unknown>;

    const str = (key: string): string | undefined =>
      typeof raw[key] === "string" && (raw[key] as string).length > 0
        ? (raw[key] as string)
        : undefined;
    const num = (key: string): number | undefined =>
      typeof raw[key] === "number" && Number.isFinite(raw[key] as number)
        ? (raw[key] as number)
        : undefined;

    return {
      imageUrl: str("imageUrl"),
      // The backend may express the expiry either way. Keep whichever it
      // sent and let the UI format it, rather than converting twice.
      expiresAt: str("expiresAt") ?? num("expiresAt"),
      bytes: num("bytes"),
      height: num("height"),
      width: num("width"),
      deviceType: str("deviceType"),
      durationMs: num("durationMs"),
      url: str("url"),
      requestedUrl: str("requestedUrl"),
    };
  } catch {
    return {};
  }
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

    // 1. Normalize and SSRF-check what the user typed. Every rejection has
    //    friendly copy already written in the toolkit.
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) {
      return json({
        error: URL_REJECTION_MESSAGES[resolved.reason],
        errorCode: "invalid-url",
      });
    }

    // 2. The cache comes before the rate limiter: serving a stored capture
    //    costs us nothing, so it should not spend anyone's hourly budget.
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: resolved.url,
      version: RESULT_VERSION,
    });

    if (refresh) {
      await invalidateCache(cacheKey);
    } else {
      const hit = await readCache<ScreenshotResult>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({ ...hit.data, cached: true, ageSeconds: hit.ageSeconds });
      }
    }

    // 3. Rate limit per IP. The limiter fails open by design, and its
    //    message says exactly when to come back.
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

    // 4. There is no in-repo fallback for this one. A headless browser is not
    //    something the marketing site runs, so an unconfigured backend is
    //    stated plainly rather than dressed up as a site problem.
    if (!isBackendConfigured()) {
      return json({
        error:
          "The screenshot service is not switched on in this environment. Try the hosted tool at usesuperflow.ai instead.",
        errorCode: "not-configured",
      });
    }

    // 5. Run it. The client forwards the caller IP so the backend's own
    //    per-IP budget sees the visitor rather than this server, and hides
    //    the start-and-poll round trip behind one promise.
    const run = await runToolViaBackend({
      toolId: TOOL_ID,
      url: resolved.url,
      clientIp: ip,
    });

    if (!run.ok) {
      // The backend writes its refusals for end users, including the
      // budget-exhausted one. Pass its own words through untouched.
      return json({
        requestedUrl: resolved.url,
        error: run.message,
        errorCode: run.code,
      });
    }

    const report = toReport(run.data);

    // 6. A terminal run with no image is not a capture. Saying so beats
    //    rendering an empty frame and letting the visitor wonder.
    if (!report.imageUrl) {
      return json({
        requestedUrl: resolved.url,
        error:
          "The capture finished but no image came back. Try again in a moment, and try a different page if it keeps happening.",
        errorCode: "no-image",
      });
    }

    const result: ScreenshotResult = {
      ...report,
      url: report.url ?? resolved.url,
      requestedUrl: report.requestedUrl ?? resolved.url,
      capturedAt: new Date().toISOString(),
    };

    // 7. Cache for one hour, not a day. The link inside this payload dies on
    //    its own schedule, so the cache must expire well before it does.
    await writeCache(cacheKey, RESULT_VERSION, result, CACHE_TTL.screenshot);
    const finalKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: result.url,
      version: RESULT_VERSION,
    });
    if (finalKey !== cacheKey) {
      await writeCache(finalKey, RESULT_VERSION, result, CACHE_TTL.screenshot);
    }

    return json({ ...result, cached: false, ageSeconds: 0 });
  } catch {
    return json({
      error:
        "Something went wrong on our side taking the screenshot. Try again in a moment.",
      errorCode: "internal",
    });
  }
}
