#!/usr/bin/env node
/**
 * Check the replacement copy in values.json before it is written anywhere.
 *
 * Each route composes its <title> and meta description differently - some
 * append " | Superflow", some pass the CMS value through verbatim, and the H1
 * comes from a different field again. So this does not measure the raw field
 * values; it reproduces what each route would render from the patched
 * document, merged over what Sanity holds today, and measures that.
 *
 * Bands are the ones the on-page report itself applies:
 *   title 30-60, meta description 100-160, H1 <= 70.
 *
 * Usage: node scripts/seo-on-page-fixes/validate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const values = JSON.parse(fs.readFileSync(path.join(HERE, "values.json"), "utf8"));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const SUFFIX_RE = /\s*[—|]\s*Superflow\s*$/i;
/** What buildPageMetadata() renders into <title> for a given input title. */
const withBrand = (title) => (SUFFIX_RE.test(title) ? title : `${title} | Superflow`);

/**
 * How each document type's route turns a document into a rendered title,
 * description and H1. Mirrors the generateMetadata/JSX in app/.
 */
const ROUTES = {
  blogPost: {
    // app/blog/[slug]/page.tsx sets metadata.title = { absolute: rawTitle }.
    title: (d) => d.metaTitle || `${d.title} | Superflow Blog`,
    description: (d) => d.metaDescription || d.description || "",
    h1: (d) => d.title,
  },
  bugBookEntry: {
    // noBrandSuffix: true, so the value is used verbatim.
    title: (d) => d.metaTitle ?? `${d.headline} - The Superflow Bug Book`,
    description: (d) => d.metaDescription ?? d.hook ?? d.headline,
    h1: (d) => d.headline,
  },
  comparisonPreviewVsPage: {
    title: (d) => withBrand(d.metaTitle ?? d.title),
    description: (d) => d.metaDescription ?? "",
    h1: (d) => d.headline ?? d.title,
  },
  comparisonPreviewArbiterPage: {
    title: (d) => withBrand(d.metaTitle ?? d.title),
    description: (d) => d.metaDescription ?? "",
    h1: (d) => d.headline ?? d.title,
  },
  comparisonPreviewAlternativesPage: {
    title: (d) => withBrand(d.metaTitle ?? d.title),
    description: (d) => d.metaDescription ?? "",
    h1: (d) => d.headline ?? d.title,
  },
  comparisonPage: {
    title: (d) => withBrand(d.metaTitle ?? d.title ?? "Comparison"),
    description: (d) => d.metaDescription ?? d.description ?? "",
    h1: (d) => d.title,
  },
  alternativePage: {
    title: (d) => withBrand(d.metaTitle ?? d.title),
    description: (d) => d.metaDescription ?? d.description ?? "",
    h1: (d) => d.title,
  },
  userPersonaPage: {
    title: (d) => withBrand(d.metaTitle ?? d.title),
    description: (d) => d.metaDescription ?? d.hero?.description ?? "",
    h1: (d) => d.title,
  },
  useCasePage: {
    title: (d) => withBrand(d.metaTitle || d.title),
    description: (d) => d.metaDescription || d.description || "",
    h1: (d) => d.title,
  },
  caseStudyPage: {
    title: (d) => withBrand(d.metaTitle || d.title || ""),
    description: (d) => d.metaDescription || d.description || "",
    h1: (d) => d.title,
  },
  checklistPage: {
    title: (d) => withBrand(d.metaTitle || d.title),
    description: (d) => d.metaDescription || d.description || "",
    h1: (d) => d.title,
  },
};

/**
 * Titles the routes hard-code per slug, ahead of any CMS value. Mirrored from
 * the inline maps in app/blog/[slug], app/user-persona/[slug] and
 * app/comparisons/[slug]. Held here so validation measures what the page
 * really renders, and so a metaTitle patch that could never take effect is
 * reported rather than silently counted as a fix.
 */
const CODE_TITLE_OVERRIDES = {
  blogPost: {
    "top-13-asana-alternatives-for-project-management-in-startups-and-agencies":
      "13 Asana Alternatives for Agencies | Superflow Blog",
  },
  userPersonaPage: {
    "product-managers": "Website QA for Product Managers",
    founders: "Website QA for Founders",
    designers: "Website Feedback for Designers",
  },
  comparisonPreviewVsPage: {
    "superflow-vs-userback": "Superflow vs Userback: Website QA Compared",
    "superflow-vs-spur": "Superflow vs Spur: Website QA Compared",
    "superflow-vs-ruttl": "Superflow vs Ruttl: Website Reviews Compared",
    "superflow-vs-pastel": "Superflow vs Pastel: Website Reviews Compared",
    "superflow-vs-markup": "Superflow vs MarkUp: Website Reviews Compared",
    "superflow-vs-filestage": "Superflow vs Filestage: Review Tools Compared",
  },
};

