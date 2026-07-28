// AI credit add-on packs from the AI Credits rate card (v2, flat
// pricing): every agent review (one agent reviewing one page) costs a
// flat 10 credits. Server-safe module so /pricing can build the packs'
// Product JSON-LD offers from the same array. Per-plan monthly
// allowances live with the tier data in
// components/pricing/pricing-data.ts.

export type CreditPack = {
  id: "small" | "medium" | "large";
  name: string;
  credits: number;
  priceUsd: number;
  /** Discounted pack price shown while annual billing is selected,
   *  mirroring the seat cards' annual strikethrough treatment. */
  annualPriceUsd: number;
};

/** One-time add-on packs. Purchased credits roll over month to month. */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "small", name: "Small", credits: 500, priceUsd: 20, annualPriceUsd: 18 },
  { id: "medium", name: "Medium", credits: 2500, priceUsd: 90, annualPriceUsd: 80 },
  { id: "large", name: "Large", credits: 10000, priceUsd: 340, annualPriceUsd: 300 },
];

/** Flat credit cost of one agent review (one agent reviewing one page). */
export const CREDITS_PER_AGENT_REVIEW = 10;

/** Agents per page assumed by the plain-English allowance estimate. */
export const AGENTS_PER_PAGE_ESTIMATE = 3;

/** Estimate line shown on custom-contract tiers, which have no fixed
 *  monthly allowance to translate into pages. */
export const CUSTOM_CREDITS_ESTIMATE = "Sized to your review volume";

/**
 * Whole pages a credit amount covers when every page is reviewed by the
 * assumed 3 agents. Every agent review is a flat 10 credits, so one page
 * costs 10 × 3 credits.
 *
 * @param credits - The credit amount to translate.
 * @returns The page count, or null when the amount is missing or covers
 *          less than a full page.
 */
function getEstimatedPages(credits?: number): number | null {
  try {
    if (!credits || credits <= 0) {
      return null;
    }
    const creditsPerPage = CREDITS_PER_AGENT_REVIEW * AGENTS_PER_PAGE_ESTIMATE;
    const pages = Math.floor(credits / creditsPerPage);
    return pages >= 1 ? pages : null;
  } catch {
    return null;
  }
}

/**
 * Plain-English line under the credits chip ("≈ 10 pages with 3 agents"),
 * spelling out the agents-per-page assumption in full.
 *
 * @param monthlyCredits - The plan's included monthly credits.
 * @returns The estimate label, or null when there is no whole-page estimate.
 */
export function getPagesWithAgentsLabel(monthlyCredits?: number): string | null {
  try {
    const pages = getEstimatedPages(monthlyCredits);
    if (pages === null) {
      return null;
    }
    const pageWord = pages === 1 ? "page" : "pages";
    return `≈ ${pages.toLocaleString("en-US")} ${pageWord} with ${AGENTS_PER_PAGE_ESTIMATE} agents`;
  } catch {
    return null;
  }
}

/**
 * Short estimate for the add-on pack rows ("≈ 16 pages"). Drops the
 * "with 3 agents" qualifier because the chip line directly above the
 * open dropdown already states it.
 *
 * @param credits - The pack's credit amount.
 * @returns The estimate label, or null when there is no whole-page estimate.
 */
export function getPagesLabel(credits?: number): string | null {
  try {
    const pages = getEstimatedPages(credits);
    if (pages === null) {
      return null;
    }
    const pageWord = pages === 1 ? "page" : "pages";
    return `≈ ${pages.toLocaleString("en-US")} ${pageWord}`;
  } catch {
    return null;
  }
}
