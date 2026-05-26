#!/usr/bin/env node
/**
 * Transform Framer Use Case CSV → Sanity useCasePage-shaped JSON.
 *
 * Input:  scripts/use-case-import/use-case-raw.csv
 * Output: scripts/use-case-import/use-case-sanity.json
 *
 * Per row we:
 *   - Map flat CSV columns to `useCasePage` fields.
 *   - Collapse repeating slots into named-sub-type arrays:
 *       problem__one/two/three__title|image → problemSection.items[]
 *       solution__one/two/three__title|sub_copy|image → solutionSection.items[]
 *       testimonial__1/2/3__name|role|company|title|sub_copy|image → testimonials[]
 *       FAQ__1/2/3__question|answer → faq[]
 *   - Capture every framerusercontent.com URL as a `framerXUrl` marker. The
 *     importer downloads + uploads + rewrites all of them to Sanity asset
 *     refs so no framer URL survives in the published doc.
 *
 * No HTML in this CSV — the use-case fields are plain text only.
 *
 * Usage:
 *   node scripts/use-case-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const csvText = readFileSync(here("use-case-raw.csv"), "utf8");

// ---- CSV parser (same as integrations) ------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += c;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const allRows = parseCsv(csvText).filter((r) => r.some((v) => v && v.length));
const [header, ...dataRows] = allRows;
const colIndex = Object.fromEntries(header.map((h, i) => [h, i]));

function col(row, name) {
  const i = colIndex[name];
  return i === undefined ? undefined : row[i];
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function clean(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function parseBool(value) {
  if (typeof value !== "string") return undefined;
  const v = value.trim().toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function parseNum(value) {
  if (typeof value !== "string") return undefined;
  const n = Number(value.trim());
  return Number.isFinite(n) ? n : undefined;
}

const ORDINALS = ["one", "two", "three"];

function buildProblemItems(row) {
  const items = [];
  for (const ord of ORDINALS) {
    const title = clean(col(row, `problem__${ord}__title`));
    const image = clean(col(row, `problem__${ord}__image`));
    const alt = clean(col(row, `problem__${ord}__image:alt`));
    if (!title && !image) continue;
    items.push({
      _type: "useCaseProblemItem",
      _key: key(),
      ...(title ? { title } : {}),
      framerImageUrl: image,
      framerImageAlt: alt,
    });
  }
  return items;
}

function buildSolutionItems(row) {
  const items = [];
  for (const ord of ORDINALS) {
    const title = clean(col(row, `solution__${ord}__title`));
    const subCopy = clean(col(row, `solution__${ord}__sub_copy`));
    const image = clean(col(row, `solution__${ord}__image`));
    const alt = clean(col(row, `solution__${ord}__image:alt`));
    if (!title && !subCopy && !image) continue;
    items.push({
      _type: "useCaseSolutionItem",
      _key: key(),
      ...(title ? { title } : {}),
      ...(subCopy ? { subCopy } : {}),
      framerImageUrl: image,
      framerImageAlt: alt,
    });
  }
  return items;
}

function buildTestimonials(row) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    const name = clean(col(row, `testimonial__${i}__name`));
    const role = clean(col(row, `testimonial__${i}__role`));
    const company = clean(col(row, `testimonial__${i}__company`));
    const title = clean(col(row, `testimonial__${i}__title`));
    const subCopy = clean(col(row, `testimonial__${i}__sub_copy`));
    const image = clean(col(row, `testimonial__${i}__image`));
    const alt = clean(col(row, `testimonial__${i}__image:alt`));
    if (!name && !title && !subCopy && !image) continue;
    items.push({
      _type: "useCaseTestimonial",
      _key: key(),
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
      ...(company ? { company } : {}),
      ...(title ? { title } : {}),
      ...(subCopy ? { subCopy } : {}),
      framerImageUrl: image,
      framerImageAlt: alt,
    });
  }
  return items;
}

function buildFaq(row) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    const q = clean(col(row, `FAQ__${i}__question`));
    const a = clean(col(row, `FAQ__${i}__answer`));
    if (!q && !a) continue;
    items.push({
      _type: "useCaseFaqItem",
      _key: key(),
      question: q || "",
      ...(a ? { answer: a } : {}),
    });
  }
  return items;
}

const useCases = [];

for (const row of dataRows) {
  const slug = clean(col(row, "Slug"));
  if (!slug) continue;

  const title = clean(col(row, "Title")) || slug;
  const description = clean(col(row, "Description"));
  const metaTitle = clean(col(row, "Meta Title"));
  const metaDescription = clean(col(row, "Meta Description"));
  const noIndex = clean(col(row, "NoIndex"));
  const hidden = parseBool(col(row, "Hidden"));

  const thumbnailUrl = clean(col(row, "Thumbnail"));
  const thumbnailAlt = clean(col(row, "Thumbnail:alt"));
  const iconUrl = clean(col(row, "Icon"));
  const iconAlt = clean(col(row, "Icon:alt"));

  const hero = {
    action: clean(col(row, "Action")),
    useCase: clean(col(row, "Use Case")),
    heroCtaText: clean(col(row, "Hero CTA Text")),
    role1: clean(col(row, "Role 1")),
    role2: clean(col(row, "Role 2")),
    role3: clean(col(row, "Role 3")),
    personaDesktopFont: parseNum(col(row, "Persona Desktop Font")),
    personaMobileFont: parseNum(col(row, "Persona Mobile Font")),
  };

  const explanationTitle = clean(col(row, "Explanation Title"));

  const problemItems = buildProblemItems(row);
  const problemSection = problemItems.length
    ? {
        _type: "useCaseProblemSection",
        title1: clean(col(row, "problem__title__1")),
        title2: clean(col(row, "problem__title__2")),
        items: problemItems,
      }
    : undefined;

  const solutionItems = buildSolutionItems(row);
  const solutionSection = solutionItems.length
    ? {
        _type: "useCaseSolutionSection",
        title1: clean(col(row, "solution_title_1")),
        title2: clean(col(row, "solution_title_2")),
        items: solutionItems,
      }
    : undefined;

  const featureText1 = clean(col(row, "feature_text_1"));
  const featureText2 = clean(col(row, "feature_text_2"));

  const testimonials = buildTestimonials(row);
  const faq = buildFaq(row);
  // Header has leading space in source CSV: " Footer CTA Title"
  const footerCtaTitle =
    clean(col(row, " Footer CTA Title")) || clean(col(row, "Footer CTA Title"));

  useCases.push({
    _id: `use-case-${slug}`,
    _type: "useCasePage",
    title,
    slug: { _type: "slug", current: slug },
    ...(description ? { description } : {}),
    ...(typeof hidden === "boolean" ? { hidden } : {}),
    ...(hero.action ||
    hero.useCase ||
    hero.heroCtaText ||
    hero.role1 ||
    hero.role2 ||
    hero.role3 ||
    hero.personaDesktopFont !== undefined ||
    hero.personaMobileFont !== undefined
      ? {
          hero: {
            _type: "useCaseHero",
            ...Object.fromEntries(
              Object.entries(hero).filter(([, v]) => v !== undefined),
            ),
          },
        }
      : {}),
    ...(explanationTitle ? { explanationTitle } : {}),
    ...(problemSection ? { problemSection } : {}),
    ...(solutionSection ? { solutionSection } : {}),
    ...(featureText1 ? { featureText1 } : {}),
    ...(featureText2 ? { featureText2 } : {}),
    ...(testimonials.length ? { testimonials } : {}),
    ...(footerCtaTitle ? { footerCtaTitle } : {}),
    ...(faq.length ? { faq } : {}),
    ...(metaTitle ? { metaTitle } : {}),
    ...(metaDescription ? { metaDescription } : {}),
    ...(noIndex ? { noIndex } : {}),
    // markers (resolved by importer)
    framerThumbnailUrl: thumbnailUrl,
    framerThumbnailAlt: thumbnailAlt,
    framerIconUrl: iconUrl,
    framerIconAlt: iconAlt,
  });
}

writeFileSync(
  here("use-case-sanity.json"),
  JSON.stringify({ useCases }, null, 2),
);
console.log(`Wrote ${useCases.length} useCasePage docs`);
