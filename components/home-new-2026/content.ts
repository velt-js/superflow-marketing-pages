// Copy for /new-home-2026, kept in one module so the page and its Markdown
// copy (lib/markdown/pages/static-pages.ts) read the same words.
//
// House rules for this page: one idea per sentence, five to twelve words,
// no em dashes, no narrative. Say "checking", not "verification". Never put a
// precision number or a retainer price on the page.

export const NEW_HOME_PATH = "/new-home-2026";

export const HERO_HEADLINE_LINES: readonly string[] = [
  "QA agents for web",
  "and marketing agencies",
];

export const HERO_SUBHEAD =
  "Agents check client sites before handoff, at handoff, and after launch. Your team decides what to fix.";

export const PAGE_TITLE = "QA agents for web and marketing agencies";
export const PAGE_DESCRIPTION =
  "Superflow's QA agents check client websites before handoff, at handoff, and after launch. Your team decides what to fix. Your client signs off from one link.";

/** One of the three moments Superflow checks a site. */
export type Stage = {
  id: "before" | "handoff" | "after";
  title: string;
  /** Who cares about this stage. */
  audience: string;
  line: string;
};

export const STAGES_HEADLINE_LINES: readonly string[] = [
  "Superflow helps",
  "you QA at each stage",
];

export const STAGES: readonly Stage[] = [
  {
    id: "before",
    title: "Before handoff",
    audience: "For devs and PMs",
    line: "Agents find the obvious issues. Your team judges the rest.",
  },
  {
    id: "handoff",
    title: "At handoff",
    audience: "For PMs and clients",
    line: "Send your client one link. They review and approve without a login.",
  },
  {
    id: "after",
    title: "After launch",
    audience: "For agency owners and clients",
    line: "Agents recheck on every change and every week. A rescan confirms each fix.",
  },
];

/** A card in the "What you get" grid. */
export type Benefit = {
  id: "agents" | "report" | "monitoring" | "accessibility" | "mcp" | "figma";
  title: string;
  line: string;
};

export const BENEFITS: readonly Benefit[] = [
  {
    id: "agents",
    title: "13 agents built in",
    line: "Seven run on the first scan. No setup, no uploads.",
  },
  {
    id: "report",
    title: "Shareable QA report",
    line: "Your logo on top. It lists what was checked and what was fixed.",
  },
  {
    id: "monitoring",
    title: "Always-on monitoring",
    line: "Agents rerun on every change and every week.",
  },
  {
    id: "accessibility",
    title: "Accessibility reporting",
    line: "Checks to WCAG A, AA, or AAA. Results in plain words.",
  },
  {
    id: "mcp",
    title: "Resolve issues with MCP",
    line: "Your coding agent pulls open issues and fixes them. A rescan closes them.",
  },
  {
    id: "figma",
    title: "Check against Figma",
    line: "Compares the built page to the Figma file, on desktop and mobile.",
  },
];

/** A reason the work matters more this year than last. */
export type WhyNowItem = { title: string; line: string };

export const WHY_NOW: readonly WhyNowItem[] = [
  {
    title: "AI search reads the site",
    line: "Broken pages and missing labels change how AI describes your client.",
  },
  {
    title: "Accessibility lawsuits keep rising",
    line: "Small businesses get sued too.",
  },
  {
    title: "More people edit the site",
    line: "Marketers, clients, and AI tools publish every day.",
  },
  {
    title: "Devs ship more pages with AI",
    line: "Building got faster. Checking did not.",
  },
];

/** When an agent first runs on a new site. */
export type AgentStart = "first-scan" | "one-click" | "upload";

export const AGENT_START_LABELS: Readonly<Record<AgentStart, string>> = {
  "first-scan": "First scan",
  "one-click": "One click",
  upload: "Needs upload",
};

/** Group headings for the agents section, in display order. */
export const AGENT_GROUPS: readonly { start: AgentStart; label: string }[] = [
  { start: "first-scan", label: "Run on the first scan" },
  { start: "one-click", label: "Turn on in one click" },
  { start: "upload", label: "Add a file to start" },
];

export type Agent = {
  name: string;
  checks: string;
  start: AgentStart;
};

