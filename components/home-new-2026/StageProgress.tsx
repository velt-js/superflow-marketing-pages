"use client";

import { useEffect, useState } from "react";
import styles from "./StageProgress.module.css";

export type StageProgressStep = { id: string; title: string; audience: string };

/** Reference point in the viewport: a stage counts as reached when its top crosses this line. */
const VIEWPORT_LINE = 0.45;

/**
 * Scroll-driven tracker for the stages section. A vertical line fills as the
 * reader scrolls through the three stages, and the step whose block is on
 * screen reads as current. Clicking a step scrolls to it.
 *
 * A stage is reached once its top crosses a line 45% down the viewport. The
 * fill runs from the reached stage toward the next one in proportion to the
 * scroll between them, so it is empty at the first stage and full at the
 * last. Everything runs from scroll and resize events; the server renders the
 * empty state.
 *
 * @param steps - The stages, in order. Each `id` is the DOM id of its block.
 */
export default function StageProgress({ steps }: { steps: readonly StageProgressStep[] }) {
  const [progress, setProgress] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    function update() {
      try {
        const tops = steps.map((step) => {
          const element = document.getElementById(step.id);
          return element ? element.getBoundingClientRect().top : Number.NaN;
        });
        if (tops.some((top) => Number.isNaN(top)) || tops.length < 2) return;
        const line = window.innerHeight * VIEWPORT_LINE;
        let active = 0;
        tops.forEach((top, index) => {
          if (top <= line) active = index;
        });
        const last = tops.length - 1;
        let fraction = 0;
        if (active < last) {
          const span = tops[active + 1] - tops[active];
          fraction = span > 0 ? Math.min(1, Math.max(0, (line - tops[active]) / span)) : 0;
        }
        setActiveIndex(active);
        setProgress(Math.min(1, Math.max(0, (active + fraction) / last)));
      } catch {
        // Leave the last known value.
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [steps]);

  /** Scroll the stage block into view, leaving room for the fixed nav. */
  function handleClick(id: string) {
    try {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // Ignore: the browser will stay where it is.
    }
  }

  return (
    <ol className={styles.track} aria-label="Stages">
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.fill} style={{ transform: `scaleY(${progress})` }} />
      </span>
      {steps.map((step, index) => {
        const reached = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <li key={step.id} className={styles.step}>
            <button
              type="button"
              className={`${styles.button} ${reached ? styles.reached : ""} ${current ? styles.current : ""}`}
              aria-current={current ? "step" : undefined}
              onClick={() => handleClick(step.id)}
            >
              <span className={styles.node} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.label}>
                <span className={styles.title}>{step.title}</span>
                <span className={styles.audience}>{step.audience}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
