import AgencyExplorer from "./AgencyExplorer";
import styles from "./DirectoryGrid.module.css";
import { buildAgencyListItems } from "@/lib/directory/agencies";
import { DIRECTORY_ALL_CATEGORIES, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import type { Agency } from "@/lib/directory/types";

/** Copy shown while the dataset is empty - pre-scrape, or when every
 *  source file has been emptied. */
const EMPTY_STATE_HEADING = "No agencies indexed yet";
const EMPTY_STATE_BODY =
  "We're compiling studios and agencies for this directory. Check back soon.";

/**
 * Empty-state block rendered in place of the grid when the directory has
 * no records at all - keeps the page from rendering a bare, broken-looking
 * section while the importers are still populating the dataset.
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
 * The directory list section: the whole agency list, projected into the
 * slim `AgencyListItem` shape and handed to the controls that filter it.
 *
 * Every card is still rendered on the server - AgencyExplorer is a client
 * component, and a client component server-renders - so the full set of
 * agency links is in the HTML regardless of client-side filter state. What
 * crosses the boundary is the projection rather than rendered cards: see
 * `AgencyListItem` in lib/directory/agencies.ts for what that is worth in
 * payload on a list this long.
 *
 * Renders a graceful empty state instead of the controls + grid when
 * `agencies` is empty.
 *
 * @param props - Component props.
 * @param props.agencies - Agencies to render, already sorted by the caller.
 * @param props.initialCategory - The category the caller filtered to, from
 *                                 `?category=`. Forwarded so the client's
 *                                 initial state matches the server's HTML.
 */
export default function AgencyGrid({
  agencies,
  initialCategory = DIRECTORY_ALL_CATEGORIES,
}: {
  agencies: Agency[];
  initialCategory?: string;
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
    // Only the slug and title cross the client boundary, never the
    // registry object itself - see AgencyExplorer's import note.
    const categories = DIRECTORY_CATEGORIES.map((category) => ({
      slug: category.slug,
      title: category.title,
    }));

    return (
      <section className={styles.section} data-section="directory-agency-grid">
        <div className={styles.inner}>
          <AgencyExplorer
            items={items}
            categories={categories}
            initialCategory={initialCategory}
          />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
