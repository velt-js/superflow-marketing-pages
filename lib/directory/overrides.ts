// Read-time merge of CMS corrections onto the scraped agency dataset.
//
// The directory's records are collected by scripts under
// scripts/directory-import/, each of which overwrites its own file under
// lib/directory/data/ wholesale on every run. So a correction - an agency
// writing in to say the client list is from Awwwards and not the one they
// would choose, or that their minimum project is €15,000 - cannot be typed
// into those files: it would survive until the next scrape and no longer.
//
// This module is the seam that lets the two coexist. The scrape stays the
// baseline; `agencyListing` documents in Sanity are layered over it here,
// on the way to the page. Nothing in this file writes anything back.
//
// The merge rule is one line long, and everything else follows from it:
// **an absent or empty field is not a correction.** A listing created to
// fix one wrong budget leaves the other twenty fields alone rather than
// blanking them, which is what makes it safe to create one without
// re-entering a whole profile. The one deliberate exception is
// `clientsMode`, where an agency that sends the list it wants published
// means to replace the scraped one, not to append to it.

import type {
  Agency,
  AgencyBudgetMinimum,
  AgencyClient,
  AgencyListing,
} from "./types";

/** `clientsMode` values, matching the options in
 *  sanity/schemas/agencyListing.ts. */
export const CLIENTS_MODE_REPLACE = "replace";
export const CLIENTS_MODE_ADD = "add";

/** One client as the CMS stores it. Looser than `AgencyClient`: an editor
 *  types a name and, at most, a URL, so everything but the name is
 *  optional here and filled in with the documented nulls on the way out. */
export interface AgencyListingClientInput {
  name?: string | null;
  projectTitle?: string | null;
  projectUrl?: string | null;
  domain?: string | null;
}

/**
 * One `agencyListing` document, as fetched.
 *
 * Every field is optional because every field is optional in the Studio -
 * see the module header for why that is the point rather than a weakness
 * in the contract. Deliberately NOT `Partial<Agency>`: the shapes differ
 * where the CMS is looser (clients above) and where it carries fields
 * `Agency` does not have at all (`exclusions`, `awardsNote`).
 */
export interface AgencyListingBudgetMinimumInput {
  scope?: string | null;
  amount?: number | null;
  currency?: string | null;
}

export interface AgencyListingOverride {
  agencySlug?: string | null;
  name?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  location?: {
    city?: string | null;
    country?: string | null;
    countryCode?: string | null;
  } | null;
  services?: string[] | null;
  industries?: string[] | null;
  teamSize?: string | null;
  foundedYear?: number | null;
  accolades?: string[] | null;
  awardsNote?: string | null;
  clients?: AgencyListingClientInput[] | null;
  clientsMode?: string | null;
  budgetMinimums?: AgencyListingBudgetMinimumInput[] | null;
  budgetLabel?: string | null;
  budgetFloorUsd?: number | null;
  exclusions?: string[] | null;
  engagementNote?: string | null;
  verifiedAt?: string | null;
}

/** Trimmed string, or null when there was nothing there. Empty is "no
 *  correction", never "blank this field out". */
function text(value: string | null | undefined): string | null {
  try {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  } catch {
    return null;
  }
}

/** Non-empty trimmed entries of a string list, or null when the list is
 *  absent or holds nothing usable. */
