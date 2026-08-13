"use client";

import { useEffect, useMemo, useState } from "react";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import {
  BUG_BOOK_SORTS,
  sortEntries,
  type BugBookListEntry,
  type BugBookSample,
  type BugBookSort,
} from "@/lib/bug-book";
import BugCard from "./BugCard";
import BugBookCta from "./BugBookCta";
import BugBookSamples from "./BugBookSamples";
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

type Filters = {
  category: string;
  severity: string;
  source: string;
  sort: BugBookSort;
};

const DEFAULT_FILTERS: Filters = {
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
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.severity !== "all") params.set("severity", filters.severity);
  if (filters.source !== "all") params.set("source", filters.source);
  if (filters.sort !== "curated") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.pillGroup} role="group" aria-label={label}>
      <span className={styles.pillGroupLabel}>{label}</span>
      <div className={styles.pills}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={active ? styles.pillActive : styles.pill}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
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

  // Render only categories that are actually present, in taxonomy order.
  const categories = useMemo(() => {
    const seen = new Set(entries.map((entry) => entry.category));
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const filtered = useMemo(() => {
    const matches = entries.filter((entry) => {
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

      <section className={styles.filterSection} aria-label="Filter bugs">
        <div className={styles.filterInner}>
          <PillGroup
            label="Category"
            options={[
              { value: "all", label: "All" },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            value={filters.category}
            onChange={(category) => applyFilters({ ...filters, category })}
          />
          <PillGroup
            label="Severity"
            options={[
              { value: "all", label: "All" },
              ...SEVERITIES.map((severity) => ({
                value: severity,
                label: severity,
              })),
            ]}
            value={filters.severity}
            onChange={(severity) => applyFilters({ ...filters, severity })}
          />
          <PillGroup
            label="Caught by"
            options={[{ value: "all", label: "All" }, ...SOURCES]}
            value={filters.source}
            onChange={(source) => applyFilters({ ...filters, source })}
          />
          <div className={styles.filterFooter}>
            <PillGroup
              label="Sort"
              options={[...BUG_BOOK_SORTS]}
              value={filters.sort}
              onChange={(sort) =>
                applyFilters({ ...filters, sort: sort as BugBookSort })
              }
            />
            <p className={styles.count} aria-live="polite">
              {countLabel}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.gridInner}>
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
      </section>

      <BugBookSamples samples={samples} />

      <BugBookCta />
      <SiteFooter />
    </main>
  );
}
