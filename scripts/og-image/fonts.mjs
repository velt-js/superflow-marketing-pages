// Font loading for the meta-image generator.
//
// Satori (the rasterizer behind `next/og`) has no system-font access - every
// face has to be handed to it as a buffer. We pull the Urbanist TTFs from
// Google Fonts once and cache them on disk so later runs need no network.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  FONT_CACHE_DIR,
  FONT_FAMILY,
  FONT_URLS,
  FONT_WEIGHT_BOLD,
  FONT_WEIGHT_REGULAR,
  LOG_PREFIX,
} from "./constants.mjs";

/**
 * Absolute path of the on-disk cache entry for a given weight.
 *
 * @param {string} projectRoot - Repository root.
 * @param {number} weight - Font weight (400 or 700).
 * @returns {string} Absolute file path.
 */
function cachePathFor(projectRoot, weight) {
  try {
    return join(projectRoot, FONT_CACHE_DIR, `urbanist-${weight}.ttf`);
  } catch (error) {
    throw new Error(`Could not resolve font cache path: ${error?.message ?? error}`);
  }
}

/**
 * Read a cached font file, returning null when it is absent.
 *
 * @param {string} filePath - Absolute path to the cached TTF.
 * @returns {Promise<Buffer | null>} Font bytes, or null on a cache miss.
 */
async function readCachedFont(filePath) {
  try {
    const bytes = await readFile(filePath);
    return bytes?.length > 0 ? bytes : null;
  } catch {
    // ENOENT and friends are an ordinary cache miss, not a failure.
    return null;
  }
}

/**
 * Download a font and persist it to the cache.
 *
 * @param {string} url - Google Fonts TTF URL.
 * @param {string} filePath - Absolute path to write the font to.
 * @returns {Promise<Buffer>} Downloaded font bytes.
 */
async function downloadFont(url, filePath) {
  try {
    const response = await fetch(url);
    if (!response?.ok) {
      throw new Error(`HTTP ${response?.status ?? "?"} fetching ${url}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, bytes);
    return bytes;
  } catch (error) {
    throw new Error(
      `Failed to download font from ${url}. Run once with network access to seed ` +
        `${FONT_CACHE_DIR}, or drop the TTFs there manually. Cause: ${error?.message ?? error}`,
    );
  }
}

/**
 * Load every font face the template needs, downloading and caching on first use.
 *
 * @param {string} projectRoot - Repository root.
 * @returns {Promise<Array<{name: string, data: Buffer, weight: number, style: string}>>}
 *   Font descriptors in the shape `next/og` expects.
 */
export async function loadFonts(projectRoot) {
  try {
    const weights = [FONT_WEIGHT_REGULAR, FONT_WEIGHT_BOLD];
    const faces = [];

    for (const weight of weights) {
      const filePath = cachePathFor(projectRoot, weight);
      let bytes = await readCachedFont(filePath);

      if (!bytes) {
        console.log(`${LOG_PREFIX} downloading ${FONT_FAMILY} ${weight}...`);
        bytes = await downloadFont(FONT_URLS[weight], filePath);
      }

      faces.push({ name: FONT_FAMILY, data: bytes, weight, style: "normal" });
    }

    return faces;
  } catch (error) {
    throw new Error(`Could not load fonts: ${error?.message ?? error}`);
  }
}
