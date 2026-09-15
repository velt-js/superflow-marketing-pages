// The directory's ranking score.
//
// Replaces "Top ranked" (award count) as the default order. An award
// tally answers "who impressed a jury"; this answers "who can a founder
// actually hire this month", which is the question the directory is now
// organised around. Award count survives as an explicit sort option, so
// nothing is hidden - it is just no longer the default lens.
//
// WHY THIS MODULE IMPORTS NOTHING
//
// The server sorts a category's agencies before rendering, and
// components/directory/AgencyExplorer.tsx re-sorts the same list in the
// browser. Those two orders MUST be identical or the page reorders itself
// on hydration, contradicting the ItemList JSON-LD the category page
// emits. The directory previously solved that with a pair of comparators
// documented as "mirrors of each other"; this module solves it by being
// the single comparator both sides import. It therefore has to be safe to
// pull into a client bundle, which means importing nothing from
// ./agencies.ts (that module evaluates ~2 MB of scraped JSON).

/**
 * Everything the score is computed from, as plain values.
 *
 * Deliberately not `Agency` or `AgencyClaim`: the caller resolves the
 * claim overlay first (see ./enrich.ts) and passes the resolved facts in.
 * That keeps this function honest about what it actually reads and lets
 * the client-side list item carry the same handful of numbers rather than
 * a whole record.
 */
export interface AgencyScoreSignals {
  claimed: boolean;
  verified: boolean;
  acceptingProjects: boolean;
  hasYcOffer: boolean;
  hasMinBudget: boolean;
  hasStartupClients: boolean;
  /** Stated reply time in business days, or null when not stated. */
  responseSlaDays: number | null;
  awardTotal: number;
}

/** Points for a listing the agency itself claimed AND verified by domain.
 *  The largest single term by a wide margin, because it is the only one
 *  that says a human at the agency looked at this page and stood behind
 *  it. Everything else on a claimed listing is downstream of that. */
export const SCORE_CLAIMED_VERIFIED = 40;

/** Points for an agency that has not told us it is full.
 *
 *  Note that `acceptingProjects` defaults to true, so every unclaimed
 *  listing earns this too - it is a constant offset across the unclaimed
 *  half of the directory rather than a differentiator within it. It only
 *  separates agencies once one of them says no. That is the intended
 *  behaviour: "we are full" should cost a listing its place, but "we
 *  never said" should not be read as "we are full". */
export const SCORE_ACCEPTING_PROJECTS = 15;

/** Points for a standing YC offer. */
export const SCORE_YC_OFFER = 10;

/** Points for stating a minimum budget at all. Rewards the answer, not
 *  the number: a studio that says "we start at $80k" has told a founder
 *  something useful, and ranking it below a cheaper studio that said
 *  nothing would teach agencies to stay quiet. */
export const SCORE_MIN_BUDGET_STATED = 10;

/** Points for naming at least one startup client. */
export const SCORE_STARTUP_CLIENTS = 10;

/** Points for a stated reply time inside FAST_REPLY_MAX_DAYS. */
export const SCORE_FAST_REPLY = 5;

/** Ceiling on the award term. Ten points, against 40 for a verified
 *  claim: a 227-award studio that never answered an email still ranks
 *  below a claimed listing, which is the whole intent of the change. */
export const SCORE_AWARDS_MAX = 10;

/** Awards per point, up to SCORE_AWARDS_MAX. 20 awards buys one point,
 *  so the cap is reached at 200 - roughly the top of the Awwwards
 *  distribution in this dataset. */
export const SCORE_AWARDS_DIVISOR = 20;

/** At or below this many business days, a stated reply time is "fast".
 *  Duplicated from ./claim-fields.ts rather than imported, so this module
 *  keeps its no-imports property - see the header. The two are asserted
 *  equal by tests/directory/scoring.spec.ts. */
export const FAST_REPLY_MAX_DAYS = 2;

/**
 * Scores one agency for the "Recommended" order.
 *
 * Every term is additive and independently explainable, which matters
 * more here than precision: agencies will ask why they rank where they
 * do, and "you have not claimed the listing and have not stated a
 * budget - that is 50 points" is an answer they can act on. A tuned
 * weighting nobody can explain is not.
 *
 * @param signals - Resolved facts about the agency, claim overlay
 *                   already applied.
 * @returns The score, 0 on any failure so a bad record sorts last rather
 *          than crashing the listing.
 */
