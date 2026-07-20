import Image from "next/image";
import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type {
  CaseStudySolutionRow,
  CaseStudySolutionsData,
} from "@/lib/case-study-data";
import styles from "./CaseStudySolutions.module.css";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "case-study-solutions-heading";

/**
 * One solution row: a mono accent kicker (number · tag), semibold title and
 * muted description alongside the doc's demo video/image on the 2026 card
 * frame. Rows alternate sides via the row's `reverse` flag, exactly like the
 * old dark section (and `components/use-case-2026/UseCaseSolutionSection`).
 *
 * @param props.row - The solution row's copy and media.
 */
function CaseStudySolutionRowItem({ row }: { row: CaseStudySolutionRow }) {
  try {
    const rowClassName = row?.reverse
      ? `${styles.row} ${styles.rowReversed}`
      : styles.row;
    const hasMedia = Boolean(row?.video || row?.image);

    return (
      <div className={rowClassName}>
        <div className={styles.rowCopy}>
          <span className={styles.rowKicker}>
            {row?.number}
            {row?.tag ? (
              <>
                <span className={styles.rowKickerDivider} aria-hidden="true" />
                {row.tag}
              </>
            ) : null}
          </span>
          {row?.title ? <h3 className={styles.rowTitle}>{row.title}</h3> : null}
          {row?.description ? (
            <p className={styles.rowDescription}>{row.description}</p>
          ) : null}
        </div>
        {hasMedia ? (
          <div className={styles.rowMedia}>
            {row?.video ? (
              <video
                className={styles.rowVideo}
                src={row.video}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : row?.image ? (
              <Image
                className={styles.rowImage}
                src={row.image}
                alt={row?.title ?? ""}
                fill
                sizes="(min-width: 860px) 50vw, 100vw"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-styled "solution" section: a serif ink heading over alternating
 * media/copy rows showing how the customer uses Superflow. Replaces the old
 * dark `components/case-study/CaseStudySolutions` composition.
 *
 * @param props - The doc's solution copy and rows (same shape the old dark
 *   section consumed).
 */
export default function CaseStudySolutions(props: CaseStudySolutionsData) {
  try {
    const rows = props?.rows ?? [];
    if (rows.length === 0 && !props?.heading && !props?.subtitle) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="case-study-solutions"
        aria-labelledby={props?.heading ? HEADING_ID : undefined}
      >
        <div className={styles.inner}>
          <CaseStudySectionHeading
            heading={props?.heading}
            subtitle={props?.subtitle}
            headingId={HEADING_ID}
          />
          {rows.length > 0 ? (
            <div className={styles.rows}>
              {rows.map((row) => (
                <CaseStudySolutionRowItem key={row?.number} row={row} />
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
