#!/usr/bin/env node
// Loader for the browser-sourced branding dataset.
//
// Unlike its two siblings in this directory, this script is NOT a scraper -
// it makes no network requests at all. The branding category is sourced by
// hand, through a browser session driving Clutch, DesignRush and D&AD (the
// budget-bearing directories all sit behind bot walls that the honest-UA
// fetch in scrape-awwwards.mjs / import-semrush.mjs cannot clear). That
// session emits JSON batches; this script is the gate between those batches
// and lib/directory/data/branding-agencies.json.
//
// Its whole job is to be unforgiving about a dataset no crawler verified.
// The governing rule, applied throughout:
//
//     NORMALISE REPRESENTATION, NEVER REPAIR A CLAIM.
//
// Casing, URL form, whitespace, a derivable slug, a re-summed award total -
// those are shapes of the same fact and get fixed silently. A budget, a
// rating, a `notable` flag, an award tally - those are assertions about the
// world, and a wrong one is repaired only by going back to the source. When
// an assertion is missing or malformed, the record is REJECTED, never
// patched to something plausible.
//
// Writes records conforming exactly to the `Agency` interface in
// lib/directory/types.ts. Constants mirrored from lib/directory/constants.ts
// (see the block below) rather than imported, for the same reason the other
// two scripts mirror theirs: there is no TypeScript build step here and each
// script is deliberately standalone.
//
// Usage:
//   node scripts/directory-import/load-branding-json.mjs
//   node scripts/directory-import/load-branding-json.mjs --input path/to/batch.json
//   node scripts/directory-import/load-branding-json.mjs --dry-run
//   node scripts/directory-import/load-branding-json.mjs --strict

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- Paths ----------

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "..", "..");

/** Where the browser session drops its JSON batches. Gitignored: these are
 *  raw, unvalidated intermediates, and the validated output file is the
 *  artefact worth committing. */
const DEFAULT_INPUT_DIRECTORY = join(SCRIPT_DIRECTORY, "inbox", "branding");

/** The dataset this script owns. A THIRD file alongside agencies.json and
 *  seo-agencies.json, never an append into either - each source's writer
 *  overwrites its own file wholesale, so a shared file would mean one
 *  importer's run silently deletes another's records. See
 *  `mergeAgencySources` in lib/directory/agencies.ts. */
const DEFAULT_OUTPUT_PATH = join(REPOSITORY_ROOT, "lib", "directory", "data", "branding-agencies.json");

// ---------- Mirrored constants (keep in sync with lib/directory/*) ----------

/** Mirrors CATEGORY_BRANDING in lib/directory/constants.ts. Every record
 *  must claim this category or it does not belong in this file. */
const CATEGORY_BRANDING = "branding";

/** Mirrors BRANDING_MIN_BUDGET_FLOOR_USD in lib/directory/constants.ts.
 *  See `decideAdmission` for how it is applied - it is one of two routes
 *  into the category, not the only one. */
const BRANDING_MIN_BUDGET_FLOOR_USD = 10000;

/** Mirrors the `AgencySource` union in lib/directory/types.ts, narrowed to
 *  the sources this loader accepts. A record naming anything else is
 *  rejected rather than coerced: an unknown source has no attribution
 *  label, and a directory entry that cannot say where it came from is
 *  worse than a missing entry. */
const ALLOWED_SOURCES = new Set(["clutch", "designrush", "dandad"]);

/**
 * Which source wins when the same agency (same registrable domain) appears
 * in more than one batch. Lower number wins.
 *
 * Clutch first because it is the only source of the three that publishes a
 * minimum project size, and that number is the category's admission gate -
 * losing it to a D&AD record that has no budget field would drop the
 * agency's floor to null. D&AD last because its records are award
 * provenance and little else; its value survives the merge anyway, since
 * `accolades` is unioned across duplicates (see `mergeDuplicateRecords`).
 */
const SOURCE_PRIORITY = { clutch: 0, designrush: 1, dandad: 2 };

/** Fallback priority for a source absent from SOURCE_PRIORITY. Sorts last.
 *  Unreachable while ALLOWED_SOURCES and SOURCE_PRIORITY agree, but keeps
 *  the comparator total rather than returning NaN if they ever drift. */
const UNKNOWN_SOURCE_PRIORITY = 99;

/** Shape every record's `awards` must have. These sources publish no
 *  Awwwards-scheme tallies, so this field is uniformly zero - award wins
 *  live in `accolades` instead. See `validateAwards` for why a non-zero
 *  tally here is a rejection rather than something to normalise. */
const ZEROED_AWARDS = Object.freeze({
  siteOfTheDay: 0,
  siteOfTheMonth: 0,
  siteOfTheYear: 0,
  developerAward: 0,
  honorableMentions: 0,
  nominees: 0,
  total: 0,
});

/** Award-tally keys excluding `total`, which is derived from them. */
const AWARD_COUNT_KEYS = [
  "siteOfTheDay",
  "siteOfTheMonth",
  "siteOfTheYear",
  "developerAward",
  "honorableMentions",
  "nominees",
];

/**
 * Agencies excluded from the directory on editorial grounds, keyed by
 * registrable domain, with the reason as the value.
 *
 * An EXPLICIT exclusion list rather than "just delete the record from the
 * batch file", for the same reason `client-names.json` records a rejected
 * client as an explicit `null` instead of a missing key: the batches live
 * in a gitignored inbox and get regenerated by a fresh browser session, so
 * a deleted record simply comes back next time with no trace of why it was
 * removed. An entry here is permanent and self-documenting.
 *
 * This list is for agencies that are real and correctly reported but should
 * not be listed. It is NOT a place to suppress records that fail
 * validation - those are rejected on their own merits and fixing them means
 * fixing the data.
 */
const EDITORIALLY_EXCLUDED_DOMAINS = new Map([
  [
    "superunion.com",
    "Defunct - WPP merged Superunion into Design Bridge and Partners, which is " +
      "listed separately under its own name and award record. superunion.com now " +
      "404s through a broken redirect to designbridge.com, so the record would " +
      "give the directory a dead outbound link for an agency nobody can hire.",
  ],
]);

/** Ceiling on `clients` per record, matching MAX_CLIENTS_PER_AGENCY in
 *  scrape-awwwards.mjs so the two datasets render the same density. */
const MAX_CLIENTS_PER_AGENCY = 12;

/** Bounds on `foundedYear`. The lower bound is generous on purpose - a few
 *  European design houses genuinely predate 1900 - and the upper bound is
 *  computed per run so it never goes stale. */
const MIN_PLAUSIBLE_FOUNDED_YEAR = 1800;

