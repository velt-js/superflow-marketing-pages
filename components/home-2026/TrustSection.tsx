import type { ReactElement } from "react";
import styles from "./TrustSection.module.css";

const SECTION_HEADING = "AI-first, with a human on every decision.";
const HEADING_ID = "trust-section-heading";

const PRIMARY_CTA_LABEL = "Book Demo";
const PRIMARY_CTA_HREF = "/book-demo";
const SECONDARY_CTA_LABEL = "View Trust Center";
const SECONDARY_CTA_HREF = "/security";

/** A single trust pillar, driving one bordered card. */
interface TrustPillar {
  id: string;
  title: string;
  description: string;
  /** Per-card accent applied to the icon stroke (see TrustSection.module.css). */
  iconClassName: string;
  icon: ReactElement;
}

// Copy, icon vectors (Tabler) and accent colors mirror Figma node 605:7176.
const PILLARS: TrustPillar[] = [
  {
    id: "human-in-the-loop",
    title: "Human in the Loop",
    description:
      "AI does the first pass; a person or the client signs off on every asset. Confidence floors hide low-certainty findings, and any finding can be overridden.",
    iconClassName: styles.iconRepeat,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
        <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
      </svg>
    ),
  },
  {
    id: "white-label",
    title: "White-label",
    description:
      "Your logo on the review toolbar your clients see and the admin panel your team runs. One upload, every project.",
    iconClassName: styles.iconTag,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
      </svg>
    ),
  },
  {
    id: "compliance",
    title: "Compliance and evidence",
    description:
      "SOC 2 Type II, HIPAA with BAA, data residency options, WCAG 2.1 AA on client-facing surfaces, plus the audit trail of every comment, finding, and approval.",
    iconClassName: styles.iconShield,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
      </svg>
    ),
  },
  {
    id: "access-identity",
    title: "Access and identity",
    description:
      "Roles for Admin, Member, and Guest, per-project access, unlimited guest seats, SSO and SCIM on Enterprise.",
    iconClassName: styles.iconLock,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
        <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
        <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
      </svg>
    ),
  },
];

/**
 * Trust — "AI-first, with a human on every decision." A serif headline over
 * four bordered trust-pillar cards (human-in-the-loop, white-label,
 * compliance, access) and a pair of CTA links. Copy, colors and icon vectors
 * mirror Figma node 605:7176; the layout is built with grid/flex.
 */
export default function TrustSection() {
  return (
    <section
      className={styles.section}
      data-section="trust"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <h2 id={HEADING_ID} className={styles.heading}>
          {SECTION_HEADING}
        </h2>

        <ul className={styles.cards}>
          {PILLARS.map((pillar) => (
            <li key={pillar.id} className={styles.card}>
              <span className={`${styles.icon} ${pillar.iconClassName}`}>
                {pillar.icon}
              </span>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{pillar.title}</h3>
                <p className={styles.cardDesc}>{pillar.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a className={`${styles.button} ${styles.buttonPrimary}`} href={PRIMARY_CTA_HREF}>
            {PRIMARY_CTA_LABEL}
          </a>
          <a className={`${styles.button} ${styles.buttonSecondary}`} href={SECONDARY_CTA_HREF}>
            {SECONDARY_CTA_LABEL}
          </a>
        </div>
      </div>
    </section>
  );
}
