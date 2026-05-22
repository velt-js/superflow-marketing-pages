#!/usr/bin/env node
/**
 * Transform Framer Blog raw JSON → Sanity blogPost-shaped JSON.
 *
 * Input:  scripts/blog-import/framer-blog-raw.json (extracted via unframer MCP)
 *         scripts/blog-import/framer-field-map.json (field-id → human name)
 * Output: scripts/blog-import/framer-blog-sanity.json
 *
 * Per post we:
 *   - Resolve top-level fields (title, slug, metaTitle, metaDescription,
 *     publishedAt, category, author name/image, hero image, FAQ pairs).
 *   - Walk 20 section slots in order; each non-empty section emits an H2
 *     of its title (when present) plus its `content` HTML. Quotes / notes /
 *     CTAs are appended as plain paragraphs (rough fidelity — Framer ships
 *     them outside the formattedText, so they read as block-level text in
 *     Portable Text).
 *   - Convert the concatenated HTML to Portable Text via jsdom + a small
 *     recursive walker. Supports p / h1-4 / ul / ol / blockquote / pre /
 *     img / a / strong / em / br.
 *   - Inline <img>s become `blogBodyImage` entries with a remote
 *     `framerImageUrl` marker; the importer downloads + uploads + rewrites
 *     to a Sanity asset ref.
 *   - Hero / author images are tracked as `framerImageUrl` markers too.
 *
 * No network here. Pure transform.
 *
 * Usage:
 *   node scripts/blog-import/transform-to-sanity.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const raw = JSON.parse(readFileSync(here("framer-blog-raw.json"), "utf8"));
const fieldMap = JSON.parse(readFileSync(here("framer-field-map.json"), "utf8"));

// Reverse lookup: human name → field id
const nameToId = Object.fromEntries(
  Object.entries(fieldMap).map(([id, name]) => [name, id]),
);

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function getField(item, humanName) {
  const id = nameToId[humanName];
  if (!id) return undefined;
  return item.fieldData?.[id]?.value;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Framer Category enum value → Superflow blogPost schema enum
const CATEGORY_MAP = {
  Guides: "guide",
  "Comparison Blog": "comparison",
  "Product Updatae": "product-update", // Framer typo preserved
  "Product Update": "product-update",
};
const CATEGORY_DEFAULT = "guide";

// ---- HTML → Portable Text -------------------------------------------------

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

// Walk inline nodes, collecting spans and markDefs. Returns
// { spans: Span[], markDefs: MarkDef[] }.
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

// Build a Portable Text block from a block-level element's inline children.
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
    _type: "blogBodyImage",
    _key: key(),
    framerImageUrl: src, // resolved at import time
    alt: alt || "",
  };
}

function htmlToPortableText(html) {
  if (!html) return [];
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
        // Framer occasionally wraps an <img> alone in a <p>; promote it.
        const onlyImg = el.children.length === 1 && el.children[0].tagName === "IMG"
          && el.textContent.trim() === "";
        if (onlyImg) {
          const img = el.children[0];
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
        const style = tag === "h1" ? "h2" : tag; // schema tops out at h2..h4
        const b = blockFromInline(el, style === "h1" ? "h2" : style);
        if (b) out.push(b);
        return;
      }
      case "blockquote": {
        const b = blockFromInline(el, "blockquote");
        if (b) out.push(b);
        return;
      }
      case "pre": {
        const code = el.textContent;
        out.push({
          _type: "code",
          _key: key(),
          language: "text",
          code,
        });
        return;
      }
      case "ul":
      case "ol": {
        const kind = tag === "ul" ? "bullet" : "number";
        for (const li of el.children) {
          if (li.tagName !== "LI") continue;
          // Framer wraps `<li data-preset-tag="p"><p>…</p></li>` — unwrap
          let inner = li;
          if (li.children.length === 1 && li.children[0].tagName === "P") {
            inner = li.children[0];
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
        // Unknown wrapper — recurse into children.
        for (const child of el.childNodes) emit(child);
      }
    }
  }

  for (const child of body.childNodes) emit(child);
  return out;
}

// ---- Per-post transform ---------------------------------------------------

function buildBodyHtml(item) {
  const parts = [];
  const intro = getField(item, "Introduction");
  if (intro) parts.push(intro);
  for (let i = 1; i <= 20; i++) {
    const title = getField(item, `${i}__title`);
    const content = getField(item, `${i}__content`);
    const quoteText = getField(item, `${i}__quote__text`);
    const quoteAuthor = getField(item, `${i}__quote__author`);
    const noteText = getField(item, `${i}__note__text`);
    const ctaText = getField(item, `${i}__CTA__text`);
    const ctaLink = getField(item, `${i}__CTA__link`);

    const hasAnything =
      (title && title.trim()) ||
      (content && content.trim()) ||
      (quoteText && quoteText.trim()) ||
      (noteText && noteText.trim()) ||
      (ctaText && ctaText.trim());
    if (!hasAnything) continue;

    if (title && title.trim()) parts.push(`<h2>${title}</h2>`);
    if (content && content.trim()) parts.push(content);
    if (quoteText && quoteText.trim()) {
      const attr = quoteAuthor ? ` — ${quoteAuthor}` : "";
      parts.push(`<blockquote>${quoteText}${attr}</blockquote>`);
    }
    if (noteText && noteText.trim()) {
      parts.push(`<blockquote>${noteText}</blockquote>`);
    }
    if (ctaText && ctaText.trim()) {
      const href = ctaLink?.url || ctaLink || "#";
      parts.push(`<p><a href="${href}">${ctaText}</a></p>`);
    }
  }
  return parts.join("\n");
}

function buildFaq(item) {
  const items = [];
  for (let i = 1; i <= 5; i++) {
    const q = getField(item, `FAQ__${i}__question`);
    const a = getField(item, `FAQ__${i}__answer`);
    if (!q || !q.trim()) continue;
    // Strip HTML tags from answer for JSON-LD
    const plain = String(a || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    items.push({
      "@type": "Question",
      name: q.trim(),
      acceptedAnswer: { "@type": "Answer", text: plain },
    });
  }
  if (items.length === 0) return undefined;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items,
  });
}

function buildBlogPostingSchema(item, slug) {
  const title = getField(item, "Title");
  const desc = getField(item, "Meta Description") || "";
  const publishedAt = getField(item, "Published Date");
  const authorName = getField(item, "Author Name");
  const heroImage = getField(item, "Hero Image");
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: desc,
    datePublished: publishedAt,
    author: authorName ? { "@type": "Person", name: authorName } : undefined,
    image: heroImage || undefined,
    url: `https://usesuperflow.com/blog/${slug}`,
  });
}

const posts = [];
const authors = {}; // name → { name, slug, avatarUrl }

for (const item of raw) {
  const title = getField(item, "Title") || item.slug;
  const slug = item.slug;
  const metaTitle = getField(item, "Meta Title");
  const metaDescription = getField(item, "Meta Description");
  const publishedAt = getField(item, "Published Date");
  const heroImage = getField(item, "Hero Image");
  const authorName = getField(item, "Author Name");
  const authorImage = getField(item, "Author Image");
  const framerCategory = getField(item, "Category");
  const category = CATEGORY_MAP[framerCategory] || CATEGORY_DEFAULT;
  const tagsRaw = [
    getField(item, "tag__1"),
    getField(item, "tag__2"),
    getField(item, "tag__3"),
  ].filter(Boolean);

  if (authorName) {
    const authorSlug = slugify(authorName);
    if (!authors[authorName]) {
      authors[authorName] = {
        name: authorName,
        slug: authorSlug,
        framerAvatarUrl: authorImage || null,
      };
    } else if (!authors[authorName].framerAvatarUrl && authorImage) {
      authors[authorName].framerAvatarUrl = authorImage;
    }
  }

  const bodyHtml = buildBodyHtml(item);
  const body = htmlToPortableText(bodyHtml);

  posts.push({
    _id: `blog-${slug}`,
    _type: "blogPost",
    title,
    slug: { _type: "slug", current: slug },
    description: metaDescription || undefined,
    publishedAt: publishedAt || undefined,
    category,
    tags: tagsRaw.length ? tagsRaw : undefined,
    authorName: authorName || undefined, // resolved → reference by importer
    framerHeroImageUrl: heroImage || undefined, // resolved by importer
    body,
    metaTitle: metaTitle || undefined,
    metaDescription: metaDescription || undefined,
    faqSchema: buildFaq(item),
    blogPostingSchema: buildBlogPostingSchema(item, slug),
  });
}

const out = {
  posts,
  authors: Object.values(authors),
};
writeFileSync(here("framer-blog-sanity.json"), JSON.stringify(out, null, 2));
console.log(
  `Wrote ${posts.length} posts and ${out.authors.length} unique authors`,
);
