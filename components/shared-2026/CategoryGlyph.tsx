import type { ReactNode } from "react";

/**
 * Colorful category glyphs for the 2026 use-case / user-persona cards.
 *
 * The CMS ships flat white-stroke Framer icons that only read on dark tiles —
 * the old cards parked them on black discs. These cards instead render a bare
 * Tabler stroke glyph in a per-category accent colour (the same idiom as the
 * integrations-hub related cards in
 * `components/integration-2026/IntegrationsHubSections.tsx`). Icons are inline
 * Tabler path data (24 × 24 viewBox, stroke 2, round caps) so there is no
 * icon-library dependency and no dark chip.
 */

/** Names of the available Tabler glyphs. */
export type CategoryGlyphName =
  | "briefcase"
  | "code"
  | "speakerphone"
  | "brush"
  | "rocket"
  | "trending-up"
  | "bug"
  | "users"
  | "message-circle"
  | "target"
  | "typography"
  | "video"
  | "world"
  | "device-desktop"
  | "list-check"
  | "layout-dashboard";

/** Tabler path data per glyph (24 × 24 viewBox, stroke geometry). */
const GLYPH_PATHS: Record<CategoryGlyphName, readonly string[]> = {
  briefcase: [
    "M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z",
    "M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2",
    "M12 12l0 .01",
    "M3 13a20 20 0 0 0 18 0",
  ],
  code: ["M7 8l-4 4l4 4", "M17 8l4 4l-4 4", "M14 4l-4 16"],
  speakerphone: [
    "M18 8a3 3 0 0 1 0 6",
    "M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5",
    "M12 8h0l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8",
  ],
  brush: [
    "M3 21v-4a4 4 0 1 1 4 4h-4",
    "M21 3a16 16 0 0 0 -12.8 10.2",
    "M21 3a16 16 0 0 1 -10.2 12.8",
    "M10.6 9a9 9 0 0 1 4.4 4.4",
  ],
  rocket: [
    "M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3",
    "M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3",
    "M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
  ],
  "trending-up": ["M3 17l6 -6l4 4l8 -8", "M14 7l7 0l0 7"],
  bug: [
    "M9 9v-1a3 3 0 0 1 6 0v1",
    "M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3",
    "M3 13l4 0",
    "M17 13l4 0",
    "M12 20l0 -6",
    "M4 19l3.35 -2",
    "M20 19l-3.35 -2",
    "M4 7l3.75 2.4",
    "M20 7l-3.75 2.4",
  ],
  users: [
    "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
    "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2",
    "M16 3.13a4 4 0 0 1 0 7.75",
    "M21 21v-2a4 4 0 0 0 -3 -3.85",
  ],
  "message-circle": [
    "M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1",
  ],
  target: [
    "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0",
    "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
  ],
  typography: [
    "M4 20l3 0",
    "M14 20l7 0",
    "M6.9 15l6.9 0",
    "M10.2 6.3l5.8 13.7",
    "M5 20l6 -16l2 0l7 16",
  ],
  video: [
    "M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z",
    "M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z",
  ],
  world: [
    "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M3.6 9h16.8",
    "M3.6 15h16.8",
    "M11.5 3a17 17 0 0 0 0 18",
    "M12.5 3a17 17 0 0 1 0 18",
  ],
  "device-desktop": [
    "M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z",
    "M7 20h10",
    "M9 16v4",
    "M15 16v4",
  ],
  "list-check": [
    "M3.5 5.5l1.5 1.5l2.5 -2.5",
    "M3.5 11.5l1.5 1.5l2.5 -2.5",
    "M3.5 17.5l1.5 1.5l2.5 -2.5",
    "M11 6l9 0",
    "M11 12l9 0",
    "M11 18l9 0",
  ],
  "layout-dashboard": [
    "M4 4h6v8h-6z",
    "M4 16h6v4h-6z",
    "M14 12h6v8h-6z",
    "M14 4h6v4h-6z",
  ],
};

/**
 * Accent palette, aligned with hexes already in use across the 2026 pages
 * (integrations hub family tiles / related-card glyphs, home artifacts).
 */
const ACCENT = {
  indigo: "#5b5bd6",
  violet: "#7c5cfc",
  teal: "#0ca678",
  pink: "#c760e1",
  orange: "#e16e34",
  green: "#17b26a",
  coral: "#e5484d",
  blue: "#4c7ef3",
  amber: "#eba113",
} as const;

