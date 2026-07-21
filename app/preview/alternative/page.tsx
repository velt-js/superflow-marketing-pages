// Preview route for the 2026 alternatives hub.
//
//   /preview/alternative  →  the alternatives listicles only, rendered with
//   ComparisonHubBody. The detail pages stay at
//   /preview/comparison/<x>-alternative.
//
// Shares the comparisonPreviewHub Sanity doc for chrome; the hero copy is
// overridden here because the alternatives class has its own framing.
// Kept out of the index (noindex) while in preview; robots.ts already
// disallows /preview/.

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

const COMPARISON_PATH = "/preview/comparison";
const BASE_PATH = "/preview/alternative";
const HUB_TITLE = "Alternatives, ranked honestly";
const HUB_DESCRIPTION =
  "The switcher listicles: the best options per tool, every claim from the vendor's own site, dated, including one honest reason to stay.";

/**
 * Build the ItemList JSON-LD so the alternatives hub is a crawlable index of
 * the published listicles.
 *
 * @param items - The published alternatives catalog entries.
 * @returns A schema.org ItemList node.
 */
function buildAlternativesItemList(
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
  return buildPageMetadata({
    title: `${HUB_TITLE} | Superflow`,
    description: HUB_DESCRIPTION,
    path: BASE_PATH,
    // Preview route — keep it out of the index while in review.
    noindex: true,
  });
}

export default async function AlternativesPreviewHubPage() {
  const [doc, items] = await Promise.all([
    getComparisonPreviewHub() as Promise<ComparisonHubDoc | null>,
    getAllComparisonPreviewsForHub() as Promise<ComparisonHubItem[]>,
  ]);

  const alternativesItems = (items ?? []).filter(
    (item) => item?._type === "comparisonPreviewAlternativesPage",
  );

  return (
    <>
      <PageJsonLd
        name={`${HUB_TITLE} | Superflow`}
        description={HUB_DESCRIPTION}
        path={BASE_PATH}
        trail={[
          { name: "Comparisons", url: `${SITE_URL}${COMPARISON_PATH}` },
          { name: "Alternatives", url: `${SITE_URL}${BASE_PATH}` },
        ]}
      />
      <JsonLd
        id="ld-itemlist-alternatives-hub"
        data={buildAlternativesItemList(alternativesItems)}
      />
      <ComparisonHubBody
        doc={doc}
        items={alternativesItems}
        visibleTypes={["comparisonPreviewAlternativesPage"]}
        heroOverride={{
          kicker: "· ALTERNATIVES · RANKED FOR AGENCIES",
          headline: "Alternatives, ranked honestly.",
          subhead: HUB_DESCRIPTION,
        }}
        crossLinks={[
          {
            label: "Head-to-head and tool-vs-tool: the comparisons hub",
            href: COMPARISON_PATH,
          },
        ]}
      />
    </>
  );
}
