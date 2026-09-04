// Server-side resolvers: CMS first, seed fallback.
//
// Kept separate from ./seed so client components (nav, footer) can import the
// seed summaries without pulling the Sanity client into their bundle.

import {
  getAllSolutionSlugs,
  getAllSolutionsForIndex,
  getSolutionPageBySlug,
} from "@/sanity/lib/queries";
import {
  SOLUTION_SLUGS,
  SOLUTION_SUMMARIES,
  compareSolutions,
  getSeedSolution,
} from "./seed";
import type { SolutionPage, SolutionSummary } from "./types";

/**
 * A CMS document counts as usable only when the fields the template needs are
 * present; a half-authored draft falls back to the seed rather than rendering
 * an empty page. The list queries in sanity/lib/queries.ts apply the same test
 * (SOLUTION_PAGE_FILTER), so a document this rejects is never listed either.
 *
 * @param doc - Whatever the GROQ projection returned.
 * @returns True when it can be rendered.
 */
function isRenderable(doc: unknown): doc is SolutionPage {
  try {
    const page = doc as Partial<SolutionPage> | null;
    return Boolean(
      page &&
        page.slug &&
        page.hero?.h1 &&
        page.pack?.name &&
        Array.isArray(page.pack?.agents) &&
        page.pack.agents.length > 0 &&
        page.human?.agentsCheck &&
        page.human?.youDecide,
    );
  } catch {
    return false;
  }
}

/**
 * Resolve one solution page: the Sanity document when it exists and is
 * renderable, else the seed with the same slug, else null.
 *
 * @param slug - The page slug.
 * @returns The page to render, or null for an unknown slug.
 */
export async function resolveSolutionPage(slug: string): Promise<SolutionPage | null> {
  let doc: unknown = null;
  try {
    doc = await getSolutionPageBySlug(slug);
  } catch {
    doc = null;
  }
  if (isRenderable(doc)) {
    return doc;
  }
  return getSeedSolution(slug) ?? null;
}

/**
 * Every visible solution slug: the union of CMS slugs and seed slugs.
 *
 * @returns Unique slugs.
 */
export async function resolveSolutionSlugs(): Promise<string[]> {
  let cmsSlugs: string[] = [];
  try {
    cmsSlugs = (await getAllSolutionSlugs()) ?? [];
  } catch {
    cmsSlugs = [];
  }
  return Array.from(new Set([...cmsSlugs, ...SOLUTION_SLUGS]));
}

/**
 * Index entries: CMS summaries merged over the seed summaries by slug, sorted
 * for display.
 *
 * @returns The summaries to list on /solutions.
 */
export async function resolveSolutionSummaries(): Promise<SolutionSummary[]> {
  const bySlug = new Map<string, SolutionSummary>();
  for (const summary of SOLUTION_SUMMARIES) {
    bySlug.set(summary.slug, summary);
  }
  try {
    const cms = ((await getAllSolutionsForIndex()) ?? []) as Partial<SolutionSummary>[];
    for (const entry of cms) {
      if (!entry?.slug || !entry.navLabel) {
        continue;
      }
      const seed = bySlug.get(entry.slug);
      bySlug.set(entry.slug, {
        slug: entry.slug,
        kind: entry.kind ?? seed?.kind ?? "job",
        navLabel: entry.navLabel,
        navDescriptor: entry.navDescriptor ?? seed?.navDescriptor ?? "",
        order: entry.order ?? seed?.order,
        packName: entry.packName ?? seed?.packName ?? "",
        agentNames: entry.agentNames ?? seed?.agentNames ?? [],
      });
    }
  } catch {
    // Seed summaries stand in when the CMS is unreachable.
  }
  return Array.from(bySlug.values()).sort(compareSolutions);
}
