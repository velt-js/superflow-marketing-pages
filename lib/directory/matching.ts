// Choosing which three agencies get a founder's brief.
//
// This is the directory's most consequential function. Three agencies get
// a real lead, everyone else gets nothing, and a founder forms their
// whole opinion of the directory from whether these three were worth
// their time. So it is written to be explainable rather than clever:
// every agency either passes a stated gate or it does not, and the
// survivors are ordered on the same score the listing page already ranks
// on, so the picks match what the founder would have seen browsing.
//
// THE ONE PLACE THIS DEPARTS FROM THE BRIEF IT WAS BUILT FROM
//
// The brief says to route to agencies whose minimum is "at or below the
// founder's budget floor". Read literally that means a founder in the
// "$10k to $25k" band is only shown studios that work under $10k - it
// hides the ones they can actually afford. The budget stored on the
// request is therefore the CEILING of the band they picked, and the gate
// is `agency.minBudgetUsd <= request.budgetUsd`. See `MatchRequest` in
// ./types.ts.

import { resolveContactEmail, type EnrichedAgency } from "./enrich";
import { compareByRecommended } from "./scoring";
import type { AgencyPlatform, MatchRequest } from "./types";

/** How many agencies a request is routed to. */
export const MATCH_TARGET_COUNT = 3;

/** One routed agency, with why it made the cut. */
export interface RoutedAgency {
  agency: EnrichedAgency;
  /** Where a match request for it should be emailed, or null when the
   *  listing carries no address. An unclaimed agency usually has none;
   *  it is still routed (the founder sees it, and it gets an email if we
   *  do have an address) because excluding every unclaimed listing would
   *  leave most categories unable to fill three slots. */
  contactEmail: string | null;
  /** True when this agency filled a slot that no qualifying claimed
   *  agency was available for. Surfaced to the founder rather than
   *  hidden - a list padded out with studios that never told us their
   *  budget should say so. */
  isFallback: boolean;
}

/** The outcome of routing one request. */
export interface MatchRouting {
  routed: RoutedAgency[];
  /** True when fewer than MATCH_TARGET_COUNT claimed agencies qualified
   *  and unclaimed ones were used to fill the list. */
  usedFallbacks: boolean;
  /** How many agencies cleared every gate before the cut to three. Not
   *  shown to the founder; logged, because a category that routinely
   *  qualifies four agencies is one whose listings need claiming. */
  qualifiedCount: number;
}

/**
 * Whether an agency can be sent this request at all.
 *
 * Four gates, in the order a person would check them:
 *
 *   1. It is listed in the category the founder picked.
 *   2. It has not said it is full.
 *   3. Its stated minimum is within the founder's budget. An agency that
 *      stated NO minimum passes - we have no basis to exclude it - but
 *      ranks below those that did, which is what `rankQualified` does.
 *   4. It works on the platform the founder named, IF it told us what it
 *      works on. Same rule as budget: silence is not disqualifying,
 *      because two thirds of the directory has not claimed yet and a
 *      strict reading would route almost nothing.
 *
 * @param agency - The candidate.
 * @param request - The founder's request.
 * @returns True when the agency may be routed this brief.
 */
export function qualifiesForMatch(
  agency: EnrichedAgency,
  request: Pick<MatchRequest, "category" | "budgetUsd" | "platformPref">,
): boolean {
  try {
    if (!agency.resolvedCategories.includes(request.category)) return false;
    if (!agency.acceptingProjects) return false;

    const minimum = agency.minBudgetUsd;
    if (typeof minimum === "number" && minimum > request.budgetUsd) return false;

    const preference = request.platformPref;
    if (preference && agency.platforms.length > 0 && !agency.platforms.includes(preference)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Orders qualifying agencies for routing.
 *
 * Three keys, ahead of the listing's own score:
 *
 *   1. Claimed listings first. A claimed agency has told us where to send
 *      the brief and that it wants the work; an unclaimed one is a guess.
 *   2. Then agencies that stated a budget at all, so a founder is not
 *      introduced to a studio whose price nobody knows when one that
 *      published theirs qualifies equally.
 *   3. Then a platform match, when the founder named one - an agency that
 *      explicitly lists Webflow beats one that listed no platforms, even
 *      though both passed the gate.
 *
 * Then the ordinary "Recommended" score, so the picks line up with what
 * the founder would have seen on the category page.
 *
 * @param agencies - The qualifying agencies.
 * @param platformPref - The founder's stated platform, if any.
 * @returns The agencies, best first.
 */
function rankQualified(
  agencies: EnrichedAgency[],
  platformPref: AgencyPlatform | null,
): EnrichedAgency[] {
  try {
    return agencies.slice().sort((one, two) => {
      const claimedOne = one.claimed ? 1 : 0;
      const claimedTwo = two.claimed ? 1 : 0;
      if (claimedTwo !== claimedOne) return claimedTwo - claimedOne;

      const budgetOne = typeof one.minBudgetUsd === "number" ? 1 : 0;
      const budgetTwo = typeof two.minBudgetUsd === "number" ? 1 : 0;
      if (budgetTwo !== budgetOne) return budgetTwo - budgetOne;

      if (platformPref) {
        const platformOne = one.platforms.includes(platformPref) ? 1 : 0;
        const platformTwo = two.platforms.includes(platformPref) ? 1 : 0;
        if (platformTwo !== platformOne) return platformTwo - platformOne;
      }

      return compareByRecommended(one, two);
    });
  } catch {
    return agencies;
  }
}

/**
 * Picks the agencies to route a request to.
 *
 * @param agencies - Every enriched agency in the directory.
 * @param request - The founder's request.
 * @param pinnedSlug - An agency the founder asked for by name, via
 *                      "Request intro" on its profile. It takes the first
 *                      slot when it qualifies, and is simply ignored when
 *                      it does not - a founder should not be told their
 *                      chosen studio was excluded on a budget rule they
 *                      cannot see, and the other two picks still go out.
 * @returns The routing decision.
 */
export function routeMatchRequest(
  agencies: EnrichedAgency[],
  request: Pick<MatchRequest, "category" | "budgetUsd" | "platformPref">,
  pinnedSlug?: string | null,
): MatchRouting {
  try {
    const qualified = (agencies ?? []).filter((agency) => qualifiesForMatch(agency, request));
    const ranked = rankQualified(qualified, request.platformPref ?? null);

    const pinned = pinnedSlug
      ? ranked.find((agency) => agency.slug === pinnedSlug)
      : undefined;
    const rest = pinned ? ranked.filter((agency) => agency.slug !== pinned.slug) : ranked;
    const picked = (pinned ? [pinned, ...rest] : rest).slice(0, MATCH_TARGET_COUNT);

    const claimedPicks = picked.filter((agency) => agency.claimed).length;

    return {
      routed: picked.map((agency) => ({
        agency,
        contactEmail: resolveContactEmail(agency.claim),
        isFallback: !agency.claimed,
      })),
      usedFallbacks: claimedPicks < Math.min(MATCH_TARGET_COUNT, picked.length),
      qualifiedCount: qualified.length,
    };
  } catch {
    return { routed: [], usedFallbacks: false, qualifiedCount: 0 };
  }
}
