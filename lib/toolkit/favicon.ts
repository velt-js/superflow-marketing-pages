// Favicon check engine.
//
// WHAT THIS ANSWERS
//
// Not "is there a <link rel=icon> in the HTML". Every generator emits one, so
// that question passes on sites whose tab is blank. The question that matters
// is whether a browser opening this URL ends up with a real icon, and the two
// come apart constantly:
//
//   * A single-page app serves index.html for every unmatched path, so
//     /favicon.ico answers HTTP 200 with `text/html`. Every "does it 404"
//     checker calls that a pass. The browser gets HTML where it wanted an
//     image and shows the blank page glyph.
//   * The href is right and the file was never deployed, so it 404s on
//     production and works perfectly on the machine of whoever added it.
//   * `sizes="180x180"` is copied from a tutorial and the actual file is the
//     57x57 one from 2013. iOS upscales it and it looks like a thumbnail.
//
// So this engine declares nothing on the strength of the HTML alone. It reads
// every declaration, resolves it, fetches the bytes, sniffs the real format
// from the file header rather than trusting `Content-Type`, and reads the
// real pixel dimensions out of the PNG or ICO header. Findings are things we
// fetched and looked at.
//
// WHY THE DIMENSIONS COME FROM THE BYTES
//
// Three sources claim to know how big an icon is and they disagree routinely:
// the `sizes` attribute in the HTML, the file name, and the file itself. Only
// the third is the truth, and the gap between the first and the third is one
// of the most common real defects this tool finds. Reading it costs a header
// parse over bytes we already hold.

import { fetchUrl } from "./fetcher";
import { decodeEntities } from "./html";
import { isPubliclyRoutable } from "./url";

/** Cap on a single icon read. Real favicons are kilobytes; 2 MB is generous. */
const MAX_ICON_BYTES = 2 * 1024 * 1024;

/** Cap on the manifest read. A manifest larger than this is not a manifest. */
const MAX_MANIFEST_BYTES = 256 * 1024;

/** Per-icon fetch budget. The page fetch already spent from the wall clock. */
const ICON_TIMEOUT_MS = 8_000;

/**
 * Ceiling on icons we fetch in one run.
 *
 * Sites that emit an icon per Apple device size plus a manifest routinely
 * declare fourteen, so a lower cap truncates ordinary sites rather than
 * outliers, and every truncated icon is one the checks below have to hedge
 * about. Twenty covers what real generators produce while still bounding a
 * visitor's click: these are kilobyte files at one origin, fetched in
 * parallel, far short of what loading the site's own homepage costs.
 *
 * Whatever is still dropped is reported in `notFetchedCount` and hedged in
 * the checks, so a partial list is never presented as a complete one.
 */
const MAX_ICONS_FETCHED = 20;

/** Ceiling on manifest icons we pull in, for the same reason. */
const MAX_MANIFEST_ICONS = 6;

/**
 * Fetch order, most important first.
 *
 * The cap above can truncate the list, which makes the ORDER part of the
 * result's correctness rather than a performance detail. Sites that emit an
 * icon per Apple device size declare ten or more, and in document order those
 * push the root /favicon.ico past the cap. It then arrives at the checks
 * unfetched, and a check that cannot distinguish "we did not look" from "it
 * is not there" reports a working file as missing. So the two icons a browser
 * is most likely to actually use are fetched first, and the long tail of
 * device-specific sizes takes whatever slots are left.
 */
const KIND_PRIORITY: Record<IconKind, number> = {
  implicit: 0,
  icon: 1,
  "apple-touch-icon": 2,
  "mask-icon": 3,
  "manifest-icon": 4,
};

/** The path every browser tries when the HTML declares no icon. */
const IMPLICIT_ICON_PATH = "/favicon.ico";

/** Minimum edge a tab icon needs to stay sharp on a retina display. */
const MIN_TAB_EDGE = 32;

/** The edge Apple asks for on a modern iOS home screen icon. */
const APPLE_TOUCH_EDGE = 180;

/** The two sizes Android needs before it will offer to install a PWA. */
const MANIFEST_REQUIRED_EDGES = [192, 512] as const;

/** `rel` tokens that declare a normal favicon. */
const ICON_RELS = new Set(["icon", "shortcut icon", "shortcut", "mask-icon"]);

/** `rel` tokens Apple reads for the home screen icon. */
const APPLE_RELS = new Set([
  "apple-touch-icon",
  "apple-touch-icon-precomposed",
]);

export type IconKind =
  | "icon"
  | "apple-touch-icon"
  | "mask-icon"
  | "manifest-icon"
  | "implicit";

/** The image formats a favicon is ever legitimately served as. */
export type IconFormat =
  | "ico"
  | "png"
  | "svg"
  | "gif"
  | "jpeg"
  | "webp"
  | "bmp"
  | "html"
  | "unknown";

export type IconDimensions = {
  width: number;
  height: number;
};

export type IconFetch = {
  /** HTTP status of the final response, after redirects. */
  status: number;
  /** True only when the response is 2xx AND the bytes really are an image. */
  usable: boolean;
  /** The `Content-Type` header, as sent. */
  contentType: string | null;
  /** The format sniffed from the file header, which can differ from above. */
  format: IconFormat;
  bytes: number;
  /**
   * Pixel size read from the file header. Null for formats we do not decode
   * and for SVG, which has no single intrinsic size.
   */
  dimensions: IconDimensions | null;
  /** Every size packed into an .ico, largest first. Empty for other formats. */
  icoSizes: IconDimensions[];
  /** Why this icon is not usable, in plain words. Null when it is fine. */
  problem: string | null;
};

export type FaviconIcon = {
  kind: IconKind;
  /** The `rel` exactly as written, or a label for non-link sources. */
  rel: string;
  /** The `href` exactly as written, before resolution. */
  href: string;
  /** Absolute URL. Null when the href could not be resolved against the page. */
  url: string | null;
  /** The `sizes` attribute as written. */
  declaredSizes: string | null;
  /** The `type` attribute as written. */
  declaredType: string | null;
  /** True when the declaration was found outside `<head>`. */
  outsideHead: boolean;
  /** Null when the icon was not fetched, either by cap or by bad URL. */
  fetch: IconFetch | null;
};

export type ManifestSummary = {
  url: string;
  /** True when the manifest fetched and parsed as JSON. */
  loaded: boolean;
  /** Why it did not load or parse. Null on success. */
  problem: string | null;
  name: string | null;
  themeColor: string | null;
  backgroundColor: string | null;
  /** How many icons the manifest declares, before our fetch cap. */
  declaredIconCount: number;
};

