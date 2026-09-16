import type { StructureResolver } from "sanity/structure";

// Custom desk structure. Pins the two entries an editor reaches for most —
// the 2026 /preview/features/<slug> template and the agency directory's
// listing overrides — at the top, then falls back to the default
// document-type list for every other schema type, so nothing that used to
// appear in the flat list disappears.

const FEATURE_PAGE_TYPE = "featurePage";
const AGENCY_LISTING_TYPE = "agencyListing";

/** Types with their own pinned entry above the divider. Listed once so the
 *  filter below cannot drift from the items above it and print a type
 *  twice. */
const PINNED_TYPES = [FEATURE_PAGE_TYPE, AGENCY_LISTING_TYPE];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Feature Pages")
        .child(S.documentTypeList(FEATURE_PAGE_TYPE).title("Feature Pages")),
      // Corrections layered over the scraped agency directory. Sorted by
      // slug rather than by creation date: an editor arrives here holding
      // one agency's name, not a sense of when its listing was made.
      S.listItem()
        .title("Agency Listings")
        .child(
          S.documentTypeList(AGENCY_LISTING_TYPE)
            .title("Agency Listings")
            .defaultOrdering([{ field: "agencySlug", direction: "asc" }]),
        ),
      S.divider(),
      // Every other registered document type, exactly as the default
      // structure would render it (pinned types removed to avoid
      // duplicates).
      ...S.documentTypeListItems().filter(
        (listItem) => !PINNED_TYPES.includes(listItem.getId() ?? ""),
      ),
    ]);
