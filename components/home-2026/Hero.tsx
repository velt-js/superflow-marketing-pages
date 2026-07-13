import Image from "next/image";
import type { ComponentType } from "react";
import styles from "./Hero.module.css";
import { GlobeIcon } from "./HeroIcons";
import HeroChecksDropdown from "./HeroChecksDropdown";
import HeroWorkflowShowcase, {
  type HeroCmsTab,
  type HeroWorkflowVariant,
} from "./HeroWorkflowShowcase";
import IntegrationsHubHeroArtifact from "./hero-artifacts/IntegrationsHubHeroArtifact";
import IntegrationsMondayArtifact from "./hero-artifacts/IntegrationsMondayArtifact";

/**
 * Chrome-less hero artifacts that render inside a plain white card (no tab
 * strip, no black window frame), keyed by a stable string so a page can select
 * one across the server/client boundary. Used by pages whose hero shows a
 * single static composition instead of the interactive workflow showcase.
 */
const STATIC_HERO_ARTIFACTS: Readonly<Record<string, ComponentType>> = {
  "integrations-hub": IntegrationsHubHeroArtifact,
  "integrations-monday": IntegrationsMondayArtifact,
};

const URL_PLACEHOLDER = "Enter your website URL";
const START_LABEL = "Start";
const CTA_MICROCOPY =
  "Free to start. No credit card. Your client reviews without an account.";

const HEADLINE_LINES: readonly string[] = ["Watch AI do", "your QA work"];

const SUBHEAD_TEXT =
  "Turn your agency's QA checklist into AI agents that check every site change. Your team approves, then your client. No login required.";

/**
 * Per-page overrides for the hero copy. Omit a prop to fall back to the
 * homepage default.
 *
 * `variant` controls the layout:
 *  - "home" (default): subhead sits under the headline, with the URL-capture
 *    field + checks dropdown in the right column.
 *  - "feature": no URL capture — the subhead moves into the right column
 *    (matching the Figma feature-page frame, node 678:3023).
 *
 * `showcase` picks the tab preset on the interactive QA workflow window:
 *  - "workflow" (default): the homepage tab preset.
 *  - "comments" / "review-agents": the same white workflow window, differing
 *    only in their tab labels/icons.
 *
 * `tabs` supplies CMS-authored tab labels/icons. When provided and non-empty
 * they take precedence over `showcase`; the window UI is unchanged.
 */
export interface HeroProps {
  /**
   * Optional mono eyebrow rendered above the headline (integration pages that
   * carry a category kicker, e.g. Monday's "· TASK MANAGEMENT · …"). Omit to
   * render no eyebrow, so the homepage and other heroes are unaffected.
   */
  kicker?: string;
  headlineLines?: readonly string[];
  subhead?: string;
  variant?: "home" | "feature";
  showcase?: "workflow" | "comments" | "review-agents";
  tabs?: readonly HeroCmsTab[] | null;
  /**
   * Optional page scope selecting per-page hero-artifact overrides (forwarded to
   * {@link HeroWorkflowShowcase}). A plain string, safe across the server/client
   * boundary; used so a page can bind its own hero artifact to a tab id that
   * already exists in the global registry.
   */
  heroArtifactScope?: string;
  /**
   * Hero section background treatment:
   *  - "default" (omitted): the homepage blue gradient bitmap.
   *  - "sunset": the orange→yellow integrations gradient (Figma node 959:3824).
   */
  background?: "default" | "sunset";
  /**
   * Key into {@link STATIC_HERO_ARTIFACTS}. When set, the hero renders that
   * single static, chrome-less artifact on a white card instead of the
   * interactive {@link HeroWorkflowShowcase} (no tab strip, no window frame).
   */
  staticArtifact?: string;
  /**
   * When true (and a `staticArtifact` is set), the static card drops its drop
   * shadow for a flat, thin-bordered card. Used by the Monday integration hero
   * whose sync artifact must sit on a shadow-less card.
   */
  staticArtifactFlat?: boolean;
  /** Hide the "Trusted by" logo strip (pages that carry their own logo strip). */
  hideTrusted?: boolean;
}

/** A customer/partner logo shown in the trust strip. */
type TrustLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Real customer logos reused from the previous homepage's logo bar
 * (components/home/LogoBar.tsx). The source PNGs are white marks on a
 * transparent background, so the trust strip inverts them to a muted dark
 * treatment (see `.logoImage` / `.logoCarousel` in Hero.module.css).
 */
