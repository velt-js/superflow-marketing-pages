"use client";

import { useId, useState } from "react";
import { HOME_HERO_AGENTS } from "@/lib/solutions/agent-library";
import styles from "./Hero.module.css";
import { CheckIcon, ChevronDownIcon } from "./HeroIcons";

/**
 * The fixed QA agents shown in the hero, sourced from the shared agent
 * library so the list, the hero findings and the section cards stay in one
 * place. All are always on and not togglable; the list is purely informative.
 */
const AGENT_LABELS: readonly string[] = HOME_HERO_AGENTS;

const TITLE_TAIL = " Agents will run";

/**
 * Expandable "agents" card shown beside the hero URL input.
 *
 * Purely presentational: the header only shows/hides the fixed list of
 * agents. The count in the header follows the list length. The agents
 * themselves are always selected and cannot be toggled.
 */
export default function HeroChecksDropdown() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const listId = useId();

  /** Toggle the visibility of the agents list. */
  function handleToggle() {
    try {
      setIsOpen((previous) => !previous);
    } catch {
      setIsOpen(true);
    }
  }

  return (
    <div className={styles.checksCard}>
      <button
        type="button"
        className={styles.checksHeader}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={handleToggle}
      >
        <span className={styles.checksTitle}>
          <span className={styles.checksTitleCount}>{AGENT_LABELS.length}</span>
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
        <ul id={listId} className={styles.checksList}>
          {AGENT_LABELS.map((label) => (
            <li key={label} className={styles.checkItem}>
              <span className={`${styles.checkMark} ${styles.checkMarkOn}`}>
                <CheckIcon size={12} strokeWidth={3} />
              </span>
              <span className={`${styles.checkLabel} ${styles.checkLabelOn}`}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
