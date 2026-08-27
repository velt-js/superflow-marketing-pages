#!/usr/bin/env node
/**
 * Seed the `featurePage` document for /website-monitoring in Sanity.
 *
 * The page serves at /<slug> through app/(features)/[slug]/page.tsx and reuses
 * the 2026 homepage sections (components/home-2026/*) as a fixed template —
 * hero copy + tab strip, the "solution" intro, the FeatureSet blocks, the
 * Get Started steps, related capabilities, the FAQ and SEO are all that vary
 * per page, so this seed is pure text/config with NO asset uploads.
 *
 * Positioning: the scheduled-scan angle — every page checked on a cadence,
 * findings pinned to the element that broke, and a logged history you can show.
 * Structure and artifacts are the same ones the /ai-review-agents page uses.
 *
 * Hero tab icon names come from the canonical hero-tab registry (HERO_TAB_ICONS
 * in components/home-2026/HeroIcons.tsx). FeatureSet block/tab icon names come
 * from FEATURE_SET_ICON_NAMES and the mock keys from FEATURE_SET_MOCK_OPTIONS
 * (both in sanity/schemas/featurePage.ts).
 *
 * This script only ever `createOrReplace`s the single document below; it never
 * deletes any other document.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-website-monitoring.mjs
 *   DRY_RUN=1 node scripts/seed-feature-website-monitoring.mjs
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
  _id: "featurePage-website-monitoring",
  _type: "featurePage",
  title: "Website Monitoring",
  slug: { _type: "slug", current: "website-monitoring" },
  hero: {
    headlineLines: ["Site QA is a full-time job.", "Now it runs on a schedule."],
    subhead:
      "Websites change every week and break quietly. Superflow scans every page on your schedule, then pins what broke to the exact element: screenshot, code, plain-English fix. Accessibility, links, copy, SEO, your own rules.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-every-page", label: "Every page", icon: "globe" },
      { _key: "ht-schedule", label: "On a schedule", icon: "history" },
      { _key: "ht-findings", label: "Pinned findings", icon: "pin" },
      { _key: "ht-tracker", label: "Pushed to your tracker", icon: "plug" },
      { _key: "ht-proof", label: "Proof over time", icon: "chart-bar" },
    ],
  },
  solution: {
    heading: "Turn the checks nobody has time for into a schedule",
    subheading:
      "Superflow scans every page, files what broke where your team already works, and logs every fix.",
    variant: "checklist",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Every Page",
    journeyEnd: "Proof It's Fixed",
    blocks: [
      {
        _key: "block-find",
        title: "Find it, before your users do",
        description:
          "Automated scans run on the pages you choose, at the cadence you set. Nothing waits for someone to have a free afternoon.",
        icon: "world",
        accent: "#433df3",
        mock: "run-on-demand",
        tabs: [
          {
            _key: "whole-sitemap",
            label: "Whole Sitemap",
            icon: "world",
            oneLiner:
              "Point it at your sitemap, or hand-pick the pages that matter and exclude the rest.",
            mock: "run-on-demand",
          },
          {
            _key: "on-a-schedule",
            label: "On a Schedule",
            icon: "history",
            oneLiner:
              "Weekly, monthly, on demand — or fired automatically on every deploy.",
            mock: "webhooks",
          },
          {
            _key: "built-in-checks",
            label: "Built-in Checks",
            icon: "lego",
            oneLiner:
              "Accessibility, broken links, spelling and SEO, ready to switch on from day one.",
            mock: "built-in-checks",
          },
          {
            _key: "your-own-rules",
            label: "Your Own Rules",
            icon: "ballpen",
            oneLiner:
              "Paste a QA checklist or a brand guide and it becomes a check that runs every scan.",
            mock: "custom-agent",
          },
          {
            _key: "every-device",
            label: "Every device",
            icon: "devices",
            oneLiner:
              "Desktop, tablet and phone in the same run — mobile breaks on its own.",
            href: "/cross-device-review",
            listOnly: true,
          },
          {
            _key: "behind-a-login",
            label: "Behind a login",
            icon: "lock",
            oneLiner:
              "Staging, client portals and member areas get scanned like any other page.",
            href: "/authenticated-pages",
            listOnly: true,
          },
        ],
      },
      {
        _key: "block-fix",
        title: "Findings land as work, not as a report",
        description:
          "Every issue arrives pinned to the element that broke, with a screenshot and the fix. Assign it, push it to your tracker, then re-run the check to confirm it shipped.",
        icon: "checks",
        accent: "#109534",
        mock: "agent-finding",
        tabs: [
          {
            _key: "pinned-to-the-element",
            label: "Pinned to the Element",
            icon: "message-pin",
            oneLiner:
              "Each finding sits on the exact element, with a snapshot of what the scan saw.",
            mock: "agent-finding",
          },
          {
            _key: "owners-and-statuses",
            label: "Owners and Statuses",
            icon: "list-check",
            oneLiner:
              "Assign by area, set a status — and the same broken footer stays one item, not two hundred.",
            mock: "tracking-task-management",
          },
          {
            _key: "pushed-to-your-tracker",
            label: "Pushed to Your Tracker",
            icon: "plug",
            oneLiner:
              "Two-way sync to Jira, Asana, ClickUp, Linear or wherever your team already works.",
            mock: "integrations",
          },
          {
            _key: "validate-the-fix",
            label: "Validate the Fix",
            icon: "circle-check",
            oneLiner:
              "Re-scan a single page and confirm the fix actually shipped, in minutes.",
            mock: "validate-fixes",
          },
        ],
      },
      {
        _key: "block-prove",
        title: "Proof you've been doing the work",
        description:
          "An audit is a snapshot. This is the footage — every scan and every fix logged with dates and owners, per site.",
        icon: "brand-speedtest",
        accent: "#da53b9",
        mock: "analytics-overview",
        tabs: [
          {
            _key: "score-over-time",
            label: "Your Score Over Time",
            icon: "brand-speedtest",
            oneLiner:
              "Every scan logged, so you can show a trend instead of a one-day number.",
            mock: "analytics-overview",
          },
          {
            _key: "the-receipts",
            label: "The Receipts",
            icon: "history",
            oneLiner:
              "What broke, who fixed it, when — and what you deliberately ignored, with a reason.",
            mock: "analytics-insights",
          },
          {
            _key: "snapshot-of-every-finding",
            label: "Snapshot of Every Finding",
            icon: "camera",
            oneLiner:
              "The page changes; the proof of what it looked like on scan day stays.",
            mock: "screenshot-then-and-now",
          },
          {
            _key: "one-site-or-fifty",
            label: "One Site or Fifty",
            icon: "layout-dashboard",
            oneLiner:
              "Every client site with its own score, its own schedule and its own history.",
            mock: "analytics-customers",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get monitoring in a minute",
    subheading: "Four steps, no engineer required.",
    steps: [
      {
        _key: "gs-install",
        accent: "#d43f8d",
        title: "Add the snippet in 30 seconds",
        description:
          "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
      },
      {
        _key: "gs-scope",
        accent: "#433df3",
        title: "Pick your pages and your cadence",
        description:
          "Whole sitemap or a hand-picked list. Weekly, monthly, or on every deploy.",
      },
      {
        _key: "gs-scan",
        accent: "#109534",
        title: "Scans file what broke",
        description:
          "Each finding lands pinned to the element, with a screenshot and a plain-English fix.",
      },
      {
        _key: "gs-fix",
        accent: "#e0820a",
        title: "Your team fixes, Superflow re-checks",
        description:
          "Re-run to confirm it shipped. Every scan and fix stays on the record.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    boundaryLine:
      "Monitoring covers what runs on a schedule. Review agents cover the checks themselves.",
    items: [
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description:
          "The checks every scan runs — the built-in ones and the ones you write yourself.",
        href: "/ai-review-agents",
        icon: "robot",
      },
      {
        _key: "rc-authenticated-pages",
        title: "Authenticated pages",
        description:
          "Pages behind a password, Okta or SSO get scanned like any other.",
        href: "/authenticated-pages",
        icon: "lock",
      },
      {
        _key: "rc-screenshots",
        title: "Automatic screenshots",
        description:
          "The capture behind every finding, so the proof outlives the page.",
        href: "/screenshots",
        icon: "camera",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-what",
        question: "What is website monitoring in Superflow?",
        answer:
          "It's a scheduled scan of your whole site. Superflow crawls the pages you choose, runs every check you've turned on — accessibility, broken links, spelling, SEO, plus any rule you wrote yourself — and pins what it finds to the exact element on the page. You get findings your team can assign and close, not a PDF nobody opens.",
      },
      {
        _key: "faq-vs-scanners",
        question: "How is this different from a free scanner like Lighthouse or WAVE?",
        answer:
          "Free scanners check one page at a time and hand you a list. You still copy each issue into your backlog by hand, and nothing tells you when something breaks next week. Superflow runs on a schedule across every page, turns each finding into an assigned, trackable item in the tracker you already use, and keeps the history.",
      },
      {
        _key: "faq-scope",
        question: "Can I choose which pages get scanned, and how often?",
        answer:
          "Yes. Point it at your whole sitemap or a hand-picked list, exclude anything that doesn't matter, and set the cadence — weekly, monthly, on demand, or fired automatically on every deploy through a webhook.",
      },
      {
        _key: "faq-staging",
        question: "Does it work on staging and pages behind a login?",
        answer:
          "Yes. Superflow runs on the site itself rather than through a proxy, so password-protected staging, client portals and member areas get scanned like any other page.",
      },
      {
        _key: "faq-duplicates",
        question: "Does one broken footer across 200 pages create 200 issues?",
        answer:
          "No. A shared element that breaks — a footer link, a nav contrast — is grouped into a single item. Fix it once and it clears everywhere on the next scan.",
      },
      {
        _key: "faq-false-positives",
        question: "What happens to false positives?",
        answer:
          "You resolve it, or you ignore it with a reason and it stays ignored. Flag a false positive once and later scans won't refile it. Nothing reaches your client without you.",
      },
      {
        _key: "faq-proof",
        question: "Can I prove what we've fixed?",
        answer:
          "Every scan and every fix is logged with dates and owners, so your score over time is a trend you can show a client, a boss or an auditor — not a number from one afternoon.",
      },
    ],
  },
  metaTitle: "Website Monitoring: Scan Every Page on a Schedule | Superflow",
  metaDescription:
    "Superflow scans every page of your site on a schedule, pins what broke to the exact element with a screenshot and a fix, and logs every repair.",
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
