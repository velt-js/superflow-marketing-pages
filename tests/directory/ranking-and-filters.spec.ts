// Unit coverage for the directory's ranking, filtering and matching rules.
//
// These are pure functions and they never touch a browser, which is why
// this file uses no Playwright fixture - it runs under the same runner as
// the browser suites purely so `npm run test:directory` is one command.
//
// WHAT THIS FILE IS PROTECTING
//
// Three of these rules are invisible until they are wrong, and all three
// have a natural "simplification" that silently breaks them:
//
//   1. A null budget is NOT zero. Treating it as one puts every listing
//      that never stated a price at the top of "lowest minimum budget"
//      and inside every budget filter - answering a founder's question
//      about price with the listings that have no price.
//   2. The server sort and the client re-sort must produce the same
//      order. They share one comparator now; a future refactor that
//      gives either side its own is what this catches.
//   3. The match budget gate reads the founder's CEILING, not their
//      floor. Inverting it hides exactly the agencies a founder can
//      afford. See lib/directory/matching.ts.

import { test, expect } from "@playwright/test";

import {
  computeAgencyScore,
  compareByFastestReply,
  compareByLowestBudget,
  compareByRecommended,
  SCORE_ACCEPTING_PROJECTS,
  SCORE_AWARDS_MAX,
  SCORE_CLAIMED_VERIFIED,
  FAST_REPLY_MAX_DAYS,
} from "../../lib/directory/scoring";
import { FAST_REPLY_MAX_DAYS as FIELDS_FAST_REPLY_MAX_DAYS } from "../../lib/directory/claim-fields";
import {
  defaultFilterState,
  matchesFilters,
  readFilterState,
  writeFilterState,
  type FilterState,
} from "../../lib/directory/filters";
import { qualifiesForMatch, routeMatchRequest } from "../../lib/directory/matching";
import { emptyClaim, enrichAgency, isStartupFriendly, resolveCategories } from "../../lib/directory/enrich";
import { stripContactDetails, truncateAtSentence } from "../../lib/directory/text";
import { agencyInitials } from "../../lib/directory/logos";
import type { Agency, AgencyClaim } from "../../lib/directory/types";
import type { EnrichedAgency } from "../../lib/directory/enrich";

