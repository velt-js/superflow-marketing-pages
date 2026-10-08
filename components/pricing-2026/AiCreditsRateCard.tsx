// AI pricing section on /pricing, between the tier cards and the feature
// comparison table. Two ways to pay for agents, behind a switch:
// bulk pricing (flat per site, the default) and à la carte credits (the
// scan price list, v4, plus one-time packs).
//
// Server component: both panels render here and AiPricingModeSwitch only
// toggles which is visible. Every figure comes from
// components/pricing-2026/ai-credits-data.ts, so the section, the tier
// chips, the comparison table and /llms-full.txt all quote one rate card.
// The gated 1,000-credit prepay pack is deliberately not shown here — it
// lives in billing, offered to high-spend accounts.

import Link from "next/link";
import {
  BULK_SITE_PLAN,
  CREDIT_PACKS,
  CREDIT_UNIT_PRICE_USD,
  BILLING_RATE_USD,
  MANUAL_PASS_BILLABLE_LABEL,
  MANUAL_PASS_HOURS_LABEL,
  SCAN_RATE_CARD,
  SIGNUP_BONUS_CREDITS,
  TYPICAL_PROJECT_CREDITS,
  getCreditsPriceLabel,
  getPerCreditLabel,
  getProjectsLabel,
} from "./ai-credits-data";
import AiPricingModeSwitch from "./AiPricingModeSwitch";
import styles from "./AiCreditsRateCard.module.css";

const HEADING = "AI agents, one flat rate per site";
const LEDE = `$${BULK_SITE_PLAN.priceUsd} a month per site covers unlimited reviews and monitoring, with every agent on every run. Prefer to pay per scan? Switch to à la carte and buy credits instead.`;

/** Lede for the à la carte panel: how credits work. */
const ALA_CARTE_LEDE = `One credit is $${CREDIT_UNIT_PRICE_USD.toFixed(2)}. A scan checks your whole site with every agent — no per-agent multiplier, no per-page math, no token talk. A rescan is 1 credit, always: only the pages that changed get reviewed.`;

/** Worked example under the rate card, built from the same numbers: the
 *  credit cost of a project next to the hours — and the billable value of
 *  those hours — that the same first pass takes by hand. Anchored to what
 *  the agency bills, never to wages or headcount: the QA seat reads this
 *  page too, and the billing anchor is the one that survives scrutiny. */
const EXAMPLE_TITLE = "A typical project";
const EXAMPLE_BODY =
  "One medium-site scan plus the four rescans a project runs before sign-off.";
const EXAMPLE_MANUAL_LABEL = "The same first pass by hand";
const EXAMPLE_MANUAL_NOTE = `${MANUAL_PASS_BILLABLE_LABEL} billable`;
const EXAMPLE_AGENT_LABEL = "With agents";

/** Reassurances under the packs, in display order. */
const PACK_NOTES = [
  `Every new workspace starts with ${SIGNUP_BONUS_CREDITS} bonus credits: your first full scan is free, at any site size.`,
  "Pack credits roll over month to month. Auto-refill tops you up $10 at a time, and you can switch it off.",
];

/**
 * Bulk pricing card: the flat per-site rate that swaps credits for
 * unlimited reviews and monitoring on that site.
 */
