import { notFound } from "next/navigation";
import type { Metadata } from "next";
import IntegrationDetailPage from "@/components/detail/IntegrationDetailPage";
import {
  getAllIntegrationSlugs,
  getAllIntegrationListItems,
  getIntegrationPageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getIntegrationPageBySlug(slug);
  if (!doc) return {};
  const title = doc.metaTitle || doc.title;
  const description = doc.metaDescription || "";
  return buildPageMetadata({
    title,
    description,
    path: `/integrations/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllIntegrationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function IntegrationSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const [doc, all] = await Promise.all([
    getIntegrationPageBySlug(slug),
    getAllIntegrationListItems(),
  ]);
  if (!doc) notFound();

  const heading = doc.title;
  const otherIntegrations = all
    .filter((item) => item.slug !== slug)
    .map((item) => ({
      name: item.appName || item.title,
      icon: item.appLogo || "/images/hero/icon-world.svg",
      href: `/integrations/${item.slug}`,
    }));

  return (
    <>
      <PageJsonLd
        name={heading}
        description={doc.metaDescription || ""}
        path={`/integrations/${slug}`}
        trail={[
          { name: "Integrations", url: `${SITE_URL}/integrations` },
          { name: heading, url: `${SITE_URL}/integrations/${slug}` },
        ]}
      />
      <IntegrationDetailPage doc={doc} otherIntegrations={otherIntegrations} />
    </>
  );
}
