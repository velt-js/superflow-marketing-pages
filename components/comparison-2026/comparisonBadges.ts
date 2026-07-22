// Server-safe numbered-badge palette for the comparison pages (Figma node
// 1061:2384). Kept out of the client components so server page bodies can
// resolve badge colors without crossing the client boundary.

/** Per-dimension badge colors, in canonical dimension order (01 → 08). */
export const DIMENSION_BADGE_COLORS: readonly string[] = [
  "#d146cf",
  "#d14746",
  "#19bc86",
  "#db9721",
  "#467bd1",
  "#2cbed8",
  "#e3711a",
  "#a22ed4",
];

/** Fallback badge color when an index is out of range. */
const FALLBACK_BADGE_COLOR = "#1a78e0";

/**
 * Badge color for the dimension at the given zero-based index.
 *
 * @param index - Zero-based dimension index (0 = "01").
 * @returns A hex color from the canonical palette.
 */
export function dimensionBadgeColor(index: number): string {
  try {
    return (
      DIMENSION_BADGE_COLORS?.[index % DIMENSION_BADGE_COLORS.length] ??
      FALLBACK_BADGE_COLOR
    );
  } catch {
    return FALLBACK_BADGE_COLOR;
  }
}

/**
 * Two-digit display number for a zero-based index (0 → "01").
 *
 * @param index - Zero-based index.
 * @returns The padded number string.
 */
export function badgeNumber(index: number): string {
  try {
    return String(index + 1).padStart(2, "0");
  } catch {
    return "01";
  }
}
