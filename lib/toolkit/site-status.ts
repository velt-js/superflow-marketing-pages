// Website status engine for the free Website Status Checker.
//
// One live request, no cache: the whole point of the tool is "is it up RIGHT
// NOW", so a 24 hour cache would answer the wrong question. Everything that
// touches the network goes through the toolkit fetcher so this tool inherits
// the same SSRF guard on every redirect hop, the same timeout, and the same
// byte cap as every other tool.
//
// VERDICT RULE
//
// Up means the server answered with any HTTP status below 500. A 403 or a
// 404 is still a live server: bot protection and a missing page are not
// outages. A 5xx, a timeout, a refused connection, or a redirect we could not
// follow counts as down.
//
// SCHEME FALLBACK
//
// The URL guard assumes https when the visitor types a bare domain. A site
// that only serves http refuses that connection outright, so a `network`
// failure on https is retried once on http. A timeout is not retried: the
// host is there and slow, and http would not be faster.

import dns from "node:dns";
import net from "node:net";
import { fetchUrl } from "./fetcher";
import {
  isInternalHostname,
  isPubliclyRoutable,
  normalizeUrl,
  URL_REJECTION_MESSAGES,
  type UrlRejection,
} from "./url";
import type { SiteStatusReport } from "@/lib/tools/website-status/shared";
import { STATUS_TIMEOUT_MS } from "@/lib/tools/website-status/shared";

export type {
  SiteStatusDownReason,
  SiteStatusReport,
  SiteStatusVerdict,
} from "@/lib/tools/website-status/shared";
export {
  DOWN_REASON_MESSAGES,
  STATUS_TIMEOUT_MS,
  STATUS_TOOL_PATH,
  describeReport,
  labelForUrl,
  statusPagePathFor,
  urlFromStatusSegments,
} from "@/lib/tools/website-status/shared";

/** We only need headers; 1 KB keeps a huge page from costing anything. */
const MAX_BODY_BYTES = 1024;

/**
 * The toolkit's rejection copy, with the one line that names AI crawlers
 * reworded: that message was written for the visibility checker, and a
 * visitor asking whether a site is up has no crawler in mind.
 */
export const STATUS_REJECTION_MESSAGES: Record<UrlRejection, string> = {
  ...URL_REJECTION_MESSAGES,
  "not-publicly-routable":
    "That address is on a private network, so it cannot be checked from here.",
};

export type StatusTargetResolution =
  | { ok: true; url: string }
  /** Not a URL this tool will touch: malformed, private, credentials, etc. */
  | { ok: false; kind: "rejected"; reason: UrlRejection }
  /** A well-formed public-looking host that DNS cannot resolve. */
  | { ok: false; kind: "unresolvable"; url: string };

/**
 * Normalizes and SSRF-checks a visitor's URL, like `resolveUserUrl`, but
 * tells an UNRESOLVABLE host apart from a PRIVATE one.
 *
 * The toolkit guard treats both as "not publicly routable", which is right
 * for a checker that needs the page's HTML: there is nothing to read either
 * way. For this tool the two are different answers. A private address is
 * refused; a domain that does not resolve IS the verdict, because "the site
 * is down" is exactly what a visitor with an expired domain needs to hear.
 *
 * @param rawUrl - Whatever the visitor typed.
 */
export async function resolveStatusTarget(rawUrl: string): Promise<StatusTargetResolution> {
  try {
    const normalized = normalizeUrl(rawUrl);
    if (!normalized.ok) {
      return { ok: false, kind: "rejected", reason: normalized.reason };
    }

    // Internal names are refused before any lookup, exactly as the guard
    // does: resolving them would turn this tool into an oracle for which
    // names exist in the server's own resolver.
    if (isInternalHostname(normalized.hostname)) {
      return { ok: false, kind: "rejected", reason: "not-publicly-routable" };
    }

    if (!net.isIP(normalized.hostname)) {
      try {
        await dns.promises.lookup(normalized.hostname, { all: true });
      } catch {
        return { ok: false, kind: "unresolvable", url: normalized.url };
      }
    }

    // The guard resolves again and checks every address. The second lookup
    // is served from the resolver cache; the duplication buys a guard that
    // stays a byte-for-byte port of the backend's, which is worth more.
    if (!(await isPubliclyRoutable(normalized.url))) {
      return { ok: false, kind: "rejected", reason: "not-publicly-routable" };
    }

    return { ok: true, url: normalized.url };
  } catch {
    return { ok: false, kind: "rejected", reason: "malformed" };
  }
}

/**
 * The report for a host DNS could not resolve: down, with no response.
 *
 * @param url - The normalized URL that was asked about.
 */
export function unresolvableReport(url: string): SiteStatusReport {
  return {
    verdict: "down",
    reason: "dns",
    responseTimeMs: 0,
    requestedUrl: url,
    finalUrl: url,
    redirectCount: 0,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Runs one live check against an already normalized and SSRF-checked URL.
 *
 * Never throws. A failure to connect is a verdict, not an error.
 *
 * @param url - A URL that has been through `resolveUserUrl`.
 */
export async function checkSiteStatus(url: string): Promise<SiteStatusReport> {
  const checkedAt = new Date().toISOString();
  try {
    const first = await probe(url);
    if (first.ok || first.reason !== "network" || !url.startsWith("https://")) {
      return toReport(first, url, checkedAt);
    }

    const httpUrl = `http://${url.slice("https://".length)}`;
    const second = await probe(httpUrl);
    if (!second.ok && second.reason === "network") {
      // Both schemes refused. Report the https attempt, which is the one a
      // visitor's browser makes first.
      return toReport(first, url, checkedAt);
    }
    return toReport(second, httpUrl, checkedAt);
  } catch {
    return {
      verdict: "down",
      reason: "network",
      responseTimeMs: 0,
      requestedUrl: url,
      finalUrl: url,
      redirectCount: 0,
      checkedAt,
    };
  }
}

type Probe = Awaited<ReturnType<typeof fetchUrl>>;

/**
 * One GET through the toolkit fetcher. GET rather than HEAD on purpose: CDN
 * bot rules often apply to GET and pass HEAD, and a status page that says
 * "up" for a site every browser is blocked from is wrong.
 *
 * @param url - The URL to request.
 */
function probe(url: string): Promise<Probe> {
  return fetchUrl({
    url,
    method: "GET",
    timeoutMs: STATUS_TIMEOUT_MS,
    maxBytes: MAX_BODY_BYTES,
  });
}

function toReport(probe: Probe, requestedUrl: string, checkedAt: string): SiteStatusReport {
  try {
    if (probe.ok) {
      const isUp = probe.status < 500;
      return {
        verdict: isUp ? "up" : "down",
        ...(isUp ? {} : { reason: "server-error" as const }),
        httpStatus: probe.status,
        responseTimeMs: probe.durationMs,
        requestedUrl,
        finalUrl: probe.finalUrl,
        redirectCount: probe.redirects.length,
        checkedAt,
      };
    }
    return {
      verdict: "down",
      reason: probe.reason,
      ...(typeof probe.status === "number" ? { httpStatus: probe.status } : {}),
      responseTimeMs: probe.durationMs,
      requestedUrl,
      finalUrl: probe.finalUrl,
      redirectCount: probe.redirects.length,
      checkedAt,
    };
  } catch {
    return {
      verdict: "down",
      reason: "network",
      responseTimeMs: 0,
      requestedUrl,
      finalUrl: requestedUrl,
      redirectCount: 0,
      checkedAt,
    };
  }
}
