// Pricing-page data — single source of truth for both the four tier
// cards and the long feature comparison table on /pricing.
//
// Sourced verbatim from usesuperflow.com/pricing (the live production
// page). Kept as a plain TS module rather than Sanity content because
// the comparison-table shape — 40+ rows × 4 tiers × mixed cell kinds —
// doesn't fit cleanly in CMS arrays and the copy changes infrequently.
//
// The per-tier AI credits chips and the "AI Agent Reviews" comparison
// section come from the AI Credits rate card (v2, flat pricing) rather
// than the live site; keep them in sync with
// components/pricing-2026/ai-credits-data.ts.

export type TierBullet = {
  text: string;
  /** Renders the bullet without a check (used for "Everything in X, plus"
   *  section dividers inside the bullet list). */
  divider?: boolean;
};

export type Tier = {
  id: "starter" | "growth" | "scale" | "enterprise";
  name: string;
  /** Hex accent for the tier name and comparison-table column accents.
   *  Matches the live site's per-tier color treatment. */
  accent: string;
  /** Monthly price label (string so we can carry "$0" and "Let's Talk"). */
  monthlyPrice: string;
  /** Annual-per-month price label. */
  annualPrice: string;
  /** When set and Annual is selected, this number is rendered with a
   *  strikethrough next to the annual price — matches the "$24 ~~$29~~"
   *  treatment on Growth and Scale cards. */
  annualStrikePrice?: string;
  /** When true, the price is treated as a custom contract — the card
   *  shows the price string as-is with a "Custom" sub-label rather than
   *  the "/seat/mo" suffix. */
  customPrice?: boolean;
  /** Small uppercase label above the CTA button ("10 DAY FREE TRIAL"). */
  trialLabel?: string;
  /** Pink "Most Popular" pill rendered above the card. Currently only
   *  Growth ("Loved by 100+ Agencies"). */
  badge?: string;
  /** Clay-style AI credits chip rendered under the price ("300 AI
   *  credits/mo"); expands into an add-on packs dropdown. From the AI
   *  Credits rate card: every agent review costs a flat 10 credits;
   *  included credits reset each cycle. */
  aiCredits?: string;
  /** When true, the Growth-style purple→cyan gradient ring is drawn. */
  highlighted?: boolean;
  cta: { label: string; href: string };
  bullets: TierBullet[];
};

export type CellValue =
  | { kind: "check" }
  | { kind: "x" }
  | { kind: "text"; value: string; sub?: string };

export type Row = {
  label: string;
  /** Optional muted second line under the label. */
  sublabel?: string;
  /** [Starter, Growth, Scale, Enterprise] */
  values: [CellValue, CellValue, CellValue, CellValue];
};

