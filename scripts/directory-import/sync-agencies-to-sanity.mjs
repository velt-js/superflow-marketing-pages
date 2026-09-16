#!/usr/bin/env node
/**
 * Sync the scraped agency dataset into Sanity as `agency` documents.
 *
 * Sanity is the directory's source of truth (see sanity/schemas/agency.ts).
 * The scrapers still write JSON under lib/directory/data/, each overwriting
 * its own file wholesale on every run, and this is the bridge: it seeds a
 * document the first time it sees an agency and leaves it alone forever
 * after, so a re-scrape can never overwrite what an editor typed.
 *
 * SEEDS, DOES NOT SYNC BACK. The default pass is `createIfNotExists`.
 * `--replace` forces `createOrReplace` for the slugs you name, for the case
 * where the scrape is deliberately the newer copy - it discards every edit
 * made to those documents in Studio. There is no stale-delete pass: a
 * record removed from a source's file is not this script's to remove from
 * the directory, because an editor may have kept it on purpose.
 *
 * IT FOLDS IN THE `agencyListing` CORRECTIONS. Those documents exist
 * because the JSON files get overwritten; agency documents do not, so the
 * corrections belong in the record itself now. This script applies them the
 * same way lib/directory/overrides.ts does at read time (see `applyListing`
 * below, which mirrors `applyAgencyListing` field for field) and prints
 * every listing it folded, so they can be deleted once the run is verified.
 * The site no longer applies them over CMS agencies - only over the
 * fallback scrape - so a listing left behind is inert, not conflicting.
 *
 * Usage:
 *   DRY_RUN=1 node scripts/directory-import/sync-agencies-to-sanity.mjs
 *   SANITY_API_TOKEN=<token> node scripts/directory-import/sync-agencies-to-sanity.mjs
 *   SANITY_API_TOKEN=<token> node scripts/directory-import/sync-agencies-to-sanity.mjs --replace=dgrees,monks
 *   SANITY_API_TOKEN=<token> node scripts/directory-import/sync-agencies-to-sanity.mjs --replace=all
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../lib/directory/data");

/** Source files, highest priority first. Mirrors the argument order of
 *  `mergeAgencySources` in lib/directory/agencies.ts, which is what decides
 *  who wins a duplicate - keep the two in step. */
const SOURCE_FILES = [
  "agencies.json",
  "seo-agencies.json",
  "branding-agencies.json",
  "motion-design-agencies.json",
];

/** Documents written per transaction. Sanity caps a transaction's size, and
 *  323 full agency records comfortably exceed it. */
const BATCH_SIZE = 50;

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
  replaceValue && !REPLACE_ALL ? replaceValue.split(",").map((slug) => slug.trim()) : [],
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

/**
 * Reads one source file, tolerating an absent or empty one - a category
 * whose importer has not run yet ships as `[]`.
 *
 * @param {string} file - File name under lib/directory/data.
 * @returns {object[]} The records it holds.
 */
