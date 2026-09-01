"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ToolsExplorer.module.css";
import { ToolCard } from "./RelatedTools";
import { ToolIcon } from "./ToolIcon";
import {
  CATEGORY_BLURBS,
  CATEGORY_LABELS,
  type ToolCategory,
  type ToolEntry,
  type ToolIconKey,
} from "@/lib/tools/registry";

/** The "everything" pseudo-category the index opens on. */
const ALL = "all" as const;

type Filter = ToolCategory | typeof ALL;

/** Glyph for each category rail entry, reusing the grid's own icon set. */
const CATEGORY_ICONS: Record<Filter, ToolIconKey> = {
  all: "stack",
  "ai-visibility": "robot",
  "structured-data": "code",
  social: "share",
  quality: "check",
  campaigns: "link",
  assets: "image",
};

/** Copy for the "everything" entry, so the rail and header read the same. */
const ALL_LABEL = "All tools";
const ALL_BLURB =
  "Every free tool we run. Narrow by category, or search by what you need to check.";

/**
 * Normalises a string for matching: lowercased, with punctuation reduced to
 * spaces so "robots.txt" matches a search for "robots txt".
 *
 * @param value - The raw string.
 */
function normalise(value: string): string {
  try {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Whether a tool matches a free-text query. Every whitespace-separated term
 * has to appear somewhere in the tool's name, tagline, slug, or category, so
 * "ai json" narrows rather than widens.
 *
 * @param tool - The tool being tested.
 * @param query - The raw search box contents.
 */
function matchesQuery(tool: ToolEntry, query: string): boolean {
  try {
    const terms = normalise(query).split(" ").filter(Boolean);
    if (terms.length === 0) return true;

    const haystack = normalise(
      [tool.name, tool.tagline, tool.slug, CATEGORY_LABELS[tool.category]].join(
        " ",
      ),
    );
    return terms.every((term) => haystack.includes(term));
  } catch {
    return true;
  }
}

/**
 * The /tools index: a sticky category rail and a search box on the left, the
 * filtered grid on the right.
 *
 * The index used to be one flat grid of ~20 cards with the category printed on
 * each one, which is a list to scroll rather than a shelf to browse — a
 * visitor who wants "the structured data ones" had to read every card to find
 * the three. The rail turns that scan into one click and, with the counts,
 * says up front how much is behind each heading.
 *
 * Every tool is rendered on the server in the default "All tools" state, so
 * the filtering costs nothing in crawlable HTML: it only ever hides cards that
 * were already in the document.
 *
 * @param props - Every tool to show, already in display order.
 */
export default function ToolsExplorer({
  tools,
  categoryOrder,
}: {
  tools: readonly ToolEntry[];
  categoryOrder: readonly ToolCategory[];
}) {
  const [active, setActive] = useState<Filter>(ALL);
  const [query, setQuery] = useState("");

  /** Everything the search box alone leaves standing, whatever the category. */
  const searched = useMemo(() => {
    try {
      return tools.filter((tool) => matchesQuery(tool, query));
    } catch {
      return [...tools];
    }
  }, [tools, query]);

  /**
   * The rail's entries. Which rows exist is fixed by the catalogue, so the
   * rail never reflows as somebody types; the counts are of the *searched*
   * set, so a category that cannot answer the current search says 0 rather
   * than promising nine results and delivering none.
   */
  const rail = useMemo(() => {
    try {
      const rows = categoryOrder
        .filter((category) => tools.some((tool) => tool.category === category))
        .map((category) => ({
          key: category as Filter,
          label: CATEGORY_LABELS[category],
          count: searched.filter((tool) => tool.category === category).length,
        }));

      return [
        { key: ALL as Filter, label: ALL_LABEL, count: searched.length },
        ...rows,
      ];
    } catch {
      return [{ key: ALL as Filter, label: ALL_LABEL, count: tools.length }];
    }
  }, [tools, searched, categoryOrder]);

  /** The cards actually shown, after the rail and the search box. */
  const visible = useMemo(() => {
    try {
      return searched.filter(
        (tool) => active === ALL || tool.category === active,
      );
    } catch {
      return [...searched];
    }
  }, [searched, active]);

  // Deep links: /tools#quality opens on that category, and picking one
  // rewrites the hash so the view is shareable. Read after mount rather than
  // during render, because the server has no hash to render from.
  useEffect(() => {
    try {
      const hash = window.location.hash.replace("#", "");
      if (categoryOrder.some((category) => category === hash)) {
        setActive(hash as Filter);
      }
    } catch {
      // no-op: a missing or unreadable hash just leaves the default view.
    }
  }, [categoryOrder]);

  /**
   * Selects a category and records it in the URL without adding a history
   * entry, so Back still leaves the page rather than stepping through filters.
   *
   * @param next - The category picked, or `all`.
   */
  function handleSelect(next: Filter) {
    try {
      setActive(next);
      const url = next === ALL ? window.location.pathname : `#${next}`;
      window.history.replaceState(null, "", url);
    } catch {
      // no-op: the filter still applies even if the URL cannot be updated.
    }
  }

  /** Drops both filters, from the empty state's reset button. */
  function handleReset() {
    try {
      setQuery("");
      handleSelect(ALL);
    } catch {
      // no-op
    }
  }

  const categoryLabel = active === ALL ? ALL_LABEL : CATEGORY_LABELS[active];
  const trimmedQuery = query.trim();

  // With a search running, the heading answers "what am I looking at" with the
  // query rather than with the category, because the query is the narrower of
  // the two and the one the visitor just typed.
  const heading = trimmedQuery
    ? `Results for \u201C${trimmedQuery}\u201D`
    : categoryLabel;
  const blurb = trimmedQuery
    ? active === ALL
      ? "Searching every free tool we run."
      : `Searching ${categoryLabel.toLowerCase()}. Pick All tools to widen it.`
    : active === ALL
      ? ALL_BLURB
      : CATEGORY_BLURBS[active];

  return (
    <div className={styles.layout} data-section="tools-explorer">
      <aside className={styles.rail} aria-label="Filter tools">
        <div className={styles.railInner}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </span>
            <input
              className={styles.search}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools"
              aria-label="Search tools"
            />
          </div>

          <p className={styles.railLabel}>Categories</p>
          <ul className={styles.railList}>
            {rail.map((entry) => (
              <li key={entry.key}>
                <button
                  type="button"
                  className={`${styles.railItem} ${
                    entry.key === active ? styles.railItemActive : ""
                  } ${entry.count === 0 ? styles.railItemEmpty : ""}`}
                  aria-pressed={entry.key === active}
                  // A category with nothing left under the current search is
                  // a dead end, so it stays visible (the rail must not
                  // reflow mid-search) but stops being clickable.
                  disabled={entry.count === 0 && entry.key !== active}
                  onClick={() => handleSelect(entry.key)}
                >
                  <span className={styles.railIcon} aria-hidden="true">
                    <ToolIcon name={CATEGORY_ICONS[entry.key]} size={16} />
                  </span>
                  <span className={styles.railText}>{entry.label}</span>
                  <span className={styles.railCount}>{entry.count}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className={styles.railNote}>
            Free forever. No login, no email gate, no ads.
          </p>
        </div>
      </aside>

      <div className={styles.results}>
        <div className={styles.resultsHead}>
          <div className={styles.resultsHeadText}>
            <h2 className={styles.resultsTitle}>{heading}</h2>
            <p className={styles.resultsBlurb}>{blurb}</p>
          </div>
          {/* aria-live: filtering changes the grid without moving focus, so
              the count is the only thing that announces what just happened. */}
          <p className={styles.resultsCount} aria-live="polite">
            {visible.length} {visible.length === 1 ? "tool" : "tools"}
          </p>
        </div>

        {visible.length > 0 ? (
          <div className={styles.grid}>
            {visible.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} showCategory />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No tool matches that yet.</p>
            <p className={styles.emptyBody}>
              Try a shorter search, or browse everything we run.
            </p>
            <button
              type="button"
              className={styles.emptyReset}
              onClick={handleReset}
            >
              Show all tools
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
