"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./SolutionSection.module.css";
import { useAgentActivate } from "./SolutionSectionAgents";

/** Time each finding is displayed before the cycle advances. */
const TOAST_HOLD_MS = 2600;
/** Lead between the pill bounce firing and the toast content swapping in. */
const TOAST_LEAD_MS = 300;
/** Duration of the swap animation; must cover the CSS keyframe duration. */
const TOAST_TRANSITION_MS = 550;
/** Fraction of the stack that must be visible for the cycle to run. */
const VISIBILITY_THRESHOLD = 0.3;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** One finding shown as a toast in the review stack. */
export interface ReviewFinding {
  id: string;
  label: string;
  /** Issue count this finding represents; summed for the header total. */
  count: number;
  /** Icon tint; reuses the section's agent accent palette. */
  accentColor: string;
  icon: ReactNode;
  /** Agent Team pill to pulse when this finding lands, or null for none. */
  agentId: string | null;
}

interface ToastState {
  currentIndex: number;
  /** Index of the toast animating out, or null when idle. */
  previousIndex: number | null;
}

/**
 * Single toast card (icon + label) rendered inside the review stack.
 * @param finding The finding to display.
 * @param animationClass Optional entrance/exit animation class.
 */
function ToastCard({
  finding,
  animationClass,
}: {
  finding: ReviewFinding;
  animationClass?: string;
}): ReactNode {
  const cardClassName = animationClass
    ? `${styles.reviewCardFront} ${animationClass}`
    : styles.reviewCardFront;

  return (
    <div className={cardClassName}>
      <span
        className={styles.reviewCardIcon}
        style={{ color: finding.accentColor }}
      >
        {finding.icon}
      </span>
      <p className={styles.reviewCardText}>{finding.label}</p>
    </div>
  );
}

/**
 * Notification-stack toast for the Solution section's review column. Cycles
 * through the given findings: the front toast recedes toward the back-card
 * slot while the next one drops in from above. Cycling runs only while the
 * stack is on screen, starts after the section's entrance reveal has had
 * time to play (first swap lands after one hold period), loops forever, and
 * is disabled entirely under prefers-reduced-motion (static first toast).
 */
export default function SolutionSectionToast({
  findings,
}: {
  findings: ReviewFinding[];
}): ReactNode {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({
    currentIndex: 0,
    previousIndex: null,
  });
  const activateAgent = useAgentActivate();
  /** Displayed index, read inside the interval without re-subscribing. */
  const currentIndexRef = useRef(0);

  /* Tracks enter AND leave (no disconnect-on-first-hit) so the cycle
     pauses while the section is scrolled offscreen. */
  useEffect(() => {
    const stackElement = stackRef.current;
    if (!stackElement) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { threshold: VISIBILITY_THRESHOLD },
    );

    observer.observe(stackElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || findings.length < 2) {
      return undefined;
    }
    if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) {
      return undefined;
    }

    let swapTimeoutId = 0;

    const intervalId = window.setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % findings.length;
      /* Bounce the matching pill first, then swap the toast content a beat
         later — reads as "the agent fired, then the finding appeared". */
      activateAgent(findings[nextIndex]?.agentId ?? null);
      swapTimeoutId = window.setTimeout(() => {
        currentIndexRef.current = nextIndex;
        setToastState((state) => ({
          currentIndex: nextIndex,
          previousIndex: state.currentIndex,
        }));
      }, TOAST_LEAD_MS);
    }, TOAST_HOLD_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(swapTimeoutId);
    };
  }, [isVisible, findings, activateAgent]);

  /* Drop the outgoing toast from the DOM once its exit animation is done. */
  useEffect(() => {
    if (toastState.previousIndex === null) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastState((state) => ({ ...state, previousIndex: null }));
    }, TOAST_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toastState.previousIndex]);

  const currentFinding = findings[toastState.currentIndex];
  const previousFinding =
    toastState.previousIndex === null
      ? null
      : findings[toastState.previousIndex];

  return (
    <div ref={stackRef} className={styles.reviewStack}>
      <span className={styles.reviewCardBack} />
      {previousFinding ? (
        <ToastCard
          key={`outgoing-${previousFinding.id}`}
          finding={previousFinding}
          animationClass={styles.toastOutgoing}
        />
      ) : null}
      {currentFinding ? (
        <ToastCard
          key={`current-${currentFinding.id}`}
          finding={currentFinding}
          animationClass={previousFinding ? styles.toastIncoming : undefined}
        />
      ) : null}
    </div>
  );
}