/** Rating scale every accepted source publishes on. A record claiming a
 *  different scale is kept as-is (the field exists precisely so a 10-point
 *  source does not silently render as a near-perfect 5), but is warned
 *  about, since none of these three sources should produce one. */
const EXPECTED_RATING_SCALE = 5;

/** Prefix for the derived `budgetLabel`, mirroring `buildBudgetLabel` in
 *  import-semrush.mjs so both datasets phrase a floor identically. */
const BUDGET_LABEL_PREFIX = "Starting from ";

/** Trailing share-of-business percentage Clutch appends to each service and
 *  industry label - "Branding 85%", "Business services 10%". Matched
 *  anchored to the end so a service legitimately containing a number keeps
 *  it. See `stripFocusPercentages`. */
const FOCUS_PERCENTAGE_PATTERN = /\s+\d{1,3}\s*%$/;

/** Query-param prefix stripped from `website`. Duplicated from
 *  import-semrush.mjs. */
const UTM_PARAM_PREFIX = "utm_";

/** How many affected agencies to name before a repeated warning is summarised
 *  as a count. See `reportRun`. */
const WARNING_GROUP_EXAMPLE_LIMIT = 3;

/** Fallback slug base when neither domain nor name yields anything usable.
 *  Duplicated from scrape-awwwards.mjs. */
const FALLBACK_SLUG_BASE = "agency";

// ---------- Best-effort public-suffix list (2-label ccTLD suffixes only) ----------
// Duplicated verbatim from scrape-awwwards.mjs / import-semrush.mjs - see
// those scripts for the accuracy caveat (not a full public suffix list, no
// dependency added for this).
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
 * Lowercases, strips diacritics and reduces text to a URL-safe slug.
 * Duplicated verbatim from scrape-awwwards.mjs / import-semrush.mjs.
 *
 * @param {string | null | undefined} text Arbitrary text.
 * @returns {string} Slug, or "" when nothing usable remained.
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
 * Duplicated verbatim from scrape-awwwards.mjs / import-semrush.mjs.
 *
 * @param {string} baseSlug Preferred slug before uniqueness is enforced.
 * @param {Set<string>} usedSlugs Slugs already reserved; mutated in place.
 * @returns {string} A slug guaranteed not to already be in `usedSlugs`.
 */
function makeUniqueSlug(baseSlug, usedSlugs) {
  try {
    const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : FALLBACK_SLUG_BASE;
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
    return `${FALLBACK_SLUG_BASE}-${usedSlugs?.size ?? 0}`;
  }
}

/**
 * Removes utm_* tracking params from a parsed URL, in place.
 * Duplicated verbatim from import-semrush.mjs.
 *
 * @param {URL} parsedUrl URL to clean; mutated in place.
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
 * Normalises a raw website URL into an absolute https URL with tracking
 * params removed. Based on the function of the same name in
 * import-semrush.mjs.
 *
 * @param {string | null | undefined} rawHref Raw URL, with or without scheme.
 * @returns {string | null} Absolute https URL, or null if unparseable.
 */
function normalizeWebsiteUrl(rawHref) {
  try {
    if (!rawHref) return null;
    const trimmedHref = rawHref.toString().trim();
    if (!trimmedHref) return null;
    const hrefWithProtocol = /^https?:\/\//i.test(trimmedHref)
      ? trimmedHref
      : `https://${trimmedHref}`;
    const parsedUrl = new URL(hrefWithProtocol);
    parsedUrl.protocol = "https:";
    stripUtmParams(parsedUrl);
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Derives the registrable domain (eTLD+1), lowercased, `www.` stripped,
 * from a hostname. Duplicated verbatim from scrape-awwwards.mjs /
 * import-semrush.mjs - see KNOWN_TWO_LABEL_SUFFIXES for the caveat.
 *
 * @param {string | null | undefined} hostname Hostname, e.g. from `new URL().hostname`.
 * @returns {string | null} Registrable domain, or null if not derivable.
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
 * Extracts a registrable domain from anything URL-shaped - a bare hostname,
 * a full URL, or a URL missing its scheme.
 *
 * @param {string | null | undefined} rawValue Hostname or URL.
 * @returns {string | null} Registrable domain, or null.
 */
function domainFromUrlLike(rawValue) {
  try {
    if (!rawValue) return null;
    const trimmedValue = rawValue.toString().trim();
    if (!trimmedValue) return null;
    const withProtocol = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
    return getRegistrableDomain(new URL(withProtocol).hostname);
  } catch {
    return null;
  }
}

/**
 * Derives a slug base from a registrable domain's brand label, e.g.
 * "pentagram.com" -> "pentagram". Duplicated from the sibling scripts.
 *
 * @param {string | null} domain Registrable domain, or null.
 * @returns {string | null} Slug base, or null if not derivable.
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
 * Collapses whitespace and strips any stray HTML tags from a text field.
 * Representational only - it never changes which words are present.
 *
 * @param {string | null | undefined} rawText Text that may carry markup.
 * @returns {string | null} Plain text, or null when nothing usable remained.
 */
function toPlainText(rawText) {
  try {
    if (typeof rawText !== "string") return null;
    const stripped = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return stripped.length > 0 ? stripped : null;
  } catch (error) {
    console.warn(`toPlainText() failed: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Formats a whole-dollar floor as the display label the directory renders,
 * mirroring `buildBudgetLabel` in import-semrush.mjs.
 *
 * @param {number} floorUsd Whole US dollars.
 * @returns {string} e.g. "Starting from $10,000".
 */
function buildBudgetLabel(floorUsd) {
  try {
    return `${BUDGET_LABEL_PREFIX}$${Number(floorUsd).toLocaleString("en-US")}`;
  } catch (error) {
    console.warn(`buildBudgetLabel() failed for ${floorUsd}: ${error?.message ?? error}`);
    return `${BUDGET_LABEL_PREFIX}$${floorUsd}`;
  }
}

/**
 * Strips the share-of-business percentage Clutch prints after each service
 * and industry ("Branding 85%", "Business services 10%").
 *
 * Representational, not a claim change: the percentage says how much of the
 * agency's work that line represents, which is a different fact from the
 * service being offered - and `services` renders as a list of service names
 * on the card, where "Branding 85%" reads as the name of a service. The set
 * of services claimed is untouched; only the label is.
 *
 * @param {string[]} values Cleaned service or industry labels.
 * @param {string} fieldName Field being cleaned, for the warning message.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {string[]} Labels with any trailing percentage removed.
 */
function stripFocusPercentages(values, fieldName, warnings) {
  try {
    let strippedAny = false;
    const cleaned = (values ?? []).map((value) => {
      const stripped = value.replace(FOCUS_PERCENTAGE_PATTERN, "").trim();
      if (stripped !== value) strippedAny = true;
      return stripped.length > 0 ? stripped : value;
    });
    if (strippedAny) {
      warnings.push(`stripped source focus percentages from \`${fieldName}\` labels`);
    }
    return cleaned;
  } catch (error) {
    warnings.push(`stripFocusPercentages() failed for \`${fieldName}\` (${error?.message ?? error}); left as-is`);
    return values ?? [];
  }
}

// ---------- Input parsing ----------

/**
 * Parses a batch file that a language model wrote.
 *
 * Deliberately lenient about the WRAPPER and strict about nothing else: a
 * saved chat response often arrives fenced in ```json, prefixed with a
 * sentence, or wrapped in `{ "agencies": [...] }`. None of those change a
 * single field of a single record, so unwrapping them is the same class of
 * fix as trimming whitespace. Everything inside the array is then held to
 * the full contract by `validateAndNormalizeRecord`.
 *
 * @param {string} fileContents Raw file text.
 * @param {string} filePath Path, for error messages only.
 * @returns {unknown[]} The records array.
 * @throws When no JSON array can be recovered from the file.
 */
function parseBatchFile(fileContents, filePath) {
  try {
    const withoutFences = fileContents
      .replace(/^﻿/, "")
      .replace(/```[a-zA-Z]*\s*/g, "")
      .replace(/```/g, "")
      .trim();

    /** @type {unknown} */
    let parsed = null;
    try {
      parsed = JSON.parse(withoutFences);
    } catch {
      const firstBracket = withoutFences.indexOf("[");
      const lastBracket = withoutFences.lastIndexOf("]");
      if (firstBracket === -1 || lastBracket <= firstBracket) {
        throw new Error("no JSON array found in file");
      }
      parsed = JSON.parse(withoutFences.slice(firstBracket, lastBracket + 1));
    }

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.agencies)) return parsed.agencies;
    if (Array.isArray(parsed?.records)) return parsed.records;
    throw new Error("parsed JSON is neither an array nor an object with an `agencies`/`records` array");
  } catch (error) {
    throw new Error(`Could not parse ${filePath}: ${error?.message ?? error}`);
  }
}

