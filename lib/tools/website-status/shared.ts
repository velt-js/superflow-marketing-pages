// Browser-safe half of the Website Status Checker: the report type, the copy
// for each verdict, and the mapping between a URL and its status page.
//
// Nothing in here may import the toolkit's fetcher or URL guard: both pull in
// `node:dns`, and this file is bundled into the client tool. The server
// engine in lib/toolkit/site-status.ts re-exports what it shares.

export type SiteStatusVerdict = "up" | "down";

export type SiteStatusDownReason =
  | "timeout"
  | "network"
  | "too-many-redirects"
  | "redirect-blocked"
  | "invalid-redirect"
  | "server-error";

export type SiteStatusReport = {
  verdict: SiteStatusVerdict;
  /** Why the site counts as down. Absent when it is up. */
  reason?: SiteStatusDownReason;
  /** HTTP status received, when any response arrived. */
  httpStatus?: number;
  /** Time from request start to the final response headers, in milliseconds. */
  responseTimeMs: number;
  /** The URL that was requested, after the https/http fallback. */
  requestedUrl: string;
  /** The URL the final response came from, after redirects. */
  finalUrl: string;
  /** Number of redirect hops followed. */
  redirectCount: number;
  /** When the check ran, ISO 8601. */
  checkedAt: string;
};

/** Whole budget for one check, including every redirect hop. */
export const STATUS_TIMEOUT_MS = 10_000;

/** Path of the tool's own page. */
export const STATUS_TOOL_PATH = "/tools/website-status-checker";

/** Plain-words copy for each way a site can count as down. */
export const DOWN_REASON_MESSAGES: Record<SiteStatusDownReason, string> = {
  "server-error": "The server answered, but with a server error.",
  timeout: `No response within ${STATUS_TIMEOUT_MS / 1000} seconds.`,
  network:
    "The connection could not be made. The domain may not resolve, or the server refused it.",
  "too-many-redirects": "The site kept redirecting and never landed on a page.",
  "redirect-blocked":
    "The site redirected to an address that is not on the public internet, so we stopped there.",
  "invalid-redirect": "The site sent a redirect we could not follow.",
};

/**
 * Visitor-facing sentence for a report.
 *
 * @param report - A finished check.
 */
export function describeReport(report: SiteStatusReport): string {
  try {
    if (report.verdict === "up") {
      const status = report.httpStatus ?? 200;
      if (status >= 400) {
        return `The server is reachable but answered HTTP ${status} for this URL. The site is live; this page may need a sign-in, may be blocking automated requests, or may not exist.`;
      }
      return `The site responded in ${report.responseTimeMs.toLocaleString("en-US")} ms.`;
    }
    if (report.reason === "server-error") {
      return `The server answered with HTTP ${report.httpStatus}.`;
    }
    return DOWN_REASON_MESSAGES[report.reason ?? "network"];
  } catch {
    return report.verdict === "up" ? "The site responded." : "The site did not respond.";
  }
}

/* ---------------------------------------------------------------- Routes */

/**
 * The shareable status page for a URL: `/tools/website-status-checker/<host>/<path...>`.
 * The query string and fragment are dropped; a status page is about a page,
 * not a query. This is only a path builder: the server re-validates and
 * SSRF-checks the URL before any request is made.
 *
 * @param rawUrl - Whatever the visitor typed, or an already normalized URL.
 * @returns The path, or null when the input is not a plausible http(s) URL.
 */
export function statusPagePathFor(rawUrl: string): string | null {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes(".") || hostname.startsWith("[")) return null;
    const host = url.port ? `${hostname}:${url.port}` : hostname;
    const segments = [
      host,
      ...url.pathname
        .split("/")
        .filter(Boolean)
        .map((segment) => safeDecode(segment)),
    ];
    return `${STATUS_TOOL_PATH}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
  } catch {
    return null;
  }
}

/**
 * Rebuilds the URL a status page is about from its route segments: the first
 * segment is the host, the rest is the path. Scheme is left to the engine.
 *
 * @param segments - The catch-all segments, still URL-encoded.
 * @returns A bare `host/path` string for `resolveUserUrl`, or null.
 */
export function urlFromStatusSegments(segments: readonly string[] | undefined): string | null {
  try {
    if (!segments || segments.length === 0) return null;
    const decoded = segments.map((segment) => safeDecode(segment));
    const [host, ...path] = decoded;
    if (!host || host.includes("/")) return null;
    return path.length > 0
      ? `${host}/${path.map((segment) => encodeURIComponent(segment)).join("/")}`
      : host;
  } catch {
    return null;
  }
}

/**
 * The host plus path of a URL, for headings. `https://www.example.com/pricing`
 * reads as `www.example.com/pricing`; a site root reads as the host alone.
 *
 * @param url - Any absolute URL.
 */
export function labelForUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;
    const path = parsed.pathname.replace(/\/+$/, "");
    return path ? `${host}${safeDecode(path)}` : host;
  } catch {
    return url;
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
