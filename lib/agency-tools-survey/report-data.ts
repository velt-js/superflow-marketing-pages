// State of Agency Tools 2026 - report data.
//
// The report page renders whatever this file exports, so publishing the real
// results in November is a data-only change: export the Tally CSV, aggregate
// it into these shapes (mapping notes in app/state-of-agency-tools/README.md),
// set `sample: false`, and flip the report to indexable.
//
// Every number below is INVENTED sample data so the report design can be
// reviewed before responses exist. The page shows a sample-data banner and
// stays noindex as long as `sample` is true.

/** One answer option's share of respondents, in percent (0-100). */
export type ShareRow = {
  label: string;
  pct: number;
};

/** A tool plotted on a usage vs would-choose-again quadrant. */
export type QuadrantPoint = {
  name: string;
  /** Share of respondents (in the gated section) who use it, percent. */
  usagePct: number;
  /** Share of its users who would choose it again, percent. */
  chooseAgainPct: number;
};

/** An AI assistant's use-vs-pay gap (Q23 vs Q24). */
export type UsePayRow = {
  name: string;
  usePct: number;
  payPct: number;
};

export type ReportData = {
  /** True while the numbers are illustrative. Drives the banner + noindex. */
  sample: boolean;
  /** Respondent count shown in the report header. */
  respondents: number;
  /** Display string, e.g. "November 2026". */
  publishedLabel: string;

  /** Q9: how client feedback reaches the agency (multi-select, sums > 100). */
  feedbackChannels: ShareRow[];
  /** Headline: share using email and/or screenshots for feedback. */
  emailOrScreenshotsPct: number;

  /** Q12: QA process before launch. */
  qaProcess: ShareRow[];
  /** Headline: "No real process" + "The client usually finds the bugs". */
  noQaPct: number;

  /** Q11: rounds of client revisions on a typical website project. */
  revisionRounds: ShareRow[];
  avgRevisionRounds: number;

  /** Q4-6: website platforms, usage vs would-choose-again. */
  platformQuadrant: QuadrantPoint[];
  /** Q13-15: PM tools, usage vs would-choose-again. */
  pmQuadrant: QuadrantPoint[];

  /** Q23 vs Q24: AI assistants, use vs actually pay for. */
  llmUsePay: UsePayRow[];

  /** Q26: share of client deliverable work AI touches. */
  aiShare: ShareRow[];
  /** Headline: share of agencies where AI touches any client work. */
  aiTouchesWorkPct: number;
  /** Q27: whether clients are told when AI is involved. */
  aiDisclosure: ShareRow[];
  /** Headline: share who always tell clients. */
  alwaysTellClientsPct: number;

  /** Q17: profit margin knowledge per client. */
  marginKnowledge: ShareRow[];
  /** Headline: share answering "Honestly, no". */
  noMarginPct: number;

  /** Q28: most-mentioned answers to "which tool do you resent paying for?" */
  resentedTools: { name: string; mentions: number }[];
};

export const REPORT_DATA: ReportData = {
  sample: true,
  respondents: 500,
  publishedLabel: "November 2026",

  feedbackChannels: [
    { label: "Email", pct: 78 },
    { label: "Screenshots or marked-up PDFs", pct: 61 },
    { label: "Calls or meetings", pct: 54 },
    { label: "Slack/Teams messages", pct: 49 },
    { label: "Comments in Figma/Google Docs", pct: 38 },
    { label: "Spreadsheets", pct: 22 },
    { label: "A dedicated review tool", pct: 19 },
    { label: "Client portal", pct: 11 },
  ],
  emailOrScreenshotsPct: 84,

  qaProcess: [
    { label: "Informal, depends on the project", pct: 47 },
    { label: "Formal checklist, every time", pct: 28 },
    { label: "No real process", pct: 17 },
    { label: "The client usually finds the bugs", pct: 8 },
  ],
  noQaPct: 25,

  revisionRounds: [
    { label: "1 round", pct: 6 },
    { label: "2 rounds", pct: 24 },
    { label: "3 rounds", pct: 34 },
    { label: "4-5 rounds", pct: 26 },
    { label: "6+ rounds", pct: 10 },
  ],
  avgRevisionRounds: 3.4,

  platformQuadrant: [
    { name: "WordPress", usagePct: 58, chooseAgainPct: 52 },
    { name: "Webflow", usagePct: 46, chooseAgainPct: 78 },
    { name: "Shopify", usagePct: 31, chooseAgainPct: 74 },
    { name: "Custom code", usagePct: 27, chooseAgainPct: 69 },
    { name: "Framer", usagePct: 24, chooseAgainPct: 81 },
    { name: "AI builders", usagePct: 14, chooseAgainPct: 62 },
    { name: "Wix Studio", usagePct: 12, chooseAgainPct: 55 },
    { name: "Squarespace", usagePct: 9, chooseAgainPct: 48 },
  ],
  pmQuadrant: [
    { name: "ClickUp", usagePct: 38, chooseAgainPct: 66 },
    { name: "Notion", usagePct: 35, chooseAgainPct: 72 },
    { name: "Asana", usagePct: 29, chooseAgainPct: 61 },
    { name: "Monday", usagePct: 22, chooseAgainPct: 58 },
    { name: "Spreadsheets", usagePct: 21, chooseAgainPct: 33 },
    { name: "Trello", usagePct: 16, chooseAgainPct: 41 },
    { name: "Airtable", usagePct: 12, chooseAgainPct: 57 },
    { name: "Basecamp", usagePct: 9, chooseAgainPct: 64 },
  ],

  llmUsePay: [
    { name: "ChatGPT", usePct: 92, payPct: 64 },
    { name: "Claude", usePct: 48, payPct: 31 },
    { name: "Gemini", usePct: 41, payPct: 18 },
    { name: "Perplexity", usePct: 26, payPct: 9 },
    { name: "Microsoft Copilot", usePct: 19, payPct: 11 },
    { name: "Grok", usePct: 8, payPct: 3 },
  ],

  aiShare: [
    { label: "0%", pct: 7 },
    { label: "1-10%", pct: 22 },
    { label: "11-25%", pct: 28 },
    { label: "26-50%", pct: 24 },
    { label: "51-75%", pct: 13 },
    { label: "Over 75%", pct: 6 },
  ],
  aiTouchesWorkPct: 93,
  aiDisclosure: [
    { label: "Sometimes", pct: 38 },
    { label: "Always", pct: 31 },
    { label: "Never", pct: 17 },
    { label: "Clients ask us to use it", pct: 9 },
    { label: "Some clients ask us not to", pct: 5 },
  ],
  alwaysTellClientsPct: 31,

  marginKnowledge: [
    { label: "Roughly, in spreadsheets", pct: 41 },
    { label: "Honestly, no", pct: 35 },
    { label: "Yes, tracked in a tool", pct: 24 },
  ],
  noMarginPct: 35,

  resentedTools: [
    { name: "Adobe Creative Cloud", mentions: 87 },
    { name: "HubSpot", mentions: 43 },
    { name: "Monday", mentions: 31 },
    { name: "Salesforce", mentions: 24 },
    { name: "Semrush", mentions: 19 },
  ],
};
