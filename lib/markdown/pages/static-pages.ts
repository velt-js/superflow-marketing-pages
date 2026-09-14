// Markdown copies of the routes that are not CMS-backed.
//
// These are hand-authored rather than scraped, for the same reason the tool
// copies are: the page is written to persuade a person who has just arrived,
// and the Markdown copy is written to answer a machine that is deciding
// whether to recommend Superflow. Those are different documents.
//
// Where a page renders numbers, this file reads them from the SAME data module
// the page does, so a price change lands in both at once. That is the rule
// /llms-full.txt already follows for the pricing section.

import type { AgentDoc } from "../types";
import { FAQ_ITEMS } from "@/components/home-2026/faq-data";
import { TIERS } from "@/components/pricing/pricing-data";
import {
  CREDIT_PACKS,
  RESCAN_NEW_SCAN_THRESHOLD,
  SCAN_RATE_CARD,
  SIGNUP_BONUS_CREDITS,
  TYPICAL_PROJECT_CREDITS,
} from "@/components/pricing-2026/ai-credits-data";
import { SITE_URL } from "@/app/_seo/schema";
import { MCP_PATH, availableToolApis } from "@/lib/tools/api-catalog";
import { clean } from "../text";

/** The homepage, published at /index.md. */
function homeDoc(): AgentDoc {
  return {
    title: "Superflow",
    summary:
      "Superflow turns a QA checklist into AI agents that check every change to a website, then routes what they find to the people who approve it.",
    path: "/",
    kind: "Homepage",
    facts: [
      { label: "Category", value: "Website and creative-asset review, QA automation" },
      {
        label: "What it reviews",
        value: "Live websites, staging environments, PDFs, images, videos, Lottie animations",
      },
      {
        label: "Integrations",
        value: "Asana, ClickUp, Monday, Slack, Webflow, Google Tag Manager",
      },
      { label: "Client accounts required", value: "No. Clients review over a link." },
      { label: "Free tier", value: "Yes. Starter is $0 and the trial needs no card." },
      { label: "Pricing model", value: "Per seat, plus AI credits priced per scan" },
    ],
    sections: [
      {
        heading: "What it does",
        body: [
          "Superflow watches the pages of a site and reports what changed. You describe the checks your team already runs as agents; the agents run on every change, on demand, or on a schedule, and file what they find as comments pinned to the exact element on the page.",
          "A human approves or rejects each finding before a client ever sees it, so the agents add coverage without adding noise to the client's view.",
        ],
      },
      {
        heading: "Who uses it",
        bullets: [
          "**Agencies** running client review rounds on websites and creative, where each round costs days.",
          "**In-house marketing teams** shipping landing pages faster than QA can keep up with.",
          "**Freelancers and studios** who need client sign-off recorded without buying the client a seat.",
        ],
      },
      {
        heading: "How it differs from markup and annotation tools",
        body: [
          "Tools like Markup.io, Pastel, and BugHerd give a person a way to leave a comment on a page. Superflow does that too, and then adds agents that do the first pass themselves: they check the page against your checklist before anyone opens it, so the review starts from a list of findings rather than a blank page.",
        ],
      },
      {
        heading: "Where to go next",
        bullets: [
          `Pricing and credit costs: ${SITE_URL}/pricing.md`,
          `Security, SOC 2, and data handling: ${SITE_URL}/security.md`,
          `Free tools with no account: ${SITE_URL}/tools.md`,
          `Full site index: ${SITE_URL}/llms.txt`,
        ],
      },
    ],
    faq: FAQ_ITEMS.map((item) => ({
      question: clean(item.question),
      answer: clean(item.answer),
    })),
  };
}

