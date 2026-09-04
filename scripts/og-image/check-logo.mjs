#!/usr/bin/env node
// Guards the one duplicated asset in the social-card pipeline.
//
// `lib/og/logo.mjs` inlines the Superflow mark because the `/api/og` route
// runs in a serverless function, where `public/` is not reliably readable.
// That copy can drift from the nav SVG it was derived from, so this re-derives
// it and fails loudly if the two no longer agree.
//
// Runs on its own (`npm run og:check-logo`) and ahead of `npm run og:pages`.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOGO_SVG_PATH, LOG_PREFIX, LOG_PREFIX_ERROR } from "../../lib/og/constants.mjs";
import { LOGO_SVG } from "../../lib/og/logo.mjs";

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Derive the inline-ready SVG from the committed nav asset.
 *
 * Mirrors exactly what produced the string in `lib/og/logo.mjs`: resolve the
 * `var(--fill-0, #HEX)` fills the rasterizer cannot read, and pin the
 * percentage dimensions to the viewBox.
 *
 * @param {string} raw - Contents of the nav logo SVG.
 * @returns {string} Normalized SVG.
 */
function normalizeNavLogo(raw) {
  try {
    let svg = raw.replace(/var\(\s*--[\w-]+\s*,\s*([^)]+?)\s*\)/g, "$1");

    const viewBoxMatch = svg.match(/viewBox="([\d.\s-]+)"/);
    const viewBoxParts = viewBoxMatch?.[1]?.trim().split(/\s+/).map(Number) ?? [];
    const viewBoxWidth = viewBoxParts[2] > 0 ? viewBoxParts[2] : 1;
    const viewBoxHeight = viewBoxParts[3] > 0 ? viewBoxParts[3] : 1;

    return svg
      .replace(/\swidth="[^"]*"/, ` width="${viewBoxWidth}"`)
      .replace(/\sheight="[^"]*"/, ` height="${viewBoxHeight}"`)
      .replace(/\spreserveAspectRatio="[^"]*"/, "")
      .trim();
  } catch (error) {
    throw new Error(`Could not normalize the nav logo: ${error?.message ?? error}`);
  }
}

/**
 * Compare the inlined mark against the nav asset.
 *
 * @returns {Promise<void>} Sets a non-zero exit code on drift.
 */
async function main() {
  try {
    const raw = await readFile(join(PROJECT_ROOT, LOGO_SVG_PATH), "utf8");
    const expected = normalizeNavLogo(raw);

    if (expected === LOGO_SVG.trim()) {
      console.log(`${LOG_PREFIX} logo in sync with ${LOGO_SVG_PATH}`);
      return;
    }

    console.error(
      `${LOG_PREFIX_ERROR} lib/og/logo.mjs has drifted from ${LOGO_SVG_PATH}.\n` +
        "Social cards would ship the old mark. Replace LOGO_SVG with:\n\n" +
        `${expected}\n`,
    );
    process.exitCode = 1;
  } catch (error) {
    console.error(`${LOG_PREFIX_ERROR} ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

await main();
