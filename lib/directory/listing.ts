// The read path every /directory page goes through.
//
// lib/directory/agencies.ts answers "what did the sources publish".
// This module answers "what should this page show", which is the same
// records with claims resolved onto them (./enrich.ts) and re-ranked on
// the score (./scoring.ts) rather than on award count.
//
// Two flavours of every read, and picking the wrong one is the mistake
// this header exists to prevent:
//
//   * The ASYNC ones take the live claim layer into account and are what
//     a rendered page must use. A claim submitted two minutes ago shows
//     up here and nowhere else.
//   * The SYNC ones see only the committed claims in claims.json. They
//     exist for build-time callers that cannot await - `generateStaticParams`,
//     the sitemap - where the difference does not matter, because a claim
//     changes what a page SAYS and never whether the page EXISTS.

import {
  formatAgencyLocation,
  getAgencyBySlug,
  getAgencyClients,
  getAgencyRatingScore,
  getAllAgencies,
  getRelatedAgencies,
  isSuperflowPartner,
} from "./agencies";
import { getClaimMap, getCommittedClaims } from "./claims";
import { enrichAgencies, enrichAgency, type EnrichedAgency } from "./enrich";
import { compareByRecommended } from "./scoring";
import type { Agency, AgencyClaim, AgencyPlatform } from "./types";

/**
 * Enriches and ranks a category's agencies against a claim map the caller
 * already holds.
 *
 * Takes the map as an argument rather than fetching it, so a page
 * rendering several categories (the hub) reads the live layer once
 * instead of once per category.
 *
 * @param categorySlug - The `DirectoryCategory.slug` to list.
 * @param claims - Claims keyed by agency slug.
 * @returns Enriched agencies in "Recommended" order.
 */
export function selectCategoryAgencies(
  categorySlug: string,
  claims: Record<string, AgencyClaim>,
): EnrichedAgency[] {
  try {
    if (!categorySlug) return [];
    return enrichAgencies(getAllAgencies(), claims)
      // Resolved categories, not scraped ones: a claim can move an agency
      // into a category it was filed out of, and a listing that ignored
      // that would contradict the profile page's own breadcrumb.
      .filter((agency) => agency.resolvedCategories.includes(categorySlug))
      .sort(compareByRecommended);
  } catch {
    return [];
  }
}

/**
 * A category's agencies, live claims included. The category page's read.
 *
 * @param categorySlug - The `DirectoryCategory.slug` to list.
 * @returns Enriched agencies in "Recommended" order.
 */
export async function getCategoryAgencies(categorySlug: string): Promise<EnrichedAgency[]> {
  try {
    return selectCategoryAgencies(categorySlug, await getClaimMap());
  } catch {
    return [];
  }
}

/**
 * A category's agencies using only committed claims.
 *
 * For build-time and synchronous callers - the sitemap, the Markdown
 * copies. See this file's header for why that is safe.
 *
 * @param categorySlug - The `DirectoryCategory.slug` to list.
 * @returns Enriched agencies in "Recommended" order.
 */
export function getCategoryAgenciesSync(categorySlug: string): EnrichedAgency[] {
  try {
    return selectCategoryAgencies(categorySlug, getCommittedClaims());
  } catch {
    return [];
  }
}

/**
 * How many agencies a category lists, live claims included.
 *
 * Counts resolved categories, so the hub's "60 agencies indexed" matches
 * what the category page actually renders once a claim has moved a studio
 * between categories.
 *
 * @param categorySlug - The `DirectoryCategory.slug` to count.
 * @returns The count, 0 on any failure.
 */
export async function getCategoryAgencyCount(categorySlug: string): Promise<number> {
  try {
    return (await getCategoryAgencies(categorySlug)).length;
  } catch {
    return 0;
  }
}

/**
 * One agency with its live claim resolved. The profile page's read.
 *
 * @param slug - The agency slug.
 * @returns The enriched record, or null when no agency has that slug.
 */
