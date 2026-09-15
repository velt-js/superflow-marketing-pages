// /solutions index: every solution page in two groups, "By agency" and
// "By job" (spec section 7). Entries come from the CMS merged over the seed
// list, so a new CMS page shows up here without a code change.

import SolutionsIndexBody, {
  INDEX_HEADING,
} from "@/components/solutions-2026/SolutionsIndexBody";
import { getSolutionOgImage } from "@/components/solutions-2026/og-images";
import { resolveSolutionSummaries } from "@/lib/solutions/resolve";
import { SOLUTIONS_BASE_PATH, solutionPath } from "@/lib/solutions/seed";
import type { SolutionSummary } from "@/lib/solutions/types";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const PAGE_TITLE = "Solutions";
const PAGE_DESCRIPTION =
  "Packs of QA agents built for the clients you serve and the jobs you run. Each pack checks every page on desktop and phone and posts findings as comments. Your client approves from a link.";
/** Breadcrumb and JSON-LD name for the index. */
const INDEX_NAME = `${INDEX_HEADING} | Superflow`;
/** Manifest key of the index card in scripts/og-image/solutions.json. */
const INDEX_OG_KEY = "index";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: SOLUTIONS_BASE_PATH,
  ogImage: getSolutionOgImage(INDEX_OG_KEY),
});

/**
 * ItemList JSON-LD so the index is a crawlable list of the solution pages.
 *
 * @param summaries - The listed pages, in display order.
 * @returns A schema.org ItemList node.
 */
function buildSolutionsItemList(
  summaries: readonly SolutionSummary[],
): Record<string, unknown> {
  try {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: summaries.length,
      itemListElement: summaries.map((summary, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: summary?.navLabel,
        url: `${SITE_URL}${solutionPath(summary?.slug)}`,
      })),
    };
  } catch {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [],
    };
  }
}

export default async function SolutionsIndexPage() {
  const summaries = await resolveSolutionSummaries();
  const itemListSchema = buildSolutionsItemList(summaries);

  return (
    <>
      <PageJsonLd
        name={INDEX_NAME}
        description={PAGE_DESCRIPTION}
        path={SOLUTIONS_BASE_PATH}
        trail={[{ name: PAGE_TITLE, url: `${SITE_URL}${SOLUTIONS_BASE_PATH}` }]}
      />
      <JsonLd id="ld-itemlist-solutions" data={itemListSchema} />
      <SolutionsIndexBody summaries={summaries} />
    </>
  );
}
