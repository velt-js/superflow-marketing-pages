// /solutions/<slug>: one template, per-page data (spec section 2).
//
// The page resolves CMS first and falls back to the seed JSON in
// content/solutions, so every batch-1 route renders even before its Sanity
// document exists. Structured data mirrors the feature pages: WebPage and
// BreadcrumbList (PageJsonLd), a SoftwareApplication node, and FAQPage for
// the six FAQ items.

import { notFound } from "next/navigation";

import SolutionPageBody from "@/components/solutions-2026/SolutionPageBody";
import { buildSolutionFaqItems } from "@/components/solutions-2026/solution-faq-data";
import { getSolutionOgImage } from "@/components/solutions-2026/og-images";
import {
  resolveSolutionPage,
  resolveSolutionSlugs,
  resolveSolutionSummaries,
} from "@/lib/solutions/resolve";
import { SOLUTIONS_BASE_PATH, solutionPath } from "@/lib/solutions/seed";
import type { SolutionPage } from "@/lib/solutions/types";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { ORG_ID, SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const INDEX_LABEL = "Solutions";
const BRAND = "Superflow";
/** A brand suffix already present in a CMS or seed title. */
const BRAND_SUFFIX_PATTERN = /\s*\|\s*Superflow\s*$/i;

/** The GROQ projection adds the OG image URL on top of the page shape. */
type SolutionPageWithImage = SolutionPage & { ogImage?: string | null };

/**
 * The page title, with a fallback for a half-authored CMS document.
 *
 * @param page - The resolved page.
 * @returns The title, brand suffix included.
 */
function pageTitle(page: SolutionPage): string {
  try {
    return page?.seo?.title || `${page.navLabel} | ${BRAND}`;
  } catch {
    return BRAND;
  }
}

/**
 * The meta description, falling back to the hero subhead.
 *
 * @param page - The resolved page.
 * @returns The description.
 */
function pageDescription(page: SolutionPage): string {
  try {
    return page?.seo?.description || page?.hero?.sub || "";
  } catch {
    return "";
  }
}

export async function generateStaticParams() {
  const slugs = await resolveSolutionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = (await resolveSolutionPage(slug)) as SolutionPageWithImage | null;
  if (!page) {
    return {};
  }
  return buildPageMetadata({
    title: pageTitle(page),
    description: pageDescription(page),
    path: solutionPath(slug),
    ogImage: page.ogImage ?? getSolutionOgImage(slug),
    socialTitle: page.seo?.ogTitle || undefined,
  });
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, summaries] = await Promise.all([
    resolveSolutionPage(slug),
    resolveSolutionSummaries(),
  ]);
  if (!page) {
    notFound();
  }

  const title = pageTitle(page);
  const description = pageDescription(page);
  const path = solutionPath(slug);
  const faqSchema = buildFaqPageSchema(buildSolutionFaqItems(page.faq));

  // Same product structured data the feature pages emit; `creator` links to
  // the site-wide Organization node from app/layout.tsx.
  const softwareSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title.replace(BRAND_SUFFIX_PATTERN, ""),
    url: `${SITE_URL}${path}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    creator: { "@id": ORG_ID },
  };

  return (
    <>
      <PageJsonLd
        name={title}
        description={description}
        path={path}
        trail={[
          { name: INDEX_LABEL, url: `${SITE_URL}${SOLUTIONS_BASE_PATH}` },
          { name: page.navLabel, url: `${SITE_URL}${path}` },
        ]}
      />
      <JsonLd id={`ld-software-solution-${slug}`} data={softwareSchema} />
      <JsonLd id={`ld-faq-solution-${slug}`} data={faqSchema} />
      <SolutionPageBody page={page} summaries={summaries} />
    </>
  );
}
