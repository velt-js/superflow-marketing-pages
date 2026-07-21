// Preview route for the 2026 alternatives listicles.
//
//   /preview/alternative/<slug>  →  one comparisonPreviewAlternativesPage
//   document (<x>-alternative). The other two comparison classes stay under
//   /preview/comparison/<slug>; requests for them here 404, and the old
//   /preview/comparison/<x>-alternative URLs permanently redirect over.
//
// Noindexed while in preview; robots.ts already disallows /preview/.

import { notFound } from "next/navigation";

import ComparisonAlternativesPageBody from "@/components/comparison-2026/ComparisonAlternativesPageBody";
import type {
  ComparisonHubItem,
  ComparisonPreviewDoc,
} from "@/components/comparison-2026/types";
import {
  getAllComparisonPreviewsForHub,
  getComparisonPreviewBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const BASE_PATH = "/preview/alternative";
const FALLBACK_DESCRIPTION =
  "An honest alternatives list for agencies. Every competitor claim from the vendor's own site, dated; unverified renders as a plain hyphen.";

export async function generateStaticParams() {
  const items = (await getAllComparisonPreviewsForHub()) as ComparisonHubItem[];
  return (items ?? [])
    .filter((item) => item?._type === "comparisonPreviewAlternativesPage")
    .map((item) => ({ slug: item.slug }));
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
  if (!doc || doc._type !== "comparisonPreviewAlternativesPage") {
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

export default async function AlternativePreviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getComparisonPreviewBySlug(
    slug,
  )) as ComparisonPreviewDoc | null;
  if (!doc || doc._type !== "comparisonPreviewAlternativesPage") {
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
          { name: "Alternatives", url: `${SITE_URL}${BASE_PATH}` },
          { name: doc.title, url: `${SITE_URL}${BASE_PATH}/${slug}` },
        ]}
      />
      {doc.faq && doc.faq.length > 0 ? (
        <JsonLd
          id={`ld-faq-alternative-${slug}`}
          data={buildFaqPageSchema(doc.faq)}
        />
      ) : null}
      <ComparisonAlternativesPageBody doc={doc} />
    </>
  );
}
