"use client";

import type { ReactNode } from "react";
import styles from "./WhiteLabelArtifact.module.css";
import ReviewToolbar from "./ReviewToolbar";

/**
 * Feature/hero artifact — "White-label".
 *
 * The white-label story is: upload your logo once (Settings → Custom Branding)
 * and your brand shows up everywhere the client and your team look — the
 * client-facing review toolbar and the internal admin portal — while
 * Superflow's brand disappears. One variant-driven component covers every beat:
 *
 *  - `settings`       — the Custom Branding settings panel: the Toolbar and
 *                       Admin Portal upload rows, each carrying the current
 *                       Superflow mark inside a dashed edit outline with a
 *                       purple edit pencil (the "upload here" surface).
 *  - `toolbar`        — the client-facing floating review toolbar, its logo slot
 *                       now carrying the agency's mark (Superflow → the client's
 *                       brand), sitting on the reviewed live site.
 *  - `portal`         — the internal admin portal navbar, its wordmark now the
 *                       agency's (the panel the team runs every day).
 *  - `agent-findings` — the same branded toolbar carrying an AI review agent's
 *                       finding, so the AI half reads as the agency's process.
 *
 * The "before" brand is the Superflow flower + wordmark (the exact Figma
 * vectors); the "after" brand is a plausible agency mark ("Acme Studio", the
 * same fictional agency used across the other feature artifacts).
 *
 * All motion is gated behind `prefers-reduced-motion`; the settled state (the
 * brand already swapped in / already uploaded) is what renders when motion is
 * reduced, so screenshots always capture the finished composition.
 */

/** Which white-label scene to render. */
export type WhiteLabelVariant =
  | "settings"
  | "toolbar"
  | "portal"
  | "agent-findings";

/* ---- Brand copy (constants per the repo's repeated-string rule) ---- */
const SUPERFLOW_NAME = "Superflow";
const CLIENT_NAME = "Acme Studio";

/* ---- Settings panel copy ---- */
const SETTINGS_TITLE = "Settings";
const SETTINGS_TABS: readonly string[] = [
  "Profile",
  "Integrations",
  "Custom Branding",
  "Advanced Features",
  "Billing",
  "SAML",
];
const ACTIVE_SETTINGS_TAB = "Custom Branding";
const TOOLBAR_SECTION_LABEL = "Toolbar";
const ADMIN_SECTION_LABEL = "Admin Portal";
const SPEC_FORMAT_LABEL = "SVG or PNG";
const SPEC_SIZE_LABEL = "2MB";
const SPEC_DIMENSION_LABEL = "Dimension";
const SPEC_SQUARE_LABEL = "Square Image";
const SPEC_RATIO_LABEL = "4 : 1";
const WELCOME_GHOST_TEXT = "Wel";

/* ---- Portal navbar copy ---- */
const PORTAL_WORKSPACE_LABEL = "Acme Workspace";
const PORTAL_HOME_LABEL = "Home";
const PORTAL_ANALYTICS_LABEL = "Analytics";
const PORTAL_AGENTS_LABEL = "Agents";
const PORTAL_ASK_AI_LABEL = "Ask AI";
const PORTAL_BETA_LABEL = "BETA";
const PORTAL_HEADER_GREETING = "Welcome back";
const PORTAL_HEADER_SUB = "Client Projects";

/* ---- Toolbar + live-site copy ---- */
const SITE_URL = "acme-client.com";
/** Logo mark size used in the review toolbar's brand slot. */
const TOOLBAR_LOGO_SIZE = 28;
const CLIENTS_VIEW_TAG = "Your brand, the client's view";
const TEAM_VIEW_TAG = "Your brand, the panel your team runs";

/* ---- Agent-finding copy (no invented Superflow metrics) ---- */
const AGENT_NAME = "Review Agent";
const AGENT_FINDING_TEXT = "CTA contrast is below AA — darken the orange.";
const AGENT_FINDING_TAG = "AI finding · under your brand";

/** Shared props for the inline icons: an optional pixel size and class. */
interface IconProps {
  /** Rendered width/height in pixels. */
  size?: number;
  className?: string;
}

