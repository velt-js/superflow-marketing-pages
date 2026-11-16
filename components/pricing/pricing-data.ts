// Pricing-page data: single source of truth for both the four tier cards and
// the long feature comparison table on /pricing.
//
// Pricing v8 ("Seats for your team, sites for your book"). Seats for the
// people who run the work, Care sites for the client book, every site
// watched for free. The comparison table mirrors the plan table the portal
// shows on Settings > Billing (superflow_portal_v2,
// SITES_AND_MONITORING_ROWS and PricingFeatureTableView), row for row, so
// the two never disagree. The portal leaves out spec rows for features the
// product does not have yet (the live client request tab, Linear, Trello and
// Jira, reports on your own domain and sender, form testing, Workfront and
// friends, dedicated scanner IPs, an org above workspaces, approval
// snapshots); this table leaves out the same rows. Add a row here only
// together with the portal.
//
// The per-site Care price and the Watch / Care capabilities live in
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

/** "$10/site/mo", the Care price as a card bullet. */
const CARE_PRICE_SHORT = `$${SITE_AGENTS_PRICE_USD}/site/mo`;

// --- Tier cards --------------------------------------------------------------
// Pricing v8 spec section 5 ("The four cards": Review, Watch, Care, Extras),
// with the same omissions as the portal (see the header). The bullets are
// the portal's plan-card bullets word for word (superflow_portal_v2
// BillingPlansService `featureList`, the copy ops seeds into the plan docs):
// change both together.

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    accent: "#FF74A8",
    monthlyPrice: "0",
    annualPrice: "0",
    bestFor: "Review live pages and run your first full site scan",
    trialLabel: "FREE FOREVER",
    cta: { label: "Start for free", href: APP_URL },
    bullets: [
      { text: "1 seat and 1 site" },
      { text: "Review: unlimited guests and clients, always free" },
      { text: "Watch (free): a full scan of your first site, up to 100 pages" },
      { text: "Watch (free): issue counts and the top 2 issues in full" },
      { text: "Extras: 30 days of version history, Slack and email alerts, MCP (read)" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    accent: "#20D4FF",
    monthlyPrice: "29",
    annualPrice: "24",
    annualStrikePrice: "29",
    bestFor: "Small teams with a few retainers",
    cta: { label: "Start with card", href: APP_URL },
    bullets: [
      { text: "Review: unlimited projects, guests and clients, always free" },
      { text: "Review: Asana, ClickUp and Monday" },
      { text: "Watch (free): every site, checks on every changed page" },
      { text: `Care: ${CARE_SITES_INCLUDED.growth} site included, then ${CARE_PRICE_SHORT}` },
      { text: "Care: every issue in full, side-by-side diffs, verified fixes, monthly report" },
      { text: "Extras: unlimited branded prospect audits" },
      { text: "Extras: 250 pages per site, 90 days of version history" },
      { text: "Extras: staging password per site, webhooks, REST API, MCP" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    accent: "#A78BFA",
    monthlyPrice: "39",
    annualPrice: "32",
    annualStrikePrice: "39",
    bestFor: "Agencies running care plans across a client book",
    badge: "Most agencies",
    highlighted: true,
    cta: { label: "Start with card", href: APP_URL },
    bullets: [
      { text: "Review: private comments, custom statuses, access control" },
      { text: "Watch (free): every site, checks on every changed page" },
      { text: `Care: ${CARE_SITES_INCLUDED.scale} sites included, then ${CARE_PRICE_SHORT}` },
      { text: "Care: custom QA rules, 1 per Care site" },
      { text: "Care: white-label reports, no Superflow footer" },
      { text: "Extras: 10 white-label audits a month, then $5 each" },
      { text: "Extras: 500 pages per site, more on request" },
      { text: "Extras: 180 days of version history, priority support" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    accent: "#FFB46E",
    monthlyPrice: "Contact us",
    annualPrice: "Contact us",
    customPrice: true,
    bestFor: "Brand teams and large site portfolios",
    cta: { label: "Talk to sales", href: SALES_URL },
    bullets: [
      { text: "Everything in Scale, plus", divider: true },
      { text: "Custom seats, Care sites and pages" },
      { text: "Unlimited custom QA rules and white-label audits" },
      { text: "Automated QA behind login, private staging and VPN" },
      { text: "365 days of immutable version history" },
      { text: "SAML SSO, SCIM, HIPAA with BAA, self-hosting" },
      { text: "Uptime SLA with credits, named CSM, onboarding" },
      { text: "Contract, PO, net-60" },
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
// Order: [starter, growth, scale, enterprise]. Groups, rows, labels and cells
// follow the portal's plan table (see the header).

export const SECTIONS: Section[] = [
  {
    title: "Sites and monitoring",
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
        label: "Watch sites (free)",
        values: [text("1"), text("Every site"), text("Every site"), text("Every site")],
      },
      {
        label: "Care sites included",
        values: [
          cross,
          text(`${CARE_SITES_INCLUDED.growth}`),
          text(`${CARE_SITES_INCLUDED.scale}`),
          text("Custom"),
        ],
      },
      {
        label: "More Care sites",
        values: [
          cross,
          text(`$${SITE_AGENTS_PRICE_USD} each`),
          text(`$${SITE_AGENTS_PRICE_USD} each`, "50+? Talk to us"),
          text("Custom"),
        ],
      },
      {
        label: "Pages per site",
        values: [
          text("100", "first scan"),
          text("250"),
          text("500", "raised on request"),
          text("Custom"),
        ],
      },
      { label: "Add a site by URL, nothing to install", values: ALL },
      { label: "Staging password per site", values: GROWTH_UP },
      { label: "First site scan", values: all("Full scan free, up to 100 pages") },
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
      {
        label: "Version history",
        sublabel: "Which pages changed, when",
        values: [
          text("30 days"),
          text("90 days"),
          text("180 days"),
          text("365 days, immutable"),
        ],
      },
      {
        label: "Side-by-side diff",
        values: [text("Locked"), text("Care sites"), text("Care sites"), text("Care sites")],
      },
      { label: "Uptime every 5 minutes", values: ALL },
      { label: "Usage limits", values: all("None") },
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
        label: "Custom QA rules",
        values: [cross, cross, text("1 per Care site"), text("Unlimited")],
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
      { label: "Your logo, name and color on reports", values: GROWTH_UP },
      {
        label: "\"Checked by Superflow\" footer",
        values: [text("Shown"), text("Shown"), text("Removed"), text("Removed")],
      },
      { label: "Your logo on the toolbar", values: SCALE_UP },
    ],
  },
  {
    title: "Prospecting",
    accent: "#D4840D",
    rows: [
      {
        label: "Prospect audits (branded, \"Checked by Superflow\")",
        values: [cross, text("Unlimited"), text("Unlimited"), text("Unlimited")],
      },
      {
        label: "White-label prospect audit (no footer)",
        values: [cross, cross, text("10 free a month, then $5 each"), text("Included")],
      },
      { label: "Free preview of any site, no account", values: ALL },
      { label: "\"Won the client\" converts an audit to a Care site", values: GROWTH_UP },
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
      { label: "SOC 2 Type II, encryption in transit and at rest", values: ALL },
      {
        label: "Uptime SLA",
        values: [text("99.9%"), text("99.9%"), text("99.9%"), text("99.9% with credits")],
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
