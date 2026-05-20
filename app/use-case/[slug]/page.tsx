import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail/DetailPage";
import { useCaseDetails } from "@/lib/detail-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = useCaseDetails[slug];
  if (!detail) return {};
  return {
    title: detail.hero.heading,
  };
}

export function generateStaticParams() {
  return Object.keys(useCaseDetails).map((slug) => ({ slug }));
}

export default async function UseCaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = useCaseDetails[slug];
  if (!detail) notFound();
  return <DetailPage config={detail} />;
}