/**
 * Collects the batch files to read, from explicit --input paths or by
 * listing the default inbox directory.
 *
 * @param {string[]} explicitInputs Paths passed via --input.
 * @returns {string[]} Absolute paths to .json files, sorted for determinism.
 */
function collectInputFiles(explicitInputs) {
  try {
    if (explicitInputs?.length > 0) {
      return explicitInputs.map((inputPath) => resolve(REPOSITORY_ROOT, inputPath));
    }
    if (!existsSync(DEFAULT_INPUT_DIRECTORY)) {
      mkdirSync(DEFAULT_INPUT_DIRECTORY, { recursive: true });
      return [];
    }
    return readdirSync(DEFAULT_INPUT_DIRECTORY)
      .filter((entryName) => entryName.toLowerCase().endsWith(".json"))
      .sort()
      .map((entryName) => join(DEFAULT_INPUT_DIRECTORY, entryName));
  } catch (error) {
    throw new Error(`collectInputFiles() failed: ${error?.message ?? error}`);
  }
}

// ---------- Field validation ----------

/**
 * Reads a required non-empty string field.
 *
 * @param {Record<string, unknown>} rawRecord Record under validation.
 * @param {string} fieldName Field to read.
 * @param {string[]} errors Fatal-error sink; appended to on failure.
 * @returns {string | null} The trimmed value, or null when invalid.
 */
function readRequiredString(rawRecord, fieldName, errors) {
  try {
    const rawValue = rawRecord?.[fieldName];
    if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
      errors.push(`\`${fieldName}\` is required and must be a non-empty string`);
      return null;
    }
    return rawValue.trim();
  } catch (error) {
    errors.push(`\`${fieldName}\` could not be read: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Reads a nullable string field, treating "" and whitespace as null.
 *
 * @param {Record<string, unknown>} rawRecord Record under validation.
 * @param {string} fieldName Field to read.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {string | null} The trimmed value, or null.
 */
function readOptionalString(rawRecord, fieldName, warnings) {
  try {
    const rawValue = rawRecord?.[fieldName];
    if (rawValue === null || rawValue === undefined) return null;
    if (typeof rawValue !== "string") {
      warnings.push(`\`${fieldName}\` was not a string; set to null`);
      return null;
    }
    const trimmedValue = rawValue.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  } catch (error) {
    warnings.push(`\`${fieldName}\` could not be read (${error?.message ?? error}); set to null`);
    return null;
  }
}

/**
 * Reads an array-of-strings field, dropping blanks and duplicates.
 *
 * @param {Record<string, unknown>} rawRecord Record under validation.
 * @param {string} fieldName Field to read.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {string[]} Cleaned values; empty array when absent or unusable.
 */
function readStringArray(rawRecord, fieldName, warnings) {
  try {
    const rawValue = rawRecord?.[fieldName];
    if (rawValue === null || rawValue === undefined) return [];
    if (!Array.isArray(rawValue)) {
      warnings.push(`\`${fieldName}\` was not an array; set to []`);
      return [];
    }
    const seenValues = new Set();
    const cleaned = [];
    for (const entry of rawValue) {
      if (typeof entry !== "string") continue;
      const trimmedEntry = entry.trim();
      if (trimmedEntry.length === 0) continue;
      const dedupeKey = trimmedEntry.toLowerCase();
      if (seenValues.has(dedupeKey)) continue;
      seenValues.add(dedupeKey);
      cleaned.push(trimmedEntry);
    }
    return cleaned;
  } catch (error) {
    warnings.push(`\`${fieldName}\` could not be read (${error?.message ?? error}); set to []`);
    return [];
  }
}

/**
 * Validates and normalises `location`.
 *
 * @param {unknown} rawLocation The record's `location` value.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {{country: string|null, countryCode: string|null, city: string|null} | null}
 */
function validateLocation(rawLocation, warnings) {
  try {
    if (rawLocation === null || rawLocation === undefined) return null;
    if (typeof rawLocation !== "object" || Array.isArray(rawLocation)) {
      warnings.push("`location` was not an object; set to null");
      return null;
    }
    const country = readOptionalString(rawLocation, "country", warnings);
    const city = readOptionalString(rawLocation, "city", warnings);
    const rawCountryCode = readOptionalString(rawLocation, "countryCode", warnings);

    let countryCode = null;
    if (rawCountryCode) {
      const upperCased = rawCountryCode.toUpperCase();
      if (/^[A-Z]{2}$/.test(upperCased)) {
        countryCode = upperCased;
      } else {
        warnings.push(
          `\`location.countryCode\` "${rawCountryCode}" is not ISO 3166-1 alpha-2; set to null`,
        );
      }
    }

    if (!country && !city && !countryCode) return null;
    return { country, countryCode, city };
  } catch (error) {
    warnings.push(`\`location\` could not be read (${error?.message ?? error}); set to null`);
    return null;
  }
}

