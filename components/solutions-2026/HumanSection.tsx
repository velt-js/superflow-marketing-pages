import Link from "next/link";
import type { ReactNode } from "react";
import type { SolutionPage } from "@/lib/solutions/types";
import styles from "./HumanSection.module.css";

const HEADING_ID = "solution-human-heading";
const HEADING = "Agents handle the black and white. You keep the taste.";
const AGENTS_LABEL = "Agents check";
const YOU_LABEL = "You decide";
const CLOSING_LINE = "Nothing ships until a person says so.";

/** Body-copy links every solutions page carries (spec section 8). */
const AGENTS_HREF = "/ai-review-agents";
const CLIENT_REVIEW_HREF = "/client-review";
const FINDINGS_LINK_TEXT = "Findings land as comments";
const FINDINGS_TAIL = " on the exact element. Your client ";
const APPROVES_LINK_TEXT = "approves from a link";
const APPROVES_TAIL = ", no account needed.";

/** Props for {@link HumanSection}. */
export interface HumanSectionProps {
  /** The page's four "agents check" and four "you decide" bullets. */
  human: SolutionPage["human"];
}

/**
 * Keep the non-empty strings of a bullet list.
 *
 * @param lines - The raw bullets from page data.
 * @returns The bullets to render.
 */
function cleanLines(lines?: readonly string[] | null): string[] {
  try {
    return (lines ?? []).filter(
      (line): line is string => typeof line === "string" && line.trim().length > 0,
    );
  } catch {
    return [];
  }
}

/**
 * Check mark drawn beside each "Agents check" bullet.
 *
 * @returns The inline icon.
 */
function CheckIcon(): ReactNode {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12l5 5l9 -10" />
    </svg>
  );
}

/**
 * Person mark drawn beside each "You decide" bullet.
 *
 * @returns The inline icon.
 */
function PersonIcon(): ReactNode {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

/**
 * S3, what stays human: two columns of bullets from page data ("Agents
 * check" and "You decide") under the shared heading, with the closing line.
 * The subhead carries the two body-copy links to the agents page and the
 * client review page.
 *
 * @param props - The page's bullets.
 * @returns The section, or null when the page has no bullets.
 */
export default function HumanSection({ human }: HumanSectionProps): ReactNode {
  const agentsCheck = cleanLines(human?.agentsCheck);
  const youDecide = cleanLines(human?.youDecide);
  if (agentsCheck.length === 0 && youDecide.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.section}
      data-section="solution-human"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {HEADING}
          </h2>
          <p className={styles.subhead}>
            <Link className={styles.link} href={AGENTS_HREF}>
              {FINDINGS_LINK_TEXT}
            </Link>
            {FINDINGS_TAIL}
            <Link className={styles.link} href={CLIENT_REVIEW_HREF}>
              {APPROVES_LINK_TEXT}
            </Link>
            {APPROVES_TAIL}
          </p>
        </header>

        <div className={styles.columns}>
          <div className={`${styles.column} ${styles.columnAgents}`}>
            <h3 className={styles.columnLabel}>{AGENTS_LABEL}</h3>
            <ul className={styles.list}>
              {agentsCheck.map((line, index) => (
                <li key={`agents-${index}`} className={styles.item}>
                  <span className={`${styles.mark} ${styles.markAgents}`}>
                    <CheckIcon />
                  </span>
                  <span className={styles.itemText}>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.column} ${styles.columnYou}`}>
            <h3 className={styles.columnLabel}>{YOU_LABEL}</h3>
            <ul className={styles.list}>
              {youDecide.map((line, index) => (
                <li key={`you-${index}`} className={styles.item}>
                  <span className={`${styles.mark} ${styles.markYou}`}>
                    <PersonIcon />
                  </span>
                  <span className={styles.itemText}>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className={styles.closing}>{CLOSING_LINE}</p>
      </div>
    </section>
  );
}
