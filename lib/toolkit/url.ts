// URL normalization + SSRF guard for the free-tools check engine.
//
// Every tool that fetches a user-supplied URL server-side MUST route the
// input through `normalizeUrl` and then `assertPubliclyRoutable` before any
// network call. Skipping either turns a public, unauthenticated tool into an
// open proxy into our own VPC and the cloud metadata endpoint.
//
// The guard logic is deliberately a straight port of the production
// implementation in the backend repo
// (`functions/src/superflow-v2/services/preview-session.service.ts`,
// `isPubliclyRoutableUrl` / `isPrivateAddress`) so the two surfaces cannot
// drift into disagreeing about what "internal" means. Known residual risk,
// same as the backend: DNS rebinding between this check and the fetch.

import dns from "node:dns";
import net from "node:net";

/** Hostname suffixes that are internal by convention and never fetched. */
const INTERNAL_HOST_SUFFIXES = [".localhost", ".local", ".internal"] as const;

/** Matches a hostname that looks like a real registrable domain. */
const PLAUSIBLE_HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

/** Why a URL was rejected. Surfaced to the UI as a friendly message. */
export type UrlRejection =
  | "empty"
  | "malformed"
  | "unsupported-scheme"
  | "embedded-credentials"
  | "implausible-hostname"
  | "not-publicly-routable";

export type NormalizeResult =
  | { ok: true; url: string; hostname: string }
  | { ok: false; reason: UrlRejection };

/** Human-facing copy for each rejection. Plain words, no em dashes. */
export const URL_REJECTION_MESSAGES: Record<UrlRejection, string> = {
  empty: "Enter a URL to check.",
  malformed:
    "That does not look like a valid URL. Try something like yourwebsite.com.",
  "unsupported-scheme": "Only http and https URLs can be checked.",
  "embedded-credentials":
    "Remove the username and password from the URL, then try again.",
  "implausible-hostname":
    "That does not look like a valid domain. Try something like yourwebsite.com.",
  "not-publicly-routable":
    "That address is not reachable from the public internet, so there is nothing for AI crawlers to see.",
};

/**
 * Normalizes raw user input into an absolute http(s) URL.
 *
 * Adds `https://` when the scheme is missing, strips the fragment (never sent
 * to a server, and it would split the cache key for no reason), and rejects
 * embedded credentials and implausible hostnames.
 *
 * This does NOT perform the SSRF check. Call `assertPubliclyRoutable` on the
 * result before fetching.
 *
 * @param rawUrl - Whatever the user typed.
 * @returns The normalized URL, or the reason it was rejected.
 */
export function normalizeUrl(rawUrl: string): NormalizeResult {
  try {
    const trimmed = (rawUrl ?? "").trim();
    if (trimmed.length === 0) {
      return { ok: false, reason: "empty" };
    }

    const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    let url: URL;
    try {
      url = new URL(withScheme);
    } catch {
      return { ok: false, reason: "malformed" };
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { ok: false, reason: "unsupported-scheme" };
    }
    if (url.username || url.password) {
      return { ok: false, reason: "embedded-credentials" };
    }

    // IP literals are allowed through this stage so the SSRF guard can give
    // the accurate "not publicly routable" reason instead of a misleading
    // "not a valid domain".
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (!net.isIP(hostname) && !PLAUSIBLE_HOSTNAME.test(hostname)) {
      return { ok: false, reason: "implausible-hostname" };
    }

    url.hash = "";

    return { ok: true, url: url.toString(), hostname };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}

/**
 * True for loopback / private / link-local / cloud-metadata / reserved
 * addresses. Errors resolve to `true` (block) so a parsing surprise can never
 * open the guard.
 *
 * @param address - An IPv4 or IPv6 literal.
 */
function isPrivateAddress(address: string): boolean {
  try {
    const ip = address.toLowerCase();

    if (net.isIPv6(ip)) {
      const v4Mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
      if (v4Mapped) {
        return isPrivateAddress(v4Mapped[1]);
      }
      return (
        ip === "::1" ||
        ip === "::" ||
        ip.startsWith("fe80:") ||
        ip.startsWith("fc") ||
        ip.startsWith("fd")
      );
    }

    const octets = ip.split(".").map((part) => Number(part));
    if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
      return true;
    }

    const [a, b] = octets;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast + reserved
    return false;
  } catch {
    return true;
  }
}

/**
 * SSRF guard. Blocks internal hostnames outright, then resolves DNS and
 * rejects the URL if ANY resolved address is private, loopback, link-local,
 * or the cloud metadata range.
 *
 * Unresolvable hosts are treated as blocked: they are unreachable anyway, and
 * failing open here would be the one mistake worth avoiding.
 *
 * @param urlString - A URL already through `normalizeUrl`.
 * @returns True when the host is safe to fetch server-side.
 */
export async function isPubliclyRoutable(urlString: string): Promise<boolean> {
  try {
    const url = new URL(urlString);
    // `URL.hostname` keeps the brackets on IPv6 literals ("[::1]"), which
    // would make `net.isIP` miss and fall through to a DNS lookup that can
    // never resolve. Strip them first.
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    if (
      hostname === "localhost" ||
      INTERNAL_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
    ) {
      return false;
    }

    if (net.isIP(hostname)) {
      return !isPrivateAddress(hostname);
    }

    const records = await dns.promises.lookup(hostname, {
      all: true,
      verbatim: true,
    });
    if (!records.length) {
      return false;
    }
    return records.every((record) => !isPrivateAddress(record.address));
  } catch {
    return false;
  }
}

/**
 * Normalizes and SSRF-checks in one call. The single entry point every tool
 * route should use on user-supplied URLs.
 *
 * @param rawUrl - Whatever the user typed.
 */
export async function resolveUserUrl(rawUrl: string): Promise<NormalizeResult> {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized.ok) {
    return normalized;
  }
  const routable = await isPubliclyRoutable(normalized.url);
  if (!routable) {
    return { ok: false, reason: "not-publicly-routable" };
  }
  return normalized;
}

/**
 * The site root (scheme + host) for a URL, used to locate robots.txt,
 * llms.txt, and sitemap.xml.
 *
 * @param urlString - Any absolute URL.
 * @returns The origin with a trailing slash, or "" when unparseable.
 */
export function originOf(urlString: string): string {
  try {
    return `${new URL(urlString).origin}/`;
  } catch {
    return "";
  }
}

/**
 * Cache key for a URL: origin + path + sorted query, lowercased host, no
 * fragment. Two spellings of the same page share one cache entry.
 *
 * @param urlString - Any absolute URL.
 */
export function cacheKeyFor(urlString: string): string {
  try {
    const url = new URL(urlString);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    url.searchParams.sort();
    // A trailing slash on the root is noise; anywhere else it is meaningful.
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.protocol}//${url.host}${path}${url.search}`;
  } catch {
    return urlString;
  }
}
