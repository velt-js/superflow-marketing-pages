// Shared data contract for the agency directory.
//
// This file is the seam between two independent pieces:
//   1. scripts/directory-import/* writes JSON conforming to `Agency`.
//   2. app/directory/* reads that JSON and renders it.
// Both sides import from here, so the shape is defined exactly once.
// Treat this file as an interface: changing a field means changing both
// the scraper and the pages in the same commit.

/** Source directory an agency record was collected from. */
export type AgencySource = "awwwards";

/** Where an agency is based. Fields are independently nullable because
 *  source profiles frequently list a country with no city. */
export interface AgencyLocation {
  country: string | null;
  countryCode: string | null;
  city: string | null;
}

/** Award tallies as reported by the source profile. Counts are integers;
 *  a source that omits a given award type yields 0, not null, so callers
 *  can sort without null-guarding every field. */
export interface AgencyAwards {
  siteOfTheDay: number;
  siteOfTheMonth: number;
  siteOfTheYear: number;
  developerAward: number;
  honorableMentions: number;
  nominees: number;
  /** Sum of all award types. Precomputed so sort paths stay cheap. */
  total: number;
}

/** One agency in the directory. */
export interface Agency {
  /** URL-safe identifier, unique across the dataset. Derived from `domain`
   *  when available, else from `name`. Stable across re-scrapes. */
  slug: string;
  name: string;
  /** Normalised absolute https URL of the agency's own site, or null when
   *  the source profile lists none. */
  website: string | null;
  /** Registrable domain (eTLD+1), lowercased, no `www.`. This is the
   *  dedupe key across sources — never dedupe on `name`. */
  domain: string | null;
  /** Absolute URL of the source profile this record came from. Required:
   *  it is the attribution link rendered on the page. */
  profileUrl: string;
  location: AgencyLocation | null;
  /** Directory category slugs this agency belongs to, e.g. ["web-design"].
   *  Must match `DirectoryCategory.slug` values. */
  categories: string[];
  /** Free-text services as listed on the source profile. */
  services: string[];
  /** Team size as a raw source string (e.g. "11-50"), not parsed into a
   *  range — sources disagree on bucket boundaries. */
  teamSize: string | null;
  /** Absolute URL of the agency logo/avatar image, or null. */
  logoUrl: string | null;
  /** Short profile blurb, plain text, HTML stripped. */
  description: string | null;
  awards: AgencyAwards;
  source: AgencySource;
  /** ISO-8601 timestamp of when this record was collected. */
  scrapedAt: string;
}

/**
 * The set of agencies that are Superflow customers/partners, which is what
 * the "Superflow partner" badge attests to.
 *
 * Deliberately a SEPARATE file from agencies.json, not a field on `Agency`:
 * the scraper overwrites agencies.json wholesale on every run, so a flag
 * stored there would be silently wiped on the next refresh. This list is
 * sourced from CRM/billing, joined onto agencies at read time by domain.
 *
 * Domains must be registrable (eTLD+1), lowercased, no `www.` - matching
 * `Agency.domain` exactly, since that is the join key.
 */
export interface SuperflowPartnerList {
  /** Free-text note on where this list came from and how to refresh it. */
  source: string;
  /** ISO-8601 date the list was last reconciled against CRM. */
  updatedAt: string | null;
  /** Registrable domains of partner agencies. */
  domains: string[];
}

/** A browsable slice of the directory, rendered at /directory/<slug>. */
export interface DirectoryCategory {
  slug: string;
  /** Display name, e.g. "Web Design". */
  title: string;
  /** H1 copy for the category page. */
  heading: string;
  /** Sub-heading / intro copy. */
  subheading: string;
  /** Meta description for the category page. */
  metaDescription: string;
}
