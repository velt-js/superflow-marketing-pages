// The category page's filter state, and its round trip through the URL.
//
// Filters live in the query string so a founder can send someone "the
// Webflow studios under $25k that reply inside two days" as a link. That
// makes this module the shared contract between three things that must
// agree exactly: the control bar that writes the URL, the reader that
// restores state from it, and anything that links INTO a filtered view
// (the "For YC founders" strip on /directory links to `?yc_offer=1`).
//
// Imports nothing but ./claim-fields.ts and a type, so it is safe on both
// sides of the client boundary - see that file's header for why that
// matters here.

import {
  BUDGET_FILTER_ANY,
  findBudgetFilterOption,
  toPlatform,
} from "./claim-fields";
import type { AgencyPlatform } from "./types";

/** Query-param names. One definition, because a link built with
 *  `yc_offer` that a reader looks for under `ycOffer` fails silently. */
export const FILTER_PARAMS = {
  search: "q",
  country: "country",
  sort: "sort",
  budget: "budget",
  platform: "platform",
  startupFriendly: "startup",
  ycOffer: "yc_offer",
  verified: "verified",
} as const;

/** Sentinel for "no country filter". Not a real country name, so it can
 *  never collide with a value derived from the data. */
export const ALL_COUNTRIES_VALUE = "all";

/** Every sort the dropdown can offer. Which of them it actually shows
 *  depends on the data - see `visibleSortModes`. */
export type SortMode =
  | "recommended"
  | "most-awarded"
  | "lowest-budget"
  | "fastest-reply"
  | "rating"
  | "partners-first";

/** The SSR default. Must match the order the server rendered in, which is
 *  `compareByRecommended` - see components/directory/AgencyExplorer.tsx. */
export const DEFAULT_SORT_MODE: SortMode = "recommended";

/** Valid sort values, for narrowing a query-string value. */
const SORT_MODES: readonly SortMode[] = [
  "recommended",
  "most-awarded",
  "lowest-budget",
  "fastest-reply",
  "rating",
  "partners-first",
];

/** Everything the control bar can filter on. */
export interface FilterState {
  search: string;
  country: string;
  sort: SortMode;
  /** A `BudgetFilterOption.value`, e.g. "25000" or "any". */
  budget: string;
  /** Empty means "any platform", never "no platforms". */
  platforms: AgencyPlatform[];
  startupFriendly: boolean;
  ycOffer: boolean;
  verified: boolean;
}

/**
 * The unfiltered state.
 *
 * This is what the server renders and what the client's `useState` starts
 * at, which is the whole SEO contract of the listing page: the first
 * paint, before any effect runs, shows every agency in the server's
 * order. Changing a default here changes what crawlers see.
 *
 * @returns A fresh default state.
 */
export function defaultFilterState(): FilterState {
  return {
    search: "",
    country: ALL_COUNTRIES_VALUE,
    sort: DEFAULT_SORT_MODE,
    budget: BUDGET_FILTER_ANY,
    platforms: [],
    startupFriendly: false,
    ycOffer: false,
    verified: false,
  };
}

/**
 * Narrows a query-string value to a known sort mode.
 *
 * @param value - The raw value.
 * @returns The sort mode, or the default for anything unrecognised.
 */
function toSortMode(value: string | null): SortMode {
  try {
    const normalized = value?.trim().toLowerCase();
    return SORT_MODES.find((mode) => mode === normalized) ?? DEFAULT_SORT_MODE;
  } catch {
    return DEFAULT_SORT_MODE;
  }
}

/**
 * Reads filter state out of a query string.
 *
 * Every field degrades to its default rather than erroring, so a
 * hand-edited or truncated URL shows the full listing instead of an empty
 * one - a shared link that lost a character should still open the page.
 *
 * @param search - A query string, with or without its leading "?".
 * @returns The filter state it describes.
 */
export function readFilterState(search: string | null | undefined): FilterState {
  try {
    const params = new URLSearchParams(search ?? "");
    const platforms = (params.get(FILTER_PARAMS.platform) ?? "")
      .split(",")
      .map((value) => toPlatform(value))
      .filter((platform): platform is AgencyPlatform => platform !== null);

    return {
      search: params.get(FILTER_PARAMS.search)?.slice(0, 120) ?? "",
      country: params.get(FILTER_PARAMS.country) || ALL_COUNTRIES_VALUE,
      sort: toSortMode(params.get(FILTER_PARAMS.sort)),
      budget: findBudgetFilterOption(params.get(FILTER_PARAMS.budget)).value,
      platforms: Array.from(new Set(platforms)),
      startupFriendly: params.get(FILTER_PARAMS.startupFriendly) === "1",
      ycOffer: params.get(FILTER_PARAMS.ycOffer) === "1",
      verified: params.get(FILTER_PARAMS.verified) === "1",
    };
  } catch {
    return defaultFilterState();
  }
}

