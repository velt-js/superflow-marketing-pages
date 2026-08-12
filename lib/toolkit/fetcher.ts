// Server-side fetch for the free-tools check engine.
//
// Wraps `fetch` with the four things every tool needs and none of them should
// reimplement: a configurable user agent (the firewall test depends on it), a
// recorded redirect chain, a hard timeout, and a byte cap.
//
// Redirects are followed MANUALLY rather than by `fetch`'s own `redirect:
// "follow"`. Two reasons, and the second is the important one:
//
//   1. We need the chain itself. T1 reports it, and a check that runs against
//      the wrong URL is worse than no check.
//   2. Every hop has to go back through the SSRF guard. `http://evil.com`
//      returning `302 -> http://127.0.0.1:8080/` is the standard way to walk
//      past a guard that only validated the URL the user typed.

import { BROWSER_USER_AGENT } from "./bots";
import { isPubliclyRoutable } from "./url";

/** Default ceiling on a single fetch, including all redirect hops. */
const DEFAULT_TIMEOUT_MS = 10_000;

/** Default cap on the response body we will read into memory. */
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

/** Default cap on redirect hops before we give up. */
const DEFAULT_MAX_REDIRECTS = 5;

/** Status codes that carry a `Location` header. */
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export type RedirectHop = {
  from: string;
  to: string;
  status: number;
};

export type FetchOptions = {
  url: string;
  /** Defaults to a realistic desktop Chrome UA. */
  userAgent?: string;
  method?: "GET" | "HEAD";
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  /** Extra request headers. `User-Agent` here is overridden by `userAgent`. */
  headers?: Record<string, string>;
};

export type FetchFailureReason =
  | "timeout"
  | "network"
  | "too-many-redirects"
  | "redirect-blocked"
  | "invalid-redirect";

export type FetchResult =
  | {
      ok: true;
      status: number;
      /** Lowercased header names. */
      headers: Record<string, string>;
      /** The URL the body actually came from, after redirects. */
      finalUrl: string;
      redirects: RedirectHop[];
      body: string;
      /** True when the body hit `maxBytes` and was cut short. */
      truncated: boolean;
      bytes: number;
      durationMs: number;
    }
  | {
      ok: false;
      reason: FetchFailureReason;
      /** Present when we got far enough to see a status. */
      status?: number;
      finalUrl: string;
      redirects: RedirectHop[];
      durationMs: number;
    };

/**
 * Flattens a `Headers` object into a plain lowercased-key record.
 *
 * @param headers - The response headers.
 */
function toRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  try {
    headers.forEach((value, key) => {
      record[key.toLowerCase()] = value;
    });
  } catch {
    // A malformed header set is not worth failing the whole check over.
  }
  return record;
}

/**
 * Reads a response body up to `maxBytes`, decoding as UTF-8.
 *
 * Streams so an attacker cannot exhaust memory by advertising a small
 * `Content-Length` and then sending gigabytes.
 *
 * @param response - The response to drain.
 * @param maxBytes - Hard ceiling on bytes read.
 */
async function readCapped(
  response: Response,
  maxBytes: number,
): Promise<{ body: string; truncated: boolean; bytes: number }> {
  try {
    if (!response.body) {
      const text = await response.text();
      const bytes = Buffer.byteLength(text, "utf8");
      return bytes > maxBytes
        ? { body: text.slice(0, maxBytes), truncated: true, bytes: maxBytes }
        : { body: text, truncated: false, bytes };
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let truncated = false;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      if (total + value.byteLength > maxBytes) {
        chunks.push(value.subarray(0, maxBytes - total));
        total = maxBytes;
        truncated = true;
        try {
          await reader.cancel();
        } catch {
          // Already closed. Nothing to do.
        }
        break;
      }

      chunks.push(value);
      total += value.byteLength;
    }

    return {
      body: new TextDecoder("utf-8").decode(Buffer.concat(chunks)),
      truncated,
      bytes: total,
    };
  } catch {
    return { body: "", truncated: false, bytes: 0 };
  }
}

/**
 * Fetches a URL with a controlled user agent, a recorded redirect chain, a
 * timeout, and a byte cap.
 *
 * Every redirect target is re-validated against the SSRF guard, so a public
 * URL cannot bounce the request onto an internal address.
 *
 * Never throws. Failures come back as `{ ok: false, reason }`.
 *
 * @param options - The fetch parameters.
 */
