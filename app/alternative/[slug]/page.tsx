import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import {
  getAlternativePageBySlug,
  getAllAlternativeSlugs,
} from "@/sanity/lib/queries";
import {
  mapAlternativeDocToConfig,
  type SanityAlternativeDoc,
} from "@/lib/sanity-adapters/alternative";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = (await getAlternativePageBySlug(slug)) as SanityAlternativeDoc | null;
  if (!doc) return {};
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "Alternative",
    description:
      doc.metaDescription ??
      doc.description ??
      `See how Superflow compares to ${doc.competitor2Name ?? "this alternative"}.`,
    path: `/alternative/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllAlternativeSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export default async function AlternativeSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = (await getAlternativePageBySlug(slug)) as SanityAlternativeDoc | null;
  if (!doc) notFound();

  const config = mapAlternativeDocToConfig(doc);

  return (
    <>
      <PageJsonLd
        name={config.hero.heading}
        description={
          doc.metaDescription ??
          doc.description ??
          `Compare Superflow against ${doc.competitor2Name ?? "this alternative"}.`
        }
        path={`/alternative/${slug}`}
        trail={[
          { name: "Alternatives", url: `${SITE_URL}/alternative` },
          { name: config.hero.heading, url: `${SITE_URL}/alternative/${slug}` },
        ]}
      />
      <ComparisonDetailPage config={config} />
    </>
  );
}

