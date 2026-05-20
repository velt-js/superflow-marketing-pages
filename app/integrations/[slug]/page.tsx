import { notFound } from "next/navigation";
import type { Metadata } from "next";
import IntegrationDetailPage from "@/components/detail/IntegrationDetailPage";
import { integrationDetails } from "@/lib/detail-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = integrationDetails[slug];
  if (!detail) return {};
  const { title, titleHighlight } = detail.hero;
  return {
    title: titleHighlight ? `${title} ${titleHighlight}` : title,
  };
}

export function generateStaticParams() {
  return Object.keys(integrationDetails).map((slug) => ({ slug }));
}

export default async function IntegrationSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = integrationDetails[slug];
  if (!detail) notFound();
  return <IntegrationDetailPage config={detail} />;
}