/**
 * Validates `awards`.
 *
 * A non-zero tally is a REJECTION, not something to zero out. These three
 * sources publish no Awwwards-scheme awards at all, so a non-zero count
 * here means the record's author mapped a D&AD Pencil or a Clutch badge
 * onto a counted field it does not belong in - and `awards.total` is a
 * primary sort key that a visitor reads as "Awwwards awards". Silently
 * zeroing it would hide an authoring mistake that will recur across the
 * whole batch; failing loudly sends it back to be put in `accolades`,
 * where free-text recognitions of mixed provenance belong.
 *
 * @param {unknown} rawAwards The record's `awards` value.
 * @param {string[]} errors Fatal-error sink.
 * @returns {typeof ZEROED_AWARDS} The zeroed tally.
 */
function validateAwards(rawAwards, errors) {
  try {
    if (rawAwards === null || rawAwards === undefined) return { ...ZEROED_AWARDS };
    if (typeof rawAwards !== "object" || Array.isArray(rawAwards)) {
      errors.push("`awards` must be an object with the seven numeric tally keys, all zero");
      return { ...ZEROED_AWARDS };
    }
    const nonZeroKeys = AWARD_COUNT_KEYS.filter((awardKey) => Number(rawAwards?.[awardKey] ?? 0) !== 0);
    if (nonZeroKeys.length > 0) {
      errors.push(
        `\`awards\` must be all zeros for this source - got non-zero ${nonZeroKeys.join(", ")}. ` +
          "Award wins belong in `accolades` as free text, not in the Awwwards tally.",
      );
    }
    return { ...ZEROED_AWARDS };
  } catch (error) {
    errors.push(`\`awards\` could not be read: ${error?.message ?? error}`);
    return { ...ZEROED_AWARDS };
  }
}

/**
 * Validates `rating`. A malformed rating is a rejection rather than a
 * null: a review score is an assertion about what clients said, and
 * dropping a broken one would quietly turn "we misread the page" into
 * "this agency has no reviews".
 *
 * @param {unknown} rawRating The record's `rating` value.
 * @param {string[]} errors Fatal-error sink.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {{value: number, scale: number, reviewCount: number} | null}
 */
function validateRating(rawRating, errors, warnings) {
  try {
    if (rawRating === null || rawRating === undefined) return null;
    if (typeof rawRating !== "object" || Array.isArray(rawRating)) {
      errors.push("`rating` must be null or an object with `value`, `scale` and `reviewCount`");
      return null;
    }
    const value = Number(rawRating?.value);
    const scale = Number(rawRating?.scale ?? EXPECTED_RATING_SCALE);
    const reviewCount = Number(rawRating?.reviewCount);

    if (!Number.isFinite(value) || value <= 0) {
      errors.push("`rating.value` must be a positive number");
      return null;
    }
    if (!Number.isFinite(scale) || scale <= 0) {
      errors.push("`rating.scale` must be a positive number");
      return null;
    }
    if (value > scale) {
      errors.push(`\`rating.value\` (${value}) exceeds \`rating.scale\` (${scale})`);
      return null;
    }
    if (!Number.isInteger(reviewCount) || reviewCount < 0) {
      errors.push("`rating.reviewCount` must be a non-negative integer");
      return null;
    }
    if (scale !== EXPECTED_RATING_SCALE) {
      warnings.push(`\`rating.scale\` is ${scale}, not the expected ${EXPECTED_RATING_SCALE}`);
    }
    return { value, scale, reviewCount };
  } catch (error) {
    errors.push(`\`rating\` could not be read: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Validates and normalises the `clients` array.
 *
 * A malformed client is dropped with a warning rather than failing the
 * whole agency: clients are supporting evidence on a profile, and one
 * unparseable entry should not cost the directory an otherwise good
 * record. Deduped by `domain` when present, else by lowercased name -
 * matching `AgencyClient.domain`'s contract in lib/directory/types.ts.
 *
 * @param {unknown} rawClients The record's `clients` value.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {Array<{name: string, domain: string|null, projectTitle: string, projectUrl: string|null, notable: boolean}>}
 */
function validateClients(rawClients, warnings) {
  try {
    if (rawClients === null || rawClients === undefined) return [];
    if (!Array.isArray(rawClients)) {
      warnings.push("`clients` was not an array; set to []");
      return [];
    }

    const seenClientKeys = new Set();
    const cleanedClients = [];

    for (const rawClient of rawClients) {
      if (!rawClient || typeof rawClient !== "object" || Array.isArray(rawClient)) {
        warnings.push("dropped a `clients` entry that was not an object");
        continue;
      }
      const clientName = toPlainText(rawClient?.name);
      if (!clientName) {
        warnings.push("dropped a `clients` entry with no usable `name`");
        continue;
      }
      const clientDomain = domainFromUrlLike(rawClient?.domain);
      // `projectTitle` falls back to the client's own name, per that
      // field's doc comment - a logo wall names the client directly and
      // has no project to cite.
      const projectTitle = toPlainText(rawClient?.projectTitle) ?? clientName;
      const projectUrl = normalizeWebsiteUrl(rawClient?.projectUrl);
      const notable = rawClient?.notable === true;

      const dedupeKey = clientDomain ?? `name:${clientName.toLowerCase()}`;
      if (seenClientKeys.has(dedupeKey)) continue;
      seenClientKeys.add(dedupeKey);

      cleanedClients.push({
        name: clientName,
        domain: clientDomain,
        projectTitle,
        projectUrl,
        notable,
      });
    }

    // Notable brands first, matching the ordering contract on
    // `AgencyClient.notable`; the sort is stable so source order is kept
    // within each group.
    cleanedClients.sort((clientOne, clientTwo) => Number(clientTwo.notable) - Number(clientOne.notable));

    if (cleanedClients.length > MAX_CLIENTS_PER_AGENCY) {
      warnings.push(
        `\`clients\` had ${cleanedClients.length} entries; kept the first ${MAX_CLIENTS_PER_AGENCY}`,
      );
    }
    return cleanedClients.slice(0, MAX_CLIENTS_PER_AGENCY);
  } catch (error) {
    warnings.push(`\`clients\` could not be read (${error?.message ?? error}); set to []`);
    return [];
  }
}

/**
 * Validates `budgetFloorUsd`, keeping null and 0 rigorously distinct.
 *
 * Per that field's doc comment in lib/directory/types.ts, null means "the
 * source did not say" and 0 means "takes work at any budget". They are
 * different claims and neither may stand in for the other, so a value that
 * is neither null nor a non-negative integer is rejected rather than
 * defaulted.
 *
 * @param {unknown} rawFloor The record's `budgetFloorUsd` value.
 * @param {string[]} errors Fatal-error sink.
 * @returns {number | null} Whole US dollars, or null.
 */
