// Maps the `agency` documents in Sanity onto the `Agency` contract the
// directory pages read.
//
// WHY THERE IS A MAPPING AT ALL, rather than the pages reading the CMS
// shape directly: `Agency` is also what four importers write as JSON (see
// ./types.ts), and the site must be able to render either. Everything
// downstream - the ranking, the cards, the Markdown copies, the JSON-LD -
// reads one shape, and this file is the only place that knows the other
// one exists.
//
// It is defensive on purpose. A CMS document is whatever an editor last
// saved: a missing group, a number typed as text, an empty array. Every
// field here therefore normalises rather than trusts, and a document that
// cannot produce a usable record is dropped instead of rendering a card
// with no name and a link to nowhere.

import type {
  Agency,
  AgencyAwards,
  AgencyClient,
  AgencyListing,
  AgencyLocation,
  AgencyRating,
  AgencySource,
} from "./types";

/** Sources a record may claim. Mirrors `AgencySource`; a document holding
 *  anything else is treated as having no source rather than being trusted
 *  to name one, since the value is printed as a citation. */
const KNOWN_SOURCES: readonly string[] = [
  "awwwards",
  "semrush",
  "clutch",
  "designrush",
  "dandad",
  "motion-design-awards",
  "editorial",
];

/** The source a record falls back to when its own is missing or unknown -
 *  "Listed by Superflow", the one label that claims nothing about a jury
 *  we cannot name. Never guess a directory. */
const FALLBACK_SOURCE: AgencySource = "editorial";

/** One agency document, as `getDirectoryAgencyDocuments` projects it.
 *  Every field is optional: this is data from a CMS, not a contract. */
export interface CmsAgencyDocument {
  slug?: string | null;
  name?: string | null;
  website?: string | null;
  domain?: string | null;
  profileUrl?: string | null;
  location?: {
    city?: string | null;
    country?: string | null;
    countryCode?: string | null;
  } | null;
  categories?: string[] | null;
  services?: string[] | null;
  industries?: string[] | null;
  teamSize?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  awards?: {
    siteOfTheDay?: number | null;
    siteOfTheMonth?: number | null;
    siteOfTheYear?: number | null;
    developerAward?: number | null;
    honorableMentions?: number | null;
    nominees?: number | null;
  } | null;
  rating?: {
    value?: number | null;
    scale?: number | null;
    reviewCount?: number | null;
  } | null;
  accolades?: string[] | null;
  foundedYear?: number | null;
  budgetLabel?: string | null;
  budgetFloorUsd?: number | null;
  clients?: Array<{
    name?: string | null;
    projectTitle?: string | null;
    projectUrl?: string | null;
    domain?: string | null;
    notable?: boolean | null;
  }> | null;
  source?: string | null;
  scrapedAt?: string | null;
  listing?: {
    verifiedAt?: string | null;
    awardsNote?: string | null;
    engagementNote?: string | null;
    exclusions?: string[] | null;
    budgetMinimums?: Array<{
      scope?: string | null;
      amount?: number | null;
      currency?: string | null;
    }> | null;
  } | null;
}

/**
 * Trimmed string, or null for anything blank.
 *
 * @param value - The raw value.
 * @returns The trimmed string, or null.
 */
