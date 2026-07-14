import { defineType, defineField } from "sanity";

import { warnOnRelativeInternalHref } from "./shared/linkAnnotation";

// featurePage — drives the new /preview/features/<slug> marketing pages.
// These reuse the 2026 homepage sections (components/home-2026/*) as a
// shared template; only the hero copy, the "solution" intro heading, the
// FeatureSet blocks, the FAQ and SEO vary per feature. Every other section
// (get started, industry solutions, cost calculator, testimonials, trust,
// integrations, footer, …) stays hard-coded shared chrome. Unlike
// /home-preview there is NO Problem/clock section on feature pages.
//
// This is intentionally a NEW document type: the legacy /<feature>-review
// pages (reviewPage) are untouched.

/**
 * Icon names available to FeatureSet blocks + tabs. Must stay in sync with
 * the `FeatureSetIconName` union in components/home-2026/FeatureSetIcons.tsx
 * (a mistyped value simply renders no icon rather than throwing).
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

/**
 * App-window mocks a FeatureSet block (or an individual tab) can render inside
 * its white screen. Each `value` MUST match a key of the `MOCKS` registry in
 * components/home-2026/FeatureSetBlock.tsx (an unknown value simply falls back
 * to the generic "workflow" window rather than throwing). Several entries reuse
 * the hero-section artifacts verbatim via HeroArtifactFit (review-agents,
 * run-on-demand, built-in-checks, private-comments, guest-mode, integrations).
 */
