#!/usr/bin/env node
/**
 * Transform Framer Case Study CSV → Sanity caseStudyPage-shaped JSON.
 *
 * Input:  scripts/case-study-import/case-study-raw.csv
 * Output: scripts/case-study-import/case-study-sanity.json
 *
 * Per row we:
 *   - Map flat CSV columns to `caseStudyPage` fields, collapsing the
 *     repeating slots:
 *       hero__industry/teams/team_size            → hero
 *       overview__description/problem/solution    → overview
 *       problem__description + problem__1..3      → problemSection
 *       solution__description + solution__1..3    → solutionSection
 *       results__description + results__1..3      → resultsSection
 *       testimonial__name/role/company/title/...  → testimonial
 *       FAQ__1..6__question/answer                → faq[]
 *   - Capture every framerusercontent.com URL as a framerXUrl marker so
 *     the importer can download + upload + rewrite to Sanity asset refs.
 *
 * No HTML in this CSV — pure text fields.
 *
 * Usage:
 *   node scripts/case-study-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const csvText = readFileSync(here("case-study-raw.csv"), "utf8");

// ---- CSV parser -----------------------------------------------------------

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

function buildProblemItems(row) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    const image = clean(col(row, `problem__${i}__image`));
    const alt = clean(col(row, `problem__${i}__image:alt`));
    const text = clean(col(row, `problem__${i}__text`));
    if (!image && !text) continue;
    items.push({
      _type: "caseStudyProblemItem",
      _key: key(),
      ...(text ? { text } : {}),
      framerImageUrl: image,
      framerImageAlt: alt,
    });
  }
  return items;
}

function buildSolutionItems(row) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    const tag = clean(col(row, `solution__${i}__tag`));
    const title = clean(col(row, `solution__${i}__title`));
    const subText = clean(col(row, `solution__${i}__sub_text`));
    const video = clean(col(row, `solution__${i}__video`));
    if (!tag && !title && !subText && !video) continue;
    items.push({
      _type: "caseStudySolutionItem",
      _key: key(),
      ...(tag ? { tag } : {}),
      ...(title ? { title } : {}),
      ...(subText ? { subText } : {}),
      framerVideoUrl: video,
    });
  }
  return items;
}

function buildResultItems(row) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    const value = clean(col(row, `results__${i}__value`));
    const text = clean(col(row, `results__${i}__text`));
    if (!value && !text) continue;
    items.push({
      _type: "caseStudyResultItem",
      _key: key(),
      ...(value ? { value } : {}),
      ...(text ? { text } : {}),
    });
  }
  return items;
}

function buildFaq(row) {
  const items = [];
  for (let i = 1; i <= 6; i++) {
    const q = clean(col(row, `FAQ__${i}__question`));
    const a = clean(col(row, `FAQ__${i}__answer`));
    if (!q && !a) continue;
    items.push({
      _type: "caseStudyFaqItem",
      _key: key(),
      question: q || "",
      ...(a ? { answer: a } : {}),
    });
  }
  return items;
}

const caseStudies = [];

for (const row of dataRows) {
  const slug = clean(col(row, "Slug"));
  if (!slug) continue;

  const title = clean(col(row, "Title")) || slug;
  const description = clean(col(row, "Description"));
  const metaTitle = clean(col(row, "Meta Title"));
  const metaDescription = clean(col(row, "Meta Description"));
  const author = clean(col(row, "Author"));
  const publishedDateText = clean(col(row, "Published Date Text"));

  const thumbnailUrl = clean(col(row, "Thumbnail"));
  const thumbnailAlt = clean(col(row, "Thumbnail:alt"));
  const logoUrl = clean(col(row, "Logo"));
  const logoAlt = clean(col(row, "Logo:alt"));

  const hero = {
    industry: clean(col(row, "hero__industry")),
    teams: clean(col(row, "hero__teams")),
    teamSize: clean(col(row, "hero__team_size")),
  };

  const overview = {
    description: clean(col(row, "overview__description")),
    problem: clean(col(row, "overview__problem")),
    solution: clean(col(row, "overview__solution")),
  };

  const problemItems = buildProblemItems(row);
  const problemSection =
    problemItems.length || clean(col(row, "problem__description"))
      ? {
          _type: "caseStudyProblemSection",
          description: clean(col(row, "problem__description")),
          items: problemItems,
        }
      : undefined;

  const solutionItems = buildSolutionItems(row);
  const solutionSection =
    solutionItems.length || clean(col(row, "solution__description"))
      ? {
          _type: "caseStudySolutionSection",
          description: clean(col(row, "solution__description")),
          items: solutionItems,
        }
      : undefined;

  const resultItems = buildResultItems(row);
  const resultsSection =
    resultItems.length || clean(col(row, "results__description"))
      ? {
          _type: "caseStudyResultsSection",
          description: clean(col(row, "results__description")),
          items: resultItems,
        }
      : undefined;

  const testimonialName = clean(col(row, "testimonial__name"));
  const testimonialRole = clean(col(row, "testimonial__role"));
  const testimonialCompany = clean(col(row, "testimonial__company"));
  const testimonialTitle = clean(col(row, "testimonial__title"));
  const testimonialSubText = clean(col(row, "testimonial__sub_text"));
  const testimonialImage = clean(col(row, "testimonial__profile_image"));
  const testimonialImageAlt = clean(col(row, "testimonial__profile_image:alt"));

  const hasTestimonial =
    testimonialName ||
    testimonialTitle ||
    testimonialSubText ||
    testimonialImage;

  const testimonial = hasTestimonial
    ? {
        _type: "caseStudyTestimonial",
        ...(testimonialName ? { name: testimonialName } : {}),
        ...(testimonialRole ? { role: testimonialRole } : {}),
        ...(testimonialCompany ? { company: testimonialCompany } : {}),
        ...(testimonialTitle ? { title: testimonialTitle } : {}),
        ...(testimonialSubText ? { subText: testimonialSubText } : {}),
        framerProfileImageUrl: testimonialImage,
        framerProfileImageAlt: testimonialImageAlt,
      }
    : undefined;

  const showFaq = parseBool(col(row, "Show FAQ?"));
  const faq = buildFaq(row);

  const hasHero =
    hero.industry !== undefined ||
    hero.teams !== undefined ||
    hero.teamSize !== undefined;

  const hasOverview =
    overview.description !== undefined ||
    overview.problem !== undefined ||
    overview.solution !== undefined;

  caseStudies.push({
    _id: `case-study-${slug}`,
    _type: "caseStudyPage",
    title,
    slug: { _type: "slug", current: slug },
    ...(description ? { description } : {}),
    ...(author ? { author } : {}),
    ...(publishedDateText ? { publishedDateText } : {}),
    ...(hasHero
      ? {
          hero: {
            _type: "caseStudyHero",
            ...Object.fromEntries(
              Object.entries(hero).filter(([, v]) => v !== undefined),
            ),
          },
        }
      : {}),
    ...(hasOverview
      ? {
          overview: {
            _type: "caseStudyOverview",
            ...Object.fromEntries(
              Object.entries(overview).filter(([, v]) => v !== undefined),
            ),
          },
        }
      : {}),
    ...(problemSection ? { problemSection } : {}),
    ...(solutionSection ? { solutionSection } : {}),
    ...(resultsSection ? { resultsSection } : {}),
    ...(testimonial ? { testimonial } : {}),
    ...(typeof showFaq === "boolean" ? { showFaq } : {}),
    ...(faq.length ? { faq } : {}),
    ...(metaTitle ? { metaTitle } : {}),
    ...(metaDescription ? { metaDescription } : {}),
    // markers (resolved by importer)
    framerThumbnailUrl: thumbnailUrl,
    framerThumbnailAlt: thumbnailAlt,
    framerLogoUrl: logoUrl,
    framerLogoAlt: logoAlt,
  });
}

writeFileSync(
  here("case-study-sanity.json"),
  JSON.stringify({ caseStudies }, null, 2),
);
console.log(`Wrote ${caseStudies.length} caseStudyPage docs`);
