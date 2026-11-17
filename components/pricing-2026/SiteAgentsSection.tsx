// Site monitoring and version control section on /pricing, between the tier
// cards and the feature comparison table: what every site gets for free, and
// what the per-site upgrade adds.
//
// Server component: every figure and label comes from
// components/pricing-2026/site-agents-data.ts, so this section, the
// comparison table, the FAQ, the Product JSON-LD and the Markdown copies all
// quote one price.

import { FREE_SITE_TIER, PAID_SITE_TIER } from "./site-agents-data";
import styles from "./SiteAgentsSection.module.css";

const HEADING = "Monitoring and version control for every site";
const LEDE =
  "Baseline tracking is included on all accounts. Upgrade individual sites only when you need full version history and continuous checks.";

type SiteTier = { label: string; price: string; unit: string; description: string };

/**
 * One tier card: the label and price on the left, what it includes on the
 * right.
 *
 * @param props.tier - The tier's label, price, unit and description.
 * @param props.free - True for the free tier (neutral card).
 */
function SiteTierCard({ tier, free }: { tier: SiteTier; free: boolean }) {
  try {
    return (
      <div className={free ? `${styles.card} ${styles.cardFree}` : styles.card} data-tier={free ? "free" : "paid"}>
        <div className={styles.priceBlock}>
          <p className={styles.cardTitle}>{tier.label}</p>
          <p className={styles.price}>
            <span className={styles.amount}>{tier.price}</span>
            <span className={styles.unit}>{tier.unit}</span>
          </p>
        </div>
        <p className={styles.cardDescription}>{tier.description}</p>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The site monitoring and version control section: heading, the free tier
 * card and the per-site upgrade card. Static content, so it renders inside
 * the page's BillingProvider without becoming a client component.
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
          <SiteTierCard tier={FREE_SITE_TIER} free />
          <SiteTierCard tier={PAID_SITE_TIER} free={false} />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
