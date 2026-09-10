// Server-side resolvers: CMS first, seed fallback, hidden documents honoured.
//
// Kept separate from ./seed so client components can import the seed
// summaries without pulling the Sanity client into their bundle. The nav and
// footers read the resolved summaries through SolutionsChromeProvider
// (components/solutions-2026/SolutionsChrome.tsx), which the root layout
// feeds from resolveSolutionSummaries().

import { cache } from "react";
import {
  getAllSolutionSlugs,
  getAllSolutionsForIndex,
  getHiddenSolutionSlugs,
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
 * Slugs an editor has hidden in the CMS, as a set. A hidden document beats the
 * seed: the page is not served, listed, or linked, even though a seed file
 * for it exists (a pack that is not live in the app yet). When the CMS is
 * unreachable nothing is hidden and the seed stands in, which keeps the site
 * up through an outage. Memoised per request so the layout, the route and
 * the footer share one lookup.
 *
 * @returns The hidden slugs.
 */
const resolveHiddenSlugs = cache(async (): Promise<ReadonlySet<string>> => {
  try {
    return new Set((await getHiddenSolutionSlugs()) ?? []);
  } catch {
    return new Set();
  }
});

/**
 * Resolve one solution page: the Sanity document when it exists and is
 * renderable; null when an editor has hidden it; else the seed with the same
 * slug; else null.
 *
 * @param slug - The page slug.
 * @returns The page to render, or null for an unknown or hidden slug.
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
  const hidden = await resolveHiddenSlugs();
  if (hidden.has(slug)) {
    return null;
  }
  return getSeedSolution(slug) ?? null;
}

/**
 * Every visible solution slug: the union of CMS slugs and seed slugs, minus
 * the slugs an editor has hidden.
 *
 * @returns Unique slugs.
 */
export const resolveSolutionSlugs = cache(async (): Promise<string[]> => {
  let cmsSlugs: string[] = [];
  try {
    cmsSlugs = (await getAllSolutionSlugs()) ?? [];
  } catch {
    cmsSlugs = [];
  }
  const hidden = await resolveHiddenSlugs();
  return Array.from(new Set([...cmsSlugs, ...SOLUTION_SLUGS])).filter(
    (slug) => !hidden.has(slug),
  );
});

/**
 * Summaries for the index, the nav and the footers: CMS summaries merged over
 * the seed summaries by slug, hidden slugs removed, sorted for display.
 * Memoised per request so the root layout (which feeds the nav and footer)
 * and a solutions route share one fetch.
 *
 * @returns The summaries to list.
 */
export const resolveSolutionSummaries = cache(async (): Promise<SolutionSummary[]> => {
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
  const hidden = await resolveHiddenSlugs();
  return Array.from(bySlug.values())
    .filter((summary) => !hidden.has(summary.slug))
    .sort(compareSolutions);
});
