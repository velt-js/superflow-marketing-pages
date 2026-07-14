#!/usr/bin/env node
/**
 * Seed the "REST API and Webhooks" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /preview/integrations/api. Reuses the 2026 homepage sections as a
 * fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/superflow-page-integration-api-v1-1.md;
 * [bracketed] and *italic* notes are dropped (incl. the unshipped Zapier
 * bullet), and the shared trust strip is not seeded (hard-coded chrome).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-api.mjs
 *   DRY_RUN=1 node scripts/seed-integration-api.mjs
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
  _id: "integrationPreviewPage-api",
  _type: "integrationPreviewPage",
  title: "REST API and Webhooks",
  slug: { _type: "slug", current: "api" },
  family: "Build your own",
  cardBlurb: "Every review event, pushed anywhere. Read and write reviews from your own stack.",
  hero: {
    kicker: "· BUILD YOUR OWN · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Every review event,", "pushed anywhere."],
    subhead:
      "Webhooks push every review event to any endpoint you name. The REST API reads and writes back in. Build the pipeline we didn't.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-webhooks", label: "Webhooks out", icon: "share" },
      { _key: "ht-rest", label: "REST API in", icon: "code-asterisk" },
      { _key: "ht-replay", label: "Replayable", icon: "history" },
    ],
  },
  featureSet: {
    headerTitle: "Key. Endpoint. Catalog. Go.",
    journeyStart: "An event fires",
    journeyEnd: "Your endpoint gets it",
    blocks: [
      {
        _key: "block-surface",
        title: "The surface",
        description:
          "This section mirrors the docs. Anything not in the docs doesn't render here.",
        icon: "code-asterisk",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "surface-webhooks",
            label: "Webhooks (out)",
            icon: "share",
            oneLiner:
              "The event catalog: asset.created, comment.posted, review.resolved, signoff.completed, workflow.step_changed, integration.installed. HMAC-signed, retried with backoff, replayable from the log.",
          },
          {
            _key: "surface-rest",
            label: "REST API (in)",
            icon: "terminal",
            oneLiner:
              "Read and write workspaces, folders, assets, comments, and reviews with scoped keys: read-only, write, admin. Rotation and per-key rate limits.",
          },
        ],
      },
      {
        _key: "block-unlocks",
        title: "What the platform unlocks",
        description:
          "Three things the platform gives you so you never poll and hope.",
        icon: "sparkles",
        accent: ACCENT_GREEN,
        mock: "workflow",
        tabs: [
          {
            _key: "unlock-catalog",
            label: "The event catalog",
            icon: "list-check",
            oneLiner:
              "Everything that happens in a review, subscribable: from asset created to sign-off completed. Without it, you poll and hope.",
          },
          {
            _key: "unlock-write",
            label: "The write path",
            icon: "code-asterisk",
            oneLiner:
              "Create and update reviews from your own stack through REST. Without it, your pipeline can see Superflow but never steer it.",
          },
          {
            _key: "unlock-replay",
            label: "Replayable deliveries",
            icon: "refresh",
            oneLiner:
              "Signed, retried with backoff, replayed from the log. Without it, a dropped webhook is a mystery to debug.",
          },
        ],
      },
      {
        _key: "block-behaves",
        title: "How the platform behaves",
        description:
          "The guarantees behind the platform, so a dead endpoint never blocks a review.",
        icon: "settings",
        accent: ACCENT_ORANGE,
        mock: "workflow",
        tabs: [
          {
            _key: "behave-signed",
            label: "HMAC-signed",
            icon: "lock",
            oneLiner: "Deliveries are HMAC-signed. Verify before you trust.",
          },
          {
            _key: "behave-retry",
            label: "Retry & replay",
            icon: "refresh",
            oneLiner:
              "Failures retry with backoff. Anything can be replayed from the log.",
          },
          {
            _key: "behave-keys",
            label: "Scoped keys",
            icon: "lock-open",
            oneLiner: "Keys are scoped and rotatable. Revocation is immediate.",
          },
          {
            _key: "behave-never-blocks",
            label: "Never blocks a review",
            icon: "circle-check",
            oneLiner: "A dead endpoint never blocks a review or a sign-off.",
          },
          {
            _key: "behave-log",
            label: "Log in settings",
            icon: "history",
            oneLiner:
              "The webhook log lives in settings, next to connector health.",
          },
        ],
      },
      {
        _key: "block-related",
        title: "Part of the integrations catalog",
        description:
          "The developer platform is one path in the catalog. GitHub and Vercel triggers live in review workflows.",
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
            _key: "related-triggers",
            label: "Review workflow triggers",
            icon: "route",
            oneLiner: "GitHub and Vercel triggers can start a fresh review.",
            href: "/review-workflows",
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
    heading: "Key. Endpoint. Catalog. Go.",
    steps: [
      {
        _key: "gs-key",
        accent: ACCENT_BLUE,
        title: "Key",
        description: "Create a scoped API key in settings.",
      },
      {
        _key: "gs-endpoint",
        accent: ACCENT_GREEN,
        title: "Endpoint",
        description: "Register your webhook URL. We sign every delivery.",
      },
      {
        _key: "gs-build",
        accent: ACCENT_ORANGE,
        title: "Build",
        description:
          "Consume the catalog, write back through REST. Docs cover the rest.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-events",
        question: "Which events can I subscribe to?",
        answer:
          "The published catalog, from asset created to sign-off completed. The docs list every event and payload.",
      },
      {
        _key: "faq-trigger",
        question: "Can I trigger a review from my pipeline?",
        answer:
          "Yes. GitHub and Vercel triggers are built in (/review-workflows); the REST API covers everything else.",
      },
      {
        _key: "faq-verify",
        question: "How do I verify a delivery is from Superflow?",
        answer:
          "Every delivery is HMAC-signed with your endpoint's secret. Verify the signature. Reject the rest.",
      },
      {
        _key: "faq-limits",
        question: "What are the rate limits?",
        answer: "Scoped per key. The docs publish the numbers.",
      },
      {
        _key: "faq-cost",
        question: "What does API access cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "REST API and Webhooks | Superflow Developer Platform",
  metaDescription:
    "Every review event, pushed anywhere. HMAC-signed webhooks and a scoped REST API to read and write reviews from your own stack.",
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