function text(value: string | null | undefined): string | null {
  try {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * Non-empty trimmed strings from an array, in order.
 *
 * @param values - The raw array.
 * @returns The cleaned list, empty when there is nothing usable.
 */
function list(values: string[] | null | undefined): string[] {
  try {
    return (values ?? [])
      .map((value) => text(value))
      .filter((value): value is string => Boolean(value));
  } catch {
    return [];
  }
}

/**
 * A finite, non-negative integer, or 0.
 *
 * Award counts are summed and sorted on, so a missing or nonsense value
 * has to become a number rather than propagate as NaN through a ranking.
 *
 * @param value - The raw value.
 * @returns The count.
 */
function count(value: number | null | undefined): number {
  try {
    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? Math.round(value)
      : 0;
  } catch {
    return 0;
  }
}

/**
 * A finite number, or null. Distinct from `count`: a budget floor of null
 * means "did not say" and 0 means "takes work at any budget", and
 * collapsing the two is how an unqualified agency lands in a premium
 * listing (see `Agency.budgetFloorUsd`).
 *
 * @param value - The raw value.
 * @returns The number, or null.
 */
function numberOrNull(value: number | null | undefined): number | null {
  try {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Builds the award tally, recomputing `total` from the parts.
 *
 * The total is never read from the document: it is a derived figure, and a
 * stored one drifts the moment an editor corrects a single award count.
 *
 * @param awards - The document's award group.
 * @returns A complete `AgencyAwards`.
 */
function toAwards(awards: CmsAgencyDocument["awards"]): AgencyAwards {
  try {
    const tally = {
      siteOfTheDay: count(awards?.siteOfTheDay),
      siteOfTheMonth: count(awards?.siteOfTheMonth),
      siteOfTheYear: count(awards?.siteOfTheYear),
      developerAward: count(awards?.developerAward),
      honorableMentions: count(awards?.honorableMentions),
      nominees: count(awards?.nominees),
    };
    const total = Object.values(tally).reduce((sum, value) => sum + value, 0);
    return { ...tally, total };
  } catch {
    return {
      siteOfTheDay: 0,
      siteOfTheMonth: 0,
      siteOfTheYear: 0,
      developerAward: 0,
      honorableMentions: 0,
      nominees: 0,
      total: 0,
    };
  }
}

/**
 * Builds the rating, or null.
 *
 * Null rather than a zeroed object when the source publishes no reviews -
 * "listed but unreviewed" and "has no reviews to publish" are different
 * claims, and only the first has a rating to render. A score with no scale
 * is dropped: a bare 4.8 cannot be printed without saying out of what.
 *
 * @param rating - The document's rating group.
 * @returns An `AgencyRating`, or null.
 */
function toRating(rating: CmsAgencyDocument["rating"]): AgencyRating | null {
  try {
    const value = numberOrNull(rating?.value);
    const scale = numberOrNull(rating?.scale);
    if (value === null || scale === null || scale <= 0) return null;
    return { value, scale, reviewCount: count(rating?.reviewCount) };
  } catch {
    return null;
  }
}

/**
 * Builds the location, or null when the document names no part of one.
 *
 * @param location - The document's location group.
 * @returns An `AgencyLocation`, or null.
 */
function toLocation(location: CmsAgencyDocument["location"]): AgencyLocation | null {
  try {
    const city = text(location?.city);
    const country = text(location?.country);
    const countryCode = text(location?.countryCode);
    if (!city && !country && !countryCode) return null;
    return { city, country, countryCode: countryCode?.toUpperCase() ?? null };
  } catch {
    return null;
  }
}

/**
 * Builds the client list, dropping rows with no name.
 *
 * `notable` is carried through rather than recomputed: an importer sets
 * it from a normalisation pass over the source's own ordering, and nothing
 * at render time can infer it. Absent means false, which reads as "not
 * asserted to be notable" rather than "asserted not to be" - so a
 * hand-typed row simply keeps its place in the list.
 *
 * @param clients - The document's client rows.
 * @returns The clients to render.
 */
function toClients(clients: CmsAgencyDocument["clients"]): AgencyClient[] {
  try {
    return (clients ?? [])
      .map((client): AgencyClient | null => {
        const name = text(client?.name);
        if (!name) return null;
        return {
          name,
          domain: text(client?.domain)?.toLowerCase() ?? null,
          // Falls back to the name, matching what an importer writes for a
          // source that names clients directly rather than through a
          // project - the renderer then prints the name alone rather than
          // twice (see `titleAddsDetail`).
          projectTitle: text(client?.projectTitle) ?? name,
          projectUrl: text(client?.projectUrl),
          notable: client?.notable === true,
        };
      })
      .filter((client): client is AgencyClient => client !== null);
  } catch {
    return [];
  }
}

/**
 * Builds the agency-supplied block, or null when the document carries none
 * of it.
 *
 * Null matters: it is what the detail page reads as "no agency has
 * corrected this record", which is the state of almost every record and is
 * not missing data.
 *
 * @param listing - The document's agency-supplied fields.
 * @returns An `AgencyListing`, or null.
 */
function toListing(listing: CmsAgencyDocument["listing"]): AgencyListing | null {
  try {
    const verifiedAt = text(listing?.verifiedAt);
    const awardsNote = text(listing?.awardsNote);
    const engagementNote = text(listing?.engagementNote);
    const exclusions = list(listing?.exclusions);
    const budgetMinimums = (listing?.budgetMinimums ?? [])
      .map((minimum) => {
        const scope = text(minimum?.scope);
        const amount = numberOrNull(minimum?.amount);
        const currency = text(minimum?.currency);
        // A floor is three facts or it is not a floor: what it applies to,
        // how much, and in which currency. Two of the three is not a
        // figure anyone can act on - and a zero is a half-typed row rather
        // than a claim to take work for nothing, which is why
        // `applyAgencyListing` has always dropped it too.
        if (!scope || amount === null || amount <= 0 || !currency) return null;
        return { scope, amount, currency: currency.toUpperCase() };
      })
      .filter((minimum): minimum is NonNullable<typeof minimum> => minimum !== null);

    const hasAnything =
      Boolean(verifiedAt || awardsNote || engagementNote) ||
      exclusions.length > 0 ||
      budgetMinimums.length > 0;
    if (!hasAnything) return null;

    return { verifiedAt, awardsNote, engagementNote, exclusions, budgetMinimums };
  } catch {
    return null;
  }
}

/**
 * Maps one CMS document onto an `Agency`.
 *
 * @param document - The raw document.
 * @returns The agency, or null when the document has no slug or no name -
 *          the two things a card and a URL cannot be built without.
 */
export function toAgency(document: CmsAgencyDocument | null | undefined): Agency | null {
  try {
    const slug = text(document?.slug)?.toLowerCase();
    const name = text(document?.name);
    if (!slug || !name) return null;

    const source = text(document?.source);
    return {
      slug,
      name,
      website: text(document?.website),
      domain: text(document?.domain)?.toLowerCase() ?? null,
      profileUrl: text(document?.profileUrl),
      location: toLocation(document?.location),
      categories: list(document?.categories),
      services: list(document?.services),
      teamSize: text(document?.teamSize),
      logoUrl: text(document?.logoUrl),
      description: text(document?.description),
      awards: toAwards(document?.awards),
      rating: toRating(document?.rating),
      accolades: list(document?.accolades),
      foundedYear: numberOrNull(document?.foundedYear),
      industries: list(document?.industries),
      budgetLabel: text(document?.budgetLabel),
      budgetFloorUsd: numberOrNull(document?.budgetFloorUsd),
      clients: toClients(document?.clients),
      listing: toListing(document?.listing),
      source:
        source && KNOWN_SOURCES.includes(source) ? (source as AgencySource) : FALLBACK_SOURCE,
      // Not a display field - it records when the data was collected, and
      // a record entered by hand was collected the moment someone typed
      // it. An empty string would be a false timestamp; the epoch would be
      // a stranger one.
      scrapedAt: text(document?.scrapedAt) ?? "",
    } satisfies Agency;
  } catch {
    return null;
  }
}

/**
 * Maps a set of CMS documents onto agencies, dropping the unusable ones
 * and deduping by slug.
 *
 * Deduping here as well as in the schema's own validation is deliberate:
 * validation runs in the Studio and cannot police a document written by a
 * script or an API call, and two records at one URL is a page that renders
 * whichever the fetch happened to order first.
 *
 * @param documents - The raw documents.
 * @returns The agencies to render.
 */
export function toAgencies(documents: CmsAgencyDocument[] | null | undefined): Agency[] {
  try {
    const seenSlugs = new Set<string>();
    return (documents ?? [])
      .map((document) => toAgency(document))
      .filter((agency): agency is Agency => {
        if (!agency) return false;
        if (seenSlugs.has(agency.slug)) return false;
        seenSlugs.add(agency.slug);
        return true;
      });
  } catch {
    return [];
  }
}
