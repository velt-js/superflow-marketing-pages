// Markdown copies of the agency directory.
//
// This is the part of the site with the most machine-useful content and the
// least machine-readable presentation: ~320 agency profiles, each carrying a
// location, a service list, an award tally, a client list and - since agencies
// started claiming their listings - a minimum budget, a typical timeline, the
// platforms they build on and what they decline. An agent asked "find me a
// motion design studio in Amsterdam that takes work under $25k and replies
// inside two days" has to parse every one of those pages to answer. As
// Markdown it is a table lookup.
//
// TWO KINDS OF FACT, KEPT APART IN THE OUTPUT
//
// Everything a SOURCE DIRECTORY published is attributed to that source by
// name, exactly as before. Everything the AGENCY said about itself is
// labelled as the agency's own answer. An agent reading these has to be
// able to tell the difference, because one of them was checked by a jury
// or a review platform and the other is a company describing itself.
//
// Nothing here computes a score or a ranking of its own. The ranking score
// is deliberately absent from every document: presenting a number we made
// up next to figures a named source published is how a directory starts
// laundering its own opinions as facts.

import type { AgentDoc, AgentDocSection } from "../types";
import type { DirectoryCategory } from "@/lib/directory/types";
import {
  agencyPath,
  formatAgencyLocation,
  formatAgencyRating,
  getAgencyClients,
  getAwardBreakdown,
  getIndexableAgencySlugs,
  resolveAgencySourceLabel,
  shouldIndexAgency,
} from "@/lib/directory/agencies";
import { platformLabel } from "@/lib/directory/claim-fields";
import type { EnrichedAgency } from "@/lib/directory/enrich";
import {
  getCategoryAgenciesSync,
  getEnrichedRelatedAgencies,
} from "@/lib/directory/listing";
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

/** Category titles an agency belongs to, for the facts table. Reads the
 *  RESOLVED categories, so a listing an agency re-filed on claiming reads
 *  the same here as it does on the page. */
function categoryTitles(agency: EnrichedAgency): string {
  try {
    return (agency.resolvedCategories ?? [])
      .map((slug) => DIRECTORY_CATEGORIES.find((entry) => entry.slug === slug)?.title ?? slug)
      .join(", ");
  } catch {
    return "";
  }
}

/**
 * Formats a whole-dollar figure, e.g. "$25,000".
 *
 * @param amount - The figure, or null.
 * @returns The formatted figure, or an empty string - which the fact
 *          table drops, rather than printing a zero for a number nobody
 *          gave us.
 */
function money(amount: number | null | undefined): string {
  try {
    return typeof amount === "number" ? `$${amount.toLocaleString("en-US")}` : "";
  } catch {
    return "";
  }
}