// Order matches the report: the seven quiet agents that run on a first scan,
// then the ones that need one click or an upload.
export const AGENTS: readonly Agent[] = [
  { name: "Link Checker", checks: "Dead links, 404s, broken CTAs and forms", start: "first-scan" },
  { name: "Image Inspector", checks: "Missing, stretched, oversized, or broken images", start: "first-scan" },
  { name: "Mobile Inspector", checks: "Text overlap, clipped buttons, side scroll", start: "first-scan" },
  { name: "Accessibility", checks: "Contrast, alt text, headings, labels, focus", start: "first-scan" },
  { name: "AI Visibility", checks: "Titles, meta, schema, sitemap, llms.txt", start: "first-scan" },
  { name: "Proofreader", checks: "Typos, Lorem Ipsum, placeholder text", start: "first-scan" },
  { name: "Consistency Checker", checks: "Fonts, colors, and spacing drifting across pages", start: "first-scan" },
  { name: "Performance", checks: "Core Web Vitals, heavy images, layout shift", start: "one-click" },
  { name: "Compliance", checks: "Cookie banner, privacy policy, form consent", start: "one-click" },
  { name: "Data Privacy", checks: "Exposed emails, PII in source, cookie flags", start: "one-click" },
  { name: "Security", checks: "Unknown scripts, mixed content, risky libraries", start: "one-click" },
  { name: "Figma Match", checks: "The built page against the Figma file", start: "upload" },
  { name: "Copyright", checks: "Stock watermarks, unlicensed fonts, copied text", start: "upload" },
];

export const FIRST_SCAN_AGENTS: readonly string[] = AGENTS.filter(
  (agent) => agent.start === "first-scan",
).map((agent) => agent.name);

export const FIRST_SCAN_AGENT_COUNT = FIRST_SCAN_AGENTS.length;

export const REPORT_POINTS: readonly string[] = [
  "One score out of 100",
  "Work done this week",
  "Found, fixed, confirmed, open",
  "Before and after screenshots",
  "Your logo, not ours",
];

/** What an agency would use instead, where it falls short, and our answer. */
export type Alternative = { name: string; gap: string; answer: string };

export const ALTERNATIVES: readonly Alternative[] = [
  {
    name: "Free scanners",
    gap: "One page at a time. No history.",
    answer: "The whole site, with history.",
  },
  {
    name: "Enterprise tools",
    gap: "Annual contracts and a long sales cycle.",
    answer: "Start free. Pay per site.",
  },
  {
    name: "Accessibility overlays",
    gap: "Add a widget. The code stays broken.",
    answer: "Pins the issue. You fix the code.",
  },
  {
    name: "DIY Claude Code scripts",
    gap: "No pins, no client view, no history.",
    answer: "Keep them. Send their issues in over MCP.",
  },
];

/** Build or buy: what our agents already know that a new script does not. */
export type BuildOrBuyItem = {
  id: "tuned" | "client" | "workspace";
  title: string;
  line: string;
};

export const BUILD_OR_BUY_HEADLINE = "Build it, or use ours?";
export const BUILD_OR_BUY_SUB = "A new script starts from zero. Ours already learned.";

export const BUILD_OR_BUY: readonly BuildOrBuyItem[] = [
  {
    id: "tuned",
    title: "Tuned on 15,000+ website reviews",
    line: "Every accept and reject taught the agents what counts.",
  },
  {
    id: "client",
    title: "Memory per client",
    line: "Each client's rules and exceptions, kept across every run.",
  },
  {
    id: "workspace",
    title: "Memory per workspace",
    line: "Learns what your team flags most. Checks for it first.",
  },
];

/** FAQ for this page. The price answer is filled in by the caller. */
export type NewHomeFaq = { question: string; answer: string };

export function buildNewHomeFaq(priceLabel: string): NewHomeFaq[] {
  const firstScan = AGENTS.filter((agent) => agent.start === "first-scan")
    .map((agent) => agent.name)
    .join(", ");
  return [
    {
      question: "Does the AI replace my QA person?",
      answer:
        "No. Agents find the obvious issues. Your team accepts, rejects, or assigns each one.",
    },
    {
      question: "When do the agents run?",
      answer:
        "Before handoff on staging, at handoff for the client, and after launch on every change and every week.",
    },
    {
      question: "Do my clients need an account?",
      answer: "No. They open one link, suggest edits, and approve on the page.",
    },
    {
      question: "Which agents run on the first scan?",
      answer: `${firstScan}. They need no uploads. Turn on the rest in one click.`,
    },
    {
      question: "Can my devs keep their own Claude Code checks?",
      answer:
        "Yes. Send their issues in over Superflow MCP. They show as pins on the page, labeled as theirs.",
    },
    {
      question: "Why not build this with Claude Code myself?",
      answer:
        "You can, and you can send its issues in over MCP. Our agents have learned from 15,000+ website reviews, keep each client's rules, and learn what your team flags.",
    },
    {
      question: "What does it cost?",
      answer: `Free to start, no credit card. AI agents are ${priceLabel}. Seats are priced per plan on the pricing page.`,
    },
  ];
}
