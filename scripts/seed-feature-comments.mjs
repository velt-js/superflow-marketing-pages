#!/usr/bin/env node
/**
 * Seed the "Comments" `featurePage` document in Sanity.
 *
 * Serves at /preview/features/comments. Like every feature page it reuses the
 * 2026 homepage sections (components/home-2026/*) as a fixed template — only
 * the hero copy, the "solution" intro, the FeatureSet blocks, the FAQ and SEO
 * vary per page, so this seed is pure text/config with NO asset uploads.
 *
 * Copy is taken (where present) from the "Superflow Marketing — 2026" Figma
 * Comments feature-page frame (node 678:3023). The Figma reused placeholder
 * body copy on the first two FeatureSet blocks ("Reviews that remember brand
 * rules…"); those are replaced here with copy that fits each block's title.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-comments.mjs
 *   DRY_RUN=1 node scripts/seed-feature-comments.mjs
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

const doc = {
  _id: "featurePage-comments",
  _type: "featurePage",
  title: "Comments",
  slug: { _type: "slug", current: "comments" },
  hero: {
    headlineLines: ["Comment on your", "website or assets"],
    subhead:
      "Click an element and comment, or select the exact words. Threads, replies, mentions, attachments, recordings. Reactions and read receipts. Assign it and track it to done.",
    showcase: "comments",
  },
  solution: {
    heading: "No more scattered feedback on 5 different apps",
    subheading: "Leave feedback where your website or asset lives.",
    variant: "comments",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Feedback",
    journeyEnd: "Resolution",
    blocks: [
      {
        _key: "block-comment",
        title: "Comment that sticks to elements",
        description:
          "Click an element or select the exact words. Your comment pins to that spot and stays anchored — even after the page changes.",
        icon: "message-pin",
        accent: "#a21caf",
        mock: "text-comments",
        tabs: [
          {
            _key: "text-comments",
            label: "Text Comments",
            icon: "pin",
            oneLiner:
              "Highlight the exact words and comment on the copy itself.",
            mock: "text-comments",
          },
          {
            _key: "robust-anchors",
            label: "Robust Anchor",
            icon: "link",
            oneLiner:
              "Comments stay anchored to the element even after the page changes.",
            mock: "robust-anchor",
          },
          {
            _key: "element-pinning",
            label: "Element Pinning",
            icon: "pin",
            oneLiner:
              "Click any element and pin a comment exactly where it belongs.",
            mock: "pinned-comments",
          },
        ],
      },
      {
        _key: "block-conversations",
        title: "Rich Conversations with all media types",
        description:
          "Threads, replies, mentions, attachments, and recorded walkthroughs — every conversation stays in one place, in full context.",
        icon: "message-circle",
        accent: "#433df3",
        mock: "thread-comments",
        tabs: [
          {
            _key: "threads-replies",
            label: "Thread Comments",
            icon: "message-circle",
            oneLiner:
              "Full threads with replies keep every decision in one place.",
            mock: "thread-comments",
          },
          {
            _key: "mentions",
            label: "Mentions",
            icon: "user-check",
            oneLiner:
              "@mention a teammate or the client to pull them into the thread.",
            mock: "comment-mentions",
          },
          {
            _key: "attachments",
            label: "Attachment",
            icon: "share",
            oneLiner:
              "Drop images, PDFs, and files right into the conversation.",
            mock: "comment-attachment",
            collapsesFirstTab: true,
          },
          {
            _key: "record-walkthrough",
            label: "Record Walkthrough",
            icon: "video",
            oneLiner:
              "Screen-record nuanced feedback right where you review.",
            collapsesFirstTab: true,
          },
        ],
      },
      {
        _key: "block-seen-settled",
        title: "Seen & Settled",
        description:
          "Guests review from a link. Your team reviews behind login. Everyone gets desktop + mobile + private notes + in-tool recordings.",
        icon: "checks",
        accent: "#109534",
        mock: "reaction-read-receipt",
        tabs: [
          {
            _key: "reactions-receipts",
            label: "Reaction & Read Receipt",
            icon: "checks",
            oneLiner:
              "React with an emoji and see exactly who has read each comment.",
            mock: "reaction-read-receipt",
          },
          {
            _key: "statuses-assignment",
            label: "Tracking & Task Management",
            icon: "list-check",
            oneLiner: "Assign every finding an owner and track it to done.",
            mock: "tracking-task-management",
            collapsesFirstTab: true,
          },
        ],
      },
      {
        _key: "block-single-system",
        title: "Single System",
        description:
          "With statuses, workflows, kanban, and deep integrations the reviews actually move forward instead of getting lost in email and Loom.",
        icon: "layout-dashboard",
        accent: "#e0820a",
        mock: "private-comments",
        tabs: [
          {
            _key: "private-scopes",
            label: "Private scopes",
            icon: "lock",
            oneLiner:
              "Keep internal notes private and share only what the client should see.",
          },
          {
            _key: "snapshot",
            label: "Snapshot on every comment",
            icon: "camera",
            oneLiner:
              "Every comment saves a snapshot, so the proof survives redeploys.",
            mock: "auto-screenshot",
            collapsesFirstTab: true,
          },
          {
            _key: "agent-comments",
            label: "Agent comments",
            icon: "robot",
            oneLiner:
              "AI agents post their findings as comments right alongside your team.",
            mock: "review-agents",
            collapsesFirstTab: true,
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Comments in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      {
        _key: "gs-snippet",
        accent: "#d43f8d",
        title: "Add the snippet in 30 seconds",
        description:
          "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
      },
      {
        _key: "gs-click-select",
        accent: "#433df3",
        title: "Click an element or select the words",
        description:
          "And comment. Agents post their findings the same way. Invite your team and client, no account needed.",
      },
      {
        _key: "gs-assign-track",
        accent: "#109534",
        title: "Assign what matters, track it to resolved",
        description: "Your client approves from their link.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-replace",
        question: "Does the AI replace my reviewers?",
        answer:
          "No. AI does the first pass and catches the obvious stuff. Your team and your client still review the work and sign off. The call always stays human.",
      },
      {
        _key: "faq-check",
        question: "What can the agents check?",
        answer:
          "Broken links, spelling and grammar, SEO basics, accessibility and performance — plus any custom rule you add from your own QA checklist.",
      },
      {
        _key: "faq-checklist",
        question: "Can I build agents from my own QA checklist?",
        answer:
          "Yes. Paste your checklist in and Superflow turns it into agents that check for it on every page. No engineer needed.",
      },
      {
        _key: "faq-accounts",
        question: "Do my clients need an account?",
        answer:
          "No. They open a link, click the spot, and type. No signup, no app, no training.",
      },
      {
        _key: "faq-live-site",
        question: "Can it really review a live website?",
        answer:
          "Yes. Agents check a live or staging site directly and pin findings to the exact element. Notes stay anchored through redeploys.",
      },
      {
        _key: "faq-data",
        question: "Where does my data live, and is it used to train models?",
        answer:
          "Your data stays yours — we never train models on your content, and offer data-residency options. Enterprise adds SOC 2 Type II, HIPAA with a BAA, and a full audit trail.",
      },
      {
        _key: "faq-formats",
        question: "Can I review emails, PDFs, and ads, not just websites?",
        answer:
          "Yes. Superflow reviews websites, emails, PDFs, images, videos, and ads — anywhere your team ships client work.",
      },
    ],
  },
  metaTitle: "Comments — Superflow",
  metaDescription:
    "Leave feedback right where your website or assets live. Pin comments to any element, hold rich threaded conversations, and track every review to done — your team and your clients, in one place.",
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
