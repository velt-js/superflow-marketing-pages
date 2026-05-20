import type { CSSProperties, ReactNode } from "react";

export function DeveloperCursor() {
  return (
    <svg width="27" height="30" viewBox="0 0 27 30" aria-hidden>
      <g transform="translate(2.955 1.792)">
        <path
          d="M 17.842 22.858 L 21.797 2.973 C 22.089 1.501 20.515 0.368 19.212 1.112 L 1.758 11.086 C 0.398 11.863 0.665 13.899 2.179 14.298 L 9.622 16.261 C 10.054 16.375 10.427 16.65 10.663 17.03 L 14.639 23.439 C 15.476 24.788 17.533 24.415 17.842 22.858 Z"
          fill="rgb(77,213,255)"
        />
        <path
          d="M 22.655 3.144 L 18.7 23.028 C 18.236 25.364 15.151 25.924 13.895 23.9 L 9.919 17.492 C 9.801 17.302 9.615 17.164 9.399 17.107 L 1.956 15.144 C -0.315 14.545 -0.716 11.492 1.323 10.327 L 18.778 0.353 C 20.732 -0.764 23.094 0.936 22.655 3.144 Z"
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

export function PhotographerCursor() {
  return (
    <svg width="27" height="30" viewBox="0 0 27 30" aria-hidden>
      <g transform="translate(0.837 1.792)">
        <path
          d="M 4.866 22.858 L 0.911 2.973 C 0.619 1.501 2.193 0.368 3.496 1.112 L 20.95 11.086 C 22.31 11.863 22.043 13.899 20.529 14.298 L 13.086 16.261 C 12.654 16.375 12.281 16.65 12.045 17.03 L 8.069 23.439 C 7.232 24.788 5.175 24.415 4.866 22.858 Z"
          fill="rgb(77,213,255)"
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

export function DesignerCursor() {
  return (
    <svg width="27" height="30" viewBox="0 0 27 30" aria-hidden>
      <g transform="translate(0.837 1.792)">
        <path
          d="M 4.866 22.858 L 0.911 2.973 C 0.619 1.501 2.193 0.368 3.496 1.112 L 20.95 11.086 C 22.31 11.863 22.043 13.899 20.529 14.298 L 13.086 16.261 C 12.654 16.375 12.281 16.65 12.045 17.03 L 8.069 23.439 C 7.232 24.788 5.175 24.415 4.866 22.858 Z"
          fill="rgb(252,108,186)"
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

export interface CursorBadgeProps {
  label: string;
  color: string;
  side: "left" | "right";
  className?: string;
  style?: CSSProperties;
  cursor?: ReactNode;
}

export function CursorBadge({ label, color, side, className, style, cursor }: CursorBadgeProps) {
  const pillSide: CSSProperties = side === "left" ? { left: -32 } : { right: -80 };
  const cursorSide: CSSProperties = side === "left" ? { left: 0 } : { right: 0 };
  const defaultCursor = side === "left" ? <DeveloperCursor /> : <DesignerCursor />;
  return (
    <div
      className={`pointer-events-none absolute hidden lg:block ${className ?? ""}`}
      style={style}
    >
      <div className="relative h-[57px] w-[107px] flex items-center justify-end">
        <div className="absolute top-0 h-[30px] w-[27px]">
          {cursor ?? defaultCursor}
        </div>
        <div
          className="absolute bottom-0 flex items-center rounded-[29px] px-[9px] pt-[4px] pb-[5px]"
          style={{ background: color, ...pillSide }}
        >
          <span
            className="font-semibold text-black text-center"
            style={{
              fontFamily: "var(--font-urbanist)",
              fontSize: 16,
              lineHeight: "19.2px",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