export type Section = {
  /** Coloured section heading, e.g. "Collaboration". */
  title: string;
  /** Hex color for the section heading text — different per section to
   *  echo the live site's category strip. */
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

export const TRIAL_LABEL = "10 DAY FREE TRIAL";
export const APP_URL = "https://app.usesuperflow.com";

// --- Tier cards --------------------------------------------------------------

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    accent: "#FF74A8",
    monthlyPrice: "0",
    annualPrice: "0",
    trialLabel: TRIAL_LABEL,
    aiCredits: "60 AI credits/mo",
    cta: { label: "Start Free Trial", href: APP_URL },
    bullets: [
      { text: "1 Project" },
      { text: "1 Team Seat" },
      { text: "Unlimited Guest Seats" },
      { text: "1GB Storage" },
      { text: "+2 More Features" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    accent: "#20D4FF",
    monthlyPrice: "29",
    annualPrice: "24",
    annualStrikePrice: "29",
    trialLabel: TRIAL_LABEL,
    badge: "Loved by 100+ Agencies",
    highlighted: true,
    aiCredits: "300 AI credits/mo",
    cta: { label: "Start Free Trial", href: APP_URL },
    bullets: [
      { text: "Everything in Starter, plus", divider: true },
      { text: "Unlimited Projects" },
      { text: "Pay Per Team Seat" },
      { text: "10GB Storage" },
      { text: "+8 More Features" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    accent: "#A78BFA",
    monthlyPrice: "34",
    annualPrice: "28",
    annualStrikePrice: "34",
    trialLabel: TRIAL_LABEL,
    aiCredits: "600 AI credits/mo",
    cta: { label: "Start Free Trial", href: APP_URL },
    bullets: [
      { text: "Everything in Growth, plus", divider: true },
      { text: "30GB Storage" },
      { text: "Automated Screenshots" },
      { text: "Private Comments" },
      { text: "+15 More Features" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    accent: "#FFB46E",
    monthlyPrice: "Let's Talk",
    annualPrice: "Let's Talk",
    customPrice: true,
    trialLabel: TRIAL_LABEL,
    aiCredits: "Custom AI credits",
    cta: { label: "Book Demo", href: "/book-demo" },
    bullets: [
      { text: "Everything in Scale, plus", divider: true },
      { text: "SAML based SSO" },
      { text: "REST API" },
      { text: "Data Self-Hosting" },
      { text: "+15 More Features" },
    ],
  },
];

// --- Comparison table --------------------------------------------------------
// Order: [starter, growth, scale, enterprise]. Cell kinds match the live
// site's rendered icons / text values per row.

// Rows + section colors mirror usesuperflow.com/pricing verbatim. Cell
// values are X/check or text. Section accents match the live category
// strip per scraped CSS.
export const SECTIONS: Section[] = [
  {
    title: "Core",
    accent: "#FF5A7A",
    rows: [
      {
        label: "Project",
        values: [
          text("1"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
        ],
      },
      {
        label: "Team Seats",
        values: [
          text("1", "(No Additional Seats)"),
          text("$24 /mo/seat"),
          text("$28 /mo/seat"),
          text("Custom"),
        ],
      },
      {
        label: "Guest Seats",
        values: [
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
        ],
      },
      {
        label: "Storage",
        values: [text("1 GB"), text("10 GB"), text("30 GB"), text("100 GB")],
      },
    ],
  },
  {
    title: "AI Agent Reviews",
    accent: "#7C3AED",
    rows: [
      {
        label: "Included AI Credits",
        sublabel: "Reset each billing cycle",
        values: [
          text("60 / mo", "≈ 2 pages with 3 agents"),
          text("300 / mo", "≈ 10 pages with 3 agents"),
          text("600 / mo", "≈ 20 pages with 3 agents"),
          text("Custom"),
        ],
      },
      {
        label: "Flat Rate Per Agent Review",
        sublabel: "1 agent reviewing 1 page = 1 review",
        values: [
          text("10 credits", "$0.40"),
          text("10 credits", "$0.40"),
          text("10 credits", "$0.40"),
          text("10 credits", "$0.40"),
        ],
      },
      {
        label: "Signup Bonus Credits",
        sublabel: "One-time, on workspace creation",
        values: [text("500"), text("500"), text("500"), text("500")],
      },
      {
        label: "AI Credit Packs",
        sublabel: "From $20 for 500 credits · roll over monthly",
        values: [check, check, check, check],
      },
    ],
  },
  {
    title: "Collaboration",
    accent: "#2F84D2",
    rows: [
      {
        label: "Supported Assets",
        values: [
          text("Websites, PDFs, Videos, Images and Lottie Files"),
          text("Websites, PDFs, Videos, Images and Lottie Files"),
          text("Websites, PDFs, Videos, Images and Lottie Files"),
          text("Websites, PDFs, Videos, Images and Lottie Files"),
        ],
      },
      {
        label: "Recordings (Audio, Video & Screen)",
        values: [check, check, check, check],
      },
      { label: "Attachments", values: [check, check, check, check] },
      {
        label: "Automated Screenshot",
        values: [cross, check, check, check],
      },
      {
        label: "Live Reviews (Huddle, Follow Me and More)",
        values: [check, check, check, check],
      },
      {
        label: "Smart Notifications",
        values: [
          text("Email"),
          text("Slack and Email"),
          text("Slack and Email"),
          text("Slack and Email"),
        ],
      },
    ],
  },
  {
    title: "Access Control",
    accent: "#0C8A58",
    rows: [
      { label: "Private Comments", values: [cross, cross, check, check] },
      { label: "Anonymous Guest Mode", values: [cross, cross, check, check] },
      { label: "Access Control", values: [cross, cross, check, check] },
    ],
  },
  {
    title: "Workspace Management",
    accent: "#D4840D",
    rows: [
      { label: "Reporting - Analytics", values: [check, check, check, check] },
      {
        label: "Dashboard Notifications",
        values: [check, check, check, check],
      },
      { label: "Manage Domains", values: [cross, cross, check, check] },
      { label: "Export Comments", values: [cross, cross, check, check] },
      { label: "Custom Statuses", values: [cross, cross, check, check] },
      { label: "Custom Branding", values: [cross, cross, check, check] },
    ],
  },
  {
    title: "Integrations",
    accent: "#672FF5",
    rows: [
      { label: "Email", values: [check, check, check, check] },
      { label: "Slack", values: [check, check, check, check] },
      { label: "ClickUp", values: [cross, cross, check, check] },
      { label: "Asana", values: [cross, cross, check, check] },
      { label: "Monday.com", values: [cross, cross, check, check] },
      { label: "Webhooks", values: [cross, cross, check, check] },
      { label: "REST APIs", values: [cross, cross, cross, check] },
    ],
  },
  {
    title: "Security & Privacy",
    accent: "#F62F6A",
    rows: [
      { label: "SAML based SSO", values: [cross, cross, cross, check] },
      { label: "SOC 2 Type 2", values: [cross, cross, cross, check] },
      { label: "HIPAA with BAA", values: [cross, cross, cross, check] },
      { label: "Pen Testing", values: [cross, cross, cross, check] },
      {
        label: "Custom Security Reviews",
        values: [cross, cross, cross, check],
      },
      { label: "DPA", values: [cross, cross, cross, check] },
      { label: "Data Self-hosting", values: [cross, cross, cross, check] },
      { label: "GDPR APIs", values: [cross, cross, cross, check] },
      {
        label: "Multi Region Hosting",
        values: [cross, cross, cross, check],
      },
    ],
  },
  {
    title: "Support",
    accent: "#625DF5",
    rows: [
      {
        label: "Support Channels",
        values: [
          text("Community Slack"),
          text("Email, Community Slack, Chat"),
          text("Email, Community Slack, Chat"),
          text("Private Slack and Zoom"),
        ],
      },
      { label: "Onboarding", values: [cross, cross, cross, check] },
      { label: "Dedicated CSM", values: [cross, cross, cross, check] },
      { label: "Priority SLAs", values: [cross, cross, cross, check] },
      {
        label: "Dedicated Implementation + Training",
        values: [cross, cross, cross, check],
      },
      {
        label: "Uptime SLAs",
        values: [
          text("99.9%"),
          text("99.9%"),
          text("99.9%"),
          text("99.999%"),
        ],
      },
    ],
  },
];
