import { defineType, defineField } from "sanity";

// Agency directory listings — the CMS layer over the scraped agency
// dataset rendered at /directory/agency/<slug>.
//
// WHY THIS IS AN OVERLAY AND NOT THE WHOLE RECORD. Every agency in the
// directory is collected by a script under scripts/directory-import/, and
// each of those scripts OVERWRITES its own file under
// lib/directory/data/ wholesale on every run (see app/directory/README.md).
// A correction typed into the Studio and then written back into those
// files would survive exactly until the next scrape. So the scraped record
// stays the baseline and this document is merged on top of it at read time
// by lib/directory/overrides.ts — which is the same reasoning that already
// keeps the Superflow partner list in its own file rather than as a field
// on `Agency` (see `SuperflowPartnerList` in lib/directory/types.ts).
//
// Every field below is optional and empty means "no correction": a blank
// field leaves whatever the source published in place, it does not blank
// the page. That is what makes a listing safe to create for a single
// wrong figure without having to re-enter the other twenty right ones.
//
// This type cannot ADD an agency to the directory, only correct one that
// is already in it. A listing whose `agencySlug` matches no scraped record
// is ignored at read time — there is nothing to merge it onto, and a
// half-populated record with no source profile to attribute would break
// the one promise every page in this directory makes.

/**
 * Rejects a slug another listing already claims.
 *
 * Two listings for one agency is not a merge conflict the site can
 * resolve - it is two versions of the truth, and the read path can only
 * pick one. `getAgencyListingOverrides` orders newest-first so that pick
 * is at least deterministic, but a page that silently ignores the
 * correction an editor just typed (because an older duplicate exists) is
 * a worse failure than refusing to save it. So this is the first line of
 * defence and the ordering is the second.
 *
 * A document and its own draft share a slug by definition, so both ids
 * for the document being edited are excluded - otherwise every listing
 * would fail validation against itself the moment it was edited.
 *
 * @param slug - The value being validated.
 * @param context - Sanity's validation context, for the document id and a
 *                   client to query with.
 * @returns True when the slug is free, or an error message when it is not.
 */
async function slugIsUnclaimed(
  slug: string | undefined,
  context: { document?: { _id?: string }; getClient: (options: { apiVersion: string }) => { fetch: (query: string, params: Record<string, unknown>) => Promise<number> } },
): Promise<true | string> {
  try {
    if (!slug) return true;
    const id = context.document?._id ?? "";
    const publishedId = id.replace(/^drafts\./, "");
    const count = await context
      .getClient({ apiVersion: "2024-01-01" })
      .fetch(
        `count(*[_type == "agencyListing" && agencySlug == $slug && !(_id in $ids)])`,
        { slug, ids: [publishedId, `drafts.${publishedId}`] },
      );
    return count > 0
      ? `Another listing already corrects "${slug}". Edit that one instead - two listings for one agency means the site has to guess which correction you meant.`
      : true;
  } catch {
    // A validation rule that cannot reach the dataset must not block an
    // editor from saving real work. The read path's newest-first ordering
    // still keeps the rendered page deterministic.
    return true;
  }
}

/** Options for `clientsMode`, kept out of the field so the read-time
 *  merge in lib/directory/overrides.ts can import the same literals
 *  rather than re-spelling them. */
export const AGENCY_LISTING_CLIENTS_MODE_REPLACE = "replace";
export const AGENCY_LISTING_CLIENTS_MODE_ADD = "add";

export const agencyListingClient = defineType({
  name: "agencyListingClient",
  title: "Client",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Client name",
      type: "string",
      description:
        "The brand as the agency writes it — this is what gets rendered.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectTitle",
      title: "Project title",
      type: "string",
      description:
        "The awarded or published piece of work this client is on record for, when there is one. Leave blank when the agency simply named the client — the page then shows the name alone rather than repeating it twice.",
    }),
    defineField({
      name: "projectUrl",
      title: "Project URL",
      type: "url",
      description:
        "Where that work can be seen (e.g. its Awwwards page). Attribution, not promotion — leave blank rather than linking the client's homepage.",
    }),
    defineField({
      name: "domain",
      title: "Client domain",
      type: "string",
      description:
        "Registrable domain of the client's own site, lowercased, no www. Used to dedupe against the scraped client list, so fill it in where the agency gave a URL.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "projectTitle" },
  },
});

