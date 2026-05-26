#!/usr/bin/env node
/**
 * Import the transformed Framer checklist data into Sanity.
 *
 * Reads scripts/checklist-import/checklist-sanity.json. For each checklist:
 * upload thumbnail + Main image, then `createOrReplace` the `checklistPage`
 * doc with `_id = checklist-<slug>`. Asset uploads are cached by URL.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/checklist-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/checklist-import/import-to-sanity.mjs       # parse + log only
 *   LIMIT=1   node scripts/checklist-import/import-to-sanity.mjs       # import first N
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

const { checklists } = JSON.parse(
  readFileSync(here("checklist-sanity.json"), "utf8"),
);

const assetCache = new Map(); // url → Sanity asset _id

async function uploadFromUrl(url, kind = "image") {
  if (!url) return null;
  if (assetCache.has(url)) return assetCache.get(url);
  if (DRY_RUN) {
    const fakeId = `${kind}-dry-${assetCache.size}`;
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
    const filename = url.split("/").pop()?.split("?")[0] || kind;
    const asset = await client.assets.upload(kind, buf, { filename });
    assetCache.set(url, asset._id);
    return asset._id;
  } catch (err) {
    console.warn(`  ! upload failed ${url}: ${err.message}`);
    assetCache.set(url, null);
    return null;
  }
}

function imageRef(assetId, extras = {}) {
  return assetId
    ? {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
        ...extras,
      }
    : undefined;
}

function safeId(id) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function resolveMainSectionImage(mainSection) {
  if (!mainSection) return;
  const url = mainSection.framerImageUrl;
  const alt = mainSection.framerImageAlt;
  delete mainSection.framerImageUrl;
  delete mainSection.framerImageAlt;
  if (!url) return;
  const assetId = await uploadFromUrl(url, "image");
  if (assetId) {
    mainSection.image = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      ...(alt ? { alt } : {}),
    };
  } else {
    console.warn(`  ! main image dropped (upload failed): ${url}`);
  }
}

async function upsert() {
  let count = 0;
  for (const item of checklists) {
    if (count >= LIMIT) break;
    count++;
    console.log(
      `[${count}/${Math.min(checklists.length, LIMIT)}] ${item.slug.current}`,
    );

    let thumbnail;
    if (item.framerThumbnailUrl) {
      const assetId = await uploadFromUrl(item.framerThumbnailUrl, "image");
      thumbnail = imageRef(assetId, {
        alt: item.framerThumbnailAlt || undefined,
      });
    }

    await resolveMainSectionImage(item.mainSection);

    const { framerThumbnailUrl, framerThumbnailAlt, ...rest } = item;
    void framerThumbnailUrl;
    void framerThumbnailAlt;

    const doc = {
      ...rest,
      _id: safeId(item._id),
      slug: { _type: "slug", current: safeId(item.slug.current) },
      ...(thumbnail ? { thumbnail } : {}),
    };

    if (DRY_RUN) {
      console.log(`  [dry] checklistPage ${doc._id}`);
    } else {
      await client.createOrReplace(doc);
      console.log(`  ✓ checklistPage ${doc._id}`);
    }
  }
}

async function main() {
  console.log(
    `${DRY_RUN ? "DRY RUN — " : ""}importing ${Math.min(
      checklists.length,
      LIMIT,
    )} checklistPage docs`,
  );
  await upsert();
  console.log(`Done. ${assetCache.size} unique asset URLs processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
