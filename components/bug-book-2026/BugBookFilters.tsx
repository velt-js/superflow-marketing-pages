"use client";

import { BUG_BOOK_VIBES, type BugBookListEntry } from "@/lib/bug-book";
import styles from "./BugBookFilters.module.css";

// Filters live in a sticky left rail rather than stacked pill rows across
// the top: with four axes and a dozen categories the horizontal version
// pushed the actual bugs below the fold. Each option carries a live count
// computed against the OTHER active filters (standard faceting), so you
// can see what a click will do before you make it.

export type BugFilters = {
  vibe: string;
  category: string;
  severity: string;
  source: string;
};

const SEVERITIES = ["Critical", "High", "Medium", "Mild"];

const SOURCES = [
  { value: "human", label: "Human review" },
  { value: "agent", label: "Superflow Agent" },
];

type Axis = keyof BugFilters;

/** Entries matching every active filter except the one being counted. */
function matchesExcept(
  entry: BugBookListEntry,
  filters: BugFilters,
  except: Axis,
): boolean {
  if (except !== "vibe" && filters.vibe !== "all" && entry.vibe !== filters.vibe)
    return false;
  if (
    except !== "category" &&
    filters.category !== "all" &&
    entry.category !== filters.category
  )
    return false;
  if (
    except !== "severity" &&
    filters.severity !== "all" &&
    entry.severity !== filters.severity
  )
    return false;
  if (
    except !== "source" &&
    filters.source !== "all" &&
    entry.source !== filters.source
  )
    return false;
  return true;
}

function countFor(
  entries: BugBookListEntry[],
  filters: BugFilters,
  axis: Axis,
  value: string,
  read: (entry: BugBookListEntry) => string | undefined,
): number {
  return entries.filter(
    (entry) =>
      matchesExcept(entry, filters, axis) &&
      (value === "all" || read(entry) === value),
  ).length;
}

/** Marks the selected option. The slot is reserved on every row, so
    labels don't shift sideways as the selection moves. */
function TickIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M1.75 6.25 4.5 9l5.75-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterGroup({
  label,
  axis,
  options,
  filters,
  entries,
  read,
  onChange,
}: {
  label: string;
  axis: Axis;
  options: { value: string; label: string }[];
  filters: BugFilters;
  entries: BugBookListEntry[];
  read: (entry: BugBookListEntry) => string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <p className={styles.groupLabel}>{label}</p>
      <ul className={styles.options}>
        {options.map((option) => {
          const active = filters[axis] === option.value;
          const count = countFor(entries, filters, axis, option.value, read);
          const empty = count === 0 && !active;
          return (
            <li key={option.value}>
              <button
                type="button"
                className={active ? styles.optionActive : styles.option}
                aria-pressed={active}
                disabled={empty}
                onClick={() => onChange(option.value)}
              >
                <span className={styles.tick} aria-hidden="true">
                  {active ? <TickIcon /> : null}
                </span>
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionCount}>{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The filter rail. Sticky beside the grid on desktop; on narrow screens
 * the parent collapses it behind a disclosure so it never buries the
 * cards.
 */
export default function BugBookFilters({
  entries,
  filters,
  onChange,
  onReset,
  isDirty,
}: {
  entries: BugBookListEntry[];
  filters: BugFilters;
  onChange: (next: BugFilters) => void;
  onReset: () => void;
  isDirty: boolean;
}) {
  const categories = [...new Set(entries.map((entry) => entry.category))].sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <div className={styles.rail}>
      <div className={styles.railHeader}>
        <p className={styles.railTitle}>Filter</p>
        {isDirty ? (
          <button type="button" className={styles.reset} onClick={onReset}>
            Clear all
          </button>
        ) : null}
      </div>

      <FilterGroup
        label="Vibe"
        axis="vibe"
        options={[
          { value: "all", label: "All vibes" },
          ...BUG_BOOK_VIBES.map((vibe) => ({
            value: vibe.value,
            label: `${vibe.emoji} ${vibe.label}`,
          })),
        ]}
        filters={filters}
        entries={entries}
        read={(entry) => entry.vibe}
        onChange={(vibe) => onChange({ ...filters, vibe })}
      />

      <FilterGroup
        label="Caught by"
        axis="source"
        options={[{ value: "all", label: "Anyone" }, ...SOURCES]}
        filters={filters}
        entries={entries}
        read={(entry) => entry.source}
        onChange={(source) => onChange({ ...filters, source })}
      />

      <FilterGroup
        label="Severity"
        axis="severity"
        options={[
          { value: "all", label: "Any severity" },
          ...SEVERITIES.map((severity) => ({
            value: severity,
            label: severity,
          })),
        ]}
        filters={filters}
        entries={entries}
        read={(entry) => entry.severity}
        onChange={(severity) => onChange({ ...filters, severity })}
      />

      <FilterGroup
        label="Category"
        axis="category"
        options={[
          { value: "all", label: "All categories" },
          ...categories.map((category) => ({
            value: category,
            label: category,
          })),
        ]}
        filters={filters}
        entries={entries}
        read={(entry) => entry.category}
        onChange={(category) => onChange({ ...filters, category })}
      />
    </div>
  );
}
