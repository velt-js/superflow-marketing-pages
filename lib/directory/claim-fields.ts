// Field vocabulary for the claim form, the match form and the category
// filters.
//
// Deliberately imports NOTHING. Every module here is read from both sides
// of the client boundary - the claim form and the filter bar are "use
// client" components, the API routes that validate their submissions are
// server-only - and lib/directory/agencies.ts pulls in the whole scraped
// dataset, so a shared constant that lived there would ship ~2 MB of JSON
// to the browser (see `AgencyListItem`'s doc comment in that file).
//
// The limits below are the ONE definition of each cap. The form counts
// characters against them, the API route rejects against them, and the
// renderer trusts them. Three copies of "300" would eventually disagree,
// and the one that disagrees silently is the API's.

import type { AgencyPlatform } from "./types";

/** Longest agency-written blurb. One paragraph - long enough to say what
 *  the studio does, short enough that a grid of them stays scannable. */
export const DESCRIPTION_MAX_CHARS = 300;

/** Longest "what do you say no to" answer. Same budget as the blurb: it
 *  is the same kind of sentence, just more useful. */
export const DECLINES_MAX_CHARS = 300;

/** Longest YC offer line. Shorter than the others because it renders as a
 *  single highlighted line on the profile, not as a paragraph. */
export const YC_OFFER_MAX_CHARS = 200;

/** Longest founder brief on the match form. */
export const BRIEF_MAX_CHARS = 1000;

/** Most service tags an agency may list. Past eight the list stops being
 *  a specialism and starts being a sitemap. */
export const SERVICES_MAX = 8;

/** Longest single service tag. */
export const SERVICE_TAG_MAX_CHARS = 40;

/** Most named startup clients. */
export const STARTUP_CLIENTS_MAX = 6;

/** Longest single startup client name. */
export const STARTUP_CLIENT_MAX_CHARS = 60;

/** Ceiling on any stated budget, in whole USD. Not a judgement about what
 *  a project can cost - it is a sanity bound so a typo ("50000000") does
 *  not silently remove an agency from every budget filter. */
export const BUDGET_MAX_USD = 10_000_000;

/** Ceiling on a stated typical timeline, in weeks. Two years. */
export const TIMELINE_MAX_WEEKS = 104;

/**
 * Budget at or below which an agency counts as startup friendly on
 * budget alone, in whole USD.
 *
 * A YC company's first outside design engagement is usually funded out of
 * a seed round, and $25k is the line above which that stops being a
 * default-yes. An agency over it can still be startup friendly - it just
 * has to have named a startup client rather than being inferred.
 */
export const STARTUP_FRIENDLY_MAX_BUDGET_USD = 25_000;

/** Reply-time options, in business days. A closed set because it renders
 *  as a filter ("Fastest reply") and as a fact ("Replies within 2 business
 *  days"); free text would give neither anything to sort on. */
export const RESPONSE_SLA_OPTIONS: readonly number[] = [1, 2, 3, 5];

/** At or below this many business days an agency scores the reply-speed
 *  bonus. See `computeAgencyScore` in ./scoring.ts. */
export const FAST_REPLY_MAX_DAYS = 2;

/** One selectable platform, with the label the forms and filters paint. */
export interface PlatformOption {
  value: AgencyPlatform;
  label: string;
}

/**
 * Every platform, in the order both the claim form's multi-select and the
 * category filter render them: the three a founder most often arrives
 * already committed to first, then the CMS incumbents, then the escape
 * hatches.
 */
export const PLATFORM_OPTIONS: readonly PlatformOption[] = [
  { value: "webflow", label: "Webflow" },
  { value: "framer", label: "Framer" },
  { value: "shopify", label: "Shopify" },
  { value: "wordpress", label: "WordPress" },
  { value: "nextjs", label: "Next.js" },
  { value: "custom", label: "Custom build" },
  { value: "other", label: "Other" },
];

/** Every valid platform value, for O(1) validation of a submitted list. */
const PLATFORM_VALUES = new Set<string>(PLATFORM_OPTIONS.map((option) => option.value));

/**
 * Narrows an arbitrary string to a known platform.
 *
 * @param value - A value from a form submission or a query string.
 * @returns The platform, or null when it is not one we know.
 */
export function toPlatform(value: string | null | undefined): AgencyPlatform | null {
  try {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) return null;
    return PLATFORM_VALUES.has(normalized) ? (normalized as AgencyPlatform) : null;
  } catch {
    return null;
  }
}

/**
 * Resolves a platform's display label.
 *
 * @param platform - The platform value.
 * @returns Its label, or the raw value when unknown (never an empty chip).
 */
