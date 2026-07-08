import type { ReactNode } from "react";
import styles from "./ReviewAgentsArtifact.module.css";

/**
 * Feature-section app-window artifact — "AI Review Agents".
 * Figma: node 777:3124 (file aVubXS2jMWMDlRK42zvgoy), frame 631×545.
 *
 * Static 1:1 recreation of the "Review Agents" state: a fully rendered
 * "Spell Check" agent card (top-left), a skeleton/loading agent card that
 * bleeds off the right edge, a monospace "12 ISSUES FOUND" readout, and a
 * stacked "3 Performance Issues" result card with a red alert glyph.
 *
 * Every icon is inlined from the exact Figma/Tabler vector so the artifact
 * matches the design node. The root fills its container (100% × 100%) and lets
 * the right/bottom edges clip, matching the design's real pixel proportions.
 */

/* -------------------------------------------------------------- text strings */

const SPELL_CHECK_TITLE = "Spell Check";
const SPELL_CHECK_SUBTITLE = "Finds spelling mistakes and typos in …";
const META_UPDATED_LABEL = "1d ago";
const META_USED_LABEL = "Used 23 times";
const ISSUES_FOUND_LABEL = "12 Issues Found";
const PERFORMANCE_ISSUES_LABEL = "3 Performance Issues";
const KEBAB_LABEL = "Card actions";
const HISTORY_ACTION_LABEL = "View run history";
const RUN_ACTION_LABEL = "Run agent";

/* -------------------------------------------------------------------- colors */

/** Neutral fill shared by every skeleton placeholder shape (Figma #f1f1f0). */
const SKELETON_FILL = "#f1f1f0";

/* ---------------------------------------------------------------- icon paths */

/** Tabler `dots-grid` (filled) — the 3×3 dot glyph inside the green tile. */
const DOTS_GRID_PATHS: readonly string[] = [
  "M3.5 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M10 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M16.5 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M3.5 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M16.5 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M3.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M10 18.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  "M16.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
];

/** Tabler `dots-vertical` — the kebab menu glyph. */
const DOTS_VERTICAL_PATHS: readonly string[] = [
  "M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
  "M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
  "M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
];

/** Tabler `refresh` — the "last updated" meta glyph. */
const REFRESH_PATHS: readonly string[] = [
  "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4",
  "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4",
];

/**
 * Tabler `sparkles` — the "used N times" meta glyph. Each of the three star
 * subpaths is a separate, explicitly-closed entry so `StrokeGlyph` renders one
 * clean four-point star per `<path>` (a single merged `d` left the arcs open and
 * rendered malformed).
 */
const SPARKLES_PATHS: readonly string[] = [
  "M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z",
  "M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z",
  "M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z",
];

/** Tabler `history` — the ghost action circle glyph. */
const HISTORY_PATHS: readonly string[] = [
  "M12 8l0 4l2 2",
  "M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5",
];

/** Tabler `player-play` (filled) — the dark action circle glyph. */
const PLAYER_PLAY_PATHS: readonly string[] = [
  "M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z",
];

/**
 * Tabler `alert-triangle-filled` — the red glyph on the result card. Uses an
 * even-odd fill so the two inner subpaths punch the exclamation mark through to
 * the white card behind it.
 */
const ALERT_TRIANGLE_PATH =
  "M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.496 -1.371zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z";

/* --------------------------------------------------------------- icon types */

type IconProps = {
  /** Rendered width/height in pixels. */
  size: number;
  /** Optional class applied to the `<svg>` (used for per-icon color). */
  className?: string;
};

/* ------------------------------------------------------------ icon primitives */

/**
 * 24×24 stroke-icon wrapper matching the Tabler export defaults (currentColor
 * stroke, 2px width, round caps/joins).
 *
 * @param props - Size, path list, optional stroke width and class name.
 * @returns The configured stroke `<svg>` element.
 */
function StrokeGlyph({
  size,
  paths,
  strokeWidth = 2,
  className,
}: IconProps & { paths: readonly string[]; strokeWidth?: number }): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths.map((definition) => (
        <path key={definition} d={definition} />
      ))}
    </svg>
  );
}

/**
 * 24×24 filled-icon wrapper (currentColor fill, no stroke).
 *
 * @param props - Size, path list, optional class name.
 * @returns The configured filled `<svg>` element.
 */
function FillGlyph({
  size,
  paths,
  className,
}: IconProps & { paths: readonly string[] }): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths.map((definition) => (
        <path key={definition} d={definition} />
      ))}
    </svg>
  );
}

/**
 * Red alert-triangle glyph on the "3 Performance Issues" card.
 *
 * @param props - Size and optional class name.
 * @returns The alert-triangle `<svg>` element.
 */
