// Favicon Checker API.
//
// POST /api/tools/favicon-checker
//   { "url": "example.com", "refresh": false }
//
// Fetches the page, reads every icon declaration out of the HTML, then
// fetches each declared icon, the web app manifest, and /favicon.ico and
// reads what they really are. The engine is lib/toolkit/favicon.ts.
//
// Envelope: every response is HTTP 200 JSON. Failures carry `error` with
// ready-to-render plain words plus a machine `errorCode`; there is never a
// bare 500 and never a stack trace. This endpoint backs a no-login public
// tool, so an unhandled error is a stranger's first impression of Superflow.
//
// RATE TIER
//
// `light`, same as the Tech Stack Detector, even though a run makes more than
// one request. The extra requests are for a handful of files that are almost
// always kilobytes at the same origin, with a hard cap on how many we will
// fetch, so a run is closer to loading a page than to a crawl. There is no
// render and no model call, which is what the heavy tier exists to meter.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// blocking /tools/, where the human-facing page lives.

import type { NextRequest } from "next/server";
import { checkFavicons, type FaviconReport } from "@/lib/toolkit/favicon";
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

const TOOL_SLUG = "favicon-checker";

/** Fetch and parse only, so the generous per-IP budget applies. */
const RATE_TIER = "light" as const;

/** Bump when the result shape changes so stale cache entries are ignored. */
const RESULT_VERSION = 1;

/** Statuses that mean a bot blocker answered instead of the site. */
const BLOCKED_STATUSES = new Set([403, 406, 429]);

/**
 * We only need `<head>`, and it is always at the top. Reading 512 KB instead
 * of the fetcher's 5 MB default keeps a run cheap on image-heavy pages whose
 * markup runs to megabytes below the fold.
 */
const MAX_HTML_BYTES = 512 * 1024;

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
export const runtime = "nodejs";

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** The successful result. Also exactly what the 24 hour cache stores. */
type FaviconResult = FaviconReport & {
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

    // 1. Normalize and SSRF-check what the user typed. Every rejection has
    //    friendly copy already written in the toolkit.
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) {
      return json({
        error: URL_REJECTION_MESSAGES[resolved.reason],
        errorCode: "invalid-url",
      });
    }

    // 2. Rate limit per IP. The limiter fails open by design, and its
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

    // 3. The 24 hour cache, keyed on the normalized URL so `example.com`,
    //    `https://example.com`, and `https://example.com/` share one entry.
    const cacheKey = toolCacheKey({
      tool: TOOL_SLUG,
      url: resolved.url,
      version: RESULT_VERSION,
    });

    if (refresh) {
      await invalidateCache(cacheKey);
    } else {
      const hit = await readCache<FaviconResult>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({ ...hit.data, cached: true, ageSeconds: hit.ageSeconds });
      }
    }

    // 4. Fetch the page. The toolkit fetcher re-checks every redirect hop
    //    against the SSRF guard, caps the body, and never throws.
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

    // 5. Bot protection answered, not the site. The HTML we hold is the
    //    blocker's challenge page. Its <head> has no icon links, and running
    //    the checks against it would report a site with a perfectly good
    //    favicon as having none at all. Better to say what happened.
    if (BLOCKED_STATUSES.has(fetched.status)) {
      return json({
        requestedUrl: resolved.url,
        url: fetched.finalUrl,
        fetchedAt,
        error: `The site blocked our request with HTTP ${fetched.status}. This is usually bot protection in front of the site, not a missing favicon. We could not read the page's HTML, so there was nothing to check.`,
        errorCode: "blocked",
      });
    }

    // 6. Run the engine. It owns every request after this one: the icons,
    //    the manifest, and the implicit /favicon.ico.
    const report = await checkFavicons({
      html: fetched.body,
      url: fetched.finalUrl,
    });

    const result: FaviconResult = {
      requestedUrl: resolved.url,
      url: fetched.finalUrl,
      ...report,
      status: fetched.status,
      fetchedAt,
    };

    // 7. Cache under the key derived from what the user typed AND, when they
    //    differ, under the post-redirect URL, so `example.com` and
    //    `www.example.com` do not each pay for a run.
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
