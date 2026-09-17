// Data-access helpers for the agency directory.
//
// This is the seam between app/directory/* pages and the scraped dataset in
// lib/directory/data/agencies.json. Pages should go through these helpers
// rather than importing the JSON file directly, so filtering/sorting logic
// lives in one place and every read path degrades gracefully.
//
// The dataset is the scrape with the CMS layered over it. Every helper that
// reads the dataset as a whole is therefore async: it awaits
// `getDirectoryAgencies` below, which merges the `agencyListing` documents
// in Sanity onto the scraped records. Helpers that take an `Agency` and
// only format it stay synchronous - they are pure functions of a record
// that has already been resolved, and several are called from client
// components that could not await anything anyway.
//
// The JSON file is `[]` until the scraper populates it (see
// lib/directory/types.ts header) and is expected to hold a few hundred
// records at runtime, so every helper here must handle an empty dataset
// without throwing.

import { getAgencyListingOverrides, getDirectoryAgencyDocuments } from "@/sanity/lib/queries";
import { toAgencies } from "./cms";
import { applyAgencyListings } from "./overrides";
import agenciesData from "./data/agencies.json";
import seoAgenciesData from "./data/seo-agencies.json";
import brandingAgenciesData from "./data/branding-agencies.json";
import motionDesignAgenciesData from "./data/motion-design-agencies.json";
import partnersData from "./data/partners.json";
import previewPartnersData from "./data/partners.preview.json";
import {
  isAccoladeRankedCategory,
  DIRECTORY_AGENCY_SEGMENT,
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORIES,
  SOURCE_LABEL_AWWWARDS,
  SOURCE_LABEL_CLUTCH,
  SOURCE_LABEL_DANDAD,
  SOURCE_LABEL_DESIGNRUSH,
  SOURCE_LABEL_EDITORIAL,
  SOURCE_LABEL_MOTION_DESIGN_AWARDS,
  SOURCE_LABEL_SEMRUSH,
} from "./constants";
import type {
  Agency,
  AgencyAwards,
  AgencyClient,
  AgencyLocation,
  AgencyRating,
  AgencySource,
  DirectoryCategory,
  SuperflowPartnerList,
} from "./types";

/**
 * Merges the per-source datasets into the one array every helper below
 * reads, deduping across them.
 *
 * `agencies.json` (Awwwards), `seo-agencies.json` (Semrush) and
 * `branding-agencies.json` (the browser-sourced branding set) are - and
 * must stay - separate files rather than one shared one: each writer under
 * scripts/directory-import/ overwrites its OWN file wholesale on every run.
 * A single shared file would mean the Semrush importer's run wipes out
 * every Awwwards record the next time it executes, and vice versa. Keeping
 * them apart lets each source refresh independently; this function is where
 * they are recombined for reading. A fourth source means a fourth file and
 * a fourth argument here, never an append into an existing file.
 *
 * Two "first occurrence wins" dedupe passes run in order, scanning the
 * datasets in the order they are passed, so an earlier dataset wins any
 * collision with a later one:
 *
 * 1. By registrable `domain`, case-insensitive - the one identity a
 *    visitor would recognise as "the same company" regardless of which
 *    directory it was scraped from. A null domain is never treated as an
 *    identity to match on (two different agencies neither source could
 *    resolve a domain for are not the same agency), so every domain-less
 *    record is kept.
 * 2. By `slug` - `getAgencyBySlug` below resolves by first array match,
 *    so two records that happen to derive the same slug from different
 *    names would otherwise make one of them unreachable at its own
 *    canonical URL. `getAllAgencySlugs` already dedupes its output
 *    defensively, but that only hides the symptom; this keeps the
 *    dataset itself free of the collision.
 *
 * @param datasets - Per-source record arrays, highest priority first. A
 *                    dataset kept earlier in this list wins any identity
 *                    collision with a later one.
 * @returns The concatenated, deduped dataset.
 */
export function mergeAgencySources(...datasets: Agency[][]): Agency[] {
  try {
    const combined = (datasets ?? []).flatMap((dataset) => dataset ?? []);

    const seenDomains = new Set<string>();
    const domainDeduped = combined.filter((agency) => {
      const domain = agency?.domain?.trim().toLowerCase();
      if (!domain) return true;
      if (seenDomains.has(domain)) return false;
      seenDomains.add(domain);
      return true;
    });

    const seenSlugs = new Set<string>();
    return domainDeduped.filter((agency) => {
      const slug = agency?.slug;
      if (!slug) return true;
      if (seenSlugs.has(slug)) return false;
      seenSlugs.add(slug);
      return true;
    });
  } catch {
    return datasets?.[0] ?? [];
  }
}

/** Raw dataset, typed against the shared `Agency` contract and merged
 *  across every source - see `mergeAgencySources`. The importers (plain
 *  .mjs scripts, no TS build step) are the sole writers of the JSON files
 *  and are responsible for conforming to `Agency` - this module only reads
 *  them. `branding-agencies.json` is validated field by field on the way in
 *  by load-branding-json.mjs, since unlike the others it is written from
 *  a hand-driven browser session rather than by a scraper. */
const SCRAPED_AGENCIES: Agency[] = mergeAgencySources(
  agenciesData as Agency[],
  seoAgenciesData as Agency[],
  brandingAgenciesData as Agency[],
  motionDesignAgenciesData as Agency[],
);

/** How long a resolved dataset is reused before the CMS is asked again.
 *  Matches the `revalidate` on the directory routes, so a correction
 *  published in the Studio reaches the site on the same clock the pages
 *  already promise rather than on a second, slower one of this module's
 *  own. */
const DATASET_TTL_MS = 60_000;

/** The in-flight or last-resolved dataset, with the time it was started.
 *  Memoized at module scope rather than per render: a full build renders
 *  several hundred agency pages, and one CMS fetch for all of them is the
 *  difference between one request and several hundred. */
let datasetCache: { startedAt: number; dataset: Promise<Agency[]> } | null = null;

/**
 * Resolves the dataset the pages render: the `agency` documents in Sanity,
 * falling back to the bundled scrape.
 *
 * **Sanity is the source of truth** (see sanity/schemas/agency.ts). The
 * JSON files under ./data are what the importers write and what this falls
 * back to, in two cases that look identical from here and are both
 * expected:
 *
 * 1. **Sanity is unreachable.** An outage then costs the edits made since
 *    the last deploy and nothing else - every page still renders, with
 *    everything its named source published. Failing instead would take
 *    ~320 working pages off the site.
 * 2. **Sanity holds no agencies yet**, because the sync in
 *    scripts/directory-import/sync-agencies-to-sanity.mjs has not been run
 *    against this dataset. This is what makes the migration safe to deploy
 *    ahead of running it: the site keeps rendering exactly what it rendered
 *    before, and starts reading the CMS the moment the documents exist.
 *
 * The `agencyListing` corrections are applied to the FALLBACK ONLY. On the
 * CMS path they are not a layer over anything - the sync folds them into
 * the agency documents, which is where an editor now edits them. Applying
 * both would mean a stale listing silently overwriting an edit made in the
 * document itself.
 *
 * A non-empty CMS response wins outright; there is no "merge what's
 * missing" pass. Half a dataset from a bad query is a problem to fix at
 * the source, not to paper over by refilling it from a file that may be
 * months behind.
 *
 * @returns The resolved dataset.
 */
async function resolveDataset(): Promise<Agency[]> {
  try {
    const documents = await getDirectoryAgencyDocuments();
    const agencies = toAgencies(documents);
    if (agencies.length > 0) return agencies;
  } catch {
    // Falls through to the scrape below - deliberately not rethrown.
  }

  try {
    const overrides = await getAgencyListingOverrides();
    return applyAgencyListings(SCRAPED_AGENCIES, overrides);
  } catch {
    return SCRAPED_AGENCIES;
  }
}

/**
 * The dataset every helper below reads - the `agency` documents in Sanity,
 * or the bundled scrape when those cannot be reached or do not exist yet.
 *
 * Memoized for `DATASET_TTL_MS`. The resolved promise is cached rather
 * than the array, so concurrent renders during a cold window share one
 * fetch instead of each starting their own. `resolveDataset` never
 * rejects, so a failed fetch caches the scraped baseline for one TTL and
 * then retries - it cannot wedge the cache with a rejected promise.
 *
 * @returns Every agency in the directory, corrections applied.
 */
export async function getDirectoryAgencies(): Promise<Agency[]> {
  try {
    const now = Date.now();
    if (!datasetCache || now - datasetCache.startedAt > DATASET_TTL_MS) {
      datasetCache = { startedAt: now, dataset: resolveDataset() };
    }
    return await datasetCache.dataset;
  } catch {
    return SCRAPED_AGENCIES;
  }
}

