import type { CSSProperties } from "react";

export type CursorDirection = "left" | "right";

export interface CursorProps {
  /** Label text shown inside the pill. */
  text: string;
  /** Color used for the cursor fill and the pill background (e.g. "#4dd5ff"). */
  color: string;
  /** Which side of the pill the cursor sits on. "right" → cursor top-right with pill below-left; "left" mirrors it. */
  direction: CursorDirection;
  /** Pill text color. Defaults to "#000". Pass "#fff" when the background is dark. */
  textColor?: string;
  /** Optional class names appended to the wrapper. */
  className?: string;
  /** Optional inline styles — useful when the caller wants to absolutely position the cursor. */
  style?: CSSProperties;
}

/**
 * "Paper-airplane" cursor glyph. Same geometry as the Figma 18:3443 cursors;
 * `flipped` mirrors it horizontally so the same SVG serves both directions.
 */
function CursorArrow({ color, flipped }: { color: string; flipped: boolean }) {
  return (
    <svg
      width="27"
      height="30"
      viewBox="0 0 27 30"
      aria-hidden
      style={{ transform: flipped ? "scaleX(-1)" : undefined }}
    >
      <g transform="translate(0.837 1.792)">
        <path
          d="M 4.866 22.858 L 0.911 2.973 C 0.619 1.501 2.193 0.368 3.496 1.112 L 20.95 11.086 C 22.31 11.863 22.043 13.899 20.529 14.298 L 13.086 16.261 C 12.654 16.375 12.281 16.65 12.045 17.03 L 8.069 23.439 C 7.232 24.788 5.175 24.415 4.866 22.858 Z"
          fill={color}
        />
        <path
          d="M 0.053 3.144 L 4.008 23.028 C 4.472 25.364 7.557 25.924 8.813 23.9 L 12.789 17.492 C 12.907 17.302 13.093 17.164 13.309 17.107 L 20.752 15.144 C 23.023 14.545 23.424 11.492 21.385 10.327 L 3.93 0.353 C 1.976 -0.764 -0.386 0.936 0.053 3.144 Z"
          fill="transparent"
          stroke="#fff"
          strokeWidth="1.75"
          strokeLinecap="square"
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  );
}

/**
 * Standalone collaborative cursor with a labeled pill, matching the
 * Superflow marketing-site visual style.
 *
 * Self-contained (`inline-block` + `relative`) so the caller can position it
 * however they like — flow, flex/grid, or absolutely via `style`/`className`.
 */
export function Cursor({
  text,
  color,
  direction,
  textColor = "#000",
  className,
  style,
}: CursorProps) {
  const isRight = direction === "right";

  return (
    <div
      className={`relative inline-block h-[78px] w-[159px] ${className ?? ""}`}
      style={style}
    >
      <div
        className="absolute top-0 h-[30px] w-[27px]"
        style={isRight ? { right: 0 } : { left: 0 }}
      >
        <CursorArrow color={color} flipped={isRight} />
      </div>
      <div
        className="absolute top-[27px] flex items-start rounded-[29px] pt-[7px] pb-[8px] px-4 whitespace-nowrap"
        style={{
          background: color,
          ...(isRight ? { right: 21 } : { left: 21 }),
        }}
      >
        <span
          className="font-semibold"
          style={{
            fontFamily: "var(--font-urbanist)",
            fontSize: 18,
            lineHeight: "21.6px",
            color: textColor,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
