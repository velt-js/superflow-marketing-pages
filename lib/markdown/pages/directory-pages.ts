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
import type { Agency, DirectoryCategory } from "@/lib/directory/types";
import {
  agencyPath,
  formatAgencyLocation,
  formatAgencyRating,
  getAgenciesByCategory,
  getAgencyClients,
  getAwardBreakdown,
  getIndexableAgencySlugs,
  getRelatedAgencies,
  resolveAgencySourceLabel,
  shouldIndexAgency,
} from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import { clean } from "../text";

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
export function agencyToAgentDoc(agency: Agency): AgentDoc {
  const location = formatAgencyLocation(agency.location ?? null) ?? "";
  const rating = formatAgencyRating(agency.rating) ?? "";
  const clients = getAgencyClients(agency);
  const awards = getAwardBreakdown(agency.awards).filter((entry) => entry.count > 0);
  const source = resolveAgencySourceLabel(agency.source);

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
        label: "Awards",
        value: agency.awards?.total ? `${agency.awards.total} total` : "",
      },
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
        body: [`As tallied by ${source}.`],
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
        heading: "Recognitions",
        body: ["Self-reported by the agency, unverified."],
        bullets: (agency.accolades ?? []).map(clean).filter(Boolean),
      },
    ),
    related: getRelatedAgencies(agency, 6).agencies.map((related) => ({
      title: related.name,
      path: agencyPath(related.slug),
      note: formatAgencyLocation(related.location ?? null) ?? undefined,
    })),
  };
}

/** One directory category listing. */
export function directoryCategoryToAgentDoc(category: DirectoryCategory): AgentDoc {
  const agencies = getAgenciesByCategory(category.slug).filter(shouldIndexAgency);

  const rows = agencies.map((agency) => [
    agency.name,
    formatAgencyLocation(agency.location ?? null) ?? "",
    agency.teamSize ?? "",
    agency.budgetLabel ?? "",
    formatAgencyRating(agency.rating) ?? (agency.awards?.total ? `${agency.awards.total} awards` : ""),
  ]);

  return {
    title: category.heading,
    summary: category.metaDescription || category.subheading,
    path: `${DIRECTORY_BASE_PATH}/${category.slug}`,
    kind: "Agency directory category",
    facts: [
      { label: "Category", value: category.title },
      { label: "Agencies listed", value: String(agencies.length) },
    ],
    sections: sections(
      { heading: "What this listing is", body: [clean(category.subheading)] },
      {
        heading: "Agencies",
        body: [
          "Every figure below is reported by the source directory named on each agency's own page, never computed here.",
        ],
        table: rows.length
          ? {
              headers: ["Agency", "Location", "Team size", "Typical budget", "Record"],
              rows,
            }
          : undefined,
      },
    ),
    related: agencies.map((agency) => ({
      title: agency.name,
      path: agencyPath(agency.slug),
    })),
  };
}

/** The directory hub. */
export function directoryHubToAgentDoc(): AgentDoc {
  const rows = DIRECTORY_CATEGORIES.map((category) => [
    category.title,
    `${DIRECTORY_BASE_PATH}/${category.slug}`,
    String(getAgenciesByCategory(category.slug).filter(shouldIndexAgency).length),
  ]);

  return {
    title: "Agency directory",
    summary:
      "A directory of web design, SEO, branding and motion design agencies, each profile carrying the location, services, team size, budget floor and award or review record its source publishes.",
    path: DIRECTORY_BASE_PATH,
    kind: "Directory index",
    facts: [
      { label: "Categories", value: String(DIRECTORY_CATEGORIES.length) },
      { label: "Agencies listed", value: String(getIndexableAgencySlugs().length) },
      {
        label: "Data provenance",
        value: "Every field is reported by a named source directory and links back to it.",
      },
    ],
    sections: sections({
      heading: "Categories",
      table: { headers: ["Category", "Path", "Agencies"], rows },
    }),
    related: DIRECTORY_CATEGORIES.map((category) => ({
      title: category.heading,
      path: `${DIRECTORY_BASE_PATH}/${category.slug}`,
    })),
  };
}
