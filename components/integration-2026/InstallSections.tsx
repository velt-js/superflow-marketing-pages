import type { ComponentType, ReactNode } from "react";
import BlueprintFrame from "@/components/home-2026/BlueprintFrame";
import {
  SuperflowFlowerMark,
  WebflowMark,
  WordPressMark,
  GtmMark,
  ShopifyMark,
} from "./IntegrationBrandMarks";
import styles from "./InstallSections.module.css";

/**
 * Bespoke, hand-authored sections shared by the install-family integration
 * pages (/preview/integrations/webflow, /wordpress, /google-tag-manager).
 * Layout and aesthetic follow the connector pages' template (Monday et al.);
 * copy is per-tool, verbatim from the matching v3 build file
 * (superflow-page-integration-<tool>*.md). These replace the generic
 * "What the plugin does" / "How the install behaves" FeatureSet blocks the
 * seeds previously carried; every other page section is untouched.
 *
 * Two sections are exported, each taking an {@link InstallConfig}:
 *  - {@link InstallWhatItDoes} — "What the plugin/tag does." (mechanics facts
 *    + the marketplace / directory CTA where a public listing exists)
 *  - {@link InstallBehaves}    — "How the <tool> install behaves." (guarantees)
 *
 * Per-tool configs live in {@link INSTALL_CONFIGS}, keyed by page slug.
 */

/* ---------------------------------------------------------------- config */

/** Props shared by every brand-mark glyph a config can reference. */
interface MarkProps {
  size?: number;
  className?: string;
}

/** Everything tool-specific the two shared sections need to render. */
export interface InstallConfig {
  /** Page slug — used in `data-section` hooks (e.g. "webflow-what"). */
  slug: string;
  /** Display name ("Webflow", "WordPress", "Google Tag Manager"). */
  toolName: string;
  /** The tool's brand mark, matching the hero install artifacts. */
  Mark: ComponentType<MarkProps>;
  /** Mark render size in the section header icon row (aspect ratios vary). */
  markSize: number;
  /** "What it does" display heading (rendered header, verbatim). */
  whatHeading: string;
  /** "What it does" lede — the section's lead line, verbatim. */
  whatLede: string;
  /** The mechanics facts (bullet list, verbatim plus closing periods). */
  whatFacts: readonly string[];
  /** Optional CTA under the facts — omitted when no public listing exists. */
  ctaLabel?: string;
  /** CTA target (external marketplace / directory listing). */
  ctaHref?: string;
  /** "How it behaves" display heading (rendered header, verbatim). */
  behavesHeading: string;
  /** The six install guarantees (verbatim plus closing periods). */
  behaves: readonly string[];
}

/** Copy verbatim from superflow-page-integration-webflow.md (v3.1). */
const WEBFLOW_CONFIG: InstallConfig = {
  slug: "webflow",
  toolName: "Webflow",
  Mark: WebflowMark,
  markSize: 34,
  whatHeading: "What the plugin does.",
  whatLede:
    "Superflow ships as a plugin in the Webflow Marketplace. Install it, authorize, pick your sites - the script is placed for you.",
  whatFacts: [
    "The plugin adds the Superflow snippet through Webflow's own custom-code surface. No copy-paste, no developer, nothing else touched.",
    "The verifier confirms the script before any review link goes out.",
    "The plugin keeps the script current when Superflow updates it. No re-paste, ever.",
    "Uninstalling the plugin removes the script.",
    "Requests custom-code access only, not full site admin.",
  ],
  ctaLabel: "Get the plugin on the Webflow Marketplace",
  ctaHref: "https://webflow.com/apps/detail/superflow",
  behavesHeading: "How the Webflow install behaves.",
  behaves: [
    "Works on staging and published Webflow sites.",
    "One connection covers the sites you pick, not your whole account.",
    "Any website takes the snippet. Webflow just makes it one click.",
    "If the connection drops, the site keeps its script. Reviews keep working.",
    "Connection health lives in settings.",
    "Removing the integration removes the script.",
  ],
};

