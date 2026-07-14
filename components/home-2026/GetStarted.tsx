import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactElement } from "react";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./GetStarted.module.css";

const SECTION_HEADING = "Get Started in a minute";
const SECTION_SUBHEADING = "Install, review and approve";
const PLATFORMS_NOTE = "Website plugins to install Superflow in 30 seconds";
const HEADING_ID = "get-started-heading";

/** Section CTA pairing — mirrors the global footer (secondary + primary). */
const BOOK_DEMO_HREF = "/book-demo";
const SECONDARY_CTA_LABEL = "Book Demo";
const PRIMARY_CTA_LABEL = "Start Free";

/** Fallback badge accent for numbered steps that omit an explicit color. */
const DEFAULT_STEP_ACCENT = "#433df3";
/** Length the 1-based step index is zero-padded to (e.g. 1 → "01"). */
const STEP_BADGE_PAD_LENGTH = 2;
/** Character used to left-pad the numbered-step badge label. */
const STEP_BADGE_PAD_CHAR = "0";
/** CSS custom property that carries a numbered step's accent into the badge. */
const STEP_ACCENT_VAR = "--gs-step-accent";

/** Base path for the assets exported from Figma node 582:5284. */
const ASSET_BASE = "/images/home-2026/get-started";

/** Base URL for the Superflow docs "no-code platform" setup guides. Each pill in
    the strip links to `<base>/<platform>/setup` (verified live). */
const DOCS_PLATFORM_BASE = "https://docs.usesuperflow.com/no-code-platforms";

/** A single step in the "Get Started" flow, driving one card. */
interface GetStartedStep {
  id: string;
  title: string;
  description: string;
  iconClassName: string;
  icon: ReactElement;
  /** Product-UI illustration strip exported from Figma (illustration only; the
   *  card's heading/description render as live text above it). */
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
  /** Accessible name used for alt text and the link's aria-label. */
  name: string;
  src: string;
  /** Docs setup guide for this platform. Omitted when no live guide exists
      (e.g. plain HTML), in which case the pill renders as a static mark. */
  href?: string;
}

// Logos exported from Figma node 582:5427 in their on-canvas order. The last
// three "generic" marks are, in order, Google Tag Manager, Squarespace and
// HTML5. Each pill links to its live docs setup guide (verified against the docs
// index); HTML5 has no dedicated guide, so it stays a static mark.
const PLATFORMS: PlatformLogo[] = [
  { id: "drupal", name: "Drupal", src: `${ASSET_BASE}/platform-drupal.png`, href: `${DOCS_PLATFORM_BASE}/drupal/setup` },
  { id: "framer", name: "Framer", src: `${ASSET_BASE}/platform-framer.png`, href: `${DOCS_PLATFORM_BASE}/framer/setup` },
  { id: "hubspot", name: "HubSpot", src: `${ASSET_BASE}/platform-hubspot.png`, href: `${DOCS_PLATFORM_BASE}/hubspot/setup` },
  { id: "shopify", name: "Shopify", src: `${ASSET_BASE}/platform-shopify.png`, href: `${DOCS_PLATFORM_BASE}/shopify/setup` },
  { id: "bubble", name: "Bubble", src: `${ASSET_BASE}/platform-bubble.png`, href: `${DOCS_PLATFORM_BASE}/bubble/setup` },
  { id: "webflow", name: "Webflow", src: `${ASSET_BASE}/platform-webflow.png`, href: `${DOCS_PLATFORM_BASE}/webflow/setup` },
  { id: "wix", name: "Wix", src: `${ASSET_BASE}/platform-wix.png`, href: `${DOCS_PLATFORM_BASE}/wix/setup` },
  { id: "wordpress", name: "WordPress", src: `${ASSET_BASE}/platform-wordpress.png`, href: `${DOCS_PLATFORM_BASE}/wordpress/setup` },
  { id: "elementor", name: "Elementor", src: `${ASSET_BASE}/platform-elementor.png`, href: `${DOCS_PLATFORM_BASE}/elementor/setup` },
  { id: "google-tag-manager", name: "Google Tag Manager", src: `${ASSET_BASE}/platform-generic-1.png`, href: `${DOCS_PLATFORM_BASE}/google-tag-manager/setup` },
  { id: "squarespace", name: "Squarespace", src: `${ASSET_BASE}/platform-generic-2.png`, href: `${DOCS_PLATFORM_BASE}/squarespace/setup` },
  { id: "html5", name: "HTML", src: `${ASSET_BASE}/platform-generic-3.png` },
];

