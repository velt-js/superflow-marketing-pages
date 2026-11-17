// Site monitoring and version history: the per-site half of /pricing.
//
// Every site gets basic monitoring and version history for free, on every
// plan. Full monitoring and version history is a paid upgrade per site:
// $10 per site per month, 1 site included on Growth and 3 on Scale.
// Server-safe module (no "use client") so the section, comparison table, FAQ,
// Product JSON-LD, /pricing.md and /llms-full.txt all quote the same price
// and the same wording.
//
// Copy rule: plain, literal product language. No internal plan codenames
// in anything a visitor reads, and the free baseline is described by what it
// includes, never as a reduced version.
//
// The export names keep their old SITE_AGENTS_ prefix so every consumer
// (calculator, comparison pages, Markdown copies) follows without a rename.
// Keep the numbers equal to the portal's plan catalog
// (shared-firebase-function PRICING_V8_CARE_PRICE_USD and the plan docs).

/** Price of full monitoring and version history, per site per month, in USD. */
export const SITE_AGENTS_PRICE_USD = 10;

/** "$10 per site per month": the price as prose. */
export const SITE_AGENTS_PRICE_LABEL = `$${SITE_AGENTS_PRICE_USD} per site per month`;

/** Sites with full monitoring included in each plan before the per-site price applies. */
export const CARE_SITES_INCLUDED = { growth: 1, scale: 3 } as const;

/** Which plans include, and can add, full monitoring sites. */
export const SITE_AGENTS_AVAILABILITY =
  `Growth includes ${CARE_SITES_INCLUDED.growth} site with full monitoring and Scale includes ${CARE_SITES_INCLUDED.scale}; more are $${SITE_AGENTS_PRICE_USD} each. Custom on Enterprise.`;

/** The paid per-site upgrade, as a name. */
export const SITE_AGENTS_NAME = "Full monitoring & version history";

/** What every site gets for free, as a name. */
export const WATCH_NAME = "Basic monitoring & version history";

/** The free tier's card: label, price, unit and what it includes. */
export const FREE_SITE_TIER = {
  label: "Free on every site",
  price: "$0",
  unit: "Included on all plans",
  description: "Basic site monitoring, version history, and live review comments.",
} as const;

/** The paid tier's card: label, price, unit and what it includes. */
export const PAID_SITE_TIER = {
  label: SITE_AGENTS_NAME,
  price: `$${SITE_AGENTS_PRICE_USD}`,
  unit: "per site / month",
  description: "Continuous change detection, side-by-side visual diffs, and automated QA checks.",
} as const;

export type SiteAgentsCapability = {
  id: string;
  label: string;
  description: string;
};

/**
 * What full monitoring and version history adds to a site, in display order.
 * Version history is not here: every plan includes it, on free sites too.
 */
export const SITE_AGENTS_CAPABILITIES: SiteAgentsCapability[] = [
  {
    id: "monitoring",
    label: "Continuous monitoring",
    description: "Detect layout, content, and code changes the moment they ship.",
  },
  {
    id: "compare",
    label: "Side-by-side diffs",
    description: "Compare versions visually to see exactly what changed.",
  },
  {
    id: "checks",
    label: "Automated QA checks",
    description: "Flag visual and functional issues automatically on every update.",
  },
];

/** "continuous monitoring, side-by-side diffs and automated QA checks". */
export const SITE_AGENTS_CAPABILITIES_SENTENCE = (() => {
  const labels = SITE_AGENTS_CAPABILITIES.map((item) => item.label.charAt(0).toLowerCase() + item.label.slice(1));
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
})();
