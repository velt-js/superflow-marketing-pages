import type { ReactNode } from "react";
import {
  SAMPLE_AGENCY,
  SAMPLE_CLIENT,
  SAMPLE_DOMAIN,
} from "@/components/solutions-2026/white-label-content";
import styles from "./WhiteLabelArtifact.module.css";

// Hero visual for /solutions/white-label-agencies: the client's site open on
// the agency's own domain, the review toolbar carrying the agency's logo and
// color, one pinned finding under the agency's name, and the branded report
// card beside it. Nothing on it says Superflow.

const TOOLBAR_ACTIONS: readonly string[] = ["Comment", "Record"];
const APPROVE_LABEL = "Approve";
const OPEN_LABEL = "3 open";
const FINDING_AGENT = "Link Checker";
const FINDING_TEXT = "Footer 'Careers' link returns 404.";
const REPORT_LABEL = "Monthly report";
const REPORT_SCORE = "96";
const REPORT_DELTA = "+4 since last month";
const PORTAL_ITEMS: readonly string[] = ["Projects", "Agents", "Approvals", "Reports"];

/** The agency's initial, drawn as its logo mark. */
function AgencyMark({ className }: { className?: string }): ReactNode {
  return (
    <span className={className ? `${styles.mark} ${className}` : styles.mark} aria-hidden="true">
      {SAMPLE_AGENCY.charAt(0)}
    </span>
  );
}

export default function WhiteLabelArtifact(): ReactNode {
  return (
    <div className={styles.stage} aria-label={`${SAMPLE_AGENCY} review toolbar on ${SAMPLE_DOMAIN}`}>
      <div className={styles.browser}>
        <div className={styles.chrome}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.url}>
            <span className={styles.lock} aria-hidden="true" />
            {SAMPLE_DOMAIN}
            <span className={styles.urlPath}>/{SAMPLE_CLIENT.toLowerCase().replace(/\s+/g, "-")}</span>
          </span>
        </div>

        <div className={styles.page} aria-hidden="true">
          <div className={styles.pageNav}>
            <span className={styles.pageLogo} />
            <span className={styles.pageLinks}>
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className={styles.pageHero}>
            <span className={styles.pageTitle} />
            <span className={styles.pageLine} />
            <span className={styles.pageLineShort} />
            <span className={styles.pageButton} />
          </div>
          <div className={styles.pageCards}>
            <span />
            <span />
            <span />
          </div>

          <div className={styles.pin}>
            <span className={styles.pinDot} />
            <div className={styles.pinCard}>
              <div className={styles.pinHead}>
                <AgencyMark className={styles.markSmall} />
                <span className={styles.pinAgent}>{FINDING_AGENT}</span>
              </div>
              <p className={styles.pinText}>{FINDING_TEXT}</p>
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <span className={styles.toolbarBrand}>
            <AgencyMark />
            <span className={styles.toolbarName}>{SAMPLE_AGENCY}</span>
          </span>
          <span className={styles.toolbarOpen}>{OPEN_LABEL}</span>
          <span className={styles.toolbarActions}>
            {TOOLBAR_ACTIONS.map((label) => (
              <span key={label} className={styles.toolbarAction}>
                {label}
              </span>
            ))}
            <span className={styles.toolbarApprove}>{APPROVE_LABEL}</span>
          </span>
        </div>
      </div>

      <div className={styles.report} aria-hidden="true">
        <div className={styles.reportHead}>
          <AgencyMark className={styles.markSmall} />
          <span className={styles.reportLabel}>{REPORT_LABEL}</span>
        </div>
        <p className={styles.reportClient}>{SAMPLE_CLIENT}</p>
        <div className={styles.reportScoreRow}>
          <span className={styles.reportScore}>{REPORT_SCORE}</span>
          <span className={styles.reportDelta}>{REPORT_DELTA}</span>
        </div>
      </div>

      <div className={styles.portal} aria-hidden="true">
        <div className={styles.portalHead}>
          <AgencyMark className={styles.markSmall} />
          <span className={styles.portalName}>{SAMPLE_AGENCY}</span>
        </div>
        <ul className={styles.portalList}>
          {PORTAL_ITEMS.map((item, index) => (
            <li key={item} className={index === 0 ? styles.portalItemActive : styles.portalItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
