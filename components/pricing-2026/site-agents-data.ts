// Watch and Care: the per-site half of /pricing (pricing v8).
//
// Every site in a workspace is watched for free (Watch). Care is the paid
// state of a site: $10 per site per month, 1 included on Growth and 3 on
// Scale. Server-safe module (no "use client") so the section, comparison
// table, FAQ, Product JSON-LD, /pricing.md and /llms-full.txt all quote the
// same price and the same capability list.
//
// The export names keep their old SITE_AGENTS_ prefix so every consumer
// (calculator, comparison pages, Markdown copies) follows the new price
// without a rename. Keep the numbers equal to the portal's plan catalog
// (shared-firebase-function PRICING_V8_CARE_PRICE_USD and the plan docs).

/** Price of one Care site per month, in USD. */
export const SITE_AGENTS_PRICE_USD = 10;

/** "$10 per site per month": the price as prose. */
export const SITE_AGENTS_PRICE_LABEL = `$${SITE_AGENTS_PRICE_USD} per site per month`;

/** Care sites included in each plan before the per-site price applies. */
export const CARE_SITES_INCLUDED = { growth: 1, scale: 3 } as const;

/** Which plans can put a site on Care. */
export const SITE_AGENTS_AVAILABILITY =
  `Growth includes ${CARE_SITES_INCLUDED.growth} Care site and Scale includes ${CARE_SITES_INCLUDED.scale}; more are $${SITE_AGENTS_PRICE_USD} each. Custom on Enterprise.`;

/** What the price buys, as a name. */
export const SITE_AGENTS_NAME = "Care";

/** The free state every site starts in. */
export const WATCH_NAME = "Watch";

export type SiteAgentsCapability = {
  id: string;
  label: string;
  description: string;
};

/** What Watch gives every site for free, in display order. */
export const WATCH_CAPABILITIES: SiteAgentsCapability[] = [
  {
    id: "uptime",
    label: "Uptime and Site Score",
    description: "An uptime check every 5 minutes and a live Site Score for every site.",
  },
  {
    id: "agents",
    label: "Agents on every changed page",
    description: "QA agents check each page that changes and count every issue they find.",
  },
  {
    id: "top-issues",
    label: "Top 2 issues in full",
    description: "The 2 most severe issues in full. The rest are counted and locked.",
  },
  {
    id: "history",
    label: "Version history",
    description: "Which pages changed and when, for your plan's history window.",
  },
];

/** What Care adds to a site, in display order. */
export const SITE_AGENTS_CAPABILITIES: SiteAgentsCapability[] = [
  {
    id: "every-issue",
    label: "Every issue in full",
    description: "Every finding, pinned on the page, with a fix suggestion.",
  },
  {
    id: "compare",
    label: "Side-by-side diffs",
    description: "See exactly what changed between any two versions in your history window.",
  },
  {
    id: "verify",
    label: "Verify fix by rescan",
    description: "Rescan on deploy or on demand. A rescan confirms each fix before it counts.",
  },
  {
    id: "report",
    label: "Monthly client report",
    description: "A plain-words report and Machine Work Ledger with your logo. White-label on Scale.",
  },
];

/** "every issue in full, side-by-side diffs, verify fix by rescan and monthly client report". */
export const SITE_AGENTS_CAPABILITIES_SENTENCE = (() => {
  const labels = SITE_AGENTS_CAPABILITIES.map((item) => item.label.toLowerCase());
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
})();
