import { defineType, defineField } from "sanity";

// Bug Book — curated, PII-scrubbed comment threads and agent findings
// rendered at /bug-book and /bug-book/[slug]. Documents are seeded from
// scripts/bug-book-import/bug-book-data.json (the single source of truth
// for launch content); Studio edits are possible but reruns of the import
// script overwrite them (createOrReplace on `bugBook-<slug>`).

export const BUG_BOOK_CATEGORIES = [
  "UI/UX",
  "Copy",
  "Content",
  "Links",
  "Mobile",
  "Interactions",
  "Checkout",
  "Pricing",
  "Performance",
  "Feature Request",
  "Security",
] as const;

export const BUG_BOOK_SEVERITIES = [
  "Critical",
  "High",
  "Medium",
  "Mild",
] as const;

export const bugBookThreadComment = defineType({
  name: "bugBookThreadComment",
  title: "Thread Comment",
  type: "object",
  fields: [
    defineField({
      name: "speaker",
      title: "Speaker",
      type: "string",
      description: "Anonymized speaker label, e.g. 'Reviewer', 'Designer'.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
      description:
        "Verbatim sanitized comment. Pre-censored profanity (F*CKING) stays as-is.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "attachment",
      title: "Attachment",
      type: "string",
      description:
        "Redacted attachment kind — rendered as a chip, never actual media.",
      options: {
        list: [
          { title: "Screenshot", value: "screenshot" },
          { title: "Screen recording", value: "screen recording" },
        ],
      },
    }),
  ],
  preview: {
    select: { title: "speaker", subtitle: "text" },
  },
});

export const bugBookFinding = defineType({
  name: "bugBookFinding",
  title: "Agent Finding",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "suggestion",
      title: "Suggested Fix",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "issueType", title: "Issue Type", type: "string" }),
    defineField({
      name: "confidence",
      title: "Confidence (%)",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
    }),
  ],
});

export const bugBookSite = defineType({
  name: "bugBookSite",
  title: "Site",
  type: "object",
  fields: [
    defineField({
      name: "descriptor",
      title: "Descriptor",
      type: "string",
      description: "Anonymized site description, e.g. 'Med-spa staging site'.",
    }),
    defineField({ name: "platform", title: "Platform", type: "string" }),
    defineField({ name: "industry", title: "Industry", type: "string" }),
  ],
});

export const bugBookCaptured = defineType({
  name: "bugBookCaptured",
  title: "Captured Metadata",
  type: "object",
  description: "Real metadata Superflow auto-captured with the comment.",
  fields: [
    defineField({ name: "browser", title: "Browser", type: "string" }),
    defineField({ name: "os", title: "OS", type: "string" }),
    defineField({ name: "device", title: "Device", type: "string" }),
  ],
});

export const bugBookEntry = defineType({
  name: "bugBookEntry",
  title: "Bug Book Entry",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "Card + detail hero title. Edited for voice — don't paraphrase.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "headline", maxLength: 96 },
      description: "Final — referenced in the review sheet; don't rename.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      description:
        "'page' entries render on /bug-book; 'bench' entries are approved spares kept out of the page.",
      options: {
        list: [
          { title: "Page (live)", value: "page" },
          { title: "Bench (spare)", value: "bench" },
        ],
        layout: "radio",
      },
      initialValue: "page",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [
          { title: "Human review", value: "human" },
          { title: "Superflow Agent", value: "agent" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sourceLabel",
      title: "Source Label",
      type: "string",
      description: "Display text: 'Caught in review' / 'Caught by Superflow Agent'.",
    }),
    defineField({
      name: "agentName",
      title: "Agent Name",
      type: "string",
      description: "Agent entries only, e.g. 'Spell Check Agent'.",
      hidden: ({ parent }) => parent?.source !== "agent",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: BUG_BOOK_CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "severity",
      title: "Severity",
      type: "string",
      options: { list: BUG_BOOK_SEVERITIES.map((s) => ({ title: s, value: s })) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rageLevel",
      title: "Rage Level (0–10)",
      type: "number",
      description: "0–2 Calm, 3–5 Annoyed, 6–8 Heated, 9–10 Volcanic.",
      validation: (rule) => rule.required().min(0).max(10),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Resolved", value: "Resolved" },
          { title: "In progress", value: "In progress" },
          { title: "Open", value: "Open" },
        ],
      },
    }),
    defineField({
      name: "date",
      title: "Date (YYYY-MM)",
      type: "string",
      description: "Month the thread happened, e.g. '2024-08'.",
      validation: (rule) =>
        rule.regex(/^\d{4}-\d{2}$/, { name: "YYYY-MM" }).required(),
    }),
    defineField({ name: "site", title: "Site", type: "bugBookSite" }),
    defineField({
      name: "captured",
      title: "Captured Metadata",
      type: "bugBookCaptured",
      description: "Null on agent entries.",
    }),
    defineField({
      name: "hook",
      title: "Hook",
      type: "text",
      rows: 2,
      description: "One-liner card subtitle. Doubles as the meta description.",
    }),
    defineField({
      name: "thread",
      title: "Thread",
      type: "array",
      of: [{ type: "bugBookThreadComment" }],
      description: "The sanitized conversation, in order.",
    }),
    defineField({
      name: "finding",
      title: "Agent Finding",
      type: "bugBookFinding",
      description: "Agent entries only — structured report shown instead of a thread.",
      hidden: ({ parent }) => parent?.source !== "agent",
    }),
    defineField({
      name: "whyItMatters",
      title: "Why It Matters",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "outcome",
      title: "Outcome",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "flags",
      title: "Flags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Editorial metadata (own-site, demo-data, satire, …). Some flags affect rendering — see the bug book spec §8.",
    }),
    defineField({
      name: "curatedRank",
      title: "Curated Rank",
      type: "number",
      description:
        "Position in the default 'Curated' sort (source JSON array order).",
    }),
  ],
  orderings: [
    {
      title: "Curated order",
      name: "curatedRankAsc",
      by: [{ field: "curatedRank", direction: "asc" }],
    },
    {
      title: "Rage level, high first",
      name: "rageLevelDesc",
      by: [{ field: "rageLevel", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "headline",
      tier: "tier",
      source: "source",
      severity: "severity",
      category: "category",
    },
    prepare({ title, tier, source, severity, category }) {
      const marker = source === "agent" ? "✦" : "👤";
      const bench = tier === "bench" ? " · BENCH" : "";
      return {
        title,
        subtitle: `${marker} ${category} · ${severity}${bench}`,
      };
    },
  },
});
