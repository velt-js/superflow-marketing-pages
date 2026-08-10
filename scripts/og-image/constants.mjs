// Design tokens for the Superflow social/meta image template.
//
// Source of truth: Figma "Superflow Marketing - 2026", node 1112:1014
// https://www.figma.com/design/aVubXS2jMWMDlRK42zvgoy/Superflow-Marketing---2026?node-id=1112-1014
//
// Every measurement below is expressed against the 1280x720 Figma frame
// (BASE_WIDTH / BASE_HEIGHT). The renderer multiplies them by a scale
// factor so the same template can output any canvas size - see
// `scaleTokens` in template.mjs.

/** Width of the Figma artboard every token below is measured against. */
export const BASE_WIDTH = 1280;

/** Height of the Figma artboard every token below is measured against. */
export const BASE_HEIGHT = 720;

/**
 * Default output size. 1200x630 is the canonical Open Graph / Twitter
 * `summary_large_image` size and matches the existing site-wide
 * `public/opengraph-image.png`. Pass `--width 1280 --height 720` to render
 * the Figma frame at its exact dimensions instead.
 */
export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 630;

/** Directory generated cards are written to when `--out` is omitted. */
export const DEFAULT_OUT_DIR = "public/og";

/** Brand wordmark rendered next to the logo mark. */
export const BRAND_NAME = "Superflow";

/** Muted domain line pinned to the bottom of the card. */
export const DEFAULT_FOOTER = "usesuperflow.ai";

/** Logo mark reused from the site nav so the card never drifts from the app. */
export const LOGO_SVG_PATH = "public/images/nav/logo.svg";

/**
 * Background gradient stops, bottom to top. Figma emits this as
 * `linear-gradient(0deg, ...)`; `to top` is the equivalent and avoids
 * relying on angle handling in the rasterizer.
 */
export const GRADIENT = "linear-gradient(to top, #B0E2FF 0%, #68AFE9 50%, #4596DF 75%, #217CD4 100%)";

/** Type colors. */
export const COLOR_TITLE = "#FFFFFF";
export const COLOR_BRAND = "#FFFFFF";
export const COLOR_FOOTER = "#428AC9";

/** Font family name registered with the rasterizer. */
export const FONT_FAMILY = "Urbanist";

/** Font weights the template needs. Keep in sync with `FONT_URLS`. */
export const FONT_WEIGHT_REGULAR = 400;
export const FONT_WEIGHT_BOLD = 700;

/**
 * Urbanist TTFs from Google Fonts. `next/og` rasterizes with Satori, which
 * reads ttf/otf/woff but NOT woff2 - so these are the static `format('truetype')`
 * URLs, not the woff2 ones a browser would pick up.
 */
export const FONT_URLS = {
  [FONT_WEIGHT_REGULAR]:
    "https://fonts.gstatic.com/s/urbanist/v18/L0xjDF02iFML4hGCyOCpRdycFsGxSrqDyx4fFg.ttf",
  [FONT_WEIGHT_BOLD]:
    "https://fonts.gstatic.com/s/urbanist/v18/L0xjDF02iFML4hGCyOCpRdycFsGxSrqDLBkfFg.ttf",
};

/** Where downloaded fonts are cached so repeat runs work offline. */
export const FONT_CACHE_DIR = "scripts/og-image/.fonts";

// The comp's type runs large on a real timeline card, so everything below is
// dialled back ~20% from Figma while keeping the comp's proportions. The Figma
// values are kept alongside for reference; scale all of them together if you
// want the card bigger or smaller again.

/** Header: logo mark box, gap to the wordmark, and distance from the top edge. */
export const LOGO_HEIGHT = 26; // Figma: 32
export const LOGO_GAP = 15; // Figma: 18
export const HEADER_TOP = 60;
export const BRAND_FONT_SIZE = 29; // Figma: 36

/** Title block. */
export const TITLE_MAX_WIDTH = 947;
export const TITLE_FONT_SIZE_MAX = 78; // Figma: 100
export const TITLE_FONT_SIZE_MIN = 42; // Figma: 52
/** Step the auto-fit ladder walks down in, in base pixels. */
export const TITLE_FONT_SIZE_STEP = 4;
export const TITLE_LINE_HEIGHT = 1.2;
/** Letter spacing at TITLE_FONT_SIZE_MAX; scaled with the font size as an em value. */
export const TITLE_TRACKING_EM = -0.03;
// Note on kerning: Figma applies OpenType kern pairs, the Satori/resvg
// rasterizer behind `next/og` does not. Glyph advances and tracking match the
// comp within a pixel, but kern-heavy pairs around spaces render slightly
// wider here - "y I" is ~12px looser at 100px, "h S" ~3px. Nothing to correct:
// a fixed word-gap fudge fixes one pair and breaks the rest, so the template
// uses each font's real space advance and lets the wrapper measure the same.
/** Titles wrap onto at most this many lines before the type shrinks. */
export const DEFAULT_MAX_LINES = 3;

/**
 * Even out headline line lengths, as CSS `text-wrap: balance` would. Satori
 * has no `text-wrap` support, so this is applied in the line breaker - see
 * `balanceWrap` in measure.mjs.
 */
export const DEFAULT_BALANCE = true;

/** Footer line. */
export const FOOTER_FONT_SIZE = 20; // Figma: 24
export const FOOTER_BOTTOM = 44;

/** Log prefixes, kept here so output stays uniform across modules. */
export const LOG_PREFIX = "[og]";
export const LOG_PREFIX_ERROR = "[og] error:";
