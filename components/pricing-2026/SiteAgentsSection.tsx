// Watch and Care section on /pricing, between the tier cards and the
// feature comparison table: what every site gets for free (Watch), and what
// the per-site Care price adds.
//
// Server component: every figure and label comes from
// components/pricing-2026/site-agents-data.ts, so this section, the
// comparison table, the FAQ, the Product JSON-LD and the Markdown copies all
// quote one price.

import {
  SITE_AGENTS_CAPABILITIES,
  SITE_AGENTS_NAME,
  SITE_AGENTS_PRICE_USD,
  WATCH_CAPABILITIES,
  WATCH_NAME,
  type SiteAgentsCapability,
} from "./site-agents-data";
import styles from "./SiteAgentsSection.module.css";

const HEADING = `Every site watched for free. Care for a site at $${SITE_AGENTS_PRICE_USD}.`;
const LEDE = "Every site starts on Watch. Move the sites you look after to Care.";

/** Tabler "check" glyph, matching the tier cards' bullet treatment. */
function SiteAgentsCheckIcon() {
  return (
    <svg
      className={styles.checkIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

/**
 * One capability tile: what the agents do, in a line.
 *
 * @param props.capability - The capability to render.
 */
function SiteAgentsCapabilityTile({ capability }: { capability: SiteAgentsCapability }) {
  try {
    return (
      <li className={styles.capability} data-capability={capability?.id}>
        <span className={styles.capabilityLabel}>
          <SiteAgentsCheckIcon />
          {capability?.label}
        </span>
        <span className={styles.capabilityText}>{capability?.description}</span>
      </li>
    );
  } catch {
    return null;
  }
}

/**
 * The Watch and Care section: heading, the free Watch card and the per-site
 * Care card, each with its capability grid. Static content, so it renders inside the page's
 * BillingProvider without becoming a client component.
 */
export default function SiteAgentsSection() {
  try {
    return (
      <section className={styles.section} data-section="site-agents">
        <div className={styles.inner}>
          <div className={styles.intro}>
            <h2 className={styles.heading}>{HEADING}</h2>
            <p className={styles.lede}>{LEDE}</p>
          </div>

          <div className={`${styles.card} ${styles.cardWatch}`} data-state="watch">
            <div className={styles.priceBlock}>
              <p className={styles.cardTitle}>{WATCH_NAME}</p>
              <p className={styles.price}>
                <span className={styles.amount}>$0</span>
                <span className={styles.unit}>every site, free</span>
              </p>
            </div>
            <ul className={styles.capabilities}>
              {WATCH_CAPABILITIES.map((capability) => (
                <SiteAgentsCapabilityTile key={capability.id} capability={capability} />
              ))}
            </ul>
          </div>

          <div className={styles.card} data-state="care">
            <div className={styles.priceBlock}>
              <p className={styles.cardTitle}>{SITE_AGENTS_NAME}</p>
              <p className={styles.price}>
                <span className={styles.amount}>${SITE_AGENTS_PRICE_USD}</span>
                <span className={styles.unit}>per site / month</span>
              </p>
            </div>
            <ul className={styles.capabilities}>
              {SITE_AGENTS_CAPABILITIES.map((capability) => (
                <SiteAgentsCapabilityTile key={capability.id} capability={capability} />
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