/** Raw partner list, typed against `SuperflowPartnerList`. Ships with an
 *  empty `domains` array until someone pastes in the real CRM export - see
 *  that file's own `source` field and lib/directory/types.ts for why this
 *  is a separate file from agencies.json rather than a field on `Agency`. */
const PARTNERS: SuperflowPartnerList = partnersData as SuperflowPartnerList;

/** Sample partner list, same shape, read ONLY when the preview flag below
 *  is set. Exists so the badge and the partners-first sort can be seen end
 *  to end while `partners.json` is still empty - the agencies in it are NOT
 *  confirmed customers. Never merge it into `partners.json`. */
const PREVIEW_PARTNERS: SuperflowPartnerList =
  previewPartnersData as SuperflowPartnerList;

/**
 * True when this build should badge the sample agencies in
 * `partners.preview.json` instead of the real (currently empty) CRM list.
 *
 * Off unless `NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS` is exactly `"1"`, so
 * an unset or misspelled value fails closed to real data. The badge's
 * tooltip asserts that a named agency uses Superflow, so shipping the
 * sample list publicly would publish a false claim about a real company -
 * which is why production is also refused outright below.
 *
 * `NEXT_PUBLIC_VERCEL_ENV` is set automatically on Vercel (`production` |
 * `preview` | `development`) and is a second, independent gate: even with
 * the flag set project-wide, a production build ignores it while preview
 * deploys still show the badge. On a host that does not set that variable
 * the comparison is trivially true and the flag is the only gate, so keep
 * the flag out of production env config there.
 *
 * Both reads are literal `process.env.NEXT_PUBLIC_*` lookups, never a
 * computed key, so Next can inline them into the client bundle -
 * `AgencyExplorer` is a `"use client"` component and re-sorts by partner
 * status in the browser. See lib/analytics/amplitude-client.ts for the
 * same constraint.
 */
const USE_PREVIEW_PARTNERS =
  process.env.NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS === "1" &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";

/** Partner registrable domains, lowercased, for O(1) case-insensitive
 *  membership checks. Built once at module load - see `isSuperflowPartner`. */
const PARTNER_DOMAINS = new Set(
  ((USE_PREVIEW_PARTNERS ? PREVIEW_PARTNERS : PARTNERS)?.domains ?? [])
    .map((domain) => domain?.trim().toLowerCase())
    .filter((domain): domain is string => Boolean(domain)),
);

/** Human labels for each award type, in the display order used on cards.
 *  Kept here (not inlined at each call site) since the breakdown is built
 *  in one place and consumed by one component. */
const AWARD_TYPE_LABELS: Record<keyof Omit<AgencyAwards, "total">, string> = {
  siteOfTheDay: "Site of the Day",
  siteOfTheMonth: "Site of the Month",
  siteOfTheYear: "Site of the Year",
  developerAward: "Developer Award",
  honorableMentions: "Honorable Mention",
  nominees: "Nominee",
};

/** Below this description length, a blurb is treated as a stub rather
 *  than real prose - see `shouldIndexAgency`. Chosen so a one-line stub
 *  ("Web design studio.") fails while a real profile blurb (roughly one
 *  full sentence) passes. A short blurb alone does NOT make a page thin;
 *  it only matters when the award record is also negligible. */
const MIN_DESCRIPTION_LENGTH_FOR_INDEXING = 80;

/** At or above this award total, a detail page carries enough substance
 *  to index on the award breakdown alone, regardless of blurb length.
 *  Set deliberately low: the breakdown, location, outbound links and
 *  related-agency block are already meaningful unique content, and the
 *  guard exists to catch bare stubs from future bulk sources (Overture
 *  and similar) rather than to suppress genuine award winners. */
const MIN_AWARDS_FOR_INDEXING = 5;

/** Soft cap for composed meta descriptions, matching the 140-160 char
 *  guidance in app/_seo/page-metadata.ts. */
const META_DESCRIPTION_MAX_LENGTH = 160;

/** Default number of cards in the "more agencies" interlinking block. */
const RELATED_AGENCIES_LIMIT_DEFAULT = 6;

const FALLBACK_META_TITLE = "Agency Profile";
const FALLBACK_META_DESCRIPTION =
  "An agency profile in the Superflow directory, with location, services, and award record.";
const FALLBACK_RELATED_HEADING = "More agencies";
const AWARDS_META_NOUN_SINGULAR = "Awwwards award";
const AWARDS_META_NOUN_PLURAL = "Awwwards awards";

/** Human labels for the attribution link, keyed by source. New sources
 *  added to `AgencySource` need an entry here or callers fall back to
 *  `GENERIC_SOURCE_LABEL` rather than throwing. Shared by AgencyCard and
 *  AgencyDetail so the label logic lives in exactly one place. */
const SOURCE_LABELS: Record<AgencySource, string> = {
  awwwards: SOURCE_LABEL_AWWWARDS,
  semrush: SOURCE_LABEL_SEMRUSH,
  clutch: SOURCE_LABEL_CLUTCH,
  designrush: SOURCE_LABEL_DESIGNRUSH,
  dandad: SOURCE_LABEL_DANDAD,
  "motion-design-awards": SOURCE_LABEL_MOTION_DESIGN_AWARDS,
  editorial: SOURCE_LABEL_EDITORIAL,
};

/** Fallback label for a source not present in `SOURCE_LABELS`. */
const GENERIC_SOURCE_LABEL = "View source profile";

/** Labels for the counted award tally - see `resolveAwardTallyLabel`. The
 *  generic one deliberately says "recorded" rather than "total": it is the
 *  count one named jury published, never a claim about every award an
 *  agency holds. */
const AWARD_TALLY_LABEL_AWWWARDS = "Awwwards awards";
const AWARD_TALLY_LABEL_AWWWARDS_ONE = "Awwwards award";
const AWARD_TALLY_LABEL_GENERIC = "Awards recorded";
const AWARD_TALLY_LABEL_GENERIC_ONE = "Award recorded";

/** Noun in the card's credential pill ("227 awards"). Deliberately NOT
 *  the jury's name: the pill is a figure, and the line beneath it is what
 *  attributes that figure - see `getAgencyCredential`. */
const AWARD_PILL_NOUN_PLURAL = "awards";
const AWARD_PILL_NOUN_SINGULAR = "award";

/** Joiner between the source label and the figure it published, in the
 *  card footer's attribution line. */
const CREDENTIAL_SEPARATOR = " \u00b7 ";

/**
 * Reports whether an agency is a Superflow partner/customer, joining
 * `lib/directory/data/partners.json` onto the agency by registrable
 * domain (case-insensitive) - see that file's header and
 * `SuperflowPartnerList` in `lib/directory/types.ts` for why this is a
 * join rather than a field on `Agency`. `partners.json` ships with an
 * empty `domains` array until a real CRM export replaces it, so this
 * returns false for every agency until then - that is the correct
 * behavior, not a bug to work around. To see the badge before that
 * export exists, set `NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS=1` and this
 * reads `partners.preview.json` instead (see `USE_PREVIEW_PARTNERS`).
 *
 * @param agency - The agency to check.
 * @returns True when the agency's domain matches an entry in
 *          `partners.json`.
 */
export function isSuperflowPartner(agency: Agency | null | undefined): boolean {
  try {
    const domain = agency?.domain?.trim().toLowerCase();
    if (!domain) return false;
    return PARTNER_DOMAINS.has(domain);
  } catch {
    return false;
  }
}

/**
 * Compares two agencies for the directory's default sort order: Superflow
 * partners first, then highest award total, then highest rating score
 * (see `getAgencyRatingScore`), then alphabetically by name as a stable
 * tiebreaker. Partner status is the primary key so a partner is visible
 * near the top of every listing without a visitor needing to know to look
 * for the badge.
 *
 * The award-total and rating-score keys never actually compete inside the
 * web design or SEO categories: Awwwards records carry awards and no
 * rating, Semrush records carry a rating and no awards, so whichever
 * signal is absent for a given agency is 0/0 and simply falls through to
 * the next key. This is one comparator serving disjoint slices of the
 * dataset - it is never attempting to weigh a counted award against a
 * client review, which would be comparing two different kinds of claim
 * (see `AgencyRating` in lib/directory/types.ts).
 *
 * This comparator is NOT used for every category. Branding records all have
 * `awards.total === 0` - that field is an Awwwards-scheme tally, and those
 * records keep their award wins in `accolades`, which this comparator does
 * not read - so ranking them here fell straight through to review score and
 * buried the award-only studios (Pentagram landed 126th of 144). That
 * category uses `compareAgenciesByAccolades` instead; see
 * ACCOLADE_RANKED_CATEGORIES in ./constants.ts for why the swap is scoped
 * to named categories rather than applied globally.
 *
 * @param agencyOne - First agency being compared.
 * @param agencyTwo - Second agency being compared.
 * @returns Negative when `agencyOne` sorts before `agencyTwo`, positive
 *          when it sorts after, zero when they are equivalent.
 */
