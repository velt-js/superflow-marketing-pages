import type { ReactNode } from "react";

/**
 * The Superflow brand mark — two rows of three dots centred inside a 24-unit
 * grid (matching the Figma avatar vector `895:1214`).
 *
 * This is the single source of truth for the dots geometry, shared by the
 * {@link AgentCommentCard} header avatar and the {@link CommentPin} agent pin so
 * the two stay pixel-identical. The glyph is transparent — each consumer draws
 * its own surrounding tile / disc (shape + gradient) behind it and sizes the
 * glyph via {@link SuperflowBrandMarkProps.className}.
 */

/** Radius of each brand-mark dot within the 24-unit grid. */
const BRAND_MARK_DOT_RADIUS = 1.85;

/** Default dot fill (white, to read against the purple gradient tile/disc). */
const DEFAULT_DOT_FILL = "#ffffff";

/** Centres of the six brand-mark dots inside the 24-unit viewBox. */
const BRAND_MARK_DOTS: readonly { cx: number; cy: number }[] = [
  { cx: 7.43, cy: 7.43 },
  { cx: 12, cy: 7.43 },
  { cx: 16.57, cy: 7.43 },
  { cx: 7.43, cy: 16.57 },
  { cx: 12, cy: 16.57 },
  { cx: 16.57, cy: 16.57 },
];

/** Props for {@link SuperflowBrandMark}. */
export interface SuperflowBrandMarkProps {
  /** Class applied to the `<svg>`, used by the caller to size the glyph. */
  className?: string;
  /** Dot fill color. Defaults to white. */
  fill?: string;
}

/**
 * Render the Superflow brand-mark dots as a transparent `<svg>` (the caller
 * supplies the tile/disc drawn behind it).
 *
 * @param root0 - The glyph props.
 * @param root0.className - Class used to size the glyph.
 * @param root0.fill - Dot fill color (defaults to white).
 * @returns The brand-mark `<svg>` element, or null if rendering fails.
 */
export default function SuperflowBrandMark({
  className,
  fill = DEFAULT_DOT_FILL,
}: SuperflowBrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        {BRAND_MARK_DOTS.map((dot) => (
          <circle
            key={`${dot?.cx}-${dot?.cy}`}
            cx={dot?.cx}
            cy={dot?.cy}
            r={BRAND_MARK_DOT_RADIUS}
            fill={fill}
          />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}
