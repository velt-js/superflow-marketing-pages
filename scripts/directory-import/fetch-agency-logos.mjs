#!/usr/bin/env node
// Fetches a real logo for every agency in the directory and caches it.
//
// WHY THIS EXISTS
//
// Every scraped record's `logoUrl` points at the SOURCE directory's
// avatar: an Awwwards profile picture, a Semrush crop, or nothing at all
// for D&AD. Rendered at 44px in the category grid, those read as grey
// squares - they were uploaded to be seen at a different size, in a
// different frame, on somebody else's site. This script goes to the
// agency's own homepage and takes the mark the agency itself publishes.
//
// WHAT IT PREFERS, AND WHY
//
//   1. apple-touch-icon - square by specification, at least 120px, and
//      designed to sit on a coloured tile. Almost always the real mark.
//   2. <link rel="icon"> at the largest declared size.
//   3. /favicon.ico - the implicit fallback every browser tries.
//   4. og:image / twitter:image, but ONLY when it comes back square.
//
// That order is not the obvious one. og:image is the best-looking image
// on most sites and the first thing you reach for - but it is a SOCIAL
// CARD, and in this dataset every single one sampled came back 1200x630.
// Dropped into a 44px square logo slot it is either squashed or cropped
// to a corner of a background photograph, which is worse than the grey
// square this script exists to replace. So candidates are ranked on
// SQUARENESS first and a wide image is refused outright: an agency with
// no square mark anywhere gets the monogram tile, which at least looks
// deliberate. A site that happens to serve a square og:image (a logo on
// a plain ground, which some studios do) still gets it.
//
// Nothing is resized or re-encoded: this script has no image toolchain
// and adding one for a few hundred logos would be a dependency the repo
// does not otherwise need. It picks the best candidate AT OR ABOVE the
// target edge and stores it as served, recording the real dimensions read
// out of the file header. `next/image` does the resizing at render time,
// which is what it is for.
//
// USAGE
//
//   node scripts/directory-import/fetch-agency-logos.mjs
//   node scripts/directory-import/fetch-agency-logos.mjs --limit 20
//   node scripts/directory-import/fetch-agency-logos.mjs --slug locomotive
//   node scripts/directory-import/fetch-agency-logos.mjs --only-missing
//
// Writes public/agency-logos/<slug>.<ext> and rewrites
// lib/directory/data/logos.json wholesale, exactly like the importers
// rewrite their own data files. `--only-missing` is the exception: it
// merges into the existing manifest instead, for topping up after a run
// that hit rate limits.
//
// Standalone by the same convention as the other importers: no imports
// from the TypeScript sources, its own copies of the small helpers.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const DATA_DIR = path.join(REPO_ROOT, "lib", "directory", "data");
const OUTPUT_DIR = path.join(REPO_ROOT, "public", "agency-logos");
const MANIFEST_PATH = path.join(DATA_DIR, "logos.json");

/** Data files to read agencies out of. Mirrors the merge order in
 *  lib/directory/agencies.ts so a domain listed twice is fetched once. */
const SOURCE_FILES = [
  "agencies.json",
  "seo-agencies.json",
  "branding-agencies.json",
  "motion-design-agencies.json",
];

/** Target edge. Mirrors LOGO_SOURCE_SIZE in lib/directory/logos.ts. */
const TARGET_EDGE = 128;

/** Smallest image worth storing. Mirrors MIN_USABLE_LOGO_EDGE there:
 *  below this we would be caching a favicon that looks no better than
 *  the source avatar we already have. */
const MIN_EDGE = 48;

/** Per-request budget. Agency sites are slow and this runs unattended. */
const TIMEOUT_MS = 12_000;

/** Cap on a single image. Real logos are kilobytes; some og:images are
 *  full-bleed photographs, and one of those is not a logo anyway. */
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/** Cap on an HTML read. We only need <head>. */
const MAX_HTML_BYTES = 512 * 1024;

/** How many agencies are fetched at once. Each one is a different host,
 *  so this is not polite-crawling pressure on any single site - it is a
 *  bound on this process's own sockets and memory. */