function compareAgenciesDefaultOrder(agencyOne: Agency, agencyTwo: Agency): number {
  try {
    const partnerOne = isSuperflowPartner(agencyOne) ? 1 : 0;
    const partnerTwo = isSuperflowPartner(agencyTwo) ? 1 : 0;
    if (partnerTwo !== partnerOne) return partnerTwo - partnerOne;
    const totalOne = agencyOne?.awards?.total ?? 0;
    const totalTwo = agencyTwo?.awards?.total ?? 0;
    if (totalTwo !== totalOne) return totalTwo - totalOne;
    const ratingScoreOne = getAgencyRatingScore(agencyOne);
    const ratingScoreTwo = getAgencyRatingScore(agencyTwo);
    if (ratingScoreTwo !== ratingScoreOne) return ratingScoreTwo - ratingScoreOne;
    return (agencyOne?.name ?? "").localeCompare(agencyTwo?.name ?? "");
  } catch {
    return 0;
  }
}

/**
 * Orders a category whose credibility signal is `accolades` rather than a
 * counted award tally or a review score - see ACCOLADE_RANKED_CATEGORIES
 * for which categories those are and why the choice is scoped rather than
 * global.
 *
 * Same shape as `compareAgenciesDefaultOrder` and same partners-first
 * primary key; only the credibility key differs. The review score is kept
 * as the tiebreaker so agencies with equal accolade counts (including the
 * many with none) still rank against each other on something real.
 *
 * @param agencyOne - First agency being compared.
 * @param agencyTwo - Second agency being compared.
 * @returns Negative when `agencyOne` sorts before `agencyTwo`, positive
 *          when it sorts after, zero when they are equivalent.
 */
function compareAgenciesByAccolades(agencyOne: Agency, agencyTwo: Agency): number {
  try {
    const partnerOne = isSuperflowPartner(agencyOne) ? 1 : 0;
    const partnerTwo = isSuperflowPartner(agencyTwo) ? 1 : 0;
    if (partnerTwo !== partnerOne) return partnerTwo - partnerOne;
    const accoladesOne = agencyOne?.accolades?.length ?? 0;
    const accoladesTwo = agencyTwo?.accolades?.length ?? 0;
    if (accoladesTwo !== accoladesOne) return accoladesTwo - accoladesOne;
    const ratingScoreOne = getAgencyRatingScore(agencyOne);
    const ratingScoreTwo = getAgencyRatingScore(agencyTwo);
    if (ratingScoreTwo !== ratingScoreOne) return ratingScoreTwo - ratingScoreOne;
    return (agencyOne?.name ?? "").localeCompare(agencyTwo?.name ?? "");
  } catch {
    return 0;
  }
}

/**
 * Returns every agency belonging to the given category slug, sorted by
 * that category's ranking order (Superflow partners first, then its
 * credibility signal descending, then review score, then name).
 *
 * The per-category read behind `getDirectoryAgencyList`'s interleave, and
 * the one place a caller that wants a single category in its published
 * order should go - the list page itself asks for the whole directory and
 * narrows it client-side, since a category is a filter rather than a route
 * (see app/directory/README.md).
 *
 * @param categorySlug - The `DirectoryCategory.slug` to filter by.
 * @returns Matching agencies, sorted. Empty array for an unknown slug or
 *          while the dataset is still empty - callers render an empty
 *          state rather than treating this as an error.
 */
export async function getAgenciesByCategory(categorySlug: string): Promise<Agency[]> {
  try {
    if (!categorySlug) return [];
    const comparator = isAccoladeRankedCategory(categorySlug)
      ? compareAgenciesByAccolades
      : compareAgenciesDefaultOrder;
    const agencies = await getDirectoryAgencies();
    return agencies
      .filter((agency) => agency?.categories?.includes(categorySlug))
      .slice()
      .sort(comparator);
  } catch {
    return [];
  }
}

/**
 * Returns every agency in the directory as one ranked list - what
 * `/directory` renders now that categories are a filter rather than four
 * separate listings.
 *
 * **The order is a round-robin over the per-category rankings, not one
 * global comparator, and that is the whole point.** The categories rank on
 * signals that cannot be compared with each other: 227 Awwwards awards, a
 * 5/5 review score over 108 reviews and 34 D&AD Pencils are three different
 * kinds of claim (see `AgencyRating` in ./types.ts and "Accolades vs
 * awards" in app/directory/README.md). Any arithmetic that put them on one
 * axis would be inventing a ranking the sources never published - the
 * obvious `rating x 1000 + reviews` formulation, for instance, scores every
 * reviewed SEO agency above every award-winning studio in the directory.
 *
 * So each category is ranked by its own comparator (the same one
 * `getAgenciesByCategory` uses, so filtering this list to one category
 * reproduces that category's ranking exactly), and the lists are then
 * interleaved: every category's best, then every category's second, and so
 * on. Partners lead the whole list, as they lead every other listing here.
 *
 * @returns Every agency, deduped by slug, in the list page's default order.
 */
export async function getDirectoryAgencyList(): Promise<Agency[]> {
  try {
    const agencies = await getDirectoryAgencies();

    const queues = DIRECTORY_CATEGORIES.map((category) => {
      const comparator = isAccoladeRankedCategory(category.slug)
        ? compareAgenciesByAccolades
        : compareAgenciesDefaultOrder;
      return agencies
        .filter((agency) => agency?.categories?.includes(category.slug))
        .slice()
        .sort(comparator);
    });

    const seenSlugs = new Set<string>();
    const interleaved: Agency[] = [];
    const deepest = queues.reduce((longest, queue) => Math.max(longest, queue.length), 0);
    for (let position = 0; position < deepest; position += 1) {
      for (const queue of queues) {
        const agency = queue[position];
        // An agency listed in two categories surfaces in two queues; it
        // takes the earlier slot and is skipped in the later one.
        if (!agency || (agency.slug && seenSlugs.has(agency.slug))) continue;
        if (agency.slug) seenSlugs.add(agency.slug);
        interleaved.push(agency);
      }
    }

    // A record whose `categories` names nothing in the registry would
    // otherwise vanish from the only page that lists agencies. It sorts
    // last, but it is on the page.
    const uncategorized = agencies
      .filter((agency) => agency && (!agency.slug || !seenSlugs.has(agency.slug)))
      .slice()
      .sort(compareAgenciesDefaultOrder);

    const ordered = [...interleaved, ...uncategorized];
    // Partners first, relative order otherwise preserved (Array.prototype
    // .filter is stable), matching `compareAgenciesDefaultOrder`'s primary
    // key without re-sorting the interleave away.
    return [
      ...ordered.filter((agency) => isSuperflowPartner(agency)),
      ...ordered.filter((agency) => !isSuperflowPartner(agency)),
    ];
  } catch {
    return [];
  }
}

/**
 * Looks up a directory category by slug against the shared registry, so
 * pages have one place to answer "does this slug exist" instead of
 * re-searching DIRECTORY_CATEGORIES inline.
 *
 * @param categorySlug - The requested route slug.
 * @returns The matching category, or undefined when the slug is unknown.
 */
export function getDirectoryCategory(categorySlug: string): DirectoryCategory | undefined {
  try {
    if (!categorySlug) return undefined;
    return DIRECTORY_CATEGORIES.find((category) => category.slug === categorySlug);
  } catch {
    return undefined;
  }
}

/**
 * Formats an agency's location for card display, e.g. "Berlin, Germany".
 * City and country are handled independently since source profiles
 * frequently list one without the other.
 *
 * @param location - The agency's location record, possibly null.
 * @returns A display string, or null when there is nothing to show.
 */
export function formatAgencyLocation(location: AgencyLocation | null): string | null {
  try {
    if (!location) return null;
    const parts = [location.city, location.country].filter(
      (part): part is string => Boolean(part?.trim()),
    );
    if (parts.length === 0) return null;
    return parts.join(", ");
  } catch {
    return null;
  }
}

