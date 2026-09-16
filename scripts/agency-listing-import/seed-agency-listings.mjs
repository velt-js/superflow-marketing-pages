#!/usr/bin/env node
/**
 * Seed agency-listings.json into Sanity as `agencyListing` documents - the
 * corrections agencies have sent about their own directory entries.
 *
 * SEEDS, DOES NOT SYNC. This is the one import script in the repo whose
 * JSON is not the source of truth. A listing exists so that a correction
 * can be made in Studio without a deploy; overwriting it from a file on
 * every run would take that back, and would silently discard whatever an
 * editor typed after the last run. So the default pass is
 * `createIfNotExists` - it seeds a listing the first time and leaves it
 * alone forever after. `--replace` forces a `createOrReplace` for the
 * slugs you name, for the case where the file is deliberately the newer
 * copy. There is no stale-delete pass: a document this script did not
 * create is not this script's to remove.
 *
 * Each listing is checked against the scraped dataset before it is
 * written. A listing whose `agencySlug` matches no record is ignored at
 * read time (the CMS cannot add an agency to the directory - see
 * sanity/schemas/agencyListing.ts), so writing one would just leave a
 * document that never renders. That is an error here, not a warning.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/agency-listing-import/seed-agency-listings.mjs
 *   DRY_RUN=1 node scripts/agency-listing-import/seed-agency-listings.mjs
 *   SANITY_API_TOKEN=<token> node scripts/agency-listing-import/seed-agency-listings.mjs --replace=dgrees,malvah
 *   SANITY_API_TOKEN=<token> node scripts/agency-listing-import/seed-agency-listings.mjs --replace=all
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../lib/directory/data");

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

/** Slugs to overwrite rather than seed, from `--replace=a,b` or
 *  `--replace=all`. Empty by default: the Studio wins. */
const replaceArg = process.argv.find((arg) => arg.startsWith("--replace"));
const replaceValue = replaceArg?.split("=")[1] ?? (replaceArg ? "all" : "");
const REPLACE_ALL = replaceValue === "all";
const REPLACE_SLUGS = new Set(
  replaceValue && !REPLACE_ALL ? replaceValue.split(",").map((s) => s.trim()) : [],
);

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const { listings = [] } = JSON.parse(
  readFileSync(resolve(__dirname, "agency-listings.json"), "utf8"),
);

/** Every slug the scraped dataset knows about, read from the same files
 *  lib/directory/agencies.ts merges - so this check cannot drift from what
 *  the site will actually find to merge onto. */
const knownSlugs = new Set(
  [
    "agencies.json",
    "seo-agencies.json",
    "branding-agencies.json",
    "motion-design-agencies.json",
  ].flatMap((file) => {
    try {
      const records = JSON.parse(readFileSync(resolve(DATA_DIR, file), "utf8"));
      return Array.isArray(records) ? records.map((record) => record?.slug) : [];
    } catch {
      return [];
    }
  }).filter(Boolean),
);

/** Deterministic `_key` for an array item, so a rerun does not churn keys
 *  and produce a diff in Studio's history for content that never moved. */
function keyed(items, prefix) {
  return (items ?? []).map((item, index) => ({
    ...item,
    _key: `${prefix}-${index}`,
  }));
}

/** Drops keys the schema does not define, so a stray field in the JSON
 *  fails loudly here rather than being written into the dataset and
 *  silently ignored forever. */
const ALLOWED_FIELDS = new Set([
  "agencySlug",
  "agencyName",
  "name",
  "website",
  "description",
  "location",
  "services",
  "industries",
  "teamSize",
  "foundedYear",
  "accolades",
  "awardsNote",
  "clients",
  "clientsMode",
  "budgetMinimums",
  "budgetLabel",
  "budgetFloorUsd",
  "exclusions",
  "engagementNote",
  "verifiedAt",
  "verifiedBy",
  "verificationSource",
]);

const errors = [];
const docs = [];

for (const listing of listings) {
  const slug = listing?.agencySlug?.trim();
  if (!slug) {
    errors.push("A listing has no agencySlug.");
    continue;
  }
  if (!knownSlugs.has(slug)) {
    errors.push(
      `${slug}: no agency with that slug in lib/directory/data/ - the listing would never render.`,
    );
    continue;
  }
  const unknownFields = Object.keys(listing).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownFields.length > 0) {
    errors.push(`${slug}: unknown field(s) ${unknownFields.join(", ")}.`);
    continue;
  }

  const doc = {
    _id: `agencyListing-${slug}`,
    _type: "agencyListing",
    ...listing,
    clients: keyed(listing.clients, `client-${slug}`),
    budgetMinimums: keyed(listing.budgetMinimums, `budget-${slug}`),
  };
  // Sanity stores no distinction between "absent" and "null", and the read
  // path treats both as "no correction" - so drop the nulls rather than
  // writing fields that mean nothing.
  for (const [key, value] of Object.entries(doc)) {
    if (value === null || (Array.isArray(value) && value.length === 0)) delete doc[key];
  }
  docs.push(doc);
}

if (errors.length > 0) {
  console.error("Refusing to write:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

const shouldReplace = (doc) =>
  REPLACE_ALL || REPLACE_SLUGS.has(doc.agencySlug);

if (DRY_RUN) {
  console.log(`DRY RUN - ${docs.length} agencyListing docs`);
  for (const doc of docs) {
    console.log(
      ` ${doc._id} [${shouldReplace(doc) ? "replace" : "seed"}] ` +
        `${doc.clients?.length ?? 0} clients (${doc.clientsMode ?? "replace"})` +
        `${doc.verifiedAt ? `, confirmed ${doc.verifiedAt}` : ""}`,
    );
  }
  process.exit(0);
}

let transaction = client.transaction();
for (const doc of docs) {
  transaction = shouldReplace(doc)
    ? transaction.createOrReplace(doc)
    : transaction.createIfNotExists(doc);
}
const result = await transaction.commit();

const replaced = docs.filter(shouldReplace).length;
console.log(
  `Wrote ${docs.length} agencyListing docs ` +
    `(${docs.length - replaced} seeded, ${replaced} replaced) ` +
    `(transaction ${result.transactionId}).`,
);
if (replaced < docs.length) {
  console.log(
    "Seeded docs that already existed were left untouched - Studio owns them. " +
      "Use --replace=<slug,slug> to overwrite.",
  );
}
