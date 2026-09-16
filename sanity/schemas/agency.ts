import { defineType, defineField } from "sanity";

// Agencies — the directory's records, at /directory and
// /directory/agency/<slug>.
//
// THIS IS NOW THE SOURCE OF TRUTH, AND IT USED NOT TO BE. Until this type
// existed, every record lived in one of four JSON files written by the
// importers under scripts/directory-import/, and the only thing an editor
// could touch was an `agencyListing` correction layered over one at read
// time (see ./agencyListing.ts). That overlay existed for exactly one
// reason: each importer OVERWRITES its own file wholesale on every run, so
// anything typed into those files survived until the next scrape and no
// further.
//
// Sanity has no such problem, so the records live here and the importers
// feed them: `scripts/directory-import/sync-agencies-to-sanity.mjs` seeds a
// document the first time it sees an agency and leaves it alone after
// that, which means an editor's change is never overwritten by a re-scrape.
// The JSON files stay in the repo as the fallback the site renders if
// Sanity cannot be reached, and as the thing the scrapers keep writing.
//
// WHAT THAT CHANGES ABOUT PROVENANCE. Every figure the directory renders is
// printed beside the name of whoever published it - that is the promise
// these pages make, and it is why `source` and `profileUrl` are on this
// document rather than being ours to invent. Editing an award tally here
// does not make it a Superflow number; it makes it a number we are
// publishing under someone else's name. If a record has no source profile
// to point at, its `source` must be `editorial`, which prints "Listed by
// Superflow" and no attribution link (see AgencySource in
// lib/directory/types.ts).

/** Category slugs an agency can belong to. Mirrors DIRECTORY_CATEGORIES in
 *  lib/directory/constants.ts - a slug that is not in that registry renders
 *  nowhere, so this is a closed list rather than free text. */
const CATEGORY_OPTIONS = [
  { title: "Web Design", value: "web-design" },
  { title: "SEO", value: "seo" },
  { title: "Branding", value: "branding" },
  { title: "Motion Design", value: "motion-design" },
];

/** Sources a record can be attributed to. Mirrors `AgencySource` in
 *  lib/directory/types.ts, which `SOURCE_LABELS` in
 *  lib/directory/agencies.ts must have a label for. */
const SOURCE_OPTIONS = [
  { title: "Awwwards", value: "awwwards" },
  { title: "Semrush Agency Partners", value: "semrush" },
  { title: "Clutch", value: "clutch" },
  { title: "DesignRush", value: "designrush" },
  { title: "D&AD", value: "dandad" },
  { title: "Motion Design Awards", value: "motion-design-awards" },
  { title: "Listed by Superflow (no source directory)", value: "editorial" },
];

/**
 * Rejects a slug another agency already claims.
 *
 * The slug is the record's identity: it is its URL, the key the importers
 * seed against, and the key the partner badge and the client-side filters
 * join on. Two documents claiming one slug means one of them is
 * unreachable at its own address, and which one is a coin toss decided by
 * fetch order.
 *
 * A document and its own draft share a slug by definition, so both ids for
 * the document being edited are excluded.
 *
 * @param slug - The value being validated.
 * @param context - Sanity's validation context, for the document id and a
 *                   client to query with.
 * @returns True when the slug is free, or an error message when it is not.
 */
async function slugIsUnclaimed(
  slug: string | undefined,
  context: {
    document?: { _id?: string };
    getClient: (options: { apiVersion: string }) => {
      fetch: (query: string, params: Record<string, unknown>) => Promise<number>;
    };
  },
): Promise<true | string> {
  try {
    if (!slug) return true;
    const id = context.document?._id ?? "";
    const publishedId = id.replace(/^drafts\./, "");
    const count = await context
      .getClient({ apiVersion: "2024-01-01" })
      .fetch(`count(*[_type == "agency" && slug == $slug && !(_id in $ids)])`, {
        slug,
        ids: [publishedId, `drafts.${publishedId}`],
      });
    return count > 0
      ? `Another agency already uses "${slug}". Slugs are the profile's URL, so two records cannot share one.`
      : true;
  } catch {
    // A validation rule that cannot reach the dataset must not block an
    // editor from saving real work.
    return true;
  }
}

/** Award tallies, as published by the source. Counts only - a source that
 *  does not run a given award writes 0, so the read path can sort without
 *  null-guarding every field. */
export const agencyAwards = defineType({
  name: "agencyAwards",
  title: "Award tally",
  type: "object",
  description:
    "Awwwards' scheme, and only Awwwards'. A jury that runs different awards (D&AD Pencils, Video of the Day) records each win under Award wins instead - calling one of those a Site of the Day would be a claim about a jury that never made it.",
  options: { columns: 2 },
  fields: [
    defineField({ name: "siteOfTheDay", title: "Site of the Day", type: "number" }),
    defineField({ name: "siteOfTheMonth", title: "Site of the Month", type: "number" }),
    defineField({ name: "siteOfTheYear", title: "Site of the Year", type: "number" }),
    defineField({ name: "developerAward", title: "Developer Award", type: "number" }),
    defineField({ name: "honorableMentions", title: "Honorable Mentions", type: "number" }),
    defineField({ name: "nominees", title: "Nominees", type: "number" }),
  ],
});

