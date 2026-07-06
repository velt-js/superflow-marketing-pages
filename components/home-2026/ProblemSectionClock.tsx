"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import styles from "./ProblemSection.module.css";

/**
 * Exact copy taken from the Figma "02 / Problem Section" node (582:3592).
 * "loosing" and the double space before "~$12K" are reproduced verbatim
 * from the design; do not "fix" them without a copy change in Figma.
 */
const HEADLINE_COPY = {
  titleLineOne: "You are loosing  ~$12K",
  titleLineTwo: "due to manual QA",
  subtitle: "And still end up with mistakes, Stop living in past",
} as const;

/* ------------------------------------------------------------------ */
/* Decorative dial geometry                                            */
/* ------------------------------------------------------------------ */

const DIAL_VIEWBOX = 640;
const DIAL_CENTER = DIAL_VIEWBOX / 2;
const TICK_OUTER_RADIUS = 300;
const TICK_MINOR_INNER_RADIUS = 288;
const TICK_MAJOR_INNER_RADIUS = 276;
const NUMBER_RADIUS = 244;
const RED_ARC_RADIUS = 300;
const RED_ARC_END_DEGREES = 150;
const TOTAL_TICKS = 60;
const TICKS_PER_HOUR = 5;
const CLOCK_HOURS = 12;
/** Hours rendered in near-black; every other hour is tinted red (in the danger zone). */
const DARK_HOURS = new Set([10, 11]);

interface DialTick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isMajor: boolean;
}

interface DialNumber {
  hour: number;
  label: string;
  x: number;
  y: number;
  isDark: boolean;
}

/**
 * Decimal places kept on dial coordinates. Full float precision causes React
 * hydration mismatches (server and client trig differs in the last ulp);
 * three decimals are sub-pixel in a 640-unit viewBox and deterministic.
 */
const COORDINATE_PRECISION = 3;

/** Round a coordinate to the shared dial precision. */
function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_PRECISION;
  return Math.round(value * factor) / factor;
}

/**
 * Convert a clock angle (0deg = 12 o'clock, increasing clockwise) into a point
 * on a circle of the given radius, centred in the dial viewBox.
 */
function pointOnCircle(radius: number, angleDegrees: number): { x: number; y: number } {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: roundCoordinate(DIAL_CENTER + radius * Math.cos(angleRadians)),
    y: roundCoordinate(DIAL_CENTER + radius * Math.sin(angleRadians)),
  };
}

const DIAL_TICKS: DialTick[] = Array.from({ length: TOTAL_TICKS }, (_unused, index) => {
  const angleDegrees = (index / TOTAL_TICKS) * 360;
  const isMajor = index % TICKS_PER_HOUR === 0;
  const innerRadius = isMajor ? TICK_MAJOR_INNER_RADIUS : TICK_MINOR_INNER_RADIUS;
  const inner = pointOnCircle(innerRadius, angleDegrees);
  const outer = pointOnCircle(TICK_OUTER_RADIUS, angleDegrees);
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, isMajor };
});

const DIAL_NUMBERS: DialNumber[] = Array.from({ length: CLOCK_HOURS }, (_unused, index) => {
  const hour = index + 1;
  const point = pointOnCircle(NUMBER_RADIUS, hour * (360 / CLOCK_HOURS));
  return {
    hour,
    label: String(hour).padStart(2, "0"),
    x: point.x,
    y: point.y,
    isDark: DARK_HOURS.has(hour),
  };
});

const RED_ARC_PATH = (() => {
  const start = pointOnCircle(RED_ARC_RADIUS, 0);
  const end = pointOnCircle(RED_ARC_RADIUS, RED_ARC_END_DEGREES);
  const largeArcFlag = RED_ARC_END_DEGREES > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RED_ARC_RADIUS} ${RED_ARC_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
})();

/* ------------------------------------------------------------------ */
/* Scroll-scrub animation model                                        */
/* ------------------------------------------------------------------ */

/**
 * Must stay in sync with the identical media query in
 * ProblemSection.module.css: the scrub only runs when the CSS pin/override
 * styles are active (desktop widths, no reduced-motion preference).
 */
