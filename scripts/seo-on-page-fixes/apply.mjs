#!/usr/bin/env node
/**
 * Apply the on-page SEO copy in values.json to Sanity.
 *
 * Every value was written against the report's own bands (title 30-60, meta
 * description 100-160, H1 <= 70) and checked by validate.mjs, which reproduces
 * what each route renders rather than measuring the raw field. Run that first;
 * this script runs it for you unless SKIP_VALIDATE=1.
 *
 * Idempotent: a document whose fields already hold the target values is
 * skipped, so a re-run after a partial failure only writes what is missing.
 *
 * Usage:
 *   DRY_RUN=1 node scripts/seo-on-page-fixes/apply.mjs
 *   node --env-file=.env.local scripts/seo-on-page-fixes/apply.mjs
 *
 * Needs SANITY_API_TOKEN with write access (an Editor token is enough).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;

if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN (write access), or DRY_RUN=1.");
  process.exit(1);
}

if (process.env.SKIP_VALIDATE !== "1") {
  const { spawnSync } = await import("node:child_process");
  const check = spawnSync(process.execPath, [path.join(HERE, "validate.mjs")], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (check.status !== 0) {
    console.error("validate.mjs failed; nothing written. Fix values.json or set SKIP_VALIDATE=1.");
    process.exit(1);
  }
}

const values = JSON.parse(fs.readFileSync(path.join(HERE, "values.json"), "utf8"));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: DRY_RUN ? undefined : token,
  useCdn: false,
});

const ids = Object.keys(values);
const docs = await client.fetch(`*[_id in $ids]{...}`, { ids });
const byId = Object.fromEntries(docs.map((d) => [d._id, d]));

const missing = ids.filter((id) => !byId[id]);
if (missing.length) {
  console.error(`These documents no longer exist, so nothing was written:\n  ${missing.join("\n  ")}`);
  console.error("Re-generate values.json against the current dataset before re-running.");
  process.exit(1);
}

let written = 0;
let skipped = 0;
// One transaction: either the whole report's worth of copy lands, or none of
// it does. A half-applied run is the thing worth avoiding here, because the
// titles and descriptions of one page are written to be read together.
const tx = client.transaction();

for (const [id, entry] of Object.entries(values)) {
  const doc = byId[id];
  const changes = Object.fromEntries(
    Object.entries(entry.set).filter(([field, value]) => doc[field] !== value),
  );
  if (!Object.keys(changes).length) {
    skipped += 1;
    continue;
  }
  written += 1;
  for (const [field, value] of Object.entries(changes)) {
    const before = doc[field];
    console.log(`${entry.path}  ${field}`);
    console.log(`  - (${before == null ? "unset" : String(before).length}) ${before ?? ""}`);
    console.log(`  + (${value.length}) ${value}`);
  }
  tx.patch(id, (p) => p.set(changes));
}

console.log(`\n${written} document(s) to update, ${skipped} already current.`);

if (DRY_RUN) {
  console.log("DRY_RUN=1, nothing written.");
  process.exit(0);
}
if (!written) {
  console.log("Nothing to do.");
  process.exit(0);
}

await tx.commit();
console.log(`Committed. Pages revalidate within 60s (export const revalidate = 60).`);
