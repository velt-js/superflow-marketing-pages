import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonDetailPage from "@/components/detail/ComparisonDetailPage";
import {
  getComparisonPageBySlug,
  getAllComparisonSlugs,
} from "@/sanity/lib/queries";
import {
  mapComparisonDocToConfig,
  type SanityComparisonDoc,
} from "@/lib/sanity-adapters/comparisons";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = (await getComparisonPageBySlug(slug)) as SanityComparisonDoc | null;
  if (!doc) return {};
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "Comparison",
    description:
      doc.metaDescription ??
      doc.description ??
      "Compare collaboration apps for reviewing creative assets — see how Superflow stacks up.",
    path: `/comparisons/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllComparisonSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export default async function ComparisonSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = (await getComparisonPageBySlug(slug)) as SanityComparisonDoc | null;
  if (!doc) notFound();

  const config = mapComparisonDocToConfig(doc);

  return (
    <>
      <PageJsonLd
        name={config.hero.heading}
        description={
          doc.metaDescription ??
          doc.description ??
          "Compare collaboration apps for reviewing creative assets — see how Superflow stacks up."
        }
        path={`/comparisons/${slug}`}
        trail={[
          { name: "Comparisons", url: `${SITE_URL}/comparisons` },
          { name: config.hero.heading, url: `${SITE_URL}/comparisons/${slug}` },
        ]}
      />
      <ComparisonDetailPage config={config} />
    </>
  );
}
