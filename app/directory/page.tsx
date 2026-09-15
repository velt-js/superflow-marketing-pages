// /directory - the agency directory hub.
//
// Lists every browsable category from DIRECTORY_CATEGORIES. Adding a
// category is a constants-only change (see lib/directory/constants.ts and
// app/directory/README.md) - this page needs no edit to pick it up.
//
// It used to render through components/listing-2026/ListingPage, the
// shared shell behind /use-case and /checklist. It does not any more,
// because the hub now needs two hero CTAs (a primary "Get matched" and a
// secondary "Browse by category"), a "For YC founders" strip between the
// grid and the footer, and the Superflow trial block demoted to the
// bottom of the page. Bending the shared shell into that shape would have
// meant three new optional props used by exactly one caller.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
// The 2026 grid, same as every other listing page on the site. It takes
// the legacy `ListingItem` shape, which is why the type import points at
// the older module.
import ListingGrid from "@/components/listing-2026/ListingGrid";
import type { ListingItem } from "@/components/listing/ListingGrid";
import DirectoryAnalytics from "@/components/directory/DirectoryAnalytics";
import DirectoryHubHero from "@/components/directory/DirectoryHubHero";
import DirectoryTrialCta from "@/components/directory/DirectoryTrialCta";
import YcFoundersStrip from "@/components/directory/YcFoundersStrip";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import { getClaimMap } from "@/lib/directory/claims";
import { buildCategoryStats, selectCategoryAgencies } from "@/lib/directory/listing";

export const revalidate = 60;

const HUB_TITLE = "Agency Directory";

/** Hero copy.
 *
 *  The old headline was "Find the agency that fits your project" over a
 *  subhead about source attribution. Attribution is still true and still
 *  on every profile, but it answers a question about US, not about the
 *  agencies - and a founder arriving here wants to know what a project
 *  costs, how long it takes and who will reply. */
const HUB_HEADING = "Find an agency that fits your project";
const HUB_SUBHEADING =
  "Verified studios with real budgets, timelines, and platforms. Built for YC founders, open to everyone.";

/** Meta description. Longer and plainer than the hero subhead: this one
 *  is read in a search result by somebody who has not seen the page. */
const HUB_META_DESCRIPTION =
  "A directory of web design, SEO, branding and motion design agencies with stated minimum budgets, typical timelines, platforms and reply times. Filter by budget and platform, or get matched to three studios.";

const BROWSE_CTA = "Browse agencies";
const COMING_SOON_LABEL = "Agencies coming soon";

export const metadata = buildPageMetadata({
  title: HUB_TITLE,
  description: HUB_META_DESCRIPTION,
  path: DIRECTORY_BASE_PATH,
});

/**
 * Renders the directory hub: hero, JSON-LD, a category grid driven
 * entirely off `DIRECTORY_CATEGORIES`, the YC founders strip, and the
 * trial block.
 */
export default async function DirectoryHubPage() {
  // One read of the live claim layer for every category, rather than one
  // per category - see `selectCategoryAgencies`.
  const claims = await getClaimMap();

  const categories = DIRECTORY_CATEGORIES.map((category) => {
    const agencies = selectCategoryAgencies(category.slug, claims);
    return { category, stats: buildCategoryStats(agencies) };
  });

  const items: ListingItem[] = categories.map(({ category, stats }) => ({
    title: category.title,
    subtitle:
      stats.agencyCount > 0
        ? `${stats.agencyCount} ${stats.agencyCount === 1 ? "agency" : "agencies"}${
            stats.verifiedCount > 0 ? ` · ${stats.verifiedCount} verified` : ""
          }`
        : COMING_SOON_LABEL,
    href: `${DIRECTORY_BASE_PATH}/${category.slug}`,
    cta: BROWSE_CTA,
  }));

  const offerCountsBySlug = Object.fromEntries(
    categories.map(({ category, stats }) => [category.slug, stats.ycOfferCount]),
  );

  return (
    <main>
      <PageJsonLd
        name={`${HUB_TITLE} | Superflow`}
        description={HUB_META_DESCRIPTION}
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

      <DirectoryAnalytics
        event={AnalyticsEvents.DIRECTORY_VIEWED}
        properties={{ category: "hub" }}
      />

      <SiteNav />
      <DirectoryHubHero heading={HUB_HEADING} subheading={HUB_SUBHEADING} />
      {/* The anchor the hero's "Browse by category" points at. A wrapper
          rather than a prop on ListingGrid: the grid is shared with four
          other pages and none of them needs an id. */}
      <div id="categories">
        <ListingGrid items={items} />
      </div>
      <YcFoundersStrip offerCountsBySlug={offerCountsBySlug} />
      {/* No testimonials section here. It is social proof about agencies
          using Superflow, which reads as an endorsement of the listed
          agencies when it sits under a directory of them - a claim this
          directory does not make. The trial block below is about our own
          product and says so. */}
      <DirectoryTrialCta />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
