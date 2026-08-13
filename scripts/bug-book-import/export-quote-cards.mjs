#!/usr/bin/env node
/**
 * Batch-export Bug Book quote cards as PNGs for social.
 *
 * Pulls every live entry's slug from bug-book-data.json and saves one
 * card per entry by hitting the running site's /api/bug-book/quote-card
 * route, so the images always match what the page renders.
 *
 * Usage:
 *   # with `npm run dev` (or a deployed URL) running:
 *   node scripts/bug-book-import/export-quote-cards.mjs
 *   node scripts/bug-book-import/export-quote-cards.mjs --format portrait
 *   node scripts/bug-book-import/export-quote-cards.mjs --vibe sass --out ./cards
 *   BASE_URL=https://usesuperflow.com node scripts/bug-book-import/export-quote-cards.mjs
 *
 * Options:
 *   --format  square (default) | portrait | story | landscape
 *   --vibe    only entries with this vibe (rage | sass | comedy | story)
 *   --out     output directory (default: bug-book-cards/<format>)
 *   --limit   stop after N cards
 */
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FORMATS = ["square", "portrait", "story", "landscape"];

function readFlag(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const format = readFlag("format", "square");
if (!FORMATS.includes(format)) {
  console.error(`--format must be one of: ${FORMATS.join(", ")}`);
  process.exit(1);
}
const vibe = readFlag("vibe");
const limit = Number(readFlag("limit", "0")) || Infinity;
const outDir = resolve(
  process.cwd(),
  readFlag("out", join("bug-book-cards", format)),
);

const { entries } = JSON.parse(
  readFileSync(resolve(__dirname, "bug-book-data.json"), "utf8"),
);

const targets = entries
  .filter((entry) => entry.tier === "page")
  .filter((entry) => !vibe || entry.vibe === vibe)
  .slice(0, limit);

if (targets.length === 0) {
  console.error("No entries matched.");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
console.log(`Exporting ${targets.length} ${format} cards to ${outDir}`);

let saved = 0;
const failures = [];

for (const entry of targets) {
  const url = `${baseUrl}/api/bug-book/quote-card?slug=${encodeURIComponent(
    entry.slug,
  )}&format=${format}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      failures.push(`${entry.slug} (HTTP ${response.status})`);
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(join(outDir, `${entry.slug}.png`), buffer);
    saved++;
    process.stdout.write(`\r  ${saved}/${targets.length}`);
  } catch (error) {
    failures.push(`${entry.slug} (${error.message})`);
  }
}

process.stdout.write("\n");
console.log(`Saved ${saved} card${saved === 1 ? "" : "s"}.`);
if (failures.length) {
  console.log(`Failed (${failures.length}): ${failures.join(", ")}`);
  process.exitCode = 1;
}
