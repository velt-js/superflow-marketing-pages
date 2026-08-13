#!/usr/bin/env node
/**
 * Import bug-book-data.json into Sanity as `bugBookEntry` documents.
 *
 * Every entry is imported (both tiers) - the site queries filter to
 * `tier == "page"`, so rotating an entry in/out is a one-field edit in
 * Studio (or in the JSON + a rerun). Array items get stable `_key`s so
 * reruns don't churn unrelated fields. Sassy entries also get a derived
 * `pullQuote` (see derivePullQuote).
 *
 * Idempotent: createOrReplace on `_id = bugBook-<slug>`, plus a delete
 * pass for docs whose slug left the JSON. Reruns wipe manual Studio
 * edits to these documents.
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

const { entries, samples = [] } = JSON.parse(
  readFileSync(resolve(__dirname, "bug-book-data.json"), "utf8"),
);


/**
 * Lifts the line an entry turns on, so cards can lead with real words
 * instead of a stock illustration. Slugs are derived from that line, so
 * the comment sharing the most words with the slug is it - scored per
 * comment, then narrowed to the best sentence when the comment runs
 * long. Agent entries use their finding title. Falls back to the first
 * comment so every entry has one. Seeded into `pullQuote`; editors can
 * override it in Studio.
 */
const QUOTE_STOP_WORDS = new Set([
  "the", "a", "an", "is", "it", "to", "of", "on", "in", "and", "this",
  "that", "you", "i", "we", "be", "are", "was",
]);

/** Comments longer than this get narrowed to their punchiest sentence. */
const QUOTE_NARROW_MIN_LENGTH = 60;

function quoteTokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function overlapScore(text, slugTokens) {
  const words = new Set(quoteTokens(text));
  return slugTokens.filter((word) => words.has(word)).length;
}

function derivePullQuote(entry) {
  if (entry.source === "agent") {
    return entry.finding?.title
      ? { text: entry.finding.title, speaker: entry.agentName ?? null }
      : null;
  }
  const comments = entry.thread ?? [];
  if (comments.length === 0) return null;

  const slugTokens = quoteTokens(entry.slug).filter(
    (word) => !QUOTE_STOP_WORDS.has(word),
  );

  let best = null;
  for (const comment of comments) {
    const score = overlapScore(comment.text, slugTokens);
    if (!best || score > best.score) {
      best = { score, text: comment.text, speaker: comment.speaker };
    }
  }
  // No word overlap means the slug was editorial rather than quoted;
  // the opening comment is still the line that started it all.
  if (!best || best.score === 0) {
    best = { score: 0, text: comments[0].text, speaker: comments[0].speaker };
  }

  if (best.text.length > QUOTE_NARROW_MIN_LENGTH) {
    const sentences = best.text
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (sentences.length > 1) {
      let bestSentence = null;
      for (const sentence of sentences) {
        const score = overlapScore(sentence, slugTokens);
        if (!bestSentence || score > bestSentence.score) {
          bestSentence = { score, text: sentence };
        }
      }
      if (bestSentence?.score > 0) {
        return { text: bestSentence.text, speaker: best.speaker };
      }
    }
  }
  return { text: best.text, speaker: best.speaker };
}

function toDoc(entry, index) {
  const pullQuote = derivePullQuote(entry);
  return {
    _id: `bugBook-${entry.slug}`,
    _type: "bugBookEntry",
    headline: entry.headline,
    slug: { _type: "slug", current: entry.slug },
    tier: entry.tier,
    vibe: entry.vibe,
    ...(entry.sassType ? { sassType: entry.sassType } : {}),
    ...(pullQuote ? { pullQuote: pullQuote.text } : {}),
    ...(pullQuote?.speaker ? { pullQuoteSpeaker: pullQuote.speaker } : {}),
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

/** Illustrative agent reports rendered in their own band (never routed). */
function toSampleDoc(sample, index) {
  return {
    _id: `bugBookSample-${sample.slug}`,
    _type: "bugBookSample",
    headline: sample.headline,
    slug: { _type: "slug", current: sample.slug },
    sourceLabel: sample.sourceLabel,
    agentName: sample.agentName,
    category: sample.category,
    severity: sample.severity,
    hook: sample.hook,
    finding: { _type: "bugBookFinding", ...sample.finding },
    whyItMatters: sample.whyItMatters,
    note: sample.note,
    order: index,
  };
}

const docs = entries.map(toDoc);
const sampleDocs = samples.map(toSampleDoc);
const keepIds = new Set([...docs, ...sampleDocs].map((doc) => doc._id));

/**
 * Entries culled during curation must leave Sanity too - otherwise a
 * removed slug keeps rendering (createOrReplace only touches ids that
 * are still in the JSON).
 */
async function findStaleIds() {
  if (DRY_RUN) return [];
  const ids = await client.fetch(
    `*[_type in ["bugBookEntry", "bugBookSample"]]._id`,
  );
  return ids.filter((id) => !keepIds.has(id));
}

const staleIds = await findStaleIds();

if (DRY_RUN) {
  console.log(`DRY RUN - ${docs.length} entries + ${sampleDocs.length} samples`);
  for (const doc of docs) {
    console.log(` ${doc._id} [${doc.tier}/${doc.source}] ${doc.headline}`);
  }
  for (const doc of sampleDocs) {
    console.log(` ${doc._id} [sample] ${doc.headline}`);
  }
  process.exit(0);
}

let transaction = client.transaction();
for (const doc of [...docs, ...sampleDocs]) {
  transaction = transaction.createOrReplace(doc);
}
for (const id of staleIds) {
  transaction = transaction.delete(id);
}
const result = await transaction.commit();
console.log(
  `Imported ${docs.length} bugBookEntry + ${sampleDocs.length} bugBookSample docs` +
    (staleIds.length ? `, deleted ${staleIds.length} stale` : "") +
    ` (transaction ${result.transactionId}).`,
);
if (staleIds.length) console.log(`Deleted: ${staleIds.join(", ")}`);
