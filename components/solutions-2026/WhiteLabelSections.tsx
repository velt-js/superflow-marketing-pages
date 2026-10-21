import type { ReactNode } from "react";
import {
  BENEFITS,
  BENEFITS_HEADING,
  NEVER_SEE,
  NEVER_SEE_HEADING,
  SAMPLE_AGENCY,
  SAMPLE_CLIENT,
  SAMPLE_DOMAIN,
  type WhiteLabelBenefit,
} from "./white-label-content";
import styles from "./WhiteLabelSections.module.css";

// Sections only the white-label page needs: the "What you get" grid, each
// card topped with a small drawing of the thing it names, and the short
// "What clients never see" band. Everything else on the page is shared.

const BENEFITS_HEADING_ID = "white-label-benefits-heading";
const NEVER_SEE_HEADING_ID = "white-label-never-see-heading";

function Mark(): ReactNode {
  return (
    <span className={styles.mark} aria-hidden="true">
      {SAMPLE_AGENCY.charAt(0)}
    </span>
  );
}

/** The small drawing on top of a benefit card. */
function BenefitVisual({ id }: { id: WhiteLabelBenefit["id"] }): ReactNode {
  switch (id) {
    case "toolbar":
      return (
        <div className={styles.visualToolbar} aria-hidden="true">
          <Mark />
          <span className={styles.visualName}>{SAMPLE_AGENCY}</span>
          <span className={styles.visualApprove}>Approve</span>
        </div>
      );
    case "portal":
      return (
        <div className={styles.visualPortal} aria-hidden="true">
          <div className={styles.visualPortalHead}>
            <Mark />
            <span className={styles.visualName}>{SAMPLE_AGENCY}</span>
          </div>
          <span className={styles.visualRowActive} />
          <span className={styles.visualRow} />
          <span className={styles.visualRow} />
        </div>
      );
    case "report":
      return (
        <div className={styles.visualReport} aria-hidden="true">
          <div className={styles.visualPortalHead}>
            <Mark />
            <span className={styles.visualName}>{SAMPLE_CLIENT}</span>
          </div>
          <span className={styles.visualScore}>96</span>
        </div>
      );
    case "domain":
    default:
      return (
        <div className={styles.visualDomain} aria-hidden="true">
          <span className={styles.visualLock} />
          <span className={styles.visualUrl}>{SAMPLE_DOMAIN}</span>
        </div>
      );
  }
}

export function WhiteLabelBenefitsSection(): ReactNode {
  return (
    <section
      className={styles.section}
      data-section="white-label-benefits"
      aria-labelledby={BENEFITS_HEADING_ID}
    >
      <div className={styles.inner}>
        <h2 id={BENEFITS_HEADING_ID} className={styles.heading}>
          {BENEFITS_HEADING}
        </h2>
        <ul className={styles.grid}>
          {BENEFITS.map((benefit) => (
            <li key={benefit.id} className={styles.card}>
              <div className={styles.visual}>
                <BenefitVisual id={benefit.id} />
              </div>
              <h3 className={styles.cardTitle}>{benefit.title}</h3>
              <p className={styles.cardLine}>{benefit.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WhiteLabelNeverSeeSection(): ReactNode {
  return (
    <section
      className={styles.band}
      data-section="white-label-never-see"
      aria-labelledby={NEVER_SEE_HEADING_ID}
    >
      <div className={styles.bandInner}>
        <h2 id={NEVER_SEE_HEADING_ID} className={styles.bandHeading}>
          {NEVER_SEE_HEADING}
        </h2>
        <ul className={styles.bandList}>
          {NEVER_SEE.map((item) => (
            <li key={item} className={styles.bandItem}>
              <span className={styles.bandCross} aria-hidden="true">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