function readSource(file) {
  try {
    const records = JSON.parse(readFileSync(resolve(DATA_DIR, file), "utf8"));
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

/**
 * Concatenates the source files and dedupes them, first by registrable
 * domain and then by slug, earliest file winning.
 *
 * Mirrors `mergeAgencySources` in lib/directory/agencies.ts: this has to
 * produce the same set the site would render from the same files, or the
 * migration would quietly publish records the site never showed.
 *
 * @returns {object[]} The merged dataset.
 */
function mergeSources() {
  const combined = SOURCE_FILES.flatMap(readSource);

  const seenDomains = new Set();
  const domainDeduped = combined.filter((agency) => {
    const domain = agency?.domain?.trim().toLowerCase();
    if (!domain) return true;
    if (seenDomains.has(domain)) return false;
    seenDomains.add(domain);
    return true;
  });

  const seenSlugs = new Set();
  return domainDeduped.filter((agency) => {
    const slug = agency?.slug;
    if (!slug) return true;
    if (seenSlugs.has(slug)) return false;
    seenSlugs.add(slug);
    return true;
  });
}

/** Trimmed string, or null. */
const text = (value) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : null;
};

/** Non-empty trimmed strings, or null when there are none - null means "no
 *  correction", which is what lets a listing fix one field and leave the
 *  other twenty alone. */
const list = (values) => {
  const cleaned = (values ?? []).map(text).filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
};

/** Registrable domain from a URL or bare host. */
const normalizeDomain = (value) => {
  const raw = text(value);
  if (!raw) return null;
  return (
    raw
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      ?.trim() || null
  );
};

/**
 * Folds one `agencyListing` correction onto a scraped record.
 *
 * **Mirrors `applyAgencyListing` in lib/directory/overrides.ts.** Same
 * rules, same order, same "an empty field is not a correction" principle:
 * the point of this script is that the document it writes renders exactly
 * what the site renders today, and any divergence here is a silent content
 * change across the whole directory.
 *
 * Source attribution is never overridden - `slug`, `source`, `profileUrl`,
 * `awards` and `rating` are what the named directory published, and a
 * listing is not that directory.
 *
 * @param {object} agency - The scraped record.
 * @param {object|null} listing - The correction, if any.
 * @returns {object} The merged record.
 */
function applyListing(agency, listing) {
  if (!listing) return agency;

  const website = text(listing.website);
  const derivedDomain = website ? normalizeDomain(website) : null;

  const city = text(listing.location?.city);
  const country = text(listing.location?.country);
  const countryCode = text(listing.location?.countryCode);
  const hasLocation = Boolean(city || country || countryCode);

  const overrideClients = (listing.clients ?? [])
    .map((client) => {
      const name = text(client?.name);
      if (!name) return null;
      return {
        name,
        domain: normalizeDomain(client?.domain),
        projectTitle: text(client?.projectTitle) ?? name,
        projectUrl: text(client?.projectUrl),
        notable: false,
      };
    })
    .filter(Boolean);

  /** `add` appends and dedupes against what is already there (by domain,
   *  then by name); `replace` drops the scraped list, because an agency
   *  that sends the list it wants published is disowning the other one. */
  const clients = (() => {
    if (overrideClients.length === 0) return agency.clients;
    if (listing.clientsMode !== "add") return overrideClients;
    const seen = new Set(
      (agency.clients ?? []).flatMap((client) =>
        [client?.domain?.toLowerCase(), client?.name?.toLowerCase()].filter(Boolean),
      ),
    );
    const additions = overrideClients.filter((client) => {
      const keys = [client.domain?.toLowerCase(), client.name.toLowerCase()].filter(Boolean);
      if (keys.some((key) => seen.has(key))) return false;
      for (const key of keys) seen.add(key);
      return true;
    });
    return [...(agency.clients ?? []), ...additions];
  })();

  const budgetMinimums = (listing.budgetMinimums ?? [])
    .map((minimum) => {
      const scope = text(minimum?.scope);
      const currency = text(minimum?.currency);
      const amount = minimum?.amount;
      if (!scope || !currency) return null;
      // Positive, exactly as `applyAgencyListing` requires: a row reading
      // "Website - $0" is a half-typed entry, not a floor, and the schema
      // still permits one. The read path has always dropped it; if this
      // migration wrote it, the CMS becoming authoritative would publish a
      // figure the site had been hiding.
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
      return { scope, amount, currency: currency.toUpperCase() };
    })
    .filter(Boolean);

  return {
    ...agency,
    name: text(listing.name) ?? agency.name,
    website: website ?? agency.website,
    domain: derivedDomain ?? agency.domain,
    description: text(listing.description) ?? agency.description,
    logoUrl: text(listing.logoUrl) ?? agency.logoUrl,
    location: hasLocation
      ? {
          city: city ?? agency.location?.city ?? null,
          country: country ?? agency.location?.country ?? null,
          countryCode: (countryCode ?? agency.location?.countryCode)?.toUpperCase() ?? null,
        }
      : agency.location,
    services: list(listing.services) ?? agency.services,
    industries: list(listing.industries) ?? agency.industries,
    teamSize: text(listing.teamSize) ?? agency.teamSize,
    foundedYear:
      typeof listing.foundedYear === "number" && Number.isFinite(listing.foundedYear)
        ? listing.foundedYear
        : agency.foundedYear,
    accolades: list(listing.accolades) ?? agency.accolades,
    budgetLabel: text(listing.budgetLabel) ?? agency.budgetLabel,
    budgetFloorUsd:
      typeof listing.budgetFloorUsd === "number" && Number.isFinite(listing.budgetFloorUsd)
        ? listing.budgetFloorUsd
        : agency.budgetFloorUsd,
    clients,
    // The agency's own words, which no source directory publishes. These
    // are loose fields on the document rather than a nested object - see
    // the `listing` projection in sanity/lib/queries.ts, which rebuilds the
    // object the pages read.
    awardsNote: text(listing.awardsNote),
    engagementNote: text(listing.engagementNote),
    exclusions: list(listing.exclusions) ?? [],
    budgetMinimums,
    verifiedAt: text(listing.verifiedAt),
    verifiedBy: text(listing.verifiedBy),
  };
}

/**
 * Deterministic document id for an agency.
 *
 * **Hyphen, never a dot.** Sanity reads an `_id` containing a `.` as a
 * namespaced document - `drafts.foo`, `versions.<release>.foo` - and those
 * are invisible to unauthenticated reads. The site fetches with no token
 * (see sanity/client.ts), so `agency.<slug>` writes 323 documents that
 * query fine with a token, return nothing to the site, and leave it
 * falling back to the scrape forever while every check says the migration
 * succeeded. `scripts/agency-listing-import/seed-agency-listings.mjs` uses
 * the same hyphenated shape for the same reason.
 *
 * @param {string} slug - The agency's slug.
 * @returns {string} The document id.
 */
function documentId(slug) {
  return `agency-${slug}`;
}

/** Deterministic `_key` for an array item, so a rerun does not churn keys
 *  and produce a diff in Studio's history for content that never moved. */
function keyed(items, prefix) {
  return (items ?? []).map((item, index) => ({ ...item, _key: `${prefix}-${index}` }));
}

/**
 * Builds the `agency` document for one merged record.
 *
 * The award tally is written without its `total`: that figure is derived at
 * read time from the parts, and a stored copy drifts the moment an editor
 * corrects one count.
 *
 * @param {object} agency - The merged record.
 * @returns {object} The document to write.
 */
function toDocument(agency) {
  const doc = {
    _id: documentId(agency.slug),
    _type: "agency",
    slug: agency.slug,
    name: agency.name,
    website: agency.website ?? undefined,
    domain: agency.domain ?? undefined,
    profileUrl: agency.profileUrl ?? undefined,
    location: agency.location
      ? {
          city: agency.location.city ?? undefined,
          country: agency.location.country ?? undefined,
          countryCode: agency.location.countryCode ?? undefined,
        }
      : undefined,
    categories: agency.categories ?? [],
    services: agency.services ?? [],
    industries: agency.industries ?? [],
    teamSize: agency.teamSize ?? undefined,
    logoUrl: agency.logoUrl ?? undefined,
    description: agency.description ?? undefined,
    awards: {
      siteOfTheDay: agency.awards?.siteOfTheDay ?? 0,
      siteOfTheMonth: agency.awards?.siteOfTheMonth ?? 0,
      siteOfTheYear: agency.awards?.siteOfTheYear ?? 0,
      developerAward: agency.awards?.developerAward ?? 0,
      honorableMentions: agency.awards?.honorableMentions ?? 0,
      nominees: agency.awards?.nominees ?? 0,
    },
    rating: agency.rating
      ? {
          value: agency.rating.value,
          scale: agency.rating.scale,
          reviewCount: agency.rating.reviewCount ?? 0,
        }
      : undefined,
    accolades: agency.accolades ?? [],
    foundedYear: agency.foundedYear ?? undefined,
    budgetLabel: agency.budgetLabel ?? undefined,
    budgetFloorUsd: agency.budgetFloorUsd ?? undefined,
    clients: keyed(
      (agency.clients ?? []).map((client) => ({
        name: client.name,
        projectTitle: client.projectTitle ?? undefined,
        projectUrl: client.projectUrl ?? undefined,
        domain: client.domain ?? undefined,
        // Importer-set, and lost for good if the migration drops it - no
        // render path can infer which brands a general audience knows.
        notable: client.notable === true ? true : undefined,
      })),
      `client-${agency.slug}`,
    ),
    awardsNote: agency.awardsNote ?? undefined,
    engagementNote: agency.engagementNote ?? undefined,
    exclusions: agency.exclusions ?? [],
    budgetMinimums: keyed(agency.budgetMinimums ?? [], `budget-${agency.slug}`),
    verifiedAt: agency.verifiedAt ?? undefined,
    verifiedBy: agency.verifiedBy ?? undefined,
    source: agency.source,
    scrapedAt: agency.scrapedAt ?? undefined,
  };

  // Sanity stores no distinction between "absent" and "undefined", and the
  // read path treats an empty array as "nothing on file" - so drop them
  // rather than writing fields that mean nothing.
  for (const [key, value] of Object.entries(doc)) {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) delete doc[key];
  }
  return doc;
}

