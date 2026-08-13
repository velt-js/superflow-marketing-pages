import Link from "next/link";
import styles from "./BugBookCta.module.css";

const HEADLINE = "Your website has bugs like these.";
const SUBHEAD = "Your users are finding them right now.";
const PRIMARY_LABEL = "Try Superflow free";
const PRIMARY_HREF = "https://app.usesuperflow.com/signup";
const SECONDARY_LABEL = "Meet the review agents";
const SECONDARY_HREF = "/ai-review-agents";

/** Footer CTA band — shared by the collection page and every detail page. */
export default function BugBookCta() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.headline}>
          {HEADLINE}
          <br />
          <span className={styles.headlineMuted}>{SUBHEAD}</span>
        </h2>
        <div className={styles.actions}>
          <a href={PRIMARY_HREF} className={styles.primary}>
            {PRIMARY_LABEL}
          </a>
          <Link href={SECONDARY_HREF} className={styles.secondary}>
            {SECONDARY_LABEL}
          </Link>
        </div>
      </div>
    </section>
  );
}
