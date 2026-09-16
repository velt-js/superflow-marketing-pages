#!/usr/bin/env node
/**
 * Apply the corrections agencies sent us onto their `agency` documents in
 * Sanity.
 *
 * WHY THIS AND NOT `seed-agency-listings.mjs`: corrections used to live in
 * their own `agencyListing` documents, layered over the scrape at read
 * time, because the JSON files the scrapers write get overwritten on every
 * run and a correction typed into one survived until the next scrape.
 * Sanity has no such problem. The agency document IS the record now, the
 * overlay is deprecated, and the site does not apply it over a CMS agency
 * at all - so a correction written as a listing today would render
 * nowhere. See "The `agencyListing` overlay is deprecated" in
 * app/directory/README.md.
 *
 * PATCHES, DOES NOT REPLACE. Every write here is a patch that names the
 * fields the agency corrected, so nothing an editor typed into any other
 * field can be lost. Two rules keep it from trampling Studio work even
 * within those fields:
 *
 *   1. A field that already holds a DIFFERENT value is reported and
 *      skipped. Someone put that there; a file is not the place to decide
 *      it was wrong. `--force=<slugs>` overrides, per agency.
 *   2. Clients are merged, never swapped. An existing row matched by
 *      domain or name keeps everything it has and only gains the link the
 *      agency supplied; an unmatched one is appended. So a correction
 *      cannot remove a client, and re-running adds nothing twice.
 *
 * That makes the script idempotent: run it again after a partial failure,
 * or after adding one agency to the file, and it writes only what is
 * genuinely missing.
 *
 * Usage:
 *   DRY_RUN=1 node scripts/agency-corrections/apply-agency-corrections.mjs
 *   SANITY_API_TOKEN=<token> node scripts/agency-corrections/apply-agency-corrections.mjs
 *   SANITY_API_TOKEN=<token> node scripts/agency-corrections/apply-agency-corrections.mjs --force=malvah
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORRECTIONS_FILE = resolve(__dirname, "agency-corrections.json");

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

/** Slugs whose existing values may be overwritten, from `--force=a,b`.
 *  Empty by default: a field that disagrees is a question, not a typo. */
const forceArg = process.argv.find((arg) => arg.startsWith("--force"));
const FORCE_SLUGS = new Set(
  (forceArg?.split("=")[1] ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean),
);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  // A dry run writes nothing, so it reads as the public does - which also
  // means it works with no token at all, or with a stale one left in the
  // environment. Only the real pass needs credentials.
  token: DRY_RUN ? undefined : token,
  useCdn: false,
});

/** Trimmed string, or null for anything blank. */
function text(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : null;
}

/** True when a field currently holds nothing an editor would recognise as
 *  an answer. An empty array counts: "rules nothing out" is stored as `[]`
 *  by the schema, but an agency that has now named exclusions is telling us
 *  the empty list was the absence of an answer rather than one. */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/** Comparison that does not care about key order or Sanity's `_key`, so a
 *  re-run recognises the rows it wrote last time. */
function sameValue(a, b) {
  const strip = (value) =>
    JSON.stringify(value, (key, inner) =>
      key === "_key"
        ? undefined
        : inner && typeof inner === "object" && !Array.isArray(inner)
          ? Object.fromEntries(Object.entries(inner).sort(([x], [y]) => x.localeCompare(y)))
          : inner,
    );
  return strip(a) === strip(b);
}

/** Lowercased, punctuation-free client name, for matching "M+C Saatchi
 *  Abel" against "M+C Saatchi Abel" across two sources that spell it
 *  differently. Never the dedupe key when a domain is available - two
 *  brands can share a name, but not a domain. */
