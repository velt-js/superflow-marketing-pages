import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import { alternativeDetails } from "@/lib/detail-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = alternativeDetails[slug];
  if (!detail) return {};
  return buildPageMetadata({
    title: detail.hero.heading,
    description:
      "Compare Superflow against this alternative for reviewing and shipping creative assets.",
    path: `/alternative/${slug}`,
  });
}

export function generateStaticParams() {
  return Object.keys(alternativeDetails).map((slug) => ({ slug }));
}

export default async function AlternativeSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = alternativeDetails[slug];
  if (!detail) notFound();
  return <ComparisonDetailPage config={detail} />;
}
