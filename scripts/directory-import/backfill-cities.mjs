#!/usr/bin/env node
// Looks up the city for agencies whose source profile recorded only a
// country, and prints claim-overlay records to paste into
// lib/directory/data/claims.json.
//
// WHY IT PRINTS RATHER THAN WRITES
//
// Every other script in this directory owns its output file and
// overwrites it wholesale. This one does not: claims.json is hand-edited,
// holds records this script knows nothing about (budgets from campaign
// replies, category corrections), and is the durable half of the claim
// store. A script that rewrote it would delete all of that on its first
// run.
//
// It is also the only importer whose output is a GUESS. A city scraped
// out of a footer is right most of the time and confidently wrong the
// rest - a studio's "London / New York" footer, an address that belongs
// to a holding company, a schema.org block left over from a template. So
// the run prints what it found, with the evidence it found it in, and a
// person decides. Twenty-two records is an afternoon, not a pipeline.
//
// WHERE IT LOOKS, IN ORDER
//
//   1. schema.org PostalAddress in JSON-LD - the only machine-readable
//      answer on the page, and the one a site publishes deliberately.
//   2. <meta> geo tags and OpenGraph locality.
//   3. The footer's visible text, matched against the cities of the
//      country the source already recorded. Constrained that way because
//      an unconstrained city match against arbitrary footer text finds
//      client names, award names and street names.
//
// USAGE
//
//   node scripts/directory-import/backfill-cities.mjs
//   node scripts/directory-import/backfill-cities.mjs --slug lusion
//   node scripts/directory-import/backfill-cities.mjs --json   # paste-ready

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const DATA_DIR = path.join(REPO_ROOT, "lib", "directory", "data");

const SOURCE_FILES = [
  "agencies.json",
  "seo-agencies.json",
  "branding-agencies.json",
  "motion-design-agencies.json",
];

const TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 768 * 1024;
const CONCURRENCY = 4;
const USER_AGENT =
  "Mozilla/5.0 (compatible; SuperflowDirectoryBot/1.0; +https://usesuperflow.ai/directory)";

/**
 * Cities checked against a footer, by country.
 *
 * Deliberately a short list of the places these agencies are actually
 * based rather than a gazetteer. The footer match is a substring scan, so
 * every extra entry is another chance to match a client name or a street:
 * "Bath" and "Reading" are real English cities and terrible things to
 * scan prose for, and neither is in here.
 */
