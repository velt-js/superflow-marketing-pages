// /comparisons - the 2026 comparison hub, promoted from
// /preview/comparison (which now permanently redirects here, see
// next.config.ts). The single comparisonPreviewHub (Sanity) document
// plus the catalog of the vs and arbiter classes, rendered with
// ComparisonHubBody. Alternatives listicles live on their own hub at
// /alternative. Legacy comparisonPage documents keep serving at
// /comparisons/<slug> via the detail route's fallback.

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
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/comparisons";
const ALTERNATIVES_PATH = "/alternative";
const FALLBACK_TITLE = "Comparisons";
const FALLBACK_DESCRIPTION =
  "Superflow against the field, the field against itself, and the honest alternatives lists. Every claim from the vendor's own site, dated.";

/**
 * Build the ItemList JSON-LD so the hub is a crawlable index of the
 * published comparison pages.
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
    ogImage: PAGE_OG_IMAGES.comparisons,
  });
}

export default async function ComparisonHubPage() {
  const [doc, items] = await Promise.all([
    getComparisonPreviewHub() as Promise<ComparisonHubDoc | null>,
    getAllComparisonPreviewsForHub() as Promise<ComparisonHubItem[]>,
  ]);

  // The alternatives class lives on its own hub at /alternative.
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
            href: ALTERNATIVES_PATH,
          },
        ]}
      />
    </>
  );
}
