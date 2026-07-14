"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  MemoryPill,
  PdfFile,
} from "../hero-artifacts/MemoryUploadArtifact";
import styles from "./MemoryUploadScanArtifact.module.css";

/**
 * Feature-section app-window artifact — "One-time uploads" (memory feature page,
 * `block-in` block, `one-time-uploads` tab).
 *
 * Tells the "upload a document once and Memory extracts its patterns" story in
 * one looping frame: a single large dog-eared "Brand Guidelines" sheet sits
 * centred on the white panel while a pink scan line sweeps upward across it.
 * The portion the line has already passed (below it) turns into a wireframe
 * blueprint of the sheet (outline + skeleton grid) while the not-yet-scanned
 * portion above stays the normal filled sheet — the line is the boundary. A
 * compact Memory pill sits below the sheet and reads "Extracted & Saved {N}
 * Patterns", whose {N} counts up 0 → 13 in sync with the scan progress and
 * rests at 13.
 *
 * Reuse over re-invention:
 *   - The dog-eared sheet is the shared {@link PdfFile} exported from the
 *     "Upload once" hero memory artifact, parametrised with the "Brand
 *     Guidelines" label, a unique `idPrefix` (so its gradient/filter ids never
 *     collide with the hero sheet), a larger width and a dark two-line wordmark.
 *   - The Memory pill is the shared {@link MemoryPill} (its `plain` white /
 *     sentence-case variant), carrying the counting label and the pink
 *     `BrainGlyph` mark, shrunk to a compact caption via a local class override.
 * Only the wireframe overlay and the upward scan line + clip reveal are authored
 * here (no equivalent existed to reuse).
 *
 * A single scan `progress` (0 → 1) drives everything at once, so the line, the
 * wireframe reveal and the counter never drift apart: `progress` is written to
 * the root as the `--scan` custom property each animation frame (no re-render),
 * while the integer pattern count is React state (it changes at most 14 times a
 * loop). Under `prefers-reduced-motion: reduce` — or when a fixed
 * {@link MemoryUploadScanArtifactProps.staticProgress} is supplied — the loop is
 * disabled and the scene rests on the settled frame (fully wireframed sheet,
 * scan line hidden, "Extracted & Saved 13 Patterns").
 */

/** Root attribute used to locate the artifact for screenshots/registry lookup. */
const DATA_ARTIFACT = "memory-upload-scan";

/** Wordmark shown on the uploaded sheet. */
const SHEET_LABEL = "Brand Guidelines";

/** Final/settled number of patterns extracted from the document. */
const PATTERN_COUNT = 13;

/** Pill copy template around the counting value. */
const PILL_LABEL_PREFIX = "Extracted & Saved ";
const PILL_LABEL_SUFFIX = " Patterns";

/** Sheet width in px (its height keeps the sheet's aspect ratio). */
const SHEET_WIDTH_PX = 236;

/** Visible left-anchored slice of the 1204px feature panel (the card clips the
 *  rest); the scene centres within it so it reads as centred on screen. */
const VISIBLE_FRAME_WIDTH_PX = 631;

/** Brain mark size for the compact Memory pill. */
const PILL_MARK_SIZE_PX = 18;

/** How long (ms) the scan line takes to sweep the sheet bottom → top. */
const SWEEP_DURATION_MS = 3200;

/** How long (ms) the scene rests on the settled frame before looping. */
const HOLD_DURATION_MS = 1500;

/** Full loop period (sweep + hold). */
const CYCLE_DURATION_MS = SWEEP_DURATION_MS + HOLD_DURATION_MS;

/** Phases of the scan loop, mirrored onto the root as `data-phase`. */
const SCAN_PHASE = "scan";
const SETTLE_PHASE = "settle";

/** One phase of the scan choreography. */
type ScanPhase = typeof SCAN_PHASE | typeof SETTLE_PHASE;

/** Dark, two-line wordmark styling for the "Brand Guidelines" sheet. */
const SHEET_LABEL_STYLE: CSSProperties = {
  color: "#101014",
  fontSize: 30,
  fontWeight: 800,
  lineHeight: 1.12,
  letterSpacing: "-0.6px",
  padding: "0 34px",
  transform: "none",
  whiteSpace: "normal",
};