const FEATURE_SET_MOCK_OPTIONS: readonly { title: string; value: string }[] = [
  { title: "Workflow window (generic)", value: "workflow" },
  { title: "AI Review Agents (agents at work)", value: "review-agents" },
  {
    title: "AI Review Agents \u2014 Memory (grounded findings)",
    value: "review-agents-memory",
  },
  { title: "Run on Demand (agents run screen)", value: "run-on-demand" },
  { title: "Built-in checks (agents library)", value: "built-in-checks" },
  { title: "Custom Agent (SEO Agent builder)", value: "custom-agent" },
  { title: "Custom Agent — Test Case (reviewer)", value: "custom-agent-test" },
  { title: "Client Memory", value: "client-memory" },
  { title: "Memory — Learning from reviews", value: "memory-learning" },
  { title: "Memory — One-time uploads (scan)", value: "memory-upload-scan" },
  { title: "Memory — Per-client memory", value: "memory-per-client" },
  { title: "Memory — Scoped three ways", value: "memory-scoped-three" },
  { title: "Memory — Applied to the next asset", value: "applied-next-asset" },
  { title: "Ask AI (common client issues)", value: "ask-ai" },
  { title: "Ask AI — Cited answer", value: "ask-ai-cited" },
  { title: "Ask AI — Per-client ranking", value: "ask-ai-per-client" },
  { title: "Ask AI — Copy vs bug mix", value: "ask-ai-copy-vs-bug" },
  { title: "Ask AI — Cross-project patterns", value: "ask-ai-cross-project" },
  { title: "Ask AI — Review load by team", value: "ask-ai-load-by-team" },
  { title: "Ask AI — Delay & churn signals", value: "ask-ai-delay-churn" },
  { title: "Ask AI — Ops signals", value: "ask-ai-ops-signals" },
  { title: "Ask AI — Analytics on demand", value: "ask-ai-analytics" },
  { title: "Analytics — Strategic Overview (status chart + metrics)", value: "analytics-overview" },
  { title: "Analytics — Insights of the week (curated feed)", value: "analytics-insights" },
  { title: "Analytics — One-click action (press → applied)", value: "analytics-act" },
  { title: "Analytics — Interpretation included", value: "analytics-interpretation" },
  { title: "Analytics — Customers (per-client rollup)", value: "analytics-customers" },
  { title: "Analytics — Team (review load, no per-person score)", value: "analytics-team" },
  { title: "Analytics — For Me (personal + awaiting response)", value: "analytics-for-me" },
  { title: "Analytics — Pin or dismiss", value: "analytics-pin-dismiss" },
  { title: "Analytics — Filters that re-curate", value: "analytics-filters" },
  { title: "Client Review — Magic link (message → review link)", value: "client-review-magic-link" },
  { title: "Client Review — Cleaned up before they look", value: "client-review-cleaned-up" },
  { title: "Client Review — Approve (tap → recorded yes)", value: "client-review-approve" },
  { title: "Pinned comment", value: "pinned-comments" },
  { title: "Agent finding (approve/reject card)", value: "agent-finding" },
  { title: "Validate Fixes (re-check \u2192 fixed \u2192 resolved)", value: "validate-fixes" },
  { title: "Auto screenshot", value: "auto-screenshot" },
  { title: "Screenshots — Comment-time capture (snapshot saved)", value: "screenshot-capture" },
  { title: "Screenshots — No browser extension", value: "screenshot-no-extension" },
  { title: "Screenshots — Then and now (page changed)", value: "screenshot-then-and-now" },
  { title: "Screenshots — Full-page context", value: "screenshot-full-page" },
  { title: "Screenshots — Client-visible snapshot (phone)", value: "screenshot-client-view" },
  { title: "Screenshots — Review record (approvals)", value: "screenshot-record" },
  { title: "Private comments", value: "private-comments" },
  { title: "Private Comments — Team-private thread", value: "private-team-thread" },
  { title: "Private Comments — Just-you comment", value: "private-just-you" },
  { title: "Private Comments — A clean client view", value: "private-client-view" },
  { title: "Private Comments — Side-by-side threads", value: "private-side-by-side" },
  { title: "Private Comments — Unmistakable scope marks", value: "private-scope-marks" },
  { title: "Private Comments — One settled answer", value: "private-one-answer" },
  { title: "Private Comments — Scope-aware notifications", value: "private-scope-notifications" },
  { title: "White-label — Custom Branding settings (upload rows)", value: "white-label-settings" },
  { title: "White-label — Client review toolbar (branded)", value: "white-label-toolbar" },
  { title: "White-label — Admin portal navbar (branded)", value: "white-label-portal" },
  { title: "White-label — Agent finding under your brand", value: "white-label-agent-findings" },
  { title: "Guest mode", value: "guest-mode" },
  { title: "Behind login", value: "behind-login" },
  { title: "Authenticated — Behind a password (gate lifts)", value: "auth-behind-password" },
  { title: "Authenticated — Behind Okta (SSO sign-in)", value: "auth-behind-okta" },
  { title: "Authenticated — Behind SSO / SAML", value: "auth-behind-sso" },
  { title: "Authenticated — Client's own portal (no account)", value: "auth-client-portal" },
  { title: "Authenticated — On the site, not a proxy (snippet)", value: "auth-on-site" },
  { title: "Authenticated — Works behind every auth type", value: "auth-types" },
  { title: "All devices (desktop + mobile)", value: "all-devices" },
  { title: "Webhooks (auto-fire on deploy)", value: "webhooks" },
  { title: "Kanban board", value: "kanban" },
  { title: "Kanban — Cross-client board", value: "kanban-cross-client" },
  { title: "Kanban — Self-moving cards", value: "kanban-self-moving" },
  { title: "Kanban — Filter to one client", value: "kanban-filters" },
  { title: "Kanban — Custom status columns", value: "kanban-custom-columns" },
  { title: "Integrations (two-way sync)", value: "integrations" },
  { title: "Custom statuses", value: "custom-statuses" },
  { title: "Workflows (multi-step flow)", value: "workflows" },
  { title: "Review flow — Sample flow (humans + agents)", value: "flow-sample" },
  { title: "Review flow — Push-triggered run", value: "flow-push" },
  { title: "Review flow — Visual builder (drag a step)", value: "flow-build" },
  { title: "Review flow — Condition (rule editor)", value: "flow-condition" },
  { title: "Review flow — Parallel review lanes", value: "flow-parallel" },
  { title: "Review flow — Escalation", value: "flow-escalation" },
  { title: "Review flow — Client gate (no-account approval)", value: "flow-gate" },
  { title: "Review flow — Step & flow notifications", value: "flow-notifications" },
  { title: "Review flow — One flow, every project", value: "flow-one-flow" },
  { title: "Versioning", value: "versioning" },
  { title: "Live site", value: "live-site" },
  { title: "Record walkthrough", value: "record-walkthrough" },
  { title: "Recordings — Screen capture", value: "recordings-screen" },
  { title: "Recordings — Camera (webcam)", value: "recordings-camera" },
  { title: "Recordings — Voice note", value: "recordings-voice" },
  { title: "Recordings — Pinned as a comment", value: "recordings-pinned" },
  { title: "Recordings — Composer (record + attach)", value: "recordings-composer" },
  { title: "Recordings — Client watches (mobile)", value: "recordings-client" },
  { title: "Recordings — Thread with clips", value: "recordings-thread" },
  { title: "Text Comments", value: "text-comments" },
  { title: "Thread Comments", value: "thread-comments" },
  { title: "Tracking & Task Management", value: "tracking-task-management" },
  { title: "Robust Anchor", value: "robust-anchor" },
  { title: "Attachment", value: "comment-attachment" },
  { title: "Mentions", value: "comment-mentions" },
  { title: "Reaction & Read Receipt", value: "reaction-read-receipt" },
];

