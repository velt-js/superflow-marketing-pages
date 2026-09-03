#!/usr/bin/env node
/**
 * Validate the /solutions seed content (content/solutions/*.json) against the
 * template rules and the copy rules from the solutions spec.
 *
 *   node scripts/solutions-import/validate.mjs            # every file
 *   node scripts/solutions-import/validate.mjs site-care  # one slug
 *
 * Exits 1 on any error. Warnings print but do not fail.
 *
 * Shape rules mirror sanity/schemas/solutionPage.ts and lib/solutions/types.ts.
 * Copy rules (spec section 0): no em/en dashes, no exclamation points, no
 * emoji, no marketing words, no "verification", no "website monitoring", no
 * row-to-agent language, no reused phrases, no TODO markers left behind.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(scriptDir, "../../content/solutions");

const CATEGORIES = new Set([
  "launch-readiness",
  "links",
  "copy",
  "brand",
  "seo-social",
  "accessibility",
  "layout-devices",
  "compliance",
]);
const KINDS = new Set(["agency", "job"]);
const PROOFS = new Set(["wonderist-review", "headway", "harvey", "metrics-only"]);
const PLATFORM_IDS = new Set([
  "drupal",
  "framer",
  "hubspot",
  "shopify",
  "bubble",
  "webflow",
  "wix",
  "wordpress",
  "elementor",
  "google-tag-manager",
  "squarespace",
  "html5",
]);

const PACK_AGENT_COUNT = 8;
const HUMAN_BULLET_COUNT = 4;
const PAGE_FAQ_COUNT = 3;
const RELATED_COUNT = 2;
const NAV_DESCRIPTOR_MAX = 59;
const H1_MAX_WORDS = 8;
const FINDING_MAX_LINES = 2;
const FINDING_MAX_CHARS = 160;

/** Phrases that must never appear in new copy (case-insensitive). */
const BANNED_PHRASES = [
  "one per row",
  "per row",
  "one per line",
  "the checklist you already run",
  "the setup is a file you already own",
  "website monitoring",
  "seamless",
  "seamlessly",
  "revolutionary",
  "supercharge",
  "unlock",
  "game-changing",
  "verification",
  "verify",
  "verified",
];

/**
 * Matches emoji and pictographs. Copyright, registered and trademark signs
 * are legitimate in findings ("Footer says © 2024.") and are excluded.
 */
const EMOJI_PATTERN = /(?![©®™])\p{Extended_Pictographic}/u;

/**
 * Collect every string leaf with its JSON path.
 * @param {unknown} value
 * @param {string} at
 * @param {Array<{path: string, text: string}>} out
 */
