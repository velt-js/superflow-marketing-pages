#!/usr/bin/env node
// Creates the State of Agency Tools 2026 survey in Tally via their API.
//
// Usage:
//   TALLY_API_KEY=tly-xxxx node scripts/agency-tools-survey/create-tally-form.mjs [flags]
//
// Flags:
//   --dry-run          Print the request payload instead of calling the API.
//   --publish          Create as PUBLISHED (default is DRAFT for review).
//   --workspace <id>   Create in a specific Tally workspace.
//   --no-logic         Omit the conditional-logic blocks (add gates by hand).
//
// The API key comes from https://tally.so/settings/api-keys (Pro).
// After a non-dry run the script prints the form ID; review the form and its
// four gate rules in the Tally editor, publish, then paste the ID into
// lib/agency-tools-survey/config.ts.
//
// Survey spec: see app/state-of-agency-tools/README.md. One question per
// page; Q3 gates the tool sections ("Full service" opens every gate); every
// tool list ends with an "Other" write-in; auto-jump makes single-selects
// one tap.

import { randomUUID } from "node:crypto";

const API_URL = "https://api.tally.so/forms";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const PUBLISH = args.includes("--publish");
const NO_LOGIC = args.includes("--no-logic");
const workspaceIdx = args.indexOf("--workspace");
const WORKSPACE_ID = workspaceIdx >= 0 ? args[workspaceIdx + 1] : undefined;

// ---------------------------------------------------------------------------
// Survey definition
// ---------------------------------------------------------------------------

/** Option lists that appear in more than one question. */
const AI_ASSISTANTS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Microsoft Copilot",
  "Grok",
  "DeepSeek",
  "None",
];

/**
 * kind: "single" (radio, auto-jump) | "multi" (checkboxes) | "text" | "email"
 * other: append an "Other" write-in option
 * optional: not required
 * gate: key naming the gate rule set this question belongs to (see LOGIC)
 */