/** One agency profile. */
export function agencyToAgentDoc(agency: EnrichedAgency): AgentDoc {
  const location = formatAgencyLocation(agency.location ?? null) ?? "";
  const rating = formatAgencyRating(agency.rating) ?? "";
  const clients = getAgencyClients(agency);
  const awards = getAwardBreakdown(agency.awards).filter((entry) => entry.count > 0);
  const source = resolveAgencySourceLabel(agency.source);

  const budgetRange =
    agency.typicalBudgetMin || agency.typicalBudgetMax
      ? `${money(agency.typicalBudgetMin) || "?"} to ${money(agency.typicalBudgetMax) || "?"}`
      : "";

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
      // Whether the agency itself stands behind this listing is the first
      // thing an agent should be able to read off it: every figure in the
      // block below means something different depending on the answer.
      {
        label: "Listing claimed by the agency",
        value: agency.claimed ? (agency.verified ? "Yes, domain verified" : "Yes") : "No",
      },
      { label: "Minimum project budget", value: money(agency.minBudgetUsd) },
      { label: "Typical project budget", value: budgetRange },
      {
        label: "Typical timeline",
        value: agency.typicalTimelineWeeks ? `${agency.typicalTimelineWeeks} weeks` : "",
      },
      {
        label: "Platforms",
        value: (agency.platforms ?? []).map((platform) => platformLabel(platform)).join(", "),
      },
      {
        label: "Replies within",
        value: agency.responseSlaDays ? `${agency.responseSlaDays} business days` : "",
      },
      {
        label: "Accepting new projects",
        value: agency.claimed ? (agency.acceptingProjects ? "Yes" : "No") : "",
      },
      { label: "YC founder offer", value: agency.ycOffer ?? "" },
      { label: "Startup friendly", value: agency.startupFriendly ? "Yes" : "" },
      { label: "Team size", value: agency.teamSize ?? "" },
      { label: "Founded", value: agency.foundedYear ? String(agency.foundedYear) : "" },
      { label: "Client rating", value: rating },
      { label: "Awards", value: agency.awards?.total ? `${agency.awards.total} total` : "" },
      // Attribution is a fact, not a footnote: the scraped figures above
      // are reported by this source, and an agent repeating one should be
      // able to say where it came from.
      { label: "Source", value: source },
      { label: "Source profile", value: agency.profileUrl },
    ],
    sections: sections(
      { heading: "About", body: [clean(agency.description)] },
      // Named "in their own words" because it is the agency's answer, not
      // a source directory's classification.
      agency.claimed
        ? {
            heading: "What they say no to",
            body: [clean(agency.declines ?? "")],
          }
        : null,
      {
        heading: "Startup clients",
        body: ["Named by the agency on its own listing."],
        bullets: (agency.startupClients ?? []).map(clean).filter(Boolean),
      },
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
      // Both flows get a line, because an agent reading this on behalf of
      // a founder and one reading it on behalf of an agency want opposite
      // things from the page.
      {
        heading: "Working with this agency",
        body: [
          `Send a project brief and reach this agency plus two others that fit it: ${DIRECTORY_BASE_PATH}/match?agency=${agency.slug}`,
          agency.claimed
            ? ""
            : `This listing has not been claimed, so its budget, timeline and platforms are unstated. If you run ${agency.name}, claim it at ${DIRECTORY_BASE_PATH}/claim?agency=${agency.slug}`,
        ],
      },
    ),
    related: [],
  };
}

/**
 * One agency profile, with its related-agency block resolved.
 *
 * Async because the related block reads the live claim layer. Split from
 * `agencyToAgentDoc` so the synchronous builder stays usable from a
 * script or a test that only wants the document itself.
 *
 * @param agency - The enriched agency.
 * @returns The document, including its related links.
 */
export async function agencyToAgentDocWithRelated(agency: EnrichedAgency): Promise<AgentDoc> {
  const doc = agencyToAgentDoc(agency);
  try {
    const related = await getEnrichedRelatedAgencies(agency, 6);
    return {
      ...doc,
      related: related.agencies.map((entry) => ({
        title: entry.name,
        path: agencyPath(entry.slug),
        note: formatAgencyLocation(entry.location ?? null) ?? undefined,
      })),
    };
  } catch {
    return doc;
  }
}