export function platformLabel(platform: AgencyPlatform | string): string {
  try {
    return PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ?? String(platform);
  } catch {
    return String(platform);
  }
}

/* ---- Match form bands ------------------------------------------------ */

/** One budget band on the match form. */
export interface BudgetBand {
  /** Stable id, stored on the `MatchRequest` for reporting. */
  id: string;
  label: string;
  /**
   * Top of the band in whole USD, and the figure agencies are matched
   * against (`agency.minBudgetUsd <= ceilingUsd`).
   *
   * The open-ended top band uses a stand-in ceiling rather than Infinity,
   * which does not survive JSON. No agency in the dataset states a
   * minimum anywhere near it, so the two behave identically while this
   * one can be written to the store and read back.
   */
  ceilingUsd: number;
}

/** Budget bands, cheapest first. */
export const BUDGET_BANDS: readonly BudgetBand[] = [
  { id: "under-10k", label: "Under $10k", ceilingUsd: 10_000 },
  { id: "10k-25k", label: "$10k to $25k", ceilingUsd: 25_000 },
  { id: "25k-50k", label: "$25k to $50k", ceilingUsd: 50_000 },
  { id: "50k-100k", label: "$50k to $100k", ceilingUsd: 100_000 },
  { id: "over-100k", label: "Over $100k", ceilingUsd: 100_000_000 },
];

/**
 * Looks up a budget band by id.
 *
 * @param id - The band id from a form submission.
 * @returns The band, or null when the id is unknown.
 */
export function findBudgetBand(id: string | null | undefined): BudgetBand | null {
  try {
    if (!id) return null;
    return BUDGET_BANDS.find((band) => band.id === id) ?? null;
  } catch {
    return null;
  }
}

/** One timeline band on the match form. */
export interface TimelineBand {
  id: string;
  label: string;
  /** Top of the band in weeks. Zero means "flexible": no deadline
   *  stated, which is a real answer and not a missing one. */
  weeks: number;
}

/** Timeline bands, shortest first. */
export const TIMELINE_BANDS: readonly TimelineBand[] = [
  { id: "under-4", label: "Under 4 weeks", weeks: 4 },
  { id: "4-8", label: "4 to 8 weeks", weeks: 8 },
  { id: "8-16", label: "8 to 16 weeks", weeks: 16 },
  { id: "flexible", label: "Flexible", weeks: 0 },
];

/**
 * Looks up a timeline band by id.
 *
 * @param id - The band id from a form submission.
 * @returns The band, or null when the id is unknown.
 */
export function findTimelineBand(id: string | null | undefined): TimelineBand | null {
  try {
    if (!id) return null;
    return TIMELINE_BANDS.find((band) => band.id === id) ?? null;
  } catch {
    return null;
  }
}

/* ---- Category-page budget filter ------------------------------------- */

/** One option in the category page's budget filter. */
export interface BudgetFilterOption {
  /** Query-param value, e.g. "25000". "any" is the unfiltered default. */
  value: string;
  label: string;
  /** Highest `minBudgetUsd` an agency may state and still pass, or null
   *  for "any", which also admits agencies that stated nothing. */
  maxMinBudgetUsd: number | null;
}

/**
 * Budget filter options.
 *
 * Every option except "Any" excludes agencies with a null `minBudgetUsd`.
 * That is the point of the filter: a founder asking to see studios under
 * $25k is asking a question a listing that never stated a price cannot
 * answer, and quietly including it would put the burden of checking back
 * on the founder. "Any" is where those listings live.
 */
export const BUDGET_FILTER_OPTIONS: readonly BudgetFilterOption[] = [
  { value: "any", label: "Any budget", maxMinBudgetUsd: null },
  { value: "10000", label: "Under $10k", maxMinBudgetUsd: 10_000 },
  { value: "25000", label: "Under $25k", maxMinBudgetUsd: 25_000 },
  { value: "50000", label: "Under $50k", maxMinBudgetUsd: 50_000 },
];

/** Query-param value meaning "no budget filter". */
export const BUDGET_FILTER_ANY = "any";

/**
 * Looks up a budget filter option by its query-param value.
 *
 * @param value - The raw query-param value.
 * @returns The option, defaulting to "Any" for anything unrecognised so a
 *          hand-edited URL degrades to the full listing rather than an
 *          empty one.
 */
export function findBudgetFilterOption(value: string | null | undefined): BudgetFilterOption {
  try {
    const match = BUDGET_FILTER_OPTIONS.find((option) => option.value === value);
    return match ?? BUDGET_FILTER_OPTIONS[0];
  } catch {
    return BUDGET_FILTER_OPTIONS[0];
  }
}
