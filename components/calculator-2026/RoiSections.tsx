// ROI explainer sections for /calculator, in the 2026 light idiom
// (#fbfbfd cards, #ececf1 hairline, 20px radius, serif headings, single
// #433df3 accent). Server components: content is static.
//
// Three sections, composed under the CostSection calculator:
//   RoiHowItWorks - the four steps behind the calculator's math
//   RoiOutputs    - what each of the three result numbers means
//   RoiCost       - the scan-priced AI-credits cost set against the recovery

import styles from "./RoiSections.module.css";

/** The calculator's math, one step per card, in calculation order. */
const HOW_STEPS = [
  {
    title: "Count the review hours",
    description:
      "Assets per month times QA minutes per asset. That is the time your team already spends checking work before a client sees it.",
  },
  {
    title: "Agents take the first pass",
    description:
      "Superflow's AI agents run your checklist on every change and take roughly 70% of that manual pass: links, spelling, brand, layout, desktop and mobile.",
  },
  {
    title: "Hours become billings",
    description:
      "Every hour handed back times your hourly billing rate. Reviewers go back to billable work instead of first-pass QA.",
  },
  {
    title: "Multiply by twelve",
    description:
      "The headline number is yearly: what slow reviews were silently costing across every client, every month.",
  },
];

/** The calculator's three outputs, in display order. */
const OUTPUTS = [
  {
    value: "Hours back / mo",
    description:
      "Review time your team stops spending on the first pass. It shows up as capacity the same week.",
  },
  {
    value: "Reviewers' worth",
    description:
      "Those hours as full-time reviewer equivalents, at 160 working hours per month. Headcount you do not have to hire.",
  },
  {
    value: "Billings recovered / yr",
    description:
      "The bottom line: hours back times your billing rate, times twelve. This is the number to put next to the invoice.",
  },
];

/** The cost side of the ROI story, grounded in the public rate card. */
const COST_POINTS = [
  "One credit is $0.40, and a scan checks the whole site with every agent: 5 credits for a small site, 10 for a medium one. No per-agent multiplier, no token math, and the cost shows before every run.",
  "Rescans are 1 credit at any size, because only the changed pages get reviewed. A typical project is one scan plus four rescans: 14 credits, about $5.60.",
  "Every plan includes monthly credits, every new workspace starts with a one-time bonus of 30 credits (your first full scan, free), and one-time packs start at $10 and roll over month to month.",
];

/**
 * "How the math works" - the calculator's formula as four numbered step
 * cards, so the headline figure above is checkable rather than magic.
 */
export function RoiHowItWorks() {
  return (
    <section className={styles.section} data-section="roi-how">
      <div className={styles.inner}>
        <h2 className={styles.heading}>How the math works</h2>
        <p className={styles.subheading}>
          The calculator only multiplies numbers you already know. Here is
          the whole formula, step by step.
        </p>
        <ol className={styles.stepGrid}>
          {HOW_STEPS.map((step, stepIndex) => (
            <li key={step.title} className={styles.stepCard}>
              <span className={styles.stepNumber}>
                {String(stepIndex + 1).padStart(2, "0")}
              </span>
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.stepDescription}>{step.description}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * "Three numbers that matter" - what each calculator output means, so
 * the reader can translate the result into capacity, headcount, and
 * revenue terms.
 */
export function RoiOutputs() {
  return (
    <section className={styles.section} data-section="roi-outputs">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Three numbers that matter</h2>
        <div className={styles.outputGrid}>
          {OUTPUTS.map((output) => (
            <div key={output.value} className={styles.outputCard}>
              <span className={styles.outputValue}>{output.value}</span>
              <span className={styles.outputDescription}>
                {output.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * "Set that against what it costs" - the flat AI-credits pricing next to
 * the recovery, closing the ROI argument with the public rate card.
 */
export function RoiCost() {
  return (
    <section className={styles.section} data-section="roi-cost">
      <div className={styles.inner}>
        <div className={styles.costCard}>
          <div className={styles.costIntro}>
            <h2 className={styles.costHeading}>
              Set that against what it costs
            </h2>
            <p className={styles.costLede}>
              Superflow is priced per seat, guests are free, and the AI is
              metered in credits priced per scan. A busy agency spends tens
              of dollars a month on credits while the calculator above shows
              five or six figures recovered per year.
            </p>
          </div>
          <ul className={styles.costPoints}>
            {COST_POINTS.map((point) => (
              <li key={point} className={styles.costPoint}>
                <svg
                  className={styles.costCheck}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <a className={styles.costCta} href="/pricing">
            See the full pricing breakdown
          </a>
        </div>
      </div>
    </section>
  );
}
