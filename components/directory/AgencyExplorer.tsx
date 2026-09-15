"use client";

// Client-side search/filter/sort controls over an already server-rendered
// agency list. This file owns ALL interactive state for the directory
// listing page; every other piece (nav, hero, the cards themselves) stays
// a server component.
//
// TWO CONTRACTS THIS FILE MUST NOT BREAK
//
// 1. SEO. The initial render - before any effect runs - must show every
//    agency in the order the server computed. `useState` initialisers are
//    what the server renders, so as long as they are
//    `defaultFilterState()`, that holds automatically. It is also why the
//    URL is read in an EFFECT rather than during render: reading it
//    during render would either mismatch hydration or, with
//    `useSearchParams`, opt this whole subtree out of static rendering
//    and take the card grid out of the server HTML with it.
//
// 2. SORT PARITY. The server sorted with `compareByRecommended` from
//    lib/directory/scoring.ts. So does this file - the same function, not
//    a mirror of it. The previous version kept hand-written copies on
//    both sides with a comment warning they must stay identical; they did
//    not, and the SEO category rendered alphabetically under a heading
//    promising it was ranked on reviews. A shared module cannot drift.
//
// Filters live in the query string so a filtered view can be shared as a
// link. See lib/directory/filters.ts for that contract.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  BUDGET_FILTER_OPTIONS,
  PLATFORM_OPTIONS,
} from "@/lib/directory/claim-fields";
import {
  ALL_COUNTRIES_VALUE,
  defaultFilterState,
  hasActiveFilters,
  matchesFilters,
  readFilterState,
  writeFilterState,
  type FilterState,
  type SortMode,
} from "@/lib/directory/filters";
import {
  compareByAwards,
  compareByFastestReply,
  compareByLowestBudget,
  compareByRecommended,
  type AgencyRankingSignals,
} from "@/lib/directory/scoring";
import type { AgencyPlatform } from "@/lib/directory/types";
// Type-only import: pulling a VALUE out of lib/directory/listing.ts would
// drag the whole scraped dataset into this bundle. See `AgencyListItem`'s
// doc comment there.
import type { AgencyListItem } from "@/lib/directory/listing";
import styles from "./DirectoryGrid.module.css";

const ALL_COUNTRIES_LABEL = "All countries";

const SEARCH_LABEL = "Search agencies";
const SEARCH_PLACEHOLDER = "Search by name, service, client, or platform";
const COUNTRY_LABEL = "Country";
const SORT_LABEL = "Sort by";
const BUDGET_LABEL = "Minimum budget";
const PLATFORM_LABEL = "Platform";
const RESET_LABEL = "Reset filters";
const FILTER_EMPTY_HEADING = "No agencies match your filters";
const FILTER_EMPTY_BODY =
  "Try a wider budget, or clear a filter. Agencies that have not stated a budget only appear under “Any budget”.";

/** Toggle filters, as label + state key. Rendered as a row of pills. */
const TOGGLE_FILTERS: Array<{
  key: "startupFriendly" | "ycOffer" | "verified";
  label: string;
  hint: string;
}> = [
  {
    key: "startupFriendly",
    label: "Startup friendly",
    hint: "Has named a startup client, or takes projects under $25k",
  },
  { key: "ycOffer", label: "YC offer", hint: "Has a standing offer for YC companies" },
  { key: "verified", label: "Verified only", hint: "The agency claimed this listing itself" },
];

/**
 * Which controls this listing has anything to filter on.
 *
 * Every field here is claim-backed, and the directory ships with the
 * claim layer empty: until agencies start claiming, NO listing states a
 * budget, a platform, a reply time or a YC offer. A "Webflow" pill on a
 * page where no agency has said what it builds on is not a filter, it is
 * a trap - it returns an empty grid and reads as a broken feature rather
 * than as missing data.
 *
 * So each control is rendered only when the current list can actually
 * answer it. This is the same rule the sort dropdown already applied to
 * "Client rating" and "Superflow partners first", extended to the
 * filters, and it is self-healing: the controls come back on their own as
 * claims arrive, with no flag to remember to flip.
 */
interface ControlAvailability {
  budget: boolean;
  platforms: boolean;
  responseSla: boolean;
  startupFriendly: boolean;
  ycOffer: boolean;
  verified: boolean;
}

/**
 * Works out which controls have data behind them.
 *
 * @param items - The full agency list for this page.
 * @returns One flag per data-backed control.
 */
