// Joins a claim onto a scraped agency record.
//
// The directory holds two kinds of fact about an agency and they must not
// be confused on the page:
//
//   1. What a source directory published about it. Scraped, attributable,
//      and linked back to on every profile. Lives in `Agency`.
//   2. What the agency says about how it takes work - budget, timeline,
//      platforms, what it declines. Lives in `AgencyClaim`, written either
//      by the agency through the claim flow or by us into claims.json from
//      a reply to the outbound campaign.
//
// This module is where the two meet, and it is deliberately PURE: it takes
// an agency and a claim and returns the resolved record. It never reads a
// file or a store, so it can be unit-tested with literals, called from a
// script, and reasoned about without knowing whether the claim came from
// the committed file or from KV.
//
// The resolution rules are all one-directional: a claim can only ever
// REPLACE a scraped value with the agency's own, never merge with it. A
// half-agency-written, half-scraped service list would be attributable to
// neither.

import {
  DESCRIPTION_MAX_CHARS,
  STARTUP_FRIENDLY_MAX_BUDGET_USD,
} from "./claim-fields";
import { DIRECTORY_CATEGORIES } from "./constants";
import { computeAgencyScore } from "./scoring";
import { stripContactDetails } from "./text";
import type { Agency, AgencyClaim, AgencyPlatform } from "./types";

/**
 * An agency with its claim resolved onto it.
 *
 * Extends `Agency` rather than replacing it so every existing helper
 * (`getAwardBreakdown`, `formatAgencyRating`, the JSON-LD builders) keeps
 * working unchanged on an enriched record.
 *
 * `contactEmail` is deliberately ABSENT. The match router needs it, and
 * nothing else does; see `resolveContactEmail`. Keeping it off this type
 * means a component that renders an `EnrichedAgency` cannot leak it, and
 * a client component handed one cannot serialize it into the page.
 */
export interface EnrichedAgency extends Agency {
  /** The claim this record resolved, or null when there is none. Kept for
   *  callers that need to distinguish "the agency said $10k" from "we
   *  wrote $10k down after a reply". */
  claim: AgencyClaim | null;
  /** True when the agency itself completed the claim form. */
  claimed: boolean;
  /** True when a claim's email domain matched the agency's own domain.
   *  Always false on an unclaimed listing. */
  verified: boolean;

  minBudgetUsd: number | null;
  typicalBudgetMin: number | null;
  typicalBudgetMax: number | null;
  typicalTimelineWeeks: number | null;
  platforms: AgencyPlatform[];
  declines: string | null;
  startupClients: string[];
  ycOffer: string | null;
  contactName: string | null;
  responseSlaDays: number | null;
  acceptingProjects: boolean;

  /**
   * Derived, never stored: true when the agency has named a startup
   * client or states a minimum at or below
   * STARTUP_FRIENDLY_MAX_BUDGET_USD.
   *
   * Derived rather than asked, because "are you startup friendly?" is a
   * question every agency answers yes to. The two facts behind it are
   * checkable and the agency had a reason to state them.
   */
  startupFriendly: boolean;

  /** The "Recommended" ranking score - see ./scoring.ts. */
  score: number;
  /** `awards.total`, flattened. Present so this type satisfies
   *  `AgencyRankingSignals` and can be handed straight to the shared
   *  comparators - the same ones the client-side explorer uses on its
   *  slim list items, which is what keeps the two orders identical. */
  awardTotal: number;

  /** Category slugs this agency is listed in, primary first, with the
   *  claim's corrections applied. */
  resolvedCategories: string[];
  /** The first of those, or null for a record with no valid category. */
  primaryCategorySlug: string | null;

  /** City for display, from the claim when we looked one up. */
  city: string | null;
  /** Logo URL to render, claim's override first. */
  resolvedLogoUrl: string | null;
}

/** Category slugs that actually exist, for validating a claim's
 *  corrections. A claim naming a category we do not publish is ignored
 *  rather than allowed to route an agency into a 404. */
const KNOWN_CATEGORY_SLUGS = new Set(DIRECTORY_CATEGORIES.map((category) => category.slug));

/**
 * A claim with every field at its documented default.
 *
 * Exported because three places need to start from a blank record: the
 * enrich form (prefilling a first-time claim), the API route (building a
 * record from a submission), and this module (resolving an agency that
 * has no claim at all). Three hand-written blanks would drift.
 *
 * @param slug - The agency slug the claim attaches to.
 * @returns A blank claim.
 */
