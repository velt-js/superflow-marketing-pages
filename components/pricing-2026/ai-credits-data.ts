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
};

/** One-time add-on packs. Purchased credits roll over month to month. */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "small", name: "Small", credits: 500, priceUsd: 20 },
  { id: "medium", name: "Medium", credits: 2500, priceUsd: 90 },
  { id: "large", name: "Large", credits: 10000, priceUsd: 340 },
];
