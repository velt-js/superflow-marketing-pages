import type { ReactNode } from "react";

/**
 * The Superflow agent "dots" mark — four multicolor dots in a 2×2 grid centred
 * inside a 24-unit grid (matching the Figma agent-avatar vector `896:1375`).
 *
 * Distinct from {@link SuperflowBrandMark} (six white dots): this is the
 * multicolor agent avatar used on agent-run surfaces. The glyph is transparent
 * — the consumer draws its own tile / disc (shape + purple gradient) behind it
 * and sizes the glyph via {@link SuperflowAgentDotsMarkProps.className}.
 */

/** Radius of each dot within the 24-unit grid (Figma `r=2.28571`). */
const DOT_RADIUS = 2.286;

/** The four dots (2×2) with their exact Figma fills, row-major from top-left. */
const AGENT_DOTS: readonly { cx: number; cy: number; fill: string }[] = [
  { cx: 7.43, cy: 7.43, fill: "#D6D6FF" },
  { cx: 16.57, cy: 7.43, fill: "#9F84FF" },
  { cx: 7.43, cy: 16.57, fill: "#FFA5FF" },
  { cx: 16.57, cy: 16.57, fill: "#FFFFFF" },
];

/** Props for {@link SuperflowAgentDotsMark}. */
export interface SuperflowAgentDotsMarkProps {
  /** Class applied to the `<svg>`, used by the caller to size the glyph. */
  className?: string;
}

/**
 * Render the four-dot agent mark as a transparent `<svg>` (the caller supplies
 * the tile/disc drawn behind it).
 *
 * @param root0 - The glyph props.
 * @param root0.className - Class used to size the glyph.
 * @returns The agent-dots `<svg>` element, or null if rendering fails.
 */
export default function SuperflowAgentDotsMark({
  className,
}: SuperflowAgentDotsMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        {AGENT_DOTS.map((dot) => (
          <circle
            key={`${dot?.cx}-${dot?.cy}`}
            cx={dot?.cx}
            cy={dot?.cy}
            r={DOT_RADIUS}
            fill={dot?.fill}
          />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}