const TRUST_LOGOS: readonly TrustLogo[] = [
  { src: "/images/home-2026/hero/logos/cox.png", alt: "Cox Automotive", width: 74, height: 24 },
  { src: "/images/home-2026/hero/logos/gmh.png", alt: "GMH", width: 152, height: 28 },
  { src: "/images/home-2026/hero/logos/finsweet.png", alt: "Finsweet", width: 75, height: 23 },
  { src: "/images/home-2026/hero/logos/uservoice.png", alt: "UserVoice", width: 127, height: 26 },
  { src: "/images/home-2026/hero/logos/redshark.png", alt: "Redshark", width: 82, height: 25 },
  { src: "/images/home-2026/hero/logos/phenyx.png", alt: "Phenyx", width: 140, height: 25 },
  { src: "/images/home-2026/hero/logos/zanger.png", alt: "Zanger", width: 85, height: 26 },
  { src: "/images/home-2026/hero/logos/children.png", alt: "Children's Defense Fund", width: 78, height: 28 },
];

/**
 * The trust logos rendered twice, back to back, so the marquee track can scroll
 * one full set and loop seamlessly (the animation translates by exactly half
 * the track). The second set is a visual clone hidden from assistive tech.
 */
const CAROUSEL_LOGOS: readonly TrustLogo[] = [...TRUST_LOGOS, ...TRUST_LOGOS];

/**
 * 01 / Hero — top section of the 2026 Superflow marketing homepage.
 *
 * Renders the headline + supporting copy, the website-URL capture field with
 * an expandable "checks to perform" dropdown, an interactive product-workflow
 * showcase, and the "trusted by" logo strip populated with real customer
 * logos carried over from the previous homepage. The top navigation is a
 * separate sticky header (`SiteNav`) that overlays this section.
 *
 * @param props - Optional per-page copy overrides; defaults reproduce the
 *   /home-preview homepage exactly.
 */
export default function Hero({
  kicker,
  headlineLines,
  subhead,
  variant = "home",
  showcase = "workflow",
  tabs,
  heroArtifactScope,
  background = "default",
  staticArtifact,
  staticArtifactFlat = false,
  hideTrusted = false,
}: HeroProps = {}) {
  const resolvedHeadlineLines =
    headlineLines && headlineLines.length > 0 ? headlineLines : HEADLINE_LINES;
  const resolvedSubhead = subhead ?? SUBHEAD_TEXT;
  const isFeature = variant === "feature";
  const showcaseVariant: HeroWorkflowVariant =
    showcase === "comments" || showcase === "review-agents"
      ? showcase
      : "home";
  const StaticArtifact = staticArtifact
    ? STATIC_HERO_ARTIFACTS[staticArtifact]
    : undefined;
  const sectionClassName =
    background === "sunset"
      ? `${styles.hero} ${styles.heroSunset}`
      : styles.hero;

  return (
    <section className={sectionClassName} data-section="hero">
      <div className={styles.inner}>
        <div className={styles.body}>
          <div className={styles.copy}>
            {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
            <h1 className={styles.headline}>
              {resolvedHeadlineLines.map((line) => (
                <span key={line} className={styles.headlineLine}>
                  {line}
                </span>
              ))}
            </h1>
            {!isFeature && <p className={styles.subhead}>{resolvedSubhead}</p>}
          </div>

          {isFeature ? (
            <p className={`${styles.subhead} ${styles.subheadRight}`}>
              {resolvedSubhead}
            </p>
          ) : (
            <div className={styles.panel}>
              <div className={styles.urlRow}>
                <div className={styles.urlField}>
                  <GlobeIcon size={24} className={styles.urlIcon} />
                  <input
                    className={styles.urlInput}
                    type="url"
                    inputMode="url"
                    aria-label={URL_PLACEHOLDER}
                    placeholder={URL_PLACEHOLDER}
                  />
                </div>
                <button type="button" className={styles.startButton}>
                  {START_LABEL}
                </button>
              </div>

              <p className={styles.microcopy}>{CTA_MICROCOPY}</p>

              <HeroChecksDropdown />
            </div>
          )}
        </div>

        {StaticArtifact ? (
          <div className={styles.showcase}>
            <div
              className={
                staticArtifactFlat
                  ? `${styles.staticCard} ${styles.staticCardFlat}`
                  : styles.staticCard
              }
            >
              <StaticArtifact />
            </div>
          </div>
        ) : (
          <HeroWorkflowShowcase
            variant={showcaseVariant}
            tabs={tabs}
            heroArtifactScope={heroArtifactScope}
          />
        )}

        {!hideTrusted && (
        <div className={styles.trusted}>
          <p className={styles.trustedLabel}>
            {"Trusted by "}
            <span className={styles.trustedAccent}>web</span>
            {" and "}
            <span className={styles.trustedAccent}>marketing agencies</span>.
          </p>
          <div className={styles.logoCarousel}>
            <div className={styles.logoTrack}>
              {CAROUSEL_LOGOS.map((logo, index) => {
                const isClone = index >= TRUST_LOGOS.length;
                return (
                  <span
                    key={`${logo?.src}-${index}`}
                    className={styles.logoItem}
                    aria-hidden={isClone || undefined}
                  >
                    <Image
                      className={styles.logoImage}
                      src={logo?.src}
                      alt={isClone ? "" : logo?.alt}
                      width={logo?.width}
                      height={logo?.height}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
