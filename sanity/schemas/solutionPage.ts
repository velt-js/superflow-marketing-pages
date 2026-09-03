import { defineType, defineField } from "sanity";

import { AGENT_CATEGORY_OPTIONS } from "../../lib/solutions/agent-library";

// solutionPage — drives the /solutions/<slug> pages (batch 1: dental, healthcare,
// home services, pre-launch QA, site care, website migration QA).
//
// One template (components/solutions-2026/SolutionPageBody.tsx) renders every
// document. The shape mirrors `SolutionPage` in lib/solutions/types.ts, and the
// seed content in content/solutions/*.json is the same shape, so the Studio,
// the GROQ projection and the local fallback never drift.
//
// Copy rules the editor should keep (spec section 0): no em dashes, short
// sentences, no marketing words, no exclamation points, no emoji. Every agent
// card carries a sample finding written as the comment a customer would see.

/** Reject em dashes and en dashes in any copy field. */
function noDashes(value: string | undefined): true | string {
  try {
    if (typeof value === "string" && /[—–]/.test(value)) {
      return "No em dashes or en dashes. Use a period, comma, or colon.";
    }
    return true;
  } catch {
    return true;
  }
}

/** Nav descriptor limit (spec: under 60 characters). */
const NAV_DESCRIPTOR_MAX = 59;
/** H1 word limit (spec: max 8 words). */
const H1_MAX_WORDS = 8;
/** Every pack has exactly this many agents. */
const PACK_AGENT_COUNT = 8;
/** Bullets per "What stays human" column. */
const HUMAN_BULLET_COUNT = 4;
/** Page-specific FAQ items (three shared ones are appended by the template). */
const PAGE_FAQ_COUNT = 3;
/** Related solution pages per page. */
const RELATED_COUNT = 2;

/** Platform ids in components/home-2026/GetStarted.tsx PLATFORMS. */
const PLATFORM_IDS = [
  "drupal",
  "framer",
  "hubspot",
  "shopify",
  "bubble",
  "webflow",
  "wix",
  "wordpress",
  "elementor",
  "google-tag-manager",
  "squarespace",
  "html5",
];

export const solutionAgent = defineType({
  name: "solutionAgent",
  title: "Pack agent",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Agent name",
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "checks",
      title: "What it checks (one line)",
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "finding",
      title: "Sample finding",
      description:
        "The exact comment a customer would see. What is wrong, where, and why it matters. Two lines max.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: [...AGENT_CATEGORY_OPTIONS] },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "name", subtitle: "finding" } },
});

export const solutionBuildYourOwn = defineType({
  name: "solutionBuildYourOwn",
  title: "Build your own",
  type: "object",
  fields: [
    defineField({
      name: "input",
      title: "The plain sentence",
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "agentName",
      title: "Agent name",
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "finding",
      title: "Sample finding",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().custom(noDashes),
    }),
  ],
});

export const solutionPack = defineType({
  name: "solutionPack",
  title: "Pack",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Pack name",
      description: 'e.g. "Dental Launch Pack".',
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "slug",
      title: "Pack slug",
      description:
        'e.g. "dental-launch". Sent to signup as ?pack=<slug> so onboarding preselects it. Must match the saved agent group in the app.',
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { name: "kebab-case slug" }),
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      description:
        "One line: these run on every page, desktop and phone, and post findings as comments.",
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "agents",
      title: "Agents",
      type: "array",
      of: [{ type: "solutionAgent" }],
      validation: (rule) =>
        rule.required().length(PACK_AGENT_COUNT).error("A pack has exactly eight agents."),
    }),
    defineField({
      name: "buildYourOwn",
      title: "Build your own",
      type: "solutionBuildYourOwn",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const solutionFaqItem = defineType({
  name: "solutionFaqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({
      name: "q",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "a",
      title: "Answer",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().custom(noDashes),
    }),
  ],
  preview: { select: { title: "q", subtitle: "a" } },
});

export const solutionResell = defineType({
  name: "solutionResell",
  title: "Resell it (extra section)",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Resell it.",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "lines",
      title: "Lines",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA label",
      type: "string",
      initialValue: "Book demo",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA link",
      type: "string",
      initialValue: "/book-demo",
    }),
  ],
});

