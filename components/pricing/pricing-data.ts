// Pricing-page data — single source of truth for both the three tier
// cards and the long feature comparison table on /pricing.
//
// Sourced from velt.dev/pricing (the live production page) and the Figma
// design `217:5662` in HqWIZdR6ISJmaG2n4o3gr8. Kept as a plain TS module
// (rather than Sanity content) because the comparison-table shape — 50+
// rows × 3 tiers × mixed cell kinds — doesn't fit cleanly in CMS arrays
// and the copy changes infrequently.

export type TierBullet = {
  text: string;
  /** Optional hover tooltip on the bullet (matches the info-pop pattern
   *  on velt.dev/pricing for "100 MADs" and "For Dev Environments Only"). */
  tooltip?: string;
};

export type Tier = {
  id: "hacker" | "growth" | "enterprise";
  name: string;
  blurb: string;
  /** Tabler icon shown at the top of the card (32×32). Stroke color is
   *  per-tier and lives in PricingTiers, not here. */
  icon: "code" | "trending-up" | "world-longitude";
  /** Headline price shown in the comparison table's sticky tier header
   *  (the tier cards themselves no longer render this). */
  price: string;
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
  /** Optional info-icon hover tooltip on the row label (matches the
   *  ⓘ on velt.dev/pricing's "MADs" row). */
  tooltip?: string;
  values: [CellValue, CellValue, CellValue];
};

