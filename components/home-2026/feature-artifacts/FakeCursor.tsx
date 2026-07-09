import type { ReactNode } from "react";

/**
 * Shared fake pointer used by the animated feature-section artifacts.
 *
 * Renders the same arrow glyph as the Kanban board artifact's resting pointer
 * (`KanbanArtifact` `CursorArrow`): a dark fill with a filled white outline
 * halo behind it, rather than a stroked border. Callers position and animate it
 * via a wrapping class (the SVG fills its box) and supply the drop-shadow, so
 * the pointer can glide onto a control and "press" it inside a CSS-only timeline.
 */

/** Default rendered width/height (px) of the pointer glyph. */
const DEFAULT_CURSOR_SIZE = 22;

/** White outline "halo" drawn behind the dark arrow (Kanban `CursorArrow`). */
const CURSOR_HALO_PATH =
  "M15.9231 18.0296C16.0985 18.4505 15.9299 20.0447 15 20.4142C14.0701 20.7837 12.882 20.4142 12.882 20.4142L10.726 16.1024L7 19.8284V3L18.4142 14.4142H14.1615C14.3702 14.8144 15.7003 17.4948 15.9231 18.0296Z";

/** Dark arrow fill sitting on top of the white halo (Kanban `CursorArrow`). */
const CURSOR_ARROW_PATH =
  "M8 5.41406V17.4141L11 14.4141L13.5 19.4141C13.5 19.4141 14.1763 19.6299 14.5 19.4141C14.8237 19.1983 15.1457 18.7636 15 18.4141C14.3123 16.7636 12.5 13.4141 12.5 13.4141H16L8 5.41406Z";

/** Props for {@link FakeCursor}. */
export interface FakeCursorProps {
  /** Class applied to the wrapping span, used to position/animate the pointer. */
  className?: string;
  /** Rendered width/height in pixels. Defaults to {@link DEFAULT_CURSOR_SIZE}. */
  size?: number;
}

/**
 * Render a static arrow pointer glyph inside a positioned span.
 *
 * Matches the Kanban board artifact's resting cursor: a white outline halo path
 * behind a dark `#202125` arrow. The `viewBox` stays `0 0 24 24` so consumer
 * classes keep owning position, sizing and the drop-shadow unchanged.
 *
 * @param props - The positioning class and optional size.
 * @returns The pointer element, or null on failure.
 */
export default function FakeCursor({
  className,
  size = DEFAULT_CURSOR_SIZE,
}: FakeCursorProps): ReactNode {
  try {
    return (
      <span className={className} aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          focusable="false"
        >
          <path d={CURSOR_HALO_PATH} fill="white" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={CURSOR_ARROW_PATH}
            fill="#202125"
          />
        </svg>
      </span>
    );
  } catch {
    return null;
  }
}
