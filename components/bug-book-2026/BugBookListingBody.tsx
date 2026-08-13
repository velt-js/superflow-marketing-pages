"use client";

import { useEffect, useMemo, useState } from "react";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import {
  BUG_BOOK_SORTS,
  sortEntries,
  vibeMeta,
  type BugBookListEntry,
  type BugBookSample,
  type BugBookSort,
} from "@/lib/bug-book";
import BugCard from "./BugCard";
import BugBookCta from "./BugBookCta";
import BugBookSamples from "./BugBookSamples";
import ClapbackFiles from "./ClapbackFiles";
import BugBookFilters, { type BugFilters } from "./BugBookFilters";
import styles from "./BugBookListingBody.module.css";

const HERO_KICKER = "THE SUPERFLOW BUG BOOK";
const HERO_HEADLINE = "The Bug Book";
const HERO_SUBHEAD =
  "Real bugs, rage clicks, and typos caught in Superflow reviews - by humans and by our AI agents - before users ever saw them. Names removed. Screenshots redacted. Shame preserved.";
const EMPTY_STATE_TEXT = "No bugs match. A rare clean build.";
const RESET_LABEL = "Reset filters";

const SEVERITIES = ["Critical", "High", "Medium", "Mild"];

const SOURCES = [
  { value: "human", label: "Human review" },
  { value: "agent", label: "Superflow Agent" },
];

type Filters = BugFilters & { sort: BugBookSort };

const DEFAULT_FILTERS: Filters = {
  vibe: "all",
  category: "all",
  severity: "all",
  source: "all",
  sort: "curated",
};

const SORT_VALUES = BUG_BOOK_SORTS.map((sort) => sort.value);

/** Parse filter state out of a query string; unknown values fall back to defaults. */
function filtersFromSearch(search: string): Filters {
  const params = new URLSearchParams(search);
  const sortParam = params.get("sort") as BugBookSort | null;
  return {
    vibe: params.get("vibe") ?? DEFAULT_FILTERS.vibe,
    category: params.get("category") ?? DEFAULT_FILTERS.category,
    severity: params.get("severity") ?? DEFAULT_FILTERS.severity,
    source: params.get("source") ?? DEFAULT_FILTERS.source,
    sort:
      sortParam && SORT_VALUES.includes(sortParam)
        ? sortParam
        : DEFAULT_FILTERS.sort,
  };
}

/** Serialize non-default filters into a query string ("" when all default). */
function searchFromFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.vibe !== "all") params.set("vibe", filters.vibe);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.severity !== "all") params.set("severity", filters.severity);
  if (filters.source !== "all") params.set("source", filters.source);
  if (filters.sort !== "curated") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Chips for whatever is currently filtering the list. Filters persist
 * across a detail-page round trip, so without this a returning reader
 * just sees a shorter grid with no explanation - and the rail's ticks
 * can easily be scrolled out of view.
 */
function ActiveFilters({
  filters,
  onClear,
  onClearAll,
}: {
  filters: Filters;
  onClear: (axis: keyof BugFilters) => void;
  onClearAll: () => void;
}) {
  const chips: { axis: keyof BugFilters; label: string }[] = [];
  if (filters.vibe !== "all") {
    const meta = vibeMeta(filters.vibe);
    chips.push({
      axis: "vibe",
      label: meta ? `${meta.emoji} ${meta.label}` : filters.vibe,
    });
  }
  if (filters.source !== "all") {
    chips.push({
      axis: "source",
      label:
        filters.source === "agent" ? "Superflow Agent" : "Human review",
    });
  }
  if (filters.severity !== "all") {
    chips.push({ axis: "severity", label: filters.severity });
  }
  if (filters.category !== "all") {
    chips.push({ axis: "category", label: filters.category });
  }
  if (chips.length === 0) return null;

  return (
    <div className={styles.activeFilters}>
      <span className={styles.activeLabel}>Filtered by</span>
      {chips.map((chip) => (
        <button
          key={chip.axis}
          type="button"
          className={styles.activeChip}
          onClick={() => onClear(chip.axis)}
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <span className={styles.activeChipX} aria-hidden="true">
            ×
          </span>
        </button>
      ))}
      <button
        type="button"
        className={styles.clearAll}
        onClick={onClearAll}
      >
        Clear all
      </button>
    </div>
  );
}

