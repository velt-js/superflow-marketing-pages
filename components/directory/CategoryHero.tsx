import type { DirectoryCategory } from "@/lib/directory/types";
import styles from "./DirectoryHero.module.css";

/** Mono kicker above the H1, orienting a visitor inside /directory before
 *  they read the category-specific heading. */
const KICKER_TEXT = "Agency directory";

/**
 * Header for a directory category page, on the 2026 design system: the
 * shared blue-gradient bitmap and white Adamina serif headline used by the
 * homepage, /integrations and /case-study, fading into the white agency
 * grid below.
 *
 * Replaces the flat white header this component used to ship. That version
 * predated the 2026 chrome and was written to avoid the *old* dark
 * `components/listing/ListingHero` — its cursor decorations and generic
 * "Try Superflow for Free" CTA genuinely did read wrong on a browse page.
 * The 2026 hero has neither, so the reason to opt out is gone, and opting
 * out is now what makes the page look off-site.
 *
 * Unlike the agency profile's hero (`AgencyDetail.tsx`), this one closes
 * on its copy rather than on a white meta card: the agency / country /
 * partner stat row it used to carry is gone, so the page leads straight
 * from the subhead into the grid. `heroNoCard` shortens the shared hero's
 * white fade and pads the copy above it accordingly — see
 * DirectoryHero.module.css.
 *
 * @param props - Component props.
 * @param props.category - The category being rendered.
 */
export default function CategoryHero({ category }: { category: DirectoryCategory }) {
  try {
    return (
      <section
        className={`${styles.hero} ${styles.heroNoCard}`}
        data-section="directory-category-hero"
      >
        <div className={styles.inner}>
          <p className={styles.kicker}>{KICKER_TEXT}</p>
          <h1 className={styles.headline}>{category?.heading}</h1>
          {category?.subheading ? (
            <p className={styles.subhead}>{category.subheading}</p>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
