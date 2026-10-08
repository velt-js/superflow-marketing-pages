"use client";

// Bulk ↔ À la carte switch for the AI pricing section on /pricing.
//
// Bulk (flat per-site) is the default; à la carte (credits per scan) is
// one click away. Both panels arrive server-rendered from
// AiCreditsRateCard and the inactive one is only `hidden`, so crawlers
// and no-JS readers still get the whole price list.

import { useState, type ReactNode } from "react";
import styles from "./AiCreditsRateCard.module.css";

export type AiPricingMode = "bulk" | "alacarte";

const OPTIONS: { id: AiPricingMode; label: string }[] = [
  { id: "bulk", label: "Bulk" },
  { id: "alacarte", label: "À la carte" },
];

/**
 * Segmented toggle over the two AI pricing panels.
 *
 * @param props.bulkHint - Short hint shown on the Bulk option ("$14/site").
 * @param props.bulk - The bulk pricing panel (shown by default).
 * @param props.alaCarte - The credits rate card and packs panel.
 */
export default function AiPricingModeSwitch({
  bulkHint,
  bulk,
  alaCarte,
}: {
  bulkHint: string;
  bulk: ReactNode;
  alaCarte: ReactNode;
}) {
  // Hooks above the try - see tests/interactive/hooks-outside-try.spec.ts.
  const [mode, setMode] = useState<AiPricingMode>("bulk");

  try {
    return (
      <>
        <div className={styles.toggle} role="radiogroup" aria-label="AI pricing">
          {OPTIONS.map((option) => {
            const active = option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={
                  active
                    ? `${styles.toggleOption} ${styles.toggleActive}`
                    : styles.toggleOption
                }
                onClick={() => setMode(option.id)}
              >
                {option.label}
                {option.id === "bulk" ? (
                  <span className={styles.toggleHint}>{bulkHint}</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div data-panel="bulk" hidden={mode !== "bulk"}>
          {bulk}
        </div>
        <div data-panel="alacarte" hidden={mode !== "alacarte"}>
          {alaCarte}
        </div>
      </>
    );
  } catch {
    return null;
  }
}
