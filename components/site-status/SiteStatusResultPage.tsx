import type { StatusTarget } from "@/lib/site-status/target";
import { statusPathFor } from "@/lib/site-status/target";
import {
  describeDownReason,
  type SiteStatusResult,
} from "@/lib/site-status/check";
import SiteStatusForm from "./SiteStatusForm";
import styles from "./SiteStatus.module.css";

/** Superflow signup destination for the closing CTA. */
const SIGNUP_URL = "https://app.usesuperflow.com/signup";

/** Props for {@link SiteStatusResultPage}. */
interface SiteStatusResultPageProps {
  target: StatusTarget;
  result: SiteStatusResult;
}

/**
 * Result page for one website: a gradient hero naming the site, then a
 * status card with the verdict and the raw numbers behind it, a form to
 * check another site, and a Superflow CTA.
 */
export default function SiteStatusResultPage({
  target,
  result,
}: SiteStatusResultPageProps) {
  const isUp = result.status === "up";
  const selfPath = statusPathFor(target);

  return (
    <div className={styles.page}>
      <section className={styles.hero} data-section="site-status-hero">
        <div className={styles.heroFade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Website status checker</p>
          <h1 className={styles.headline}>
            Is <span className={styles.headlineHost}>{target.label}</span> down?
          </h1>
          <p className={styles.subhead}>
            We loaded this page from our servers when you opened it. Reload to
            run the check again.
          </p>
        </div>
      </section>

      <section className={styles.stage} data-section="site-status-result">
        <div className={styles.stageInner}>
          <div
            className={`${styles.card} ${isUp ? styles.cardUp : styles.cardDown}`}
            role="status"
            aria-live="polite"
          >
            <div className={styles.verdict}>
              <span className={styles.verdictDot} aria-hidden="true" />
              <p className={styles.verdictText}>
                {isUp ? "It's up" : "It's down"}
              </p>
            </div>
            <p className={styles.verdictDetail}>
              {isUp
                ? describeUp(result)
                : describeDownReason(result)}
            </p>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Checked URL</dt>
                <dd className={styles.factValue}>
                  <span className={styles.factMono}>{result.requestedUrl}</span>
                </dd>
              </div>
              {result.finalUrl && result.finalUrl !== result.requestedUrl ? (
                <div className={styles.fact}>
                  <dt className={styles.factLabel}>Redirected to</dt>
                  <dd className={styles.factValue}>
                    <span className={styles.factMono}>{result.finalUrl}</span>
                  </dd>
                </div>
              ) : null}
              <div className={styles.fact}>
                <dt className={styles.factLabel}>HTTP status</dt>
                <dd className={styles.factValue}>
                  {typeof result.httpStatus === "number"
                    ? `${result.httpStatus} ${statusText(result.httpStatus)}`.trim()
                    : "No response"}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Response time</dt>
                <dd className={styles.factValue}>
                  {typeof result.httpStatus === "number"
                    ? `${result.responseTimeMs.toLocaleString()} ms`
                    : "—"}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Checked at</dt>
                <dd className={styles.factValue}>
                  <time dateTime={result.checkedAt}>{formatCheckedAt(result.checkedAt)}</time>
                </dd>
              </div>
            </dl>

            <div className={styles.cardActions}>
              <a className={`${styles.btn} ${styles.btnFilled}`} href={selfPath}>
                Check again
              </a>
              <a
                className={`${styles.btn} ${styles.btnOutline}`}
                href={result.requestedUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Open {target.host}
              </a>
            </div>
          </div>

          <div className={styles.another}>
            <h2 className={styles.sectionTitle}>Check another website</h2>
            <SiteStatusForm size="compact" buttonLabel="Check" />
          </div>

          <div className={styles.pitch}>
            <h2 className={styles.sectionTitle}>Reviewing a live site with your team?</h2>
            <p className={styles.pitchBody}>
              Superflow lets you comment directly on any live website, so
              feedback lands on the exact element instead of in a screenshot
              thread.
            </p>
            <div className={styles.ctaButtons}>
              <a className={`${styles.btn} ${styles.btnOutline}`} href="/book-demo">
                Book a demo
              </a>
              <a className={`${styles.btn} ${styles.btnFilled}`} href={SIGNUP_URL}>
                Try Superflow for free
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function describeUp(result: SiteStatusResult): string {
  try {
    const code = result.httpStatus ?? 200;
    if (code >= 400) {
      return `The server is reachable but answered HTTP ${code} for this URL. The site is live; this page may need a sign-in or may not exist.`;
    }
    return `The site responded in ${result.responseTimeMs.toLocaleString()} ms.`;
  } catch {
    return "The site responded.";
  }
}

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function statusText(code: number): string {
  try {
    return STATUS_TEXT[code] ?? "";
  } catch {
    return "";
  }
}

/**
 * Render the check time in UTC so the server-rendered page reads the same
 * for every visitor and never depends on the viewer's locale.
 */
function formatCheckedAt(iso: string): string {
  try {
    const date = new Date(iso);
    const formatted = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }).format(date);
    return `${formatted} UTC`;
  } catch {
    return iso;
  }
}
