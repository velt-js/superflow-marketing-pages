import type { StructureResolver } from "sanity/structure";

// Custom desk structure. Pins a dedicated "Feature Pages" entry (the new
// 2026 /preview/features/<slug> template) at the top, then falls back to the
// default document-type list for every other schema type — so nothing that
// used to appear in the flat list disappears.

const FEATURE_PAGE_TYPE = "featurePage";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Feature Pages")
        .child(S.documentTypeList(FEATURE_PAGE_TYPE).title("Feature Pages")),
      S.divider(),
      // Every other registered document type, exactly as the default
      // structure would render it (featurePage removed to avoid a duplicate).
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== FEATURE_PAGE_TYPE,
      ),
    ]);
