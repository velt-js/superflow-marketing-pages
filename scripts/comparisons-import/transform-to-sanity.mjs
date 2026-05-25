#!/usr/bin/env node
/**
 * Transform Framer Comp v/s Comp raw JSON → Sanity comparisonPage shape.
 *
 * Input:  scripts/comparisons-import/framer-cmp-raw.json
 * Output: scripts/comparisons-import/framer-cmp-sanity.json
 *
 * Asset-marker convention (same as the alternative pipeline): every image
 * field becomes `{ framerImageUrl, alt? }` so the importer can fetch +
 * upload + rewrite into a Sanity asset reference. YouTube embed URLs stay
 * as plain strings on the `c1Video` / `c2Video` fields.
 *
 * No network — pure transform.
 *
 * Usage: node scripts/comparisons-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const raw = JSON.parse(readFileSync(here("framer-cmp-raw.json"), "utf8"));

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

// Named criteria keys live in Framer as static column-name segments.
const NAMED_CRITERIA = [
  "pure_comments",
  "viewing_modes",
  "authenticated_page",
  "integrations",
  "ai_copywriting",
  "private_commenting",
];

function buildNamedCriteria(row) {
  const out = [];
  for (const k of NAMED_CRITERIA) {
    const summary = nonEmpty(row[`criteria__${k}__both__summary`]);
    const c1Image = imageMarker(
      row[`criteria__${k}__c1__image`],
      row[`criteria__${k}__c1__image:alt`],
    );
    const c1Video = nonEmpty(row[`criteria__${k}__c1__video`]);
    const c2Image = imageMarker(
      row[`criteria__${k}__c2__image`],
      row[`criteria__${k}__c2__image:alt`],
    );
    const c2Video = nonEmpty(row[`criteria__${k}__c2__video`]);
    if (!summary && !c1Image && !c1Video && !c2Image && !c2Video) continue;
    out.push({
      _key: key(),
      _type: "comparisonNamedCriterion",
      key: k,
      ...(summary ? { summary } : {}),
      ...(c1Image ? { c1Image } : {}),
      ...(nonEmpty(row[`criteria__${k}__c1__image:alt`])
        ? { c1ImageAlt: row[`criteria__${k}__c1__image:alt`].trim() }
        : {}),
      ...(c1Video ? { c1Video } : {}),
      ...(c2Image ? { c2Image } : {}),
      ...(nonEmpty(row[`criteria__${k}__c2__image:alt`])
        ? { c2ImageAlt: row[`criteria__${k}__c2__image:alt`].trim() }
        : {}),
      ...(c2Video ? { c2Video } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildPricingTiers(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    const c1Price = nonEmpty(row[`pricing__tier_${n}__c1__price`]);
    const c1Seats = nonEmpty(row[`pricing__tier_${n}__c1__seats`]);
    const c2Price = nonEmpty(row[`pricing__tier_${n}__c2__price`]);
    const c2Seats = nonEmpty(row[`pricing__tier_${n}__c2__seats`]);
    if (!c1Price && !c2Price && !c1Seats && !c2Seats) continue;
    out.push({
      _key: key(),
      _type: "comparisonPricingTier",
      ...(c1Price ? { c1Price } : {}),
      ...(c1Seats ? { c1Seats } : {}),
      ...(c2Price ? { c2Price } : {}),
      ...(c2Seats ? { c2Seats } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFeatureTable(row) {
  const groups = ["A", "B", "C", "D", "E"];
  const groupOut = [];
  for (const g of groups) {
    const rows = [];
    for (let n = 1; n <= 20; n++) {
      const c1A = bool(row[`table__${g}__${n}__c1__is_available`]);
      const c2A = bool(row[`table__${g}__${n}__c2__is_available`]);
      const c1T = nonEmpty(row[`table__${g}__${n}__c1__text`]);
      const c2T = nonEmpty(row[`table__${g}__${n}__c2__text`]);
      // A row exists in the CSV if any of its 4 fields is non-empty.
      const exists =
        c1A !== undefined ||
        c2A !== undefined ||
        c1T !== undefined ||
        c2T !== undefined;
      if (!exists) continue;
      rows.push({
        _key: key(),
        _type: "comparisonTableRow",
        rowKey: String(n),
        ...(c1A !== undefined ? { c1Available: c1A } : {}),
        ...(c1T ? { c1Text: c1T } : {}),
        ...(c2A !== undefined ? { c2Available: c2A } : {}),
        ...(c2T ? { c2Text: c2T } : {}),
      });
    }
    if (rows.length === 0) continue;
    groupOut.push({
      _key: key(),
      _type: "comparisonFeatureGroup",
      key: g,
      rows,
    });
  }
  return groupOut.length ? groupOut : undefined;
}

const HIGHLIGHT_SLOTS = ["one", "two", "three"];

function buildHighlights(row, prefix) {
  const out = [];
  for (const slot of HIGHLIGHT_SLOTS) {
    const title = nonEmpty(row[`${prefix}__highlight_${slot}__title`]);
    const subText = nonEmpty(row[`${prefix}__highlight_${slot}__sub_text`]);
    const image = imageMarker(
      row[`${prefix}__highlight_${slot}__image`],
      row[`${prefix}__highlight_${slot}__image:alt`],
    );
    const imageAlt = nonEmpty(row[`${prefix}__highlight_${slot}__image:alt`]);
    const videoUrl = nonEmpty(row[`${prefix}__highlight_${slot}__video_url`]);
    if (!title && !subText && !image && !videoUrl) continue;
    out.push({
      _key: key(),
      _type: "comparisonHighlightBlock",
      ...(title ? { title } : {}),
      ...(subText ? { subText } : {}),
      ...(image ? { image } : {}),
      ...(imageAlt ? { imageAlt } : {}),
      ...(videoUrl ? { videoUrl } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildReviews(row) {
  const out = [];
  // Reviews 1, 2 = c1; 3, 4 = c2 (per Framer column layout).
  const reviewSpecs = [
    { idx: 1, side: "c1" },
    { idx: 2, side: "c1" },
    { idx: 3, side: "c2" },
    { idx: 4, side: "c2" },
  ];
  for (const { idx, side } of reviewSpecs) {
    const image = imageMarker(
      row[`review__${idx}__${side}__image`],
      row[`review__${idx}__${side}__image:alt`],
    );
    const imageAlt = nonEmpty(row[`review__${idx}__${side}__image:alt`]);
    const name = nonEmpty(row[`review__${idx}__${side}__name`]);
    const rating = nonEmpty(row[`review__${idx}__${side}__rating`]);
    const title = nonEmpty(row[`review__${idx}__${side}__title`]);
    const content = nonEmpty(row[`review__${idx}__${side}__content`]);
    if (!name && !title && !content) continue;
    out.push({
      _key: key(),
      _type: "comparisonReview",
      side,
      ...(image ? { image } : {}),
      ...(imageAlt ? { imageAlt } : {}),
      ...(name ? { name } : {}),
      ...(rating ? { rating } : {}),
      ...(title ? { title } : {}),
      ...(content ? { content } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFaq(row) {
  const out = [];
  for (let n = 1; n <= 6; n++) {
    const q = nonEmpty(row[`faq_${n}_question`]);
    const a = nonEmpty(row[`faq_${n}_answer`]);
    if (!q) continue;
    out.push({
      _key: key(),
      _type: "comparisonFaqItem",
      question: q,
      ...(a ? { answer: a } : {}),
    });
  }
  return out.length ? out : undefined;
}

function transform(row) {
  const slug = nonEmpty(row["Slug"]);
  if (!slug) return null;
  const dateRaw = nonEmpty(row["date_published"]);
  const publishedDate = dateRaw ? dateRaw.slice(0, 10) : undefined;

  return {
    _id: `cmp-${slug}`,
    _type: "comparisonPage",
    slug,
    title: nonEmpty(row["Title"]),
    description: nonEmpty(row["Description"]),
    metaTitle: nonEmpty(row["Meta Title"]),
    metaDescription: nonEmpty(row["Meta Description"]),
    hidden: bool(row["Hidden"]) ?? false,
    noIndex: nonEmpty(row["NoIndex"]),
    author: nonEmpty(row["Author"]),
    publishedDate,
    publishedDateText: nonEmpty(row["Published Date Text"]),

    // Hero + thumbnail
    heroImage: imageMarker(row["hero__image"], row["hero__image:alt"]),

    // Competitors
    competitor1Name: nonEmpty(row["for_all__c1_name"]),
    competitor1Logo: imageMarker(
      row["for_all__c1_logo"],
      row["for_all__c1_logo:alt"],
    ),
    competitor2Name: nonEmpty(row["for_all__c2_name"]),
    competitor2Logo: imageMarker(
      row["for_all__c2_logo"],
      row["for_all__c2_logo:alt"],
    ),

    // Overview (two-column)
    overviewC1Text: nonEmpty(row["overview__c1__text"]),
    overviewC2Text: nonEmpty(row["overview__c2__text"]),

    // Named criteria
    namedCriteria: buildNamedCriteria(row),

    // Pricing
    pricingTiers: buildPricingTiers(row),

    // Feature table
    featureTable: buildFeatureTable(row),

    // Highlights
    superflowHighlights: buildHighlights(row, "for_superflow"),
    alternativeHighlights: buildHighlights(row, "for_superflow__alternative"),

    // Reviews
    reviews: buildReviews(row),

    // FAQ
    faq: buildFaq(row),
  };
}

const docs = raw.map(transform).filter(Boolean);
writeFileSync(here("framer-cmp-sanity.json"), JSON.stringify(docs, null, 2));
console.log(`Wrote ${docs.length} docs → framer-cmp-sanity.json`);
