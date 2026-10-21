// Copy for /solutions/white-label-agencies, kept in one module so the page
// and its structured data read the same words. House rules as the other
// 2026 pages: one idea per sentence, short, no idioms.

import type { GetStartedNumberedStep } from "@/components/home-2026/GetStarted";
import type { SolutionFaqEntry } from "@/components/solutions-2026/solution-faq-data";
import type { SolutionResellSection } from "@/lib/solutions/types";
import { WHITE_LABEL_SUMMARY } from "@/lib/solutions/seed";

export const WHITE_LABEL_SLUG = WHITE_LABEL_SUMMARY.slug;
export const WHITE_LABEL_NAV_LABEL = WHITE_LABEL_SUMMARY.navLabel;

export const PAGE_TITLE = "White-label website QA for agencies | Superflow";
export const PAGE_DESCRIPTION =
  "Put your logo, colors and domain on the review toolbar, the client portal and the monthly report. Clients approve on the page. They never see Superflow.";

export const HERO_HEADLINE_LINES: readonly string[] = [
  "Your brand on every review",
  "your client sees",
];
export const HERO_SUBHEAD =
  "Your logo, your colors, your domain. Clients approve on the page. The report carries your name.";

/** The sample agency every visual on this page uses. */
export const SAMPLE_AGENCY = "Northwind Studio";
export const SAMPLE_DOMAIN = "review.northwindstudio.com";
export const SAMPLE_CLIENT = "Bright Smile Dental";

export const STEPS_HEADING = "Four steps, then every project carries your brand";
export const STEPS_SUB = "Set it up once. Every project, current and future.";

export const STEPS: readonly GetStartedNumberedStep[] = [
  {
    title: "Upload your logo and colors",
    description: "One upload. Every project, current and future.",
    accent: "#1a78e0",
  },
  {
    title: "Connect your domain",
    description: "Review links open on your domain, not ours.",
    accent: "#0f9d58",
  },
  {
    title: "Add client sites and pick the agents",
    description: "Findings post under your brand.",
    accent: "#d97706",
  },
  {
    title: "Send the link and the report",
    description: "Your client approves on the page.",
    accent: "#7c3aed",
  },
];

/** A card in the "What you get" grid. */
export type WhiteLabelBenefit = {
  id: "toolbar" | "portal" | "report" | "domain";
  title: string;
  line: string;
};

export const BENEFITS_HEADING = "What you get";
export const BENEFITS: readonly WhiteLabelBenefit[] = [
  {
    id: "toolbar",
    title: "Branded toolbar",
    line: "The toolbar on the client's site carries your logo and colors.",
  },
  {
    id: "portal",
    title: "Branded portal",
    line: "Contractors and new hires work inside your operation.",
  },
  {
    id: "report",
    title: "Branded report",
    line: "Your logo on top and your client's name, on your schedule.",
  },
  {
    id: "domain",
    title: "Your domain",
    line: "Every review link and every report opens on your domain.",
  },
];

export const NEVER_SEE_HEADING = "What clients never see";
export const NEVER_SEE: readonly string[] = [
  "Superflow's name",
  "Our pricing",
  "An invoice from us",
];

export const RESELL: SolutionResellSection = {
  heading: "Resell it.",
  lines: [
    "You set the retail price for reviews and care plans.",
    "The report, the toolbar and the portal carry your logo, not ours.",
    "Superflow bills you per site. Your client never sees an invoice from us.",
  ],
  ctaLabel: "Book demo",
  ctaHref: "/book-demo",
};

export const CLIENT_LINE =
  "Your client taps Approve on your domain, with your logo on the toolbar, from their phone.";

export const COST_LINES: readonly string[] = [
  "White label is included on the Scale plan.",
  "Sites are priced per site. Every agent on every run.",
  "Your client never sees an invoice from us.",
];

export const FAQ: readonly SolutionFaqEntry[] = [
  {
    q: "Which parts carry my brand?",
    a: "The toolbar on the client's site, the portal your team and contractors use, every review link, and the report.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Connect it once. Review links and reports open on it.",
  },
  {
    q: "Does my client ever see Superflow?",
    a: "No. Not in the toolbar, the link, the report or the invoice.",
  },
  {
    q: "Which plan includes it?",
    a: "Scale and Enterprise.",
  },
];

export const RELATED_SLUGS: readonly string[] = ["site-care", "web-design-studios"];