export async function getEnrichedAgency(slug: string): Promise<EnrichedAgency | null> {
  try {
    const agency = getAgencyBySlug(slug);
    if (!agency) return null;
    const claims = await getClaimMap();
    return enrichAgency(agency, claims[agency.slug] ?? null);
  } catch {
    return null;
  }
}

/**
 * One agency with only its committed claim resolved.
 *
 * @param slug - The agency slug.
 * @returns The enriched record, or null when no agency has that slug.
 */
export function getEnrichedAgencySync(slug: string): EnrichedAgency | null {
  try {
    const agency = getAgencyBySlug(slug);
    if (!agency) return null;
    return enrichAgency(agency, getCommittedClaims()[agency.slug] ?? null);
  } catch {
    return null;
  }
}

/**
 * Every agency, enriched and live. Used by the match router, which has to
 * consider the whole dataset rather than one category's slice (an agency
 * can be routed a request in any category it resolves into).
 *
 * @returns Every enriched record, in "Recommended" order.
 */
export async function getAllEnrichedAgencies(): Promise<EnrichedAgency[]> {
  try {
    return enrichAgencies(getAllAgencies(), await getClaimMap()).sort(compareByRecommended);
  } catch {
    return [];
  }
}

/** Aggregate counts shown in a category header - the enriched successor
 *  to `AgencyListStats`, with the two facts a founder is actually
 *  scanning for in place of the partner count. */
export interface CategoryStats {
  agencyCount: number;
  countryCount: number;
  /** How many listings the agency itself claimed and verified. */
  verifiedCount: number;
  /** How many carry a standing YC offer. */
  ycOfferCount: number;
}

/**
 * Summarises a category listing for its hero stat card.
 *
 * Every figure is derived from the records passed in - never hardcoded,
 * and never a count of something the page does not render.
 *
 * @param agencies - The enriched agencies being listed.
 * @returns The stat card's figures.
 */
export function buildCategoryStats(agencies: EnrichedAgency[] | null | undefined): CategoryStats {
  try {
    const list = agencies ?? [];
    const countries = new Set(
      list
        .map((agency) => agency?.location?.country?.trim())
        .filter((country): country is string => Boolean(country)),
    );
    return {
      agencyCount: list.length,
      countryCount: countries.size,
      verifiedCount: list.filter((agency) => agency.verified).length,
      ycOfferCount: list.filter((agency) => Boolean(agency.ycOffer)).length,
    };
  } catch {
    return { agencyCount: 0, countryCount: 0, verifiedCount: 0, ycOfferCount: 0 };
  }
}

/**
 * Slim, client-safe projection of an enriched agency, for the interactive
 * search/filter/sort controls (components/directory/AgencyExplorer.tsx).
 *
 * Deliberately NOT the full `EnrichedAgency` shape. A `"use client"` file
 * that imported anything from ./agencies.ts would pull the whole scraped
 * dataset into the browser bundle (JS module evaluation is not reliably
 * tree-shaken across a JSON import), on top of the same data already
 * present as server-rendered HTML. Build these server-side with
 * `buildAgencyListItems` and pass only this array across the boundary -
 * the explorer imports this as a TYPE-only import, which costs nothing at
 * runtime.
 *
 * Satisfies both `AgencyRankingSignals` (./scoring.ts) and
 * `FilterableAgency` (./filters.ts) on purpose, so the comparators and
 * the filter predicate the server uses are the exact same functions the
 * client runs. That is what guarantees the client's first sort reproduces
 * the server's order instead of merely resembling it.
 *
 * `contactEmail` is NOT here and must never be added. It would be
 * serialized into the page for anyone to scrape.
 */
export interface AgencyListItem {
  slug: string;
  name: string;
  /** Lowercased "name + description + location + clients + services +
   *  industries + platforms" blob for substring search. */
  searchText: string;
  country: string | null;
  isPartner: boolean;
  awardTotal: number;
  /** Ranking signal for review-based sources - see `getAgencyRatingScore`
   *  in ./agencies.ts. 0 for a record with no rating. */
  ratingScore: number;
  /** Number of `Agency.accolades`. */
  accoladeCount: number;
  /** The "Recommended" score - see ./scoring.ts. */
  score: number;
  minBudgetUsd: number | null;
  responseSlaDays: number | null;
  platforms: AgencyPlatform[];
  startupFriendly: boolean;
  hasYcOffer: boolean;
  verified: boolean;
  claimed: boolean;
}

