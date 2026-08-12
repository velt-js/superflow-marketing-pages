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
import { liveTools, toolPath } from "@/lib/tools/registry";

// Regenerate hourly so CMS-only changes (new docs seeded without a
// deploy) reach the sitemap without waiting for the next build,
// matching the llms.txt cadence.
export const revalidate = 3600;

/** Mintlify's auto-generated docs sitemap, proxied at usesuperflow.ai/docs. */
const MINTLIFY_SITEMAP = "https://superflow.mintlify.dev/docs/sitemap.xml";

/** Docs hosts Mintlify may still emit while the domain move settles. */
const LEGACY_DOCS_ORIGINS = [
  "https://docs.usesuperflow.com",
  "https://docs.usesuperflow.ai",
  "https://superflow.mintlify.dev",
];

/**
 * Normalizes a docs URL onto the canonical usesuperflow.ai/docs origin.
 *
 * Mintlify stamps the sitemap with whatever domain the dashboard is set to,
 * so during the cutover it can still emit docs.usesuperflow.com URLs — and
 * those 301 to /docs, which would put a redirect chain in our own sitemap.
 * Rewriting here keeps the sitemap canonical regardless of dashboard state.
 * The legacy hosts serve docs at the root, so they gain the /docs prefix;
 * the Mintlify origin already carries it.
 */
function canonicalizeDocsUrl(url: string): string | null {
  if (url.startsWith(`${SITE_URL}/docs`)) return url;

  const origin = LEGACY_DOCS_ORIGINS.find((o) => url.startsWith(`${o}/`));
  if (!origin) return null;

  const rest = url.slice(origin.length);
  const path = rest.startsWith("/docs/") || rest === "/docs" ? rest : `/docs${rest}`;
  return `${SITE_URL}${path}`;
}

/**
 * Fetches the docs sitemap from Mintlify and folds it into ours, so the
 * proxied /docs pages are discoverable from usesuperflow.ai/sitemap.xml.
 * Cached for an hour via Next's fetch cache; any failure yields [] so the
 * rest of the sitemap still emits.
 */
async function fetchDocsPaths(): Promise<string[]> {
  try {
    const res = await fetch(MINTLIFY_SITEMAP, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => canonicalizeDocsUrl(m[1].trim()))
      .filter((url): url is string => Boolean(url))
      .map((url) => url.slice(SITE_URL.length));
  } catch {
    return [];
  }
}

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
  "/tools",
  "/use-case",
  "/user-persona",
  // Free tools. Only the ones that are actually built are listed: the
  // registry marks the rest `planned`, and a sitemap entry for a route that
  // does not exist is a crawl error, not a roadmap.
  ...liveTools().map((tool) => toolPath(tool.slug)),
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
    docsPaths,
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
    fetchDocsPaths(),
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
    // Proxied Mintlify docs — already absolute-path form, not slugs.
    ...unique(docsPaths),
  ];

  const lastModified = new Date();
  const allPaths = unique([...STATIC_PATHS, ...dynamicPaths]);

  return allPaths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
  }));
}
