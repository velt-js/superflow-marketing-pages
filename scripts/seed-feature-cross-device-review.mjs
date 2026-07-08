#!/usr/bin/env node
/**
 * Seed the "Cross-Device Review" `featurePage` document in Sanity.
 *
 * Serves at /preview/features/cross-device-review. Like every feature page it
 * reuses the 2026 homepage sections (components/home-2026/*) as a fixed
 * template — only the hero copy, the hero tab strip, the "solution" intro, the
 * FeatureSet blocks, the FAQ and SEO vary per page, so this seed is pure
 * text/config with NO asset uploads.
 *
 * Copy is authored from the per-page spec in
 * ~/Downloads/superflow-website-5/features/features-cross-device-review/cross-device-review.md.
 * Production tags ([VERIFY], [ASSET], [FLAG]) are stripped; no metrics, KPIs, or
 * testimonials the spec marks unavailable are invented (the "over half of
 * reviews happen on a phone" stat stays out until its source is confirmed).
 *
 * This script only ever `createOrReplace`s the one document below; it never
 * deletes any other document.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-cross-device-review.mjs
 *   DRY_RUN=1 node scripts/seed-feature-cross-device-review.mjs
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
  _id: "featurePage-cross-device-review",
  _type: "featurePage",
  title: "Cross-Device Review",
  slug: { _type: "slug", current: "cross-device-review" },
  hero: {
    headlineLines: ["Review on desktop", "and mobile."],
    subhead:
      "The toolbar works on real phones and tablets. Findings land tagged by device. Agents check both views. Your client reviews from their phone.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-real-device", label: "The real device", icon: "devices" },
      { _key: "ht-tagged", label: "Tagged findings", icon: "list-check" },
      { _key: "ht-client-phone", label: "The client's phone", icon: "user-check" },
    ],
  },
  solution: {
    heading: "Both views, one review",
    subheading:
      "Cross-device review is one toolbar on desktop, phone, and tablet — comments land in one place, tagged by the view they came from.",
    variant: "checklist",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Reviewed at a Desk",
    journeyEnd: "Both Views Signed Off",
    blocks: [
      {
        _key: "block-where",
        title: "Where you review",
        description:
          "Open the site on a real phone or tablet, or emulate any screen in your browser — on production or on the staging link before it goes live.",
        icon: "devices",
        accent: "#433df3",
        mock: "workflow",
        tabs: [
          {
            _key: "real-device",
            label: "Real-device review",
            icon: "devices",
            oneLiner:
              "Open the site on an actual phone or tablet. The toolbar comes with it, so comments pin right on the spot.",
          },
          {
            _key: "browser-device-mode",
            label: "Browser device mode",
            icon: "layout-dashboard",
            oneLiner:
              "No phone handy? Emulate any screen in the browser you already use. Findings still land tagged.",
          },
          {
            _key: "live-and-staging",
            label: "Live sites and staging",
            icon: "code-asterisk",
            oneLiner:
              "Review both views on production, or on the staging link before it goes live.",
          },
        ],
      },
      {
        _key: "block-comes-back",
        title: "What comes back",
        description:
          "Every comment records the view it was left on, and agents check both views the moment the site changes — same checklist, no extra setup.",
        icon: "list-check",
        accent: "#109534",
        mock: "agent-gallery",
        tabs: [
          {
            _key: "device-tagged",
            label: "Device-tagged findings",
            icon: "list-check",
            oneLiner:
              "Every comment records the view it was left on. Filter the sidebar to just mobile before launch.",
          },
          {
            _key: "agents-both-views",
            label: "Agents on both views",
            icon: "robot",
            oneLiner:
              "Cramped tap targets and clipped headlines get flagged on mobile even when desktop passes. Same checklist, no extra setup.",
          },
        ],
      },
      {
        _key: "block-client-side",
        title: "The client's side",
        description:
          "The review link opens the mobile view natively, so your client comments and approves from the phone already in their hand.",
        icon: "user-check",
        accent: "#e0820a",
        mock: "workflow",
        tabs: [
          {
            _key: "client-phone",
            label: "The client's phone",
            icon: "user-check",
            oneLiner:
              "The review link opens the mobile view natively: no account, no login, no app, from their phone.",
          },
          {
            _key: "client-review-link",
            label: "Client review",
            icon: "link",
            oneLiner:
              "The full no-account sign-off flow is its own page.",
            href: "/preview/features/client-review",
            listOnly: true,
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with cross-device review in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      {
        _key: "gs-install",
        accent: "#d43f8d",
        title: "Add the snippet in 30 seconds",
        description:
          "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
      },
      {
        _key: "gs-open",
        accent: "#433df3",
        title: "Open the page on any device",
        description:
          "A real phone, a tablet, or your browser's device mode. The toolbar is already there.",
      },
      {
        _key: "gs-pin",
        accent: "#109534",
        title: "Comment on what you see",
        description: "The finding lands tagged with the device.",
      },
      {
        _key: "gs-check",
        accent: "#e0820a",
        title: "Agents check both views",
        description: "The moment the site changes, every view gets the same pass.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-device-lab",
        question: "Do I need a device lab?",
        answer:
          "No. Any phone or tablet that opens the site works, and your browser's device mode covers the rest.",
      },
      {
        _key: "faq-viewport-toggle",
        question: "Is there a viewport toggle in the toolbar?",
        answer:
          "No. You review on real devices, or in your browser's device mode. What you see is what your visitors get, not a simulation of it.",
      },
      {
        _key: "faq-device-tag",
        question: "How do findings get their device tag?",
        answer:
          "Automatically, from the view they were left on. Nobody labels anything.",
      },
      {
        _key: "faq-agents",
        question: "Do agents review the mobile view?",
        answer: "Yes. Both views, every change, same checklist.",
      },
      {
        _key: "faq-client-phone",
        question: "What does my client see on their phone?",
        answer:
          "The mobile site itself, with the toolbar. They tap, comment, approve.",
      },
      {
        _key: "faq-staging",
        question: "Does this work on staging?",
        answer: "Yes. Live sites and staging both.",
      },
    ],
  },
  metaTitle: "Cross-Device Website Review on Real Devices | Superflow",
  metaDescription:
    "Review client sites on real phones and tablets. Findings tagged by device, AI agents check desktop and mobile, and clients approve from their phone.",
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
