import { defineType, defineField } from "sanity";

// Inline body link annotation. Type's `name` MUST be "link" to match
// `_type: "link"` produced by MainTouch's blog migrations + by the
// Portable Text editor's built-in link button. Export name
// `linkAnnotation` keeps the module readable.
export const linkAnnotation = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),
  ],
});
