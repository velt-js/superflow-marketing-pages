#!/usr/bin/env node
/**
 * Import /preview/comparison content documents into Sanity.
 *
 * Reads every *.json file in scripts/comparison-preview-import/content/
 * (or the paths passed as CLI args), validates the template rules that can
 * be checked mechanically, and createOrReplace()s the documents.
 *
 * These are the NEW comparisonPreview* document types only — the script
 * refuses any other _type, so the legacy comparisonPage / alternativePage
 * content can never be touched from here.
 *
 * Document _id convention: <type>-<slug> (hub: "comparisonPreviewHub").
 *
 * Usage:
 *   node --env-file=.env.local scripts/comparison-preview-import/import-to-sanity.mjs
 *   node --env-file=.env.local scripts/comparison-preview-import/import-to-sanity.mjs content/superflow-vs-bugherd.json
 *   DRY_RUN=1 node scripts/comparison-preview-import/import-to-sanity.mjs
 */
import { createClient } from "@sanity/client";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(scriptDir, "content");

const ALLOWED_TYPES = new Set([
  "comparisonPreviewVsPage",
  "comparisonPreviewArbiterPage",
  "comparisonPreviewAlternativesPage",
  "comparisonPreviewHub",
]);

/** The eight canonical buyer labels, canonical order (RG ruling, July 2026). */
const BUYER_LABELS = [
  "Who checks the site",
  "How the client says yes",
  "Where you review",
  "What stays private",
  "What gets captured",
  "What it remembers",
  "How it fits your stack",
  "What it costs",
];

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

/**
 * Recursively collect every string value in a document.
 *
 * @param {unknown} value - Any JSON value.
 * @param {string[]} accumulator - Collected strings.
 * @returns {string[]} All string leaves.
 */
function collectStrings(value, accumulator = []) {
  try {
    if (typeof value === "string") {
      accumulator.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        collectStrings(item, accumulator);
      }
    } else if (value && typeof value === "object") {
      for (const item of Object.values(value)) {
        collectStrings(item, accumulator);
      }
    }
    return accumulator;
  } catch {
    return accumulator;
  }
}

/**
 * Validate a scorecard array: exactly eight rows, the canonical buyer
 * labels, canonical order.
 *
 * @param {Array<{label?: string}>} rows - Scorecard rows.
 * @param {string} fieldName - Field name for error messages.
 * @returns {string[]} Validation errors, empty when valid.
 */
function validateScorecard(rows, fieldName) {
  const errors = [];
  try {
    if (!Array.isArray(rows)) {
      errors.push(`${fieldName}: missing`);
      return errors;
    }
    if (rows.length !== 8) {
      errors.push(`${fieldName}: expected exactly 8 rows, got ${rows.length}`);
    }
    rows.forEach((row, rowIndex) => {
      const expected = BUYER_LABELS[rowIndex];
      if (expected && row?.label !== expected) {
        errors.push(
          `${fieldName}[${rowIndex}]: label "${row?.label}" should be "${expected}" (canonical order)`,
        );
      }
    });
    return errors;
  } catch (validationError) {
    errors.push(`${fieldName}: ${validationError.message}`);
    return errors;
  }
}

/**
 * Validate one document against the mechanically checkable template rules.
 *
 * @param {Record<string, unknown>} doc - The document to validate.
 * @returns {string[]} Validation errors, empty when valid.
 */