function list(values: string[] | null | undefined): string[] | null {
  try {
    const cleaned = (values ?? [])
      .map((value) => text(value))
      .filter((value): value is string => Boolean(value));
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}

/** A registrable domain normalised the way `Agency.domain` and
 *  `AgencyClient.domain` store it, so the dedupe below compares like with
 *  like: lowercased, trimmed, no scheme, no `www.`, no path. */
function normalizeDomain(value: string | null | undefined): string | null {
  try {
    const raw = text(value);
    if (!raw) return null;
    return (
      raw
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        ?.trim() || null
    );
  } catch {
    return null;
  }
}

/**
 * Turns a CMS client entry into the `AgencyClient` the pages render.
 *
 * `projectTitle` falls back to the client's own name, which is what the
 * contract asks for when a source names a client directly rather than
 * through a piece of work (see `AgencyClient` in ./types.ts) - and an
 * agency listing its own clients is exactly that case. `notable` is always
 * false: it means "not asserted to be notable", and an agency's list comes
 * in the order the agency chose, which the renderer preserves.
 *
 * @param input - One client as stored in the CMS.
 * @returns The rendered client, or null when it carries no usable name.
 */
function toAgencyClient(input: AgencyListingClientInput | null | undefined): AgencyClient | null {
  try {
    const name = text(input?.name);
    if (!name) return null;
    return {
      name,
      domain: normalizeDomain(input?.domain),
      projectTitle: text(input?.projectTitle) ?? name,
      projectUrl: text(input?.projectUrl),
      notable: false,
    };
  } catch {
    return null;
  }
}

/**
 * Merges a CMS client list into a scraped one.
 *
 * In `replace` mode the scraped list is dropped outright - an agency that
 * sends the list it wants published is not asking for it to be appended to
 * the one it just disowned. In `add` mode the agency's entries follow the
 * scraped ones, deduped against them by registrable domain first and then
 * by name, so an agency re-sending a client already on the page (which
 * both of the first two listings did) does not print it twice.
 *
 * @param scraped - The clients already on the record.
 * @param overrideClients - The clients from the CMS, already cleaned.
 * @param mode - `clientsMode` from the document.
 * @returns The merged list, in the order it should render.
 */
function mergeClients(
  scraped: AgencyClient[],
  overrideClients: AgencyClient[],
  mode: string | null | undefined,
): AgencyClient[] {
  try {
    if (overrideClients.length === 0) return scraped;
    if (mode !== CLIENTS_MODE_ADD) return overrideClients;

    const seenDomains = new Set(
      scraped
        .map((client) => normalizeDomain(client?.domain))
        .filter((domain): domain is string => Boolean(domain)),
    );
    const seenNames = new Set(
      scraped
        .map((client) => client?.name?.trim().toLowerCase())
        .filter((name): name is string => Boolean(name)),
    );

    const additions = overrideClients.filter((client) => {
      const domain = normalizeDomain(client?.domain);
      if (domain && seenDomains.has(domain)) return false;
      const name = client?.name?.trim().toLowerCase();
      if (name && seenNames.has(name)) return false;
      if (domain) seenDomains.add(domain);
      if (name) seenNames.add(name);
      return true;
    });

    return [...scraped, ...additions];
  } catch {
    return scraped;
  }
}

/**
 * Cleans the stated budget floors, dropping any row that does not carry a
 * real figure.
 *
 * A row with a scope and no amount is a half-typed entry, not a floor of
 * zero: zero would read as "takes work at any budget", which is the
 * opposite claim. Currency is upper-cased so `Intl` can format it, and
 * defaults to nothing rather than to dollars - guessing the currency of a
 * number an agency gave us is exactly the mistake this field exists to
 * avoid.
 *
 * @param inputs - Rows as stored in the CMS.
 * @returns Usable floors, in the order they were entered.
 */
function toBudgetMinimums(
  inputs: AgencyListingBudgetMinimumInput[] | null | undefined,
): AgencyBudgetMinimum[] {
  try {
    return (inputs ?? [])
      .map((input) => {
        const scope = text(input?.scope);
        const currency = text(input?.currency)?.toUpperCase();
        const amount = input?.amount;
        if (!scope || !currency) return null;
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
          return null;
        }
        return { scope, amount, currency };
      })
      .filter((entry): entry is AgencyBudgetMinimum => Boolean(entry));
  } catch {
    return [];
  }
}

/**
 * Builds the `Agency.listing` block - the fields that exist only because
 * an agency told us and that no importer can ever write.
 *
 * @param override - The CMS document.
 * @returns The block, or null when the document carries none of it (a
 *          listing that only corrects a budget adds no block at all).
 */
function buildListingBlock(override: AgencyListingOverride): AgencyListing | null {
  try {
    const listing: AgencyListing = {
      verifiedAt: text(override.verifiedAt),
      awardsNote: text(override.awardsNote),
      engagementNote: text(override.engagementNote),
      exclusions: list(override.exclusions) ?? [],
      budgetMinimums: toBudgetMinimums(override.budgetMinimums),
    };
    const isEmpty =
      !listing.verifiedAt &&
      !listing.awardsNote &&
      !listing.engagementNote &&
      listing.exclusions.length === 0 &&
      listing.budgetMinimums.length === 0;
    return isEmpty ? null : listing;
  } catch {
    return null;
  }
}

/**
 * Applies one CMS listing to one scraped agency record.
 *
 * Source attribution is untouched on purpose: `source`, `profileUrl`,
 * `slug`, `scrapedAt`, `awards` and `rating` are what the named directory
 * published, and this document is not that directory. An agency that
 * disputes its award tally gets an `awardsNote` next to it, not a rewrite
 * of it - see `AgencyListing.awardsNote` in ./types.ts.
 *
 * @param agency - The scraped record.
 * @param override - The CMS document for it.
 * @returns A new record with the corrections applied. The input is never
 *          mutated - the baseline array is module-scoped and shared.
 */
