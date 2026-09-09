// Illustrative report fixtures, aligned with published Tally form ODqdPK.
// Verified 2026-09-08. These are NOT collected responses or vendor rankings.
// Use answered-question denominators, never the overall sample by default.

export type ShareRow = { label: string; pct: number };

// Retained for the standalone legacy chart component. The current survey
// cannot produce per-tool choose-again scores, so the report does not use it.
export type QuadrantPoint = {
  name: string;
  usagePct: number;
  chooseAgainPct: number;
};
export type UsePayRow = { name: string; usePct: number; payPct: number };

export type ShareChart = {
  id: string;
  title: string;
  audience: string;
  answered: number;
  multiple: boolean;
  rows: ShareRow[];
};
export type ReportSection = {
  id: string;
  title: string;
  description: string;
  charts: ShareChart[];
};
export type AiAssistantRow = {
  name: string;
  answered: number;
  notUsed: number;
  agencyPaid: number;
  notAgencyPaid: number;
  paymentUnknown: number;
};
export type ReportData = {
  sample: boolean;
  respondents: number;
  publishedLabel: string;
  sections: ReportSection[];
  aiAssistants: AiAssistantRow[];
  leastValue: { answered: number; tools: { name: string; mentions: number }[] };
};

function share(
  id: string,
  title: string,
  audience: string,
  answered: number,
  multiple: boolean,
  values: [string, number][],
): ShareChart {
  return { id, title, audience, answered, multiple,
    rows: values.map(([label, pct]) => ({ label, pct })) };
}

/** Used = all three used statuses; agency-paid is only one of them. */
export function assistantUsePay(row: AiAssistantRow): UsePayRow {
  const pct = (count: number) => row.answered > 0
    ? Math.round((count / row.answered) * 1000) / 10 : 0;
  return {
    name: row.name,
    usePct: pct(row.agencyPaid + row.notAgencyPaid + row.paymentUnknown),
    payPct: pct(row.agencyPaid),
  };
}

const BUSINESS = "Respondents who opted into business tools and answered this question";
const ANSWERED = "Respondents who answered this question";
const WEB = "Website-service respondents who answered this question";