/**
 * One client on an agency record.
 *
 * Deliberately not the `agencyListingClient` object the deprecated overlay
 * uses, even though four of the five fields match: this one carries
 * `notable`, which an importer sets from a normalisation pass over the
 * source's own ordering and which a hand-typed row cannot assert. Keeping
 * them apart is what lets that flag be importer-owned here and absent
 * there, rather than a checkbox whose meaning changes by document type.
 */
export const agencyClient = defineType({
  name: "agencyClient",
  title: "Client",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Client name",
      type: "string",
      description: "The brand as the agency writes it - this is what gets rendered.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectTitle",
      title: "Project title",
      type: "string",
      description:
        "The published piece of work this client is on record for. Leave blank when the source simply named the client - the page then shows the name alone rather than repeating it twice.",
    }),
    defineField({
      name: "projectUrl",
      title: "Project URL",
      type: "url",
      description:
        "Where that work can be seen, e.g. its Awwwards page. Attribution, not promotion - leave blank rather than linking the client's homepage.",
    }),
    defineField({
      name: "domain",
      title: "Client domain",
      type: "string",
      description:
        "Registrable domain of the client's own site, lowercased, no www. The dedupe key when two sources spell one brand differently.",
    }),
    defineField({
      name: "notable",
      title: "Recognisable brand",
      type: "boolean",
      readOnly: true,
      description:
        "Set by the importer's normalisation pass, not by hand. False means \"not asserted to be notable\", never \"asserted not to be\" - which is why a whole list of false is normal and simply keeps the source's own ordering.",
    }),
  ],
  preview: { select: { title: "name", subtitle: "projectTitle" } },
});

/** Aggregate review score, as published by the source directory. */
export const agencyRating = defineType({
  name: "agencyRating",
  title: "Client rating",
  type: "object",
  description:
    "The score the source profile displays, not a raw sub-aggregate - the page prints it next to a link to that profile, so publishing a number the profile does not show would contradict our own citation.",
  fields: [
    defineField({
      name: "value",
      title: "Score",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "scale",
      title: "Out of",
      type: "number",
      description: "Top of the scale, e.g. 5. Stored rather than assumed, so a 10-point source never renders as a near-perfect 5-point score.",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "reviewCount",
      title: "Reviews",
      type: "number",
      description:
        "How many reviews the score averages over. Weighted against the score when ranking, so one unverifiable 5.0 cannot outrank a 4.8 across hundreds.",
      validation: (rule) => rule.min(0),
    }),
  ],
});