const merged = mergeSources();
if (merged.length === 0) {
  console.error(
    `No records found in ${DATA_DIR}. Run the importers first - see scripts/directory-import/README.md.`,
  );
  process.exit(1);
}

/** The corrections to fold in, newest first (matching the read path's
 *  ordering, so a duplicate listing resolves the same way it does today). */
let listings = [];
try {
  listings = await client.fetch(
    `*[_type == "agencyListing" && defined(agencySlug)] | order(_updatedAt desc)`,
  );
} catch (error) {
  console.error(`Could not read agencyListing documents: ${error?.message ?? error}`);
  if (!DRY_RUN) process.exit(1);
}

const listingBySlug = new Map();
for (const listing of listings ?? []) {
  const slug = text(listing?.agencySlug);
  if (slug && !listingBySlug.has(slug)) listingBySlug.set(slug, listing);
}

const errors = [];
const docs = [];
const foldedSlugs = [];

for (const agency of merged) {
  const slug = text(agency?.slug);
  if (!slug) {
    errors.push(`A record from ${agency?.source ?? "an unknown source"} has no slug.`);
    continue;
  }
  if (!text(agency?.name)) {
    errors.push(`${slug}: no name.`);
    continue;
  }
  if (!text(agency?.source)) {
    errors.push(`${slug}: no source, so the page would have nothing to attribute to.`);
    continue;
  }
  const listing = listingBySlug.get(slug) ?? null;
  if (listing) foldedSlugs.push(slug);
  docs.push(toDocument(applyListing(agency, listing)));
}

