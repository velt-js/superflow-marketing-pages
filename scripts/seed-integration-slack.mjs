#!/usr/bin/env node
/**
 * Seed the "Slack" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /integrations/slack. Like every integration preview page it
 * reuses the 2026 homepage sections (components/home-2026/*) as a fixed
 * template — only the hero copy, the FeatureSet blocks, the Get Started steps,
 * the FAQ and SEO vary per page, so this seed is pure text/config with NO asset
 * uploads.
 *
 * Copy is authored verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integration-slack-v1-1.md.
 * Per the source rules, [bracketed] and *italic* build/VERIFY/FLAG notes never
 * render and are dropped. The App Directory listing link (VERIFY) and the trust
 * strip (shared, hard-coded chrome) are not seeded.
 *
 * This script only ever `createOrReplace`s the one document below; it never
 * deletes any other document.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-slack.mjs
 *   DRY_RUN=1 node scripts/seed-integration-slack.mjs
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

const ACCENT_BLUE = "#433df3";
const ACCENT_GREEN = "#109534";
const ACCENT_ORANGE = "#e0820a";
const ACCENT_PINK = "#d43f8d";

const doc = {
  _id: "integrationPreviewPage-slack",
  _type: "integrationPreviewPage",
  title: "Slack",
  slug: { _type: "slug", current: "slack" },
  family: "Chat",
  cardBlurb: "A client comments, your channel knows. Act from the message.",
  hero: {
    kicker: "CHAT · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Resolve reviews", "from Slack."],
    subhead:
      "A client comments, the channel knows. Mentions, status changes, and sign-offs land there too. Resolve, reply, or approve from the message. One setup in settings.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-comment", label: "Comment lands", icon: "message" },
      { _key: "ht-signoff", label: "Sign-off posts", icon: "check" },
      { _key: "ht-action", label: "Action row", icon: "bolt" },
      { _key: "ht-channel", label: "Per-client channel", icon: "user-check" },
    ],
  },
  featureSet: {
    headerTitle: "Connect once. The review travels.",
    journeyStart: "A client comments",
    journeyEnd: "You resolve in Slack",
    blocks: [
      {
        _key: "block-flows",
        title: "What flows",
        description:
          "A client's activity posts into your channel the moment it lands, and from the message you act on the review.",
        icon: "refresh",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "flows-out",
            label: "Superflow → Slack",
            icon: "send",
            oneLiner:
              "A client's comment posts the moment it lands, thumbnail and link to the spot included. A client's status change or sign-off posts to the mapped channel. Your team's comments and mentions post too; a mention pings the person, not the whole channel. A workflow step or full flow completing posts its result.",
          },
          {
            _key: "flows-in",
            label: "Slack → Superflow",
            icon: "refresh",
            oneLiner:
              "Resolve, reply, or approve from the message's action row. A thread reply posts back as a Superflow comment, attributed to the Slack user.",
          },
        ],
      },
      {
        _key: "block-unlocks",
        title: "What the Slack connector unlocks",
        description:
          "Five things the connector puts in the channel where your team already talks.",
        icon: "sparkles",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "unlock-reply",
            label: "The client's reply",
            icon: "message-circle",
            oneLiner:
              "A client comments or changes a status from their link, and the channel knows the moment it lands. Without it, someone refreshes the review waiting for the client.",
          },
          {
            _key: "unlock-signoff",
            label: "The sign-off announcement",
            icon: "circle-check",
            oneLiner:
              "The client's approval posts itself, thumbnail and deep link included. Without it, someone announces done by hand.",
          },
          {
            _key: "unlock-workflow",
            label: "Workflow results in the channel",
            icon: "route",
            oneLiner:
              "A step or a whole flow finishing posts its outcome where the team talks. Without it, you open the flow to learn it finished.",
          },
          {
            _key: "unlock-channels",
            label: "Channels that match your clients",
            icon: "user-check",
            oneLiner:
              "One channel per client, or one for everything. Reviews route where that account already lives. Without it, every update fights for one channel's attention.",
          },
          {
            _key: "unlock-action",
            label: "The action row",
            icon: "bolt",
            oneLiner:
              "Resolve, reply, or approve without switching tabs. Without it, every notification is a tab switch.",
          },
        ],
      },
      {
        _key: "block-behaves",
        title: "How the Slack connector behaves",
        description:
          "The guarantees behind the connector, so the channel never becomes a liability.",
        icon: "settings",
        accent: ACCENT_ORANGE,
        mock: "workflow",
        tabs: [
          {
            _key: "behave-scopes",
            label: "Minimal permissions",
            icon: "lock",
            oneLiner:
              "Requests the minimum permissions for posting and reading its own messages.",
          },
          {
            _key: "behave-isolation",
            label: "Client isolation",
            icon: "user-check",
            oneLiner:
              "Client and guest activity never posts to internal channels unless you map it.",
          },
          {
            _key: "behave-scoped-writes",
            label: "Never touches the rest",
            icon: "lock",
            oneLiner:
              "Superflow never edits or deletes anything else in your Slack.",
          },
          {
            _key: "behave-queue",
            label: "Queues on outage",
            icon: "refresh",
            oneLiner:
              "If Slack is down, reviews keep working. Events queue and retry.",
          },
          {
            _key: "behave-health",
            label: "Health in settings",
            icon: "history",
            oneLiner: "Connection health and the event log live in settings.",
          },
          {
            _key: "behave-disconnect",
            label: "Instant disconnect",
            icon: "circle-check",
            oneLiner: "Disconnect removes access immediately, upstream too.",
          },
        ],
      },
      {
        _key: "block-related",
        title: "Part of the integrations catalog",
        description:
          "Slack is one connector in the catalog. Explore the tools that pair with it.",
        icon: "plug",
        accent: ACCENT_PINK,
        mock: "workflow",
        tabs: [
          {
            _key: "related-lead",
            label: "Every tool, one review",
            icon: "plug",
            oneLiner:
              "Every tool, one review. Superflow connects to the tools your agency already runs.",
          },
          {
            _key: "related-asana",
            label: "Asana",
            icon: "layout-kanban",
            oneLiner: "Sign-offs close tasks, statuses stay matched, two-way.",
            href: "/integrations/asana",
            listOnly: true,
          },
          {
            _key: "related-monday",
            label: "Monday",
            icon: "layout-kanban",
            oneLiner: "Same two-way sync, mapped to your columns.",
            href: "/integrations/monday",
            listOnly: true,
          },
          {
            _key: "related-hub",
            label: "All integrations",
            icon: "plug",
            oneLiner: "Every tool, one review.",
            href: "/integrations",
            listOnly: true,
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Connect once. Slack does the telling.",
    steps: [
      {
        _key: "gs-connect",
        accent: ACCENT_BLUE,
        title: "Connect",
        description:
          "Add Superflow to your Slack from settings. One authorization, no code.",
      },
      {
        _key: "gs-map",
        accent: ACCENT_GREEN,
        title: "Map",
        description: "Pick a channel per client, or one channel for everything.",
      },
      {
        _key: "gs-work",
        accent: ACCENT_ORANGE,
        title: "Work",
        description:
          "Reviews proceed as usual. The channel hears about it the moment it happens.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-shows",
        question: "What shows up in Slack?",
        answer:
          "Your client's comments and status changes the moment they land, sign-offs, workflow results, and your team's mentions. Each with a thumbnail and a link to the exact spot.",
      },
      {
        _key: "faq-act",
        question: "Can I act on a review from Slack?",
        answer:
          "Yes. Resolve, reply, or approve right from the message. A thread reply posts back as a comment, attributed to you.",
      },
      {
        _key: "faq-client-see",
        question: "Will my client see any of this?",
        answer:
          "No. Client activity flows in; nothing about your internal channel flows out.",
      },
      {
        _key: "faq-per-client",
        question: "Can each client have their own channel?",
        answer:
          "Yes. Map a channel per client, or run one channel for everything.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "Slack Integration for Client Website Review | Superflow",
  metaDescription:
    "A client comments or approves and your Slack channel knows. Resolve, reply, or approve right from the message. One setup in settings.",
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