export type Section = {
  /** Coloured section heading, e.g. "Async Collaboration". */
  title: string;
  /** Hex color for the section heading text — different per section to
   *  echo the live site's rainbow-ish category strip. */
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

// --- Tier cards (Figma 217:8878) ---------------------------------------------

export const TIERS: Tier[] = [
  {
    id: "hacker",
    name: "Hacker",
    blurb: "For hackathon or side projects",
    icon: "code",
    price: "Free",
    cta: {
      label: "Get Free API Key",
      href: "https://console.velt.dev/",
    },
    bullets: [
      {
        text: "100 MADs",
        tooltip:
          "Monthly Active Documents are documents which has active collaboration.",
      },
      { text: "All Features (15+)" },
      { text: "Pre-built Components" },
      { text: "Full Customization" },
      { text: "Basic Webhooks" },
      { text: "Real-time infrastructure" },
      {
        text: "For Dev Environments Only",
        tooltip: "No Production Deployment",
      },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "Contract-based",
    icon: "trending-up",
    price: "Custom",
    highlighted: true,
    cta: { label: "Book Demo", href: "/book-demo" },
    bullets: [
      {
        text: "Contract-based MADs",
        tooltip:
          "Monthly Active Documents are documents which has active collaboration.",
      },
      { text: "All Features (15+)" },
      { text: "Pre-built Components" },
      { text: "Full Customization" },
      { text: "Basic Webhooks & REST APIs" },
      { text: "Real-time infrastructure" },
      { text: "Slack Support" },
      { text: "99.999% Uptime SLA" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    blurb: "Contract-based",
    icon: "world-longitude",
    price: "Custom",
    cta: { label: "Book Demo", href: "/book-demo" },
    bullets: [
      {
        text: "Contract-based MADs",
        tooltip:
          "Monthly Active Documents are documents which has active collaboration.",
      },
      { text: "All Features (15+)" },
      { text: "Pre-built Components" },
      { text: "Full Customization" },
      { text: "Data Self-hosting" },
      { text: "Advanced Webhooks & Integrations" },
      { text: "GDPR APIs" },
      { text: "Multiple Region Hosting (EU, APAC, NA)" },
      { text: "Isolated Server and Data Storage" },
      { text: "Enterprise-grade security (SOC 2 Type 2, HIPAA with BAA)" },
      { text: "Custom security reviews and DPA" },
      { text: "Technical Design & Implementation Service" },
      { text: "Dedicated CSM" },
      { text: "Priority Support SLAs" },
      { text: "Real-time infrastructure" },
      { text: "99.999% Uptime SLA" },
    ],
  },
];

// --- Comparison table (Figma 217:8994) ---------------------------------------
// Order: [hacker, growth, enterprise]. Cell kinds match the live site's
// rendered icons / text values per row.

export const SECTIONS: Section[] = [
  {
    title: "Documents",
    accent: "#e04161",
    rows: [
      {
        label: "MADs",
        tooltip:
          "Monthly Active Documents are documents which has active collaboration.",
        values: [text("100"), text("Contract Based"), text("Contract Based")],
      },
    ],
  },
  {
    title: "Async Collaboration",
    accent: "#1e9e56",
    rows: [
      { label: "Comments (10+ Types)", values: [check, check, check] },
      { label: "Notifications", values: [check, check, check] },
      { label: "Recording", values: [check, check, check] },
      { label: "Video Editor", values: [check, check, check] },
      { label: "View Analytics", values: [check, check, check] },
      { label: "Reactions", values: [check, check, check] },
      {
        label: "AI Enhancements",
        sublabel: "(Add-on)",
        values: [cross, check, check],
      },
    ],
  },
  {
    title: "Realtime Features",
    accent: "#f2a52f",
    rows: [
      {
        label: "Multiplayer Editing",
        values: [check, check, { kind: "text", value: "✓", sub: "(With custom encryption)" }],
      },
      { label: "Single Editor Mode", values: [check, check, check] },
      { label: "Live State Sync", values: [check, check, check] },
      { label: "Huddle", values: [check, check, check] },
      { label: "Presence", values: [check, check, check] },
      { label: "Adaptive Cursors", values: [check, check, check] },
      { label: "Follow Mode", values: [check, check, check] },
      { label: "Live Selection", values: [check, check, check] },
    ],
  },
  {
    title: "Developer Console",
    accent: "#3d8bff",
    rows: [
      { label: "AI Chat", values: [cross, check, check] },
      { label: "Analytics", values: [check, check, check] },
      { label: "Live Debugger", values: [check, check, check] },
      { label: "DevTools Extension", values: [check, check, check] },
      { label: "User Activity Logs", values: [check, check, check] },
      { label: "Data Viewer", values: [check, check, check] },
      {
        label: "Data Export",
        sublabel: "(JSON, CSV)",
        values: [check, check, check],
      },
      {
        label: "Team Members",
        values: [text("Only 1"), text("Unlimited"), text("Unlimited")],
      },
    ],
  },
  {
    title: "Integrations",
    accent: "#642feb",
    rows: [
      {
        label: "All Major Frontend Frameworks",
        sublabel: "React, Angular, Vue, etc",
        values: [check, check, check],
      },
      {
        label: "Editors",
        sublabel: "Lexical, Tiptap, BlockNote, Code Mirror",
        values: [check, check, check],
      },
      {
        label: "Canvas",
        sublabel: "React Flow",
        values: [check, check, check],
      },
      {
        label: "Messaging",
        sublabel: "Slack, Microsoft Teams, Discord",
        values: [cross, cross, check],
      },
      {
        label: "Storage",
        sublabel: "Amazon S3, Azure Blob Storage, Google Cloud Storage",
        values: [cross, cross, check],
      },
      {
        label: "CRM",
        sublabel: "Hubspot, CloseCRM",
        values: [cross, cross, check],
      },
      {
        label: "Analytics",
        sublabel: "OpenTelemetry, Collector, Segment",
        values: [cross, cross, check],
      },
      {
        label: "Workflow & Automation",
        sublabel: "Zapier, Inngest, Windmill",
        values: [cross, cross, check],
      },
      {
        label: "Email",
        sublabel: "Resend, Loops, SendGrid, Customer.io",
        values: [cross, cross, check],
      },
    ],
  },
  {
    title: "Backend Infrastructure",
    accent: "#eb2f96",
    rows: [
      {
        label: "Basic Webhooks",
        sublabel: "(With custom encryption)",
        values: [check, check, check],
      },
      {
        label: "Advanced Webhooks",
        sublabel: "(With custom encryption)",
        values: [cross, cross, check],
      },
      { label: "Workflow Builder", values: [cross, cross, check] },
      { label: "Realtime Server", values: [check, check, check] },
      { label: "Realtime Database", values: [check, check, check] },
      { label: "File Storage", values: [check, check, check] },
      { label: "REST APIs", values: [check, check, check] },
      {
        label: "Multiple Region Hosting",
        sublabel: "(EU, APAC, NA)",
        values: [cross, cross, check],
      },
    ],
  },
  {
    title: "Security & Compliance",
    accent: "#eb8d2f",
    rows: [
      { label: "Data Self-hosting", values: [cross, cross, check] },
      { label: "GDPR APIs", values: [cross, cross, check] },
      {
        label: "Multiple Region Hosting",
        sublabel: "(EU, APAC, NA)",
        values: [cross, cross, check],
      },
      {
        label: "Server, Database and Storage",
        values: [text("Shared"), text("Shared"), text("Dedicated")],
      },
      { label: "Data Encryption", values: [check, check, check] },
      {
        label: "Custom Data Encryption",
        sublabel: "(Available for some features)",
        values: [cross, cross, check],
      },
      { label: "SOC 2 Type II", values: [cross, cross, check] },
      { label: "Pen Testing", values: [cross, cross, check] },
      { label: "HIPAA with BAA", values: [cross, cross, check] },
      { label: "Custom Security Reviews", values: [cross, cross, check] },
      { label: "DPA", values: [cross, cross, check] },
    ],
  },
  {
    title: "Support",
    accent: "#eb8d2f",
    rows: [
      {
        label: "Channels",
        values: [cross, text("Slack"), text("Slack and Zoom")],
      },
      { label: "Onboarding", values: [check, check, check] },
      { label: "Dedicated CSM", values: [cross, cross, check] },
      {
        label: "Technical Design & Implementation Service",
        values: [cross, cross, check],
      },
      { label: "Priority SLAs", values: [cross, cross, check] },
      {
        label: "Uptime SLA",
        values: [cross, text("99.999% Uptime"), text("99.999% Uptime")],
      },
    ],
  },
  {
    title: "Usage Limits",
    accent: "#422feb",
    rows: [
      {
        label: "Simultaneous Connections",
        values: [text("Up to 20"), text("Up to 100,000"), text("Up to 200,000")],
      },
      {
        label: "Comments and Notifications",
        values: [
          text("5,000"),
          text("Unlimited", "e.g. 200M+"),
          text("Unlimited", "e.g. 200M+"),
        ],
      },
      {
        label: "Data Stored per Document",
        values: [text("2GB"), text("No Hard Limit"), text("No Hard Limit")],
      },
      {
        label: "Huddle Simultaneous Connections",
        values: [text("Up to 4"), text("Up to 20"), text("Up to 30")],
      },
      {
        label: "File Storage",
        values: [text("2GB"), text("2TB"), text("Contract Based")],
      },
    ],
  },
  {
    title: "Frontend Components",
    accent: "#317fd4",
    rows: [
      { label: "Pre-built Components", values: [check, check, check] },
      { label: "UI Customization", values: [check, check, check] },
      { label: "Functional Customization", values: [check, check, check] },
      { label: "Dark Mode", values: [check, check, check] },
    ],
  },
];
