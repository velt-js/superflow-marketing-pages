// AI credits rate card (v4, scan-based pricing) — replaces the v2
// per-agent-review model. Agents are priced like the work they do: you
// buy a *scan*, and a scan checks the whole site with every agent. Scans
// are priced by scope (page, small/medium/large/XL site), and a rescan is
// always 1 credit because only the changed pages get reviewed.
//
// Server-safe module (no "use client") so /pricing, the rate-card
// section and /llms-full.txt can all build their copy and Product
// JSON-LD offers from the same arrays. Per-plan monthly allowances live
// with the tier data in components/pricing/pricing-data.ts.

/** List price of a single credit. Every scope below is a multiple of it. */
export const CREDIT_UNIT_PRICE_USD = 0.4;

/** One-time bonus dropped into every new workspace: enough for one full
 *  site scan at any size. */
export const SIGNUP_BONUS_CREDITS = 30;

/**
 * Credits a typical project consumes end to end: one medium-site scan
 * (10) plus the four rescans a project averages before sign-off (1 each).
 * Used to translate credit amounts into projects.
 */
export const TYPICAL_PROJECT_CREDITS = 14;

/** Rescans only re-review changed pages; past this share of the site the
 *  run is billed as a fresh scan. */
export const RESCAN_NEW_SCAN_THRESHOLD = "over 50% changed counts as a new scan";

export type ScanScope = {
  id: "asset" | "small" | "medium" | "large" | "xl" | "rescan";
  /** Row label on the rate card and in the comparison table. */
  label: string;
  /** Muted second line: the page range or the rescan rule. */
  sublabel?: string;
  credits: number;
};

/**
 * The whole price list. Band edges (30 / 100 / 250 pages) come from the
 * site census; 88% of measured sites land at 10 credits or less.
 */
export const SCAN_RATE_CARD: ScanScope[] = [
  {
    id: "asset",
    label: "Single page or asset",
    sublabel: "One URL, PDF, image, video or Lottie file",
    credits: 1,
  },
  { id: "small", label: "Small site scan", sublabel: "Up to 30 pages", credits: 5 },
  { id: "medium", label: "Medium site scan", sublabel: "31 to 100 pages", credits: 10 },
  { id: "large", label: "Large site scan", sublabel: "100 to 250 pages", credits: 15 },
  { id: "xl", label: "XL site scan", sublabel: "250+ pages", credits: 30 },
  {
    id: "rescan",
    label: "Rescan, any size",
    sublabel: `Only changed pages are reviewed (${RESCAN_NEW_SCAN_THRESHOLD})`,
    credits: 1,
  },
];

export type CreditPack = {
  id: "small" | "medium" | "large";
  name: string;
  credits: number;
  priceUsd: number;
};

/** One-time add-on packs. Purchased credits roll over month to month. */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "small", name: "Small", credits: 25, priceUsd: 10 },
  { id: "medium", name: "Medium", credits: 70, priceUsd: 25 },
  { id: "large", name: "Large", credits: 145, priceUsd: 49 },
];

/**
 * What the same first pass costs by hand. Hours are the measured manual
 * QA pass per site per round; the rate is the 10-person-agency preset
 * from the ROI calculator on /calculator (components/home-2026/
 * CostSection.tsx), so the two pages quote the same assumption.
 *
 * Deliberately a *billing* rate, not a wage: the dollar figure is
 * billable time the pass consumes, never the cost of the person doing it.
 */
export const MANUAL_PASS_HOURS_LOW = 3;
export const MANUAL_PASS_HOURS_HIGH = 4;
export const BILLING_RATE_USD = 125;

/** "3 to 4 hours" — the manual pass, in hours. */
export const MANUAL_PASS_HOURS_LABEL = `${MANUAL_PASS_HOURS_LOW} to ${MANUAL_PASS_HOURS_HIGH} hours`;

/** "$375 to $500" — the same pass as billable time. */
export const MANUAL_PASS_BILLABLE_LABEL = `$${(
  MANUAL_PASS_HOURS_LOW * BILLING_RATE_USD
).toLocaleString("en-US")} to $${(
  MANUAL_PASS_HOURS_HIGH * BILLING_RATE_USD
).toLocaleString("en-US")}`;

/** Estimate line shown on custom-contract tiers, which have no fixed
 *  allowance to translate into scans. */
export const CUSTOM_CREDITS_ESTIMATE = "Sized to your review volume";

/**
 * Formats a credit count as its list-price dollar value ($0.40 each).
 *
 * @param credits - The credit amount to price.
 * @returns The dollar label, or null when the amount is missing.
 */
export function getCreditsPriceLabel(credits?: number): string | null {
  try {
    if (!credits || credits <= 0) {
      return null;
    }
    const dollars = credits * CREDIT_UNIT_PRICE_USD;
    const fixed = dollars.toFixed(2);
    return `$${fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed}`;
  } catch {
    return null;
  }
}

/**
 * Per-credit price of an add-on pack, so buyers can see that bigger
 * packs cost less per credit without any arithmetic of their own.
 *
 * @param pack - The pack to price.
 * @returns The "$0.36 / credit" label, or null when the pack is invalid.
 */
export function getPerCreditLabel(pack?: CreditPack): string | null {
  try {
    if (!pack?.credits || pack.credits <= 0) {
      return null;
    }
    return `$${(pack.priceUsd / pack.credits).toFixed(2)} / credit`;
  } catch {
    return null;
  }
}

/**
 * Translates a credit amount into the plain-English line shown under the
 * credits chip and on each add-on pack row ("≈ 5 projects"). A project is
 * one medium-site scan plus its four rescans, measured from how agencies
 * actually run reviews.
 *
 * @param credits - The credit amount to translate.
 * @returns The estimate label, or null when the amount is missing or
 *          covers less than one project.
 */
export function getProjectsLabel(credits?: number): string | null {
  try {
    if (!credits || credits <= 0) {
      return null;
    }
    const projects = Math.round(credits / TYPICAL_PROJECT_CREDITS);
    if (projects < 1) {
      return null;
    }
    const projectWord = projects === 1 ? "project" : "projects";
    return `≈ ${projects.toLocaleString("en-US")} ${projectWord}, rescans included`;
  } catch {
    return null;
  }
}
