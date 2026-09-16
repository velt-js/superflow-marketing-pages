// Markdown copies of the agency directory.
//
// This is the part of the site with the most machine-useful content and the
// least machine-readable presentation: ~320 agency profiles, each carrying a
// location, a service list, a team size, an award tally, a client list and a
// budget floor, all of it rendered into cards. An agent asked "find me a
// motion design studio in Amsterdam that has worked with Nike" has to parse
// every one of those pages to answer. As Markdown it is a table lookup.
//
// Every figure here is source-reported, and the source is named in each
// document. Nothing in this file computes a score or a ranking of its own:
// presenting a derived number next to an attributed one is how a directory
// starts laundering its own opinions as facts.

import type { AgentDoc, AgentDocSection } from "../types";
import type { Agency } from "@/lib/directory/types";
import { absoluteUrl } from "../render";
import {
  agencyPath,
  formatAgencyLocation,
  formatAgencyRating,
  getAgencyClients,
  getAwardBreakdown,
  getDirectoryAgencyList,
  getRelatedAgencies,
  isJuryAccoladeSource,
  resolveAgencySourceLabel,
  resolveAwardTallyLabel,
  shouldIndexAgency,
} from "@/lib/directory/agencies";
import {
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORIES,
  DIRECTORY_CATEGORY_PARAM,
} from "@/lib/directory/constants";
import { clean } from "../text";

/** How many agencies the hub document links in its "Related pages" block.
 *  The table above it already carries every profile URL. */
const RELATED_AGENCY_LIMIT = 12;

/** Section list with the empties dropped. */
function sections(...candidates: (AgentDocSection | null)[]): AgentDocSection[] {
  return candidates.filter((section): section is AgentDocSection => {
    if (!section) return false;
    const hasBody = (section.body ?? []).some((text) => clean(text));
    const hasBullets = (section.bullets ?? []).some((text) => clean(text));
    const hasTable = (section.table?.rows ?? []).length > 0;
    return hasBody || hasBullets || hasTable;
  });
}

/** Category titles an agency belongs to, for the facts table. */
function categoryTitles(agency: Agency): string {
  try {
    return (agency.categories ?? [])
      .map((slug) => DIRECTORY_CATEGORIES.find((c) => c.slug === slug)?.title ?? slug)
      .join(", ");
  } catch {
    return "";
  }
}

/** One agency profile. */
export async function agencyToAgentDoc(agency: Agency): Promise<AgentDoc> {
  const location = formatAgencyLocation(agency.location ?? null) ?? "";
  const rating = formatAgencyRating(agency.rating) ?? "";
  const clients = getAgencyClients(agency);
  const awards = getAwardBreakdown(agency.awards).filter((entry) => entry.count > 0);
  const source = resolveAgencySourceLabel(agency.source);
  const listing = agency.listing ?? null;

  return {
    title: agency.name,
    summary:
      clean(agency.description) ||
      `${agency.name} is a ${categoryTitles(agency).toLowerCase() || "creative"} agency${location ? ` in ${location}` : ""}, listed in the Superflow agency directory.`,
    path: agencyPath(agency.slug),
    kind: "Agency profile",
    facts: [
      { label: "Agency", value: agency.name },
      { label: "Website", value: agency.website ?? "" },
      { label: "Location", value: location },
      { label: "Categories", value: categoryTitles(agency) },
      { label: "Team size", value: agency.teamSize ?? "" },
      { label: "Founded", value: agency.foundedYear ? String(agency.foundedYear) : "" },
      { label: "Typical project budget", value: agency.budgetLabel ?? "" },
      { label: "Client rating", value: rating },
      {
        // Never "N total": the tally is one jury's scheme (see
        // `resolveAwardTallyLabel`), and an agent repeating it as a total
        // would be asserting something the source never said.
        label: resolveAwardTallyLabel(agency.source),
        value: agency.awards?.total ? String(agency.awards.total) : "",
      },
      { label: "Confirmed by the agency", value: clean(listing?.verifiedAt) },
      // Attribution is a fact, not a footnote: every figure above is
      // reported by this source, and an agent repeating one should be able
      // to say where it came from.
      { label: "Source", value: source },
      { label: "Source profile", value: agency.profileUrl },
    ],
    sections: sections(
      { heading: "About", body: [clean(agency.description)] },
      { heading: "Services listed", bullets: (agency.services ?? []).map(clean).filter(Boolean) },
      {
        heading: "Industries served",
        bullets: (agency.industries ?? []).map(clean).filter(Boolean),
      },
      {
        heading: "Award record",
        body: [`As tallied by ${source}.`, clean(listing?.awardsNote)],
        table: awards.length
          ? {
              headers: ["Award", "Count"],
              rows: awards.map((entry) => [entry.label, String(entry.count)]),
            }
          : undefined,
      },
      {
        heading: "Clients",
        table: clients.length
          ? {
              headers: ["Client", "Work"],
              rows: clients.map((client) => [client.name, clean(client.projectTitle)]),
            }
          : undefined,
      },
      {
        // Two different claims live in `accolades` depending on the source,
        // and the caption has to say which one this is: a D&AD Pencil list
        // captioned "self-reported" is wrong about the jury, and a wall of
        // vendor certifications captioned "published by the jury" is wrong
        // about the agency. See `isJuryAccoladeSource`.
        heading: isJuryAccoladeSource(agency.source) ? "Award wins" : "Recognitions",
        body: [
          isJuryAccoladeSource(agency.source)
            ? `Every entry is one win, as published by ${source}.`
            : "Self-reported by the agency, unverified.",
        ],
        bullets: (agency.accolades ?? []).map(clean).filter(Boolean),
      },
      // Neither of these comes from a source directory - no directory
      // publishes them. They exist only where the agency wrote in, which
      // is also the one kind of answer an agent asked "who would take this
      // brief" actually needs.
      {
        // The stated floors get their own table rather than a sentence:
        // an agent filtering "agencies that take £20k projects" needs the
        // figure and its currency as data, and an agency that quoted two
        // different floors for two kinds of work said something a single
        // number cannot carry.
        heading: "Minimum project size",
        body: [
          (listing?.budgetMinimums ?? []).length > 0
            ? "Stated by the agency, in the currency it quoted. Never converted."
            : "",
        ],
        table: (listing?.budgetMinimums ?? []).length > 0
          ? {
              headers: ["Kind of work", "From", "Currency"],
              rows: (listing?.budgetMinimums ?? []).map((minimum) => [
                clean(minimum.scope),
                String(minimum.amount),
                clean(minimum.currency),
              ]),
            }
          : undefined,
      },
      {
        heading: "Working with them",
        body: [
          clean(listing?.engagementNote),
          (listing?.exclusions ?? []).length > 0
            ? "Work the agency says it does not take on:"
            : "",
        ],
        bullets: (listing?.exclusions ?? []).map(clean).filter(Boolean),
      },
    ),
    related: (await getRelatedAgencies(agency, 6)).agencies.map((related) => ({
      title: related.name,
      path: agencyPath(related.slug),
      note: formatAgencyLocation(related.location ?? null) ?? undefined,
    })),
  };
}