export function emptyClaim(slug: string): AgencyClaim {
  return {
    slug,
    claimed: false,
    claimedAt: null,
    claimedByEmail: null,
    verified: false,
    description: null,
    minBudgetUsd: null,
    typicalBudgetMin: null,
    typicalBudgetMax: null,
    typicalTimelineWeeks: null,
    platforms: [],
    services: [],
    declines: null,
    startupClients: [],
    ycOffer: null,
    contactEmail: null,
    contactName: null,
    responseSlaDays: null,
    // Defaults TRUE: an agency that never told us it is full should still
    // receive project requests. See `SCORE_ACCEPTING_PROJECTS`.
    acceptingProjects: true,
    updatedByAgencyAt: null,
    city: null,
    logoUrl: null,
    primaryCategory: null,
    secondaryCategories: [],
    sourceNote: null,
  };
}

/**
 * Fills in any field missing from a stored claim.
 *
 * claims.json is hand-edited, so a record there will routinely carry only
 * the three fields somebody had an answer for. Normalising on read means
 * every consumer can treat a claim as complete.
 *
 * @param slug - The agency slug, used when the record omits its own.
 * @param partial - The stored record, possibly sparse.
 * @returns A complete claim.
 */
export function normalizeClaim(
  slug: string,
  partial: Partial<AgencyClaim> | null | undefined,
): AgencyClaim {
  try {
    const blank = emptyClaim(slug);
    if (!partial) return blank;
    return {
      ...blank,
      ...partial,
      slug: partial.slug ?? slug,
      platforms: partial.platforms ?? blank.platforms,
      services: partial.services ?? blank.services,
      startupClients: partial.startupClients ?? blank.startupClients,
      secondaryCategories: partial.secondaryCategories ?? blank.secondaryCategories,
      acceptingProjects: partial.acceptingProjects ?? blank.acceptingProjects,
      // `claimed` and `verified` never default true off a sparse record:
      // an editorial overlay that omits them is not a claim.
      claimed: partial.claimed === true,
      verified: partial.verified === true,
    };
  } catch {
    return emptyClaim(slug);
  }
}

/**
 * Resolves which categories an agency is listed in.
 *
 * Three inputs, in precedence order: the claim's `primaryCategory` (an
 * agency correcting where it was filed, or us correcting a
 * miscategorisation), the scraped `Agency.categories`, then the claim's
 * `secondaryCategories`. Unknown slugs are dropped, duplicates collapse,
 * and the primary stays first.
 *
 * @param agency - The scraped record.
 * @param claim - Its claim, or null.
 * @returns Category slugs, primary first. Possibly empty.
 */
export function resolveCategories(
  agency: Agency | null | undefined,
  claim: AgencyClaim | null | undefined,
): string[] {
  try {
    const scraped = (agency?.categories ?? []).filter((slug) => KNOWN_CATEGORY_SLUGS.has(slug));
    const primary =
      claim?.primaryCategory && KNOWN_CATEGORY_SLUGS.has(claim.primaryCategory)
        ? claim.primaryCategory
        : scraped[0];
    const secondary = (claim?.secondaryCategories ?? []).filter((slug) =>
      KNOWN_CATEGORY_SLUGS.has(slug),
    );
    const ordered = [primary, ...scraped, ...secondary].filter(
      (slug): slug is string => Boolean(slug),
    );
    return Array.from(new Set(ordered));
  } catch {
    return agency?.categories ?? [];
  }
}

/**
 * The address a match request for this agency is sent to.
 *
 * Kept as a function rather than a field on `EnrichedAgency` so it cannot
 * ride along into a rendered page or a client component by accident -
 * publishing these would turn the directory into a scrape-ready lead list
 * and the agencies would stop answering. The only caller is the match
 * router.
 *
 * Falls back to the claiming address when the agency named no separate
 * contact: somebody at that address filled the form in, so it is a real
 * inbox at the right company. Returns null for an unclaimed listing with
 * no overlay address, which the router treats as "cannot be emailed"
 * rather than guessing at info@.
 *
 * @param claim - The agency's claim, or null.
 * @returns The routing address, or null when there is none.
 */
export function resolveContactEmail(claim: AgencyClaim | null | undefined): string | null {
  try {
    const contact = claim?.contactEmail?.trim();
    if (contact) return contact;
    const claimant = claim?.claimedByEmail?.trim();
    return claimant || null;
  } catch {
    return null;
  }
}

/**
 * Whether an agency counts as startup friendly.
 *
 * @param claim - The agency's claim, or null.
 * @returns True when it named a startup client or states a low enough
 *          minimum. False for an unclaimed listing, which has said
 *          neither - "not asserted", never "asserted not to be".
 */
