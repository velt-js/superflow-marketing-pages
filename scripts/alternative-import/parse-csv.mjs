#!/usr/bin/env node
/**
 * Parse Framer's `Alternative.csv` export into raw JSON.
 *
 * Input:  /Users/yoenzhang/Downloads/Alternative.csv (~11 rows, 267 cols).
 * Output: scripts/alternative-import/framer-alt-raw.json (array of objects).
 *
 * No transformation here — we keep Framer's column names verbatim so the
 * transform step is auditable.
 *
 * Usage: node scripts/alternative-import/parse-csv.mjs [<csv-path>]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const CSV_PATH =
  process.argv[2] || "/Users/yoenzhang/Downloads/Alternative.csv";
const text = readFileSync(CSV_PATH, "utf8");

// RFC4180-ish parser: handles quoted fields with embedded commas, newlines,
// and escaped quotes ("").
function parseCsv(src) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(cell);
        cell = "";
      } else if (c === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (c === "\r") {
        // ignore
      } else {
        cell += c;
      }
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(text);
const header = rows.shift();
const records = rows
  .filter((r) => r.some((v) => v && v.trim()))
  .map((r) => {
    const obj = {};
    header.forEach((key, i) => {
      obj[key] = r[i] ?? "";
    });
    return obj;
  });

writeFileSync(here("framer-alt-raw.json"), JSON.stringify(records, null, 2));
console.log(`Parsed ${records.length} records → framer-alt-raw.json`);