function buildAvailability(items: AgencyListItem[]): ControlAvailability {
  try {
    return {
      budget: items.some((item) => typeof item?.minBudgetUsd === "number"),
      platforms: items.some((item) => (item?.platforms?.length ?? 0) > 0),
      responseSla: items.some((item) => typeof item?.responseSlaDays === "number"),
      startupFriendly: items.some((item) => item?.startupFriendly),
      ycOffer: items.some((item) => item?.hasYcOffer),
      verified: items.some((item) => item?.verified),
    };
  } catch {
    // Showing everything is the safe failure: a visitor gets a filter that
    // may match nothing, rather than losing filters that would have worked.
    return {
      budget: true,
      platforms: true,
      responseSla: true,
      startupFriendly: true,
      ycOffer: true,
      verified: true,
    };
  }
}

/**
 * Sort options.
 *
 * "Recommended" is the SSR default, so selecting it always reproduces the
 * page's initial state. Every other mode appears only when the listing
 * actually has the data it sorts on - a sort that cannot reorder anything
 * is a dead control, not a choice. "Lowest minimum budget" and "Fastest
 * reply" are in that set for the same reason the budget and platform
 * filters are: with no claims, every value they read is null, they all
 * fall through to the default comparator, and picking one visibly does
 * nothing.
 *
 * "Recommended" never gets that treatment even when it is degenerate: it
 * is the selected value, and a `<select>` whose selection has no matching
 * `<option>` renders as an unlabelled blank.
 */
const SORT_OPTIONS: Array<{
  value: SortMode;
  label: string;
  needs?: keyof ControlAvailability | "rating" | "partners";
}> = [
  { value: "recommended", label: "Recommended" },
  { value: "most-awarded", label: "Most awarded" },
  { value: "lowest-budget", label: "Lowest minimum budget", needs: "budget" },
  { value: "fastest-reply", label: "Fastest reply", needs: "responseSla" },
  { value: "rating", label: "Client rating", needs: "rating" },
  { value: "partners-first", label: "Superflow partners first", needs: "partners" },
];

/**
 * Highest client rating first, then the default order.
 *
 * No partner privileging and no score: a visitor who explicitly asks to
 * rank by review score wants that score.
 *
 * @param one - First item.
 * @param two - Second item.
 * @returns Standard comparator sign.
 */
function compareByRating(one: AgencyListItem, two: AgencyListItem): number {
  try {
    if (two.ratingScore !== one.ratingScore) return two.ratingScore - one.ratingScore;
    return compareByRecommended(one, two);
  } catch {
    return 0;
  }
}

/**
 * Superflow partners first, then the default order.
 *
 * @param one - First item.
 * @param two - Second item.
 * @returns Standard comparator sign.
 */
function compareByPartners(one: AgencyListItem, two: AgencyListItem): number {
  try {
    const partnerOne = one.isPartner ? 1 : 0;
    const partnerTwo = two.isPartner ? 1 : 0;
    if (partnerTwo !== partnerOne) return partnerTwo - partnerOne;
    return compareByRecommended(one, two);
  } catch {
    return 0;
  }
}

/** Every comparator, keyed by sort mode. The first four come straight
 *  from the shared scoring module the server sorted with. */
const COMPARATORS: Record<
  SortMode,
  (one: AgencyListItem, two: AgencyListItem) => number
> = {
  recommended: compareByRecommended as (one: AgencyRankingSignals, two: AgencyRankingSignals) => number,
  "most-awarded": compareByAwards,
  "lowest-budget": compareByLowestBudget,
  "fastest-reply": compareByFastestReply,
  rating: compareByRating,
  "partners-first": compareByPartners,
};

/**
 * Derives the country filter's options from the data itself, never a
 * hardcoded list, so a new country in the dataset appears automatically.
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
    return Array.from(countries).sort((one, two) => one.localeCompare(two));
  } catch {
    return [];
  }
}

/** Empty state for "filters too narrow" - distinct from AgencyGrid's,
 *  which covers "nothing scraped for this category yet". */
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

