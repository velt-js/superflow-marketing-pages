#!/usr/bin/env node
/**
 * Import the transformed Framer blog data into Sanity.
 *
 * Reads scripts/blog-import/framer-blog-sanity.json. For each unique
 * author: upload avatar (if framerAvatarUrl set), createOrReplace an
 * `author` doc keyed `author-<slug>`. For each post: upload hero image +
 * any inline body images (any node with `framerImageUrl`), rewrite the
 * marker into a Sanity asset reference, then createOrReplace the
 * blogPost doc keyed `blog-<slug>`.
 *
 * Asset uploads are cached by URL within a single run so duplicates
 * (e.g. an author image referenced by many posts) upload once.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/blog-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/blog-import/import-to-sanity.mjs       # parse + log only
 *   LIMIT=1   node scripts/blog-import/import-to-sanity.mjs       # import first N posts
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (rel) => resolve(__dirname, rel);

const DRY_RUN = process.env.DRY_RUN === "1";
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = DRY_RUN
  ? null
  : createClient({
      projectId: "sckr62cw",
      dataset: "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const { posts, authors } = JSON.parse(
  readFileSync(here("framer-blog-sanity.json"), "utf8"),
);

const assetCache = new Map(); // url → Sanity asset _id

async function uploadFromUrl(url) {
  if (!url) return null;
  if (assetCache.has(url)) return assetCache.get(url);
  if (DRY_RUN) {
    const fakeId = `image-dry-${assetCache.size}`;
    assetCache.set(url, fakeId);
    return fakeId;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ! fetch ${res.status} for ${url}`);
      assetCache.set(url, null);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const filename = url.split("/").pop()?.split("?")[0] || "image";
    const asset = await client.assets.upload("image", buf, { filename });
    assetCache.set(url, asset._id);
    return asset._id;
  } catch (err) {
    console.warn(`  ! upload failed ${url}: ${err.message}`);
    assetCache.set(url, null);
    return null;
  }
}

function imageRef(assetId) {
  return assetId
    ? { _type: "image", asset: { _type: "reference", _ref: assetId } }
    : undefined;
}

async function rewriteBodyImages(body) {
  for (const node of body) {
    if (node._type === "blogBodyImage" && node.framerImageUrl) {
      const assetId = await uploadFromUrl(node.framerImageUrl);
      delete node.framerImageUrl;
      if (assetId) {
        node.asset = { _type: "reference", _ref: assetId };
      }
    }
  }
}

// Sanity doc IDs accept only [a-zA-Z0-9._-]. Sanitize Framer slugs that
// contain parens, apostrophes, etc.
function safeId(id) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

const authorRefByName = new Map();

async function upsertAuthors() {
  for (const a of authors) {
    const _id = `author-${a.slug}`;
    let avatar;
    if (a.framerAvatarUrl) {
      const assetId = await uploadFromUrl(a.framerAvatarUrl);
      avatar = imageRef(assetId);
    }
    const doc = {
      _id,
      _type: "author",
      name: a.name,
      ...(avatar ? { avatar } : {}),
    };
    if (DRY_RUN) {
      console.log(`[dry] author ${_id}`);
    } else {
      await client.createOrReplace(doc);
      console.log(`  ✓ author ${_id}`);
    }
    authorRefByName.set(a.name, _id);
  }
}

async function upsertPosts() {
  let count = 0;
  for (const p of posts) {
    if (count >= LIMIT) break;
    count++;
    console.log(`[${count}/${Math.min(posts.length, LIMIT)}] ${p.slug.current}`);

    // Hero image
    let featuredImage;
    if (p.framerHeroImageUrl) {
      const assetId = await uploadFromUrl(p.framerHeroImageUrl);
      featuredImage = imageRef(assetId);
    }

    // Inline body images
    await rewriteBodyImages(p.body);

    // Author reference
    let authorRef;
    if (p.authorName && authorRefByName.has(p.authorName)) {
      authorRef = {
        _type: "reference",
        _ref: authorRefByName.get(p.authorName),
      };
    }

    const doc = {
      _id: safeId(p._id),
      _type: "blogPost",
      title: p.title,
      slug: { _type: "slug", current: safeId(p.slug.current) },
      description: p.description,
      publishedAt: p.publishedAt,
      category: p.category,
      tags: p.tags,
      ...(authorRef ? { author: authorRef } : {}),
      ...(featuredImage ? { featuredImage } : {}),
      body: p.body,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      faqSchema: p.faqSchema,
      blogPostingSchema: p.blogPostingSchema,
    };

    if (DRY_RUN) {
      console.log(`  [dry] blogPost ${p._id}`);
    } else {
      await client.createOrReplace(doc);
      console.log(`  ✓ blogPost ${p._id}`);
    }
  }
}

async function main() {
  console.log(
    `${DRY_RUN ? "DRY RUN — " : ""}importing ${authors.length} authors, ${Math.min(posts.length, LIMIT)} posts`,
  );
  await upsertAuthors();
  await upsertPosts();
  console.log(`Done. ${assetCache.size} unique asset URLs processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
