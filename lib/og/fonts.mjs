// Font loading for the social-card template.
//
// Satori has no system-font access, so every face has to be handed to it as a
// buffer. The Urbanist TTFs are committed next to this module and read off
// disk - no network, no cache directory, no cold-start fetch, so a Google
// Fonts outage can never sit in the render path.
//
// The `/api/og` route runs on the Node runtime and reads these at request
// time, so `next.config.ts` traces `lib/og/fonts/**` into that function's
// bundle. Without that entry the files are absent in production.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FONT_FAMILY,
  FONT_FILES,
  FONT_WEIGHT_BOLD,
  FONT_WEIGHT_REGULAR,
} from "./constants.mjs";

/** Directory holding the committed TTFs. */
const FONT_DIR = dirname(fileURLToPath(import.meta.url));

/** @type {Array<{name: string, data: Buffer, weight: number, style: string}> | null} */
let cachedFaces = null;

/**
 * Read one committed font file.
 *
 * Returns a `Buffer` rather than a plain view: `next/og` types its font `data`
 * as `ArrayBuffer | Buffer`, and the metrics reader wants the big-endian
 * accessors anyway.
 *
 * @param {string} relativePath - Path relative to this module.
 * @returns {Promise<Buffer>} Font bytes.
 */
async function readFontFile(relativePath) {
  try {
    const bytes = await readFile(join(FONT_DIR, relativePath));
    if (!bytes?.length) {
      throw new Error("file is empty");
    }
    return bytes;
  } catch (error) {
    throw new Error(`Could not read font ${relativePath}: ${error?.message ?? error}`);
  }
}

/**
 * Load every font face the template needs, in the shape `next/og` expects.
 *
 * Faces are memoized per process, so a warm serverless instance reads the
 * files once.
 *
 * Weight and style are declared as literals rather than `number`/`string`, so
 * the result drops straight into `next/og`'s `FontOptions[]` without a cast.
 *
 * @returns {Promise<Array<{name: string, data: Buffer, weight: 400 | 700, style: "normal"}>>}
 *   Font descriptors.
 */
export async function loadFonts() {
  try {
    if (cachedFaces) {
      return cachedFaces;
    }

    const weights = [FONT_WEIGHT_REGULAR, FONT_WEIGHT_BOLD];
    const faces = await Promise.all(
      weights.map(async (weight) => ({
        name: FONT_FAMILY,
        data: await readFontFile(FONT_FILES[weight]),
        weight,
        style: "normal",
      })),
    );

    cachedFaces = faces;
    return faces;
  } catch (error) {
    throw new Error(`Could not load fonts: ${error?.message ?? error}`);
  }
}

/**
 * The bold face, which the headline fitter measures against.
 *
 * @param {Array<{weight: number, data: Buffer}>} faces - Loaded faces.
 * @returns {Buffer} Bold font bytes.
 */
export function getBoldFontData(faces) {
  try {
    const bold = faces?.find((face) => face?.weight === FONT_WEIGHT_BOLD);
    if (!bold?.data) {
      throw new Error("the bold Urbanist face is missing");
    }
    return bold.data;
  } catch (error) {
    throw new Error(`Could not resolve the bold face: ${error?.message ?? error}`);
  }
}