/** Copy verbatim from superflow-page-integration-wordpress-v3.md. */
const WORDPRESS_CONFIG: InstallConfig = {
  slug: "wordpress",
  toolName: "WordPress",
  Mark: WordPressMark,
  markSize: 30,
  whatHeading: "What the plugin does.",
  whatLede:
    "Superflow ships as a plugin in the WordPress directory. Search \u201cSuperflow\u201d in Plugins > Add New, or grab it from the directory - activate, and the script is placed for you.",
  whatFacts: [
    "The plugin places the Superflow script on the rendered page. No code paste, no theme edit, nothing else in your content touched.",
    "The verifier confirms the script before any review link goes out.",
    "Survives theme changes and updates. The plugin carries snippet updates, no re-paste, ever.",
    "Deactivating the plugin removes the script.",
    "Works beneath the builders on top of WordPress, like Elementor and Divi.",
  ],
  ctaLabel: "Get the plugin on the WordPress directory",
  ctaHref: "https://wordpress.org/plugins/superflow/",
  behavesHeading: "How the WordPress install behaves.",
  behaves: [
    "Works with the builders on top of WordPress, like Elementor and Divi. The plugin sits beneath them.",
    "Works across a multisite network.",
    "Any website takes the snippet. WordPress just makes it a built-in step.",
    "If the plugin misbehaves, deactivate it. The site is untouched.",
    "Connection health lives in settings.",
    "Deactivating removes the script.",
  ],
};

/**
 * Copy verbatim from superflow-page-integration-google-tag-manager-v3.md.
 * No CTA: the build file's setup-guide link is [VERIFY]-flagged (no public
 * GTM listing exists to link, unlike the Webflow / WordPress pages).
 */
const GTM_CONFIG: InstallConfig = {
  slug: "google-tag-manager",
  toolName: "Google Tag Manager",
  Mark: GtmMark,
  markSize: 30,
  whatHeading: "What the tag does.",
  whatLede:
    "Superflow ships as one tag for your GTM container. Add it, publish, and every site the container runs on becomes reviewable - no site code, no code access, no per-site install project.",
  whatFacts: [
    "One tag, added in GTM. No site code touched.",
    "Works on any platform underneath the container.",
    "The verifier confirms the script before any review link goes out.",
    "Tag updates propagate through the container. No re-paste, ever.",
    "Removing the tag removes Superflow.",
  ],
  behavesHeading: "How the GTM install behaves.",
  behaves: [
    "Fires wherever the container fires, staging included if the container is there.",
    "Respects the container's consent settings.",
    "Any website takes the snippet. GTM is the no-code-access path.",
    "Removing the tag removes Superflow. Nothing else changes.",
    "Connection health lives in settings.",
    "Tag updates propagate through the container.",
  ],
};

/**
 * Shopify install copy. Like GTM, no marketplace CTA: there is no public
 * Shopify App Store listing to link, so the page documents the snippet
 * path (one paste in the theme's layout file).
 */
const SHOPIFY_CONFIG: InstallConfig = {
  slug: "shopify",
  toolName: "Shopify",
  Mark: ShopifyMark,
  markSize: 32,
  whatHeading: "What the install does.",
  whatLede:
    "Superflow installs on Shopify with one snippet in your theme. Paste it once in the theme's layout file - every page the storefront renders becomes reviewable.",
  whatFacts: [
    "One snippet in the theme's layout file. No app permissions, no checkout changes, nothing else in your store touched.",
    "The verifier confirms the script before any review link goes out.",
    "Works with Online Store 2.0 and legacy themes alike - the snippet sits in the layout every page renders through.",
    "Duplicated themes carry the snippet with them, so staging copies stay reviewable.",
    "Removing the snippet removes Superflow.",
  ],
  behavesHeading: "How the Shopify install behaves.",
  behaves: [
    "Works on password-protected storefronts, so pre-launch stores review like live ones.",
    "Works with the page builders on top of Shopify, like PageFly and Shogun. Reviews run on the rendered page.",
    "Covers every page the theme renders: home, collections, products, pages, blog.",
    "Any website takes the snippet. Shopify just makes it one paste in the theme.",
    "Connection health lives in settings.",
    "Removing the snippet removes Superflow. Nothing else changes.",
  ],
};

/**
 * The install-family pages that render the bespoke install template, keyed by
 * their `integrationPreviewPage` slug.
 */