const QUESTIONS = [
  // Part 1: You
  {
    id: "q1",
    title: "What best describes you?",
    kind: "single",
    options: [
      "Agency owner/founder",
      "Operations/PM",
      "Creative/design",
      "Developer",
      "Account/client services",
      "Freelancer/solo",
    ],
    other: true,
  },
  {
    id: "q2",
    title: "Team size, including contractors?",
    kind: "single",
    options: ["Just me", "2-5", "6-10", "11-25", "26-50", "51+"],
  },
  {
    id: "q3",
    title: "Which services do you offer?",
    kind: "multi",
    options: [
      "Web design/development",
      "Branding/graphic design",
      "Video/motion",
      "SEO/content",
      "Paid ads",
      "Social media",
      "Email/CRM",
      "Full service",
    ],
  },
  // Part 2: Website building [gate: web]
  {
    id: "q4",
    title: "Which platforms do you build client sites on?",
    kind: "multi",
    options: [
      "Webflow",
      "WordPress",
      "Framer",
      "Wix Studio",
      "Squarespace",
      "Shopify",
      "Custom code (Next.js, etc.)",
      "AI builders (Lovable, v0, Bolt)",
    ],
    other: true,
  },
  {
    id: "q5",
    title: "Your primary platform?",
    kind: "single",
    options: [
      "Webflow",
      "WordPress",
      "Framer",
      "Wix Studio",
      "Squarespace",
      "Shopify",
      "Custom code (Next.js, etc.)",
      "AI builders (Lovable, v0, Bolt)",
    ],
    other: true,
  },
  {
    id: "q6",
    title: "Would you choose it again for your next project?",
    kind: "single",
    options: ["Yes", "No", "Not sure"],
  },
  // Part 3: Design [gate: web OR branding]
  {
    id: "q7",
    title: "Which design tools does your team use?",
    kind: "multi",
    options: ["Figma", "Adobe Creative Cloud", "Canva", "Affinity"],
    other: true,
  },
  // Part 4: Video & motion [gate: video]
  {
    id: "q8",
    title: "Which video tools do you use?",
    kind: "multi",
    options: [
      "Premiere Pro",
      "After Effects",
      "DaVinci Resolve",
      "Final Cut",
      "CapCut",
      "Descript",
      "Runway",
    ],
    other: true,
  },
  // Part 5: Client review & approval
  {
    id: "q9",
    title: "How does client feedback on creative work usually reach you?",
    kind: "multi",
    options: [
      "Email",
      "Screenshots or marked-up PDFs",
      "Spreadsheets",
      "Slack/Teams messages",
      "Calls or meetings",
      "Comments in Figma/Google Docs",
      "A dedicated review tool",
      "Client portal",
    ],
    other: true,
  },
  {
    id: "q10",
    title: "Do you use a dedicated review/approval tool?",
    kind: "multi",
    options: [
      "None, we manage it manually",
      "Frame.io",
      "Ziflow",
      "Filestage",
      "PageProof",
      "Superflow",
      "Marker.io",
      "BugHerd",
    ],
    other: true,
  },
  {
    id: "q11",
    title:
      "On a typical website project, how many rounds of client revisions?",
    kind: "single",
    options: ["1", "2", "3", "4-5", "6+"],
  },
  {
    id: "q12",
    title: "Do you QA websites before launch?",
    kind: "single",
    options: [
      "Formal checklist, every time",
      "Informal, depends on the project",
      "No real process",
      "The client usually finds the bugs",
    ],
  },
  // Part 6: Project management
  {
    id: "q13",
    title: "Which PM tools does your team use?",
    kind: "multi",
    options: [
      "ClickUp",
      "Asana",
      "Monday",
      "Notion",
      "Basecamp",
      "Trello",
      "Teamwork",
      "Airtable",
      "Spreadsheets",
    ],
    other: true,
  },
  {
    id: "q14",
    title: "Your primary PM tool?",
    kind: "single",
    options: [
      "ClickUp",
      "Asana",
      "Monday",
      "Notion",
      "Basecamp",
      "Trello",
      "Teamwork",
      "Airtable",
      "Spreadsheets",
    ],
    other: true,
  },
  {
    id: "q15",
    title: "Would you choose it again?",
    kind: "single",
    options: ["Yes", "No", "Not sure"],
  },
  // Part 7: Money ops
  {
    id: "q16",
    title:
      "What do you use for time tracking, resourcing, and profitability?",
    kind: "multi",
    options: [
      "Productive",
      "Scoro",
      "Workamajig",
      "Harvest",
      "Float",
      "QuickBooks",
      "Xero",
      "Spreadsheets",
      "Nothing formal",
    ],
    other: true,
  },
  {
    id: "q17",
    title: "Do you know your profit margin per client?",
    kind: "single",
    options: [
      "Yes, tracked in a tool",
      "Roughly, in spreadsheets",
      "Honestly, no",
    ],
  },
  // Part 8: Meeting notes
  {
    id: "q18",
    title: "Do you use an AI notetaker on client calls?",
    kind: "multi",
    options: [
      "No, manual notes",
      "Otter",
      "Fireflies",
      "Fathom",
      "Granola",
      "Circleback",
      "tl;dv",
      "Zoom AI Companion",
      "Gemini in Google Meet",
    ],
    other: true,
  },
  // Part 9: Client communication
  {
    id: "q19",
    title: "Where does day-to-day client communication happen?",
    kind: "multi",
    options: [
      "Email",
      "Slack Connect",
      "Microsoft Teams",
      "WhatsApp/iMessage",
      "Basecamp",
      "Client portal (Copilot, SuiteDash, etc.)",
      "Notion shared pages",
    ],
    other: true,
  },
  // Part 10: SEO & reporting [gate: seo OR paid ads]
  {
    id: "q20",
    title: "Which tools do you use for SEO and client reporting?",
    kind: "multi",
    options: [
      "Ahrefs",
      "Semrush",
      "GA4",
      "Search Console",
      "Screaming Frog",
      "Looker Studio",
      "AgencyAnalytics",
    ],
    other: true,
  },
  // Part 11: Social [gate: social]
  {
    id: "q21",
    title: "Which social tools do you use?",
    kind: "multi",
    options: [
      "Sprout Social",
      "Hootsuite",
      "Buffer",
      "Later",
      "Metricool",
      "Native platforms only",
    ],
    other: true,
  },
  // Part 12: Email platforms [gate: email/CRM]
  {
    id: "q22",
    title: "Which email platforms do you run for clients?",
    kind: "multi",
    options: [
      "Klaviyo",
      "Mailchimp",
      "ActiveCampaign",
      "HubSpot",
      "beehiiv",
      "Brevo",
    ],
    other: true,
  },
  // Part 13: AI
  {
    id: "q23",
    title: "Which AI assistants does your team use for work?",
    kind: "multi",
    options: AI_ASSISTANTS,
    other: true,
  },
  {
    id: "q24",
    title: "Which do you actually pay for?",
    kind: "multi",
    options: AI_ASSISTANTS,
    other: true,
  },
  {
    id: "q25",
    title: "Which AI creative/production tools do you use?",
    kind: "multi",
    options: [
      "Midjourney",
      "GPT image generation",
      "Flux",
      "Runway",
      "Sora",
      "Veo",
      "ElevenLabs",
      "HeyGen",
      "Descript AI",
      "Cursor or Claude Code",
      "Custom agents",
      "None",
    ],
    other: true,
  },
  {
    id: "q26",
    title:
      "Roughly what share of client deliverable work does AI touch today?",
    kind: "single",
    options: ["0%", "1-10%", "11-25%", "26-50%", "51-75%", "Over 75%"],
  },
  {
    id: "q27",
    title: "Do you tell clients when AI is involved in their work?",
    kind: "single",
    options: [
      "Always",
      "Sometimes",
      "Never",
      "Clients ask us to use it",
      "Some clients ask us not to",
    ],
  },
  // Part 14: Last bits
  {
    id: "q28",
    title: "Which tool do you resent paying for?",
    kind: "text",
    placeholder: "One tool name is plenty",
  },
  {
    id: "q29",
    title: "Annual revenue?",
    kind: "single",
    optional: true,
    options: [
      "Under $100k",
      "$100k-500k",
      "$500k-1M",
      "$1M-3M",
      "$3M-10M",
      "$10M+",
      "Prefer not to say",
    ],
  },
  {
    id: "q30",
    title: "Where is your agency based?",
    kind: "single",
    options: [
      "US",
      "Canada",
      "UK",
      "Europe",
      "Australia/NZ",
      "Asia",
      "Latin America",
      "Middle East/Africa",
    ],
  },
  {
    id: "q31",
    title: "Do you focus on specific industries?",
    kind: "multi",
    optional: true,
    options: [
      "Healthcare/dental",
      "Home services",
      "Ecommerce",
      "SaaS/tech",
      "Real estate",
      "Legal",
      "Hospitality",
      "No niche",
    ],
    other: true,
  },
  {
    id: "q32",
    title: "Email to get the report first (optional)",
    kind: "email",
    optional: true,
    consentCheckbox: "OK to contact me about the results.",
  },
];

