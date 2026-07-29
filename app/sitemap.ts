import type { MetadataRoute } from "next";

import { useCaseDetails } from "@/lib/detail-data";
import { isHeldIntegrationSlug } from "@/lib/integration-holds";
import {
  getAllAlternativeSlugs,
  getAllBlogSlugs,
  getAllCaseStudySlugs,
  getAllChecklistSlugs,
  getAllComparisonPreviewsForHub,
  getAllComparisonSlugs,
  getAllFeatureSlugs,
  getAllIntegrationPreviewSlugs,
  getAllReviewSlugs,
  getAllUseCaseSlugs,
  getAllUserPersonaSlugs,
} from "@/sanity/lib/queries";
import { SITE_URL } from "@/app/_seo/schema";

/** Minimal shape of a 2026 comparison-class catalog entry. */
type ComparisonCatalogItem = { _type?: string; slug?: string };

/** The 2026 comparison/alternative catalog, empty on fetch failure. */
async function safeFetchComparisonCatalog(): Promise<ComparisonCatalogItem[]> {
  try {
    return (await getAllComparisonPreviewsForHub()) as ComparisonCatalogItem[];
  } catch {
    return [];
  }
}

const STATIC_PATHS = [
  "/",
  "/affiliate",
  "/alternative",
  "/blog",
  "/book-demo",
  "/calculator",
  "/case-study",
  "/checklist",
  "/comparisons",
  "/demo",
  "/integrations",
  "/pricing",
  "/privacy",
  "/security",
  "/terms",
  "/use-case",
  "/user-persona",
];

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

async function safeFetch(fn: () => Promise<string[]>): Promise<string[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    blogSlugs,
    integrationSlugsCms,
    useCaseSlugsCms,
    caseStudySlugsCms,
    userPersonaSlugsCms,
    alternativeSlugsCms,
    comparisonSlugsCms,
    reviewSlugs,
    checklistSlugs,
    featureSlugs,
    comparisonCatalog,
  ] = await Promise.all([
    safeFetch(getAllBlogSlugs),
    safeFetch(getAllIntegrationPreviewSlugs),
    safeFetch(getAllUseCaseSlugs),
    safeFetch(getAllCaseStudySlugs),
    safeFetch(getAllUserPersonaSlugs),
    safeFetch(getAllAlternativeSlugs),
    safeFetch(getAllComparisonSlugs),
    safeFetch(getAllReviewSlugs),
    safeFetch(getAllChecklistSlugs),
    safeFetch(getAllFeatureSlugs),
    safeFetchComparisonCatalog(),
  ]);

  // 2026 comparison classes serve at the root hubs alongside the legacy
  // documents (see app/comparisons/[slug] and app/alternative/[slug]).
  const catalogAlternativeSlugs = comparisonCatalog
    .filter((item) => item?._type === "comparisonPreviewAlternativesPage")
    .map((item) => item.slug ?? "");
  const catalogComparisonSlugs = comparisonCatalog
    .filter((item) => item?._type !== "comparisonPreviewAlternativesPage")
    .map((item) => item.slug ?? "");

  const dynamicPaths: string[] = [
    ...unique(integrationSlugsCms)
      .filter((slug) => !isHeldIntegrationSlug(slug))
      .map((slug) => `/integrations/${slug}`),
    ...unique([...Object.keys(useCaseDetails), ...useCaseSlugsCms]).map(
      (slug) => `/use-case/${slug}`,
    ),
    ...unique(userPersonaSlugsCms).map((slug) => `/user-persona/${slug}`),
    ...unique([...alternativeSlugsCms, ...catalogAlternativeSlugs]).map(
      (slug) => `/alternative/${slug}`,
    ),
    ...unique([...comparisonSlugsCms, ...catalogComparisonSlugs]).map(
      (slug) => `/comparisons/${slug}`,
    ),
    ...unique(caseStudySlugsCms).map((slug) => `/case-study/${slug}`),
    ...unique(blogSlugs).map((slug) => `/blog/${slug}`),
    ...unique(reviewSlugs).map((slug) => `/${slug}`),
    ...unique(checklistSlugs).map((slug) => `/${slug}`),
    ...unique(featureSlugs).map((slug) => `/${slug}`),
  ];

  const lastModified = new Date();
  const allPaths = unique([...STATIC_PATHS, ...dynamicPaths]);

  return allPaths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
  }));
}