function validateBudgetFloor(rawFloor, errors) {
  try {
    if (rawFloor === null || rawFloor === undefined) return null;
    const floorUsd = Number(rawFloor);
    if (!Number.isInteger(floorUsd) || floorUsd < 0) {
      errors.push(
        "`budgetFloorUsd` must be null or a non-negative whole number of US dollars " +
          "(null = \"source did not say\", 0 = \"takes any budget\" - these are not interchangeable)",
      );
      return null;
    }
    return floorUsd;
  } catch (error) {
    errors.push(`\`budgetFloorUsd\` could not be read: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Validates `foundedYear` against a plausible range.
 *
 * @param {unknown} rawYear The record's `foundedYear` value.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {number | null} Four-digit year, or null.
 */
function validateFoundedYear(rawYear, warnings) {
  try {
    if (rawYear === null || rawYear === undefined) return null;
    const foundedYear = Number(rawYear);
    const maxPlausibleYear = new Date().getUTCFullYear() + 1;
    if (
      !Number.isInteger(foundedYear) ||
      foundedYear < MIN_PLAUSIBLE_FOUNDED_YEAR ||
      foundedYear > maxPlausibleYear
    ) {
      warnings.push(
        `\`foundedYear\` ${rawYear} is outside ${MIN_PLAUSIBLE_FOUNDED_YEAR}-${maxPlausibleYear}; set to null`,
      );
      return null;
    }
    return foundedYear;
  } catch (error) {
    warnings.push(`\`foundedYear\` could not be read (${error?.message ?? error}); set to null`);
    return null;
  }
}

/**
 * Normalises `scrapedAt` to an ISO-8601 string.
 *
 * Safe to fill in when absent, unlike every other field here: it records
 * when WE collected the record, not anything the source asserted.
 *
 * @param {unknown} rawTimestamp The record's `scrapedAt` value.
 * @param {string} runTimestamp ISO timestamp for this run.
 * @param {string[]} warnings Non-fatal warning sink.
 * @returns {string} An ISO-8601 timestamp.
 */
function normalizeScrapedAt(rawTimestamp, runTimestamp, warnings) {
  try {
    if (typeof rawTimestamp === "string" && rawTimestamp.trim().length > 0) {
      const parsedDate = new Date(rawTimestamp);
      if (!Number.isNaN(parsedDate.getTime())) return parsedDate.toISOString();
    }
    warnings.push("`scrapedAt` was missing or unparseable; set to this run's timestamp");
    return runTimestamp;
  } catch (error) {
    warnings.push(`\`scrapedAt\` could not be read (${error?.message ?? error}); set to run timestamp`);
    return runTimestamp;
  }
}

/**
 * Applies the category's editorial admission rule.
 *
 * There are exactly TWO routes into the branding category, and they exist
 * because the $10,000 floor is unsourceable at the top of this market:
 *
 *   1. A PUBLISHED floor at or above BRANDING_MIN_BUDGET_FLOOR_USD. This is
 *      the Clutch/DesignRush route - those directories print a minimum
 *      project size, so the claim is attributable to `profileUrl`.
 *   2. AWARD PROVENANCE with no published floor at all. This is the D&AD
 *      route. The studios that define this category (Pentagram, Jones
 *      Knowles Ritchie, Bulletproof, PORTO ROCHA) publish no budget bands
 *      anywhere, and their real floors run far above $10,000. Gating on a
 *      published number alone would admit mid-market shops and exclude
 *      exactly the agencies the category exists to list.
 *
 * A record with neither is rejected: an unranked, unawarded agency with no
 * stated floor has nothing attesting it belongs above the line.
 *
 * @param {number | null} budgetFloorUsd Validated floor, or null.
 * @param {string[]} accolades Validated accolades.
 * @returns {{admitted: boolean, reason: string | null}}
 */
function decideAdmission(budgetFloorUsd, accolades) {
  try {
    if (budgetFloorUsd !== null) {
      if (budgetFloorUsd >= BRANDING_MIN_BUDGET_FLOOR_USD) return { admitted: true, reason: null };
      return {
        admitted: false,
        reason:
          `published budget floor $${budgetFloorUsd.toLocaleString("en-US")} is below the ` +
          `$${BRANDING_MIN_BUDGET_FLOOR_USD.toLocaleString("en-US")} category minimum`,
      };
    }
    if (accolades?.length > 0) return { admitted: true, reason: null };
    return {
      admitted: false,
      reason:
        "no published budget floor and no `accolades` - nothing attests this agency clears " +
        `the $${BRANDING_MIN_BUDGET_FLOOR_USD.toLocaleString("en-US")} bar`,
    };
  } catch (error) {
    return { admitted: false, reason: `admission check failed: ${error?.message ?? error}` };
  }
}

/**
 * Validates one raw record against the `Agency` contract and returns a
 * normalised copy, or null when the record must be rejected.
 *
 * `slug` is deliberately NOT assigned here - uniqueness is a property of
 * the whole dataset, so it is reserved in `main` after deduping.
 *
 * @param {unknown} rawRecord One entry from a batch file.
 * @param {string} runTimestamp ISO timestamp for this run.
 * @returns {{record: object|null, errors: string[], warnings: string[], label: string, excludedReason?: string}}
 *          `excludedReason` is set only for an editorial exclusion, which
 *          is reported separately from a validation failure - the record was
 *          fine, we chose not to list it.
 */
