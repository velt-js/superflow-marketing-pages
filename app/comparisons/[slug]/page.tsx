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
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

/**
 * Strip HTML tags so rich-text Sanity fields serialise as plain text in
 * JSON-LD payloads.
 *
 * @param html - Raw HTML or plain text string.
 * @returns Plain text with HTML tags removed and whitespace normalised.
 */
function stripHtml(html: string): string {
  try {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return html;
  }
}

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = (await getComparisonPageBySlug(slug)) as
    | (SanityComparisonDoc & { noIndex?: string })
    | null;
  if (!doc) return {};
  const metadata = buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "Comparison",
    description:
      doc.metaDescription ??
      doc.description ??
      "Compare collaboration apps for reviewing creative assets - see how Superflow stacks up.",
    path: `/comparisons/${slug}`,
    ...(doc.thumbnail ? { ogImage: doc.thumbnail } : {}),
  });
  if (doc.noIndex && doc.noIndex.toLowerCase() === "noindex") {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
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

  const faqEntries = (doc.faq?.length)
    ? doc.faq
        .filter((item) => item?.question)
        .map((item) => ({
          question: item.question!,
          answer: stripHtml(item.answer ?? ""),
        }))
        .filter((item) => item.answer)
    : [];

  return (
    <>
      <PageJsonLd
        name={config.hero.heading}
        description={
          doc.metaDescription ??
          doc.description ??
          "Compare collaboration apps for reviewing creative assets - see how Superflow stacks up."
        }
        path={`/comparisons/${slug}`}
        trail={[
          { name: "Comparisons", url: `${SITE_URL}/comparisons` },
          { name: config.hero.heading, url: `${SITE_URL}/comparisons/${slug}` },
        ]}
      />
      {faqEntries.length > 0 && (
        <JsonLd id="ld-comparison-faq" data={buildFaqPageSchema(faqEntries)} />
      )}
      <ComparisonDetailPage config={config} />
    </>
  );
}
