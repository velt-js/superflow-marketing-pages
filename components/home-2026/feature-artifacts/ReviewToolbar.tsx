import type { ReactNode } from "react";
import styles from "./ReviewToolbar.module.css";

/**
 * ReviewToolbar — the shared, brand-swappable client-facing review toolbar.
 *
 * This is the single rounded white pill the agency's client sees floating on the
 * reviewed site: a brand logo slot, then the product controls (a solid indigo
 * comment button, a support headphones dropdown, an inbox counter with a red
 * unread dot, a warning counter, a share action and a kebab menu), separated by
 * thin vertical dividers — matching the real Superflow toolbar.
 *
 * Only the logo swaps for white-label (Superflow flower → the client's mark), so
 * the mark is passed in as the `brandMark` slot and everything else stays
 * constant. Rendered with inline SVGs (no deps) and no client-only APIs, so it
 * can be reused from both client and server components.
 */

/** Default unread-inbox count shown beside the inbox glyph. */
const DEFAULT_INBOX_COUNT = "24";
/** Default warning/issue count shown beside the alert glyph. */
const DEFAULT_ALERT_COUNT = "4";
/** Shared stroke-icon pixel size for the toolbar's outline glyphs. */
const ICON_SIZE = 20;
/** Chat-bubble glyph size inside the indigo comment button. */
const COMMENT_GLYPH_SIZE = 18;
/** Chevron glyph size beside the headphones (the support dropdown caret). */
const CHEVRON_SIZE = 13;

/* Tabler-derived glyph path sets, one per toolbar control. */
const COMMENT_PATHS = ["M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1z"] as const;
const HEADPHONES_PATHS = [
  "M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z",
  "M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z",
  "M4 15v-3a8 8 0 0 1 16 0v3",
] as const;
const CHEVRON_DOWN_PATHS = ["M6 9l6 6l6 -6"] as const;
const INBOX_PATHS = [
  "M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z",
  "M4 13h3l3 3h4l3 -3h3",
] as const;
const WARNING_PATHS = [
  "M12 9v4",
  "M12 16h.01",
  "M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z",
] as const;
const SHARE_PATHS = [
  "M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  "M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  "M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  "M8.7 10.7l6.6 -3.4",
  "M8.7 13.3l6.6 3.4",
] as const;

/** Vertical positions (cy) of the three kebab-menu dots on the 24-unit grid. */
const KEBAB_DOT_CY: readonly number[] = [5, 12, 19];
/** Radius of each kebab dot. */
const KEBAB_DOT_RADIUS = 1.7;

/** Shared props for the toolbar's inline stroke glyphs. */
interface GlyphProps {
  /** Rendered width/height in pixels. */
  size?: number;
  /** Optional class applied to the `<svg>`. */
  className?: string;
}

/**
 * Outlined stroke glyph drawn in `currentColor` on the 24-unit Tabler grid with
 * rounded caps/joins.
 *
 * @param root0 - Sizing, class and the path `d` strings to draw.
 * @param root0.size - Rendered width/height in pixels (defaults to {@link ICON_SIZE}).
 * @param root0.className - Optional class applied to the `<svg>`.
 * @param root0.paths - The path `d` strings drawn inside the glyph.
 * @returns The configured `<svg>` element, or `null` on failure.
 */
function StrokeGlyph({
  size = ICON_SIZE,
  className,
  paths,
}: GlyphProps & { paths: readonly string[] }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {paths.map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The kebab (vertical three-dot) menu glyph, rendered as filled dots in
 * `currentColor` rather than stroked rings.
 *
 * @param root0 - Icon sizing/class props.
 * @param root0.size - Rendered width/height in pixels (defaults to {@link ICON_SIZE}).
 * @param root0.className - Optional class applied to the `<svg>`.
 * @returns The kebab glyph `<svg>`, or `null` on failure.
 */
function KebabGlyph({ size = ICON_SIZE, className }: GlyphProps): ReactNode {
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
        className={className}
      >
        {KEBAB_DOT_CY.map((cy) => (
          <circle key={cy} cx={12} cy={cy} r={KEBAB_DOT_RADIUS} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/** Props for {@link ReviewToolbar}. */
export interface ReviewToolbarProps {
  /**
   * The brand logo rendered in the leftmost slot. For white-label this is the
   * Superflow flower ("before") or the client's mark ("after"); it should be
   * pre-sized by the caller (~28px).
   */
  brandMark: ReactNode;
  /** Unread-inbox count shown beside the inbox glyph (defaults to "24"). */
  inboxCount?: string | number;
  /** Warning/issue count shown beside the alert glyph (defaults to "4"). */
  alertCount?: string | number;
  /** Optional class merged onto the toolbar root (e.g. for positioning). */
  className?: string;
}

/**
 * Render the shared client-facing review toolbar.
 *
 * @param root0 - The brand slot, optional counts and an optional root class.
 * @param root0.brandMark - The logo rendered in the leftmost slot.
 * @param root0.inboxCount - Unread-inbox count (defaults to {@link DEFAULT_INBOX_COUNT}).
 * @param root0.alertCount - Warning/issue count (defaults to {@link DEFAULT_ALERT_COUNT}).
 * @param root0.className - Optional class merged onto the toolbar root.
 * @returns The toolbar element, or `null` on failure.
 */
export default function ReviewToolbar({
  brandMark,
  inboxCount = DEFAULT_INBOX_COUNT,
  alertCount = DEFAULT_ALERT_COUNT,
  className,
}: ReviewToolbarProps): ReactNode {
  try {
    const rootClass = className
      ? `${styles.toolbar} ${className}`
      : styles.toolbar;
    return (
      <div className={rootClass} role="presentation">
        <span className={styles.logoSlot}>{brandMark}</span>

        <span className={styles.divider} aria-hidden="true" />

        <span className={styles.commentBtn} aria-hidden="true">
          <StrokeGlyph size={COMMENT_GLYPH_SIZE} paths={COMMENT_PATHS} />
        </span>

        <span className={styles.support} aria-hidden="true">
          <StrokeGlyph paths={HEADPHONES_PATHS} className={styles.icon} />
          <StrokeGlyph
            size={CHEVRON_SIZE}
            paths={CHEVRON_DOWN_PATHS}
            className={styles.chevron}
          />
        </span>

        <span className={styles.divider} aria-hidden="true" />

        <span className={styles.counter}>
          <span className={styles.badgeWrap} aria-hidden="true">
            <StrokeGlyph paths={INBOX_PATHS} className={styles.icon} />
            <span className={styles.redDot} />
          </span>
          <span className={styles.count}>{inboxCount}</span>
        </span>

        <span className={styles.counter}>
          <StrokeGlyph paths={WARNING_PATHS} className={styles.icon} />
          <span className={styles.count}>{alertCount}</span>
        </span>

        <span className={styles.divider} aria-hidden="true" />

        <span className={styles.action} aria-hidden="true">
          <StrokeGlyph paths={SHARE_PATHS} className={styles.icon} />
        </span>

        <span className={styles.action} aria-hidden="true">
          <KebabGlyph className={styles.icon} />
        </span>
      </div>
    );
  } catch {
    return null;
  }
}
