// Open Graph video check engine.
//
// WHAT THIS ANSWERS
//
// Not "is there an og:video tag". The question is whether a link to this page,
// pasted somewhere, turns into a video somebody can press play on. Those come
// apart in ways a tag listing never shows:
//
//   * og:video points at a file that 404s, or at a catch-all route that
//     answers HTTP 200 with the app shell. The tag is perfect and nothing
//     plays.
//   * The file is an MP4 whose index (the `moov` box) sits after the media
//     data, so a player has to pull the whole file before the first frame.
//   * The server ignores byte-range requests. Safari on iPhone and Mac will
//     not play an MP4 from a server that answers a Range request with a plain
//     200, so the video works in Chrome and is a dead box on every iPhone.
//   * og:video:type still says application/x-shockwave-flash, copied from the
//     ogp.me example. Flash has not run anywhere since 2020.
//   * Everything above is fine and the link still shows a still image on X,
//     because X reads twitter:player, not og:video. Google reads neither and
//     wants a VideoObject in JSON-LD.
//
// So this engine reads the tags the way the spec says to (arrays and all),
// then fetches the first bytes of the video itself and reads what it really
// is from the file header, not from the Content-Type or the extension.
//
// THE SPEC
//
// og:video and its structured properties are defined on ogp.me and have not
// changed since the protocol's 2010 release. A page may declare several
// videos: each og:video (or og:video:url) starts a new one, and the
// :secure_url, :type, :width, :height and :alt that follow belong to it.
// `parseMeta` in html.ts keeps only the first value of each key, which is
// right for og:title and wrong here, so this file reads the tags itself.

import { fetchUrl } from "./fetcher";
import { decodeEntities } from "./html";
import { extractJsonLd, walkNodes } from "./schema";
import { isPubliclyRoutable } from "./url";

/**
 * How much of a video we read. The ftyp and, on a fast-start file, the moov
 * box both sit in the first few hundred kilobytes, which is all the checks
 * need. Reading the rest would be downloading somebody's video to find out
 * whether it is a video.
 */
const VIDEO_PROBE_BYTES = 512 * 1024;

/** How much of the share image we read. Enough for any image header. */
const IMAGE_PROBE_BYTES = 256 * 1024;

/** Per-asset fetch budget. The page fetch already spent from the clock. */
const ASSET_TIMEOUT_MS = 8_000;

/**
 * Most og:video declarations a run fetches. Platforms use the first one, so
 * the first is the one that matters; the next two cover a page that offers a
 * file and a player, or two encodings.
 */
const MAX_VIDEOS_PROBED = 3;

/**
 * How far a declared size may drift from the file's own before we call it a
 * mismatch. Encoders round to even pixels, so exact equality is too strict.
 */
const ASPECT_TOLERANCE = 0.02;

/** Seconds a declared video:duration may differ from the file's. */
const DURATION_TOLERANCE_SECONDS = 2;

/** When these were last checked against the platforms' own documentation. */
export const OG_VIDEO_RULES_REVIEWED = "2026-11-04";

/** What the bytes at a video URL turned out to be. */
export type VideoFormat =
  | "mp4"
  | "quicktime"
  | "webm"
  | "matroska"
  | "ogg"
  | "hls"
  | "dash"
  | "mpeg-ts"
  | "flv"
  | "swf"
  | "html"
  | "image"
  | "unknown";

/**
 * How a format reaches a viewer.
 *
 * `file` is a single video file a browser's <video> element can be pointed at.
 * `stream` is a playlist or manifest that needs a streaming player. `player`
 * is an HTML page that embeds its own player, which is what twitter:player
 * wants and what YouTube puts in its own og:video.
 */
export type VideoKind = "file" | "stream" | "player" | "none";

export type Dimensions = { width: number; height: number };

export type VideoProbe = {
  /** HTTP status of the final response, after redirects. 0 when unreached. */
  status: number;
  /** True only when the response is 2xx AND the bytes are a video or player. */
  usable: boolean;
  /** The URL the bytes came from, after redirects. */
  finalUrl: string | null;
  contentType: string | null;
  format: VideoFormat;
  kind: VideoKind;
  /** Full size of the file, from Content-Range or Content-Length. */
  totalBytes: number | null;
  /**
   * Whether the server honoured our Range request with a 206. Null when it
   * does not apply: players and streams are not seeked by byte.
   */
  rangeSupported: boolean | null;
  /**
   * MP4 and QuickTime only: true when the index sits before the media data,
   * so playback can start before the whole file arrives. Null when unknown.
   */
  fastStart: boolean | null;
  /** Pixel size from the file's own track header. MP4 and QuickTime only. */
  dimensions: Dimensions | null;
  /** Length from the file's own movie header, in seconds. */
  durationSeconds: number | null;
  /** Why this video is not usable, in plain words. Null when it is fine. */
  problem: string | null;
};

export type OgVideo = {
  /** Zero-based position among the og:video declarations, in source order. */
  index: number;
  /** og:video or og:video:url, as written. Empty when only secure_url exists. */
  href: string;
  /** og:video:secure_url, as written. */
  secureHref: string | null;
  /** The address platforms will load: secure_url when present, else href. */
  url: string | null;
  declaredType: string | null;
  declaredWidth: string | null;
  declaredHeight: string | null;
  alt: string | null;
  /** Null when not fetched: past the cap, or no resolvable URL. */
  probe: VideoProbe | null;
};

export type ImageFormat =
  | "png"
  | "jpeg"
  | "gif"
  | "webp"
  | "avif"
  | "svg"
  | "html"
  | "unknown";

export type ImageProbe = {
  url: string;
  status: number;
  usable: boolean;
  format: ImageFormat;
  dimensions: Dimensions | null;
  bytes: number;
  problem: string | null;
};

export type TwitterPlayer = {
  card: string | null;
  player: string | null;
  width: string | null;
  height: string | null;
  stream: string | null;
  image: string | null;
};

export type VideoObjectSummary = {
  name: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  uploadDate: string | null;
  contentUrl: string | null;
  embedUrl: string | null;
  duration: string | null;
};

export type CheckStatus = "pass" | "warn" | "fail";

export type OgVideoCheck = {
  /** Stable machine id. Scripts key on this, so it never changes wording. */
  id: string;
  title: string;
  status: CheckStatus;
  /** What we found, and why it matters. Plain words. */
  detail: string;
  /** What to do about it. Absent on a pass. */
  fix?: string;
};

