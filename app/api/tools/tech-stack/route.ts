// Tech Stack Detector API.
//
// POST /api/tools/tech-stack
//   { "url": "example.com", "refresh": false }
//
// Exposes lib/toolkit/detect.ts as its own tool: one capped fetch of the
// submitted page, then fingerprint matching on the HTML and headers. No
// render, no crawl, no LLM, which is why this sits on the light rate tier.
//
// Envelope: every response is HTTP 200 JSON. Failures carry `error` with
// ready-to-render plain words plus a machine `errorCode`; there is never a
// bare 500 and never a stack trace. This endpoint backs a no-login public
// tool, so an unhandled error is a stranger's first impression of Superflow.
//
// A bot-blocked fetch (403/406/429) is reported as exactly that, not as "we
// found nothing". The challenge page we received belongs to the blocker, not
// the site, so detection runs on the response headers alone. That still
// surfaces the CDN doing the blocking, which is honest and useful.
//
// Lives under /api/ so it inherits the existing robots.txt disallow without
// blocking /tools/, where the human-facing page lives.

import type { NextRequest } from "next/server";
import { detect, type DetectionResult } from "@/lib/toolkit/detect";
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
import { cacheVersionFor } from "@/lib/tools/share/cache-versions";

const TOOL_SLUG = "tech-stack-detector";

/** Fetch and parse only, so the generous per-IP budget applies. */
const RATE_TIER = "light" as const;

/**
 * The version this tool's cache entries carry.
 *
 * Read from the shared table rather than declared here: the Open Graph card
 * and the badge endpoint read these same entries, and a version bumped in one
 * place and not the other fails silently. Bump it in
 * lib/tools/share/cache-versions.ts.
 */
const RESULT_VERSION = cacheVersionFor(TOOL_SLUG);

/** Statuses that mean a bot blocker answered instead of the site. */
const BLOCKED_STATUSES = new Set([403, 406, 429]);

/** Node runtime: the SSRF guard needs `node:dns` and `node:net`. */
export const runtime = "nodejs";

/** Never cache the handler itself. Result caching is explicit, in KV. */
export const dynamic = "force-dynamic";

/** The successful result. Also exactly what the 24 hour cache stores. */
type TechStackResult = DetectionResult & {
  /** The URL detection actually ran against, after redirects. */
  url: string;
  /** The submitted URL after normalization. */
  requestedUrl: string;
  /** HTTP status of the final response. */
  status: number;
  /** True when the page was larger than the read cap. */
  truncated: boolean;
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
      const hit = await readCache<TechStackResult>(cacheKey, RESULT_VERSION);
      if (hit) {
        return json({ ...hit.data, cached: true, ageSeconds: hit.ageSeconds });
      }
    }

    // 4. Fetch the page. The toolkit fetcher defaults to a realistic browser
    //    user agent, re-checks every redirect hop against the SSRF guard,
    //    caps the body, and never throws.
    const fetched = await fetchUrl({ url: resolved.url });
    const fetchedAt = new Date().toISOString();

    if (!fetched.ok) {
      return json({
        requestedUrl: resolved.url,
        url: fetched.finalUrl,
        fetchedAt,
        error:
          FETCH_FAILURE_MESSAGES[fetched.reason] ?? FETCH_FAILURE_MESSAGES.network,
        errorCode: fetched.reason,
      });
    }

    // 5. Bot protection answered, not the site. The HTML we hold is the
    //    blocker's challenge page, so matching fingerprints against it would
    //    invent findings. Headers are still the blocker's honest signature.
    if (BLOCKED_STATUSES.has(fetched.status)) {
      const headerDetection = detect({
        html: "",
        headers: fetched.headers,
        url: fetched.finalUrl,
      });
      return json({
        requestedUrl: resolved.url,
        url: fetched.finalUrl,
        ...headerDetection,
        status: fetched.status,
        truncated: false,
        fetchedAt,
        error: `The site blocked our request with HTTP ${fetched.status}. This is usually bot protection in front of the site, not an empty site. We could not read the page, so anything listed comes from the response headers alone.`,
        errorCode: "blocked",
      });
    }

    // 6. Run the detection engine. Any other status, including a 404 or a
    //    500, still ships HTML rendered by the real stack, so detection on
    //    it is meaningful. The status is returned so the UI can say so.
    const detection = detect({
      html: fetched.body,
      headers: fetched.headers,
      url: fetched.finalUrl,
    });

    const result: TechStackResult = {
      requestedUrl: resolved.url,
      url: fetched.finalUrl,
      ...detection,
      status: fetched.status,
      truncated: fetched.truncated,
      fetchedAt,
    };

    // 7. Cache under the key derived from what the user typed AND, when they
    //    differ, under the post-redirect URL, so `example.com` and
    //    `www.example.com` do not each pay for a fetch.
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
        "Something went wrong on our side running the detection. Try again in a moment.",
      errorCode: "internal",
    });
  }
}
