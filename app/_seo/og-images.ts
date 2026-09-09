// Per-page social card paths.
//
// The PNGs are generated from the Figma template by
// `scripts/og-image/generate-og.mjs` and committed under `public/og/pages/`.
// Headlines live in `scripts/og-image/pages.json`; edit that and re-run
// `npm run og:pages` to regenerate, then update the matching entry here if a
// file name changes.
//
// Only static routes appear here. CMS-backed `[slug]` pages resolve their
// image from Sanity (`doc.ogImage` / `doc.thumbnail`) and fall back to the
// site-wide `/opengraph-image.png` in `buildPageMetadata`.

/** Directory every generated page card lives in, relative to `public/`. */
const PAGE_OG_DIR = "/og/pages";

/**
 * Social card per static route, keyed by the route's path segment.
 *
 * Values are `public/`-relative and resolve against the `metadataBase` set in
 * `app/layout.tsx`.
 */
export const PAGE_OG_IMAGES = {
  affiliate: `${PAGE_OG_DIR}/affiliate.png`,
  alternative: `${PAGE_OG_DIR}/alternative.png`,
  blog: `${PAGE_OG_DIR}/blog.png`,
  bookDemo: `${PAGE_OG_DIR}/book-demo.png`,
  calculator: `${PAGE_OG_DIR}/calculator.png`,
  caseStudy: `${PAGE_OG_DIR}/case-study.png`,
  checklist: `${PAGE_OG_DIR}/checklist.png`,
  comparisons: `${PAGE_OG_DIR}/comparisons.png`,
  demo: `${PAGE_OG_DIR}/demo.png`,
  integrations: `${PAGE_OG_DIR}/integrations.png`,
  pricing: `${PAGE_OG_DIR}/pricing.png`,
  privacy: `${PAGE_OG_DIR}/privacy.png`,
  security: `${PAGE_OG_DIR}/security.png`,
  terms: `${PAGE_OG_DIR}/terms.png`,
  useCase: `${PAGE_OG_DIR}/use-case.png`,
  userPersona: `${PAGE_OG_DIR}/user-persona.png`,
  webflowPlugin: `${PAGE_OG_DIR}/webflow-plugin.png`,
} as const;

/** Key of a known static-page social card. */
export type PageOgImageKey = keyof typeof PAGE_OG_IMAGES;

/** Directory every generated free-tool card lives in, relative to `public/`. */
const TOOL_OG_DIR = "/og/tools";

/**
 * Social card per free tool, keyed by the tool's slug under `/tools/`.
 *
 * Sharing a tool link should unfurl to that tool, not to the generic site
 * card, so every live tool page carries its own image. Headlines live in
 * `scripts/og-image/tools.json`; edit that and re-run `npm run og:tools`.
 *
 * `index` is the `/tools` hub itself. Tools still marked `planned` in
 * `lib/tools/registry.ts` have no route and so no card.
 */
export const TOOL_OG_IMAGES: Record<string, string> = {
  index: `${TOOL_OG_DIR}/index.png`,
  "ai-visibility-checker": `${TOOL_OG_DIR}/ai-visibility-checker.png`,
  "alt-text-generator": `${TOOL_OG_DIR}/alt-text-generator.png`,
  "favicon-checker": `${TOOL_OG_DIR}/favicon-checker.png`,
  "full-page-screenshot": `${TOOL_OG_DIR}/full-page-screenshot.png`,
  "json-ld-generator": `${TOOL_OG_DIR}/json-ld-generator.png`,
  "json-ld-validator": `${TOOL_OG_DIR}/json-ld-validator.png`,
  "llms-txt-generator": `${TOOL_OG_DIR}/llms-txt-generator.png`,
  "lookalike-test": `${TOOL_OG_DIR}/lookalike-test.png`,
  "markdown-for-agents": `${TOOL_OG_DIR}/markdown-for-agents.png`,
  "markdown-viewer": `${TOOL_OG_DIR}/markdown-viewer.png`,
  mcp: `${TOOL_OG_DIR}/mcp.png`,
  "md5-generator": `${TOOL_OG_DIR}/md5-generator.png`,
  "meeting-planner": `${TOOL_OG_DIR}/meeting-planner.png`,
  "review-like-aaron-epstein": `${TOOL_OG_DIR}/review-like-aaron-epstein.png`,
  "review-like-elon-musk": `${TOOL_OG_DIR}/review-like-elon-musk.png`,
  "review-like-gustaf-alstromer": `${TOOL_OG_DIR}/review-like-gustaf-alstromer.png`,
  "review-like-jared-friedman": `${TOOL_OG_DIR}/review-like-jared-friedman.png`,
  "review-like-paul-graham": `${TOOL_OG_DIR}/review-like-paul-graham.png`,
  "review-like-pete-koomen": `${TOOL_OG_DIR}/review-like-pete-koomen.png`,
  "review-like-peter-thiel": `${TOOL_OG_DIR}/review-like-peter-thiel.png`,
  "review-like-steve-jobs": `${TOOL_OG_DIR}/review-like-steve-jobs.png`,
  "review-like-travis-kalanick": `${TOOL_OG_DIR}/review-like-travis-kalanick.png`,
  "review-like-yc-partner": `${TOOL_OG_DIR}/review-like-yc-partner.png`,
  "robots-txt-ai-checker": `${TOOL_OG_DIR}/robots-txt-ai-checker.png`,
  "social-preview-checker": `${TOOL_OG_DIR}/social-preview-checker.png`,
  "tech-stack-detector": `${TOOL_OG_DIR}/tech-stack-detector.png`,
  "utm-builder": `${TOOL_OG_DIR}/utm-builder.png`,
};

/**
 * Social card path for a free tool.
 *
 * Returns `undefined` for a slug with no committed card so
 * `buildPageMetadata` falls back to the site-wide image rather than pointing
 * Open Graph at a 404.
 *
 * @param slug - Tool slug under `/tools/`, or `"index"` for the hub page.
 * @returns The `public/`-relative card path, or undefined when none exists.
 */
export function toolOgImage(slug: string): string | undefined {
  try {
    return TOOL_OG_IMAGES[slug];
  } catch {
    return undefined;
  }
}