const ANIMATED_MEDIA_QUERY = "(min-width: 769px) and (prefers-reduced-motion: no-preference)";

/** Normalised pathLength set on the red arc so dashoffset maths stay simple. */
const ARC_PATH_LENGTH = 100;
/** Fraction of the 150deg red arc visible at scrub start (~30deg past 12 o'clock). */
const ARC_START_FRACTION = 0.2;
/**
 * Scrub progress at which the red arc reaches its full static length.
 * Deliberately early: the sweep is the star of the first half of the scrub,
 * leaving the tail for the headline settle and bottom fade.
 */
const ARC_END_PROGRESS = 0.6;
/**
 * Fraction of the total arc sweep consumed during the entry phase, before
 * the stage pins: the clock is already "ticking" slowly while it fades in,
 * then the remaining sweep scrubs through the pinned range as before.
 */
const ARC_ENTRY_SWEEP_FRACTION = 0.18;
/** Blur applied to the clock at intro start (eases to 0 during the intro). */
const CLOCK_INTRO_BLUR_PX = 12;
/** Scrub progress at which the clock reaches its final scale of 1. */
const SCALE_END_PROGRESS = 0.7;
/** Scrub progress range over which the bottom fade mask reaches full strength. */
const FADE_START_PROGRESS = 0.25;
const FADE_END_PROGRESS = 0.65;
/** Scrub progress range over which the headline fades/slides in. */
const HEADLINE_START_PROGRESS = 0.14;
const HEADLINE_END_PROGRESS = 0.4;
/** Upward drift (px) applied to the headline while it fades in. */
const HEADLINE_SHIFT_PX = 28;
/**
 * Scrub progress at which every numeral flips to its final colour. By this
 * point the bottom-fade overlay is at full strength, so the numerals beyond
 * the arc's reach (04-09, hidden in the faded zone) flip invisibly.
 */
const NUMBERS_END_PROGRESS = 0.75;
/** Angular size of one clock hour in degrees. */
const DEGREES_PER_HOUR = 360 / CLOCK_HOURS;
/**
 * A numeral tints only once the arc tip moves strictly past its hour angle;
 * without this epsilon the start-frame stub (which ends exactly on the
 * 1 o'clock angle) would already tint "01".
 */
const ARC_TIP_EPSILON_DEGREES = 0.5;
/** Start-of-scrub clock scale bounds; the exact value adapts to the viewport. */
const MIN_START_SCALE = 1.2;
const MAX_START_SCALE = 2.6;
/**
 * At scrub start the full clock face (including the arc stub at 12) must be
 * visible, so the start scale fits the circle to this fraction of the
 * viewport height. On narrow/tall windows the circle still bleeds
 * horizontally past the viewport edges.
 */
const START_HEIGHT_FACTOR = 0.96;
/** The clock circle's diameter as a fraction of the square dial box. */
const CIRCLE_DIAMETER_FRACTION = (TICK_OUTER_RADIUS * 2) / DIAL_VIEWBOX;

/**
 * Map overall scrub progress onto a sub-range, clamped to [0, 1].
 * Linear on purpose: scrubbed animations should track the scroll position.
 */
function mapProgress(progress: number, rangeStart: number, rangeEnd: number): number {
  if (progress <= rangeStart) {
    return 0;
  }
  if (progress >= rangeEnd) {
    return 1;
  }
  return (progress - rangeStart) / (rangeEnd - rangeStart);
}

interface ProblemSectionClockProps {
  /** id applied to the h2 so the parent section's aria-labelledby resolves. */
  headingId: string;
}

/**
 * Scroll-scrubbed clock-gauge hero for the Problem section.
 *
 * Renders the dial + serif headline inside a tall scroll track with a sticky
 * full-viewport stage. As the user scrolls through the track, a rAF-throttled
 * scroll handler writes CSS custom properties (clock scale, red-arc
 * stroke-dashoffset, bottom-fade opacity, headline opacity/shift) onto the
 * stage, and flips clock numerals to their final colours in clockwise order.
 *
 * All animated styles live behind a desktop + no-reduced-motion media query
 * whose custom-property defaults equal the final frame, so mobile,
 * prefers-reduced-motion and no-JS visitors get the original static design.
 */
