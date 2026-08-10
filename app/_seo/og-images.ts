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
