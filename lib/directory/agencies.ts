// Data-access helpers for the agency directory.
//
// This is the seam between app/directory/* pages and the scraped dataset in
// lib/directory/data/agencies.json. Pages should go through these helpers
// rather than importing the JSON file directly, so filtering/sorting logic
// lives in one place and every read path degrades gracefully.
//
// The JSON file is `[]` until the scraper populates it (see
// lib/directory/types.ts header) and is expected to hold a few hundred
// records at runtime, so every helper here must handle an empty dataset
// without throwing.

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
const AGENCIES: Agency[] = mergeAgencySources(
  agenciesData as Agency[],
  seoAgenciesData as Agency[],
  brandingAgenciesData as Agency[],
  motionDesignAgenciesData as Agency[],
);

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
};

/** Fallback label for a source not present in `SOURCE_LABELS`. */
const GENERIC_SOURCE_LABEL = "View source profile";

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
 * @param categorySlug - The `DirectoryCategory.slug` to filter by.
 * @returns Matching agencies, sorted. Empty array for an unknown slug or
 *          while the dataset is still empty - callers render an empty
 *          state rather than treating this as an error.
 */
export function getAgenciesByCategory(categorySlug: string): Agency[] {
  try {
    if (!categorySlug) return [];
    const comparator = isAccoladeRankedCategory(categorySlug)
      ? compareAgenciesByAccolades
      : compareAgenciesDefaultOrder;
    return AGENCIES.filter((agency) => agency?.categories?.includes(categorySlug))
      .slice()
      .sort(comparator);
  } catch {
    return [];
  }
}

/**
 * Counts agencies in a category without sorting. Used by the hub page so
 * each category card can show how many agencies it links to.
 *
 * @param categorySlug - The `DirectoryCategory.slug` to count.
 * @returns The number of agencies in that category, 0 on any failure.
 */
export function getAgencyCountByCategory(categorySlug: string): number {
  try {
    if (!categorySlug) return 0;
    return AGENCIES.filter((agency) => agency?.categories?.includes(categorySlug)).length;
  } catch {
    return 0;
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
export function getAgencyBySlug(slug: string): Agency | undefined {
  try {
    if (!slug) return undefined;
    return AGENCIES.find((agency) => agency?.slug === slug);
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
export function getAllAgencySlugs(): string[] {
  try {
    const slugs = AGENCIES.map((agency) => agency?.slug).filter(
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
export function getIndexableAgencySlugs(): string[] {
  try {
    return AGENCIES.filter((agency) => shouldIndexAgency(agency))
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
export function getAgencyIndexingSummary(): AgencyIndexingSummary {
  try {
    const total = AGENCIES.length;
    const indexable = AGENCIES.filter((agency) => shouldIndexAgency(agency)).length;
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
export function getRelatedAgencies(
  agency: Agency | null | undefined,
  limit: number = RELATED_AGENCIES_LIMIT_DEFAULT,
): RelatedAgenciesBlock {
  try {
    if (!agency) return { heading: FALLBACK_RELATED_HEADING, agencies: [] };

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
        return AGENCIES.filter((candidate) => {
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
      url: agency.website ?? agency.profileUrl,
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

/** Slim, client-safe projection of an `Agency` for the interactive
 *  search/filter/sort controls (components/directory/AgencyExplorer.tsx).
 *  Deliberately NOT the full `Agency` shape: a "use client" file that
 *  imports anything from this module would pull the whole agencies.json
 *  dataset into the client bundle (JS module evaluation isn't reliably
 *  tree-shaken across a JSON import), on top of the same data already
 *  present as server-rendered HTML. Build these server-side via
 *  `buildAgencyListItems` and pass only this slim array across the
 *  client boundary - AgencyExplorer imports this as a type-only import,
 *  which costs nothing at runtime. */
export interface AgencyListItem {
  slug: string;
  name: string;
  /** Lowercased "name + description + location + client names + service
   *  names + industry names" blob for substring search. */
  searchText: string;
  country: string | null;
  isPartner: boolean;
  awardTotal: number;
  /** Ranking signal for review-based sources - see `getAgencyRatingScore`.
   *  0 for a record with no rating (every Awwwards record today), so it
   *  can be sorted on directly without a null-guard at the call site. */
  ratingScore: number;
  /** Number of `Agency.accolades`, the ranking signal for categories in
   *  ACCOLADE_RANKED_CATEGORIES. Carried on every item rather than only
   *  those categories' items so the client comparator never has to
   *  null-guard it. */
  accoladeCount: number;
}

/**
 * Projects a single agency into the slim `AgencyListItem` shape used by
 * the client-side directory controls.
 *
 * @param agency - The agency to project.
 * @returns An `AgencyListItem`, or null when the agency has no slug (the
 *          join key `components/directory/AgencyGrid.tsx` uses to line
 *          this up with its pre-rendered card for the same agency).
 */
export function buildAgencyListItem(agency: Agency | null | undefined): AgencyListItem | null {
  try {
    if (!agency?.slug) return null;
    const location = formatAgencyLocation(agency.location ?? null) ?? "";
    // Client names are in the search blob so a visitor can find agencies by
    // who they have worked for ("nike") rather than only by agency name -
    // the query a directory is actually asked.
    const clientNames = getAgencyClients(agency)
      .map((client) => client.name)
      .join(" ");
    // Service and industry names go in too - a visitor searching "link
    // building" or "ecommerce" should find a match, not just a visitor
    // searching by agency or client name.
    const serviceNames = (agency.services ?? []).join(" ");
    const industryNames = (agency.industries ?? []).join(" ");
    const searchText = [
      agency.name ?? "",
      agency.description ?? "",
      location,
      clientNames,
      serviceNames,
      industryNames,
    ]
      .join(" ")
      .toLowerCase();
    return {
      slug: agency.slug,
      name: agency.name ?? "",
      searchText,
      country: agency.location?.country?.trim() || null,
      isPartner: isSuperflowPartner(agency),
      awardTotal: agency.awards?.total ?? 0,
      ratingScore: getAgencyRatingScore(agency),
      accoladeCount: agency.accolades?.length ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Projects a list of agencies into `AgencyListItem`s. Agencies without a
 * slug are dropped (see `buildAgencyListItem`) - callers that need to
 * pair these with pre-rendered cards should key off `slug`, not array
 * index, so a dropped entry can never desynchronize the two lists.
 *
 * @param agencies - Agencies to project.
 * @returns One `AgencyListItem` per agency with a slug.
 */
export function buildAgencyListItems(agencies: Agency[] | null | undefined): AgencyListItem[] {
  try {
    return (agencies ?? [])
      .map((agency) => buildAgencyListItem(agency))
      .filter((item): item is AgencyListItem => item !== null);
  } catch {
    return [];
  }
}
