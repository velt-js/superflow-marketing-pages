import type { StructureResolver } from "sanity/structure";

// Custom desk structure. Pins dedicated "Feature Pages" and "Solution Pages"
// entries (the 2026 templates) at the top, then falls back to the default
// document-type list for every other schema type, so nothing that used to
// appear in the flat list disappears.

const FEATURE_PAGE_TYPE = "featurePage";
const SOLUTION_PAGE_TYPE = "solutionPage";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Feature Pages")
        .child(S.documentTypeList(FEATURE_PAGE_TYPE).title("Feature Pages")),
      S.listItem()
        .title("Solution Pages")
        .child(S.documentTypeList(SOLUTION_PAGE_TYPE).title("Solution Pages")),
      S.divider(),
      // Every other registered document type, exactly as the default
      // structure would render it (featurePage removed to avoid a duplicate).
      ...S.documentTypeListItems().filter(
        (listItem) =>
          listItem.getId() !== FEATURE_PAGE_TYPE &&
          listItem.getId() !== SOLUTION_PAGE_TYPE,
      ),
    ]);