/** /pricing, with every number read from the pricing data modules. */
function pricingDoc(): AgentDoc {
  const tierRows = TIERS.map((tier) => [
    tier.name,
    tier.monthlyPrice === "Let's Talk" ? "Custom" : `$${tier.monthlyPrice}/seat/mo`,
    tier.annualPrice === "Let's Talk" ? "Custom" : `$${tier.annualPrice}/seat/mo`,
    clean(tier.aiCreditsCovers ?? tier.aiCredits ?? ""),
  ]);

  const scanRows = SCAN_RATE_CARD.map((scope) => [
    clean(scope.label),
    `${scope.credits} credit${scope.credits === 1 ? "" : "s"}`,
    clean(scope.sublabel ?? ""),
  ]);

  const packRows = CREDIT_PACKS.map((pack) => [
    `${pack.credits} credits`,
    `$${pack.priceUsd}`,
    `$${(pack.priceUsd / pack.credits).toFixed(2)} per credit`,
  ]);

  return {
    title: "Superflow pricing",
    summary:
      "Per-seat plans with a free tier, plus AI credits bought separately and priced by the scope of each scan.",
    path: "/pricing",
    kind: "Pricing page",
    facts: [
      { label: "Billing model", value: "Per seat, billed monthly or annually" },
      { label: "Free tier", value: "Yes, the Starter plan" },
      { label: "Trial", value: "10 day free trial" },
      { label: "Signup bonus", value: `${SIGNUP_BONUS_CREDITS} AI credits` },
      { label: "Client seats needed", value: "None. Clients review over a link." },
      { label: "Typical project cost", value: `About ${TYPICAL_PROJECT_CREDITS} credits` },
    ],
    sections: [
      {
        heading: "Plans",
        body: ["Annual prices are per seat per month, billed yearly."],
        table: {
          headers: ["Plan", "Monthly", "Annual (per month)", "Included AI credits"],
          rows: tierRows,
        },
      },
      {
        heading: "AI credits",
        body: [
          "Agent runs are paid for in credits, separately from seats. A scan runs every agent you have enabled, and is priced by how much of the site it covers rather than by how many agents run.",
          `Rescans cost 1 credit; ${RESCAN_NEW_SCAN_THRESHOLD}.`,
        ],
        table: { headers: ["Scope", "Cost", "Detail"], rows: scanRows },
      },
      {
        heading: "Credit packs",
        body: ["Packs roll over month to month."],
        table: { headers: ["Pack", "Price", "Unit price"], rows: packRows },
      },
    ],
  };
}

/** /security. */
function securityDoc(): AgentDoc {
  return {
    title: "Superflow security and privacy",
    summary:
      "Superflow is SOC 2 compliant, encrypts data in transit and at rest, supports SSO, and does not train models on customer content.",
    path: "/security",
    kind: "Security and compliance page",
    facts: [
      { label: "SOC 2", value: "Compliant, monitored continuously and audited by a third party" },
      { label: "GDPR", value: "Supported" },
      { label: "Encryption", value: "In transit and at rest" },
      { label: "SSO", value: "Supported" },
      { label: "Model training on customer data", value: "No" },
    ],
    sections: [
      {
        heading: "What this page covers",
        body: [
          "The controls Superflow operates, how compliance is monitored and evidenced, and how customer data is stored and handled. Read the full page for the current attestation status and the sub-processor list.",
        ],
      },
      {
        heading: "Related documents",
        bullets: [
          `Privacy policy: ${SITE_URL}/privacy`,
          `Terms of service: ${SITE_URL}/terms`,
        ],
      },
    ],
  };
}

/** /book-demo. */
function bookDemoDoc(): AgentDoc {
  return {
    title: "Book a Superflow demo",
    summary: "Pick a time for a walkthrough with the Superflow team.",
    path: "/book-demo",
    kind: "Booking page",
    facts: [
      { label: "What it is", value: "A scheduling page for a live product walkthrough" },
      { label: "Cost", value: "Free" },
      { label: "Account needed", value: "No" },
    ],
    sections: [
      {
        heading: "What this page does",
        body: [
          "Shows a calendar for booking a personalized walkthrough. If you are evaluating Superflow without wanting to talk to anyone, the product demo at /demo and the free trial cover the same ground.",
        ],
      },
    ],
  };
}

