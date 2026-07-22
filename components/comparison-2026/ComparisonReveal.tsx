"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./comparison.module.css";

/** Fraction of the wrapped content that must be visible before revealing. */
const VISIBILITY_THRESHOLD = 0.2;

/**
 * Client boundary driving a one-shot scroll entrance for comparison-page
 * sections — the same pattern as the homepage `SolutionSectionReveal`.
 * Observes its wrapper and, once partially visible, adds the reveal class;
 * all animation timing lives in `comparison.module.css` (`.reveal` /
 * `.revealVisible` + the per-item `--reveal-delay` custom property).
 *
 * @param children - The section content to reveal.
 * @returns The observed wrapper, revealing its children on first visibility.
 */
export default function ComparisonReveal({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const wrapperElement = wrapperRef?.current;
      if (!wrapperElement || typeof IntersectionObserver === "undefined") {
        setIsVisible(true);
        return undefined;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: VISIBILITY_THRESHOLD },
      );
      observer.observe(wrapperElement);
      return () => {
        try {
          observer.disconnect();
        } catch {
          // Ignore teardown failures.
        }
      };
    } catch {
      // If observation fails, reveal immediately so content never stays hidden.
      setIsVisible(true);
      return undefined;
    }
  }, []);

  const wrapperClassName = isVisible
    ? `${styles.reveal} ${styles.revealVisible}`
    : styles.reveal;

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {children}
    </div>
  );
}