function validateAndNormalizeRecord(rawRecord, runTimestamp) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  try {
    if (!rawRecord || typeof rawRecord !== "object" || Array.isArray(rawRecord)) {
      return { record: null, errors: ["record is not a JSON object"], warnings, label: "<not an object>" };
    }

    const name = readRequiredString(rawRecord, "name", errors);
    const label = name ?? String(rawRecord?.slug ?? rawRecord?.domain ?? "<unnamed>");

    const profileUrl = readRequiredString(rawRecord, "profileUrl", errors);
    const normalizedProfileUrl = profileUrl ? normalizeWebsiteUrl(profileUrl) : null;
    if (profileUrl && !normalizedProfileUrl) {
      errors.push(`\`profileUrl\` "${profileUrl}" is not a parseable absolute URL`);
    }

    const source = readOptionalString(rawRecord, "source", warnings)?.toLowerCase() ?? null;
    if (!source || !ALLOWED_SOURCES.has(source)) {
      errors.push(
        `\`source\` must be one of ${Array.from(ALLOWED_SOURCES).join(", ")} - got ${JSON.stringify(rawRecord?.source ?? null)}`,
      );
    }

    const categories = readStringArray(rawRecord, "categories", warnings);
    if (!categories.includes(CATEGORY_BRANDING)) {
      errors.push(`\`categories\` must include "${CATEGORY_BRANDING}"`);
    }

    const website = normalizeWebsiteUrl(rawRecord?.website);
    if (rawRecord?.website && !website) {
      warnings.push(`\`website\` "${rawRecord.website}" was unparseable; set to null`);
    }

    // The website is the more primitive fact, so it wins any disagreement
    // with a separately-stated `domain` - but the disagreement is always
    // reported, because a domain is this dataset's identity key and a
    // mismatch usually means two agencies got conflated.
    const domainFromWebsite = website ? domainFromUrlLike(website) : null;
    const statedDomain = domainFromUrlLike(rawRecord?.domain);
    let domain = domainFromWebsite ?? statedDomain;
    if (domainFromWebsite && statedDomain && domainFromWebsite !== statedDomain) {
      warnings.push(
        `\`domain\` "${statedDomain}" disagrees with \`website\` host "${domainFromWebsite}"; used the website's`,
      );
      domain = domainFromWebsite;
    }
    if (!domain) {
      warnings.push("no `domain` could be derived; this record cannot be deduped across sources");
    }

    const logoUrl = normalizeWebsiteUrl(rawRecord?.logoUrl);
    if (rawRecord?.logoUrl && !logoUrl) {
      warnings.push("`logoUrl` was unparseable; set to null");
    }

    const accolades = readStringArray(rawRecord, "accolades", warnings);
    const budgetFloorUsd = validateBudgetFloor(rawRecord?.budgetFloorUsd, errors);

    let budgetLabel = readOptionalString(rawRecord, "budgetLabel", warnings);
    if (budgetFloorUsd !== null && !budgetLabel) {
      // Rendering a number we already validated in the phrasing the rest of
      // the directory uses - representational, not a new claim.
      budgetLabel = buildBudgetLabel(budgetFloorUsd);
      warnings.push("`budgetLabel` was missing; derived it from `budgetFloorUsd`");
    }
    if (budgetFloorUsd === null && budgetLabel) {
      errors.push(
        "`budgetLabel` states a budget while `budgetFloorUsd` is null - a displayed floor must " +
          "have a machine-readable one behind it, or it cannot be filtered on",
      );
    }

    const admission = decideAdmission(budgetFloorUsd, accolades);
    if (!admission.admitted && admission.reason) errors.push(admission.reason);

    const exclusionReason = domain ? EDITORIALLY_EXCLUDED_DOMAINS.get(domain) : null;
    if (exclusionReason) {
      return { record: null, errors, warnings, label: name ?? domain, excludedReason: exclusionReason };
    }

    const record = {
      // slug assigned in main(), after dedupe
      slug: "",
      name,
      website,
      domain,
      profileUrl: normalizedProfileUrl,
      location: validateLocation(rawRecord?.location, warnings),
      categories,
      services: stripFocusPercentages(readStringArray(rawRecord, "services", warnings), "services", warnings),
      teamSize: readOptionalString(rawRecord, "teamSize", warnings),
      logoUrl,
      description: toPlainText(rawRecord?.description),
      awards: validateAwards(rawRecord?.awards, errors),
      rating: validateRating(rawRecord?.rating, errors, warnings),
      accolades,
      foundedYear: validateFoundedYear(rawRecord?.foundedYear, warnings),
      industries: stripFocusPercentages(
        readStringArray(rawRecord, "industries", warnings),
        "industries",
        warnings,
      ),
      budgetLabel,
      budgetFloorUsd,
      clients: validateClients(rawRecord?.clients, warnings),
      source,
      scrapedAt: normalizeScrapedAt(rawRecord?.scrapedAt, runTimestamp, warnings),
    };

    if (errors.length > 0) return { record: null, errors, warnings, label };
    return { record, errors, warnings, label };
  } catch (error) {
    errors.push(`record could not be validated: ${error?.message ?? error}`);
    return { record: null, errors, warnings, label: "<unreadable>" };
  }
}

// ---------- Dedupe ----------

/**
 * Merges a duplicate record into the one already held for a domain.
 *
 * First-wins on every scalar field, exactly like `mergeAgencySources` in
 * lib/directory/agencies.ts - a record's fields and its `profileUrl` must
 * keep describing the same page, or the attribution link stops backing the
 * data next to it.
 *
 * `accolades` is the one exception and is unioned across duplicates. An
 * award is a fact about the agency rather than about the directory that
 * listed it, and each accolade string names its own awarding body ("D&AD
 * Wood Pencil 2025"), so it stays self-attributing wherever it lands. This
 * is what lets a Clutch record - which carries the budget floor the
 * category gates on - also carry the D&AD provenance that makes it worth
 * listing.
 *
 * @param {object} keptRecord The higher-priority record; mutated in place.
 * @param {object} duplicateRecord The record being merged in and discarded.
 * @returns {void}
 */
function mergeDuplicateRecords(keptRecord, duplicateRecord) {
  try {
    const seenAccolades = new Set((keptRecord?.accolades ?? []).map((entry) => entry.toLowerCase()));
    for (const accolade of duplicateRecord?.accolades ?? []) {
      const dedupeKey = accolade.toLowerCase();
      if (seenAccolades.has(dedupeKey)) continue;
      seenAccolades.add(dedupeKey);
      keptRecord.accolades.push(accolade);
    }
  } catch (error) {
    console.warn(`mergeDuplicateRecords() failed: ${error?.message ?? error}`);
  }
}

/**
 * Sorts validated records so the highest-priority source for an agency is
 * seen first by the dedupe pass. See SOURCE_PRIORITY.
 *
 * @param {object} recordOne First record.
 * @param {object} recordTwo Second record.
 * @returns {number} Standard comparator result.
 */
function compareBySourcePriority(recordOne, recordTwo) {
  try {
    const priorityOne = SOURCE_PRIORITY[recordOne?.source] ?? UNKNOWN_SOURCE_PRIORITY;
    const priorityTwo = SOURCE_PRIORITY[recordTwo?.source] ?? UNKNOWN_SOURCE_PRIORITY;
    if (priorityOne !== priorityTwo) return priorityOne - priorityTwo;
    return (recordOne?.name ?? "").localeCompare(recordTwo?.name ?? "");
  } catch {
    return 0;
  }
}

/**
 * Collapses records that describe the same agency, keyed on registrable
 * domain. A null domain is never an identity to match on - two agencies
 * whose domain could not be derived are not the same agency - so every
 * domain-less record survives, matching `mergeAgencySources`.
 *
 * @param {object[]} records Validated records.
 * @returns {{records: object[], collisions: Array<{domain: string, kept: string, dropped: string}>}}
 */
