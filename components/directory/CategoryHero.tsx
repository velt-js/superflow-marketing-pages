import { Fragment } from "react";

import type { AgencyListStats } from "@/lib/directory/agencies";
import type { DirectoryCategory } from "@/lib/directory/types";
import styles from "./DirectoryHero.module.css";

/** Mono kicker above the H1, orienting a visitor inside /directory before
 *  they read the category-specific heading. */
const KICKER_TEXT = "Agency directory";

/** One `{ value, label }` pair in the hero's stat card. */
interface CategoryStat {
  value: number;
  label: string;
}

/**
 * Builds the hero stat card's entries from the live counts, dropping any
 * that are zero so a small dataset shows two facts rather than three, one
 * of which reads "0".
 *
 * @param stats - Agency/country/partner counts derived from the data.
 * @returns The stat entries to render, in display order.
 */
function buildStatEntries(stats: AgencyListStats): CategoryStat[] {
  try {
    const entries: CategoryStat[] = [
      {
        value: stats?.agencyCount ?? 0,
        label: stats?.agencyCount === 1 ? "Agency" : "Agencies",
      },
      {
        value: stats?.countryCount ?? 0,
        label: stats?.countryCount === 1 ? "Country" : "Countries",
      },
      { value: stats?.partnerCount ?? 0, label: "Superflow partners" },
    ];
    return entries.filter((entry) => entry.value > 0);
  } catch {
    return [];
  }
}

/**
 * One number+label pair inside the hero's white stat card.
 *
 * @param props - Component props.
 * @param props.value - The count to display.
 * @param props.label - What that count counts.
 */
function CategoryStatItem({ value, label }: CategoryStat) {
  try {
    return (
      <div className={styles.metaItem}>
        <span className={`${styles.metaValue} ${styles.metaValueStat}`}>
          {value}
        </span>
        <span className={styles.metaLabel}>{label}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Header for a directory category page, on the 2026 design system: the
 * shared blue-gradient bitmap and white Adamina serif headline used by the
 * homepage, /integrations and /case-study, closed by a white stat card
 * riding the fade into the white agency grid below.
 *
 * Replaces the flat white header this component used to ship. That version
 * predated the 2026 chrome and was written to avoid the *old* dark
 * `components/listing/ListingHero` — its cursor decorations and generic
 * "Try Superflow for Free" CTA genuinely did read wrong on a browse page.
 * The 2026 hero has neither, so the reason to opt out is gone, and opting
 * out is now what makes the page look off-site.
 *
 * The stat row keeps its old job (it is the one thing on the page that
 * proves the directory is real and populated) but moves into the hero's
 * meta card, which is where every other 2026 detail hero parks its facts.
 * Counts still come from the data via `buildAgencyListStats` — never
 * hardcoded.
 *
 * @param props - Component props.
 * @param props.category - The category being rendered.
 * @param props.stats - Agency/country/partner counts for the stat card.
 */
export default function CategoryHero({
  category,
  stats,
}: {
  category: DirectoryCategory;
  stats: AgencyListStats;
}) {
  try {
    const statEntries = buildStatEntries(stats);

    return (
      <section className={styles.hero} data-section="directory-category-hero">
        <div className={styles.inner}>
          <p className={styles.kicker}>{KICKER_TEXT}</p>
          <h1 className={styles.headline}>{category?.heading}</h1>
          {category?.subheading ? (
            <p className={styles.subhead}>{category.subheading}</p>
          ) : null}

          {statEntries.length > 0 ? (
            <div className={styles.metaCard}>
              {statEntries.map((entry, index) => (
                <Fragment key={entry.label}>
                  {index > 0 ? (
                    <span className={styles.metaDivider} aria-hidden="true" />
                  ) : null}
                  <CategoryStatItem value={entry.value} label={entry.label} />
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