/**
 * Serialises filter state back into a query string.
 *
 * Only non-default values are written. A URL carrying every filter at its
 * default would be noise in the address bar, would be shared as if it
 * meant something, and would make "is anything filtered?" a string
 * comparison rather than a look.
 *
 * @param state - The current filter state.
 * @returns A query string WITHOUT its leading "?", empty when nothing is
 *          filtered.
 */
export function writeFilterState(state: FilterState): string {
  try {
    const params = new URLSearchParams();
    const defaults = defaultFilterState();
    if (state.search.trim()) params.set(FILTER_PARAMS.search, state.search.trim());
    if (state.country !== defaults.country) params.set(FILTER_PARAMS.country, state.country);
    if (state.sort !== defaults.sort) params.set(FILTER_PARAMS.sort, state.sort);
    if (state.budget !== defaults.budget) params.set(FILTER_PARAMS.budget, state.budget);
    if (state.platforms.length > 0) {
      params.set(FILTER_PARAMS.platform, state.platforms.join(","));
    }
    if (state.startupFriendly) params.set(FILTER_PARAMS.startupFriendly, "1");
    if (state.ycOffer) params.set(FILTER_PARAMS.ycOffer, "1");
    if (state.verified) params.set(FILTER_PARAMS.verified, "1");
    return params.toString();
  } catch {
    return "";
  }
}

/**
 * Whether any filter is set.
 *
 * Sort is excluded: re-ordering a listing is not filtering it, and a
 * "reset filters" button that also snapped the sort back would surprise
 * someone who had only changed the sort.
 *
 * @param state - The current filter state.
 * @returns True when at least one filter is narrowing the listing.
 */
export function hasActiveFilters(state: FilterState): boolean {
  try {
    const defaults = defaultFilterState();
    return (
      state.search.trim().length > 0 ||
      state.country !== defaults.country ||
      state.budget !== defaults.budget ||
      state.platforms.length > 0 ||
      state.startupFriendly ||
      state.ycOffer ||
      state.verified
    );
  } catch {
    return false;
  }
}

/** The per-agency facts the filters read. Satisfied by
 *  `AgencyListItem` on the client and by `EnrichedAgency` on the server,
 *  so one predicate serves both. */
export interface FilterableAgency {
  searchText: string;
  country: string | null;
  minBudgetUsd: number | null;
  platforms: AgencyPlatform[];
  startupFriendly: boolean;
  hasYcOffer: boolean;
  verified: boolean;
}

/**
 * Whether an agency survives the current filters.
 *
 * The budget rule is the one worth reading twice: an agency that never
 * stated a minimum passes ONLY under "Any budget". Including it under
 * "Under $25k" would answer a founder's question about price with a
 * listing that has no price, and push the work of finding that out back
 * onto them. Those listings are not hidden - they are where "Any" leads.
 *
 * @param agency - The agency's filterable facts.
 * @param state - The current filter state.
 * @returns True when the agency should be shown.
 */
export function matchesFilters(agency: FilterableAgency, state: FilterState): boolean {
  try {
    const query = state.search.trim().toLowerCase();
    if (query.length > 0 && !agency.searchText?.includes(query)) return false;

    if (state.country !== ALL_COUNTRIES_VALUE && agency.country !== state.country) return false;

    const budgetOption = findBudgetFilterOption(state.budget);
    if (budgetOption.maxMinBudgetUsd !== null) {
      const minimum = agency.minBudgetUsd;
      if (typeof minimum !== "number") return false;
      if (minimum > budgetOption.maxMinBudgetUsd) return false;
    }

    if (state.platforms.length > 0) {
      const agencyPlatforms = agency.platforms ?? [];
      // ANY, not ALL: a founder ticking Webflow and Framer is saying
      // "either of these is fine", not "must do both".
      const overlaps = state.platforms.some((platform) => agencyPlatforms.includes(platform));
      if (!overlaps) return false;
    }

    if (state.startupFriendly && !agency.startupFriendly) return false;
    if (state.ycOffer && !agency.hasYcOffer) return false;
    if (state.verified && !agency.verified) return false;

    return true;
  } catch {
    return true;
  }
}
