// /directory - the agency directory list.
//
// One searchable list of every agency, not four category landing pages.
// Categories are a filter on this page (`?category=<slug>`); the routes
// they used to have 308 to that parameter - see `redirects` in
// next.config.ts and DIRECTORY_CATEGORY_PARAM in lib/directory/constants.ts.
//
// The whole list is rendered server-side, in the directory's default order
// (see `getDirectoryAgencyList`). The controls on top of it
// (AgencyGrid -> AgencyExplorer) are the only client-side piece, and they
// only choose which of the already-rendered cards to show - so the server
// HTML a crawler or `curl` sees carries every agency's card and link
// regardless of client JS. Verify that after changing anything here:
//
//   curl -s http://localhost:3000/directory \
//     | grep -o 'href="/directory/agency/[a-z0-9-]*"' | sort -u | wc -l
//
// Chrome is the 2026 design system, same as / and /integrations.

import type { Metadata } from "next";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import DirectoryListHero from "@/components/directory/DirectoryListHero";
import AgencyGrid from "@/components/directory/AgencyGrid";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import {
  DIRECTORY_ALL_CATEGORIES,
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORY_PARAM,
  resolveDirectoryCategoryParam,
} from "@/lib/directory/constants";
import {
  agencyPath,
  buildAgencyListStats,
  getDirectoryAgencyList,
  getDirectoryCategory,
} from "@/lib/directory/agencies";

// The bundled scrape with the `agencyListing` corrections in Sanity merged
// over it - see lib/directory/agencies.ts#getDirectoryAgencies. The scrape
// moves only when its output is redeployed; the corrections are a live
// fetch, and this `revalidate` is what puts one published in the Studio on
// the page without a deploy. `getDirectoryAgencies` memoizes on the same
// 60s clock, so the two cannot drift.
export const revalidate = 60;

const HUB_TITLE = "Agency Directory";
const HUB_HEADING = "Find the agency that fits your project";
/** Fallback subheading, used only if the stats cannot be computed. */
const HUB_SUBHEADING =
  "Browse agencies by category, country or client, ranked on what their source directory publishes about them. Every profile links back to that source so you can verify the work yourself.";
const HUB_META_DESCRIPTION =
  "A searchable directory of web design, SEO, branding and motion design agencies, with location, services, clients and the award or review record each source publishes.";

interface DirectoryPageProps {
  /** `searchParams` is a promise in Next 16. */
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Builds the page's one-line subheading from the live dataset, so the size
 * of the directory is never a number typed into copy and left to rot.
 *
 * @param agencyCount - How many agencies are listed.
 * @param countryCount - How many distinct countries they sit in.
 * @returns The subheading, or the static fallback for an empty dataset.
 */
function buildHubSubheading(agencyCount: number, countryCount: number): string {
  try {
    if (agencyCount <= 0 || countryCount <= 0) return HUB_SUBHEADING;
    return `${agencyCount} studios and agencies across ${countryCount} countries, each ranked on what its source directory publishes and linked back to it.`;
  } catch {
    return HUB_SUBHEADING;
  }
}

/**
 * Builds metadata for the list page.
 *
 * The canonical is always `/directory`, filtered view or not: `?category=`
 * narrows one list, it does not mint a second page, and pointing every
 * filtered view at the bare path is what keeps the retired category URLs'
 * 308s consolidating onto one document instead of four near-duplicates.
 * The title still names the active category, so a visitor arriving from one
 * of those redirects can see they landed where they meant to.
 *
 * @param props - Route props carrying the query string.
 * @returns Next.js Metadata for the requested view.
 */
export async function generateMetadata({
  searchParams,
}: DirectoryPageProps): Promise<Metadata> {
  try {
    const params = await searchParams;
    const categorySlug = resolveDirectoryCategoryParam(params?.[DIRECTORY_CATEGORY_PARAM]);
    const category =
      categorySlug === DIRECTORY_ALL_CATEGORIES ? undefined : getDirectoryCategory(categorySlug);
    return buildPageMetadata({
      title: category ? category.title : HUB_TITLE,
      description: category ? category.metaDescription : HUB_META_DESCRIPTION,
      path: DIRECTORY_BASE_PATH,
    });
  } catch {
    return buildPageMetadata({
      title: HUB_TITLE,
      description: HUB_META_DESCRIPTION,
      path: DIRECTORY_BASE_PATH,
    });
  }
}

/**
 * Renders the directory list: hero, JSON-LD, and every agency as a card
 * under the search/category/country/sort toolbar.
 *
 * @param props - Route props carrying the query string.
 */
export default async function DirectoryListPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const initialCategory = resolveDirectoryCategoryParam(params?.[DIRECTORY_CATEGORY_PARAM]);

  // Always the full list, never the filtered slice: the client controls
  // pick from these pre-rendered cards, so an agency missing here is an
  // agency the category select can never show.
  const agencies = await getDirectoryAgencyList();
  const stats = buildAgencyListStats(agencies);

  return (
    <main>
      <PageJsonLd
        name={`${HUB_TITLE} | Superflow`}
        description={HUB_META_DESCRIPTION}
        path={DIRECTORY_BASE_PATH}
        trail={[{ name: "Directory", url: `${SITE_URL}${DIRECTORY_BASE_PATH}` }]}
      />
      <JsonLd
        id="ld-directory-collection"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: HUB_HEADING,
          description: HUB_META_DESCRIPTION,
          url: `${SITE_URL}${DIRECTORY_BASE_PATH}`,
        }}
      />
      {agencies.length > 0 && (
        <JsonLd
          id="ld-directory-itemlist"
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: HUB_TITLE,
            url: `${SITE_URL}${DIRECTORY_BASE_PATH}`,
            numberOfItems: agencies.length,
            itemListElement: agencies.map((agency, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}${agencyPath(agency?.slug ?? "")}`,
              name: agency?.name,
            })),
          }}
        />
      )}

      <SiteNav />
      <DirectoryListHero
        heading={HUB_HEADING}
        subheading={buildHubSubheading(stats.agencyCount, stats.countryCount)}
      />
      <AgencyGrid agencies={agencies} initialCategory={initialCategory} />
      {/* No testimonials section. It is social proof about agencies using
          Superflow, which reads as an endorsement of the agencies listed
          here when it sits directly beneath them - a claim the directory
          does not make and cannot support. */}
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