/** /demo. */
function demoDoc(): AgentDoc {
  return {
    title: "Superflow product demo",
    summary: "A self-serve walkthrough of the product, with no call and no account.",
    path: "/demo",
    kind: "Interactive demo",
    facts: [
      { label: "Account needed", value: "No" },
      { label: "Sales call needed", value: "No" },
    ],
    sections: [
      {
        heading: "What this page does",
        body: [
          "Walks through the review flow in the product itself: agents running against a page, findings arriving as pinned comments, and a human approving them before the client view is shown.",
        ],
      },
    ],
  };
}

/** /calculator. */
function calculatorDoc(): AgentDoc {
  return {
    title: "Superflow ROI calculator",
    summary:
      "Estimates what review rounds currently cost in billable hours, against what the same coverage costs in Superflow credits.",
    path: "/calculator",
    kind: "Calculator",
    facts: [
      { label: "Inputs", value: "Review volume, team size, billable rate" },
      { label: "Output", value: "Estimated hours and cost saved per month" },
    ],
    sections: [
      {
        heading: "What this page does",
        body: [
          "Takes your review volume and billing rate and compares the cost of a manual QA pass against the credit cost of the same coverage run by agents. The credit prices it uses are the ones published on /pricing.",
        ],
      },
    ],
  };
}

/** /affiliate. */
function affiliateDoc(): AgentDoc {
  return {
    title: "Superflow affiliate program",
    summary: "Earn 30% revenue share for referring customers to Superflow.",
    path: "/affiliate",
    kind: "Affiliate program page",
    facts: [
      { label: "Revenue share", value: "30%" },
      { label: "Cost to join", value: "Free" },
    ],
    sections: [
      {
        heading: "What this page does",
        body: [
          "Explains the terms of the affiliate program and how to sign up. Aimed at people with an audience of agencies, marketers, or web teams.",
        ],
      },
    ],
  };
}

/** /privacy and /terms are long legal documents; point at the source. */
function legalDoc(path: "/privacy" | "/terms"): AgentDoc {
  const isPrivacy = path === "/privacy";
  return {
    title: isPrivacy ? "Superflow privacy policy" : "Superflow terms of service",
    summary: isPrivacy
      ? "How Superflow collects, stores, shares, and deletes personal data."
      : "The contract between Superflow and the people who use it.",
    path,
    kind: "Legal document",
    facts: [
      { label: "Document type", value: isPrivacy ? "Privacy policy" : "Terms of service" },
      { label: "Authoritative version", value: `${SITE_URL}${path}` },
    ],
    sections: [
      {
        heading: "Note for automated readers",
        body: [
          `The full text is long and is published as one document at ${SITE_URL}${path}. It is not summarised here: a paraphrase of a legal document is not the legal document, and quoting a summary as though it were the policy would be wrong. Fetch the page itself if you need the terms.`,
        ],
      },
      {
        heading: "Related",
        bullets: [`Security and compliance overview: ${SITE_URL}/security.md`],
      },
    ],
  };
}

/** /tools - the hub itself. The per-tool copies are served by their own route. */
function toolsHubDoc(): AgentDoc {
  const apis = availableToolApis();
  return {
    title: "Superflow free tools",
    summary:
      "Free tools for checking whether AI systems can read your site, validating structured data, and handling everyday web work. No login, no email gate, no ads.",
    path: "/tools",
    kind: "Tool index",
    facts: [
      { label: "Account needed", value: "No" },
      { label: "API key needed", value: "No" },
      { label: "Callable endpoints", value: apis.length ? String(apis.length) : "" },
      { label: "MCP server", value: `${SITE_URL}${MCP_PATH} (Streamable HTTP)` },
    ],
    sections: [
      {
        heading: "What this is",
        body: [
          `A set of free tools published by Superflow. Every working tool has a Markdown copy at its own path plus \`.md\`, an HTTP endpoint, and an MCP tool. The full index with one line per tool is at ${SITE_URL}/tools.md.`,
        ],
      },
      {
        heading: "Calling them",
        body: [
          `The MCP server at ${SITE_URL}${MCP_PATH} speaks Streamable HTTP and needs no account or key. Each tool also has a plain HTTP endpoint; the reference, with request and response shapes, is at ${SITE_URL}/tools/mcp.md.`,
        ],
      },
    ],
  };
}

