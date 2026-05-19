import { defineType, defineField } from "sanity";

export const placeholder = defineType({
  name: "placeholder",
  title: "Placeholder",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
  ],
});
