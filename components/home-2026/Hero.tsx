import Image from "next/image";
import styles from "./Hero.module.css";
import { GlobeIcon } from "./HeroIcons";
import HeroChecksDropdown from "./HeroChecksDropdown";
import HeroWorkflowShowcase from "./HeroWorkflowShowcase";

const URL_PLACEHOLDER = "Enter your website URL";
const START_LABEL = "Start";
const CTA_MICROCOPY =
  "Free to start. No credit card. Your client reviews without an account.";

const HEADLINE_LINES: readonly string[] = ["Watch AI do", "your QA Work"];

const SUBHEAD_TEXT =
  "Turn your agency's QA checklist into AI agents that check every site change. Your team approves, then your client. No login required.";

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
 * treatment (see `.logoImage` / `.logoRow` in Hero.module.css).
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
 * 01 / Hero — top section of the 2026 Superflow marketing homepage.
 *
 * Renders the headline + supporting copy, the website-URL capture field with
 * an expandable "checks to perform" dropdown, an interactive product-workflow
 * showcase, and the "trusted by" logo strip populated with real customer
 * logos carried over from the previous homepage. The top navigation is a
 * separate sticky header (`SiteNav`) that overlays this section.
 */
export default function Hero() {
  return (
    <section className={styles.hero} data-section="hero">
      <div className={styles.inner}>
        <div className={styles.body}>
          <div className={styles.copy}>
            <h1 className={styles.headline}>
              {HEADLINE_LINES.map((line) => (
                <span key={line} className={styles.headlineLine}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={styles.subhead}>{SUBHEAD_TEXT}</p>
          </div>

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
        </div>

        <HeroWorkflowShowcase />

        <div className={styles.trusted}>
          <p className={styles.trustedLabel}>
            {"Trusted by "}
            <span className={styles.trustedAccent}>web</span>
            {" and "}
            <span className={styles.trustedAccent}>marketing agencies</span>.
          </p>
          <div className={styles.logoRow}>
            {TRUST_LOGOS.map((logo) => (
              <Image
                key={logo?.src}
                className={styles.logoImage}
                src={logo?.src}
                alt={logo?.alt}
                width={logo?.width}
                height={logo?.height}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
