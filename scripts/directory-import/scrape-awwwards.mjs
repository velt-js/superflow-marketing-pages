#!/usr/bin/env node
/**
 * Scrapes agency/studio profiles from the Awwwards directory
 * (https://www.awwwards.com/directory/) and writes them to
 * lib/directory/data/agencies.json, conforming to the `Agency` interface in
 * lib/directory/types.ts.
 *
 * Two-step crawl per agency:
 *   1. Paginated directory listing pages (`/directory/`, `/directory/?page=2`, …)
 *      give us: name, profile URL, logo, country, website, award counts.
 *   2. Each agency's own profile page (`/<slug>/`) gives us: city, description.
 *
 * Politeness (non-negotiable — see scripts/directory-import/README.md):
 *   - robots.txt is fetched and parsed at runtime; disallowed paths are skipped.
 *   - Max 2 concurrent requests, minimum 1000ms between request starts.
 *   - Exponential backoff on 429/5xx, up to 3 retries, then the URL is
 *     recorded as a failure and the run continues.
 *   - An on-disk HTML cache avoids re-hitting the site on re-runs.
 *   - A hard total-request cap protects against runaway crawls.
 *
 * Usage:
 *   node scripts/directory-import/scrape-awwwards.mjs [--limit N]
 *
 * See scripts/directory-import/README.md for full flag/cache documentation.
 */

import { JSDOM } from "jsdom";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------- Paths ----------

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIRECTORY = path.join(SCRIPT_DIRECTORY, ".cache");
const OUTPUT_FILE_PATH = path.join(
  SCRIPT_DIRECTORY,
  "..",
  "..",
  "lib",
  "directory",
  "data",
  "agencies.json",
);

// ---------- Site / network constants ----------

const AWWWARDS_ORIGIN = "https://www.awwwards.com";
const DIRECTORY_PATH = "/directory/";
const ROBOTS_URL = `${AWWWARDS_ORIGIN}/robots.txt`;

/** Identifies this crawler honestly, with a contact URL, per the brief. */
const USER_AGENT = "SuperflowDirectoryBot/1.0 (+https://usesuperflow.ai; mihir@velt.dev)";

/** robots.txt group-matching token for this bot (lowercased, no version). */
const ROBOTS_PRODUCT_TOKEN = "superflowdirectorybot";

const DEFAULT_LIMIT = 60;
const MAX_CONCURRENCY = 2;
const MIN_REQUEST_DELAY_MS = 1000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

/** Absolute ceiling on real HTTP requests for one run (cache hits are free). */
const HARD_REQUEST_CAP = 300;

// ---------- Data-contract constants (mirrors lib/directory/constants.ts;
// this script is plain .mjs with no TS build step, so the value is
// duplicated here on purpose rather than imported — see that file's header
// comment). ----------

const AGENCY_SOURCE = "awwwards";
const CATEGORY_WEB_DESIGN = "web-design";

// ---------- Repeated selector / label strings ----------

const SELECTOR_CARD = ".card-directory";
const SELECTOR_CARD_PROFILE_LINK = ".card-directory__cover a[href], .avatar-name__link[href]";
const SELECTOR_CARD_NAME = ".avatar-name__name strong";
const SELECTOR_CARD_LOGO = ".avatar-name__img[src], .card-directory__media[src]";
const SELECTOR_CARD_SECTIONS = ".card-directory__list > li";
const SELECTOR_CARD_SECTION_LABEL = ".card-directory__section";
const SELECTOR_CARD_SECTION_VALUE = "div:not(.card-directory__section)";
const SELECTOR_CARD_AWARD_BOX = ".box-score";
const SELECTOR_CARD_AWARD_LABEL = ".box-score__top";
const SELECTOR_CARD_AWARD_COUNT = ".box-score__bottom";

const SELECTOR_PROFILE_TITLE = ".head-user-pro__title";
const SELECTOR_PROFILE_SUBTITLE = ".head-user-pro__subtitle";
const SELECTOR_PROFILE_DESCRIPTION = ".heading-6";

const CARD_SECTION_LOCATION = "Location";
const CARD_SECTION_WEBSITE = "Website";
const CARD_SECTION_AWARDS = "Awards";

const AWARD_LABEL_HONORABLE_MENTIONS = "HM";
const AWARD_LABEL_SITE_OF_THE_DAY = "SOTD";
const AWARD_LABEL_SITE_OF_THE_MONTH = "SOTM";
const AWARD_LABEL_SITE_OF_THE_YEAR = "SOTY";

