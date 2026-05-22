// Dynamic Superflow review page (/image-review, /video-review, /lottie-review,
// /pdf-review, /website-review). Content sourced from the Sanity `reviewPage`
// document matching the URL slug.

import { notFound } from "next/navigation";

import {
  ReviewPageBody,
  type ReviewPageDoc,
} from "@/components/review/ReviewPageBody";
import {
  getAllReviewSlugs,
  getReviewPageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const revalidate = 60;

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
  const slugs = await getAllReviewSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getReviewPageBySlug(slug)) as ReviewPageDoc | null;
  if (!doc) return {};
  const rawTitle = doc.metaTitle ?? doc.title;
  return buildPageMetadata({
    title: rawTitle,
    description:
      doc.metaDescription ??
      doc.hero.subheading ??
      "Review and collaborate on creative assets with Superflow.",
    path: `/${slug}`,
    ogImage: doc.ogImage ?? REVIEW_OG_IMAGE_FALLBACKS[slug],
    // Sanity metaTitle is often already brand-suffixed — let the helper
    // detect and bypass the layout template so we never double-suffix.
  });
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = (await getReviewPageBySlug(slug)) as ReviewPageDoc | null;
  if (!doc) notFound();
  return <ReviewPageBody doc={doc} />;
}
