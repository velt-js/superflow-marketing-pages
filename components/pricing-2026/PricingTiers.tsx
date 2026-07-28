"use client";

// Pricing tier cards — 2026 light restyle of components/pricing/PricingTiers.
// Same data (components/pricing/pricing-data.ts) and billing state
// (components/pricing/BillingContext.tsx); the presentation moves to the
// 2026 card idiom: #fbfbfd cards, hairline #ececf1 border, 20px radius,
// accent hover, single #433df3 accent instead of per-tier rainbow colors.

import Link from "next/link";
import { toInternalHref } from "@/lib/links";
import { TIERS, type Tier, type TierBullet } from "@/components/pricing/pricing-data";
import { useBilling, type BillingPeriod } from "@/components/pricing/BillingContext";
import styles from "./PricingTiers.module.css";

/** Copy for the annual toggle's savings hint. */
const ANNUAL_HINT = "2 months free";

/**
 * Tabler "check" bullet glyph, stroked in the section's green accent.
 */
function PricingTiersCheckIcon() {
  return (
    <svg
      className={styles.bulletIcon}
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

/** Tabler "sparkles" glyph for the AI credits chip. */
function PricingTiersSparklesIcon() {
  return (
    <svg
      className={styles.creditsIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2" />
      <path d="M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2" />
      <path d="M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />
    </svg>
  );
}

/**
 * Clay-style AI credits chip under the price: the plan's included
 * monthly credits ("300 AI credits/mo") in a hairline pill row.
 *
 * @param props.label - The tier's aiCredits label.
 */
function PricingTiersCreditsChip({ label }: { label: string }) {
  return (
    <span className={styles.creditsChip}>
      <PricingTiersSparklesIcon />
      {label}
    </span>
  );
}

/**
 * One feature bullet inside a tier card. Divider bullets ("Everything in X,
 * plus") render as a muted lead-in line without a check.
 *
 * @param props.bullet - The bullet copy and divider flag.
 */
function PricingTiersBullet({ bullet }: { bullet: TierBullet }) {
  try {
    if (bullet?.divider) {
      return <li className={styles.bulletDivider}>{bullet.text}</li>;
    }
    return (
      <li className={styles.bullet}>
        <PricingTiersCheckIcon />
        <span>{bullet?.text}</span>
      </li>
    );
  } catch {
    return null;
  }
}

/**
 * The tier card's price block: custom tiers show the label + "Custom",
 * paid tiers show the active-period price with an optional struck-through
 * monthly equivalent when annual billing is selected.
 *
 * @param props.tier - The tier whose price is rendered.
 * @param props.billing - The active billing period.
 */
function PricingTiersPrice({
  tier,
  billing,
}: {
  tier: Tier;
  billing: BillingPeriod;
}) {
  try {
    if (tier?.customPrice) {
      return (
        <div className={styles.priceBlock}>
          <span className={styles.price}>{tier.monthlyPrice}</span>
          <span className={styles.priceSuffix}>Custom</span>
        </div>
      );
    }

    const isAnnual = billing === "annual";
    const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
    const showStrike = isAnnual && Boolean(tier.annualStrikePrice);
    const suffix = isAnnual
      ? "per seat / month, billed yearly"
      : "per seat / month";

    return (
      <div className={styles.priceBlock}>
        <span className={styles.priceRow}>
          <span className={styles.price}>${price}</span>
          {showStrike ? (
            <span className={styles.priceStrike}>${tier.annualStrikePrice}</span>
          ) : null}
        </span>
        <span className={styles.priceSuffix}>{suffix}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * A single pricing tier card in the 2026 idiom. The highlighted tier
 * (Growth) gets an accent border, a soft shadow and its badge pill.
 *
 * @param props.tier - The tier to render.
 * @param props.billing - The active billing period.
 */
function PricingTiersCard({
  tier,
  billing,
}: {
  tier: Tier;
  billing: BillingPeriod;
}) {
  const highlighted = Boolean(tier?.highlighted);
  const external = tier?.cta?.href?.startsWith("http");
  const cardClassName = highlighted
    ? `${styles.card} ${styles.cardHighlighted}`
    : styles.card;
  const ctaClassName = highlighted
    ? `${styles.cta} ${styles.ctaPrimary}`
    : `${styles.cta} ${styles.ctaSecondary}`;

  return (
    <li className={styles.item}>
      {tier?.badge ? (
        <span className={styles.badge}>{tier.badge}</span>
      ) : (
        <span className={styles.badgeSpacer} aria-hidden="true" />
      )}
      <article className={cardClassName}>
        <div className={styles.cardTop}>
          <h3 className={styles.tierName}>{tier?.name}</h3>
          <PricingTiersPrice tier={tier} billing={billing} />
          {tier?.aiCredits ? (
            <PricingTiersCreditsChip label={tier.aiCredits} />
          ) : null}
          {tier?.trialLabel ? (
            <span className={styles.trialLabel}>{tier.trialLabel}</span>
          ) : null}
          <Link
            href={toInternalHref(tier?.cta?.href) ?? "#"}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener" : undefined}
            className={ctaClassName}
          >
            {tier?.cta?.label}
          </Link>
        </div>
        <ul className={styles.bullets}>
          {(tier?.bullets ?? []).map((bullet) => (
            <PricingTiersBullet key={bullet.text} bullet={bullet} />
          ))}
        </ul>
      </article>
    </li>
  );
}

/**
 * Monthly ↔ Annually segmented toggle driving the shared billing context.
 *
 * @param props.value - The active billing period.
 * @param props.onChange - Called with the newly selected period.
 */
function PricingTiersToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (next: BillingPeriod) => void;
}) {
  const isAnnual = value === "annual";
  return (
    <div className={styles.toggle} role="radiogroup" aria-label="Billing period">
      <button
        type="button"
        role="radio"
        aria-checked={!isAnnual}
        className={!isAnnual ? `${styles.toggleOption} ${styles.toggleActive}` : styles.toggleOption}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={isAnnual}
        className={isAnnual ? `${styles.toggleOption} ${styles.toggleActive}` : styles.toggleOption}
        onClick={() => onChange("annual")}
      >
        Annually
        <span className={styles.toggleHint}>{ANNUAL_HINT}</span>
      </button>
    </div>
  );
}

/**
 * 2026 pricing tiers section — billing toggle above the four tier cards.
 * Must render inside a `BillingProvider` (shared with the comparison table
 * so both stay in sync).
 */
export default function PricingTiers() {
  try {
    const { billing, setBilling } = useBilling();

    return (
      <section className={styles.section} data-section="pricing-tiers">
        <div className={styles.inner}>
          <PricingTiersToggle value={billing} onChange={setBilling} />
          <ul className={styles.grid}>
            {TIERS.map((tier) => (
              <PricingTiersCard key={tier.id} tier={tier} billing={billing} />
            ))}
          </ul>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
