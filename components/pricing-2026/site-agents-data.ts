// QA agents + always-on monitoring: the one AI price on /pricing.
//
// Flat per site, per month; replaces the AI credits rate card. Server-safe
// module (no "use client") so the section, comparison table, FAQ, Product
// JSON-LD, /pricing.md and /llms-full.txt all quote the same price and the
// same capability list.

/** Price per site per month, in USD. */
export const SITE_AGENTS_PRICE_USD = 14;

/** "$14 per site per month" — the price as prose. */
export const SITE_AGENTS_PRICE_LABEL = `$${SITE_AGENTS_PRICE_USD} per site per month`;

/** Which plans can add it. Starter has no QA agents add-on; Enterprise
 *  prices it in the contract. */
export const SITE_AGENTS_AVAILABILITY =
  "Available on Growth and Scale; custom pricing on Enterprise.";

/** What the price buys, as a name. */
export const SITE_AGENTS_NAME = "QA agents + always-on monitoring";

export type SiteAgentsCapability = {
  id: "versioning" | "change-detection" | "compare" | "checks";
  label: string;
  description: string;
};

/** What every site gets, in display order. */
export const SITE_AGENTS_CAPABILITIES: SiteAgentsCapability[] = [
  {
    id: "versioning",
    label: "Automatic versioning",
    description: "Every change to the site is captured as a new version. No set up needed.",
  },
  {
    id: "change-detection",
    label: "Change detection",
    description: "Monitoring is always on, so a change is caught the moment it ships.",
  },
  {
    id: "compare",
    label: "Compare / diff",
    description: "See exactly what changed between versions, side by side.",
  },
  {
    id: "checks",
    label: "Run checks",
    description: "QA agents check each change and flag if they find an issue.",
  },
];

/** "automatic versioning, change detection, compare / diff and run checks". */
export const SITE_AGENTS_CAPABILITIES_SENTENCE = (() => {
  const labels = SITE_AGENTS_CAPABILITIES.map((item) => item.label.toLowerCase());
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
})();
