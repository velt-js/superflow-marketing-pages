"use client";

import { useId, useState, type UIEvent } from "react";
import styles from "./Hero.module.css";
import { CheckIcon, ChevronDownIcon } from "./HeroIcons";

/** A single QA check offered in the hero's "checks to perform" list. */
type CheckOption = {
  label: string;
  selected: boolean;
};

/** The six QA checks shown in the hero, three pre-selected per the design. */
const CHECK_OPTIONS: readonly CheckOption[] = [
  { label: "Broken Links", selected: true },
  { label: "Grammar and Spelling", selected: true },
  { label: "SEO Basics", selected: true },
  { label: "Performance", selected: false },
  { label: "Brand Colors", selected: false },
  { label: "Placeholder Text", selected: false },
];

const SELECTED_COUNT = CHECK_OPTIONS.filter((option) => option?.selected).length;
const TITLE_SUFFIX = "";
const TITLE_TAIL = " agents done.";

/* Pixels of scroll offset within which an edge counts as "at rest", so its
   fade stays hidden until there are actually hidden checks beyond it. */
const SCROLL_EDGE_THRESHOLD_PX = 4;

/**
 * Expandable "checks to perform" card shown beside the hero URL input.
 *
 * Purely presentational: toggling only shows/hides the list of checks and does
 * not submit anything. Interactivity is intentionally light per the design.
 */
export default function HeroChecksDropdown() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  // The six checks always overflow the fixed-height viewport, so the bottom
  // fade is on until the user scrolls to the end of the list.
  const [hasMoreBelow, setHasMoreBelow] = useState<boolean>(true);
  // The list starts pinned to the top, so the top fade only turns on once the
  // user has scrolled down and checks are hidden above the viewport.
  const [hasMoreAbove, setHasMoreAbove] = useState<boolean>(false);
  const listId = useId();

  /** Toggle the visibility of the checks list. */
  function handleToggle() {
    try {
      setIsOpen((previous) => !previous);
    } catch {
      setIsOpen(true);
    }
  }

  /**
   * Toggle each edge's fade based on whether checks remain hidden above or
   * below the current scroll position.
   * @param event - Scroll event from the checks list viewport.
   */
  function handleListScroll(event: UIEvent<HTMLUListElement>) {
    try {
      const viewport = event?.currentTarget;
      const scrollTop = viewport?.scrollTop ?? 0;
      const distanceFromBottom =
        (viewport?.scrollHeight ?? 0) - scrollTop - (viewport?.clientHeight ?? 0);
      setHasMoreAbove(scrollTop > SCROLL_EDGE_THRESHOLD_PX);
      setHasMoreBelow(distanceFromBottom > SCROLL_EDGE_THRESHOLD_PX);
    } catch {
      setHasMoreAbove(false);
      setHasMoreBelow(true);
    }
  }

  return (
    <div className={`${styles.checksCard} ${isOpen ? styles.checksCardOpen : ""}`}>
      <button
        type="button"
        className={styles.checksHeader}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={handleToggle}
      >
        <span className={styles.checksTitle}>
          <span className={styles.checksTitleCount}>
            {`${SELECTED_COUNT} of ${CHECK_OPTIONS.length}${TITLE_SUFFIX}`}
          </span>
          {TITLE_TAIL}
        </span>
        <ChevronDownIcon
          size={16}
          className={`${styles.checksChevron} ${
            isOpen ? styles.checksChevronOpen : ""
          }`}
        />
      </button>

      {isOpen ? (
        <ul
          id={listId}
          className={`${styles.checksList} ${
            hasMoreAbove ? styles.checksListFadeTop : ""
          } ${hasMoreBelow ? styles.checksListFadeBottom : ""}`}
          onScroll={handleListScroll}
        >
          {CHECK_OPTIONS.map((option) => {
            const isSelected = option?.selected === true;
            return (
              <li key={option?.label} className={styles.checkItem}>
                <span
                  className={`${styles.checkMark} ${
                    isSelected ? styles.checkMarkOn : styles.checkMarkOff
                  }`}
                >
                  {isSelected ? <CheckIcon size={12} strokeWidth={3} /> : null}
                </span>
                <span
                  className={`${styles.checkLabel} ${
                    isSelected ? styles.checkLabelOn : styles.checkLabelOff
                  }`}
                >
                  {option?.label}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
