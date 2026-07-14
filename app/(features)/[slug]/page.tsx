// Dynamic root-level page. Resolves the slug against:
//   1. `reviewPage` (Superflow review surfaces — /image-review, /video-review, …)
//   2. `checklistPage` (CMS checklists — /seo-checklist-2023, …)
//   3. `featurePage` (2026 feature pages — /comments, /ai-review-agents, …)
// Sanity slugs are scoped per document type but are unique within this combined
// root namespace by content convention (reviews end in `-review`).

import { notFound } from "next/navigation";

import {
  ReviewPageBody,
  type ReviewPageDoc,
} from "@/components/review/ReviewPageBody";
import ChecklistDetailPage from "@/components/checklist/ChecklistDetailPage";
import FeaturePageBody, {
  type FeaturePageDoc,
} from "@/components/feature-2026/FeaturePageBody";
import { FAQ_ITEMS } from "@/components/home-2026/faq-data";
import {
  getAllChecklistSlugs,
  getAllFeatureSlugs,
  getAllReviewSlugs,
  getChecklistPageBySlug,
  getFeaturePageBySlug,
  getReviewPageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, ORG_ID, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

/** Fallback meta description for a feature page missing its own copy. */
const FEATURE_FALLBACK_DESCRIPTION =
  "Turn your QA checklist into AI agents that review every site change. Your team approves, then your client — no login required.";

// Per-slug OG image fallbacks for review pages — used when the Sanity
// `ogImage` field isn't populated. Mirrors the original usesuperflow.com
// images (lottie-review reuses the site-wide default since the live site
// 404s on that route and so has no unique image).
const REVIEW_OG_IMAGE_FALLBACKS: Record<string, string> = {
  "image-review": "/og/image-review.png",
  "video-review": "/og/video-review.png",
  "pdf-review": "/og/pdf-review.png",
  "website-review": "/og/website-review.png",
};

export async function generateStaticParams() {
  const [reviewSlugs, checklistSlugs, featureSlugs] = await Promise.all([
    getAllReviewSlugs(),
    getAllChecklistSlugs(),
    getAllFeatureSlugs(),
  ]);
  const all = Array.from(
    new Set([...reviewSlugs, ...checklistSlugs, ...featureSlugs]),
  );
  return all.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reviewDoc = (await getReviewPageBySlug(slug)) as ReviewPageDoc | null;
  if (reviewDoc) {
    const rawTitle = reviewDoc.metaTitle ?? reviewDoc.title;
    return buildPageMetadata({
      title: rawTitle,
      description:
        reviewDoc.metaDescription ??
        reviewDoc.hero.subheading ??
        "Review and collaborate on creative assets with Superflow.",
      path: `/${slug}`,
      ogImage: reviewDoc.ogImage ?? REVIEW_OG_IMAGE_FALLBACKS[slug],
      // Sanity metaTitle is often already brand-suffixed — let the helper
      // detect and bypass the layout template so we never double-suffix.
    });
  }
  const checklistDoc = await getChecklistPageBySlug(slug);
  if (checklistDoc) {
    const title = checklistDoc.metaTitle || checklistDoc.title;
    const description =
      checklistDoc.metaDescription || checklistDoc.description || "";
    const metadata = buildPageMetadata({
      title,
      description,
      path: `/${slug}`,
    });
    if (
      checklistDoc.noIndex &&
      checklistDoc.noIndex.toLowerCase() === "noindex"
    ) {
      metadata.robots = { index: false, follow: false };
    }
    return metadata;
  }

  const featureDoc = (await getFeaturePageBySlug(slug)) as FeaturePageDoc | null;
  if (featureDoc) {
    return buildPageMetadata({
      title: featureDoc.metaTitle ?? featureDoc.title,
      description:
        featureDoc.metaDescription ??
        featureDoc.hero?.subhead ??
        FEATURE_FALLBACK_DESCRIPTION,
      path: `/${slug}`,
      ogImage: featureDoc.ogImage ?? undefined,
      // Feature pages are indexable at their root slug; buildPageMetadata
      // detects any brand suffix in metaTitle and bypasses the layout template.
    });
  }

  return {};
}

export default async function RootSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reviewDoc = (await getReviewPageBySlug(slug)) as ReviewPageDoc | null;
  if (reviewDoc) {
    const name = reviewDoc.metaTitle ?? reviewDoc.title;
    const description =
      reviewDoc.metaDescription ?? reviewDoc.hero.subheading ?? undefined;
    const softwareSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: reviewDoc.title,
      url: `${SITE_URL}/${slug}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
      creator: { "@id": ORG_ID },
    };
    return (
      <>
        <PageJsonLd
          name={name}
          description={description}
          path={`/${slug}`}
          trail={[{ name, url: `${SITE_URL}/${slug}` }]}
        />
        <JsonLd id={`ld-software-${slug}`} data={softwareSchema} />
        <ReviewPageBody doc={reviewDoc} />
      </>
    );
  }

  const checklistDoc = await getChecklistPageBySlug(slug);
  if (checklistDoc) {
    return (
      <>
        <PageJsonLd
          name={checklistDoc.title}
          description={
            checklistDoc.metaDescription || checklistDoc.description || ""
          }
          path={`/${slug}`}
          trail={[
            { name: "Checklists", url: `${SITE_URL}/checklist` },
            { name: checklistDoc.title, url: `${SITE_URL}/${slug}` },
          ]}
        />
        <ChecklistDetailPage doc={checklistDoc} />
      </>
    );
  }

  const featureDoc = (await getFeaturePageBySlug(slug)) as FeaturePageDoc | null;
  if (featureDoc) {
    const name = featureDoc.metaTitle ?? `${featureDoc.title} | Superflow`;
    const description =
      featureDoc.metaDescription ??
      featureDoc.hero?.subhead ??
      FEATURE_FALLBACK_DESCRIPTION;

    const faqEntries =
      featureDoc.faq?.items && featureDoc.faq.items.length > 0
        ? featureDoc.faq.items
        : FAQ_ITEMS;
    const faqSchema = buildFaqPageSchema(faqEntries);

    // SoftwareApplication schema mirrors the legacy /<feature>-review route so
    // feature pages carry the same product structured data; `creator` links
    // back to the site-wide Organization node emitted from app/layout.tsx.
    const softwareSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: featureDoc.title,
      url: `${SITE_URL}/${slug}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
      creator: { "@id": ORG_ID },
    };

    return (
      <>
        <PageJsonLd
          name={name}
          description={description}
          path={`/${slug}`}
          trail={[{ name: featureDoc.title, url: `${SITE_URL}/${slug}` }]}
        />
        <JsonLd id={`ld-software-feature-${slug}`} data={softwareSchema} />
        <JsonLd id={`ld-faq-feature-${slug}`} data={faqSchema} />
        <FeaturePageBody doc={featureDoc} />
      </>
    );
  }

  notFound();
}
