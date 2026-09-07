import type { ReactNode } from "react";

import AgencyCard from "./AgencyCard";
import AgencyExplorer from "./AgencyExplorer";
import styles from "./DirectoryGrid.module.css";
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
      <div className={styles.empty}>
        <p className={styles.emptyHeading}>{EMPTY_STATE_HEADING}</p>
        <p className={styles.emptyBody}>{EMPTY_STATE_BODY}</p>
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
 * @param props.categorySlug - The category being rendered. Forwarded to
 *                             AgencyExplorer so its client-side "Top
 *                             ranked" sort reproduces the server order for
 *                             this category rather than a different one.
 */
export default function AgencyGrid({
  agencies,
  categorySlug,
}: {
  agencies: Agency[];
  categorySlug: string;
}) {
  try {
    const safeAgencies = agencies ?? [];

    if (safeAgencies.length === 0) {
      return (
        <section className={styles.section} data-section="directory-agency-grid">
          <div className={styles.inner}>
            <EmptyState />
          </div>
        </section>
      );
    }

    const items = buildAgencyListItems(safeAgencies);
    const cardsBySlug = buildCardsBySlug(safeAgencies);

    return (
      <section className={styles.section} data-section="directory-agency-grid">
        <div className={styles.inner}>
          <AgencyExplorer items={items} cardsBySlug={cardsBySlug} categorySlug={categorySlug} />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