const CONCURRENCY = 6;

/** Honest UA, same convention as the other importers: identifies the
 *  bot and points at the page explaining what it is for. */
const USER_AGENT =
  "Mozilla/5.0 (compatible; SuperflowDirectoryBot/1.0; +https://usesuperflow.ai/directory)";

/** Content types we will store, mapped to the extension used on disk. */
const IMAGE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/gif": "gif",
};

/**
 * Parses `--flag value` and `--flag=value` out of argv.
 *
 * @param {string} name - Flag name without dashes.
 * @returns {string | null} The value, or null when absent.
 */
function argValue(name) {
  try {
    const args = process.argv.slice(2);
    const exact = args.indexOf(`--${name}`);
    if (exact >= 0 && args[exact + 1] && !args[exact + 1].startsWith("--")) {
      return args[exact + 1];
    }
    const inline = args.find((arg) => arg.startsWith(`--${name}=`));
    return inline ? inline.slice(name.length + 3) : null;
  } catch {
    return null;
  }
}

/** @returns {boolean} True when the bare flag is present. */
function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

/**
 * Fetches a URL with a timeout and a byte cap.
 *
 * @param {string} url - Absolute URL.
 * @param {number} maxBytes - Hard cap on the response body.
 * @returns {Promise<{ buffer: Buffer, contentType: string, url: string } | null>}
 */
async function fetchBinary(url, maxBytes) {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) return null;
    return {
      buffer,
      contentType: (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase(),
      url: response.url || url,
    };
  } catch {
    return null;
  }
}

/**
 * Reads the real pixel dimensions out of an image's own header.
 *
 * The declared `sizes` attribute and the file name both lie routinely -
 * `sizes="180x180"` on the 57x57 file from 2013 is the single most common
 * defect in this area. Only the bytes know.
 *
 * SVG is reported as the target edge: it is resolution independent, so
 * "how many pixels" is not a question it has an answer to, and treating
 * it as 0 would throw away the best logo format there is.
 *
 * @param {Buffer} buffer - The image bytes.
 * @param {string} contentType - Its content type.
 * @returns {{ width: number, height: number } | null}
 */
