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
import type { AgencyListItem } from "@/lib/directory/agencies";

/** Sentinel value for "no country filter applied". Not a real country
 *  name, so it can never collide with a value derived from the data. */
const ALL_COUNTRIES_VALUE = "all";
const ALL_COUNTRIES_LABEL = "All countries";

type SortMode = "award-total" | "name-az" | "partners-first";
const DEFAULT_SORT_MODE: SortMode = "award-total";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "award-total", label: "Award total" },
  { value: "name-az", label: "Name A-Z" },
  { value: "partners-first", label: "Partners first" },
];

const SEARCH_LABEL = "Search agencies";
const SEARCH_PLACEHOLDER = "Search by name, service, or location";
const COUNTRY_LABEL = "Country";
const SORT_LABEL = "Sort by";
const RESET_LABEL = "Reset filters";
const FILTER_EMPTY_HEADING = "No agencies match your filters";
const FILTER_EMPTY_BODY = "Try a different search term or country, or reset your filters.";

const LABEL_STYLE = {
  fontFamily: "var(--font-urbanist)",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(10,10,10,0.6)",
} as const;

const CONTROL_STYLE = {
  fontFamily: "var(--font-urbanist)",
  fontSize: 14,
} as const;

const CONTROL_CLASS =
  "rounded-[10px] border border-black/15 bg-white px-3 py-2 text-black outline-none focus:border-black/40";

/**
 * Compares two list items for the "Award total" sort (also the SSR
 * default order, so selecting it in the dropdown always reproduces the
 * page's initial state): Superflow partners first, then award total
 * descending, then name.
 *
 * @param itemOne - First agency item being compared.
 * @param itemTwo - Second agency item being compared.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
function compareByAwardTotalDefault(itemOne: AgencyListItem, itemTwo: AgencyListItem): number {
  try {
    const partnerOne = itemOne.isPartner ? 1 : 0;
    const partnerTwo = itemTwo.isPartner ? 1 : 0;
    if (partnerTwo !== partnerOne) return partnerTwo - partnerOne;
    if (itemTwo.awardTotal !== itemOne.awardTotal) return itemTwo.awardTotal - itemOne.awardTotal;
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

const COMPARATORS: Record<SortMode, (itemOne: AgencyListItem, itemTwo: AgencyListItem) => number> = {
  "award-total": compareByAwardTotalDefault,
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
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-black/10 px-6 py-16 text-center">
        <p className="text-black" style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 18 }}>
          {FILTER_EMPTY_HEADING}
        </p>
        <p
          className="max-w-[420px]"
          style={{ fontFamily: "var(--font-urbanist)", fontSize: 14, color: "rgba(10,10,10,0.55)" }}
        >
          {FILTER_EMPTY_BODY}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="rounded-[var(--radius-pill)] bg-black px-4 py-2 text-white transition-colors hover:bg-black/85"
          style={{ fontFamily: "var(--font-poppins)", fontSize: 13, fontWeight: 600 }}
        >
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
  visibleCount: number;
  totalCount: number;
}) {
  try {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-black/10 bg-[#fafafa] p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <label htmlFor="directory-search" style={LABEL_STYLE}>
            {SEARCH_LABEL}
          </label>
          <input
            id="directory-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className={CONTROL_CLASS}
            style={CONTROL_STYLE}
          />
        </div>

        <div className="flex min-w-[160px] flex-col gap-1.5">
          <label htmlFor="directory-country" style={LABEL_STYLE}>
            {COUNTRY_LABEL}
          </label>
          <select
            id="directory-country"
            value={countryFilter}
            onChange={(event) => onCountryChange(event.target.value)}
            className={CONTROL_CLASS}
            style={CONTROL_STYLE}
          >
            <option value={ALL_COUNTRIES_VALUE}>{ALL_COUNTRIES_LABEL}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[160px] flex-col gap-1.5">
          <label htmlFor="directory-sort" style={LABEL_STYLE}>
            {SORT_LABEL}
          </label>
          <select
            id="directory-sort"
            value={sortMode}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
            className={CONTROL_CLASS}
            style={CONTROL_STYLE}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p
          aria-live="polite"
          className="text-black sm:ml-auto"
          style={{ fontFamily: "var(--font-urbanist)", fontSize: 13, color: "rgba(10,10,10,0.55)" }}
        >
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
 *                       already in the default (partner-first,
 *                       award-total-descending) order.
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

    const visibleItems = useMemo(() => {
      try {
        const query = searchQuery.trim().toLowerCase();
        const filtered = safeItems.filter((item) => {
          const matchesQuery = query.length === 0 || item?.searchText?.includes(query);
          const matchesCountry =
            countryFilter === ALL_COUNTRIES_VALUE || item?.country === countryFilter;
          return matchesQuery && matchesCountry;
        });
        const comparator = COMPARATORS[sortMode] ?? compareByAwardTotalDefault;
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
      <div className="flex flex-col gap-6">
        <ControlsBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          countryFilter={countryFilter}
          onCountryChange={setCountryFilter}
          countryOptions={countryOptions}
          sortMode={sortMode}
          onSortChange={setSortMode}
          visibleCount={visibleItems.length}
          totalCount={safeItems.length}
        />

        {visibleItems.length === 0 ? (
          <FilterEmptyState onReset={resetFilters} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <div key={item.slug}>{cardsBySlug?.[item.slug] ?? null}</div>
            ))}
          </div>
        )}
      </div>
    );
  } catch {
    return null;
  }
}
