// Preview route for the new 2026 feature-page template.
//
//   /preview/features/<slug>  →  featurePage (Sanity) rendered with the
//   reusable home-2026 sections (see FeaturePageBody).
//
// This route is intentionally isolated from the legacy /<feature>-review
// pages (reviewPage) — those are untouched. Kept out of the index (noindex)
// while the design is in preview, mirroring /home-preview.

import { notFound } from "next/navigation";

import FeaturePageBody, {
  type FeaturePageDoc,
} from "@/components/feature-2026/FeaturePageBody";
import { FAQ_ITEMS } from "@/components/home-2026/FaqSection";
import {
  getAllFeatureSlugs,
  getFeaturePageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/preview/features";
const FALLBACK_DESCRIPTION =
  "Turn your QA checklist into AI agents that review every site change. Your team approves, then your client — no login required.";

export async function generateStaticParams() {
  const slugs = await getAllFeatureSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getFeaturePageBySlug(slug)) as FeaturePageDoc | null;
  if (!doc) {
    return {};
  }
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title,
    description:
      doc.metaDescription ?? doc.hero?.subhead ?? FALLBACK_DESCRIPTION,
    path: `${BASE_PATH}/${slug}`,
    ogImage: doc.ogImage ?? undefined,
    // Preview route — keep it out of the index while in review.
    noindex: true,
  });
}

export default async function FeaturePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getFeaturePageBySlug(slug)) as FeaturePageDoc | null;
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
        trail={[{ name: doc.title, url: `${SITE_URL}${BASE_PATH}/${slug}` }]}
      />
      <JsonLd id={`ld-faq-feature-${slug}`} data={faqSchema} />
      <FeaturePageBody doc={doc} />
    </>
  );
}
