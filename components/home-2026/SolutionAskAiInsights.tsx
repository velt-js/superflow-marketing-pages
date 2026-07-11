"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./SolutionSection.module.css";

/**
 * Ask AI "graphs → insight" variant of the Solution-section flow diagram.
 *
 * A column of three minimal graph tiles on the left (a bar chart, a donut and a
 * sparkline) feeds — through a dashed connector with a traveling data pulse — a
 * single insight card on the right, styled like an Ask AI answer (blue sphere
 * avatar + one plain-language takeaway). The card cycles through one insight per
 * graph; the active insight highlights its source tile, so the whole thing reads
 * as "a graph becomes a sentence". All motion is gated behind
 * `prefers-reduced-motion`, and the entrance reuses the section's shared
 * `.revealItem` mechanism so it stays in step with the blueprint-frame draw.
 */

/** CSS custom property consumed by the shared reveal animation delays. */
const REVEAL_DELAY_VAR = "--sol-reveal-delay";
/** Per-tile accent, read by the mini charts + active highlight ring. */
const TILE_ACCENT_VAR = "--sol-insight-accent";

/** Milliseconds each insight stays active before advancing to the next. */
const CYCLE_MS = 2800;

/* Reveal delays (ms) sequencing the diagram left-to-right, matching the tail of
   the blueprint-frame draw used by the other Solution variants. */
const REVEAL_TILE_BASE_MS = 520;
const REVEAL_TILE_STEP_MS = 120;
const REVEAL_CONNECTOR_MS = 950;
const REVEAL_INSIGHT_MS = 1100;

/**
 * Build the inline style that staggers one element's entrance reveal.
 *
 * @param delayMs - Milliseconds to wait after the section reveal triggers.
 * @returns The inline style carrying the reveal-delay custom property.
 */
function revealDelayStyle(delayMs: number): CSSProperties {
  try {
    return { [REVEAL_DELAY_VAR]: `${delayMs}ms` } as CSSProperties;
  } catch {
    return {};
  }
}

/** Which minimal chart a tile renders. */
type GraphKind = "bars" | "donut" | "line";

/** One graph tile paired with the insight it resolves into. */
export interface InsightSpec {
  id: string;
  kind: GraphKind;
  /** Short label shown beside the mini chart. */
  label: string;
  /** Accent colour shared by the chart and the highlighted insight. */
  accent: string;
  /** The plain-language takeaway shown in the insight card. */
  insight: ReactNode;
}

/** Default label above the insight card's takeaway. */
const DEFAULT_INSIGHT_LABEL = "Insight";

/** Bar heights (percent of the mini chart) for the "rounds by client" tile. */
const BAR_HEIGHTS: readonly number[] = [42, 100, 64, 50];

/** Donut fill fraction (percent) for the "copy vs bug" tile. */
const DONUT_FILL = 68;

/** Polyline points (0–44 × 0–40 viewbox) for the "review trend" tile. */
const LINE_POINTS = "2,32 12,26 22,28 32,14 42,6";

/** The three graph→insight pairs cycled by the card. */
const INSIGHT_SPECS: readonly InsightSpec[] = [
  {
    id: "rounds",
    kind: "bars",
    label: "Rounds by client",
    accent: "#ff5352",
    insight: (
      <>
        <strong>Northwind</strong> takes 2× the review rounds of any other
        client.
      </>
    ),
  },
  {
    id: "mix",
    kind: "donut",
    label: "Copy vs bug",
    accent: "#433df3",
    insight: (
      <>
        <strong>68%</strong> of Acme&rsquo;s issues are copy, not bugs.
      </>
    ),
  },
  {
    id: "trend",
    kind: "line",
    label: "Review trend",
    accent: "#109534",
    insight: (
      <>
        Review load is <strong>up 40%</strong> this quarter.
      </>
    ),
  },
];

/**
 * Detect whether the user prefers reduced motion (so the insight cycling and
 * traveling pulse can be disabled). SSR-safe: assumes motion is allowed until
 * the client effect confirms otherwise.
 *
 * @returns True when the user has requested reduced motion.
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    try {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReduced(query.matches);
      const onChange = (event: MediaQueryListEvent) =>
        setPrefersReduced(event.matches);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    } catch {
      return undefined;
    }
  }, []);
  return prefersReduced;
}

/**
 * Render the minimal chart for a tile (bars, donut or sparkline). All charts
 * inherit the tile accent via {@link TILE_ACCENT_VAR}.
 *
 * @param props.kind - Which chart to draw.
 * @returns The mini-chart element, or `null` when the kind is unknown.
 */
