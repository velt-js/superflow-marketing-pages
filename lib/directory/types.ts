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
 *  `scripts/directory-import/`; the two are merged at read time.
 *
 *  `clutch`, `designrush` and `dandad` are browser-sourced rather than
 *  scraped: all three sit behind bot walls that the honest-UA fetch in the
 *  scraper scripts cannot clear, so their records are collected by hand
 *  through a browser session and validated on the way in by
 *  `scripts/directory-import/load-branding-json.mjs`. They share one data
 *  file (`branding-agencies.json`) because one loader writes all three -
 *  the one-file-per-writer rule is about which SCRIPT overwrites what, not
 *  about which directory the rows came from.
 *
 *  `motion-design-awards` is scraped, not browser-sourced. It is the only
 *  source found that publishes premium motion studios in machine-readable
 *  form: an awards jury rather than a business directory, so it carries no
 *  budget, rating, team size or client data at all (see the null-heavy
 *  record shape its importer writes). Its wins live in `accolades`, not in
 *  `awards` - that tally is Awwwards' scheme, and calling a Video of the
 *  Day a "Site of the Day" would be a false claim about a different jury. */
export type AgencySource =
  | "awwwards"
  | "semrush"
  | "clutch"
  | "designrush"
  | "dandad"
  | "motion-design-awards";

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

/* ------------------------------------------------------------------ *
 * Claim / enrichment layer
 *
 * Everything below describes what an AGENCY tells us about itself, or
 * what we correct by hand, as opposed to what a source directory
 * published about it. The two are kept in different files for the same
 * reason `SuperflowPartnerList` is: the importers under
 * scripts/directory-import/ overwrite their own data files wholesale on
 * every run, so a field stored on `Agency` would be wiped the next time
 * a scrape ran. Claims live in `lib/directory/data/claims.json` (the
 * committed layer) and in the KV store (the live layer) and are joined
 * onto agencies at read time by slug - see lib/directory/claims.ts.
 * ------------------------------------------------------------------ */

/** Build platforms an agency can say it works on. Closed set, because it
 *  is a filter: free text here would give every studio its own spelling
 *  of "Webflow" and the filter would match none of them. */
export type AgencyPlatform =
  | "webflow"
  | "framer"
  | "shopify"
  | "wordpress"
  | "nextjs"
  | "custom"
  | "other";

/**
 * What an agency (or we, on its behalf) says about how it takes work.
 *
 * Every field is nullable or empty-by-default, which is the whole design:
 * the directory ships ~320 unclaimed listings and each one has to keep
 * rendering while it carries none of this. A null is always "did not
 * say", never "zero" or "no" - the distinction matters most on
 * `minBudgetUsd`, where a zero would mean "takes work at any budget" and
 * a null means we cannot filter on it at all.
 *
 * Two kinds of record share this shape, distinguished by `claimed`:
 *
 * 1. A CLAIM, written by the agency through /directory/claim after a
 *    magic-link round trip. `claimed` is true, and `verified` is true
 *    when the claiming email's domain matched the agency's own.
 * 2. An EDITORIAL OVERLAY, written by us into claims.json - a budget
 *    answered in a reply to the outbound campaign, a miscategorisation
 *    corrected, a city looked up. `claimed` stays false: we filled in a
 *    fact, the agency did not claim the listing, and the profile must
 *    not badge it as if it had.
 */
export interface AgencyClaim {
  /** `Agency.slug` this record attaches to. The join key. */
  slug: string;
  /** True only when the agency itself completed the claim form. Drives
   *  the "Verified" badge's precondition and 40 points of ranking score,
   *  so an editorial overlay must never set it. */
  claimed: boolean;
  /** ISO-8601 timestamp of the completed claim, or null. */
  claimedAt: string | null;
  /** Email that completed the claim. Not rendered; kept so a later edit
   *  request can be matched against who claimed it. */
  claimedByEmail: string | null;
  /** True when `claimedByEmail`'s domain matched the agency's website
   *  domain at claim time. This is what the "Verified" badge attests to
   *  and the only claim it makes: somebody with an address at the
   *  agency's own domain filled the form in. Not a quality judgement. */
  verified: boolean;

