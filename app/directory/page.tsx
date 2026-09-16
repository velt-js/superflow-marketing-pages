// /directory - the agency directory list.
//
// One searchable list of every agency, not four category landing pages.
// Categories are a filter on this page (`?category=<slug>`); the routes
// they used to have 308 to that parameter - see `redirects` in
// next.config.ts and DIRECTORY_CATEGORY_PARAM in lib/directory/constants.ts.
//
// The list is paged (`?page=`, DIRECTORY_PAGE_SIZE per page) and rendered
// server-side in the directory's default order - see
// `getDirectoryAgencyList`. Every card on the requested page is in the
// server HTML regardless of client JS, and the pager's links are real
// `<a href>`s, so a crawler reaches the other pages without running any.
// Verify both after changing anything here:
//
//   curl -s http://localhost:3000/directory \
//     | grep -o 'href="/directory/agency/[a-z0-9-]*"' | sort -u | wc -l
//   curl -s http://localhost:3000/directory | grep -o 'href="/directory?page=[0-9]*"'
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
  directoryListPath,
  DIRECTORY_ALL_CATEGORIES,
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORY_PARAM,
  DIRECTORY_PAGE_PARAM,
  DIRECTORY_PAGE_SIZE,
  resolveDirectoryCategoryParam,
  resolveDirectoryPageParam,
} from "@/lib/directory/constants";
import {
  buildAgencyListItems,
  buildAgencyListStats,
  getDirectoryAgencyList,
  getDirectoryCategory,
} from "@/lib/directory/agencies";
import type { AgencyListItem } from "@/lib/directory/agencies";

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
 * Narrows the projected list to the active category, using the same
 * primary-category rule the client filters by (`AgencyListItem.
 * categorySlug`) so the JSON-LD below cannot describe a different set of
 * agencies from the one the page renders.
 *
 * @param items - Every agency, projected.
 * @param categorySlug - The active category, or the "all" sentinel.
 * @returns The items in that category, in order.
 */
function selectCategory(items: AgencyListItem[], categorySlug: string): AgencyListItem[] {
  try {
    if (categorySlug === DIRECTORY_ALL_CATEGORIES) return items;
    return items.filter((item) => item?.categorySlug === categorySlug);
  } catch {
    return items;
  }
}

/**
 * Clamps a requested page to one that exists in the given list.
 *
 * `?page=` is a number anyone can type, and a category has however many
 * pages it has - `?category=seo&page=2` asks for a second page of a
 * 60-record category that only has one. Unclamped, the server sliced past
 * the end and rendered a page with no cards and no ItemList under a
 * canonical and a title that both said "page 2", while the client clamped
 * itself back to page 1 and showed page 1's cards. Same request, two
 * answers, neither of them the one the URL claimed.
 *
 * Clamped rather than 404ed or redirected: an out-of-range page is a view
 * parameter that has drifted, not a missing page, and the canonical this
 * produces points at the page the visitor actually got.
 *
 * @param requestedPage - The 1-based page from the query string.
 * @param itemCount - How many agencies the active category holds.
 * @returns A page number that exists, 1 or greater.
 */
function clampPage(requestedPage: number, itemCount: number): number {
  try {
    const pageCount = Math.max(1, Math.ceil(itemCount / DIRECTORY_PAGE_SIZE));
    return Math.min(Math.max(1, requestedPage), pageCount);
  } catch {
    return 1;
  }
}

/**
 * Builds metadata for one view of the list.
 *
 * **Each server-rendered view is its own canonical** - `/directory`,
 * `/directory?category=seo`, `/directory?page=3`. They are not duplicates
 * dressed up by a parameter: each renders a different set of agencies, and
 * two of the three exist precisely to receive something. `?category=` is
 * where the four retired category routes now land, and folding those into
 * `/directory` would hand a 308 to a page that does not answer the query
 * they ranked for; `?page=` is where 263 of the 323 agency profiles are
 * linked from, and a page whose canonical points elsewhere is a page whose
 * links may never be followed.
 *
 * The page number is clamped here against the live list, exactly as the
 * page body clamps it. Both have to, or `?page=99` renders the last page
 * under a canonical and a title claiming page 99 - see `clampPage`. The
 * dataset behind the clamp is memoized, so asking for it twice in one
 * request costs nothing.
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
    const categoryItems = selectCategory(
      buildAgencyListItems(await getDirectoryAgencyList()),
      categorySlug,
    );
    const page = clampPage(
      resolveDirectoryPageParam(params?.[DIRECTORY_PAGE_PARAM]),
      categoryItems.length,
    );
    const category =
      categorySlug === DIRECTORY_ALL_CATEGORIES ? undefined : getDirectoryCategory(categorySlug);
    const title = category ? category.title : HUB_TITLE;
    return buildPageMetadata({
      title: page > 1 ? `${title} - Page ${page}` : title,
      description: category ? category.metaDescription : HUB_META_DESCRIPTION,
      path: directoryListPath(categorySlug, page),
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

  // Always the whole list, never the page's slice: the client filters and
  // searches across every item and renders the page's worth of cards from
  // them, so an agency missing here is an agency no filter can reach.
  const agencies = await getDirectoryAgencyList();
  const items = buildAgencyListItems(agencies);
  const stats = buildAgencyListStats(agencies);

  // The slice this render actually shows, for the ItemList below. Derived
  // the same way the client derives it - same filter rule, same clamp, same
  // page size - so the schema, the canonical and the cards on screen cannot
  // disagree about which page this is.
  const categoryItems = selectCategory(items, initialCategory);
  const initialPage = clampPage(
    resolveDirectoryPageParam(params?.[DIRECTORY_PAGE_PARAM]),
    categoryItems.length,
  );
  const path = directoryListPath(initialCategory, initialPage);
  const pageOffset = (initialPage - 1) * DIRECTORY_PAGE_SIZE;
  const pageItems = categoryItems.slice(pageOffset, pageOffset + DIRECTORY_PAGE_SIZE);

  return (
    <main>
      <PageJsonLd
        name={`${HUB_TITLE} | Superflow`}
        description={HUB_META_DESCRIPTION}
        path={path}
        trail={[{ name: "Directory", url: `${SITE_URL}${DIRECTORY_BASE_PATH}` }]}
      />
      <JsonLd
        id="ld-directory-collection"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: HUB_HEADING,
          description: HUB_META_DESCRIPTION,
          url: `${SITE_URL}${path}`,
        }}
      />
      {pageItems.length > 0 && (
        <JsonLd
          id="ld-directory-itemlist"
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: HUB_TITLE,
            url: `${SITE_URL}${path}`,
            // The agencies on THIS page, at their positions in the whole
            // list - an ItemList naming records the page does not show is
            // a claim about a different document.
            numberOfItems: pageItems.length,
            itemListElement: pageItems.map((item, index) => ({
              "@type": "ListItem",
              position: pageOffset + index + 1,
              url: `${SITE_URL}${item.href}`,
              name: item.name,
            })),
          }}
        />
      )}

      <SiteNav />
      <DirectoryListHero
        heading={HUB_HEADING}
        subheading={buildHubSubheading(stats.agencyCount, stats.countryCount)}
      />
      <AgencyGrid
        items={items}
        initialCategory={initialCategory}
        initialPage={initialPage}
      />
      {/* No testimonials section. It is social proof about agencies using
          Superflow, which reads as an endorsement of the agencies listed
          here when it sits directly beneath them - a claim the directory
          does not make and cannot support. */}
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