// ---- Hero tab (CMS-driven labels for the shared product window) ----

export const featureHeroTab = defineType({
  name: "featureHeroTab",
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

export const featureHero = defineType({
  name: "featureHero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "headlineLines",
      title: "Headline lines",
      description:
        'Each entry renders on its own line, e.g. ["Paste a QA checklist.", "Get AI agents."].',
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
        'Which interactive product mock renders in the hero. "QA workflow window" is the default. The two browser presets share the same window UI and differ only in their tab labels.',
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
      of: [{ type: "featureHeroTab" }],
      validation: (rule) => rule.min(1).max(6),
    }),
  ],
});

// ---- Solution intro (the "checklist → agents → review" section header) ----
// Feature pages have no Problem/clock section above this, so the heading keeps
// the word "manual" (e.g. "Turn your manual QA processes into Agents").

export const featureSolution = defineType({
  name: "featureSolution",
  title: "Solution intro",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Turn your manual QA processes into Agents",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
      initialValue: "Build your digital twin and let them work while you review them.",
    }),
    defineField({
      name: "variant",
      title: "Illustration",
      description:
        "Which diagram renders beneath the heading. \"Checklist → agents\" is the default; \"Scattered comments → pinned on site\" suits comment/feedback pages.",
      type: "string",
      options: {
        list: [
          { title: "Checklist → agents → review", value: "checklist" },
          { title: "Scattered comments → pinned on site", value: "comments" },
          {
            title: "Guideline sheets → Memory brain (memory page)",
            value: "memory-guidelines",
          },
          {
            title: "Minimal graphs → insight (Ask AI page)",
            value: "ask-ai",
          },
          {
            title: "Dashboard → curated weekly insight (Analytics page)",
            value: "analytics",
          },
          {
            title: "Magic link → live page → Approve (Client Review page)",
            value: "client-review",
          },
          {
            title:
              "Two threads on one element → client view (Private Comments page)",
            value: "private-comments",
          },
          {
            title:
              "One logo upload → toolbar + portal both branded (White-label page)",
            value: "white-label",
          },
          {
            title:
              "Review activity → the board updates itself (Kanban Board page)",
            value: "kanban",
          },
          {
            title:
              "In your head → one visual flow (Review Workflows page)",
            value: "review-workflows",
          },
          {
            title:
              "Behind the login → reviewed in place (Authenticated Pages page)",
            value: "authenticated-pages",
          },
          {
            title:
              "Comment captures the page → snapshot outlives it (Screenshots page)",
            value: "screenshots",
          },
          {
            title: "Record it → pinned as a comment (Recordings page)",
            value: "recordings",
          },
        ],
        layout: "radio",
      },
      initialValue: "checklist",
    }),
    defineField({
      name: "icon",
      title: "Header icon override",
      description:
        "Optional. Replaces the default before→after glyph pair above the heading with a page-specific cue. Leave empty to keep the illustration's default pair.",
      type: "string",
      options: {
        list: [
          {
            title: "Sheet → Memory brain (memory page)",
            value: "sheet-brain",
          },
        ],
      },
    }),
  ],
});

// ---- FeatureSet blocks (the scroll-stacked feature cards) ----

