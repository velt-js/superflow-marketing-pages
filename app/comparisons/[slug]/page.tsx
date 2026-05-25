import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparisonsPage from "@/components/comparisons/ComparisonsPage";
import {
  getComparisonPageBySlug,
  getAllComparisonSlugs,
} from "@/sanity/lib/queries";
import type { SanityComparisonDoc } from "@/lib/sanity-adapters/comparisons";
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
  return (
    <>
      <PageJsonLd
        name={doc.title ?? slug}
        description={
          doc.metaDescription ??
          doc.description ??
          "Compare collaboration apps for reviewing creative assets — see how Superflow stacks up."
        }
        path={`/comparisons/${slug}`}
        trail={[
          { name: "Comparisons", url: `${SITE_URL}/comparisons` },
          { name: doc.title ?? slug, url: `${SITE_URL}/comparisons/${slug}` },
        ]}
      />
      <ComparisonsPage doc={doc} />
    </>
  );
}