export const INSTALL_CONFIGS: Readonly<Record<string, InstallConfig>> = {
  webflow: WEBFLOW_CONFIG,
  wordpress: WORDPRESS_CONFIG,
  "google-tag-manager": GTM_CONFIG,
  shopify: SHOPIFY_CONFIG,
};

/* ---------------------------------------------------------------- glyphs */

/** Size (px) accepted by the local inline glyphs. */
interface GlyphProps {
  size?: number;
}

/**
 * Rightward arrow (section header icon row).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ArrowGlyph({ size = 20 }: GlyphProps): ReactNode {
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
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Double-check glyph (behaves-list guarantee marker, matching the connector
 * unlocks section).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function DoubleCheckGlyph({ size = 30 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 30 21"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1.5 11.5l5 5L17 4.5" />
        <path d="M12 16.5l0.5 0.5L28.5 4.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * External-link arrow beside the CTA label.
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ExternalLinkGlyph({ size = 15 }: GlyphProps): ReactNode {
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
        <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
        <path d="M11 13l9 -9" />
        <path d="M15 4h5v5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/* --------------------------------------- Section — What the plugin does */

/** Props shared by the two config-driven sections. */
interface InstallSectionProps {
  /** The per-tool copy + branding. */
  config: InstallConfig;
}

/**
 * "What the plugin/tag does." — a centered icon pair (tool mark → Superflow
 * flower: the install placing the review script) over a serif heading and the
 * verbatim lead line, then the mechanics facts as hairline cards, closed by
 * the marketplace / directory CTA where a public listing exists. Wrapped in
 * the shared {@link BlueprintFrame} like the connector pages' lead section.
 *
 * @param props.config - The per-tool copy + branding.
 * @returns The section, or `null` on failure.
 */
export function InstallWhatItDoes({ config }: InstallSectionProps): ReactNode {
  try {
    const ToolMark = config?.Mark;
    return (
      <section
        className={`${styles.section} ${styles.whatSection}`}
        data-section={`${config.slug}-what`}
      >
        <BlueprintFrame />
        <div className={`${styles.inner} ${styles.whatInner}`}>
          <div className={styles.headCenter}>
            <span className={styles.whatIconRow} aria-hidden="true">
              <span className={styles.whatTool}>
                <ToolMark size={config.markSize} />
              </span>
              <span className={styles.whatArrow}>
                <ArrowGlyph size={20} />
              </span>
              <span className={styles.whatFlower}>
                <SuperflowFlowerMark size={26} />
              </span>
            </span>
            <h2 className={styles.display}>{config.whatHeading}</h2>
            <p className={styles.lede}>{config.whatLede}</p>
          </div>

          <div className={styles.factGrid}>
            {config.whatFacts.map((fact, factIndex) => (
              <article key={`fact-${factIndex}`} className={styles.factCard}>
                <span className={styles.factIndex}>
                  {String(factIndex + 1).padStart(2, "0")}
                </span>
                <p className={styles.factText}>{fact}</p>
              </article>
            ))}
          </div>

          {config.ctaLabel && config.ctaHref ? (
            <div className={styles.ctaRow}>
              <a
                className={styles.ctaButton}
                href={config.ctaHref}
                target="_blank"
                rel="noreferrer"
              >
                {config.ctaLabel}
                <ExternalLinkGlyph size={15} />
              </a>
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* --------------------------------------- Section — How the install behaves */

/**
 * "How the <tool> install behaves." — the six install guarantees as a
 * hairline-separated two-column list, each row led by the green double-check
 * marker the connector unlocks section established.
 *
 * @param props.config - The per-tool copy + branding.
 * @returns The section, or `null` on failure.
 */
export function InstallBehaves({ config }: InstallSectionProps): ReactNode {
  try {
    return (
      <section
        className={styles.section}
        data-section={`${config.slug}-behaves`}
      >
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{config.behavesHeading}</h2>
          </div>
          <div className={styles.behaveGrid}>
            {config.behaves.map((guarantee, behaveIndex) => (
              <div key={`behave-${behaveIndex}`} className={styles.behaveRow}>
                <span className={styles.behaveMark} aria-hidden="true">
                  <DoubleCheckGlyph size={16} />
                </span>
                <p className={styles.behaveText}>{guarantee}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