/**
 * A single numbered onboarding step. When a list of these is supplied the
 * section renders the numbered-badge layout (feature pages) instead of the
 * homepage media cards.
 */
export interface GetStartedNumberedStep {
  title: string;
  description: string;
  /** Badge accent color (hex). Falls back to {@link DEFAULT_STEP_ACCENT}. */
  accent?: string;
}

/**
 * Per-page overrides for the Get Started section. Omit a field to use the
 * homepage default (so /home-preview renders unchanged).
 */
export interface GetStartedProps {
  heading?: string;
  subheading?: string;
  /**
   * When provided and non-empty, renders numbered step cards (no media strip,
   * no svg icon) instead of the homepage media cards.
   */
  steps?: readonly GetStartedNumberedStep[];
}

/**
 * Format a 1-based step index as a zero-padded badge label (e.g. 1 → "01").
 *
 * @param index - Zero-based position of the step within the list.
 * @returns The padded, 1-based label to show inside the badge.
 */
function formatStepBadge(index: number): string {
  return String(index + 1).padStart(STEP_BADGE_PAD_LENGTH, STEP_BADGE_PAD_CHAR);
}

/**
 * 05 / Get Started — three-step onboarding overview with a strip of supported
 * website-platform plugins. Copy and colors mirror Figma node 582:5284;
 * card illustrations and platform logos are neutral placeholders pending assets.
 *
 * @param props - Optional per-page overrides; defaults reproduce the
 *   /home-preview homepage exactly.
 */
export default function GetStarted({
  heading,
  subheading,
  steps,
}: GetStartedProps = {}) {
  const headingText = heading ?? SECTION_HEADING;
  const subheadingText = subheading ?? SECTION_SUBHEADING;
  const numberedSteps = steps ?? [];
  const isNumbered = numberedSteps.length > 0;

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
                {headingText}
              </h2>
              <p className={styles.subhead}>{subheadingText}</p>
            </div>

            <div className={styles.ctaButtons}>
              <Link
                href={BOOK_DEMO_HREF}
                className={`${styles.btn} ${styles.btnOutline}`}
              >
                {SECONDARY_CTA_LABEL}
              </Link>
              <Link
                href={SIGNUP_URL}
                className={`${styles.btn} ${styles.btnFilled}`}
              >
                {PRIMARY_CTA_LABEL}
              </Link>
            </div>
          </div>

          {isNumbered ? (
            <ul className={`${styles.cards} ${styles.cardsNumbered}`}>
              {numberedSteps.map((step, index) => (
                <li
                  key={`${formatStepBadge(index)}-${step.title}`}
                  className={`${styles.card} ${styles.cardNumbered}`}
                  style={
                    {
                      [STEP_ACCENT_VAR]: step.accent ?? DEFAULT_STEP_ACCENT,
                    } as CSSProperties
                  }
                >
                  <span className={styles.stepBadge} aria-hidden="true">
                    {formatStepBadge(index)}
                  </span>
                  <div className={styles.stepText}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
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
          )}
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
            {PLATFORMS.map((platform) => {
              const logo = (
                <Image
                  className={styles.platformLogo}
                  src={platform.src}
                  alt={platform.name}
                  width={26}
                  height={26}
                />
              );
              return (
                <li
                  key={platform.id}
                  className={styles.platformPill}
                  data-platform={platform.name || platform.id}
                >
                  {platform.href ? (
                    <a
                      className={styles.platformLink}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${platform.name} setup guide`}
                    >
                      {logo}
                    </a>
                  ) : (
                    <span className={styles.platformLink}>{logo}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
