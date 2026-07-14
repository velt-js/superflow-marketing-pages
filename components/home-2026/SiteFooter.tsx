import Image from "next/image";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

/** Assets exported from Figma node 582:6645. */
const BRAND_MARK_SRC = "/images/home-2026/footer/superflow-mark.png";
const APP_PREVIEW_SRC = "/images/home-2026/footer/app-preview.png";
/** Product sign-up entry point (mirrors the legacy footer's CTA target). */
const SIGNUP_URL = "https://app.usesuperflow.com/signup";
/** Shared route prefix for the new feature detail pages (served at the root slug; mirrors SiteNav's FEATURE_ROUTE_PREFIX). */
const FEATURE_PATH = "/";
/** Category route prefixes for the migrated marketing/SEO pages (mirror the legacy footer). */
const INTEGRATIONS_PATH = "/integrations";
const ALTERNATIVES_PATH = "/alternative";
const COMPARISONS_PATH = "/comparisons";
const USE_CASES_PATH = "/use-case";
const PERSONAS_PATH = "/user-persona";
const BRAND_NAME = "Superflow";
const BRAND_TAGLINE =
  "The AI QA reviewer for agencies. AI reviews first, your team and your client sign off.";
const CTA_HEADING = "Start Your 14-Day Trial";
const CTA_SUBTITLE = "Your first 3 agent reviews are on us!";
const COPYRIGHT = "© 2026 Superflow. All rights reserved.";

