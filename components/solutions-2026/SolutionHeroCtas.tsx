import Link from "next/link";
import type { ReactNode } from "react";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./SolutionHeroCtas.module.css";

/** Hero CTA pair (spec S1): the same two actions as the home page. */
const START_LABEL = "Start free";
const DEMO_LABEL = "Book demo";
const DEMO_HREF = "/book-demo";

/**
 * The two hero CTAs a solutions page shows in place of the home page's URL
 * field: "Start free" (app signup, off-site) and "Book demo". Rendered by
 * {@link Hero} when `variant="solution"`.
 *
 * @returns The CTA row.
 */
export default function SolutionHeroCtas(): ReactNode {
  return (
    <div className={styles.row}>
      <a
        className={`${styles.button} ${styles.buttonPrimary}`}
        href={SIGNUP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {START_LABEL}
      </a>
      <Link
        className={`${styles.button} ${styles.buttonSecondary}`}
        href={DEMO_HREF}
      >
        {DEMO_LABEL}
      </Link>
    </div>
  );
}
