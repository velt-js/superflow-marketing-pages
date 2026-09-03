"use client";

import { useId, useState, type ReactNode } from "react";
import AgentCommentCard from "@/components/home-2026/feature-artifacts/AgentCommentCard";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  AGENT_CATEGORY_LABELS,
  type AgentCategory,
} from "@/lib/solutions/agent-library";
import styles from "./AgentCard.module.css";

/** Timestamp shown on the sample finding. */
const FINDING_TIME = "now";
/** Toggle labels for the finding on narrow screens. */
const SHOW_FINDING_LABEL = "See finding";
const HIDE_FINDING_LABEL = "Hide finding";

/** Props for {@link AgentCard}. */
export interface AgentCardProps {
  /** Agent name, e.g. "Booking Link Check". */
  name: string;
  /** One line: what it checks. Omit on the "Build your own" result card. */
  checks?: string;
  /** The sample finding, rendered as the pinned comment a customer would see. */
  finding: string;
  /** Optional category chip. */
  category?: AgentCategory;
  /**
   * Where the card sits, attached to the `agent_card_expanded` event as
   * `page` (a solutions slug, "home" or "ai-review-agents").
   */
  page: string;
  /** Extra class on the root, for grid placement. */
  className?: string;
  /** Renders the card in its emphasised "result" treatment (Build your own). */
  emphasis?: boolean;
}

/**
 * One agent card: the name, what it checks, and the sample finding rendered
 * as the shared {@link AgentCommentCard} (the same finding card the product
 * pins to an element). Used by the solutions pack grid and the "What your
 * agents catch" section, so every agent example on the site shows a finding
 * the same way.
 *
 * On narrow screens the finding collapses behind a "See finding" toggle so a
 * grid of eight stays scannable; opening it fires `agent_card_expanded`. On
 * wider screens the finding is always visible (the toggle is hidden by CSS
 * and the panel is forced open).
 *
 * @param props - The agent copy and the page it renders on.
 * @returns The card element.
 */
export default function AgentCard({
  name,
  checks,
  finding,
  category,
  page,
  className,
  emphasis = false,
}: AgentCardProps): ReactNode {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const panelId = useId();
  const { trackEvent } = useAnalytics();

  /** Toggle the finding on narrow screens and report the first open. */
  function handleToggle() {
    try {
      setIsOpen((previous) => {
        const next = !previous;
        if (next) {
          trackEvent(AnalyticsEvents.AGENT_CARD_EXPANDED, { agent: name, page });
        }
        return next;
      });
    } catch {
      setIsOpen(true);
    }
  }

  const rootClassName = [
    styles.card,
    emphasis ? styles.cardEmphasis : "",
    isOpen ? styles.cardOpen : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={rootClassName} data-agent-card={name}>
      <div className={styles.head}>
        <h3 className={styles.name}>{name}</h3>
        {category ? (
          <span className={styles.category}>{AGENT_CATEGORY_LABELS[category]}</span>
        ) : null}
      </div>
      {checks ? <p className={styles.checks}>{checks}</p> : null}

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        {isOpen ? HIDE_FINDING_LABEL : SHOW_FINDING_LABEL}
      </button>

      <div id={panelId} className={styles.finding}>
        <AgentCommentCard
          className={styles.findingCard}
          agentName={name}
          timeAgo={FINDING_TIME}
          title={finding}
          description=""
          avatarVariant="agentDots"
          showMenu={false}
        />
      </div>
    </article>
  );
}