/** A minimal scraped record, for tests that only care about a field or two. */
function agency(overrides: Partial<Agency> = {}): Agency {
  return {
    slug: "test-agency",
    name: "Test Agency",
    website: "https://test-agency.com/",
    domain: "test-agency.com",
    profileUrl: "https://www.awwwards.com/test-agency/",
    location: { country: "United Kingdom", countryCode: "GB", city: "London" },
    categories: ["web-design"],
    services: [],
    teamSize: null,
    logoUrl: null,
    description: null,
    awards: {
      siteOfTheDay: 0,
      siteOfTheMonth: 0,
      siteOfTheYear: 0,
      developerAward: 0,
      honorableMentions: 0,
      nominees: 0,
      total: 0,
    },
    rating: null,
    accolades: [],
    foundedYear: null,
    industries: [],
    budgetLabel: null,
    budgetFloorUsd: null,
    clients: [],
    source: "awwwards",
    scrapedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

/** A claim with the fields a test cares about set. */
function claim(slug: string, overrides: Partial<AgencyClaim> = {}): AgencyClaim {
  return { ...emptyClaim(slug), ...overrides };
}

/* ---- Scoring --------------------------------------------------------- */

test("a verified claim outweighs any award record", () => {
  const claimed = computeAgencyScore({
    claimed: true,
    verified: true,
    acceptingProjects: true,
    hasYcOffer: false,
    hasMinBudget: false,
    hasStartupClients: false,
    responseSlaDays: null,
    awardTotal: 0,
  });
  const decorated = computeAgencyScore({
    claimed: false,
    verified: false,
    acceptingProjects: true,
    hasYcOffer: false,
    hasMinBudget: false,
    hasStartupClients: false,
    responseSlaDays: null,
    awardTotal: 10_000,
  });
  expect(claimed).toBeGreaterThan(decorated);
  // The award term is capped, which is what makes the above true for ANY
  // award total rather than just this one.
  expect(decorated).toBe(SCORE_ACCEPTING_PROJECTS + SCORE_AWARDS_MAX);
  expect(claimed).toBe(SCORE_CLAIMED_VERIFIED + SCORE_ACCEPTING_PROJECTS);
});

test("an unverified claim does not earn the claimed bonus", () => {
  const score = computeAgencyScore({
    claimed: true,
    verified: false,
    acceptingProjects: true,
    hasYcOffer: false,
    hasMinBudget: false,
    hasStartupClients: false,
    responseSlaDays: null,
    awardTotal: 0,
  });
  expect(score).toBe(SCORE_ACCEPTING_PROJECTS);
});

test("an agency that says it is full loses the accepting bonus", () => {
  const open = computeAgencyScore({
    claimed: false, verified: false, acceptingProjects: true, hasYcOffer: false,
    hasMinBudget: false, hasStartupClients: false, responseSlaDays: null, awardTotal: 0,
  });
  const full = computeAgencyScore({
    claimed: false, verified: false, acceptingProjects: false, hasYcOffer: false,
    hasMinBudget: false, hasStartupClients: false, responseSlaDays: null, awardTotal: 0,
  });
  expect(open - full).toBe(SCORE_ACCEPTING_PROJECTS);
});

test("the fast-reply threshold is the same number in both modules", () => {
  // ./scoring.ts keeps its own copy so it can import nothing - see its
  // header. That is only safe while the two agree.
  expect(FAST_REPLY_MAX_DAYS).toBe(FIELDS_FAST_REPLY_MAX_DAYS);
});

/* ---- Comparators ----------------------------------------------------- */

const ranked = (score: number, extra: Partial<{ awardTotal: number; name: string; minBudgetUsd: number | null; responseSlaDays: number | null }> = {}) => ({
  score,
  awardTotal: extra.awardTotal ?? 0,
  name: extra.name ?? "Agency",
  minBudgetUsd: extra.minBudgetUsd ?? null,
  responseSlaDays: extra.responseSlaDays ?? null,
});

test("recommended order is score, then awards, then name", () => {
  const list = [
    ranked(10, { name: "C" }),
    ranked(50, { name: "B", awardTotal: 5 }),
    ranked(50, { name: "A", awardTotal: 90 }),
  ];
  expect(list.slice().sort(compareByRecommended).map((item) => item.name)).toEqual(["A", "B", "C"]);
});

test("agencies with no stated budget sort LAST under lowest-budget, not first", () => {
  const list = [
    ranked(10, { name: "Unstated", minBudgetUsd: null }),
    ranked(10, { name: "Cheap", minBudgetUsd: 5_000 }),
    ranked(10, { name: "Dear", minBudgetUsd: 80_000 }),
  ];
  expect(list.slice().sort(compareByLowestBudget).map((item) => item.name)).toEqual([
    "Cheap",
    "Dear",
    "Unstated",
  ]);
});

test("agencies with no stated reply time sort LAST under fastest-reply", () => {
  const list = [
    ranked(10, { name: "Unstated", responseSlaDays: null }),
    ranked(10, { name: "Quick", responseSlaDays: 1 }),
    ranked(10, { name: "Slow", responseSlaDays: 5 }),
  ];
  expect(list.slice().sort(compareByFastestReply).map((item) => item.name)).toEqual([
    "Quick",
    "Slow",
    "Unstated",
  ]);
});

/* ---- Filters --------------------------------------------------------- */

const filterable = (overrides: Partial<Parameters<typeof matchesFilters>[0]> = {}) => ({
  searchText: "test agency london",
  country: "United Kingdom",
  minBudgetUsd: null,
  platforms: [],
  startupFriendly: false,
  hasYcOffer: false,
  verified: false,
  ...overrides,
});

const withFilters = (overrides: Partial<FilterState>): FilterState => ({
  ...defaultFilterState(),
  ...overrides,
});

test("an agency with no stated budget appears only under Any budget", () => {
  const silent = filterable({ minBudgetUsd: null });
  expect(matchesFilters(silent, defaultFilterState())).toBe(true);
  expect(matchesFilters(silent, withFilters({ budget: "25000" }))).toBe(false);
});

test("the budget filter is a ceiling on the agency's minimum", () => {
  expect(matchesFilters(filterable({ minBudgetUsd: 10_000 }), withFilters({ budget: "25000" }))).toBe(true);
  expect(matchesFilters(filterable({ minBudgetUsd: 25_000 }), withFilters({ budget: "25000" }))).toBe(true);
  expect(matchesFilters(filterable({ minBudgetUsd: 26_000 }), withFilters({ budget: "25000" }))).toBe(false);
});

test("selecting two platforms matches either, not both", () => {
  const webflowOnly = filterable({ platforms: ["webflow"] });
  expect(matchesFilters(webflowOnly, withFilters({ platforms: ["webflow", "framer"] }))).toBe(true);
  expect(matchesFilters(webflowOnly, withFilters({ platforms: ["framer"] }))).toBe(false);
});

test("filter state survives a round trip through the query string", () => {
  const state = withFilters({
    search: "brand",
    country: "Germany",
    budget: "50000",
    platforms: ["webflow", "nextjs"],
    ycOffer: true,
    verified: true,
    sort: "fastest-reply",
  });
  expect(readFilterState(writeFilterState(state))).toEqual(state);
});

test("default state writes an empty query string", () => {
  expect(writeFilterState(defaultFilterState())).toBe("");
});

test("a hand-mangled query string degrades to the full listing", () => {
  const state = readFilterState("?budget=banana&sort=nonsense&platform=fortran");
  expect(state.budget).toBe("any");
  expect(state.sort).toBe("recommended");
  expect(state.platforms).toEqual([]);
});

test("the YC strip's link is the filter the control bar writes", () => {
  // The strip on /directory links to `?yc_offer=1`. If the param name
  // ever diverges the link silently shows an unfiltered page.
  expect(readFilterState("?yc_offer=1").ycOffer).toBe(true);
});

/* ---- Enrichment ------------------------------------------------------ */

test("startup friendliness is derived, never asserted by an empty claim", () => {
  expect(isStartupFriendly(null)).toBe(false);
  expect(isStartupFriendly(claim("a"))).toBe(false);
  expect(isStartupFriendly(claim("a", { minBudgetUsd: 25_000 }))).toBe(true);
  expect(isStartupFriendly(claim("a", { minBudgetUsd: 25_001 }))).toBe(false);
  expect(isStartupFriendly(claim("a", { minBudgetUsd: 500_000, startupClients: ["Linear"] }))).toBe(true);
});

test("an editorial overlay never mints a verified badge", () => {
  // claims.json carries facts we wrote down from campaign replies. Those
  // records must not make a listing look like the agency stood behind it.
  const overlay = claim("test-agency", { minBudgetUsd: 20_000, verified: true, claimed: false });
  const enriched = enrichAgency(agency(), overlay);
  expect(enriched.minBudgetUsd).toBe(20_000);
  expect(enriched.claimed).toBe(false);
  expect(enriched.verified).toBe(false);
});

test("a claim can re-file an agency without losing its scraped category", () => {
  const categories = resolveCategories(
    agency({ categories: ["web-design"] }),
    claim("test-agency", { primaryCategory: "branding", secondaryCategories: ["motion-design"] }),
  );
  expect(categories[0]).toBe("branding");
  expect(categories).toContain("web-design");
  expect(categories).toContain("motion-design");
});

test("a claim naming an unknown category is ignored rather than obeyed", () => {
  const categories = resolveCategories(
    agency({ categories: ["web-design"] }),
    claim("test-agency", { primaryCategory: "underwater-basket-weaving" }),
  );
  expect(categories).toEqual(["web-design"]);
});

test("an agency-written blurb replaces the scraped one", () => {
  const enriched = enrichAgency(
    agency({ description: "Scraped blurb." }),
    claim("test-agency", { claimed: true, description: "Our own words." }),
  );
  expect(enriched.description).toBe("Our own words.");
});

/* ---- Matching -------------------------------------------------------- */

const enriched = (overrides: Partial<EnrichedAgency> = {}): EnrichedAgency => ({
  ...enrichAgency(agency({ slug: overrides.slug ?? "test-agency" }), null),
  ...overrides,
});

const request = (overrides: Partial<{ category: string; budgetUsd: number; platformPref: null | "webflow" | "framer" }> = {}) => ({
  category: "web-design",
  budgetUsd: 25_000,
  platformPref: null,
  ...overrides,
});

test("the budget gate reads the founder's ceiling, not their floor", () => {
  // A studio with a $20k minimum must be reachable by a founder in the
  // "$10k to $25k" band. Reading the band's floor instead would hide it.
  const studio = enriched({ minBudgetUsd: 20_000 });
  expect(qualifiesForMatch(studio, request({ budgetUsd: 25_000 }))).toBe(true);
  expect(qualifiesForMatch(studio, request({ budgetUsd: 10_000 }))).toBe(false);
});

test("an agency that never stated a budget still qualifies", () => {
  expect(qualifiesForMatch(enriched({ minBudgetUsd: null }), request())).toBe(true);
});

test("an agency that says it is full is never routed", () => {
  expect(qualifiesForMatch(enriched({ acceptingProjects: false }), request())).toBe(false);
});

test("a platform preference excludes only agencies that stated a different one", () => {
  expect(qualifiesForMatch(enriched({ platforms: ["webflow"] }), request({ platformPref: "framer" }))).toBe(false);
  expect(qualifiesForMatch(enriched({ platforms: [] }), request({ platformPref: "framer" }))).toBe(true);
});

test("claimed agencies fill the slots before unclaimed ones", () => {
  const pool = [
    enriched({ slug: "unclaimed-a", name: "Unclaimed A", score: 90, awardTotal: 300 }),
    enriched({ slug: "unclaimed-b", name: "Unclaimed B", score: 85, awardTotal: 200 }),
    enriched({ slug: "claimed", name: "Claimed", claimed: true, score: 40, awardTotal: 0 }),
  ];
  const routing = routeMatchRequest(pool, request());
  expect(routing.routed[0].agency.slug).toBe("claimed");
  expect(routing.routed).toHaveLength(3);
  expect(routing.usedFallbacks).toBe(true);
});

test("a pinned agency that does not qualify is dropped silently", () => {
  const pool = [
    enriched({ slug: "affordable", name: "Affordable", minBudgetUsd: 5_000 }),
    enriched({ slug: "expensive", name: "Expensive", minBudgetUsd: 500_000 }),
  ];
  const routing = routeMatchRequest(pool, request({ budgetUsd: 25_000 }), "expensive");
  expect(routing.routed.map((entry) => entry.agency.slug)).toEqual(["affordable"]);
});

test("routing never returns more than three agencies", () => {
  const pool = Array.from({ length: 12 }, (unused, index) =>
    enriched({ slug: `agency-${index}`, name: `Agency ${index}`, score: index }),
  );
  expect(routeMatchRequest(pool, request()).routed).toHaveLength(3);
});

/* ---- Text repairs ---------------------------------------------------- */

test("a trailing contact line is removed and the sentence keeps its full stop", () => {
  expect(stripContactDetails("We build brands that move. Inquiries: hello@studio.com")).toBe(
    "We build brands that move.",
  );
});

test("a blurb with nothing to strip comes back byte-identical", () => {
  // French copy spaces its colons and exclamation marks differently, and
  // normalising an untouched blurb silently rewrites a third of the
  // dataset. See stripContactDetails.
  const french = "Hamak : une agence de marketing numérique au service de votre croissance !";
  expect(stripContactDetails(french)).toBe(french);
});

test("a blurb that is only a contact line becomes no blurb", () => {
  expect(stripContactDetails("hello@onlycontact.com")).toBeNull();
});

test("card truncation lands on a sentence boundary", () => {
  const blurb =
    "We are a studio in Berlin working across brand and digital. Our clients are consumer businesses at the point where they need to look like the category leader they intend to become.";
  const truncated = truncateAtSentence(blurb, 140);
  expect(truncated).toBe("We are a studio in Berlin working across brand and digital.");
  expect(truncated?.endsWith("…")).toBe(false);
});

test("truncation falls back to an ellipsis when the first sentence is too long", () => {
  const blurb =
    "A full-service studio specialising in brand identity, packaging and digital product design for consumer businesses that want to look like they belong at the top of their category.";
  expect(truncateAtSentence(blurb, 140)?.endsWith("…")).toBe(true);
});

test("an abbreviation is not mistaken for the end of a sentence", () => {
  const blurb =
    "We build for Inc. 5000 companies and fast-growing startups across every stage of their life, from the first landing page onward.";
  expect(truncateAtSentence(blurb, 60)).toContain("Inc. 5000");
});

/* ---- Monogram fallback ----------------------------------------------- */

test("monogram initials skip articles and punctuation", () => {
  expect(agencyInitials("The Working Party")).toBe("WP");
  expect(agencyInitials("&Walsh")).toBe("W");
  expect(agencyInitials("Merci Michel")).toBe("MM");
  expect(agencyInitials("")).toBe("?");
});