/**
 * Resolves the visible attribution label for an agency's source profile,
 * e.g. "Awwwards". Shared by every component that renders the outbound
 * attribution link.
 *
 * @param source - The agency's source directory, e.g. "awwwards".
 * @returns A human-readable label for the attribution link.
 */
export function resolveAgencySourceLabel(source: AgencySource | null | undefined): string {
  try {
    if (!source) return GENERIC_SOURCE_LABEL;
    return SOURCE_LABELS[source] ?? GENERIC_SOURCE_LABEL;
  } catch {
    return GENERIC_SOURCE_LABEL;
  }
}

/**
 * The label for an agency's counted award tally.
 *
 * Never "Total awards". `AgencyAwards` is Awwwards' scheme and nothing
 * else - see its doc comment in lib/directory/types.ts, and the way the
 * other sources keep their wins in `accolades` precisely because they are
 * a different jury's. A studio with 48 Awwwards awards and another thirty
 * from FWA, Laus and Behance is not a studio with 48 awards, and a label
 * saying "total" tells every such studio the directory has undercounted
 * them. Naming the jury makes the same number true.
 *
 * @param source - The source the record was collected from.
 * @param count - The tally itself, when the label sits inline next to it
 *                 ("1 Awwwards award") and has to agree with it. Omit
 *                 where the label heads a field rather than completing a
 *                 phrase - a field name stays plural at any count.
 * @returns The label to render for the tally.
 */
export function resolveAwardTallyLabel(
  source: AgencySource | null | undefined,
  count?: number,
): string {
  try {
    const singular = count === 1;
    if (source === "awwwards") {
      return singular ? AWARD_TALLY_LABEL_AWWWARDS_ONE : AWARD_TALLY_LABEL_AWWWARDS;
    }
    return singular ? AWARD_TALLY_LABEL_GENERIC_ONE : AWARD_TALLY_LABEL_GENERIC;
  } catch {
    return AWARD_TALLY_LABEL_GENERIC;
  }
}

/**
 * Builds the non-zero award breakdown for a card, in a fixed display
 * order (site of the day first, nominees last) rather than insertion
 * order, so cards read consistently across agencies.
 *
 * @param awards - The agency's award tallies.
 * @returns One entry per award type with a non-zero count.
 */
export function getAwardBreakdown(
  awards: AgencyAwards | null | undefined,
): Array<{ label: string; count: number }> {
  try {
    if (!awards) return [];
    return (Object.keys(AWARD_TYPE_LABELS) as Array<keyof typeof AWARD_TYPE_LABELS>)
      .map((awardType) => ({
        label: AWARD_TYPE_LABELS[awardType],
        count: awards[awardType] ?? 0,
      }))
      .filter((entry) => entry.count > 0);
  } catch {
    return [];
  }
}

/** Separator between the numeric score and the review count in a
 *  formatted rating, e.g. the " · " in "4.8/5 · 453 reviews". */
const RATING_SEPARATOR = " · ";

/** Review-count noun, singular and plural, for `formatAgencyRating`. */
const RATING_REVIEW_NOUN_SINGULAR = "review";
const RATING_REVIEW_NOUN_PLURAL = "reviews";

/**
 * Formats an agency rating for display, e.g. "4.8/5 · 453 reviews".
 *
 * Returns null - "nothing to show", not "show a zero" - when the rating
 * itself is null, or when its `value` or `reviewCount` is zero/absent: a
 * `reviewCount` of 0 is documented as "listed but unreviewed" (see
 * `AgencyRating` in lib/directory/types.ts) and has no average worth
 * printing.
 *
 * @param rating - The agency's rating record, possibly null.
 * @returns The formatted label, or null when there is nothing to show.
 */
export function formatAgencyRating(rating: AgencyRating | null | undefined): string | null {
  try {
    if (!rating) return null;
    const value = rating.value ?? 0;
    const reviewCount = rating.reviewCount ?? 0;
    if (value <= 0 || reviewCount <= 0) return null;
    const reviewNoun =
      reviewCount === 1 ? RATING_REVIEW_NOUN_SINGULAR : RATING_REVIEW_NOUN_PLURAL;
    return `${value}/${rating.scale}${RATING_SEPARATOR}${reviewCount} ${reviewNoun}`;
  } catch {
    return null;
  }
}

/** "Phantom" review count blended into `getAgencyRatingScore`'s shrinkage
 *  formula. See that function's JSDoc for why this exists. */
const RATING_PRIOR_REVIEWS = 5;

/**
 * The ranking signal for review-based sources (currently Semrush): a
 * rating's raw `value` shrunk toward zero by how few reviews back it, via
 * `value * (reviewCount / (reviewCount + RATING_PRIOR_REVIEWS))`.
 *
 * Without shrinkage a single 5.0 review would outrank a 4.8 averaged over
 * hundreds of reviews, which gets the ranking backwards - the
 * well-reviewed 4.8 is far more likely to reflect the agency's actual
 * quality. Blending in `RATING_PRIOR_REVIEWS` neutral "phantom" reviews
 * pulls a thin sample's score down toward zero in proportion to how thin
 * it is, without needing to invent what those phantom reviews would have
 * said.
 *
 * @param agency - The agency to score.
 * @returns The shrunk score, or 0 when the agency has no usable rating.
 */
export function getAgencyRatingScore(agency: Agency | null | undefined): number {
  try {
    const rating = agency?.rating;
    if (!rating) return 0;
    const value = rating.value ?? 0;
    const reviewCount = rating.reviewCount ?? 0;
    if (value <= 0 || reviewCount <= 0) return 0;
    return value * (reviewCount / (reviewCount + RATING_PRIOR_REVIEWS));
  } catch {
    return 0;
  }
}

/**
 * Award labels in the order they make the best one-line headline.
 *
 * Two rejected orderings, recorded so this isn't "fixed" back to either:
 *
 * - By count: Honorable Mentions dominate every breakdown, so this
 *   surfaced "131x Honorable Mention" for a studio that had also won Site
 *   of the Year - leading with its weakest credential.
 * - By prestige (Site of the Year first): technically correct but every
 *   top studio holds one, so every card read "1x Site of the Year" and
 *   the stat stopped distinguishing anyone.
 *
 * Site of the Day leads instead: it is Awwwards' flagship award, the most
 * recognisable to a visitor, and its count varies widely across studios,
 * so it adds information the adjacent total doesn't already convey.
 */
const AWARD_LABELS_BY_HEADLINE_PRIORITY: readonly string[] = [
  "Site of the Day",
  "Site of the Year",
  "Site of the Month",
  "Developer Award",
  "Honorable Mention",
  "Nominee",
];

/**
 * Picks the award that best headlines an agency, for a one-line summary.
 * See AWARD_LABELS_BY_HEADLINE_PRIORITY.
 *
 * Falls back to the highest-count entry if no label matches the priority
 * list, so a future source introducing an unknown award type still renders
 * something sensible rather than nothing.
 *
 * @param agency - The agency whose award record is being summarized.
 * @returns The highest-priority entry, or null when nothing is recorded.
 */
export function getHeadlineAward(
  agency: Agency | null | undefined,
): { label: string; count: number } | null {
  try {
    const breakdown = getAwardBreakdown(agency?.awards);
    if (breakdown.length === 0) return null;
    for (const label of AWARD_LABELS_BY_HEADLINE_PRIORITY) {
      const match = breakdown.find((entry) => entry?.label === label);
      if (match) return match;
    }
    return breakdown.reduce((best, entry) => (entry.count > best.count ? entry : best));
  } catch {
    return null;
  }
}

/**
 * Sources whose `accolades` entries are a jury's verdict, one entry per
 * win, and can therefore be counted as an award record.
 *
 * Scoped to a named list for the same reason ACCOLADE_RANKED_CATEGORIES is
 * (see ./constants.ts): the field means different things by source. D&AD
 * entries are Pencils and Motion Design Awards entries are single wins, so
 * the array length IS the award count. Half the Semrush records carry
 * self-reported badges in the same field ("Top Advertising Company", an
 * ISO certification), and counting those as awards would print a
 * credential the source never claimed.
 */
const JURY_ACCOLADE_SOURCES: readonly AgencySource[] = ["dandad", "motion-design-awards"];

/**
 * Reports whether a source's `accolades` are a jury's published record
 * rather than the agency's own claims about itself - see
 * JURY_ACCOLADE_SOURCES.
 *
 * The UI needs this because the two cases cannot share a caption: a D&AD
 * Pencil list captioned "self-reported, not independently verified" is
 * wrong about the jury, and a wall of vendor certifications captioned "as
 * published by the jury" is wrong about the agency.
 *
 * @param source - The record's source.
 * @returns True when each accolade is one counted win from a named jury.
 */
