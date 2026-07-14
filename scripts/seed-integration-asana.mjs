#!/usr/bin/env node
/**
 * Seed the "Asana" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /preview/integrations/asana. Reuses the 2026 homepage sections as a
 * fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integration-asana-v1-1.md;
 * [bracketed] and *italic* build/FLAG notes are dropped, and the shared trust
 * strip is not seeded (hard-coded chrome).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-asana.mjs
 *   DRY_RUN=1 node scripts/seed-integration-asana.mjs
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
  _id: "integrationPreviewPage-asana",
  _type: "integrationPreviewPage",
  title: "Asana",
  slug: { _type: "slug", current: "asana" },
  family: "Project boards",
  cardBlurb: "Sign-offs close tasks, statuses stay matched, two-way.",
  hero: {
    kicker: "· TASK MANAGEMENT · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Asana tasks", "that close themselves."],
    subhead:
      "A sign-off in Superflow moves the linked Asana task to done. Statuses stay matched both ways, mapped to your columns. Set the mapping once.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-close", label: "Self-closing task", icon: "check" },
      { _key: "ht-columns", label: "Steps as columns", icon: "layout-kanban" },
      { _key: "ht-twoway", label: "Two-way sync", icon: "share" },
      { _key: "ht-replies", label: "Synced replies", icon: "message" },
    ],
  },
  featureSet: {
    headerTitle: "Link once. The board follows.",
    journeyStart: "A client approves",
    journeyEnd: "Asana marks it done",
    blocks: [
      {
        _key: "block-flows",
        title: "The two-way table",
        description:
          "Superflow writes review state. Asana owns its own task fields. Neither overwrites the other's, and nothing echoes in a loop.",
        icon: "refresh",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "flows-out",
            label: "Superflow → Asana",
            icon: "send",
            oneLiner:
              "A client sign-off moves the linked task to your mapped done-state. A reply on the review thread posts to the linked task's comments. A review's step change moves the task to the mapped column. A comment can create a linked task, if you turn that on.",
          },
          {
            _key: "flows-in",
            label: "Asana → Superflow",
            icon: "refresh",
            oneLiner:
              "A status change on the board reflects back onto the linked review. A comment on the linked task posts back to the review thread.",
          },
        ],
      },
      {
        _key: "block-unlocks",
        title: "What the Asana sync unlocks",
        description:
          "Five things the sync does so nobody reconciles two boards by hand.",
        icon: "sparkles",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "unlock-close",
            label: "The self-closing task",
            icon: "circle-check",
            oneLiner:
              "The client approves. The linked task moves to your done-state on its own. Without it, the board says open after the client said done.",
          },
          {
            _key: "unlock-columns",
            label: "Steps as columns",
            icon: "layout-kanban",
            oneLiner:
              "The review's current step shows as the task's column, matched to your names. Without it, you reconcile two boards by hand.",
          },
          {
            _key: "unlock-comments",
            label: "Comments as tasks, when you choose",
            icon: "list-check",
            oneLiner:
              "A review comment can create a linked task with a back-link. Without it, action items get re-typed into the board.",
          },
          {
            _key: "unlock-twoway",
            label: "Two-way, no overwrites",
            icon: "refresh",
            oneLiner:
              "Board changes reflect back, and each tool writes only its own fields. Without it, sync means overwrite.",
          },
          {
            _key: "unlock-replies",
            label: "Synced replies",
            icon: "message-circle",
            oneLiner:
              "Answer on the task or on the review. The thread stays one conversation, in both places. Without it, the discussion forks.",
          },
        ],
      },
      {
        _key: "block-behaves",
        title: "How the Asana sync behaves",
        description:
          "The guarantees behind the sync, so the mapping is always the contract.",
        icon: "settings",
        accent: ACCENT_ORANGE,
        mock: "workflow",
        tabs: [
          {
            _key: "behave-links",
            label: "One or many links",
            icon: "link",
            oneLiner: "Link a review to one task or several.",
          },
          {
            _key: "behave-explicit",
            label: "Explicit mapping",
            icon: "route",
            oneLiner:
              "Mapping is explicit. Superflow never guesses a destination column.",
          },
          {
            _key: "behave-noecho",
            label: "No echo loops",
            icon: "refresh",
            oneLiner: "No echo loops: a change syncs once, in the right direction.",
          },
          {
            _key: "behave-isolation",
            label: "Client isolation",
            icon: "user-check",
            oneLiner:
              "Client and guest activity never touches the board unless you map it.",
          },
          {
            _key: "behave-queue",
            label: "Queues on outage",
            icon: "history",
            oneLiner:
              "If Asana is down, reviews keep working. Updates queue and retry.",
          },
          {
            _key: "behave-health",
            label: "Health in settings",
            icon: "settings",
            oneLiner: "Sync health and history live in settings.",
          },
        ],
      },
      {
        _key: "block-related",
        title: "Part of the integrations catalog",
        description:
          "Asana is one connector in the catalog. Kanban covers our board. This page keeps yours honest.",
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
            _key: "related-monday",
            label: "Monday",
            icon: "layout-kanban",
            oneLiner: "Same two-way sync, mapped to your columns.",
            href: "/preview/integrations/monday",
            listOnly: true,
          },
          {
            _key: "related-clickup",
            label: "ClickUp",
            icon: "layout-kanban",
            oneLiner: "Same two-way sync, mapped to your statuses.",
            href: "/preview/integrations/clickup",
            listOnly: true,
          },
          {
            _key: "related-board",
            label: "The built-in board",
            icon: "layout-dashboard",
            oneLiner: "Kanban covers our board. This page keeps yours honest.",
            href: "/kanban-board",
            listOnly: true,
          },
          {
            _key: "related-directory",
            label: "Asana app directory",
            icon: "link",
            oneLiner: "Get Superflow in the Asana app directory.",
            href: "https://asana.com/apps/superflow",
            listOnly: true,
          },
          {
            _key: "related-hub",
            label: "All integrations",
            icon: "plug",
            oneLiner: "Every tool, one review.",
            href: "/preview/integrations",
            listOnly: true,
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Link once. The board follows.",
    steps: [
      {
        _key: "gs-connect",
        accent: ACCENT_BLUE,
        title: "Connect",
        description: "Authorize Asana from settings.",
      },
      {
        _key: "gs-map",
        accent: ACCENT_GREEN,
        title: "Map",
        description:
          "Match your Asana columns to Superflow statuses. Your names, not ours.",
      },
      {
        _key: "gs-work",
        accent: ACCENT_ORANGE,
        title: "Work",
        description: "Reviews run. The board updates itself, both ways.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-direction",
        question: "Which direction does it sync?",
        answer:
          "Both. Sign-offs and steps flow to Asana. Board status flows back. Each side owns its own fields.",
      },
      {
        _key: "faq-wrong-task",
        question: "Can it close the wrong task?",
        answer:
          "No. You map the link and the done-state yourself. Nothing is inferred. The mapping is the contract.",
      },
      {
        _key: "faq-client-see",
        question: "Do my clients see Asana?",
        answer: "No. Clients see the review link. The board is yours.",
      },
      {
        _key: "faq-stages",
        question: "We name our stages differently.",
        answer:
          "That's the point of the mapping: your columns, matched to our statuses, once.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "Asana Integration: Tasks That Close Themselves | Superflow",
  metaDescription:
    "Two-way sync between Superflow reviews and Asana. A client sign-off moves the linked task to done, mapped to your columns.",
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