function dedupeByDomain(records) {
  try {
    const byDomain = new Map();
    const deduped = [];
    const collisions = [];

    for (const record of [...records].sort(compareBySourcePriority)) {
      const domain = record?.domain;
      if (!domain) {
        deduped.push(record);
        continue;
      }
      const existingRecord = byDomain.get(domain);
      if (existingRecord) {
        mergeDuplicateRecords(existingRecord, record);
        collisions.push({
          domain,
          kept: `${existingRecord.name} (${existingRecord.source})`,
          dropped: `${record.name} (${record.source})`,
        });
        continue;
      }
      byDomain.set(domain, record);
      deduped.push(record);
    }

    return { records: deduped, collisions };
  } catch (error) {
    throw new Error(`dedupeByDomain() failed: ${error?.message ?? error}`);
  }
}

/**
 * Orders the written file so award-backed studios lead.
 *
 * Accolade count is the primary key, ahead of review score, because this
 * category admits agencies by two different routes (see `decideAdmission`)
 * and the award route carries the stronger claim. A shrinkage-adjusted
 * review score breaks ties, matching `computeRankingScore` in
 * import-semrush.mjs so a lone 5.0-with-one-review cannot outrank a
 * well-reviewed 4.8.
 *
 * NOTE: this order is for the file, not the page. `getAgenciesByCategory`
 * in lib/directory/agencies.ts re-sorts on read.
 *
 * @param {object} recordOne First record.
 * @param {object} recordTwo Second record.
 * @returns {number} Standard comparator result.
 */
function compareForOutput(recordOne, recordTwo) {
  try {
    const accoladesOne = recordOne?.accolades?.length ?? 0;
    const accoladesTwo = recordTwo?.accolades?.length ?? 0;
    if (accoladesOne !== accoladesTwo) return accoladesTwo - accoladesOne;

    const scoreOne = computeShrunkRatingScore(recordOne?.rating);
    const scoreTwo = computeShrunkRatingScore(recordTwo?.rating);
    if (scoreOne !== scoreTwo) return scoreTwo - scoreOne;

    return (recordOne?.name ?? "").localeCompare(recordTwo?.name ?? "");
  } catch {
    return 0;
  }
}

/** Shrinkage prior, matching RANKING_SHRINKAGE_PRIOR in import-semrush.mjs
 *  and RATING_PRIOR_REVIEWS in lib/directory/agencies.ts. */
const RANKING_SHRINKAGE_PRIOR = 5;

/**
 * Shrinkage-adjusted rating score: `value * (count / (count + prior))`.
 *
 * @param {{value: number, reviewCount: number} | null | undefined} rating Validated rating.
 * @returns {number} Score, 0 when there is no rating.
 */
function computeShrunkRatingScore(rating) {
  try {
    const value = rating?.value ?? 0;
    const reviewCount = rating?.reviewCount ?? 0;
    if (value <= 0 || reviewCount <= 0) return 0;
    return value * (reviewCount / (reviewCount + RANKING_SHRINKAGE_PRIOR));
  } catch (error) {
    console.warn(`computeShrunkRatingScore() failed: ${error?.message ?? error}`);
    return 0;
  }
}

// ---------- CLI ----------

/**
 * Parses argv into options.
 *
 * @param {string[]} argv Raw arguments, excluding node and script path.
 * @returns {{inputs: string[], outputPath: string, dryRun: boolean, strict: boolean}}
 */
function parseArguments(argv) {
  try {
    const inputs = [];
    let outputPath = DEFAULT_OUTPUT_PATH;
    let dryRun = false;
    let strict = false;

    for (let index = 0; index < argv.length; index += 1) {
      const argument = argv[index];
      if (argument === "--dry-run") {
        dryRun = true;
      } else if (argument === "--strict") {
        strict = true;
      } else if (argument === "--input" || argument === "-i") {
        const value = argv[index + 1];
        if (!value) throw new Error("--input requires a path");
        inputs.push(value);
        index += 1;
      } else if (argument.startsWith("--input=")) {
        inputs.push(argument.slice("--input=".length));
      } else if (argument === "--out" || argument === "-o") {
        const value = argv[index + 1];
        if (!value) throw new Error("--out requires a path");
        outputPath = resolve(REPOSITORY_ROOT, value);
        index += 1;
      } else if (argument.startsWith("--out=")) {
        outputPath = resolve(REPOSITORY_ROOT, argument.slice("--out=".length));
      } else {
        throw new Error(`unknown argument "${argument}"`);
      }
    }

    return { inputs, outputPath, dryRun, strict };
  } catch (error) {
    throw new Error(`parseArguments() failed: ${error?.message ?? error}`);
  }
}

