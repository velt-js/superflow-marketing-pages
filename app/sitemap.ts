import type { MetadataRoute } from "next";

import {
  alternativeDetails,
  comparisonDetails,
  integrationDetails,
  useCaseDetails,
  userPersonaDetails,
} from "@/lib/detail-data";
import { caseStudyDetails } from "@/lib/case-study-data";
import {
  getAllAlternativeSlugs,
  getAllBlogSlugs,
  getAllCaseStudySlugs,
  getAllComparisonSlugs,
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
  ] = await Promise.all([
    safeFetch(getAllBlogSlugs),
    safeFetch(getAllIntegrationSlugs),
    safeFetch(getAllUseCaseSlugs),
    safeFetch(getAllCaseStudySlugs),
    safeFetch(getAllUserPersonaSlugs),
    safeFetch(getAllAlternativeSlugs),
    safeFetch(getAllComparisonSlugs),
    safeFetch(getAllReviewSlugs),
  ]);

  const dynamicPaths: string[] = [
    ...unique([...Object.keys(integrationDetails), ...integrationSlugsCms]).map(
      (slug) => `/integrations/${slug}`,
    ),
    ...unique([...Object.keys(useCaseDetails), ...useCaseSlugsCms]).map(
      (slug) => `/use-case/${slug}`,
    ),
    ...unique([...Object.keys(userPersonaDetails), ...userPersonaSlugsCms]).map(
      (slug) => `/user-persona/${slug}`,
    ),
    ...unique([...Object.keys(alternativeDetails), ...alternativeSlugsCms]).map(
      (slug) => `/alternative/${slug}`,
    ),
    ...unique([...Object.keys(comparisonDetails), ...comparisonSlugsCms]).map(
      (slug) => `/comparisons/${slug}`,
    ),
    ...unique([...Object.keys(caseStudyDetails), ...caseStudySlugsCms]).map(
      (slug) => `/case-study/${slug}`,
    ),
    ...unique(blogSlugs).map((slug) => `/blog/${slug}`),
    ...unique(reviewSlugs).map((slug) => `/${slug}`),
  ];

  const lastModified = new Date();
  const allPaths = unique([...STATIC_PATHS, ...dynamicPaths]);

  return allPaths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
  }));
}
