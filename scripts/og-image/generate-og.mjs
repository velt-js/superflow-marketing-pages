#!/usr/bin/env node
// Meta / Open Graph image generator for the Superflow marketing site.
//
// Renders the Figma social-card template (node 1112:1014) to PNG with a
// per-page headline. Uses `next/og` - already a dependency via Next - so the
// generator adds no packages of its own.
//
// Usage:
//   node scripts/og-image/generate-og.mjs --title "Monday Integration with Superflow"
//   node scripts/og-image/generate-og.mjs --title "Pricing" --out public/og/pricing.png
//   node scripts/og-image/generate-og.mjs --manifest scripts/og-image/manifest.json
//   node scripts/og-image/generate-og.mjs --help
//
// See scripts/og-image/README.md for the full option list.

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";
import { createCard } from "../../lib/og/card.mjs";
import {
  DEFAULT_BALANCE,
  DEFAULT_FOOTER,
  DEFAULT_HEIGHT,
  DEFAULT_MAX_LINES,
  DEFAULT_OUT_DIR,
  DEFAULT_WIDTH,
  LOG_PREFIX,
  LOG_PREFIX_ERROR,
} from "../../lib/og/constants.mjs";
import { getBoldFontData, loadFonts } from "../../lib/og/fonts.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP_TEXT = `
${LOG_PREFIX} Superflow meta image generator

  Single card:
    node scripts/og-image/generate-og.mjs --title "Monday Integration with Superflow"

  Batch from a manifest:
    node scripts/og-image/generate-og.mjs --manifest scripts/og-image/manifest.json

Options:
  --title <text>       Headline. Use "\\n" to force a line break. Required unless --manifest.
  --out <path>         Output PNG path. Defaults to ${DEFAULT_OUT_DIR}/<slugified-title>.png
  --footer <text>      Bottom domain line. Default: ${DEFAULT_FOOTER}
  --width <px>         Output width. Default: ${DEFAULT_WIDTH}
  --height <px>        Output height. Default: ${DEFAULT_HEIGHT}
                       Pass --width 1280 --height 720 for the exact Figma frame.
  --max-lines <n>      Wrapped title lines before the type shrinks. Default: ${DEFAULT_MAX_LINES}
  --font-size <px>     Fixed title size (in 1280-wide base px), disabling auto-fit.
  --no-balance         Keep the greedy line break instead of evening out line
                       lengths (the CSS text-wrap: balance behaviour, on by default).
  --manifest <path>    JSON array of card definitions; each entry takes the same
                       keys as the flags above (title, out, footer, width, ...).
  --skip-existing      Leave already-generated files alone instead of overwriting.
  --help               Show this message.
