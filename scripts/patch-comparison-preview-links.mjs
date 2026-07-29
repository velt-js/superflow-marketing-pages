#!/usr/bin/env node
/**
 * Rewrite CMS-stored links on the 2026 comparison-class documents from
 * the retired /preview/* paths to the promoted root paths:
 *
 *   /preview/comparison[/...]   -> /comparisons[/...]
 *   /preview/alternative[/...]  -> /alternative[/...]
 *
 * Deep-walks EVERY string field on the comparisonPreview* documents
 * (links live in fieldLink, thirdOptionLinks, superflowLinks, related,
 * and potentially future fields), so nothing is missed by a fixed field
 * list. The old links keep working through the next.config.ts 308s;
 * this patch just removes the extra redirect hop. Idempotent.
 *
 * Usage:
 *   node --env-file=.env.local scripts/patch-comparison-preview-links.mjs
 *   DRY_RUN=1 node scripts/patch-comparison-preview-links.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: DRY_RUN ? undefined : token,
  useCdn: false,
});

const TYPES = [
  "comparisonPreviewVsPage",
  "comparisonPreviewArbiterPage",
  "comparisonPreviewAlternativesPage",
  "comparisonPreviewHub",
];

/** Rewrite the retired preview paths wherever they appear in a string. */
function promote(value) {
  return value
    .replaceAll("/preview/comparison", "/comparisons")
    .replaceAll("/preview/alternative", "/alternative");
}

/**
 * Deep-walk a document and collect Sanity set-patches for every string
 * containing a /preview path. System fields (_id, _type, _rev, ...) are
 * skipped.
 *
 * @param node - The current value being walked.
 * @param path - The Sanity attribute path to this value.
 * @param set - Accumulator of attribute path -> replacement value.
 */
function collectPatches(node, path, set) {
  if (typeof node === "string") {
    if (node.includes("/preview/")) {
      set[path] = promote(node);
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      collectPatches(item, `${path}[${index}]`, set),
    );
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("_")) continue;
      collectPatches(value, path ? `${path}.${key}` : key, set);
    }
  }
}

async function main() {
  const docs = await client.fetch(`*[_type in $types]`, { types: TYPES });

  let patchedDocs = 0;
  let patchedFields = 0;

  for (const doc of docs) {
    const set = {};
    collectPatches(doc, "", set);
    const fieldCount = Object.keys(set).length;
    if (fieldCount === 0) continue;

    patchedDocs += 1;
    patchedFields += fieldCount;

    if (DRY_RUN) {
      console.log(doc._id, JSON.stringify(set, null, 2));
    } else {
      await client.patch(doc._id).set(set).commit();
      console.log(`Patched: ${doc._id} (${fieldCount} field(s))`);
    }
  }

  console.log(
    `${DRY_RUN ? "[dry run] " : ""}${patchedFields} field(s) across ${patchedDocs} doc(s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