  /** Agency-written blurb, replacing the scraped `Agency.description`
   *  when present. Capped at DESCRIPTION_MAX_CHARS. */
  description: string | null;
  /** Smallest project the agency will take, in whole USD. Null is "not
   *  stated" and is filtered differently from a number - see
   *  `matchesBudgetFilter` in lib/directory/filters.ts. */
  minBudgetUsd: number | null;
  /** Bottom of the range a typical project lands in, in whole USD. */
  typicalBudgetMin: number | null;
  /** Top of that range, in whole USD. */
  typicalBudgetMax: number | null;
  /** How long a typical project runs, in weeks. */
  typicalTimelineWeeks: number | null;
  /** Platforms the agency builds on. */
  platforms: AgencyPlatform[];
  /** Agency-written service tags, replacing the scraped `Agency.services`
   *  when non-empty. Capped at SERVICES_MAX. */
  services: string[];
  /** "What kind of work do you say no to." The most useful sentence on
   *  most profiles and the one no source directory publishes. */
  declines: string | null;
  /** Named startup clients, up to STARTUP_CLIENTS_MAX. */
  startupClients: string[];
  /** A standing offer for YC companies, e.g. "15% off the first
   *  project". Free text so an agency can offer whatever it likes. */
  ycOffer: string | null;

  /** Where match requests are routed. NEVER rendered on a public page -
   *  publishing it would turn the directory into a scrape-ready lead
   *  list and the agencies would stop answering. */
  contactEmail: string | null;
  /** Who those requests should be addressed to. Safe to render. */
  contactName: string | null;
  /** "We reply within N business days", as stated by the agency. */
  responseSlaDays: number | null;
  /** False when the agency has told us it is full. Defaults true, which
   *  is why an unclaimed listing is still routed match requests. */
  acceptingProjects: boolean;
  /** ISO-8601 timestamp of the last edit made through the claim form. */
  updatedByAgencyAt: string | null;

  /* -- Editorial overlay fields -------------------------------------- *
   * Corrections to scraped data. These are ours, not the agency's, and
   * apply whether or not the listing is claimed.                       */

  /** City, when the source recorded a country only and we looked it up.
   *  See `formatAgencyPlace` in lib/directory/agencies.ts for why a
   *  country on its own is not rendered. */
  city: string | null;
  /** A better logo than the source's, e.g. one fetched from the agency's
   *  own site at 128px. See lib/directory/logos.ts. */
  logoUrl: string | null;
  /** Corrects the category a listing leads with. Several records are
   *  filed under the category of the awards jury that published them
   *  rather than the one the studio would choose for itself. */
  primaryCategory: string | null;
  /** Additional categories the agency also belongs in, so one studio can
   *  appear in two listings without duplicating its record. */
  secondaryCategories: string[];
  /** Free-text note on where this record came from - "reply to campaign
   *  email 2, 2026-09-03", "claimed via /directory/claim". Provenance,
   *  for whoever reads claims.json next. */
  sourceNote: string | null;
}

/**
 * A founder's project brief, routed to three agencies.
 *
 * Stored (KV) rather than emailed and forgotten, because the count of
 * these and the share landing on claimed agencies are two of the three
 * numbers the directory is measured on.
 */
export interface MatchRequest {
  /** Opaque id, also the KV key suffix. */
  id: string;
  createdAt: string;
  founderName: string;
  founderEmail: string;
  company: string;
  companyUrl: string | null;
  /** e.g. "W22". Optional, and never verified against YC. */
  ycBatch: string | null;
  /** `DirectoryCategory.slug` the request is for. */
  category: string;
  /**
   * What the founder can spend, in whole USD - the TOP of the bucket
   * they picked, not the bottom.
   *
   * The spec this was built from says to route on budgets "at or below
   * the founder's budget floor", but read literally that excludes
   * agencies the founder can plainly afford: a founder in the "$10k to
   * $25k" band would never be shown a studio with a $20k minimum. So
   * the stored figure is the ceiling and the rule is
   * `agency.minBudgetUsd <= request.budgetUsd`. `budgetBucket` keeps the
   * band the founder actually chose, for reporting.
   */
  budgetUsd: number;
  /** The band the founder picked, e.g. "10k-25k". */
  budgetBucket: string;
  /** Weeks the founder has, as the top of the band they picked. 0 means
   *  "flexible" - no deadline stated. */
  timelineWeeks: number;
  /** The band the founder picked, e.g. "4-8". */
  timelineBucket: string;
  platformPref: AgencyPlatform | null;
  brief: string;
  status: "new" | "routed" | "closed";
  /** The three (or fewer) agencies this was sent to. */
  routedAgencySlugs: string[];
  /** utm_source when present, else "directory". */
  source: string;
}

/**
 * One-shot credential proving control of an agency's email domain.
 *
 * Single use and short lived: the token IS the authentication for the
 * enrich form, so a leaked link that stayed valid would let anyone
 * rewrite a listing. `usedAt` is set the moment a claim is submitted and
 * checked before the form renders.
 */
export interface ClaimToken {
  token: string;
  agencySlug: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
  /** True when the email domain matched the agency's website domain.
   *  Carried on the token so the submit handler does not have to
   *  re-derive it (and cannot disagree with what the start step
   *  decided). */
  verified: boolean;
}
