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

