#!/usr/bin/env node
/**
 * Imports SEO agency profiles from the Semrush Agency Partners directory
 * (https://agencies.semrush.com) and writes them to
 * lib/directory/data/seo-agencies.json, conforming to the `Agency` interface
 * in lib/directory/types.ts.
 *
 * This is the sibling of scripts/directory-import/scrape-awwwards.mjs: same
 * standalone-.mjs-with-no-shared-module structure (constants and helpers are
 * duplicated here on purpose, not imported, exactly as that script's own
 * header explains - there is no build step for either script, so a shared
 * module would need one). One real difference: Semrush's directory is a
 * public JSON API, not server-rendered HTML, so there is no DOM to parse and
 * this script has no jsdom dependency.
 *
 * The SEO category is PREMIUM-ONLY: an agency qualifies only if its
 * cheapest listed project budget (`Agency.budgetFloorUsd`) is at or above
 * SEO_MIN_BUDGET_FLOOR_USD. This importer takes its WHOLE qualifying pool
 * by default (currently ~295 agencies), not a top-N slice - `--limit` only
 * exists as a cap for quick test runs.
 *
 * Two-endpoint crawl, but NOT a simple "fetch N and stop":
 *   1. Paginated listing (`GET /api/agencies/?services=<id>&...&pageNumber=<n>`) -
 *      cheap, ~36 pages, gives a slim {alias, name, rating, reviewCount} per
 *      agency, filtered to the premium floor as it goes (see
 *      collectListingCandidates) - no profile fetch is wasted on an agency
 *      that can never qualify. ALL pages are walked first regardless of
 *      `--limit`, because Semrush's listing order openly includes paid
 *      placements (`paidPlacements` in the response) and taking the first N
 *      as given would rank paying agencies highest.
 *   2. Every qualifying candidate is ranked ourselves by a shrinkage-adjusted
 *      score (see computeRankingScore), then the whole ranked pool (or a
 *      `--limit`-capped slice of it) goes on to `GET /api/agencies/<alias>/`,
 *      the full profile.
 *
 * Politeness (non-negotiable - see scripts/directory-import/README.md):
 *   - robots.txt is fetched and parsed at runtime; disallowed paths are skipped.
 *   - Max 2 concurrent requests, minimum 1000ms between request starts.
 *   - Exponential backoff on 429/5xx, up to 3 retries, then the URL is
 *     recorded as a failure and the run continues.
 *   - An on-disk JSON cache (separate directory from the Awwwards HTML
 *     cache) avoids re-hitting the site on re-runs.
 *   - A hard total-request cap protects against runaway crawls.
 *
 * Usage:
 *   node scripts/directory-import/import-semrush.mjs [--limit N]
 *
 * See scripts/directory-import/README.md for full flag/cache documentation.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------- Paths ----------

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

/** Separate from the Awwwards script's `.cache/` - these are cached JSON API
 *  responses from a different origin, not HTML, so a shared cache directory
 *  would risk key collisions and would just be confusing to inspect. */
const CACHE_DIRECTORY = path.join(SCRIPT_DIRECTORY, ".cache-semrush");

const OUTPUT_FILE_PATH = path.join(
  SCRIPT_DIRECTORY,
  "..",
  "..",
  "lib",
  "directory",
  "data",
  "seo-agencies.json",
);

// ---------- Site / network constants ----------

const SEMRUSH_ORIGIN = "https://agencies.semrush.com";
const ROBOTS_URL = `${SEMRUSH_ORIGIN}/robots.txt`;

/** Both the listing and profile JSON endpoints live under this path prefix:
 *  `${API_AGENCIES_PATH}?services=...&pageNumber=N` for the listing, and
 *  `${API_AGENCIES_PATH}<alias>/` for one agency's profile. */
const API_AGENCIES_PATH = "/api/agencies/";

/** Identifies this crawler honestly, with a contact URL, per the brief. Same
 *  bot identity as the Awwwards script - it is the same crawler run against
 *  a second source, not a different actor. */
const USER_AGENT = "SuperflowDirectoryBot/1.0 (+https://usesuperflow.ai; mihir@velt.dev)";

/** robots.txt group-matching token for this bot (lowercased, no version). */
const ROBOTS_PRODUCT_TOKEN = "superflowdirectorybot";

/** Default `--limit`: no cap at all. The SEO category is premium-only (see
 *  SEO_MIN_BUDGET_FLOOR_USD below) and takes its WHOLE qualifying pool, not
 *  a top-N slice - `--limit N` still works as an override, capping the
 *  ranked pool for a quick test run, but omitting it must never quietly
 *  truncate the real dataset the way a numeric default would. */
const DEFAULT_LIMIT = null;
const MAX_CONCURRENCY = 2;
const MIN_REQUEST_DELAY_MS = 1000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

/** Absolute ceiling on real HTTP requests for one run (cache hits are free).
 *  Higher than the Awwwards script's 300: this importer now fetches a
 *  profile for its whole qualifying pool rather than a fixed top-N, and
 *  36 listing pages + ~295 profiles (see EXPECTED_QUALIFYING_COUNT) already
 *  exceeds 300. 600 leaves headroom for the pool to grow before this needs
 *  raising again. */
const HARD_REQUEST_CAP = 600;

// ---------- Data-contract constants (mirrors lib/directory/constants.ts;
// this script is plain .mjs with no TS build step, so the value is
// duplicated here on purpose rather than imported - see that file's header
// comment, and the header comment above). ----------

const AGENCY_SOURCE = "semrush";
const CATEGORY_SEO = "seo";

// ---------- SEO service filter ----------

/**
 * The 12 LEAF service ids under Semrush's "SEO" category, discovered by
 * enumerating the filter facets on https://agencies.semrush.com/list/seo/.
 * The listing endpoint's `services` query param takes leaf ids only and
 * OR's repeated params together - passing SEO's own PARENT id (9) is a real
 * trap that returns zero results, so it must never appear here. This union
 * of all 12 leaves is what reproduces the human-facing "SEO" list.
 */
const SEO_LEAF_SERVICES = [
  { id: 73, label: "App Store Optimization" },
  { id: 71, label: "Backlink Management" },
  { id: 54, label: "International SEO" },
  { id: 56, label: "Link Building" },
  { id: 53, label: "Local SEO" },
  { id: 58, label: "Mobile SEO" },
  { id: 72, label: "SEO Consulting" },
  { id: 75, label: "Search Engine Marketing" },
  { id: 77, label: "Shopify SEO" },
  { id: 59, label: "Technical SEO" },
  { id: 74, label: "Wordpress SEO" },
  { id: 76, label: "YouTube SEO" },
];

/** Id of the "SEO" PARENT group within `agency.services` (confirmed against
 *  cached profile data: `{id: 9, name: "SEO", alias: "seo"}`) - the same id
 *  that must never appear in a listing `services` query param (see the
 *  comment above SEO_LEAF_SERVICES). Used by flattenServicesSeoFirst() to
 *  find and front-load this group, not to filter anything. */
const SEO_PARENT_SERVICE_ID = 9;

/** Plausibility checks only (see collectListingCandidates) - Semrush's own
 *  numbers at the time this script was written, not hard requirements. A
 *  mismatch is logged as a warning, never a fatal error, since Semrush is
 *  free to add/remove agencies or leaf services at any time. */
const EXPECTED_LISTING_PAGE_COUNT = 36;
const EXPECTED_APPROXIMATE_TOTAL_AGENCIES = 1419;
const PLAUSIBILITY_TOLERANCE_RATIO = 0.3;

/**
 * Sanity bounds on the SIZE OF THE QUALIFYING POOL (agencies with
 * `budgetFloorUsd >= SEO_MIN_BUDGET_FLOOR_USD`), unlike the plausibility
 * constants above which bound the raw, unfiltered listing. This one is
 * treated as a hard stop, not a warning: if the qualifying count lands
 * wildly outside this range, Semrush's budget-band semantics have likely
 * moved under us (a changed band id→amount mapping, a renamed band, etc.),
 * and writing a file gated on a broken filter would be worse than writing
 * nothing. See the abort check in main().
 */
const EXPECTED_QUALIFYING_COUNT = 295;
const QUALIFYING_COUNT_MIN = 250;
const QUALIFYING_COUNT_MAX = 350;

// ---------- Ranking constants ----------

/** Shrinkage prior for computeRankingScore - see that function's doc comment. */
const RANKING_SHRINKAGE_PRIOR = 5;

// ---------- Rating constants ----------

/** Semrush publishes ratings out of 5 stars. Stored explicitly on the output
 *  record (AgencyRating.scale) rather than assumed at render time, per that
 *  field's doc comment in lib/directory/types.ts. */
const RATING_SCALE = 5;

// ---------- Description constants ----------

/** Semrush's `detailedDescription.en` blurbs commonly run to several
 *  thousand characters of marketing copy - far too long for the directory
 *  card or even the detail page. Capped here rather than left to the
 *  renderer, so every consumer of this JSON gets an already-reasonable
 *  string. ~600 characters is roughly two short paragraphs. */
const DESCRIPTION_MAX_LENGTH = 600;

/** A sentence-boundary cut shorter than this fraction of DESCRIPTION_MAX_LENGTH
 *  is judged "too aggressive a cut" (e.g. a stray period 40 characters in)
 *  and a plain word-boundary cut is used instead. */
const DESCRIPTION_SENTENCE_BOUNDARY_MIN_RATIO = 0.4;

const TRUNCATION_ELLIPSIS = "…";

/** HTML tags whose boundaries must become a space, not nothing, when
 *  stripped - otherwise "<p>Foo</p><p>Bar</p>" collapses to "FooBar". */
const HTML_BLOCK_BOUNDARY_TAG_PATTERN = /<\/?(p|div|br|li|ul|ol|h[1-6])[^>]*>/gi;

/** Named HTML entities this script decodes, per the brief's minimum list.
 *  Numeric entities (`&#39;`, `&#x27;`, ...) are handled separately in
 *  decodeHtmlEntities, not listed here. */
const NAMED_HTML_ENTITIES = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
};

// ---------- Budget constants ----------

const BUDGET_LABEL_PREFIX = "Starting from ";

