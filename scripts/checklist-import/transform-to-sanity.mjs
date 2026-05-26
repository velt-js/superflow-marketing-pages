#!/usr/bin/env node
/**
 * Transform Framer Checklist CSV → Sanity checklistPage-shaped JSON.
 *
 * Input:  scripts/checklist-import/checklist-raw.csv
 * Output: scripts/checklist-import/checklist-sanity.json
 *
 * Per row we:
 *   - Map flat CSV columns to `checklistPage` fields.
 *   - Collapse repeating slots into named-sub-type arrays:
 *       checklist__1..12__{title,description,button text,button action,t1..t10}
 *         → sections[].tips[]
 *       suggested__1..3__{name,bg_color} → suggestedChecklists[]
 *   - Convert all `<p>…</p>` HTML descriptions to Portable Text using jsdom.
 *   - Capture thumbnail + Main__image URLs as `framerXUrl` markers; the
 *     importer downloads + uploads + rewrites them to Sanity asset refs.
 *
 * Usage:
 *   node scripts/checklist-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const csvText = readFileSync(here("checklist-raw.csv"), "utf8");

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

// ---- HTML → Portable Text -------------------------------------------------
// Same pattern as scripts/blog-import/transform-to-sanity.mjs.

function span(text, marks = []) {
  return { _type: "span", _key: key(), text, marks };
}

function block(children, style = "normal") {
  return { _type: "block", _key: key(), style, markDefs: [], children };
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
  let nextMarks = activeMarks;
  if (tag === "strong" || tag === "b") nextMarks = [...activeMarks, "strong"];
  else if (tag === "em" || tag === "i") nextMarks = [...activeMarks, "em"];
  else if (tag === "code") nextMarks = [...activeMarks, "code"];
  else if (tag === "a") {
    const href = node.getAttribute("href") || "";
    const markKey = key();
    markDefs.push({ _type: "link", _key: markKey, href });
    nextMarks = [...activeMarks, markKey];
  }
  for (const child of node.childNodes) {
    spans.push(...walkInline(child, nextMarks, markDefs));
  }
  return spans;
}

function blockFromInline(node, style = "normal") {
  const markDefs = [];
  const children = [];
  for (const child of node.childNodes) {
    children.push(...walkInline(child, [], markDefs));
  }
  if (children.length === 0) return null;
  const b = block(children, style);
  b.markDefs = markDefs;
  return b;
}

function htmlToPortableText(html) {
  if (!html || !html.trim()) return undefined;
  // Skip lone `<p><br></p>` filler that the CSV uses for empty slots
  const stripped = html.replace(/\s+/g, "");
  if (stripped === "<p><br></p>" || stripped === "<br>" || stripped === "<p></p>") {
    return undefined;
  }
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
    switch (tag) {
      case "p": {
        const b = blockFromInline(el, "normal");
        if (b) out.push(b);
        return;
      }
      case "h1":
      case "h2":
      case "h3":
      case "h4": {
        const style = tag === "h1" ? "h2" : tag;
        const b = blockFromInline(el, style);
        if (b) out.push(b);
        return;
      }
      case "blockquote": {
        const b = blockFromInline(el, "blockquote");
        if (b) out.push(b);
        return;
      }
      case "br":
        return;
      default: {
        for (const child of el.childNodes) emit(child);
      }
    }
  }

  for (const child of body.childNodes) emit(child);
  return out.length ? out : undefined;
}

// ---- Repeating slot builders ---------------------------------------------

function buildTips(row, sectionIndex) {
  const tips = [];
  for (let t = 1; t <= 10; t++) {
    const title = clean(col(row, `checklist__${sectionIndex}__t${t}_title`));
    const descHtml = clean(
      col(row, `checklist__${sectionIndex}__t${t}_description`),
    );
    if (!title && !descHtml) continue;
    const description = htmlToPortableText(descHtml);
    if (!title && !description) continue;
    tips.push({
      _type: "checklistTip",
      _key: key(),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    });
  }
  return tips;
}

function buildSections(row) {
  const sections = [];
  for (let i = 1; i <= 12; i++) {
    const title = clean(col(row, `checklist__${i}__title`));
    const descHtml = clean(col(row, `checklist__${i}__description`));
    const buttonText = clean(col(row, `checklist__${i}__button text`));
    const buttonAction = clean(col(row, `checklist__${i}__button action`));
    const tips = buildTips(row, i);
    if (!title && !descHtml && tips.length === 0) continue;
    const description = htmlToPortableText(descHtml);
    sections.push({
      _type: "checklistSection",
      _key: key(),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(buttonText ? { buttonText } : {}),
      ...(buttonAction ? { buttonAction } : {}),
      ...(tips.length ? { tips } : {}),
    });
  }
  return sections;
}

function buildSuggested(row) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    const name = clean(col(row, `suggested__${i}__name`));
    const bgColor = clean(col(row, `suggested__${i}__bg_color`));
    if (!name) continue;
    items.push({
      _type: "checklistSuggested",
      _key: key(),
      name,
      ...(bgColor ? { bgColor } : {}),
    });
  }
  return items;
}

// ---- Per-row build --------------------------------------------------------

const checklists = [];

for (const row of dataRows) {
  const slug = clean(col(row, "Slug"));
  if (!slug) continue;

  const title = clean(col(row, "Title")) || slug;
  const description = clean(col(row, "Main__description"));
  const category = clean(col(row, "Category"));
  const thumbnailUrl = clean(col(row, "Thumbnail"));
  const thumbnailAlt = clean(col(row, "Thumbnail:alt"));
  const noIndex = clean(col(row, "NoIndex"));

  const hero = {
    docName: clean(col(row, "Doc Name")),
    primaryCtaText: clean(col(row, "Primary CTA Text")),
    primaryCtaLink: clean(col(row, "Primary CTA Link")),
  };
  const heroHasContent = Object.values(hero).some((v) => v !== undefined);

  const mainImageUrl = clean(col(row, "Main__image"));
  const mainImageAlt = clean(col(row, "Main__image:alt"));
  const mainSubText = clean(col(row, "Main__sub text"));
  const mainCaption = clean(col(row, "main__caption"));

  const whatTitle = clean(col(row, "what__title"));
  const whatDescription = clean(col(row, "what__description"));
  const howTitle = clean(col(row, "how__title"));
  const howDescription = clean(col(row, "how__description"));

  const sections = buildSections(row);
  const suggested = buildSuggested(row);

  const endNoteTitle = clean(col(row, "quote__sub text"));
  const endNoteDescHtml = clean(col(row, "quote__sub_text__description"));
  const endNoteDescription = htmlToPortableText(endNoteDescHtml);
  const endNote =
    endNoteTitle || endNoteDescription
      ? {
          _type: "checklistEndNote",
          ...(endNoteTitle ? { title: endNoteTitle } : {}),
          ...(endNoteDescription ? { description: endNoteDescription } : {}),
        }
      : undefined;

  const mainSectionHasContent =
    mainImageUrl || mainSubText || mainCaption;
  const mainSection = mainSectionHasContent
    ? {
        _type: "checklistMainSection",
        ...(mainSubText ? { subText: mainSubText } : {}),
        ...(mainCaption ? { caption: mainCaption } : {}),
        framerImageUrl: mainImageUrl,
        framerImageAlt: mainImageAlt,
      }
    : undefined;

  checklists.push({
    _id: `checklist-${slug}`,
    _type: "checklistPage",
    title,
    slug: { _type: "slug", current: slug },
    ...(description ? { description } : {}),
    ...(category ? { category } : {}),
    ...(heroHasContent
      ? {
          hero: {
            _type: "checklistHero",
            ...Object.fromEntries(
              Object.entries(hero).filter(([, v]) => v !== undefined),
            ),
          },
        }
      : {}),
    ...(mainSection ? { mainSection } : {}),
    ...(whatTitle ? { whatTitle } : {}),
    ...(whatDescription ? { whatDescription } : {}),
    ...(howTitle ? { howTitle } : {}),
    ...(howDescription ? { howDescription } : {}),
    ...(sections.length ? { sections } : {}),
    ...(endNote ? { endNote } : {}),
    ...(suggested.length ? { suggestedChecklists: suggested } : {}),
    ...(noIndex ? { noIndex } : {}),
    // markers (resolved by importer)
    framerThumbnailUrl: thumbnailUrl,
    framerThumbnailAlt: thumbnailAlt,
  });
}

writeFileSync(
  here("checklist-sanity.json"),
  JSON.stringify({ checklists }, null, 2),
);
console.log(`Wrote ${checklists.length} checklistPage docs`);
