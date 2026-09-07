#!/usr/bin/env node
/**
 * Imports motion design studio profiles from Motion Design Awards
 * (https://www.motiondesignawards.com) and writes them to
 * lib/directory/data/motion-design-agencies.json, conforming to the
 * `Agency` interface in lib/directory/types.ts.
 *
 * This is the third sibling of scrape-awwwards.mjs / import-semrush.mjs: same
 * standalone-.mjs-with-no-shared-module structure (constants and helpers are
 * duplicated here on purpose, not imported - there is no build step for any
 * of the three, so a shared module would need one). Like import-semrush.mjs,
 * the source is JSON, not HTML to be parsed with jsdom - here the JSON is
 * Next.js's own `__NEXT_DATA__` payload, embedded in every server-rendered
 * page as a normalised Apollo cache (`initialApolloState`: a flat map of
 * `"Type:id"` keys to entity objects, cross-referencing each other via
 * `{"__ref": "Type:id"}` pointers).
 *
 * TWO-PHASE crawl, and this is a deliberate departure from the two-request-
 * per-agency shape of the other two importers - discovered empirically while
 * building this script, not assumed up front:
 *
 *   Phase 1 walks every project page named in the projects sitemap
 *   (`sitemap.projects.xml.gz`, ~1,871 URLs). Each project's Apollo state
 *   carries the project's title, its `awards[]` (each an `{id, type}` pair,
 *   e.g. `{type: "VOTD"}`) and a `profile` reference to the studio or
 *   individual credited with it - but that embedded Profile object is a
 *   STRIPPED fragment (company/city/country/website/avatar only). Critically
 *   it carries NO `type` field, so it cannot tell a studio from an individual
 *   freelancer - confirmed by diffing the embedded Profile against a
 *   dedicated profile-page fetch for several project pages during
 *   development. Projects with zero awards contribute nothing and are
 *   skipped without ever touching their profile - MDA's sitemap lists every
 *   published submission, not just winners, and this importer only cares
 *   about winners.
 *
 *   Phase 2 fetches each surviving profile's own page (`/profile/<id>`) -
 *   the FULL Profile object lives only there, with the `type` field this
 *   importer's core filter depends on ("STUDIO" vs "INDIVIDUAL"), plus
 *   `tagline`/`description` and `awards_summary.total` for the cross-check
 *   in buildAccoladesForProfile()'s caller. Skipping this phase entirely for
 *   the (usually much larger) set of never-awarded profiles is what keeps
 *   the total request count survivable - see HARD_REQUEST_CAP's comment.
 *
 * Award TYPE CODES ("VOTD", "VOTM", ...) are not guessed at: they were read
 * directly out of MDA's own `pages/winners/[[...type]]` JS bundle, which
 * ships a literal `{HM: "Honorable mentions", VOTD: "Videos of the day", ...}`
 * label map - see AWARD_TYPE_LABEL_BY_CODE for the full set and citation.
 *
 * Politeness (mirrors scrape-awwwards.mjs / import-semrush.mjs):
 *   - robots.txt is fetched and parsed at runtime. Unlike the other two
 *     scripts (which fail closed - i.e. treat every path as disallowed - and
 *     let the crawl proceed to fetch nothing), this script ABORTS the run
 *     entirely when robots.txt cannot be fetched or parsed. MDA's robots.txt
 *     is a "content signals" file (comment-only, no User-agent/Disallow
 *     lines at all) rather than a classic robots.txt, so successfully
 *     fetching and parsing it always yields "nothing disallowed" here -
 *     a fetch/parse failure therefore means something is genuinely wrong
 *     (network outage, a changed file format this parser can't read), not
 *     "the site asked us to slow down", and proceeding on that basis would
 *     be the wrong kind of fail-open.
 *   - Max 2 concurrent requests, minimum 1000ms between request starts.
 *   - Exponential backoff on 429/5xx, up to 3 retries, then the URL is
 *     recorded as a failure and the run continues.
 *   - An on-disk HTML cache (scripts/directory-import/.cache-mda/, gitignored)
 *     avoids re-hitting the site on re-runs.
 *   - A hard total-request cap protects against runaway crawls.
 *
 * Usage:
 *   node scripts/directory-import/import-motion-design-awards.mjs
 *   node scripts/directory-import/import-motion-design-awards.mjs --limit=200
 *   node scripts/directory-import/import-motion-design-awards.mjs --limit=all
 *   node scripts/directory-import/import-motion-design-awards.mjs --dry-run
 *   node scripts/directory-import/import-motion-design-awards.mjs --refresh
 *
 * See scripts/directory-import/README.md for full flag/cache documentation.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

// ---------- Paths ----------

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

/** Own cache directory, distinct from the Awwwards (`.cache/`) and Semrush
 *  (`.cache-semrush/`) caches so the three importers' caches can never
 *  collide - same convention as those two, see their headers. */
const CACHE_DIRECTORY = path.join(SCRIPT_DIRECTORY, ".cache-mda");

const OUTPUT_FILE_PATH = path.join(
  SCRIPT_DIRECTORY,
  "..",
  "..",
  "lib",
  "directory",
  "data",
  "motion-design-agencies.json",
);

// ---------- Site / network constants ----------

const MDA_ORIGIN = "https://www.motiondesignawards.com";
const ROBOTS_URL = `${MDA_ORIGIN}/robots.txt`;
const PROJECTS_SITEMAP_URL = `${MDA_ORIGIN}/sitemap.projects.xml.gz`;
const PROJECT_PATH_PREFIX = "/project/";
const PROFILE_PATH_PREFIX = "/profile/";

/** Identifies this crawler honestly, with a contact URL, per the brief. */
const USER_AGENT = "SuperflowDirectoryBot/1.0 (+https://usesuperflow.ai; mihir@velt.dev)";

/** robots.txt group-matching token for this bot (lowercased, no version).
 *  Mirrors scrape-awwwards.mjs / import-semrush.mjs. */
const ROBOTS_PRODUCT_TOKEN = "superflowdirectorybot";

const DEFAULT_LIMIT = 60;
const MAX_CONCURRENCY = 2;
const MIN_REQUEST_DELAY_MS = 1000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

/**
 * Absolute ceiling on real HTTP requests for one run (cache hits are free).
 *
 * Set well above the ~1,900 requests Phase 1 alone needs (1 sitemap + 1,871
 * project pages): Phase 2 adds one further request per DISTINCT profile that
 * won at least one award, and that count can only be known once Phase 1 has
 * run. Worst case - every award-bearing project credited to a different
 * profile, no studio ever repeating - is 1,871 additional requests, for a
 * theoretical ceiling of ~3,743. In practice a studio submits many projects
 * (see Buff/profile 273: 4 published projects, 5 awards) so the real Phase 2
 * count runs far lower, but the cap is sized for the theoretical worst case
 * rather than the expected one - this is what a "protects against runaway
 * crawls" cap should mean, not a number tuned to just barely fit one run.
 */
const HARD_REQUEST_CAP = 4000;

// ---------- Data-contract constants (mirrors lib/directory/constants.ts and
// the `AgencySource` union in lib/directory/types.ts; this script is plain
// .mjs with no TS build step, so the value is duplicated here on purpose
// rather than imported - see scrape-awwwards.mjs's header comment for why).
// ----------

const AGENCY_SOURCE = "motion-design-awards";
const CATEGORY_MOTION_DESIGN = "motion-design";