function readImageSize(buffer, contentType) {
  try {
    if (contentType === "image/svg+xml") {
      return { width: TARGET_EDGE, height: TARGET_EDGE };
    }

    // PNG: IHDR is always the first chunk, width/height at bytes 16-23.
    if (buffer.length > 24 && buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }

    // ICO: little-endian directory; byte 0 of each entry is the width,
    // where 0 means 256.
    if (buffer.length > 8 && buffer.readUInt16LE(0) === 0 && buffer.readUInt16LE(2) === 1) {
      const count = buffer.readUInt16LE(4);
      let best = 0;
      for (let index = 0; index < count; index += 1) {
        const offset = 6 + index * 16;
        if (offset + 2 > buffer.length) break;
        const width = buffer[offset] === 0 ? 256 : buffer[offset];
        if (width > best) best = width;
      }
      return best > 0 ? { width: best, height: best } : null;
    }

    // JPEG: walk the segment markers to the first SOF.
    if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        const isStartOfFrame =
          marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isStartOfFrame) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        offset += 2 + length;
      }
      return null;
    }

    // WebP: VP8X carries the canvas size; VP8 and VP8L are parsed enough
    // to get an edge out of them.
    if (buffer.length > 30 && buffer.toString("ascii", 0, 4) === "RIFF") {
      const format = buffer.toString("ascii", 12, 16);
      if (format === "VP8X") {
        return {
          width: 1 + buffer.readUIntLE(24, 3),
          height: 1 + buffer.readUIntLE(27, 3),
        };
      }
      if (format === "VP8 ") {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
      if (format === "VP8L") {
        const bits = buffer.readUInt32LE(21);
        return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Pulls logo candidates out of a page's HTML.
 *
 * Regex rather than a DOM parse, matching the other importers in this
 * directory: we want four specific tags out of <head>, all of them
 * self-closing, and a parser dependency for that is not worth it.
 *
 * @param {string} html - The page HTML.
 * @param {string} baseUrl - URL to resolve relative hrefs against.
 * @returns {Array<{ url: string, from: string, declaredEdge: number }>}
 */
function extractLogoCandidates(html, baseUrl) {
  const candidates = [];

  /** @param {string} raw @param {string} from @param {number} declaredEdge */
  const push = (raw, from, declaredEdge) => {
    try {
      if (!raw) return;
      const resolved = new URL(raw.trim(), baseUrl).toString();
      if (!/^https?:/i.test(resolved)) return;
      candidates.push({ url: resolved, from, declaredEdge });
    } catch {
      // A malformed href is simply not a candidate.
    }
  };

  const head = html.slice(0, MAX_HTML_BYTES);

  for (const property of ["og:image", "twitter:image", "twitter:image:src"]) {
    const pattern = new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
      "i",
    );
    const match = pattern.exec(head);
    if (match) push(match[1], "og-image", TARGET_EDGE * 4);
    const reversed = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
      "i",
    );
    const reverseMatch = reversed.exec(head);
    if (reverseMatch) push(reverseMatch[1], "og-image", TARGET_EDGE * 4);
  }

  const linkPattern = /<link\b[^>]*>/gi;
  let linkMatch;
  while ((linkMatch = linkPattern.exec(head)) !== null) {
    const tag = linkMatch[0];
    const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    if (!/\bicon\b/.test(rel)) continue;
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    const sizes = /sizes=["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
    const declaredEdge = Number.parseInt(sizes.split("x")[0], 10);
    const from = rel.includes("apple-touch-icon") ? "apple-touch-icon" : "icon";
    push(href, from, Number.isFinite(declaredEdge) ? declaredEdge : 0);
  }

  return candidates;
}

/** Rank by source kind, most likely to be a square mark first. See the
 *  header for why og:image is last rather than first. */
const SOURCE_RANK = { "apple-touch-icon": 0, icon: 1, favicon: 2, "og-image": 3 };

/**
 * Narrowest width-to-height ratio that still counts as square.
 *
 * Not 1.0: plenty of real marks are drawn a few pixels off square, or are
 * a wordmark on a square canvas with uneven padding. 0.8 admits those and
 * refuses anything shaped like a banner (a 1200x630 card scores 0.53).
 */
const MIN_SQUARENESS = 0.8;

/**
 * How square an image is, as the ratio of its short edge to its long one.
 *
 * @param {{ width: number, height: number }} size - Real pixel dimensions.
 * @returns {number} 1 for a perfect square, approaching 0 for a banner.
 */
function squareness(size) {
  try {
    const longest = Math.max(size.width, size.height);
    return longest > 0 ? Math.min(size.width, size.height) / longest : 0;
  } catch {
    return 0;
  }
}

/**
 * Fetches the best available logo for one agency.
 *
 * @param {{ slug: string, name: string, website: string | null }} agency
 * @returns {Promise<{ slug: string, file: string, width: number, height: number, from: string, buffer: Buffer } | null>}
 */
async function fetchAgencyLogo(agency) {
  try {
    if (!agency.website) return null;
    const origin = new URL(agency.website).origin;

    const page = await fetchBinary(agency.website, MAX_HTML_BYTES);
    const html = page ? page.buffer.toString("utf8") : "";
    const candidates = html ? extractLogoCandidates(html, page.url) : [];
    candidates.push({ url: `${origin}/favicon.ico`, from: "favicon", declaredEdge: 0 });

    // Try in order of how likely each kind is to be a real mark, then by
    // the size it claims. The claim only orders the attempts; what gets
    // stored is decided by the bytes.
    candidates.sort((one, two) => {
      const rank = (SOURCE_RANK[one.from] ?? 9) - (SOURCE_RANK[two.from] ?? 9);
      return rank !== 0 ? rank : two.declaredEdge - one.declaredEdge;
    });

    let best = null;
    for (const candidate of candidates.slice(0, 8)) {
      const image = await fetchBinary(candidate.url, MAX_IMAGE_BYTES);
      if (!image) continue;
      const extension = IMAGE_EXTENSIONS[image.contentType];
      if (!extension) continue;
      const size = readImageSize(image.buffer, image.contentType);
      if (!size) continue;
      const edge = Math.min(size.width, size.height);
      // Both gates are on the BYTES, never on what the tag claimed. A
      // `sizes="180x180"` attribute over a 57px file is the single most
      // common defect in this area.
      if (edge < MIN_EDGE) continue;
      if (squareness(size) < MIN_SQUARENESS) continue;

      const record = {
        slug: agency.slug,
        file: `${agency.slug}.${extension}`,
        width: size.width,
        height: size.height,
        from: candidate.from,
        buffer: image.buffer,
      };
      // A square mark at or above target is as good as this gets; stop
      // rather than spending five more requests to confirm it.
      if (edge >= TARGET_EDGE) return record;
      if (!best || edge > Math.min(best.width, best.height)) best = record;
    }
    return best;
  } catch {
    return null;
  }
}

/**
 * Reads every agency out of the committed data files, deduped by slug.
 *
 * @returns {Promise<Array<{ slug: string, name: string, website: string | null }>>}
 */
async function readAgencies() {
  const bySlug = new Map();
  for (const file of SOURCE_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!existsSync(filePath)) continue;
    const records = JSON.parse(await readFile(filePath, "utf8"));
    for (const record of records) {
      if (!record?.slug || bySlug.has(record.slug)) continue;
      bySlug.set(record.slug, {
        slug: record.slug,
        name: record.name ?? record.slug,
        website: record.website ?? null,
      });
    }
  }
  return [...bySlug.values()];
}

/** Runs `worker` over `items` with a fixed number of workers in flight. */
async function mapWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  const onlyMissing = hasFlag("only-missing");
  const slugFilter = argValue("slug");
  const limit = Number.parseInt(argValue("limit") ?? "", 10);

  let agencies = await readAgencies();
  let existing = {};
  if (existsSync(MANIFEST_PATH)) {
    existing = JSON.parse(await readFile(MANIFEST_PATH, "utf8"))?.logos ?? {};
  }

  if (slugFilter) agencies = agencies.filter((agency) => agency.slug === slugFilter);
  if (onlyMissing) agencies = agencies.filter((agency) => !existing[agency.slug]);
  if (Number.isFinite(limit) && limit > 0) agencies = agencies.slice(0, limit);

  console.log(`Fetching logos for ${agencies.length} agencies (concurrency ${CONCURRENCY})`);
  await mkdir(OUTPUT_DIR, { recursive: true });

  let stored = 0;
  const logos = onlyMissing ? { ...existing } : {};

  await mapWithConcurrency(agencies, CONCURRENCY, async (agency, index) => {
    const result = await fetchAgencyLogo(agency);
    if ((index + 1) % 25 === 0) {
      console.log(`  ...${index + 1}/${agencies.length}`);
    }
    if (!result) return;
    await writeFile(path.join(OUTPUT_DIR, result.file), result.buffer);
    logos[result.slug] = {
      file: result.file,
      width: result.width,
      height: result.height,
      from: result.from,
    };
    stored += 1;
  });

  const manifest = {
    source:
      "Written by scripts/directory-import/fetch-agency-logos.mjs. Each entry is an image fetched from the agency's own site (og:image, apple-touch-icon, or declared icon), stored under public/agency-logos/ at whatever size it was served. Dimensions are read from the file header, never from the declaring tag. Re-run the script to refresh; it overwrites this file wholesale unless --only-missing is passed.",
    updatedAt: new Date().toISOString().slice(0, 10),
    logos: Object.fromEntries(Object.entries(logos).sort(([one], [two]) => one.localeCompare(two))),
  };
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Stored ${stored} logos; manifest now holds ${Object.keys(logos).length}.`);
}

main().catch((error) => {
  console.error("fetch-agency-logos failed:", error);
  process.exit(1);
});
