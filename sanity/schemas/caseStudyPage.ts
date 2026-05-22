import { defineType, defineField } from "sanity";

// Mirrors Superflow's Framer `Case Study` collection (RGcxtV9_7, 67 fields).
// Repeating slots (problem__1..3, solution__1..3, results__1..3, FAQ__1..6)
// collapse into typed arrays. Named sub-types only.

export const caseStudyHero = defineType({
  name: "caseStudyHero",
  title: "Case Study Hero",
  type: "object",
  fields: [
    defineField({ name: "industry", title: "Industry", type: "string" }),
    defineField({ name: "teams", title: "Teams", type: "string" }),
    defineField({ name: "teamSize", title: "Team Size", type: "string" }),
  ],
});

export const caseStudyOverview = defineType({
  name: "caseStudyOverview",
  title: "Overview",
  type: "object",
  fields: [
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "problem", title: "Problem", type: "text", rows: 3 }),
    defineField({ name: "solution", title: "Solution", type: "text", rows: 3 }),
  ],
});

export const caseStudyProblemItem = defineType({
  name: "caseStudyProblemItem",
  title: "Problem Item",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "text", media: "image" } },
});

export const caseStudyProblemSection = defineType({
  name: "caseStudyProblemSection",
  title: "Problem Section",
  type: "object",
  fields: [
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "caseStudyProblemItem" }],
      validation: (r) => r.max(3),
    }),
  ],
});

export const caseStudySolutionItem = defineType({
  name: "caseStudySolutionItem",
  title: "Solution Item",
  type: "object",
  fields: [
    defineField({ name: "tag", title: "Tag", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subText", title: "Sub Text", type: "text", rows: 3 }),
    defineField({ name: "video", title: "Video", type: "file" }),
  ],
  preview: { select: { title: "title", subtitle: "tag" } },
});

export const caseStudySolutionSection = defineType({
  name: "caseStudySolutionSection",
  title: "Solution Section",
  type: "object",
  fields: [
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "caseStudySolutionItem" }],
      validation: (r) => r.max(3),
    }),
  ],
});

export const caseStudyResultItem = defineType({
  name: "caseStudyResultItem",
  title: "Result Item",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Value", type: "string" }),
    defineField({ name: "text", title: "Text", type: "string" }),
  ],
  preview: { select: { title: "value", subtitle: "text" } },
});

export const caseStudyResultsSection = defineType({
  name: "caseStudyResultsSection",
  title: "Results Section",
  type: "object",
  fields: [
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "caseStudyResultItem" }],
      validation: (r) => r.max(3),
    }),
  ],
});

export const caseStudyTestimonial = defineType({
  name: "caseStudyTestimonial",
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
    defineField({ name: "subText", title: "Sub Text", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "name", subtitle: "company", media: "profileImage" },
  },
});

export const caseStudyFaqItem = defineType({
  name: "caseStudyFaqItem",
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

export const caseStudyPage = defineType({
  name: "caseStudyPage",
  title: "Case Study Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "overview", title: "Overview" },
    { name: "problem", title: "Problem" },
    { name: "solution", title: "Solution" },
    { name: "results", title: "Results" },
    { name: "social", title: "Testimonial" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "identity",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "identity",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      group: "identity",
      options: { hotspot: true },
    }),
    defineField({
      name: "logo",
      title: "Customer Logo",
      type: "image",
      group: "identity",
      options: { hotspot: false },
    }),
    defineField({
      name: "publishedDateText",
      title: "Published Date Text",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "caseStudyHero",
      group: "hero",
    }),
    defineField({
      name: "overview",
      title: "Overview",
      type: "caseStudyOverview",
      group: "overview",
    }),
    defineField({
      name: "problemSection",
      title: "Problem Section",
      type: "caseStudyProblemSection",
      group: "problem",
    }),
    defineField({
      name: "solutionSection",
      title: "Solution Section",
      type: "caseStudySolutionSection",
      group: "solution",
    }),
    defineField({
      name: "resultsSection",
      title: "Results Section",
      type: "caseStudyResultsSection",
      group: "results",
    }),
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "caseStudyTestimonial",
      group: "social",
    }),
    defineField({
      name: "showFaq",
      title: "Show FAQ?",
      type: "boolean",
      group: "faq",
      initialValue: true,
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      group: "faq",
      of: [{ type: "caseStudyFaqItem" }],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Title, A–Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "logo" },
  },
});
