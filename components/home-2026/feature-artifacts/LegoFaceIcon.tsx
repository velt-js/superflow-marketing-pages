import type { ReactNode, SVGProps } from "react";

/**
 * The Superflow agent app-icon glyph — a Lego minifigure head (two eyes + a
 * smile). Stroked in `currentColor` so a consumer can color it (e.g. white on
 * the purple comment pin). This is the single source of truth for the agent pin
 * glyph, shared by the "Run on Demand" hero artifact ({@link RunOnDemandArtifact})
 * and the agent-finding feature scene ({@link PinnedCommentScene}) so the agent
 * marker stays identical across the site.
 *
 * The glyph is sized via {@link LegoFaceIconProps.size}; inside {@link CommentPin}
 * the surrounding `.pinGlyph` stretches the `<svg>` to fill the pin box.
 */

/** Props for {@link LegoFaceIcon}. */
export type LegoFaceIconProps = SVGProps<SVGSVGElement> & {
  /** Rendered width/height in pixels. Defaults to 20. */
  size?: number;
};

/**
 * Render the Lego-face agent glyph.
 *
 * @param root0 - Icon props including an optional `size` (default 20); any other
 *   SVG props are forwarded to the root `<svg>`.
 * @returns The lego-face `<svg>` element, or null if rendering fails.
 */
export default function LegoFaceIcon({
  size = 20,
  ...rest
}: LegoFaceIconProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        <path d="M7.91146 9.16667H7.91979M12.0781 9.16667H12.0865M7.91146 12.5C8.18302 12.7772 8.50717 12.9974 8.8649 13.1477C9.22263 13.298 9.60676 13.3754 9.99479 13.3754C10.3828 13.3754 10.767 13.298 11.1247 13.1477C11.4824 12.9974 11.8066 12.7772 12.0781 12.5M5.82813 4.16667H6.66146V2.5H13.3281V4.16667H14.1615C14.8245 4.16667 15.4604 4.43006 15.9292 4.8989C16.3981 5.36774 16.6615 6.00363 16.6615 6.66667V14.1667C16.6615 14.8297 16.3981 15.4656 15.9292 15.9344C15.4604 16.4033 14.8245 16.6667 14.1615 16.6667V17.5H5.82813V16.6667C5.16508 16.6667 4.5292 16.4033 4.06036 15.9344C3.59152 15.4656 3.32812 14.8297 3.32812 14.1667V6.66667C3.32812 6.00363 3.59152 5.36774 4.06036 4.8989C4.5292 4.43006 5.16508 4.16667 5.82813 4.16667Z" />
      </svg>
    );
  } catch {
    return null;
  }
}