const CITIES_BY_COUNTRY = {
  "United Kingdom": ["London", "Manchester", "Bristol", "Leeds", "Glasgow", "Edinburgh", "Brighton", "Birmingham", "Cardiff", "Belfast", "Nottingham", "Sheffield", "Liverpool"],
  "United States": ["New York", "Brooklyn", "Los Angeles", "San Francisco", "Chicago", "Austin", "Seattle", "Portland", "Boston", "Denver", "Atlanta", "Miami", "Minneapolis", "Philadelphia", "San Diego", "Nashville", "Detroit", "Dallas", "Houston"],
  Netherlands: ["Amsterdam", "Rotterdam", "Utrecht", "Eindhoven", "The Hague", "Den Haag"],
  Germany: ["Berlin", "Hamburg", "Munich", "München", "Cologne", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
  France: ["Paris", "Lyon", "Marseille", "Bordeaux", "Nantes", "Lille", "Toulouse", "Montpellier"],
  Italy: ["Milan", "Milano", "Rome", "Roma", "Turin", "Torino", "Florence", "Firenze", "Bologna", "Treviso", "Venice", "Venezia", "Naples", "Napoli"],
  Spain: ["Madrid", "Barcelona", "Valencia", "Seville", "Sevilla", "Bilbao"],
  Sweden: ["Stockholm", "Gothenburg", "Göteborg", "Malmö"],
  Denmark: ["Copenhagen", "København", "Aarhus"],
  Norway: ["Oslo", "Bergen"],
  Finland: ["Helsinki", "Tampere"],
  Poland: ["Warsaw", "Warszawa", "Kraków", "Krakow", "Wrocław", "Poznań", "Gdańsk"],
  Ukraine: ["Kyiv", "Kiev", "Lviv", "Kharkiv", "Odesa", "Dnipro"],
  Canada: ["Toronto", "Montreal", "Montréal", "Vancouver", "Calgary", "Ottawa", "Quebec"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Fukuoka"],
  Singapore: ["Singapore"],
  Switzerland: ["Zurich", "Zürich", "Geneva", "Genève", "Basel", "Lausanne"],
  Austria: ["Vienna", "Wien", "Graz", "Linz"],
  Belgium: ["Brussels", "Bruxelles", "Antwerp", "Antwerpen", "Ghent", "Gent"],
  Portugal: ["Lisbon", "Lisboa", "Porto", "Braga"],
  Ireland: ["Dublin", "Cork", "Galway"],
  Croatia: ["Zagreb", "Split", "Rijeka", "Osijek"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Brazil: ["São Paulo", "Sao Paulo", "Rio de Janeiro", "Curitiba", "Belo Horizonte"],
  India: ["Mumbai", "Bengaluru", "Bangalore", "Delhi", "New Delhi", "Pune", "Hyderabad", "Chennai"],
  Mexico: ["Mexico City", "Ciudad de México", "Guadalajara", "Monterrey"],
  Argentina: ["Buenos Aires", "Córdoba", "Rosario"],
  Turkey: ["Istanbul", "İstanbul", "Ankara", "Izmir"],
  "Czech Republic": ["Prague", "Praha", "Brno"],
  Romania: ["Bucharest", "București", "Cluj-Napoca", "Cluj", "Timișoara"],
  Serbia: ["Belgrade", "Beograd", "Novi Sad"],
  Hungary: ["Budapest", "Debrecen"],
  Greece: ["Athens", "Thessaloniki"],
  Israel: ["Tel Aviv", "Jerusalem", "Haifa"],
  "South Africa": ["Cape Town", "Johannesburg", "Durban"],
  "South Korea": ["Seoul", "Busan"],
  China: ["Shanghai", "Beijing", "Shenzhen", "Hong Kong", "Guangzhou"],
  Vietnam: ["Ho Chi Minh City", "Hanoi", "Da Nang"],
  Indonesia: ["Jakarta", "Bandung", "Bali", "Denpasar"],
  Colombia: ["Bogotá", "Bogota", "Medellín", "Medellin"],
  Chile: ["Santiago", "Valparaíso"],
  Bulgaria: ["Sofia", "Plovdiv", "Varna"],
  Lithuania: ["Vilnius", "Kaunas"],
  Latvia: ["Riga"],
  Estonia: ["Tallinn", "Tartu"],
  Slovenia: ["Ljubljana", "Maribor"],
  Slovakia: ["Bratislava", "Košice"],
};

/** @param {string} name @returns {string | null} */
function argValue(name) {
  try {
    const args = process.argv.slice(2);
    const exact = args.indexOf(`--${name}`);
    if (exact >= 0 && args[exact + 1] && !args[exact + 1].startsWith("--")) return args[exact + 1];
    const inline = args.find((arg) => arg.startsWith(`--${name}=`));
    return inline ? inline.slice(name.length + 3) : null;
  } catch {
    return null;
  }
}

/** @param {string} url @returns {Promise<string | null>} */
async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.subarray(0, MAX_HTML_BYTES).toString("utf8");
  } catch {
    return null;
  }
}

/** Strips tags so the footer scan reads text rather than markup. */
function toText(html) {
  try {
    return html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ");
  } catch {
    return "";
  }
}

/**
 * Pulls a locality out of any schema.org PostalAddress in the page.
 *
 * @param {string} html - The page HTML.
 * @returns {{ city: string, evidence: string } | null}
 */
function cityFromJsonLd(html) {
  try {
    const blocks = html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    );
    for (const block of blocks) {
      const locality = /"addressLocality"\s*:\s*"([^"]{2,60})"/i.exec(block[1]);
      if (locality) return { city: locality[1].trim(), evidence: "schema.org addressLocality" };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Pulls a locality out of geo/OpenGraph meta tags.
 *
 * @param {string} html - The page HTML.
 * @returns {{ city: string, evidence: string } | null}
 */
function cityFromMeta(html) {
  try {
    for (const name of ["geo.placename", "og:locality", "business:contact_data:locality"]) {
      const pattern = new RegExp(
        `<meta[^>]+(?:name|property)=["']${name.replace(/\./g, "\\.")}["'][^>]*content=["']([^"']{2,60})["']`,
        "i",
      );
      const match = pattern.exec(html);
      if (match) return { city: match[1].trim(), evidence: `<meta ${name}>` };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Scans the page's visible text for a city in the recorded country.
 *
 * Constrained to that country's list on purpose - see CITIES_BY_COUNTRY.
 * Returns the match with its surrounding sentence as evidence, because
 * the whole point of printing rather than writing is that a person reads
 * that sentence before believing the city.
 *
 * @param {string} text - Visible page text.
 * @param {string} country - The country the source recorded.
 * @returns {{ city: string, evidence: string } | null}
 */
function cityFromText(text, country) {
  try {
    const cities = CITIES_BY_COUNTRY[country];
    if (!cities) return null;
    // Later in the document beats earlier: the footer is where an address
    // lives, the hero is where client names do.
    let best = null;
    for (const city of cities) {
      const index = text.toLowerCase().lastIndexOf(city.toLowerCase());
      if (index < 0) continue;
      if (!best || index > best.index) {
        best = { city, index, evidence: text.slice(Math.max(0, index - 60), index + 60).trim() };
      }
    }
    return best ? { city: best.city, evidence: `"...${best.evidence}..."` } : null;
  } catch {
    return null;
  }
}

/** @returns {Promise<Array<object>>} */
async function readAgencies() {
  const bySlug = new Map();
  for (const file of SOURCE_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!existsSync(filePath)) continue;
    for (const record of JSON.parse(await readFile(filePath, "utf8"))) {
      if (!record?.slug || bySlug.has(record.slug)) continue;
      bySlug.set(record.slug, record);
    }
  }
  return [...bySlug.values()];
}

async function mapWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

async function main() {
  const slugFilter = argValue("slug");
  const asJson = process.argv.slice(2).includes("--json");

  let agencies = (await readAgencies()).filter(
    (agency) => agency.location?.country && !agency.location?.city,
  );
  if (slugFilter) agencies = agencies.filter((agency) => agency.slug === slugFilter);

  console.error(`Looking up ${agencies.length} agencies with a country but no city\n`);

  const found = await mapWithConcurrency(agencies, CONCURRENCY, async (agency) => {
    if (!agency.website) return { agency, result: null, reason: "no website on record" };
    const html = await fetchHtml(agency.website);
    if (!html) return { agency, result: null, reason: "site unreachable" };
    const result =
      cityFromJsonLd(html) ??
      cityFromMeta(html) ??
      cityFromText(toText(html), agency.location.country);
    return { agency, result, reason: result ? null : "no city found on the page" };
  });

  const hits = found.filter((entry) => entry.result);
  const misses = found.filter((entry) => !entry.result);

  if (asJson) {
    // Paste-ready overlay records. Read the evidence in the non-JSON run
    // before pasting: these are guesses until a person has agreed.
    console.log(
      JSON.stringify(
        hits.map((entry) => ({
          slug: entry.agency.slug,
          city: entry.result.city,
          sourceNote: `City backfilled from ${entry.agency.website} (${entry.result.evidence.slice(0, 80)}), ${new Date().toISOString().slice(0, 10)}.`,
        })),
        null,
        2,
      ),
    );
  } else {
    for (const entry of hits) {
      console.log(`${entry.agency.slug}  ->  ${entry.result.city}, ${entry.agency.location.country}`);
      console.log(`    via ${entry.result.evidence}`);
      console.log(`    ${entry.agency.website}\n`);
    }
  }

  console.error(`\n${hits.length} found, ${misses.length} not found.`);
  for (const entry of misses) {
    console.error(`  ${entry.agency.slug}: ${entry.reason}`);
  }
  console.error(
    "\nRead the evidence, then add the ones you believe to lib/directory/data/claims.json.",
  );
}

main().catch((error) => {
  console.error("backfill-cities failed:", error);
  process.exit(1);
});