function validateDoc(doc) {
  const errors = [];
  try {
    if (!ALLOWED_TYPES.has(doc?._type)) {
      errors.push(
        `_type "${doc?._type}" is not a comparisonPreview* type; refusing`,
      );
      return errors;
    }
    if (doc._type !== "comparisonPreviewHub") {
      if (!doc?.slug?.current) {
        errors.push("slug.current is required");
      }
      if (!doc?.title) {
        errors.push("title is required");
      }
    }

    // No em dashes anywhere, spec or rendered copy (RG ruling, July 2026).
    const allStrings = collectStrings(doc);
    const emDashHits = allStrings.filter((text) => text.includes("\u2014"));
    if (emDashHits.length > 0) {
      errors.push(
        `em dash found in ${emDashHits.length} string(s); use periods, commas, colons. First: "${emDashHits[0]?.slice(0, 80)}"`,
      );
    }

    // Bracketed build notes never render.
    const bracketHits = allStrings.filter((text) => /\[(VERIFY|ASSET|FLAG|DECIDE|GATE|FIX|RULE|DATA)[^\]]*\]/.test(text));
    if (bracketHits.length > 0) {
      errors.push(
        `unrendered [bracket] build note found in ${bracketHits.length} string(s). First: "${bracketHits[0]?.slice(0, 80)}"`,
      );
    }

    if (doc._type === "comparisonPreviewVsPage") {
      errors.push(...validateScorecard(doc?.scorecard, "scorecard"));
    }
    if (doc._type === "comparisonPreviewArbiterPage") {
      errors.push(...validateScorecard(doc?.scorecard, "scorecard"));
      if (!doc?.disclosure) {
        errors.push("disclosure is required on arbiter pages (always renders)");
      }
    }
    if (doc._type === "comparisonPreviewAlternativesPage") {
      errors.push(
        ...validateScorecard(doc?.superflowScorecard, "superflowScorecard"),
      );
      if (Array.isArray(doc?.criteria) && doc.criteria.length !== 8) {
        errors.push(
          `criteria: expected exactly 8, got ${doc.criteria.length}`,
        );
      }
    }
    return errors;
  } catch (validationError) {
    errors.push(`validation crashed: ${validationError.message}`);
    return errors;
  }
}

/**
 * Add _key to every object in array fields (Sanity requires keys on array
 * members) and normalize slug strings to slug objects.
 *
 * @param {unknown} value - Any JSON value.
 * @param {string} keyPrefix - Prefix for generated keys.
 * @returns {unknown} The keyed value.
 */
function withKeys(value, keyPrefix = "k") {
  try {
    if (Array.isArray(value)) {
      return value.map((item, itemIndex) => {
        const keyed = withKeys(item, `${keyPrefix}${itemIndex}`);
        if (keyed && typeof keyed === "object" && !Array.isArray(keyed)) {
          return { _key: `${keyPrefix}${itemIndex}`, ...keyed };
        }
        return keyed;
      });
    }
    if (value && typeof value === "object") {
      const result = {};
      for (const [fieldName, fieldValue] of Object.entries(value)) {
        result[fieldName] = withKeys(fieldValue, `${keyPrefix}-${fieldName}`);
      }
      return result;
    }
    return value;
  } catch {
    return value;
  }
}

/**
 * Load, validate, and persist one content file.
 *
 * @param {string} filePath - Absolute path to the JSON file.
 * @returns {Promise<boolean>} True on success.
 */
async function importFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    const doc = JSON.parse(raw);

    const errors = validateDoc(doc);
    if (errors.length > 0) {
      console.error(`✗ ${path.basename(filePath)}`);
      for (const message of errors) {
        console.error(`    - ${message}`);
      }
      return false;
    }

    const slugCurrent = doc?.slug?.current ?? doc?.slug;
    const documentId =
      doc._type === "comparisonPreviewHub"
        ? "comparisonPreviewHub"
        : `${doc._type}-${slugCurrent}`;

    const toPersist = withKeys({
      ...doc,
      _id: documentId,
      slug:
        doc._type === "comparisonPreviewHub"
          ? undefined
          : { _type: "slug", current: slugCurrent },
    });

    if (DRY_RUN) {
      console.log(`✓ (dry run) ${documentId}`);
      return true;
    }

    await client.createOrReplace(toPersist);
    console.log(`✓ ${documentId}`);
    return true;
  } catch (importError) {
    console.error(`✗ ${path.basename(filePath)}: ${importError.message}`);
    return false;
  }
}

/** Entry point: import CLI-arg paths, or every JSON in the content dir. */
async function main() {
  try {
    const args = process.argv.slice(2);
    let files = [];
    if (args.length > 0) {
      files = args.map((arg) =>
        path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg),
      );
    } else {
      const names = await readdir(contentDir);
      files = names
        .filter((name) => name.endsWith(".json"))
        .map((name) => path.join(contentDir, name));
    }

    if (files.length === 0) {
      console.log("No content files found.");
      return;
    }

    let failures = 0;
    for (const filePath of files) {
      const succeeded = await importFile(filePath);
      if (!succeeded) {
        failures += 1;
      }
    }

    console.log(
      `Done: ${files.length - failures}/${files.length} imported${DRY_RUN ? " (dry run)" : ""}.`,
    );
    if (failures > 0) {
      process.exit(1);
    }
  } catch (mainError) {
    console.error(mainError.message);
    process.exit(1);
  }
}

main();
