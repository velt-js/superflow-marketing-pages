import type { ReactNode } from "react";
import AgentCard from "./AgentCard";
import styles from "./BuildYourOwnCard.module.css";

/** Copy shared by every "Build your own" card. */
const HEADING = "Build your own.";
const INPUT_LABEL = "Your rule";
const RESULT_LABEL = "The agent Superflow builds";

/** Props for {@link BuildYourOwnCard}. */
export interface BuildYourOwnCardProps {
  /** The plain sentence, shown in a text-input style. */
  input: string;
  /** The resulting agent's name. */
  agentName: string;
  /** The finding that agent posts. */
  finding: string;
  /** Page identifier attached to the card's analytics event. */
  page: string;
  /** Optional heading override (defaults to "Build your own."). */
  heading?: string;
}

/**
 * The wide "Build your own" card: a plain sentence in a text-input style on
 * the left turning into an agent card with a finding on the right. Static,
 * not interactive (spec section 5). Shared by the solutions pack grid and the
 * "What your agents catch" section.
 *
 * @param props - The sentence, the resulting agent and its finding.
 * @returns The card element.
 */
export default function BuildYourOwnCard({
  input,
  agentName,
  finding,
  page,
  heading,
}: BuildYourOwnCardProps): ReactNode {
  return (
    <div className={styles.card} data-section="build-your-own">
      <div className={styles.left}>
        <p className={styles.heading}>{heading ?? HEADING}</p>
        <p className={styles.label}>{INPUT_LABEL}</p>
        <div className={styles.input}>
          <span className={styles.inputText}>{input}</span>
          <span className={styles.caret} aria-hidden="true" />
        </div>
      </div>
      <div className={styles.arrow} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6l-6 6" />
        </svg>
      </div>
      <div className={styles.right}>
        <p className={styles.label}>{RESULT_LABEL}</p>
        <AgentCard name={agentName} finding={finding} page={page} emphasis />
      </div>
    </div>
  );
}