function collectStrings(value, at, out) {
  if (typeof value === "string") {
    out.push({ path: at, text: value });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${at}[${index}]`, out));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      collectStrings(item, at ? `${at}.${key}` : key, out);
    }
  }
  return out;
}

/**
 * Validate one page document.
 * @param {Record<string, any>} page
 * @param {string} fileName
 * @returns {{errors: string[], warnings: string[]}}
 */
function validatePage(page, fileName) {
  const errors = [];
  const warnings = [];
  const expectedSlug = path.basename(fileName, ".json");

  if (page.slug !== expectedSlug) {
    errors.push(`slug "${page.slug}" must match file name "${expectedSlug}"`);
  }
  if (!KINDS.has(page.kind)) {
    errors.push(`kind must be "agency" or "job", got "${page.kind}"`);
  }
  if (!page.navLabel) {
    errors.push("navLabel missing");
  }
  if (!page.navDescriptor) {
    errors.push("navDescriptor missing");
  } else if (page.navDescriptor.length > NAV_DESCRIPTOR_MAX) {
    errors.push(`navDescriptor is ${page.navDescriptor.length} chars; must be under 60`);
  }
  if (!page.seo?.title || !page.seo?.description) {
    errors.push("seo.title and seo.description are required");
  }
  if (!page.hero?.h1) {
    errors.push("hero.h1 missing");
  } else {
    const words = page.hero.h1.trim().split(/\s+/).filter(Boolean).length;
    if (words > H1_MAX_WORDS) {
      warnings.push(`hero.h1 is ${words} words (spec asks for 8 max)`);
    }
  }
  if (!page.hero?.sub) {
    errors.push("hero.sub missing");
  }
  if (!page.hero?.clientLine) {
    errors.push("hero.clientLine missing");
  }
  if (!page.pack?.name || !page.pack?.slug || !page.pack?.intro) {
    errors.push("pack.name, pack.slug and pack.intro are required");
  }
  if (page.pack?.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.pack.slug)) {
    errors.push(`pack.slug "${page.pack.slug}" must be kebab-case`);
  }
  const agents = Array.isArray(page.pack?.agents) ? page.pack.agents : [];
  if (agents.length !== PACK_AGENT_COUNT) {
    errors.push(`pack.agents must have exactly ${PACK_AGENT_COUNT} entries, got ${agents.length}`);
  }
  const names = new Set();
  agents.forEach((agent, index) => {
    const at = `pack.agents[${index}]`;
    if (!agent?.name) {
      errors.push(`${at}.name missing`);
    } else if (names.has(agent.name)) {
      errors.push(`${at}.name "${agent.name}" is duplicated`);
    } else {
      names.add(agent.name);
    }
    if (!agent?.checks) {
      errors.push(`${at}.checks missing`);
    }
    if (!agent?.finding) {
      errors.push(`${at}.finding missing (every card carries a finding)`);
    } else {
      if (agent.finding.split("\n").length > FINDING_MAX_LINES) {
        errors.push(`${at}.finding exceeds two lines`);
      }
      if (agent.finding.length > FINDING_MAX_CHARS) {
        warnings.push(`${at}.finding is ${agent.finding.length} chars; keep findings short`);
      }
    }
    if (!CATEGORIES.has(agent?.category)) {
      errors.push(`${at}.category "${agent?.category}" is not a known category`);
    }
  });
  const byo = page.pack?.buildYourOwn;
  if (!byo?.input || !byo?.agentName || !byo?.finding) {
    errors.push("pack.buildYourOwn needs input, agentName and finding");
  }
  for (const column of ["agentsCheck", "youDecide"]) {
    const bullets = page.human?.[column];
    if (!Array.isArray(bullets) || bullets.length !== HUMAN_BULLET_COUNT) {
      errors.push(`human.${column} must have exactly ${HUMAN_BULLET_COUNT} bullets`);
    }
  }
  if (page.resell) {
    if (!page.resell.heading || !Array.isArray(page.resell.lines) || page.resell.lines.length === 0) {
      errors.push("resell needs a heading and at least one line");
    }
    const dollars = (page.resell.lines ?? []).filter((line) => /\$\s?\d/.test(line));
    if (dollars.length > 0) {
      errors.push("resell lines must not carry dollar figures");
    }
  }
  if (!Array.isArray(page.platformsFirst)) {
    errors.push("platformsFirst must be an array");
  } else {
    for (const id of page.platformsFirst) {
      if (!PLATFORM_IDS.has(id)) {
        errors.push(`platformsFirst id "${id}" is not a platform in GetStarted.tsx`);
      }
    }
  }
  if (!PROOFS.has(page.proof)) {
    errors.push(`proof "${page.proof}" is not a known proof option`);
  }
  if (page.kind === "agency" && page.proof !== "wonderist-review") {
    errors.push("agency pages must use the wonderist-review proof");
  }
  if (page.kind === "job" && page.proof === "wonderist-review") {
    errors.push("job pages must not use the Wonderist proof");
  }
  if (page.cost !== undefined) {
    if (!Array.isArray(page.cost) || page.cost.length > 3) {
      errors.push("cost must be an array of at most three lines");
    }
    for (const line of page.cost ?? []) {
      if (/\$\s?\d|\d+\s+credits?/.test(line)) {
        errors.push(`cost line types a price or credit count; use tokens instead: "${line}"`);
      }
    }
  }
  const faq = Array.isArray(page.faq) ? page.faq : [];
  if (faq.length !== PAGE_FAQ_COUNT) {
    errors.push(`faq must have exactly ${PAGE_FAQ_COUNT} page-specific items, got ${faq.length}`);
  }
  faq.forEach((item, index) => {
    if (!item?.q || !item?.a) {
      errors.push(`faq[${index}] needs q and a`);
    }
  });
  const related = Array.isArray(page.related) ? page.related : [];
  if (related.length !== RELATED_COUNT) {
    errors.push(`related must list exactly ${RELATED_COUNT} slugs`);
  }
  if (related.includes(page.slug)) {
    errors.push("related must not include the page itself");
  }

  // Copy rules over every string in the document.
  for (const { path: at, text } of collectStrings(page, "", [])) {
    if (/TODO/.test(text)) {
      errors.push(`${at}: TODO left in copy`);
    }
    if (/[—–]/.test(text)) {
      errors.push(`${at}: em dash or en dash`);
    }
    if (/!/.test(text)) {
      errors.push(`${at}: exclamation point`);
    }
    if (EMOJI_PATTERN.test(text)) {
      errors.push(`${at}: emoji`);
    }
    const lower = text.toLowerCase();
    for (const phrase of BANNED_PHRASES) {
      if (lower.includes(phrase)) {
        errors.push(`${at}: banned phrase "${phrase}"`);
      }
    }
    // Row-to-agent language of any kind.
    if (/\b(row|line)s?\b[^.]*\b(agent)s?\b|\bagents?\b[^.]*\b(per|each|every) (row|line)\b/i.test(text)) {
      errors.push(`${at}: describes how a checklist maps to agents`);
    }
  }

  return { errors, warnings };
}

async function main() {
  const wanted = new Set(process.argv.slice(2).map((arg) => arg.replace(/\.json$/, "")));
  const files = (await readdir(contentDir))
    .filter((name) => name.endsWith(".json"))
    .filter((name) => wanted.size === 0 || wanted.has(name.replace(/\.json$/, "")))
    .sort();

  if (files.length === 0) {
    console.error("No content files found.");
    process.exit(1);
  }

  let failed = false;
  const slugs = new Set();
  const pages = [];
  for (const file of files) {
    const raw = await readFile(path.join(contentDir, file), "utf8");
    let page;
    try {
      page = JSON.parse(raw);
    } catch (error) {
      console.error(`✖ ${file}: invalid JSON (${error.message})`);
      failed = true;
      continue;
    }
    pages.push({ file, page });
    slugs.add(page.slug);
  }

  for (const { file, page } of pages) {
    const { errors, warnings } = validatePage(page, file);
    if (wanted.size === 0) {
      for (const slug of page.related ?? []) {
        if (!slugs.has(slug)) {
          warnings.push(`related slug "${slug}" has no seed file yet (batch 2?)`);
        }
      }
    }
    for (const warning of warnings) {
      console.warn(`⚠ ${file}: ${warning}`);
    }
    if (errors.length > 0) {
      failed = true;
      for (const error of errors) {
        console.error(`✖ ${file}: ${error}`);
      }
    } else {
      console.log(`✔ ${file}`);
    }
  }

  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
