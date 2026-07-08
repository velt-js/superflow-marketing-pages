#!/usr/bin/env node
/**
 * Seed the single `integrationPreviewHub` document that drives
 * /preview/integrations.
 *
 * Reuses the 2026 homepage sections as a fixed template (no asset uploads).
 * Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integrations-list.md
 * ([bracketed] and *italic* build notes dropped). The catalog reuses the shared
 * FeatureSet: each family is a block whose tabs are list-only cards linking to
 * /preview/integrations/<slug>. Only connectors that have a shipped detail page
 * in this preview set are listed (Slack, Asana, Monday, ClickUp, Figma, Webflow,
 * WordPress, Google Tag Manager, plus the API/Webhooks page). The capability
 * matrix and trust strip are summarized into FAQ/description copy rather than
 * building bespoke UI, per the layout decision (consistency over new UI).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-hub.mjs
 *   DRY_RUN=1 node scripts/seed-integration-hub.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const ACCENT_PLUM = "#da53b9";
const ACCENT_BLUE = "#433df3";
const ACCENT_GREEN = "#109534";
const ACCENT_UMBER = "#e17a14";
const ACCENT_PINK = "#d43f8d";

const INTEGRATIONS_HREF = "/preview/integrations";

const doc = {
  _id: "integrationPreviewHub",
  _type: "integrationPreviewHub",
  title: "Integrations",
  hero: {
    kicker: "· THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Connect the tools", "you already run."],
    subhead:
      "Comments land in Slack. Sign-offs close Asana, Monday, and ClickUp tasks, two-way. Webhooks cover the rest. Nobody checks one more tab.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-slack", label: "Slack", icon: "message" },
      { _key: "ht-boards", label: "Project boards", icon: "list-check" },
      { _key: "ht-webhooks", label: "Webhooks", icon: "code-asterisk" },
    ],
  },
  solution: {
    heading: "Integrations put the review inside the tools you already run.",
    subheading:
      "Slack gets the comment. The board gets the status. The task closes when the client approves.",
    variant: "checklist",
  },
  catalog: {
    headerTitle: "Every tool, one review.",
    journeyStart: "Your stack",
    journeyEnd: "One review",
    blocks: [
      {
        _key: "family-chat",
        title: "Chat",
        description: "The review, in the channel.",
        icon: "message-circle",
        accent: ACCENT_PLUM,
        mock: "workflow",
        tabs: [
          {
            _key: "chat-slack",
            label: "Slack",
            icon: "message-circle",
            oneLiner: "A client comments, your channel knows. Act from the message.",
            href: `${INTEGRATIONS_HREF}/slack`,
          },
        ],
      },
      {
        _key: "family-boards",
        title: "Project boards",
        description: "Tasks that close themselves.",
        icon: "list-check",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "boards-asana",
            label: "Asana",
            icon: "list-check",
            oneLiner: "Sign-offs close tasks, statuses stay matched, two-way.",
            href: `${INTEGRATIONS_HREF}/asana`,
          },
          {
            _key: "boards-monday",
            label: "Monday",
            icon: "list-check",
            oneLiner: "Same two-way sync, mapped to your columns.",
            href: `${INTEGRATIONS_HREF}/monday`,
            listOnly: true,
          },
          {
            _key: "boards-clickup",
            label: "ClickUp",
            icon: "list-check",
            oneLiner: "Same two-way sync, mapped to your statuses.",
            href: `${INTEGRATIONS_HREF}/clickup`,
            listOnly: true,
          },
        ],
      },
      {
        _key: "family-install",
        title: "Install",
        description:
          "Any site takes the snippet. Superflow installs on any website with one snippet, yours or your developer's five minutes. The platforms below have a built-in path.",
        icon: "plug",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "install-webflow",
            label: "Webflow",
            icon: "world",
            oneLiner: "A built-in install for Webflow sites.",
            href: `${INTEGRATIONS_HREF}/webflow`,
          },
          {
            _key: "install-wordpress",
            label: "WordPress",
            icon: "world",
            oneLiner: "A built-in install for WordPress sites.",
            href: `${INTEGRATIONS_HREF}/wordpress`,
            listOnly: true,
          },
          {
            _key: "install-gtm",
            label: "Google Tag Manager",
            icon: "code-asterisk",
            oneLiner: "One tag covers any site that runs GTM.",
            href: `${INTEGRATIONS_HREF}/google-tag-manager`,
            listOnly: true,
          },
        ],
      },
      {
        _key: "family-design",
        title: "Design and files",
        description: "Review it where it was made.",
        icon: "palette",
        accent: ACCENT_UMBER,
        mock: "workflow",
        tabs: [
          {
            _key: "design-figma",
            label: "Figma",
            icon: "palette",
            oneLiner: "Send frames for review; comments come back to the node.",
            href: `${INTEGRATIONS_HREF}/figma`,
          },
        ],
      },
      {
        _key: "family-build",
        title: "Build your own",
        description: "For the tools we don't list.",
        icon: "code-asterisk",
        accent: ACCENT_PINK,
        mock: "workflow",
        tabs: [
          {
            _key: "build-webhooks",
            label: "Webhooks",
            icon: "share",
            oneLiner: "Every review event, pushed anywhere.",
            href: `${INTEGRATIONS_HREF}/api`,
          },
          {
            _key: "build-api",
            label: "REST API",
            icon: "code-asterisk",
            oneLiner: "Read and write reviews from your own stack.",
            href: `${INTEGRATIONS_HREF}/api`,
            listOnly: true,
          },
        ],
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-which",
        question: "Which tools does Superflow connect to?",
        answer:
          "Today: Slack, Asana, Monday, ClickUp, Webflow, WordPress, Google Tag Manager, GitHub, Vercel, webhooks, and a REST API. This list is always current.",
      },
      {
        _key: "faq-twoway",
        question: "Two-way, or just notifications?",
        answer:
          "Two-way where the tool supports it. A sign-off in Superflow closes the task. A status change on your board reflects back. Each connector's page says exactly which way its data flows.",
      },
      {
        _key: "faq-platform",
        question:
          "My site isn't on any of these platforms. Can I still install Superflow?",
        answer:
          "Yes. Any website takes the snippet: paste one line, or send the setup steps to your developer. Custom stacks, headless sites, and anything with GTM all work.",
      },
      {
        _key: "faq-notlisted",
        question: "My workflow tool isn't listed. Am I stuck?",
        answer:
          "No. Webhooks push every review event anywhere, and the REST API writes back in.",
      },
      {
        _key: "faq-clientsee",
        question: "Will my client see our Slack messages?",
        answer:
          "No. Client and guest activity stays out of internal channels unless you explicitly map it. The client sees the review, never the plumbing.",
      },
      {
        _key: "faq-breaks",
        question: "What happens if a connector breaks?",
        answer:
          "The review keeps working in-app. The event queues and retries, and the workspace admin gets a banner. An integration outage never blocks a sign-off.",
      },
      {
        _key: "faq-developer",
        question: "Do I need a developer to set this up?",
        answer:
          "No. Connect and map from settings. The REST API and webhooks exist for the one team in twenty that wants a custom pipeline.",
      },
      {
        _key: "faq-cost",
        question: "What do integrations cost?",
        answer:
          "Included from the Growth plan. Okta, SAML, and SCIM are Enterprise. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "Integrations: Slack, Asana, Monday, ClickUp | Superflow",
  metaDescription:
    "Superflow connects to the tools your agency already runs. Comments land in Slack, sign-offs close your project tasks, and webhooks cover the rest.",
};

async function main() {
  if (DRY_RUN) {
    console.log(JSON.stringify(doc, null, 2));
    return;
  }
  const res = await client.createOrReplace(doc);
  console.log("Seeded:", res._id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