export function isJuryAccoladeSource(source: AgencySource | null | undefined): boolean {
  try {
    if (!source) return false;
    return JURY_ACCOLADE_SOURCES.includes(source);
  } catch {
    return false;
  }
}

/** The one credential a listing card leads with, plus the line naming who
 *  published it - see `getAgencyCredential`. */
export interface AgencyCredential {
  /** Headline figure for the card's pill ("227 awards", "5/5"), or null
   *  when the record carries no countable credential at all. */
  pill: string | null;
  /** Attribution line for the card footer. Always names the source
   *  directory, so no figure on a card is an unattributed claim. */
  meta: string;
}

/**
 * Resolves the single credential a card shows for an agency, and the line
 * that attributes it.
 *
 * **Every branch names the source.** A card carries no link back to the
 * source profile (that lives on the detail page, one click away), so the
 * label is the only thing on it standing behind the figure - see
 * app/directory/README.md. "5/5" on its own is an assertion; "5/5" beside
 * "Semrush Agency Partners - 108 reviews" is a citation.
 *
 * The branches are ordered by how strong the claim is, and only one ever
 * renders: a record carries a review score or an award tally or a jury's
 * accolades, essentially never two (see "Categories are ranked on
 * different, non-interchangeable signals" in app/directory/README.md).
 *
 * @param agency - The agency being summarized.
 * @returns The pill text (or null) and the attribution line.
 */
export function getAgencyCredential(agency: Agency | null | undefined): AgencyCredential {
  try {
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    // GENERIC_SOURCE_LABEL is CTA copy ("View source profile"), which reads
    // as a broken link when printed as an attribution line.
    const source = sourceLabel === GENERIC_SOURCE_LABEL ? "" : sourceLabel;
    const withSource = (detail: string) =>
      [source, detail].filter(Boolean).join(CREDENTIAL_SEPARATOR);

    const rating = agency?.rating ?? null;
    if (rating) {
      const reviewNoun =
        rating.reviewCount === 1 ? RATING_REVIEW_NOUN_SINGULAR : RATING_REVIEW_NOUN_PLURAL;
      return {
        pill: `${rating.value}/${rating.scale}`,
        meta: withSource(
          rating.reviewCount > 0 ? `${rating.reviewCount} ${reviewNoun}` : "",
        ),
      };
    }

    const awardTotal = agency?.awards?.total ?? 0;
    if (awardTotal > 0) {
      const headline = getHeadlineAward(agency);
      return {
        pill: `${awardTotal} ${awardTotal === 1 ? AWARD_PILL_NOUN_SINGULAR : AWARD_PILL_NOUN_PLURAL}`,
        meta: withSource(headline ? `${headline.count}x ${headline.label}` : ""),
      };
    }

    const accoladeCount = agency?.accolades?.length ?? 0;
    const juryCounted =
      accoladeCount > 0 &&
      Boolean(agency?.source) &&
      JURY_ACCOLADE_SOURCES.includes(agency?.source as AgencySource);
    if (juryCounted) {
      return {
        pill: `${accoladeCount} ${accoladeCount === 1 ? AWARD_PILL_NOUN_SINGULAR : AWARD_PILL_NOUN_PLURAL}`,
        meta: withSource(""),
      };
    }

    return { pill: null, meta: withSource("") };
  } catch {
    return { pill: null, meta: "" };
  }
}

/**
 * Builds the single canonical URL for an agency's detail page. The only
 * place `/directory/<DIRECTORY_AGENCY_SEGMENT>/<slug>` is assembled, so
 * every link (cards, sitemap, JSON-LD, canonical tags) stays in sync if
 * the segment ever changes.
 *
 * @param slug - The agency's `Agency.slug`.
 * @returns The root-relative path, or the directory hub path when `slug`
 *          is empty (a safe fallback rather than a malformed URL).
 */
export function agencyPath(slug: string): string {
  try {
    if (!slug) return DIRECTORY_BASE_PATH;
    return `${DIRECTORY_BASE_PATH}/${DIRECTORY_AGENCY_SEGMENT}/${slug}`;
  } catch {
    return DIRECTORY_BASE_PATH;
  }
}

/**
 * Looks up a single agency by its unique slug.
 *
 * @param slug - The requested route slug.
 * @returns The matching agency, or undefined when no record has that slug.
 */
export async function getAgencyBySlug(slug: string): Promise<Agency | undefined> {
  try {
    if (!slug) return undefined;
    const agencies = await getDirectoryAgencies();
    return agencies.find((agency) => agency?.slug === slug);
  } catch {
    return undefined;
  }
}

/**
 * Every agency slug in the dataset, deduplicated defensively even though
 * `Agency.slug` is documented as unique - a bad scrape should not crash
 * `generateStaticParams` with a duplicate-route build error.
 *
 * @returns All known agency slugs, in no particular order.
 */
export async function getAllAgencySlugs(): Promise<string[]> {
  try {
    const agencies = await getDirectoryAgencies();
    const slugs = agencies.map((agency) => agency?.slug).filter(
      (slug): slug is string => Boolean(slug),
    );
    return Array.from(new Set(slugs));
  } catch {
    return [];
  }
}

/** How many clients the compact "worked with" summary names before it
 *  collapses the rest into a count. Three fits one line on a card at the
 *  narrowest supported width without wrapping. */
const CLIENT_SUMMARY_NAME_LIMIT = 3;

/** Joiners for the client summary, kept here rather than inlined so the
 *  card, the detail page and the meta description all read identically. */
const CLIENT_SUMMARY_SEPARATOR = ", ";
const CLIENT_SUMMARY_FINAL_JOINER = " and ";

/** Minimum clients for the list to count as real content on its own - see
 *  `shouldIndexAgency`. One name is a footnote; three is a body of work. */
const MIN_CLIENTS_FOR_INDEXING = 3;

/** Minimum review count for a rating to count as real substance on its
 *  own - see `shouldIndexAgency`. A rating value alone says little; a
 *  handful of reviews behind it is a credible signal, one or two is
 *  closer to noise. */
const MIN_RATING_REVIEWS_FOR_INDEXING = 3;

/** Minimum listed services for the service list to count as real content
 *  on its own - see `shouldIndexAgency`. A single free-text tag is not a
 *  real capability list; a handful is. */
const MIN_SERVICES_FOR_INDEXING = 3;

/**
 * Minimum `accolades` entries for the accolade list to count as real
 * content on its own - see `shouldIndexAgency`.
 *
 * Added with the motion design category, which would otherwise be almost
 * entirely `noindex`: Motion Design Awards records carry no services, no
 * clients, no rating and a zeroed award tally, and their blurbs are short
 * (Buff's is 60 characters against the 80 this guard wants). A studio
 * holding several jury awards, each named with the project that won it, is
 * not a thin page - the accolade list IS the substance, and it is unique
 * per studio.
 *
 * Set to 3 to match the client and service thresholds either side of it:
 * one win is a footnote, a handful is a record. This also closes the same
 * latent gap for the branding category's D&AD records, where only 2 of 22
 * carry a blurb long enough to clear the description route on its own.
 */
const MIN_ACCOLADES_FOR_INDEXING = 3;

/**
 * An agency's client list, cleaned for rendering: entries with no usable
 * name dropped, and no two entries showing the same name twice.
 *
 * Deduping happens here rather than in the scraper because the scraper
 * dedupes on `domain`, which is the correct key for *collection* (it can
 * tell two brands apart before their names are resolved) but not for
 * *display* - one brand reached under two domains would otherwise print
 * its name twice in a row.
 *
 * @param agency - The agency whose clients to read.
 * @returns Display-ready clients in stored order (recognisable first),
 *          or an empty array when there are none.
 */
/**
 * Where a client row should link, or null when we hold no link for it.
 *
 * Two of `AgencyClient`'s fields are addresses and they are not the same
 * kind of thing. `domain` is the client's own site - for most records the
 * live site the agency built, which is the strongest evidence a profile
 * can offer and the one a visitor evaluating a studio actually wants.
 * `projectUrl` is the SOURCE's page for that project (an Awwwards entry,
 * say): a citation for the row rather than the work itself. So the live
 * site wins, and the citation is the fallback for the rows that have no
 * domain because the work was hosted somewhere generic.
 *
 * 719 of 1,515 client rows have neither, which is why this returns null
 * rather than inventing an address from the name.
 *
 * @param client - The client row.
 * @returns An absolute URL, or null when the row carries no link.
 */
