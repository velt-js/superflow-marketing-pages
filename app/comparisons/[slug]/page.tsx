// /comparisons/<slug> - promoted from /preview/comparison/<slug>.
//
// One route serves both generations:
//   1. The slug resolves against the 2026 preview classes first
//      (comparisonPreviewVsPage superflow-vs-<x>,
//      comparisonPreviewArbiterPage <x>-vs-<y>); the doc's _type picks
//      the body. Alternatives-class slugs permanently redirect to
//      /alternative/<slug>.
//   2. Slugs only present as legacy comparisonPage documents fall back
//      to the original ComparisonDetailPage template, so no indexed URL
//      breaks. On a slug collision the 2026 document wins.

import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import ComparisonVsPageBody from "@/components/comparison-2026/ComparisonVsPageBody";
import ComparisonArbiterPageBody from "@/components/comparison-2026/ComparisonArbiterPageBody";
import type {
  ComparisonHubItem,
  ComparisonPreviewDoc,
} from "@/components/comparison-2026/types";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import {
  getAllComparisonPreviewsForHub,
  getAllComparisonSlugs,
  getComparisonPageBySlug,
  getComparisonPreviewBySlug,
} from "@/sanity/lib/queries";
import {
  mapComparisonDocToConfig,
  type SanityComparisonDoc,
} from "@/lib/sanity-adapters/comparisons";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { ogCardUrl } from "@/lib/og/card-url";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/comparisons";
const FALLBACK_DESCRIPTION =
  "An honest comparison for agencies. Every competitor claim from the vendor's own site, dated; unverified renders as a plain hyphen.";

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
    getAllComparisonSlugs(),
  ]);
  const previewSlugs = (previewItems ?? [])
    .filter((item) => item?._type !== "comparisonPreviewAlternativesPage")
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
  if (previewDoc && previewDoc._type !== "comparisonPreviewAlternativesPage") {
    return buildPageMetadata({
      title: previewDoc.metaTitle ?? previewDoc.title,
      description: previewDoc.metaDescription ?? FALLBACK_DESCRIPTION,
      path: `${BASE_PATH}/${slug}`,
      ogImage: ogCardUrl(previewDoc.metaTitle ?? previewDoc.title),
    });
  }

  const doc = (await getComparisonPageBySlug(slug)) as
    | (SanityComparisonDoc & { noIndex?: string })
    | null;
  if (!doc) return {};
  const metadata = buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "Comparison",
    description:
      doc.metaDescription ??
      doc.description ??
      "Compare collaboration apps for reviewing creative assets - see how Superflow stacks up.",
    path: `${BASE_PATH}/${slug}`,
    ogImage: doc.thumbnail ?? ogCardUrl(doc.metaTitle ?? doc.title ?? "Comparison"),
  });
  if (doc.noIndex && doc.noIndex.toLowerCase() === "noindex") {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
}

/**
 * Pick the class body for a resolved 2026 comparison document.
 *
 * @param doc - The comparison document, vs or arbiter class.
 * @returns The rendered page body, or null for unknown types.
 */
function renderComparisonBody(doc: ComparisonPreviewDoc) {
  switch (doc._type) {
    case "comparisonPreviewVsPage":
      return <ComparisonVsPageBody doc={doc} />;
    case "comparisonPreviewArbiterPage":
      return <ComparisonArbiterPageBody doc={doc} />;
    default:
      return null;
  }
}

/**
 * Render a legacy comparisonPage document with the original template.
 *
 * @param slug - The requested comparison slug.
 * @param doc - The resolved legacy document.
 * @returns The legacy page composition.
 */
function renderLegacyComparison(slug: string, doc: SanityComparisonDoc) {
  const config = mapComparisonDocToConfig(doc);

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
          "Compare collaboration apps for reviewing creative assets - see how Superflow stacks up."
        }
        path={`${BASE_PATH}/${slug}`}
        trail={[
          { name: "Comparisons", url: `${SITE_URL}${BASE_PATH}` },
          { name: config.hero.heading, url: `${SITE_URL}${BASE_PATH}/${slug}` },
        ]}
      />
      {faqEntries.length > 0 && (
        <JsonLd id="ld-comparison-faq" data={buildFaqPageSchema(faqEntries)} />
      )}
      <ComparisonDetailPage config={config} />
    </>
  );
}

export default async function ComparisonSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const previewDoc = (await getComparisonPreviewBySlug(
    slug,
  )) as ComparisonPreviewDoc | null;

  if (previewDoc) {
    if (previewDoc._type === "comparisonPreviewAlternativesPage") {
      permanentRedirect(`/alternative/${slug}`);
    }

    const body = renderComparisonBody(previewDoc);
    if (body) {
      const name = previewDoc.metaTitle ?? `${previewDoc.title} | Superflow`;
      const description = previewDoc.metaDescription ?? FALLBACK_DESCRIPTION;

      return (
        <>
          <PageJsonLd
            name={name}
            description={description}
            path={`${BASE_PATH}/${slug}`}
            trail={[
              { name: "Comparisons", url: `${SITE_URL}${BASE_PATH}` },
              { name: previewDoc.title, url: `${SITE_URL}${BASE_PATH}/${slug}` },
            ]}
          />
          {previewDoc.faq && previewDoc.faq.length > 0 ? (
            <JsonLd
              id={`ld-faq-comparison-${slug}`}
              data={buildFaqPageSchema(previewDoc.faq)}
            />
          ) : null}
          {body}
        </>
      );
    }
  }

  const legacyDoc = (await getComparisonPageBySlug(
    slug,
  )) as SanityComparisonDoc | null;
  if (!legacyDoc) notFound();

  return renderLegacyComparison(slug, legacyDoc);
}