// ---------------------------------------------------------------------------
// Block builders
// ---------------------------------------------------------------------------

const uuid = () => randomUUID();

/** Option UUIDs per question id, so gate rules can reference Q3's answers. */
const optionUuids = {};
/** Option-group UUID per question id (the field the logic conditions read). */
const groupUuids = {};
/** Page-break UUID that STARTS the page of each question id (jump targets). */
const pageBreakUuids = {};

function choiceBlocks(q) {
  const blockType = q.kind === "single" ? "MULTIPLE_CHOICE_OPTION" : "MULTI_SELECT_OPTION";
  const groupType = q.kind === "single" ? "MULTIPLE_CHOICE" : "MULTI_SELECT";
  const groupUuid = uuid();
  groupUuids[q.id] = groupUuid;
  optionUuids[q.id] = {};
  const texts = q.other ? [...q.options, "Other"] : q.options;
  return texts.map((text, i) => {
    const blockUuid = uuid();
    optionUuids[q.id][text] = blockUuid;
    const isOther = q.other && i === texts.length - 1;
    const payload = {
      index: i,
      isFirst: i === 0,
      isLast: i === texts.length - 1,
      text,
    };
    if (i === 0) {
      payload.isRequired = !q.optional;
      if (q.other) payload.hasOtherOption = true;
    }
    if (isOther) {
      payload.isOtherOption = true;
      payload.hasOtherOption = true;
    }
    return { uuid: blockUuid, type: blockType, groupUuid, groupType, payload };
  });
}