function AlertTriangleIcon({ size, className }: IconProps): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path fillRule="evenodd" clipRule="evenodd" d={ALERT_TRIANGLE_PATH} />
    </svg>
  );
}

/* ------------------------------------------------------------ skeleton shapes */

/** A single skeleton placeholder rectangle, positioned inside its card. */
type SkeletonShape = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
};

/**
 * Skeleton placeholder shapes for the right-hand (loading) agent card, in
 * card-local coordinates derived from Figma nodes 777:3141–777:3149.
 */
const SKELETON_SHAPES: readonly SkeletonShape[] = [
  { id: "icon", left: 24.43, top: 26.87, width: 48.85, height: 48.85, radius: 9.77 },
  { id: "title", left: 89.15, top: 26.87, width: 180.75, height: 24.43, radius: 39.08 },
  { id: "sub", left: 89.15, top: 58.62, width: 299.21, height: 19.54, radius: 39.08 },
  { id: "kebab", left: 409.13, top: 25.65, width: 24.43, height: 26.87, radius: 39.08 },
  { id: "footer-short", left: 24.43, top: 106.25, width: 86.71, height: 19.54, radius: 39.08 },
  { id: "footer-long", left: 129.45, top: 106.25, width: 135.56, height: 19.54, radius: 39.08 },
  { id: "action-1", left: 362.72, top: 100.15, width: 31.75, height: 31.75, radius: 9999 },
  { id: "action-2", left: 401.8, top: 100.15, width: 31.75, height: 31.75, radius: 9999 },
];

/* ------------------------------------------------------------------ sections */

/**
 * The fully rendered "Spell Check" agent card (Figma node 777:3138).
 *
 * @returns The Spell Check card element.
 */
function SpellCheckCard(): ReactNode {
  return (
    <article className={styles.spellCard}>
      <div className={styles.cardTop}>
        <span className={styles.icon}>
          <FillGlyph size={28} paths={DOTS_GRID_PATHS} />
        </span>
        <div className={styles.cardText}>
          <p className={styles.cardTitle}>{SPELL_CHECK_TITLE}</p>
          <p className={styles.cardSub}>{SPELL_CHECK_SUBTITLE}</p>
        </div>
        <button type="button" className={styles.kebab} aria-label={KEBAB_LABEL}>
          <StrokeGlyph size={18} paths={DOTS_VERTICAL_PATHS} />
        </button>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <StrokeGlyph
              size={14}
              paths={REFRESH_PATHS}
              className={styles.metaIconBlue}
            />
            {META_UPDATED_LABEL}
          </span>
          <span className={styles.metaItem}>
            <StrokeGlyph
              size={14}
              paths={SPARKLES_PATHS}
              className={styles.metaIconOrange}
            />
            {META_USED_LABEL}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.circle} ${styles.circleGhost}`}
            aria-label={HISTORY_ACTION_LABEL}
          >
            <StrokeGlyph size={16} paths={HISTORY_PATHS} />
          </button>
          <button
            type="button"
            className={`${styles.circle} ${styles.circleDark}`}
            aria-label={RUN_ACTION_LABEL}
          >
            <FillGlyph size={12} paths={PLAYER_PLAY_PATHS} />
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * The right-hand skeleton (loading) agent card that bleeds off the container's
 * right edge (Figma node 777:3139).
 *
 * @returns The skeleton card element.
 */
function SkeletonCard(): ReactNode {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      {SKELETON_SHAPES.map((shape) => (
        <span
          key={shape?.id}
          className={styles.skelShape}
          style={{
            left: shape?.left,
            top: shape?.top,
            width: shape?.width,
            height: shape?.height,
            borderRadius: shape?.radius,
            background: SKELETON_FILL,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The issues readout: a monospace count label above a stacked result card
 * with a red alert glyph (Figma node 777:3125).
 *
 * @returns The issues readout element.
 */
function IssuesReadout(): ReactNode {
  return (
    <>
      <p className={styles.issuesLabel}>{ISSUES_FOUND_LABEL}</p>
      <div className={styles.resultStack} aria-hidden="true" />
      <div className={styles.resultCard}>
        <span className={styles.resultIcon}>
          <AlertTriangleIcon size={29} />
        </span>
        <p className={styles.resultText}>{PERFORMANCE_ISSUES_LABEL}</p>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------- export */

/**
 * Render the "AI Review Agents" feature-section artifact.
 *
 * @returns The Review Agents window contents, filling its container.
 */
export default function ReviewAgentsArtifact(): ReactNode {
  return (
    <div className={styles.root} data-artifact="review-agents">
      <SpellCheckCard />
      <SkeletonCard />
      <IssuesReadout />
    </div>
  );
}
