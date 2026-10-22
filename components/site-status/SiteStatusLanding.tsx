import SiteStatusForm from "./SiteStatusForm";
import styles from "./SiteStatus.module.css";

/** Copy for the three "how it works" tiles on the landing page. */
const STEPS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Enter any address",
    body: "A bare domain or a full URL with a path. We check the exact page you give us.",
  },
  {
    title: "We request it live",
    body: "Our server loads the page the moment you land on the status page. No cached answers.",
  },
  {
    title: "Get a clear answer",
    body: "Up or down, with the HTTP status, response time, and the time of the check.",
  },
];

/**
 * Landing page for the website status checker: a gradient hero with the
 * URL form, followed by a short explainer. Mirrors the calculator layout so
 * the two tools feel like one set.
 */
export default function SiteStatusLanding() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} data-section="site-status-hero">
        <div className={styles.heroFade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Website status checker</p>
          <h1 className={styles.headline}>Is that website down, or is it just you?</h1>
          <p className={styles.subhead}>
            Enter a URL and we will load it from our servers right now and tell
            you whether it is up.
          </p>
          <SiteStatusForm />
        </div>
      </section>

      <section className={styles.stage} data-section="site-status-how">
        <div className={styles.stageInner}>
          <h2 className={styles.sectionTitle}>How the check works</h2>
          <ul className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            A site counts as up when it answers with any HTTP status below 500.
            A 5xx response, a timeout, or a failed connection counts as down.
            One check from one location is a snapshot, not a monitor.
          </p>
        </div>
      </section>
    </div>
  );
}