if (errors.length > 0) {
  console.error("Refusing to write:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

const shouldReplace = (doc) => REPLACE_ALL || REPLACE_SLUGS.has(doc.slug);

if (DRY_RUN) {
  const replacing = docs.filter(shouldReplace).length;
  console.log(`DRY RUN - ${docs.length} agency docs (${replacing} would be replaced)`);
  for (const doc of docs.slice(0, 10)) {
    console.log(
      ` ${doc._id} [${shouldReplace(doc) ? "replace" : "seed"}] ${doc.source}` +
        ` ${doc.categories?.join(",") ?? ""} ${doc.clients?.length ?? 0} clients`,
    );
  }
  if (docs.length > 10) console.log(` ... and ${docs.length - 10} more`);
  if (foldedSlugs.length > 0) {
    console.log(`Would fold in ${foldedSlugs.length} agencyListing correction(s):`);
    for (const slug of foldedSlugs) console.log(` - ${slug}`);
  }
  process.exit(0);
}

let created = 0;
for (let index = 0; index < docs.length; index += BATCH_SIZE) {
  const batch = docs.slice(index, index + BATCH_SIZE);
  let transaction = client.transaction();
  for (const doc of batch) {
    transaction = shouldReplace(doc)
      ? transaction.createOrReplace(doc)
      : transaction.createIfNotExists(doc);
  }
  await transaction.commit();
  created += batch.length;
  console.log(`  ${created}/${docs.length}`);
}

console.log(
  `Wrote ${docs.length} agency docs ` +
    `(${docs.filter(shouldReplace).length} replaced, the rest seeded only if absent).`,
);
if (foldedSlugs.length > 0) {
  console.log(
    `Folded in ${foldedSlugs.length} agencyListing correction(s): ${foldedSlugs.join(", ")}.\n` +
      `Those documents are now inert - the site applies them only to the fallback scrape. ` +
      `Delete them once you have checked the agency documents read correctly.`,
  );
}