function questionBlocks(q) {
  const blocks = [
    {
      uuid: uuid(),
      type: "TITLE",
      groupUuid: uuid(),
      groupType: "QUESTION",
      payload: { html: q.title },
    },
  ];
  if (q.kind === "single" || q.kind === "multi") {
    blocks.push(...choiceBlocks(q));
  } else if (q.kind === "text") {
    blocks.push({
      uuid: uuid(),
      type: "INPUT_TEXT",
      groupUuid: uuid(),
      groupType: "INPUT_TEXT",
      payload: {
        isRequired: !q.optional,
        placeholder: q.placeholder ?? "",
        hasMaxCharacters: true,
        maxCharacters: 120,
      },
    });
  } else if (q.kind === "email") {
    blocks.push({
      uuid: uuid(),
      type: "INPUT_EMAIL",
      groupUuid: uuid(),
      groupType: "INPUT_EMAIL",
      payload: { isRequired: !q.optional, placeholder: "you@agency.com" },
    });
    if (q.consentCheckbox) {
      blocks.push({
        uuid: uuid(),
        type: "CHECKBOX",
        groupUuid: uuid(),
        groupType: "CHECKBOXES",
        payload: {
          index: 0,
          isFirst: true,
          isLast: true,
          text: q.consentCheckbox,
          isRequired: false,
        },
      });
    }
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Assemble pages
// ---------------------------------------------------------------------------

const blocks = [];

// Page 1: intro. The form title doubles as the form's name in Tally.
blocks.push({
  uuid: uuid(),
  type: "FORM_TITLE",
  groupUuid: uuid(),
  groupType: "TEXT",
  payload: {
    html: "State of Agency Tools 2026",
    title: "State of Agency Tools 2026",
    button: { label: "Start" },
  },
});
blocks.push({
  uuid: uuid(),
  type: "TEXT",
  groupUuid: uuid(),
  groupType: "TEXT",
  payload: {
    html: "How does your stack compare to 500+ agencies? 5 minutes, all taps. Get the full report first, free, in November.",
  },
});
// Hidden fields ride on page 1 and capture UTM params from the embed URL.
blocks.push({
  uuid: uuid(),
  type: "HIDDEN_FIELDS",
  groupUuid: uuid(),
  groupType: "HIDDEN_FIELDS",
  payload: {
    hiddenFields: [
      { uuid: uuid(), name: "utm_source" },
      { uuid: uuid(), name: "utm_medium" },
      { uuid: uuid(), name: "utm_campaign" },
    ],
  },
});

// One page per question.
let pageIndex = 0;
for (const q of QUESTIONS) {
  const pb = uuid();
  pageBreakUuids[q.id] = pb;
  blocks.push({
    uuid: pb,
    type: "PAGE_BREAK",
    groupUuid: uuid(),
    groupType: "PAGE_BREAK",
    payload: { index: pageIndex++, isFirst: pageIndex === 1, isLast: false },
  });
  blocks.push(...questionBlocks(q));
}

// ---------------------------------------------------------------------------
// Gate logic
// ---------------------------------------------------------------------------
//
// Q3 gates the tool sections; "Full service" opens every gate. Rules on one
// page are written to be mutually exclusive so evaluation order never
// matters. Each rule: when its conditions hold, jump PAST the sections the
// respondent did not qualify for.

function servicesField() {
  return {
    uuid: groupUuids.q3,
    type: "INPUT_FIELD",
    questionType: "MULTI_SELECT_OPTION",
    blockGroupUuid: groupUuids.q3,
    title: "Which services do you offer?",
  };
}

/** Q3 option uuids for a gate, always including "Full service". */
function gateSet(...names) {
  return [...names, "Full service"].map((n) => {
    const u = optionUuids.q3[n];
    if (!u) throw new Error(`Unknown Q3 option: ${n}`);
    return u;
  });
}

function cond(comparison, value) {
  return {
    uuid: uuid(),
    type: "SINGLE",
    payload: { field: servicesField(), comparison, value },
  };
}

/** A logic block on `onPage` jumping to `toPage` when every cond holds. */
function jumpRule(onPageBlocks, toQuestionId, conds) {
  onPageBlocks.push({
    uuid: uuid(),
    type: "CONDITIONAL_LOGIC",
    groupUuid: uuid(),
    groupType: "CONDITIONAL_LOGIC",
    payload: {
      logicalOperator: "AND",
      conditionals: conds,
      actions: [
        {
          uuid: uuid(),
          type: "JUMP_TO_PAGE",
          payload: { jumpToPage: pageBreakUuids[toQuestionId] },
        },
      ],
    },
  });
}

if (!NO_LOGIC) {
  const web = gateSet("Web design/development");
  const brand = gateSet("Branding/graphic design");
  const video = gateSet("Video/motion");
  const seo = gateSet("SEO/content", "Paid ads");
  const social = gateSet("Social media");
  const email = gateSet("Email/CRM");

  const has = (set) => cond("IS_ANY_OF", set);
  const not = (set) => cond("IS_NOT_ANY_OF", set);

  // Insert rules right after the last block of the deciding question's page.
  // Since `blocks` is flat, find the insertion point: just before the page
  // break of the question AFTER the deciding one (or at the end).
  const insertAfterPage = (qid, build) => {
    const order = QUESTIONS.map((q) => q.id);
    const next = order[order.indexOf(qid) + 1];
    const idx = next
      ? blocks.findIndex((b) => b.uuid === pageBreakUuids[next])
      : blocks.length;
    const rules = [];
    build(rules);
    blocks.splice(idx, 0, ...rules);
  };

  // Leaving Q3: skip the web section (Q4-6) if not qualified.
  insertAfterPage("q3", (r) => {
    jumpRule(r, "q7", [not(web), has(brand)]);
    jumpRule(r, "q8", [not(web), not(brand), has(video)]);
    jumpRule(r, "q9", [not(web), not(brand), not(video)]);
  });
  // Leaving Q6 (end of web section): design shows for web OR branding, and
  // web qualifies everyone who got here, so only the video gate needs a rule
  // on Q7.
  insertAfterPage("q7", (r) => {
    jumpRule(r, "q9", [not(video)]);
  });
  // Leaving Q19: skip SEO/social/email sections as disqualified.
  insertAfterPage("q19", (r) => {
    jumpRule(r, "q21", [not(seo), has(social)]);
    jumpRule(r, "q22", [not(seo), not(social), has(email)]);
    jumpRule(r, "q23", [not(seo), not(social), not(email)]);
  });
  insertAfterPage("q20", (r) => {
    jumpRule(r, "q22", [not(social), has(email)]);
    jumpRule(r, "q23", [not(social), not(email)]);
  });
  insertAfterPage("q21", (r) => {
    jumpRule(r, "q23", [not(email)]);
  });
}

// ---------------------------------------------------------------------------
// Settings + request
// ---------------------------------------------------------------------------

const payload = {
  status: PUBLISH ? "PUBLISHED" : "DRAFT",
  ...(WORKSPACE_ID ? { workspaceId: WORKSPACE_ID } : {}),
  blocks,
  settings: {
    // Single-select answers advance on click - the "all taps" promise.
    pageAutoJump: true,
    hasProgressBar: true,
    // Pro: where people bail is itself a finding.
    hasPartialSubmissions: true,
    // Pro custom CSS: match the marketing site (Poppins, dark pill button).
    styles: [
      "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');",
      "body { font-family: 'Poppins', system-ui, sans-serif; }",
      "button[type='submit'], .tally-submit-button { border-radius: 9999px; }",
    ].join("\n"),
  },
};

if (DRY_RUN) {
  console.log(JSON.stringify(payload, null, 2));
  const qCount = QUESTIONS.length;
  const logicCount = blocks.filter((b) => b.type === "CONDITIONAL_LOGIC").length;
  console.error(
    `\n[dry-run] ${qCount} questions, ${blocks.length} blocks, ${logicCount} logic rules. Nothing sent.`,
  );
  process.exit(0);
}

const API_KEY = process.env.TALLY_API_KEY;
if (!API_KEY) {
  console.error(
    "Set TALLY_API_KEY (create one at https://tally.so/settings/api-keys).",
  );
  process.exit(1);
}

const res = await fetch(API_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error(`Create failed: ${res.status} ${res.statusText}`);
  console.error(await res.text());
  process.exit(1);
}

const form = await res.json();
const formId = form.id;

// Read the form back so silent drops (e.g. rejected logic blocks) surface.
const check = await fetch(`https://api.tally.so/forms/${formId}`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
});
let verified = "";
if (check.ok) {
  const fetched = await check.json();
  const got = (t) => (fetched.blocks ?? []).filter((b) => b.type === t).length;
  const want = (t) => blocks.filter((b) => b.type === t).length;
  const kinds = ["PAGE_BREAK", "TITLE", "CONDITIONAL_LOGIC", "MULTI_SELECT_OPTION", "MULTIPLE_CHOICE_OPTION"];
  verified = kinds
    .map((t) => `${t}: ${got(t)}/${want(t)}`)
    .join("  ");
}

console.log(`Created form ${formId} (${payload.status})`);
console.log(`Edit:    https://tally.so/forms/${formId}/edit`);
console.log(`Preview: https://tally.so/r/${formId}`);
if (verified) console.log(`Blocks round-tripped -> ${verified}`);
console.log(`
Next steps:
1. Open the editor and spot-check the four gate rules (pages Q3, Q7, Q19-21).
2. Publish the form (it was created as ${payload.status}).
3. Paste the ID into lib/agency-tools-survey/config.ts: TALLY_FORM_ID = "${formId}"
`);
