// Live integration detail pages (promoted from /preview/integrations/<slug>).
//
//   /integrations/<slug>  →  integrationPreviewPage (Sanity) rendered with the
//   reusable home-2026 sections (see IntegrationPageBody).
//
// This replaces the legacy IntegrationDetailPage template. The old
// /preview/integrations/<slug> route now 308-redirects here (next.config.ts).

import { notFound } from "next/navigation";

import IntegrationPageBody, {
  type IntegrationPageDoc,
} from "@/components/integration-2026/IntegrationPageBody";
import { FAQ_ITEMS } from "@/components/home-2026/FaqSection";
import {
  getAllIntegrationPreviewSlugs,
  getIntegrationPreviewPageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/integrations";
const FALLBACK_DESCRIPTION =
  "Superflow connects to the tools your agency already runs. Comments land in Slack, sign-offs close your project tasks, and webhooks cover the rest.";

export async function generateStaticParams() {
  const slugs = await getAllIntegrationPreviewSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getIntegrationPreviewPageBySlug(
    slug,
  )) as IntegrationPageDoc | null;
  if (!doc) {
    return {};
  }
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title,
    description:
      doc.metaDescription ?? doc.hero?.subhead ?? FALLBACK_DESCRIPTION,
    path: `${BASE_PATH}/${slug}`,
    ogImage: doc.ogImage ?? undefined,
  });
}

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getIntegrationPreviewPageBySlug(
    slug,
  )) as IntegrationPageDoc | null;
  if (!doc) {
    notFound();
  }

  const name = doc.metaTitle ?? `${doc.title} | Superflow`;
  const description =
    doc.metaDescription ?? doc.hero?.subhead ?? FALLBACK_DESCRIPTION;

  const faqEntries =
    doc.faq?.items && doc.faq.items.length > 0 ? doc.faq.items : FAQ_ITEMS;
  const faqSchema = buildFaqPageSchema(faqEntries);

  return (
    <>
      <PageJsonLd
        name={name}
        description={description}
        path={`${BASE_PATH}/${slug}`}
        trail={[
          { name: "Integrations", url: `${SITE_URL}${BASE_PATH}` },
          { name: doc.title, url: `${SITE_URL}${BASE_PATH}/${slug}` },
        ]}
      />
      <JsonLd id={`ld-faq-integration-${slug}`} data={faqSchema} />
      <IntegrationPageBody doc={doc} />
    </>
  );
}
