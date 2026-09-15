import type { ReactNode } from "react";
import RelatedCapabilities, {
  type RelatedCapabilityItem,
} from "@/components/feature-2026/RelatedCapabilities";
import type { FeatureSetIconName } from "@/components/home-2026/FeatureSetIcons";
import {
  SOLUTION_SUMMARIES,
  SOLUTIONS_BASE_PATH,
  solutionPath,
} from "@/lib/solutions/seed";
import type {
  SolutionKind,
  SolutionPage,
  SolutionSummary,
} from "@/lib/solutions/types";

const HEADING = "Other solutions";
const ALL_TITLE = "All solutions";
const ALL_DESCRIPTION = "Every pack, by agency and by job.";
/** How many related pages to link (spec section 8: two). */
const RELATED_COUNT = 2;

/** Card glyph per kind. */
const ICON_BY_KIND: Readonly<Record<SolutionKind, FeatureSetIconName>> = {
  agency: "sparkles",
  job: "list-check",
};
const ALL_ICON: FeatureSetIconName = "dots-grid";

/** The page fields the related picker reads. */
type RelatedSource = Pick<SolutionPage, "slug" | "kind" | "related">;

/**
 * Pick the related summaries for a page: its `related` slugs that resolve,
 * then a backfill from the same kind, then any kind, so two links always
 * render even when a related slug has no page yet (batch 2).
 *
 * @param page - The page being rendered.
 * @param summaries - Every known solution summary.
 * @param count - How many to return.
 * @returns The summaries to link, in order.
 */
export function pickRelatedSummaries(
  page: RelatedSource,
  summaries: readonly SolutionSummary[],
  count: number = RELATED_COUNT,
): SolutionSummary[] {
  try {
    const bySlug = new Map<string, SolutionSummary>();
    for (const summary of summaries) {
      if (summary?.slug) {
        bySlug.set(summary.slug, summary);
      }
    }
    const picked: SolutionSummary[] = [];
    const has = (slug: string) => picked.some((entry) => entry.slug === slug);

    for (const slug of page?.related ?? []) {
      const summary = bySlug.get(slug);
      if (summary && summary.slug !== page.slug && !has(summary.slug)) {
        picked.push(summary);
      }
      if (picked.length >= count) {
        break;
      }
    }

    const backfill = (matchKind: boolean) => {
      for (const summary of summaries) {
        if (picked.length >= count) {
          return;
        }
        if (summary.slug === page.slug || has(summary.slug)) {
          continue;
        }
        if (matchKind && summary.kind !== page.kind) {
          continue;
        }
        picked.push(summary);
      }
    };
    backfill(true);
    backfill(false);

    return picked.slice(0, count);
  } catch {
    return [];
  }
}

/**
 * Build the card items: the related pages, then "All solutions".
 *
 * @param page - The page being rendered.
 * @param summaries - Known summaries, or the seed list when empty.
 * @returns The items for the card row.
 */
function toRelatedItems(
  page: RelatedSource,
  summaries?: readonly SolutionSummary[],
): RelatedCapabilityItem[] {
  try {
    const source =
      summaries && summaries.length > 0 ? summaries : SOLUTION_SUMMARIES;
    const items: RelatedCapabilityItem[] = pickRelatedSummaries(page, source).map(
      (summary) => ({
        title: summary.navLabel,
        description: summary.navDescriptor,
        href: solutionPath(summary.slug),
        icon: ICON_BY_KIND[summary.kind] ?? ALL_ICON,
      }),
    );
    items.push({
      title: ALL_TITLE,
      description: ALL_DESCRIPTION,
      href: SOLUTIONS_BASE_PATH,
      icon: ALL_ICON,
    });
    return items;
  } catch {
    return [];
  }
}

/** Props for {@link RelatedSolutions}. */
export interface RelatedSolutionsProps {
  /** The page being rendered. */
  page: RelatedSource;
  /** Known summaries (CMS merged over seed). Defaults to the seed list. */
  summaries?: readonly SolutionSummary[];
}

/**
 * "Other solutions": two related solution pages plus an "All solutions" link,
 * rendered with the shared related-capabilities card row.
 *
 * @param props - The page and the known summaries.
 * @returns The section, or null when no item resolves.
 */
export default function RelatedSolutions({
  page,
  summaries,
}: RelatedSolutionsProps): ReactNode {
  const items = toRelatedItems(page, summaries);
  if (items.length === 0) {
    return null;
  }
  return <RelatedCapabilities heading={HEADING} items={items} />;
}
