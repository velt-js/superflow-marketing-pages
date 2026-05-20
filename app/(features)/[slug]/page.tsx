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

export const revalidate = 60;

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
  return {
    title: doc.metaTitle ?? `${doc.title} | Superflow`,
    description:
      doc.metaDescription ?? doc.hero.subheading ?? undefined,
  };
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
