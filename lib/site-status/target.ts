// URL normalisation shared by the /tool/status landing form (client) and the
// /tool/status/[...site] result page (server). Keep this file free of Node
// imports so the client bundle can use it.

/** A validated website to check, in both URL and route-segment form. */
export interface StatusTarget {
  /** Hostname plus optional port, lowercased, e.g. "www.example.com". */
  host: string;
  /** Path under the host, always starting with "/", e.g. "/pricing". */
  path: string;
  /** Route segments for /tool/status/<...site>, e.g. ["www.example.com", "pricing"]. */
  segments: string[];
  /** Human-readable label, e.g. "www.example.com/pricing". */
  label: string;
}

const MAX_HOST_LENGTH = 253;
const MAX_PATH_LENGTH = 512;
const HOSTNAME_RE =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Normalise whatever a visitor typed (a bare domain, a full URL, a URL with
 * a path) into a {@link StatusTarget}. Returns null when the input is not a
 * public-looking website address.
 *
 * @param input - Raw text from the form or the URL segments joined with "/".
 */
export function parseStatusTarget(input: string): StatusTarget | null {
  try {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase();
    if (hostname.length > MAX_HOST_LENGTH) return null;
    if (!isPublicLookingHostname(hostname)) return null;

    const host = url.port ? `${hostname}:${url.port}` : hostname;
    const path = normalisePath(url.pathname);
    if (path.length > MAX_PATH_LENGTH) return null;

    const segments = [
      host,
      ...path
        .split("/")
        .filter(Boolean)
        .map((segment) => decodeSafely(segment)),
    ];

    return {
      host,
      path,
      segments,
      label: path === "/" ? host : `${host}${path}`,
    };
  } catch {
    return null;
  }
}

/**
 * Build the /tool/status route for a target.
 *
 * @param target - A parsed target.
 */
export function statusPathFor(target: StatusTarget): string {
  try {
    return `/tool/status/${target.segments
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`;
  } catch {
    return "/tool/status";
  }
}

/**
 * Reject hostnames that cannot be a public website: bare words such as
 * "localhost", IP literals in private or loopback ranges, and anything
 * that is not a valid DNS name. Public IPv4 literals are allowed.
 *
 * @param hostname - Lowercased hostname with no port.
 */
export function isPublicLookingHostname(hostname: string): boolean {
  try {
    if (hostname.startsWith("[")) return false; // IPv6 literals are not supported.
    const ipv4 = hostname.match(IPV4_RE);
    if (ipv4) {
      const octets = ipv4.slice(1).map(Number);
      if (octets.some((octet) => octet > 255)) return false;
      return !isPrivateIPv4(octets);
    }
    if (!HOSTNAME_RE.test(hostname)) return false;
    if (hostname.endsWith(".localhost") || hostname.endsWith(".local")) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * True when the IPv4 address is loopback, link-local, private, carrier-grade
 * NAT, or otherwise not routable on the public internet.
 *
 * @param octets - Four numeric octets.
 */
export function isPrivateIPv4(octets: number[]): boolean {
  try {
    const [a, b] = octets;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true; // multicast + reserved
    return false;
  } catch {
    return true;
  }
}

/**
 * True when an IPv6 address (as returned by DNS) is loopback, link-local,
 * unique-local, unspecified, or an IPv4-mapped private address.
 *
 * @param address - Textual IPv6 address.
 */
export function isPrivateIPv6(address: string): boolean {
  try {
    const lower = address.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    const mapped = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (mapped) {
      const octets = mapped[1].split(".").map(Number);
      return isPrivateIPv4(octets);
    }
    return false;
  } catch {
    return true;
  }
}

function normalisePath(pathname: string): string {
  try {
    const collapsed = pathname.replace(/\/{2,}/g, "/");
    if (collapsed === "" || collapsed === "/") return "/";
    return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
  } catch {
    return "/";
  }
}

function decodeSafely(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
