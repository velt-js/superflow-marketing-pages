import styles from "./DirectoryTrialCta.module.css";

/** Where the trial CTA points. Same destination as every other
 *  "Try Superflow" on the site. */
const SIGNUP_URL = "https://app.usesuperflow.com/signup";

const HEADING = "Working with an agency?";
const BODY =
  "Superflow is how agencies and their clients review work: comments pinned straight onto the live site, no screenshots, no spreadsheet of feedback.";
const CTA_LABEL = "Try Superflow for free";

/**
 * The Superflow trial block, at the BOTTOM of the directory pages.
 *
 * It used to be the primary CTA in both heroes. It is not any more, and
 * the demotion is the point: somebody on a page of sixty agencies is
 * choosing an agency, and putting our signup in front of that is
 * answering a question they did not ask. Down here it reaches the same
 * visitor after they have what they came for, when "who reviews the work
 * once you have picked someone" is a question they might actually have.
 *
 * Deliberately NOT the testimonials section, which is social proof about
 * agencies using Superflow and reads as an endorsement of the listed
 * agencies when it sits under a directory of them.
 */
export default function DirectoryTrialCta() {
  try {
    return (
      <section className={styles.section} data-section="directory-trial-cta">
        <div className={styles.inner}>
          <h2 className={styles.heading}>{HEADING}</h2>
          <p className={styles.body}>{BODY}</p>
          <a className={styles.cta} href={SIGNUP_URL}>
            {CTA_LABEL}
          </a>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