function nameKey(name) {
  return (name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

/** Host with the www and any trailing slash taken off, lowercased. */
function domainKey(domain) {
  return (domain ?? "").toLowerCase().replace(/^www\./, "").replace(/\/+$/, "");
}

/** A `_key` for an appended client row. Derived from the name rather than
 *  the row's position so a re-run produces the same key for the same
 *  client instead of a duplicate under a new one. */
function clientKey(slug, name) {
  return `client-${slug}-${nameKey(name) || "unnamed"}`;
}

/**
 * Merges one agency's supplied clients into the ones already on record.
 *
 * @param slug - The agency's slug, for building `_key`s.
 * @param existing - `clients` as the document currently holds it.
 * @param supplied - The rows from the corrections file.
 * @returns The merged array and a human-readable list of what changed, or
 *          null for `clients` when nothing did.
 */
function mergeClients(slug, existing, supplied) {
  const rows = (existing ?? []).map((row) => ({ ...row }));
  const changes = [];

  for (const incoming of supplied ?? []) {
    const name = text(incoming.name);
    if (!name) continue;
    const domain = text(incoming.domain);
    const projectUrl = text(incoming.projectUrl);

    const match =
      (domain && rows.find((row) => domainKey(row.domain) === domainKey(domain))) ||
      rows.find((row) => nameKey(row.name) === nameKey(name));

    if (!match) {
      rows.push({
        _key: clientKey(slug, name),
        name,
        // `projectTitle` falls back to the client name by contract - see
        // AgencyClient in lib/directory/types.ts. An agency naming a client
        // directly has not named a project, so the name is the honest value
        // rather than an invented title.
        projectTitle: name,
        ...(domain ? { domain } : {}),
        ...(projectUrl ? { projectUrl } : {}),
      });
      changes.push(`+ ${name}${domain ? ` (${domain})` : ""}`);
      continue;
    }

    // Matched: fill the gaps, never overwrite. The row on record came from
    // a named source, and the agency is adding to it rather than disputing
    // it - a dispute is a Studio edit, not a line in this file.
    if (domain && !text(match.domain)) {
      match.domain = domain;
      changes.push(`~ ${match.name}: domain ${domain}`);
    }
    if (projectUrl && !text(match.projectUrl)) {
      match.projectUrl = projectUrl;
      changes.push(`~ ${match.name}: projectUrl ${projectUrl}`);
    }
  }

  return { clients: changes.length > 0 ? rows : null, changes };
}

/**
 * Works out the patch for one agency.
 *
 * @param correction - One entry from the corrections file.
 * @param document - The agency document as Sanity currently holds it.
 * @returns `{ set, changes, skipped }` - the fields to write, what changed
 *          in words, and the fields left alone because they already say
 *          something else.
 */
function buildPatch(correction, document) {
  const force = FORCE_SLUGS.has(correction.agencySlug);
  const set = {};
  const changes = [];
  const skipped = [];

  const fields = {
    ...(correction.set ?? {}),
    ...(correction.verifiedAt ? { verifiedAt: correction.verifiedAt } : {}),
    ...(correction.verifiedBy ? { verifiedBy: correction.verifiedBy } : {}),
  };

  for (const [field, value] of Object.entries(fields)) {
    const current = document[field];
    if (sameValue(current, value)) continue;
    if (!isEmpty(current) && !force) {
      skipped.push(`${field}: holds ${JSON.stringify(current)}`);
      continue;
    }
    set[field] = value;
    changes.push(`${field} = ${JSON.stringify(value)}`);
  }

  // `unset` is for the field a correction makes redundant rather than
  // wrong - an engagement note that only restates the exclusion beside it,
  // say. Setting it to "" would leave an empty string the profile has to
  // treat as content; removing the field is the honest shape for "the
  // agency said nothing here".
  const unset = (correction.unset ?? []).filter((field) => !isEmpty(document[field]));
  for (const field of unset) changes.push(`${field} removed`);

  const merged = mergeClients(correction.agencySlug, document.clients, correction.clients);
  if (merged.clients) {
    set.clients = merged.clients;
    changes.push(...merged.changes.map((line) => `clients ${line}`));
  }

  return { set, unset, changes, skipped };
}

const { corrections } = JSON.parse(readFileSync(CORRECTIONS_FILE, "utf8"));
const slugs = corrections.map((correction) => correction.agencySlug);

const documents = await client.fetch(
  `*[_type == "agency" && slug in $slugs]{ _id, slug, name, clients, verifiedAt, verifiedBy, awardsNote, budgetLabel, budgetFloorUsd, budgetMinimums, engagementNote, exclusions }`,
  { slugs },
);
const bySlug = new Map(documents.map((document) => [document.slug, document]));

const missing = slugs.filter((slug) => !bySlug.has(slug));
if (missing.length > 0) {
  // A correction for an agency that is not in the directory cannot render,
  // and a typo in a slug would otherwise pass silently as "nothing to do".
  console.error(`No agency document for: ${missing.join(", ")}`);
  process.exit(1);
}

const transaction = client.transaction();
let willWrite = 0;

for (const correction of corrections) {
  const document = bySlug.get(correction.agencySlug);
  const { set, unset, changes, skipped } = buildPatch(correction, document);

  console.log(`\n${document.name} (${document.slug})`);
  if (changes.length === 0) {
    console.log("  up to date");
  }
  for (const line of changes) console.log(`  ${line}`);
  for (const line of skipped) console.log(`  SKIPPED ${line} - pass --force=${document.slug} to overwrite`);

  if (Object.keys(set).length > 0 || unset.length > 0) {
    transaction.patch(document._id, (patch) => {
      const withSet = Object.keys(set).length > 0 ? patch.set(set) : patch;
      return unset.length > 0 ? withSet.unset(unset) : withSet;
    });
    willWrite += 1;
  }
}

console.log(
  `\n${willWrite} document(s) to patch, ${corrections.length - willWrite} already current.`,
);

if (DRY_RUN) {
  console.log("DRY_RUN=1 - nothing written.");
} else if (willWrite > 0) {
  await transaction.commit();
  console.log("Committed.");
} else {
  console.log("Nothing to write.");
}
