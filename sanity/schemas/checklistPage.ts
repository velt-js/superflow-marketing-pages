import { defineType, defineField } from "sanity";

// Mirrors Superflow's Framer `Checklist` collection.
// Repeating Framer slots collapse into typed arrays:
//   checklist__1..12__t1..t10 → sections[].tips[]
//   suggested__1..3 → suggestedChecklists[]
// Body text in source CSV is HTML — imported as Portable Text.

export const checklistTip = defineType({
  name: "checklistTip",
  title: "Checklist Tip",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: { select: { title: "title" } },
});

export const checklistSection = defineType({
  name: "checklistSection",
  title: "Checklist Section",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "buttonText", title: "Button Text", type: "string" }),
    defineField({ name: "buttonAction", title: "Button Action (URL)", type: "url" }),
    defineField({
      name: "tips",
      title: "Tips",
      type: "array",
      of: [{ type: "checklistTip" }],
      validation: (r) => r.max(10),
    }),
  ],
  preview: { select: { title: "title" } },
});

export const checklistSuggested = defineType({
  name: "checklistSuggested",
  title: "Suggested Checklist",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({
      name: "bgColor",
      title: "Background Color",
      type: "string",
      description: "Hex code, e.g. #FFCD2E",
    }),
    defineField({
      name: "href",
      title: "Link (optional)",
      type: "string",
      description: "Internal slug or external URL. Falls back to slug match.",
    }),
  ],
  preview: { select: { title: "name", subtitle: "bgColor" } },
});

export const checklistHero = defineType({
  name: "checklistHero",
  title: "Checklist Hero",
  type: "object",
  fields: [
    defineField({ name: "docName", title: "Doc Name", type: "string" }),
    defineField({
      name: "primaryCtaText",
      title: "Primary CTA Text",
      type: "string",
    }),
    defineField({
      name: "primaryCtaLink",
      title: "Primary CTA Link",
      type: "url",
    }),
  ],
});

export const checklistMainSection = defineType({
  name: "checklistMainSection",
  title: "Main Image Section",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "subText", title: "Title", type: "string" }),
    defineField({ name: "caption", title: "Caption / Eyebrow", type: "string" }),
  ],
});

export const checklistEndNote = defineType({
  name: "checklistEndNote",
  title: "End Note",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});

export const checklistPage = defineType({
  name: "checklistPage",
  title: "Checklist Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "main", title: "Main Image" },
    { name: "whatHow", title: "What / How" },
    { name: "sections", title: "Sections" },
    { name: "endNote", title: "End Note" },
    { name: "suggested", title: "Suggested" },
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
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "identity",
    }),
    defineField({ name: "category", title: "Category", type: "string", group: "identity" }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      group: "identity",
      options: { hotspot: true },
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
      type: "checklistHero",
      group: "hero",
    }),
    defineField({
      name: "mainSection",
      title: "Main Image Section",
      type: "checklistMainSection",
      group: "main",
    }),
    defineField({
      name: "whatTitle",
      title: "What — Title",
      type: "string",
      group: "whatHow",
    }),
    defineField({
      name: "whatDescription",
      title: "What — Description",
      type: "text",
      rows: 4,
      group: "whatHow",
    }),
    defineField({
      name: "howTitle",
      title: "How — Title",
      type: "string",
      group: "whatHow",
    }),
    defineField({
      name: "howDescription",
      title: "How — Description",
      type: "text",
      rows: 4,
      group: "whatHow",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "sections",
      of: [{ type: "checklistSection" }],
      validation: (r) => r.max(12),
    }),
    defineField({
      name: "endNote",
      title: "End Note",
      type: "checklistEndNote",
      group: "endNote",
    }),
    defineField({
      name: "suggestedChecklists",
      title: "Suggested Checklists",
      type: "array",
      group: "suggested",
      of: [{ type: "checklistSuggested" }],
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
