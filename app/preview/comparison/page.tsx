// Preview route for the new 2026 comparison hub.
//
//   /preview/comparison  →  the single comparisonPreviewHub (Sanity) document
//   plus the catalog of the three new comparison classes (superflow-vs-x,
//   x-vs-y, alternatives), rendered with ComparisonHubBody.
//
// Isolated from the legacy /comparisons and /alternative routes — those are
// untouched. Kept out of the index (noindex) while in preview; robots.ts
// already disallows /preview/.

import ComparisonHubBody from "@/components/comparison-2026/ComparisonHubBody";
import type {
  ComparisonHubDoc,
  ComparisonHubItem,
} from "@/components/comparison-2026/types";
import {
  getAllComparisonPreviewsForHub,
  getComparisonPreviewHub,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/preview/comparison";
const FALLBACK_TITLE = "Comparisons";
const FALLBACK_DESCRIPTION =
  "Superflow against the field, the field against itself, and the honest alternatives lists. Every claim from the vendor's own site, dated.";

/**
 * Build the ItemList JSON-LD so the hub is a crawlable index of the published
 * preview pages.
 *
 * @param items - The published comparison catalog entries.
 * @returns A schema.org ItemList node.
 */
function buildComparisonItemList(
  items: ComparisonHubItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (items ?? []).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item?.title,
      url: `${SITE_URL}${BASE_PATH}/${item?.slug}`,
    })),
  };
}

export async function generateMetadata() {
  const doc = (await getComparisonPreviewHub()) as ComparisonHubDoc | null;
  return buildPageMetadata({
    title: doc?.metaTitle ?? doc?.title ?? FALLBACK_TITLE,
    description: doc?.metaDescription ?? doc?.subhead ?? FALLBACK_DESCRIPTION,
    path: BASE_PATH,
    // Preview route — keep it out of the index while in review.
    noindex: true,
  });
}

export default async function ComparisonPreviewHubPage() {
  const [doc, items] = await Promise.all([
    getComparisonPreviewHub() as Promise<ComparisonHubDoc | null>,
    getAllComparisonPreviewsForHub() as Promise<ComparisonHubItem[]>,
  ]);

  // The alternatives class lives on its own hub at /preview/comparison/alternatives.
  const comparisonItems = (items ?? []).filter(
    (item) => item?._type !== "comparisonPreviewAlternativesPage",
  );

  const name = doc?.metaTitle ?? `${doc?.title ?? FALLBACK_TITLE} | Superflow`;
  const description = doc?.metaDescription ?? FALLBACK_DESCRIPTION;

  return (
    <>
      <PageJsonLd
        name={name}
        description={description}
        path={BASE_PATH}
        trail={[{ name: "Comparisons", url: `${SITE_URL}${BASE_PATH}` }]}
      />
      <JsonLd
        id="ld-itemlist-comparison-hub"
        data={buildComparisonItemList(comparisonItems)}
      />
      <ComparisonHubBody
        doc={doc}
        items={comparisonItems}
        visibleTypes={[
          "comparisonPreviewVsPage",
          "comparisonPreviewArbiterPage",
        ]}
        crossLinks={[
          {
            label: "Alternatives, ranked honestly: the listicle hub",
            href: "/preview/alternative",
          },
        ]}
      />
    </>
  );
}