/** Props for {@link MemoryUploadScanArtifact}. */
export interface MemoryUploadScanArtifactProps {
  /**
   * Freeze the scene on a fixed scan position (0 = unscanned solid sheet,
   * 1 = fully wireframed) with no animation. Used by previews/tests. When
   * omitted the scan loops (or rests settled under reduced motion).
   */
  staticProgress?: number;
}

/**
 * Clamp a value into the inclusive `[0, 1]` range.
 *
 * @param value - The raw value.
 * @returns `value` clamped to `[0, 1]`.
 */
function clamp01(value: number): number {
  try {
    if (value < 0) {
      return 0;
    }
    if (value > 1) {
      return 1;
    }
    return value;
  } catch {
    return 0;
  }
}

/**
 * Cubic ease-in-out, so the scan line eases off both ends of its sweep.
 *
 * @param progress - Linear progress in `[0, 1]`.
 * @returns The eased progress in `[0, 1]`.
 */
function easeInOut(progress: number): number {
  try {
    const clamped = clamp01(progress);
    return clamped < 0.5
      ? 4 * clamped * clamped * clamped
      : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
  } catch {
    return clamp01(progress);
  }
}

/**
 * Build the Memory pill copy for a given pattern count.
 *
 * @param count - The number of patterns extracted so far.
 * @returns The pill label, e.g. "Extracted & Saved 13 Patterns".
 */
function buildPillLabel(count: number): string {
  try {
    return `${PILL_LABEL_PREFIX}${count}${PILL_LABEL_SUFFIX}`;
  } catch {
    return `${PILL_LABEL_PREFIX}${PATTERN_COUNT}${PILL_LABEL_SUFFIX}`;
  }
}

/**
 * Skeleton content rows drawn inside the wireframe sheet (x-start, x-end, y in
 * the 190×202 sheet viewBox), so the scanned portion reads as a blueprint.
 */
const WIREFRAME_ROWS: readonly { id: string; x1: number; x2: number; y: number }[] =
  [
    { id: "row-1", x1: 34, x2: 150, y: 84 },
    { id: "row-2", x1: 34, x2: 156, y: 104 },
    { id: "row-3", x1: 34, x2: 132, y: 124 },
    { id: "row-4", x1: 34, x2: 150, y: 144 },
    { id: "row-5", x1: 34, x2: 108, y: 164 },
  ];

/**
 * The wireframe / blueprint version of the sheet: the same dog-eared silhouette
 * as {@link PdfFile} (viewBox 190×202) drawn as an outline over an opaque white
 * fill, with a matching dog-ear fold and skeleton content rows. Rendered on top
 * of the solid sheet and revealed from the bottom up by an animated
 * `clip-path`, so the scan line's trailing (lower) side reads as "converted".
 *
 * The body path keeps the exact silhouette of {@link PdfFile} — its top edge
 * stops at `(138,0)` and the fold crease runs diagonally to the right-edge
 * start `(190,52)` — so the two states stay pixel-aligned as the reveal sweeps
 * across the seam. The fold is drawn as a clean closed dog-ear: from the crease
 * start straight down to a rounded inner corner, then across to the crease end,
 * with the body's diagonal closing the triangle (no stray/open segments).
 *
 * @returns The wireframe `<svg>` element, or `null` on failure.
 */
