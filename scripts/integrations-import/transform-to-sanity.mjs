#!/usr/bin/env node
/**
 * Transform Framer Integrations CSV → Sanity integrationPage-shaped JSON.
 *
 * Input:  scripts/integrations-import/integrations-raw.csv
 * Output: scripts/integrations-import/integrations-sanity.json
 *
 * Per row we:
 *   - Map flat CSV columns to `integrationPage` fields.
 *   - Convert HTML in `Description`, `overview`, and each `steps__N__text` to
 *     Portable Text via jsdom + the same recursive walker as the blog import.
 *     Supports p / h1-4 / ul / ol / blockquote / pre / img / a / strong / em /
 *     br.
 *   - Coalesce non-empty steps__1..6__title/text into `steps[]`.
 *   - Capture framerusercontent.com asset URLs (Thumbnail, App Logo,
 *     Installation Video) as `framerThumbnailUrl` / `framerAppLogoUrl` /
 *     `framerInstallationVideoUrl` markers. Inline <img> in step bodies
 *     becomes an `integrationBodyImage` node with `framerImageUrl`. The
 *     importer downloads + uploads + rewrites all of these to Sanity asset
 *     refs so no framer URL survives in the published doc.
 *
 * No network here. Pure transform.
 *
 * Usage:
 *   node scripts/integrations-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { parse as parseHtml } from "node-html-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const csvText = readFileSync(here("integrations-raw.csv"), "utf8");

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

// ---- HTML → Portable Text -------------------------------------------------

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

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
    const text = node.text;
    if (text) spans.push(span(text, [...activeMarks]));
    return spans;
  }
  if (node.nodeType !== 1) return spans;
  const tag = (node.tagName || "").toLowerCase();
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

function imageBlock(src, alt) {
  return {
    _type: "integrationBodyImage",
    _key: key(),
    framerImageUrl: src,
    alt: alt || "",
  };
}

function htmlToPortableText(html) {
  if (!html) return [];
  const root = parseHtml(html);
  const out = [];

  function emit(el) {
    if (el.nodeType === 3) {
      const t = (el.text || "").trim();
      if (t) out.push(block([span(t)]));
      return;
    }
    if (el.nodeType !== 1) return;
    const tag = (el.tagName || "").toLowerCase();
    switch (tag) {
      case "p": {
        const elementChildren = el.childNodes.filter((c) => c.nodeType === 1);
        const onlyImg =
          elementChildren.length === 1 &&
          (elementChildren[0].tagName || "").toLowerCase() === "img" &&
          (el.text || "").trim() === "";
        if (onlyImg) {
          const img = elementChildren[0];
          out.push(imageBlock(img.getAttribute("src"), img.getAttribute("alt")));
          return;
        }
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
      case "ul":
      case "ol": {
        const kind = tag === "ul" ? "bullet" : "number";
        for (const li of el.childNodes) {
          if (li.nodeType !== 1) continue;
          if ((li.tagName || "").toLowerCase() !== "li") continue;
          // Framer wraps `<li data-preset-tag="p"><p>…</p></li>` — unwrap
          let inner = li;
          const liElementChildren = li.childNodes.filter(
            (c) => c.nodeType === 1,
          );
          if (
            liElementChildren.length === 1 &&
            (liElementChildren[0].tagName || "").toLowerCase() === "p"
          ) {
            inner = liElementChildren[0];
          }
          const b = blockFromInline(inner, "normal", kind, 1);
          if (b) out.push(b);
        }
        return;
      }
      case "img": {
        out.push(imageBlock(el.getAttribute("src"), el.getAttribute("alt")));
        return;
      }
      case "br":
        return;
      default: {
        for (const child of el.childNodes) emit(child);
      }
    }
  }

  for (const child of root.childNodes) emit(child);
  return out;
}

// ---- Per-row transform ----------------------------------------------------

function parseBool(value) {
  if (typeof value !== "string") return undefined;
  const v = value.trim().toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function toIsoDate(value) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return `${trimmed}T00:00:00.000Z`;
  const dt = new Date(trimmed);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
}

const integrations = [];

for (const row of dataRows) {
  const slug = (col(row, "Slug") || "").trim();
  if (!slug) continue;

  const title = (col(row, "Title") || slug).trim();
  const metaTitle = (col(row, "Meta Title") || "").trim() || undefined;
  const metaDescription =
    (col(row, "Meta Description") || "").trim() || undefined;
  const authorName = (col(row, "Author Name") || "").trim() || undefined;
  const publishedDateText =
    (col(row, "Published Date Text") || "").trim() || undefined;
  const publishedAtIso = toIsoDate(publishedDateText);

  const descriptionHtml = col(row, "Description") || "";
  const overviewHtml = col(row, "overview") || "";
  const description = htmlToPortableText(descriptionHtml);
  const overview = htmlToPortableText(overviewHtml);

  const thumbnailUrl = (col(row, "Thumbnail") || "").trim() || undefined;
  const thumbnailAlt = (col(row, "Thumbnail:alt") || "").trim() || undefined;
  const appLogoUrl = (col(row, "App Logo") || "").trim() || undefined;
  const appLogoAlt = (col(row, "App Logo:alt") || "").trim() || undefined;
  const installationVideoUrl =
    (col(row, "Installation Video") || "").trim() || undefined;
  const installationVideoLink =
    (col(row, "Link - Installation Video") || "").trim() || undefined;
  const linkToApp = (col(row, "Link to App") || "").trim() || undefined;
  const appName = (col(row, "App Name") || "").trim() || undefined;
  const isTaskApp = parseBool(col(row, "is it a task app?"));

  const steps = [];
  for (let i = 1; i <= 6; i++) {
    const stepTitle = (col(row, `steps__${i}__title`) || "").trim();
    const stepHtml = col(row, `steps__${i}__text`) || "";
    if (!stepTitle && !stepHtml.trim()) continue;
    if (!stepTitle) continue;
    steps.push({
      _type: "integrationStep",
      _key: key(),
      title: stepTitle,
      body: htmlToPortableText(stepHtml),
    });
  }

  integrations.push({
    _id: `integration-${slug}`,
    _type: "integrationPage",
    title,
    slug: { _type: "slug", current: slug },
    metaTitle,
    metaDescription,
    authorName,
    publishedDateText,
    publishedAtIso,
    appName,
    isTaskApp,
    linkToApp,
    installationVideoLink,
    description,
    overview,
    steps,
    // markers (resolved by importer)
    framerThumbnailUrl: thumbnailUrl,
    framerThumbnailAlt: thumbnailAlt,
    framerAppLogoUrl: appLogoUrl,
    framerAppLogoAlt: appLogoAlt,
    framerInstallationVideoUrl: installationVideoUrl,
  });
}

writeFileSync(
  here("integrations-sanity.json"),
  JSON.stringify({ integrations }, null, 2),
);
console.log(`Wrote ${integrations.length} integration docs`);