export const agency = defineType({
  name: "agency",
  title: "Agency",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "profile", title: "Profile" },
    { name: "record", title: "Record" },
    { name: "clients", title: "Clients" },
    { name: "terms", title: "Terms of work" },
    { name: "provenance", title: "Provenance" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      group: "identity",
      description:
        "The profile's URL: /directory/agency/<slug>. Lowercase, hyphenated. Changing it changes the page's address and orphans the old one, so treat it as fixed once published.",
      validation: (rule) =>
        rule
          .required()
          .lowercase()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            name: "slug",
            invert: false,
          })
          .custom(slugIsUnclaimed),
    }),
    defineField({
      name: "name",
      title: "Agency name",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "identity",
      of: [{ type: "string" }],
      options: { list: CATEGORY_OPTIONS },
      description:
        "Which listings this agency appears in. The first one is the primary category - it is what the profile's breadcrumb names and what the list page's category filter matches on.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      group: "identity",
      description: "The agency's own site. Rendered as the profile's primary call to action.",
    }),
    defineField({
      name: "domain",
      title: "Domain",
      type: "string",
      group: "identity",
      description:
        "Registrable domain, lowercased, no www - e.g. dgrees.studio. This is the key the Superflow partner badge joins on and the label the list card's outbound link prints, so it is not decoration.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "agencyListingLocation",
      group: "identity",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      group: "profile",
      description:
        "The blurb on the profile's hero and, clamped to two lines, on its list card. Plain text.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "profile",
      description:
        "Uploaded logo. Wins over the source logo URL below - upload one when the hotlinked image is wrong, missing or has rotted.",
    }),
    defineField({
      name: "logoUrl",
      title: "Source logo URL",
      type: "url",
      group: "profile",
      description:
        "Logo hotlinked from the source profile, written by the importer. Its host has to be allowlisted in next.config.ts or the image renders blank, so prefer uploading above.",
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "string" }],
      group: "profile",
      options: { layout: "tags" },
    }),
    defineField({
      name: "industries",
      title: "Industries",
      type: "array",
      of: [{ type: "string" }],
      group: "profile",
      options: { layout: "tags" },
    }),
    defineField({
      name: "teamSize",
      title: "Team size",
      type: "string",
      group: "profile",
      description: "As the source phrases it, e.g. \"11-50\". Not parsed - sources disagree on bucket boundaries.",
    }),
    defineField({
      name: "foundedYear",
      title: "Founded",
      type: "number",
      group: "profile",
      validation: (rule) => rule.min(1800).max(new Date().getFullYear()),
    }),

    defineField({
      name: "awards",
      title: "Awwwards award tally",
      type: "agencyAwards",
      group: "record",
    }),
    defineField({
      name: "rating",
      title: "Client rating",
      type: "agencyRating",
      group: "record",
      description:
        "Leave empty for a source that publishes no reviews. An empty rating is correct data, not a gap - see the award tally's note.",
    }),
    defineField({
      name: "accolades",
      title: "Award wins and certifications",
      type: "array",
      of: [{ type: "string" }],
      group: "record",
      description:
        "One entry per item. For a jury source (D&AD, Motion Design Awards) each entry is one win and the profile counts them as an award record; for every other source they render as self-reported and uncounted. That difference is decided by the source, not here.",
    }),
    defineField({
      name: "awardsNote",
      title: "Note on the award record",
      type: "text",
      rows: 3,
      group: "record",
      description:
        "One line on what the counted tally cannot say - typically that it covers a single jury while the agency's real record spans several. Prose, never a second number: the agency's own total is self-reported, and printing it as a figure beside a tally from a named jury would present the two as the same kind of claim.",
    }),

    defineField({
      name: "clients",
      title: "Clients",
      type: "array",
      of: [{ type: "agencyClient" }],
      group: "clients",
      description:
        "Brands this agency has shipped work for, most recognisable first. The list card names the first three.",
    }),

    defineField({
      name: "budgetLabel",
      title: "Typical budget",
      type: "string",
      group: "terms",
      description: "As the source phrases it, e.g. \"Starting from $5,000\". Rendered verbatim in the profile's stat strip.",
    }),
    defineField({
      name: "budgetFloorUsd",
      title: "Budget floor (USD)",
      type: "number",
      group: "terms",
      description:
        "The same figure as a number, for the category importers' thresholds. Leave EMPTY when the agency quoted in another currency or named no figure - empty means \"did not say\", and 0 means \"takes work at any budget\". A filter written against the wrong one of those is how an unqualified agency lands in a premium listing.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "budgetMinimums",
      title: "Stated minimum project sizes",
      type: "array",
      of: [{ type: "agencyListingBudgetMinimum" }],
      group: "terms",
      description:
        "What the agency told us directly, in the currency it quoted. Never converted: a rate they did not give is a figure they did not state. Two floors for two kinds of work is normal and is the whole reason this is rows rather than one number.",
    }),
    defineField({
      name: "engagementNote",
      title: "How they engage",
      type: "text",
      rows: 3,
      group: "terms",
      description: "One line on the shapes of engagement the agency takes, as they phrase it.",
    }),
    defineField({
      name: "exclusions",
      title: "Doesn't take on",
      type: "array",
      of: [{ type: "string" }],
      group: "terms",
      description:
        "Work the agency says it turns down, in its own words. Empty for an agency that rules nothing out - which is a real answer, and renders as nothing rather than as an empty section.",
    }),

    defineField({
      name: "source",
      title: "Source",
      type: "string",
      group: "provenance",
      options: { list: SOURCE_OPTIONS },
      description:
        "Who published the figures on this record. Printed under them on the card and the profile, so it is a citation rather than a tag.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "profileUrl",
      title: "Source profile URL",
      type: "url",
      group: "provenance",
      description:
        "The agency's page on that source. The one attribution link the profile renders - required for every source except \"Listed by Superflow\", which has none by definition.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const source = (context.document as { source?: string } | undefined)?.source;
          if (source && source !== "editorial" && !value) {
            return "A record attributed to a source directory needs a link to its profile there - that link is what makes the figures on the page checkable.";
          }
          return true;
        }),
    }),
    defineField({
      name: "verifiedAt",
      title: "Confirmed by the agency on",
      type: "date",
      group: "provenance",
      description:
        "Set ONLY when the agency itself confirmed these details. It puts \"Confirmed by the agency\" on the page - the one line there that is not attributable to a source profile - so an in-house edit must leave it empty.",
    }),
    defineField({
      name: "verifiedBy",
      title: "Confirmed by (internal)",
      type: "string",
      group: "provenance",
      description: "Who at the agency confirmed it. Never published - for your reference.",
    }),
    defineField({
      name: "scrapedAt",
      title: "Collected at",
      type: "datetime",
      group: "provenance",
      readOnly: true,
      description: "When the importer collected this record. Written by the importer, not by hand.",
    }),
  ],
  orderings: [
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Recently updated",
      name: "updatedDesc",
      by: [{ field: "_updatedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "location.country", media: "logo" },
  },
});
