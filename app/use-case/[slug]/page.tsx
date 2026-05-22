import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail/DetailPage";
import { useCaseDetails } from "@/lib/detail-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = useCaseDetails[slug];
  if (!detail) return {};
  return buildPageMetadata({
    title: detail.hero.heading,
    description:
      "See how Superflow simplifies collaboration and creative-asset review for your workflow.",
    path: `/use-case/${slug}`,
  });
}

export function generateStaticParams() {
  return Object.keys(useCaseDetails).map((slug) => ({ slug }));
}

export default async function UseCaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = useCaseDetails[slug];
  if (!detail) notFound();
  return (
    <>
      <PageJsonLd
        name={detail.hero.heading}
        description="See how Superflow simplifies collaboration and creative-asset review for your workflow."
        path={`/use-case/${slug}`}
        trail={[
          { name: "Use Cases", url: `${SITE_URL}/use-case` },
          { name: detail.hero.heading, url: `${SITE_URL}/use-case/${slug}` },
        ]}
      />
      <DetailPage config={detail} />
    </>
  );
}
