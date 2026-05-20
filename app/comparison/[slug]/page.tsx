import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import { comparisonDetails } from "@/lib/detail-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = comparisonDetails[slug];
  if (!detail) return {};
  return {
    title: detail.hero.heading,
  };
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
