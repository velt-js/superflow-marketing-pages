import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { codeInput } from "@sanity/code-input";
import { table } from "@sanity/table";
import { schemaTypes } from "./sanity/schemas";
import { projectId, dataset } from "./sanity/env";

export default defineConfig({
  name: "superflow-marketing",
  title: "Superflow Marketing",
  projectId,
  dataset,
  basePath: "/studio",
  // codeInput powers `{ type: "code" }` in blogPost.body (used for
  // syntax-highlighted snippets). table powers `{ type: "table" }` in
  // blogPost.body for tabular content MainTouch will push. Both must
  // be registered here for the Studio + GraphQL deploy to validate.
  plugins: [structureTool(), visionTool(), codeInput(), table()],
  schema: {
    types: schemaTypes,
  },
});
