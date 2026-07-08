import { defineType, defineField } from "sanity";

import { warnOnRelativeInternalHref } from "./shared/linkAnnotation";

// integrationPreviewPage — drives the new /preview/integrations/<slug> marketing
// pages, and integrationPreviewHub drives the /preview/integrations hub. Both
// reuse the 2026 homepage sections (components/home-2026/*) as a shared
// template, exactly like featurePage does for /preview/features. Only the hero
// copy, the "solution" intro, the FeatureSet blocks, the Get Started steps, the
// FAQ and the SEO vary per page; every other section (industry solutions, cost
// calculator, testimonials, trust, integrations, footer, …) stays hard-coded
// shared chrome.
//
// These are intentionally NEW document types: the legacy `integrationPage`
// category template (app/integrations/<slug>) is left completely untouched. The
// names are deliberately distinct so nothing collides in the schema registry.

/**
 * Icon names available to FeatureSet blocks + tabs. Must stay in sync with the
 * `FeatureSetIconName` union in components/home-2026/FeatureSetIcons.tsx (a
 * mistyped value simply renders no icon rather than throwing). Kept as its own
 * copy so the legacy `integrationPage` schema is never touched.
 */
const FEATURE_SET_ICON_NAMES: readonly string[] = [
  "arrow-right",
  "checks",
  "ballpen",
  "brain",
  "terminal",
  "lock-open",
  "click",
  "grain",
  "lego",
  "plug",
  "layout-sidebar-left-expand",
  "layout-dashboard",
  "settings",
  "bolt",
  "dots-vertical",
  "history",
  "refresh",
  "sparkles",
  "player-play",
  "share",
  "brand-speedtest",
  "link",
  "code-asterisk",
  "dots-grid",
  "robot",
  "database",
  "message-chatbot",
  "message-circle",
  "message-pin",
  "pin",
  "camera",
  "lock",
  "world",
  "send",
  "user-check",
  "devices",
  "video",
  "list-check",
  "circle-check",
  "route",
  "layout-kanban",
  "palette",
];

const FEATURE_SET_ICON_OPTIONS = FEATURE_SET_ICON_NAMES.map((iconName) => ({
  title: iconName,
  value: iconName,
}));

/**
 * Canonical hero-tab icon names. Must stay in sync with the `HERO_TAB_ICONS`
 * registry in components/home-2026/HeroIcons.tsx (an unknown value simply
 * falls back to the default icon rather than throwing).
 */
const HERO_TAB_ICON_NAMES: readonly string[] = [
  "robot",
  "wand",
  "key",
  "lock",
  "lock-open",
  "plug",
  "grain",
  "bolt",
  "share",
  "check",
  "ballpen",
  "link",
  "code-asterisk",
  "speedtest",
  "globe",
  "world",
  "lego",
  "layout-sidebar",
  "layout-dashboard",
  "layout-kanban",
  "settings",
  "pin",
  "message",
  "user-check",
  "list-check",
  "history",
  "camera",
  "video",
  "chart-bar",
  "palette",
  "sparkles",
  "route",
  "eye",
  "eye-off",
  "devices",
];

const HERO_TAB_ICON_OPTIONS = HERO_TAB_ICON_NAMES.map((iconName) => ({
  title: iconName,
  value: iconName,
}));

// ---- Hero tab (CMS-driven labels for the shared product window) ----

export const integrationPreviewHeroTab = defineType({
  name: "integrationPreviewHeroTab",
  title: "Hero tab",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: { list: HERO_TAB_ICON_OPTIONS },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "icon" } },
});

// ---- Hero (headline + subhead only; product UI is shared/hard-coded) ----

export const integrationPreviewHero = defineType({
  name: "integrationPreviewHero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker (eyebrow)",
      description:
        "Category scent line from the source, e.g. \"· CHAT · THE AI QA REVIEWER FOR AGENCIES\". Stored for parity; the shared Hero has no eyebrow slot, so it is not rendered today.",
      type: "string",
    }),
    defineField({
      name: "headlineLines",
      title: "Headline lines",
      description:
        'Each entry renders on its own line, e.g. ["Resolve reviews", "from Slack."].',
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1).max(3),
    }),
    defineField({
      name: "subhead",
      title: "Subheading",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showcase",
      title: "Product showcase",
      description:
        'Which interactive product mock renders in the hero. "QA workflow window" is the default.',
      type: "string",
      options: {
        list: [
          { title: "QA workflow window", value: "workflow" },
          { title: "Browser — Comments tabs", value: "comments" },
          { title: "Browser — Review Agents tabs", value: "review-agents" },
        ],
        layout: "radio",
      },
      initialValue: "workflow",
    }),
    defineField({
      name: "tabs",
      title: "Hero tabs",
      description:
        "Per-page tab labels shown on the shared product window. When set, these override the showcase preset's tabs; the window itself stays identical.",
      type: "array",
      of: [{ type: "integrationPreviewHeroTab" }],
      validation: (rule) => rule.min(1).max(6),
    }),
  ],
});

// ---- Solution intro (the shared "checklist → agents → review" header) ----

export const integrationPreviewSolution = defineType({
  name: "integrationPreviewSolution",
  title: "Solution intro",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
    }),
    defineField({
      name: "variant",
      title: "Illustration",
      description:
        'Which diagram renders beneath the heading. "Checklist → agents" is the default.',
      type: "string",
      options: {
        list: [
          { title: "Checklist → agents → review", value: "checklist" },
          { title: "Scattered comments → pinned on site", value: "comments" },
        ],
        layout: "radio",
      },
      initialValue: "checklist",
    }),
  ],
});

