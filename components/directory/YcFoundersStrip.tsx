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
 * Every link goes to a category ALREADY FILTERED to agencies with a
 * standing YC offer (`?yc_offer=1`), which is the same filter the control
 * bar writes - see lib/directory/filters.ts, which owns that param name
 * so a link built here and a reader over there cannot disagree.
 *
 * @param props - Component props.
 * @param props.offerCountsBySlug - How many agencies in each category
 *          carry an offer. A category with none is still listed but not
 *          linked: sending somebody to a filter that returns an empty
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

    return (
      <section className={styles.section} data-section="directory-yc-strip">
        <div className={styles.inner}>
          <div className={styles.copy}>
            <h2 className={styles.heading}>{HEADING}</h2>
            <p className={styles.body}>{BODY}</p>
          </div>

          {withOffers.length > 0 ? (
            <ul className={styles.links}>
              {withOffers.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`${DIRECTORY_BASE_PATH}/${category.slug}?${FILTER_PARAMS.ycOffer}=1`}
                    className={styles.link}
                  >
                    {category.title}
                    <span className={styles.count}>
                      {offerCountsBySlug[category.slug]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            // Honest about the empty state rather than hiding the strip.
            // The offers arrive as agencies claim, and a founder who sees
            // this knows to come back - and an agency reading it knows
            // what the tag is worth.
            <p className={styles.pending}>
              The first offers land as agencies claim their listings. Check back shortly.
            </p>
          )}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
