import { defineType, defineField } from "sanity";

// Shared sub-types used by both `alternativePage` and `comparisonPage`.
// Framer's `Alternative` (BC2MBDsah) and `Comparisons` (MPwe64sbM) collections
// are near-identical: 7 criteria, 5 pricing rows, Layout 2 highlights / case
// study / testimonial. Differences are absorbed as optional fields.

export const comparisonTag = defineType({
  name: "comparisonTag",
  title: "Tag",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({
      name: "color",
      title: "Color",
      description: "Framer enum value (free-form string here).",
      type: "string",
    }),
  ],
});

export const comparisonCompetitorBlock = defineType({
  name: "comparisonCompetitorBlock",
  title: "Competitor Scoring Block",
  type: "object",
  fields: [
    defineField({ name: "score", title: "Score", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "video", title: "Video", type: "file" }),
    defineField({ name: "youtubeUrl", title: "YouTube URL", type: "url" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "comparisonTag" }],
      validation: (r) => r.max(3),
    }),
  ],
  preview: { select: { title: "title", subtitle: "score" } },
});

export const comparisonCriterion = defineType({
  name: "comparisonCriterion",
  title: "Criterion",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "winnerC1",
      title: "Winner: Competitor 1?",
      type: "boolean",
    }),
    defineField({
      name: "result",
      title: "Result",
      description: "Comparisons-only enum (free-form string).",
      type: "string",
    }),
    defineField({
      name: "competitor1",
      title: "Competitor 1",
      type: "comparisonCompetitorBlock",
    }),
    defineField({
      name: "competitor2",
      title: "Competitor 2",
      type: "comparisonCompetitorBlock",
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const comparisonPricingRow = defineType({
  name: "comparisonPricingRow",
  title: "Pricing Row",
  type: "object",
  fields: [
    defineField({ name: "c1Name", title: "C1 Plan Name", type: "string" }),
    defineField({ name: "c1Price", title: "C1 Price", type: "string" }),
    defineField({ name: "c1Users", title: "C1 Users", type: "string" }),
    defineField({ name: "c2Name", title: "C2 Plan Name", type: "string" }),
    defineField({ name: "c2Price", title: "C2 Price", type: "string" }),
    defineField({ name: "c2Users", title: "C2 Users", type: "string" }),
  ],
  preview: { select: { title: "c1Name", subtitle: "c2Name" } },
});

export const comparisonChoice = defineType({
  name: "comparisonChoice",
  title: "Choice (Layout 2)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subText", title: "Sub Text", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "videoLink", title: "Video Link", type: "url" }),
    defineField({ name: "videoFile", title: "Video File", type: "file" }),
  ],
  preview: { select: { title: "title", subtitle: "subText", media: "image" } },
});

export const comparisonFeatureRow = defineType({
  name: "comparisonFeatureRow",
  title: "Feature Row (Layout 2)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "c1Text", title: "C1 Text", type: "string" }),
    defineField({ name: "c2Text", title: "C2 Text", type: "string" }),
  ],
  preview: { select: { title: "title", subtitle: "c1Text" } },
});

export const comparisonHighlight = defineType({
  name: "comparisonHighlight",
  title: "Highlight (Layout 2)",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subText", title: "Sub Text", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "videoLink", title: "Video Link", type: "url" }),
    defineField({ name: "videoFile", title: "Video File", type: "file" }),
  ],
  preview: { select: { title: "title", subtitle: "subText", media: "image" } },
});

export const comparisonTestimonial = defineType({
  name: "comparisonTestimonial",
  title: "Testimonial",
  type: "object",
  fields: [
    defineField({
      name: "profileImage",
      title: "Profile Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "title", title: "Quote Title", type: "string" }),
    defineField({ name: "subCopy", title: "Sub Copy", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "name", subtitle: "company", media: "profileImage" },
  },
});

export const comparisonCaseStudy = defineType({
  name: "comparisonCaseStudy",
  title: "Case Study Reference",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "challenges",
      title: "Challenges",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "link", title: "Link", type: "url" }),
  ],
});