/** Prefix used instead of BUDGET_LABEL_PREFIX for Semrush's lowest band,
 *  which is "$0 - 1,000". "Starting from $0" reads as "this agency works
 *  for free", which is not what the band means and is not something the
 *  source claims - the band means "up to $1,000". Rendering its UPPER
 *  bound behind this prefix says that, and is the one case where the
 *  upper bound is the honest figure to show. */
const BUDGET_UNDER_LABEL_PREFIX = "Under ";

/** Matches a lower bound of zero, in any of the forms Semrush writes it
 *  ("$0", "$0.00"), so the band above can be detected without
 *  string-matching the whole band name (which is localised). */
const BUDGET_ZERO_LOWER_BOUND_PATTERN = /^\$0(?:\.0+)?$/;

/** Splits a two-sided budget band into its lower and upper figures, e.g.
 *  "$0 - 1,000" -> ["$0", "1,000"]. Note the upper bound carries NO dollar
 *  sign in Semrush's own formatting, which is why it is matched separately
 *  rather than by reusing the lower bound's pattern, and why
 *  `BUDGET_CURRENCY_SYMBOL` is prepended when it is rendered. Open-ended
 *  top bands ("$25,000+") simply do not match, leaving the lower-bound
 *  path below to handle them. */
const BUDGET_BAND_RANGE_PATTERN = /(\$[\d,]+(?:\.\d+)?)\s*[-–—]\s*\$?([\d,]+(?:\.\d+)?)/;

/** Prepended to a band's upper bound, which the source writes bare. */
const BUDGET_CURRENCY_SYMBOL = "$";

/** Matches the first dollar figure in a budget band name, e.g. "$5,000" out
 *  of "$5,000 - 10,000". */
const BUDGET_AMOUNT_PATTERN = /\$[\d,]+(?:\.\d+)?/;

// ---------- Budget floor (premium filter) ----------

/**
 * Authoritative floor, in whole USD, per Semrush budget-band id - confirmed
 * against real listing/profile payloads during development (both carry the
 * same `{name, id}` band shape). This is the tie-breaker when a band's own
 * `name` string parses to a different figure than its id implies: the id is
 * fixed and known-correct, string parsing (parseBudgetFloorFromName) is a
 * best-effort fallback for any band id not listed here.
 */
const BUDGET_BAND_FLOOR_BY_ID = {
  1: 0,
  2: 1000,
  3: 2500,
  4: 5000,
  5: 10000,
  6: 25000,
};

/**
 * Mirrors lib/directory/constants.ts's `SEO_MIN_BUDGET_FLOOR_USD` (not
 * imported - see this file's header comment on why constants are
 * duplicated). The SEO category is premium-only as of this constant: every
 * record this importer writes must have `budgetFloorUsd` at or above this
 * figure. Enforced by filtering candidates at the LISTING stage, BEFORE
 * ranking and BEFORE any profile fetch (see collectListingCandidates), and
 * re-checked once more after the profile fetch in main() in case listing
 * and profile budgets ever disagree for one agency - never as a silent
 * post-hoc filter on the written file alone.
 *
 * Deliberately NOT implemented via the listing API's own `budgets=` query
 * param, even though one exists - tested during development and rejected:
 * `budgets=5` (the $10-25k band) still returned WebHopers Infotech first,
 * because that param answers "will this agency accept work in this band?",
 * not "is this agency's cheapest engagement at or above this band?".
 * WebHopers accepts $10-25k engagements but its floor is $1,000, so the
 * server-side filter is the wrong semantic for a premium-only gate.
 * Client-side computation via resolveBudgetFloorUsd() is the only way to
 * express "premium only" - do not swap this for the server-side filter.
 */
const SEO_MIN_BUDGET_FLOOR_USD = 5000;

// ---------- Founded-year constants ----------

/** Lower bound for a plausible founding year. Anything below this (or above
 *  the current year, computed at run time) is treated as unparseable rather
 *  than trusted at face value. */
const FOUNDED_YEAR_MIN = 1800;

// ---------- Client constants ----------

/** Upper bound on clients stored per agency. Matches the Awwwards script's
 *  MAX_CLIENTS_PER_AGENCY - the display concern (a dozen names is plenty on
 *  a card/detail page) is the same regardless of source. */
const MAX_CLIENTS_PER_AGENCY = 12;

/** A logo entry whose `alt` text looks like a bare image filename rather
 *  than a brand name is an authoring mistake on Semrush's side, not a real
 *  client name - dropped rather than displayed verbatim. */
const CLIENT_LOGO_FILENAME_PATTERN = /\.(png|jpe?g|gif|webp)$/i;

/** Same idea for `alt` text left as a generic "Screenshot..." placeholder. */
const CLIENT_LOGO_SCREENSHOT_PREFIX = "screenshot";

// ---------- Website URL constants ----------

/** Semrush appends `utm_source=semrush_agency_partners&utm_medium=referral`
 *  (and potentially other utm_* params) to every agency website link. These
 *  attribute traffic to Semrush, not to anything about the agency, and must
 *  not be republished as if they were part of the agency's own URL. */
const UTM_PARAM_PREFIX = "utm_";

// ---------- Best-effort public-suffix list (2-label ccTLD suffixes only)
// ----------
// Duplicated verbatim from scrape-awwwards.mjs - see that script's comment
// above this same table for the accuracy caveat (not a full public suffix
// list, no dependency added for this).
const KNOWN_TWO_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "gov.uk", "ac.uk", "me.uk", "ltd.uk", "plc.uk",
  "co.nz", "org.nz", "govt.nz",
  "com.au", "net.au", "org.au", "edu.au", "gov.au", "id.au",
  "co.za", "org.za", "gov.za",
  "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp",
  "co.kr", "or.kr", "go.kr", "ne.kr",
  "com.br", "net.br", "org.br", "gov.br",
  "com.mx", "org.mx", "gob.mx",
  "co.in", "org.in", "gov.in", "net.in", "firm.in", "gen.in", "ind.in",
  "co.il", "org.il", "gov.il", "net.il", "ac.il",
  "com.sg", "org.sg", "gov.sg", "edu.sg", "net.sg",
  "com.hk", "org.hk", "gov.hk", "edu.hk",
  "com.tw", "org.tw", "gov.tw", "edu.tw",
  "com.cn", "net.cn", "org.cn", "gov.cn",
  "com.ar", "org.ar", "gob.ar", "net.ar",
  "com.co", "org.co", "net.co", "gov.co",
  "com.pe", "org.pe", "gob.pe",
  "com.tr", "org.tr", "gov.tr", "edu.tr", "net.tr",
  "com.pk", "org.pk", "gov.pk", "net.pk",
  "com.my", "org.my", "gov.my", "net.my",
  "com.vn", "org.vn", "gov.vn", "edu.vn", "net.vn",
  "co.id", "or.id", "go.id", "ac.id", "net.id",
  "com.ua", "org.ua", "gov.ua", "net.ua", "kiev.ua",
  "com.gr", "org.gr", "gov.gr", "net.gr", "edu.gr",
]);

// ---------- Small helpers ----------

/**
 * Resolves after the given number of milliseconds.
 * @param {number} milliseconds How long to wait.
 * @returns {Promise<void>} Resolves once the delay has elapsed.
 */
function sleep(milliseconds) {
  try {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  } catch (error) {
    console.warn(`sleep() failed for ${milliseconds}ms: ${error?.message ?? error}`);
    return Promise.resolve();
  }
}

/** Raised for HTTP responses (429/5xx) that should be retried. */
class RetryableHttpError extends Error {
  /**
   * @param {number} statusCode The HTTP status code that triggered the retry.
   */
  constructor(statusCode) {
    try {
      super(`Retryable HTTP status ${statusCode}`);
      this.statusCode = statusCode;
    } catch (error) {
      super(`Retryable HTTP error (status unknown): ${error?.message ?? error}`);
    }
  }
}

/** Raised once HARD_REQUEST_CAP is reached, so callers that walk a sequence
 *  of requests (listing pagination) can distinguish "stop the whole crawl,
 *  gracefully" from an ordinary per-URL failure that should just be logged
 *  and skipped. */
class HardRequestCapReachedError extends Error {
  /**
   * @param {number} limit The configured HARD_REQUEST_CAP value.
   */
  constructor(limit) {
    try {
      super(`Hard request cap of ${limit} reached`);
      this.limit = limit;
    } catch (error) {
      super(`Hard request cap reached (limit unknown): ${error?.message ?? error}`);
    }
  }
}

/**
 * Collapses all whitespace runs into single spaces and trims the result.
 * @param {string | null | undefined} text Raw text.
 * @returns {string | null} Normalised text, or null if nothing remained.
 */