function BulkPricingCard() {
  try {
    return (
      <div className={styles.bulkCard} data-card="bulk-pricing">
        <div className={styles.bulkIntro}>
          <p className={styles.cardTitle}>{BULK_SITE_PLAN.name}</p>
          <p className={styles.bulkSummary}>{BULK_SITE_PLAN.summary}</p>
        </div>
        <ul className={styles.bulkIncludes}>
          {BULK_SITE_PLAN.includes.map((item) => (
            <li key={item} className={styles.packNote}>
              <RateCardCheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className={styles.bulkPrice}>
          <span className={styles.bulkAmount}>${BULK_SITE_PLAN.priceUsd}</span>
          <span className={styles.bulkUnit}>/ mo per site</span>
        </p>
      </div>
    );
  } catch {
    return null;
  }
}

/** Tabler "check" glyph, matching the tier cards' bullet treatment. */
function RateCardCheckIcon() {
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
 * One row of the scan price list: what you are scanning, what it costs in
 * credits, and the same figure in dollars so nobody has to multiply.
 *
 * @param props.scope - The rate-card scope to render.
 */
function RateCardRow({ scope }: { scope: (typeof SCAN_RATE_CARD)[number] }) {
  try {
    const creditWord = scope?.credits === 1 ? "credit" : "credits";
    return (
      <li className={styles.rateRow} data-scope={scope?.id}>
        <span className={styles.rateLabel}>
          <span className={styles.rateScope}>{scope?.label}</span>
          {scope?.sublabel ? (
            <span className={styles.rateSub}>{scope.sublabel}</span>
          ) : null}
        </span>
        <span className={styles.ratePrice}>
          <span className={styles.rateCredits}>
            {scope?.credits} {creditWord}
          </span>
          <span className={styles.rateDollars}>
            {getCreditsPriceLabel(scope?.credits)}
          </span>
        </span>
      </li>
    );
  } catch {
    return null;
  }
}

/**
 * The AI pricing section: bulk pricing by default, and à la carte (the
 * scan price list, a worked project example, and the one-time top-up
 * packs) behind the switch. Prices don't move with the billing period, so
 * the section reads nothing from the page's BillingProvider.
 */
export default function AiCreditsRateCard() {
  try {
    const exampleCost = getCreditsPriceLabel(TYPICAL_PROJECT_CREDITS);

    return (
      <section className={styles.section} data-section="ai-credits-rate-card">
        <div className={styles.inner}>
          <div className={styles.intro}>
            <h2 className={styles.heading}>{HEADING}</h2>
            <p className={styles.lede}>{LEDE}</p>
          </div>

          <AiPricingModeSwitch
            bulkHint={`$${BULK_SITE_PLAN.priceUsd}/site`}
            bulk={<BulkPricingCard />}
            alaCarte={
              <div className={styles.alaCarte}>
                <p className={styles.panelLede}>{ALA_CARTE_LEDE}</p>
                <div className={styles.grid}>
                  <div className={styles.rateCard}>
                    <div className={styles.cardHead}>
                      <p className={styles.cardTitle}>What a scan costs</p>
                      <p className={styles.cardUnit}>
                        1 credit = ${CREDIT_UNIT_PRICE_USD.toFixed(2)}
                      </p>
                    </div>
                    <ul className={styles.rateList}>
                      {SCAN_RATE_CARD.map((scope) => (
                        <RateCardRow key={scope.id} scope={scope} />
                      ))}
                    </ul>
                    <div className={styles.example}>
                      <p className={styles.exampleTitle}>{EXAMPLE_TITLE}</p>
                      <p className={styles.exampleBody}>{EXAMPLE_BODY}</p>
                      <dl className={styles.compare}>
                        <div className={styles.compareRow}>
                          <dt className={styles.compareLabel}>
                            {EXAMPLE_AGENT_LABEL}
                          </dt>
                          <dd className={styles.compareValue}>
                            <span className={styles.compareFigure}>
                              {TYPICAL_PROJECT_CREDITS} credits
                            </span>
                            {exampleCost ? (
                              <span className={styles.compareNote}>
                                about {exampleCost}
                              </span>
                            ) : null}
                          </dd>
                        </div>
                        <div className={styles.compareRow}>
                          <dt className={styles.compareLabel}>
                            {EXAMPLE_MANUAL_LABEL}
                          </dt>
                          <dd className={styles.compareValue}>
                            <span
                              className={`${styles.compareFigure} ${styles.compareManual}`}
                            >
                              {MANUAL_PASS_HOURS_LABEL}
                            </span>
                            <span className={styles.compareNote}>
                              {EXAMPLE_MANUAL_NOTE}
                            </span>
                          </dd>
                        </div>
                      </dl>
                      <p className={styles.exampleFootnote}>
                        Hours valued as billable time at ${BILLING_RATE_USD}/hr, the
                        mid preset in our{" "}
                        <Link className={styles.exampleLink} href="/calculator">
                          ROI calculator
                        </Link>
                        . Agents take the mechanical pass; your team keeps the
                        judgment calls.
                      </p>
                    </div>
                  </div>

                  <div className={styles.packsCard}>
                    <div className={styles.cardHead}>
                      <p className={styles.cardTitle}>Need more credits</p>
                      <p className={styles.cardUnit}>One-time packs</p>
                    </div>
                    <ul className={styles.packList}>
                      {CREDIT_PACKS.map((pack) => (
                        <li key={pack.id} className={styles.packRow}>
                          <span className={styles.packLabel}>
                            <span className={styles.packCredits}>
                              {pack.credits.toLocaleString("en-US")} credits
                            </span>
                            <span className={styles.packSub}>
                              {getProjectsLabel(pack.credits)} · {getPerCreditLabel(pack)}
                            </span>
                          </span>
                          <span className={styles.packPrice}>${pack.priceUsd}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className={styles.packNotes}>
                      {PACK_NOTES.map((note) => (
                        <li key={note} className={styles.packNote}>
                          <RateCardCheckIcon />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                    <p className={styles.packFooter}>
                      Running more than a few hundred dollars of credits a month?{" "}
                      <Link className={styles.packLink} href="/book-demo">
                        Talk to us about Enterprise
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