/**
 * Stroke-icon wrapper drawing outlined glyphs in `currentColor` on the 24-unit
 * Tabler grid with rounded caps/joins.
 *
 * @param root0 - Sizing, class and child path nodes.
 * @param root0.size - Rendered width/height in pixels (defaults to 18).
 * @param root0.className - Optional class applied to the `<svg>`.
 * @param root0.paths - The path `d` strings drawn inside the glyph.
 * @returns The configured `<svg>` element, or `null` on failure.
 */
function StrokeGlyph({
  size = 18,
  className,
  paths,
}: IconProps & { paths: readonly string[] }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {paths.map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/* Tabler-derived glyph path sets, one per toolbar / nav / spec icon. */
const PENCIL_PATHS = [
  "M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4",
  "M13.5 6.5l4 4",
] as const;
const FILE_PATHS = [
  "M14 3v4a1 1 0 0 0 1 1h4",
  "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",
] as const;
const DIMENSION_PATHS = [
  "M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z",
  "M9 3v18",
  "M3 9h18",
] as const;
const CHEVRON_DOWN_PATHS = ["M6 9l6 6l6 -6"] as const;
const CHEVRON_LEFT_PATHS = ["M15 6l-6 6l6 6"] as const;
const HOME_PATHS = [
  "M5 12l-2 0l9 -9l9 9l-2 0",
  "M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7",
  "M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6",
] as const;
const CHART_PATHS = [
  "M4 19l16 0",
  "M4 15l4 -4l4 2l4 -6",
] as const;
const ROBOT_PATHS = [
  "M6 8h12a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2z",
  "M12 4v4",
  "M9 13v1",
  "M15 13v1",
  "M10 17h4",
] as const;
const SPARKLE_PATHS = [
  "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8 -4.7L5.5 9.5l4.7 -1.8z",
] as const;
const UPLOAD_PATHS = [
  "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",
  "M7 9l5 -5l5 5",
  "M12 4v12",
] as const;
const ARROW_RIGHT_PATHS = ["M5 12h14", "M13 6l6 6l-6 6"] as const;
const CHECK_PATHS = ["M5 12.5l4 4l10 -10"] as const;

/**
 * The Superflow brand mark — four brand-colored petals (exact Figma vectors,
 * shared with the private-comments toolbar). This is the "before" logo the
 * white-label upload replaces.
 *
 * @param root0 - Icon sizing/class props.
 * @param root0.size - Rendered width/height (defaults to 26).
 * @param root0.className - Optional class applied to the `<svg>`.
 * @returns The Superflow flower `<svg>`, or `null` on failure.
 */
function SuperflowFlowerMark({ size = 26, className }: IconProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          d="M13.4316 3.51909C12.6958 3.20466 11.8819 3.11989 11.0969 3.2759C10.312 3.43192 9.59255 3.82142 9.03308 4.3933C8.46157 4.95285 8.07233 5.67168 7.91623 6.45582C7.76014 7.23996 7.84447 8.05291 8.15818 8.7884C8.45708 9.52946 8.97285 10.1631 9.63803 10.6065C10.3032 11.05 11.0868 11.2825 11.8864 11.2736H15.9223V7.24436C15.9311 6.44498 15.698 5.66158 15.2535 4.99684C14.8091 4.33209 14.1741 3.81701 13.4316 3.51909Z"
          fill="#FFCD2E"
        />
        <path
          d="M28.1321 8.52565C27.188 7.58307 25.9855 6.94115 24.6765 6.68096C23.3675 6.42076 22.0107 6.55396 20.7774 7.06372C19.5441 7.57348 18.4896 8.43695 17.7471 9.54511C17.0046 10.6533 16.6073 11.9564 16.6055 13.29V20.0329H23.3675C24.706 20.0471 26.0176 19.657 27.1306 18.9139C28.2436 18.1707 29.1061 17.1091 29.6052 15.868C30.1269 14.638 30.2654 13.2795 30.0027 11.9697C29.7399 10.6599 29.088 9.45962 28.1321 8.52565Z"
          fill="#FF7162"
        />
        <path
          d="M24.3715 23.2142C24.0727 22.4723 23.5569 21.8378 22.8914 21.3935C22.226 20.9492 21.4419 20.7158 20.6416 20.7238H16.6057V24.7565C16.5973 25.5561 16.8307 26.3395 17.2754 27.0042C17.7201 27.6689 18.3554 28.184 19.098 28.4818C19.5949 28.6906 20.1283 28.7986 20.6674 28.7995C21.3289 28.7928 21.9788 28.6243 22.5601 28.3085C23.1414 27.9928 23.6365 27.5396 24.0019 26.9885C24.3674 26.4374 24.5922 25.8053 24.6566 25.1473C24.721 24.4893 24.6231 23.8256 24.3715 23.2142Z"
          fill="#0DCF82"
        />
        <path
          d="M2.93155 16.1289C2.40623 17.3593 2.26498 18.7195 2.52629 20.0315C2.7876 21.3434 3.43928 22.5459 4.39601 23.4816C5.01327 24.11 5.74925 24.6096 6.56125 24.9516C7.37325 25.2936 8.24513 25.4712 9.12631 25.4739C10.0283 25.4719 10.9209 25.2915 11.7527 24.9432C12.995 24.4447 14.0576 23.5829 14.8013 22.4708C15.5451 21.3586 15.9353 20.0479 15.921 18.7104V11.9606H9.16929C7.83035 11.9467 6.51844 12.3373 5.4054 13.081C4.29236 13.8248 3.4301 14.8872 2.93155 16.1289Z"
          fill="#625DF5"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The agency ("after") brand mark — a solid rounded-square tile carrying the
 * agency monogram. Single-color and unmistakably distinct from the multi-color
 * Superflow flower, so the swap reads at a glance.
 *
 * @param root0 - Icon sizing/class props.
 * @param root0.size - Rendered width/height (defaults to 26).
 * @param root0.className - Optional class applied to the `<svg>`.
 * @returns The agency mark `<svg>`, or `null` on failure.
 */
function ClientBrandMark({ size = 26, className }: IconProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <defs>
          <linearGradient id="wlClientMark" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#12B5A6" />
            <stop offset="1" stopColor="#0E7C6E" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#wlClientMark)" />
        <path
          d="M16 9.5l4.6 12h-2.5l-0.9 -2.5h-4.4l-0.9 2.5h-2.5z M13.6 16.8h4.8l-2.4 -4.6z"
          fill="#ffffff"
          fillRule="evenodd"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * A brand lockup: a mark beside its wordmark, used by the portal navbar, the
 * admin header and the settings admin-portal row.
 *
 * @param root0 - Which brand + sizing props.
 * @param root0.brand - `"superflow"` (flower + Superflow) or `"client"`
 *   (agency mark + Acme Studio).
 * @param root0.markSize - Rendered mark size in pixels (defaults to 24).
 * @param root0.className - Optional class applied to the wrapper.
 * @returns The brand lockup element, or `null` on failure.
 */
function BrandLockup({
  brand,
  markSize = 24,
  className,
}: {
  brand: "superflow" | "client";
  markSize?: number;
  className?: string;
}): ReactNode {
  try {
    const wrapperClass = className
      ? `${styles.lockup} ${className}`
      : styles.lockup;
    return (
      <span className={wrapperClass}>
        {brand === "client" ? (
          <ClientBrandMark size={markSize} />
        ) : (
          <SuperflowFlowerMark size={markSize} />
        )}
        <span className={styles.wordmark}>
          {brand === "client" ? CLIENT_NAME : SUPERFLOW_NAME}
        </span>
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * The purple round edit-pencil badge shown on every branding edit affordance
 * (matches the reference: a solid indigo disc with a white pencil).
 *
 * @param root0 - Icon sizing/class props.
 * @param root0.size - Disc diameter in pixels (defaults to 24).
 * @param root0.className - Optional class applied to the badge.
 * @returns The edit-pencil badge, or `null` on failure.
 */
function EditPencilBadge({ size = 24, className }: IconProps): ReactNode {
  try {
    const badgeClass = className
      ? `${styles.editBadge} ${className}`
      : styles.editBadge;
    return (
      <span
        className={badgeClass}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <StrokeGlyph size={Math.round(size * 0.58)} paths={PENCIL_PATHS} />
      </span>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: settings — the Custom Branding panel (upload rows).          *
 * ------------------------------------------------------------------ */

/**
 * One "SVG or PNG · 2MB" / "Dimension · …" spec column shown left of each
 * branding upload widget.
 *
 * @param root0 - The dimension value line for this row.
 * @param root0.dimension - The dimension spec ("Square Image" or "4 : 1").
 * @returns The spec column element, or `null` on failure.
 */
function BrandingSpec({ dimension }: { dimension: string }): ReactNode {
  try {
    return (
      <div className={styles.specCol}>
        <span className={styles.specRow}>
          <StrokeGlyph size={16} paths={FILE_PATHS} className={styles.specIcon} />
          <span className={styles.specKey}>{SPEC_FORMAT_LABEL}</span>
          <span className={styles.specVal}>{SPEC_SIZE_LABEL}</span>
        </span>
        <span className={styles.specRow}>
          <StrokeGlyph size={16} paths={DIMENSION_PATHS} className={styles.specIcon} />
          <span className={styles.specKey}>{SPEC_DIMENSION_LABEL}</span>
          <span className={styles.specVal}>{dimension}</span>
        </span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The Custom Branding settings panel: a "Settings" heading, the tab row with
 * "Custom Branding" active, and the Toolbar + Admin Portal upload rows — each
 * carrying the current Superflow mark inside a dashed edit outline with a
 * purple pencil, ready to be replaced.
 *
 * @returns The settings scene, or `null` on failure.
 */
function SettingsScene(): ReactNode {
  try {
    return (
      <div className={styles.settingsCard}>
        <h3 className={styles.settingsTitle}>{SETTINGS_TITLE}</h3>
        <div className={styles.settingsTabs} role="presentation">
          {SETTINGS_TABS.map((tab) => (
            <span
              key={tab}
              className={
                tab === ACTIVE_SETTINGS_TAB
                  ? `${styles.settingsTab} ${styles.settingsTabActive}`
                  : styles.settingsTab
              }
            >
              {tab}
            </span>
          ))}
        </div>

        <p className={styles.sectionLabel}>{TOOLBAR_SECTION_LABEL}</p>
        <div className={styles.uploadRow}>
          <BrandingSpec dimension={SPEC_SQUARE_LABEL} />
          <div className={styles.toolbarWidget}>
            <span className={styles.dashedCircle}>
              <SuperflowFlowerMark size={26} />
              <EditPencilBadge size={22} className={styles.dashedCircleBadge} />
            </span>
            <span className={styles.skeletonTool} />
            <span className={styles.skeletonTool} />
            <span className={styles.skeletonTool} />
            <span className={styles.skeletonTool} />
          </div>
        </div>

        <p className={styles.sectionLabel}>{ADMIN_SECTION_LABEL}</p>
        <div className={styles.uploadRow}>
          <BrandingSpec dimension={SPEC_RATIO_LABEL} />
          <div className={styles.portalWidget}>
            <span className={styles.ghostWelcome} aria-hidden="true">
              {WELCOME_GHOST_TEXT}
            </span>
            <span className={styles.dashedPill}>
              <BrandLockup brand="superflow" markSize={22} />
              <EditPencilBadge size={22} />
            </span>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Shared shells: the reviewed live site + the branded review toolbar. *
 * ------------------------------------------------------------------ */

/**
 * A compact reviewed live-site card (browser chrome, hero band, skeleton
 * lines) that the floating review toolbar sits on.
 *
 * @returns The live-site card, or `null` on failure.
 */
function LiveSiteCard(): ReactNode {
  try {
    return (
      <div className={styles.siteCard} aria-hidden="true">
        <div className={styles.siteBar}>
          <span className={styles.siteDots}>
            <span className={styles.siteDot} />
            <span className={styles.siteDot} />
            <span className={styles.siteDot} />
          </span>
          <span className={styles.siteUrl}>{SITE_URL}</span>
        </div>
        <div className={styles.siteBody}>
          <span className={styles.siteHero} />
          <span className={styles.siteLine} />
          <span className={`${styles.siteLine} ${styles.siteLineShort}`} />
          <span className={styles.siteTiles}>
            <span className={styles.siteTile} />
            <span className={styles.siteTile} />
          </span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The client-facing review toolbar with the agency's logo swapped into the brand
 * slot (Superflow → the client's mark). Reuses the shared {@link ReviewToolbar};
 * only the logo differs for white-label — every other control stays constant.
 *
 * @returns The branded review toolbar, or `null` on failure.
 */
function BrandedToolbar(): ReactNode {
  try {
    return <ReviewToolbar brandMark={<ClientBrandMark size={TOOLBAR_LOGO_SIZE} />} />;
  } catch {
    return null;
  }
}

/**
 * A small "your brand …" caption tag shown beneath a branded surface so the
 * white-label point reads without motion.
 *
 * @param root0 - The caption text to render.
 * @param root0.text - The caption text.
 * @returns The caption tag, or `null` on failure.
 */
function BrandTag({ text }: { text: string }): ReactNode {
  try {
    return (
      <span className={styles.brandTag}>
        <ClientBrandMark size={15} />
        {text}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * `toolbar` scene — the client's view: the reviewed live site carrying the
 * floating review toolbar, its logo slot now the agency's brand.
 *
 * @returns The toolbar scene, or `null` on failure.
 */
function ToolbarScene(): ReactNode {
  try {
    return (
      <div className={styles.stack}>
        <div className={styles.siteWrap}>
          <LiveSiteCard />
          <div className={styles.toolbarFloat}>
            <BrandedToolbar />
          </div>
        </div>
        <BrandTag text={CLIENTS_VIEW_TAG} />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: portal — the admin portal navbar (branded).                 *
 * ------------------------------------------------------------------ */

/** One nav item in the portal sidebar. */
interface PortalNavItem {
  /** The item label. */
  label: string;
  /** The item's leading glyph paths. */
  paths: readonly string[];
  /** Whether a BETA pill trails the label. */
  beta?: boolean;
}

const PORTAL_NAV_ITEMS: readonly PortalNavItem[] = [
  { label: PORTAL_HOME_LABEL, paths: HOME_PATHS },
  { label: PORTAL_ANALYTICS_LABEL, paths: CHART_PATHS, beta: true },
  { label: PORTAL_AGENTS_LABEL, paths: ROBOT_PATHS, beta: true },
  { label: PORTAL_ASK_AI_LABEL, paths: SPARKLE_PATHS, beta: true },
];

/**
 * The admin portal navbar: the agency wordmark + collapse chevron at the top, a
 * workspace switcher pill, and the Home / Analytics / Agents / Ask AI nav rows
 * (BETA pills intact) — beside a faint main-panel header also carrying the
 * agency brand. The admin panel the team runs, now wearing the agency's mark.
 *
 * @returns The portal scene, or `null` on failure.
 */
function PortalScene(): ReactNode {
  try {
    return (
      <div className={styles.stack}>
        <div className={styles.portalWrap}>
          <aside className={styles.portalNav}>
            <div className={styles.portalTop}>
              <BrandLockup brand="client" markSize={22} />
              <span className={styles.portalCollapse} aria-hidden="true">
                <StrokeGlyph size={16} paths={CHEVRON_LEFT_PATHS} />
              </span>
            </div>
            <span className={styles.portalWorkspace}>
              <span className={styles.portalWorkspaceText}>
                {PORTAL_WORKSPACE_LABEL}
              </span>
              <StrokeGlyph size={16} paths={CHEVRON_DOWN_PATHS} />
            </span>
            <div className={styles.portalNavList}>
              {PORTAL_NAV_ITEMS.map((item) => (
                <span key={item.label} className={styles.portalNavItem}>
                  <StrokeGlyph size={20} paths={item.paths} className={styles.portalNavIcon} />
                  <span className={styles.portalNavLabel}>{item.label}</span>
                  {item.beta ? (
                    <span className={styles.betaPill}>{PORTAL_BETA_LABEL}</span>
                  ) : null}
                </span>
              ))}
            </div>
          </aside>
          <div className={styles.portalMain} aria-hidden="true">
            <div className={styles.portalHeader}>
              <BrandLockup brand="client" markSize={18} />
            </div>
            <div className={styles.portalGreeting}>
              <span className={styles.portalHello}>{PORTAL_HEADER_GREETING}</span>
              <span className={styles.portalHelloSub}>{PORTAL_HEADER_SUB}</span>
            </div>
            <span className={styles.portalCardLine} />
            <span className={`${styles.portalCardLine} ${styles.portalCardLineShort}`} />
            <span className={styles.portalTiles}>
              <span className={styles.portalTile} />
              <span className={styles.portalTile} />
            </span>
          </div>
        </div>
        <BrandTag text={TEAM_VIEW_TAG} />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: agent-findings — the branded toolbar carrying a finding.     *
 * ------------------------------------------------------------------ */

/**
 * `agent-findings` scene — the same branded toolbar, now carrying an AI review
 * agent's finding as a pinned comment, so the AI half reads as the agency's
 * process rather than an outsourced tool.
 *
 * @returns The agent-findings scene, or `null` on failure.
 */
function AgentFindingsScene(): ReactNode {
  try {
    return (
      <div className={styles.stack}>
        <div className={styles.siteWrap}>
          <LiveSiteCard />
          <div className={styles.findingCard}>
            <div className={styles.findingHead}>
              <span className={styles.findingAvatar} aria-hidden="true">
                <ClientBrandMark size={18} />
              </span>
              <span className={styles.findingName}>{AGENT_NAME}</span>
              <span className={styles.findingBadge} aria-hidden="true">
                <StrokeGlyph size={13} paths={SPARKLE_PATHS} />
              </span>
            </div>
            <p className={styles.findingText}>{AGENT_FINDING_TEXT}</p>
            <span className={styles.findingPin} aria-hidden="true" />
          </div>
          <div className={styles.toolbarFloat}>
            <BrandedToolbar />
          </div>
        </div>
        <BrandTag text={AGENT_FINDING_TAG} />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Resolve which scene body to render for a white-label variant.
 *
 * @param variant - The requested scene variant.
 * @returns The scene node for the variant.
 */
function renderWhiteLabelScene(variant: WhiteLabelVariant): ReactNode {
  try {
    switch (variant) {
      case "toolbar":
        return <ToolbarScene />;
      case "portal":
        return <PortalScene />;
      case "agent-findings":
        return <AgentFindingsScene />;
      default:
        return <SettingsScene />;
    }
  } catch {
    return null;
  }
}

/** Props for {@link WhiteLabelArtifact}. */
export interface WhiteLabelArtifactProps {
  /** Which scene to render. Defaults to `settings`. */
  variant?: WhiteLabelVariant;
  /** Hero-window fit (centres the scene + trims height for the hero frame). */
  hero?: boolean;
}

/**
 * Render the White-label artifact for the given variant.
 *
 * @param props - The variant + hero-fit flag.
 * @returns The artifact, or `null` on failure.
 */
export default function WhiteLabelArtifact({
  variant = "settings",
  hero = false,
}: WhiteLabelArtifactProps = {}): ReactNode {
  try {
    return (
      <div
        className={styles.sceneRoot}
        data-artifact="white-label"
        data-variant={variant}
        data-hero={hero || undefined}
      >
        <div className={styles.stage}>{renderWhiteLabelScene(variant)}</div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature-panel wrapper — the Custom Branding settings panel (One upload).
 * @returns The settings artifact.
 */
export function WhiteLabelSettingsArtifact(): ReactNode {
  return <WhiteLabelArtifact variant="settings" />;
}

/**
 * Feature-panel wrapper — the branded client-facing review toolbar.
 * @returns The toolbar artifact.
 */
export function WhiteLabelToolbarArtifact(): ReactNode {
  return <WhiteLabelArtifact variant="toolbar" />;
}

/**
 * Feature-panel wrapper — the branded admin portal navbar.
 * @returns The portal artifact.
 */
export function WhiteLabelPortalArtifact(): ReactNode {
  return <WhiteLabelArtifact variant="portal" />;
}

/**
 * Feature-panel wrapper — an AI finding inside the branded toolbar.
 * @returns The agent-findings artifact.
 */
export function WhiteLabelAgentFindingsArtifact(): ReactNode {
  return <WhiteLabelArtifact variant="agent-findings" />;
}

/* Exposed so the Solution section can reuse the exact "before/after" marks. */
export { SuperflowFlowerMark, ClientBrandMark, BrandLockup };
export { ARROW_RIGHT_PATHS, CHECK_PATHS, UPLOAD_PATHS };