export type OgVideoReport = {
  /** True when the first og:video loads as a video file, stream, or player. */
  hasPlayableVideo: boolean;
  /** The og:video platforms will use: the first one declared. */
  primary: OgVideo | null;
  videos: OgVideo[];
  ogType: string | null;
  title: string | null;
  /** og:image, fetched. The poster most platforms show before play. */
  image: ImageProbe | null;
  /** The video:* properties of a video.* object type. */
  videoMeta: {
    duration: string | null;
    releaseDate: string | null;
    series: string | null;
    tags: string[];
  };
  twitter: TwitterPlayer;
  videoObject: VideoObjectSummary | null;
  checks: OgVideoCheck[];
  counts: { pass: number; warn: number; fail: number };
  /** og:video declarations found but not fetched, because of the cap. */
  notProbedCount: number;
  rulesReviewed: string;
};

// ── Tag reading ─────────────────────────────────────────────────────────────

/**
 * Reads one attribute out of a single tag's source text.
 *
 * @param tag - The raw tag, e.g. `<meta property="og:video" content="...">`.
 * @param name - The attribute name, case insensitive.
 */
function attr(tag: string, name: string): string | null {
  try {
    const quoted = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i");
    const match = quoted.exec(tag);
    if (match) return decodeEntities(match[2] ?? match[3] ?? "").trim();
    const bare = new RegExp(`\\b${name}\\s*=\\s*([^\\s"'>]+)`, "i").exec(tag);
    return bare ? decodeEntities(bare[1]).trim() : null;
  } catch {
    return null;
  }
}

/** One meta tag reduced to its key and value. */
type MetaPair = { key: string; value: string };

/**
 * Every `<meta>` that carries a key and a non-empty content, in source order.
 *
 * Accepts both `property` and `name` for every key: the spec says `property`,
 * and a large share of real sites write `name`, which every scraper reads.
 *
 * @param html - Raw HTML.
 */
function metaPairs(html: string): MetaPair[] {
  try {
    const tags = (html ?? "").match(/<meta\b[^>]*>/gi) ?? [];
    const pairs: MetaPair[] = [];
    for (const tag of tags) {
      const key = (attr(tag, "property") ?? attr(tag, "name") ?? "").toLowerCase();
      const value = attr(tag, "content");
      if (key.length === 0 || value === null || value.length === 0) continue;
      pairs.push({ key, value });
    }
    return pairs;
  } catch {
    return [];
  }
}

/** The first value of a key, or null. */
function firstOf(pairs: MetaPair[], key: string): string | null {
  return pairs.find((pair) => pair.key === key)?.value ?? null;
}

/**
 * Resolves an href against the page.
 *
 * @param href - As written.
 * @param baseUrl - The page URL.
 */
