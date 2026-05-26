#!/usr/bin/env node
/**
 * Transform Framer Comparisons raw JSON → Sanity comparisonPage shape.
 *
 * Input:  scripts/alternative-import/framer-cmp-raw.json
 * Output: scripts/alternative-import/framer-cmp-sanity.json
 *
 * Asset marker convention (mirrors the blog importer): every image / file
 * field is emitted as { framerImageUrl: "<url>", alt?: "<alt>" } or
 * { framerFileUrl: "<url>" }. The import step resolves the marker into a
 * Sanity asset reference after uploading.
 *
 * No network — pure transform.
 *
 * Usage: node scripts/alternative-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const raw = JSON.parse(readFileSync(here("framer-cmp-raw.json"), "utf8"));

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function bool(v) {
  if (v === true || v === "true" || v === "TRUE") return true;
  if (v === false || v === "false" || v === "FALSE") return false;
  return undefined;
}

function nonEmpty(v) {
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function imageMarker(url, alt) {
  url = nonEmpty(url);
  if (!url) return undefined;
  return { framerImageUrl: url, ...(nonEmpty(alt) ? { alt } : {}) };
}

function fileMarker(url) {
  url = nonEmpty(url);
  if (!url) return undefined;
  return { framerFileUrl: url };
}

// ---- HTML → Portable Text (subset used by summary_pointers) --------------

function span(text, marks = []) {
  return { _type: "span", _key: key(), text, marks };
}
function block(children, style = "normal", listItem, level) {
  const b = { _type: "block", _key: key(), style, markDefs: [], children };
  if (listItem) {
    b.listItem = listItem;
    b.level = level ?? 1;
  }
  return b;
}
function walkInline(node, activeMarks, markDefs) {
  const spans = [];
  if (node.nodeType === 3) {
    const text = node.textContent;
    if (text) spans.push(span(text, [...activeMarks]));
    return spans;
  }
  if (node.nodeType !== 1) return spans;
  const tag = node.tagName.toLowerCase();
  if (tag === "br") {
    spans.push(span("\n", [...activeMarks]));
    return spans;
  }
  let next = activeMarks;
  if (tag === "strong" || tag === "b") next = [...activeMarks, "strong"];
  else if (tag === "em" || tag === "i") next = [...activeMarks, "em"];
  else if (tag === "a") {
    const href = node.getAttribute("href") || "";
    const markKey = key();
    markDefs.push({ _type: "link", _key: markKey, href });
    next = [...activeMarks, markKey];
  }
  for (const child of node.childNodes) {
    spans.push(...walkInline(child, next, markDefs));
  }
  return spans;
}
function blockFromInline(node, style = "normal", listItem, level) {
  const markDefs = [];
  const children = [];
  for (const child of node.childNodes) {
    children.push(...walkInline(child, [], markDefs));
  }
  if (children.length === 0) return null;
  const b = block(children, style, listItem, level);
  b.markDefs = markDefs;
  return b;
}
function htmlToPortableText(html) {
  if (!nonEmpty(html)) return undefined;
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`);
  const body = dom.window.document.body;
  const out = [];
  function emit(el) {
    if (el.nodeType === 3) {
      const t = el.textContent.trim();
      if (t) out.push(block([span(t)]));
      return;
    }
    if (el.nodeType !== 1) return;
    const tag = el.tagName.toLowerCase();
    if (tag === "p") {
      const b = blockFromInline(el, "normal");
      if (b) out.push(b);
    } else if (["h1", "h2", "h3", "h4"].includes(tag)) {
      const b = blockFromInline(el, tag === "h1" ? "h2" : tag);
      if (b) out.push(b);
    } else if (tag === "blockquote") {
      const b = blockFromInline(el, "blockquote");
      if (b) out.push(b);
    } else if (tag === "ul" || tag === "ol") {
      const kind = tag === "ul" ? "bullet" : "number";
      for (const li of el.children) {
        if (li.tagName !== "LI") continue;
        let inner = li;
        if (li.children.length === 1 && li.children[0].tagName === "P") {
          inner = li.children[0];
        }
        const b = blockFromInline(inner, "normal", kind, 1);
        if (b) out.push(b);
      }
    } else {
      for (const child of el.childNodes) emit(child);
    }
  }
  for (const child of body.childNodes) emit(child);
  return out.length ? out : undefined;
}

// ---- Per-record transform --------------------------------------------------

function buildCompetitorBlock(row, n, c) {
  const score = nonEmpty(row[`criteria__${n}__c${c}__score`]);
  const title = nonEmpty(row[`criteria__${n}__c${c}__title`]);
  const video = fileMarker(row[`criteria__${n}__c${c}__video`]);
  const youtubeUrl = nonEmpty(row[`criteria__${n}__c${c}__youtube_url`]);
  const tags = [1, 2, 3]
    .map((t) => {
      const label = nonEmpty(row[`criteria__${n}__c${c}__${t}_tag`]);
      const color = nonEmpty(row[`criteria__${n}__c${c}__${t}_tag_color`]);
      if (!label) return null;
      return { _key: key(), _type: "comparisonTag", label, ...(color ? { color } : {}) };
    })
    .filter(Boolean);
  if (!score && !title && !video && !youtubeUrl && tags.length === 0) {
    return undefined;
  }
  return {
    _type: "comparisonCompetitorBlock",
    ...(score ? { score } : {}),
    ...(title ? { title } : {}),
    ...(video ? { video } : {}),
    ...(youtubeUrl ? { youtubeUrl } : {}),
    ...(tags.length ? { tags } : {}),
  };
}

function buildCriteria(row) {
  const out = [];
  for (let n = 1; n <= 7; n++) {
    const title = nonEmpty(row[`criteria__${n}__title`]);
    const description = nonEmpty(row[`criteria__${n}__description`]);
    const winnerC1 = bool(row[`criteria__${n}__winner__c1?`]);
    const result = nonEmpty(row[`criteria__${n}__result`]);
    const competitor1 = buildCompetitorBlock(row, n, 1);
    const competitor2 = buildCompetitorBlock(row, n, 2);
    if (!title && !description && !competitor1 && !competitor2) continue;
    out.push({
      _key: key(),
      _type: "comparisonCriterion",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(winnerC1 !== undefined ? { winnerC1 } : {}),
      ...(result ? { result } : {}),
      ...(competitor1 ? { competitor1 } : {}),
      ...(competitor2 ? { competitor2 } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildPricing(row) {
  const out = [];
  for (let n = 1; n <= 5; n++) {
    const c1Name = nonEmpty(row[`pricing__${n}__name__c1`]);
    const c1Price = nonEmpty(row[`pricing__${n}__price__c1`]);
    const c1Users = nonEmpty(row[`pricing__${n}__users__c1`]);
    const c2Name = nonEmpty(row[`pricing__${n}__name__c2`]);
    const c2Price = nonEmpty(row[`pricing__${n}__price__c2`]);
    const c2Users = nonEmpty(row[`pricing__${n}__users__c2`]);
    if (!c1Name && !c1Price && !c2Name && !c2Price) continue;
    out.push({
      _key: key(),
      _type: "comparisonPricingRow",
      ...(c1Name ? { c1Name } : {}),
      ...(c1Price ? { c1Price } : {}),
      ...(c1Users ? { c1Users } : {}),
      ...(c2Name ? { c2Name } : {}),
      ...(c2Price ? { c2Price } : {}),
      ...(c2Users ? { c2Users } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFaq(row) {
  const out = [];
  for (let n = 1; n <= 6; n++) {
    const question = nonEmpty(row[`FAQ__${n}__question`]);
    const answer = nonEmpty(row[`FAQ__${n}__answer`]);
    if (!question) continue;
    out.push({
      _key: key(),
      _type: "comparisonFaqItem",
      question,
      ...(answer ? { answer } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildChoices(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    const title = nonEmpty(row[`choice__${n}__title`]);
    const subText = nonEmpty(row[`choice__${n}__sub_text`]);
    const image = imageMarker(row[`choice__${n}__image`], row[`choice__${n}__image:alt`]);
    const videoLink = nonEmpty(row[`choice__${n}__video_link`]);
    const videoFile = fileMarker(row[`choice__${n}__video_file`]);
    if (!title && !subText && !image && !videoLink && !videoFile) continue;
    out.push({
      _key: key(),
      _type: "comparisonChoice",
      ...(title ? { title } : {}),
      ...(subText ? { subText } : {}),
      ...(image ? { image } : {}),
      ...(videoLink ? { videoLink } : {}),
      ...(videoFile ? { videoFile } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildFeatures(row) {
  const out = [];
  for (let n = 1; n <= 6; n++) {
    const title = nonEmpty(row[`feature__${n}__title`]);
    const c1Text = nonEmpty(row[`feature__${n}__c1__text`]);
    const c2Text = nonEmpty(row[`feature__${n}__c2__text`]);
    if (!title && !c1Text && !c2Text) continue;
    out.push({
      _key: key(),
      _type: "comparisonFeatureRow",
      ...(title ? { title } : {}),
      ...(c1Text ? { c1Text } : {}),
      ...(c2Text ? { c2Text } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildHighlights(row) {
  const out = [];
  for (let n = 1; n <= 3; n++) {
    const title = nonEmpty(row[`highlight__${n}__title`]);
    const subText = nonEmpty(row[`highlight__${n}__sub_text`]);
    const image = imageMarker(row[`highlight__${n}__image`], row[`highlight__${n}__image:alt`]);
    const videoLink = nonEmpty(row[`highlight__${n}__video_link`]);
    const videoFile = fileMarker(row[`highlight__${n}__video_file`]);
    if (!title && !subText && !image && !videoLink && !videoFile) continue;
    out.push({
      _key: key(),
      _type: "comparisonHighlight",
      ...(title ? { title } : {}),
      ...(subText ? { subText } : {}),
      ...(image ? { image } : {}),
      ...(videoLink ? { videoLink } : {}),
      ...(videoFile ? { videoFile } : {}),
    });
  }
  return out.length ? out : undefined;
}

function buildCaseStudy(row) {
  const title = nonEmpty(row["case_study__title"]);
  const link = nonEmpty(row["case_study__link"]);
  const challenges = htmlToPortableText(row["case_study_challenges"]);
  if (!title && !link && !challenges) return undefined;
  return {
    _type: "comparisonCaseStudy",
    ...(title ? { title } : {}),
    ...(link ? { link } : {}),
    ...(challenges ? { challenges } : {}),
  };
}

function buildTestimonial(row, suffix = "") {
  // `suffix` lets us collect layout-2 testimonial fields that share the
  // base name `testimonial__*` but use `_text` instead of `_copy` for body
  // (per the Framer CSV column oddity).
  const name = nonEmpty(row[`testimonial__name${suffix}`]);
  const role = nonEmpty(row[`testimonial__role${suffix}`]);
  const company = nonEmpty(row[`testimonial__company${suffix}`]);
  const title = nonEmpty(row[`testimonial__title${suffix}`]);
  const profileImage = imageMarker(
    row[`testimonial__profile_image${suffix}`],
    row[`testimonial__profile_image${suffix}:alt`],
  );
  if (!name && !title && !profileImage) return undefined;
  return {
    _type: "comparisonTestimonial",
    ...(profileImage ? { profileImage } : {}),
    ...(name ? { name } : {}),
    ...(role ? { role } : {}),
    ...(company ? { company } : {}),
    ...(title ? { title } : {}),
  };
}

function transform(row) {
  const slug = row["Slug"];
  if (!slug) return null;

  const thumbnail = imageMarker(row["Thumbnail"], row["Thumbnail:alt"]);
  const competitor1Logo = imageMarker(row["for_all__c1_logo"], row["for_all__c1_logo:alt"]);
  const competitor2Logo = imageMarker(row["for_all__c2_logo"], row["for_all__c2_logo:alt"]);

  // Two testimonials in the CSV: one with sub_copy (layout 1) and one with
  // sub_text (layout 2). Keep layout 1 in `testimonial`, layout 2 in
  // `layout2Testimonial`, mirroring the schema.
  const testimonial = (() => {
    const base = buildTestimonial(row);
    const subCopy = nonEmpty(row["testimonial__sub_copy"]);
    if (!base && !subCopy) return undefined;
    return {
      ...(base || { _type: "comparisonTestimonial" }),
      ...(subCopy ? { subCopy } : {}),
    };
  })();
  const layout2Testimonial = (() => {
    const subText = nonEmpty(row["testimonial__sub_text"]);
    const profileImage = imageMarker(
      row["testimonial__profile_image"],
      row["testimonial__profile_image:alt"],
    );
    if (!subText) return undefined;
    return {
      _type: "comparisonTestimonial",
      ...(profileImage ? { profileImage } : {}),
      // For Layout 2 we reuse the same testimonial name/role/company; the
      // Framer CSV only differs by the body field name.
      ...(nonEmpty(row["testimonial__name"]) ? { name: row["testimonial__name"] } : {}),
      ...(nonEmpty(row["testimonial__role"]) ? { role: row["testimonial__role"] } : {}),
      ...(nonEmpty(row["testimonial__company"]) ? { company: row["testimonial__company"] } : {}),
      ...(nonEmpty(row["testimonial__title"]) ? { title: row["testimonial__title"] } : {}),
      subCopy: subText,
    };
  })();

  const publishedDate = nonEmpty(row["Published Date"]);
  const publishedDateStr = publishedDate
    ? publishedDate.slice(0, 10) // YYYY-MM-DD; Sanity `date` type
    : undefined;

  return {
    _id: `cmp-${slug}`,
    _type: "comparisonPage",
    slug,
    title: nonEmpty(row["Title"]),
    description: nonEmpty(row["Description"]),
    metaTitle: nonEmpty(row["Meta Title"]),
    metaDescription: nonEmpty(row["Meta Description"]),
    hidden: bool(row["Hidden"]) ?? false,
    author: nonEmpty(row["Author"]),
    publishedDate: publishedDateStr,
    publishedDateText: nonEmpty(row["Published Date Text"]),
    enableLayout2: bool(row["Enable Layout 2"]) ?? false,
    thumbnail,
    competitor1Name: nonEmpty(row["for_all__c1_name"]),
    competitor1Logo,
    competitor2Name: nonEmpty(row["for_all__c2_name"]),
    competitor2Logo,
    criteria: buildCriteria(row),
    pricing: buildPricing(row),
    overview: nonEmpty(row["Overview"]),
    showOverview: bool(row["Show Overview?"]) ?? true,
    summaryPointers: htmlToPortableText(row["summary_pointers"]),
    testimonial,
    faq: buildFaq(row),
    choices: buildChoices(row),
    features: buildFeatures(row),
    highlights: buildHighlights(row),
    caseStudy: buildCaseStudy(row),
    layout2Testimonial,
  };
}

const docs = raw.map(transform).filter(Boolean);
writeFileSync(here("framer-cmp-sanity.json"), JSON.stringify(docs, null, 2));
console.log(`Wrote ${docs.length} docs → framer-cmp-sanity.json`);
