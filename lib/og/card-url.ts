// Builds `/api/og` URLs for CMS-backed pages.
//
// Static routes use committed PNGs from `app/_seo/og-images.ts`. Pages whose
// title comes from Sanity use this instead, so the card always matches the
// live content and new documents are covered without a regeneration step.

/** Query parameter the route reads the headline from. */
export const OG_CARD_TITLE_PARAM = "title";

/** Path of the runtime card renderer. */
export const OG_CARD_PATH = "/api/og";

/**
 * Longest headline the route will render.
 *
 * Well past what fits on a card - the fitter shrinks anything longer to the
 * floor size - but it bounds the URL and the work an arbitrary caller can ask
 * for. Kept here so the route and its callers agree on one number.
 */
export const MAX_TITLE_LENGTH = 200;

/**
 * Trailing brand suffixes to drop before rendering.
 *
 * Sanity `metaTitle` values usually already end in the brand, and the card
 * already shows the Superflow lockup - "Private Comments | Superflow" under a
 * Superflow logo reads as a mistake.
 *
 * The tail alternatives are enumerated from the forms actually present in the
 * dataset ("| Superflow", "| Superflow Blog", "- Superflow by Velt",
 * "| Superflow Developer Platform") rather than matched with a greedy `.*$`,
 * which would eat real copy from a title that happens to read
 * "... - Superflow makes it easy". An unrecognised suffix simply stays on the
 * card, which is the safe way to be wrong.
 */
const BRAND_SUFFIX_PATTERN =
  /\s*[|\-–—]\s*Superflow(?:\s+Blog|\s+by\s+Velt|\s+Developer\s+Platform)?\s*$/i;

/**
 * Site style bans em dashes in rendered copy, and `buildPageMetadata` already
 * normalizes them out of titles - do the same here so a card never shows one.
 */
const EM_DASH_PATTERN = /\s*—\s*/g;

/**
 * Build the `/api/og` URL for a headline.
 *
 * Returns a root-relative path; `buildPageMetadata` resolves it against the
 * `metadataBase` in `app/layout.tsx`, so it lands on the canonical domain.
 *
 * @param title - Headline to render. Falsy input yields `undefined` so the
 *   caller falls through to the site-wide default image.
 * @returns Root-relative card URL, or `undefined` when there is no title.
 */
export function ogCardUrl(title: string | null | undefined): string | undefined {
  try {
    const cleaned = String(title ?? "")
      .replace(BRAND_SUFFIX_PATTERN, "")
      .replace(EM_DASH_PATTERN, " - ")
      .trim();

    if (!cleaned) {
      return undefined;
    }

    const params = new URLSearchParams({
      [OG_CARD_TITLE_PARAM]: cleaned.slice(0, MAX_TITLE_LENGTH),
    });
    return `${OG_CARD_PATH}?${params.toString()}`;
  } catch {
    // Never let card-URL construction break a page's metadata.
    return undefined;
  }
}