export function applyAgencyListing(
  agency: Agency,
  override: AgencyListingOverride | null | undefined,
): Agency {
  try {
    if (!override) return agency;

    const overrideClients = (override.clients ?? [])
      .map(toAgencyClient)
      .filter((client): client is AgencyClient => Boolean(client));

    // `domain` is not just a dedupe key by the time a record reaches a
    // page: the card prints it as the label on the website link, and
    // `isSuperflowPartner` joins the partner list on it. Leaving the
    // scraped domain behind a corrected website therefore labels the new
    // site with the old host, and keeps badging (or not badging) the
    // agency on a domain it has left. Dedupe already ran in
    // `mergeAgencySources` before any of this, so re-deriving it here
    // cannot disturb it.
    const website = text(override.website);
    const derivedDomain = website ? normalizeDomain(website) : null;

    const location = override.location;
    const city = text(location?.city);
    const country = text(location?.country);
    const countryCode = text(location?.countryCode);
    const hasLocation = Boolean(city || country || countryCode);

    return {
      ...agency,
      name: text(override.name) ?? agency.name,
      website: website ?? agency.website,
      domain: derivedDomain ?? agency.domain,
      description: text(override.description) ?? agency.description,
      logoUrl: text(override.logoUrl) ?? agency.logoUrl,
      // Field by field, like everything else here - an empty field is not
      // a correction. Replacing the location wholesale reads plausible
      // (a studio that moved city has likely moved country too) but it
      // makes the commonest edit destructive: the override document's
      // location starts empty, so an editor fixing only a wrong
      // `countryCode` sees two blank boxes, leaves them blank, and wipes
      // the city and country - which also drops the agency out of the
      // category page's country filter. A studio that really has moved
      // fills in both boxes and gets exactly what it asked for.
      location: hasLocation
        ? {
            city: city ?? agency.location?.city ?? null,
            country: country ?? agency.location?.country ?? null,
            countryCode:
              (countryCode ?? agency.location?.countryCode)?.toUpperCase() ?? null,
          }
        : agency.location,
      services: list(override.services) ?? agency.services,
      industries: list(override.industries) ?? agency.industries,
      teamSize: text(override.teamSize) ?? agency.teamSize,
      foundedYear:
        typeof override.foundedYear === "number" && Number.isFinite(override.foundedYear)
          ? override.foundedYear
          : agency.foundedYear,
      accolades: list(override.accolades) ?? agency.accolades,
      budgetLabel: text(override.budgetLabel) ?? agency.budgetLabel,
      budgetFloorUsd:
        typeof override.budgetFloorUsd === "number" && Number.isFinite(override.budgetFloorUsd)
          ? override.budgetFloorUsd
          : agency.budgetFloorUsd,
      clients: mergeClients(agency.clients ?? [], overrideClients, override.clientsMode),
      listing: buildListingBlock(override),
    };
  } catch {
    return agency;
  }
}

/**
 * Applies every CMS listing to the dataset it corrects.
 *
 * A listing whose `agencySlug` matches no record is dropped silently: the
 * CMS cannot add an agency to the directory (see the header of
 * sanity/schemas/agencyListing.ts), and a slug that has gone away because
 * a source stopped listing an agency is a normal thing to find, not an
 * error worth failing a build over.
 *
 * @param agencies - The merged scraped dataset.
 * @param overrides - Every `agencyListing` document.
 * @returns The dataset with corrections applied, in its original order.
 */
export function applyAgencyListings(
  agencies: Agency[],
  overrides: AgencyListingOverride[] | null | undefined,
): Agency[] {
  try {
    if (!overrides?.length) return agencies;

    const bySlug = new Map<string, AgencyListingOverride>();
    for (const override of overrides) {
      const slug = text(override?.agencySlug);
      if (!slug) continue;
      // First wins - which is only meaningful because the query hands
      // these over sorted newest-updated first (see
      // `getAgencyListingOverrides`). Unordered, "first" would be whatever
      // Sanity happened to return, and a second listing for one agency
      // would make the rendered page flip between two versions of the
      // truth. The schema also refuses to save a duplicate slug, so this
      // is the second line of defence rather than the first.
      if (!bySlug.has(slug)) bySlug.set(slug, override);
    }
    if (bySlug.size === 0) return agencies;

    return agencies.map((agency) => {
      const override = agency?.slug ? bySlug.get(agency.slug) : undefined;
      return override ? applyAgencyListing(agency, override) : agency;
    });
  } catch {
    return agencies;
  }
}
