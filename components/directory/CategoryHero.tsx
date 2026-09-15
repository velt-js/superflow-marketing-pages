import { Fragment } from "react";
import Link from "next/link";

import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import type { CategoryStats } from "@/lib/directory/listing";
import type { DirectoryCategory } from "@/lib/directory/types";
import styles from "./DirectoryHero.module.css";

/** Mono kicker above the H1, orienting a visitor inside /directory
 *  before they read the category-specific heading. */
const KICKER_TEXT = "Agency directory";

/** The category page's primary action.
 *
 *  It replaced "Try Superflow for Free" here and in the hub hero. A
 *  visitor on a page of sixty agencies is choosing an agency; offering
 *  them our product instead is answering a question they did not ask, and
 *  it converted accordingly. The trial CTA still closes the page - see
 *  the block at the bottom of app/directory/[category]/page.tsx. */
const MATCH_CTA_LABEL = "Get matched";

/** Secondary action, pointing at the filtered view a founder most often
 *  wants and would otherwise have to discover in the filter bar. */
const YC_CTA_LABEL = "Agencies with a YC offer";

/** One `{ value, label }` pair in the hero's stat card. */
interface CategoryStat {
  value: number;
  label: string;
}

/**
 * Builds the hero stat card's entries from live counts, dropping any that
 * are zero so a small dataset shows two facts rather than three, one of
 * which reads "0".
 *
 * The partner count that used to sit here is gone, replaced by the two
 * figures a founder is scanning for. Partner status is about the agency's
 * relationship with us; these are about what the listing will tell them.
 *
 * @param stats - Counts derived from the data.
 * @returns The stat entries to render, in display order.
 */
function buildStatEntries(stats: CategoryStats): CategoryStat[] {
  try {
    const entries: CategoryStat[] = [
      {
        value: stats?.agencyCount ?? 0,
        label: stats?.agencyCount === 1 ? "Agency" : "Agencies",
      },
      {
        value: stats?.verifiedCount ?? 0,
        label: stats?.verifiedCount === 1 ? "Verified listing" : "Verified listings",
      },
      { value: stats?.ycOfferCount ?? 0, label: "With a YC offer" },
      {
        value: stats?.countryCount ?? 0,
        label: stats?.countryCount === 1 ? "Country" : "Countries",
      },
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
        <span className={`${styles.metaValue} ${styles.metaValueStat}`}>{value}</span>
        <span className={styles.metaLabel}>{label}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Header for a directory category page, on the 2026 design system: the
 * shared blue-gradient bitmap and white serif headline used by the
 * homepage and /case-study, a primary "Get matched" action, and a white
 * stat card riding the fade into the agency grid below.
 *
 * The stat row keeps its old job - it is the one thing on the page that
 * proves the directory is real and populated - but now counts what a
 * founder cares about. Counts always come from the data via
 * `buildCategoryStats`, never hardcoded.
 *
 * @param props - Component props.
 * @param props.category - The category being rendered.
 * @param props.stats - Counts for the stat card.
 */
export default function CategoryHero({
  category,
  stats,
}: {
  category: DirectoryCategory;
  stats: CategoryStats;
}) {
  try {
    const statEntries = buildStatEntries(stats);
    const categoryPath = `${DIRECTORY_BASE_PATH}/${category?.slug ?? ""}`;

    return (
      <section className={styles.hero} data-section="directory-category-hero">
        <div className={styles.inner}>
          <p className={styles.kicker}>{KICKER_TEXT}</p>
          <h1 className={styles.headline}>{category?.heading}</h1>
          {category?.subheading ? (
            <p className={styles.subhead}>{category.subheading}</p>
          ) : null}

          <div className={styles.actions}>
            <Link
              href={`${DIRECTORY_BASE_PATH}/match?category=${category?.slug ?? ""}`}
              className={styles.cta}
            >
              {MATCH_CTA_LABEL}
            </Link>
            {/* Only offered when the category actually has one. A link to
                a filter that returns nothing is worse than no link. */}
            {(stats?.ycOfferCount ?? 0) > 0 ? (
              <Link href={`${categoryPath}?yc_offer=1`} className={styles.secondaryCta}>
                {YC_CTA_LABEL}
              </Link>
            ) : null}
          </div>

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
