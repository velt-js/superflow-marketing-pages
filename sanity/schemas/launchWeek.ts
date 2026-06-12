import { defineType, defineField, defineArrayMember } from "sanity";

export const launchWeekFeature = defineType({
  name: "launchWeekFeature",
  title: "Launch Week Feature",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Launch date",
      description: "Day this feature ships — drives the weekday chip and timeline date.",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "blog",
      title: "Blog post",
      description:
        "Linked post for the Read More button — the button enables once the feature's launch day arrives AND the post is published.",
      type: "reference",
      to: [{ type: "blogPost" }],
      // Weak so a launch week can publish while its post is still a draft;
      // the site resolves the slug as null until the post is published.
      weak: true,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "date" },
  },
});

export const launchWeek = defineType({
  name: "launchWeek",
  title: "Launch Week",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'E.g. "Launch Week 01"',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: 'Two digits, e.g. "01" → /launch-week/01',
      type: "slug",
      options: { source: "title" },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.current) return "Required";
          return /^\d{2}$/.test(value.current)
            ? true
            : 'Use exactly two digits, e.g. "01"';
        }),
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const startDate = (context.document as { startDate?: string } | undefined)
            ?.startDate;
          if (!value || !startDate) return true;
          return value >= startDate ? true : "End date must be on or after the start date";
        }),
    }),
    defineField({
      name: "subtitle",
      title: "Hero subtitle",
      type: "string",
      initialValue: "Experience the latest from Superflow",
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [defineArrayMember({ type: "launchWeekFeature" })],
      validation: (rule) => rule.max(3),
    }),
  ],
  orderings: [
    {
      title: "Start date",
      name: "startDateAsc",
      by: [{ field: "startDate", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", startDate: "startDate", endDate: "endDate" },
    prepare({ title, startDate, endDate }) {
      return { title, subtitle: `${startDate ?? "?"} – ${endDate ?? "?"}` };
    },
  },
});
