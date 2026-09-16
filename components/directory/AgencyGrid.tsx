import AgencyExplorer from "./AgencyExplorer";
import styles from "./DirectoryGrid.module.css";
import { DIRECTORY_ALL_CATEGORIES, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import type { AgencyListItem } from "@/lib/directory/agencies";

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
 * The directory list section: the whole list as `AgencyListItem`s, handed
 * to the controls that filter, sort and page it.
 *
 * Every card on the requested page is rendered on the server -
 * AgencyExplorer is a client component, and a client component
 * server-renders - so the page's agency links are in the HTML regardless
 * of client-side filter state, and the pager's links carry a crawler to
 * the rest.
 *
 * What crosses the client boundary is the projection for the *whole* list
 * rather than rendered cards: the client needs every item to search
 * across, and only the current page's worth of markup. See
 * `AgencyListItem` in lib/directory/agencies.ts for what that is worth in
 * payload, and "Page weight" in app/directory/README.md.
 *
 * @param props - Component props.
 * @param props.items - Every agency, projected and already in the
 *                       directory's default order.
 * @param props.initialCategory - The category the caller filtered to, from
 *                                 `?category=`. Forwarded so the client's
 *                                 initial state matches the server's HTML.
 * @param props.initialPage - The page the caller is rendering, from
 *                             `?page=`. Same contract.
 */
export default function AgencyGrid({
  items,
  initialCategory = DIRECTORY_ALL_CATEGORIES,
  initialPage = 1,
}: {
  items: AgencyListItem[];
  initialCategory?: string;
  initialPage?: number;
}) {
  try {
    const safeItems = items ?? [];

    if (safeItems.length === 0) {
      return (
        <section className={styles.section} data-section="directory-agency-grid">
          <div className={styles.inner}>
            <EmptyState />
          </div>
        </section>
      );
    }

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
            items={safeItems}
            categories={categories}
            initialCategory={initialCategory}
            initialPage={initialPage}
          />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
