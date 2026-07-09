import type { ReactNode } from "react";
import styles from "./BrowserChrome.module.css";

/**
 * Shared browser chrome bar for the "Durable Comments" feature-section
 * artifacts (Pinned Comments / Auto Screenshot / Private). Mirrors the chrome
 * bar drawn privately inside the Guest Mode and Private Comment hero artifacts
 * — navigation chevrons, reload + bookmark, a centered address pill and the
 * trailing share/menu actions — so the three new tabs render an identical
 * frame without duplicating markup across each file.
 *
 * The hero artifacts keep their own private chrome (their bars differ in
 * address casing, disabled-forward opacity, positioning and per-element
 * entrance animations), so this component intentionally does not touch them.
 *
 * Every glyph is inlined from the exact Figma/Tabler vector geometry used by
 * the hero chrome so the icons match the design pixel-for-pixel. Positioning is
 * left to the caller: pass an absolute-positioning class through
 * {@link BrowserChromeProps.className}.
 */

const DEFAULT_ADDRESS = "your-site.com";

/** Label shown inside the optional green "Live" pill on the address bar. */
const LIVE_TAG_LABEL = "Live";

/** Shared props for every inline chrome glyph: an optional pixel size. */
type GlyphProps = {
  /** Rendered width/height in pixels. */
  size?: number;
  /** Optional class applied to the `<svg>`. */
  className?: string;
};

/** Props for the shared stroked-glyph wrapper. */
type StrokeGlyphProps = GlyphProps & {
  /** User-space viewBox framing the exact Figma geometry. */
  viewBox: string;
  /** Stroke width in the viewBox's user units, matching the Figma export. */
  strokeWidth: number;
  /** Fallback size when the caller passes none. */
  defaultSize: number;
  /** One or more `<path>` children carrying the exact geometry. */
  children: ReactNode;
};

/**
 * Stroke-icon wrapper drawing outlined glyphs in `currentColor` with rounded
 * caps. viewBox and stroke width are passed per icon so each matches the value
 * exported from Figma exactly.
 *
 * @param props - Geometry, sizing and child path nodes.
 * @returns The configured `<svg>` element.
 */
function StrokeGlyph({
  viewBox,
  strokeWidth,
  defaultSize,
  size,
  className,
  children,
}: StrokeGlyphProps) {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size ?? defaultSize}
        height={size ?? defaultSize}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {children}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Browser back chevron (Figma tabler-icon-chevron-left).
 *
 * @param props - Glyph props.
 * @returns The rendered icon.
 */
function ChevronLeftIcon(props: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M10 4L6 8L10 12" />
    </StrokeGlyph>
  );
}

/**
 * Browser forward chevron (Figma tabler-icon-chevron-right).
 *
 * @param props - Glyph props.
 * @returns The rendered icon.
 */
function ChevronRightIcon(props: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M6 4L10 8L6 12" />
    </StrokeGlyph>
  );
}

/**
 * Browser reload icon (Figma tabler-icon-reload).
 *
 * @param props - Glyph props.
 * @returns The rendered icon.
 */
function ReloadIcon(props: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M13.2894 8.69411C13.1635 9.65408 12.7786 10.5617 12.1761 11.3196C11.5736 12.0774 10.7762 12.657 9.86933 12.9961C8.96247 13.3352 7.98041 13.4211 7.02846 13.2445C6.07652 13.0679 5.1906 12.6355 4.46573 11.9937C3.74085 11.3518 3.20437 10.5248 2.91381 9.60121C2.62325 8.67765 2.58957 7.69241 2.81639 6.75117C3.04322 5.80992 3.52198 4.94818 4.20134 4.25835C4.8807 3.56852 5.73503 3.07663 6.67269 2.83544C9.27203 2.16878 11.9627 3.50678 12.956 6.00011M13.3346 2.66675V6.00008H10.0013" />
    </StrokeGlyph>
  );
}

/**
 * Browser bookmark icon (Figma tabler-icon-bookmark).
 *
 * @param props - Glyph props.
 * @returns The rendered icon.
 */
function BookmarkIcon(props: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M12 4.66667V14L8 11.3333L4 14V4.66667C4 3.95942 4.28095 3.28115 4.78105 2.78105C5.28115 2.28095 5.95942 2 6.66667 2H9.33333C10.0406 2 10.7189 2.28095 11.219 2.78105C11.719 3.28115 12 3.95942 12 4.66667Z" />
    </StrokeGlyph>
  );
}

