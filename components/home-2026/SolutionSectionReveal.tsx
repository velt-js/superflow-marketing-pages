"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./SolutionSection.module.css";

/** Fraction of the section content that must be visible before the entrance plays. */
const VISIBILITY_THRESHOLD = 0.2;

/**
 * Client boundary driving the Solution section's one-shot entrance. Observes
 * its wrapper and, once partially visible, adds the reveal class that
 * triggers both the blueprint-frame draw (lines, then bolts) and the
 * left-to-right diagram sequence. All timing lives in the CSS module — this
 * component only toggles the class.
 */
export default function SolutionSectionReveal({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) {
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
    return () => observer.disconnect();
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
