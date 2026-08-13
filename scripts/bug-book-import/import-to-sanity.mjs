#!/usr/bin/env node
/**
 * Import bug-book-data.json into Sanity as `bugBookEntry` documents.
 *
 * All 54 entries are imported (both tiers) — the site queries filter to
 * `tier == "page"`, so rotating an entry in/out is a one-field edit in
 * Studio (or in the JSON + a rerun). Array items get stable `_key`s so
 * reruns don't churn unrelated fields.
 *
 * Idempotent: createOrReplace on `_id = bugBook-<slug>`. Reruns wipe
 * manual Studio edits to these documents.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/bug-book-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/bug-book-import/import-to-sanity.mjs   # parse + log only
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const { entries } = JSON.parse(
  readFileSync(resolve(__dirname, "bug-book-data.json"), "utf8"),
);

function toDoc(entry, index) {
  return {
    _id: `bugBook-${entry.slug}`,
    _type: "bugBookEntry",
    headline: entry.headline,
    slug: { _type: "slug", current: entry.slug },
    tier: entry.tier,
    source: entry.source,
    sourceLabel: entry.sourceLabel,
    ...(entry.agentName ? { agentName: entry.agentName } : {}),
    category: entry.category,
    severity: entry.severity,
    rageLevel: entry.rageLevel,
    ...(entry.status ? { status: entry.status } : {}),
    date: entry.date,
    ...(entry.site ? { site: { _type: "bugBookSite", ...entry.site } } : {}),
    ...(entry.captured
      ? { captured: { _type: "bugBookCaptured", ...entry.captured } }
      : {}),
    hook: entry.hook,
    thread: (entry.thread ?? []).map((comment, i) => ({
      _type: "bugBookThreadComment",
      _key: `comment-${i}`,
      speaker: comment.speaker,
      text: comment.text,
      ...(comment.attachment ? { attachment: comment.attachment } : {}),
    })),
    ...(entry.finding
      ? { finding: { _type: "bugBookFinding", ...entry.finding } }
      : {}),
    whyItMatters: entry.whyItMatters,
    outcome: entry.outcome,
    flags: entry.flags ?? [],
    curatedRank: index,
  };
}

const docs = entries.map(toDoc);

if (DRY_RUN) {
  console.log(`DRY RUN — ${docs.length} docs`);
  for (const doc of docs) {
    console.log(` ${doc._id} [${doc.tier}/${doc.source}] ${doc.headline}`);
  }
  process.exit(0);
}

let transaction = client.transaction();
for (const doc of docs) {
  transaction = transaction.createOrReplace(doc);
}
const result = await transaction.commit();
console.log(
  `Imported ${docs.length} bugBookEntry docs (transaction ${result.transactionId}).`,
);