export function computeAgencyScore(signals: AgencyScoreSignals | null | undefined): number {
  try {
    if (!signals) return 0;
    let score = 0;
    if (signals.claimed && signals.verified) score += SCORE_CLAIMED_VERIFIED;
    if (signals.acceptingProjects) score += SCORE_ACCEPTING_PROJECTS;
    if (signals.hasYcOffer) score += SCORE_YC_OFFER;
    if (signals.hasMinBudget) score += SCORE_MIN_BUDGET_STATED;
    if (signals.hasStartupClients) score += SCORE_STARTUP_CLIENTS;
    const sla = signals.responseSlaDays;
    if (typeof sla === "number" && sla > 0 && sla <= FAST_REPLY_MAX_DAYS) {
      score += SCORE_FAST_REPLY;
    }
    const awardTotal = Math.max(0, signals.awardTotal ?? 0);
    score += Math.min(SCORE_AWARDS_MAX, awardTotal / SCORE_AWARDS_DIVISOR);
    return score;
  } catch {
    return 0;
  }
}

/**
 * The subset of a ranked agency the comparators below read.
 *
 * Both `EnrichedAgency` (server) and `AgencyListItem` (client) satisfy
 * this, which is what lets one comparator sort both.
 */
export interface AgencyRankingSignals {
  score: number;
  awardTotal: number;
  name: string;
  /** Lowest stated project budget, or null when not stated. */
  minBudgetUsd: number | null;
  /** Stated reply time in business days, or null when not stated. */
  responseSlaDays: number | null;
}

/**
 * Default order: score descending, then award total descending, then
 * name. Used by the server before render and by the "Recommended" option
 * in the sort dropdown, which is why selecting it always reproduces the
 * page's initial state exactly.
 *
 * @param one - First agency.
 * @param two - Second agency.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
export function compareByRecommended(
  one: AgencyRankingSignals,
  two: AgencyRankingSignals,
): number {
  try {
    if (two.score !== one.score) return two.score - one.score;
    if (two.awardTotal !== one.awardTotal) return two.awardTotal - one.awardTotal;
    return (one.name ?? "").localeCompare(two.name ?? "");
  } catch {
    return 0;
  }
}

/**
 * Award total descending - the directory's old default, kept as an
 * explicit choice.
 *
 * @param one - First agency.
 * @param two - Second agency.
 * @returns Standard comparator sign.
 */
export function compareByAwards(one: AgencyRankingSignals, two: AgencyRankingSignals): number {
  try {
    if (two.awardTotal !== one.awardTotal) return two.awardTotal - one.awardTotal;
    return (one.name ?? "").localeCompare(two.name ?? "");
  } catch {
    return 0;
  }
}

/**
 * Lowest stated minimum budget first.
 *
 * Agencies that stated nothing sort to the BOTTOM rather than to the top,
 * which a naive null-as-zero would do. A founder choosing this order is
 * asking "who is cheapest"; answering with studios whose price is unknown
 * would be the most confident possible way of not answering.
 *
 * @param one - First agency.
 * @param two - Second agency.
 * @returns Standard comparator sign.
 */
export function compareByLowestBudget(
  one: AgencyRankingSignals,
  two: AgencyRankingSignals,
): number {
  try {
    const budgetOne = one.minBudgetUsd;
    const budgetTwo = two.minBudgetUsd;
    if (budgetOne === null && budgetTwo === null) return compareByRecommended(one, two);
    if (budgetOne === null) return 1;
    if (budgetTwo === null) return -1;
    if (budgetOne !== budgetTwo) return budgetOne - budgetTwo;
    return compareByRecommended(one, two);
  } catch {
    return 0;
  }
}

/**
 * Fastest stated reply first, with unstated reply times last - same
 * reasoning as `compareByLowestBudget`.
 *
 * @param one - First agency.
 * @param two - Second agency.
 * @returns Standard comparator sign.
 */
export function compareByFastestReply(
  one: AgencyRankingSignals,
  two: AgencyRankingSignals,
): number {
  try {
    const slaOne = one.responseSlaDays;
    const slaTwo = two.responseSlaDays;
    if (slaOne === null && slaTwo === null) return compareByRecommended(one, two);
    if (slaOne === null) return 1;
    if (slaTwo === null) return -1;
    if (slaOne !== slaTwo) return slaOne - slaTwo;
    return compareByRecommended(one, two);
  } catch {
    return 0;
  }
}