/** The search / country / budget / sort row and the toggle pills. */
function ControlsBar({
  state,
  onChange,
  countryOptions,
  sortOptions,
  shows,
  visibleCount,
  totalCount,
  onReset,
}: {
  state: FilterState;
  onChange: (next: Partial<FilterState>, changedKey: string, changedValue: unknown) => void;
  countryOptions: string[];
  sortOptions: typeof SORT_OPTIONS;
  /** Which data-backed controls to render - see `ControlAvailability`. */
  shows: ControlAvailability;
  visibleCount: number;
  totalCount: number;
  onReset: () => void;
}) {
  try {
    const visibleToggles = TOGGLE_FILTERS.filter((toggle) => shows[toggle.key]);

    /** Adds or removes one platform from the multi-select. */
    function togglePlatform(platform: AgencyPlatform) {
      const next = state.platforms.includes(platform)
        ? state.platforms.filter((entry) => entry !== platform)
        : [...state.platforms, platform];
      onChange({ platforms: next }, "platform", next.join(",") || "none");
    }

    return (
      <div className={styles.controls}>
        <div className={styles.controlsRow}>
          <div className={`${styles.field} ${styles.fieldSearch}`}>
            <label htmlFor="directory-search" className={styles.label}>
              {SEARCH_LABEL}
            </label>
            <input
              id="directory-search"
              type="search"
              value={state.search}
              onChange={(event) => onChange({ search: event.target.value }, "search", event.target.value)}
              placeholder={SEARCH_PLACEHOLDER}
              className={styles.control}
            />
          </div>

          {shows.budget && (
            <div className={`${styles.field} ${styles.fieldSelect}`}>
              <label htmlFor="directory-budget" className={styles.label}>
                {BUDGET_LABEL}
              </label>
              <select
                id="directory-budget"
                value={state.budget}
                onChange={(event) =>
                  onChange({ budget: event.target.value }, "budget", event.target.value)
                }
                className={`${styles.control} ${styles.select}`}
              >
                {BUDGET_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={`${styles.field} ${styles.fieldSelect}`}>
            <label htmlFor="directory-country" className={styles.label}>
              {COUNTRY_LABEL}
            </label>
            <select
              id="directory-country"
              value={state.country}
              onChange={(event) => onChange({ country: event.target.value }, "country", event.target.value)}
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
              value={state.sort}
              onChange={(event) =>
                onChange({ sort: event.target.value as SortMode }, "sort", event.target.value)
              }
              className={`${styles.control} ${styles.select}`}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(shows.platforms || visibleToggles.length > 0) && (
          <div className={styles.controlsRow}>
            {shows.platforms && (
              <fieldset className={styles.pillGroup}>
                <legend className={styles.label}>{PLATFORM_LABEL}</legend>
                <div className={styles.pills}>
                  {PLATFORM_OPTIONS.map((option) => {
                    const active = state.platforms.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.pill}${active ? ` ${styles.pillActive}` : ""}`}
                        aria-pressed={active}
                        onClick={() => togglePlatform(option.value)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {visibleToggles.length > 0 && (
              <fieldset className={styles.pillGroup}>
                <legend className={styles.label}>Filters</legend>
                <div className={styles.pills}>
                  {visibleToggles.map((toggle) => {
                    const active = state[toggle.key];
                    return (
                      <button
                        key={toggle.key}
                        type="button"
                        className={`${styles.pill}${active ? ` ${styles.pillActive}` : ""}`}
                        aria-pressed={active}
                        title={toggle.hint}
                        onClick={() => onChange({ [toggle.key]: !active }, toggle.key, !active)}
                      >
                        {toggle.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>
        )}

        <div className={styles.countRow}>
          <p aria-live="polite" className={styles.count}>
            Showing {visibleCount} of {totalCount} agenc{totalCount === 1 ? "y" : "ies"}
          </p>
          {hasActiveFilters(state) && (
            <button type="button" className={styles.resetLink} onClick={onReset}>
              {RESET_LABEL}
            </button>
          )}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Interactive shell around an already server-rendered agency list.
 *
 * `cardsBySlug` holds `<AgencyCard/>` elements built and rendered by the
 * server (components/directory/AgencyGrid.tsx). This component only
 * decides which of those already-built elements to show and in what
 * order; it never re-renders a card's content. That is what keeps the
 * full set of agency links present in the server HTML regardless of
 * filter state.
 *
 * @param props - Component props.
 * @param props.items - Slim per-agency metadata, already in the server's
 *                       order.
 * @param props.cardsBySlug - Pre-rendered card elements, keyed by slug so
 *                             lookups never depend on array position.
 * @param props.categorySlug - The category being rendered, for analytics.
 */
export default function AgencyExplorer({
  items,
  cardsBySlug,
  categorySlug,
}: {
  items: AgencyListItem[];
  cardsBySlug: Record<string, ReactNode>;
  categorySlug: string;
}) {
  // Every hook runs BEFORE the try, never inside it. A throw between two
  // hook calls would leave React having recorded fewer hooks than the
  // previous render, and the catch returning null hides that until the
  // NEXT render crashes with "rendered fewer hooks than expected".
  const [state, setState] = useState<FilterState>(defaultFilterState);
  const { trackEvent } = useAnalytics();
  const hydratedFromUrl = useRef(false);

  // Restore filters from the URL on mount, and only on mount.
  //
  // This sets state from an effect, which `react-hooks/set-state-in-effect`
  // warns about. It is load-bearing here rather than sloppy: the server
  // has to render the UNFILTERED list (see this file's header), so the
  // initial state must be the defaults on both sides of hydration, and
  // the URL can only be applied afterwards. Reading it during render
  // would either mismatch hydration or force the whole subtree dynamic.
  useEffect(() => {
    try {
      if (hydratedFromUrl.current) return;
      hydratedFromUrl.current = true;
      const fromUrl = readFilterState(window.location.search);
      if (writeFilterState(fromUrl).length > 0) setState(fromUrl);
    } catch {
      // A malformed URL just leaves the defaults in place.
    }
  }, []);

  // Memoized rather than `items ?? []` inline: the fallback allocates a
  // new array on every render, which changes the identity every memo
  // below depends on and quietly turns all four of them into no-ops.
  const safeItems = useMemo(() => items ?? [], [items]);

  const countryOptions = useMemo(() => buildCountryOptions(safeItems), [safeItems]);

  /**
   * Which controls to render.
   *
   * A control is shown when the data can answer it OR when the current
   * state already has it set. That second half matters: filters live in
   * the URL, so somebody can open a shared link for a filter this listing
   * no longer has data for - a claim was withdrawn, or the link came from
   * a different category. Hiding its control would leave them staring at
   * an empty grid with no visible cause and nothing to click. Rendering
   * it, switched on, makes the filter legible and clearable.
   */
  const shows = useMemo<ControlAvailability>(() => {
    try {
      const available = buildAvailability(safeItems);
      return {
        budget: available.budget || state.budget !== defaultFilterState().budget,
        platforms: available.platforms || state.platforms.length > 0,
        responseSla: available.responseSla,
        startupFriendly: available.startupFriendly || state.startupFriendly,
        ycOffer: available.ycOffer || state.ycOffer,
        verified: available.verified || state.verified,
      };
    } catch {
      return buildAvailability(safeItems);
    }
  }, [safeItems, state]);

  const sortOptions = useMemo(() => {
    try {
      const hasRating = safeItems.some((item) => (item?.ratingScore ?? 0) > 0);
      const hasPartners = safeItems.some((item) => item?.isPartner);
      return SORT_OPTIONS.filter((option) => {
        // Never hide the option that is currently selected. A `<select>`
        // whose value has no matching `<option>` renders as an
        // unlabelled blank, and the sort mode arrives from the URL, so a
        // shared link can select a mode this listing has no data for.
        if (option.value === state.sort) return true;
        if (!option.needs) return true;
        if (option.needs === "rating") return hasRating;
        if (option.needs === "partners") return hasPartners;
        // Everything else names a key on the availability record, so a
        // sort mode and the filter over the same field can never
        // disagree about whether that field has any data.
        return shows[option.needs];
      });
    } catch {
      return SORT_OPTIONS;
    }
  }, [safeItems, shows, state.sort]);

  const visibleItems = useMemo(() => {
    try {
      const filtered = safeItems.filter((item) => matchesFilters(item, state));
      const comparator = COMPARATORS[state.sort] ?? compareByRecommended;
      return filtered.slice().sort(comparator);
    } catch {
      return [];
    }
  }, [safeItems, state]);

  try {
    /**
     * Applies a change, writes it to the URL, and reports it.
     *
     * The URL is updated with `history.replaceState` rather than a router
     * navigation: this is the same page with a different view of the same
     * data, so it should not create a history entry per keystroke, and it
     * must not trigger a re-fetch of a route whose payload has not
     * changed.
     */
    function applyChange(
      partial: Partial<FilterState>,
      changedKey: string,
      changedValue: unknown,
    ) {
      try {
        const next = { ...state, ...partial };
        setState(next);

        const query = writeFilterState(next);
        const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, "", url);

        trackEvent(AnalyticsEvents.DIRECTORY_FILTER_APPLIED, {
          category: categorySlug,
          filter: changedKey,
          value: changedValue,
        });
      } catch {
        // A failure to write the URL or report the change must not stop
        // the filter itself from applying.
        setState({ ...state, ...partial });
      }
    }

    /** Clears every filter back to the SSR defaults, sort included. */
    function resetFilters() {
      try {
        setState(defaultFilterState());
        window.history.replaceState(null, "", window.location.pathname);
        trackEvent(AnalyticsEvents.DIRECTORY_FILTER_APPLIED, {
          category: categorySlug,
          filter: "reset",
          value: "all",
        });
      } catch {
        setState(defaultFilterState());
      }
    }

    return (
      <div className={styles.stack}>
        <ControlsBar
          state={state}
          onChange={applyChange}
          countryOptions={countryOptions}
          sortOptions={sortOptions}
          shows={shows}
          visibleCount={visibleItems.length}
          totalCount={safeItems.length}
          onReset={resetFilters}
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