type FooterLink = { label: string; href: string; paid?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

/** Navigation columns rendered on the blue footer band. Data-driven so copy/links stay in one place. */
const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "AI Layer",
    links: [
      { label: "AI Review Agents", href: `${FEATURE_PATH}ai-review-agents` },
      { label: "Brand Memory", href: `${FEATURE_PATH}memory` },
      { label: "Ask AI", href: `${FEATURE_PATH}ask-ai` },
    ],
  },
  {
    title: "Supported Formats",
    links: [
      { label: "Websites", href: "/website-review" },
      { label: "Videos", href: "/video-review" },
      { label: "Images", href: "/image-review" },
      { label: "PDF", href: "/pdf-review" },
      { label: "Lottie", href: "/lottie-files-review" },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Workflows", href: `${FEATURE_PATH}review-workflows` },
      { label: "Kanban", href: `${FEATURE_PATH}kanban-board` },
      { label: "Integrations", href: INTEGRATIONS_PATH },
      { label: "White-label", href: `${FEATURE_PATH}white-label` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Customers", href: "/case-study" },
      { label: "Trust", href: "/security" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Features", href: "/#features" },
      { label: "Affiliate", href: "/affiliate", paid: true },
    ],
  },
  {
    title: "Integrations",
    links: [
      { label: "Asana", href: `${INTEGRATIONS_PATH}/asana` },
      { label: "Slack", href: `${INTEGRATIONS_PATH}/slack` },
      { label: "ClickUp", href: `${INTEGRATIONS_PATH}/clickup` },
      { label: "Webflow", href: `${INTEGRATIONS_PATH}/webflow` },
      { label: "Monday.com", href: `${INTEGRATIONS_PATH}/monday` },
      { label: "Google Tag Manager", href: `${INTEGRATIONS_PATH}/google-tag-manager` },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "https://docs.usesuperflow.com/no-code-platforms/webflow/setup" },
      { label: "Case Study", href: "/case-study/writesonic" },
      { label: "SEO Checklist", href: "/seo-checklist-2023" },
      { label: "Cost Calculator", href: "/calculator", paid: true },
      { label: "YouTube", href: "https://www.youtube.com/@usesuperflow" },
      { label: "Join Community", href: "https://superflowusers.slack.com/ssb/redirect" },
    ],
  },
  {
    title: "Competition",
    links: [
      { label: "Markup Alternative", href: `${ALTERNATIVES_PATH}/markup-alternative` },
      { label: "Pastel Alternative", href: `${ALTERNATIVES_PATH}/pastel-alternative` },
      { label: "Bugherd Alternative", href: `${ALTERNATIVES_PATH}/bugherd-alternative` },
      { label: "Ruttl Alternative", href: `${ALTERNATIVES_PATH}/ruttl-alternative` },
      { label: "Vercel Comments", href: `${ALTERNATIVES_PATH}/vercel-comments-alternative` },
      { label: "Webflow Comments", href: `${ALTERNATIVES_PATH}/webflow-comments-alternative` },
      { label: "Marker.io Comments", href: `${ALTERNATIVES_PATH}/marker-io-alternative` },
      { label: "Use Bubbles", href: `${ALTERNATIVES_PATH}/use-bubbles-alternative` },
    ],
  },
  {
    title: "Comparison",
    links: [
      { label: "MarkUp vs Pastel", href: `${COMPARISONS_PATH}/markup-vs-pastel` },
      { label: "MarkUp vs Ruttl", href: `${COMPARISONS_PATH}/markup-vs-ruttl` },
      { label: "Pastel vs BugHerd", href: `${COMPARISONS_PATH}/pastel-vs-bugherd` },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "UAT & QA testing", href: `${USE_CASES_PATH}/uat-qa-testing` },
      { label: "Client feedback", href: `${USE_CASES_PATH}/client-feedback` },
      { label: "Conversion optimization", href: `${USE_CASES_PATH}/conversion-optimization` },
      { label: "Reporting bug", href: `${USE_CASES_PATH}/bug-reporting` },
      { label: "UX/UI Optimization", href: `${USE_CASES_PATH}/ux-ui-optimization` },
    ],
  },
  {
    title: "User Persona",
    links: [
      { label: "QA team", href: `${PERSONAS_PATH}/qa-teams` },
      { label: "Project Managers", href: `${PERSONAS_PATH}/project-managers` },
      { label: "Founder", href: `${PERSONAS_PATH}/founders` },
      { label: "Developer", href: `${PERSONAS_PATH}/developers` },
      { label: "Product company", href: `${PERSONAS_PATH}/product-companies` },
      { label: "Marketing agency", href: `${PERSONAS_PATH}/marketing-agencies` },
      { label: "Designer", href: `${PERSONAS_PATH}/designers` },
      { label: "Product Manager", href: `${PERSONAS_PATH}/product-managers` },
      { label: "Marketer", href: `${PERSONAS_PATH}/marketers` },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Decorative persona badges layered over the app preview inside the CTA card. */
const PERSONA_BADGES = [
  {
    label: "Designers",
    variant: styles.badgePink,
    pointer: styles.badgePointerRight,
    pointerFill: "var(--sf-badge-pink)",
    pointerFilterId: "sf-footer-pointer-shadow-designers",
  },
  {
    label: "Project Managers",
    variant: styles.badgeCyan,
    pointer: styles.badgePointerLeft,
    pointerFill: "var(--sf-badge-cyan)",
    pointerFilterId: "sf-footer-pointer-shadow-pm",
  },
] as const;

/** Superflow logo mark exported from Figma (node 582:6722). */
function BrandMark() {
  return (
    <Image
      className={styles.brandMark}
      src={BRAND_MARK_SRC}
      alt={`${BRAND_NAME} logo`}
      width={22}
      height={20}
    />
  );
}

/**
 * Cursor glyph anchored to a persona badge — the exact vector exported from
 * Figma (nodes 582:6713 / 582:6718): badge-colored arrow body, 2px white
 * stroke, and a baked-in drop shadow for separation on light backgrounds.
 * The stroke path needs an explicit fill="none" (SVG paths default to black).
 * The viewBox includes the shadow spill around the 32px glyph box.
 * `filterId` must be unique per instance so the two inline filters don't
 * collide in the DOM.
 */
function PointerCursor({
  className,
  fill,
  filterId,
}: {
  className: string;
  fill: string;
  filterId: string;
}) {
  return (
    <svg className={className} viewBox="0 0 43.2261 46.0104" aria-hidden="true">
      <g filter={`url(#${filterId})`}>
        <path
          d="M14.1983 32.2164L9.67915 9.49146C9.34462 7.80927 11.1439 6.51395 12.633 7.36489L32.5809 18.7637C34.1349 19.6517 33.8293 21.9776 32.0986 22.434L23.5931 24.6772C23.0988 24.8076 22.6732 25.1223 22.4036 25.5567L17.8594 32.8808C16.9027 34.4227 14.5522 33.9961 14.1983 32.2164Z"
          fill={fill}
        />
        <path
          d="M8.69833 9.68695C8.19656 7.16373 10.8953 5.22031 13.129 6.49652L33.0772 17.895C35.4083 19.227 34.9497 22.7161 32.3536 23.4008L23.8477 25.644C23.6008 25.7092 23.3877 25.8664 23.253 26.0834L18.7091 33.4077C17.2741 35.7204 13.7489 35.081 13.2179 32.4116L8.69833 9.68695Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="0"
          y="0"
          width="43.2261"
          height="46.0104"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.54545" />
          <feGaussianBlur stdDeviation="3.81818" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

/** Renders one titled column of footer navigation links. */
function FooterLinkColumn({ column }: { column: FooterColumn }) {
  return (
    <div className={styles.column}>
      <h3 className={styles.columnTitle}>{column.title}</h3>
      <ul className={styles.columnLinks}>
        {column.links?.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={styles.footerLink}>
              {link.label}
              {link.paid ? (
                <span className={styles.linkBadge} aria-hidden="true">
                  $
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 10 / Footer — 2026 homepage redesign.
 *
 * A white CTA card ("Start your 14 Days Trial") sits on a white base; the
 * blue gradient wave (SVG exported from Figma node 582:6761) is layered OVER
 * the card's lower half so the card dissolves into the flow, while the footer
 * nav band renders above the wave. Layout is flex/grid, desktop-first per the
 * 1440px Figma frame with tablet/mobile fallbacks.
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer} data-section="footer">
      {/* Gradient wave: above the CTA card, below the footer nav content. */}
      <div className={styles.waveLayer} aria-hidden="true" />

      <div className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.appPreview} aria-hidden="true">
            <Image
              className={styles.appPreviewImage}
              src={APP_PREVIEW_SRC}
              alt=""
              fill
              sizes="205px"
            />
          </div>

          {PERSONA_BADGES?.map((badge) => (
            <span
              key={badge.label}
              className={`${styles.badge} ${badge.variant}`}
              aria-hidden="true"
            >
              {badge.label}
              <PointerCursor
                className={badge.pointer}
                fill={badge.pointerFill}
                filterId={badge.pointerFilterId}
              />
            </span>
          ))}

          <div className={styles.ctaContent}>
            <div className={styles.ctaHeadings}>
              <h2 className={styles.ctaHeading}>{CTA_HEADING}</h2>
              <p className={styles.ctaSubtitle}>{CTA_SUBTITLE}</p>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/book-demo" className={`${styles.btn} ${styles.btnOutline}`}>
                Book Demo
              </Link>
              <Link href={SIGNUP_URL} className={`${styles.btn} ${styles.btnFilled}`}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerMain}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.brand}>
              <div className={styles.brandRow}>
                <BrandMark />
                <span className={styles.brandName}>{BRAND_NAME}</span>
              </div>
              <p className={styles.brandDesc}>{BRAND_TAGLINE}</p>
            </div>

            <nav className={styles.footerNav} aria-label="Footer">
              {FOOTER_COLUMNS?.map((column) => (
                <FooterLinkColumn key={column.title} column={column} />
              ))}
            </nav>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>{COPYRIGHT}</p>
            <div className={styles.legalLinks}>
              {LEGAL_LINKS?.map((link) => (
                <Link key={link.label} href={link.href} className={styles.legalLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