/** One directory category listing. */
export function directoryCategoryToAgentDoc(category: DirectoryCategory): AgentDoc {
  const agencies = getCategoryAgenciesSync(category.slug).filter(shouldIndexAgency);

  // Columns chosen for the query this table is actually asked: which of
  // these can I afford, how long will it take, and will they answer.
  const rows = agencies.map((agency) => [
    agency.name,
    formatAgencyLocation(agency.location ?? null) ?? "",
    money(agency.minBudgetUsd) || "not stated",
    agency.typicalTimelineWeeks ? `${agency.typicalTimelineWeeks} wk` : "not stated",
    (agency.platforms ?? []).map((platform) => platformLabel(platform)).join(", ") || "not stated",
    agency.responseSlaDays ? `${agency.responseSlaDays} days` : "not stated",
    agency.claimed ? (agency.verified ? "verified" : "claimed") : "unclaimed",
  ]);

  const claimedCount = agencies.filter((agency) => agency.claimed).length;
  const offerCount = agencies.filter((agency) => Boolean(agency.ycOffer)).length;

  return {
    title: category.heading,
    summary: category.metaDescription || category.subheading,
    path: `${DIRECTORY_BASE_PATH}/${category.slug}`,
    kind: "Agency directory category",
    facts: [
      { label: "Category", value: category.title },
      { label: "Agencies listed", value: String(agencies.length) },
      { label: "Listings claimed by the agency", value: String(claimedCount) },
      { label: "With a YC founder offer", value: String(offerCount) },
    ],
    sections: sections(
      { heading: "What this listing is", body: [clean(category.subheading)] },
      {
        heading: "How to read this",
        body: [
          "Budget, timeline, platform and reply time are the agency's own answers, given when it claimed its listing. A row reading \"not stated\" means the agency has not answered that question - never that the answer is zero.",
          "Location, awards and client lists are reported by the source directory named on each agency's own page, and are never computed here.",
        ],
      },
      {
        heading: "Agencies",
        table: rows.length
          ? {
              headers: [
                "Agency",
                "Location",
                "Minimum budget",
                "Typical timeline",
                "Platforms",
                "Replies within",
                "Listing",
              ],
              rows,
            }
          : undefined,
      },
      {
        heading: "Get matched",
        body: [
          `Describe a project and reach three agencies in this category at ${DIRECTORY_BASE_PATH}/match?category=${category.slug}`,
        ],
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
  const rows = DIRECTORY_CATEGORIES.map((category) => {
    const agencies = getCategoryAgenciesSync(category.slug).filter(shouldIndexAgency);
    return [
      category.title,
      `${DIRECTORY_BASE_PATH}/${category.slug}`,
      String(agencies.length),
      String(agencies.filter((agency) => agency.claimed).length),
      String(agencies.filter((agency) => Boolean(agency.ycOffer)).length),
    ];
  });

  return {
    title: "Agency directory",
    summary:
      "A directory of web design, SEO, branding and motion design agencies. Each profile carries the location, awards and client list its source directory publishes, plus the minimum budget, typical timeline, platforms and reply time the agency itself has stated.",
    path: DIRECTORY_BASE_PATH,
    kind: "Directory index",
    facts: [
      { label: "Categories", value: String(DIRECTORY_CATEGORIES.length) },
      { label: "Agencies listed", value: String(getIndexableAgencySlugs().length) },
      {
        label: "Data provenance",
        value:
          "Scraped fields are reported by a named source directory and link back to it. Budget, timeline, platform and reply time are the agency's own answers.",
      },
    ],
    sections: sections(
      {
        heading: "Categories",
        table: {
          headers: ["Category", "Path", "Agencies", "Claimed", "With a YC offer"],
          rows,
        },
      },
      {
        heading: "Filtering a category",
        body: [
          "Every filter is a query parameter on a category page, so a filtered view is a URL: `budget` (10000, 25000, 50000, or any), `platform` (comma-separated: webflow, framer, shopify, wordpress, nextjs, custom, other), `startup=1`, `yc_offer=1`, `verified=1`, `country`, and `sort` (recommended, most-awarded, lowest-budget, fastest-reply).",
          `Example: ${DIRECTORY_BASE_PATH}/web-design?budget=25000&platform=webflow&verified=1`,
        ],
      },
      {
        heading: "Two things you can do here",
        bullets: [
          `Get matched: describe a project at ${DIRECTORY_BASE_PATH}/match and three agencies receive the brief.`,
          `Claim a listing: an agency can set its own budget, timeline and platforms at ${DIRECTORY_BASE_PATH}/claim`,
        ],
      },
    ),
    related: DIRECTORY_CATEGORIES.map((category) => ({
      title: category.heading,
      path: `${DIRECTORY_BASE_PATH}/${category.slug}`,
    })),
  };
}
