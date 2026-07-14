"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";
import BrowserChrome from "../feature-artifacts/BrowserChrome";
import styles from "./MemoryUploadArtifact.module.css";

/**
 * Hero tab artifact — "Upload once" (memory feature page, tab id `upload-once`).
 *
 * Tells the Memory story in one looping browser window: a client file is
 * dropped in, its bits stream out and are saved into Memory, and then insights
 * surface back out of Memory. Three phases drive it:
 *
 *   1. `drop`     — a PDF file drops into the window.
 *   2. `save`     — its binary bits stream rightward while a pink
 *                   "Saved to memory" pill lands.
 *   3. `insights` — the upload scene fades out and an "Insights from memory"
 *                   pill fans down a branch into three "Superflow Memory" cards.
 *
 * The phase is held on the root as `data-phase`; the CSS module keys every
 * element's entrance/stream animation off it, so nothing is re-mounted between
 * phases. Under `prefers-reduced-motion: reduce` the loop is disabled and the
 * scene rests on the settled `save` frame (file uploaded, bits saved).
 *
 * The root is the white inner card; the shared `.window` frame in
 * {@link ../HeroWorkflowShowcase} supplies the surrounding 2px black reveal.
 */

const ADDRESS = "SUPERFLOW";
const PDF_LABEL = "PDF";
const SAVED_LABEL = "Saved to memory";
const INSIGHTS_LABEL = "Insights from memory";
const MEMORY_SOURCE = "Superflow Memory";

/**
 * Distinct remembered facts surfaced in the insights scene. Every card is the
 * Memory speaking (same {@link MEMORY_SOURCE} author + brain avatar), but each
 * recalls a different learned brand preference so the branch fans into three
 * unique insights rather than repeating one.
 */
const FACT_SANS_SERIF = "Client prefers sans-serif fonts";
const FACT_SENTENCE_CASE = "Sentence case is always rejected";
const FACT_LOGO_CLEAR_SPACE = "Logos need 24px of clear space";

/** Ordered phases of the upload \u2192 memory \u2192 insights loop. */
const PHASES = ["drop", "save", "insights"] as const;

/** One phase of the choreography. */
type Phase = (typeof PHASES)[number];

/** How long (ms) each phase dwells before advancing to the next. */
const PHASE_DURATION_MS: Readonly<Record<Phase, number>> = {
  drop: 1200,
  save: 2600,
  insights: 3400,
};

/** Settled phase used when animation is disabled (reduced motion). */
const STATIC_PHASE: Phase = "save";

/**
 * Rows of binary digits that stream out of the file into Memory. Fixed (never
 * random) so server and client render identically — no hydration mismatch.
 */
const BIT_ROWS: readonly string[] = [
  "1010101010101010101",
  "1010011101101001110",
  "1010101010101010101",
  "1010011101101001110",
  "1010101010101010101",
];

/** One remembered insight rendered as a "Superflow Memory" card. */
interface MemoryInsight {
  /** Stable React key and per-card stagger identity. */
  id: string;
  /** The remembered fact shown as the card body. */
  fact: string;
  /** Relative timestamp shown in the card header (e.g. "3h", "1d"). */
  time: string;
}

/** Three distinct memory cards shown in the insights scene. */
const MEMORY_CARDS: readonly MemoryInsight[] = [
  { id: "card-1", fact: FACT_SANS_SERIF, time: "3h" },
  { id: "card-2", fact: FACT_SENTENCE_CASE, time: "1d" },
  { id: "card-3", fact: FACT_LOGO_CLEAR_SPACE, time: "2d" },
];

/** Tabler `brain` glyph geometry (24×24), inlined so no icon dep is added. */
const BRAIN_PATHS: readonly string[] = [
  "M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8",
  "M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8",
  "M17.5 16a3.5 3.5 0 0 0 0 -7h-.5",
  "M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0",
  "M6.5 16a3.5 3.5 0 0 1 0 -7h.5",
  "M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10",
];

/** Local icon props: an optional pixel size plus native SVG attributes. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Superflow Memory brand glyph — the pink Tabler `brain` mark carried by both
 * pills and every memory card. Exported so other Memory-themed artifacts (e.g.
 * the "Learning from reviews" memory pill) reuse the exact same glyph rather
 * than re-drawing it.
 *
 * @param props - Optional `size` (defaults to 20) and SVG attributes.
 * @returns The brain `<svg>`, or `null` on failure.
 */
