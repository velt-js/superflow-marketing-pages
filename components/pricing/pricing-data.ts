// Pricing-page data: single source of truth for both the four tier cards and
// the long feature comparison table on /pricing.
//
// Pricing v8, in plain product language: pay per team seat, guests are
// free, every site gets basic monitoring and version history for free, and
// full monitoring and version control is $10 per site per month. No internal
// plan codenames in anything a visitor reads.
//
// The comparison table follows the plan table the portal shows on
// Settings > Billing (superflow_portal_v2, SITES_AND_MONITORING_ROWS and
// PricingFeatureTableView): the same plan values, with the monitoring rows
// regrouped and renamed for this page. Like the portal, it leaves out spec
// rows for features the product does not have yet (Linear, Trello and Jira, reports on your own domain and sender, form
// testing, Workfront and friends, dedicated scanner IPs, an org above
// workspaces, approval snapshots). Add such a row only together with the
// portal.
//
// The per-site price and the monitoring tiers' wording live in
// components/pricing-2026/site-agents-data.ts.

import {
  CARE_SITES_INCLUDED,
  SITE_AGENTS_PRICE_USD,
} from "@/components/pricing-2026/site-agents-data";

export type TierBullet = {
  text: string;
  /** Renders the bullet without a check (used for "Everything in X, plus"
   *  section dividers inside the bullet list). */
  divider?: boolean;
};

export type Tier = {
  id: "starter" | "growth" | "scale" | "enterprise";
  name: string;
  /** Hex accent for the tier name and comparison-table column accents. */
  accent: string;
  /** Monthly price label (string so we can carry "0" and "Contact us"). */
  monthlyPrice: string;
  /** Annual-per-month price label. */
  annualPrice: string;
  /** When set and Annual is selected, this number is rendered with a
   *  strikethrough next to the annual price ("$24 ~~$29~~"). */
  annualStrikePrice?: string;
  /** When true, the price is a custom contract: the card shows the price
   *  string as-is rather than the "/seat/mo" suffix. */
  customPrice?: boolean;
  /** One line under the plan name: who the plan is for. */
  bestFor: string;
  /** Small uppercase label above the CTA button. */
  trialLabel?: string;
  /** Pill rendered above the card. Currently only Scale. */
  badge?: string;
  /** When true, the card gets the accent ring. */
  highlighted?: boolean;
  cta: { label: string; href: string };
  bullets: TierBullet[];
};

export type CellValue =
  | { kind: "check" }
  | { kind: "x" }
  | {
      kind: "text";
      /** Shown on monthly billing, and always when `annualValue` is unset. */
      value: string;
      sub?: string;
      /** Shown instead of `value` while annual billing is selected. */
      annualValue?: string;
    };

export type Row = {
  label: string;
  /** Optional muted second line under the label. */
  sublabel?: string;
  /** [Starter, Growth, Scale, Enterprise] */
  values: [CellValue, CellValue, CellValue, CellValue];
};

export type Section = {
  /** Coloured section heading, e.g. "Sites and monitoring". */
  title: string;
  /** Hex color for the section heading text. */
  accent: string;
  rows: Row[];
};

const check: CellValue = { kind: "check" };
const cross: CellValue = { kind: "x" };
const text = (value: string, sub?: string): CellValue => ({
  kind: "text",
  value,
  sub,
});
/** The same text in every column. */
const all = (value: string): Row["values"] => [text(value), text(value), text(value), text(value)];
/** Included on every plan. */
const ALL: Row["values"] = [check, check, check, check];
/** Growth and up. */
const GROWTH_UP: Row["values"] = [cross, check, check, check];
/** Scale and up. */
const SCALE_UP: Row["values"] = [cross, cross, check, check];
/** Enterprise only. */
const ENTERPRISE_ONLY: Row["values"] = [cross, cross, cross, check];

export const APP_URL = "https://app.usesuperflow.com";
export const SALES_URL = "/book-demo";

