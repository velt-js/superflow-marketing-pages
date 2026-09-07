"use client";

// Client-side search/country/sort controls over an already server-rendered
// agency list. This file owns ALL interactive state for the directory
// listing page; every other piece (Nav, hero, the cards themselves) stays
// a server component.
//
// SEO contract this file must not break: the initial render (before any
// user interaction) must show every agency, in the same order the server
// computed. Since useState's initial values are what the server renders,
// as long as the defaults here reproduce "no filters, default sort" that
// contract holds automatically - see the DEFAULT_* constants below and
// components/directory/AgencyGrid.tsx, which builds `cardsBySlug` from
// server-rendered <AgencyCard/> elements and passes them in, so nothing
// here re-renders a card's own content client-side.

import { useMemo, useState, type ReactNode } from "react";
import styles from "./DirectoryGrid.module.css";
import type { AgencyListItem } from "@/lib/directory/agencies";

/** Sentinel value for "no country filter applied". Not a real country
 *  name, so it can never collide with a value derived from the data. */
const ALL_COUNTRIES_VALUE = "all";
const ALL_COUNTRIES_LABEL = "All countries";

type SortMode = "top-ranked" | "rating" | "name-az" | "partners-first";

/**
 * SSR/default mode. Its comparator must stay a mirror of
 * `compareAgenciesDefaultOrder` in lib/directory/agencies.ts, which is what
 * the server sorted by before handing these items over - if the two drift,
 * the client's initial sort silently reorders the page away from the order
 * the server rendered and the category's own ItemList JSON-LD claims.
 *
 * It was previously "award-total", ranking on awards alone. That was a
 * mirror while every record came from Awwwards, but the SEO category's
 * records all score 0 on awards, so the mode fell through to its name
 * tiebreaker and rendered that whole category alphabetically - under a
 * heading promising agencies "ranked on their published client reviews".
 */
const DEFAULT_SORT_MODE: SortMode = "top-ranked";

/** Label for the rating sort option, shared between `SORT_OPTIONS` and the
 *  option-visibility check in `AgencyExplorer`. */
const RATING_SORT_LABEL = "Client rating";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "top-ranked", label: "Top ranked" },
  { value: "rating", label: RATING_SORT_LABEL },
  { value: "name-az", label: "Name A-Z" },
  { value: "partners-first", label: "Partners first" },
];

const SEARCH_LABEL = "Search agencies";
/** Names the fields `AgencyListItem.searchText` actually covers - see
 *  `buildAgencyListItem` in lib/directory/agencies.ts, which folds service
 *  and industry names into the blob alongside name, description, location
 *  and client names. A visitor searching "link building" or "ecommerce"
 *  should find a match, not just one searching by agency or client name. */
const SEARCH_PLACEHOLDER = "Search by name, service, client, or location";
const COUNTRY_LABEL = "Country";
const SORT_LABEL = "Sort by";
const RESET_LABEL = "Reset filters";
const FILTER_EMPTY_HEADING = "No agencies match your filters";
const FILTER_EMPTY_BODY = "Try a different search term or country, or reset your filters.";

