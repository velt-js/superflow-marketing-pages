#!/usr/bin/env node
/**
 * Seed the "ClickUp" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /preview/integrations/clickup. Reuses the 2026 homepage sections as
 * a fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integration-clickup-v1-1.md;
 * [bracketed] and *italic* build/FIX/FLAG notes are dropped (the FIX note's
 * corrected unlock lines 1 and 4 are the ones seeded), and the shared trust
 * strip is not seeded (hard-coded chrome).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-clickup.mjs
 *   DRY_RUN=1 node scripts/seed-integration-clickup.mjs
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
  _id: "integrationPreviewPage-clickup",
  _type: "integrationPreviewPage",
  title: "ClickUp",
  slug: { _type: "slug", current: "clickup" },
  family: "Project boards",
  cardBlurb: "Same two-way sync, mapped to your statuses.",
  hero: {
    kicker: "TASK MANAGEMENT · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["ClickUp tasks", "that close themselves."],
    subhead:
      "A sign-off in Superflow moves the linked ClickUp task to done. Statuses stay matched both ways, mapped to your spaces and lists. Set the mapping once.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-close", label: "Self-closing task", icon: "check" },
      { _key: "ht-statuses", label: "Steps as statuses", icon: "layout-kanban" },
      { _key: "ht-twoway", label: "Two-way sync", icon: "share" },
      { _key: "ht-replies", label: "Synced replies", icon: "message" },
    ],
  },
  featureSet: {
    headerTitle: "Link once. The status follows.",
    journeyStart: "A client approves",
    journeyEnd: "ClickUp marks it done",
    blocks: [
      {
        _key: "block-flows",
        title: "The two-way table",
        description:
          "Superflow writes review state. ClickUp owns its own task fields. Neither overwrites the other's, and nothing echoes in a loop.",
        icon: "refresh",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "flows-out",
            label: "Superflow → ClickUp",
            icon: "send",
            oneLiner:
              "A client sign-off moves the linked task to your mapped done-status. A reply on the review thread posts to the linked task's comments. A review's step change moves the task to the mapped status. A comment can create a linked task, if you turn that on.",
          },
          {
            _key: "flows-in",
            label: "ClickUp → Superflow",
            icon: "refresh",
            oneLiner:
              "A status change in ClickUp reflects back onto the linked review. A comment on the linked task posts back to the review thread.",
          },
        ],
      },
      {
        _key: "block-unlocks",
        title: "What the ClickUp sync unlocks",
        description:
          "Five things the sync does so nobody reconciles two tools by hand.",
        icon: "sparkles",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "unlock-close",
            label: "The self-closing task",
            icon: "circle-check",
            oneLiner:
              "The client approves. The linked task moves to your done-status on its own. Without it, the task says open after the client said done.",
          },
          {
            _key: "unlock-statuses",
            label: "Steps as statuses",
            icon: "layout-kanban",
            oneLiner:
              "The review's current step shows as the task's status, matched to your names. Without it, you reconcile two tools by hand.",
          },
          {
            _key: "unlock-comments",
            label: "Comments as tasks, when you choose",
            icon: "list-check",
            oneLiner:
              "A review comment can create a linked task with a back-link. Without it, action items get re-typed into ClickUp.",
          },
          {
            _key: "unlock-twoway",
            label: "Two-way, no overwrites",
            icon: "refresh",
            oneLiner:
              "Status changes reflect back, and each tool writes only its own fields. Without it, sync means overwrite.",
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
        title: "How the ClickUp sync behaves",
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
              "Mapping is explicit. Superflow never guesses a destination status.",
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
              "Client and guest activity never touches your ClickUp unless you map it.",
          },
          {
            _key: "behave-queue",
            label: "Queues on outage",
            icon: "history",
            oneLiner:
              "If ClickUp is down, reviews keep working. Updates queue and retry.",
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
          "ClickUp is one connector in the catalog. Kanban covers our board. This page keeps yours honest.",
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
            href: "/preview/integrations/asana",
            listOnly: true,
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
            _key: "related-board",
            label: "The built-in board",
            icon: "layout-dashboard",
            oneLiner: "Kanban covers our board. This page keeps yours honest.",
            href: "/kanban-board",
            listOnly: true,
          },
          {
            _key: "related-guide",
            label: "ClickUp setup guide",
            icon: "link",
            oneLiner:
              "Read how to integrate Superflow with ClickUp in the docs.",
            href: "https://docs.usesuperflow.com/Integrations/how-to-integrate-with-clickup",
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
    heading: "Link once. The status follows.",
    steps: [
      {
        _key: "gs-connect",
        accent: ACCENT_BLUE,
        title: "Connect",
        description: "Authorize ClickUp from settings.",
      },
      {
        _key: "gs-map",
        accent: ACCENT_GREEN,
        title: "Map",
        description:
          "Match your ClickUp statuses to Superflow's. Your names, not ours.",
      },
      {
        _key: "gs-work",
        accent: ACCENT_ORANGE,
        title: "Work",
        description: "Reviews run. The task updates itself, both ways.",
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
          "Both. Sign-offs and steps flow to ClickUp. Status changes flow back. Each side owns its own fields.",
      },
      {
        _key: "faq-wrong-task",
        question: "Can it close the wrong task?",
        answer:
          "No. You map the link and the done-status yourself. Nothing is inferred. The mapping is the contract.",
      },
      {
        _key: "faq-client-see",
        question: "Do my clients see ClickUp?",
        answer: "No. Clients see the review link. The tasks are yours.",
      },
      {
        _key: "faq-statuses",
        question: "We name our statuses differently.",
        answer:
          "That's the point of the mapping: your statuses, matched to ours, once.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "ClickUp Integration for Client Review Sync | Superflow",
  metaDescription:
    "Two-way sync between Superflow reviews and ClickUp. A client sign-off moves the linked task to done, mapped to your spaces and lists.",
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
