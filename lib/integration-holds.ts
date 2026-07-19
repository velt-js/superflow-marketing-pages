// Single source of truth for integration pages that are built but HELD from
// publication. Per the content spec (superflow-page-integration-figma-v1-1.md):
// "HELD: this page does not go live until the registry marks Figma shipped.
// Build it, hold it."
//
// A held slug is excluded from every live/indexed surface:
//   - app/integrations/[slug]/page.tsx  (404s + excluded from static params)
//   - app/integrations/page.tsx         (hub grid + JSON-LD ItemList)
//   - app/sitemap.ts
//   - app/llms.txt/route.ts
//
// The noindexed preview route (/preview/integrations/<slug>) is deliberately
// NOT gated: the hold is about publication, not internal preview.
//
// To lift a hold: remove the slug from HELD_INTEGRATION_SLUGS below (one-line
// change), after the connector's registry ship-state flips. Any future
// preview -> live promotion path must also consult this list.

/** Integration slugs that must never appear on the live/indexed site. */
export const HELD_INTEGRATION_SLUGS: readonly string[] = ["figma"];

/**
 * Check whether an integration slug is currently held from publication.
 *
 * @param slug - The integration slug to check (e.g. "figma").
 * @returns True when the slug is held and must not be exposed on live surfaces.
 */
export function isHeldIntegrationSlug(slug: string | null | undefined): boolean {
  try {
    if (!slug) {
      return false;
    }
    return HELD_INTEGRATION_SLUGS.includes(slug.toLowerCase());
  } catch {
    return false;
  }
}
