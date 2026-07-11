#!/usr/bin/env node
/**
 * Seed the sample `featurePage` document (Review Agents) in Sanity.
 *
 * The /preview/features/<slug> template reuses the 2026 homepage sections
 * (components/home-2026/*), whose product mocks are hard-coded React — so a
 * feature page is pure text/config and this seed needs NO asset uploads.
 * Copy is taken (where present) from the "Superflow Marketing — 2026" Figma
 * feature-page frame (node 673:1145).
 *
 * Feature pages have NO Problem/clock section, so the "solution" heading keeps
 * the word "manual" ("Turn your manual QA processes into Agents").
 *
 * Also removes the earlier throwaway `featurePage-website-qa` doc. (The
 * `comments` page is a real page of its own — see seed-feature-comments.mjs —
 * so it is intentionally NOT removed here.)
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-review-agents.mjs
 *   DRY_RUN=1 node scripts/seed-feature-review-agents.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

/** Document ids of superseded throwaway samples to clean up (no-op if gone). */
const LEGACY_DOC_IDS = ["featurePage-website-qa"];

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
  _id: "featurePage-review-agents",
  _type: "featurePage",
  title: "Review Agents",
  slug: { _type: "slug", current: "review-agents" },
  hero: {
    headlineLines: ["Paste a QA checklist.", "Get AI agents."],
    subhead:
      "Superflow builds agents from the checklist you already run. They check every page the moment it changes, on phone and desktop. Findings land as comments. You decide what ships.",
    showcase: "review-agents",
  },
  solution: {
    heading: "Turn your manual QA processes into Agents",
    subheading:
      "Build your digital twin and let them work while you review them.",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "First Draft",
    journeyEnd: "Final Review",
    blocks: [
      {
        _key: "block-agents",
        title: "Build team of QA Agents",
        description:
          "Reviews that remember brand rules, past decisions, and get smarter with every project.",
        icon: "brain",
        accent: "#433df3",
        mock: "review-agents",
        tabs: [
          {
            _key: "custom-agent",
            label: "Custom Agent",
            icon: "ballpen",
            oneLiner:
              "Create custom rules from your checklist or brand guide.",
            mock: "custom-agent",
          },
          {
            _key: "built-in-agents",
            label: "Built-in Agents",
            icon: "lego",
            oneLiner:
              "Ready-made agents for broken links, spelling, SEO and accessibility.",
            mock: "built-in-checks",
          },
          {
            _key: "test-cases",
            label: "Test Cases",
            icon: "list-check",
            oneLiner:
              "Turn every requirement into a repeatable test the agents run each release.",
            mock: "custom-agent-test",
          },
        ],
      },
      {
        _key: "block-run",
        title: "Run it Manually or with Webhooks",
        description:
          "Trigger a full review on demand, or fire one automatically on every deploy — across every device.",
        icon: "bolt",
        accent: "#109534",
        mock: "workflow",
        tabs: [
          {
            _key: "manual-run",
            label: "Manual Run",
            icon: "player-play",
            oneLiner: "Kick off a review on any URL whenever you want.",
            mock: "run-on-demand",
          },
          {
            _key: "webhooks",
            label: "Webhooks",
            icon: "bolt",
            oneLiner:
              "Fire a review automatically on every publish or deploy.",
            mock: "webhooks",
          },
          {
            _key: "simulate-devices",
            label: "Simulate All Devices",
            icon: "devices",
            oneLiner:
              "Check every page across desktop, tablet and phone in one run.",
            mock: "all-devices",
          },
          {
            _key: "integrations",
            label: "Integrations",
            icon: "plug",
            oneLiner:
              "One-click installs for WordPress, Webflow, Framer and Shopify.",
            mock: "integrations",
          },
        ],
      },
      {
        _key: "block-decide",
        title: "Decide on Agent findings & Validate Fixes",
        description:
          "Guests review from a link. Your team reviews behind login. Everyone gets desktop + mobile + private notes + in-tool recordings.",
        icon: "checks",
        accent: "#da53b9",
        mock: "pinned-comments",
        tabs: [
          {
            _key: "findings",
            label: "Findings",
            icon: "message-pin",
            oneLiner:
              "Every issue lands as a pinned comment on the exact element.",
            mock: "agent-finding",
          },
          {
            _key: "validate-fixes",
            label: "Validate Fixes",
            icon: "circle-check",
            oneLiner: "Re-run an agent to confirm a fix actually shipped.",
            mock: "validate-fixes",
            collapsesFirstTab: true,
          },
          {
            _key: "guest-review",
            label: "Guest Review",
            icon: "user-check",
            oneLiner:
              "Clients approve from a link — no account, from their phone.",
            mock: "guest-mode",
            collapsesFirstTab: true,
          },
          {
            _key: "record-walkthrough",
            label: "Record Walkthrough",
            icon: "video",
            oneLiner:
              "Screen-record nuanced feedback right where you review.",
            mock: "record-walkthrough",
            collapsesFirstTab: true,
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Agents in a minute",
    subheading: "Four steps, no engineer required.",
    steps: [
      {
        _key: "gs-snippet",
        accent: "#d43f8d",
        title: "Add the snippet in 30 seconds",
        description:
          "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
      },
      {
        _key: "gs-checklist",
        accent: "#433df3",
        title: "Paste your checklist, upload brand guides",
        description: "Superflow assembles your named agents.",
      },
      {
        _key: "gs-agents-check",
        accent: "#109534",
        title: "Agents check it the moment it lands",
        description:
          "They post findings as comments. Invite your team and your client to see them, no account needed.",
      },
      {
        _key: "gs-team-fixes",
        accent: "#e0820a",
        title: "Your team fixes what matters",
        description:
          "Your client approves from the link. Superflow remembers for next time.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-memory",
        title: "Memory",
        description:
          "The agents get sharper because Memory feeds them each client's brand and past decisions.",
        href: "/preview/features/memory",
        icon: "brain",
      },
      {
        _key: "rc-client-review",
        title: "Client review",
        description:
          "Where the human half lives — the no-account link a client signs off with.",
        href: "/preview/features/client-review",
        icon: "circle-check",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-checklist",
        question: "Can I build agents from my own QA checklist?",
        answer:
          "Yes. Paste your checklist in and Superflow turns it into agents that check for it on every page. No engineer needed.",
      },
      {
        _key: "faq-comments",
        question: "How do findings show up?",
        answer:
          "Every finding lands as a comment pinned to the exact element on the live site, with a screenshot of what the agent saw. The page changes; the proof stays.",
      },
      {
        _key: "faq-live-site",
        question: "Can it really review a live website?",
        answer:
          "Yes. Agents check a live or staging site directly and pin findings to the exact element. Notes stay anchored through redeploys.",
      },
      {
        _key: "faq-accounts",
        question: "Do my clients need an account?",
        answer:
          "No. They open a link, click the spot, and type. No signup, no app, no training.",
      },
      {
        _key: "faq-replace",
        question: "Does the AI replace my reviewers?",
        answer:
          "No. AI does the first pass and catches the obvious stuff. Your team and your client still review the work and sign off. The call always stays human.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer:
          "Plans run from a free start for solo studios to Enterprise with SSO and SCIM for larger teams. Start free, no credit card.",
      },
    ],
  },
  metaTitle: "Review Agents — Superflow",
  metaDescription:
    "Superflow's AI review agents check every page on every change and leave findings as comments pinned to the exact element. Your team approves, then your client.",
};

async function main() {
  if (DRY_RUN) {
    console.log(JSON.stringify(doc, null, 2));
    return;
  }
  // Remove superseded samples (no-op if they're already gone).
  for (const legacyId of LEGACY_DOC_IDS) {
    await client.delete(legacyId).catch((err) => {
      if (err?.statusCode !== 404) {
        throw err;
      }
    });
  }
  const res = await client.createOrReplace(doc);
  console.log("Seeded:", res._id);
  console.log("Removed legacy docs:", LEGACY_DOC_IDS.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
