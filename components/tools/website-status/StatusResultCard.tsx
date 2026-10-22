// The result of one status check: the verdict, then the facts behind it.
//
// No hooks and no browser APIs, so the same card renders inside the client
// tool after a run AND server-side on the shareable status page, where the
// check has already happened before any JavaScript loads.

import {
  describeReport,
  labelForUrl,
  type SiteStatusReport,
} from "@/lib/tools/website-status/shared";
import styles from "./WebsiteStatus.module.css";

/** Reason phrases for the common HTTP statuses, so a number reads as words. */
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

/**
 * The check time in UTC, so the server-rendered page reads the same for every
 * visitor and never depends on the viewer's locale.
 *
 * @param iso - An ISO 8601 timestamp.
 */
function formatCheckedAt(iso: string): string {
  try {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }).format(new Date(iso));
    return `${formatted} UTC`;
  } catch {
    return iso;
  }
}

export function StatusResultCard({
  report,
  actions,
}: {
  report: SiteStatusReport;
  /** Buttons rendered under the facts: check again, open the site, copy the link. */
  actions?: React.ReactNode;
}) {
  try {
    const isUp = report.verdict === "up";
    const label = labelForUrl(report.requestedUrl);
    const redirected = report.finalUrl !== report.requestedUrl;

    return (
      <div className={styles.result}>
        <div
          className={`${styles.verdict} ${isUp ? styles.verdictUp : styles.verdictDown}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.verdictDot} aria-hidden="true" />
          <div className={styles.verdictText}>
            <h2 className={styles.verdictHeading}>
              {isUp ? `${label} is up` : `${label} is down`}
            </h2>
            <p className={styles.verdictBody}>{describeReport(report)}</p>
          </div>
        </div>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Checked URL</dt>
            <dd className={`${styles.factValue} ${styles.factCode}`}>{report.requestedUrl}</dd>
          </div>
          {redirected ? (
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Redirected to</dt>
              <dd className={`${styles.factValue} ${styles.factCode}`}>{report.finalUrl}</dd>
            </div>
          ) : null}
          <div className={styles.fact}>
            <dt className={styles.factLabel}>HTTP status</dt>
            <dd className={styles.factValue}>
              {typeof report.httpStatus === "number"
                ? `${report.httpStatus} ${STATUS_TEXT[report.httpStatus] ?? ""}`.trim()
                : "No response"}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Response time</dt>
            <dd className={styles.factValue}>
              {typeof report.httpStatus === "number"
                ? `${report.responseTimeMs.toLocaleString("en-US")} ms`
                : "No response"}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Checked at</dt>
            <dd className={styles.factValue}>
              <time dateTime={report.checkedAt}>{formatCheckedAt(report.checkedAt)}</time>
            </dd>
          </div>
        </dl>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    );
  } catch {
    return null;
  }
}