function MiniGraph({ kind }: { kind: GraphKind }): ReactNode {
  try {
    if (kind === "bars") {
      return (
        <span className={styles.miniBars} aria-hidden="true">
          {BAR_HEIGHTS.map((height, barIndex) => (
            <span
              key={`bar-${barIndex}`}
              className={styles.miniBar}
              style={{ height: `${height}%` }}
            />
          ))}
        </span>
      );
    }
    if (kind === "donut") {
      return (
        <span
          className={styles.miniDonut}
          style={{ [`--sol-donut-fill` as string]: `${DONUT_FILL}%` } as CSSProperties}
          aria-hidden="true"
        />
      );
    }
    if (kind === "line") {
      return (
        <svg
          className={styles.miniLine}
          viewBox="0 0 44 40"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <polyline
            points={LINE_POINTS}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Dashed, right-pointing connector carrying a looping "data pulse" from the
 * graph stack into the insight card. Rotates vertical on narrow viewports via
 * the CSS module, and reveals with a left-to-right wipe.
 *
 * @returns The connector element.
 */
function InsightConnector(): ReactNode {
  return (
    <div
      className={`${styles.connector} ${styles.insightsConnector} ${styles.revealConnector}`}
      style={revealDelayStyle(REVEAL_CONNECTOR_MS)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 16" fill="none">
        <line
          x1="0"
          y1="8"
          x2="66"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />
        <path
          d="M62 3l6 5l-6 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.flowPulse} />
    </div>
  );
}

/** Props for the shared {@link SolutionInsightsFlow}. */
export interface SolutionInsightsFlowProps {
  /** The graph→insight pairs cycled by the card (left to right). */
  specs: readonly InsightSpec[];
  /** Label shown above the takeaway (defaults to {@link DEFAULT_INSIGHT_LABEL}). */
  insightLabel?: string;
}

/**
 * Shared "minimal graphs → single insight" Solution flow: a left column of
 * minimal graph tiles that resolve into one cycling insight card. Reused by both
 * the Ask AI ("graphs → sentence") and Analytics ("dashboard → curated weekly
 * insight") Solution variants so there is a single implementation.
 *
 * @param props - The specs to cycle and the insight-card label.
 * @returns The insights-flow element, or `null` on failure.
 */
export function SolutionInsightsFlow({
  specs,
  insightLabel = DEFAULT_INSIGHT_LABEL,
}: SolutionInsightsFlowProps): ReactNode {
  try {
    const prefersReduced = usePrefersReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const specCount = specs?.length ?? 0;

    useEffect(() => {
      if (prefersReduced || specCount <= 1) {
        setActiveIndex(0);
        return undefined;
      }
      const timer = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % specCount);
      }, CYCLE_MS);
      return () => window.clearInterval(timer);
    }, [prefersReduced, specCount]);

    const activeSpec = specs?.[activeIndex] ?? specs?.[0];
    if (!activeSpec) {
      return null;
    }

    return (
      <div className={styles.insightsFlow}>
        <div className={styles.graphStack}>
          {specs?.map((spec, specIndex) => {
            const isActive = specIndex === activeIndex;
            const tileClass = isActive
              ? `${styles.graphTile} ${styles.graphTileActive}`
              : styles.graphTile;
            return (
              <div
                key={spec?.id}
                className={`${styles.graphTileReveal} ${styles.revealItem}`}
                style={revealDelayStyle(
                  REVEAL_TILE_BASE_MS + specIndex * REVEAL_TILE_STEP_MS,
                )}
              >
                <div
                  className={tileClass}
                  style={{ [TILE_ACCENT_VAR]: spec?.accent } as CSSProperties}
                >
                  <span className={styles.graphMini}>
                    <MiniGraph kind={spec?.kind} />
                  </span>
                  <span className={styles.graphLabel}>{spec?.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <InsightConnector />

        <div
          className={`${styles.insightCard} ${styles.revealItem}`}
          style={
            {
              [`--sol-insight-accent` as string]: activeSpec?.accent,
              [REVEAL_DELAY_VAR]: `${REVEAL_INSIGHT_MS}ms`,
            } as CSSProperties
          }
        >
          <span className={styles.insightAvatar} aria-hidden="true" />
          <div className={styles.insightBody}>
            <span className={styles.insightLabel}>{insightLabel}</span>
            <p key={activeIndex} className={styles.insightText}>
              {activeSpec?.insight}
            </p>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The Ask AI Solution flow: three minimal graph tiles that resolve into a
 * cycling insight card.
 *
 * @returns The insights-flow element, or `null` on failure.
 */
export default function SolutionAskAiInsights(): ReactNode {
  return <SolutionInsightsFlow specs={INSIGHT_SPECS} />;
}