export const agencyListingBudgetMinimum = defineType({
  name: "agencyListingBudgetMinimum",
  title: "Minimum project",
  type: "object",
  fields: [
    defineField({
      name: "scope",
      title: "Kind of work",
      type: "string",
      description:
        "What this minimum applies to, in the agency's own terms, e.g. `Website` or `Branding`. Use `Any project` when the agency quoted one floor for everything.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amount",
      title: "Amount",
      type: "number",
      description: "The figure alone, no symbol and no separators — 15000, not €15,000.",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      description:
        "Three-letter ISO code for the currency the AGENCY quoted, e.g. EUR. Never convert — a rate they did not give is a figure they did not state.",
      initialValue: "USD",
      options: {
        list: [
          { title: "USD ($)", value: "USD" },
          { title: "EUR (€)", value: "EUR" },
          { title: "GBP (£)", value: "GBP" },
          { title: "CAD (C$)", value: "CAD" },
          { title: "AUD (A$)", value: "AUD" },
          { title: "ZAR (R)", value: "ZAR" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "scope", amount: "amount", currency: "currency" },
    prepare({ title, amount, currency }) {
      return {
        title: title || "Minimum project",
        subtitle: amount ? `from ${amount} ${currency ?? ""}`.trim() : "no amount set",
      };
    },
  },
});

export const agencyListingLocation = defineType({
  name: "agencyListingLocation",
  title: "Location",
  type: "object",
  fields: [
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "country", title: "Country", type: "string" }),
    defineField({
      name: "countryCode",
      title: "Country code",
      type: "string",
      description: "Two-letter ISO code, e.g. ES. Drives the country filter on the category page.",
    }),
  ],
  preview: {
    select: { title: "city", subtitle: "country" },
  },
});

export const agencyListing = defineType({
  name: "agencyListing",
  title: "Agency Listing",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "profile", title: "Profile" },
    { name: "clients", title: "Clients" },
    { name: "terms", title: "Terms of work" },
    { name: "provenance", title: "Provenance" },
  ],
  fields: [
    defineField({
      name: "agencySlug",
      title: "Agency slug",
      type: "string",
      group: "identity",
      description:
        "The slug in the scraped dataset — the last segment of the agency's URL, e.g. `dgrees` for /directory/agency/dgrees. This is the join key: a slug that matches nothing is ignored, and no two listings may claim the same one.",
      validation: (rule) =>
        rule
          .required()
          .custom((slug, context) =>
            slugIsUnclaimed(
              slug as string | undefined,
              context as unknown as Parameters<typeof slugIsUnclaimed>[1],
            ),
          ),
    }),
    defineField({
      name: "agencyName",
      title: "Agency name (for this list)",
      type: "string",
      group: "identity",
      description:
        "Label for the Studio list only. It does NOT rename the agency on the site — use the Name override below for that.",
    }),

    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "profile",
      description: "Overrides the name shown on the site. Leave blank to keep the scraped one.",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      group: "profile",
      description: "Overrides the outbound website link.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      group: "profile",
      description:
        "Overrides the profile blurb. Plain text, no markup — it is rendered as a single paragraph and reused in the page's meta description.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "profile",
      description:
        "Overrides the scraped avatar. Upload the logo the agency sent; leave empty to keep the source's.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "agencyListingLocation",
      group: "profile",
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "string" }],
      group: "profile",
      description:
        "Replaces the scraped service list outright when non-empty — it is not appended to.",
    }),
    defineField({
      name: "industries",
      title: "Industries",
      type: "array",
      of: [{ type: "string" }],
      group: "profile",
      description: "Replaces the scraped industry list outright when non-empty.",
    }),
    defineField({
      name: "teamSize",
      title: "Team size",
      type: "string",
      group: "profile",
      description: "As the agency phrases it, e.g. `11-50`. Not parsed.",
    }),
    defineField({
      name: "foundedYear",
      title: "Founded",
      type: "number",
      group: "profile",
      validation: (rule) => rule.min(1800).max(2100).integer(),
    }),
    defineField({
      name: "accolades",
      title: "Awards & certifications",
      type: "array",
      of: [{ type: "string" }],
      group: "profile",
      description:
        "Named recognitions, replacing the scraped list when non-empty. These are listed, never counted — the page says so.",
    }),
    defineField({
      name: "awardsNote",
      title: "Awards note",
      type: "text",
      rows: 3,
      group: "profile",
      description:
        "One line beneath the award record for what the tally cannot say — most often that the counted total covers one jury only, and what the agency's full record is across the others. Rendered as reported by the agency, so only put here what the agency actually told us.",
    }),

    defineField({
      name: "clients",
      title: "Clients",
      type: "array",
      of: [{ type: "agencyListingClient" }],
      group: "clients",
      description:
        "In the order the agency wants them read — the page renders them top to bottom as entered.",
    }),
    defineField({
      name: "clientsMode",
      title: "How to apply this client list",
      type: "string",
      group: "clients",
      initialValue: AGENCY_LISTING_CLIENTS_MODE_REPLACE,
      options: {
        list: [
          {
            title: "Replace the scraped list",
            value: AGENCY_LISTING_CLIENTS_MODE_REPLACE,
          },
          {
            title: "Add to the scraped list",
            value: AGENCY_LISTING_CLIENTS_MODE_ADD,
          },
        ],
        layout: "radio",
      },
      description:
        "Replace when the agency sent the list it wants published (the scraped one is dropped). Add when the agency sent extras on top of a list it already confirmed. Ignored when Clients is empty.",
    }),

    defineField({
      name: "budgetMinimums",
      title: "Minimum project size",
      type: "array",
      of: [{ type: "agencyListingBudgetMinimum" }],
      group: "terms",
      description:
        "One row per floor the agency stated. Two rows where they quoted different minimums for different work (a website against a brand identity, say) — that distinction is the answer to \"can I afford them\", and flattening it into one sentence loses it. This is the structured figure; the label below is the prose around it.",
    }),
    defineField({
      name: "budgetLabel",
      title: "Typical budget",
      type: "string",
      group: "terms",
      description:
        "As the agency phrases it, in the currency they quoted, e.g. `Projects from €15,000, typically €25,000–€60,000`. This is the string the page renders.",
    }),
    defineField({
      name: "budgetFloorUsd",
      title: "Minimum project (USD)",
      type: "number",
      group: "terms",
      description:
        "The lowest floor as a number, in US dollars — the field the category importers filter on. Leave blank when the agency quoted another currency; converting at a rate they never gave would invent precision, and the minimums above carry the real figure in the currency they used.",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "exclusions",
      title: "Work they don't take on",
      type: "array",
      of: [{ type: "string" }],
      group: "terms",
      description:
        "One entry per kind of work the agency rules out, in their words, e.g. `Template-based work`. Leave empty for an agency that rules nothing out — the section then does not render at all.",
    }),
    defineField({
      name: "engagementNote",
      title: "How they engage",
      type: "text",
      rows: 2,
      group: "terms",
      description:
        "One line on the shapes of engagement they take, e.g. design only, development only, or a full project. Rendered as reported by the agency.",
    }),

    defineField({
      name: "verifiedAt",
      title: "Verified on",
      type: "date",
      group: "provenance",
      description:
        "The date the agency confirmed these details. Setting it is what puts the 'confirmed by the agency' line on the page, so only fill it in when the agency itself sent the corrections — not for an in-house edit.",
    }),
    defineField({
      name: "verifiedBy",
      title: "Verified by",
      type: "string",
      group: "provenance",
      description:
        "Who at the agency confirmed it. Internal provenance — never fetched by the site, so it is not published.",
    }),
    defineField({
      name: "verificationSource",
      title: "Where this came from",
      type: "text",
      rows: 2,
      group: "provenance",
      description:
        "How the correction reached us, e.g. 'Reply to directory outreach, 15 Sep 2026'. Internal — never fetched by the site.",
    }),
  ],
  preview: {
    select: {
      title: "agencyName",
      slug: "agencySlug",
      verifiedAt: "verifiedAt",
    },
    prepare({ title, slug, verifiedAt }) {
      return {
        title: title || slug || "Untitled listing",
        subtitle: verifiedAt
          ? `${slug} · confirmed by the agency ${verifiedAt}`
          : `${slug} · in-house edit`,
      };
    },
  },
});