/**
 * Projects one enriched agency into the client-side list shape.
 *
 * @param agency - The enriched agency.
 * @returns A list item, or null when the agency has no slug (the join key
 *          components/directory/AgencyGrid.tsx uses to line this up with
 *          the pre-rendered card for the same agency).
 */
export function buildAgencyListItem(
  agency: EnrichedAgency | null | undefined,
): AgencyListItem | null {
  try {
    if (!agency?.slug) return null;
    const location = formatAgencyLocation(agency.location ?? null) ?? "";
    // Client, service, industry and platform names all go into the search
    // blob so a visitor can find an agency by who it worked for ("nike"),
    // what it does ("link building") or what it builds on ("webflow") -
    // the queries a directory is actually asked, rather than only by name.
    const clientNames = getAgencyClients(agency)
      .map((client) => client.name)
      .join(" ");
    const searchText = [
      agency.name ?? "",
      agency.description ?? "",
      location,
      agency.city ?? "",
      clientNames,
      (agency.services ?? []).join(" "),
      (agency.industries ?? []).join(" "),
      (agency.platforms ?? []).join(" "),
      (agency.startupClients ?? []).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return {
      slug: agency.slug,
      name: agency.name ?? "",
      searchText,
      country: agency.location?.country?.trim() || null,
      isPartner: isSuperflowPartner(agency),
      awardTotal: agency.awardTotal,
      ratingScore: getAgencyRatingScore(agency),
      accoladeCount: agency.accolades?.length ?? 0,
      score: agency.score,
      minBudgetUsd: agency.minBudgetUsd,
      responseSlaDays: agency.responseSlaDays,
      platforms: agency.platforms ?? [],
      startupFriendly: agency.startupFriendly,
      hasYcOffer: Boolean(agency.ycOffer),
      verified: agency.verified,
      claimed: agency.claimed,
    };
  } catch {
    return null;
  }
}

/**
 * Projects a list of enriched agencies into `AgencyListItem`s.
 *
 * Agencies without a slug are dropped, so callers pairing these with
 * pre-rendered cards must key off `slug` and never off array index - a
 * dropped entry would otherwise desynchronize the two lists.
 *
 * @param agencies - Enriched agencies to project.
 * @returns One list item per agency with a slug.
 */
export function buildAgencyListItems(
  agencies: EnrichedAgency[] | null | undefined,
): AgencyListItem[] {
  try {
    return (agencies ?? [])
      .map((agency) => buildAgencyListItem(agency))
      .filter((item): item is AgencyListItem => item !== null);
  } catch {
    return [];
  }
}

/** The "more agencies" block at the foot of a profile, with its agencies
 *  enriched so the cards in it are identical to the same cards on the
 *  category listing - claim facts, badges and all. */
export interface EnrichedRelatedBlock {
  heading: string;
  agencies: EnrichedAgency[];
}

/**
 * Builds the related-agencies block for a profile page.
 *
 * Wraps `getRelatedAgencies` (which selects on the scraped records) and
 * enriches what it returns. The selection itself deliberately stays on
 * the scraped side: the block exists for internal linking, and which
 * agencies are near this one by country and category does not change
 * when one of them states a budget.
 *
 * @param agency - The agency whose page this is.
 * @param limit - How many related agencies to return.
 * @returns The heading and its enriched agencies.
 */
export async function getEnrichedRelatedAgencies(
  agency: Agency | null | undefined,
  limit?: number,
): Promise<EnrichedRelatedBlock> {
  try {
    const block = getRelatedAgencies(agency, limit);
    const claims = await getClaimMap();
    return { heading: block.heading, agencies: enrichAgencies(block.agencies, claims) };
  } catch {
    return { heading: "More agencies", agencies: [] };
  }
}
