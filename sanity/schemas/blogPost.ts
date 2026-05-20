import { defineType, defineField } from "sanity";

export const blogBodyImage = defineType({
  name: "blogBodyImage",
  title: "Body Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alt Text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 200 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Guide", value: "guide" },
          { title: "Comparison", value: "comparison" },
          { title: "Tutorial", value: "tutorial" },
          { title: "Case Study", value: "case-study" },
          { title: "Product Update", value: "product-update" },
          { title: "Thought Leadership", value: "thought-leadership" },
        ],
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [{ type: "link" }],
          },
        },
        { type: "blogBodyImage" },
        { type: "image", options: { hotspot: true } },
        { type: "code" },
        { type: "table" },
      ],
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image" }),
    defineField({
      name: "faqSchema",
      title: "FAQ JSON-LD",
      description:
        "Raw JSON-LD for the FAQ schema, injected as <script type=\"application/ld+json\"> on the rendered page.",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "blogPostingSchema",
      title: "BlogPosting JSON-LD",
      description:
        "Raw JSON-LD for the BlogPosting/Article schema, injected as <script type=\"application/ld+json\"> on the rendered page.",
      type: "text",
      rows: 12,
    }),
  ],
  orderings: [
    {
      title: "Published Date, New",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "featuredImage",
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `by ${author}` : "",
        media,
      };
    },
  },
});
