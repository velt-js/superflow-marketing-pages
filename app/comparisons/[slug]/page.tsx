import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import { comparisonDetails } from "@/lib/detail-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = comparisonDetails[slug];
  if (!detail) return {};
  return buildPageMetadata({
    title: detail.hero.heading,
    description:
      "Compare collaboration apps for reviewing creative assets — see how Superflow stacks up.",
    path: `/comparisons/${slug}`,
  });
}

export function generateStaticParams() {
  return Object.keys(comparisonDetails).map((slug) => ({ slug }));
}

export default async function ComparisonSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = comparisonDetails[slug];
  if (!detail) notFound();
  return <ComparisonDetailPage config={detail} />;
}
