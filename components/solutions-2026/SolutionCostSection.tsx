import Link from "next/link";
import type { ReactNode } from "react";
import { buildCostLines } from "@/lib/solutions/cost-lines";
import styles from "./SolutionCostSection.module.css";

const HEADING_ID = "solution-cost-heading";
const HEADING = "Priced per site scan, not per seat.";
const PRICING_LABEL = "See pricing";
const PRICING_HREF = "/pricing";

/** Props for {@link SolutionCostSection}. */
export interface SolutionCostSectionProps {
  /**
   * Optional per-page templates for the three lines (the page's `cost`
   * field). Tokens in braces are filled from the pricing data.
   */
  cost?: readonly string[] | null;
}

/**
 * S7, what it costs: the heading, three lines built from the pricing source
 * of truth, and a link to the pricing page. Numbers are never typed here.
 *
 * @param props - The page's optional line templates.
 * @returns The section, or null when no line resolves.
 */
export default function SolutionCostSection({
  cost,
}: SolutionCostSectionProps): ReactNode {
  const lines = buildCostLines(cost);
  if (lines.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.section}
      data-section="solution-cost"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <h2 id={HEADING_ID} className={styles.heading}>
          {HEADING}
        </h2>
        <ul className={styles.lines}>
          {lines.map((line, index) => (
            <li key={`cost-${index}`} className={styles.line}>
              {line}
            </li>
          ))}
        </ul>
        <Link className={styles.link} href={PRICING_HREF}>
          {PRICING_LABEL}
        </Link>
      </div>
    </section>
  );
}
