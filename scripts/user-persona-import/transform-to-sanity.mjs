#!/usr/bin/env node
/**
 * Transform Framer User Persona raw JSON → Sanity userPersonaPage shape.
 *
 * Input:  scripts/user-persona-import/framer-up-raw.json
 * Output: scripts/user-persona-import/framer-up-sanity.json
 *
 * Asset-marker convention (mirrors the alt/blog importers): every image
 * becomes `{ framerImageUrl, alt? }`; resolved at import time.
 *
 * No network — pure transform.
 *
 * Usage: node scripts/user-persona-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const raw = JSON.parse(readFileSync(here("framer-up-raw.json"), "utf8"));

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const bool = (v) => {
  if (v === true || v === "true" || v === "TRUE") return true;
  if (v === false || v === "false" || v === "FALSE") return false;
  return undefined;
};
const nonEmpty = (v) =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;

function imageMarker(url, alt) {
  url = nonEmpty(url);
  if (!url) return undefined;
  return { framerImageUrl: url, ...(nonEmpty(alt) ? { alt } : {}) };
}

// Framer prefixed jobs 2 + 3 with "❌  " (two glyphs + two spaces) to
// mark them as deprecated. Read both prefixed and clean keys.
function getField(row, name) {
  if (row[name] !== undefined && row[name] !== "") return row[name];
  const prefixed = `❌  ${name}`;
  if (row[prefixed] !== undefined && row[prefixed] !== "") return row[prefixed];
  return row[name];
}

function buildJobFeature(row, jobKey, slot) {
  const prefix = `${jobKey}__feature_${slot}__`;
  const highlightTitle = nonEmpty(getField(row, `${prefix}highlight__title`));
  const highlightSubText = nonEmpty(
    getField(row, `${prefix}highlight__sub_text`),
  );
  const highlightImage = imageMarker(
    getField(row, `${prefix}highlight__image`),
    getField(row, `${prefix}highlight__image:alt`),
  );
  const barrierText = nonEmpty(getField(row, `${prefix}barrier__text`));
  if (!highlightTitle && !highlightSubText && !highlightImage && !barrierText) {
    return null;
  }
  return {
    _key: key(),
    _type: "userPersonaJobFeature",
    ...(highlightTitle ? { highlightTitle } : {}),
    ...(highlightSubText ? { highlightSubText } : {}),
    ...(highlightImage ? { highlightImage } : {}),
    ...(barrierText ? { barrierText } : {}),
  };
}

function buildJobs(row) {
  const out = [];
  for (const [jobKey, isFirst] of [
    ["job_one", true],
    ["job_two", false],
    ["job_three", false],
  ]) {
    const title1 =
      nonEmpty(getField(row, `${jobKey}__title_1`)) ||
      nonEmpty(getField(row, `${jobKey}__title`));
    const title2 = isFirst
      ? nonEmpty(getField(row, `${jobKey}__title_2`))
      : undefined;
    const features = ["one", "two", "three"]
      .map((slot) => buildJobFeature(row, jobKey, slot))
      .filter(Boolean);
    if (!title1 && !title2 && features.length === 0) continue;
    out.push({
      _key: key(),
      _type: "userPersonaJob",
      ...(title1 ? { title1 } : {}),
      ...(title2 ? { title2 } : {}),
      ...(features.length ? { features } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFeatures(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    // Framer's first slot uses single underscores ("feature_1_title")
    // while slots 2/3 use double ("feature__N__title"). Try both.
    const title =
      nonEmpty(row[`feature__${n}__title`]) ||
      nonEmpty(row[`feature_${n}_title`]);
    const subText =
      nonEmpty(row[`feature__${n}__sub_text`]) ||
      nonEmpty(row[`feature_${n}_sub_text`]);
    const image = imageMarker(
      row[`feature__${n}__image`] || row[`feature_${n}_image`],
      row[`feature__${n}__image:alt`] || row[`feature_${n}_image:alt`],
    );
    if (!title && !subText && !image) continue;
    out.push({
      _key: key(),
      _type: "userPersonaFeatureItem",
      ...(title ? { title } : {}),
      ...(subText ? { subText } : {}),
      ...(image ? { image } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildTestimonials(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    const image = imageMarker(
      row[`testimonial__${n}__image`],
      row[`testimonial__${n}__image:alt`],
    );
    const name = nonEmpty(row[`testimonial__${n}__name`]);
    const role = nonEmpty(row[`testimonial__${n}__role`]);
    const company = nonEmpty(row[`testimonial__${n}__company`]);
    const title = nonEmpty(row[`testimonial__${n}__title`]);
    const subCopy = nonEmpty(row[`testimonial__${n}__sub_copy`]);
    if (!name && !title && !subCopy) continue;
    out.push({
      _key: key(),
      _type: "userPersonaTestimonial",
      ...(image ? { image } : {}),
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
      ...(company ? { company } : {}),
      ...(title ? { title } : {}),
      ...(subCopy ? { subCopy } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFaq(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    const question = nonEmpty(row[`FAQ__${n}__question`]);
    const answer = nonEmpty(row[`FAQ__${n}__answer`]);
    if (!question) continue;
    out.push({
      _key: key(),
      _type: "userPersonaFaqItem",
      question,
      ...(answer ? { answer } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFinalCta(row) {
  const title = nonEmpty(row["Final CTA Title"]);
  const subText = nonEmpty(row["Final CTA Sub text"]);
  if (!title && !subText) return undefined;
  return {
    _type: "userPersonaFinalCta",
    ...(title ? { title } : {}),
    ...(subText ? { subText } : {}),
  };
}

function transform(row) {
  const slug = nonEmpty(row["Slug"]);
  if (!slug) return null;
  const hero = {
    _type: "userPersonaHero",
    ...(nonEmpty(row["Role"]) ? { role: row["Role"].trim() } : {}),
    ...(nonEmpty(row["Description"])
      ? { description: row["Description"].trim() }
      : {}),
    ...(nonEmpty(row["Hero CTA Text"])
      ? { heroCtaText: row["Hero CTA Text"].trim() }
      : {}),
    ...(nonEmpty(row["trust_line"])
      ? { trustLine: row["trust_line"].trim() }
      : {}),
  };

  return {
    _id: `up-${slug}`,
    _type: "userPersonaPage",
    slug,
    title: nonEmpty(row["Title"]),
    thumbnail: imageMarker(row["Thumbnail"], row["Thumbnail:alt"]),
    icon: imageMarker(row["Icon"], row["Icon:alt"]),
    hidden: bool(row["Hidden"]) ?? false,
    metaTitle: nonEmpty(row["Meta Title"]),
    metaDescription: nonEmpty(row["Meta Description"]),
    noIndex: nonEmpty(row["NoIndex"]),
    hero,
    jobs: buildJobs(row),
    solutionTitle1: nonEmpty(row["solution_title_1"]),
    solutionTitle2: nonEmpty(row["solution_title_2"]),
    featureText1: nonEmpty(row["feature_text_1"]),
    featureText2: nonEmpty(row["feature_text_2"]),
    features: buildFeatures(row),
    othersTitle1: nonEmpty(row["others_title_1"]),
    othersTitle2: nonEmpty(row["others_title_2"]),
    outcomeOneLiner: nonEmpty(row["outcome_one_liner"]),
    testimonials: buildTestimonials(row),
    faq: buildFaq(row),
    finalCta: buildFinalCta(row),
  };
}

const docs = raw.map(transform).filter(Boolean);
writeFileSync(here("framer-up-sanity.json"), JSON.stringify(docs, null, 2));
console.log(`Wrote ${docs.length} docs → framer-up-sanity.json`);
