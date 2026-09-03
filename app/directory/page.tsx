// /directory - the agency directory hub.
//
// Lists every browsable category from DIRECTORY_CATEGORIES (currently just
// Web Design). Adding a category is a constants-only change - see
// lib/directory/constants.ts and app/directory/README.md - this page needs
// no edit to pick it up.

import ListingPage from "@/components/listing/ListingPage";
import type { ListingItem } from "@/components/listing/ListingGrid";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import { getAgencyCountByCategory } from "@/lib/directory/agencies";

export const revalidate = 60;

const HUB_TITLE = "Agency Directory";
const HUB_HEADING = "Find the agency that fits your project";
const HUB_SUBHEADING =
  "Browse award-winning agencies by category. Every profile links back to its source so you can verify the work yourself.";
const BROWSE_CTA = "Browse agencies";
const COMING_SOON_LABEL = "Agencies coming soon";

export const metadata = buildPageMetadata({
  title: HUB_TITLE,
  description: HUB_SUBHEADING,
  path: DIRECTORY_BASE_PATH,
});

/**
 * Builds the subtitle shown under a category on the hub grid, degrading
 * to a "coming soon" message while that category's slice of the scraped
 * dataset is still empty.
 *
 * @param categorySlug - The category slug to count agencies for.
 * @returns Human-readable subtitle text for the category's ListingItem.
 */
function buildCategorySubtitle(categorySlug: string): string {
  try {
    const count = getAgencyCountByCategory(categorySlug);
    if (count <= 0) return COMING_SOON_LABEL;
    const noun = count === 1 ? "agency" : "agencies";
    return `${count} ${noun} indexed`;
  } catch {
    return COMING_SOON_LABEL;
  }
}

/**
 * Maps every directory category onto the shared `ListingItem` shape so
 * the hub page can reuse `ListingGrid` instead of a bespoke grid.
 *
 * @returns One `ListingItem` per entry in `DIRECTORY_CATEGORIES`.
 */
function buildCategoryItems(): ListingItem[] {
  try {
    return DIRECTORY_CATEGORIES.map((category) => ({
      title: category.title,
      subtitle: buildCategorySubtitle(category.slug),
      href: `${DIRECTORY_BASE_PATH}/${category.slug}`,
      cta: BROWSE_CTA,
    }));
  } catch {
    return [];
  }
}

/**
 * Renders the directory hub page: hero, JSON-LD, and a category grid
 * driven entirely off `DIRECTORY_CATEGORIES`.
 */
export default function DirectoryHubPage() {
  const items = buildCategoryItems();

  return (
    <>
      <PageJsonLd
        name={`${HUB_TITLE} | Superflow`}
        description={HUB_SUBHEADING}
        path={DIRECTORY_BASE_PATH}
        trail={[{ name: "Directory", url: `${SITE_URL}${DIRECTORY_BASE_PATH}` }]}
      />
      <JsonLd
        id="ld-directory-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: HUB_TITLE,
          url: `${SITE_URL}${DIRECTORY_BASE_PATH}`,
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}${item.href}`,
            name: item.title,
          })),
        }}
      />
      <ListingPage
        config={{
          hero: { heading: HUB_HEADING, subheading: HUB_SUBHEADING },
          grid: { variant: "text-only", items },
        }}
      />
    </>
  );
}
