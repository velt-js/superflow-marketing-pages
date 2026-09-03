import type { ReactNode } from "react";

import AgencyCard from "./AgencyCard";
import AgencyExplorer from "./AgencyExplorer";
import { buildAgencyListItems } from "@/lib/directory/agencies";
import type { Agency } from "@/lib/directory/types";

/** Copy shown while a category's dataset is still empty (pre-scrape, or a
 *  category with zero matching records). Kept as constants since the
 *  empty state and the section wrapper are the two things most likely to
 *  need tweaking together. */
const EMPTY_STATE_HEADING = "No agencies indexed yet";
const EMPTY_STATE_BODY =
  "We're compiling award-winning studios for this category. Check back soon.";

/**
 * Empty-state block rendered in place of the grid when a category has no
 * matching agencies yet - keeps the page from rendering a bare, broken-
 * looking section while the scraper is still populating the dataset.
 */
function EmptyState() {
  try {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-black/10 px-6 py-16 text-center"
      >
        <p
          className="text-black"
          style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 18 }}
        >
          {EMPTY_STATE_HEADING}
        </p>
        <p
          className="max-w-[420px]"
          style={{ fontFamily: "var(--font-urbanist)", fontSize: 14, color: "rgba(10,10,10,0.55)" }}
        >
          {EMPTY_STATE_BODY}
        </p>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Builds a slug-keyed map of pre-rendered `<AgencyCard/>` elements. Keyed
 * by slug rather than array index so it can never desynchronize from the
 * parallel `AgencyListItem[]` built by `buildAgencyListItems` (which
 * drops any agency without a slug) - the client-side AgencyExplorer joins
 * the two by slug, never by position.
 *
 * @param agencies - Agencies to render as cards.
 * @returns A map from `Agency.slug` to that agency's rendered card.
 */
function buildCardsBySlug(agencies: Agency[]): Record<string, ReactNode> {
  try {
    const cardsBySlug: Record<string, ReactNode> = {};
    for (const agency of agencies) {
      if (agency?.slug) {
        cardsBySlug[agency.slug] = <AgencyCard agency={agency} />;
      }
    }
    return cardsBySlug;
  } catch {
    return {};
  }
}

/**
 * Server-rendered agency list for a directory category page. Every
 * agency's card is rendered here, server-side, in the directory's default
 * order - the search/country/sort controls (AgencyExplorer, a small
 * client component) only decide which of those already-rendered cards to
 * show and in what order, so the full set of agency links is always
 * present in the server HTML regardless of client-side filter state.
 *
 * Renders a graceful empty state instead of the controls + grid when
 * `agencies` is empty, which is the expected state until the scraper
 * populates lib/directory/data/agencies.json (or for a category with no
 * matches yet).
 *
 * @param props - Component props.
 * @param props.agencies - Agencies to render, already sorted by the caller.
 */
/**
 * Section wrapper classes, shared by the populated and empty states so the
 * two can't drift apart.
 *
 * No top padding on purpose: this section always follows CategoryHero,
 * which already closes with 48/64px of bottom padding. Using the global
 * `section-pad-y` here stacked the two into a ~227px dead gap between the
 * stat row and the filter controls.
 */
const SECTION_CLASS = "bg-white pt-0 pb-[64px] lg:pb-[120px]";

export default function AgencyGrid({ agencies }: { agencies: Agency[] }) {
  try {
    const safeAgencies = agencies ?? [];

    if (safeAgencies.length === 0) {
      return (
        <section className={SECTION_CLASS}>
          <div className="container-page">
            <EmptyState />
          </div>
        </section>
      );
    }

    const items = buildAgencyListItems(safeAgencies);
    const cardsBySlug = buildCardsBySlug(safeAgencies);

    return (
      <section className={SECTION_CLASS}>
        <div className="container-page">
          <AgencyExplorer items={items} cardsBySlug={cardsBySlug} />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
