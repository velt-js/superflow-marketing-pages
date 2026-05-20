import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail/DetailPage";
import { userPersonaDetails } from "@/lib/detail-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = userPersonaDetails[slug];
  if (!detail) return {};
  return {
    title: detail.hero.heading,
  };
}

export function generateStaticParams() {
  return Object.keys(userPersonaDetails).map((slug) => ({ slug }));
}

export default async function UserPersonaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = userPersonaDetails[slug];
  if (!detail) notFound();
  return <DetailPage config={detail} />;
}