/** "1 site with full monitoring & version history (then $10/site)": the per-site upgrade on a paid card. */
const fullMonitoringIncluded = (sites: number): string =>
  `${sites} ${sites === 1 ? "site" : "sites"} with full monitoring & version history (then $${SITE_AGENTS_PRICE_USD}/site)`;

// --- Tier cards --------------------------------------------------------------
// Each card lists only what it adds over the plan before it ("Everything in
// Starter, plus"): basic monitoring and version history are on Starter, so
// they are not repeated; the comparison table carries the detail. Plain, literal wording: no
// internal plan codenames. The portal's plan cards (superflow_portal_v2
// BillingPlansService `featureList`) carried the same bullets until this
// wording pass; keep them in step when that copy is updated.

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    accent: "#FF74A8",
    monthlyPrice: "0",
    annualPrice: "0",
    bestFor: "Try it on one site",
    cta: { label: "Start Free", href: APP_URL },
    bullets: [
      { text: "1 Project" },
      { text: "1 Team Seat" },
      { text: "Unlimited Guest Seats" },
      { text: "1GB Storage" },
      { text: "Basic site monitoring & version history" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    accent: "#20D4FF",
    monthlyPrice: "29",
    annualPrice: "24",
    annualStrikePrice: "29",
    bestFor: "Small teams with a few client sites",
    cta: { label: "Start Free Trial", href: APP_URL },
    bullets: [
      { text: "Everything in Starter, plus", divider: true },
      { text: "Unlimited projects" },
      { text: fullMonitoringIncluded(CARE_SITES_INCLUDED.growth) },
      { text: "Lead audits" },
      { text: "Client requests" },
      { text: "Asana, ClickUp and Monday" },
      { text: "Monitoring for up to 250 pages per site" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    accent: "#A78BFA",
    monthlyPrice: "39",
    annualPrice: "32",
    annualStrikePrice: "39",
    bestFor: "Agencies with many client sites",
    badge: "Most agencies",
    highlighted: true,
    cta: { label: "Start Free Trial", href: APP_URL },
    bullets: [
      { text: "Everything in Growth, plus", divider: true },
      { text: fullMonitoringIncluded(CARE_SITES_INCLUDED.scale) },
      { text: "White-label reports and client requests" },
      { text: "Custom AI checks" },
      { text: "Monitoring for up to 500 pages per site" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    accent: "#FFB46E",
    monthlyPrice: "Contact us",
    annualPrice: "Contact us",
    customPrice: true,
    bestFor: "Brands and large portfolios",
    cta: { label: "Talk to sales", href: SALES_URL },
    bullets: [
      { text: "Everything in Scale, plus", divider: true },
      { text: "Custom seats, sites and pages" },
      { text: "QA behind login and VPN" },
      { text: "SSO, SCIM and HIPAA" },
      { text: "365-day history" },
    ],
  },
];

/**
 * Team Seats cell for a paid tier: the per-seat price in both billing
 * periods, read from the tier cards so the table follows the toggle and
 * cannot drift from the cards.
 *
 * @param tierId - The tier whose seat price is rendered.
 * @returns The cell value, or "Custom" when the tier has no seat price.
 */
const seatPriceCell = (tierId: Tier["id"]): CellValue => {
  try {
    const tier = TIERS.find((candidate) => candidate.id === tierId);
    if (!tier || tier.customPrice) {
      return text("Custom");
    }
    return {
      kind: "text",
      value: `$${tier.monthlyPrice}/seat/mo`,
      annualValue: `$${tier.annualPrice}/seat/mo billed yearly`,
    };
  } catch {
    return text("Custom");
  }
};

// --- Comparison table --------------------------------------------------------
// Order: [starter, growth, scale, enterprise]. Rows and cells follow the
// portal's plan table, in plain wording: the free per-site baseline reads as
// included on every plan (never as a dash), and the paid per-site upgrade is
// "Full monitoring & version control". Starter cannot buy the upgrade (the
// billing backend refuses it without a paid plan), so its cell says so.

export const SECTIONS: Section[] = [
  {
    title: "Core",
    accent: "#FF5A7A",
    rows: [
      {
        label: "Team seats",
        values: [text("1"), seatPriceCell("growth"), seatPriceCell("scale"), text("Custom")],
      },
      { label: "Guest reviewers (always free)", values: all("Unlimited") },
      {
        label: "Review projects",
        values: [text("1"), text("Unlimited"), text("Unlimited"), text("Unlimited")],
      },
      {
        label: "Version history",
        sublabel: "Included on every plan: which pages changed, when",
        values: [
          text("30 days"),
          text("90 days"),
          text("180 days"),
          text("365 days, immutable"),
        ],
      },
      { label: "Add a site by URL, nothing to install", values: ALL },
      { label: "Staging password per site", values: GROWTH_UP },
      { label: "First site scan", values: all("Full scan free, up to 100 pages") },
      { label: "Uptime every 5 minutes", values: ALL },
      { label: "Usage limits", values: all("None") },
    ],
  },
  {
    title: "Monitoring & Version Control",
    accent: "#9333EA",
    rows: [
      { label: "Basic site monitoring & version history", values: all("Included") },
      {
        label: "Monitored pages per site",
        values: [
          text("100", "first scan"),
          text("250"),
          text("500", "raised on request"),
          text("Custom"),
        ],
      },
      {
        label: "Full monitoring & version control",
        sublabel: "Flat price per site, per month",
        values: [
          text("Upgrade plan"),
          text(`$${SITE_AGENTS_PRICE_USD} /mo/site`),
          text(`$${SITE_AGENTS_PRICE_USD} /mo/site`, "50+ sites? Talk to us"),
          text("Custom"),
        ],
      },
      {
        label: "Sites with full monitoring included",
        values: [
          cross,
          text(`${CARE_SITES_INCLUDED.growth}`),
          text(`${CARE_SITES_INCLUDED.scale}`),
          text("Custom"),
        ],
      },
      { label: "Continuous change detection", values: GROWTH_UP },
      { label: "Visual compare / diff", values: GROWTH_UP },
      { label: "Automated QA checks", values: GROWTH_UP },
      {
        label: "Daily change and QA checks",
        values: [
          text("Top 2 issues"),
          text("All issues and pins"),
          text("All issues and pins"),
          text("All issues and pins"),
        ],
      },
      { label: "Weekly full check (hash-gated)", values: GROWTH_UP },
      { label: "Deploy-triggered checks and Rescan now", values: GROWTH_UP },
    ],
  },
  {
    title: "QA checks",
    accent: "#7C3AED",
    rows: [
      {
        label: "Default checks (visual, links, copy, SEO, a11y)",
        values: [text("First scan + top 2 issues"), check, check, check],
      },
      {
        label: "Site score and check-level view",
        values: [text("Score + top 2 issues"), check, check, check],
      },
      { label: "Deduplicated component issues", values: ALL },
      { label: "Verify on resolve", values: GROWTH_UP },
      {
        label: "Custom AI checks",
        values: [cross, cross, text("1 per fully monitored site"), text("Unlimited")],
      },
      { label: "Ask AI", values: GROWTH_UP },
    ],
  },
  {
    title: "Review and collaboration",
    accent: "#2F84D2",
    rows: [
      { label: "Comments, pins, screenshots, recordings, voice", values: ALL },
      { label: "Website, PDF, video, image and Lottie review", values: ALL },
      { label: "Cross-device review", values: ALL },
      { label: "Logged-in page review (human, via extension)", values: ALL },
      { label: "Private comments, custom statuses, access control", values: SCALE_UP },
    ],
  },
  {
    title: "Reports and clients",
    accent: "#0C8A58",
    rows: [
      {
        label: "Monthly client report, plain words, before and after",
        values: [text("Preview"), check, check, check],
      },
      { label: "Machine Work Ledger", values: [text("Preview"), check, check, check] },
      { label: "Share links and PDF", values: GROWTH_UP },
      {
        label: "Site history",
        values: [cross, text("90 days"), text("180 days"), text("365 days")],
      },
      { label: "Portfolio report across all sites", values: GROWTH_UP },
      { label: "White-label reports", values: GROWTH_UP },
      {
        label: "\"Checked by Superflow\" footer",
        values: [text("Shown"), text("Shown"), text("Removed"), text("Removed")],
      },
      { label: "White-label toolbar", values: SCALE_UP },
      {
        label: "Client requests",
        values: [cross, text("Yes"), text("White-labeled"), text("White-labeled")],
      },
    ],
  },
  {
    title: "Lead audits",
    accent: "#D4840D",
    rows: [
      {
        label: "Lead audits (branded, \"Checked by Superflow\")",
        values: [cross, text("Unlimited"), text("Unlimited"), text("Unlimited")],
      },
      {
        label: "White-label lead audits (no footer)",
        values: [cross, cross, text("10 free a month, then $5 each"), text("Included")],
      },
      { label: "Free preview of any site, no account", values: ALL },
      { label: "\"Won the client\" turns an audit into a fully monitored site", values: GROWTH_UP },
    ],
  },
  {
    title: "Integrations and developers",
    accent: "#672FF5",
    rows: [
      { label: "Email and Slack", values: ALL },
      { label: "Asana, ClickUp and Monday", values: GROWTH_UP },
      { label: "Webhooks and REST API", values: GROWTH_UP },
      {
        label: "MCP for Claude, Cursor and Claude Code",
        values: [text("Read"), check, check, check],
      },
    ],
  },
  {
    title: "Enterprise",
    accent: "#F62F6A",
    rows: [
      { label: "Automated QA behind login, private staging and VPN", values: ENTERPRISE_ONLY },
      { label: "SOC 2 Type II, encryption in transit and at rest", values: ENTERPRISE_ONLY },
      {
        label: "Uptime SLA",
        values: [cross, cross, cross, text("99.999%")],
      },
      { label: "SAML SSO, SCIM, self-hosting, HIPAA with BAA, audit log", values: ENTERPRISE_ONLY },
      {
        label: "Support",
        values: [
          text("Community"),
          text("Email and chat"),
          text("Priority"),
          text("Named CSM, onboarding"),
        ],
      },
      {
        label: "How to buy",
        values: [text("Free signup"), text("Card"), text("Card"), text("Contract, PO, net-60")],
      },
    ],
  },
];

/** One plan as a short price summary: name, price, how it is billed. */
export type PlanSummary = { planName: string; price: string; billing: string };

/**
 * Superflow's plans as one-line price summaries, read from TIERS. The
 * alternative pages' pricing table and its Markdown copy show these in
 * Superflow's column instead of the CMS cells, which carried a flat
 * "$249 / $449" model years out of date.
 */
export const SUPERFLOW_PLAN_SUMMARIES: PlanSummary[] = TIERS.map((tier) => {
  if (tier.customPrice) {
    return { planName: tier.name, price: tier.monthlyPrice, billing: "Custom" };
  }
  if (tier.monthlyPrice === "0") {
    return { planName: tier.name, price: "$0", billing: "Free forever" };
  }
  return {
    planName: tier.name,
    price: `$${tier.annualPrice}`,
    billing: `per seat / month, billed yearly ($${tier.monthlyPrice} monthly)`,
  };
});

/**
 * Whether a comparison column is Superflow's (so its prices come from
 * SUPERFLOW_PLAN_SUMMARIES rather than the CMS).
 *
 * @param name - The column's product name.
 * @returns True for "Superflow", case and spacing ignored.
 */
export function isSuperflowColumn(name: string | undefined | null): boolean {
  try {
    return (name ?? "").trim().toLowerCase() === "superflow";
  } catch {
    return false;
  }
}
