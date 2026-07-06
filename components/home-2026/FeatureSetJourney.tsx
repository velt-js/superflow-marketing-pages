"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FeatureSet.module.css";
import { FeatureSetIcon } from "./FeatureSetIcons";

/** How much of the journey row must be visible before the reveal plays. */
const REVEAL_THRESHOLD = 0.6;

type JourneyStage = "static" | "collapsed" | "revealed";

interface FeatureSetJourneyProps {
  startLabel: string;
  endLabel: string;
}

/**
 * The "First Draft → Client Approved" journey row with a play-once reveal:
 * both pills start as icon-only circles, then grow horizontally to uncover
 * their labels (First Draft first, the arrow pops in, then the end pill).
 *
 * The server-rendered/static state is the final expanded row, so no-JS and
 * prefers-reduced-motion users (and headers already in view on load) see
 * the finished layout. After mount, if the row is still below the fold and
 * motion is allowed, it collapses off-screen and an IntersectionObserver
 * removes the collapsed class on first reveal — CSS transitions with
 * staggered delays do the rest. Row height never changes, so surrounding
 * content does not jump.
 *
 * @param props - Labels for the start and end pills.
 */
export default function FeatureSetJourney({ startLabel, endLabel }: FeatureSetJourneyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<JourneyStage>("static");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // Only animate when the row starts below the viewport; if it is already
    // visible on load, keep the static final state (the reveal plays once).
    if (container.getBoundingClientRect().top <= window.innerHeight) {
      return;
    }

    setStage("collapsed");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStage("revealed");
          observer.disconnect();
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const journeyClass =
    stage === "collapsed"
      ? `${styles.journey} ${styles.journeyCollapsed}`
      : styles.journey;

  return (
    <div ref={containerRef} className={journeyClass}>
      <span className={`${styles.journeyPill} ${styles.journeyPillDraft}`}>
        <FeatureSetIcon name="ballpen" size={46} className={styles.journeyPillIcon} />
        <span className={styles.journeyLabel}>
          <span className={styles.journeyLabelText}>{startLabel}</span>
        </span>
      </span>
      <span className={styles.journeyArrow} aria-hidden="true">
        <FeatureSetIcon name="arrow-right" size={40} />
      </span>
      <span className={`${styles.journeyPill} ${styles.journeyPillReview}`}>
        <FeatureSetIcon name="checks" size={46} className={styles.journeyPillIcon} />
        <span className={styles.journeyLabel}>
          <span className={styles.journeyLabelText}>{endLabel}</span>
        </span>
      </span>
    </div>
  );
}