function normalizeWhitespace(text) {
  try {
    if (!text) return null;
    const collapsed = String(text).replace(/\s+/g, " ").trim();
    return collapsed.length > 0 ? collapsed : null;
  } catch (error) {
    console.warn(`normalizeWhitespace() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Slugifies free text into a URL-safe, lowercase, hyphenated token.
 * Duplicated verbatim from scrape-awwwards.mjs.
 * @param {string | null | undefined} text Text to slugify.
 * @returns {string} A slug, possibly empty if `text` had no alphanumerics.
 */
function slugify(text) {
  try {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  } catch (error) {
    console.warn(`slugify() failed for "${text}": ${error?.message ?? error}`);
    return "";
  }
}

/**
 * Reserves a unique slug, appending a numeric suffix on collision.
 * Duplicated verbatim from scrape-awwwards.mjs.
 * @param {string} baseSlug Preferred slug before uniqueness is enforced.
 * @param {Set<string>} usedSlugs Slugs already reserved in this run; mutated
 *   in place with the returned slug.
 * @returns {string} A slug guaranteed not to already be in `usedSlugs`.
 */
function makeUniqueSlug(baseSlug, usedSlugs) {
  try {
    const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : "agency";
    if (!usedSlugs.has(safeBase)) {
      usedSlugs.add(safeBase);
      return safeBase;
    }
    let suffix = 2;
    let candidate = `${safeBase}-${suffix}`;
    while (usedSlugs.has(candidate)) {
      suffix += 1;
      candidate = `${safeBase}-${suffix}`;
    }
    usedSlugs.add(candidate);
    return candidate;
  } catch (error) {
    console.warn(`makeUniqueSlug() failed for "${baseSlug}": ${error?.message ?? error}`);
    const fallbackSlug = `agency-${usedSlugs.size + 1}`;
    usedSlugs.add(fallbackSlug);
    return fallbackSlug;
  }
}

/**
 * Removes utm_* query params from a URL, in place.
 * @param {URL} parsedUrl URL to strip params from (mutated).
 * @returns {void}
 */
function stripUtmParams(parsedUrl) {
  try {
    const keysToRemove = Array.from(parsedUrl.searchParams.keys()).filter((key) =>
      key.toLowerCase().startsWith(UTM_PARAM_PREFIX),
    );
    for (const key of keysToRemove) {
      parsedUrl.searchParams.delete(key);
    }
  } catch (error) {
    console.warn(`stripUtmParams() failed for "${parsedUrl}": ${error?.message ?? error}`);
  }
}

/**
 * Normalises a raw website URL into an absolute https URL with Semrush's
 * tracking query params removed. Based on scrape-awwwards.mjs's function of
 * the same name, extended with the utm_* stripping this source requires.
 *
 * Decodes HTML entities in the raw href BEFORE parsing it as a URL - a small
 * number of Semrush records (e.g. Kova Team, Ironpaper) carry a literal,
 * un-decoded `&amp;` between query params instead of a real `&`
 * (`?utm_source=x&amp;utm_medium=y`), almost certainly from an href that was
 * HTML-escaped once upstream and never unescaped. Left undecoded, that
 * literal `&` inside `&amp;` becomes a real param separator to
 * URLSearchParams, splitting off a bogus `amp;utm_medium` key that the utm_
 * prefix check below doesn't recognise - the tracking param survives
 * untouched. A real URL's query string has no legitimate reason to contain
 * that literal sequence, so decoding first is safe.
 * @param {string | null | undefined} rawHref Href as returned by the API.
 * @returns {string | null} Absolute https URL, or null if unparseable/absent.
 */
function normalizeWebsiteUrl(rawHref) {
  try {
    if (!rawHref) return null;
    const trimmedHref = decodeHtmlEntities(rawHref.trim());
    if (!trimmedHref) return null;
    const hrefWithProtocol = /^https?:\/\//i.test(trimmedHref)
      ? trimmedHref
      : `https://${trimmedHref}`;
    const parsedUrl = new URL(hrefWithProtocol);
    parsedUrl.protocol = "https:";
    stripUtmParams(parsedUrl);
    // When no query params remain, URL#toString() already omits the "?" -
    // there is nothing extra to do to satisfy "drop the ? entirely".
    return parsedUrl.toString();
  } catch (error) {
    console.warn(`normalizeWebsiteUrl() could not parse "${rawHref}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Derives the registrable domain (eTLD+1), lowercased, `www.` stripped, from
 * a hostname. Duplicated verbatim from scrape-awwwards.mjs - see
 * KNOWN_TWO_LABEL_SUFFIXES for the accuracy caveat.
 * @param {string | null | undefined} hostname Hostname, e.g. from `new URL().hostname`.
 * @returns {string | null} Registrable domain, or null if it cannot be derived.
 */
function getRegistrableDomain(hostname) {
  try {
    if (!hostname) return null;
    const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");
    const labels = normalizedHostname.split(".").filter(Boolean);
    if (labels.length <= 2) return normalizedHostname || null;
    const lastTwoLabels = labels.slice(-2).join(".");
    if (KNOWN_TWO_LABEL_SUFFIXES.has(lastTwoLabels) && labels.length >= 3) {
      return labels.slice(-3).join(".");
    }
    return lastTwoLabels;
  } catch (error) {
    console.warn(`getRegistrableDomain() failed for "${hostname}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Derives a slug base from a registrable domain by slugifying its brand
 * label (the part before the TLD), e.g. "monks.com" -> "monks". Duplicated
 * verbatim from scrape-awwwards.mjs.
 * @param {string | null} domain Registrable domain, or null.
 * @returns {string | null} Slug base, or null if `domain` was null/unusable.
 */
function slugBaseFromDomain(domain) {
  try {
    if (!domain) return null;
    const brandLabel = domain.split(".")[0];
    const slug = slugify(brandLabel);
    return slug.length > 0 ? slug : null;
  } catch (error) {
    console.warn(`slugBaseFromDomain() failed for "${domain}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Resolves the registrable domain of a normalised website URL.
 * @param {string | null} websiteUrl Absolute https URL, or null.
 * @returns {string | null} Registrable domain, or null.
 */
function resolveDomainFromWebsite(websiteUrl) {
  try {
    if (!websiteUrl) return null;
    return getRegistrableDomain(new URL(websiteUrl).hostname);
  } catch (error) {
    console.warn(`resolveDomainFromWebsite() failed for "${websiteUrl}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Decodes the small set of HTML entities this script needs to handle
 * (&amp; &quot; &#39; &lt; &gt; &nbsp; plus general numeric entities), in a
 * single regex pass so an entity produced by decoding one match (e.g. a
 * literal "&amp;lt;" in the source, meaning the text "&lt;") is never
 * re-decoded as if it were markup.
 * @param {string} text Text possibly containing HTML entities.
 * @returns {string} Decoded text.
 */
function decodeHtmlEntities(text) {
  try {
    if (!text) return text;
    return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (fullMatch, entityBody) => {
      if (entityBody.startsWith("#")) {
        const isHex = entityBody[1] === "x" || entityBody[1] === "X";
        const codePoint = isHex
          ? Number.parseInt(entityBody.slice(2), 16)
          : Number.parseInt(entityBody.slice(1), 10);
        return Number.isNaN(codePoint) ? fullMatch : String.fromCodePoint(codePoint);
      }
      return Object.prototype.hasOwnProperty.call(NAMED_HTML_ENTITIES, entityBody)
        ? NAMED_HTML_ENTITIES[entityBody]
        : fullMatch;
    });
  } catch (error) {
    console.warn(`decodeHtmlEntities() failed: ${error?.message ?? error}`);
    return text;
  }
}

/**
 * Strips HTML tags from Semrush's `detailedDescription.en` markup down to
 * plain text, decoding entities and collapsing whitespace.
 * @param {string | null | undefined} html Raw HTML, e.g. "<p>Foo</p><p><br></p>".
 * @returns {string | null} Plain text, or null if nothing usable remained.
 */
function stripHtmlToPlainText(html) {
  try {
    if (!html) return null;
    const withBoundarySpaces = html.replace(HTML_BLOCK_BOUNDARY_TAG_PATTERN, " ");
    const withoutTags = withBoundarySpaces.replace(/<[^>]+>/g, "");
    const decoded = decodeHtmlEntities(withoutTags);
    return normalizeWhitespace(decoded);
  } catch (error) {
    console.warn(`stripHtmlToPlainText() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Truncates a description to at most `maxLength` characters, preferring to
 * cut at the end of a sentence and falling back to a word boundary when the
 * nearest sentence end is too far back to be worth preferring (see
 * DESCRIPTION_SENTENCE_BOUNDARY_MIN_RATIO). Word-boundary cuts get a
 * trailing ellipsis; sentence-boundary cuts already end in punctuation and
 * don't need one.
 * @param {string} text Plain text to truncate.
 * @param {number} maxLength Maximum length of the returned string.
 * @returns {string} `text` unchanged if already short enough, else truncated.
 */
function truncateDescription(text, maxLength) {
  try {
    if (!text || text.length <= maxLength) return text;
    const hardCut = text.slice(0, maxLength);
    const sentenceEndMatch = hardCut.match(/^[\s\S]*[.!?](?=\s|$)/);
    const sentenceCut = sentenceEndMatch ? sentenceEndMatch[0].trim() : null;
    if (sentenceCut && sentenceCut.length >= maxLength * DESCRIPTION_SENTENCE_BOUNDARY_MIN_RATIO) {
      return sentenceCut;
    }
    const lastSpaceIndex = hardCut.lastIndexOf(" ");
    const wordCut = lastSpaceIndex > 0 ? hardCut.slice(0, lastSpaceIndex).trim() : hardCut.trim();
    return `${wordCut}${TRUNCATION_ELLIPSIS}`;
  } catch (error) {
    console.warn(`truncateDescription() failed: ${error?.message ?? error}`);
    return text && text.length > maxLength ? `${text.slice(0, maxLength)}${TRUNCATION_ELLIPSIS}` : text;
  }
}

// ---------- robots.txt handling ----------
// Duplicated verbatim from scrape-awwwards.mjs (same standard grouping,
// wildcard/end-anchor syntax, and longest-match-wins precedence).

/**
 * Parses robots.txt text into user-agent groups, each with its ordered
 * list of Allow/Disallow rules.
 * @param {string} robotsText Raw robots.txt body.
 * @returns {Array<{agents: string[], rules: Array<{type: "allow" | "disallow", path: string}>}>}
 *   Parsed groups.
 */
function parseRobotsGroups(robotsText) {
  try {
    const lines = robotsText.split(/\r?\n/);
    const groups = [];
    let currentGroup = null;
    for (const rawLine of lines) {
      const line = rawLine.split("#")[0].trim();
      if (!line) continue;
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) continue;
      const field = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();
      if (field === "user-agent") {
        if (!currentGroup || currentGroup.rules.length > 0) {
          currentGroup = { agents: [], rules: [] };
          groups.push(currentGroup);
        }
        currentGroup.agents.push(value.toLowerCase());
      } else if ((field === "disallow" || field === "allow") && currentGroup) {
        currentGroup.rules.push({ type: field, path: value });
      }
    }
    return groups;
  } catch (error) {
    console.warn(`parseRobotsGroups() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Picks the robots.txt group that applies to this bot: a group naming our
 * product token if one exists, else the wildcard `*` group, else null. At
 * the time this script was written, agencies.semrush.com/robots.txt has no
 * `User-agent: *` group at all (only named groups for other bots), so this
 * resolves to null and isPathAllowedByRules() defaults every path to
 * allowed - but the fetch/parse still happens at runtime on every run, in
 * case that changes.
 * @param {ReturnType<typeof parseRobotsGroups>} groups Parsed robots.txt groups.
 * @returns {ReturnType<typeof parseRobotsGroups>[number] | null} Applicable group.
 */
function selectApplicableRobotsGroup(groups) {
  try {
    const namedMatch = groups.find((group) =>
      group.agents.some((agent) => agent !== "*" && ROBOTS_PRODUCT_TOKEN.includes(agent)),
    );
    if (namedMatch) return namedMatch;
    const wildcardMatch = groups.find((group) => group.agents.includes("*"));
    return wildcardMatch ?? null;
  } catch (error) {
    console.warn(`selectApplicableRobotsGroup() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Converts a robots.txt path pattern (`*` wildcard, optional trailing `$`
 * end-anchor) into a RegExp matching from the start of the string.
 * @param {string} robotsPath Raw Allow/Disallow path value.
 * @returns {RegExp} Compiled matcher.
 */
function buildRegExpFromRobotsPath(robotsPath) {
  try {
    const hasEndAnchor = robotsPath.endsWith("$");
    const pathWithoutAnchor = hasEndAnchor ? robotsPath.slice(0, -1) : robotsPath;
    const escapedPattern = pathWithoutAnchor
      .split("*")
      .map((segment) => segment.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");
    return new RegExp(`^${escapedPattern}${hasEndAnchor ? "$" : ""}`);
  } catch (error) {
    console.warn(`buildRegExpFromRobotsPath() failed for "${robotsPath}": ${error?.message ?? error}`);
    // Fail closed: a pattern that matches nothing means this rule can never
    // grant access, but also never wrongly block an unrelated path.
    return /$^/;
  }
}

/**
 * Evaluates whether a request path (pathname + search) is allowed under a
 * set of robots.txt rules, using longest-match-wins with Allow breaking ties.
 * @param {string} requestPath Path + query string being requested.
 * @param {Array<{type: "allow" | "disallow", path: string}>} rules Rules for
 *   the applicable user-agent group.
 * @returns {boolean} True if the path is allowed.
 */
function isPathAllowedByRules(requestPath, rules) {
  try {
    let bestMatch = null;
    for (const rule of rules) {
      if (!rule.path) continue;
      const pattern = buildRegExpFromRobotsPath(rule.path);
      if (!pattern.test(requestPath)) continue;
      const isLonger = !bestMatch || rule.path.length > bestMatch.path.length;
      const isTieBrokenByAllow =
        bestMatch && rule.path.length === bestMatch.path.length && rule.type === "allow";
      if (isLonger || isTieBrokenByAllow) bestMatch = rule;
    }
    if (!bestMatch) return true;
    return bestMatch.type === "allow";
  } catch (error) {
    console.warn(`isPathAllowedByRules() failed for "${requestPath}": ${error?.message ?? error}`);
    return false;
  }
}

/**
 * Fetches and parses robots.txt at runtime and returns a predicate for
 * whether a given path is allowed. On any failure to fetch/parse, the
 * predicate defaults to disallowing everything (fail closed).
 * @returns {Promise<(requestPath: string) => boolean>} Path-allowed predicate.
 */
async function loadRobotsRules() {
  try {
    const response = await fetch(ROBOTS_URL, { headers: { "User-Agent": USER_AGENT } });
    if (!response?.ok) {
      console.warn(`robots.txt fetch returned status ${response?.status}; defaulting to fully disallowed.`);
      return () => false;
    }
    const robotsText = await response.text();
    const groups = parseRobotsGroups(robotsText);
    const applicableGroup = selectApplicableRobotsGroup(groups);
    const rules = applicableGroup?.rules ?? [];
    return (requestPath) => isPathAllowedByRules(requestPath, rules);
  } catch (error) {
    console.warn(`loadRobotsRules() failed (${error?.message ?? error}); defaulting to fully disallowed.`);
    return () => false;
  }
}

/**
 * Checks whether a full URL is allowed by robots.txt, using the pathname and
 * query string as the request path.
 * @param {string} urlString Absolute URL to check.
 * @param {(requestPath: string) => boolean} isPathAllowed Predicate from
 *   loadRobotsRules().
 * @returns {boolean} True if allowed; false if disallowed or unparseable.
 */
function isUrlAllowed(urlString, isPathAllowed) {
  try {
    const parsedUrl = new URL(urlString);
    const requestPath = `${parsedUrl.pathname}${parsedUrl.search}`;
    return isPathAllowed(requestPath);
  } catch (error) {
    console.warn(`isUrlAllowed() could not parse "${urlString}": ${error?.message ?? error}`);
    return false;
  }
}

// ---------- Rate-limited, cached, retrying fetch ----------
// Same throttling/backoff/cache machinery as scrape-awwwards.mjs, duplicated
// rather than shared (see header comment). Two differences: the cache
// directory (see CACHE_DIRECTORY above) and the Accept header (JSON here).

let totalRequestCount = 0;
let cacheHitCount = 0;
let lastRequestStartedAt = 0;
let activeWorkerCount = 0;
const throttleQueue = [];
/** @type {Array<{url: string, reason: string}>} */
const failures = [];

/**
 * Queues a task to run under the shared concurrency (2) and minimum-delay
 * (1000ms between starts) limits that govern every network request.
 * @param {() => Promise<string>} task Function performing one HTTP request.
 * @returns {Promise<string>} Resolves/rejects with the task's outcome.
 */
function enqueueThrottled(task) {
  try {
    return new Promise((resolve, reject) => {
      throttleQueue.push({ task, resolve, reject });
      pumpThrottleQueue();
    });
  } catch (error) {
    console.warn(`enqueueThrottled() failed to enqueue task: ${error?.message ?? error}`);
    return Promise.reject(error);
  }
}

/**
 * Starts queued tasks while under the concurrency limit. Reserves each
 * task's start time synchronously (before any `await`) so concurrent workers
 * can't both observe a stale `lastRequestStartedAt` and violate the minimum
 * delay between request starts.
 * @returns {void}
 */
function pumpThrottleQueue() {
  try {
    while (activeWorkerCount < MAX_CONCURRENCY && throttleQueue.length > 0) {
      const { task, resolve, reject } = throttleQueue.shift();
      const now = Date.now();
      const waitMs = Math.max(0, lastRequestStartedAt + MIN_REQUEST_DELAY_MS - now);
      lastRequestStartedAt = now + waitMs;
      activeWorkerCount += 1;
      runThrottledTask(task, waitMs, resolve, reject);
    }
  } catch (error) {
    console.warn(`pumpThrottleQueue() failed: ${error?.message ?? error}`);
  }
}

/**
 * Runs one throttled task after its reserved delay, then frees its worker
 * slot and pumps the queue again.
 * @param {() => Promise<string>} task Function performing one HTTP request.
 * @param {number} waitMs Milliseconds to wait before starting.
 * @param {(value: string) => void} resolve Resolves the caller's promise.
 * @param {(reason: unknown) => void} reject Rejects the caller's promise.
 * @returns {Promise<void>} Resolves once the task settles.
 */
async function runThrottledTask(task, waitMs, resolve, reject) {
  try {
    if (waitMs > 0) await sleep(waitMs);
    const result = await task();
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    activeWorkerCount -= 1;
    pumpThrottleQueue();
  }
}

/**
 * Performs one HTTP GET with exponential backoff on 429/5xx and network
 * errors, up to MAX_RETRIES attempts.
 * @param {string} url Absolute URL to fetch.
 * @returns {Promise<string>} Response body text.
 */
async function fetchWithRetry(url) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      totalRequestCount += 1;
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (response.status === 429 || response.status >= 500) {
        throw new RetryableHttpError(response.status);
      }
      if (!response.ok) {
        // Covers Semrush's `{"message":"Agency not found.","status":false}`
        // 404 among other non-2xx statuses - the body is never read here,
        // since any non-2xx is treated uniformly as "this URL failed".
        throw new Error(`Non-retryable HTTP ${response.status} for ${url}`);
      }
      return await response.text();
    } catch (error) {
      attempt += 1;
      const isNetworkError = error instanceof TypeError;
      const isRetryable = error instanceof RetryableHttpError || isNetworkError;
      if (!isRetryable || attempt > MAX_RETRIES) {
        throw error;
      }
      const backoffMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(
        `Retry ${attempt}/${MAX_RETRIES} for ${url} in ${backoffMs}ms (${error?.message ?? error})`,
      );
      await sleep(backoffMs);
    }
  }
}

/**
 * Builds a deterministic cache file path for a URL.
 * @param {string} url Absolute URL.
 * @returns {string} Absolute path under CACHE_DIRECTORY.
 */
function cacheFilePathForUrl(url) {
  try {
    const hash = createHash("sha256").update(url).digest("hex");
    return path.join(CACHE_DIRECTORY, `${hash}.json`);
  } catch (error) {
    throw new Error(`cacheFilePathForUrl() failed for "${url}": ${error?.message ?? error}`);
  }
}

/**
 * Reads a cached response body for a URL, if present.
 * @param {string} url Absolute URL.
 * @returns {Promise<string | null>} Cached body, or null on a cache miss.
 */
async function readFromCache(url) {
  try {
    const filePath = cacheFilePathForUrl(url);
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    console.warn(`readFromCache() error for "${url}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Writes a response body to the on-disk cache for a URL.
 * @param {string} url Absolute URL.
 * @param {string} body Response body text.
 * @returns {Promise<void>} Resolves once written (or logs and gives up).
 */
async function writeToCache(url, body) {
  try {
    const filePath = cacheFilePathForUrl(url);
    await writeFile(filePath, body, "utf8");
  } catch (error) {
    console.warn(`writeToCache() error for "${url}": ${error?.message ?? error}`);
  }
}

/**
 * Fetches a URL's JSON body as text, transparently using the on-disk cache
 * and the throttled/retrying network fetch. Enforces HARD_REQUEST_CAP before
 * making a real network request (cache hits never count against the cap and
 * are tracked separately in cacheHitCount for the run summary).
 * @param {string} url Absolute URL to fetch.
 * @returns {Promise<string>} Response body text (JSON, not yet parsed).
 */
async function fetchUrl(url) {
  try {
    const cachedBody = await readFromCache(url);
    if (cachedBody !== null) {
      cacheHitCount += 1;
      return cachedBody;
    }
    if (totalRequestCount >= HARD_REQUEST_CAP) {
      throw new HardRequestCapReachedError(HARD_REQUEST_CAP);
    }
    const body = await enqueueThrottled(() => fetchWithRetry(url));
    await writeToCache(url, body);
    return body;
  } catch (error) {
    throw error;
  }
}

// ---------- Listing collection ----------

/**
 * Builds the listing URL for one page: every SEO leaf service id OR'ed
 * together via repeated `services` params, plus the (1-based) page number.
 *
 * The pagination param is `pageNumber`, NOT `page` - confirmed by direct
 * request during development: a `page=N` query string is silently accepted
 * (no error, no ignored-param warning) but has no effect whatsoever, so
 * every page came back identical until this was caught. Anyone tempted to
 * "simplify" this back to `page` will reintroduce that bug silently, since
 * nothing about the response shape signals the mistake.
 * @param {number} pageNumber 1-based page number.
 * @returns {string} Absolute listing URL.
 */
function buildListingUrl(pageNumber) {
  try {
    const searchParams = new URLSearchParams();
    for (const leafService of SEO_LEAF_SERVICES) {
      searchParams.append("services", String(leafService.id));
    }
    searchParams.append("pageNumber", String(pageNumber));
    return `${SEMRUSH_ORIGIN}${API_AGENCIES_PATH}?${searchParams.toString()}`;
  } catch (error) {
    throw new Error(`buildListingUrl() failed for page ${pageNumber}: ${error?.message ?? error}`);
  }
}

/**
 * Walks every SEO listing page (stopping once the `pages` count the first
 * response reports has been reached) and returns one slim candidate record
 * per unique agency `alias` whose listing-stage `budgetFloorUsd` is at or
 * above SEO_MIN_BUDGET_FLOOR_USD - the SEO category is premium-only, so
 * this filter runs here, BEFORE ranking and BEFORE any profile fetch, on
 * data the listing already carries (no extra requests). Still cheap and
 * complete - 36 requests total regardless of `--limit` - so ranking (see
 * rankCandidates) runs over the WHOLE qualifying pool, not a sample of it.
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @returns {Promise<Array<{alias: string, name: string, rating: number, reviewCount: number}>>}
 *   Deduped, floor-filtered candidates in listing order. `rating` here is
 *   each agency's `score` (see resolveRating()'s doc comment for why that
 *   field, not `reviews.rating`, is the one this importer treats as "the
 *   rating").
 */
async function collectListingCandidates(isPathAllowed) {
  try {
    const seenAliases = new Set();
    const qualifyingCandidatesByAlias = new Map();
    let totalPages = null;
    let pageNumber = 1;
    let stoppedEarly = false;

    while (totalPages === null || pageNumber <= totalPages) {
      const pageUrl = buildListingUrl(pageNumber);
      if (!isUrlAllowed(pageUrl, isPathAllowed)) {
        console.warn(`robots.txt disallows ${pageUrl}; stopping listing pagination.`);
        stoppedEarly = true;
        break;
      }

      let pageData;
      try {
        const body = await fetchUrl(pageUrl);
        pageData = JSON.parse(body);
      } catch (error) {
        if (error instanceof HardRequestCapReachedError) {
          console.warn(`Hard request cap reached during listing pagination; stopping early with what was collected.`);
          stoppedEarly = true;
          break;
        }
        console.warn(`Listing page ${pageNumber} failed: ${error?.message ?? error}`);
        failures.push({ url: pageUrl, reason: error?.message ?? String(error) });
        if (totalPages === null) {
          // The very first page failing means we never learn the page
          // count at all - nothing left to paginate toward.
          stoppedEarly = true;
          break;
        }
        pageNumber += 1;
        continue;
      }

      if (totalPages === null) {
        totalPages = Number.isFinite(pageData?.pages) && pageData.pages > 0 ? pageData.pages : 1;
        if (totalPages !== EXPECTED_LISTING_PAGE_COUNT) {
          console.warn(
            `Semrush reports ${totalPages} SEO listing page(s); expected ~${EXPECTED_LISTING_PAGE_COUNT}. Continuing anyway.`,
          );
        }
      }

      for (const agency of pageData?.agencies ?? []) {
        const alias = agency?.alias;
        if (!alias || seenAliases.has(alias)) continue;
        seenAliases.add(alias);

        // Premium-only gate. Null (no budgets published) does NOT qualify -
        // it means "unknown floor", not "any floor accepted", and this
        // filter can only affirmatively include agencies it can prove meet
        // it. See SEO_MIN_BUDGET_FLOOR_USD's comment for why this can't be
        // done with the API's own `budgets=` query param instead.
        const budgetFloorUsd = resolveBudgetFloorUsd(agency?.budgets);
        if (budgetFloorUsd === null || budgetFloorUsd < SEO_MIN_BUDGET_FLOOR_USD) continue;

        qualifyingCandidatesByAlias.set(alias, {
          alias,
          name: normalizeWhitespace(agency?.name ?? null) ?? alias,
          // `agency.score`, NOT `agency.reviews.rating` - see resolveRating()'s
          // doc comment for the full reasoning (score is what Semrush actually
          // displays; reviews.rating is a raw sub-aggregate that clusters hard
          // at 5.0 and would flatten this ranking's spread if used here).
          rating: Number(agency?.score) || 0,
          reviewCount: Number(agency?.reviews?.total) || 0,
        });
      }

      console.log(
        `Listing page ${pageNumber}/${totalPages}: ${pageData?.agencies?.length ?? 0} agencies, ` +
          `${seenAliases.size} unique seen, ${qualifyingCandidatesByAlias.size} qualifying ` +
          `(floor >= $${SEO_MIN_BUDGET_FLOOR_USD}) so far.`,
      );
      pageNumber += 1;
    }

    if (!stoppedEarly && totalPages !== null) {
      const deviationRatio =
        Math.abs(seenAliases.size - EXPECTED_APPROXIMATE_TOTAL_AGENCIES) /
        EXPECTED_APPROXIMATE_TOTAL_AGENCIES;
      if (deviationRatio > PLAUSIBILITY_TOLERANCE_RATIO) {
        console.warn(
          `Collected ${seenAliases.size} unique SEO agencies, expected roughly ` +
            `${EXPECTED_APPROXIMATE_TOTAL_AGENCIES} - Semrush's SEO facet may have changed since this script was written.`,
        );
      }
    }

    return Array.from(qualifyingCandidatesByAlias.values());
  } catch (error) {
    console.warn(`collectListingCandidates() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Shrinkage-adjusted ranking score. A plain review average lets a lone
 * 5-star review outrank an agency with hundreds of solid 4.8s, which is
 * backwards for a reader deciding who to hire. Shrinking the average toward
 * zero by the factor `reviewCount / (reviewCount + RANKING_SHRINKAGE_PRIOR)`
 * means a handful of reviews barely moves the score, while a review count
 * many times the prior lets the raw average dominate. RANKING_SHRINKAGE_PRIOR
 * (5) reads as "about this many reviews before the average is trusted on its
 * own". Agencies with zero reviews score exactly 0 and sort last.
 *
 * This score exists purely to pick and order which agencies this importer
 * fetches and writes - it is never itself written to the output file, which
 * stores the raw `rating`/`reviewCount` Semrush reports.
 * @param {number} rating Average rating (0 or falsy when unrated).
 * @param {number} reviewCount Number of reviews the rating averages over.
 * @returns {number} Shrinkage-adjusted score for ranking purposes only.
 */
function computeRankingScore(rating, reviewCount) {
  try {
    if (!rating || !reviewCount || reviewCount <= 0) return 0;
    return rating * (reviewCount / (reviewCount + RANKING_SHRINKAGE_PRIOR));
  } catch (error) {
    console.warn(`computeRankingScore() failed: ${error?.message ?? error}`);
    return 0;
  }
}

/**
 * Ranks listing candidates by shrinkage score (descending), tie-broken by
 * name (ascending) for a stable, human-legible order. Never trusts
 * Semrush's own listing order, which openly mixes in paid placements
 * (`paidPlacements` in the listing response).
 * @param {Array<{name: string, rating: number, reviewCount: number}>} candidates Listing candidates.
 * @returns {Array<{name: string, rating: number, reviewCount: number, rankingScore: number}>}
 *   Same candidates, sorted, each annotated with its computed score.
 */
function rankCandidates(candidates) {
  try {
    return candidates
      .map((candidate) => ({
        ...candidate,
        rankingScore: computeRankingScore(candidate.rating, candidate.reviewCount),
      }))
      .sort((first, second) => second.rankingScore - first.rankingScore || first.name.localeCompare(second.name));
  } catch (error) {
    console.warn(`rankCandidates() failed: ${error?.message ?? error}`);
    return candidates;
  }
}

// ---------- Profile fetching ----------

/**
 * Fetches and returns the `agency` payload of one profile endpoint, or null
 * on any failure (robots disallow, HTTP error, missing payload, hard cap).
 * Never throws - a single bad profile must not abort the whole run.
 * @param {string} alias Agency's Semrush alias (from a listing candidate).
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @returns {Promise<object | null>} Raw agency profile object, or null.
 */
async function fetchAgencyProfile(alias, isPathAllowed) {
  const apiUrl = `${SEMRUSH_ORIGIN}${API_AGENCIES_PATH}${alias}/`;
  try {
    if (!isUrlAllowed(apiUrl, isPathAllowed)) {
      console.warn(`robots.txt disallows ${apiUrl}; skipping profile for "${alias}".`);
      failures.push({ url: apiUrl, reason: "Disallowed by robots.txt" });
      return null;
    }
    const body = await fetchUrl(apiUrl);
    const parsed = JSON.parse(body);
    const agencyData = parsed?.agency;
    if (!agencyData) {
      console.warn(`Profile response for "${alias}" had no "agency" payload.`);
      failures.push({ url: apiUrl, reason: "Missing agency payload" });
      return null;
    }
    return agencyData;
  } catch (error) {
    console.warn(`Profile fetch failed for "${alias}": ${error?.message ?? error}`);
    failures.push({ url: apiUrl, reason: error?.message ?? String(error) });
    return null;
  }
}

/**
 * Fetches profiles for every selected candidate. Concurrency is already
 * bounded to MAX_CONCURRENCY by the shared throttle queue inside fetchUrl,
 * so issuing all requests via Promise.all (rather than one at a time) is
 * safe and matches scrape-awwwards.mjs's own pattern. Once HARD_REQUEST_CAP
 * is hit, remaining fetchAgencyProfile() calls fail fast (each is caught
 * internally and returns null) - "skip remaining profiles" falls out of
 * that naturally, with no special-case loop needed.
 * @param {Array<{alias: string}>} selectedCandidates Top-ranked candidates.
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @returns {Promise<object[]>} Raw agency profile objects that were fetched successfully.
 */
async function fetchSelectedProfiles(selectedCandidates, isPathAllowed) {
  try {
    const results = await Promise.all(
      selectedCandidates.map((candidate) => fetchAgencyProfile(candidate.alias, isPathAllowed)),
    );
    return results.filter(Boolean);
  } catch (error) {
    console.warn(`fetchSelectedProfiles() failed: ${error?.message ?? error}`);
    return [];
  }
}

// ---------- Field-mapping helpers ----------

/**
 * Builds an all-zero AgencyAwards object. Duplicated verbatim from
 * scrape-awwwards.mjs's helper of the same name/shape.
 * @returns {{siteOfTheDay: number, siteOfTheMonth: number, siteOfTheYear: number, developerAward: number, honorableMentions: number, nominees: number, total: number}}
 *   Zeroed awards tally.
 */
function createEmptyAwards() {
  try {
    return {
      siteOfTheDay: 0,
      siteOfTheMonth: 0,
      siteOfTheYear: 0,
      developerAward: 0,
      honorableMentions: 0,
      nominees: 0,
      total: 0,
    };
  } catch (error) {
    console.warn(`createEmptyAwards() failed: ${error?.message ?? error}`);
    return {
      siteOfTheDay: 0,
      siteOfTheMonth: 0,
      siteOfTheYear: 0,
      developerAward: 0,
      honorableMentions: 0,
      nominees: 0,
      total: 0,
    };
  }
}

/**
 * Splits a Semrush office location's comma-joined name (e.g. "London,
 * England, United Kingdom") into an AgencyLocation. Uses `offices[0]` only -
 * this importer does not attempt to represent an agency with multiple
 * offices. A single-segment name (no comma at all) names only a country, so
 * `city` is left null rather than duplicating the country string into it -
 * the brief's "first segment / last segment" rule assumes a multi-segment
 * name, and a bare country name is the edge case that rule doesn't cover.
 * @param {Array<{location?: {name?: string, countryCode?: string}}> | null | undefined} offices
 *   `agency.offices` from the profile payload.
 * @returns {{country: string, countryCode: string | null, city: string | null} | null}
 *   Parsed location, or null when there are no offices at all.
 */
function parseOfficeLocation(offices) {
  try {
    const location = offices?.[0]?.location;
    const rawName = normalizeWhitespace(location?.name ?? null);
    if (!rawName) return null;
    const segments = rawName.split(",").map((segment) => segment.trim()).filter(Boolean);
    if (segments.length === 0) return null;
    const city = segments.length > 1 ? segments[0] : null;
    const country = segments[segments.length - 1];
    return {
      country,
      countryCode: location?.countryCode ?? null,
      city,
    };
  } catch (error) {
    console.warn(`parseOfficeLocation() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Flattens `agency.services` (a tree one level deep: each service may carry
 * `children`) into a flat, deduped, order-preserving list of display names.
 * @param {Array<{name?: string, children?: Array<{name?: string}>}> | null | undefined} services
 *   `agency.services` from the profile payload.
 * @returns {string[]} Flattened, deduped service names.
 */
function flattenServices(services) {
  try {
    const names = [];
    const seenNames = new Set();
    for (const service of services ?? []) {
      const parentName = normalizeWhitespace(service?.name ?? null);
      if (parentName && !seenNames.has(parentName)) {
        seenNames.add(parentName);
        names.push(parentName);
      }
      for (const childService of service?.children ?? []) {
        const childName = normalizeWhitespace(childService?.name ?? null);
        if (childName && !seenNames.has(childName)) {
          seenNames.add(childName);
          names.push(childName);
        }
      }
    }
    return names;
  } catch (error) {
    console.warn(`flattenServices() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Flattens `agency.services` the same way flattenServices() does, but moves
 * the SEO parent group (id === SEO_PARENT_SERVICE_ID) and its children to
 * the front of the list first. This importer exclusively feeds the `seo`
 * category, and the directory card only renders the first few `services`
 * entries - without this reordering, an SEO-category card can show zero SEO
 * services (e.g. "Advertising · Display Ads · Native Advertising · PPC" for
 * an agency whose top-billed line item happens to be Advertising). This is
 * specific to this importer serving exactly one category and should NOT be
 * copied verbatim into a future importer that feeds multiple categories.
 * @param {Array<{id?: number, name?: string, children?: Array<{name?: string}>}> | null | undefined} services
 *   `agency.services` from the profile payload.
 * @returns {string[]} Flattened, deduped service names, SEO group first.
 */
function flattenServicesSeoFirst(services) {
  try {
    const serviceList = services ?? [];
    const seoGroup = serviceList.find((service) => service?.id === SEO_PARENT_SERVICE_ID);
    if (!seoGroup) return flattenServices(serviceList);
    const otherGroups = serviceList.filter((service) => service?.id !== SEO_PARENT_SERVICE_ID);
    return flattenServices([seoGroup, ...otherGroups]);
  } catch (error) {
    console.warn(`flattenServicesSeoFirst() failed: ${error?.message ?? error}`);
    return flattenServices(services);
  }
}

/**
 * Extracts deduped industry names from `agency.industries`.
 * @param {Array<{name?: string}> | null | undefined} industries `agency.industries`.
 * @returns {string[]} Deduped industry names, in source order.
 */
function extractIndustryNames(industries) {
  try {
    const names = [];
    const seenNames = new Set();
    for (const industry of industries ?? []) {
      const name = normalizeWhitespace(industry?.name ?? null);
      if (name && !seenNames.has(name)) {
        seenNames.add(name);
        names.push(name);
      }
    }
    return names;
  } catch (error) {
    console.warn(`extractIndustryNames() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Extracts deduped accolade labels from `agency.awards`. These are
 * self-reported and mix genuine award names with certifications/badges of
 * varying provenance, which is exactly why lib/directory/types.ts keeps
 * `accolades` separate from the counted, summable `awards` tally.
 * @param {Array<{alt?: string}> | null | undefined} awards `agency.awards`.
 * @returns {string[]} Deduped, non-empty accolade labels, in source order.
 */
function extractAccolades(awards) {
  try {
    const labels = [];
    const seenLabels = new Set();
    for (const award of awards ?? []) {
      const label = normalizeWhitespace(award?.alt ?? null);
      if (label && !seenLabels.has(label)) {
        seenLabels.add(label);
        labels.push(label);
      }
    }
    return labels;
  } catch (error) {
    console.warn(`extractAccolades() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Parses `agency.founded` into a four-digit founding year, or null if it
 * doesn't look like a plausible year (outside FOUNDED_YEAR_MIN..current
 * year) or doesn't parse as a number at all.
 * @param {string | number | null | undefined} rawFounded `agency.founded`.
 * @returns {number | null} Founding year, or null.
 */
function parseFoundedYear(rawFounded) {
  try {
    if (rawFounded === null || rawFounded === undefined || rawFounded === "") return null;
    const parsedYear = Number(rawFounded);
    if (!Number.isFinite(parsedYear)) return null;
    const currentYear = new Date().getFullYear();
    if (parsedYear < FOUNDED_YEAR_MIN || parsedYear > currentYear) return null;
    return Math.trunc(parsedYear);
  } catch (error) {
    console.warn(`parseFoundedYear() failed for "${rawFounded}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Renders a display label for an agency's typical project budget from the
 * bands Semrush publishes, e.g. `[{name:"$5,000 - 10,000"}, {name:"$10,000 -
 * 25,000"}, {name:"$25,000+"}]` -> "Starting from $5,000". Uses the FIRST
 * band in source order and extracts only its lower-bound figure - the upper
 * bound (or the "+" on an open-ended top band) belongs to a range, not a
 * starting point, so parsing it out would misstate what the label claims.
 * @param {Array<{name?: string}> | null | undefined} budgets `agency.budgets`.
 * @returns {string | null} A rendered label, or null when no bands are listed.
 */
function buildBudgetLabel(budgets) {
  try {
    const firstBandName = normalizeWhitespace(budgets?.[0]?.name ?? null);
    if (!firstBandName) return null;
    // Lowest band ("$0 - 1,000"): quote its ceiling, not its floor, since
    // "Starting from $0" would read as a claim the source never makes.
    const rangeMatch = firstBandName.match(BUDGET_BAND_RANGE_PATTERN);
    if (rangeMatch && BUDGET_ZERO_LOWER_BOUND_PATTERN.test(rangeMatch[1])) {
      return `${BUDGET_UNDER_LABEL_PREFIX}${BUDGET_CURRENCY_SYMBOL}${rangeMatch[2]}`;
    }

    const amountMatch = firstBandName.match(BUDGET_AMOUNT_PATTERN);
    const lowerBoundText = amountMatch ? amountMatch[0] : firstBandName;
    return `${BUDGET_LABEL_PREFIX}${lowerBoundText}`;
  } catch (error) {
    console.warn(`buildBudgetLabel() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Parses the lower-bound dollar figure out of a budget band's `name` string
 * (e.g. "$5,000 - 10,000" -> 5000, "$25,000+" -> 25000, "$0 - 1,000" -> 0)
 * as a plain number in whole USD. A fallback used only when a band's id
 * isn't in BUDGET_BAND_FLOOR_BY_ID - see resolveBudgetFloorUsd().
 * @param {string | null | undefined} bandName Band's `name` field.
 * @returns {number | null} Parsed lower bound, or null if unparseable.
 */
function parseBudgetFloorFromName(bandName) {
  try {
    if (!bandName) return null;
    const amountMatch = bandName.match(BUDGET_AMOUNT_PATTERN);
    if (!amountMatch) return null;
    const numeric = Number(amountMatch[0].replace(/[$,]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
  } catch (error) {
    console.warn(`parseBudgetFloorFromName() failed for "${bandName}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Resolves `Agency.budgetFloorUsd`: the lower bound, in whole USD, of the
 * CHEAPEST band an agency lists - a true minimum computed across EVERY band,
 * never `budgets[0]`. Every payload seen during development happened to
 * list bands in ascending order, but nothing in the schema guarantees that,
 * and an unsorted array would silently produce a wrong floor with no
 * symptom - this number now gates the entire SEO category on
 * `>= SEO_MIN_BUDGET_FLOOR_USD`, so silent wrongness here is the worst
 * possible failure mode this importer can produce.
 *
 * Each band's floor is looked up by id in BUDGET_BAND_FLOOR_BY_ID first
 * (authoritative); when a band's id isn't in that map, its `name` is parsed
 * instead (parseBudgetFloorFromName). If a band's id IS in the map but its
 * parsed name disagrees with the map's figure, the map wins and a warning
 * is logged - the map is fixed and confirmed correct, string parsing is
 * the best-effort path.
 * @param {Array<{id?: number, name?: string}> | null | undefined} budgets
 *   A `budgets` array, from either the listing or the profile payload (both
 *   observed carrying the same `{name, id}` shape).
 * @returns {number | null} Lower bound in whole USD, or null when `budgets`
 *   is absent/empty.
 */
function resolveBudgetFloorUsd(budgets) {
  try {
    if (!Array.isArray(budgets) || budgets.length === 0) return null;
    let minFloor = null;
    for (const band of budgets) {
      const parsedFloor = parseBudgetFloorFromName(band?.name ?? null);
      const hasAuthoritativeFloor = Object.prototype.hasOwnProperty.call(
        BUDGET_BAND_FLOOR_BY_ID,
        band?.id,
      );
      const authoritativeFloor = hasAuthoritativeFloor ? BUDGET_BAND_FLOOR_BY_ID[band.id] : null;
      if (hasAuthoritativeFloor && parsedFloor !== null && authoritativeFloor !== parsedFloor) {
        console.warn(
          `Budget band id ${band.id} ("${band?.name}") parses to $${parsedFloor} but the ` +
            `authoritative map says $${authoritativeFloor}; using the map.`,
        );
      }
      const floor = hasAuthoritativeFloor ? authoritativeFloor : parsedFloor;
      if (floor === null) continue;
      if (minFloor === null || floor < minFloor) minFloor = floor;
    }
    return minFloor;
  } catch (error) {
    console.warn(`resolveBudgetFloorUsd() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Resolves `Agency.description`: strip `detailedDescription.en` HTML to
 * plain text, fall back to `tagline.en` when that's empty, then cap the
 * result at DESCRIPTION_MAX_LENGTH (see that constant's comment for why).
 * @param {{detailedDescription?: {en?: string}, tagline?: {en?: string}}} agencyProfile
 *   Raw profile payload.
 * @returns {string | null} Final description, or null when both sources are empty.
 */
function resolveDescription(agencyProfile) {
  try {
    const plainDescription = stripHtmlToPlainText(agencyProfile?.detailedDescription?.en ?? null);
    const fallbackTagline = normalizeWhitespace(agencyProfile?.tagline?.en ?? null);
    const resolvedText = plainDescription ?? fallbackTagline;
    if (!resolvedText) return null;
    return truncateDescription(resolvedText, DESCRIPTION_MAX_LENGTH);
  } catch (error) {
    console.warn(`resolveDescription() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Resolves `Agency.rating` from `agency.score` - the number Semrush's own
 * profile pages actually render next to the review count (confirmed by
 * checking live pages against the API response: `/click-here-digital/`
 * renders "567 reviews · 4.7", and that agency's `score` is `4.7`).
 *
 * `reviews.rating` is deliberately NOT used, even though it looks like the
 * obvious field: it is a raw sub-aggregate (chiefly a Google Maps average -
 * see the `googleUrl`/`google[]` keys alongside it) that Semrush computes
 * internally but does not display as the agency's headline rating. For
 * click-here-digital specifically, `reviews.rating` is `5` against a
 * published `4.7` - publishing the sub-aggregate here would misstate the
 * figure attributed to the very source `profileUrl` links to, which is
 * exactly the failure `AgencyRating`'s doc comment in types.ts exists to
 * prevent. (`reviews.rating` also clusters hard at exactly 5.0 across the
 * dataset, which collapsed the shrinkage ranking's spread when it was used
 * there too - see collectListingCandidates.)
 *
 * Null when `score` is absent/non-positive, OR when `reviews.total` is 0 -
 * an unreviewed agency has no client-review rating to publish, whatever
 * `score` says.
 * @param {number | string | null | undefined} score `agency.score` from the profile payload.
 * @param {number | string | null | undefined} reviewCount `agency.reviews.total`.
 * @returns {{value: number, scale: number, reviewCount: number} | null}
 *   Rating, or null when there is no positive, reviewed score to report.
 */
function resolveRating(score, reviewCount) {
  try {
    const scoreValue = Number(score);
    if (!Number.isFinite(scoreValue) || scoreValue <= 0) return null;
    const totalReviews = Number(reviewCount);
    if (!Number.isFinite(totalReviews) || totalReviews <= 0) return null;
    return {
      value: scoreValue,
      scale: RATING_SCALE,
      reviewCount: totalReviews,
    };
  } catch (error) {
    console.warn(`resolveRating() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * True when a client logo's `alt` text is a bare image filename rather than
 * a brand name (an authoring mistake on Semrush's side).
 * @param {string} name Candidate client name.
 * @returns {boolean} True if it looks like a filename.
 */
function isLikelyImageFilename(name) {
  try {
    return CLIENT_LOGO_FILENAME_PATTERN.test(name.trim());
  } catch (error) {
    console.warn(`isLikelyImageFilename() failed for "${name}": ${error?.message ?? error}`);
    return false;
  }
}

/**
 * True when a client logo's `alt` text is a generic "Screenshot..."
 * placeholder rather than a brand name.
 * @param {string} name Candidate client name.
 * @returns {boolean} True if it looks like a placeholder.
 */
function isScreenshotPlaceholderName(name) {
  try {
    return name.trim().toLowerCase().startsWith(CLIENT_LOGO_SCREENSHOT_PREFIX);
  } catch (error) {
    console.warn(`isScreenshotPlaceholderName() failed for "${name}": ${error?.message ?? error}`);
    return false;
  }
}

/**
 * Finds a success story whose English name mentions the given client, so the
 * client entry's `projectTitle` can point at real, specific work rather than
 * just repeating the client's own name.
 * @param {string} clientName Client's display name (from a logo's `alt`).
 * @param {Array<{name?: {en?: string}}> | null | undefined} successStories
 *   `agency.successStories` from the profile payload.
 * @returns {string | null} Matching success story title, or null.
 */
function findSuccessStoryTitleForClient(clientName, successStories) {
  try {
    const lowerClientName = clientName.toLowerCase();
    const matchingStory = (successStories ?? []).find((story) => {
      const storyTitle = story?.name?.en;
      return typeof storyTitle === "string" && storyTitle.toLowerCase().includes(lowerClientName);
    });
    return normalizeWhitespace(matchingStory?.name?.en ?? null);
  } catch (error) {
    console.warn(`findSuccessStoryTitleForClient() failed for "${clientName}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Builds `Agency.clients` from Semrush's client-logo wall
 * (`agency.logotypes`). Unlike the Awwwards importer, there is deliberately
 * NO LLM normalisation pass here: Semrush's logo `alt` text is already a
 * clean, human-authored brand name ("ASICS", "Under Armour", "N Brown"), not
 * a project title that needs the client's identity extracted from it - there
 * is nothing for a normalisation pass to do.
 * @param {Array<{alt?: string}> | null | undefined} logotypes `agency.logotypes`.
 * @param {Array<{name?: {en?: string}}> | null | undefined} successStories `agency.successStories`.
 * @returns {Array<{name: string, domain: string | null, projectTitle: string, projectUrl: string | null, notable: boolean}>}
 *   `AgencyClient[]`, capped at MAX_CLIENTS_PER_AGENCY.
 */
function buildAgencyClients(logotypes, successStories) {
  try {
    const clients = [];
    const seenNames = new Set();
    for (const logotype of logotypes ?? []) {
      const clientName = normalizeWhitespace(logotype?.alt ?? null);
      if (!clientName) continue;
      if (isLikelyImageFilename(clientName) || isScreenshotPlaceholderName(clientName)) continue;

      const dedupeKey = clientName.toLowerCase();
      if (seenNames.has(dedupeKey)) continue;
      seenNames.add(dedupeKey);

      const projectTitle = findSuccessStoryTitleForClient(clientName, successStories) ?? clientName;
      clients.push({
        name: clientName,
        domain: null,
        projectTitle,
        projectUrl: null,
        // Semrush's client wall carries no per-client signal comparable to
        // the Awwwards importer's resolved "notable" flag - see
        // AgencyClient.notable's doc comment in lib/directory/types.ts for
        // why leaving every entry false here is correct, not a shortcut.
        notable: false,
      });

      if (clients.length >= MAX_CLIENTS_PER_AGENCY) break;
    }
    return clients;
  } catch (error) {
    console.warn(`buildAgencyClients() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Builds a final Agency record (matching lib/directory/types.ts exactly)
 * from one raw Semrush profile payload. Returns null (rather than throwing)
 * on any failure so one malformed profile can't abort the whole run - the
 * caller drops nulls and records the loss via the run summary.
 * @param {object} agencyProfile Raw `agency` object from the profile endpoint.
 * @param {Set<string>} usedSlugs Slugs already assigned in this run.
 * @param {string} scrapedAt ISO-8601 timestamp shared by the whole run.
 * @returns {object | null} Agency record ready for JSON output, or null.
 */
function buildAgencyRecord(agencyProfile, usedSlugs, scrapedAt) {
  try {
    const alias = agencyProfile?.alias;
    const name = normalizeWhitespace(agencyProfile?.name ?? null);
    if (!alias || !name) {
      console.warn(`buildAgencyRecord() skipped a profile with no usable alias/name.`);
      return null;
    }

    const website = normalizeWebsiteUrl(agencyProfile?.website ?? null);
    const domain = resolveDomainFromWebsite(website);
    // slug prefers the domain brand label, same as the Awwwards importer,
    // but falls back to the Semrush alias (already URL-safe) rather than
    // the display name - the brief calls this out explicitly since the
    // Awwwards script's own fallback differs (it uses the name).
    const slugBase = slugBaseFromDomain(domain) ?? slugify(alias) ?? "agency";
    const slug = makeUniqueSlug(slugBase, usedSlugs);

    return {
      slug,
      name,
      website,
      domain,
      profileUrl: `${SEMRUSH_ORIGIN}/${alias}/`,
      location: parseOfficeLocation(agencyProfile?.offices),
      categories: [CATEGORY_SEO],
      services: flattenServicesSeoFirst(agencyProfile?.services),
      teamSize: normalizeWhitespace(agencyProfile?.numberOfEmployees?.[0]?.name ?? null),
      logoUrl: agencyProfile?.logo?.url ?? null,
      description: resolveDescription(agencyProfile),
      // Semrush's Agency Partners directory is a business/review directory,
      // not an awards jury: it publishes no Awwwards-style tally of named
      // prizes for any profile. Zeroed rather than omitted, for the same
      // reason the Awwwards importer zeroes the fields it lacks - see
      // AgencyAwards's doc comment in lib/directory/types.ts.
      awards: createEmptyAwards(),
      rating: resolveRating(agencyProfile?.score, agencyProfile?.reviews?.total),
      accolades: extractAccolades(agencyProfile?.awards),
      foundedYear: parseFoundedYear(agencyProfile?.founded),
      industries: extractIndustryNames(agencyProfile?.industries),
      budgetLabel: buildBudgetLabel(agencyProfile?.budgets),
      // Computed from this SAME agencyProfile.budgets array as budgetLabel
      // just above, deliberately - the two must always describe the same
      // underlying bands so a record's label can never contradict its floor.
      budgetFloorUsd: resolveBudgetFloorUsd(agencyProfile?.budgets),
      clients: buildAgencyClients(agencyProfile?.logotypes, agencyProfile?.successStories),
      source: AGENCY_SOURCE,
      scrapedAt,
    };
  } catch (error) {
    console.warn(`buildAgencyRecord() failed for "${agencyProfile?.name}": ${error?.message ?? error}`);
    return null;
  }
}

// ---------- CLI / orchestration ----------

/**
 * Parses `--limit N` / `--limit=N` from CLI args. Same shape as the parser
 * in scrape-awwwards.mjs, except the default here is `null` ("no cap - take
 * the whole qualifying pool"), not a fixed number - see DEFAULT_LIMIT.
 * @param {string[]} argv Arguments after the script path (`process.argv.slice(2)`).
 * @returns {{limit: number | null}} Parsed options. `limit: null` means uncapped.
 */
function parseCliArgs(argv) {
  try {
    const options = { limit: DEFAULT_LIMIT };
    for (let index = 0; index < argv.length; index += 1) {
      const argument = argv[index];
      if (argument === "--limit") {
        const parsedValue = Number.parseInt(argv[index + 1] ?? "", 10);
        if (!Number.isNaN(parsedValue) && parsedValue > 0) options.limit = parsedValue;
        index += 1;
      } else if (argument?.startsWith("--limit=")) {
        const parsedValue = Number.parseInt(argument.slice("--limit=".length), 10);
        if (!Number.isNaN(parsedValue) && parsedValue > 0) options.limit = parsedValue;
      }
    }
    return options;
  } catch (error) {
    console.warn(`parseCliArgs() failed; using defaults: ${error?.message ?? error}`);
    return { limit: DEFAULT_LIMIT };
  }
}

/**
 * Entry point: walks the SEO listing, filters to the premium ($5,000+ floor)
 * qualifying pool, ranks it by shrinkage-adjusted score, fetches profiles
 * for the whole pool (or a `--limit`-capped slice), writes
 * lib/directory/data/seo-agencies.json, and prints a run summary. Aborts
 * without writing if the qualifying pool's size falls far outside its
 * expected range - see QUALIFYING_COUNT_MIN/MAX.
 * @returns {Promise<void>} Resolves once the run completes (or fails).
 */
async function main() {
  try {
    const cliOptions = parseCliArgs(process.argv.slice(2));
    await mkdir(CACHE_DIRECTORY, { recursive: true });

    console.log("Loading robots.txt…");
    const isPathAllowed = await loadRobotsRules();

    console.log(
      `Fetching Semrush SEO agency listing (${SEO_LEAF_SERVICES.length} leaf service filters, ` +
        `~${EXPECTED_LISTING_PAGE_COUNT} pages expected)…`,
    );
    const candidates = await collectListingCandidates(isPathAllowed);
    console.log(
      `Collected ${candidates.length} candidate agencies with budgetFloorUsd >= ` +
        `$${SEO_MIN_BUDGET_FLOOR_USD} from the SEO listing.`,
    );

    if (candidates.length < QUALIFYING_COUNT_MIN || candidates.length > QUALIFYING_COUNT_MAX) {
      console.error(
        `Qualifying pool is ${candidates.length}, expected roughly ${EXPECTED_QUALIFYING_COUNT} ` +
          `(${QUALIFYING_COUNT_MIN}-${QUALIFYING_COUNT_MAX}) agencies with budgetFloorUsd >= ` +
          `$${SEO_MIN_BUDGET_FLOOR_USD}. This suggests Semrush's budget-band semantics have ` +
          "changed since this script was written. Refusing to write the output file - " +
          "investigate (BUDGET_BAND_FLOOR_BY_ID, band names/ids) before re-running.",
      );
      process.exitCode = 1;
      return;
    }

    const ranked = rankCandidates(candidates);
    const selected = cliOptions.limit !== null ? ranked.slice(0, cliOptions.limit) : ranked;
    console.log(
      cliOptions.limit !== null
        ? `Ranked ${ranked.length} qualifying candidate(s) by shrinkage-adjusted score ` +
            `(prior=${RANKING_SHRINKAGE_PRIOR}); capped at the top ${selected.length} (--limit ${cliOptions.limit}).`
        : `Ranked ${ranked.length} qualifying candidate(s) by shrinkage-adjusted score ` +
            `(prior=${RANKING_SHRINKAGE_PRIOR}); taking the entire qualifying pool (no --limit given).`,
    );

    console.log("Fetching agency profile pages…");
    const profiles = await fetchSelectedProfiles(selected, isPathAllowed);
    console.log(`Fetched ${profiles.length} of ${selected.length} selected profile(s).`);

    const scrapedAt = new Date().toISOString();
    const usedSlugs = new Set();
    /** Registrable domains already written this run - see the dedupe check
     *  in the loop below. */
    const usedDomains = new Set();
    const agencies = [];
    let droppedPostFetchCount = 0;
    let droppedDuplicateDomainCount = 0;
    for (const profile of profiles) {
      const record = buildAgencyRecord(profile, usedSlugs, scrapedAt);
      if (!record) continue;

      // Uniqueness by registrable domain, matching scrape-awwwards.mjs.
      // The source does NOT guarantee this: Semrush carries more than one
      // listing for the same agency (twotreesppc.com is listed twice, as
      // "Two Trees PPC" and "Two Trees"), so it has to be imposed here.
      //
      // Without it the extra record is dead weight - lib/directory/
      // agencies.ts#mergeAgencySources dedupes by domain at read time, so
      // the duplicate never renders and never gets a page, it just makes
      // this file overstate its own count. Never dedupe on name: distinct
      // agencies share generic names.
      //
      // `profiles` arrives in ranked order, so first-seen wins and the
      // better-ranked of two duplicates is the one kept. A null domain is
      // never an identity to match on - two agencies whose domain could
      // not be resolved are not the same agency - so those always pass.
      const recordDomain = record.domain?.trim().toLowerCase();
      if (recordDomain) {
        if (usedDomains.has(recordDomain)) {
          console.warn(
            `Dropping "${record.name}": domain "${recordDomain}" was already written by a ` +
              "higher-ranked listing - the source carries duplicate listings for one agency.",
          );
          droppedDuplicateDomainCount += 1;
          continue;
        }
        usedDomains.add(recordDomain);
      }
      // Defensive re-check: the listing-stage filter already excluded this
      // agency's alias if its LISTING budgets disagreed, but the record's
      // own budgetFloorUsd is computed independently from its PROFILE
      // budgets (see buildAgencyRecord). If the two sources ever disagree
      // for one agency, this is what actually keeps a sub-floor record out
      // of the written file, rather than trusting the listing-stage filter
      // alone.
      if (record.budgetFloorUsd === null || record.budgetFloorUsd < SEO_MIN_BUDGET_FLOOR_USD) {
        console.warn(
          `Dropping "${record.name}" post-profile-fetch: budgetFloorUsd is ${record.budgetFloorUsd}, ` +
            `below $${SEO_MIN_BUDGET_FLOOR_USD} despite qualifying at the listing stage - listing and ` +
            "profile budgets disagree for this agency.",
        );
        failures.push({
          url: record.profileUrl,
          reason: `budgetFloorUsd ${record.budgetFloorUsd} below floor at profile stage`,
        });
        droppedPostFetchCount += 1;
        continue;
      }
      agencies.push(record);
    }

    await writeFile(OUTPUT_FILE_PATH, `${JSON.stringify(agencies, null, 2)}\n`, "utf8");

    console.log("---- Run summary ----");
    console.log(`Qualifying candidates (budgetFloorUsd >= $${SEO_MIN_BUDGET_FLOOR_USD}): ${candidates.length}`);
    console.log(`Profiles fetched: ${profiles.length} / ${selected.length} selected`);
    if (droppedPostFetchCount > 0) {
      console.log(`Dropped post-fetch (floor disagreement): ${droppedPostFetchCount}`);
    }
    if (droppedDuplicateDomainCount > 0) {
      console.log(`Dropped as duplicate domains: ${droppedDuplicateDomainCount}`);
    }
    console.log(`Records written: ${agencies.length}`);
    console.log(`Failures: ${failures.length}`);
    console.log(`Real HTTP requests: ${totalRequestCount}; cache hits: ${cacheHitCount}`);
    console.log(`Wrote ${agencies.length} agencies to ${OUTPUT_FILE_PATH}`);

    if (failures.length > 0) {
      console.warn(`${failures.length} URL(s) failed:`);
      for (const failure of failures) {
        console.warn(`  - ${failure.url}: ${failure.reason}`);
      }
    }
  } catch (error) {
    console.error(`Import failed: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

main();
