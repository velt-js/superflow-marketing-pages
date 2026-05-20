import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { caseStudyDetails } from "@/lib/case-study-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = caseStudyDetails[slug];
  if (!detail) return {};
  return {
    title: detail.hero.heading,
    description: detail.hero.subtitle,
  };
}

export function generateStaticParams() {
  return Object.keys(caseStudyDetails).map((slug) => ({ slug }));
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = caseStudyDetails[slug];
  if (!detail) notFound();
  return <CaseStudyPage config={detail} />;
}