/** Compact segmented control for the sort axis. */
function SortControl({
  value,
  onChange,
}: {
  value: BugBookSort;
  onChange: (value: BugBookSort) => void;
}) {
  return (
    <div className={styles.sortControl} role="group" aria-label="Sort">
      <span className={styles.sortLabel}>Sort</span>
      {BUG_BOOK_SORTS.map((sort) => (
        <button
          key={sort.value}
          type="button"
          className={sort.value === value ? styles.sortActive : styles.sort}
          aria-pressed={sort.value === value}
          onClick={() => onChange(sort.value)}
        >
          {sort.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Full presentation layer for /bug-book: hero on the shared blue gradient,
 * three pill-group filters + sort (AND-ed together, synced to query params
 * so the detail pages' back link preserves them), the card grid, the
 * samples band, the CTA band, and SiteNav/SiteFooter. Entries arrive
 * pre-sorted in curated order; samples are never filtered or sorted.
 */
export default function BugBookListingBody({
  entries,
  samples = [],
}: {
  entries: BugBookListEntry[];
  /** Illustrative reports for the separate "New agents on the beat" band. */
  samples?: BugBookSample[];
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  // Desktop shows the rail always; this only drives the narrow-screen
  // disclosure, so the grid stays the first thing you see on a phone.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Initial state comes from the URL (e.g. returning from a detail page).
  // Read on mount instead of useSearchParams so the page stays fully static.
  useEffect(() => {
    if (window.location.search) {
      setFilters(filtersFromSearch(window.location.search));
    }
  }, []);

  // Reflect filter changes into the URL without adding history entries.
  const applyFilters = (next: Filters) => {
    setFilters(next);
    const query = searchFromFilters(next);
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  };

  const filtered = useMemo(() => {
    const matches = entries.filter((entry) => {
      if (filters.vibe !== "all" && entry.vibe !== filters.vibe) return false;
      if (filters.category !== "all" && entry.category !== filters.category)
        return false;
      if (filters.severity !== "all" && entry.severity !== filters.severity)
        return false;
      if (filters.source !== "all" && entry.source !== filters.source)
        return false;
      return true;
    });
    return sortEntries(matches, filters.sort);
  }, [entries, filters]);

  const countLabel = `${filtered.length} ${filtered.length === 1 ? "bug" : "bugs"}`;
  const isDirty =
    filters.vibe !== "all" ||
    filters.category !== "all" ||
    filters.severity !== "all" ||
    filters.source !== "all";

  return (
    <main className={styles.page}>
      <SiteNav />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{HERO_KICKER}</p>
          <h1 className={styles.headline}>{HERO_HEADLINE}</h1>
          <p className={styles.subhead}>{HERO_SUBHEAD}</p>
        </div>
      </section>

      <ClapbackFiles entries={entries} />

      <section className={styles.layout}>
        <div className={styles.layoutInner}>
          <aside className={styles.sidebar}>
            <button
              type="button"
              className={styles.filterToggle}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              {filtersOpen ? "Hide filters" : "Show filters"}
              <span className={styles.filterToggleCount}>{countLabel}</span>
            </button>
            <div
              className={filtersOpen ? styles.sidebarInner : styles.sidebarClosed}
            >
              <BugBookFilters
                entries={entries}
                filters={filters}
                onChange={(next) => applyFilters({ ...next, sort: filters.sort })}
                onReset={() => applyFilters(DEFAULT_FILTERS)}
                isDirty={isDirty}
              />
            </div>
          </aside>

          <div className={styles.results}>
            <ActiveFilters
              filters={filters}
              onClear={(axis) => applyFilters({ ...filters, [axis]: "all" })}
              onClearAll={() =>
                applyFilters({ ...DEFAULT_FILTERS, sort: filters.sort })
              }
            />

            <div className={styles.resultsBar}>
              <p className={styles.count} aria-live="polite">
                {countLabel}
              </p>
              <SortControl
                value={filters.sort}
                onChange={(sort) => applyFilters({ ...filters, sort })}
              />
            </div>

            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>{EMPTY_STATE_TEXT}</p>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => applyFilters(DEFAULT_FILTERS)}
                >
                  {RESET_LABEL}
                </button>
              </div>
            ) : (
              <ul className={styles.grid}>
                {filtered.map((entry) => (
                  <li key={entry._id} className={styles.item}>
                    <BugCard entry={entry} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <BugBookSamples samples={samples} />

      <BugBookCta />
      <SiteFooter />
    </main>
  );
}
