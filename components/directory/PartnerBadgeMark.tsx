"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./PartnerBadge.module.css";

/**
 * Scalloped "burst" outline of the verified-style mark, centred in a 24x24
 * viewBox. Generated as a closed Catmull-Rom spline over 12 lobes
 * (alternating radius 11 / 9.35) rather than hand-drawn, so the shape is
 * symmetric and compact. Regenerate rather than nudging points by hand.
 */
const BADGE_BURST_PATH =
  "M12 1C12.81 1 13.5 2.72 14.42 2.97C15.34 3.21 16.8 2.07 17.5 2.47C18.2 2.88 17.94 4.72 18.61 5.39C19.28 6.06 21.12 5.8 21.53 6.5C21.93 7.2 20.79 8.66 21.03 9.58C21.28 10.5 23 11.19 23 12C23 12.81 21.28 13.5 21.03 14.42C20.79 15.34 21.93 16.8 21.53 17.5C21.12 18.2 19.28 17.94 18.61 18.61C17.94 19.28 18.2 21.12 17.5 21.53C16.8 21.93 15.34 20.79 14.42 21.03C13.5 21.28 12.81 23 12 23C11.19 23 10.5 21.28 9.58 21.03C8.66 20.79 7.2 21.93 6.5 21.53C5.8 21.12 6.06 19.28 5.39 18.61C4.72 17.94 2.88 18.2 2.47 17.5C2.07 16.8 3.21 15.34 2.97 14.42C2.72 13.5 1 12.81 1 12C1 11.19 2.72 10.5 2.97 9.58C3.21 8.66 2.07 7.2 2.47 6.5C2.88 5.8 4.72 6.06 5.39 5.39C6.06 4.72 5.8 2.88 6.5 2.47C7.2 2.07 8.66 3.21 9.58 2.97C10.5 2.72 11.19 1 12 1Z";

/** Tick inside the burst, drawn as a stroke so it stays crisp at 18px. */
const BADGE_CHECK_PATH = "M7.6 12.25L10.65 15.3L16.45 8.9";

/** Keys that activate the mark, matching its `role="button"` contract. */
const ACTIVATION_KEYS = ["Enter", " ", "Spacebar"];

/**
 * The partner mark itself: the tick plus its tooltip and the interaction
 * that opens it. Split out of `PartnerBadge` purely so the `"use client"`
 * boundary lands *here* rather than there.
 *
 * That split is load-bearing, not cosmetic. `PartnerBadge` calls
 * `isSuperflowPartner`, a real runtime import from
 * `lib/directory/agencies.ts`, whose module scope imports `agencies.json`
 * and `partners.json`. Marking that component `"use client"` would very
 * likely pull the whole scraped dataset into the browser bundle (JSON
 * module imports are not reliably tree-shaken) - the same trap
 * `AgencyExplorer` avoids with a type-only import, documented in
 * app/directory/README.md. This component therefore takes plain strings
 * and imports nothing from `lib/directory/`.
 *
 * Why it needs to be interactive at all: the mark paints no words, so on a
 * touch device - where there is no hover - the tooltip was previously
 * unreachable and the tick meant nothing. Tapping now opens it.
 *
 * The tap has to be intercepted. On `AgencyCard` the mark sits *inside* the
 * card-wide `<Link>`, so without `preventDefault`/`stopPropagation` a tap
 * aimed at the badge would navigate to the agency page instead of
 * explaining the badge.
 *
 * @param props - Component props.
 * @param props.label - Badge name, e.g. "Superflow partner".
 * @param props.description - Sentence explaining what the badge attests.
 */
export default function PartnerBadgeMark({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);

  /** Closes the tooltip. Stable so the dismiss effect can depend on it. */
  const closeTooltip = useCallback(() => {
    try {
      setIsOpen(false);
    } catch {
      // Nothing useful to do here; leaving it open is the safe failure.
    }
  }, []);

  /**
   * Toggles the tooltip and stops the event reaching the card link.
   *
   * @param event - The originating click or keyboard event.
   */
  const toggleTooltip = useCallback(
    (event: { preventDefault: () => void; stopPropagation: () => void }) => {
      try {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen((previous) => !previous);
      } catch {
        // Ignore - a failed toggle must not break the card's own link.
      }
    },
    [],
  );

  /**
   * Activates on the keys `role="button"` implies. Space is intercepted so
   * the page does not scroll out from under the tooltip being opened.
   *
   * @param event - The keyboard event on the mark.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      try {
        if (event.key === "Escape") {
          closeTooltip();
          return;
        }
        if (ACTIVATION_KEYS.includes(event.key)) toggleTooltip(event);
      } catch {
        // Ignore - key handling must not break the card's own link.
      }
    },
    [closeTooltip, toggleTooltip],
  );

  // Dismiss on anything that means "I'm done looking at this": a pointer
  // down elsewhere, Escape, or the page scrolling away underneath it.
  // Only bound while open, so a page of cards adds no idle listeners.
  useEffect(() => {
    try {
      if (!isOpen) return;

      const handleOutsidePointer = (event: PointerEvent) => {
        try {
          const node = badgeRef.current;
          if (!node) return;
          if (event.target instanceof Node && node.contains(event.target)) return;
          closeTooltip();
        } catch {
          // Ignore - dismissal is best-effort.
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        try {
          if (event.key === "Escape") closeTooltip();
        } catch {
          // Ignore - dismissal is best-effort.
        }
      };

      document.addEventListener("pointerdown", handleOutsidePointer);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("scroll", closeTooltip, { passive: true });

      return () => {
        document.removeEventListener("pointerdown", handleOutsidePointer);
        document.removeEventListener("keydown", handleEscape);
        window.removeEventListener("scroll", closeTooltip);
      };
    } catch {
      return;
    }
  }, [isOpen, closeTooltip]);

  try {
    return (
      <span
        ref={badgeRef}
        className={`${styles.badge}${isOpen ? ` ${styles.badgeOpen}` : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${label}. ${description}`}
        aria-expanded={isOpen}
        onClick={toggleTooltip}
        onKeyDown={handleKeyDown}
      >
        <svg
          className={styles.mark}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d={BADGE_BURST_PATH} fill="currentColor" />
          <path
            d={BADGE_CHECK_PATH}
            stroke="#ffffff"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.tooltip} role="tooltip">
          <span className={styles.tooltipCard}>
            <span className={styles.tooltipLabel}>{label}</span>
            {description}
          </span>
        </span>
      </span>
    );
  } catch {
    return null;
  }
}