export const featureBlockTab = defineType({
  name: "featureBlockTab",
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
      rows: 2,
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
      title: "Link (for the \"Features that help\" row)",
      type: "string",
      validation: (rule) => rule.custom(warnOnRelativeInternalHref).warning(),
    }),
    defineField({
      name: "listOnly",
      title: "List only (no window tab)",
      description:
        "When on, the entry appears in the left list as a link but gets no tab in the app window.",
      type: "boolean",
    }),
    defineField({
      name: "collapsesFirstTab",
      title: "Collapse first tab when active",
      description:
        "When on, activating this tab shrinks the first tab to icon-only to free room.",
      type: "boolean",
    }),
    defineField({
      name: "mock",
      title: "App-window mock (per-tab override)",
      description:
        "Which built-in product mock renders when this tab is active. Leave empty to inherit the block's mock.",
      type: "string",
      options: { list: [...FEATURE_SET_MOCK_OPTIONS] },
    }),
  ],
  preview: { select: { title: "label", subtitle: "oneLiner" } },
});

export const featureBlock = defineType({
  name: "featureBlock",
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
      description:
        "Which built-in product mock renders inside the block's white screen. An individual tab can override this via its own \"App-window mock\" field.",
      type: "string",
      options: { list: [...FEATURE_SET_MOCK_OPTIONS] },
      initialValue: "workflow",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tabs",
      title: "Tabs / features that help",
      type: "array",
      of: [{ type: "featureBlockTab" }],
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

export const featureSetSection = defineType({
  name: "featureSetSection",
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
      of: [{ type: "featureBlock" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

// ---- Get Started (numbered onboarding steps) ----
// Feature pages render this as numbered badge cards (01, 02, …) rather than the
// homepage media cards. review-agents has 4 steps; comments has 3.

export const featureGetStartedStep = defineType({
  name: "featureGetStartedStep",
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

export const featureGetStarted = defineType({
  name: "featureGetStarted",
  title: "Get Started",
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
      name: "steps",
      title: "Steps",
      type: "array",
      of: [{ type: "featureGetStartedStep" }],
      validation: (rule) => rule.min(1).max(4),
    }),
  ],
});

// ---- Related capabilities (cross-links to sibling feature pages) ----

export const featureRelatedCapability = defineType({
  name: "featureRelatedCapability",
  title: "Related capability",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "Cross-device review".',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (one line)",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (rule) =>
        rule.required().custom(warnOnRelativeInternalHref).warning(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: { list: FEATURE_SET_ICON_OPTIONS },
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const featureRelatedCapabilities = defineType({
  name: "featureRelatedCapabilities",
  title: "Related capabilities",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Related capabilities",
    }),
    defineField({
      name: "items",
      title: "Capabilities",
      type: "array",
      of: [{ type: "featureRelatedCapability" }],
      validation: (rule) => rule.min(1).max(4),
    }),
    defineField({
      name: "boundaryLine",
      title: "Boundary line",
      description:
        "Optional single line under the cards clarifying where this capability's scope ends and a sibling's begins.",
      type: "text",
      rows: 2,
    }),
  ],
});

// ---- FAQ ----

export const featureFaqItem = defineType({
  name: "featureFaqItem",
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

export const featureFaq = defineType({
  name: "featureFaq",
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
      of: [{ type: "featureFaqItem" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

// ---- featurePage document ----

export const featurePage = defineType({
  name: "featurePage",
  title: "Feature Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "solution", title: "Solution intro" },
    { name: "features", title: "Feature Set" },
    { name: "getStarted", title: "Get Started" },
    { name: "related", title: "Related capabilities" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "Website QA". Used in listing + meta defaults.',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Served at /preview/features/<slug>.",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "featureHero",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "solution",
      title: "Solution intro",
      type: "featureSolution",
      group: "solution",
    }),
    defineField({
      name: "featureSet",
      title: "Feature set",
      type: "featureSetSection",
      group: "features",
    }),
    defineField({
      name: "getStarted",
      title: "Get Started",
      type: "featureGetStarted",
      group: "getStarted",
    }),
    defineField({
      name: "relatedCapabilities",
      title: "Related capabilities",
      type: "featureRelatedCapabilities",
      group: "related",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "featureFaq",
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
