// Seed content for the /solutions pages, and the resolver that prefers the CMS.
//
// The Sanity `solutionPage` documents are the source of truth once seeded
// (scripts/solutions-import/import-to-sanity.mjs pushes these same files). Until
// a document exists, and whenever the CMS is unreachable, the page renders from
// the JSON here so the routes never 404 on content that is already written.
// Nav, footer and the index card lists are client-rendered chrome, so they read
// the seed summaries directly (no per-render fetch).

import type { SolutionPage, SolutionSummary, SolutionKind } from "./types";
import dental from "@/content/solutions/dental-marketing-agencies.json";
import healthcare from "@/content/solutions/healthcare-marketing.json";
import homeServices from "@/content/solutions/home-services-marketing.json";
import preLaunch from "@/content/solutions/pre-launch-qa.json";
import siteCare from "@/content/solutions/site-care.json";
import migration from "@/content/solutions/website-migration-qa.json";

/** Base path every solutions route lives under. */
export const SOLUTIONS_BASE_PATH = "/solutions";

/** The batch-1 pages in nav order (agency first, then job). */
export const SOLUTION_SEED: readonly SolutionPage[] = [
  dental as SolutionPage,
  healthcare as SolutionPage,
  homeServices as SolutionPage,
  preLaunch as SolutionPage,
  siteCare as SolutionPage,
  migration as SolutionPage,
];

/** Every seeded slug, in nav order. */
export const SOLUTION_SLUGS: readonly string[] = SOLUTION_SEED.map((page) => page.slug);

/**
 * Sort helper: by kind (agency before job), then `order`, then label.
 *
 * @param a - First page or summary.
 * @param b - Second page or summary.
 * @returns Comparator result.
 */
export function compareSolutions(
  a: Pick<SolutionSummary, "kind" | "order" | "navLabel">,
  b: Pick<SolutionSummary, "kind" | "order" | "navLabel">,
): number {
  try {
    if (a.kind !== b.kind) {
      return a.kind === "agency" ? -1 : 1;
    }
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.navLabel.localeCompare(b.navLabel);
  } catch {
    return 0;
  }
}

/**
 * Reduce a full page to the summary shape the index, nav and footer use.
 *
 * @param page - A full solution page.
 * @returns Its summary.
 */
export function toSolutionSummary(page: SolutionPage): SolutionSummary {
  return {
    slug: page.slug,
    kind: page.kind,
    navLabel: page.navLabel,
    navDescriptor: page.navDescriptor,
    order: page.order,
    packName: page.pack?.name ?? "",
    agentNames: (page.pack?.agents ?? []).slice(0, 3).map((agent) => agent.name),
  };
}

/** Seed summaries, sorted for display. */
export const SOLUTION_SUMMARIES: readonly SolutionSummary[] = SOLUTION_SEED.map(
  toSolutionSummary,
).sort(compareSolutions);

/**
 * Seed summaries for one kind, sorted for display.
 *
 * @param kind - "agency" or "job".
 * @returns The matching summaries.
 */
export function solutionsOfKind(kind: SolutionKind): SolutionSummary[] {
  return SOLUTION_SUMMARIES.filter((summary) => summary.kind === kind);
}

/**
 * Seed page by slug.
 *
 * @param slug - The page slug.
 * @returns The page, or undefined when no seed exists for it.
 */
export function getSeedSolution(slug: string): SolutionPage | undefined {
  return SOLUTION_SEED.find((page) => page.slug === slug);
}

/**
 * Absolute-from-root path of a solution page.
 *
 * @param slug - The page slug.
 * @returns e.g. "/solutions/dental-marketing-agencies".
 */
export function solutionPath(slug: string): string {
  return `${SOLUTIONS_BASE_PATH}/${slug}`;
}