/**
 * Mirrors the accolade-count threshold `shouldIndexAgency` uses to admit a
 * motion-design record to search indexing without a long description - see
 * `ACCOLADE_RANKED_CATEGORIES` in lib/directory/constants.ts. Duplicated
 * here, not imported (same reason as every other mirrored constant in this
 * file), purely so the end-of-run report below can tell the orchestrator how
 * many shipped records clear it, without a second script needing to exist.
 * This value does not affect anything this importer writes - indexing is a
 * render-time decision the app makes, not a field on `Agency`.
 */
const INDEXABLE_ACCOLADE_COUNT_THRESHOLD = 3;

/** Mirrors `shouldIndexAgency`'s fallback description-length gate for
 *  records below INDEXABLE_ACCOLADE_COUNT_THRESHOLD. Reporting-only, see
 *  that constant's comment. */
const INDEXABLE_DESCRIPTION_MIN_LENGTH = 80;

// ---------- Apollo cache constants ----------

/** `__typename` values this script reads out of `initialApolloState`. */
const APOLLO_TYPENAME_PROJECT = "Project";
const APOLLO_TYPENAME_PROFILE = "Profile";
const APOLLO_TYPENAME_AWARD = "Award";

/** The one profile `type` this importer admits - see this file's header
 *  comment on why that field can only be read from a profile page fetch,
 *  never from a project page. */
const PROFILE_TYPE_STUDIO = "STUDIO";

/** Prefix of the dynamic, argument-bearing Apollo field key that holds a
 *  profile's avatar, e.g. `avatar({"renditions":[{"height":182,"width":182}]})`.
 *  Matched by prefix because the argument object's serialisation (which
 *  renditions were requested) differs between a project page (86x86) and a
 *  profile page (182x182). */
const AVATAR_FIELD_KEY_PREFIX = "avatar(";

/** Prefix of the dynamic Apollo ROOT_QUERY field key for a single project,
 *  e.g. `project({"id":"146"})`. Matched by prefix for the same reason as
 *  AVATAR_FIELD_KEY_PREFIX - the argument serialisation is not worth
 *  reproducing exactly when a prefix match is unambiguous on this page. */
const ROOT_QUERY_PROJECT_FIELD_PREFIX = "project(";

/** Prefix of the dynamic Apollo ROOT_QUERY field key for a single profile,
 *  e.g. `profile({"id":"273"})`. */
const ROOT_QUERY_PROFILE_FIELD_PREFIX = "profile(";

// A profile that has never uploaded a real avatar serves a placeholder at
// `https://storage-01-mda.keyfram.es/seed/x.gif` on its `src` field, with
// `srcSet` left as the empty string - confirmed against profile 27 (Joost
// Korngold) during development. `src` is a real, well-formed https URL, so
// nothing else in this script's URL validation would catch it, but it
// carries no more information than the `data:` placeholder the brief calls
// out by name - both mean "no avatar". This never needs special-casing:
// resolveLogoUrl() below reads only `srcSet`, which is empty whenever this
// placeholder is in play, so parseLargestSrcSetUrl() already returns null
// without ever inspecting `src`.

/**
 * Award type code -> singular display label, read verbatim out of MDA's own
 * `pages/winners/[[...type]]` JS bundle (fetched and grepped during
 * development: it ships a literal
 * `{HM:"Honorable mentions",VOTD:"Videos of the day",VOTM:"Videos of the month",
 * VOTY:"Videos of the year",DOTY:"Designers of the year",SOTY:"Studios of the year"}`
 * map used to render its own category headings). Singularised and
 * title-cased here to read as one accolade rather than a category heading -
 * "Video of the Day", not "Videos of the day". This is the complete set:
 * MDA's static-page sitemap (sitemap.static.xml) lists exactly six
 * `/winners/<code>` routes and these are all six codes. A code not in this
 * map is therefore unrecognised, not merely rare, and
 * awardTypeLabel() below returns null for it rather than guessing - the
 * caller then falls back to the generic accolade string per the brief.
 */
const AWARD_TYPE_LABEL_BY_CODE = {
  HM: "Honorable Mention",
  VOTD: "Video of the Day",
  VOTM: "Video of the Month",
  VOTY: "Video of the Year",
  DOTY: "Designer of the Year",
  SOTY: "Studio of the Year",
};

/** Generic accolade string used when an award's type code is missing or not
 *  in AWARD_TYPE_LABEL_BY_CODE - names the win without asserting a specific
 *  award type this script cannot verify. */
const GENERIC_ACCOLADE_PREFIX = "Motion Design Awards winner";

/** Em dash joining an award type (or the generic prefix) to the project
 *  title in one accolade string, e.g. "Video of the Day — BOUNC". */
const ACCOLADE_SEPARATOR = " — ";

// ---------- Website URL constants (mirrors import-semrush.mjs) ----------

/** MDA website links are plain hostnames/paths with no tracking params in
 *  every profile seen during development, but the brief asks that utm/
 *  tracking params be stripped defensively regardless - mirrors the utm_
 *  handling in import-semrush.mjs, which is the one importer that has
 *  actually needed it. */
const TRACKING_PARAM_PREFIX = "utm_";

// ---------- Best-effort public-suffix list (2-label ccTLD suffixes only)
// ----------
// Duplicated verbatim from scrape-awwwards.mjs / import-semrush.mjs - see
// either script's comment above this same table for the accuracy caveat.
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

/** Named HTML entities this script decodes (mirrors import-semrush.mjs).
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

// ---------- CLI constants ----------

/** Case-insensitive `--limit` value meaning "no cap - take every qualifying
 *  STUDIO profile found". Mirrors import-semrush.mjs. */
const LIMIT_ALL_KEYWORD = "all";

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

/**
 * Collapses all whitespace runs into single spaces and trims the result.
 * @param {string | null | undefined} text Raw text.
 * @returns {string | null} Normalised text, or null if nothing remained.
 */
function normalizeWhitespace(text) {
  try {
    if (!text) return null;
    const collapsed = text.replace(/\s+/g, " ").trim();
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
    const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : "studio";
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
    const fallbackSlug = `studio-${usedSlugs.size + 1}`;
    usedSlugs.add(fallbackSlug);
    return fallbackSlug;
  }
}

/**
 * Decodes the small set of HTML entities this script needs to handle, in a
 * single regex pass so an entity produced by decoding one match is never
 * re-decoded as if it were markup. Duplicated verbatim from
 * import-semrush.mjs, which hit real `&amp;`-encoded website hrefs in the
 * wild - see normalizeWebsiteUrl() below for why this runs before URL
 * parsing.
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
 * Removes utm_*-prefixed query params from a URL, in place.
 * @param {URL} parsedUrl URL to strip params from (mutated).
 * @returns {void}
 */
function stripTrackingParams(parsedUrl) {
  try {
    const keysToRemove = Array.from(parsedUrl.searchParams.keys()).filter((key) =>
      key.toLowerCase().startsWith(TRACKING_PARAM_PREFIX),
    );
    for (const key of keysToRemove) {
      parsedUrl.searchParams.delete(key);
    }
  } catch (error) {
    console.warn(`stripTrackingParams() failed for "${parsedUrl}": ${error?.message ?? error}`);
  }
}

/**
 * Normalises a raw website string (e.g. "www.buffmotion.com/") into an
 * absolute https URL with tracking params removed. Decodes HTML entities
 * BEFORE parsing - import-semrush.mjs hit real profiles with a literal
 * un-decoded `&amp;` between query params, and the same defensive ordering
 * is used here even though no MDA profile seen during development needed it.
 * @param {string | null | undefined} rawWebsite Website string as returned
 *   by the API.
 * @returns {string | null} Absolute https URL, or null if unparseable/absent.
 */
