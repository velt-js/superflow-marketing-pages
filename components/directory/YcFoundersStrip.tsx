import Link from "next/link";

import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import { FILTER_PARAMS } from "@/lib/directory/filters";
import styles from "./YcFoundersStrip.module.css";

const HEADING = "For YC founders";
const BODY =
  "Agencies on this list offer YC companies a deal. Look for the YC offer tag, or jump straight to the ones that have one.";

/**
 * The "For YC founders" strip under the category cards on /directory.
 *
 * RENDERS NOTHING UNTIL AT LEAST ONE AGENCY ACTUALLY HAS AN OFFER. Its
 * heading is a factual claim - "Agencies on this list offer YC companies
 * a deal" - and the claim layer ships empty, so on a fresh build that
 * sentence is simply false. It first shipped with a softer fallback line
 * ("the first offers land as agencies claim their listings"), which was
 * worse: it kept a promotional panel on the page whose entire content was
 * an admission that the promotion does not exist yet.
 *
 * The strip is not deleted, and this is not a launch flag. The count is
 * derived from the live data on every render, so the strip appears on its
 * own the day the first agency states an offer, and disappears again if
 * every offer is withdrawn.
 *
 * Every link goes to a category ALREADY FILTERED to agencies with a
 * standing YC offer (`?yc_offer=1`), which is the same filter the control
 * bar writes - see lib/directory/filters.ts, which owns that param name
 * so a link built here and a reader over there cannot disagree.
 *
 * @param props - Component props.
 * @param props.offerCountsBySlug - How many agencies in each category
 *          carry an offer. A category with none is left out of the links
 *          entirely: sending somebody to a filter that returns an empty
 *          page is worse than not offering the shortcut.
 */
export default function YcFoundersStrip({
  offerCountsBySlug,
}: {
  offerCountsBySlug: Record<string, number>;
}) {
  try {
    const withOffers = DIRECTORY_CATEGORIES.filter(
      (category) => (offerCountsBySlug?.[category.slug] ?? 0) > 0,
    );

    // Nothing to point at means nothing to claim. See the note above.
    if (withOffers.length === 0) return null;

    return (
      <section className={styles.section} data-section="directory-yc-strip">
        <div className={styles.inner}>
          <div className={styles.copy}>
            <h2 className={styles.heading}>{HEADING}</h2>
            <p className={styles.body}>{BODY}</p>
          </div>

          <ul className={styles.links}>
            {withOffers.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`${DIRECTORY_BASE_PATH}/${category.slug}?${FILTER_PARAMS.ycOffer}=1`}
                  className={styles.link}
                >
                  {category.title}
                  <span className={styles.count}>{offerCountsBySlug[category.slug]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
