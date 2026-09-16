import styles from "./DirectoryHero.module.css";

/** Mono kicker above the H1, orienting a visitor inside /directory before
 *  they read the headline. */
const KICKER_TEXT = "Agency directory";

/**
 * Header for the directory list page, on the 2026 design system: the
 * shared blue-gradient bitmap and white Adamina serif headline used by the
 * homepage, /integrations and /case-study, fading into the white list
 * section below.
 *
 * Replaces `CategoryHero`, which headed the four `/directory/<category>`
 * pages this list replaced. The stat card that hero closed on is gone with
 * them: the toolbar's live count line ("Showing 60 of 323 agencies") is now
 * the page's own statement of how big the directory is, and it stays true
 * as a visitor filters, which a static stat row could not.
 *
 * The headline stays the same whichever category is selected, and that is
 * deliberate: the filter is client state that a visitor changes in place,
 * so a category-specific H1 would be stale the moment they touched the
 * select. What they have filtered to is said by the select itself and by
 * the live count line under it, both of which stay true.
 *
 * @param props - Component props.
 * @param props.heading - The H1.
 * @param props.subheading - One line under the H1.
 */
export default function DirectoryListHero({
  heading,
  subheading,
}: {
  heading: string;
  subheading?: string;
}) {
  try {
    return (
      <section
        className={`${styles.hero} ${styles.heroList}`}
        data-section="directory-list-hero"
      >
        <div className={`${styles.inner} ${styles.innerList}`}>
          <p className={styles.kicker}>{KICKER_TEXT}</p>
          <h1 className={styles.headline}>{heading}</h1>
          {subheading ? <p className={styles.subhead}>{subheading}</p> : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