/** A resolved glyph choice: which icon to draw and its accent colour. */
export interface CategoryGlyphChoice {
  glyph: CategoryGlyphName;
  color: string;
}

/** Fallback when no keyword rule matches the label. */
const DEFAULT_CHOICE: CategoryGlyphChoice = {
  glyph: "layout-dashboard",
  color: ACCENT.indigo,
};

/**
 * Ordered keyword rules mapping a card label to a glyph + colour. More
 * specific phrases sit above the generic terms they contain (e.g. "marketing
 * agency" above "marketing", "product manager" above "manager").
 */
const CATEGORY_RULES: readonly {
  pattern: RegExp;
  choice: CategoryGlyphChoice;
}[] = [
  { pattern: /marketing agency|agenc/, choice: { glyph: "speakerphone", color: ACCENT.orange } },
  { pattern: /project manager/, choice: { glyph: "briefcase", color: ACCENT.indigo } },
  { pattern: /product manager|product owner/, choice: { glyph: "rocket", color: ACCENT.violet } },
  { pattern: /founder|ceo|startup/, choice: { glyph: "target", color: ACCENT.coral } },
  { pattern: /product company|company/, choice: { glyph: "users", color: ACCENT.amber } },
  { pattern: /developer|engineer/, choice: { glyph: "code", color: ACCENT.teal } },
  { pattern: /design|ux|ui/, choice: { glyph: "brush", color: ACCENT.pink } },
  { pattern: /market/, choice: { glyph: "trending-up", color: ACCENT.green } },
  { pattern: /qa|uat|test|bug/, choice: { glyph: "bug", color: ACCENT.coral } },
  { pattern: /conversion/, choice: { glyph: "target", color: ACCENT.orange } },
  { pattern: /copy|content|blog/, choice: { glyph: "typography", color: ACCENT.violet } },
  { pattern: /video/, choice: { glyph: "video", color: ACCENT.blue } },
  { pattern: /staging|production|device/, choice: { glyph: "device-desktop", color: ACCENT.teal } },
  { pattern: /website|landing|web ?app|site/, choice: { glyph: "world", color: ACCENT.blue } },
  { pattern: /checklist|workflow|approval/, choice: { glyph: "list-check", color: ACCENT.green } },
  { pattern: /feedback|comment|review|collab/, choice: { glyph: "message-circle", color: ACCENT.indigo } },
  { pattern: /team|client|stakeholder/, choice: { glyph: "users", color: ACCENT.amber } },
];

/**
 * Pick the glyph + accent colour for a card label via the keyword rules,
 * falling back to a neutral dashboard glyph.
 *
 * @param label - The card's title (e.g. "Project Managers", "Client feedback").
 * @returns The glyph name and accent hex to render.
 */
export function resolveCategoryGlyph(label?: string | null): CategoryGlyphChoice {
  try {
    const normalizedLabel = (label ?? "").toLowerCase();
    if (!normalizedLabel) {
      return DEFAULT_CHOICE;
    }
    const matchedRule = CATEGORY_RULES.find((rule) =>
      rule.pattern.test(normalizedLabel),
    );
    return matchedRule?.choice ?? DEFAULT_CHOICE;
  } catch {
    return DEFAULT_CHOICE;
  }
}

/** Props for {@link CategoryGlyph}. */
export interface CategoryGlyphProps {
  /** Card label the glyph + colour are resolved from. */
  label?: string;
  /** Rendered square size in pixels. */
  size?: number;
}

/**
 * A colourful Tabler stroke glyph for a category/persona card — no dark disc,
 * just the coloured outline icon (matching the site's accent-glyph idiom).
 * Decorative: hidden from the accessibility tree.
 *
 * @param props - The label to resolve and the render size.
 * @returns The coloured glyph, or `null` on failure.
 */
export default function CategoryGlyph({
  label,
  size = 32,
}: CategoryGlyphProps): ReactNode {
  try {
    const choice = resolveCategoryGlyph(label);
    const paths = GLYPH_PATHS[choice.glyph] ?? GLYPH_PATHS[DEFAULT_CHOICE.glyph];

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={choice.color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}