function resolveUrl(href: string | null, baseUrl: string): string | null {
  try {
    if (!href) return null;
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

/** A video being assembled from consecutive tags. */
type DraftVideo = {
  href: string;
  sawUrlProperty: boolean;
  secureHref: string | null;
  type: string | null;
  width: string | null;
  height: string | null;
  alt: string | null;
};

/** og:video's structured properties, mapped to the draft field they fill. */
const STRUCTURED: Record<string, "secureHref" | "type" | "width" | "height" | "alt"> = {
  "og:video:secure_url": "secureHref",
  "og:video:type": "type",
  "og:video:width": "width",
  "og:video:height": "height",
  "og:video:alt": "alt",
};

/**
 * Groups the og:video tags into videos, following the spec's array rule.
 *
 * Many sites write both og:video and og:video:url with the same address.
 * The spec calls them identical, so a url property right after an og:video
 * that carries the same address (or none) fills that video rather than
 * starting a second one. Reading it the literal way reports two videos where
 * the author meant one.
 *
 * @param pairs - The page's meta tags, in order.
 * @param baseUrl - The page URL.
 */
function parseVideos(pairs: MetaPair[], baseUrl: string): OgVideo[] {
  try {
    const drafts: DraftVideo[] = [];
    const blank = (href: string): DraftVideo => ({
      href,
      sawUrlProperty: false,
      secureHref: null,
      type: null,
      width: null,
      height: null,
      alt: null,
    });

    for (const { key, value } of pairs) {
      const current = drafts[drafts.length - 1];

      if (key === "og:video") {
        drafts.push(blank(value));
        continue;
      }

      if (key === "og:video:url") {
        if (
          current &&
          !current.sawUrlProperty &&
          (current.href === value || current.href.length === 0)
        ) {
          current.href = value;
          current.sawUrlProperty = true;
        } else {
          drafts.push({ ...blank(value), sawUrlProperty: true });
        }
        continue;
      }

      const field = STRUCTURED[key];
      if (!field) continue;

      // A structured property before any og:video still describes a video,
      // most often one declared only by its secure_url.
      const target = current ?? blank("");
      if (!current) drafts.push(target);
      target[field] ??= value;
    }

    return drafts.map((draft, index) => {
      const secure = resolveUrl(draft.secureHref, baseUrl);
      const plain = resolveUrl(draft.href, baseUrl);
      return {
        index,
        href: draft.href,
        secureHref: draft.secureHref,
        url: secure ?? plain,
        declaredType: draft.type,
        declaredWidth: draft.width,
        declaredHeight: draft.height,
        alt: draft.alt,
        probe: null,
      };
    });
  } catch {
    return [];
  }
}

/**
 * The first VideoObject node in the page's JSON-LD.
 *
 * @param html - Raw HTML.
 */
function readVideoObject(html: string): VideoObjectSummary | null {
  try {
    const text = (value: unknown): string | null => {
      if (typeof value === "string") return value.trim() || null;
      if (Array.isArray(value)) return text(value[0]);
      if (value && typeof value === "object") {
        const node = value as Record<string, unknown>;
        return text(node.url ?? node["@id"] ?? null);
      }
      return null;
    };

    for (const block of extractJsonLd(html).blocks) {
      for (const node of walkNodes(block.parsed)) {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        if (!types.some((type) => type === "VideoObject")) continue;
        return {
          name: text(node.name),
          description: text(node.description),
          thumbnailUrl: text(node.thumbnailUrl),
          uploadDate: text(node.uploadDate),
          contentUrl: text(node.contentUrl),
          embedUrl: text(node.embedUrl),
          duration: text(node.duration),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ── Byte reading ────────────────────────────────────────────────────────────

/**
 * Reads a big-endian unsigned 32-bit integer.
 *
 * @param bytes - The buffer.
 * @param offset - Where the integer starts.
 */
function u32(bytes: Uint8Array, offset: number): number {
  if (offset + 4 > bytes.length) return 0;
  return (
    ((bytes[offset] << 24) >>> 0) +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  );
}

/**
 * Four bytes as ASCII, for box types and magic numbers.
 *
 * @param bytes - The buffer.
 * @param offset - Where the four bytes start.
 */
function fourcc(bytes: Uint8Array, offset: number): string {
  if (offset + 4 > bytes.length) return "";
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

/**
 * The first bytes as text, for the formats that are text.
 *
 * @param bytes - The buffer.
 * @param length - How many bytes to read.
 */
function leadingText(bytes: Uint8Array, length: number): string {
  try {
    return new TextDecoder("utf-8")
      .decode(bytes.subarray(0, Math.min(length, bytes.length)))
      .replace(/^﻿/, "")
      .trimStart();
  } catch {
    return "";
  }
}

/**
 * Identifies a video URL's real format from its first bytes.
 *
 * @param bytes - The start of the response body.
 */
function sniffVideo(bytes: Uint8Array): VideoFormat {
  try {
    if (bytes.length < 4) return "unknown";

    if (fourcc(bytes, 4) === "ftyp") {
      const brand = fourcc(bytes, 8);
      // AVIF and HEIF images use the same container as MP4.
      if (/^(avi[fs]|heic|heix|mif1|msf1)$/.test(brand)) return "image";
      return brand === "qt  " ? "quicktime" : "mp4";
    }
    if (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    ) {
      // The EBML header names its document type near the start.
      return leadingText(bytes, 64).includes("webm") ? "webm" : "matroska";
    }
    if (fourcc(bytes, 0) === "OggS") return "ogg";
    if (fourcc(bytes, 0).startsWith("FLV")) return "flv";
    const magic3 = fourcc(bytes, 0).slice(0, 3);
    if (magic3 === "FWS" || magic3 === "CWS" || magic3 === "ZWS") return "swf";
    if (bytes[0] === 0x47 && bytes.length > 188 && bytes[188] === 0x47) {
      return "mpeg-ts";
    }
    if (sniffImage(bytes) !== "unknown" && sniffImage(bytes) !== "html") {
      return "image";
    }

    const text = leadingText(bytes, 2048);
    if (text.startsWith("#EXTM3U")) return "hls";
    if (/<MPD\b/.test(text)) return "dash";
    if (/^<(!doctype html|html|head|body|!--)/i.test(text)) return "html";

    return "unknown";
  } catch {
    return "unknown";
  }
}

/** How each format reaches a viewer. */
const KIND_OF: Record<VideoFormat, VideoKind> = {
  mp4: "file",
  quicktime: "file",
  webm: "file",
  matroska: "file",
  ogg: "file",
  flv: "file",
  swf: "file",
  "mpeg-ts": "file",
  hls: "stream",
  dash: "stream",
  html: "player",
  image: "none",
  unknown: "none",
};

/** One ISO base media box: where it starts, how long it is, what it is. */
type Box = { type: string; start: number; size: number; header: number };

/**
 * Lists the boxes laid end to end between two offsets.
 *
 * Stops at the first box that runs past the bytes we hold, and reports it,
 * so the caller can tell "the moov box is next but we did not read it" from
 * "there is no moov box".
 *
 * @param bytes - The buffer.
 * @param from - Offset of the first box.
 * @param to - Offset to stop at.
 */
function listBoxes(bytes: Uint8Array, from: number, to: number): Box[] {
  const boxes: Box[] = [];
  try {
    let offset = from;
    while (offset + 8 <= to && boxes.length < 512) {
      let size = u32(bytes, offset);
      const type = fourcc(bytes, offset + 4);
      let header = 8;
      if (size === 1) {
        // A 64-bit size follows. Anything past 4 GB is past what we hold.
        const high = u32(bytes, offset + 8);
        const low = u32(bytes, offset + 12);
        size = high > 0 ? Number.MAX_SAFE_INTEGER : low;
        header = 16;
      } else if (size === 0) {
        size = Number.MAX_SAFE_INTEGER;
      }
      if (size < header) break;
      boxes.push({ type, start: offset, size, header });
      if (size === Number.MAX_SAFE_INTEGER) break;
      offset += size;
    }
  } catch {
    // Return what was listed.
  }
  return boxes;
}

/**
 * Reads what an MP4 or QuickTime file says about itself from its first bytes:
 * whether it is laid out for fast start, its pixel size, and its length.
 *
 * @param bytes - The start of the file.
 */
function readMp4(bytes: Uint8Array): {
  fastStart: boolean | null;
  dimensions: Dimensions | null;
  durationSeconds: number | null;
} {
  const unknown = { fastStart: null, dimensions: null, durationSeconds: null };
  try {
    const top = listBoxes(bytes, 0, bytes.length);
    const moovAt = top.findIndex((box) => box.type === "moov");
    const mdatAt = top.findIndex((box) => box.type === "mdat");

    let fastStart: boolean | null = null;
    if (moovAt >= 0 && (mdatAt < 0 || moovAt < mdatAt)) fastStart = true;
    else if (mdatAt >= 0 && (moovAt < 0 || mdatAt < moovAt)) fastStart = false;

    const moov = moovAt >= 0 ? top[moovAt] : null;
    if (!moov || moov.start + moov.size > bytes.length) {
      return { ...unknown, fastStart };
    }

    let durationSeconds: number | null = null;
    let dimensions: Dimensions | null = null;
    const children = listBoxes(bytes, moov.start + moov.header, moov.start + moov.size);

    for (const child of children) {
      const body = child.start + child.header;

      if (child.type === "mvhd") {
        const version = bytes[body];
        const timescale = u32(bytes, body + (version === 1 ? 20 : 12));
        const duration =
          version === 1
            ? u32(bytes, body + 24) * 2 ** 32 + u32(bytes, body + 28)
            : u32(bytes, body + 16);
        if (timescale > 0 && duration > 0) {
          durationSeconds = Math.round((duration / timescale) * 10) / 10;
        }
      }

      if (child.type === "trak" && !dimensions) {
        const trackBoxes = listBoxes(bytes, body, child.start + child.size);
        const tkhd = trackBoxes.find((box) => box.type === "tkhd");
        if (tkhd) {
          // Width and height are the last 8 bytes of tkhd, as 16.16 fixed point.
          const end = tkhd.start + tkhd.size;
          const width = u32(bytes, end - 8) / 65536;
          const height = u32(bytes, end - 4) / 65536;
          if (width > 0 && height > 0) {
            dimensions = { width: Math.round(width), height: Math.round(height) };
          }
        }
      }
    }

    return { fastStart, dimensions, durationSeconds };
  } catch {
    return unknown;
  }
}

/**
 * Identifies an image's real format from its first bytes.
 *
 * @param bytes - The start of the file.
 */
function sniffImage(bytes: Uint8Array): ImageFormat {
  try {
    if (bytes.length < 4) return "unknown";
    if (bytes[0] === 0x89 && fourcc(bytes, 1).startsWith("PNG")) return "png";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
    if (fourcc(bytes, 0) === "GIF8") return "gif";
    if (fourcc(bytes, 0) === "RIFF" && fourcc(bytes, 8) === "WEBP") return "webp";
    if (fourcc(bytes, 4) === "ftyp" && fourcc(bytes, 8).startsWith("avi")) {
      return "avif";
    }
    const text = leadingText(bytes, 1024);
    if (/^(<\?xml[^>]*>\s*)?<svg\b/i.test(text)) return "svg";
    if (/^<(!doctype html|html|head|body)/i.test(text)) return "html";
    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Reads an image's pixel size out of its header.
 *
 * @param bytes - The start of the file.
 * @param format - Its sniffed format.
 */
function readImageSize(bytes: Uint8Array, format: ImageFormat): Dimensions | null {
  try {
    const le16 = (at: number) => bytes[at] | (bytes[at + 1] << 8);
    const le24 = (at: number) => le16(at) | (bytes[at + 2] << 16);

    if (format === "png") {
      return { width: u32(bytes, 16), height: u32(bytes, 20) };
    }
    if (format === "gif") {
      return { width: le16(6), height: le16(8) };
    }
    if (format === "webp") {
      const chunk = fourcc(bytes, 12);
      if (chunk === "VP8X") {
        return { width: le24(24) + 1, height: le24(27) + 1 };
      }
      if (chunk === "VP8L") {
        const b = (at: number) => bytes[21 + at];
        return {
          width: (b(0) | ((b(1) & 0x3f) << 8)) + 1,
          height: (((b(1) & 0xc0) >> 6) | (b(2) << 2) | ((b(3) & 0x0f) << 10)) + 1,
        };
      }
      if (chunk === "VP8 ") {
        return { width: le16(26) & 0x3fff, height: le16(28) & 0x3fff };
      }
      return null;
    }
    if (format === "jpeg") {
      // Walk the markers to the first start-of-frame, which carries the size.
      let offset = 2;
      while (offset + 9 < bytes.length) {
        if (bytes[offset] !== 0xff) return null;
        const marker = bytes[offset + 1];
        if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
          offset += 2;
          continue;
        }
        const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
        const isFrame =
          marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isFrame) {
          return {
            height: (bytes[offset + 5] << 8) | bytes[offset + 6],
            width: (bytes[offset + 7] << 8) | bytes[offset + 8],
          };
        }
        offset += 2 + length;
      }
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Fetching ────────────────────────────────────────────────────────────────

/**
 * The full size of a response, from Content-Range when ranged, else
 * Content-Length.
 *
 * @param headers - Lowercased response headers.
 */
function totalSizeOf(headers: Record<string, string>): number | null {
  try {
    const range = headers["content-range"];
    const fromRange = range ? /\/(\d+)\s*$/.exec(range)?.[1] : undefined;
    const value = Number(fromRange ?? headers["content-length"] ?? NaN);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

/**
 * Fetches the start of a video and reads what it really is.
 *
 * Asks for a byte range, the way Safari does, so the same request answers two
 * questions: what the file is, and whether the server can serve it in pieces.
 *
 * @param url - Absolute URL of the video.
 */
async function probeVideo(url: string): Promise<VideoProbe> {
  const unreachable: VideoProbe = {
    status: 0,
    usable: false,
    finalUrl: null,
    contentType: null,
    format: "unknown",
    kind: "none",
    totalBytes: null,
    rangeSupported: null,
    fastStart: null,
    dimensions: null,
    durationSeconds: null,
    problem: "We could not fetch this address.",
  };

  try {
    // The page was guarded before we read it, but a video URL is content from
    // that page and can point anywhere, so it gets its own check.
    if (!(await isPubliclyRoutable(url))) {
      return {
        ...unreachable,
        problem:
          "This address is not on the public internet, so no platform can load it and we did not try.",
      };
    }

    const response = await fetchUrl({
      url,
      timeoutMs: ASSET_TIMEOUT_MS,
      maxBytes: VIDEO_PROBE_BYTES,
      binary: true,
      headers: { Range: `bytes=0-${VIDEO_PROBE_BYTES - 1}` },
    });

    if (!response.ok) {
      return {
        ...unreachable,
        finalUrl: response.finalUrl,
        problem:
          response.reason === "timeout"
            ? "The server took too long to start sending this video."
            : "We could not connect to the server this video is on.",
      };
    }

    const contentType = response.headers["content-type"] ?? null;
    const raw = response.raw ?? new Uint8Array();
    const format = sniffVideo(raw);
    const kind = KIND_OF[format];
    const base = {
      status: response.status,
      finalUrl: response.finalUrl,
      contentType,
      format,
      kind,
      totalBytes: totalSizeOf(response.headers),
      rangeSupported:
        kind === "file" ? response.status === 206 : null,
      fastStart: null,
      dimensions: null,
      durationSeconds: null,
    };

    if (response.status >= 400) {
      return {
        ...base,
        usable: false,
        rangeSupported: null,
        problem: `The server answered HTTP ${response.status}, so there is no video at this address.`,
      };
    }

    if (response.bytes === 0) {
      return { ...base, usable: false, problem: "The server sent an empty file." };
    }

    if (format === "image") {
      return {
        ...base,
        usable: false,
        problem:
          "This address serves an image, not a video. og:video should point at the video; the still belongs in og:image.",
      };
    }

    if (format === "unknown") {
      return {
        ...base,
        usable: false,
        problem:
          "The file does not begin like any video format, playlist, or player page we know.",
      };
    }

    const mp4 =
      format === "mp4" || format === "quicktime"
        ? readMp4(raw)
        : { fastStart: null, dimensions: null, durationSeconds: null };

    return { ...base, ...mp4, usable: true, problem: null };
  } catch {
    return unreachable;
  }
}

/**
 * Fetches the share image and reads its real format and size.
 *
 * @param url - Absolute URL of the image.
 */
async function probeImage(url: string): Promise<ImageProbe> {
  const failed: ImageProbe = {
    url,
    status: 0,
    usable: false,
    format: "unknown",
    dimensions: null,
    bytes: 0,
    problem: "We could not fetch this image.",
  };

  try {
    if (!(await isPubliclyRoutable(url))) {
      return {
        ...failed,
        problem: "This image is not on the public internet, so no platform can load it.",
      };
    }

    const response = await fetchUrl({
      url,
      timeoutMs: ASSET_TIMEOUT_MS,
      maxBytes: IMAGE_PROBE_BYTES,
      binary: true,
    });

    if (!response.ok) {
      return {
        ...failed,
        problem:
          response.reason === "timeout"
            ? "The server took too long to send this image."
            : failed.problem,
      };
    }

    const raw = response.raw ?? new Uint8Array();
    const format = sniffImage(raw);
    const bytes = totalSizeOf(response.headers) ?? response.bytes;
    const base = {
      url,
      status: response.status,
      format,
      dimensions: readImageSize(raw, format),
      bytes,
    };

    if (response.status >= 400) {
      return {
        ...base,
        usable: false,
        problem: `The server answered HTTP ${response.status}, so there is no image at this address.`,
      };
    }
    if (format === "html") {
      return {
        ...base,
        usable: false,
        problem:
          "The server answered with an HTML page instead of an image, usually a catch-all route answering a path that does not exist.",
      };
    }
    if (format === "unknown") {
      return {
        ...base,
        usable: false,
        problem: "The file does not begin like any image format a platform can show.",
      };
    }
    return { ...base, usable: true, problem: null };
  } catch {
    return failed;
  }
}

// ── Checks ──────────────────────────────────────────────────────────────────

/**
 * A declared size, as positive integers, or null.
 *
 * @param width - og:video:width as written.
 * @param height - og:video:height as written.
 */
function declaredSize(width: string | null, height: string | null): Dimensions | null {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

/** MIME types we expect each sniffed format to be declared or served as. */
const MIME_FOR: Partial<Record<VideoFormat, RegExp>> = {
  mp4: /^video\/mp4$/,
  quicktime: /^video\/(quicktime|mp4)$/,
  webm: /^video\/webm$/,
  matroska: /^video\/(x-matroska|webm)$/,
  ogg: /^video\/ogg$/,
  hls: /^(application\/(vnd\.apple\.mpegurl|x-mpegurl)|audio\/mpegurl)$/,
  dash: /^application\/dash\+xml$/,
  "mpeg-ts": /^video\/mp2t$/,
  flv: /^video\/x-flv$/,
  swf: /^application\/x-shockwave-flash$/,
  html: /^text\/html$/,
};

/** Lowercase MIME type without parameters. */
function bareMime(value: string | null): string {
  return (value ?? "").split(";")[0].trim().toLowerCase();
}

/** Human labels for each format, for check copy. */
export const FORMAT_LABELS: Record<VideoFormat, string> = {
  mp4: "MP4",
  quicktime: "QuickTime (.mov)",
  webm: "WebM",
  matroska: "Matroska (.mkv)",
  ogg: "Ogg",
  hls: "HLS playlist (.m3u8)",
  dash: "DASH manifest (.mpd)",
  "mpeg-ts": "MPEG transport stream (.ts)",
  flv: "Flash video (.flv)",
  swf: "Flash (.swf)",
  html: "HTML player page",
  image: "image",
  unknown: "unknown",
};

/**
 * Builds the check list.
 *
 * Checks that are about the video file are only emitted when there is a file
 * to talk about. A page with no og:video gets one clear failure, not eight
 * restatements of it.
 */
function buildChecks(params: {
  videos: OgVideo[];
  ogType: string | null;
  image: ImageProbe | null;
  imageDeclared: boolean;
  videoMeta: OgVideoReport["videoMeta"];
  twitter: TwitterPlayer;
  videoObject: VideoObjectSummary | null;
}): OgVideoCheck[] {
  const { videos, ogType, image, imageDeclared, videoMeta, twitter, videoObject } =
    params;
  const checks: OgVideoCheck[] = [];

  try {
    const primary = videos[0] ?? null;
    const probe = primary?.probe ?? null;

    // 1. Declared at all.
    if (!primary) {
      const elsewhere = [
        twitter.player ? "a twitter:player" : null,
        videoObject ? "a VideoObject in JSON-LD" : null,
      ].filter(Boolean);
      checks.push({
        id: "video-declared",
        title: "No og:video on this page",
        status: "fail",
        detail:
          elsewhere.length > 0
            ? `The page has ${elsewhere.join(" and ")}, but no og:video, so Facebook, LinkedIn, Discord, Slack and the rest of the Open Graph readers see a page with no video.`
            : "Nothing in the head declares a video, so a shared link will show as a still card at best.",
        fix: '<meta property="og:video" content="https://example.com/clip.mp4"> in <head>, followed by og:video:type, og:video:width and og:video:height.',
      });
    } else if (!primary.url) {
      checks.push({
        id: "video-declared",
        title: "og:video has no usable address",
        status: "fail",
        detail: `The page declares a video, but "${primary.href || primary.secureHref || ""}" is not an address we could resolve.`,
        fix: "Use an absolute https URL in og:video. Platforms fetch it from their own servers, so a relative path resolves to nothing.",
      });
    } else {
      checks.push({
        id: "video-declared",
        title: "og:video is declared",
        status: "pass",
        detail:
          videos.length > 1
            ? `The page declares ${videos.length} videos. Platforms use the first, so that is the one checked in detail below.`
            : "The page declares one video, which is what platforms will try to play.",
      });
    }

    // 2. It loads, and it is a video.
    if (primary?.url && probe) {
      if (probe.usable) {
        checks.push({
          id: "video-loads",
          title: "The video loads",
          status: "pass",
          detail: `The address answered HTTP ${probe.status} and its bytes are ${probe.kind === "player" ? "an HTML player page" : `a real ${FORMAT_LABELS[probe.format]}`}, read from the file itself rather than from its name or Content-Type.`,
        });
      } else {
        checks.push({
          id: "video-loads",
          title: "The video does not load",
          status: "fail",
          detail: probe.problem ?? "We could not load the video.",
          fix:
            probe.status >= 400
              ? "Deploy the file to that path, or point og:video at where it actually lives."
              : "Point og:video at the video file itself, served with a video Content-Type.",
        });
      }
    }

    // 3. https. Platforms serve their own pages over https, and browsers block
    //    http media on an https page.
    if (primary?.url) {
      if (primary.url.startsWith("https://")) {
        checks.push({
          id: "video-https",
          title: "The video is served over https",
          status: "pass",
          detail: primary.secureHref
            ? "og:video:secure_url gives an https address, which is the one platforms load."
            : "og:video is already an https address, so it can play inside any https page.",
        });
      } else {
        checks.push({
          id: "video-https",
          title: "The video is only on http",
          status: "fail",
          detail:
            "Every major platform shows links inside an https page, and browsers block http video there as mixed content. The player will not start.",
          fix: "Serve the file over https and use that address in og:video, or add og:video:secure_url with the https address.",
        });
      }
    }

    // 4. og:video:type, declared and true.
    if (primary?.url) {
      const declared = bareMime(primary.declaredType);
      const served = bareMime(probe?.contentType ?? null);
      const expected = probe?.usable ? MIME_FOR[probe.format] : undefined;

      if (declared === "application/x-shockwave-flash") {
        checks.push({
          id: "video-type",
          title: "og:video:type says Flash",
          status: "fail",
          detail:
            "application/x-shockwave-flash is the example on ogp.me, and it is often copied from there. Flash has not run in any browser since the end of 2020, so a platform that trusts this type will not try to play the video.",
          fix: 'Set og:video:type to the real format, which for an MP4 is <meta property="og:video:type" content="video/mp4">.',
        });
      } else if (!declared) {
        checks.push({
          id: "video-type",
          title: "No og:video:type",
          status: "warn",
          detail:
            "Platforms use og:video:type to decide whether they can play the video before they fetch it. Without it, some skip the player and show the image.",
          fix: `<meta property="og:video:type" content="${probe?.usable && probe.format === "html" ? "text/html" : "video/mp4"}">`,
        });
      } else if (expected && !expected.test(declared)) {
        checks.push({
          id: "video-type",
          title: "og:video:type does not match the file",
          status: "warn",
          detail: `The tag says ${declared}, but the file is ${FORMAT_LABELS[probe?.format ?? "unknown"]}. A platform that trusts the tag will hand the file to the wrong player.`,
          fix: "Set og:video:type to the file's real type.",
        });
      } else if (expected && served && !expected.test(served)) {
        checks.push({
          id: "video-type",
          title: "The server sends the wrong Content-Type",
          status: "warn",
          detail: `og:video:type is right, but the server labels the file ${served}. Browsers and platform players read the header, and some refuse to play a video sent as ${served}.`,
          fix: `Configure the server or CDN to send this file as ${declared}.`,
        });
      } else {
        checks.push({
          id: "video-type",
          title: "og:video:type matches the file",
          status: "pass",
          detail: probe?.usable
            ? `The tag says ${declared}, and the file matches: ${FORMAT_LABELS[probe.format]}.`
            : `The tag says ${declared}.`,
        });
      }
    }

    // 5. A format that plays inline.
    if (probe?.usable) {
      const format = probe.format;
      if (format === "mp4" || format === "webm") {
        checks.push({
          id: "video-format",
          title: `${FORMAT_LABELS[format]} plays everywhere`,
          status: "pass",
          detail: `${FORMAT_LABELS[format]} plays in every current browser's own player, so any platform that plays video inline can play this.`,
        });
      } else if (format === "swf" || format === "flv") {
        checks.push({
          id: "video-format",
          title: "This is a Flash file",
          status: "fail",
          detail: "Nothing has played Flash since the end of 2020. No platform will play this video.",
          fix: "Re-encode to MP4 (H.264 video, AAC audio) and point og:video at that.",
        });
      } else if (format === "html") {
        checks.push({
          id: "video-format",
          title: "og:video is a player page, not a file",
          status: "warn",
          detail:
            "This address serves an HTML page with its own player. That is what twitter:player wants, and big video hosts use it in og:video too, but platforms only embed a third-party player for hosts they already trust. Everywhere else the link shows the image instead.",
          fix: "Put the MP4 itself in og:video, with og:video:type video/mp4, and keep the player page in twitter:player.",
        });
      } else {
        checks.push({
          id: "video-format",
          title: `${FORMAT_LABELS[format]} does not play everywhere`,
          status: "warn",
          detail:
            format === "hls"
              ? "Only Safari plays an HLS playlist natively. Other browsers need a script player, which a platform's preview does not load, so most will show the image."
              : `${FORMAT_LABELS[format]} is not a format every browser plays on its own, so on many platforms the preview will not start.`,
          fix: "Offer an MP4 (H.264 video, AAC audio) in og:video. Keep the stream for your own player.",
        });
      }
    }

    // 6. Declared dimensions, and whether the file agrees.
    if (primary?.url) {
      const declared = declaredSize(primary.declaredWidth, primary.declaredHeight);
      const real = probe?.dimensions ?? null;
      if (!declared) {
        checks.push({
          id: "video-dimensions",
          title: "No usable og:video:width and og:video:height",
          status: "warn",
          detail:
            primary.declaredWidth || primary.declaredHeight
              ? `The page gives width "${primary.declaredWidth ?? ""}" and height "${primary.declaredHeight ?? ""}", which are not both whole numbers of pixels.`
              : "Platforms size the player box from these two tags before the video loads. Without them it is guessed, and a vertical video often ends up letterboxed in a wide box.",
          fix: real
            ? `<meta property="og:video:width" content="${real.width}"> and <meta property="og:video:height" content="${real.height}">, the file's real size.`
            : 'Add og:video:width and og:video:height in pixels, e.g. content="1280" and content="720".',
        });
      } else if (
        real &&
        Math.abs(declared.width / declared.height - real.width / real.height) >
          ASPECT_TOLERANCE * (real.width / real.height)
      ) {
        checks.push({
          id: "video-dimensions",
          title: "The declared shape is not the video's",
          status: "warn",
          detail: `The tags say ${declared.width}x${declared.height}, but the file is ${real.width}x${real.height}. The player box is sized from the tags, so the video will play with black bars or be cropped.`,
          fix: `Set og:video:width to ${real.width} and og:video:height to ${real.height}.`,
        });
      } else {
        checks.push({
          id: "video-dimensions",
          title: "Width and height are declared",
          status: "pass",
          detail: !real
            ? `The tags say ${declared.width}x${declared.height}.`
            : real.width === declared.width && real.height === declared.height
              ? `The tags say ${declared.width}x${declared.height}, and the file's own header agrees.`
              : `The tags say ${declared.width}x${declared.height} and the file is ${real.width}x${real.height}. Same shape, so the player box fits the video.`,
        });
      }
    }

    // 7. Byte ranges. Files only.
    if (probe?.usable && probe.kind === "file" && probe.rangeSupported !== null) {
      checks.push(
        probe.rangeSupported
          ? {
              id: "byte-ranges",
              title: "The server can send the video in pieces",
              status: "pass",
              detail:
                "We asked for the first part of the file and got HTTP 206 with just that part. Safari needs this to play a video at all, and every player uses it to seek.",
            }
          : {
              id: "byte-ranges",
              title: "The server ignores byte ranges",
              status: "warn",
              detail:
                "We asked for the first part of the file and the server sent HTTP 200 with the whole thing. Safari on iPhone and Mac will not play an MP4 from a server that does this, and no player can seek in it.",
              fix: "Serve the file from a host or CDN that supports Range requests. Most object stores do by default; a file streamed through your own app server often does not.",
            },
      );
    }

    // 8. Fast start. MP4 and QuickTime only, and only when we could tell.
    if (probe?.usable && probe.fastStart !== null) {
      checks.push(
        probe.fastStart
          ? {
              id: "fast-start",
              title: "The video can start before it finishes downloading",
              status: "pass",
              detail:
                "The file's index (the moov box) comes before the video data, so a player can start as soon as the first part arrives.",
            }
          : {
              id: "fast-start",
              title: "The whole file must download before it plays",
              status: "warn",
              detail:
                "The file's index (the moov box) sits after the video data. A player cannot start until it has reached the end, so the preview sits on a spinner, and some platforms give up first.",
              fix: "Re-mux with the index moved to the front. With ffmpeg: ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4. Nothing is re-encoded.",
            },
      );
    }

    // 9. The share image, which is the poster and the fallback both.
    if (!imageDeclared) {
      checks.push({
        id: "video-image",
        title: "No og:image",
        status: "fail",
        detail:
          "Platforms show og:image as the poster before the video plays, and on their own as the whole card wherever they do not play video. Without one, the card has no picture at all.",
        fix: '<meta property="og:image" content="https://example.com/poster.jpg">, a 1200x630 still from the video.',
      });
    } else if (image && !image.usable) {
      checks.push({
        id: "video-image",
        title: "og:image does not load",
        status: "fail",
        detail: `${image.problem ?? "We could not load it."} This is the poster before the video plays and the whole card where it does not.`,
        fix: "Point og:image at an absolute https URL of a JPEG or PNG that loads.",
      });
    } else if (image) {
      checks.push({
        id: "video-image",
        title: "og:image loads",
        status: "pass",
        detail: image.dimensions
          ? `A ${image.dimensions.width}x${image.dimensions.height} ${image.format.toUpperCase()}. It is the poster before the video plays and the card wherever it does not.`
          : `A ${image.format.toUpperCase()}. It is the poster before the video plays and the card wherever it does not.`,
      });
    }

    // 10. og:type.
    if (primary) {
      if ((ogType ?? "").toLowerCase().startsWith("video.")) {
        checks.push({
          id: "og-type",
          title: `og:type is ${ogType}`,
          status: "pass",
          detail: "The page says its object is a video, so the video:* properties apply and readers that sort links by type will treat it as one.",
        });
      } else {
        checks.push({
          id: "og-type",
          title: ogType ? `og:type is ${ogType}, not a video type` : "No og:type",
          status: "warn",
          detail:
            "og:type is how a page tells a reader what the object is. A video page should say video.movie, video.episode, video.tv_show or video.other, and some readers decide whether to embed a player from it.",
          fix: '<meta property="og:type" content="video.other">',
        });
      }
    }

    // 11. video:duration, when given.
    if (videoMeta.duration !== null) {
      const declared = Number(videoMeta.duration);
      const real = probe?.durationSeconds ?? null;
      if (!Number.isInteger(declared) || declared < 1) {
        checks.push({
          id: "video-duration",
          title: "video:duration is not a whole number of seconds",
          status: "warn",
          detail: `The spec asks for an integer of 1 or more, in seconds. The page gives "${videoMeta.duration}".`,
          fix: real
            ? `<meta property="video:duration" content="${Math.round(real)}">`
            : 'Give the length in whole seconds, e.g. content="94".',
        });
      } else if (real !== null && Math.abs(real - declared) > DURATION_TOLERANCE_SECONDS) {
        checks.push({
          id: "video-duration",
          title: "video:duration does not match the file",
          status: "warn",
          detail: `The tag says ${declared} seconds, but the file runs ${real}. Anything that shows a running time from the tag will show the wrong one.`,
          fix: `<meta property="video:duration" content="${Math.round(real)}">`,
        });
      } else {
        checks.push({
          id: "video-duration",
          title: "video:duration is set",
          status: "pass",
          detail: real !== null
            ? `${declared} seconds, which matches the file.`
            : `${declared} seconds.`,
        });
      }
    }

    // 12. X reads twitter:player, never og:video.
    if (twitter.card === "player") {
      const missing = [
        twitter.player ? null : "twitter:player",
        twitter.width ? null : "twitter:player:width",
        twitter.height ? null : "twitter:player:height",
      ].filter(Boolean);
      if (!twitter.player) {
        checks.push({
          id: "twitter-player",
          title: "twitter:card is player, but there is no twitter:player",
          status: "fail",
          detail: "X was told to expect a player and was not given one, so it will not render the card.",
          fix: '<meta name="twitter:player" content="https://example.com/embed/clip"> pointing at an https page that plays the video.',
        });
      } else if (!twitter.player.startsWith("https://") || missing.length > 0) {
        checks.push({
          id: "twitter-player",
          title: "The X player card is incomplete",
          status: "warn",
          detail: !twitter.player.startsWith("https://")
            ? "twitter:player must be an https address. X will not frame an http page."
            : `The player card is missing ${missing.join(" and ")}, which X needs to size the frame.`,
          fix: "Use an https twitter:player, with twitter:player:width and twitter:player:height in pixels.",
        });
      } else {
        checks.push({
          id: "twitter-player",
          title: "X has a player card",
          status: "pass",
          detail: "twitter:card is player, with an https twitter:player and its size, so X can play the video in the timeline.",
        });
      }
    } else if (primary) {
      checks.push({
        id: "twitter-player",
        title: "X will show a still, not the video",
        status: "warn",
        detail: `X does not read og:video. It plays video in a card only through twitter:card set to player, and this page ${twitter.card ? `sets twitter:card to ${twitter.card}` : "sets no twitter:card"}, so on X the link shows the image.`,
        fix: 'Add <meta name="twitter:card" content="player">, twitter:player with an https page that plays the video, and twitter:player:width and twitter:player:height.',
      });
    }

    // 13. Google reads VideoObject, not og:video.
    if (!videoObject) {
      if (primary) {
        checks.push({
          id: "video-object",
          title: "No VideoObject for Google",
          status: "warn",
          detail:
            "Google does not read og:video. Video results, the video tab and key moments come from a VideoObject in the page's JSON-LD, and this page has none.",
          fix: "Add a VideoObject with at least name, thumbnailUrl and uploadDate, plus contentUrl pointing at the file.",
        });
      }
    } else {
      const missing = [
        videoObject.name ? null : "name",
        videoObject.thumbnailUrl ? null : "thumbnailUrl",
        videoObject.uploadDate ? null : "uploadDate",
      ].filter(Boolean);
      const noAddress = !videoObject.contentUrl && !videoObject.embedUrl;
      if (missing.length > 0 || noAddress) {
        checks.push({
          id: "video-object",
          title: "The VideoObject is incomplete",
          status: "warn",
          detail:
            missing.length > 0
              ? `Google requires name, thumbnailUrl and uploadDate on a VideoObject. This one is missing ${missing.join(", ")}, so it cannot appear as a video result.`
              : "The VideoObject has neither contentUrl nor embedUrl, so Google cannot fetch the video to index what is in it.",
          fix: missing.length > 0
            ? `Add ${missing.join(", ")} to the VideoObject.`
            : "Add contentUrl pointing at the video file.",
        });
      } else {
        checks.push({
          id: "video-object",
          title: "Google has a VideoObject",
          status: "pass",
          detail: "The page's JSON-LD carries a VideoObject with name, thumbnailUrl, uploadDate and an address for the video, which is what Google needs to list it as a video.",
        });
      }
    }

    return checks;
  } catch {
    return checks;
  }
}

/**
 * Runs the full og:video check against one page.
 *
 * The caller has already fetched the HTML through the toolkit's guarded
 * fetcher; this function owns every request after that.
 *
 * @param params - The page HTML and the URL it came from.
 */
export async function checkOgVideo(params: {
  html: string;
  url: string;
}): Promise<OgVideoReport> {
  const { html, url } = params;

  const empty: OgVideoReport = {
    hasPlayableVideo: false,
    primary: null,
    videos: [],
    ogType: null,
    title: null,
    image: null,
    videoMeta: { duration: null, releaseDate: null, series: null, tags: [] },
    twitter: { card: null, player: null, width: null, height: null, stream: null, image: null },
    videoObject: null,
    checks: [],
    counts: { pass: 0, warn: 0, fail: 0 },
    notProbedCount: 0,
    rulesReviewed: OG_VIDEO_RULES_REVIEWED,
  };

  try {
    const pairs = metaPairs(html);
    const declared = parseVideos(pairs, url);
    const imageUrl = resolveUrl(
      firstOf(pairs, "og:image:secure_url") ??
        firstOf(pairs, "og:image") ??
        firstOf(pairs, "og:image:url"),
      url,
    );

    // The same file declared twice costs one fetch.
    const toProbe = declared.slice(0, MAX_VIDEOS_PROBED);
    const uniqueUrls = [
      ...new Set(toProbe.map((video) => video.url).filter((u): u is string => !!u)),
    ];

    const [probes, image] = await Promise.all([
      Promise.all(uniqueUrls.map(async (u) => [u, await probeVideo(u)] as const)),
      imageUrl ? probeImage(imageUrl) : Promise.resolve(null),
    ]);
    const probeByUrl = new Map(probes);

    const videos = declared.map((video, index) =>
      index < MAX_VIDEOS_PROBED && video.url
        ? { ...video, probe: probeByUrl.get(video.url) ?? null }
        : video,
    );

    const ogType = firstOf(pairs, "og:type");
    const videoMeta = {
      duration: firstOf(pairs, "video:duration"),
      releaseDate: firstOf(pairs, "video:release_date"),
      series: firstOf(pairs, "video:series"),
      tags: pairs.filter((pair) => pair.key === "video:tag").map((pair) => pair.value),
    };
    const twitter: TwitterPlayer = {
      card: firstOf(pairs, "twitter:card")?.toLowerCase() ?? null,
      player: resolveUrl(firstOf(pairs, "twitter:player"), url),
      width: firstOf(pairs, "twitter:player:width"),
      height: firstOf(pairs, "twitter:player:height"),
      stream: resolveUrl(firstOf(pairs, "twitter:player:stream"), url),
      image: resolveUrl(firstOf(pairs, "twitter:image"), url),
    };
    const videoObject = readVideoObject(html);

    const checks = buildChecks({
      videos,
      ogType,
      image,
      imageDeclared: imageUrl !== null,
      videoMeta,
      twitter,
      videoObject,
    });

    const primary = videos[0] ?? null;

    return {
      hasPlayableVideo: primary?.probe?.usable === true,
      primary,
      videos,
      ogType,
      title: firstOf(pairs, "og:title"),
      image,
      videoMeta,
      twitter,
      videoObject,
      checks,
      counts: {
        pass: checks.filter((check) => check.status === "pass").length,
        warn: checks.filter((check) => check.status === "warn").length,
        fail: checks.filter((check) => check.status === "fail").length,
      },
      notProbedCount: Math.max(0, declared.length - MAX_VIDEOS_PROBED),
      rulesReviewed: OG_VIDEO_RULES_REVIEWED,
    };
  } catch {
    return empty;
  }
}