export default function ProblemSectionClock({ headingId }: ProblemSectionClockProps): ReactElement {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dialRef = useRef<HTMLDivElement | null>(null);
  // Server render + all fallbacks show the final state: every hour swept.
  const [sweptHours, setSweptHours] = useState(CLOCK_HOURS);

  useEffect(() => {
    const trackElement = trackRef.current;
    const stageElement = stageRef.current;
    const dialElement = dialRef.current;
    if (!trackElement || !stageElement || !dialElement) {
      return;
    }

    const animatedMedia = window.matchMedia(ANIMATED_MEDIA_QUERY);
    let frameId = 0;

    const applyFinalState = (): void => {
      const scrubProperties = [
        "--clock-scale",
        "--clock-shift",
        "--clock-opacity",
        "--clock-blur",
        "--arc-offset",
        "--fade-opacity",
        "--headline-opacity",
        "--headline-shift",
      ];
      for (const propertyName of scrubProperties) {
        stageElement.style.removeProperty(propertyName);
      }
      setSweptHours(CLOCK_HOURS);
    };

    const update = (): void => {
      const trackRect = trackElement.getBoundingClientRect();
      const scrollableDistance = trackRect.height - window.innerHeight;
      if (scrollableDistance <= 0) {
        applyFinalState();
        return;
      }
      const progress = Math.min(1, Math.max(0, -trackRect.top / scrollableDistance));

      // Entry progress covers the pre-pin phase: 0 when the stage's top edge
      // is at the viewport bottom (the clock's area starts entering), 1 when
      // the stage pins at the viewport top (the clock is fully in view).
      const entryProgress = Math.min(
        1,
        Math.max(0, (window.innerHeight - trackRect.top) / window.innerHeight),
      );

      // Fit the full clock circle to the viewport height at scrub start so
      // the arc stub at 12 o'clock is on screen from the first frame.
      const dialWidth = dialElement.offsetWidth || 1;
      const circleDiameter = dialWidth * CIRCLE_DIAMETER_FRACTION;
      const startScale = Math.min(
        MAX_START_SCALE,
        Math.max(MIN_START_SCALE, (window.innerHeight * START_HEIGHT_FACTOR) / circleDiameter),
      );
      const scaleProgress = mapProgress(progress, 0, SCALE_END_PROGRESS);
      const clockScale = startScale + (1 - startScale) * scaleProgress;

      // The dial's layout box is untransformed (transforms don't move the
      // scale origin at its centre), so the hero's layout position gives the
      // circle centre. Measure it relative to the stage (not the viewport):
      // the intro fade now starts before the stage pins, and viewport-based
      // maths would yank the still-entering clock up to the viewport centre.
      const heroElement = dialElement.parentElement;
      const stageTop = stageElement.getBoundingClientRect().top;
      const heroTop = heroElement ? heroElement.getBoundingClientRect().top : 0;
      const pinnedCircleCenterY = heroTop - stageTop + dialElement.offsetHeight / 2;
      const startShift = window.innerHeight / 2 - pinnedCircleCenterY;
      const clockShift = startShift * (1 - scaleProgress);

      // The sweep starts ticking during entry (first ARC_ENTRY_SWEEP_FRACTION
      // of it) and scrubs the remainder through the pinned range.
      const pinnedArcProgress = mapProgress(progress, 0, ARC_END_PROGRESS);
      const arcProgress =
        ARC_ENTRY_SWEEP_FRACTION * entryProgress +
        (1 - ARC_ENTRY_SWEEP_FRACTION) * pinnedArcProgress;
      const arcVisibleFraction = ARC_START_FRACTION + (1 - ARC_START_FRACTION) * arcProgress;

      const fadeOpacity = mapProgress(progress, FADE_START_PROGRESS, FADE_END_PROGRESS);
      const headlineProgress = mapProgress(progress, HEADLINE_START_PROGRESS, HEADLINE_END_PROGRESS);

      // The blur-fade tracks the entry directly, so the dial materialises
      // progressively as its area scrolls in and is fully sharp by the pin.
      const clockIntro = entryProgress;

      stageElement.style.setProperty("--clock-scale", clockScale.toFixed(4));
      stageElement.style.setProperty("--clock-shift", `${clockShift.toFixed(2)}px`);
      stageElement.style.setProperty("--clock-opacity", clockIntro.toFixed(3));
      stageElement.style.setProperty(
        "--clock-blur",
        `${((1 - clockIntro) * CLOCK_INTRO_BLUR_PX).toFixed(2)}px`,
      );
      stageElement.style.setProperty(
        "--arc-offset",
        ((1 - arcVisibleFraction) * ARC_PATH_LENGTH).toFixed(2),
      );
      stageElement.style.setProperty("--fade-opacity", fadeOpacity.toFixed(3));
      stageElement.style.setProperty("--headline-opacity", headlineProgress.toFixed(3));
      stageElement.style.setProperty(
        "--headline-shift",
        `${((1 - headlineProgress) * HEADLINE_SHIFT_PX).toFixed(2)}px`,
      );

      // Numerals tint as the arc tip sweeps past them; the ones the arc
      // never reaches flip near the end, hidden behind the bottom fade.
      if (progress >= NUMBERS_END_PROGRESS) {
        setSweptHours(CLOCK_HOURS);
      } else {
        const arcTipDegrees = arcVisibleFraction * RED_ARC_END_DEGREES;
        setSweptHours(
          Math.max(0, Math.floor((arcTipDegrees - ARC_TIP_EPSILON_DEGREES) / DEGREES_PER_HOUR)),
        );
      }
    };

    const scheduleUpdate = (): void => {
      if (frameId === 0) {
        frameId = requestAnimationFrame(() => {
          frameId = 0;
          update();
        });
      }
    };

    const enableScrubbing = (): void => {
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
      window.addEventListener("resize", scheduleUpdate);
      update();
    };

    const disableScrubbing = (): void => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      applyFinalState();
    };

    const handleMediaChange = (): void => {
      if (animatedMedia.matches) {
        enableScrubbing();
      } else {
        disableScrubbing();
      }
    };

    animatedMedia.addEventListener("change", handleMediaChange);
    handleMediaChange();

    return () => {
      animatedMedia.removeEventListener("change", handleMediaChange);
      disableScrubbing();
    };
  }, []);

  return (
    <div className={styles.scrollTrack} ref={trackRef}>
      <div className={styles.pinnedStage} ref={stageRef}>
        <div className={styles.hero}>
          <div className={styles.dial} aria-hidden="true" ref={dialRef}>
            <svg
              className={styles.dialSvg}
              viewBox={`0 0 ${DIAL_VIEWBOX} ${DIAL_VIEWBOX}`}
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              {DIAL_TICKS.map((tick, index) => (
                <line
                  key={index}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  className={tick.isMajor ? styles.dialTickMajor : styles.dialTick}
                />
              ))}
              <path d={RED_ARC_PATH} pathLength={ARC_PATH_LENGTH} className={styles.dialArc} />
              {DIAL_NUMBERS.map((clockNumber) => {
                // "12" sits at the arc's origin, so it is red from the very start.
                const isSwept =
                  clockNumber.hour === CLOCK_HOURS || clockNumber.hour <= sweptHours;
                const sweptClass = clockNumber.isDark ? styles.dialNumberDark : styles.dialNumber;
                return (
                  <text
                    key={clockNumber.label}
                    x={clockNumber.x}
                    y={clockNumber.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={isSwept ? sweptClass : styles.dialNumberIdle}
                  >
                    {clockNumber.label}
                  </text>
                );
              })}
            </svg>
            <span className={styles.dialFade} />
          </div>

          <div className={styles.headline}>
            <h2 id={headingId} className={styles.headlineTitle}>
              {HEADLINE_COPY.titleLineOne}
              <br />
              {HEADLINE_COPY.titleLineTwo}
            </h2>
            <p className={styles.headlineSubtitle}>{HEADLINE_COPY.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