// ---- FeatureSet blocks (the scroll-stacked feature cards) ----

export const integrationPreviewBlockTab = defineType({
  name: "integrationPreviewBlockTab",
  title: "Feature tab",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: { list: FEATURE_SET_ICON_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "oneLiner",
      title: "One-liner (window header statement)",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "loss",
      title: '"Without it…" line (currently hidden in the UI)',
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "href",
      title: 'Link (for the "Features that help" row)',
      type: "string",
      validation: (rule) => rule.custom(warnOnRelativeInternalHref).warning(),
    }),
    defineField({
      name: "listOnly",
      title: "List only (no window tab)",
      description:
        "When on, the entry appears in the left list as a link but gets no tab in the app window. Used for the hub catalog cards.",
      type: "boolean",
    }),
    defineField({
      name: "collapsesFirstTab",
      title: "Collapse first tab when active",
      type: "boolean",
    }),
  ],
  preview: { select: { title: "label", subtitle: "oneLiner" } },
});

export const integrationPreviewBlock = defineType({
  name: "integrationPreviewBlock",
  title: "Feature block",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Heading icon",
      type: "string",
      options: { list: FEATURE_SET_ICON_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "accent",
      title: "Accent color (hex, e.g. #433df3)",
      description:
        "Brand accent for the block. The light card tint is derived from this automatically.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mock",
      title: "App-window mock",
      type: "string",
      options: {
        list: [
          { title: "Agent gallery", value: "agent-gallery" },
          { title: "Workflow", value: "workflow" },
        ],
        layout: "radio",
      },
      initialValue: "workflow",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tabs",
      title: "Tabs / features that help",
      type: "array",
      of: [{ type: "integrationPreviewBlockTab" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "initialTabIndex",
      title: "Initially active tab index",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const integrationPreviewFeatureSet = defineType({
  name: "integrationPreviewFeatureSet",
  title: "Feature set",
  type: "object",
  fields: [
    defineField({
      name: "headerTitle",
      title: "Section header",
      type: "string",
      initialValue: "Superflow gets you from",
    }),
    defineField({
      name: "journeyStart",
      title: "Journey — start label",
      type: "string",
      initialValue: "First Draft",
    }),
    defineField({
      name: "journeyEnd",
      title: "Journey — end label",
      type: "string",
      initialValue: "Client Approved",
    }),
    defineField({
      name: "blocks",
      title: "Blocks",
      type: "array",
      of: [{ type: "integrationPreviewBlock" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

// ---- Get Started (numbered onboarding / "How it works" steps) ----

export const integrationPreviewStep = defineType({
  name: "integrationPreviewStep",
  title: "Get Started step",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "accent",
      title: "Badge accent color, hex",
      description: "Badge accent color, hex (e.g. #d43f8d).",
      type: "string",
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const integrationPreviewGetStarted = defineType({
  name: "integrationPreviewGetStarted",
  title: "Get Started",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "subheading", title: "Subheading", type: "string" }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [{ type: "integrationPreviewStep" }],
      validation: (rule) => rule.min(1).max(4),
    }),
  ],
});

// ---- FAQ ----

export const integrationPreviewFaqItem = defineType({
  name: "integrationPreviewFaqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "question", subtitle: "answer" } },
});

export const integrationPreviewFaq = defineType({
  name: "integrationPreviewFaq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Frequently Asked Questions",
    }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [{ type: "integrationPreviewFaqItem" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

// ---- integrationPreviewPage document (a single connector page) ----

export const integrationPreviewPage = defineType({
  name: "integrationPreviewPage",
  title: "Integration Preview Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "solution", title: "Solution intro" },
    { name: "features", title: "Feature Set" },
    { name: "getStarted", title: "Get Started" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "Slack". Used in listing + meta defaults.',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Served at /preview/integrations/<slug>.",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "family",
      title: "Catalog family",
      description:
        "Which hub group this connector belongs to (Chat, Project boards, Install, Build your own, Design and files).",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "cardBlurb",
      title: "Catalog card blurb",
      description: "Short line shown for this tool on the hub catalog.",
      type: "text",
      rows: 2,
      group: "identity",
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "integrationPreviewHero",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "solution",
      title: "Solution intro",
      type: "integrationPreviewSolution",
      group: "solution",
    }),
    defineField({
      name: "featureSet",
      title: "Feature set",
      type: "integrationPreviewFeatureSet",
      group: "features",
    }),
    defineField({
      name: "getStarted",
      title: "Get Started",
      type: "integrationPreviewGetStarted",
      group: "getStarted",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "integrationPreviewFaq",
      group: "faq",
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string", group: "seo" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image", group: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});

// ---- integrationPreviewHub document (the /preview/integrations hub) ----
// A single document that drives the hub. The `catalog` reuses the same
// FeatureSet shape as detail pages: each family is a block whose tabs are the
// tool cards (list-only links to /preview/integrations/<slug>).

export const integrationPreviewHub = defineType({
  name: "integrationPreviewHub",
  title: "Integration Preview Hub",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "solution", title: "Solution intro" },
    { name: "catalog", title: "Catalog" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "integrationPreviewHero",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "solution",
      title: "Solution intro",
      type: "integrationPreviewSolution",
      group: "solution",
    }),
    defineField({
      name: "catalog",
      title: "Catalog",
      description:
        "The tool catalog grouped by family. Each block is a family; its tabs are the tool cards linking to detail pages.",
      type: "integrationPreviewFeatureSet",
      group: "catalog",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "integrationPreviewFaq",
      group: "faq",
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string", group: "seo" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image", group: "seo" }),
  ],
  preview: { select: { title: "title" } },
});