export async function fetchUrl(options: FetchOptions): Promise<FetchResult> {
  const {
    url,
    userAgent = BROWSER_USER_AGENT,
    method = "GET",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxBytes = DEFAULT_MAX_BYTES,
    maxRedirects = DEFAULT_MAX_REDIRECTS,
    headers: extraHeaders = {},
  } = options;

  const startedAt = Date.now();
  const redirects: RedirectHop[] = [];
  let currentUrl = url;

  // One controller for the whole chain: the timeout is a budget for the
  // entire operation, not per hop, so a redirect loop cannot stall us for
  // maxRedirects * timeoutMs.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let hop = 0; hop <= maxRedirects; hop += 1) {
      let response: Response;
      try {
        response = await fetch(currentUrl, {
          method,
          redirect: "manual",
          signal: controller.signal,
          headers: {
            // Spread first so `User-Agent` and `Accept` below win.
            ...extraHeaders,
            "User-Agent": userAgent,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });
      } catch (error) {
        const aborted =
          error instanceof Error &&
          (error.name === "AbortError" || error.name === "TimeoutError");
        return {
          ok: false,
          reason: aborted ? "timeout" : "network",
          finalUrl: currentUrl,
          redirects,
          durationMs: Date.now() - startedAt,
        };
      }

      if (!REDIRECT_STATUSES.has(response.status)) {
        const { body, truncated, bytes } =
          method === "HEAD"
            ? { body: "", truncated: false, bytes: 0 }
            : await readCapped(response, maxBytes);

        return {
          ok: true,
          status: response.status,
          headers: toRecord(response.headers),
          finalUrl: currentUrl,
          redirects,
          body,
          truncated,
          bytes,
          durationMs: Date.now() - startedAt,
        };
      }

      const location = response.headers.get("location");
      if (!location) {
        // A 3xx with no Location is a dead end, not a redirect. Report the
        // status as the result rather than inventing a failure.
        return {
          ok: true,
          status: response.status,
          headers: toRecord(response.headers),
          finalUrl: currentUrl,
          redirects,
          body: "",
          truncated: false,
          bytes: 0,
          durationMs: Date.now() - startedAt,
        };
      }

      let nextUrl: string;
      try {
        nextUrl = new URL(location, currentUrl).toString();
      } catch {
        return {
          ok: false,
          reason: "invalid-redirect",
          status: response.status,
          finalUrl: currentUrl,
          redirects,
          durationMs: Date.now() - startedAt,
        };
      }

      // The guard that matters: a public host redirecting inward.
      const routable = await isPubliclyRoutable(nextUrl);
      if (!routable) {
        return {
          ok: false,
          reason: "redirect-blocked",
          status: response.status,
          finalUrl: nextUrl,
          redirects,
          durationMs: Date.now() - startedAt,
        };
      }

      redirects.push({ from: currentUrl, to: nextUrl, status: response.status });
      currentUrl = nextUrl;
    }

    return {
      ok: false,
      reason: "too-many-redirects",
      finalUrl: currentUrl,
      redirects,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches a URL and returns its status only, without reading the body.
 * Used by the firewall test (check A2), which compares status codes across
 * two user agents and does not care what the page says.
 *
 * Uses GET rather than HEAD on purpose: bot-blocking rules at the CDN layer
 * frequently apply to GET and pass HEAD, which would make the probe report a
 * false pass. The byte cap keeps the cost of that decision small.
 *
 * @param url - The URL to probe.
 * @param userAgent - The user agent to probe with.
 * @param timeoutMs - Optional timeout override.
 */
export async function probeStatus(
  url: string,
  userAgent: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ status: number | null; finalUrl: string; blocked: boolean }> {
  try {
    const result = await fetchUrl({
      url,
      userAgent,
      timeoutMs,
      // Enough to tell a challenge page from a real one without paying for
      // the full document.
      maxBytes: 64 * 1024,
    });

    if (!result.ok) {
      return { status: null, finalUrl: result.finalUrl, blocked: false };
    }

    return {
      status: result.status,
      finalUrl: result.finalUrl,
      blocked: result.status === 403 || result.status === 406 || result.status === 429,
    };
  } catch {
    return { status: null, finalUrl: url, blocked: false };
  }
}
