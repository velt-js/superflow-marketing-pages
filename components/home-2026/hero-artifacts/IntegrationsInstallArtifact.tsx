import type { ComponentType, ReactNode } from "react";
import styles from "./IntegrationsInstallArtifact.module.css";
import {
  SuperflowFlowerMark,
  WebflowMark,
  WordPressMark,
  GtmMark,
} from "@/components/integration-2026/IntegrationBrandMarks";

/**
 * Install-family integration hero artifact (Webflow / WordPress / Google Tag
 * Manager) — the "install once, every launch is reviewable" demo from the v3
 * build files: the tool's install surface on the left (Marketplace install /
 * plugin activate / container tag publish, with the verifier's green
 * confirmation), a curved connector, and the live site on the right — real
 * URL bar, padlock, LIVE chip — where an agent finding lands as a pinned
 * comment chip (canonical chip grammar: "Broken Links").
 *
 * Mirrors the composer + connector composition of the connector heroes (same
 * 1200×578 stage, container-query scaling, gradient connector + sync pulse)
 * so every integration hero reads as one family. One parameterized base
 * renders all three tools; the zero-prop wrappers below are registered in
 * `STATIC_HERO_ARTIFACTS` (Hero.tsx) as `integrations-<slug>`.
 *
 * All motion is CSS/SMIL-only and rests settled under
 * `prefers-reduced-motion: reduce`.
 */

/** The fictional agency site under review (page-wide art direction rule). */
const SITE_URL = "northbeamstudio.com";
const LIVE_LABEL = "LIVE";
const VERIFIED_LABEL = "Verified";
const APP_NAME = "Superflow";
const FINDING_CHIP = "Broken Links";

/* Curved connector geometry (identical to the connector heroes so the pulse
   choreography matches): install card (bottom-left) → site (top-right). */
const CONNECTOR_PATH = "M0 180 H44 Q68 180 68 156 V28 Q68 4 92 4 H162";

/** Props shared by every brand-mark glyph a tool config can reference. */
interface MarkProps {
  size?: number;
  className?: string;
}

/** Everything tool-specific the install composition needs. */
interface InstallArtifactTool {
  /** Page slug — used in the `data-artifact` hook and gradient ids. */
  slug: string;
  /** The tool's brand mark. */
  Mark: ComponentType<MarkProps>;
  /** Mark render size inside the install card chip (aspect ratios vary). */
  markSize: number;
  /** The install surface's title row (e.g. "Webflow Marketplace"). */
  surfaceTitle: string;
  /** The install action button label ("Install" / "Activate" / "Publish"). */
  actionLabel: string;
}

const WEBFLOW_TOOL: InstallArtifactTool = {
  slug: "webflow",
  Mark: WebflowMark,
  markSize: 30,
  surfaceTitle: "Webflow Marketplace",
  actionLabel: "Install",
};

const WORDPRESS_TOOL: InstallArtifactTool = {
  slug: "wordpress",
  Mark: WordPressMark,
  markSize: 27,
  surfaceTitle: "Plugins › Add New",
  actionLabel: "Activate",
};

const GTM_TOOL: InstallArtifactTool = {
  slug: "google-tag-manager",
  Mark: GtmMark,
  markSize: 27,
  surfaceTitle: "GTM Container",
  actionLabel: "Publish",
};

/** Size (px) accepted by the local inline glyphs. */
interface GlyphProps {
  size?: number;
}

/**
 * Padlock glyph for the site window's URL bar.
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function PadlockGlyph({ size = 14 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Single check glyph inside the verifier's green confirmation chip.
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function CheckGlyph({ size = 13 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the install hero composition for one tool.
 *
 * @param props.tool - The tool's marks, install surface title and action.
 * @returns The install card + connector + live-site composition, or `null`.
 */