export function BrainGlyph({ size = 20, ...rest }: IconProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {BRAIN_PATHS.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Horizontal three-dot overflow glyph on each memory card header.
 *
 * @param props - Optional `size` (defaults to 18) and SVG attributes.
 * @returns The dots `<svg>`, or `null` on failure.
 */
function DotsIcon({ size = 18, ...rest }: IconProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Resolve the tone class for one bit, so the stream carries the same
 * blue/coral/grey speckle as the design without any randomness.
 *
 * @param rowIndex - Zero-based row of the bit grid.
 * @param colIndex - Zero-based column of the bit grid.
 * @returns The CSS module class for that bit's colour.
 */
function bitToneClass(rowIndex: number, colIndex: number): string {
  try {
    if ((rowIndex + colIndex) % 7 === 0) {
      return styles.bitBlue;
    }
    if ((rowIndex * 3 + colIndex) % 11 === 0) {
      return styles.bitCoral;
    }
    return styles.bitGrey;
  } catch {
    return styles.bitGrey;
  }
}

/** Sheet SVG viewBox height ÷ width — used to keep a resized sheet in ratio. */
const PDF_SHEET_ASPECT = 202 / 190;

/**
 * Colour tint for the dog-eared {@link PdfFile} sheet — the body gradient,
 * outline, folded-corner gradient, and the fold's drop-shadow. Lets callers
 * recolour the sheet (e.g. blue / pink / green guideline stacks) while keeping
 * the exact silhouette.
 */
export interface PdfFileTint {
  /** Sheet body gradient — top stop. */
  bodyFrom: string;
  /** Sheet body gradient — bottom stop. */
  bodyTo: string;
  /** Sheet body outline stroke. */
  stroke: string;
  /** Folded-corner gradient — top stop. */
  foldFrom: string;
  /** Folded-corner gradient — bottom stop. */
  foldTo: string;
  /** Flood colour of the fold's soft drop-shadow. */
  shadow: string;
}

/**
 * The sheet's original blue/lavender tint. Used when a caller passes no `tint`,
 * so every existing `<PdfFile />` renders exactly as before.
 */
export const DEFAULT_PDF_TINT: PdfFileTint = {
  bodyFrom: "#f5f8ff",
  bodyTo: "#e6edff",
  stroke: "#e4eaf8",
  foldFrom: "#d3ddf2",
  foldTo: "#bacce6",
  shadow: "#7f95c6",
};

/** Props for the shared dog-eared {@link PdfFile} sheet. */
export interface PdfFileProps {
  /**
   * Wordmark overlaid on the sheet (defaults to {@link PDF_LABEL} — "PDF").
   * Accepts a node so callers can render a two-line label (e.g. `Brand<br/>
   * Guideline`).
   */
  label?: ReactNode;
  /**
   * Prefix for the sheet's SVG gradient/filter ids so multiple sheets on one
   * page never collide on `url(#id)` references (defaults to `"mem"`, the
   * hero's original ids).
   */
  idPrefix?: string;
  /** Optional sheet width in px; the height keeps the sheet's aspect ratio. */
  width?: number;
  /** Optional inline overrides for the wordmark (colour, size, wrapping…). */
  labelStyle?: CSSProperties;
  /** Optional extra class on the sheet wrapper. */
  className?: string;
  /**
   * Optional colour tint for the sheet (defaults to {@link DEFAULT_PDF_TINT},
   * the original blue/lavender look).
   */
  tint?: PdfFileTint;
}

/**
 * The dropped client file — a soft, dog-eared PDF sheet. The sheet body and its
 * folded/curled top-right corner are drawn as one inline SVG (rounded body with
 * a cut corner, a gradient fold with a rounded crease and a soft cast shadow);
 * the wordmark is overlaid so it uses the site font.
 *
 * Exported (and prop-driven) so other Memory-themed artifacts reuse the exact
 * same sheet: pass a `label` (e.g. "Brand Guidelines"), a unique `idPrefix`
 * (to keep the gradient/filter ids collision-free when two sheets render), an
 * optional `width`, and `labelStyle` overrides. All props are optional so the
 * hero's `<PdfFile />` renders exactly as before.
 *
 * @param props - Optional {@link PdfFileProps}.
 * @returns The PDF file element, or `null` on failure.
 */
export function PdfFile({
  label = PDF_LABEL,
  idPrefix = "mem",
  width,
  labelStyle,
  className,
  tint = DEFAULT_PDF_TINT,
}: PdfFileProps = {}): ReactNode {
  try {
    const bodyId = `${idPrefix}PdfBody`;
    const foldId = `${idPrefix}PdfFold`;
    const foldShadowId = `${idPrefix}PdfFoldShadow`;
    const wrapClassName = className ? `${styles.pdf} ${className}` : styles.pdf;
    const wrapStyle: CSSProperties | undefined =
      typeof width === "number"
        ? { width, height: width * PDF_SHEET_ASPECT }
        : undefined;
    return (
      <div className={wrapClassName} style={wrapStyle} aria-hidden="true">
        <svg
          className={styles.pdfSheet}
          viewBox="0 0 190 202"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={bodyId}
              x1="95"
              y1="0"
              x2="95"
              y2="202"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={tint.bodyFrom} />
              <stop offset="1" stopColor={tint.bodyTo} />
            </linearGradient>
            <linearGradient
              id={foldId}
              x1="138"
              y1="0"
              x2="178"
              y2="52"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={tint.foldFrom} />
              <stop offset="1" stopColor={tint.foldTo} />
            </linearGradient>
            <filter
              id={foldShadowId}
              x="-50%"
              y="-50%"
              width="200%"
              height="220%"
            >
              <feDropShadow
                dx="-2"
                dy="3"
                stdDeviation="3"
                floodColor={tint.shadow}
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <path
            d="M26 0 H138 L190 52 V176 A26 26 0 0 1 164 202 H26 A26 26 0 0 1 0 176 V26 A26 26 0 0 1 26 0 Z"
            fill={`url(#${bodyId})`}
            stroke={tint.stroke}
            strokeWidth="1"
          />
          <path
            d="M26 2 H130"
            stroke="#ffffff"
            strokeOpacity="0.8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M138 8 L138 52 L190 52 L144 6 Q138 0 138 8 Z"
            fill={`url(#${foldId})`}
            filter={`url(#${foldShadowId})`}
          />
        </svg>
        <span className={styles.pdfLabel} style={labelStyle}>
          {label}
        </span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The binary bit grid streaming out of the file. Each bit carries its column
 * index as `--col` so the CSS wave lights columns left-to-right (into Memory).
 *
 * @returns The bit-stream element, or `null` on failure.
 */
function BitStream(): ReactNode {
  try {
    return (
      <div className={styles.bits} aria-hidden="true">
        {BIT_ROWS.map((row, rowIndex) => (
          <div className={styles.bitRow} key={`row-${rowIndex}`}>
            {row.split("").map((digit, colIndex) => (
              <span
                key={`bit-${rowIndex}-${colIndex}`}
                className={`${styles.bit} ${bitToneClass(rowIndex, colIndex)}`}
                style={{ "--col": colIndex } as CSSProperties}
              >
                {digit}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for the shared {@link MemoryPill}. */
export interface MemoryPillProps {
  /** The pill's text. */
  label: string;
  /** Optional extra class for phase/entrance styling. */
  className?: string;
  /**
   * Render the neutral white / title-case variant (soft white shell, dark
   * un-transformed text) instead of the default pink-gradient uppercase pill.
   * Used by feature-section memory artifacts whose pill copy is sentence-cased.
   */
  plain?: boolean;
  /**
   * Render the rounded-rectangle "memory card" look (a thin-bordered white card
   * with a tight shadow and 20px sentence-cased label) instead of the fully
   * rounded pill. Implies the plain white shell. Used by the scoped-memory
   * feature artifacts for the "32 Learnings in Memory" / "Organization Memory"
   * cards. Backward compatible: existing callers omit it and are unaffected.
   */
  card?: boolean;
  /** Brain mark size in px (defaults to 20). */
  markSize?: number;
}

/**
 * A Memory pill — the brand brain mark beside a label. The default pink-gradient
 * uppercase pill is used for "Saved to memory" / "Insights from memory"; the
 * opt-in {@link MemoryPillProps.plain} variant renders a soft white pill with
 * dark, sentence-cased text for feature-section artifacts; the opt-in
 * {@link MemoryPillProps.card} variant renders a thin-bordered rounded-rectangle
 * memory card (also white/sentence-cased) for the scoped-memory artifacts.
 *
 * @param props - {@link MemoryPillProps}.
 * @returns The pill element, or `null` on failure.
 */
export function MemoryPill({
  label,
  className,
  plain = false,
  card = false,
  markSize = 20,
}: MemoryPillProps): ReactNode {
  try {
    // The card variant is a specialised plain pill, so it inherits the white
    // shell before layering the rounded-rectangle card overrides on top.
    const usePlainShell = plain || card;
    const pillClasses = [styles.pill];
    if (usePlainShell) {
      pillClasses.push(styles.pillPlain);
    }
    if (card) {
      pillClasses.push(styles.pillCard);
    }
    if (className) {
      pillClasses.push(className);
    }
    const textClasses = [styles.pillText];
    if (usePlainShell) {
      textClasses.push(styles.pillTextPlain);
    }
    if (card) {
      textClasses.push(styles.pillTextCard);
    }
    const textClassName = textClasses.join(" ");
    return (
      <span className={pillClasses.join(" ")}>
        <span className={styles.pillMark}>
          <BrainGlyph size={markSize} />
        </span>
        <span className={textClassName}>{label}</span>
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * The dashed-free branch that fans from the insights pill into the three memory
 * cards. Uses a non-scaling stroke so the light connector stays crisp as the
 * SVG stretches to the cards' width.
 *
 * @returns The branch `<svg>`, or `null` on failure.
 */
function BranchVector(): ReactNode {
  try {
    return (
      <svg
        className={styles.branch}
        viewBox="0 0 720 92"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M360 0 V92"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M113 92 V60 Q113 46 127 46 H593 Q607 46 607 60 V92"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * A single "Superflow Memory" insight card: the brand header (mark, source,
 * time, overflow) above the remembered fact.
 *
 * @param root0 - Card props.
 * @param root0.insight - The remembered fact + timestamp for this card.
 * @param root0.index - Zero-based position, forwarded as `--card` for the
 *   staggered rise-in.
 * @returns The card element, or `null` on failure.
 */
function MemoryCard({
  insight,
  index,
}: {
  insight: MemoryInsight;
  index: number;
}): ReactNode {
  try {
    return (
      <article
        className={styles.card}
        style={{ "--card": index } as CSSProperties}
      >
        <header className={styles.cardHead}>
          <span className={styles.cardMark}>
            <BrainGlyph size={18} />
          </span>
          <span className={styles.cardSource}>{MEMORY_SOURCE}</span>
          <span className={styles.cardTime}>{insight?.time}</span>
          <span className={styles.cardMenu}>
            <DotsIcon size={18} />
          </span>
        </header>
        <p className={styles.cardFact}>{insight?.fact}</p>
      </article>
    );
  } catch {
    return null;
  }
}

/**
 * The upload scene (phases `drop` + `save`): the PDF, the bit stream flowing
 * into Memory, and the "Saved to memory" pill.
 *
 * @returns The upload-scene element, or `null` on failure.
 */
function UploadScene(): ReactNode {
  try {
    return (
      <div className={styles.uploadScene}>
        <div className={styles.uploadRow}>
          <PdfFile />
          <BitStream />
          <MemoryPill label={SAVED_LABEL} className={styles.savedPill} />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The insights scene (phase `insights`): the "Insights from memory" pill, the
 * branch, and the three remembered-fact cards.
 *
 * @returns The insights-scene element, or `null` on failure.
 */
function InsightsScene(): ReactNode {
  try {
    return (
      <div className={styles.insightsScene}>
        <div className={styles.insightsInner}>
          <MemoryPill label={INSIGHTS_LABEL} className={styles.insightsPill} />
          <div className={styles.branchWrap}>
            <BranchVector />
          </div>
          <div className={styles.cards}>
            {MEMORY_CARDS.map((card, index) => (
              <MemoryCard key={card?.id} insight={card} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Upload once" memory hero artifact and drive its looping phase
 * machine.
 *
 * @returns The memory upload window contents, or `null` on failure.
 */
export default function MemoryUploadArtifact(): ReactNode {
  const [phase, setPhase] = useState<Phase>(PHASES[0]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(query.matches);
      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };
      query.addEventListener("change", handleChange);
      return () => query.removeEventListener("change", handleChange);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    try {
      if (prefersReducedMotion) {
        setPhase(STATIC_PHASE);
        return undefined;
      }

      let phaseIndex = 0;
      let timerId = 0;

      const scheduleNext = () => {
        try {
          phaseIndex = (phaseIndex + 1) % PHASES.length;
          const nextPhase = PHASES[phaseIndex];
          setPhase(nextPhase);
          timerId = window.setTimeout(scheduleNext, PHASE_DURATION_MS[nextPhase]);
        } catch {
          /* leave the current phase in place on failure */
        }
      };

      setPhase(PHASES[0]);
      timerId = window.setTimeout(scheduleNext, PHASE_DURATION_MS[PHASES[0]]);
      return () => window.clearTimeout(timerId);
    } catch {
      return undefined;
    }
  }, [prefersReducedMotion]);

  try {
    return (
      <div
        className={styles.root}
        data-artifact="memory-upload"
        data-phase={phase}
      >
        <div className={styles.chromeWrap}>
          <BrowserChrome className={styles.chrome} address={ADDRESS} />
        </div>
        <div className={styles.stage}>
          <UploadScene />
          <InsightsScene />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
