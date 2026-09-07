// Shared data contract for the agency directory.
//
// This file is the seam between two independent pieces:
//   1. scripts/directory-import/* writes JSON conforming to `Agency`.
//   2. app/directory/* reads that JSON and renders it.
// Both sides import from here, so the shape is defined exactly once.
// Treat this file as an interface: changing a field means changing both
// the scraper and the pages in the same commit.

/** Source directory an agency record was collected from. Each source owns
 *  exactly one data file under `lib/directory/data/` and one importer under
 *  `scripts/directory-import/`; the two are merged at read time. */
export type AgencySource = "awwwards" | "semrush";

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

/**
 * Aggregate review score as published by the source directory.
 *
 * Separate from `AgencyAwards` because the two are different kinds of
 * claim and must never be summed: an award tally is a count of things a
 * jury gave out, a rating is an average of what clients said. Sources
 * carry one or the other, never both - Awwwards has no reviews, Semrush
 * has no award counts - so a record with `awards.total === 0` and a
 * non-null `rating` is normal, not incomplete data.
 */
export interface AgencyRating {
  /** The score itself, e.g. 4.8. */
  value: number;
  /** Top of the scale the score is out of, e.g. 5. Stored rather than
   *  assumed so a future 10-point source doesn't silently render as a
   *  near-perfect 5-point score. */
  scale: number;
  /** How many reviews the score averages over. Zero is meaningful - it
   *  says "listed but unreviewed", which is why the whole `rating` object
   *  is null rather than a zeroed one when a source has no reviews at
   *  all. Weighted against `value` when ranking, so a lone 5-star review
   *  cannot outrank a well-reviewed 4.8. */
  reviewCount: number;
}

/** One brand an agency has shipped work for, as attested by its source
 *  profile - an awarded submission on Awwwards, a named client logo or
 *  success story on Semrush. */
export interface AgencyClient {
  /** Display name of the brand, e.g. "Coca-Cola". Already normalised - this
   *  is what gets rendered, not the raw project title. */
  name: string;
  /** Registrable domain (eTLD+1) of the client's own site, when the awarded
   *  work is hosted there. Null when the work lives on the agency's own
   *  domain or a generic host (agency-hosted campaign microsites are common).
   *  This is the dedupe key when present - never dedupe on `name`, since two
   *  sources spell the same brand differently. */
  domain: string | null;
  /** Title of the project this client was derived from, verbatim from the
   *  source. Kept so the rendered name is always traceable back to a real
   *  piece of work rather than looking asserted out of nowhere. Falls back
   *  to the client name itself when the source names the client directly
   *  (a client logo wall) rather than through a project. */
  projectTitle: string;
  /** Absolute URL of the source's page for that project, or null. The
   *  attribution link, same role `profileUrl` plays for the agency. Null
   *  for sources that list clients without a per-project page. */
  projectUrl: string | null;
  /** True when this is a brand a general audience would recognise (Nike,
   *  Coca-Cola, Spotify) rather than a local or niche client. Set by an
   *  importer that runs a normalisation pass, never inferred at render
   *  time. Drives ordering so recognisable names surface first.
   *
   *  An importer whose source already publishes clean, deliberately
   *  ordered client names leaves this `false` throughout rather than
   *  guessing: false here means "not asserted to be notable", never
   *  "asserted not to be notable", so a uniformly-false list simply keeps
   *  the source's own ordering. */
  notable: boolean;
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
  /** Aggregate client review score, or null when the source publishes
   *  none. Every field on this record is source-reported; nothing here is
   *  computed by us, so a rendered rating is always attributable to the
   *  directory linked from `profileUrl`. */
  rating: AgencyRating | null;
  /** Named recognitions the source lists for this agency - awards,
   *  certifications, accreditations - as free text, e.g. "UK Search
   *  Awards", "ISO Certification".
   *
   *  Deliberately NOT folded into `awards`: those are counted tallies from
   *  one known scheme and can be summed and ranked, these are unverified
   *  self-reported labels of mixed kinds that can only be listed. Keeping
   *  them apart stops "6 accolades" from ever being presented as if it
   *  meant the same thing as "6 Awwwards awards". */
  accolades: string[];
  /** Year the agency was founded, as a four-digit number, or null when
   *  the source lists none. A number rather than the source's raw string
   *  so "operating since" can be derived at render time. */
  foundedYear: number | null;
  /** Client industries the agency lists expertise in, e.g. ["Ecommerce",
   *  "Fintech"]. Free text from the source, same as `services`. */
  industries: string[];
  /** Typical project budget as a raw source label (e.g. "Starting from
   *  $5,000"), not parsed into a number - sources phrase this as bands,
   *  minimums and ranges that do not reduce to one figure without
   *  inventing precision the source never gave. Null when unlisted. */
  budgetLabel: string | null;
  /**
   * Lower bound, in whole US dollars, of the cheapest project the agency
   * says it will take on. 5000 means "will not take work under $5,000".
   *
   * The machine-readable counterpart to `budgetLabel`, which is a display
   * string and cannot be compared or filtered. Both exist because they
   * answer different questions and neither derives cleanly from the other:
   * re-parsing a number back out of a localised label is brittle, and
   * rendering a bare number loses the band phrasing the source chose.
   *
   * This is a floor, never a price or a quote - it is the bottom of the
   * lowest band the agency accepts, so an agency listed here at 5000 may
   * well charge far more. Null when the source lists no bands at all,
   * which is NOT the same as zero: zero means "takes work at any budget",
   * null means "did not say".
   */
  budgetFloorUsd: number | null;
  /** Brands this agency has built awarded work for, most recognisable first.
   *  Derived by the scraper from the awarded submissions on the source
   *  profile - which is why it lives here on `Agency` (scraper-owned, like
   *  `awards`) rather than in a side file the way partner status does.
   *  Empty when the source listed no attributable work. */
  clients: AgencyClient[];
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