function InstallArtifact({ tool }: { tool: InstallArtifactTool }): ReactNode {
  try {
    const ToolMark = tool?.Mark;
    return (
      <div
        className={styles.root}
        data-artifact={`integrations-${tool.slug}`}
      >
        {/* Fixed-ratio stage holding the desktop-native absolute composition;
            it scales down proportionally (container queries in the CSS). */}
        <div className={styles.stage}>
          {/* Curved connector from the install card up into the site window. */}
          <svg
            className={styles.connector}
            viewBox="0 0 162 190"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`install-connector-${tool.slug}`}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="180"
                x2="162"
                y2="4"
              >
                <stop offset="0" stopColor="#625df5" stopOpacity="0.7" />
                <stop offset="0.45" stopColor="#625df5" stopOpacity="0.5" />
                <stop offset="1" stopColor="#625df5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className={styles.connectorPath}
              stroke={`url(#install-connector-${tool.slug})`}
              d={CONNECTOR_PATH}
            />
            {/* "Script placed" pulse: install card → site; its arrival cues
                the pinned agent finding's entrance. */}
            <circle className={styles.syncPulse} r="4" fill="#625df5" opacity="0">
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.12;0.85;1"
                dur="0.6s"
                begin="0.9s"
                repeatCount="1"
              />
              <animateMotion
                dur="0.6s"
                begin="0.9s"
                repeatCount="1"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
                path={CONNECTOR_PATH}
              />
            </circle>
          </svg>

          {/* The tool's install surface (left): mark, Superflow row, the
              install action, and the verifier's confirmation. */}
          <div className={styles.installCard}>
            <div className={styles.installBar}>
              <span className={styles.installSurface}>{tool.surfaceTitle}</span>
            </div>
            <div className={styles.installRow}>
              <span className={styles.installToolChip}>
                <ToolMark size={tool.markSize} />
              </span>
              <span className={styles.installApp}>
                <SuperflowFlowerMark size={20} />
                {APP_NAME}
              </span>
              <span className={styles.installAction}>{tool.actionLabel}</span>
            </div>
            <div className={styles.installVerified}>
              <span className={styles.verifiedChip}>
                <CheckGlyph size={13} />
                {VERIFIED_LABEL}
              </span>
            </div>
          </div>

          {/* The live site under review (right, bleeds off the right edge):
              real URL bar, padlock, LIVE chip, and the landed agent finding. */}
          <div className={styles.siteWindow}>
            <div className={styles.urlBar}>
              <span className={styles.urlLock}>
                <PadlockGlyph size={14} />
              </span>
              <span className={styles.urlText}>{SITE_URL}</span>
              <span className={styles.liveChip}>{LIVE_LABEL}</span>
            </div>
            <div className={styles.page}>
              {/* Page skeleton: headline bars + media block. */}
              <span className={`${styles.skeletonBar} ${styles.skeletonWide}`} />
              <span className={`${styles.skeletonBar} ${styles.skeletonMid}`} />
              <span className={styles.skeletonMedia} />

              {/* The agent finding, pinned on the page after the pulse. */}
              <div className={styles.finding}>
                <span className={styles.findingPin} aria-hidden="true" />
                <span className={styles.findingCard}>
                  <SuperflowFlowerMark size={16} />
                  <span className={styles.findingChip}>{FINDING_CHIP}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Webflow install hero — registered as `integrations-webflow`.
 *
 * @returns The Webflow-cast install composition.
 */
export function IntegrationsWebflowArtifact(): ReactNode {
  return <InstallArtifact tool={WEBFLOW_TOOL} />;
}

/**
 * WordPress install hero — registered as `integrations-wordpress`.
 *
 * @returns The WordPress-cast install composition.
 */
export function IntegrationsWordPressArtifact(): ReactNode {
  return <InstallArtifact tool={WORDPRESS_TOOL} />;
}

/**
 * Google Tag Manager install hero — registered as
 * `integrations-google-tag-manager`.
 *
 * @returns The GTM-cast install composition.
 */
export function IntegrationsGtmArtifact(): ReactNode {
  return <InstallArtifact tool={GTM_TOOL} />;
}
