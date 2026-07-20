import { defineType, defineField } from "sanity";
import { SECTION_ARTIFACT_OPTIONS } from "../../lib/section-artifacts";

// Mirrors Superflow's Framer `Use Case` collection (IQjSkiXoj, 63 fields).
// Repeating Framer slots (problem__1..3, solution__1..3, testimonial__1..3,
// FAQ__1..3) collapse into typed arrays of named sub-types.

/**
 * Optional per-item artifact picker (additive — existing documents are
 * untouched and render exactly as before when the field is empty). The 2026
 * templates prefer this hand-built product artifact over the raw image;
 * leaving it empty lets the code auto-pick one from the item's copy, and
 * "None" pins the item to its image.
 */
const artifactField = () =>
  defineField({
    name: "artifact",
    title: "Artifact (instead of image)",
    description:
      "Hand-built product animation to render in place of the image on the new template. Empty = auto-pick from the copy; None = always show the image.",
    type: "string",
    options: { list: [...SECTION_ARTIFACT_OPTIONS] },
  });

export const useCaseHero = defineType({
  name: "useCaseHero",
  title: "Use Case Hero",
  type: "object",
  fields: [
    defineField({ name: "action", title: "Action", type: "string" }),
    defineField({ name: "useCase", title: "Use Case", type: "string" }),
    defineField({ name: "heroCtaText", title: "Hero CTA Text", type: "string" }),
    defineField({ name: "role1", title: "Role 1", type: "string" }),
    defineField({ name: "role2", title: "Role 2", type: "string" }),
    defineField({ name: "role3", title: "Role 3", type: "string" }),
    defineField({
      name: "personaDesktopFont",
      title: "Persona Desktop Font",
      type: "number",
    }),
    defineField({
      name: "personaMobileFont",
      title: "Persona Mobile Font",
      type: "number",
    }),
  ],
});

export const useCaseProblemItem = defineType({
  name: "useCaseProblemItem",
  title: "Problem Item",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    artifactField(),
  ],
  preview: { select: { title: "title", media: "image" } },
});

export const useCaseProblemSection = defineType({
  name: "useCaseProblemSection",
  title: "Problem Section",
  type: "object",
  fields: [
    defineField({ name: "title1", title: "Title Line 1", type: "string" }),
    defineField({ name: "title2", title: "Title Line 2", type: "string" }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "useCaseProblemItem" }],
      validation: (r) => r.max(3),
    }),
  ],
});

export const useCaseSolutionItem = defineType({
  name: "useCaseSolutionItem",
  title: "Solution Item",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subCopy", title: "Sub Copy", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    artifactField(),
  ],
  preview: { select: { title: "title", subtitle: "subCopy", media: "image" } },
});

export const useCaseSolutionSection = defineType({
  name: "useCaseSolutionSection",
  title: "Solution Section",
  type: "object",
  fields: [
    defineField({ name: "title1", title: "Title Line 1", type: "string" }),
    defineField({ name: "title2", title: "Title Line 2", type: "string" }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "useCaseSolutionItem" }],
      validation: (r) => r.max(3),
    }),
  ],
});

export const useCaseFaqItem = defineType({
  name: "useCaseFaqItem",
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

export const useCaseTestimonial = defineType({
  name: "useCaseTestimonial",
  title: "Testimonial",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "title", title: "Quote Title", type: "string" }),
    defineField({ name: "subCopy", title: "Sub Copy", type: "text", rows: 4 }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: { select: { title: "name", subtitle: "company", media: "image" } },
});

export const useCasePage = defineType({
  name: "useCasePage",
  title: "Use Case Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "problem", title: "Problem" },
    { name: "solution", title: "Solution" },
    { name: "features", title: "Features" },
    { name: "social", title: "Testimonials" },
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
      name: "icon",
      title: "Icon",
      type: "image",
      group: "identity",
      options: { hotspot: false },
    }),
    defineField({
      name: "hidden",
      title: "Hidden",
      type: "boolean",
      group: "identity",
      initialValue: false,
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "useCaseHero",
      group: "hero",
    }),
    defineField({
      name: "explanationTitle",
      title: "Explanation Title",
      type: "string",
      group: "problem",
    }),
    defineField({
      name: "problemSection",
      title: "Problem Section",
      type: "useCaseProblemSection",
      group: "problem",
    }),
    defineField({
      name: "solutionSection",
      title: "Solution Section",
      type: "useCaseSolutionSection",
      group: "solution",
    }),
    defineField({
      name: "featureText1",
      title: "Feature Text 1",
      type: "string",
      group: "features",
    }),
    defineField({
      name: "featureText2",
      title: "Feature Text 2",
      type: "string",
      group: "features",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      group: "social",
      of: [{ type: "useCaseTestimonial" }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "footerCtaTitle",
      title: "Footer CTA Title",
      type: "string",
      group: "features",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      group: "faq",
      of: [{ type: "useCaseFaqItem" }],
      validation: (r) => r.max(3),
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
    defineField({
      name: "noIndex",
      title: "No Index",
      type: "string",
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
    select: { title: "title", subtitle: "description", media: "thumbnail" },
  },
});
