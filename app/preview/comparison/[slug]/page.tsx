// Preview route for the new 2026 comparison pages.
//
//   /preview/comparison/<slug>  →  one of the three new comparison classes:
//     comparisonPreviewVsPage            superflow-vs-<x>
//     comparisonPreviewArbiterPage       <x>-vs-<y>
//     comparisonPreviewAlternativesPage  <x>-alternative
//
// One route resolves the slug across all three document types; the doc's
// _type picks the body. Isolated from the legacy /comparisons and
// /alternative routes; noindexed while in preview.

import { notFound } from "next/navigation";

import ComparisonVsPageBody from "@/components/comparison-2026/ComparisonVsPageBody";
import ComparisonArbiterPageBody from "@/components/comparison-2026/ComparisonArbiterPageBody";
import ComparisonAlternativesPageBody from "@/components/comparison-2026/ComparisonAlternativesPageBody";
import type { ComparisonPreviewDoc } from "@/components/comparison-2026/types";
import {
  getAllComparisonPreviewSlugs,
  getComparisonPreviewBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/preview/comparison";
const FALLBACK_DESCRIPTION =
  "An honest comparison for agencies. Every competitor claim from the vendor's own site, dated; unverified renders as a plain hyphen.";

export async function generateStaticParams() {
  const slugs = await getAllComparisonPreviewSlugs();
  return (slugs ?? []).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getComparisonPreviewBySlug(
    slug,
  )) as ComparisonPreviewDoc | null;
  if (!doc) {
    return {};
  }
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title,
    description: doc.metaDescription ?? FALLBACK_DESCRIPTION,
    path: `${BASE_PATH}/${slug}`,
    // Preview route — keep it out of the index while in review.
    noindex: true,
  });
}

/**
 * Pick the class body for a resolved preview document.
 *
 * @param doc - The comparison preview document, any of the three classes.
 * @returns The rendered page body.
 */
function renderComparisonBody(doc: ComparisonPreviewDoc) {
  switch (doc._type) {
    case "comparisonPreviewVsPage":
      return <ComparisonVsPageBody doc={doc} />;
    case "comparisonPreviewArbiterPage":
      return <ComparisonArbiterPageBody doc={doc} />;
    case "comparisonPreviewAlternativesPage":
      return <ComparisonAlternativesPageBody doc={doc} />;
    default:
      return null;
  }
}

export default async function ComparisonPreviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getComparisonPreviewBySlug(
    slug,
  )) as ComparisonPreviewDoc | null;
  if (!doc) {
    notFound();
  }

  const body = renderComparisonBody(doc);
  if (!body) {
    notFound();
  }

  const name = doc.metaTitle ?? `${doc.title} | Superflow`;
  const description = doc.metaDescription ?? FALLBACK_DESCRIPTION;

  return (
    <>
      <PageJsonLd
        name={name}
        description={description}
        path={`${BASE_PATH}/${slug}`}
        trail={[
          { name: "Comparisons", url: `${SITE_URL}${BASE_PATH}` },
          { name: doc.title, url: `${SITE_URL}${BASE_PATH}/${slug}` },
        ]}
      />
      {doc.faq && doc.faq.length > 0 ? (
        <JsonLd
          id={`ld-faq-comparison-${slug}`}
          data={buildFaqPageSchema(doc.faq)}
        />
      ) : null}
      {body}
    </>
  );
}
