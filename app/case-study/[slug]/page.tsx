import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { caseStudyDetails } from "@/lib/case-study-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = caseStudyDetails[slug];
  if (!detail) return {};
  return buildPageMetadata({
    title: detail.hero.heading,
    description: detail.hero.subtitle,
    path: `/case-study/${slug}`,
  });
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
