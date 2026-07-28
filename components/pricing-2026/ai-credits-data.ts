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

/** Estimate line shown on custom-contract tiers, which have no fixed
 *  allowance to translate into agent reviews. */
export const CUSTOM_CREDITS_ESTIMATE = "Sized to your review volume";

/**
 * Translates a credit amount into the plain-English line shown under the
 * credits chip and on each add-on pack row ("≈ 30 agent reviews"). Every
 * agent review is a flat 10 credits.
 *
 * @param credits - The credit amount to translate.
 * @returns The estimate label, or null when the amount is missing or
 *          covers less than one review.
 */
export function getAgentReviewsLabel(credits?: number): string | null {
  try {
    if (!credits || credits <= 0) {
      return null;
    }
    const reviews = Math.floor(credits / CREDITS_PER_AGENT_REVIEW);
    if (reviews < 1) {
      return null;
    }
    const reviewWord = reviews === 1 ? "agent review" : "agent reviews";
    return `≈ ${reviews.toLocaleString("en-US")} ${reviewWord}`;
  } catch {
    return null;
  }
}
