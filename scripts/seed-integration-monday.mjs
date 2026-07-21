#!/usr/bin/env node
/**
 * Seed the "Monday" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /preview/integrations/monday. Reuses the 2026 homepage sections as a
 * fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integration-monday-v1-1.md
 * (vocabulary: items, boards, groups, columns — never "tasks"); [bracketed] and
 * *italic* notes are dropped, and the shared trust strip is not seeded.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-monday.mjs
 *   DRY_RUN=1 node scripts/seed-integration-monday.mjs
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
  _id: "integrationPreviewPage-monday",
  _type: "integrationPreviewPage",
  title: "Monday",
  slug: { _type: "slug", current: "monday" },
  family: "Project boards",
  cardBlurb: "Same two-way sync, mapped to your columns.",
  hero: {
    kicker: "TASK MANAGEMENT · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Monday items", "that close themselves."],
    subhead:
      "A sign-off in Superflow moves the linked Monday item to done. Statuses stay matched both ways, mapped to your groups and columns. Set the mapping once.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-close", label: "Self-closing item", icon: "check" },
      { _key: "ht-columns", label: "Steps as columns", icon: "layout-kanban" },
      { _key: "ht-twoway", label: "Two-way sync", icon: "share" },
      { _key: "ht-replies", label: "Synced replies", icon: "message" },
    ],
  },
  featureSet: {
    headerTitle: "Link once. The board follows.",
    journeyStart: "A client approves",
    journeyEnd: "Monday marks it done",
    blocks: [
      {
        _key: "block-flows",
        title: "The two-way table",
        description:
          "Superflow writes review state. Monday owns its own item fields. Neither overwrites the other's, and nothing echoes in a loop.",
        icon: "refresh",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "flows-out",
            label: "Superflow → Monday",
            icon: "send",
            oneLiner:
              "A client sign-off moves the linked item to your mapped done-state. A reply on the review thread posts to the linked item's updates. A review's step change moves the item to the mapped column. A comment can create a linked item, if you turn that on.",
          },
          {
            _key: "flows-in",
            label: "Monday → Superflow",
            icon: "refresh",
            oneLiner:
              "A status change on the board reflects back onto the linked review. An update on the linked item posts back to the review thread.",
          },
        ],
      },
      {
        _key: "block-unlocks",
        title: "What the Monday sync unlocks",
        description:
          "Five things the sync does so nobody reconciles two boards by hand.",
        icon: "sparkles",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "unlock-close",
            label: "The self-closing item",
            icon: "circle-check",
            oneLiner:
              "The client approves. The linked item moves to your done-state on its own. Without it, the board says open after the client said done.",
          },
          {
            _key: "unlock-columns",
            label: "Steps as columns",
            icon: "layout-kanban",
            oneLiner:
              "The review's current step shows as the item's column, matched to your names. Without it, you reconcile two boards by hand.",
          },
          {
            _key: "unlock-comments",
            label: "Comments as items, when you choose",
            icon: "list-check",
            oneLiner:
              "A review comment can create a linked item with a back-link. Without it, action items get re-typed into the board.",
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
              "Answer on the item or on the review. The thread stays one conversation, in both places. Without it, the discussion forks.",
          },
        ],
      },
      {
        _key: "block-behaves",
        title: "How the Monday sync behaves",
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
            oneLiner: "Link a review to one item or several.",
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
              "If Monday is down, reviews keep working. Updates queue and retry.",
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
          "Monday is one connector in the catalog. Kanban covers our board. This page keeps yours honest.",
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
        description: "Authorize Monday from settings.",
      },
      {
        _key: "gs-map",
        accent: ACCENT_GREEN,
        title: "Map",
        description:
          "Match your Monday columns to Superflow statuses. Your names, not ours.",
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
          "Both. Sign-offs and steps flow to Monday. Board status flows back. Each side owns its own fields.",
      },
      {
        _key: "faq-wrong-item",
        question: "Can it close the wrong item?",
        answer:
          "No. You map the link and the done-state yourself. Nothing is inferred. The mapping is the contract.",
      },
      {
        _key: "faq-client-see",
        question: "Do my clients see Monday?",
        answer: "No. Clients see the review link. The board is yours.",
      },
      {
        _key: "faq-columns",
        question: "We name our columns differently.",
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
  metaTitle: "Monday.com Integration for Client Review Sync | Superflow",
  metaDescription:
    "Two-way sync between Superflow reviews and Monday. A client sign-off moves the linked item to done, mapped to your groups and columns.",
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
