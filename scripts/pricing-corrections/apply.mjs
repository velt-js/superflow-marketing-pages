#!/usr/bin/env node
/**
 * Correct stale pricing claims in published Sanity content so it matches
 * /pricing (components/pricing/pricing-data.ts and
 * components/pricing-2026/site-agents-data.ts): no AI credits, QA agents
 * and always-on monitoring at $14 per site per month on Growth and Scale,
 * integration and feature gating as in the comparison table, current seat
 * prices, and SOC 2 Type II.
 *
 * cms-patches.json holds one entry per string field: the document, the
 * Sanity patch path, the exact text that was live when the patch was
 * drafted (`old`) and its replacement (`new`). The matching seed sources in
 * scripts/ already carry the `new` text, so a re-seed does not revert it.
 *
 * PATCHES, DOES NOT REPLACE, and only where the field still says exactly
 * what was reviewed:
 *   - field equals `old`  -> set to `new`
 *   - field equals `new`  -> already applied, skipped
 *   - anything else       -> reported and skipped; an editor changed it
 * so the script is idempotent and cannot overwrite Studio work. A pending
 * draft of a patched document is reported too: publishing it later would
 * bring the old text back, so fix the draft in the Studio.
 *
 * Usage:
 *   DRY_RUN=1 node scripts/pricing-corrections/apply.mjs
 *   SANITY_API_TOKEN=<editor token> node scripts/pricing-corrections/apply.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!DRY_RUN && !token) {
  console.error("SANITY_API_TOKEN is required to write (or set DRY_RUN=1).");
  process.exit(1);
}

const patches = JSON.parse(
  readFileSync(new URL("./cms-patches.json", import.meta.url), "utf8"),
);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: token || undefined,
});

/**
 * Read the value at a Sanity patch path, e.g.
 * body[_key=="a1"].children[_key=="b2"].text or rows[3].cells[1].
 *
 * @param {unknown} doc - The document to read from.
 * @param {string} path - The patch path.
 * @returns {unknown} The value, or undefined when the path does not resolve.
 */
function readPath(doc, path) {
  const tokens = path.match(/[^.[\]]+|\[[^\]]+\]/g) ?? [];
  let current = doc;
  for (const token of tokens) {
    if (current == null) return undefined;
    if (token.startsWith("[")) {
      const inner = token.slice(1, -1);
      const key = inner.match(/^_key\s*==\s*"(.*)"$/);
      current = key
        ? Array.isArray(current)
          ? current.find((item) => item?._key === key[1])
          : undefined
        : current[Number(inner)];
    } else {
      current = current[token];
    }
  }
  return current;
}

const byDoc = new Map();
for (const patch of patches) {
  if (!byDoc.has(patch.docId)) byDoc.set(patch.docId, []);
  byDoc.get(patch.docId).push(patch);
}

const tally = { toApply: 0, alreadyApplied: 0, changedSinceReview: 0, missing: 0 };

if (token) {
  const drafts = await client.fetch("*[_id in $ids]._id", {
    ids: [...byDoc.keys()].map((id) => `drafts.${id}`),
  });
  for (const id of drafts) console.log(`DRAFT PENDING ${id} - fix it in the Studio too`);
}

for (const [docId, items] of byDoc) {
  const doc = await client.getDocument(docId);
  if (!doc) {
    console.log(`MISSING ${docId}`);
    tally.missing += items.length;
    continue;
  }
  const set = {};
  for (const patch of items) {
    const current = readPath(doc, patch.path);
    if (current === patch.new) {
      tally.alreadyApplied += 1;
    } else if (current === patch.old) {
      set[patch.path] = patch.new;
      tally.toApply += 1;
    } else {
      console.log(`CHANGED SINCE REVIEW ${docId} ${patch.path}`);
      tally.changedSinceReview += 1;
    }
  }
  if (!DRY_RUN && Object.keys(set).length) {
    await client.patch(docId).set(set).commit();
    console.log(`patched ${docId} (${Object.keys(set).length} fields)`);
  }
}

console.log(JSON.stringify({ dryRun: DRY_RUN, docs: byDoc.size, ...tally }));
