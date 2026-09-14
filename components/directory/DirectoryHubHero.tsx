import Link from "next/link";

import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import styles from "./DirectoryHero.module.css";

/** Primary action. It replaced "Try Superflow for Free", which was the
 *  hero's CTA when this page was rendered through the shared listing
 *  shell - see components/directory/DirectoryTrialCta.tsx for where that
 *  offer went and why. */
const MATCH_CTA_LABEL = "Get matched";

/** Secondary action. An in-page anchor rather than a route: the category
 *  grid is the next thing on this page, so a link that navigated
 *  somewhere would be sending a visitor away from what they asked for. */
const BROWSE_CTA_LABEL = "Browse by category";

/** The grid's anchor target. `ListingGrid` renders a plain section, so
 *  the id is carried by the wrapper this hero's sibling provides - see
 *  the `#categories` target in app/directory/page.tsx. */
const BROWSE_TARGET = "#categories";

/**
 * Hero for the directory hub, on the shared blue-gradient furniture the
 * category pages use.
 *
 * A separate component from `CategoryHero` rather than a variant of it:
 * the two heroes share CSS but almost no logic - this one has no stat
 * card, no kicker and no category, and the pair of them behind one set of
 * optional props read worse than two files that each do one thing.
 *
 * @param props - Component props.
 * @param props.heading - The H1.
 * @param props.subheading - Supporting line under it.
 */
export default function DirectoryHubHero({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  try {
    return (
      <section className={styles.hero} data-section="directory-hub-hero">
        <div className={styles.inner}>
          <h1 className={styles.headline}>{heading}</h1>
          <p className={styles.subhead}>{subheading}</p>

          <div className={styles.actions}>
            <Link href={`${DIRECTORY_BASE_PATH}/match`} className={styles.cta}>
              {MATCH_CTA_LABEL}
            </Link>
            <a href={BROWSE_TARGET} className={styles.secondaryCta}>
              {BROWSE_CTA_LABEL}
            </a>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