/** The title a route renders, hard-coded override included. */
function renderTitle(doc, route) {
  const pinned = CODE_TITLE_OVERRIDES[doc._type]?.[doc.slug?.current];
  // The blog route bypasses the brand template for its pinned titles; every
  // other route runs them through buildPageMetadata like any other value.
  if (pinned) return doc._type === "blogPost" ? pinned : withBrand(pinned);
  return route.title(doc);
}

const BANDS = { title: [30, 60], description: [100, 160], h1: [0, 70] };
const NEEDS = {
  "title_tag.too_long": "title", "title_tag.too_short": "title",
  "meta_description.too_long": "description", "meta_description.too_short": "description",
  "h1.too_long": "h1",
};

const ids = Object.keys(values);
const docs = await client.fetch(`*[_id in $ids]`, { ids });
const byId = Object.fromEntries(docs.map((d) => [d._id, d]));

const problems = [];
const report = [];
for (const [id, entry] of Object.entries(values)) {
  const current = byId[id];
  if (!current) { problems.push(`${id}: no such document`); continue; }
  const route = ROUTES[current._type];
  if (!route) { problems.push(`${id}: no route model for ${current._type}`); continue; }

  const patched = { ...current, ...entry.set };
  for (const field of Object.keys(entry.set)) {
    if (!(field in current) && !["metaTitle", "metaDescription"].includes(field)) {
      problems.push(`${id}: sets "${field}", which the document does not have`);
    }
  }

  for (const fix of entry.fixes) {
    const surface = NEEDS[fix];
    const rendered = (surface === "title" ? renderTitle(patched, route) : route[surface](patched)) ?? "";
    const len = rendered.length;
    const [lo, hi] = BANDS[surface];
    const overridden =
      surface === "title" &&
      CODE_TITLE_OVERRIDES[current._type]?.[current.slug?.current] !== undefined;
    const ok = len >= lo && len <= hi;
    report.push(
      `${ok ? "ok  " : "FAIL"} ${String(len).padStart(3)} ${surface.padEnd(11)} ${entry.path}`,
    );
    if (!ok) problems.push(`${entry.path} ${surface} is ${len}, band is ${lo}-${hi}: ${rendered}`);
    if (overridden) problems.push(`${entry.path}: title is hard-coded in the route, patch cannot take effect`);
    if (/\s{2,}|^\s|\s$/.test(rendered)) problems.push(`${entry.path} ${surface}: stray whitespace`);
    if (/—/.test(rendered)) problems.push(`${entry.path} ${surface}: em dash (site style bans them)`);
  }
}

// A patched field often feeds more than the surface it was written for -
// blogPost.title is the H1 AND the fallback <title>, for instance. So check
// every surface of every patched document, not just the flagged ones, and
// fail on any surface this patch pushes OUT of band that was inside it before.
let collateral = 0;
for (const [id, entry] of Object.entries(values)) {
  const current = byId[id];
  const route = ROUTES[current?._type];
  if (!current || !route) continue;
  const patched = { ...current, ...entry.set };
  const flagged = new Set(entry.fixes.map((f) => NEEDS[f]));
  for (const surface of ["title", "description", "h1"]) {
    if (flagged.has(surface)) continue;
    const [lo, hi] = BANDS[surface];
    const render = (d) => (surface === "title" ? renderTitle(d, route) : route[surface](d)) ?? "";
    const before = render(current).length;
    const after = render(patched).length;
    if (before === after) continue;
    collateral += 1;
    const wasOk = before >= lo && before <= hi;
    const nowOk = after >= lo && after <= hi;
    console.log(`     ${surface} ${before} -> ${after} (collateral) ${entry.path}`);
    if (wasOk && !nowOk) {
      problems.push(`${entry.path} ${surface}: patch pushes it out of band, ${before} -> ${after}`);
    }
  }
}

console.log(report.sort().join("\n"));
console.log(`\n${report.length} findings checked across ${ids.length} documents`);
console.log(`${collateral} surface(s) changed as a side effect, none pushed out of band.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log("All proposed values land inside the report's own bands.");