function normalizeWebsiteUrl(rawWebsite) {
  try {
    if (!rawWebsite) return null;
    const trimmedWebsite = decodeHtmlEntities(rawWebsite.trim());
    if (!trimmedWebsite) return null;
    const websiteWithProtocol = /^https?:\/\//i.test(trimmedWebsite)
      ? trimmedWebsite
      : `https://${trimmedWebsite}`;
    const parsedUrl = new URL(websiteWithProtocol);
    parsedUrl.protocol = "https:";
    stripTrackingParams(parsedUrl);
    return parsedUrl.toString();
  } catch (error) {
    console.warn(`normalizeWebsiteUrl() could not parse "${rawWebsite}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Derives the registrable domain (eTLD+1), lowercased, `www.` stripped, from
 * a hostname. Duplicated verbatim from scrape-awwwards.mjs / import-semrush.mjs.
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
 * Expands an ISO 3166-1 alpha-2 country code into its full English display
 * name via `Intl.DisplayNames` - the platform's own CLDR-backed registry,
 * used here instead of a hand-maintained name table (unlike
 * scrape-awwwards.mjs's COUNTRY_CODE_BY_NAME, which maps the other
 * direction and exists only because Awwwards publishes names, not codes).
 * MDA's `country` field is already an alpha-2 code, so this is a
 * mechanical expansion, not a lookup that could plausibly miss an entry.
 * @param {string | null | undefined} countryCode Alpha-2 code, e.g. "GB".
 * @returns {string | null} Full display name, or null if `countryCode` is
 *   absent or not a recognised region.
 */
function expandCountryName(countryCode) {
  try {
    if (!countryCode) return null;
    const upperCaseCode = countryCode.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(upperCaseCode)) return null;
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    const expandedName = displayNames.of(upperCaseCode);
    if (!expandedName || expandedName === upperCaseCode || expandedName === "Unknown Region") {
      return null;
    }
    return expandedName;
  } catch (error) {
    console.warn(`expandCountryName() failed for "${countryCode}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Looks up the singular display label for an award type code.
 * @param {string | null | undefined} awardTypeCode Raw code, e.g. "VOTD".
 * @returns {string | null} Display label, or null if unrecognised.
 */
function awardTypeLabel(awardTypeCode) {
  try {
    if (!awardTypeCode) return null;
    return AWARD_TYPE_LABEL_BY_CODE[awardTypeCode] ?? null;
  } catch (error) {
    console.warn(`awardTypeLabel() failed for "${awardTypeCode}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Builds one accolade string for a single award instance.
 * @param {string | null | undefined} awardTypeCode Raw award type code.
 * @param {string} projectTitle Title of the project the award was for.
 * @returns {string} One accolade string, e.g. "Video of the Day — BOUNC".
 */
function buildAccoladeText(awardTypeCode, projectTitle) {
  try {
    const label = awardTypeLabel(awardTypeCode);
    const prefix = label ?? GENERIC_ACCOLADE_PREFIX;
    return `${prefix}${ACCOLADE_SEPARATOR}${projectTitle}`;
  } catch (error) {
    console.warn(`buildAccoladeText() failed for "${projectTitle}": ${error?.message ?? error}`);
    return `${GENERIC_ACCOLADE_PREFIX}${ACCOLADE_SEPARATOR}${projectTitle}`;
  }
}

/**
 * Builds an all-zero AgencyAwards object. MDA is not an Awwwards-scheme
 * source - its wins live in `accolades`, never here. Mirrors ZEROED_AWARDS
 * in load-branding-json.mjs, which documents the same convention for D&AD.
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

// ---------- robots.txt handling (mirrors scrape-awwwards.mjs) ----------

/**
 * Parses robots.txt text into user-agent groups, each with its ordered
 * list of Allow/Disallow rules. Duplicated verbatim from scrape-awwwards.mjs.
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
 * Picks the robots.txt group that applies to this bot. Duplicated verbatim
 * from scrape-awwwards.mjs.
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
 * Converts a robots.txt path pattern into a RegExp matching from the start
 * of the string. Duplicated verbatim from scrape-awwwards.mjs.
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
 * Evaluates whether a request path is allowed under a set of robots.txt
 * rules, using longest-match-wins with Allow breaking ties. Duplicated
 * verbatim from scrape-awwwards.mjs.
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
 * whether a given path is allowed.
 *
 * UNLIKE scrape-awwwards.mjs / import-semrush.mjs, this throws rather than
 * returning an always-false predicate when the fetch or parse fails - see
 * this file's header comment on why a genuine fetch/parse failure here
 * should abort the whole run instead of silently degrading to "nothing is
 * allowed" (which would make the crawl run to completion and write an
 * empty file, hiding the real problem).
 * @returns {Promise<(requestPath: string) => boolean>} Path-allowed predicate.
 * @throws When robots.txt cannot be fetched or read as text.
 */
async function loadRobotsRules() {
  try {
    const response = await fetch(ROBOTS_URL, { headers: { "User-Agent": USER_AGENT } });
    if (!response?.ok) {
      throw new Error(`robots.txt fetch returned status ${response?.status}`);
    }
    const robotsText = await response.text();
    const groups = parseRobotsGroups(robotsText);
    const applicableGroup = selectApplicableRobotsGroup(groups);
    const rules = applicableGroup?.rules ?? [];
    return (requestPath) => isPathAllowedByRules(requestPath, rules);
  } catch (error) {
    throw new Error(
      `loadRobotsRules() failed; aborting per fail-closed policy: ${error?.message ?? error}`,
    );
  }
}

/**
 * Checks whether a full URL is allowed by robots.txt, using the pathname and
 * query string as the request path. Duplicated verbatim from
 * scrape-awwwards.mjs.
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

let totalRequestCount = 0;
let cacheHitCount = 0;
let lastRequestStartedAt = 0;
let activeWorkerCount = 0;
const throttleQueue = [];
/** @type {Array<{url: string, reason: string}>} */
const failures = [];
/** Set from CLI `--refresh` - when true, cache reads are skipped (fresh
 *  fetches only) though writes still happen, refreshing the cache for the
 *  next run. */
let bypassCacheReads = false;

/**
 * Queues a task to run under the shared concurrency and minimum-delay
 * limits that govern every network request. Duplicated verbatim from
 * scrape-awwwards.mjs.
 * @param {() => Promise<any>} task Function performing one HTTP request.
 * @returns {Promise<any>} Resolves/rejects with the task's outcome.
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
 * Starts queued tasks while under the concurrency limit. Duplicated
 * verbatim from scrape-awwwards.mjs.
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
 * slot and pumps the queue again. Duplicated verbatim from scrape-awwwards.mjs.
 * @param {() => Promise<any>} task Function performing one HTTP request.
 * @param {number} waitMs Milliseconds to wait before starting.
 * @param {(value: any) => void} resolve Resolves the caller's promise.
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
 * errors, up to MAX_RETRIES attempts, returning the raw ArrayBuffer body.
 * Text responses (HTML) decode it as UTF-8; the sitemap fetch gunzips it
 * directly - one retry/backoff implementation serves both, since the only
 * difference between them is how the caller reads the finished buffer.
 * @param {string} url Absolute URL to fetch.
 * @returns {Promise<ArrayBuffer>} Response body bytes.
 */
async function fetchWithRetry(url) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      totalRequestCount += 1;
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (response.status === 429 || response.status >= 500) {
        throw new RetryableHttpError(response.status);
      }
      if (!response.ok) {
        throw new Error(`Non-retryable HTTP ${response.status} for ${url}`);
      }
      return await response.arrayBuffer();
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
 * @param {string} extension Cache file extension, without the leading dot.
 * @returns {string} Absolute path under CACHE_DIRECTORY.
 */
function cacheFilePathForUrl(url, extension) {
  try {
    const hash = createHash("sha256").update(url).digest("hex");
    return path.join(CACHE_DIRECTORY, `${hash}.${extension}`);
  } catch (error) {
    throw new Error(`cacheFilePathForUrl() failed for "${url}": ${error?.message ?? error}`);
  }
}

/**
 * Reads a cached response body for a URL, if present and not bypassed.
 * @param {string} url Absolute URL.
 * @param {string} extension Cache file extension used for this URL's fetches.
 * @returns {Promise<Buffer | null>} Cached body bytes, or null on a cache
 *   miss (or when `--refresh` is bypassing reads).
 */
async function readFromCache(url, extension) {
  try {
    if (bypassCacheReads) return null;
    const filePath = cacheFilePathForUrl(url, extension);
    return await readFile(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    console.warn(`readFromCache() error for "${url}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Writes a response body to the on-disk cache for a URL. Always writes,
 * even under `--refresh` - a refreshed run should leave the cache current
 * for the next, non-refreshed run.
 * @param {string} url Absolute URL.
 * @param {string} extension Cache file extension used for this URL's fetches.
 * @param {Buffer} body Response body bytes.
 * @returns {Promise<void>} Resolves once written (or logs and gives up).
 */
async function writeToCache(url, extension, body) {
  try {
    const filePath = cacheFilePathForUrl(url, extension);
    await writeFile(filePath, body);
  } catch (error) {
    console.warn(`writeToCache() error for "${url}": ${error?.message ?? error}`);
  }
}

/**
 * Fetches a URL's raw bytes, transparently using the on-disk cache and the
 * throttled/retrying network fetch. Enforces HARD_REQUEST_CAP before making
 * a real network request (cache hits never count against it).
 * @param {string} url Absolute URL to fetch.
 * @param {string} extension Cache file extension for this URL (`"html"` for
 *   pages, `"xml"` for the decompressed sitemap).
 * @returns {Promise<Buffer>} Response body bytes.
 */
async function fetchBytes(url, extension) {
  try {
    const cachedBody = await readFromCache(url, extension);
    if (cachedBody !== null) {
      cacheHitCount += 1;
      return cachedBody;
    }
    if (totalRequestCount >= HARD_REQUEST_CAP) {
      throw new Error(`Hard request cap of ${HARD_REQUEST_CAP} reached; refusing to fetch ${url}`);
    }
    const arrayBuffer = await enqueueThrottled(() => fetchWithRetry(url));
    const body = Buffer.from(arrayBuffer);
    await writeToCache(url, extension, body);
    return body;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches a page's HTML as text, using the shared cache/throttle/retry
 * pipeline.
 * @param {string} url Absolute URL to fetch.
 * @returns {Promise<string>} Response body, decoded as UTF-8.
 */
async function fetchHtml(url) {
  try {
    const body = await fetchBytes(url, "html");
    return body.toString("utf8");
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches and gunzips the projects sitemap, using the shared cache/throttle/
 * retry pipeline - cached as decompressed XML text so re-runs never redo the
 * gunzip either.
 * @returns {Promise<string>} Decompressed sitemap XML.
 */
async function fetchProjectsSitemapXml() {
  try {
    const cachedXml = await readFromCache(PROJECTS_SITEMAP_URL, "xml");
    if (cachedXml !== null) {
      cacheHitCount += 1;
      return cachedXml.toString("utf8");
    }
    if (totalRequestCount >= HARD_REQUEST_CAP) {
      throw new Error(`Hard request cap of ${HARD_REQUEST_CAP} reached before fetching the sitemap`);
    }
    const gzippedBuffer = Buffer.from(await enqueueThrottled(() => fetchWithRetry(PROJECTS_SITEMAP_URL)));
    const xmlBuffer = gunzipSync(gzippedBuffer);
    await writeToCache(PROJECTS_SITEMAP_URL, "xml", xmlBuffer);
    return xmlBuffer.toString("utf8");
  } catch (error) {
    throw new Error(`fetchProjectsSitemapXml() failed: ${error?.message ?? error}`);
  }
}

// ---------- Sitemap parsing ----------

/**
 * Extracts every `<loc>` URL from a sitemap XML document.
 * @param {string} sitemapXml Raw (decompressed) sitemap XML.
 * @returns {string[]} URLs in document order.
 */
function parseSitemapLocs(sitemapXml) {
  try {
    const matches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
    return matches.map((match) => decodeHtmlEntities(match[1].trim())).filter(Boolean);
  } catch (error) {
    console.warn(`parseSitemapLocs() failed: ${error?.message ?? error}`);
    return [];
  }
}

// ---------- __NEXT_DATA__ / Apollo cache parsing ----------

/** Matches the `__NEXT_DATA__` script tag regardless of attribute order. */
const NEXT_DATA_SCRIPT_PATTERN = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;

/**
 * Extracts and parses the `__NEXT_DATA__` JSON payload embedded in a
 * server-rendered MDA page.
 * @param {string} html Full page HTML.
 * @param {string} pageUrl URL the HTML was fetched from (for warnings).
 * @returns {Record<string, any> | null} The `initialApolloState` map, or
 *   null if the script tag was missing or unparseable.
 */
function extractApolloState(html, pageUrl) {
  try {
    const match = html.match(NEXT_DATA_SCRIPT_PATTERN);
    if (!match) return null;
    const nextData = JSON.parse(match[1]);
    const apolloState = nextData?.props?.pageProps?.initialApolloState;
    return apolloState && typeof apolloState === "object" ? apolloState : null;
  } catch (error) {
    console.warn(`extractApolloState() failed for ${pageUrl}: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Resolves an Apollo `{"__ref": "Type:id"}` pointer to its entity.
 * @param {Record<string, any>} apolloState Full normalised cache.
 * @param {{__ref?: string} | null | undefined} reference Pointer object.
 * @returns {Record<string, any> | null} The referenced entity, or null.
 */
function resolveApolloRef(apolloState, reference) {
  try {
    const refKey = reference?.__ref;
    if (!refKey) return null;
    return apolloState?.[refKey] ?? null;
  } catch (error) {
    console.warn(`resolveApolloRef() failed for "${reference?.__ref}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Finds the value of a dynamic ROOT_QUERY field by its key prefix (the
 * field's serialised GraphQL arguments make an exact key unworkable across
 * pages - see ROOT_QUERY_PROJECT_FIELD_PREFIX's comment).
 * @param {Record<string, any>} apolloState Full normalised cache.
 * @param {string} fieldPrefix Prefix to match, e.g. `"project("`.
 * @returns {any} The field's value (typically a `{__ref}` pointer), or
 *   undefined if no matching field exists.
 */
function findRootQueryFieldByPrefix(apolloState, fieldPrefix) {
  try {
    const rootQuery = apolloState?.ROOT_QUERY;
    if (!rootQuery) return undefined;
    const matchingKey = Object.keys(rootQuery).find((key) => key.startsWith(fieldPrefix));
    return matchingKey ? rootQuery[matchingKey] : undefined;
  } catch (error) {
    console.warn(`findRootQueryFieldByPrefix() failed for prefix "${fieldPrefix}": ${error?.message ?? error}`);
    return undefined;
  }
}

/**
 * Reads a Profile entity's dynamic avatar field and returns its `srcSet`.
 * @param {Record<string, any> | null} profileEntity Profile entity (full or
 *   the stripped fragment embedded in a project page).
 * @returns {string | null} Raw `srcSet` value, or null if absent/empty.
 */
function extractAvatarSrcSet(profileEntity) {
  try {
    if (!profileEntity) return null;
    const avatarKey = Object.keys(profileEntity).find((key) => key.startsWith(AVATAR_FIELD_KEY_PREFIX));
    if (!avatarKey) return null;
    const srcSet = profileEntity[avatarKey]?.srcSet;
    return srcSet && srcSet.length > 0 ? srcSet : null;
  } catch (error) {
    console.warn(`extractAvatarSrcSet() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Parses a `srcSet` string (`"url1 38w, url2 86w, ..."`) and returns the
 * URL of its largest-width entry. Never returns a `data:` URI - only
 * `https://` entries are considered candidates, and MDA's `srcSet` values
 * are only ever real hosted URLs or the empty string (its `data:` LQIP
 * placeholders live on `src`, a sibling field this function never reads -
 * see AVATAR_PLACEHOLDER_PATH_SEGMENT's comment for the other placeholder
 * shape this deliberately never falls back to).
 * @param {string | null} srcSet Raw `srcSet` value.
 * @returns {string | null} Largest-width https URL, or null if none.
 */
function parseLargestSrcSetUrl(srcSet) {
  try {
    if (!srcSet) return null;
    const candidates = srcSet
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [url, widthToken] = entry.split(/\s+/);
        const width = Number.parseInt((widthToken ?? "").replace(/\D/g, ""), 10);
        return { url, width: Number.isNaN(width) ? 0 : width };
      })
      .filter((candidate) => candidate.url && /^https:\/\//i.test(candidate.url));
    if (candidates.length === 0) return null;
    candidates.sort((first, second) => second.width - first.width);
    return candidates[0].url;
  } catch (error) {
    console.warn(`parseLargestSrcSetUrl() failed for "${srcSet}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Resolves a Profile entity's logo URL.
 * @param {Record<string, any> | null} profileEntity Profile entity.
 * @returns {string | null} Absolute https logo URL, or null.
 */
function resolveLogoUrl(profileEntity) {
  try {
    return parseLargestSrcSetUrl(extractAvatarSrcSet(profileEntity));
  } catch (error) {
    console.warn(`resolveLogoUrl() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Builds an `AgencyLocation` from a Profile entity's raw `city`/`country`.
 * @param {Record<string, any> | null} profileEntity Profile entity.
 * @returns {{country: string | null, countryCode: string | null, city: string | null} | null}
 *   Location, or null when neither field is present.
 */
function resolveLocation(profileEntity) {
  try {
    const rawCountryCode = profileEntity?.country ?? null;
    const rawCity = normalizeWhitespace(profileEntity?.city ?? null);
    if (!rawCountryCode && !rawCity) return null;
    return {
      country: expandCountryName(rawCountryCode),
      countryCode: rawCountryCode ? rawCountryCode.trim().toUpperCase() : null,
      city: rawCity,
    };
  } catch (error) {
    console.warn(`resolveLocation() failed: ${error?.message ?? error}`);
    return null;
  }
}

// ---------- Phase 1: project pages ----------

/**
 * One profile's accumulated state across every award-bearing project it was
 * credited on, built up across Phase 1 and finalised in Phase 2.
 * @typedef {object} ProfileAccumulatorEntry
 * @property {string} profileId
 * @property {Record<string, any>} latestProfileFragment Most recently seen
 *   embedded Profile fragment (company/city/country/website/avatar) - used
 *   as a fallback only; Phase 2's full profile page fetch overwrites these.
 * @property {string[]} accolades One string per award instance won.
 */

/**
 * Processes one project page: resolves its canonical Project entity,
 * skips it immediately if it won no awards, and otherwise appends one
 * accolade per award instance to the credited profile's accumulator entry.
 * @param {string} projectUrl Absolute project page URL.
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @param {Map<string, ProfileAccumulatorEntry>} profileAccumulator Mutated
 *   in place with this project's contribution.
 * @param {Record<string, number>} counters Mutated run counters.
 * @returns {Promise<void>} Resolves once this project has been processed
 *   (or its failure recorded).
 */
async function processProjectPage(projectUrl, isPathAllowed, profileAccumulator, counters) {
  try {
    if (!isUrlAllowed(projectUrl, isPathAllowed)) {
      console.warn(`robots.txt disallows ${projectUrl}; skipping.`);
      counters.robotsDisallowed = (counters.robotsDisallowed ?? 0) + 1;
      return;
    }

    let html;
    try {
      html = await fetchHtml(projectUrl);
    } catch (error) {
      failures.push({ url: projectUrl, reason: error?.message ?? String(error) });
      counters.projectFetchFailed = (counters.projectFetchFailed ?? 0) + 1;
      return;
    }

    const apolloState = extractApolloState(html, projectUrl);
    if (!apolloState) {
      console.warn(`No parseable __NEXT_DATA__ on ${projectUrl}; skipping.`);
      counters.missingNextData = (counters.missingNextData ?? 0) + 1;
      return;
    }

    const projectReference = findRootQueryFieldByPrefix(apolloState, ROOT_QUERY_PROJECT_FIELD_PREFIX);
    const projectEntity = resolveApolloRef(apolloState, projectReference);
    if (!projectEntity || projectEntity.__typename !== APOLLO_TYPENAME_PROJECT) {
      console.warn(`No resolvable Project entity on ${projectUrl}; skipping.`);
      counters.malformedApolloState = (counters.malformedApolloState ?? 0) + 1;
      return;
    }

    const projectTitle = normalizeWhitespace(projectEntity.title);
    const awardReferences = Array.isArray(projectEntity.awards) ? projectEntity.awards : [];
    if (awardReferences.length === 0 || !projectTitle) {
      counters.noAwardProjects = (counters.noAwardProjects ?? 0) + 1;
      return;
    }

    const profileEntity = resolveApolloRef(apolloState, projectEntity.profile);
    const profileId = profileEntity?.id ?? null;
    if (!profileId) {
      console.warn(`Project "${projectTitle}" (${projectUrl}) has awards but no credited profile; skipping.`);
      counters.missingCreditedProfile = (counters.missingCreditedProfile ?? 0) + 1;
      return;
    }

    let accumulatorEntry = profileAccumulator.get(profileId);
    if (!accumulatorEntry) {
      accumulatorEntry = { profileId, latestProfileFragment: profileEntity, accolades: [] };
      profileAccumulator.set(profileId, accumulatorEntry);
      counters.distinctProfilesWithAwards = (counters.distinctProfilesWithAwards ?? 0) + 1;
    } else {
      accumulatorEntry.latestProfileFragment = profileEntity;
    }

    for (const awardReference of awardReferences) {
      const awardEntity = resolveApolloRef(apolloState, awardReference);
      const awardTypeCode =
        awardEntity?.__typename === APOLLO_TYPENAME_AWARD ? awardEntity.type ?? null : null;
      accumulatorEntry.accolades.push(buildAccoladeText(awardTypeCode, projectTitle));
      counters.awardInstancesSeen = (counters.awardInstancesSeen ?? 0) + 1;
    }
  } catch (error) {
    console.warn(`processProjectPage() failed for ${projectUrl}: ${error?.message ?? error}`);
    failures.push({ url: projectUrl, reason: error?.message ?? String(error) });
  }
}

// ---------- Phase 2: profile pages ----------

/**
 * Fetches one profile's own page and resolves its canonical, FULL Profile
 * entity - the only place `type`, `tagline`, `description` and
 * `awards_summary` are available (see this file's header comment).
 * @param {string} profileId MDA profile id.
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @returns {Promise<Record<string, any> | null>} Full Profile entity, or
 *   null if the fetch or parse failed (recorded as a failure either way).
 */
async function fetchFullProfileEntity(profileId, isPathAllowed) {
  try {
    const profileUrl = `${MDA_ORIGIN}${PROFILE_PATH_PREFIX}${profileId}`;
    if (!isUrlAllowed(profileUrl, isPathAllowed)) {
      console.warn(`robots.txt disallows ${profileUrl}; skipping profile ${profileId}.`);
      return null;
    }

    let html;
    try {
      html = await fetchHtml(profileUrl);
    } catch (error) {
      failures.push({ url: profileUrl, reason: error?.message ?? String(error) });
      return null;
    }

    const apolloState = extractApolloState(html, profileUrl);
    if (!apolloState) {
      console.warn(`No parseable __NEXT_DATA__ on ${profileUrl}.`);
      return null;
    }

    const profileReference = findRootQueryFieldByPrefix(apolloState, ROOT_QUERY_PROFILE_FIELD_PREFIX);
    const profileEntity = resolveApolloRef(apolloState, profileReference);
    if (!profileEntity || profileEntity.__typename !== APOLLO_TYPENAME_PROFILE) {
      console.warn(`No resolvable Profile entity on ${profileUrl}.`);
      return null;
    }
    return profileEntity;
  } catch (error) {
    console.warn(`fetchFullProfileEntity() failed for profile ${profileId}: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Cross-checks an accumulated accolade count against the profile's own
 * `awards_summary.total`, logging (never throwing) on a mismatch - per the
 * brief, neither number is silently trusted over the other; this just
 * surfaces the disagreement so it can be investigated, and the caller keeps
 * using the accolade list actually derived from named award instances.
 * @param {string} profileName Display name, for the warning message.
 * @param {number} accoladeCount Accolades actually collected in Phase 1.
 * @param {Record<string, any> | null} profileEntity Full Profile entity.
 * @returns {void}
 */
function warnIfAwardsSummaryMismatched(profileName, accoladeCount, profileEntity) {
  try {
    const summaryTotal = profileEntity?.awards_summary?.total;
    if (typeof summaryTotal !== "number") return;
    if (summaryTotal !== accoladeCount) {
      console.warn(
        `Award count mismatch for "${profileName}": collected ${accoladeCount} accolade(s) from ` +
          `project pages but awards_summary.total reports ${summaryTotal}.`,
      );
    }
  } catch (error) {
    console.warn(`warnIfAwardsSummaryMismatched() failed for "${profileName}": ${error?.message ?? error}`);
  }
}

// ---------- Agency record construction ----------

/**
 * Builds a final Agency record (matching lib/directory/types.ts exactly)
 * for one STUDIO profile.
 * @param {ProfileAccumulatorEntry} accumulatorEntry This profile's Phase 1
 *   accumulator entry.
 * @param {Record<string, any>} fullProfileEntity Phase 2's full Profile entity.
 * @param {Set<string>} usedSlugs Slugs already assigned in this run.
 * @param {string} scrapedAt ISO-8601 timestamp shared by the whole run.
 * @returns {object} Agency record ready for JSON output.
 */
function buildAgencyRecord(accumulatorEntry, fullProfileEntity, usedSlugs, scrapedAt) {
  try {
    const name = normalizeWhitespace(fullProfileEntity?.company) ?? `Studio ${accumulatorEntry.profileId}`;
    const websiteUrl = normalizeWebsiteUrl(fullProfileEntity?.website ?? null);
    const domain = resolveDomainFromWebsite(websiteUrl);
    const description =
      normalizeWhitespace(fullProfileEntity?.description) ?? normalizeWhitespace(fullProfileEntity?.tagline);
    const slug = makeUniqueSlug(slugify(name), usedSlugs);

    return {
      slug,
      name,
      website: websiteUrl,
      domain,
      profileUrl: `${MDA_ORIGIN}${PROFILE_PATH_PREFIX}${accumulatorEntry.profileId}`,
      location: resolveLocation(fullProfileEntity),
      categories: [CATEGORY_MOTION_DESIGN],
      services: [],
      teamSize: null,
      logoUrl: resolveLogoUrl(fullProfileEntity),
      description,
      // MDA is an awards jury, not a review site or a business directory -
      // it publishes none of the fields below for any profile. Emitted as
      // explicit nulls/empties rather than omitted so every record in
      // lib/directory/data/ is a complete `Agency`, same convention as
      // scrape-awwwards.mjs's buildAgencyRecord().
      awards: createEmptyAwards(),
      rating: null,
      accolades: accumulatorEntry.accolades,
      foundedYear: null,
      industries: [],
      budgetLabel: null,
      budgetFloorUsd: null,
      clients: [],
      source: AGENCY_SOURCE,
      scrapedAt,
    };
  } catch (error) {
    console.warn(`buildAgencyRecord() failed for profile ${accumulatorEntry?.profileId}: ${error?.message ?? error}`);
    throw error;
  }
}

/**
 * Ranks candidate records by accolade count descending, then name ascending
 * - the ordering the brief specifies, and the key the later dedupe pass
 * relies on to decide which of two colliding records is "higher-ranked".
 * @param {object[]} records Candidate Agency records.
 * @returns {object[]} A new, ranked array (input is not mutated).
 */
function rankCandidates(records) {
  try {
    return [...records].sort((first, second) => {
      const accoladeCountDifference = second.accolades.length - first.accolades.length;
      if (accoladeCountDifference !== 0) return accoladeCountDifference;
      return first.name.localeCompare(second.name);
    });
  } catch (error) {
    console.warn(`rankCandidates() failed: ${error?.message ?? error}`);
    return records;
  }
}

/**
 * Drops lower-ranked duplicates that share BOTH a registrable domain and a
 * city with an earlier (higher-ranked) record - two profile ids that
 * plausibly represent the same real-world studio. Records that share a
 * domain but differ in city are deliberately kept as separate records (a
 * multi-office studio), and records with no domain are never deduped this
 * way at all - see the brief's DEDUPE section.
 * @param {object[]} rankedRecords Records already sorted by rankCandidates().
 * @param {Record<string, number>} counters Mutated with a `duplicateDomainCity` count.
 * @returns {object[]} Records with lower-ranked domain+city duplicates removed.
 */
function dedupeByDomainAndCity(rankedRecords, counters) {
  try {
    const seenDomainCityKeys = new Set();
    const deduped = [];
    for (const record of rankedRecords) {
      if (!record.domain) {
        deduped.push(record);
        continue;
      }
      const dedupeKey = `${record.domain}|${record.location?.city ?? ""}`;
      if (seenDomainCityKeys.has(dedupeKey)) {
        console.warn(
          `Dropping "${record.name}" (${record.profileUrl}) as a domain+city duplicate of an ` +
            `already-kept higher-ranked record (${record.domain}, ${record.location?.city ?? "no city"}).`,
        );
        counters.duplicateDomainCity = (counters.duplicateDomainCity ?? 0) + 1;
        continue;
      }
      seenDomainCityKeys.add(dedupeKey);
      deduped.push(record);
    }
    return deduped;
  } catch (error) {
    console.warn(`dedupeByDomainAndCity() failed: ${error?.message ?? error}`);
    return rankedRecords;
  }
}

// ---------- CLI ----------

/**
 * Parses one raw `--limit` value into a usable option value. Mirrors
 * import-semrush.mjs's `parseLimitValue`.
 * @param {string | undefined} rawValue Raw CLI value, e.g. "60" or "all".
 * @returns {number | null | undefined} `null` for the `all` keyword (no
 *   cap), a positive integer for a numeric value, or `undefined` when
 *   `rawValue` is missing/unparseable.
 */
function parseLimitValue(rawValue) {
  try {
    if (!rawValue) return undefined;
    if (rawValue.toLowerCase() === LIMIT_ALL_KEYWORD) return null;
    const parsedValue = Number.parseInt(rawValue, 10);
    return !Number.isNaN(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
  } catch (error) {
    console.warn(`parseLimitValue() failed for "${rawValue}": ${error?.message ?? error}`);
    return undefined;
  }
}

/**
 * Parses `--limit N` / `--limit=N` / `--limit=all` / `--dry-run` / `--refresh`
 * from CLI args.
 * @param {string[]} argv Arguments after the script path (`process.argv.slice(2)`).
 * @returns {{limit: number | null, dryRun: boolean, refresh: boolean}} Parsed options.
 */
function parseCliArgs(argv) {
  try {
    const options = { limit: DEFAULT_LIMIT, dryRun: false, refresh: false };
    for (let index = 0; index < argv.length; index += 1) {
      const argument = argv[index];
      if (argument === "--limit") {
        const parsedLimit = parseLimitValue(argv[index + 1]);
        if (parsedLimit !== undefined) options.limit = parsedLimit;
        index += 1;
      } else if (argument?.startsWith("--limit=")) {
        const parsedLimit = parseLimitValue(argument.slice("--limit=".length));
        if (parsedLimit !== undefined) options.limit = parsedLimit;
      } else if (argument === "--dry-run") {
        options.dryRun = true;
      } else if (argument === "--refresh") {
        options.refresh = true;
      }
    }
    return options;
  } catch (error) {
    console.warn(`parseCliArgs() failed; using defaults: ${error?.message ?? error}`);
    return { limit: DEFAULT_LIMIT, dryRun: false, refresh: false };
  }
}

/**
 * Prints the end-of-run summary: pages fetched, cache hits, distinct
 * profiles, STUDIO count, records written, and every rejection reason with
 * its count.
 * @param {Record<string, number>} counters Run counters accumulated throughout.
 * @param {number} recordsWritten Final record count after ranking/dedupe/cap.
 * @returns {void}
 */
function printRunSummary(counters, recordsWritten) {
  try {
    console.log("\n--- Run summary ---");
    console.log(`HTTP requests made: ${totalRequestCount} (cache hits: ${cacheHitCount})`);
    console.log(`Distinct profiles credited with at least one award: ${counters.distinctProfilesWithAwards ?? 0}`);
    console.log(`Profile pages fetched in Phase 2: ${counters.phase2ProfilesFetched ?? 0}`);
    console.log(`STUDIO profiles admitted: ${counters.studioCount ?? 0}`);
    console.log(`Records written: ${recordsWritten}`);
    console.log("Rejection reasons:");
    console.log(`  - Non-STUDIO type (individual/other): ${counters.rejectedNonStudio ?? 0}`);
    console.log(`  - Missing/unresolvable profile page: ${counters.phase2FetchFailed ?? 0}`);
    console.log(`  - Domain+city duplicates dropped: ${counters.duplicateDomainCity ?? 0}`);
    console.log(`  - Project pages with no awards (skipped, no profile touched): ${counters.noAwardProjects ?? 0}`);
    console.log(`  - Project pages disallowed by robots.txt: ${counters.robotsDisallowed ?? 0}`);
    console.log(`  - Project page fetch failures: ${counters.projectFetchFailed ?? 0}`);
    console.log(`  - Project pages with missing/unparseable __NEXT_DATA__: ${counters.missingNextData ?? 0}`);
    console.log(`  - Project pages with malformed Apollo state: ${counters.malformedApolloState ?? 0}`);
    console.log(`  - Award-bearing projects with no credited profile: ${counters.missingCreditedProfile ?? 0}`);
    if (failures.length > 0) {
      console.warn(`\n${failures.length} URL(s) failed after ${MAX_RETRIES} retries:`);
      for (const failure of failures) {
        console.warn(`  - ${failure.url}: ${failure.reason}`);
      }
    }
  } catch (error) {
    console.warn(`printRunSummary() failed: ${error?.message ?? error}`);
  }
}

/**
 * Extracts the award-type label prefix from one accolade string built by
 * buildAccoladeText() - the text before ACCOLADE_SEPARATOR.
 * @param {string} accoladeText One accolade string.
 * @returns {string} The award-type label, or GENERIC_ACCOLADE_PREFIX when
 *   `accoladeText` doesn't have the expected shape.
 */
function extractAccoladeTypeLabel(accoladeText) {
  try {
    if (!accoladeText) return GENERIC_ACCOLADE_PREFIX;
    const separatorIndex = accoladeText.indexOf(ACCOLADE_SEPARATOR);
    if (separatorIndex === -1) return GENERIC_ACCOLADE_PREFIX;
    return accoladeText.slice(0, separatorIndex);
  } catch (error) {
    console.warn(`extractAccoladeTypeLabel() failed for "${accoladeText}": ${error?.message ?? error}`);
    return GENERIC_ACCOLADE_PREFIX;
  }
}

/**
 * Prints, for the final shipped records: the distribution of accolades by
 * award type, the Honorable Mention share of the top 10's accolades, and how
 * many records clear the app's indexing threshold (`shouldIndexAgency` in
 * lib/directory/agencies.ts).
 *
 * This is worth reporting explicitly because HM and Studio/Video-of-the-Year
 * all count equally toward the `accolades.length` sort key this category
 * ranks on - a deliberate choice, not an oversight, but one the orchestrator
 * asked to see the shape of before shipping (a leaderboard that turned out
 * to be almost entirely Honorable Mentions would be worth knowing about).
 * Of `shouldIndexAgency`'s six OR'd routes to indexability, only two can
 * ever fire for an MDA record: the description-length route and the
 * accolade-count route - `awards.total` is always 0, `clients` is always
 * empty, `rating` is always null and `services` is always empty for this
 * source (see buildAgencyRecord()), so the other four routes are dead code
 * for every record this importer writes.
 * @param {object[]} finalRecords Records actually written to the output file.
 * @returns {void}
 */
function printAccoladeAndIndexabilityReport(finalRecords) {
  try {
    console.log("\n--- Accolade type distribution (shipped records) ---");
    const countByTypeLabel = new Map();
    for (const record of finalRecords) {
      for (const accolade of record.accolades) {
        const typeLabel = extractAccoladeTypeLabel(accolade);
        countByTypeLabel.set(typeLabel, (countByTypeLabel.get(typeLabel) ?? 0) + 1);
      }
    }
    const sortedTypeLabelEntries = [...countByTypeLabel.entries()].sort(
      (first, second) => second[1] - first[1],
    );
    for (const [typeLabel, count] of sortedTypeLabelEntries) {
      console.log(`  ${count}\t${typeLabel}`);
    }

    const topTenRecords = finalRecords.slice(0, 10);
    const topTenAccolades = topTenRecords.flatMap((record) => record.accolades);
    const topTenHonorableMentionCount = topTenAccolades.filter(
      (accolade) => extractAccoladeTypeLabel(accolade) === AWARD_TYPE_LABEL_BY_CODE.HM,
    ).length;
    const honorableMentionSharePercent =
      topTenAccolades.length > 0 ? (topTenHonorableMentionCount / topTenAccolades.length) * 100 : 0;
    console.log(
      `\nHonorable Mention share of the top 10's accolades: ${topTenHonorableMentionCount}/` +
        `${topTenAccolades.length} (${honorableMentionSharePercent.toFixed(1)}%)`,
    );

    const indexableByAccoladeCount = finalRecords.filter(
      (record) => record.accolades.length >= INDEXABLE_ACCOLADE_COUNT_THRESHOLD,
    ).length;
    const indexableByDescriptionOnly = finalRecords.filter(
      (record) =>
        record.accolades.length < INDEXABLE_ACCOLADE_COUNT_THRESHOLD &&
        (record.description?.trim().length ?? 0) >= INDEXABLE_DESCRIPTION_MIN_LENGTH,
    ).length;
    const totalIndexableCount = indexableByAccoladeCount + indexableByDescriptionOnly;
    console.log(
      `\nIndexable per shouldIndexAgency: ${totalIndexableCount}/${finalRecords.length} ` +
        `(${indexableByAccoladeCount} via ${INDEXABLE_ACCOLADE_COUNT_THRESHOLD}+ accolades, ` +
        `${indexableByDescriptionOnly} via a ${INDEXABLE_DESCRIPTION_MIN_LENGTH}+ character description alone). ` +
        `${finalRecords.length - totalIndexableCount} would be noindex.`,
    );
  } catch (error) {
    console.warn(`printAccoladeAndIndexabilityReport() failed: ${error?.message ?? error}`);
  }
}

/**
 * Entry point: crawls the projects sitemap, walks every project page
 * (Phase 1), resolves and filters the profiles that won at least one award
 * down to studios (Phase 2), ranks and dedupes them, writes
 * lib/directory/data/motion-design-agencies.json, and prints a run summary.
 * @returns {Promise<void>} Resolves once the run completes (or fails).
 */
async function main() {
  try {
    const cliOptions = parseCliArgs(process.argv.slice(2));
    bypassCacheReads = cliOptions.refresh;
    await mkdir(CACHE_DIRECTORY, { recursive: true });

    console.log("Loading robots.txt…");
    let isPathAllowed;
    try {
      isPathAllowed = await loadRobotsRules();
    } catch (error) {
      console.error(error?.message ?? error);
      process.exitCode = 1;
      return;
    }

    console.log("Fetching and decompressing the projects sitemap…");
    const sitemapXml = await fetchProjectsSitemapXml();
    const projectUrls = parseSitemapLocs(sitemapXml).filter((url) => url.includes(PROJECT_PATH_PREFIX));
    console.log(`Found ${projectUrls.length} project URLs in the sitemap.`);

    console.log("Phase 1: walking every project page for award-bearing profiles…");
    const counters = {};
    /** @type {Map<string, ProfileAccumulatorEntry>} */
    const profileAccumulator = new Map();
    let projectsProcessed = 0;
    await Promise.all(
      projectUrls.map(async (projectUrl) => {
        await processProjectPage(projectUrl, isPathAllowed, profileAccumulator, counters);
        projectsProcessed += 1;
        if (projectsProcessed % 100 === 0) {
          console.log(`  ...${projectsProcessed}/${projectUrls.length} project pages processed.`);
        }
      }),
    );
    console.log(
      `Phase 1 complete: ${profileAccumulator.size} distinct profile(s) credited with at least one award, ` +
        `${counters.awardInstancesSeen ?? 0} award instance(s) total.`,
    );

    console.log("Phase 2: fetching each award-bearing profile's own page…");
    const candidateRecords = [];
    const usedSlugs = new Set();
    const scrapedAt = new Date().toISOString();
    let profilesProcessed = 0;
    // Fired concurrently (not awaited one at a time) so the shared throttle
    // queue's MAX_CONCURRENCY actually gets used here too - same pattern as
    // Phase 1's Promise.all above. Every mutation of shared state below
    // (counters, candidateRecords, usedSlugs) happens synchronously once a
    // fetch's await resolves, with no further await before the next mutation,
    // so concurrent resolutions can never interleave mid-update.
    await Promise.all(
      Array.from(profileAccumulator.values()).map(async (accumulatorEntry) => {
        const fullProfileEntity = await fetchFullProfileEntity(accumulatorEntry.profileId, isPathAllowed);
        profilesProcessed += 1;
        counters.phase2ProfilesFetched = (counters.phase2ProfilesFetched ?? 0) + 1;
        if (profilesProcessed % 50 === 0) {
          console.log(`  ...${profilesProcessed}/${profileAccumulator.size} profile pages fetched.`);
        }

        if (!fullProfileEntity) {
          counters.phase2FetchFailed = (counters.phase2FetchFailed ?? 0) + 1;
          return;
        }
        if (fullProfileEntity.type !== PROFILE_TYPE_STUDIO) {
          counters.rejectedNonStudio = (counters.rejectedNonStudio ?? 0) + 1;
          return;
        }

        const displayName = normalizeWhitespace(fullProfileEntity.company) ?? accumulatorEntry.profileId;
        warnIfAwardsSummaryMismatched(displayName, accumulatorEntry.accolades.length, fullProfileEntity);

        counters.studioCount = (counters.studioCount ?? 0) + 1;
        candidateRecords.push(buildAgencyRecord(accumulatorEntry, fullProfileEntity, usedSlugs, scrapedAt));
      }),
    );

    console.log("Ranking and deduping…");
    const rankedRecords = rankCandidates(candidateRecords);
    const dedupedRecords = dedupeByDomainAndCity(rankedRecords, counters);
    const finalRecords =
      cliOptions.limit === null ? dedupedRecords : dedupedRecords.slice(0, cliOptions.limit);

    if (cliOptions.dryRun) {
      console.log(`\n--dry-run: not writing ${OUTPUT_FILE_PATH}.`);
    } else {
      await writeFile(OUTPUT_FILE_PATH, `${JSON.stringify(finalRecords, null, 2)}\n`, "utf8");
      console.log(`\nWrote ${finalRecords.length} studios to ${OUTPUT_FILE_PATH}`);
    }

    printRunSummary(counters, finalRecords.length);
    printAccoladeAndIndexabilityReport(finalRecords);

    console.log("\nTop 10 by accolade count:");
    for (const record of finalRecords.slice(0, 10)) {
      console.log(`  ${record.accolades.length}\t${record.name}`);
    }
    const nullLogoCount = finalRecords.filter((record) => !record.logoUrl).length;
    const nullWebsiteCount = finalRecords.filter((record) => !record.website).length;
    console.log(`\nRecords with a null logoUrl: ${nullLogoCount}/${finalRecords.length}`);
    console.log(`Records with a null website: ${nullWebsiteCount}/${finalRecords.length}`);
  } catch (error) {
    console.error(`Import failed: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

main();