/**
 * Reads every batch, validates, dedupes, assigns slugs and writes the
 * dataset. Refuses to write an empty file: overwriting a good dataset with
 * `[]` because an inbox was empty or a batch was malformed would silently
 * empty a live category.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    const runTimestamp = new Date().toISOString();
    const inputFiles = collectInputFiles(options.inputs);

    if (inputFiles.length === 0) {
      console.error(
        `No batch files found. Drop the browser session's JSON into ${relative(REPOSITORY_ROOT, DEFAULT_INPUT_DIRECTORY)}/ ` +
          "or pass --input <path>.",
      );
      process.exitCode = 1;
      return;
    }

    /** @type {object[]} */
    const validRecords = [];
    /** @type {Array<{file: string, label: string, errors: string[]}>} */
    const rejected = [];
    /** @type {Array<{file: string, label: string, warnings: string[]}>} */
    const warned = [];
    /** @type {Array<{label: string, reason: string}>} */
    const excluded = [];
    let seenCount = 0;

    for (const filePath of inputFiles) {
      const relativePath = relative(REPOSITORY_ROOT, filePath);
      let rawRecords = [];
      try {
        rawRecords = parseBatchFile(readFileSync(filePath, "utf8"), relativePath);
      } catch (error) {
        console.error(`  ✗ ${relativePath}: ${error?.message ?? error}`);
        rejected.push({ file: relativePath, label: "<whole file>", errors: [String(error?.message ?? error)] });
        continue;
      }

      console.log(`  · ${relativePath}: ${rawRecords.length} records`);
      for (const rawRecord of rawRecords) {
        seenCount += 1;
        const outcome = validateAndNormalizeRecord(rawRecord, runTimestamp);
        if (outcome.warnings.length > 0) {
          warned.push({ file: relativePath, label: outcome.label, warnings: outcome.warnings });
        }
        if (outcome.excludedReason) {
          excluded.push({ label: outcome.label, reason: outcome.excludedReason });
          continue;
        }
        if (!outcome.record) {
          rejected.push({ file: relativePath, label: outcome.label, errors: outcome.errors });
          continue;
        }
        validRecords.push(outcome.record);
      }
    }

    const { records: dedupedRecords, collisions } = dedupeByDomain(validRecords);
    dedupedRecords.sort(compareForOutput);

    // Slugs are reserved last, in final output order, so the same dataset
    // always produces the same slugs regardless of batch file order.
    const usedSlugs = new Set();
    for (const record of dedupedRecords) {
      const slugBase = slugBaseFromDomain(record?.domain) ?? slugify(record?.name);
      record.slug = makeUniqueSlug(slugBase, usedSlugs);
    }

    reportRun({ seenCount, dedupedRecords, rejected, warned, collisions, excluded });

    if (dedupedRecords.length === 0) {
      console.error("\nRefusing to write: no records survived validation.");
      process.exitCode = 1;
      return;
    }

    if (options.dryRun) {
      console.log(`\nDry run - ${relative(REPOSITORY_ROOT, options.outputPath)} left untouched.`);
    } else {
      writeFileSync(options.outputPath, `${JSON.stringify(dedupedRecords, null, 2)}\n`, "utf8");
      console.log(
        `\nWrote ${dedupedRecords.length} records to ${relative(REPOSITORY_ROOT, options.outputPath)}`,
      );
    }

    if (options.strict && rejected.length > 0) {
      console.error(`\n--strict: ${rejected.length} rejected record(s).`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`load-branding-json failed: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

/**
 * Prints the run summary: what was accepted, what was rejected and why,
 * and how the accepted set breaks down.
 *
 * @param {{seenCount: number, dedupedRecords: object[], rejected: object[], warned: object[], collisions: object[], excluded: object[]}} summary Run totals.
 * @returns {void}
 */
function reportRun(summary) {
  try {
    const { seenCount, dedupedRecords, rejected, warned, collisions, excluded } = summary;

    if (warned.length > 0) {
      // Grouped by message, because a normalisation that fires on one record
      // usually fires on most of them - 83 identical lines buries the one
      // warning that only fired twice and actually needs looking at.
      const warningGroups = new Map();
      for (const entry of warned) {
        for (const warning of entry.warnings) {
          if (!warningGroups.has(warning)) warningGroups.set(warning, []);
          warningGroups.get(warning).push(entry.label);
        }
      }
      const warningCount = [...warningGroups.values()].reduce((sum, labels) => sum + labels.length, 0);
      console.log(`\nWarnings (record kept, field normalised) - ${warningCount} across ${warningGroups.size} kinds:`);
      for (const [warning, labels] of [...warningGroups].sort((one, two) => two[1].length - one[1].length)) {
        if (labels.length <= WARNING_GROUP_EXAMPLE_LIMIT) {
          console.log(`  ! ${warning}`);
          for (const label of labels) console.log(`      ${label}`);
        } else {
          const examples = labels.slice(0, WARNING_GROUP_EXAMPLE_LIMIT).join(", ");
          console.log(`  ! ${warning} - ${labels.length} records`);
          console.log(`      e.g. ${examples}, +${labels.length - WARNING_GROUP_EXAMPLE_LIMIT} more`);
        }
      }
    }

    if (rejected.length > 0) {
      console.log(`\nRejected - ${rejected.length}:`);
      for (const entry of rejected) {
        for (const errorMessage of entry.errors) {
          console.log(`  ✗ ${entry.label} [${entry.file}]: ${errorMessage}`);
        }
      }
    }

    if (excluded.length > 0) {
      console.log(`\nEditorially excluded - ${excluded.length}:`);
      for (const entry of excluded) {
        console.log(`  - ${entry.label}: ${entry.reason}`);
      }
    }

    if (collisions.length > 0) {
      console.log(`\nDuplicate agencies merged by domain - ${collisions.length}:`);
      for (const collision of collisions) {
        console.log(`  = ${collision.domain}: kept ${collision.kept}, merged ${collision.dropped}`);
      }
    }

    const bySource = new Map();
    const logoHosts = new Set();
    let withAccolades = 0;
    let withRating = 0;
    let awardRouteOnly = 0;
    const budgetTiers = new Map();

    for (const record of dedupedRecords) {
      bySource.set(record.source, (bySource.get(record.source) ?? 0) + 1);
      if (record.accolades?.length > 0) withAccolades += 1;
      if (record.rating) withRating += 1;
      const logoHost = hostnameOf(record.logoUrl);
      if (logoHost) logoHosts.add(logoHost);
      if (record.budgetFloorUsd === null) {
        awardRouteOnly += 1;
      } else {
        const tierLabel = `$${record.budgetFloorUsd.toLocaleString("en-US")}`;
        budgetTiers.set(tierLabel, (budgetTiers.get(tierLabel) ?? 0) + 1);
      }
    }

    console.log("\n--- Summary ---");
    console.log(`  records seen:      ${seenCount}`);
    console.log(`  rejected:          ${rejected.length}`);
    console.log(`  excluded:          ${excluded.length} (editorial, see EDITORIALLY_EXCLUDED_DOMAINS)`);
    console.log(`  merged duplicates: ${collisions.length}`);
    console.log(`  written:           ${dedupedRecords.length}`);
    console.log(`  by source:         ${[...bySource].map(([key, count]) => `${key}=${count}`).join(", ") || "none"}`);
    console.log(`  budget floors:     ${[...budgetTiers].map(([key, count]) => `${key}=${count}`).join(", ") || "none"}`);
    console.log(`  award route only:  ${awardRouteOnly} (no published floor)`);
    console.log(`  with accolades:    ${withAccolades}`);
    console.log(`  with a rating:     ${withRating}`);

    // Agency logos are hotlinked from the source profile, and next/image
    // answers an un-allowlisted host with a 400 - every logo renders blank
    // with no build error and no server-side warning, visible only in the
    // browser console. Listing the hosts here turns that silent failure
    // into a checklist. See app/directory/README.md, "adding a category
    // with a new source", step 4.
    if (logoHosts.size > 0) {
      console.log("\n  Logo hosts in this dataset - each needs an `images.remotePatterns`");
      console.log("  entry in next.config.ts or its logos render blank with no build error:");
      for (const logoHost of [...logoHosts].sort()) {
        console.log(`    - ${logoHost}`);
      }
    }
  } catch (error) {
    console.warn(`reportRun() failed: ${error?.message ?? error}`);
  }
}

/**
 * Extracts the hostname from an absolute URL.
 *
 * @param {string | null | undefined} rawUrl Absolute URL, or null.
 * @returns {string | null} Hostname, or null when not parseable.
 */
function hostnameOf(rawUrl) {
  try {
    if (!rawUrl) return null;
    return new URL(rawUrl).hostname || null;
  } catch {
    return null;
  }
}

main();