const LOCATION_SEPARATOR = " - ";

// ---------- Best-effort country name -> ISO 3166-1 alpha-2 map ----------
// Covers every country used as a facet in the Awwwards directory at the time
// of writing (confirmed by enumerating /directory/<Country>/ links). Not a
// general-purpose gazetteer — country names outside this set resolve to
// `null` rather than a guess.

const COUNTRY_CODE_BY_NAME = {
  Algeria: "DZ",
  Argentina: "AR",
  Armenia: "AM",
  Australia: "AU",
  Austria: "AT",
  Bangladesh: "BD",
  Belgium: "BE",
  Bolivia: "BO",
  Brazil: "BR",
  Bulgaria: "BG",
  Cameroon: "CM",
  Canada: "CA",
  "Cayman Islands": "KY",
  Chile: "CL",
  China: "CN",
  Colombia: "CO",
  Congo: "CG",
  Croatia: "HR",
  Cyprus: "CY",
  "Czech Republic": "CZ",
  Denmark: "DK",
  Egypt: "EG",
  Estonia: "EE",
  Finland: "FI",
  France: "FR",
  Georgia: "GE",
  Germany: "DE",
  Greece: "GR",
  "Hong Kong": "HK",
  Macau: "MO",
  Iceland: "IS",
  India: "IN",
  Indonesia: "ID",
  Ireland: "IE",
  "Isle of Man": "IM",
  Israel: "IL",
  Italy: "IT",
  Japan: "JP",
  Kazakhstan: "KZ",
  Kenya: "KE",
  Kosovo: "XK",
  Latvia: "LV",
  Lebanon: "LB",
  Lithuania: "LT",
  Luxembourg: "LU",
  Malaysia: "MY",
  Malta: "MT",
  Mexico: "MX",
  Mongolia: "MN",
  Montenegro: "ME",
  Nepal: "NP",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Nigeria: "NG",
  Norway: "NO",
  Pakistan: "PK",
  Peru: "PE",
  Poland: "PL",
  Portugal: "PT",
  Qatar: "QA",
  "Réunion": "RE",
  Romania: "RO",
  Russia: "RU",
  "Saudi Arabia": "SA",
  Serbia: "RS",
  Singapore: "SG",
  Slovakia: "SK",
  Slovenia: "SI",
  "South Africa": "ZA",
  "South Korea": "KR",
  Spain: "ES",
  "Sri Lanka": "LK",
  Sweden: "SE",
  Switzerland: "CH",
  Thailand: "TH",
  Togo: "TG",
  Turkey: "TR",
  Ukraine: "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  Uruguay: "UY",
  Venezuela: "VE",
  Vietnam: "VN",
};

// ---------- Best-effort public-suffix list (2-label ccTLD suffixes only)
// ----------
// This is NOT a full public suffix list (no dependency was added, per the
// brief). It only covers common two-label ccTLD suffixes so eTLD+1
// extraction doesn't collapse e.g. "resn.co.nz" down to "co.nz". Domains
// under suffixes not in this set fall back to a naive last-two-labels split,
// which is correct for the overwhelming majority of gTLD domains (.com,
// .studio, .agency, .design, etc.).
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

/**
 * Collapses all whitespace runs (including newlines from source HTML
 * formatting) into single spaces and trims the result.
 * @param {string | null | undefined} text Raw text, typically from
 *   `element.textContent`.
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
 * Normalises a raw href from a "Website" link into an absolute https URL.
 * @param {string | null | undefined} rawHref Href as scraped from the page.
 * @returns {string | null} Absolute https URL, or null if unparseable/absent.
 */
