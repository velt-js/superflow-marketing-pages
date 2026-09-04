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
import partnersData from "./data/partners.json";
import previewPartnersData from "./data/partners.preview.json";
import {
  DIRECTORY_AGENCY_SEGMENT,
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORIES,
  SOURCE_LABEL_AWWWARDS,
} from "./constants";
import type {
  Agency,
  AgencyAwards,
  AgencyLocation,
  AgencySource,
  DirectoryCategory,
  SuperflowPartnerList,
} from "./types";

/** Raw dataset, typed against the shared `Agency` contract. The scraper
 *  (a plain .mjs script, no TS build step) is the sole writer of this
 *  file and is responsible for conforming to `Agency` - this module only
 *  reads it. */
const AGENCIES: Agency[] = agenciesData as Agency[];

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
 * partners first, then highest award total, then alphabetically by name
 * as a stable tiebreaker. Partner status is the primary key so a partner
 * is visible near the top of every listing without a visitor needing to
 * know to look for the badge.
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
    return (agencyOne?.name ?? "").localeCompare(agencyTwo?.name ?? "");
  } catch {
    return 0;
  }
}

/**
 * Returns every agency belonging to the given category slug, sorted by
 * the directory's default order (Superflow partners first, then award
 * total descending, then name).
 *
 * @param categorySlug - The `DirectoryCategory.slug` to filter by.
 * @returns Matching agencies, sorted. Empty array for an unknown slug or
 *          while the dataset is still empty - callers render an empty
 *          state rather than treating this as an error.
 */
export function getAgenciesByCategory(categorySlug: string): Agency[] {
  try {
    if (!categorySlug) return [];
    return AGENCIES.filter((agency) => agency?.categories?.includes(categorySlug))
      .slice()
      .sort(compareAgenciesDefaultOrder);
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

/**
 * Decides whether an agency's detail page is substantial enough to index.
 *
 * A page is thin only when it has BOTH a stub blurb and a negligible
 * award record - it needs neither one on its own to be worth indexing.
 * The two signals are independent kinds of substance: a real paragraph of
 * prose is unique content, and so is a detailed award breakdown.
 *
 * Requiring both (the original formulation) suppressed studios like Resn
 * and Active Theory, which carry 150+ awards behind a four-word tagline -
 * plainly not thin content. The guard exists to catch bare stubs from
 * future bulk sources, not to punish a terse profile blurb.
 *
 * Pages failing this still render and stay internally linked; they are
 * only marked `noindex, follow` and dropped from the sitemap.
 *
 * @param agency - The agency to evaluate.
 * @returns True unless the agency has both a sub-threshold description
 *          and fewer than `MIN_AWARDS_FOR_INDEXING` awards.
 */
export function shouldIndexAgency(agency: Agency | null | undefined): boolean {
  try {
    if (!agency) return false;
    const description = agency.description?.trim() ?? "";
    const hasRealDescription =
      description.length >= MIN_DESCRIPTION_LENGTH_FOR_INDEXING;
    const hasRealAwardRecord =
      (agency.awards?.total ?? 0) >= MIN_AWARDS_FOR_INDEXING;
    return hasRealDescription || hasRealAwardRecord;
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
 * Prefers other agencies in the same country (a location-based grouping
 * reads more useful to a visitor than an arbitrary "related" label), and
 * falls back to the agency's primary category when no country is on
 * record or no country-mates exist.
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
    if (countryName) {
      const sameCountry = AGENCIES.filter(
        (candidate) =>
          candidate?.slug !== agency.slug &&
          candidate?.location?.country?.trim() === countryName,
      )
        .slice()
        .sort(compareAgenciesDefaultOrder)
        .slice(0, limit);
      if (sameCountry.length > 0) {
        return { heading: `More agencies in ${countryName}`, agencies: sameCountry };
      }
    }

    const primaryCategorySlug = agency.categories?.[0];
    if (primaryCategorySlug) {
      const sameCategory = AGENCIES.filter(
        (candidate) =>
          candidate?.slug !== agency.slug &&
          candidate?.categories?.includes(primaryCategorySlug),
      )
        .slice()
        .sort(compareAgenciesDefaultOrder)
        .slice(0, limit);
      if (sameCategory.length > 0) {
        const category = getDirectoryCategory(primaryCategorySlug);
        const heading = category ? `More in ${category.title}` : FALLBACK_RELATED_HEADING;
        return { heading, agencies: sameCategory };
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

    if (location && awardsTotal > 0) {
      clauses.push(`Based in ${location}, with ${awardsTotal} ${awardsNoun}.`);
    } else if (location) {
      clauses.push(`Based in ${location}.`);
    } else if (awardsTotal > 0) {
      clauses.push(`Recognised with ${awardsTotal} ${awardsNoun}.`);
    }

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
  /** Lowercased "name + description + location" blob for substring search. */
  searchText: string;
  country: string | null;
  isPartner: boolean;
  awardTotal: number;
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
    const searchText = [agency.name ?? "", agency.description ?? "", location]
      .join(" ")
      .toLowerCase();
    return {
      slug: agency.slug,
      name: agency.name ?? "",
      searchText,
      country: agency.location?.country?.trim() || null,
      isPartner: isSuperflowPartner(agency),
      awardTotal: agency.awards?.total ?? 0,
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

/** Aggregate counts shown in the category page header - see
 *  components/directory/CategoryHero.tsx. */
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
