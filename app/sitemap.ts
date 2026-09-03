import type { MetadataRoute } from "next";

import { isHeldIntegrationSlug } from "@/lib/integration-holds";
import {
  getAllAlternativeSlugs,
  getAllBlogSlugs,
  getAllBugBookSlugs,
  getAllCaseStudySlugs,
  getAllChecklistSlugs,
  getAllComparisonPreviewsForHub,
  getAllComparisonSlugs,
  getAllFeatureSlugs,
  getAllIntegrationPreviewSlugs,
  getAllReviewSlugs,
} from "@/sanity/lib/queries";
import { SITE_URL } from "@/app/_seo/schema";
import { liveTools, toolPath } from "@/lib/tools/registry";
import { resolveSolutionSlugs } from "@/lib/solutions/resolve";
import { SOLUTIONS_BASE_PATH, solutionPath } from "@/lib/solutions/seed";
import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import { agencyPath, getIndexableAgencySlugs } from "@/lib/directory/agencies";

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
  "/bug-book",
  "/calculator",
  "/case-study",
  "/checklist",
  "/comparisons",
  "/demo",
  DIRECTORY_BASE_PATH,
  ...DIRECTORY_CATEGORIES.map((category) => `${DIRECTORY_BASE_PATH}/${category.slug}`),
  "/integrations",
  "/pricing",
  "/privacy",
  "/security",
  // The solutions index. Its child pages come from resolveSolutionSlugs()
  // below. The retired /use-case and /user-persona hubs now 301 here.
  SOLUTIONS_BASE_PATH,
  // Survey landing page only. The /report child stays out (and noindex)
  // until real results replace the sample data - see
  // app/state-of-agency-tools/README.md.
  "/state-of-agency-tools",
  "/terms",
  "/tools",
  // The MCP and API reference for the tools. Not in the tool registry (it is
  // documentation, not a tool), so it is listed explicitly.
  "/tools/mcp",
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
    bugBookSlugs,
    integrationSlugsCms,
    solutionSlugs,
    caseStudySlugsCms,
    alternativeSlugsCms,
    comparisonSlugsCms,
    reviewSlugs,
    checklistSlugs,
    featureSlugs,
    comparisonCatalog,
    docsPaths,
  ] = await Promise.all([
    safeFetch(getAllBlogSlugs),
    safeFetch(getAllBugBookSlugs),
    safeFetch(getAllIntegrationPreviewSlugs),
    // CMS slugs merged with the seed, so a seeded page is listed before its
    // Sanity document exists and the list survives a CMS outage.
    safeFetch(resolveSolutionSlugs),
    safeFetch(getAllCaseStudySlugs),
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
    ...unique(solutionSlugs).map((slug) => solutionPath(slug)),
    ...unique([...alternativeSlugsCms, ...catalogAlternativeSlugs]).map(
      (slug) => `/alternative/${slug}`,
    ),
    ...unique([...comparisonSlugsCms, ...catalogComparisonSlugs]).map(
      (slug) => `/comparisons/${slug}`,
    ),
    ...unique(caseStudySlugsCms).map((slug) => `/case-study/${slug}`),
    ...unique(blogSlugs).map((slug) => `/blog/${slug}`),
    ...unique(bugBookSlugs).map((slug) => `/bug-book/${slug}`),
    ...unique(reviewSlugs).map((slug) => `/${slug}`),
    ...unique(checklistSlugs).map((slug) => `/${slug}`),
    ...unique(featureSlugs).map((slug) => `/${slug}`),
    // Proxied Mintlify docs — already absolute-path form, not slugs.
    ...unique(docsPaths),
    // Agency directory detail pages. Only agencies that clear the
    // thin-content bar (lib/directory/agencies.ts#shouldIndexAgency) are
    // submitted here — held-back agencies still render a real page (see
    // app/directory/agency/[slug]/page.tsx), they're just not pushed at
    // search engines via the sitemap.
    ...unique(getIndexableAgencySlugs()).map((slug) => agencyPath(slug)),
  ];

  const lastModified = new Date();
  const allPaths = unique([...STATIC_PATHS, ...dynamicPaths]);

  return allPaths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
  }));
}