function normalizeWebsiteUrl(rawHref) {
  try {
    if (!rawHref) return null;
    const trimmedHref = rawHref.trim();
    if (!trimmedHref) return null;
    const hrefWithProtocol = /^https?:\/\//i.test(trimmedHref)
      ? trimmedHref
      : `https://${trimmedHref}`;
    const parsedUrl = new URL(hrefWithProtocol);
    parsedUrl.protocol = "https:";
    return parsedUrl.toString();
  } catch (error) {
    console.warn(`normalizeWebsiteUrl() could not parse "${rawHref}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Derives the registrable domain (eTLD+1), lowercased, `www.` stripped, from
 * a hostname. See KNOWN_TWO_LABEL_SUFFIXES for the accuracy caveat.
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
 * label (the part before the TLD), e.g. "monks.com" -> "monks".
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
 * Looks up an ISO 3166-1 alpha-2 code for a country name as it appears on
 * Awwwards profile/listing pages. Returns null rather than guessing when the
 * name isn't in COUNTRY_CODE_BY_NAME.
 * @param {string | null} countryName Country name, e.g. "France".
 * @returns {string | null} Two-letter country code, or null.
 */
function lookupCountryCode(countryName) {
  try {
    if (!countryName) return null;
    return COUNTRY_CODE_BY_NAME[countryName] ?? null;
  } catch (error) {
    console.warn(`lookupCountryCode() failed for "${countryName}": ${error?.message ?? error}`);
    return null;
  }
}

// ---------- robots.txt handling ----------

/**
 * Parses robots.txt text into user-agent groups, each with its ordered
 * list of Allow/Disallow rules. Implements the standard grouping rule:
 * consecutive `User-agent:` lines share one group of rules.
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
 * product token if one exists, else the wildcard `*` group, else null.
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

let totalRequestCount = 0;
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
        headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      });
      if (response.status === 429 || response.status >= 500) {
        throw new RetryableHttpError(response.status);
      }
      if (!response.ok) {
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
    return path.join(CACHE_DIRECTORY, `${hash}.html`);
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
 * Fetches a URL's HTML, transparently using the on-disk cache and the
 * throttled/retrying network fetch. Enforces HARD_REQUEST_CAP before making
 * a real network request (cache hits never count against the cap).
 * @param {string} url Absolute URL to fetch.
 * @returns {Promise<string>} Response body text.
 */
async function fetchUrl(url) {
  try {
    const cachedBody = await readFromCache(url);
    if (cachedBody !== null) return cachedBody;
    if (totalRequestCount >= HARD_REQUEST_CAP) {
      throw new Error(`Hard request cap of ${HARD_REQUEST_CAP} reached; refusing to fetch ${url}`);
    }
    const body = await enqueueThrottled(() => fetchWithRetry(url));
    await writeToCache(url, body);
    return body;
  } catch (error) {
    throw error;
  }
}

// ---------- Directory listing parsing ----------

/**
 * Builds an all-zero AgencyAwards object.
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
 * Assigns one parsed award count onto an awards tally by its box label.
 * Unrecognised labels (the directory has never shown any beyond the four
 * below) are ignored rather than guessed at.
 * @param {ReturnType<typeof createEmptyAwards>} awards Tally to mutate.
 * @param {string} labelText Box label, e.g. "SOTD".
 * @param {number} count Parsed count for that label.
 * @returns {void}
 */
function assignAwardCount(awards, labelText, count) {
  try {
    switch (labelText) {
      case AWARD_LABEL_HONORABLE_MENTIONS:
        awards.honorableMentions = count;
        break;
      case AWARD_LABEL_SITE_OF_THE_DAY:
        awards.siteOfTheDay = count;
        break;
      case AWARD_LABEL_SITE_OF_THE_MONTH:
        awards.siteOfTheMonth = count;
        break;
      case AWARD_LABEL_SITE_OF_THE_YEAR:
        awards.siteOfTheYear = count;
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn(`assignAwardCount() failed for label "${labelText}": ${error?.message ?? error}`);
  }
}

/**
 * Parses the "Awards" `<li>` of a directory card into an AgencyAwards tally.
 * @param {Element} awardsListItem The `<li>` containing `.box-score` boxes.
 * @returns {ReturnType<typeof createEmptyAwards>} Parsed awards tally.
 */
function parseAwardsFromCard(awardsListItem) {
  try {
    const awards = createEmptyAwards();
    const boxElements = Array.from(awardsListItem.querySelectorAll(SELECTOR_CARD_AWARD_BOX));
    for (const boxElement of boxElements) {
      const labelText = boxElement.querySelector(SELECTOR_CARD_AWARD_LABEL)?.textContent?.trim();
      const countText = boxElement.querySelector(SELECTOR_CARD_AWARD_COUNT)?.textContent?.trim();
      const count = Number.parseInt(countText ?? "", 10);
      if (!labelText || Number.isNaN(count)) continue;
      assignAwardCount(awards, labelText, count);
    }
    awards.total =
      awards.siteOfTheDay +
      awards.siteOfTheMonth +
      awards.siteOfTheYear +
      awards.developerAward +
      awards.honorableMentions +
      awards.nominees;
    return awards;
  } catch (error) {
    console.warn(`parseAwardsFromCard() failed: ${error?.message ?? error}`);
    return createEmptyAwards();
  }
}

/**
 * Parses one `.card-directory` element from a listing page.
 * @param {Element} cardElement The card element.
 * @param {string} pageUrl URL the card was found on (for warnings).
 * @returns {{name: string, profileUrl: string, logoUrl: string | null, countryText: string | null, websiteHref: string | null, awards: ReturnType<typeof createEmptyAwards>} | null}
 *   Parsed listing-level record, or null if the card had no usable profile link/name.
 */
function parseDirectoryCard(cardElement, pageUrl) {
  try {
    const profileHref = cardElement.querySelector(SELECTOR_CARD_PROFILE_LINK)?.getAttribute("href") ?? null;
    if (!profileHref) return null;
    const profileUrl = new URL(profileHref, AWWWARDS_ORIGIN).toString();

    const name = normalizeWhitespace(cardElement.querySelector(SELECTOR_CARD_NAME)?.textContent ?? null);
    if (!name) return null;

    const logoUrl = cardElement.querySelector(SELECTOR_CARD_LOGO)?.getAttribute("src")?.trim() || null;

    let countryText = null;
    let websiteHref = null;
    let awards = createEmptyAwards();

    const sectionElements = Array.from(cardElement.querySelectorAll(SELECTOR_CARD_SECTIONS));
    for (const sectionElement of sectionElements) {
      const labelText = sectionElement.querySelector(SELECTOR_CARD_SECTION_LABEL)?.textContent?.trim();
      if (labelText === CARD_SECTION_LOCATION) {
        const valueText = sectionElement.querySelector(SELECTOR_CARD_SECTION_VALUE)?.textContent ?? null;
        countryText = normalizeWhitespace(valueText);
      } else if (labelText === CARD_SECTION_WEBSITE) {
        websiteHref = sectionElement.querySelector("a[href]")?.getAttribute("href") ?? null;
      } else if (labelText === CARD_SECTION_AWARDS) {
        awards = parseAwardsFromCard(sectionElement);
      }
    }

    return { name, profileUrl, logoUrl, countryText, websiteHref, awards };
  } catch (error) {
    console.warn(`parseDirectoryCard() failed on ${pageUrl}: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Parses every agency card on one directory listing page.
 * @param {string} html Page HTML.
 * @param {string} pageUrl URL the HTML was fetched from (for warnings).
 * @returns {Array<ReturnType<typeof parseDirectoryCard>>} Parsed cards (nulls filtered out).
 */
function parseDirectoryListingPage(html, pageUrl) {
  try {
    const dom = new JSDOM(html);
    const cardElements = Array.from(dom.window.document.querySelectorAll(SELECTOR_CARD));
    const records = [];
    for (const cardElement of cardElements) {
      const record = parseDirectoryCard(cardElement, pageUrl);
      if (record) records.push(record);
    }
    return records;
  } catch (error) {
    console.warn(`parseDirectoryListingPage() failed for ${pageUrl}: ${error?.message ?? error}`);
    return [];
  }
}

// ---------- Profile page parsing ----------

/**
 * Splits a profile subtitle like "France - Paris" or "Ukraine" into a
 * country/city AgencyLocation.
 * @param {string | null} subtitleText Text of `.head-user-pro__subtitle`.
 * @returns {{country: string, countryCode: string | null, city: string | null} | null}
 *   Parsed location, or null if no country could be read.
 */
function parseLocationSubtitle(subtitleText) {
  try {
    if (!subtitleText) return null;
    const parts = subtitleText
      .split(LOCATION_SEPARATOR)
      .map((part) => part.trim())
      .filter(Boolean);
    const countryName = parts[0] ?? null;
    if (!countryName) return null;
    const cityName = parts.length > 1 ? parts.slice(1).join(LOCATION_SEPARATOR) : null;
    return {
      country: countryName,
      countryCode: lookupCountryCode(countryName),
      city: cityName,
    };
  } catch (error) {
    console.warn(`parseLocationSubtitle() failed for "${subtitleText}": ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Parses an agency's own profile page for the fields the listing page
 * doesn't carry: a cleaner display name, city, and description.
 * @param {string} html Profile page HTML.
 * @param {string} profileUrl URL the HTML was fetched from (for warnings).
 * @returns {{titleText: string | null, descriptionText: string | null, location: ReturnType<typeof parseLocationSubtitle>}}
 *   Parsed profile fields.
 */
function parseProfilePage(html, profileUrl) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const titleText = normalizeWhitespace(document.querySelector(SELECTOR_PROFILE_TITLE)?.textContent ?? null);
    const subtitleText = normalizeWhitespace(
      document.querySelector(SELECTOR_PROFILE_SUBTITLE)?.textContent ?? null,
    );
    const descriptionText = normalizeWhitespace(
      document.querySelector(SELECTOR_PROFILE_DESCRIPTION)?.textContent ?? null,
    );
    return { titleText, descriptionText, location: parseLocationSubtitle(subtitleText) };
  } catch (error) {
    console.warn(`parseProfilePage() failed for ${profileUrl}: ${error?.message ?? error}`);
    return { titleText: null, descriptionText: null, location: null };
  }
}

// ---------- Orchestration ----------

/**
 * Crawls directory listing pages (starting at `/directory/`) until either
 * `limit` unique-by-domain agencies have been collected or a page comes back
 * with no cards. Dedupes on registrable domain as it goes so profile-page
 * fetches are never wasted on a duplicate.
 * @param {number} limit Maximum number of agencies to collect.
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @returns {Promise<Array<ReturnType<typeof parseDirectoryCard> & {websiteUrl: string | null, domain: string | null}>>}
 *   Listing-level records, deduped and capped at `limit`.
 */
async function scrapeDirectoryListings(limit, isPathAllowed) {
  try {
    const collectedByDomain = new Map();
    const collectedWithoutDomain = [];
    let pageNumber = 1;

    while (collectedByDomain.size + collectedWithoutDomain.length < limit) {
      const pagePath = pageNumber === 1 ? DIRECTORY_PATH : `${DIRECTORY_PATH}?page=${pageNumber}`;
      const pageUrl = `${AWWWARDS_ORIGIN}${pagePath}`;

      if (!isUrlAllowed(pageUrl, isPathAllowed)) {
        console.warn(`robots.txt disallows ${pagePath}; stopping directory pagination.`);
        break;
      }

      let html;
      try {
        html = await fetchUrl(pageUrl);
      } catch (error) {
        console.warn(`Giving up on directory page ${pageUrl}: ${error?.message ?? error}`);
        failures.push({ url: pageUrl, reason: error?.message ?? String(error) });
        break;
      }

      const cardRecords = parseDirectoryListingPage(html, pageUrl);
      if (cardRecords.length === 0) {
        console.log(`No agencies found at ${pageUrl}; treating this as the end of the directory.`);
        break;
      }

      for (const cardRecord of cardRecords) {
        const websiteUrl = normalizeWebsiteUrl(cardRecord.websiteHref);
        const domain = websiteUrl ? getRegistrableDomain(new URL(websiteUrl).hostname) : null;
        const enrichedRecord = { ...cardRecord, websiteUrl, domain };
        if (domain) {
          if (!collectedByDomain.has(domain)) collectedByDomain.set(domain, enrichedRecord);
        } else {
          collectedWithoutDomain.push(enrichedRecord);
        }
        if (collectedByDomain.size + collectedWithoutDomain.length >= limit) break;
      }

      console.log(
        `Directory page ${pageNumber}: ${cardRecords.length} cards, ` +
          `${collectedByDomain.size + collectedWithoutDomain.length} unique agencies so far.`,
      );
      pageNumber += 1;
    }

    return [...collectedByDomain.values(), ...collectedWithoutDomain].slice(0, limit);
  } catch (error) {
    console.warn(`scrapeDirectoryListings() failed: ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Fetches one agency's profile page and merges in the fields it adds (city,
 * description, a cleaner name). Falls back to listing-only data on any
 * failure, recording the failure rather than dropping the agency.
 * @param {Awaited<ReturnType<typeof scrapeDirectoryListings>>[number]} record Listing-level record.
 * @param {(requestPath: string) => boolean} isPathAllowed robots.txt predicate.
 * @returns {Promise<typeof record & {profileName: string | null, profileDescription: string | null, profileLocation: ReturnType<typeof parseLocationSubtitle>}>}
 *   Record enriched with profile-page fields.
 */
async function enrichRecordWithProfile(record, isPathAllowed) {
  try {
    if (!isUrlAllowed(record.profileUrl, isPathAllowed)) {
      console.warn(`robots.txt disallows ${record.profileUrl}; using listing data only for "${record.name}".`);
      return { ...record, profileName: null, profileDescription: null, profileLocation: null };
    }
    const html = await fetchUrl(record.profileUrl);
    const parsed = parseProfilePage(html, record.profileUrl);
    return {
      ...record,
      profileName: parsed.titleText,
      profileDescription: parsed.descriptionText,
      profileLocation: parsed.location,
    };
  } catch (error) {
    console.warn(`Profile fetch failed for ${record.profileUrl}: ${error?.message ?? error}`);
    failures.push({ url: record.profileUrl, reason: error?.message ?? String(error) });
    return { ...record, profileName: null, profileDescription: null, profileLocation: null };
  }
}

/**
 * Builds a final Agency record (matching lib/directory/types.ts exactly)
 * from an enriched listing+profile record.
 * @param {Awaited<ReturnType<typeof enrichRecordWithProfile>>} record Enriched record.
 * @param {Set<string>} usedSlugs Slugs already assigned in this run.
 * @param {string} scrapedAt ISO-8601 timestamp shared by the whole run.
 * @returns {object} Agency record ready for JSON output.
 */
function buildAgencyRecord(record, usedSlugs, scrapedAt) {
  try {
    const name = record.profileName ?? record.name;
    const location =
      record.profileLocation ??
      (record.countryText
        ? { country: record.countryText, countryCode: lookupCountryCode(record.countryText), city: null }
        : null);
    const slugBase = slugBaseFromDomain(record.domain) ?? slugify(name) ?? "agency";
    const slug = makeUniqueSlug(slugBase, usedSlugs);

    return {
      slug,
      name,
      website: record.websiteUrl,
      domain: record.domain,
      profileUrl: record.profileUrl,
      location,
      categories: [CATEGORY_WEB_DESIGN],
      services: [],
      teamSize: null,
      logoUrl: record.logoUrl,
      description: record.profileDescription,
      awards: record.awards,
      source: AGENCY_SOURCE,
      scrapedAt,
    };
  } catch (error) {
    console.warn(`buildAgencyRecord() failed for "${record?.name}": ${error?.message ?? error}`);
    throw error;
  }
}

/**
 * Parses `--limit N` / `--limit=N` from CLI args.
 * @param {string[]} argv Arguments after the script path (`process.argv.slice(2)`).
 * @returns {{limit: number}} Parsed options.
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
 * Entry point: crawls the directory, writes lib/directory/data/agencies.json,
 * and prints a run summary including any failed URLs.
 * @returns {Promise<void>} Resolves once the run completes (or fails).
 */
async function main() {
  try {
    const cliOptions = parseCliArgs(process.argv.slice(2));
    await mkdir(CACHE_DIRECTORY, { recursive: true });

    console.log("Loading robots.txt…");
    const isPathAllowed = await loadRobotsRules();

    console.log(`Fetching Awwwards directory listings (limit ${cliOptions.limit})…`);
    const listingRecords = await scrapeDirectoryListings(cliOptions.limit, isPathAllowed);
    console.log(`Collected ${listingRecords.length} unique agencies from the directory listing.`);

    console.log("Fetching individual profile pages…");
    const enrichedRecords = await Promise.all(
      listingRecords.map((record) => enrichRecordWithProfile(record, isPathAllowed)),
    );

    const scrapedAt = new Date().toISOString();
    const usedSlugs = new Set();
    const agencies = enrichedRecords.map((record) => buildAgencyRecord(record, usedSlugs, scrapedAt));

    await writeFile(OUTPUT_FILE_PATH, `${JSON.stringify(agencies, null, 2)}\n`, "utf8");
    console.log(`Wrote ${agencies.length} agencies to ${OUTPUT_FILE_PATH}`);
    console.log(`Total HTTP requests made this run: ${totalRequestCount} (cache hits don't count).`);

    if (failures.length > 0) {
      console.warn(`${failures.length} URL(s) failed after ${MAX_RETRIES} retries:`);
      for (const failure of failures) {
        console.warn(`  - ${failure.url}: ${failure.reason}`);
      }
    }
  } catch (error) {
    console.error(`Scrape failed: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

main();
