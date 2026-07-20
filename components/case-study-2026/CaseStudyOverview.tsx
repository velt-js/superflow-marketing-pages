import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type { CaseStudyProblemSolutionData } from "@/lib/case-study-data";
import styles from "./CaseStudyOverview.module.css";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "case-study-overview-heading";

/**
 * Tabler `circle-x` stroke glyph (24 × 24, stroke 2, round caps) marking the
 * problem card — a colourful stroke icon per the 2026 icon rules, replacing
 * the old filled red circle.
 */
function CaseStudyOverviewProblemIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M10 10l4 4m0 -4l-4 4" />
    </svg>
  );
}

/**
 * Tabler `circle-check` stroke glyph (24 × 24, stroke 2, round caps) marking
 * the solution card.
 */
function CaseStudyOverviewSolutionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </svg>
  );
}

/**
 * One overview card ("Problem" or "Solution"): a colourful stroke glyph and
 * semibold title over the doc's copy, on the shared light card idiom.
 *
 * @param props.tone - Which of the pair this card is; drives icon + colour.
 * @param props.title - Card title ("Problem" / "Solution").
 * @param props.body - The doc's overview copy for this side.
 */
function CaseStudyOverviewCard({
  tone,
  title,
  body,
}: {
  tone: "problem" | "solution";
  title: string;
  body: string;
}) {
  try {
    const isProblem = tone === "problem";
    const iconClassName = isProblem
      ? `${styles.cardIcon} ${styles.cardIconProblem}`
      : `${styles.cardIcon} ${styles.cardIconSolution}`;

    return (
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={iconClassName} aria-hidden="true">
            {isProblem ? (
              <CaseStudyOverviewProblemIcon />
            ) : (
              <CaseStudyOverviewSolutionIcon />
            )}
          </span>
          <h3 className={styles.cardTitle}>{title}</h3>
        </div>
        <p className={styles.cardBody}>{body}</p>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-styled "problem & solution" overview: a serif ink section heading over
 * a light problem/solution card pair. Replaces the old tinted red/green
 * `components/case-study/CaseStudyProblemSolution` composition.
 *
 * @param props - The doc's problem/solution overview copy (same shape the
 *   old dark section consumed).
 */
export default function CaseStudyOverview(
  props: CaseStudyProblemSolutionData,
) {
  try {
    const hasCards = Boolean(props?.problem || props?.solution);
    if (!hasCards && !props?.heading && !props?.subtitle) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="case-study-overview"
        aria-labelledby={props?.heading ? HEADING_ID : undefined}
      >
        <div className={styles.inner}>
          <CaseStudySectionHeading
            heading={props?.heading}
            subtitle={props?.subtitle}
            headingId={HEADING_ID}
          />
          {hasCards ? (
            <div className={styles.cards}>
              {props?.problem ? (
                <CaseStudyOverviewCard
                  tone="problem"
                  title="Problem"
                  body={props.problem}
                />
              ) : null}
              {props?.solution ? (
                <CaseStudyOverviewCard
                  tone="solution"
                  title="Solution"
                  body={props.solution}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
