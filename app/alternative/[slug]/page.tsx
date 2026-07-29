// /alternative/<slug> - promoted from /preview/alternative/<slug>.
//
// One route serves both generations:
//   1. The slug resolves against the 2026 alternatives listicle class
//      first (comparisonPreviewAlternativesPage, <x>-alternative).
//   2. Slugs only present as legacy alternativePage documents fall back
//      to the original ComparisonDetailPage template, so no indexed URL
//      breaks. On a slug collision the 2026 document wins.

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ComparisonAlternativesPageBody from "@/components/comparison-2026/ComparisonAlternativesPageBody";
import type {
  ComparisonHubItem,
  ComparisonPreviewDoc,
} from "@/components/comparison-2026/types";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import {
  getAllComparisonPreviewsForHub,
  getAllAlternativeSlugs,
  getAlternativePageBySlug,
  getComparisonPreviewBySlug,
} from "@/sanity/lib/queries";
import {
  mapAlternativeDocToConfig,
  type SanityAlternativeDoc,
} from "@/lib/sanity-adapters/alternative";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/alternative";
const FALLBACK_DESCRIPTION =
  "An honest alternatives list for agencies. Every competitor claim from the vendor's own site, dated; unverified renders as a plain hyphen.";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Strip HTML tags so rich-text Sanity fields serialise as plain text in
 * JSON-LD payloads.
 *
 * @param html - Raw HTML or plain text string.
 * @returns Plain text with HTML tags removed and whitespace normalised.
 */
function stripHtml(html: string): string {
  try {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return html;
  }
}

export async function generateStaticParams() {
  const [previewItems, legacySlugs] = await Promise.all([
    getAllComparisonPreviewsForHub() as Promise<ComparisonHubItem[]>,
    getAllAlternativeSlugs(),
  ]);
  const previewSlugs = (previewItems ?? [])
    .filter((item) => item?._type === "comparisonPreviewAlternativesPage")
    .map((item) => item.slug);
  return Array.from(new Set([...previewSlugs, ...legacySlugs])).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const previewDoc = (await getComparisonPreviewBySlug(
    slug,
  )) as ComparisonPreviewDoc | null;
  if (previewDoc && previewDoc._type === "comparisonPreviewAlternativesPage") {
    return buildPageMetadata({
      title: previewDoc.metaTitle ?? previewDoc.title,
      description: previewDoc.metaDescription ?? FALLBACK_DESCRIPTION,
      path: `${BASE_PATH}/${slug}`,
    });
  }

  const doc = (await getAlternativePageBySlug(slug)) as SanityAlternativeDoc | null;
  if (!doc) return {};
  const ogImage = doc.thumbnail ?? doc.competitor2Logo;
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "Alternative",
    description:
      doc.metaDescription ??
      doc.description ??
      `See how Superflow compares to ${doc.competitor2Name ?? "this alternative"}.`,
    path: `${BASE_PATH}/${slug}`,
    ...(ogImage ? { ogImage } : {}),
  });
}

/**
 * Render a legacy alternativePage document with the original template.
 *
 * @param slug - The requested alternative slug.
 * @param doc - The resolved legacy document.
 * @returns The legacy page composition.
 */
function renderLegacyAlternative(slug: string, doc: SanityAlternativeDoc) {
  const config = mapAlternativeDocToConfig(doc);

  const faqEntries = doc.faq?.length
    ? doc.faq
        .filter((item) => item?.question)
        .map((item) => ({
          question: item.question!,
          answer: stripHtml(item.answer ?? ""),
        }))
        .filter((item) => item.answer)
    : [];

  return (
    <>
      <PageJsonLd
        name={config.hero.heading}
        description={
          doc.metaDescription ??
          doc.description ??
          `Compare Superflow against ${doc.competitor2Name ?? "this alternative"}.`
        }
        path={`${BASE_PATH}/${slug}`}
        trail={[
          { name: "Alternatives", url: `${SITE_URL}${BASE_PATH}` },
          { name: config.hero.heading, url: `${SITE_URL}${BASE_PATH}/${slug}` },
        ]}
      />
      {faqEntries.length > 0 && (
        <JsonLd id="ld-alternative-faq" data={buildFaqPageSchema(faqEntries)} />
      )}
      <ComparisonDetailPage config={config} />
    </>
  );
}

export default async function AlternativeSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const previewDoc = (await getComparisonPreviewBySlug(
    slug,
  )) as ComparisonPreviewDoc | null;

  if (previewDoc && previewDoc._type === "comparisonPreviewAlternativesPage") {
    const name = previewDoc.metaTitle ?? `${previewDoc.title} | Superflow`;
    const description = previewDoc.metaDescription ?? FALLBACK_DESCRIPTION;

    return (
      <>
        <PageJsonLd
          name={name}
          description={description}
          path={`${BASE_PATH}/${slug}`}
          trail={[
            { name: "Alternatives", url: `${SITE_URL}${BASE_PATH}` },
            { name: previewDoc.title, url: `${SITE_URL}${BASE_PATH}/${slug}` },
          ]}
        />
        {previewDoc.faq && previewDoc.faq.length > 0 ? (
          <JsonLd
            id={`ld-faq-alternative-${slug}`}
            data={buildFaqPageSchema(previewDoc.faq)}
          />
        ) : null}
        <ComparisonAlternativesPageBody doc={previewDoc} />
      </>
    );
  }

  const legacyDoc = (await getAlternativePageBySlug(
    slug,
  )) as SanityAlternativeDoc | null;
  if (!legacyDoc) notFound();

  return renderLegacyAlternative(slug, legacyDoc);
}
