// Copy for /monitoring, kept in one module so the page and its Markdown copy
// (lib/markdown/pages/static-pages.ts) read the same words. Same house rules
// as the homepage: one idea per sentence, short, no idioms.

import { AGENTS, FIRST_SCAN_AGENTS } from "@/components/home-new-2026/content";

export const MONITORING_PATH = "/monitoring";

export const PAGE_TITLE = "Always-on website monitoring";
export const PAGE_DESCRIPTION =
  "Turn monitoring on for a client site, pick the agents, and set a schedule. Superflow checks the site, tracks the score, and sends your client the report.";

export const HERO_HEADLINE_LINES: readonly string[] = ["Always-on monitoring", "for client sites"];
export const HERO_SUBHEAD =
  "Turn it on per site. Pick the agents. Set a schedule. Your client gets the report.";

/** The three schedules a site can run on. */
export type Schedule = { id: "daily" | "weekly" | "monthly"; label: string; line: string };

export const SCHEDULES: readonly Schedule[] = [
  { id: "daily", label: "Daily", line: "Catches a broken page the same day." },
  { id: "weekly", label: "Weekly", line: "One report every week." },
  { id: "monthly", label: "Monthly", line: "A maintenance report with each invoice." },
];

/** How it works, in order. Rendered as numbered steps. */
export type Step = { title: string; description: string; accent: string };

export const STEPS_HEADING = "Four steps, then it runs on its own";
export const STEPS_SUB = "Set it up once per site. Change it any time.";

export const STEPS: readonly Step[] = [
  {
    title: "Turn it on for a site",
    description: "Add the site and switch it on. Nothing to install.",
    accent: "#1a78e0",
  },
  {
    title: "Pick the agents",
    description: `Choose which of the ${AGENTS.length} agents run. ${FIRST_SCAN_AGENTS.length} are on by default.`,
    accent: "#0f9d58",
  },
  {
    title: "Set the schedule",
    description: "Daily, weekly, or monthly. Agents also rerun when a page changes.",
    accent: "#d97706",
  },
  {
    title: "The report goes to your client",
    description: "Each run updates the score and the report. Send it by hand or on the schedule.",
    accent: "#7c3aed",
  },
];

/** A card in the "What you get" grid. */
export type Benefit = {
  id: "agents" | "schedule" | "score" | "report";
  title: string;
  line: string;
};

export const BENEFITS: readonly Benefit[] = [
  {
    id: "agents",
    title: "Your choice of agents",
    line: "Turn each agent on or off per site.",
  },
  {
    id: "schedule",
    title: "Daily, weekly, or monthly",
    line: "One schedule per site. Agents also rerun on every change.",
  },
  {
    id: "score",
    title: "One score, tracked over time",
    line: "Every run adds a point. Spot the week something broke.",
  },
  {
    id: "report",
    title: "A report your client gets",
    line: "Your logo on top. Sent on the schedule, or when you say.",
  },
];

export const REPORT_HEADING = "The maintenance report";
export const REPORT_SUB = "Written on every run. Sent to your client on your schedule.";

export const REPORT_POINTS: readonly string[] = [
  "One score out of 100, with the change since last time",
  "Pages changed, checks run, issues fixed",
  "Found, fixed, confirmed, open",
  "Before and after screenshots",
  "Your logo and your client's name",
];

export const PRICE_HEADING = "One flat rate per site";
export const PRICE_SUB = "Every agent on every run. No credits, no page counting.";

export type MonitoringFaq = { question: string; answer: string };

export function buildMonitoringFaq(priceLabel: string): MonitoringFaq[] {
  return [
    {
      question: "What does monitoring check?",
      answer: `Whichever agents you turn on for the site. The ${FIRST_SCAN_AGENTS.length} first-scan agents are on by default: ${FIRST_SCAN_AGENTS.join(", ")}.`,
    },
    {
      question: "How often does it run?",
      answer:
        "On the schedule you pick: daily, weekly, or monthly. Agents also rerun on a page when it changes.",
    },
    {
      question: "Does the client get the report automatically?",
      answer:
        "Yes, if you turn that on. Each run writes the report. You can send it by hand or let it go out on the schedule.",
    },
    {
      question: "Does it need code on the client's site?",
      answer: "No. Agents check the live site from the outside. Nothing to install.",
    },
    {
      question: "Can I turn it off for a site?",
      answer: "Yes. Switch it off any time. The report history stays.",
    },
    {
      question: "What does it cost?",
      answer: `${priceLabel}, with every agent on every run. Seats are priced per plan on the pricing page.`,
    },
  ];
}
