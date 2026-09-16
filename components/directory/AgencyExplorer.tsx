"use client";

// Client-side search/category/country/sort controls over an already
// server-rendered agency list. This file owns ALL interactive state for the
// directory list page; every other piece (nav, hero, the cards themselves)
// stays a server component.
//
// SEO contract this file must not break: the initial render (before any
// user interaction) must show every agency, in the order the server ranked
// them. A client component is server-rendered too, so the HTML a crawler or
// `curl` sees carries every card - as long as the state defaults here are
// the props the server was given. See `initialCategory` below.
//
// The "Top ranked" order is NOT recomputed here. It arrives as
// `AgencyListItem.rank`, stamped by the server in
// `buildAgencyListItems` - the client used to keep a mirror of the ranking
// comparator, and any key added to one side and not the other silently
// reordered the page on hydration.

import { useCallback, useMemo, useRef, useState } from "react";
import AgencyCard from "./AgencyCard";
import styles from "./DirectoryGrid.module.css";
import type { AgencyListItem } from "@/lib/directory/agencies";
// Value imports come from ./constants, never from ./agencies - that module
// imports the agency JSON datasets, and pulling a value out of it here would
// ship the whole directory into the client bundle. See `AgencyListItem`'s
// doc comment in lib/directory/agencies.ts.
import {
  directoryListPath,
  DIRECTORY_ALL_CATEGORIES,
  DIRECTORY_BASE_PATH,
  DIRECTORY_PAGE_SIZE,
} from "@/lib/directory/constants";

/** Sentinel value for "no country filter applied". Not a real country
 *  name, so it can never collide with a value derived from the data. */
const ALL_COUNTRIES_VALUE = "all";
const ALL_COUNTRIES_LABEL = "All countries";
const ALL_CATEGORIES_LABEL = "All categories";

type SortMode = "top-ranked" | "rating" | "name-az";

/** SSR/default mode: the order the server rendered, replayed from
 *  `AgencyListItem.rank`. */
const DEFAULT_SORT_MODE: SortMode = "top-ranked";

/** Label for the rating sort option, shared between `SORT_OPTIONS` and the
 *  option-visibility check in `AgencyExplorer`. */
const RATING_SORT_LABEL = "Client rating";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "top-ranked", label: "Top ranked" },
  { value: "rating", label: RATING_SORT_LABEL },
  { value: "name-az", label: "Name A-Z" },
];

const SEARCH_LABEL = "Search agencies";
/** Names what `AgencyListItem.searchText` actually covers - see
 *  `buildAgencyListItem` in lib/directory/agencies.ts, which folds client,
 *  service, industry and category names into the blob alongside the agency
 *  name, description and location. */
const SEARCH_PLACEHOLDER = "Search agencies, clients, services or locations";
const CLEAR_SEARCH_LABEL = "Clear search";
const CATEGORY_LABEL = "Category";
const COUNTRY_LABEL = "Country";
const SORT_LABEL = "Sort by";
const CLEAR_FILTERS_LABEL = "Clear filters";
const PAGINATION_LABEL = "Pagination";
const PREVIOUS_PAGE_LABEL = "Previous";
const NEXT_PAGE_LABEL = "Next";
/** Rendered in place of the page numbers a window leaves out. */
const PAGE_GAP = "\u2026";
/** Up to this many pages are all listed. Six pages of 60 is where the
 *  directory sits today, and a crawler that can see every page number
 *  reaches every agency profile in one hop from the list rather than
 *  walking "next" five times. */
const PAGES_LISTED_IN_FULL = 8;

/** Past PAGES_LISTED_IN_FULL, how many numbered links flank the current
 *  page before the pager elides. Keeps the control one line wide at any
 *  dataset size. */
const PAGE_WINDOW = 1;
const RESET_LABEL = "Reset filters";
const FILTER_EMPTY_HEADING = "No agencies match your filters";
const FILTER_EMPTY_BODY = "Try a different search term, category or country, or reset your filters.";

/** One entry in the category select, with the count of agencies behind it. */
interface CategoryOption {
  value: string;
  label: string;
}

/**
 * Compares two list items by the server's own ranking, replayed from the
 * `rank` each item was stamped with.
 *
 * This is why the page cannot reorder itself on hydration: there is no
 * second copy of the ranking rules to drift from the server's. Filtering to
 * one category leaves the ranks a subsequence of the same order, which is
 * exactly that category's own ranking - see `getDirectoryAgencyList`.
 *
 * @param itemOne - First agency item being compared.
 * @param itemTwo - Second agency item being compared.
 * @returns Standard comparator sign (see `Array.prototype.sort`).
 */
