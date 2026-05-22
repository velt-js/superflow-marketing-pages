import { defineType, defineField } from "sanity";

// Mirrors Superflow's Framer `Comparisons` collection (MPwe64sbM, 241 fields).
// Near-identical to Alternative but with `noIndex`, no Layout 2 choices /
// feature rows. Uses shared comparison sub-types from
// sanity/schemas/shared/comparison.ts.

export const comparisonPage = defineType({
  name: "comparisonPage",
  title: "Comparison Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "competitors", title: "Competitors" },
    { name: "criteria", title: "Criteria" },
    { name: "pricing", title: "Pricing" },
    { name: "overview", title: "Overview" },
    { name: "social", title: "Testimonials" },
    { name: "faq", title: "FAQ" },
    { name: "layout2", title: "Layout 2" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Identity
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
      name: "hidden",
      title: "Hidden",
      type: "boolean",
      group: "identity",
      initialValue: false,
    }),
    defineField({ name: "author", title: "Author", type: "string", group: "identity" }),
    defineField({
      name: "publishedDate",
      title: "Published Date",
      type: "date",
      group: "identity",
    }),
    defineField({
      name: "publishedDateText",
      title: "Published Date Text",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "enableLayout2",
      title: "Enable Layout 2",
      type: "boolean",
      group: "identity",
      initialValue: false,
    }),

    // Competitors
    defineField({
      name: "competitor1Name",
      title: "Competitor 1 Name",
      type: "string",
      group: "competitors",
    }),
    defineField({
      name: "competitor1Logo",
      title: "Competitor 1 Logo",
      type: "image",
      group: "competitors",
      options: { hotspot: false },
    }),
    defineField({
      name: "competitor2Name",
      title: "Competitor 2 Name",
      type: "string",
      group: "competitors",
    }),
    defineField({
      name: "competitor2Logo",
      title: "Competitor 2 Logo",
      type: "image",
      group: "competitors",
      options: { hotspot: false },
    }),

    // Criteria
    defineField({
      name: "criteria",
      title: "Criteria",
      type: "array",
      group: "criteria",
      of: [{ type: "comparisonCriterion" }],
      validation: (r) => r.max(7),
    }),

    // Pricing
    defineField({
      name: "pricing",
      title: "Pricing Rows",
      type: "array",
      group: "pricing",
      of: [{ type: "comparisonPricingRow" }],
      validation: (r) => r.max(5),
    }),

    // Overview / Summary
    defineField({
      name: "overview",
      title: "Overview",
      type: "text",
      rows: 3,
      group: "overview",
    }),
    defineField({
      name: "summaryPointers",
      title: "Summary Pointers",
      type: "array",
      of: [{ type: "block" }],
      group: "overview",
    }),

    // Testimonial
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "comparisonTestimonial",
      group: "social",
    }),

    // FAQ
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      group: "faq",
      of: [{ type: "comparisonFaqItem" }],
      validation: (r) => r.max(6),
    }),

    // Layout 2
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      group: "layout2",
      of: [{ type: "comparisonHighlight" }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "caseStudy",
      title: "Case Study Reference",
      type: "comparisonCaseStudy",
      group: "layout2",
    }),

    // SEO
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
    select: {
      title: "title",
      subtitle: "competitor2Name",
      media: "thumbnail",
    },
  },
});
