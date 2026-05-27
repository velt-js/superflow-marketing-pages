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
  const doc = (await getAlternativePageBySlug(slug)) as SanityAlternativeDoc | null;
  if (!doc) return {};
  const ogImage = doc.thumbnail ?? doc.competitor2Logo;
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "Alternative",
    description:
      doc.metaDescription ??
      doc.description ??
      `See how Superflow compares to ${doc.competitor2Name ?? "this alternative"}.`,
    path: `/alternative/${slug}`,
    ...(ogImage ? { ogImage } : {}),
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
          `Compare Superflow against ${doc.competitor2Name ?? "this alternative"}.`
        }
        path={`/alternative/${slug}`}
        trail={[
          { name: "Alternatives", url: `${SITE_URL}/alternative` },
          { name: config.hero.heading, url: `${SITE_URL}/alternative/${slug}` },
        ]}
      />
      {faqEntries.length > 0 && (
        <JsonLd id="ld-alternative-faq" data={buildFaqPageSchema(faqEntries)} />
      )}
      <ComparisonDetailPage config={config} />
    </>
  );
}