/** The directory list page, with every listed agency as one table row. */
export async function directoryHubToAgentDoc(): Promise<AgentDoc> {
  const agencies = (await getDirectoryAgencyList()).filter(shouldIndexAgency);
  const countries = new Set(
    agencies
      .map((agency) => agency.location?.country?.trim())
      .filter((country): country is string => Boolean(country)),
  );

  // One row per agency, with the profile URL in the row itself. The whole
  // point of this document is that "find me a motion design studio in
  // Amsterdam that has worked with Nike" should be a table scan rather than
  // 320 page fetches, and a table whose rows cannot be followed up sends
  // the agent back to fetching pages.
  const rows = agencies.map((agency) => [
    agency.name,
    categoryTitles(agency),
    formatAgencyLocation(agency.location ?? null) ?? "",
    agency.teamSize ?? "",
    agency.budgetLabel ?? "",
    // Names the jury or the review source, for the same reason the pages
    // do: "48 awards" read out of context is a claim about an agency's
    // whole record, which this number is not.
    formatAgencyRating(agency.rating) ??
      (agency.awards?.total
        ? `${agency.awards.total} ${resolveAwardTallyLabel(agency.source, agency.awards.total)}`
        : ""),
    resolveAgencySourceLabel(agency.source),
    absoluteUrl(agencyPath(agency.slug)),
  ]);

  return {
    title: "Agency directory",
    summary:
      "A directory of web design, SEO, branding and motion design agencies, each profile carrying the location, services, team size, budget floor and award or review record its source publishes.",
    path: DIRECTORY_BASE_PATH,
    kind: "Directory index",
    facts: [
      { label: "Agencies listed", value: String(agencies.length) },
      { label: "Countries", value: String(countries.size) },
      {
        label: "Categories",
        value: DIRECTORY_CATEGORIES.map((category) => category.title).join(", "),
      },
      {
        label: "Filtering",
        value: `Add ?${DIRECTORY_CATEGORY_PARAM}=<slug> to ${DIRECTORY_BASE_PATH} to narrow the list to one category.`,
      },
      {
        label: "Data provenance",
        value: "Every field is reported by a named source directory and links back to it.",
      },
    ],
    sections: sections(
      {
        heading: "What this listing is",
        body: [
          "One list of every agency in the directory, filterable by category, country and search rather than split across separate category pages.",
          DIRECTORY_CATEGORIES.map(
            (category) => `${category.title}: ${category.subheading}`,
          ).join(" "),
        ],
      },
      {
        heading: "Agencies",
        body: [
          "Every figure below is reported by the source named in its own row, never computed here. Each profile URL also publishes a Markdown copy at that path plus `.md`.",
        ],
        table: rows.length
          ? {
              headers: [
                "Agency",
                "Category",
                "Location",
                "Team size",
                "Typical budget",
                "Record",
                "Source",
                "Profile",
              ],
              rows,
            }
          : undefined,
      },
    ),
    // The table already carries every profile URL, so this block is the
    // shortlist rather than a second copy of it - a 300-link list under a
    // 300-row table is noise in a document whose whole purpose is signal.
    related: agencies.slice(0, RELATED_AGENCY_LIMIT).map((agency) => ({
      title: agency.name,
      path: agencyPath(agency.slug),
      note: formatAgencyLocation(agency.location ?? null) ?? undefined,
    })),
  };
}