export type CheckStatus = "pass" | "warn" | "fail";

export type FaviconCheck = {
  /** Stable machine id. Scripts key on this, so it never changes wording. */
  id: string;
  title: string;
  status: CheckStatus;
  /** What we found, and why it matters. Plain words. */
  detail: string;
  /** What to do about it. Absent on a pass. */
  fix?: string;
};

export type FaviconReport = {
  /** True when a browser opening this page would show a real icon. */
  hasWorkingFavicon: boolean;
  /** The icon a desktop tab would actually use, as far as we can tell. */
  tabIcon: FaviconIcon | null;
  icons: FaviconIcon[];
  manifest: ManifestSummary | null;
  /** `<meta name="theme-color">`, as written. */
  themeColor: string | null;
  /** `<meta name="msapplication-TileImage">`, resolved. */
  tileImage: string | null;
  checks: FaviconCheck[];
  counts: { pass: number; warn: number; fail: number };
  /** Icons we found but did not fetch, because of the per-run cap. */
  notFetchedCount: number;
};

/**
 * Reads one attribute out of a single tag's source text.
 *
 * @param tag - The raw tag, e.g. `<link rel="icon" href="/a.png">`.
 * @param name - The attribute name, case insensitive.
 */
function attr(tag: string, name: string): string | null {
  try {
    const quoted = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
    const bare = new RegExp(`${name}\\s*=\\s*([^\\s"'>]+)`, "i");
    const match = tag.match(quoted) ?? tag.match(bare);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * The `<head>` source, or the whole document when there is no head tag.
 *
 * Used to tell a declaration the browser will honour from one sitting in the
 * body, where `rel="icon"` is ignored.
 *
 * @param html - Raw HTML.
 */
function headSection(html: string): string {
  try {
    const match = (html ?? "").match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
    return match?.[1] ?? html ?? "";
  } catch {
    return html ?? "";
  }
}

/**
 * Parses a `sizes` attribute into pixel pairs.
 *
 * Handles the space-separated list the spec allows (`"16x16 32x32"`) and the
 * literal `"any"`, which SVG icons use to mean scalable.
 *
 * @param value - The attribute value, or null.
 */
function parseSizes(value: string | null): IconDimensions[] {
  try {
    if (!value) return [];
    return value
      .trim()
      .split(/\s+/)
      .map((token) => token.toLowerCase().match(/^(\d+)x(\d+)$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => ({
        width: Number(match[1]),
        height: Number(match[2]),
      }));
  } catch {
    return [];
  }
}

/**
 * Reads a big-endian unsigned 32-bit integer.
 *
 * @param bytes - The buffer.
 * @param offset - Where to start.
 */
function readUint32BE(bytes: Uint8Array, offset: number): number {
  try {
    return (
      ((bytes[offset] << 24) >>> 0) +
      (bytes[offset + 1] << 16) +
      (bytes[offset + 2] << 8) +
      bytes[offset + 3]
    );
  } catch {
    return 0;
  }
}

/**
 * Reads a little-endian unsigned 16-bit integer.
 *
 * @param bytes - The buffer.
 * @param offset - Where to start.
 */
function readUint16LE(bytes: Uint8Array, offset: number): number {
  try {
    return bytes[offset] + (bytes[offset + 1] << 8);
  } catch {
    return 0;
  }
}

/**
 * Identifies an image format from its header bytes.
 *
 * Sniffing beats trusting `Content-Type` here, because the single most common
 * favicon defect is a server that answers an icon path with HTML and labels
 * it `text/html` or, worse, `image/x-icon`. The bytes cannot lie about it.
 *
 * @param bytes - The first bytes of the file.
 */
function sniffFormat(bytes: Uint8Array): IconFormat {
  try {
    if (bytes.length < 4) return "unknown";

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "png";
    }

    // ICO: reserved 0, type 1. (Type 2 is a cursor, which is not an icon.)
    if (
      bytes[0] === 0x00 &&
      bytes[1] === 0x00 &&
      bytes[2] === 0x01 &&
      bytes[3] === 0x00
    ) {
      return "ico";
    }

    // GIF87a / GIF89a
    if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    ) {
      return "gif";
    }

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "jpeg";
    }

    // BMP: "BM"
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) return "bmp";

    // WebP: "RIFF" .... "WEBP"
    if (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return "webp";
    }

    // Text formats need decoding. The head of the file is enough: both SVG
    // and an HTML error page declare themselves in their first few hundred
    // bytes, whether or not an XML prolog or a doctype comes first.
    const head = new TextDecoder("utf-8")
      .decode(bytes.subarray(0, 512))
      .trim()
      .toLowerCase();

    if (head.includes("<svg")) return "svg";
    if (head.includes("<!doctype html") || head.includes("<html")) {
      return "html";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Reads the pixel dimensions out of an image header.
 *
 * @param bytes - The file bytes.
 * @param format - The sniffed format.
 */
function readDimensions(
  bytes: Uint8Array,
  format: IconFormat,
): IconDimensions | null {
  try {
    if (format === "png" && bytes.length >= 24) {
      // IHDR is always the first chunk: 8 byte signature, 4 byte length,
      // 4 byte type, then width and height.
      return {
        width: readUint32BE(bytes, 16),
        height: readUint32BE(bytes, 20),
      };
    }

    if (format === "gif" && bytes.length >= 10) {
      return {
        width: readUint16LE(bytes, 6),
        height: readUint16LE(bytes, 8),
      };
    }

    if (format === "bmp" && bytes.length >= 26) {
      // Height is signed: a negative value means the rows are stored top
      // down, which says nothing about the size the browser renders.
      const height = readUint32LE(bytes, 22);
      return {
        width: readUint32LE(bytes, 18),
        height: height > 0x7fffffff ? 0x100000000 - height : height,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Reads a little-endian unsigned 32-bit integer.
 *
 * @param bytes - The buffer.
 * @param offset - Where to start.
 */
function readUint32LE(bytes: Uint8Array, offset: number): number {
  try {
    return (
      bytes[offset] +
      (bytes[offset + 1] << 8) +
      (bytes[offset + 2] << 16) +
      bytes[offset + 3] * 0x1000000
    );
  } catch {
    return 0;
  }
}

/**
 * Every size packed into an .ico file, largest first.
 *
 * An .ico is a container. A single file routinely holds 16x16, 32x32, and
 * 48x48, and reporting only one of them would misrepresent it. In the
 * directory, a stored edge of 0 means 256, which is how the format encodes a
 * size that will not fit in one byte.
 *
 * @param bytes - The file bytes.
 */
function readIcoSizes(bytes: Uint8Array): IconDimensions[] {
  try {
    if (bytes.length < 6) return [];

    const count = readUint16LE(bytes, 4);
    const sizes: IconDimensions[] = [];

    for (let index = 0; index < count; index += 1) {
      const entry = 6 + index * 16;
      if (entry + 2 > bytes.length) break;
      sizes.push({
        width: bytes[entry] === 0 ? 256 : bytes[entry],
        height: bytes[entry + 1] === 0 ? 256 : bytes[entry + 1],
      });
    }

    return sizes.sort((left, right) => right.width - left.width);
  } catch {
    return [];
  }
}

/** Formats a dimension pair for display. */
function formatSize(size: IconDimensions): string {
  try {
    return `${size.width}x${size.height}`;
  } catch {
    return "unknown";
  }
}

/**
 * The largest edge an icon actually offers, from its bytes.
 *
 * @param fetched - A completed icon fetch.
 */
function largestEdge(fetched: IconFetch | null): number {
  try {
    if (!fetched?.usable) return 0;
    if (fetched.format === "svg") return Number.POSITIVE_INFINITY;
    if (fetched.icoSizes.length > 0) return fetched.icoSizes[0].width;
    return fetched.dimensions?.width ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Reads an icon that is inlined as a `data:` URI rather than fetched.
 *
 * Two very different things arrive here and they must not be conflated:
 *
 *   * A real inlined image. Small icons are often base64'd into the HTML to
 *     save a round trip. These work, and calling them broken because there
 *     was nothing to fetch would be a false alarm on a correct site.
 *   * `href="data:,"`, an empty data URI. This is a deliberate trick: it
 *     satisfies the browser's need for an icon declaration so that it never
 *     requests /favicon.ico. The site is choosing to have no favicon, and
 *     saying so is more useful than reporting a fetch failure.
 *
 * @param url - The data URI.
 */
function readDataUri(url: string): IconFetch {
  const base: IconFetch = {
    status: 0,
    usable: false,
    contentType: null,
    format: "unknown",
    bytes: 0,
    dimensions: null,
    icoSizes: [],
    problem: null,
  };

  try {
    const match = url.match(/^data:([^,]*),([\s\S]*)$/i);
    if (!match) {
      return { ...base, problem: "This data URI is malformed." };
    }

    const meta = match[1] ?? "";
    const payload = match[2] ?? "";
    const isBase64 = /;base64$/i.test(meta);
    const mediaType = meta.replace(/;base64$/i, "").trim() || null;

    if (payload.length === 0) {
      return {
        ...base,
        contentType: mediaType,
        problem:
          'The icon is declared as an empty data URI (href="data:,"). This is the trick sites use to stop the browser requesting a favicon at all, so it is a deliberate choice to have no icon rather than a broken file.',
      };
    }

    const bytes = isBase64
      ? Uint8Array.from(Buffer.from(payload, "base64"))
      : new TextEncoder().encode(decodeURIComponent(payload));

    if (bytes.length === 0) {
      return {
        ...base,
        contentType: mediaType,
        problem: "This data URI decodes to nothing.",
      };
    }

    const format = sniffFormat(bytes);
    const icoSizes = format === "ico" ? readIcoSizes(bytes) : [];
    const dimensions = readDimensions(bytes, format);

    if (format === "unknown" || format === "html") {
      return {
        ...base,
        contentType: mediaType,
        format,
        bytes: bytes.length,
        problem:
          "This data URI does not decode to an image a browser can render.",
      };
    }

    return {
      status: 200,
      usable: true,
      contentType: mediaType,
      format,
      bytes: bytes.length,
      dimensions,
      icoSizes,
      problem: null,
    };
  } catch {
    return { ...base, problem: "We could not read this data URI." };
  }
}

/**
 * Fetches one icon and reads what it really is.
 *
 * Never throws: an icon that cannot be fetched is a finding, not an error.
 *
 * @param url - Absolute URL of the icon.
 */
async function fetchIcon(url: string): Promise<IconFetch> {
  const unreachable: IconFetch = {
    status: 0,
    usable: false,
    contentType: null,
    format: "unknown",
    bytes: 0,
    dimensions: null,
    icoSizes: [],
    problem: "We could not fetch this file.",
  };

  try {
    // Inlined icons never leave the HTML, so there is nothing to fetch and
    // nothing for the SSRF guard to rule on. Checked before the guard, which
    // would otherwise reject every data URI as "not on the public internet"
    // and report working inline icons as broken.
    if (url.toLowerCase().startsWith("data:")) {
      return readDataUri(url);
    }

    // The page URL was guarded before we ever read its HTML, but an icon
    // href is attacker-controlled content from that page and can point
    // anywhere, so it gets its own check rather than inheriting trust.
    const routable = await isPubliclyRoutable(url);
    if (!routable) {
      return {
        ...unreachable,
        problem:
          "This icon points at an address that is not on the public internet, so we did not fetch it.",
      };
    }

    const response = await fetchUrl({
      url,
      timeoutMs: ICON_TIMEOUT_MS,
      maxBytes: MAX_ICON_BYTES,
      binary: true,
    });

    if (!response.ok) {
      return {
        ...unreachable,
        problem:
          response.reason === "timeout"
            ? "The server took too long to send this file."
            : "We could not fetch this file.",
      };
    }

    const contentType = response.headers["content-type"] ?? null;
    const raw = response.raw ?? new Uint8Array();
    const format = sniffFormat(raw);
    const icoSizes = format === "ico" ? readIcoSizes(raw) : [];
    const dimensions = readDimensions(raw, format);

    if (response.status >= 400) {
      return {
        status: response.status,
        usable: false,
        contentType,
        format,
        bytes: response.bytes,
        dimensions,
        icoSizes,
        problem: `The server answered HTTP ${response.status}, so there is no icon at this address.`,
      };
    }

    if (response.bytes === 0) {
      return {
        status: response.status,
        usable: false,
        contentType,
        format,
        bytes: 0,
        dimensions,
        icoSizes,
        problem: "The file is empty.",
      };
    }

    // The defect this whole engine exists for. A 200 that returns the app
    // shell is indistinguishable from a working icon to anything that only
    // reads the status code.
    if (format === "html") {
      return {
        status: response.status,
        usable: false,
        contentType,
        format,
        bytes: response.bytes,
        dimensions,
        icoSizes,
        problem:
          "The server answered with an HTML page instead of an image. This is usually a catch-all route returning the app shell for a path that does not exist.",
      };
    }

    if (format === "unknown") {
      return {
        status: response.status,
        usable: false,
        contentType,
        format,
        bytes: response.bytes,
        dimensions,
        icoSizes,
        problem:
          "The file does not begin like any image format a browser can render.",
      };
    }

    return {
      status: response.status,
      usable: true,
      contentType,
      format,
      bytes: response.bytes,
      dimensions,
      icoSizes,
      problem: null,
    };
  } catch {
    return unreachable;
  }
}

/**
 * Every icon declared in the page HTML, in document order.
 *
 * @param html - Raw HTML of the page.
 * @param baseUrl - The URL the HTML came from, for resolving hrefs.
 */
function parseDeclaredIcons(html: string, baseUrl: string): FaviconIcon[] {
  try {
    const head = headSection(html);
    const tags = (html ?? "").match(/<link\b[^>]*>/gi) ?? [];
    const icons: FaviconIcon[] = [];

    for (const tag of tags) {
      const relValue = (attr(tag, "rel") ?? "").toLowerCase().trim();
      if (relValue.length === 0) continue;

      const tokens = relValue.split(/\s+/).filter(Boolean);
      const isApple = tokens.some((token) => APPLE_RELS.has(token));
      const isIcon = tokens.some((token) => ICON_RELS.has(token));
      if (!isApple && !isIcon) continue;

      const rawHref = attr(tag, "href");
      if (!rawHref) continue;

      // An href is HTML-escaped in the source. A browser decodes it before
      // requesting, so `?w=96&amp;h=96` is fetched as `?w=96&h=96`. Skipping
      // this step means requesting a URL with a literal "&amp;" in the query,
      // which image CDNs answer with a 400, and the tool would then report a
      // perfectly good icon as broken. Found on stripe.com.
      const href = decodeEntities(rawHref);

      let resolved: string | null = null;
      try {
        resolved = new URL(href, baseUrl).toString();
      } catch {
        resolved = null;
      }

      const kind: IconKind = isApple
        ? "apple-touch-icon"
        : tokens.includes("mask-icon")
          ? "mask-icon"
          : "icon";

      icons.push({
        kind,
        rel: relValue,
        href,
        url: resolved,
        declaredSizes: attr(tag, "sizes"),
        declaredType: attr(tag, "type"),
        outsideHead: !head.includes(tag),
        fetch: null,
      });
    }

    return icons;
  } catch {
    return [];
  }
}

/**
 * Fetches and summarises the web app manifest, plus the icons it declares.
 *
 * @param html - Raw HTML of the page.
 * @param baseUrl - The URL the HTML came from.
 */
async function readManifest(
  html: string,
  baseUrl: string,
): Promise<{ summary: ManifestSummary | null; icons: FaviconIcon[] }> {
  try {
    const tags = (html ?? "").match(/<link\b[^>]*>/gi) ?? [];
    const manifestTag = tags.find((tag) =>
      (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/).includes("manifest"),
    );
    if (!manifestTag) return { summary: null, icons: [] };

    const rawHref = attr(manifestTag, "href");
    if (!rawHref) return { summary: null, icons: [] };

    // Same entity decoding as the icon hrefs. A manifest path with a cache
    // busting query is common on hashed-asset builds.
    const href = decodeEntities(rawHref);

    let manifestUrl: string;
    try {
      manifestUrl = new URL(href, baseUrl).toString();
    } catch {
      return {
        summary: {
          url: href,
          loaded: false,
          problem: "The manifest href is not a URL we could resolve.",
          name: null,
          themeColor: null,
          backgroundColor: null,
          declaredIconCount: 0,
        },
        icons: [],
      };
    }

    const failed = (problem: string): ManifestSummary => ({
      url: manifestUrl,
      loaded: false,
      problem,
      name: null,
      themeColor: null,
      backgroundColor: null,
      declaredIconCount: 0,
    });

    const routable = await isPubliclyRoutable(manifestUrl);
    if (!routable) {
      return {
        summary: failed(
          "The manifest points at an address that is not on the public internet, so we did not fetch it.",
        ),
        icons: [],
      };
    }

    const response = await fetchUrl({
      url: manifestUrl,
      timeoutMs: ICON_TIMEOUT_MS,
      maxBytes: MAX_MANIFEST_BYTES,
    });

    if (!response.ok) {
      return { summary: failed("We could not fetch the manifest."), icons: [] };
    }

    if (response.status >= 400) {
      return {
        summary: failed(
          `The manifest is linked but the server answered HTTP ${response.status}.`,
        ),
        icons: [],
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.body);
    } catch {
      return {
        summary: failed(
          "The manifest is linked but its contents are not valid JSON, so a browser will ignore it.",
        ),
        icons: [],
      };
    }

    const manifest = (parsed ?? {}) as Record<string, unknown>;
    const rawIcons = Array.isArray(manifest.icons) ? manifest.icons : [];

    const icons: FaviconIcon[] = rawIcons
      .slice(0, MAX_MANIFEST_ICONS)
      .map((entry) => {
        const icon = (entry ?? {}) as Record<string, unknown>;
        const src = typeof icon.src === "string" ? icon.src : "";
        let resolved: string | null = null;
        try {
          // Manifest icon srcs resolve against the manifest URL, not the
          // page. Getting this wrong is why manifest icons silently 404 on
          // sites whose manifest lives in a subdirectory.
          resolved = src ? new URL(src, manifestUrl).toString() : null;
        } catch {
          resolved = null;
        }
        return {
          kind: "manifest-icon" as const,
          rel: "manifest icons[]",
          href: src,
          url: resolved,
          declaredSizes: typeof icon.sizes === "string" ? icon.sizes : null,
          declaredType: typeof icon.type === "string" ? icon.type : null,
          outsideHead: false,
          fetch: null,
        };
      })
      .filter((icon) => icon.href.length > 0);

    return {
      summary: {
        url: manifestUrl,
        loaded: true,
        problem: null,
        name:
          typeof manifest.name === "string"
            ? manifest.name
            : typeof manifest.short_name === "string"
              ? manifest.short_name
              : null,
        themeColor:
          typeof manifest.theme_color === "string" ? manifest.theme_color : null,
        backgroundColor:
          typeof manifest.background_color === "string"
            ? manifest.background_color
            : null,
        declaredIconCount: rawIcons.length,
      },
      icons,
    };
  } catch {
    return { summary: null, icons: [] };
  }
}

/**
 * Reads a `<meta name="...">` content value.
 *
 * @param html - Raw HTML.
 * @param name - The meta name, case insensitive.
 */
function metaContent(html: string, name: string): string | null {
  try {
    const tags = (html ?? "").match(/<meta\b[^>]*>/gi) ?? [];
    for (const tag of tags) {
      if ((attr(tag, "name") ?? "").toLowerCase() !== name.toLowerCase()) {
        continue;
      }
      const content = attr(tag, "content");
      if (content) return content;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Picks the icon a desktop browser tab would actually use.
 *
 * The real algorithm differs per browser and is not specified anywhere
 * binding, but the shape is consistent: an SVG declared with `sizes="any"`
 * wins where supported, otherwise the largest usable raster icon, otherwise
 * whatever is at /favicon.ico. This is an approximation and the UI says so.
 *
 * @param icons - Every icon, already fetched.
 */
function pickTabIcon(icons: FaviconIcon[]): FaviconIcon | null {
  try {
    const usable = icons.filter(
      (icon) =>
        icon.fetch?.usable === true &&
        icon.kind !== "apple-touch-icon" &&
        icon.kind !== "mask-icon" &&
        !icon.outsideHead,
    );
    if (usable.length === 0) return null;

    const declared = usable.filter((icon) => icon.kind === "icon");
    const pool = declared.length > 0 ? declared : usable;

    const svg = pool.find((icon) => icon.fetch?.format === "svg");
    if (svg) return svg;

    return pool.reduce((best, icon) =>
      largestEdge(icon.fetch) > largestEdge(best.fetch) ? icon : best,
    );
  } catch {
    return null;
  }
}

/**
 * Builds the check list from what we fetched.
 *
 * Every check states what was found rather than what was expected, because a
 * visitor who cannot see the difference between the two has no way to act on
 * the result.
 *
 * @param params - The gathered evidence.
 */
function buildChecks(params: {
  icons: FaviconIcon[];
  implicit: FaviconIcon | null;
  manifest: ManifestSummary | null;
  manifestIcons: FaviconIcon[];
  themeColor: string | null;
  pageUrl: string;
}): FaviconCheck[] {
  const { icons, implicit, manifest, manifestIcons, themeColor, pageUrl } =
    params;

  try {
    const checks: FaviconCheck[] = [];
    const declared = icons.filter((icon) => icon.kind !== "implicit");
    const declaredIcons = declared.filter((icon) => icon.kind === "icon");
    const appleIcons = declared.filter(
      (icon) => icon.kind === "apple-touch-icon",
    );
    const usableTabIcons = declaredIcons.filter(
      (icon) => icon.fetch?.usable === true && !icon.outsideHead,
    );
    const implicitUsable = implicit?.fetch?.usable === true;

    // 1. The question the tool is named after.
    if (usableTabIcons.length > 0 || implicitUsable) {
      checks.push({
        id: "favicon-available",
        title: "A favicon is available",
        status: "pass",
        detail:
          usableTabIcons.length > 0
            ? "A declared icon fetched successfully and its bytes are a real image, so a browser tab will show it."
            : "Nothing is declared in the HTML, but /favicon.ico exists and is a real image, so browsers will fall back to it.",
      });
    } else {
      // An empty data URI is a decision, not a defect. Reporting it as a
      // broken file would send somebody looking for a missing deploy.
      const suppressed =
        declaredIcons.length > 0 &&
        declaredIcons.every((icon) =>
          (icon.url ?? "").toLowerCase().replace(/\s/g, "").startsWith("data:,"),
        );

      checks.push({
        id: "favicon-available",
        title: suppressed
          ? "This site turns its favicon off on purpose"
          : "No working favicon",
        status: "fail",
        detail: suppressed
          ? 'The only icon declared is an empty data URI (href="data:,"), which is how a site tells browsers not to ask for a favicon at all. Nothing is broken. There is simply no icon, so tabs show the blank page glyph.'
          : declaredIcons.length > 0
            ? "Every icon this page declares failed to load or is not an image, and /favicon.ico does not work either. Browsers will show the blank page glyph."
            : "This page declares no favicon and /favicon.ico does not work either. Browsers will show the blank page glyph.",
        fix: suppressed
          ? 'If that was deliberate, nothing to do. If it was inherited from a template, replace the data URI with a real path: <link rel="icon" href="/favicon.svg">.'
          : 'Add a 32x32 PNG or an SVG at a stable path, then declare it with <link rel="icon" href="/favicon.svg"> inside <head>. Keep a /favicon.ico too, for clients that only look there.',
      });
    }

    // 2. Declared, versus relying on the implicit path.
    if (declaredIcons.length > 0) {
      checks.push({
        id: "icon-declared",
        title: "The HTML declares an icon",
        status: "pass",
        detail: `Found ${declaredIcons.length} <link rel="icon"> ${declaredIcons.length === 1 ? "declaration" : "declarations"}, so you control the format and the size rather than leaving it to the /favicon.ico fallback.`,
      });
    } else {
      checks.push({
        id: "icon-declared",
        title: "No icon declared in the HTML",
        status: "warn",
        detail:
          "The page has no <link rel=\"icon\">. Browsers still guess at /favicon.ico, but nothing else does reliably, and you cannot offer an SVG or a retina size that way.",
        fix: 'Add <link rel="icon" type="image/svg+xml" href="/favicon.svg"> inside <head>.',
      });
    }

    // 3. Broken declarations, named individually. One line per broken icon is
    //    the difference between a report you can act on and a verdict.
    // An intentionally empty data URI is not a broken file, and the
    // availability check above already explains it. It is excluded from this
    // check in both directions: counting it as broken would report one
    // decision as two failures, and counting it as loading would have the
    // page claim every icon loads on a site that declared none.
    const checkable = declared.filter(
      (icon) =>
        !(icon.url ?? "")
          .toLowerCase()
          .replace(/\s/g, "")
          .startsWith("data:,"),
    );
    const broken = checkable.filter(
      (icon) => icon.fetch !== null && !icon.fetch.usable,
    );

    if (broken.length > 0) {
      checks.push({
        id: "declared-icons-load",
        title: `${broken.length} declared ${broken.length === 1 ? "icon does" : "icons do"} not load`,
        status: "fail",
        detail: broken
          .map((icon) => `${icon.href}: ${icon.fetch?.problem ?? "unusable"}`)
          .join(" "),
        fix: "Fix or remove each of these. A declaration pointing at a missing file is worse than no declaration, because a browser tries it before falling back.",
      });
    } else if (checkable.length > 0) {
      checks.push({
        id: "declared-icons-load",
        title: "Every declared icon loads",
        status: "pass",
        detail: `All ${checkable.length} declared ${checkable.length === 1 ? "icon" : "icons"} fetched successfully and the bytes are real images.`,
      });
    }

    // 4. The implicit fallback.
    if (implicitUsable) {
      const size = implicit?.fetch?.icoSizes?.[0];
      checks.push({
        id: "implicit-favicon-ico",
        title: "/favicon.ico is present",
        status: "pass",
        detail: size
          ? `The root /favicon.ico exists and contains ${implicit?.fetch?.icoSizes.map(formatSize).join(", ")}. Clients that only look there will find it.`
          : "The root /favicon.ico exists and is a real image. Clients that only look there will find it.",
      });
    } else if (implicit !== null && implicit.fetch === null) {
      // Should not happen now that the implicit icon is fetched first, but a
      // silent false negative here is the worst failure this tool has, so it
      // states the uncertainty rather than guessing.
      checks.push({
        id: "implicit-favicon-ico",
        title: "/favicon.ico was not checked",
        status: "warn",
        detail:
          "This run hit its limit on how many icons it fetches before it got to the root /favicon.ico, so we cannot say whether it is there.",
      });
    } else {
      checks.push({
        id: "implicit-favicon-ico",
        title: "/favicon.ico is missing",
        status: "warn",
        detail: `${implicit?.fetch?.problem ?? "Nothing was served at /favicon.ico."} Browsers will use your declared icon, but RSS readers, older clients, and some link unfurlers only ever try this path.`,
        fix: "Put a multi-size .ico at the site root. It costs a few kilobytes and it is the only path some clients will try.",
      });
    }

    // 5. Tab icon resolution. 16x16 was fine when displays were not retina.
    const bestEdge = Math.max(
      0,
      ...usableTabIcons.map((icon) => largestEdge(icon.fetch)),
      implicitUsable ? largestEdge(implicit?.fetch ?? null) : 0,
    );
    const hasVector = [...usableTabIcons, ...(implicit ? [implicit] : [])].some(
      (icon) => icon.fetch?.format === "svg",
    );

    if (bestEdge === 0) {
      // Covered by the availability check; no second failure for one defect.
    } else if (hasVector) {
      checks.push({
        id: "tab-icon-resolution",
        title: "An SVG icon is available",
        status: "pass",
        detail:
          "An SVG icon scales to any display density, which is the best thing you can serve a modern tab.",
      });
    } else if (bestEdge >= MIN_TAB_EDGE) {
      checks.push({
        id: "tab-icon-resolution",
        title: "The icon is large enough for a retina tab",
        status: "pass",
        detail: `The largest usable icon is ${bestEdge}px, at or above the ${MIN_TAB_EDGE}px a retina tab and bookmark bar want.`,
      });
    } else {
      checks.push({
        id: "tab-icon-resolution",
        title: `The largest icon is only ${bestEdge}px`,
        status: "warn",
        detail: `Nothing larger than ${bestEdge}px is available. Retina tabs, the bookmark bar, and the history list all render above that, so the icon is being upscaled and will look soft.`,
        fix: "Add at least a 32x32 PNG, or an SVG, which sidesteps the question entirely.",
      });
    }

    // 6 and 7. Apple touch icon, presence then size.
    const usableApple = appleIcons.filter((icon) => icon.fetch?.usable === true);
    if (usableApple.length === 0) {
      checks.push({
        id: "apple-touch-icon",
        title: "No apple-touch-icon",
        status: "warn",
        detail:
          appleIcons.length > 0 && appleIcons.every((icon) => icon.fetch === null)
            ? "An apple-touch-icon is declared, but this run hit its limit on how many icons it fetches before reaching it, so we cannot say whether it works."
            : appleIcons.length > 0
              ? "An apple-touch-icon is declared but it does not load, so iOS has nothing to use."
              : "Nothing declares an apple-touch-icon. When somebody adds this site to an iOS home screen, iOS uses a screenshot of the page instead of an icon.",
        fix: `Add a ${APPLE_TOUCH_EDGE}x${APPLE_TOUCH_EDGE} PNG and declare it with <link rel="apple-touch-icon" href="/apple-touch-icon.png">.`,
      });
    } else {
      const appleEdge = Math.max(
        ...usableApple.map((icon) => largestEdge(icon.fetch)),
      );
      if (appleEdge >= APPLE_TOUCH_EDGE) {
        checks.push({
          id: "apple-touch-icon",
          title: "apple-touch-icon is present and large enough",
          status: "pass",
          detail: `A ${appleEdge}px icon is available, at or above the ${APPLE_TOUCH_EDGE}px iOS asks for.`,
        });
      } else {
        checks.push({
          id: "apple-touch-icon",
          title: `apple-touch-icon is only ${appleEdge}px`,
          status: "warn",
          detail: `iOS renders the home screen icon at ${APPLE_TOUCH_EDGE}px, so a ${appleEdge}px file is upscaled and looks blurry next to every other app.`,
          fix: `Export the icon at ${APPLE_TOUCH_EDGE}x${APPLE_TOUCH_EDGE} and replace the file.`,
        });
      }
    }

    // 8. Declared size versus real size. The mismatch nobody looks for.
    const mismatched = declared.filter((icon) => {
      const claimed = parseSizes(icon.declaredSizes);
      const actual = icon.fetch?.dimensions ?? icon.fetch?.icoSizes?.[0] ?? null;
      if (claimed.length === 0 || !actual || icon.fetch?.format === "svg") {
        return false;
      }
      return !claimed.some(
        (size) => size.width === actual.width && size.height === actual.height,
      );
    });

    if (mismatched.length > 0) {
      checks.push({
        id: "sizes-attribute-honest",
        title: `${mismatched.length} icon ${mismatched.length === 1 ? "declares" : "declare"} the wrong size`,
        status: "warn",
        detail: mismatched
          .map((icon) => {
            const actual =
              icon.fetch?.dimensions ?? icon.fetch?.icoSizes?.[0] ?? null;
            return `${icon.href} says sizes="${icon.declaredSizes}" but the file is ${actual ? formatSize(actual) : "a different size"}.`;
          })
          .join(" "),
        fix: "Correct the sizes attribute to match the file. Browsers pick which icon to download from this attribute, so a wrong value makes them choose badly.",
      });
    }

    // 9. Mixed content. An http icon on an https page is simply dropped.
    let pageIsHttps = false;
    try {
      pageIsHttps = new URL(pageUrl).protocol === "https:";
    } catch {
      pageIsHttps = false;
    }

    const insecure = declared.filter((icon) =>
      icon.url ? icon.url.startsWith("http://") : false,
    );
    if (pageIsHttps && insecure.length > 0) {
      checks.push({
        id: "icon-over-https",
        title: "An icon is served over http",
        status: "fail",
        detail: `${insecure.map((icon) => icon.href).join(", ")} ${insecure.length === 1 ? "is" : "are"} loaded over plain http on an https page. Browsers block mixed content, so the icon never renders no matter what the file contains.`,
        fix: "Serve the icon over https, or use a root-relative path so it inherits the page's scheme.",
      });
    }

    // 10. Declarations outside <head>, which browsers ignore outright.
    const strays = declared.filter((icon) => icon.outsideHead);
    if (strays.length > 0) {
      checks.push({
        id: "icon-in-head",
        title: "An icon is declared outside <head>",
        status: "fail",
        detail: `${strays.map((icon) => icon.href).join(", ")} ${strays.length === 1 ? "sits" : "sit"} in the body. Browsers only read icon links from <head>, so ${strays.length === 1 ? "it is" : "they are"} ignored even though the file may be fine.`,
        fix: "Move the <link> into <head>.",
      });
    }

    // 11. Manifest, and the two sizes Android needs.
    if (!manifest) {
      checks.push({
        id: "web-app-manifest",
        title: "No web app manifest",
        status: "warn",
        detail:
          "No manifest is linked. Android uses the manifest icons for the home screen and the install prompt, and without it Chrome will not offer to install the site at all.",
        fix: 'Add a manifest.json with an icons array, then link it with <link rel="manifest" href="/manifest.json">.',
      });
    } else if (!manifest.loaded) {
      checks.push({
        id: "web-app-manifest",
        title: "The manifest does not load",
        status: "fail",
        detail: manifest.problem ?? "The manifest could not be read.",
        fix: "Fix the manifest URL or its contents. A linked manifest that fails to parse is ignored entirely.",
      });
    } else {
      const usableManifestIcons = manifestIcons.filter(
        (icon) => icon.fetch?.usable === true,
      );
      const uncheckedManifestIcons = manifestIcons.filter(
        (icon) => icon.fetch === null,
      ).length;
      const manifestEdges = usableManifestIcons.map((icon) =>
        largestEdge(icon.fetch),
      );
      const missingEdges = MANIFEST_REQUIRED_EDGES.filter(
        (edge) => !manifestEdges.some((actual) => actual >= edge),
      );

      if (manifest.declaredIconCount === 0) {
        checks.push({
          id: "web-app-manifest",
          title: "The manifest declares no icons",
          status: "warn",
          detail:
            "A manifest is linked and parses, but its icons array is empty or missing, so Android has nothing to use for the home screen.",
          fix: `Add 192x192 and 512x512 PNGs to the manifest's icons array.`,
        });
      } else if (
        usableManifestIcons.length === 0 &&
        uncheckedManifestIcons === manifestIcons.length
      ) {
        // Every manifest icon fell past the fetch cap. We know nothing about
        // them, and "none of them load" would be a fabricated failure about
        // files we never requested.
        checks.push({
          id: "web-app-manifest",
          title: "The manifest icons were not checked",
          status: "warn",
          detail: `The manifest loads and declares ${manifest.declaredIconCount} ${manifest.declaredIconCount === 1 ? "icon" : "icons"}, but this run hit its limit on how many icons it fetches before reaching ${manifest.declaredIconCount === 1 ? "it" : "them"}, so we cannot say whether they work.`,
        });
      } else if (usableManifestIcons.length === 0) {
        checks.push({
          id: "web-app-manifest",
          title: "No manifest icon loads",
          status: "fail",
          detail: `Of the manifest icons we fetched, none loaded successfully.${uncheckedManifestIcons > 0 ? ` ${uncheckedManifestIcons} more ${uncheckedManifestIcons === 1 ? "was" : "were"} declared but not fetched in this run.` : ""} Manifest icon paths resolve against the manifest URL, not the page, which is the usual cause.`,
          fix: "Check each src in the manifest resolves to a real file from the manifest's own location.",
        });
      } else if (missingEdges.length > 0) {
        // A manifest icon we never fetched cannot be ruled out as the missing
        // size, so the claim is qualified rather than dropped: the visitor
        // still learns what we did not find, without being told a file is
        // absent when we simply did not ask for it.
        const unchecked = manifestIcons.filter(
          (icon) => icon.fetch === null,
        ).length;

        checks.push({
          id: "web-app-manifest",
          title: "The manifest is missing an install size",
          status: "warn",
          detail:
            unchecked > 0
              ? `Of the manifest icons we fetched, none is ${missingEdges.map((edge) => `${edge}x${edge}`).join(" or ")}. Chrome requires both a 192px and a 512px icon before it will offer to install the site. ${unchecked} more ${unchecked === 1 ? "icon was" : "icons were"} declared but not fetched in this run, so one of those may cover it.`
              : `The manifest has working icons but nothing at ${missingEdges.map((edge) => `${edge}x${edge}`).join(" or ")}. Chrome requires both a 192px and a 512px icon before it will offer to install the site.`,
          fix: `Add ${missingEdges.map((edge) => `a ${edge}x${edge} PNG`).join(" and ")} to the manifest's icons array.`,
        });
      } else {
        const largestManifest = Math.max(0, ...manifestEdges);
        checks.push({
          id: "web-app-manifest",
          title: "The manifest has the icons it needs",
          status: "pass",
          detail: `The manifest loads and its largest working icon is ${Number.isFinite(largestManifest) ? `${largestManifest}px` : "scalable"}, which covers both the 192px and the 512px minimums Chrome checks before offering to install the site.`,
        });
      }
    }

    // 12. theme-color. Low stakes, and cheap to state.
    if (themeColor || manifest?.themeColor) {
      checks.push({
        id: "theme-color",
        title: "A theme colour is set",
        status: "pass",
        detail: `The browser UI will tint to ${themeColor ?? manifest?.themeColor} on mobile, which is what makes the icon and the chrome around it look deliberate.`,
      });
    } else {
      checks.push({
        id: "theme-color",
        title: "No theme colour",
        status: "warn",
        detail:
          "No <meta name=\"theme-color\"> and none in the manifest. Mobile browsers use their default grey for the address bar instead of your brand colour.",
        fix: '<meta name="theme-color" content="#yourcolour"> in <head>.',
      });
    }

    return checks;
  } catch {
    return [];
  }
}

/**
 * Runs the full favicon check against one page.
 *
 * The caller is responsible for having fetched the HTML through the toolkit's
 * guarded fetcher; this function owns every request after that.
 *
 * @param params - The page HTML and the URL it came from.
 */
export async function checkFavicons(params: {
  html: string;
  url: string;
}): Promise<FaviconReport> {
  const { html, url } = params;

  const empty: FaviconReport = {
    hasWorkingFavicon: false,
    tabIcon: null,
    icons: [],
    manifest: null,
    themeColor: null,
    tileImage: null,
    checks: [],
    counts: { pass: 0, warn: 0, fail: 0 },
    notFetchedCount: 0,
  };

  try {
    const declared = parseDeclaredIcons(html, url);
    const { summary: manifest, icons: manifestIcons } = await readManifest(
      html,
      url,
    );

    // The implicit fallback is checked whether or not anything is declared,
    // because it is the path a client with no HTML at all will try.
    let implicitUrl: string | null = null;
    try {
      implicitUrl = new URL(IMPLICIT_ICON_PATH, url).toString();
    } catch {
      implicitUrl = null;
    }

    // A site that declares /favicon.ico explicitly still has the root path
    // covered, so we reuse that declaration's result rather than fetching the
    // same file twice. Treating the two as separate is how the check ends up
    // reporting "/favicon.ico is missing" about a file it just fetched
    // successfully. Found on developer.mozilla.org.
    const declaredAtRoot =
      declared.find((icon) => icon.url === implicitUrl) ?? null;

    const implicit: FaviconIcon | null =
      implicitUrl && !declaredAtRoot
        ? {
            kind: "implicit",
            rel: "implicit /favicon.ico",
            href: IMPLICIT_ICON_PATH,
            url: implicitUrl,
            declaredSizes: null,
            declaredType: null,
            outsideHead: false,
            fetch: null,
          }
        : null;

    const candidates = [
      ...declared,
      ...manifestIcons,
      ...(implicit ? [implicit] : []),
    ];

    // Two icons declared at the same URL cost one fetch, not two. Sites that
    // list every Apple size often point several of them at one file, and
    // spending cap slots on duplicates is how a real icon gets squeezed out.
    const seenUrls = new Set<string>();
    const deduped = candidates.filter((icon) => {
      if (!icon.url) return true;
      if (seenUrls.has(icon.url)) return false;
      seenUrls.add(icon.url);
      return true;
    });

    // Stable sort by priority: `sort` is stable in every engine we run on, so
    // icons of equal priority keep document order.
    const prioritised = [...deduped].sort(
      (left, right) =>
        (KIND_PRIORITY[left.kind] ?? 9) - (KIND_PRIORITY[right.kind] ?? 9),
    );

    const toFetch = prioritised.slice(0, MAX_ICONS_FETCHED);
    const notFetchedCount = Math.max(0, prioritised.length - toFetch.length);

    // Fetched together: these are small files at one origin, and running them
    // in series would put a dozen round trips in the visitor's wait.
    const fetched = await Promise.all(
      toFetch.map(async (icon) => {
        if (!icon.url) {
          return {
            ...icon,
            fetch: {
              status: 0,
              usable: false,
              contentType: null,
              format: "unknown" as const,
              bytes: 0,
              dimensions: null,
              icoSizes: [],
              problem:
                "This href is not a URL we could resolve against the page.",
            },
          };
        }
        return { ...icon, fetch: await fetchIcon(icon.url) };
      }),
    );

    // Keyed by URL, not by declaration, so the duplicates dropped above still
    // receive the result of the one fetch that covered them. An icon past the
    // cap has no entry and keeps `fetch: null`, which the checks read as "not
    // looked at" rather than as "not there".
    const fetchedByUrl = new Map<string, IconFetch>();
    for (const icon of fetched) {
      if (icon.url && icon.fetch) fetchedByUrl.set(icon.url, icon.fetch);
    }

    const resolve = (icon: FaviconIcon): FaviconIcon => {
      const result = icon.url ? fetchedByUrl.get(icon.url) : undefined;
      return result ? { ...icon, fetch: result } : icon;
    };

    const resolvedDeclared = declared.map(resolve);
    const resolvedManifestIcons = manifestIcons.map(resolve);
    const resolvedImplicit = implicit ? resolve(implicit) : null;

    const allIcons = [
      ...resolvedDeclared,
      ...resolvedManifestIcons,
      ...(resolvedImplicit ? [resolvedImplicit] : []),
    ];

    const themeColor = metaContent(html, "theme-color");
    let tileImage: string | null = null;
    try {
      const tile = metaContent(html, "msapplication-TileImage");
      tileImage = tile ? new URL(tile, url).toString() : null;
    } catch {
      tileImage = null;
    }

    const checks = buildChecks({
      icons: allIcons,
      // Whichever icon actually covers the root path: the synthesised one, or
      // the site's own declaration of it.
      implicit:
        resolvedImplicit ??
        (declaredAtRoot ? resolve(declaredAtRoot) : null),
      manifest,
      manifestIcons: resolvedManifestIcons,
      themeColor,
      pageUrl: url,
    });

    const counts = {
      pass: checks.filter((check) => check.status === "pass").length,
      warn: checks.filter((check) => check.status === "warn").length,
      fail: checks.filter((check) => check.status === "fail").length,
    };

    const tabIcon = pickTabIcon(allIcons);

    return {
      hasWorkingFavicon:
        tabIcon !== null || resolvedImplicit?.fetch?.usable === true,
      tabIcon,
      icons: allIcons,
      manifest,
      themeColor,
      tileImage,
      checks,
      counts,
      notFetchedCount,
    };
  } catch {
    return empty;
  }
}