export function isStartupFriendly(claim: AgencyClaim | null | undefined): boolean {
  try {
    if (!claim) return false;
    if ((claim.startupClients ?? []).length > 0) return true;
    const minimum = claim.minBudgetUsd;
    return typeof minimum === "number" && minimum <= STARTUP_FRIENDLY_MAX_BUDGET_USD;
  } catch {
    return false;
  }
}

/**
 * Resolves a claim onto an agency.
 *
 * @param agency - The scraped record.
 * @param claim - Its claim, or null for an unclaimed listing with no
 *                 editorial overlay.
 * @returns The enriched record.
 */
export function enrichAgency(
  agency: Agency,
  claim: AgencyClaim | null | undefined,
): EnrichedAgency {
  try {
    const resolved = claim ?? null;
    const claimed = resolved?.claimed === true;
    // Verified is only meaningful on a claimed listing. An editorial
    // overlay cannot mint a badge that says the agency stood behind this.
    const verified = claimed && resolved?.verified === true;

    // An agency-written blurb replaces the scraped one outright. The
    // scraped one is only repaired, never rewritten - see ./text.ts.
    const description =
      resolved?.description?.trim().slice(0, DESCRIPTION_MAX_CHARS) ||
      stripContactDetails(agency?.description);

    const services =
      (resolved?.services ?? []).length > 0 ? resolved!.services : (agency?.services ?? []);

    const resolvedCategories = resolveCategories(agency, resolved);
    const acceptingProjects = resolved?.acceptingProjects ?? true;
    const startupClients = resolved?.startupClients ?? [];
    const minBudgetUsd = resolved?.minBudgetUsd ?? null;
    const ycOffer = resolved?.ycOffer?.trim() || null;
    const responseSlaDays = resolved?.responseSlaDays ?? null;
    const awardTotal = agency?.awards?.total ?? 0;

    const score = computeAgencyScore({
      claimed,
      verified,
      acceptingProjects,
      hasYcOffer: Boolean(ycOffer),
      hasMinBudget: typeof minBudgetUsd === "number",
      hasStartupClients: startupClients.length > 0,
      responseSlaDays,
      awardTotal,
    });

    return {
      ...agency,
      description,
      services,
      claim: resolved,
      claimed,
      verified,
      minBudgetUsd,
      typicalBudgetMin: resolved?.typicalBudgetMin ?? null,
      typicalBudgetMax: resolved?.typicalBudgetMax ?? null,
      typicalTimelineWeeks: resolved?.typicalTimelineWeeks ?? null,
      platforms: resolved?.platforms ?? [],
      declines: resolved?.declines?.trim() || null,
      startupClients,
      ycOffer,
      contactName: resolved?.contactName?.trim() || null,
      responseSlaDays,
      acceptingProjects,
      startupFriendly: isStartupFriendly(resolved),
      score,
      awardTotal,
      resolvedCategories,
      primaryCategorySlug: resolvedCategories[0] ?? null,
      city: resolved?.city?.trim() || agency?.location?.city?.trim() || null,
      resolvedLogoUrl: resolved?.logoUrl?.trim() || agency?.logoUrl || null,
    };
  } catch {
    // A record that cannot be enriched still has to render, so fall back
    // to the scraped shape with every claim-derived field at its default.
    return {
      ...agency,
      claim: null,
      claimed: false,
      verified: false,
      minBudgetUsd: null,
      typicalBudgetMin: null,
      typicalBudgetMax: null,
      typicalTimelineWeeks: null,
      platforms: [],
      declines: null,
      startupClients: [],
      ycOffer: null,
      contactName: null,
      responseSlaDays: null,
      acceptingProjects: true,
      startupFriendly: false,
      score: 0,
      awardTotal: agency?.awards?.total ?? 0,
      resolvedCategories: agency?.categories ?? [],
      primaryCategorySlug: agency?.categories?.[0] ?? null,
      city: agency?.location?.city ?? null,
      resolvedLogoUrl: agency?.logoUrl ?? null,
    };
  }
}

/**
 * Resolves claims onto a list of agencies.
 *
 * @param agencies - The scraped records.
 * @param claims - Claims keyed by agency slug. A missing key is a listing
 *                  with no claim, which is the normal case.
 * @returns One enriched record per input agency, in the same order.
 */
export function enrichAgencies(
  agencies: Agency[] | null | undefined,
  claims: Record<string, AgencyClaim> | null | undefined,
): EnrichedAgency[] {
  try {
    return (agencies ?? []).map((agency) => enrichAgency(agency, claims?.[agency?.slug] ?? null));
  } catch {
    return [];
  }
}