export function getAgencyClientLink(client: AgencyClient | null | undefined): string | null {
  try {
    const domain = client?.domain?.trim();
    if (domain) {
      // Stored as a bare host by contract, but a record typed by hand may
      // carry a full URL. `new URL` settles which it is instead of us
      // guessing, and rejects anything that is neither.
      const url = new URL(/^https?:\/\//i.test(domain) ? domain : `https://${domain}`);
      if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
    }
    const projectUrl = client?.projectUrl?.trim();
    if (projectUrl && /^https?:\/\//i.test(projectUrl)) return projectUrl;
    return null;
  } catch {
    // A malformed domain is a row that renders as plain text, never a
    // broken link and never a crash.
    return null;
  }
}

/**
 * Formats one stated project-size floor, e.g. "€15,000".
 *
 * Formatted in the currency the agency quoted, never converted into one
 * shared currency: a rate they did not give is a figure they did not
 * state. Falls back to "CODE 15000" if `Intl` rejects the code, which is
 * still readable and still honest about which currency it is.
 *
 * FRACTIONS ARE KEPT. A floor is a whole figure in practice, and the
 * schema now requires one, but a value already in the CMS or arriving
 * from an importer may not be - and rounding it here would print a
 * number the agency never said, while the Markdown copy published the
 * real one beside it. Two surfaces disagreeing about an agency's price
 * is worse than a page with pennies on it.
 *
 * @param amount - The figure, unformatted.
 * @param currency - Three-letter ISO currency code.
 * @returns The formatted amount.
 */
export function formatBudgetAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function getAgencyClients(agency: Agency | null | undefined): AgencyClient[] {
  try {
    const seenNames = new Set<string>();
    const clients: AgencyClient[] = [];
    for (const client of agency?.clients ?? []) {
      const name = client?.name?.trim();
      if (!name) continue;
      const dedupeKey = name.toLowerCase();
      if (seenNames.has(dedupeKey)) continue;
      seenNames.add(dedupeKey);
      clients.push({ ...client, name });
    }
    return clients;
  } catch {
    return [];
  }
}

/**
 * A one-line "Nike, Spotify, Xbox +4 more" summary of who an agency has built
 * for, for the places that have room for a sentence rather than a list -
 * the category-grid card and the meta description.
 *
 * @param agency - The agency to summarize.
 * @param limit - How many clients to name before collapsing the remainder
 *                into a count. Defaults to `CLIENT_SUMMARY_NAME_LIMIT`.
 * @returns The summary - "A and B" when it names every client, "A, B, C
 *          +N more" when it doesn't - or null when the agency has no
 *          clients on record
 *          (callers render nothing rather than an empty label).
 */
export function formatAgencyClientSummary(
  agency: Agency | null | undefined,
  limit: number = CLIENT_SUMMARY_NAME_LIMIT,
): string | null {
  try {
    const clients = getAgencyClients(agency);
    if (clients.length === 0) return null;

    const safeLimit = Math.max(1, limit);
    const namedClients = clients.slice(0, safeLimit).map((client) => client.name);
    const remainingCount = clients.length - namedClients.length;

    // "A, B and C" closes a complete list, but reads wrong in front of an
    // overflow count - "A, B and C +9 more" implies C was the last one. With
    // more to come the list stays open: "A, B, C +9 more".
    const closesTheList = remainingCount === 0 && namedClients.length > 1;
    const namedLabel = closesTheList
      ? `${namedClients.slice(0, -1).join(CLIENT_SUMMARY_SEPARATOR)}${CLIENT_SUMMARY_FINAL_JOINER}${namedClients[namedClients.length - 1]}`
      : namedClients.join(CLIENT_SUMMARY_SEPARATOR);

    return remainingCount > 0 ? `${namedLabel} +${remainingCount} more` : namedLabel;
  } catch {
    return null;
  }
}

/**
 * Decides whether an agency's detail page is substantial enough to index.
 *
 * A page is thin only when it fails every one of five independent
 * substance signals: a real blurb, a real award record, a real client
 * list, a real (well-reviewed) rating, or a real service list. It needs
 * only one to be worth indexing - each is its own kind of unique content
 * (prose, a counted award breakdown, named client work, a third-party
 * review score, a capability list), so none of them needs the others to
 * justify a page existing.
 *
 * Requiring all of them at once (an earlier formulation only checked the
 * first three) suppressed studios like Resn and Active Theory, which
 * carry 150+ awards behind a four-word tagline - plainly not thin
 * content. The guard exists to catch bare stubs from future bulk sources,
 * not to punish a terse profile blurb, a source with no award scheme, or
 * a source with no review scheme.
 *
 * Pages failing this still render and stay internally linked; they are
 * only marked `noindex, follow` and dropped from the sitemap.
 *
 * @param agency - The agency to evaluate.
 * @returns True unless the agency clears none of: description length,
 *          award total, client count, rating review count, and service
 *          count against their respective `MIN_*_FOR_INDEXING` constants.
 */
export function shouldIndexAgency(agency: Agency | null | undefined): boolean {
  try {
    if (!agency) return false;
    const description = agency.description?.trim() ?? "";
    const hasRealDescription =
      description.length >= MIN_DESCRIPTION_LENGTH_FOR_INDEXING;
    const hasRealAwardRecord =
      (agency.awards?.total ?? 0) >= MIN_AWARDS_FOR_INDEXING;
    const hasRealClientList =
      getAgencyClients(agency).length >= MIN_CLIENTS_FOR_INDEXING;
    const hasRealRating =
      (agency.rating?.reviewCount ?? 0) >= MIN_RATING_REVIEWS_FOR_INDEXING;
    const realServiceCount =
      agency.services?.filter((service) => Boolean(service?.trim())).length ?? 0;
    const hasRealServiceList = realServiceCount >= MIN_SERVICES_FOR_INDEXING;
    const realAccoladeCount =
      agency.accolades?.filter((accolade) => Boolean(accolade?.trim())).length ?? 0;
    const hasRealAccoladeList = realAccoladeCount >= MIN_ACCOLADES_FOR_INDEXING;
    return (
      hasRealDescription ||
      hasRealAwardRecord ||
      hasRealClientList ||
      hasRealRating ||
      hasRealServiceList ||
      hasRealAccoladeList
    );
  } catch {
    return false;
  }
}

/**
 * Slugs of every agency that passes `shouldIndexAgency`. This is what the
 * sitemap maps over - a held-back agency still gets a real, working page
 * (linked from its category and from related-agency blocks), it just
 * isn't submitted to search engines via the sitemap and carries a
 * `noindex` tag.
 *
 * @returns Indexable agency slugs.
 */
export async function getIndexableAgencySlugs(): Promise<string[]> {
  try {
    const agencies = await getDirectoryAgencies();
    return agencies
      .filter((agency) => shouldIndexAgency(agency))
      .map((agency) => agency?.slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}

/** Counts of agencies split by the thin-content gate, for reporting /
 *  sanity-checking how much of the dataset is actually indexable. */
export interface AgencyIndexingSummary {
  total: number;
  indexable: number;
  heldBack: number;
}

/**
 * Summarizes how much of the dataset clears the thin-content bar.
 *
 * @returns Total agency count, how many are indexable, and how many are
 *          held back (noindex, excluded from the sitemap).
 */
export async function getAgencyIndexingSummary(): Promise<AgencyIndexingSummary> {
  try {
    const agencies = await getDirectoryAgencies();
    const total = agencies.length;
    const indexable = agencies.filter((agency) => shouldIndexAgency(agency)).length;
    return { total, indexable, heldBack: total - indexable };
  } catch {
    return { total: 0, indexable: 0, heldBack: 0 };
  }
}

/** A capped, data-derived internal-link block shown at the bottom of a
 *  detail page, with a heading that names what the agencies have in
 *  common. */
export interface RelatedAgenciesBlock {
  heading: string;
  agencies: Agency[];
}

/**
 * Picks agencies to interlink from a given agency's detail page, so pages
 * are crawlable via more than one path instead of being orphaned behind
 * the category listing alone.
 *
 * Three tiers, in order: same country AND same primary category, then
 * same category anywhere, then same country in any category. A
 * location-based grouping reads more useful to a visitor than an
 * arbitrary "related" label - but only among agencies doing the same kind
 * of work, which is why country no longer wins on its own. It used to,
 * correctly, while web design was the only category; with a second
 * category that rule started putting web design studios under an SEO
 * agency's profile on the strength of a shared country alone.
 *
 * @param agency - The agency whose detail page is being rendered.
 * @param limit - Maximum agencies to return. Defaults to
 *                `RELATED_AGENCIES_LIMIT_DEFAULT`.
 * @returns A heading plus up to `limit` agencies, sorted by the
 *          directory's default order. Empty when nothing qualifies.
 */
export async function getRelatedAgencies(
  agency: Agency | null | undefined,
  limit: number = RELATED_AGENCIES_LIMIT_DEFAULT,
): Promise<RelatedAgenciesBlock> {
  try {
    if (!agency) return { heading: FALLBACK_RELATED_HEADING, agencies: [] };

    // Resolved once here rather than inside `collectTier`, which runs up
    // to three times per page.
    const dataset = await getDirectoryAgencies();
    const countryName = agency.location?.country?.trim();
    const primaryCategorySlug = agency.categories?.[0];
    const category = primaryCategorySlug
      ? getDirectoryCategory(primaryCategorySlug)
      : undefined;

    /**
     * Collects candidates for one tier: never the agency itself, and
     * matching whichever of country/category that tier constrains on.
     *
     * @param requireCountry - Restrict to the agency's own country.
     * @param requireCategory - Restrict to the agency's primary category.
     * @returns Up to `limit` agencies in the directory's default order.
     */
    const collectTier = (requireCountry: boolean, requireCategory: boolean): Agency[] => {
      try {
        return dataset.filter((candidate) => {
          if (!candidate || candidate.slug === agency.slug) return false;
          if (requireCountry && candidate.location?.country?.trim() !== countryName) {
            return false;
          }
          if (requireCategory && !candidate.categories?.includes(primaryCategorySlug ?? "")) {
            return false;
          }
          return true;
        })
          .slice()
          .sort(compareAgenciesDefaultOrder)
          .slice(0, limit);
      } catch {
        return [];
      }
    };

    // Country AND category first. Country alone used to win outright, which
    // was right while web-design was the only category but stopped being so
    // the moment a second one existed: it put web design studios under an
    // SEO agency's profile purely because both were in the same country.
    // Same-country is still the most useful grouping to a visitor - it just
    // has to be same-country *among agencies that do the same work*.
    if (countryName && primaryCategorySlug) {
      const sameCountryAndCategory = collectTier(true, true);
      if (sameCountryAndCategory.length > 0) {
        const categoryLabel = category?.title ?? "";
        const heading = categoryLabel
          ? `More ${categoryLabel} agencies in ${countryName}`
          : `More agencies in ${countryName}`;
        return { heading, agencies: sameCountryAndCategory };
      }
    }

    // Then category anywhere in the world - relevance of discipline beats
    // proximity once the country tier has come up empty.
    if (primaryCategorySlug) {
      const sameCategory = collectTier(false, true);
      if (sameCategory.length > 0) {
        const heading = category ? `More in ${category.title}` : FALLBACK_RELATED_HEADING;
        return { heading, agencies: sameCategory };
      }
    }

    // Last resort: same country, any discipline. Only reachable for an
    // agency whose category has no other members at all, where a
    // cross-category link still beats an orphaned page.
    if (countryName) {
      const sameCountry = collectTier(true, false);
      if (sameCountry.length > 0) {
        return { heading: `More agencies in ${countryName}`, agencies: sameCountry };
      }
    }

    return { heading: FALLBACK_RELATED_HEADING, agencies: [] };
  } catch {
    return { heading: FALLBACK_RELATED_HEADING, agencies: [] };
  }
}

/**
 * Truncates composed meta text at a word boundary so pSEO descriptions
 * never end mid-word in a search snippet.
 *
 * @param text - The full composed text.
 * @param maxLength - Maximum character length to keep.
 * @returns `text` unchanged if already short enough, else a word-safe
 *          prefix with a trailing ellipsis.
 */
function truncateForMeta(text: string, maxLength: number): string {
  try {
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;
    const clipped = trimmed.slice(0, maxLength - 1);
    const lastSpaceIndex = clipped.lastIndexOf(" ");
    const safeClip = lastSpaceIndex > 40 ? clipped.slice(0, lastSpaceIndex) : clipped;
    return `${safeClip}…`;
  } catch {
    return text;
  }
}

/**
 * Builds a per-agency `<title>` that varies with the fields actually on
 * record, rather than a fixed template that only swaps the name (which
 * is what produces near-duplicate titles across a pSEO set).
 *
 * @param agency - The agency to title.
 * @returns A title combining the agency's name, its primary category,
 *          and its location when known.
 */
export function buildAgencyMetaTitle(agency: Agency | null | undefined): string {
  try {
    if (!agency?.name) return FALLBACK_META_TITLE;
    const primaryCategorySlug = agency.categories?.[0];
    const category = primaryCategorySlug ? getDirectoryCategory(primaryCategorySlug) : undefined;
    const categoryLabel = category?.title ?? "Agency";
    const location = formatAgencyLocation(agency.location ?? null);
    return location
      ? `${agency.name} - ${categoryLabel} in ${location}`
      : `${agency.name} - ${categoryLabel}`;
  } catch {
    return FALLBACK_META_TITLE;
  }
}

/**
 * Builds a per-agency meta description from the agency's own blurb plus a
 * location/award clause, so descriptions differ agency to agency instead
 * of reading as one template with the name swapped in.
 *
 * @param agency - The agency to describe.
 * @returns A composed description, capped at
 *          `META_DESCRIPTION_MAX_LENGTH` characters.
 */
export function buildAgencyMetaDescription(agency: Agency | null | undefined): string {
  try {
    if (!agency) return FALLBACK_META_DESCRIPTION;

    const clauses: string[] = [];
    const description = agency.description?.trim();
    if (description) clauses.push(description);

    const location = formatAgencyLocation(agency.location ?? null);
    const awardsTotal = agency.awards?.total ?? 0;
    const awardsNoun = awardsTotal === 1 ? AWARDS_META_NOUN_SINGULAR : AWARDS_META_NOUN_PLURAL;
    // A rating only stands in for the awards clause when there is no award
    // record to report - the two never coexist on one record (an Awwwards
    // profile has no rating, a Semrush profile has no awards; see
    // `AgencyRating` in lib/directory/types.ts), so this is a substitution
    // for the same clause slot, not an addition alongside it.
    const ratingLabel = awardsTotal === 0 ? formatAgencyRating(agency.rating) : null;

    if (location && awardsTotal > 0) {
      clauses.push(`Based in ${location}, with ${awardsTotal} ${awardsNoun}.`);
    } else if (location && ratingLabel) {
      clauses.push(`Based in ${location}, rated ${ratingLabel}.`);
    } else if (location) {
      clauses.push(`Based in ${location}.`);
    } else if (awardsTotal > 0) {
      clauses.push(`Recognised with ${awardsTotal} ${awardsNoun}.`);
    } else if (ratingLabel) {
      clauses.push(`Rated ${ratingLabel} by clients.`);
    }

    // Named clients differentiate two agencies that share a city and an
    // award count, which location and awards alone cannot.
    const clientSummary = formatAgencyClientSummary(agency);
    if (clientSummary) clauses.push(`Work for ${clientSummary}.`);

    const combined = clauses.join(" ").trim();
    return combined.length > 0
      ? truncateForMeta(combined, META_DESCRIPTION_MAX_LENGTH)
      : FALLBACK_META_DESCRIPTION;
  } catch {
    return FALLBACK_META_DESCRIPTION;
  }
}

/**
 * Builds a `PostalAddress` JSON-LD node from an agency's location,
 * omitting the node entirely when there is nothing to put in it so the
 * caller never emits an address object with no usable fields.
 *
 * @param location - The agency's location record, possibly null.
 * @returns A `PostalAddress` node, or null when city and country are both
 *          absent.
 */
function buildAgencyPostalAddress(
  location: AgencyLocation | null | undefined,
): Record<string, unknown> | null {
  try {
    if (!location) return null;
    const address: Record<string, unknown> = { "@type": "PostalAddress" };
    if (location.city?.trim()) address.addressLocality = location.city.trim();
    if (location.country?.trim()) address.addressCountry = location.country.trim();
    return Object.keys(address).length > 1 ? address : null;
  } catch {
    return null;
  }
}

/**
 * Builds the `Organization` JSON-LD node for an agency detail page. Only
 * fields present on the record are emitted - never `null` or an empty
 * string - so the payload stays valid regardless of how sparse a given
 * record is.
 *
 * Deliberately does NOT include Superflow-partner status: schema.org has
 * no property that means "is a customer of this specific software
 * product" without stretching one past its intent (`memberOf` implies
 * formal membership; `award` would be a straight misuse). Rather than
 * invent or misuse a property, partner status stays a visible badge only
 * (see components/directory/PartnerBadge.tsx) and is left out of the
 * structured data.
 *
 * @param agency - The agency to describe.
 * @returns A schema.org `Organization` node, or null when there is no
 *          agency to describe.
 */
export function buildAgencyOrganizationJsonLd(
  agency: Agency | null | undefined,
): Record<string, unknown> | null {
  try {
    if (!agency) return null;

    const node: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: agency.name,
      // Falls back to the source profile when the agency's own site is
      // unknown, and omits `url` entirely when neither exists - an
      // Organization node with no URL is still a valid, useful node, and
      // inventing one would not be.
      ...(agency.website || agency.profileUrl
        ? { url: agency.website ?? agency.profileUrl }
        : {}),
    };
    if (agency.description) node.description = agency.description;
    if (agency.logoUrl) node.logo = agency.logoUrl;
    if (agency.profileUrl) node.sameAs = [agency.profileUrl];

    const address = buildAgencyPostalAddress(agency.location);
    if (address) node.address = address;

    return node;
  } catch {
    return null;
  }
}

/** How many client names a list card prints before the rest collapse into
 *  a "+N" chip. */
const CARD_CLIENT_LIMIT = 3;

/**
 * Everything the directory list needs about one agency: the fields its card
 * paints, plus the fields its controls filter and sort on.
 *
 * **This is the whole of what crosses the client boundary**, and it is
 * deliberately not the `Agency` record. Two separate reasons, both load-
 * bearing:
 *
 * - A `"use client"` file that imports anything real from this module pulls
 *   the whole of `agencies.json` (and the Sanity client behind
 *   `getDirectoryAgencies`) into the browser bundle, because JSON module
 *   imports are not reliably tree-shaken. So the client gets plain data as
 *   props and imports only this *type*, which is erased at compile time.
 * - The list runs to a few hundred cards. Passing pre-rendered
 *   `<AgencyCard/>` elements across the boundary instead - which is what
 *   this page used to do - serializes every one of those element trees into
 *   the RSC payload on top of the same markup already in the HTML. On 323
 *   cards that was 983 KB of duplicate payload, 57% of the document. This
 *   projection is roughly a fifth of that and carries no field a card does
 *   not paint.
 *
 * Build these server-side with `buildAgencyListItems`.
 */
export interface AgencyListItem {
  slug: string;
  name: string;
  /** Path to the agency's detail page. Assembled here because `agencyPath`
   *  is a value in this module and a client card cannot import one. */
  href: string;
  /** Source-hosted logo, or null for the records with none on file. */
  logoUrl: string | null;
  /** "Berlin, Germany", already formatted. */
  locationLabel: string | null;
  description: string | null;
  /** Up to `CARD_CLIENT_LIMIT` client names, with the rest counted in
   *  `clientOverflow`. */
  clientNames: string[];
  clientOverflow: number;
  /** The one credential the card leads with, and the line attributing it -
   *  see `getAgencyCredential`. */
  credentialPill: string | null;
  credentialMeta: string;
  website: string | null;
  domain: string | null;
  /** Lowercased "name + description + location + client names + service
   *  names + industry names + category titles" blob for substring search. */
  searchText: string;
  country: string | null;
  /** Primary category slug, backing the list page's category filter. Null
   *  for a record whose `categories` names nothing in the registry. */
  categorySlug: string | null;
  isPartner: boolean;
  /** Position in the server's default order, 0-based. The client's "Top
   *  ranked" mode sorts on this rather than re-deriving the ranking, so
   *  selecting it always reproduces exactly what the server rendered -
   *  see `buildAgencyListItems`. */
  rank: number;
  /** Ranking signal for review-based sources - see `getAgencyRatingScore`.
   *  0 for a record with no rating (every Awwwards record today), so it
   *  can be sorted on directly without a null-guard at the call site. */
  ratingScore: number;
}

/**
 * Projects a single agency into the `AgencyListItem` the list page renders
 * and filters on.
 *
 * @param agency - The agency to project.
 * @param rank - The agency's position in the server's default order.
 * @returns An `AgencyListItem`, or null when the agency has no slug - the
 *          key the list renders and filters by.
 */
export function buildAgencyListItem(
  agency: Agency | null | undefined,
  rank: number = 0,
): AgencyListItem | null {
  try {
    if (!agency?.slug) return null;
    const location = formatAgencyLocation(agency.location ?? null);
    // Client names are in the search blob so a visitor can find agencies by
    // who they have worked for ("nike") rather than only by agency name -
    // the query a directory is actually asked.
    const clients = getAgencyClients(agency).map((client) => client.name).filter(Boolean);
    // Service and industry names go in too - a visitor searching "link
    // building" or "ecommerce" should find a match, not just a visitor
    // searching by agency or client name.
    const serviceNames = (agency.services ?? []).join(" ");
    const industryNames = (agency.industries ?? []).join(" ");
    // The category title rides the blob as well, so "motion design" finds
    // the motion studios even before a visitor reaches for the category
    // select - the categories are a filter now, not four separate pages a
    // search engine sent them to.
    const categoryTitles = (agency.categories ?? [])
      .map((slug) => getDirectoryCategory(slug)?.title ?? slug)
      .join(" ");
    const searchText = [
      agency.name ?? "",
      agency.description ?? "",
      location ?? "",
      clients.join(" "),
      serviceNames,
      industryNames,
      categoryTitles,
    ]
      .join(" ")
      .toLowerCase();
    const primaryCategory = (agency.categories ?? []).find((slug) =>
      Boolean(getDirectoryCategory(slug)),
    );
    const credential = getAgencyCredential(agency);
    return {
      slug: agency.slug,
      name: agency.name ?? "",
      href: agencyPath(agency.slug),
      logoUrl: agency.logoUrl ?? null,
      locationLabel: location,
      description: agency.description ?? null,
      clientNames: clients.slice(0, CARD_CLIENT_LIMIT),
      clientOverflow: Math.max(0, clients.length - CARD_CLIENT_LIMIT),
      credentialPill: credential.pill,
      credentialMeta: credential.meta,
      website: agency.website ?? null,
      domain: agency.domain ?? null,
      searchText,
      country: agency.location?.country?.trim() || null,
      categorySlug: primaryCategory ?? null,
      isPartner: isSuperflowPartner(agency),
      rank,
      ratingScore: getAgencyRatingScore(agency),
    };
  } catch {
    return null;
  }
}

/**
 * Projects a list of agencies into `AgencyListItem`s, stamping each with
 * its position in the list it was given.
 *
 * **The caller must pass the list in the order the server rendered it**
 * (`getDirectoryAgencyList`, or `getAgenciesByCategory` for a single
 * category). That order becomes `AgencyListItem.rank`, which is the whole
 * of the client's "Top ranked" sort - the client no longer keeps its own
 * copy of the ranking rules, so the two cannot drift and the page cannot
 * reorder itself on hydration. That drift was a live hazard while the
 * comparator was mirrored on both sides: a key added to one and not the
 * other silently reordered the page away from the order its own ItemList
 * JSON-LD claimed.
 *
 * Agencies without a slug are dropped (see `buildAgencyListItem`).
 *
 * @param agencies - Agencies to project, in the server's display order.
 * @returns One `AgencyListItem` per agency with a slug.
 */
export function buildAgencyListItems(agencies: Agency[] | null | undefined): AgencyListItem[] {
  try {
    return (agencies ?? [])
      .map((agency, index) => buildAgencyListItem(agency, index))
      .filter((item): item is AgencyListItem => item !== null);
  } catch {
    return [];
  }
}

/** Aggregate counts behind the list page's hero subheading ("323 studios
 *  and agencies across 42 countries"), so the size of the directory is
 *  never a number typed into copy and left to rot. */
export interface AgencyListStats {
  agencyCount: number;
  countryCount: number;
  partnerCount: number;
}

/**
 * Summarizes a list of agencies for the category header's stat row:
 * how many agencies, how many distinct countries, how many are Superflow
 * partners. All derived from the data - never a hardcoded count.
 *
 * @param agencies - Agencies to summarize.
 * @returns Agency count, distinct country count, and partner count.
 */
export function buildAgencyListStats(agencies: Agency[] | null | undefined): AgencyListStats {
  try {
    const list = agencies ?? [];
    const countries = new Set(
      list
        .map((agency) => agency?.location?.country?.trim())
        .filter((country): country is string => Boolean(country)),
    );
    const partnerCount = list.filter((agency) => isSuperflowPartner(agency)).length;
    return { agencyCount: list.length, countryCount: countries.size, partnerCount };
  } catch {
    return { agencyCount: 0, countryCount: 0, partnerCount: 0 };
  }
}