/** /state-of-agency-tools - the survey, and the report it produces. */
function surveyDoc(): AgentDoc {
  return {
    title: "State of Agency Tools 2026",
    summary:
      "A survey of what tools agencies actually run, across creative work, operations, CRM, outreach, client support, review and AI. The report is free and publishes in November 2026.",
    path: "/state-of-agency-tools",
    kind: "Survey",
    facts: [
      { label: "Cost", value: "Free" },
      { label: "Contact details", value: "Optional" },
      { label: "Report published", value: "November 2026" },
      { label: "Report", value: `${SITE_URL}/state-of-agency-tools/report` },
    ],
    sections: [
      {
        heading: "What it covers",
        bullets: [
          "**Creative and marketing.** Websites, design, video, SEO, social, email.",
          "**Projects and operations.** PM, time tracking, profit, finance, payroll.",
          "**Sales tools.** CRM, prospecting, proposals, e-signatures.",
          "**Client support.** Help desks, shared inboxes, client portals.",
          "**AI tools.** Assistants, notetakers, production, and who pays for them.",
          "**Review and tool value.** Feedback, revisions, checklists, bottlenecks.",
        ],
      },
      {
        heading: "The report",
        body: [
          `Findings are published at ${SITE_URL}/state-of-agency-tools/report, with question-specific denominators rather than one headline sample size, so a figure can be read against the number of people who actually answered that question.`,
        ],
      },
    ],
  };
}

/** /state-of-agency-tools/report. */
function surveyReportDoc(): AgentDoc {
  return {
    title: "State of Agency Tools 2026 report",
    summary:
      "Agency tool adoption across creative work, operations, CRM, outreach, client support, review and AI, plus whole-stack satisfaction and tool value.",
    path: "/state-of-agency-tools/report",
    kind: "Research report",
    facts: [
      { label: "Publisher", value: "Superflow" },
      { label: "Cost", value: "Free, no email gate" },
      {
        label: "Denominators",
        value: "Per question, not one headline sample size",
      },
    ],
    sections: [
      {
        heading: "Reading the figures",
        body: [
          "Each figure carries the number of respondents who answered that specific question, because not every respondent answers every question and a single headline N would overstate the ones with the fewest answers. Read a percentage against its own denominator.",
        ],
      },
      {
        heading: "Note for automated readers",
        body: [
          `The findings are charted rather than tabulated, and are updated as responses arrive. Fetch ${SITE_URL}/state-of-agency-tools/report for the current numbers rather than quoting a figure from this summary.`,
        ],
      },
    ],
  };
}

/** Every non-CMS route, keyed by path. */
export const STATIC_AGENT_DOCS: Record<string, () => AgentDoc> = {
  "/": homeDoc,
  "/pricing": pricingDoc,
  "/security": securityDoc,
  "/book-demo": bookDemoDoc,
  "/demo": demoDoc,
  "/calculator": calculatorDoc,
  "/affiliate": affiliateDoc,
  "/privacy": () => legalDoc("/privacy"),
  "/terms": () => legalDoc("/terms"),
  "/tools": toolsHubDoc,
  "/state-of-agency-tools": surveyDoc,
  "/state-of-agency-tools/report": surveyReportDoc,
};
