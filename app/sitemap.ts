import type { MetadataRoute } from "next";

import { useCaseDetails } from "@/lib/detail-data";
import { isHeldIntegrationSlug } from "@/lib/integration-holds";
import {
  getAllAlternativeSlugs,
  getAllBlogSlugs,
  getAllCaseStudySlugs,
  getAllChecklistSlugs,
  getAllComparisonSlugs,
  getAllFeatureSlugs,
  getAllIntegrationSlugs,
  getAllReviewSlugs,
  getAllUseCaseSlugs,
  getAllUserPersonaSlugs,
} from "@/sanity/lib/queries";

const SITE_URL = "https://usesuperflow.com";

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
  ] = await Promise.all([
    safeFetch(getAllBlogSlugs),
    safeFetch(getAllIntegrationSlugs),
    safeFetch(getAllUseCaseSlugs),
    safeFetch(getAllCaseStudySlugs),
    safeFetch(getAllUserPersonaSlugs),
    safeFetch(getAllAlternativeSlugs),
    safeFetch(getAllComparisonSlugs),
    safeFetch(getAllReviewSlugs),
    safeFetch(getAllChecklistSlugs),
    safeFetch(getAllFeatureSlugs),
  ]);

  const dynamicPaths: string[] = [
    ...unique(integrationSlugsCms)
      .filter((slug) => !isHeldIntegrationSlug(slug))
      .map((slug) => `/integrations/${slug}`),
    ...unique([...Object.keys(useCaseDetails), ...useCaseSlugsCms]).map(
      (slug) => `/use-case/${slug}`,
    ),
    ...unique(userPersonaSlugsCms).map((slug) => `/user-persona/${slug}`),
    ...unique(alternativeSlugsCms).map((slug) => `/alternative/${slug}`),
    ...unique(comparisonSlugsCms).map((slug) => `/comparisons/${slug}`),
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