export const comparisonFaqItem = defineType({
  name: "comparisonFaqItem",
  title: "FAQ Item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
  ],
  preview: { select: { title: "question" } },
});

// ---- Comp v/s Comp (rich /comparisons layout) -----------------------------

export const comparisonNamedCriterion = defineType({
  name: "comparisonNamedCriterion",
  title: "Named Criterion",
  type: "object",
  fields: [
    defineField({
      name: "key",
      title: "Key",
      description:
        "Framer criterion name (pure_comments, viewing_modes, integrations, …). Drives heading lookup.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "c1Image",
      title: "C1 Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "c1ImageAlt", title: "C1 Image Alt", type: "string" }),
    defineField({
      name: "c1Video",
      title: "C1 Video URL",
      description: "YouTube embed URL or other iframe-able media.",
      type: "url",
      validation: (r) => r.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "c2Image",
      title: "C2 Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "c2ImageAlt", title: "C2 Image Alt", type: "string" }),
    defineField({
      name: "c2Video",
      title: "C2 Video URL",
      type: "url",
      validation: (r) => r.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
  ],
  preview: { select: { title: "key", subtitle: "summary" } },
});

export const comparisonPricingTier = defineType({
  name: "comparisonPricingTier",
  title: "Pricing Tier",
  type: "object",
  fields: [
    defineField({ name: "c1Price", title: "C1 Price", type: "string" }),
    defineField({ name: "c1Seats", title: "C1 Seats / Plan", type: "string" }),
    defineField({ name: "c2Price", title: "C2 Price", type: "string" }),
    defineField({ name: "c2Seats", title: "C2 Seats / Plan", type: "string" }),
  ],
  preview: { select: { title: "c1Price", subtitle: "c2Price" } },
});

export const comparisonTableRow = defineType({
  name: "comparisonTableRow",
  title: "Feature Table Row",
  type: "object",
  fields: [
    defineField({
      name: "rowKey",
      title: "Row Key",
      description: "Numeric key from the Framer CSV (e.g. '1', '2'). Joined with group key to look up the label.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "c1Available", title: "C1 Available", type: "boolean" }),
    defineField({ name: "c1Text", title: "C1 Text (override)", type: "string" }),
    defineField({ name: "c2Available", title: "C2 Available", type: "boolean" }),
    defineField({ name: "c2Text", title: "C2 Text (override)", type: "string" }),
  ],
  preview: { select: { title: "rowKey" } },
});

export const comparisonFeatureGroup = defineType({
  name: "comparisonFeatureGroup",
  title: "Feature Group",
  type: "object",
  fields: [
    defineField({
      name: "key",
      title: "Group Key",
      description: "A, B, C, D, or E. Joined with row keys to look up labels.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [{ type: "comparisonTableRow" }],
    }),
  ],
  preview: { select: { title: "key" } },
});

export const comparisonHighlightBlock = defineType({
  name: "comparisonHighlightBlock",
  title: "Highlight Block",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subText", title: "Sub Text", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "imageAlt", title: "Image Alt", type: "string" }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      validation: (r) => r.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
  ],
  preview: { select: { title: "title", subtitle: "subText", media: "image" } },
});

export const comparisonReview = defineType({
  name: "comparisonReview",
  title: "Review",
  type: "object",
  fields: [
    defineField({
      name: "side",
      title: "Side",
      type: "string",
      options: {
        list: [
          { title: "Competitor 1", value: "c1" },
          { title: "Competitor 2", value: "c2" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "imageAlt", title: "Image Alt", type: "string" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "rating", title: "Rating", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "content", title: "Content", type: "text", rows: 4 }),
  ],
  preview: { select: { title: "name", subtitle: "title", media: "image" } },
});
