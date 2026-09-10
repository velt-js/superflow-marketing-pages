#!/usr/bin/env node
/**
 * Seed the /solutions pages into Sanity as `solutionPage` documents.
 *
 * Reads content/solutions/*.json (the same files lib/solutions/seed.ts renders
 * as the local fallback), validates them with ./validate.mjs, adds Sanity
 * `_key`s to array items, and createOrReplace()s one document per file.
 *
 * Document _id convention: solutionPage-<slug>.
 *
 * Usage:
 *   node --env-file=.env.local scripts/solutions-import/import-to-sanity.mjs
 *   node --env-file=.env.local scripts/solutions-import/import-to-sanity.mjs site-care
 *   DRY_RUN=1 node scripts/solutions-import/import-to-sanity.mjs
 *
 * Needs SANITY_API_TOKEN with write access to the dataset.
 */
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(scriptDir, "../../content/solutions");

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

/**
 * Give every object inside an array a stable `_key` (Sanity requires one).
 * @param {unknown} value
 * @param {string} prefix
 * @returns {unknown}
 */
function withKeys(value, prefix = "k") {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? { _key: `${prefix}-${index}`, ...withKeys(item, `${prefix}-${index}`) }
        : withKeys(item, `${prefix}-${index}`),
    );
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = withKeys(item, `${prefix}-${key}`);
    }
    return out;
  }
  return value;
}

/**
 * Shape one seed page into a `solutionPage` document.
 * @param {Record<string, any>} page
 * @returns {Record<string, any>}
 */
function toDocument(page) {
  const { slug, ...rest } = page;
  return {
    _id: `solutionPage-${slug}`,
    _type: "solutionPage",
    title: page.navLabel,
    slug: { _type: "slug", current: slug },
    hidden: false,
    ...withKeys(rest, slug),
  };
}

async function main() {
  const wanted = process.argv.slice(2).map((arg) => arg.replace(/\.json$/, ""));

  const validation = spawnSync(
    process.execPath,
    [path.join(scriptDir, "validate.mjs"), ...wanted],
    { stdio: "inherit" },
  );
  if (validation.status !== 0) {
    console.error("Validation failed; nothing imported.");
    process.exit(1);
  }

  const files = (await readdir(contentDir))
    .filter((name) => name.endsWith(".json"))
    .filter((name) => wanted.length === 0 || wanted.includes(name.replace(/\.json$/, "")))
    .sort();

  for (const file of files) {
    const page = JSON.parse(await readFile(path.join(contentDir, file), "utf8"));
    const doc = toDocument(page);
    if (DRY_RUN) {
      console.log(`[dry run] would createOrReplace ${doc._id}`);
      continue;
    }
    await client.createOrReplace(doc);
    console.log(`✔ ${doc._id}`);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
