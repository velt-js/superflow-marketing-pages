import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type {
  CaseStudyResultMetric,
  CaseStudyResultsData,
} from "@/lib/case-study-data";
import styles from "./CaseStudyResults.module.css";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "case-study-results-heading";

/**
 * One result metric card: a big Adamina serif accent value over a semibold
 * ink label, on a white 2026 card. The old size/tone fields (large tile +
 * gradient numbers) are intentionally ignored — the light idiom renders all
 * metrics as equal accent-number cards.
 *
 * @param props.metric - The metric's value and label.
 */
function CaseStudyResultCard({ metric }: { metric: CaseStudyResultMetric }) {
  try {
    return (
      <li className={styles.card}>
        <span className={styles.cardValue}>{metric?.value}</span>
        {metric?.label ? (
          <p className={styles.cardLabel}>{metric.label}</p>
        ) : null}
      </li>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-styled "results" section: a serif ink heading over light stat cards
 * with big serif accent numbers. Replaces the old gradient-number
 * `components/case-study/CaseStudyResults` composition.
 *
 * @param props - The doc's results copy and metrics (same shape the old dark
 *   section consumed).
 */
export default function CaseStudyResults(props: CaseStudyResultsData) {
  try {
    const metrics = props?.metrics ?? [];
    if (metrics.length === 0 && !props?.heading && !props?.subtitle) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="case-study-results"
        aria-labelledby={props?.heading ? HEADING_ID : undefined}
      >
        <div className={styles.inner}>
          <CaseStudySectionHeading
            heading={props?.heading}
            subtitle={props?.subtitle}
            headingId={HEADING_ID}
          />
          {metrics.length > 0 ? (
            <ul className={styles.grid}>
              {metrics.map((metric) => (
                <CaseStudyResultCard
                  key={metric?.label ?? metric?.value}
                  metric={metric}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