function WireframeSheet(): ReactNode {
  try {
    return (
      <svg
        className={styles.wireframeSvg}
        viewBox="0 0 190 202"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M26 0 H138 L190 52 V176 A26 26 0 0 1 164 202 H26 A26 26 0 0 1 0 176 V26 A26 26 0 0 1 26 0 Z"
          fill="#ffffff"
          stroke="#8b95e6"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M138 0 L138 44 Q138 52 146 52 L190 52"
          fill="none"
          stroke="#8b95e6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {WIREFRAME_ROWS.map((row) => (
          <path
            key={row?.id}
            d={`M${row?.x1} ${row?.y} H${row?.x2}`}
            stroke="#c7cdf3"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The scanned sheet stack: the solid {@link PdfFile} sheet, the
 * {@link WireframeSheet} overlay revealed bottom-up by `--scan`, and the pink
 * scan line riding the reveal boundary (extending past the sheet's sides).
 *
 * @returns The scan-file element, or `null` on failure.
 */
function ScanFile(): ReactNode {
  try {
    return (
      <div
        className={styles.scanFile}
        style={{ width: SHEET_WIDTH_PX } as CSSProperties}
      >
        <PdfFile
          label={SHEET_LABEL}
          idPrefix="scan"
          width={SHEET_WIDTH_PX}
          labelStyle={SHEET_LABEL_STYLE}
          className={styles.solidSheet}
        />
        <div className={styles.wireframe}>
          <WireframeSheet />
        </div>
        <span className={styles.scanLine} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "One-time uploads" feature-section artifact and drive its scan
 * loop + pattern counter.
 *
 * @param props - Optional {@link MemoryUploadScanArtifactProps}; `staticProgress`
 *   freezes the scene on a fixed scan frame with no animation.
 * @returns The scan-upload scene, or `null` on failure.
 */
export default function MemoryUploadScanArtifact({
  staticProgress,
}: MemoryUploadScanArtifactProps = {}): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isStatic = typeof staticProgress === "number";
  const staticEased = isStatic ? easeInOut(clamp01(staticProgress ?? 0)) : 1;

  const [count, setCount] = useState(
    isStatic ? Math.round(staticEased * PATTERN_COUNT) : 0,
  );
  const [phase, setPhase] = useState<ScanPhase>(SCAN_PHASE);
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
      const root = rootRef.current;

      // Settled frame: fixed static frame, or reduced motion → rest fully
      // wireframed at the final count with the scan line hidden.
      if (isStatic || prefersReducedMotion) {
        const settled = isStatic ? staticEased : 1;
        root?.style.setProperty("--scan", settled.toFixed(4));
        setCount(Math.round(settled * PATTERN_COUNT));
        setPhase(settled < 1 ? SCAN_PHASE : SETTLE_PHASE);
        return undefined;
      }

      let frameId = 0;
      let startTime = 0;

      const step = (now: number) => {
        try {
          if (startTime === 0) {
            startTime = now;
          }
          const elapsed = (now - startTime) % CYCLE_DURATION_MS;
          const sweeping = elapsed < SWEEP_DURATION_MS;
          const linear = sweeping ? elapsed / SWEEP_DURATION_MS : 1;
          const eased = sweeping ? easeInOut(linear) : 1;

          root?.style.setProperty("--scan", eased.toFixed(4));

          const nextCount = Math.round(eased * PATTERN_COUNT);
          setCount((previous) =>
            previous === nextCount ? previous : nextCount,
          );
          const nextPhase: ScanPhase = sweeping ? SCAN_PHASE : SETTLE_PHASE;
          setPhase((previous) =>
            previous === nextPhase ? previous : nextPhase,
          );

          frameId = window.requestAnimationFrame(step);
        } catch {
          /* leave the last frame in place on failure */
        }
      };

      root?.style.setProperty("--scan", "0");
      frameId = window.requestAnimationFrame(step);
      return () => window.cancelAnimationFrame(frameId);
    } catch {
      return undefined;
    }
  }, [isStatic, prefersReducedMotion, staticEased]);

  const rootStyle: CSSProperties = {
    "--scan": isStatic ? staticEased.toFixed(4) : "0",
    "--visible-frame-width": `${VISIBLE_FRAME_WIDTH_PX}px`,
  } as CSSProperties;

  try {
    return (
      <div
        ref={rootRef}
        className={styles.root}
        data-artifact={DATA_ARTIFACT}
        data-phase={phase}
        data-count={count}
        style={rootStyle}
      >
        <div className={styles.stage}>
          <ScanFile />
          <div className={styles.pillRow}>
            <MemoryPill
              plain
              markSize={PILL_MARK_SIZE_PX}
              className={styles.compactPill}
              label={buildPillLabel(count)}
            />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