function compareByServerRank(itemOne: AgencyListItem, itemTwo: AgencyListItem): number {
  try {
    return (itemOne?.rank ?? 0) - (itemTwo?.rank ?? 0);
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
 * Compares two list items for the "Client rating" sort: highest
 * `ratingScore` first (see `getAgencyRatingScore` in
 * lib/directory/agencies.ts), name as a stable tiebreaker. No partner
 * privileging, matching "Name A-Z" - a visitor who explicitly asks to rank
 * by review score wants that score, not partners nudged ahead of it.
 *
 * A record with no rating scores 0 (every Awwwards and D&AD record), so in
 * a mixed list those sink to the bottom rather than being excluded.
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
  "top-ranked": compareByServerRank,
  rating: compareByRatingDescending,
  "name-az": compareByNameAscending,
};

/**
 * Derives the country filter's options from the data itself - never a
 * hardcoded country list, so a new country in the dataset shows up here
 * automatically. Scoped to the active category, since that is the set a
 * visitor can actually reach from here.
 *
 * @param items - The agency list, already narrowed to the active category.
 * @returns Distinct country names, alphabetically sorted.
 */
function buildCountryOptions(items: AgencyListItem[]): string[] {
  try {
    const countries = new Set(
      (items ?? [])
        .map((item) => item?.country)
        .filter((country): country is string => Boolean(country)),
    );
    return Array.from(countries).sort((countryOne, countryTwo) =>
      countryOne.localeCompare(countryTwo),
    );
  } catch {
    return [];
  }
}

/**
 * Writes the active view - category and page - into the address bar
 * without navigating, so it can be linked, shared and reloaded, and so the
 * 308 from a retired `/directory/<category>` route lands somewhere that
 * still reads as that category.
 *
 * `history.replaceState` rather than a router push: the server would
 * re-render and re-send the whole list to move between two views the
 * browser already has the data for. The URL it writes is the same one
 * `directoryListPath` gives the pager's `href`s, so a click and a reload
 * land on the same view.
 *
 * @param categorySlug - The category now selected, or the "all" sentinel.
 * @param page - The 1-based page now shown.
 */
function syncViewToUrl(categorySlug: string, page: number): void {
  try {
    if (typeof window === "undefined") return;
    window.history.replaceState(
      null,
      "",
      directoryListPath(categorySlug, page) || DIRECTORY_BASE_PATH,
    );
  } catch {
    // A blocked or unavailable History API costs the shareable URL and
    // nothing else - the view itself is component state.
  }
}

/**
 * Builds the page numbers a pager renders. Up to `PAGES_LISTED_IN_FULL`
 * they are all listed; past that it elides the middle - first, last, the
 * current page and `PAGE_WINDOW` either side of it - with nulls marking
 * where numbers were left out.
 *
 * @param currentPage - The page being shown.
 * @param pageCount - How many pages there are in total.
 * @returns Page numbers in order, with null for each elided run.
 */
function buildPageWindow(currentPage: number, pageCount: number): Array<number | null> {
  try {
    if (pageCount <= PAGES_LISTED_IN_FULL) {
      return Array.from({ length: pageCount }, (_unused, index) => index + 1);
    }
    const pages = new Set<number>([1, pageCount]);
    for (let offset = -PAGE_WINDOW; offset <= PAGE_WINDOW; offset += 1) {
      const page = currentPage + offset;
      if (page >= 1 && page <= pageCount) pages.add(page);
    }
    const ordered = Array.from(pages).sort((one, two) => one - two);
    const windowed: Array<number | null> = [];
    let previous = 0;
    for (const page of ordered) {
      // A single missing page is printed rather than elided - "1 … 3" is
      // longer than "1 2 3" and tells the reader less.
      if (previous && page - previous > 1) windowed.push(null);
      windowed.push(page);
      previous = page;
    }
    return windowed;
  } catch {
    return [1];
  }
}

/** Empty state shown when the current filter combination matches nothing -
 *  distinct from AgencyGrid's empty state, which covers "no agencies in the
 *  dataset yet" rather than "filters too narrow". */
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

/** The single-row filter toolbar: search cell, then the three selects. */
function ControlsBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  countryFilter,
  onCountryChange,
  countryOptions,
  sortMode,
  onSortChange,
  sortOptions,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: CategoryOption[];
  countryFilter: string;
  onCountryChange: (value: string) => void;
  countryOptions: string[];
  sortMode: SortMode;
  onSortChange: (value: SortMode) => void;
  sortOptions: Array<{ value: SortMode; label: string }>;
}) {
  try {
    return (
      <div className={styles.controls}>
        <div className={styles.searchCell}>
          <svg
            className={styles.searchIcon}
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <label htmlFor="directory-search" className={styles.visuallyHidden}>
            {SEARCH_LABEL}
          </label>
          <input
            id="directory-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label={CLEAR_SEARCH_LABEL}
              className={styles.searchClear}
            >
              ×
            </button>
          )}
        </div>

        <span className={styles.controlsDivider} aria-hidden="true" />

        <div className={styles.selects}>
          <select
            aria-label={CATEGORY_LABEL}
            value={categoryFilter}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={styles.select}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label={COUNTRY_LABEL}
            value={countryFilter}
            onChange={(event) => onCountryChange(event.target.value)}
            className={styles.select}
          >
            <option value={ALL_COUNTRIES_VALUE}>{ALL_COUNTRIES_LABEL}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            aria-label={SORT_LABEL}
            value={sortMode}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
            className={styles.select}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Numbered pager under the grid.
 *
 * Every page is a real `<a href>` built by `directoryListPath`, not a
 * button: those hrefs are what a crawler follows to reach the 263 agency
 * profiles that are not on page one, and what a visitor gets when they
 * middle-click or copy a link. The click handler intercepts them when JS
 * is running, because the browser already has every page's data - see
 * `syncViewToUrl`.
 *
 * @param props - Component props.
 * @param props.page - The page being shown.
 * @param props.pageCount - How many pages the current filters produce.
 * @param props.hrefFor - Builds the URL for a given page.
 * @param props.onSelect - Shows a page without navigating.
 */
function Pager({
  page,
  pageCount,
  hrefFor,
  onSelect,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  onSelect: (page: number) => void;
}) {
  try {
    if (pageCount <= 1) return null;

    /** Intercepts a pager click, leaving modified clicks to the browser so
     *  "open in new tab" still opens the page it points at. */
    const handleClick = (target: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      try {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;
        event.preventDefault();
        onSelect(target);
      } catch {
        // Falling through to the href is the correct failure here.
      }
    };

    return (
      <nav className={styles.pager} aria-label={PAGINATION_LABEL}>
        {page > 1 ? (
          <a
            href={hrefFor(page - 1)}
            onClick={handleClick(page - 1)}
            className={styles.pagerStep}
            rel="prev"
          >
            {PREVIOUS_PAGE_LABEL}
          </a>
        ) : (
          <span className={`${styles.pagerStep} ${styles.pagerStepMuted}`}>
            {PREVIOUS_PAGE_LABEL}
          </span>
        )}

        <span className={styles.pagerPages}>
          {buildPageWindow(page, pageCount).map((target, index) =>
            target === null ? (
              <span key={`gap-${index}`} className={styles.pagerGap} aria-hidden="true">
                {PAGE_GAP}
              </span>
            ) : (
              <a
                key={target}
                href={hrefFor(target)}
                onClick={handleClick(target)}
                aria-current={target === page ? "page" : undefined}
                aria-label={`Page ${target}`}
                className={`${styles.pagerPage}${target === page ? ` ${styles.pagerPageCurrent}` : ""}`}
              >
                {target}
              </a>
            ),
          )}
        </span>

        {page < pageCount ? (
          <a
            href={hrefFor(page + 1)}
            onClick={handleClick(page + 1)}
            className={styles.pagerStep}
            rel="next"
          >
            {NEXT_PAGE_LABEL}
          </a>
        ) : (
          <span className={`${styles.pagerStep} ${styles.pagerStepMuted}`}>
            {NEXT_PAGE_LABEL}
          </span>
        )}
      </nav>
    );
  } catch {
    return null;
  }
}

/**
 * Interactive shell around the agency list: search, category, country and
 * sort, plus a live result count and an empty state when the filters match
 * nothing.
 *
 * Every card it renders comes from an `AgencyListItem` the server built -
 * this component decides which of them to show and in what order, never
 * what a card says. On first paint (before any interaction) that is the
 * full list in the server's order, which is what keeps the page safe for
 * crawlers and internal linking.
 *
 * @param props - Component props.
 * @param props.items - The server's projection of every agency, carrying
 *                       both what a card paints and the `rank` the default
 *                       sort replays - see `buildAgencyListItems`.
 * @param props.categories - The category registry, as select options.
 * @param props.initialCategory - The category the server filtered to,
 *                                 from `?category=`. Must be the state's
 *                                 initial value or the first client render
 *                                 disagrees with the server's HTML.
 * @param props.initialPage - The page the server rendered, from `?page=`.
 *                             Same contract as `initialCategory`.
 */
export default function AgencyExplorer({
  items,
  categories,
  initialCategory = DIRECTORY_ALL_CATEGORIES,
  initialPage = 1,
}: {
  items: AgencyListItem[];
  categories: Array<{ slug: string; title: string }>;
  initialCategory?: string;
  initialPage?: number;
}) {
  // Every hook runs BEFORE the try, not inside it. A throw between two hook
  // calls would leave React having recorded fewer hooks for this render than
  // the last, and the catch returning null hides that until the next render
  // crashes with "rendered fewer hooks than expected". The try still guards
  // the JSX below, which is what it was there for.
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [countryFilter, setCountryFilter] = useState(ALL_COUNTRIES_VALUE);
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE);
  const [page, setPage] = useState(initialPage);
  // Scrolled back to when a page changes. Landing halfway down page two
  // because that is where the click happened is the classic pagination
  // annoyance.
  const topRef = useRef<HTMLDivElement>(null);

  // Memoized rather than `items ?? []` inline: a fresh array literal every
  // render invalidates every useMemo below it, which on a list this size
  // means re-filtering a few hundred items on each keystroke's re-render.
  const safeItems = useMemo(() => items ?? [], [items]);

  // Everything below is derived from the category first: the country
  // options, the counts in the select labels and the "of N" in the count
  // line all describe the slice a visitor is actually looking at.
  const categoryItems = useMemo(() => {
    try {
      if (categoryFilter === DIRECTORY_ALL_CATEGORIES) return safeItems;
      return safeItems.filter((item) => item?.categorySlug === categoryFilter);
    } catch {
      return safeItems;
    }
  }, [safeItems, categoryFilter]);

  const categoryOptions = useMemo(() => {
    try {
      const countFor = (slug: string) =>
        safeItems.filter((item) => item?.categorySlug === slug).length;
      return [
        {
          value: DIRECTORY_ALL_CATEGORIES,
          label: `${ALL_CATEGORIES_LABEL} (${safeItems.length})`,
        },
        ...(categories ?? []).map((category) => ({
          value: category.slug,
          label: `${category.title} (${countFor(category.slug)})`,
        })),
      ];
    } catch {
      return [{ value: DIRECTORY_ALL_CATEGORIES, label: ALL_CATEGORIES_LABEL }];
    }
  }, [safeItems, categories]);

  const countryOptions = useMemo(() => buildCountryOptions(categoryItems), [categoryItems]);

  // The "Client rating" option is hidden when nobody in the current slice
  // has a rating at all (every agency in the web design category, for
  // instance) - a sort mode that can never reorder anything is a dead
  // control, not a real choice. "Top ranked" never gets the same treatment:
  // it is the SSR/default mode, and a <select> whose selected value has no
  // matching <option> renders as an unlabelled blank.
  const sortOptions = useMemo(() => {
    try {
      const hasAnyRating = categoryItems.some((item) => (item?.ratingScore ?? 0) > 0);
      return hasAnyRating
        ? SORT_OPTIONS
        : SORT_OPTIONS.filter((option) => option.value !== "rating");
    } catch {
      return SORT_OPTIONS;
    }
  }, [categoryItems]);

  const visibleItems = useMemo(() => {
    try {
      const query = searchQuery.trim().toLowerCase();
      const filtered = categoryItems.filter((item) => {
        const matchesQuery = query.length === 0 || item?.searchText?.includes(query);
        const matchesCountry =
          countryFilter === ALL_COUNTRIES_VALUE || item?.country === countryFilter;
        return matchesQuery && matchesCountry;
      });
      const comparator = COMPARATORS[sortMode] ?? compareByServerRank;
      return filtered.slice().sort(comparator);
    } catch {
      return [];
    }
  }, [categoryItems, searchQuery, countryFilter, sortMode]);

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / DIRECTORY_PAGE_SIZE));
  // Clamped rather than corrected in state: a filter that shrinks the list
  // under the current page number must not leave the grid empty, and
  // fixing it with an effect would mean a render where it is.
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const pageOffset = (currentPage - 1) * DIRECTORY_PAGE_SIZE;
  const pagedItems = useMemo(
    () => visibleItems.slice(pageOffset, pageOffset + DIRECTORY_PAGE_SIZE),
    [visibleItems, pageOffset],
  );

  /**
   * Switches category, resets the country filter and writes the choice to
   * the URL. Country is reset because its options are category-scoped: a
   * country that exists in web design need not exist in motion design, and
   * keeping a stale value would show an empty grid with no obvious cause.
   */
  const changeCategory = useCallback((value: string) => {
    try {
      setCategoryFilter(value);
      setCountryFilter(ALL_COUNTRIES_VALUE);
      setPage(1);
      syncViewToUrl(value, 1);
    } catch {
      // State setters never throw; the URL sync swallows its own errors.
    }
  }, []);

  /** Clears every control back to its unfiltered default, the URL with it. */
  const resetFilters = useCallback(() => {
    try {
      setSearchQuery("");
      setCategoryFilter(DIRECTORY_ALL_CATEGORIES);
      setCountryFilter(ALL_COUNTRIES_VALUE);
      setSortMode(DEFAULT_SORT_MODE);
      setPage(1);
      syncViewToUrl(DIRECTORY_ALL_CATEGORIES, 1);
    } catch {
      // As above.
    }
  }, []);

  /**
   * Narrowing the list invalidates the page number: page four of a
   * 323-agency list is nowhere in an eight-agency search result. Every
   * control that changes what matches therefore goes back to page one.
   */
  const changeSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const changeCountry = useCallback((value: string) => {
    setCountryFilter(value);
    setPage(1);
  }, []);

  const changeSort = useCallback((value: SortMode) => {
    setSortMode(value);
    setPage(1);
  }, []);

  /** Shows a page and scrolls back to the top of the list. */
  const changePage = useCallback(
    (target: number) => {
      try {
        setPage(target);
        syncViewToUrl(categoryFilter, target);
        topRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      } catch {
        // As above.
      }
    },
    [categoryFilter],
  );

  try {
    const isFiltered =
      searchQuery.trim().length > 0 ||
      categoryFilter !== DIRECTORY_ALL_CATEGORIES ||
      countryFilter !== ALL_COUNTRIES_VALUE ||
      sortMode !== DEFAULT_SORT_MODE;

    // "Showing 61-120 of 323" while there are pages to move between, and
    // the plain "Showing 12 of 60" when everything that matches is already
    // on screen - a range on a single page is noise.
    const countText =
      pageCount > 1
        ? `Showing ${pageOffset + 1}-${pageOffset + pagedItems.length} of ${visibleItems.length} agencies`
        : `Showing ${visibleItems.length} of ${categoryItems.length} agenc${
            categoryItems.length === 1 ? "y" : "ies"
          }`;

    return (
      <div className={styles.stack} ref={topRef}>
        <ControlsBar
          searchQuery={searchQuery}
          onSearchChange={changeSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={changeCategory}
          categoryOptions={categoryOptions}
          countryFilter={countryFilter}
          onCountryChange={changeCountry}
          countryOptions={countryOptions}
          sortMode={sortMode}
          onSortChange={changeSort}
          sortOptions={sortOptions}
        />

        <div className={styles.countRow}>
          <p aria-live="polite" className={styles.count}>
            {countText}
          </p>
          {isFiltered && (
            <button type="button" onClick={resetFilters} className={styles.clearFilters}>
              {CLEAR_FILTERS_LABEL}
            </button>
          )}
        </div>

        {pagedItems.length === 0 ? (
          <FilterEmptyState onReset={resetFilters} />
        ) : (
          <>
            <ul className={styles.grid}>
              {pagedItems.map((item) => (
                <li key={item.slug} className={styles.item}>
                  <AgencyCard item={item} />
                </li>
              ))}
            </ul>
            <Pager
              page={currentPage}
              pageCount={pageCount}
              hrefFor={(target) => directoryListPath(categoryFilter, target)}
              onSelect={changePage}
            />
          </>
        )}
      </div>
    );
  } catch {
    return null;
  }
}
