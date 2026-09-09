import AgencyCard from "./AgencyCard";
import styles from "./DirectoryGrid.module.css";
import type { RelatedAgenciesBlock } from "@/lib/directory/agencies";

/**
 * Internal-link block shown at the bottom of an agency detail page, so
 * every profile is reachable from more than one path (its category
 * listing plus this block) instead of being an orphan the crawler only
 * finds once.
 *
 * Shares the category page's grid furniture (`DirectoryGrid.module.css`)
 * so a related card is pixel-identical to the same card on the listing -
 * with `sectionSpaced` restoring the top padding the listing's section
 * drops, since this block follows page content rather than the hero fade.
 *
 * Renders nothing when the block has no agencies - happens for a record
 * with no country-mates and no category-mates, which is expected while
 * the dataset is small.
 *
 * @param props - Component props.
 * @param props.block - The heading + agencies computed by
 *                       `getRelatedAgencies`.
 */
export default function RelatedAgencies({ block }: { block: RelatedAgenciesBlock }) {
  try {
    if (!block?.agencies || block.agencies.length === 0) return null;

    return (
      <section
        className={`${styles.section} ${styles.sectionSpaced}`}
        data-section="directory-related-agencies"
      >
        <div className={styles.inner}>
          <h2 className={styles.heading}>{block.heading}</h2>
          <ul className={styles.grid}>
            {block.agencies.map((agency) => (
              <li
                key={agency?.slug ?? agency?.profileUrl}
                className={styles.item}
              >
                <AgencyCard agency={agency} />
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
