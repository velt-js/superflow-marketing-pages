import { defineType, defineField } from "sanity";
import { SECTION_ARTIFACT_OPTIONS } from "../../lib/section-artifacts";

// Mirrors Superflow's Framer `User Persona` collection (tjxr7913u, 93 fields).
// job_one/two/three × feature_one/two/three slots collapse into `jobs[]`
// of `userPersonaJob` → `features[]` of `userPersonaJobFeature`.

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

export const userPersonaHero = defineType({
  name: "userPersonaHero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "heroCtaText", title: "Hero CTA Text", type: "string" }),
    defineField({ name: "trustLine", title: "Trust Line", type: "string" }),
  ],
});

export const userPersonaJobFeature = defineType({
  name: "userPersonaJobFeature",
  title: "Job Feature",
  type: "object",
  fields: [
    defineField({ name: "highlightTitle", title: "Highlight Title", type: "string" }),
    defineField({
      name: "highlightSubText",
      title: "Highlight Sub Text",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "highlightImage",
      title: "Highlight Image",
      type: "image",
      options: { hotspot: false },
    }),
    artifactField(),
    defineField({ name: "barrierText", title: "Barrier Text", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "highlightTitle", media: "highlightImage" } },
});

export const userPersonaJob = defineType({
  name: "userPersonaJob",
  title: "Job",
  type: "object",
  fields: [
    defineField({ name: "title1", title: "Title Line 1", type: "string" }),
    defineField({ name: "title2", title: "Title Line 2", type: "string" }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "userPersonaJobFeature" }],
      validation: (r) => r.max(3),
    }),
  ],
  preview: { select: { title: "title1", subtitle: "title2" } },
});

export const userPersonaFaqItem = defineType({
  name: "userPersonaFaqItem",
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

export const userPersonaTestimonial = defineType({
  name: "userPersonaTestimonial",
  title: "Testimonial",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "title", title: "Quote Title", type: "string" }),
    defineField({ name: "subCopy", title: "Sub Copy", type: "text", rows: 4 }),
  ],
  preview: { select: { title: "name", subtitle: "company", media: "image" } },
});

export const userPersonaFeatureItem = defineType({
  name: "userPersonaFeatureItem",
  title: "Feature Item",
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
    artifactField(),
  ],
  preview: { select: { title: "title", subtitle: "subText", media: "image" } },
});

export const userPersonaFinalCta = defineType({
  name: "userPersonaFinalCta",
  title: "Final CTA",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subText", title: "Sub Text", type: "text", rows: 2 }),
  ],
});

export const userPersonaPage = defineType({
  name: "userPersonaPage",
  title: "User Persona Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "jobs", title: "Jobs" },
    { name: "solution", title: "Solution" },
    { name: "features", title: "Features" },
    { name: "others", title: "Others" },
    { name: "social", title: "Testimonials" },
    { name: "faq", title: "FAQ" },
    { name: "cta", title: "Final CTA" },
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
      type: "userPersonaHero",
      group: "hero",
    }),
    defineField({
      name: "jobs",
      title: "Jobs",
      description: "Framer had job_one/two/three (jobs 2/3 marked ❌ deprecated).",
      type: "array",
      group: "jobs",
      of: [{ type: "userPersonaJob" }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "solutionTitle1",
      title: "Solution Title Line 1",
      type: "string",
      group: "solution",
    }),
    defineField({
      name: "solutionTitle2",
      title: "Solution Title Line 2",
      type: "string",
      group: "solution",
    }),
    defineField({
      name: "featureText1",
      title: "Feature Text 1",
      type: "string",
      group: "solution",
    }),
    defineField({
      name: "featureText2",
      title: "Feature Text 2",
      type: "string",
      group: "solution",
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      group: "features",
      of: [{ type: "userPersonaFeatureItem" }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "othersTitle1",
      title: "Others Title Line 1",
      type: "string",
      group: "others",
    }),
    defineField({
      name: "othersTitle2",
      title: "Others Title Line 2",
      type: "string",
      group: "others",
    }),
    defineField({
      name: "outcomeOneLiner",
      title: "Outcome One-Liner",
      type: "string",
      group: "others",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      group: "social",
      of: [{ type: "userPersonaTestimonial" }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      group: "faq",
      of: [{ type: "userPersonaFaqItem" }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "finalCta",
      title: "Final CTA",
      type: "userPersonaFinalCta",
      group: "cta",
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
    select: { title: "title", subtitle: "hero.role", media: "thumbnail" },
  },
});
