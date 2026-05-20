import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import { alternativeDetails } from "@/lib/detail-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = alternativeDetails[slug];
  if (!detail) return {};
  return {
    title: detail.hero.heading,
  };
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
