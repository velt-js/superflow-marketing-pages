#!/usr/bin/env node
/**
 * Seed the "Figma" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /preview/integrations/figma. Reuses the 2026 homepage sections as a
 * fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integration-figma-v1-1.md;
 * [bracketed] and *italic* notes (incl. the SHIPPED-hold build note) are
 * dropped, and the shared trust strip is not seeded (hard-coded chrome).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-figma.mjs
 *   DRY_RUN=1 node scripts/seed-integration-figma.mjs
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
  _id: "integrationPreviewPage-figma",
  _type: "integrationPreviewPage",
  title: "Figma",
  slug: { _type: "slug", current: "figma" },
  family: "Design and files",
  cardBlurb: "Send frames for review. Comments come back on the node.",
  hero: {
    kicker: "· SOURCE · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Send Figma frames", "for review."],
    subhead:
      "Select frames in Figma and send them for client review. Comments come back onto the exact node, with a link to the thread. Nothing exported by hand.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-send", label: "Select & send", icon: "share" },
      { _key: "ht-node", label: "Back on the node", icon: "pin" },
      { _key: "ht-versions", label: "Versions", icon: "history" },
    ],
  },
  featureSet: {
    headerTitle: "Select. Send. The comments return.",
    journeyStart: "Select frames",
    journeyEnd: "Comments on the node",
    blocks: [
      {
        _key: "block-flows",
        title: "In and back",
        description:
          'Figma has no native "resolved" state, so resolution is annotated in the comment rather than round-tripped. We don\'t pretend to a fidelity Figma\'s API can\'t give.',
        icon: "refresh",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "flows-in",
            label: "Figma → Superflow",
            icon: "share",
            oneLiner:
              "Selected frames, prototypes, or a page register as review assets in the folder you choose. Re-sending an updated frame creates a new version, not a duplicate. Review history and Memory stay continuous.",
          },
          {
            _key: "flows-back",
            label: "Superflow → Figma",
            icon: "refresh",
            oneLiner:
              "A client comment posts back as a native Figma comment on the matching node, with a deep link to the Superflow thread.",
          },
        ],
      },
      {
        _key: "block-unlocks",
        title: "What the Figma connector unlocks",
        description:
          "Three things the connector does so the design never leaves its file to get feedback.",
        icon: "sparkles",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "unlock-assets",
            label: "Frames as review assets",
            icon: "palette",
            oneLiner:
              "Select and send from inside Figma. No exports, no uploads. Without it, the design leaves its file to get feedback.",
          },
          {
            _key: "unlock-node",
            label: "Comments back on the node",
            icon: "pin",
            oneLiner:
              "The client's note lands on the frame it's about, linked to the thread. Without it, feedback lives in a second tool.",
          },
          {
            _key: "unlock-versions",
            label: "Versions, not duplicates",
            icon: "history",
            oneLiner:
              "Re-send an updated frame and the history stays whole. Memory keeps learning. Without it, v2 starts the conversation over.",
          },
        ],
      },
      {
        _key: "block-behaves",
        title: "How the Figma connector behaves",
        description:
          "The guarantees behind the connector, so the history always holds.",
        icon: "settings",
        accent: ACCENT_ORANGE,
        mock: "workflow",
        tabs: [
          {
            _key: "behave-version",
            label: "Versioned re-sends",
            icon: "history",
            oneLiner:
              "Re-sending a frame versions the asset. History stays whole.",
          },
          {
            _key: "behave-deeplink",
            label: "Deep-links back",
            icon: "link",
            oneLiner:
              'The asset remembers its source node. "Open in Figma" deep-links back.',
          },
          {
            _key: "behave-isolation",
            label: "Client isolation",
            icon: "user-check",
            oneLiner:
              "Client and guest comments follow the same isolation rules as everywhere else.",
          },
          {
            _key: "behave-queue",
            label: "Queues on outage",
            icon: "refresh",
            oneLiner:
              "If Figma is unreachable, reviews keep working. Write-backs queue and retry.",
          },
          {
            _key: "behave-access",
            label: "Minimal access",
            icon: "lock",
            oneLiner: "Requests file and comment access only.",
          },
          {
            _key: "behave-community",
            label: "Figma Community",
            icon: "world",
            oneLiner: "Published in the Figma Community.",
          },
        ],
      },
      {
        _key: "block-related",
        title: "Part of the integrations catalog",
        description:
          "Figma is one connector in the catalog. Explore the shipped neighbors.",
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
            _key: "related-slack",
            label: "Slack",
            icon: "message-circle",
            oneLiner: "A client comments, your channel knows. Act from the message.",
            href: "/preview/integrations/slack",
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
    heading: "Select. Send. The comments return.",
    steps: [
      {
        _key: "gs-select",
        accent: ACCENT_BLUE,
        title: "Select",
        description: "Open the Superflow plugin in Figma and pick the frames.",
      },
      {
        _key: "gs-send",
        accent: ACCENT_GREEN,
        title: "Send",
        description: "They land in the right client folder. The magic link goes out.",
      },
      {
        _key: "gs-review",
        accent: ACCENT_ORANGE,
        title: "Review",
        description:
          "Client comments come back onto the node, linked to the thread.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-need-figma",
        question: "Does my client need Figma?",
        answer:
          "No. They review from the magic link: no account, no login, no app, from their phone.",
      },
      {
        _key: "faq-comes-back",
        question: "What comes back into Figma?",
        answer:
          "The client's comments, on the node they were about, with a link to the full thread.",
      },
      {
        _key: "faq-update-frame",
        question: "What happens when I update a frame?",
        answer:
          "Send it again. Superflow versions the asset. Nothing duplicates, the history holds.",
      },
      {
        _key: "faq-agents",
        question: "Do agents review Figma frames?",
        answer:
          "Yes. The same checks that run on your sites run on the frames, minus the live-page checks.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "Figma Integration: Send Frames for Review | Superflow",
  metaDescription:
    "Send Figma frames for client review without exporting. Comments come back onto the exact node, versions stay whole.",
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