/**
 * Compares two list items for the "Top ranked" sort (also the SSR default
 * order, so selecting it in the dropdown always reproduces the page's
 * initial state): Superflow partners first, then award total descending,
 * then review score descending, then name.
 *
 * **This is a mirror of `compareAgenciesDefaultOrder` in
 * lib/directory/agencies.ts and must be kept identical to it.** The server
 * sorts with that one; this sorts the same list again on the client. Any
 * key present in one and missing from the other makes the page reorder
 * itself on hydration.
 *
 * The two credibility keys never compete inside one category - an Awwwards
 * record has no rating and a Semrush record has no awards - so in practice
 * this ranks web design by awards and SEO by reviews, off one comparator.
 *
 * @param itemOne - First agency item being compared.
 * @param itemTwo - Second agency item being compared.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
function compareByDirectoryRanking(itemOne: AgencyListItem, itemTwo: AgencyListItem): number {
  try {
    const partnerOne = itemOne.isPartner ? 1 : 0;
    const partnerTwo = itemTwo.isPartner ? 1 : 0;
    if (partnerTwo !== partnerOne) return partnerTwo - partnerOne;
    if (itemTwo.awardTotal !== itemOne.awardTotal) return itemTwo.awardTotal - itemOne.awardTotal;
    if (itemTwo.ratingScore !== itemOne.ratingScore) {
      return itemTwo.ratingScore - itemOne.ratingScore;
    }
    return itemOne.name.localeCompare(itemTwo.name);
  } catch {
    return 0;
  }
}

/**
 * Compares two list items alphabetically by name, with no partner
 * privileging - a visitor who explicitly asks for "Name A-Z" wants literal
 * alphabetical order.
 *
 * @param itemOne - First agency item being compared.
 * @param itemTwo - Second agency item being compared.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
function compareByNameAscending(itemOne: AgencyListItem, itemTwo: AgencyListItem): number {
  try {
    return itemOne.name.localeCompare(itemTwo.name);
  } catch {
    return 0;
  }
}

/**
 * Compares two list items with partner status as the sole meaningful
 * key (name as a stable tiebreaker only). Distinct from the "Award total"
 * comparator, which also privileges partners but ranks by award count
 * within each group - this mode is for browsing partners specifically,
 * not for ranking by prestige.
 *
 * @param itemOne - First agency item being compared.
 * @param itemTwo - Second agency item being compared.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
function compareByPartnersFirst(itemOne: AgencyListItem, itemTwo: AgencyListItem): number {
  try {
    const partnerOne = itemOne.isPartner ? 1 : 0;
    const partnerTwo = itemTwo.isPartner ? 1 : 0;
    if (partnerTwo !== partnerOne) return partnerTwo - partnerOne;
    return itemOne.name.localeCompare(itemTwo.name);
  } catch {
    return 0;
  }
}

/**
 * Compares two list items for the "Client rating" sort: highest
 * `ratingScore` first (see `getAgencyRatingScore` in
 * lib/directory/agencies.ts), name as a stable tiebreaker. No partner
 * privileging, matching "Name A-Z" - a visitor who explicitly asks to
 * rank by review score wants that score, not partners nudged ahead of it.
 *
 * An Awwwards record's `ratingScore` is always 0 (it has no rating at
 * all), so within a mixed-source list those records simply sink to the
 * bottom rather than being excluded from the sort.
 *
 * @param itemOne - First agency item being compared.
 * @param itemTwo - Second agency item being compared.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
function compareByRatingDescending(itemOne: AgencyListItem, itemTwo: AgencyListItem): number {
  try {
    if (itemTwo.ratingScore !== itemOne.ratingScore) {
      return itemTwo.ratingScore - itemOne.ratingScore;
    }
    return itemOne.name.localeCompare(itemTwo.name);
  } catch {
    return 0;
  }
}

const COMPARATORS: Record<SortMode, (itemOne: AgencyListItem, itemTwo: AgencyListItem) => number> = {
  "top-ranked": compareByDirectoryRanking,
  rating: compareByRatingDescending,
  "name-az": compareByNameAscending,
  "partners-first": compareByPartnersFirst,
};

/**
 * Derives the country filter's option list from the data itself - never
 * a hardcoded country list, so a new country in the dataset shows up here
 * automatically.
 *
 * @param items - The full agency list for this page.
 * @returns Distinct country names, alphabetically sorted.
 */
function buildCountryOptions(items: AgencyListItem[]): string[] {
  try {
    const countries = new Set(
      (items ?? [])
        .map((item) => item?.country)
        .filter((country): country is string => Boolean(country)),
    );
    return Array.from(countries).sort((countryOne, countryTwo) => countryOne.localeCompare(countryTwo));
  } catch {
    return [];
  }
}

/** Empty state shown when the current search/country combination matches
 *  nothing - distinct from AgencyGrid's empty state, which covers "no
 *  agencies scraped for this category yet" rather than "filters too
 *  narrow". Includes a reset action per the control-set requirement. */
function FilterEmptyState({ onReset }: { onReset: () => void }) {
  try {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyHeading}>{FILTER_EMPTY_HEADING}</p>
        <p className={styles.emptyBody}>{FILTER_EMPTY_BODY}</p>
        <button type="button" onClick={onReset} className={styles.emptyAction}>
          {RESET_LABEL}
        </button>
      </div>
    );
  } catch {
    return null;
  }
}