export const solutionPage = defineType({
  name: "solutionPage",
  title: "Solution Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "pack", title: "Pack" },
    { name: "human", title: "What stays human" },
    { name: "proof", title: "Proof and cost" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'Studio title, e.g. "Dental marketing agencies".',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Served at /solutions/<slug>.",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      description: "By agency (a vertical) or by job (a task).",
      type: "string",
      group: "identity",
      options: {
        list: [
          { title: "By agency", value: "agency" },
          { title: "By job", value: "job" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navLabel",
      title: "Nav label",
      description: 'Short label for the nav, footer and index cards, e.g. "Dental".',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required().custom(noDashes),
    }),
    defineField({
      name: "navDescriptor",
      title: "Nav descriptor",
      description: "One line under the nav label. Under 60 characters.",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required().max(NAV_DESCRIPTOR_MAX).custom(noDashes),
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "Sort position inside its kind group (nav, footer, index).",
      type: "number",
      group: "identity",
    }),
    defineField({
      name: "hidden",
      title: "Hidden",
      description:
        "Keep the page out of the nav, footer, index, sitemap and routes. Use for a page whose pack is not live in the app yet.",
      type: "boolean",
      group: "identity",
      initialValue: false,
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      fields: [
        defineField({
          name: "h1",
          title: "H1",
          description: "The pain in the customer's words. Max 8 words.",
          type: "string",
          // The eight-word cap is a warning, not a block: the spec's own H1s
          // run to ten words when the pain needs them.
          validation: (rule) => [
            rule.required().custom(noDashes),
            rule
              .custom((value) => {
                try {
                  const words = (value ?? "").trim().split(/\s+/).filter(Boolean);
                  return words.length <= H1_MAX_WORDS
                    ? true
                    : "Aim for 8 words or fewer.";
                } catch {
                  return true;
                }
              })
              .warning(),
          ],
        }),
        defineField({
          name: "sub",
          title: "Subhead",
          description: "Two sentences. What agents check, what the human decides.",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().custom(noDashes),
        }),
        defineField({
          name: "clientLine",
          title: "Client sign-off line",
          description:
            'One-line intro for the "Your client approves from a link" block, e.g. "The practice owner taps Approve from their phone between patients."',
          type: "string",
          validation: (rule) => rule.required().custom(noDashes),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pack",
      title: "Pack",
      type: "solutionPack",
      group: "pack",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "human",
      title: "What stays human",
      type: "object",
      group: "human",
      fields: [
        defineField({
          name: "agentsCheck",
          title: "Agents check (4 bullets)",
          type: "array",
          of: [{ type: "string" }],
          validation: (rule) => rule.required().length(HUMAN_BULLET_COUNT),
        }),
        defineField({
          name: "youDecide",
          title: "You decide (4 bullets)",
          type: "array",
          of: [{ type: "string" }],
          validation: (rule) => rule.required().length(HUMAN_BULLET_COUNT),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "resell",
      title: "Resell it (optional extra section)",
      description: "Site care only in batch 1. Renders after What stays human.",
      type: "solutionResell",
      group: "human",
    }),
    defineField({
      name: "platformsFirst",
      title: "Platforms to show first",
      description: "Platform ids, in order. The rest of the logo strip follows.",
      type: "array",
      of: [{ type: "string", options: { list: PLATFORM_IDS } }],
      group: "proof",
    }),
    defineField({
      name: "proof",
      title: "Proof",
      type: "string",
      group: "proof",
      options: {
        list: [
          { title: "Wonderist (review and approval only)", value: "wonderist-review" },
          { title: "Headway quote", value: "headway" },
          { title: "Harvey quote", value: "harvey" },
          { title: "Metric strip only", value: "metrics-only" },
        ],
        layout: "radio",
      },
      initialValue: "metrics-only",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cost",
      title: "Cost lines (optional override)",
      description:
        "Leave empty to use the default three lines. Tokens {smallScanPages} {smallScanCredits} {rescanCredits} {packPrice} {packCredits} are filled from the pricing source of truth. Never type a price.",
      type: "array",
      of: [{ type: "string" }],
      group: "proof",
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "faq",
      title: "Page-specific FAQ (3)",
      description: "Three shared questions are appended by the template.",
      type: "array",
      of: [{ type: "solutionFaqItem" }],
      group: "faq",
      validation: (rule) => rule.required().length(PAGE_FAQ_COUNT),
    }),
    defineField({
      name: "related",
      title: "Related solutions (2 slugs)",
      type: "array",
      of: [{ type: "string" }],
      group: "identity",
      validation: (rule) => rule.required().length(RELATED_COUNT),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "title",
          title: "Meta title",
          type: "string",
          validation: (rule) => rule.required().custom(noDashes),
        }),
        defineField({
          name: "description",
          title: "Meta description",
          type: "text",
          rows: 2,
          validation: (rule) => rule.required().custom(noDashes),
        }),
        defineField({ name: "ogTitle", title: "OG title", type: "string" }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image", group: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
