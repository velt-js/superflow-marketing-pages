import Image from "next/image";
import type { ReactElement } from "react";
import styles from "./GetStarted.module.css";

const SECTION_HEADING = "Get Started in a minute";
const SECTION_SUBHEADING = "Install, review and approve";
const PLATFORMS_NOTE = "Website plugins to install Superflow in 30 seconds";
const HEADING_ID = "get-started-heading";

/** Base path for the assets exported from Figma node 582:5284. */
const ASSET_BASE = "/images/home-2026/get-started";

/** A single step in the "Get Started" flow, driving one card. */
interface GetStartedStep {
  id: string;
  title: string;
  description: string;
  iconClassName: string;
  icon: ReactElement;
  /** Product-UI illustration exported from Figma (full card; cropped to the media strip). */
  media: string;
}

const STEPS: GetStartedStep[] = [
  {
    id: "install",
    title: "Install Superflow",
    description: "One-click install for websites or just upload an asset.",
    iconClassName: styles.stepIconInstall,
    media: `${ASSET_BASE}/card-install.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
        <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
      </svg>
    ),
  },
  {
    id: "review",
    title: "AI & Humans Review",
    description: "Invite your team and your client. No account needed on their end.",
    iconClassName: styles.stepIconReview,
    media: `${ASSET_BASE}/card-review.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
        <path d="M12 12l0 .01" />
        <path d="M8 12l0 .01" />
        <path d="M16 12l0 .01" />
      </svg>
    ),
  },
  {
    id: "ship",
    title: "Sign Off & Ship",
    description: "Superflow records the decision and memory learns for next time.",
    iconClassName: styles.stepIconShip,
    media: `${ASSET_BASE}/card-ship.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 12l5 5l10 -10" />
        <path d="M2 12l5 5m5 -5l1.5 -1.5" />
      </svg>
    ),
  },
];

/** A supported website-platform logo shown in the footer pill strip. */
interface PlatformLogo {
  id: string;
  /** Accessible name; empty for the unbranded marks so they stay decorative. */
  name: string;
  src: string;
}

// Logos exported from Figma node 582:5427 in their on-canvas order. The last
// three marks are unbranded in the design, so they render decoratively (the
// strip carries a group label). Names are best-effort and kept for alt text.
const PLATFORMS: PlatformLogo[] = [
  { id: "drupal", name: "Drupal", src: `${ASSET_BASE}/platform-drupal.png` },
  { id: "framer", name: "Framer", src: `${ASSET_BASE}/platform-framer.png` },
  { id: "hubspot", name: "HubSpot", src: `${ASSET_BASE}/platform-hubspot.png` },
  { id: "shopify", name: "Shopify", src: `${ASSET_BASE}/platform-shopify.png` },
  { id: "bubble", name: "Bubble", src: `${ASSET_BASE}/platform-bubble.png` },
  { id: "webflow", name: "Webflow", src: `${ASSET_BASE}/platform-webflow.png` },
  { id: "wix", name: "Wix", src: `${ASSET_BASE}/platform-wix.png` },
  { id: "wordpress", name: "WordPress", src: `${ASSET_BASE}/platform-wordpress.png` },
  { id: "elementor", name: "Elementor", src: `${ASSET_BASE}/platform-elementor.png` },
  { id: "platform-10", name: "", src: `${ASSET_BASE}/platform-generic-1.png` },
  { id: "platform-11", name: "", src: `${ASSET_BASE}/platform-generic-2.png` },
  { id: "platform-12", name: "", src: `${ASSET_BASE}/platform-generic-3.png` },
];

/**
 * 05 / Get Started — three-step onboarding overview with a strip of supported
 * website-platform plugins. Copy and colors mirror Figma node 582:5284;
 * card illustrations and platform logos are neutral placeholders pending assets.
 */
export default function GetStarted() {
  return (
    <section
      className={styles.section}
      data-section="get-started"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.boltWrap}>
              <svg
                className={styles.boltArcs}
                viewBox="0 0 120 120"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <filter id="gsElectric" x="-30%" y="-30%" width="160%" height="160%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={2} seed={2} result="gsNoise">
                      <animate attributeName="baseFrequency" dur="0.7s" values="0.06;0.13;0.05;0.1;0.06" repeatCount="indefinite" />
                      <animate attributeName="seed" dur="1.3s" values="1;4;2;6;3;1" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="gsNoise" scale={3.5} xChannelSelector="R" yChannelSelector="G" result="gsDisp" />
                    <feGaussianBlur in="gsDisp" stdDeviation="0.9" result="gsGlow" />
                    <feMerge>
                      <feMergeNode in="gsGlow" />
                      <feMergeNode in="gsDisp" />
                    </feMerge>
                  </filter>
                </defs>
                <g filter="url(#gsElectric)">
                  <g className={styles.arcGroup1}>
                    <polyline points="56,48 53,40 59,34 55,27 60,20" />
                    <polyline points="70,71 78,78 73,83 82,91" />
                    <polyline points="47,58 36,61 41,55 28,60" />
                  </g>
                  <g className={styles.arcGroup2}>
                    <polyline points="68,50 76,45 72,38 82,33" />
                    <polyline points="76,45 80,48 78,53" />
                    <polyline points="58,74 55,84 61,90 57,99" />
                    <polyline points="53,51 44,45 49,39 40,34" />
                  </g>
                  <g className={styles.arcGroup3}>
                    <polyline points="73,58 84,56 79,61 92,59" />
                    <polyline points="51,71 42,78 47,83 38,90" />
                    <polyline points="42,78 39,82 43,86" />
                  </g>
                </g>
              </svg>
              <svg
                className={styles.bolt}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="getStartedBolt" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ffd75e" />
                    <stop offset="1" stopColor="#f5a623" />
                  </linearGradient>
                </defs>
                <path
                  d="M13 3v7h6l-8 11v-7H5z"
                  fill="url(#getStartedBolt)"
                  stroke="url(#getStartedBolt)"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <div className={styles.headingGroup}>
              <h2 id={HEADING_ID} className={styles.heading}>
                {SECTION_HEADING}
              </h2>
              <p className={styles.subhead}>{SECTION_SUBHEADING}</p>
            </div>
          </div>

          <ul className={styles.cards}>
            {STEPS.map((step) => (
              <li key={step.id} className={styles.card}>
                <span className={`${styles.stepIcon} ${step.iconClassName}`}>
                  {step.icon}
                </span>
                <div className={styles.stepText}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
                <div className={styles.stepMedia} aria-hidden="true">
                  <Image
                    className={styles.stepMediaImage}
                    src={step.media}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 90vw, 400px"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerNote}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054z" />
              <path d="M4 20l3.5 -3.5" />
              <path d="M15 4l-3.5 3.5" />
              <path d="M19 8l-3.5 3.5" />
            </svg>
            <span className={styles.footerNoteText}>{PLATFORMS_NOTE}</span>
          </p>

          <ul className={styles.platforms} aria-label="Website platforms Superflow supports">
            {PLATFORMS.map((platform) => (
              <li
                key={platform.id}
                className={styles.platformPill}
                data-platform={platform.name || platform.id}
              >
                <Image
                  className={styles.platformLogo}
                  src={platform.src}
                  alt={platform.name}
                  width={26}
                  height={26}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