export const REPORT_DATA: ReportData = {
  sample: true,
  respondents: 100,
  publishedLabel: "November 2026",
  sections: [
    {
      id: "stack", title: "Website and project-management stacks",
      description: "Tool adoption and satisfaction are separate views. The choose-again question rates the whole selected stack, not individual products.",
      charts: [
        share("website-platforms", "Platforms used to build client websites", WEB, 80, true, [
          ["WordPress", 60], ["Webflow", 45], ["Shopify", 30],
          ["Custom code (Next.js, etc.)", 25], ["Framer", 20],
          ["AI builders (Lovable, v0, Bolt)", 15], ["Wix Studio", 10],
          ["Squarespace", 10], ["Other", 5],
        ]),
        share("website-choose-again", "Would you choose the same website platforms again?", "Website respondents who selected platforms and answered the follow-up", 80, false, [
          ["Yes, all of them", 62.5], ["Some, but not all", 25],
          ["No, none of them", 7.5], ["Not sure", 5],
        ]),
        share("project-management", "Tools used to manage projects", ANSWERED, 100, true, [
          ["ClickUp", 38], ["Notion", 35], ["Asana", 29], ["Monday", 22],
          ["Spreadsheets", 21], ["Trello", 16], ["Teamwork", 14],
          ["Airtable", 12], ["Basecamp", 9], ["No project management tool", 10], ["Other", 5],
        ]),
        share("pm-choose-again", "Would you choose the same project management tools again?", "Tool-using respondents who answered the follow-up; excludes no-tool answers", 80, false, [
          ["Yes, all of them", 55], ["Some, but not all", 30],
          ["No, none of them", 10], ["Not sure", 5],
        ]),
      ],
    },
    {
      id: "delivery", title: "Creative and marketing tools",
      description: "Service-specific questions cover design, video, SEO and reporting, social media, and client email platforms. Runway and Descript appear once, in AI production tools.",
      charts: [
        share("design", "Design tools", "Design-section respondents who answered", 80, true, [
          ["Figma", 70], ["Adobe Creative Cloud", 60], ["Canva", 45], ["Affinity", 10], ["None", 5], ["Other", 5],
        ]),
        share("video", "Video editing and motion design", "Video-service respondents who answered", 40, true, [
          ["Premiere Pro", 60], ["After Effects", 50], ["DaVinci Resolve", 30], ["Final Cut", 20], ["CapCut", 20], ["None of these", 5], ["Other", 5],
        ]),
        share("seo-reporting", "SEO and client reporting", "SEO or paid-ads respondents who answered", 50, true, [
          ["GA4", 80], ["Search Console", 76], ["Looker Studio", 60], ["Semrush", 48],
          ["Ahrefs", 40], ["Screaming Frog", 30], ["AgencyAnalytics", 20], ["None", 4], ["Other", 6],
        ]),
        share("social", "Social media tools", "Social-service respondents who answered", 50, true, [
          ["Buffer", 30], ["Sprout Social", 24], ["Hootsuite", 22], ["Later", 18],
          ["Metricool", 16], ["Native platforms only", 20], ["Other", 6],
        ]),
        share("client-email", "Email platforms run for clients", "Email/CRM-service respondents who answered", 50, true, [
          ["Mailchimp", 40], ["Klaviyo", 32], ["HubSpot", 30], ["ActiveCampaign", 24],
          ["Brevo", 16], ["beehiiv", 12], ["None", 4], ["Other", 6],
        ]),
      ],
    },
    {
      id: "operations", title: "Operations and money",
      description: "An optional business-tools section covers time, resourcing, profit tracking, accounting and payroll. These shares describe that section's respondents, not every survey participant.",
      charts: [
        share("time-resourcing", "Time tracking and resourcing", BUSINESS, 50, true, [
          ["Spreadsheets", 34], ["Harvest", 26], ["Toggl", 22], ["Nothing formal", 18],
          ["Productive", 14], ["Float", 12], ["Scoro", 6], ["Workamajig", 4], ["Other", 4],
        ]),
        share("profit-tracking", "How agencies track profit by client", BUSINESS, 50, false, [
          ["In a dedicated tool", 24], ["In spreadsheets", 40],
          ["We do not track it by client", 28], ["Not sure", 6], ["Other", 2],
        ]),
        share("accounting", "Accounting and invoicing", BUSINESS, 50, true, [
          ["QuickBooks", 44], ["Xero", 28], ["Our accountant handles it", 20],
          ["Stripe invoicing", 18], ["Spreadsheets", 16], ["FreshBooks", 10],
          ["Wave", 6], ["Bonsai", 4], ["Other", 4],
        ]),
        share("payroll", "Paying the team and contractors", BUSINESS, 50, true, [
          ["Direct bank transfer", 40], ["Gusto", 30], ["Wise", 22], ["PayPal", 18],
          ["Deel", 16], ["Our accountant handles it", 14], ["Rippling", 8],
          ["Remote", 6], ["Justworks", 4], ["Other", 4],
        ]),
      ],
    },
    {
      id: "sales", title: "CRM, outreach and proposals",
      description: "How agencies manage their own sales, find potential clients and close work. These questions exclude tools used only for client campaigns.",
      charts: [
        share("crm", "CRM and sales tracking", BUSINESS, 50, true, [
          ["No CRM, it lives in our inbox", 36], ["HubSpot", 28], ["Notion or spreadsheets", 24],
          ["HighLevel (GoHighLevel)", 20], ["Pipedrive", 16], ["Zoho CRM", 12],
          ["HoneyBook", 10], ["Dubsado", 8], ["Close", 8], ["Attio", 6],
          ["Salesforce", 4], ["Not sure", 2], ["Other", 4],
        ]),
        share("prospecting", "Finding and contacting potential clients", BUSINESS, 50, true, [
          ["LinkedIn Sales Navigator", 36], ["Apollo", 28], ["Our CRM's built-in tools", 24],
          ["Clay", 20], ["Instantly", 18], ["Smartlead", 14], ["lemlist", 12],
          ["Hunter", 10], ["HeyReach", 8], ["No prospecting or outreach software", 20],
          ["Not sure", 2], ["Other", 4],
        ]),
        share("proposals", "Proposals, contracts and e-signatures", BUSINESS, 50, true, [
          ["Google Docs/Slides", 40], ["PandaDoc", 24], ["DocuSign", 18],
          ["None, handshake and an invoice", 16], ["Proposify", 12],
          ["Dropbox Sign", 10], ["Better Proposals", 8], ["Bonsai", 6], ["Other", 4],
        ]),
      ],
    },
    {
      id: "clients", title: "Client support and collaboration",
      description: "Ongoing support is distinct from creative feedback and approvals. The survey also asks which AI notetakers teams use on client calls; it does not measure the share of calls recorded.",
      charts: [
        share("support", "Ongoing client support", BUSINESS, 50, true, [
          ["Email or messaging only (no dedicated support tool)", 28],
          ["Project management tool or client portal", 24], ["Zendesk", 16], ["Help Scout", 14],
          ["Freshdesk", 12], ["Front", 10], ["Intercom", 8], ["HubSpot Service Hub", 8],
          ["Zoho Desk", 6], ["We do not provide ongoing client support", 10], ["Not sure", 2], ["Other", 4],
        ]),
        share("notetakers", "AI notetakers used on client calls", ANSWERED, 100, true, [
          ["No AI notetaker", 40], ["Fathom", 20], ["Fireflies", 18], ["Otter", 15],
          ["Granola", 12], ["Zoom AI Companion", 10], ["Gemini in Google Meet", 8],
          ["tl;dv", 6], ["Circleback", 5], ["Other", 3],
        ]),
        share("feedback", "How teams collect client feedback and approvals", ANSWERED, 100, true, [
          ["Email", 78], ["Screenshots or marked-up PDFs", 61], ["Calls or meetings", 54],
          ["Slack/Teams messages", 49], ["Comments in Figma/Google Docs", 38],
          ["WhatsApp/iMessage", 28], ["Project tools or shared pages (Basecamp, Notion, etc.)", 26],
          ["Spreadsheets", 22], ["A dedicated review tool", 20],
          ["Client portal (Copilot, SuiteDash, etc.)", 11], ["Other", 3],
        ]),
        share("review-tools", "Dedicated review and approval tools", "Respondents who selected a dedicated review tool and answered the follow-up", 20, true, [
          ["Frame.io", 35], ["Ziflow", 25], ["Filestage", 20], ["PageProof", 15],
          ["Superflow", 15], ["Marker.io", 10], ["BugHerd", 10], ["Other", 5],
        ]),
      ],
    },
    {
      id: "website-review", title: "Website revisions and pre-launch checks",
      description: "Revision counts refer to the most recent completed website project. Report the selected ranges, not a made-up exact average. Checklist use is not a measure of automation or overall QA quality.",
      charts: [
        share("revisions", "Client revision rounds on the most recent website project", WEB, 80, false, [
          ["0", 5], ["1", 5], ["2", 20], ["3", 25], ["4-5", 30],
          ["6+", 10], ["Not sure", 5], ["No completed website project yet", 0],
        ]),
        share("checklists", "How agencies check websites before launch", WEB, 80, false, [
          ["We use a written checklist on every launch", 35],
          ["We use a written checklist on some launches", 30],
          ["We check sites without a written checklist", 25],
          ["We do not usually check before launch", 5], ["Not sure", 5],
        ]),
      ],
    },
    {
      id: "ai", title: "AI tools, payment and client work",
      description: "AI assistants distinguish agency-paid use, use not paid by the agency, and unknown payment. Production tools and client-work questions are separate measures.",
      charts: [
        share("ai-production", "AI-powered tools used to create or edit client work", ANSWERED, 100, true, [
          ["GPT image generation", 55], ["Midjourney", 35], ["Cursor or Claude Code", 32],
          ["Descript", 22], ["Runway", 20], ["ElevenLabs", 18], ["HeyGen", 15],
          ["Flux", 12], ["Sora", 10], ["Veo", 10], ["Custom agents", 9], ["None", 10], ["Other", 4],
        ]),
        share("ai-deliverables", "Share of completed deliverables that used AI in the past 30 days", ANSWERED, 100, false, [
          ["0%", 8], ["1-10%", 20], ["11-25%", 26], ["26-50%", 22],
          ["51-75%", 12], ["Over 75%", 7], ["Not sure", 3],
          ["No client deliverables completed in the past 30 days", 2],
        ]),
        share("ai-disclosure", "How often teams tell clients about AI involvement", "Respondents shown the disclosure follow-up who answered it", 80, false, [
          ["Always", 30], ["Sometimes", 45], ["Never", 15],
          ["Not sure", 5], ["Prefer not to say", 5],
        ]),
      ],
    },
    {
      id: "value", title: "Workflow bottlenecks and tool value",
      description: "The bottleneck question covers client delivery in the past 30 days. The optional write-in asks which paid tool feels least worth its cost, not for a general vendor satisfaction score.",
      charts: [
        share("bottlenecks", "Where client work most often got held up", ANSWERED, 100, false, [
          ["Getting a clear brief or client assets", 22], ["Assigning work and managing capacity", 14],
          ["Producing the work", 13], ["Internal review and quality checks", 15],
          ["Client feedback and approval", 20], ["Reporting and admin", 6],
          ["No recurring hold-up", 5], ["Not sure", 3], ["Other", 2],
        ]),
      ],
    },
  ],
  aiAssistants: [
    { name: "ChatGPT", answered: 100, notUsed: 8, agencyPaid: 64, notAgencyPaid: 20, paymentUnknown: 8 },
    { name: "Claude", answered: 100, notUsed: 48, agencyPaid: 32, notAgencyPaid: 14, paymentUnknown: 6 },
    { name: "Gemini", answered: 100, notUsed: 58, agencyPaid: 18, notAgencyPaid: 18, paymentUnknown: 6 },
    { name: "Perplexity", answered: 100, notUsed: 72, agencyPaid: 10, notAgencyPaid: 14, paymentUnknown: 4 },
    { name: "Microsoft Copilot", answered: 100, notUsed: 80, agencyPaid: 12, notAgencyPaid: 4, paymentUnknown: 4 },
    { name: "Grok", answered: 100, notUsed: 90, agencyPaid: 4, notAgencyPaid: 4, paymentUnknown: 2 },
    { name: "DeepSeek", answered: 100, notUsed: 88, agencyPaid: 2, notAgencyPaid: 8, paymentUnknown: 2 },
    { name: "Other AI assistant", answered: 100, notUsed: 92, agencyPaid: 4, notAgencyPaid: 3, paymentUnknown: 1 },
  ],
  // Generic names deliberately avoid publishing fictional negative vendor rankings.
  leastValue: { answered: 30, tools: [
    { name: "Example tool A", mentions: 12 },
    { name: "Example tool B", mentions: 8 },
    { name: "Example tool C", mentions: 6 },
    { name: "Example tool D", mentions: 4 },
  ] },
};
