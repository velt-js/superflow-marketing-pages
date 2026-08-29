// AI credits rate card section on /pricing — the scan price list (v4),
// sitting between the tier cards and the feature comparison table.
//
// Server component: every figure comes from
// components/pricing-2026/ai-credits-data.ts, so the section, the tier
// chips, the comparison table and /llms-full.txt all quote one rate card.
// The gated 1,000-credit prepay pack is deliberately not shown here — it
// lives in billing, offered to high-spend accounts.

import Link from "next/link";
import {
  CREDIT_PACKS,
  CREDIT_UNIT_PRICE_USD,
  SCAN_RATE_CARD,
  SIGNUP_BONUS_CREDITS,
  TYPICAL_PROJECT_CREDITS,
  getCreditsPriceLabel,
  getPerCreditLabel,
  getProjectsLabel,
} from "./ai-credits-data";
import styles from "./AiCreditsRateCard.module.css";

const HEADING = "AI credits, priced like the work";
const LEDE =
  "One credit is $0.40. A scan checks your whole site with every agent — no per-agent multiplier, no per-page math, no token talk. A rescan is 1 credit, always: only the pages that changed get reviewed.";

/** Worked example under the rate card, built from the same numbers. */
const EXAMPLE_TITLE = "A typical project";
const EXAMPLE_BODY =
  "One medium-site scan plus the four rescans a project runs before sign-off.";

/** Reassurances under the packs, in display order. */
const PACK_NOTES = [
  `Every new workspace starts with ${SIGNUP_BONUS_CREDITS} bonus credits: your first full scan is free, at any site size.`,
  "Pack credits roll over month to month. Auto-refill tops you up $10 at a time, and you can switch it off.",
];

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
 * The AI credits rate card: the scan price list, a worked project
 * example, and the one-time top-up packs. Static content — safe to
 * render inside the page's BillingProvider without becoming a client
 * component, since pack prices don't move with the billing period.
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
                <p className={styles.exampleFigure}>
                  {TYPICAL_PROJECT_CREDITS} credits
                  {exampleCost ? (
                    <span className={styles.exampleDollars}>
                      about {exampleCost}
                    </span>
                  ) : null}
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
      </section>
    );
  } catch {
    return null;
  }
}
