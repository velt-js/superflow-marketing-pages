// Live integrations hub (promoted from /preview/integrations).
//
//   /integrations  →  the single integrationPreviewHub (Sanity) document
//   rendered with the reusable home-2026 sections (see IntegrationsHubBody).
//
// This replaces the legacy ListingPage-based hub. The old /preview/integrations
// route now 308-redirects here (see next.config.ts).

import { notFound } from "next/navigation";

import IntegrationsHubBody, {
  type IntegrationsHubDoc,
  INTEGRATION_FAQ_ITEMS,
} from "@/components/integration-2026/IntegrationsHubBody";
import {
  getIntegrationPreviewHub,
  getAllIntegrationPreviewsForHub,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/integrations";
const FALLBACK_TITLE = "Integrations";
const FALLBACK_DESCRIPTION =
  "Superflow connects to the tools your agency already runs. Comments land in Slack, sign-offs close your project tasks, and webhooks cover the rest.";

/** Catalog entry as returned by getAllIntegrationPreviewsForHub. */
type HubCatalogItem = {
  _id: string;
  title: string;
  slug: string;
  family?: string | null;
  cardBlurb?: string | null;
};

/**
 * Build the ItemList JSON-LD so the hub is a crawlable index of the published
 * detail pages (mirrors the source's structured-data requirement).
 *
 * @param items - The published detail-page catalog entries.
 * @returns A schema.org ItemList node.
 */
function buildIntegrationsItemList(
  items: HubCatalogItem[],
): Record<string, unknown> {
  try {
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
  } catch {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [],
    };
  }
}

export async function generateMetadata() {
  const doc = (await getIntegrationPreviewHub()) as IntegrationsHubDoc | null;
  return buildPageMetadata({
    title: doc?.metaTitle ?? doc?.title ?? FALLBACK_TITLE,
    description:
      doc?.metaDescription ?? doc?.hero?.subhead ?? FALLBACK_DESCRIPTION,
    path: BASE_PATH,
    ogImage: doc?.ogImage ?? undefined,
  });
}

export default async function IntegrationsHubPage() {
  const [doc, catalogItems] = await Promise.all([
    getIntegrationPreviewHub() as Promise<IntegrationsHubDoc | null>,
    getAllIntegrationPreviewsForHub() as Promise<HubCatalogItem[]>,
  ]);

  if (!doc) {
    notFound();
  }

  const name = doc.metaTitle ?? `${doc.title ?? FALLBACK_TITLE} | Superflow`;
  const description =
    doc.metaDescription ?? doc.hero?.subhead ?? FALLBACK_DESCRIPTION;

  const faqEntries =
    doc.faq?.items && doc.faq.items.length > 0
      ? doc.faq.items
      : INTEGRATION_FAQ_ITEMS;
  const faqSchema = buildFaqPageSchema(faqEntries);
  const itemListSchema = buildIntegrationsItemList(catalogItems ?? []);

  return (
    <>
      <PageJsonLd
        name={name}
        description={description}
        path={BASE_PATH}
        trail={[{ name: "Integrations", url: `${SITE_URL}${BASE_PATH}` }]}
      />
      <JsonLd id="ld-faq-integrations-hub" data={faqSchema} />
      <JsonLd id="ld-itemlist-integrations-hub" data={itemListSchema} />
      <IntegrationsHubBody doc={doc} />
    </>
  );
}
