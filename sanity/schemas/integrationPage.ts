import { defineType, defineField } from "sanity";

// Mirrors Superflow's Framer `Integrations` collection (NDPNuZqcB, 26 fields).
// Framer's repeating steps__1..6__title|text slots collapse into typed
// `integrationStep` array. Named sub-types only, no inline objects.

export const integrationBodyImage = defineType({
  name: "integrationBodyImage",
  title: "Body Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alt Text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});

export const integrationStep = defineType({
  name: "integrationStep",
  title: "Installation Step",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Step Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Step Body",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [{ type: "link" }],
          },
        },
        { type: "integrationBodyImage" },
      ],
    }),
  ],
  preview: { select: { title: "title" } },
});

export const integrationPage = defineType({
  name: "integrationPage",
  title: "Integration Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "authorName", title: "Author Name", type: "string" }),
    defineField({
      name: "publishedDateText",
      title: "Published Date Text",
      type: "string",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "appName", title: "App Name", type: "string" }),
    defineField({
      name: "appLogo",
      title: "App Logo",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({ name: "linkToApp", title: "Link to App", type: "url" }),
    defineField({
      name: "isTaskApp",
      title: "Is this a task app?",
      type: "boolean",
    }),
    defineField({
      name: "installationVideoLink",
      title: "Installation Video Link",
      type: "url",
    }),
    defineField({
      name: "installationVideoFile",
      title: "Installation Video File",
      type: "file",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [{ type: "link" }],
          },
        },
      ],
    }),
    defineField({
      name: "overview",
      title: "Overview",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [{ type: "link" }],
          },
        },
      ],
    }),
    defineField({
      name: "steps",
      title: "Installation Steps",
      description: "Mirrors Framer steps__1..6.",
      type: "array",
      of: [{ type: "integrationStep" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", media: "appLogo" },
  },
});
