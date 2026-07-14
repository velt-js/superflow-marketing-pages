#!/usr/bin/env node
/**
 * Seed the "Client Review" `featurePage` document in Sanity.
 *
 * Serves at /client-review. Like every feature page it reuses
 * the 2026 homepage sections (components/home-2026/*) as a fixed template — only
 * the hero copy, the hero tab strip, the "solution" intro, the FeatureSet
 * blocks, the FAQ and SEO vary per page, so this seed is pure text/config with
 * NO asset uploads.
 *
 * Copy is authored from the per-page spec in
 * ~/Downloads/superflow-website-5/features/features-client-review/client-review.md.
 * Production tags ([VERIFY], [ASSET], [FLAG]) are stripped; no metrics, KPIs, or
 * testimonials the spec marks unavailable are invented. The FAQ omits the
 * link-forwarding question the spec blocks pending engineering's access model.
 *
 * This script only ever `createOrReplace`s the one document below; it never
 * deletes any other document.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-client-review.mjs
 *   DRY_RUN=1 node scripts/seed-feature-client-review.mjs
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
  _id: "featurePage-client-review",
  _type: "featurePage",
  title: "Client Review",
  slug: { _type: "slug", current: "client-review" },
  hero: {
    headlineLines: ["Your client reviews in one click.", "No account."],
    subhead:
      "Send a link by email, SMS, or WhatsApp. The client clicks the spot and types. No signup, no app, no training, from their phone. By then AI and your team have already cleaned it up.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-magic-link", label: "Magic link", icon: "link" },
      { _key: "ht-phone", label: "Phone view", icon: "devices" },
      { _key: "ht-no-account", label: "No-account flow", icon: "user-check" },
      { _key: "ht-private", label: "Private threads", icon: "eye-off" },
    ],
  },
  solution: {
    heading: "One click to yes. No account.",
    subheading:
      "Client review is a magic link to the live page — the client sees the work after AI and your team cleaned it up, then approves right there.",
    variant: "client-review",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Send a Link",
    journeyEnd: "Client Approved",
    blocks: [
      {
        _key: "block-link",
        title: "The link",
        description:
          "Send it by email, SMS, or WhatsApp. It opens the live page, not a portal — no account, no login screen anywhere in the loop.",
        icon: "link",
        accent: "#433df3",
        mock: "guest-mode",
        tabs: [
          {
            _key: "magic-link",
            label: "The magic link",
            icon: "link",
            oneLiner:
              "Send it by email, SMS, or WhatsApp. It opens the live page, not a portal.",
            mock: "client-review-magic-link",
          },
          {
            _key: "no-account-flow",
            label: "The no-account flow",
            icon: "user-check",
            oneLiner:
              "No account, no login, no app, from their phone. No login screen exists anywhere in the loop.",
          },
          {
            _key: "behind-a-login",
            label: "Behind a login too",
            icon: "lock",
            oneLiner:
              "Even work behind a login gets the same client link — the gate lifts and they review in context.",
            mock: "behind-login",
            href: "/authenticated-pages",
          },
        ],
      },
      {
        _key: "block-review",
        title: "The review",
        description:
          "The client sees polished work, not the punch list, and clicks the spot to comment — no training, no tutorial, no manual.",
        icon: "message-circle",
        accent: "#109534",
        mock: "guest-mode",
        tabs: [
          {
            _key: "cleaned-up",
            label: "Cleaned up before they look",
            icon: "checks",
            oneLiner:
              "AI agents and your team review first, so the client sees polished work, not the punch list.",
            mock: "client-review-cleaned-up",
          },
          {
            _key: "click-the-spot",
            label: "Click-the-spot comments",
            icon: "pin",
            oneLiner:
              "They click the element and type. No training, no tutorial, no manual.",
            mock: "pinned-comments",
          },
          {
            _key: "what-they-never-see",
            label: "What they never see",
            icon: "eye-off",
            oneLiner:
              "Your internal debate stays internal; the client reads none of it.",
            mock: "private-comments",
            href: "/private-comments",
          },
        ],
      },
      {
        _key: "block-yes",
        title: "The yes",
        description:
          "One tap approves, timestamped and recorded with the client's name — then the status flips, the board moves, and your team knows.",
        icon: "circle-check",
        accent: "#e0820a",
        mock: "guest-mode",
        tabs: [
          {
            _key: "approve-button",
            label: "The Approve button",
            icon: "circle-check",
            oneLiner:
              "One tap, timestamped, recorded with the client's name. The yes stops living in an email thread.",
            mock: "client-review-approve",
          },
          {
            _key: "after-the-yes",
            label: "After the yes",
            icon: "refresh",
            oneLiner:
              "The status flips, the board moves, your team knows. Approved work is ready to ship.",
            mock: "kanban",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with client review in a minute",
    subheading: "Three steps, none of them your client's.",
    steps: [
      {
        _key: "gs-install",
        accent: "#d43f8d",
        title: "Add the snippet in 30 seconds",
        description:
          "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
      },
      {
        _key: "gs-tap",
        accent: "#433df3",
        title: "Your client opens the link on their phone",
        description:
          "The live page loads. No login screen exists in this flow.",
      },
      {
        _key: "gs-see",
        accent: "#109534",
        title: "They see the work already cleaned up",
        description: "AI and your team reviewed it first.",
      },
      {
        _key: "gs-approve",
        accent: "#e0820a",
        title: "They click the spot, or tap Approve",
        description: "Every yes is timestamped and recorded.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-cross-device",
        title: "Cross-device review",
        description: "The phone your client is already holding.",
        href: "/cross-device-review",
        icon: "devices",
      },
      {
        _key: "rc-review-workflows",
        title: "Review workflows",
        description: "The client gate is one node in the path you design.",
        href: "/review-workflows",
        icon: "route",
      },
    ],
    boundaryLine:
      "Client review covers the no-account sign-off. Cross-device covers where you review.",
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-account",
        question: "Does my client need an account?",
        answer:
          "No account, no login, no app, from their phone. They open the link and they're in the review.",
      },
      {
        _key: "faq-internal",
        question: "Can my client see our internal comments?",
        answer:
          "No. Private comments stay on your side of the glass. The client sees the work and the conversation you chose to have with them.",
      },
      {
        _key: "faq-what-they-see",
        question: "What exactly does my client see?",
        answer:
          "The live page, your logo on the toolbar, findings already cleaned up, and an Approve button. No dashboard, no onboarding, no Superflow chrome.",
      },
      {
        _key: "faq-phone",
        question: "Does it work on their phone?",
        answer:
          "Yes, natively. The link opens the mobile site with the toolbar. The full story is at /cross-device-review.",
      },
      {
        _key: "faq-prove",
        question: "Can I prove the client approved?",
        answer:
          "Yes. Every approval is timestamped and recorded with the reviewer's name.",
      },
      {
        _key: "faq-cost",
        question: "What does client review cost?",
        answer:
          "Client reviewers are free: unlimited guest seats on every plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "Client Website Review With No Login | Superflow",
  metaDescription:
    "Send your client a magic link. They open the live page, comment by clicking the spot, and approve. No account, no login, no app, from their phone.",
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
