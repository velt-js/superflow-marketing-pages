"use client";

import { useMemo, useState } from "react";
import styles from "./Calculator.module.css";

/** Superflow signup destination for the primary CTA. */
const SIGNUP_URL = "https://app.usesuperflow.com/signup";
/** Book-a-demo destination for the secondary CTA. */
const BOOK_DEMO_URL = "/book-demo";

/** Copy shown above the money figure before any hours are selected. */
const IDLE_FORMULA_TEXT = "Calculate how much money you lose!";

/** A single discrete stop on the hours slider. */
interface HourStop {
  hours: number;
  top: string;
  bottom: string;
  approx?: boolean;
}

/** A selectable team role with its blended hourly rate and brand color. */
interface Role {
  name: string;
  rate: number;
  color: string;
}

const STOPS: readonly HourStop[] = [
  { hours: 0, top: "0", bottom: "Hours" },
  { hours: 50, top: "50", bottom: "Hours" },
  { hours: 100, top: "100", bottom: "Hours" },
  { hours: 150, top: "150", bottom: "Hours" },
  { hours: 200, top: "200", bottom: "Hours" },
  { hours: 232, top: "Too", bottom: "Many", approx: true },
];

const ROLES: readonly Role[] = [
  { name: "DESIGNER", rate: 25, color: "#8480ff" },
  { name: "DEVELOPER", rate: 90, color: "#f4c842" },
  { name: "MARKETING", rate: 50, color: "#3fd082" },
  { name: "MANAGER", rate: 50, color: "#ff5860" },
];

/** Chat-bubble glyph rendered inside the active slider thumb. */
function ChatBubbleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/**
 * Creative Review ROI Calculator, restyled to the 2026 homepage theme: a blue
 * gradient hero introduces the tool, then a dark #111111 stage carries the
 * interactive money figure, role chips and hours slider. The underlying
 * math is unchanged — money lost equals the selected hours multiplied by the
 * average hourly rate of the selected roles.
 */
export default function Calculator() {
  const [hoursIndex, setHoursIndex] = useState<number>(0);
  const [activeRoles, setActiveRoles] = useState<ReadonlySet<number>>(
    () => new Set([0, 1, 2, 3])
  );

  const stop = STOPS[hoursIndex];
  const showLost = hoursIndex > 0;

  const { moneyLost, displayValue } = useMemo(() => {
    try {
      const selected = ROLES.filter((_role, index) => activeRoles.has(index));
      const averageRate =
        selected.length > 0
          ? selected.reduce((sum, role) => sum + role.rate, 0) / selected.length
          : 0;
      const lost = (stop?.hours ?? 0) * averageRate;
      let label = "$0";
      if (lost > 0) {
        if (stop?.approx) {
          const rounded = Math.round(lost / 500) * 500;
          label = `~$${rounded.toLocaleString()}`;
        } else {
          label = `-$${Math.round(lost).toLocaleString()}`;
        }
      }
      return { moneyLost: lost, displayValue: label };
    } catch {
      return { moneyLost: 0, displayValue: "$0" };
    }
  }, [activeRoles, stop]);

  /** Toggle whether the role at the given index is included in the average. */
  function toggleRole(index: number) {
    try {
      setActiveRoles((previous) => {
        const next = new Set(previous);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    } catch {
      setActiveRoles(new Set([0, 1, 2, 3]));
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} data-section="calculator-hero">
        <div className={styles.heroFade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>ROI Calculator</p>
          <h1 className={styles.headline}>
            The real cost of slow creative feedback
          </h1>
          <p className={styles.subhead}>
            Pick your team, drag the slider, and watch how much revenue leaks
            out of every drawn-out round of review.
          </p>
        </div>
      </section>

      <section className={styles.stage} data-section="calculator-stage">
        <div className={styles.stageInner}>
          <div className={styles.display}>
            <div className={styles.valueWrap}>
              {showLost && moneyLost > 0 ? (
                <span className={styles.valueGhost} aria-hidden="true">
                  Money Lost
                </span>
              ) : null}
              <p
                className={`${styles.value} ${
                  showLost ? styles.valueLost : ""
                }`}
                aria-live="polite"
              >
                {displayValue}
              </p>
            </div>
            <p className={styles.formula}>
              {showLost ? (
                <>
                  Team&rsquo;s rate
                  <span className={styles.formulaOperator}>&times;</span>
                  Number of hours
                  <span className={styles.formulaOperator}>=</span>
                  <span className={styles.formulaResult}>{displayValue}</span>
                </>
              ) : (
                IDLE_FORMULA_TEXT
              )}
            </p>
          </div>

          <div
            className={`${styles.roles} ${showLost ? "" : styles.rolesHidden}`}
          >
            {ROLES.map((role, index) => {
              const isActive = activeRoles.has(index);
              return (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => toggleRole(index)}
                  aria-pressed={isActive}
                  className={`${styles.roleChip} ${
                    isActive ? styles.roleChipActive : ""
                  }`}
                  style={{ "--role-color": role.color } as React.CSSProperties}
                >
                  <span className={styles.roleDot} aria-hidden="true" />
                  <span className={styles.roleName}>{role.name}</span>
                  <span className={styles.roleRate}>${role.rate}/hr</span>
                </button>
              );
            })}
          </div>

          <HoursSlider
            stops={STOPS}
            activeIndex={hoursIndex}
            onSelect={setHoursIndex}
          />

          <p className={styles.hoursLabel}>Hours spent on feedback</p>

          <div className={styles.ctaButtons}>
            <a
              className={`${styles.btn} ${styles.btnOutline}`}
              href={BOOK_DEMO_URL}
            >
              Book a demo
            </a>
            <a className={`${styles.btn} ${styles.btnFilled}`} href={SIGNUP_URL}>
              Try Superflow for free
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Discrete-stop hours slider driving the calculator's hours input. */
function HoursSlider({
  stops,
  activeIndex,
  onSelect,
}: {
  stops: readonly HourStop[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  /** Left offset (%) of the stop at the given index along the track. */
  function positionFor(index: number): string {
    try {
      return `${(index / (stops.length - 1)) * 100}%`;
    } catch {
      return "0%";
    }
  }

  return (
    <div className={styles.slider}>
      <div className={styles.track}>
        <div className={styles.trackLine} aria-hidden="true" />
        {stops.map((stop, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${stop.top}-${stop.bottom}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`${stop.top} ${stop.bottom}`}
              className={styles.stop}
              style={{ left: positionFor(index) }}
            >
              {isActive ? (
                <span className={styles.thumb}>
                  <ChatBubbleIcon />
                </span>
              ) : (
                <span className={styles.thumbDot} />
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.stopLabels}>
        {stops.map((stop, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`label-${stop.top}-${stop.bottom}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`${styles.stopLabel} ${
                isActive ? styles.stopLabelActive : ""
              }`}
              style={{ left: positionFor(index) }}
            >
              <span className={styles.stopLabelTop}>{stop.top}</span>
              <span className={styles.stopLabelBottom}>{stop.bottom}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