/** Search input, country select, sort select, and a live result count. */
function ControlsBar({
  searchQuery,
  onSearchChange,
  countryFilter,
  onCountryChange,
  countryOptions,
  sortMode,
  onSortChange,
  sortOptions,
  visibleCount,
  totalCount,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  countryFilter: string;
  onCountryChange: (value: string) => void;
  countryOptions: string[];
  sortMode: SortMode;
  onSortChange: (value: SortMode) => void;
  sortOptions: Array<{ value: SortMode; label: string }>;
  visibleCount: number;
  totalCount: number;
}) {
  try {
    return (
      <div className={styles.controls}>
        <div className={`${styles.field} ${styles.fieldSearch}`}>
          <label htmlFor="directory-search" className={styles.label}>
            {SEARCH_LABEL}
          </label>
          <input
            id="directory-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className={styles.control}
          />
        </div>

        <div className={`${styles.field} ${styles.fieldSelect}`}>
          <label htmlFor="directory-country" className={styles.label}>
            {COUNTRY_LABEL}
          </label>
          <select
            id="directory-country"
            value={countryFilter}
            onChange={(event) => onCountryChange(event.target.value)}
            className={`${styles.control} ${styles.select}`}
          >
            <option value={ALL_COUNTRIES_VALUE}>{ALL_COUNTRIES_LABEL}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.field} ${styles.fieldSelect}`}>
          <label htmlFor="directory-sort" className={styles.label}>
            {SORT_LABEL}
          </label>
          <select
            id="directory-sort"
            value={sortMode}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
            className={`${styles.control} ${styles.select}`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p aria-live="polite" className={styles.count}>
          Showing {visibleCount} of {totalCount} agenc{totalCount === 1 ? "y" : "ies"}
        </p>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Interactive shell around an already server-rendered agency list: search,
 * country filter, and sort, plus a live result count and a proper empty
 * state when filters match nothing.
 *
 * `cardsBySlug` holds `<AgencyCard/>` elements built and rendered by the
 * server (see components/directory/AgencyGrid.tsx) - this component only
 * decides which of those already-built elements to show and in what
 * order. It never re-renders a card's own content, and on first paint
 * (before any interaction) it shows every agency in the default order,
 * which is what keeps this safe for crawlers and internal linking: the
 * server HTML for that first paint already contains every card.
 *
 * @param props - Component props.
 * @param props.items - Slim per-agency metadata for filtering/sorting,
 *                       already in the directory's default order
 *                       (partners, then awards, then review score, then
 *                       name) - see `compareByDirectoryRanking`.
 * @param props.cardsBySlug - Pre-rendered card elements, keyed by
 *                             `Agency.slug` so lookups never depend on
 *                             array position.
 */
export default function AgencyExplorer({
  items,
  cardsBySlug,
}: {
  items: AgencyListItem[];
  cardsBySlug: Record<string, ReactNode>;
}) {
  try {
    const [searchQuery, setSearchQuery] = useState("");
    const [countryFilter, setCountryFilter] = useState(ALL_COUNTRIES_VALUE);
    const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE);

    const safeItems = items ?? [];
    const countryOptions = useMemo(() => buildCountryOptions(safeItems), [safeItems]);
    // The "Client rating" option is hidden when nobody in this list has a
    // rating at all (every agency in a pure web-design category, for
    // instance) - a sort mode that can never reorder anything is a dead
    // control, not a real choice. "Award total" never gets the same
    // treatment even though the symmetric case exists (a pure SEO
    // category, where every award total is 0): it is the SSR/default
    // mode, and a <select> whose selected value has no matching <option>
    // renders as an unlabelled blank, which is worse than an option that
    // does nothing.
    const sortOptions = useMemo(() => {
      try {
        const hasAnyRating = safeItems.some((item) => (item?.ratingScore ?? 0) > 0);
        return hasAnyRating
          ? SORT_OPTIONS
          : SORT_OPTIONS.filter((option) => option.value !== "rating");
      } catch {
        return SORT_OPTIONS;
      }
    }, [safeItems]);

    const visibleItems = useMemo(() => {
      try {
        const query = searchQuery.trim().toLowerCase();
        const filtered = safeItems.filter((item) => {
          const matchesQuery = query.length === 0 || item?.searchText?.includes(query);
          const matchesCountry =
            countryFilter === ALL_COUNTRIES_VALUE || item?.country === countryFilter;
          return matchesQuery && matchesCountry;
        });
        const comparator = COMPARATORS[sortMode] ?? compareByDirectoryRanking;
        return filtered.slice().sort(comparator);
      } catch {
        return [];
      }
    }, [safeItems, searchQuery, countryFilter, sortMode]);

    /**
     * Clears search, country, and sort back to their SSR-matching
     * defaults. Wrapped in try/catch per repo convention even though
     * useState setters cannot themselves throw.
     */
    function resetFilters() {
      try {
        setSearchQuery("");
        setCountryFilter(ALL_COUNTRIES_VALUE);
        setSortMode(DEFAULT_SORT_MODE);
      } catch {
        // No-op: state setters never throw.
      }
    }

    return (
      <div className={styles.stack}>
        <ControlsBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          countryFilter={countryFilter}
          onCountryChange={setCountryFilter}
          countryOptions={countryOptions}
          sortMode={sortMode}
          onSortChange={setSortMode}
          sortOptions={sortOptions}
          visibleCount={visibleItems.length}
          totalCount={safeItems.length}
        />

        {visibleItems.length === 0 ? (
          <FilterEmptyState onReset={resetFilters} />
        ) : (
          <ul className={styles.grid}>
            {visibleItems.map((item) => (
              <li key={item.slug} className={styles.item}>
                {cardsBySlug?.[item.slug] ?? null}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  } catch {
    return null;
  }
}
