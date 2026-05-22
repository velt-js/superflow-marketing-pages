import { notFound } from "next/navigation";
import type { Metadata } from "next";
import IntegrationDetailPage from "@/components/detail/IntegrationDetailPage";
import { integrationDetails } from "@/lib/detail-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = integrationDetails[slug];
  if (!detail) return {};
  const { title, titleHighlight, subtitle } = detail.hero;
  return buildPageMetadata({
    title: titleHighlight ? `${title} ${titleHighlight}` : title,
    description: subtitle,
    path: `/integrations/${slug}`,
  });
}

export function generateStaticParams() {
  return Object.keys(integrationDetails).map((slug) => ({ slug }));
}

export default async function IntegrationSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = integrationDetails[slug];
  if (!detail) notFound();
  const { title, titleHighlight, subtitle } = detail.hero;
  const heading = titleHighlight ? `${title} ${titleHighlight}` : title;
  return (
    <>
      <PageJsonLd
        name={heading}
        description={subtitle}
        path={`/integrations/${slug}`}
        trail={[
          { name: "Integrations", url: `${SITE_URL}/integrations` },
          { name: heading, url: `${SITE_URL}/integrations/${slug}` },
        ]}
      />
      <IntegrationDetailPage config={detail} />
    </>
  );
}