`;

/**
 * Parse `--flag value` style arguments into a plain object.
 *
 * @param {string[]} argv - Raw arguments (without node/script).
 * @returns {Record<string, string | boolean>} Parsed flags keyed by camelCase name.
 */
function parseArgs(argv) {
  try {
    const flags = {};

    for (let index = 0; index < argv.length; index += 1) {
      const token = argv[index];
      if (!token?.startsWith("--")) {
        continue;
      }

      const name = token.slice(2).replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
      const next = argv[index + 1];

      if (next === undefined || next.startsWith("--")) {
        flags[name] = true;
      } else {
        flags[name] = next;
        index += 1;
      }
    }

    return flags;
  } catch (error) {
    throw new Error(`Could not parse arguments: ${error?.message ?? error}`);
  }
}

/**
 * Turn a headline into a filesystem-safe slug.
 *
 * @param {string} text - Source text.
 * @returns {string} Slug suitable for a file name.
 */
function slugify(text) {
  try {
    const slug = String(text ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return slug || "og-image";
  } catch {
    return "og-image";
  }
}

/**
 * Resolve a possibly relative path against the repository root.
 *
 * @param {string} targetPath - Path from the CLI or manifest.
 * @returns {string} Absolute path.
 */
function resolveFromRoot(targetPath) {
  try {
    return isAbsolute(targetPath) ? targetPath : join(PROJECT_ROOT, targetPath);
  } catch (error) {
    throw new Error(`Could not resolve path "${targetPath}": ${error?.message ?? error}`);
  }
}

/**
 * Read a positive integer flag, falling back when absent or malformed.
 *
 * @param {string | number | boolean | undefined} value - Raw flag value.
 * @param {number} fallback - Value to use when the flag is missing or invalid.
 * @returns {number} Parsed number.
 */
function toPositiveNumber(value, fallback) {
  try {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Normalize one card definition from CLI flags or a manifest entry.
 *
 * @param {Record<string, unknown>} source - Raw flags or manifest entry.
 * @returns {{title: string, out: string, footer: string, width: number, height: number,
 *   maxLines: number, fontSizeOverride: number | null, balance: boolean}} Normalized card spec.
 */
function normalizeCard(source) {
  try {
    const title = typeof source?.title === "string" ? source.title.trim() : "";
    if (!title) {
      throw new Error("every card needs a non-empty `title`");
    }

    // A literal backslash-n typed at the shell should still break the line.
    const normalizedTitle = title.replace(/\\n/g, "\n");
    const out =
      typeof source?.out === "string" && source.out.trim()
        ? source.out.trim()
        : join(DEFAULT_OUT_DIR, `${slugify(normalizedTitle)}.png`);

    return {
      title: normalizedTitle,
      out,
      footer: typeof source?.footer === "string" ? source.footer : DEFAULT_FOOTER,
      width: Math.round(toPositiveNumber(source?.width, DEFAULT_WIDTH)),
      height: Math.round(toPositiveNumber(source?.height, DEFAULT_HEIGHT)),
      maxLines: Math.round(toPositiveNumber(source?.maxLines, DEFAULT_MAX_LINES)),
      fontSizeOverride: source?.fontSize ? toPositiveNumber(source.fontSize, 0) || null : null,
      // `--no-balance` on the CLI, or `"balance": false` in a manifest.
      balance: source?.noBalance ? false : (source?.balance ?? DEFAULT_BALANCE),
    };
  } catch (error) {
    throw new Error(`Invalid card definition: ${error?.message ?? error}`);
  }
}

/**
 * Read and validate a manifest file of card definitions.
 *
 * @param {string} manifestPath - Path to the JSON manifest.
 * @returns {Promise<Array<Record<string, unknown>>>} Raw card entries.
 */
async function readManifest(manifestPath) {
  try {
    const raw = await readFile(resolveFromRoot(manifestPath), "utf8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed : parsed?.cards;

    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error("expected a JSON array of cards, or an object with a `cards` array");
    }

    return entries;
  } catch (error) {
    throw new Error(`Could not read manifest ${manifestPath}: ${error?.message ?? error}`);
  }
}

/**
 * Whether a file already exists on disk.
 *
 * @param {string} filePath - Absolute path to check.
 * @returns {Promise<boolean>} True when the path exists.
 */
async function fileExists(filePath) {
  try {
    const stats = await stat(filePath);
    return Boolean(stats?.isFile());
  } catch {
    return false;
  }
}

/**
 * Render one card to a PNG on disk.
 *
 * @param {object} card - Normalized card spec from `normalizeCard`.
 * @param {object} context - Shared render context.
 * @param {Array<object>} context.fonts - Font descriptors for `next/og`.
 * @param {Buffer} context.boldFontData - Bold face bytes, for measuring.
 * @param {boolean} context.skipExisting - Skip cards whose output already exists.
 * @returns {Promise<{outPath: string, skipped: boolean, overwrote: boolean}>} Render result.
 */
async function renderCard(card, context) {
  try {
    const outPath = resolveFromRoot(card.out);
    const existed = await fileExists(outPath);

    if (existed && context.skipExisting) {
      return { outPath, skipped: true, overwrote: false };
    }

    const { element, fontSize, lines } = createCard({
      title: card.title,
      boldFontData: context.boldFontData,
      footer: card.footer,
      width: card.width,
      height: card.height,
      maxLines: card.maxLines,
      fontSizeOverride: card.fontSizeOverride,
      balance: card.balance,
    });

    const response = new ImageResponse(element, {
      width: card.width,
      height: card.height,
      fonts: context.fonts,
    });

    const bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, bytes);

    console.log(
      `${LOG_PREFIX} ${card.out} - ${card.width}x${card.height}, ` +
        `${lines.length} line${lines.length === 1 ? "" : "s"} @ ${Math.round(fontSize)}px, ` +
        `${Math.round(bytes.length / 1024)}kb${existed ? " (overwrote)" : ""}`,
    );

    return { outPath, skipped: false, overwrote: existed };
  } catch (error) {
    throw new Error(`Failed rendering "${card?.title ?? "?"}": ${error?.message ?? error}`);
  }
}

/**
 * CLI entry point.
 *
 * @returns {Promise<void>} Resolves once every requested card is written.
 */
async function main() {
  try {
    const flags = parseArgs(process.argv.slice(2));

    if (flags.help || process.argv.length <= 2) {
      console.log(HELP_TEXT);
      return;
    }

    const rawCards = flags.manifest ? await readManifest(String(flags.manifest)) : [flags];
    const cards = rawCards.map((entry) =>
      normalizeCard({
        // Manifest entries inherit any flags passed alongside --manifest, so
        // `--width 1280 --manifest ...` re-renders the whole set at that size.
        width: flags.width,
        height: flags.height,
        footer: flags.footer,
        maxLines: flags.maxLines,
        noBalance: flags.noBalance,
        ...entry,
      }),
    );

    const fonts = await loadFonts();
    const context = {
      fonts,
      boldFontData: getBoldFontData(fonts),
      skipExisting: Boolean(flags.skipExisting),
    };

    let written = 0;
    let skipped = 0;

    for (const card of cards) {
      const result = await renderCard(card, context);
      if (result.skipped) {
        skipped += 1;
        console.log(`${LOG_PREFIX} ${card.out} - skipped, already exists`);
      } else {
        written += 1;
      }
    }

    console.log(
      `${LOG_PREFIX} done: ${written} written${skipped > 0 ? `, ${skipped} skipped` : ""}`,
    );
  } catch (error) {
    console.error(`${LOG_PREFIX_ERROR} ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

await main();