/**
 * Upload / share-out icon on the chrome bar (Figma tabler-icon-share-2).
 *
 * @param props - Glyph props.
 * @returns The rendered icon.
 */
function ShareExportIcon(props: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 18 18" strokeWidth={1.5} defaultSize={18} {...props}>
      <path d="M6 6.75H5.25C4.85218 6.75 4.47064 6.90804 4.18934 7.18934C3.90804 7.47064 3.75 7.85218 3.75 8.25V14.25C3.75 14.6478 3.90804 15.0294 4.18934 15.3107C4.47064 15.592 4.85218 15.75 5.25 15.75H12.75C13.1478 15.75 13.5294 15.592 13.8107 15.3107C14.092 15.0294 14.25 14.6478 14.25 14.25V8.25C14.25 7.85218 14.092 7.47064 13.8107 7.18934C13.5294 6.90804 13.1478 6.75 12.75 6.75H12M9 10.5V2.25M11.25 4.5L9 2.25L6.75 4.5" />
    </StrokeGlyph>
  );
}

/**
 * Hamburger menu icon on the chrome bar (Figma tabler-icon-menu-2).
 *
 * @param props - Glyph props.
 * @returns The rendered icon.
 */
function MenuIcon(props: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 18 18" strokeWidth={1.5} defaultSize={18} {...props}>
      <path d="M3 4.5H15M3 9H15M3 13.5H15" />
    </StrokeGlyph>
  );
}

/** How the address text is aligned inside the address pill. */
export type AddressAlign = "center" | "right";

/** Props for {@link BrowserChrome}. */
export interface BrowserChromeProps {
  /**
   * Optional class applied to the chrome bar's root element. Callers use this
   * to absolutely position the chrome within their own artifact frame.
   */
  className?: string;
  /** Address-bar text. Defaults to "your-site.com". */
  address?: string;
  /** Alignment of the address text inside its pill. Defaults to "center". */
  addressAlign?: AddressAlign;
  /**
   * Whether the trailing share + menu actions are rendered. Set to false for
   * the wide address bar that intentionally bleeds off the panel edge.
   * Defaults to true.
   */
  showActions?: boolean;
  /**
   * When true, a pulsing green "Live" pill is rendered at the leading edge of
   * the address bar (the address text stays centered). Used by the "Live Site"
   * view to signal the comment lands on the real running site. Defaults to
   * false.
   */
  liveTag?: boolean;
  /**
   * When true, render the address text one step smaller. Used by the
   * "Versioning" view so the wide right-aligned URL reads tidier next to the
   * version rail, without shrinking it for the other scenes. Defaults to false.
   */
  compactAddress?: boolean;
}

/**
 * Render the browser chrome bar: navigation chevrons, reload + bookmark, a
 * centered address pill and (optionally) the trailing share + menu actions.
 *
 * @param props - Optional positioning class, address text/alignment, a flag
 *   toggling the trailing actions and a flag toggling the "Live" pill.
 * @returns The chrome bar element.
 */
export default function BrowserChrome({
  className,
  address = DEFAULT_ADDRESS,
  addressAlign = "center",
  showActions = true,
  liveTag = false,
  compactAddress = false,
}: BrowserChromeProps = {}) {
  const rootClassName = className ? `${styles.chrome} ${className}` : styles.chrome;
  const addressBarClassName =
    addressAlign === "right"
      ? `${styles.addressBar} ${styles.addressBarRight}`
      : styles.addressBar;
  const addressTextClassName = compactAddress
    ? `${styles.addressText} ${styles.addressTextCompact}`
    : styles.addressText;

  return (
    <header className={rootClassName}>
      <div className={styles.controls}>
        <ChevronLeftIcon size={16} />
        <ChevronRightIcon size={16} />
        <ReloadIcon size={16} />
        <BookmarkIcon size={16} />
      </div>
      <div className={addressBarClassName}>
        {liveTag ? (
          <span className={styles.livePill}>
            <span className={styles.liveDot} aria-hidden="true" />
            {LIVE_TAG_LABEL}
          </span>
        ) : null}
        <span className={addressTextClassName}>{address}</span>
      </div>
      {showActions ? (
        <div className={styles.controls}>
          <ShareExportIcon size={18} />
          <MenuIcon size={18} />
        </div>
      ) : null}
    </header>
  );
}
