#!/usr/bin/env node
/**
 * Import the transformed Framer use-case data into Sanity.
 *
 * Reads scripts/use-case-import/use-case-sanity.json. For each use case:
 * upload thumbnail, icon, every problem/solution/testimonial image, then
 * `createOrReplace` the `useCasePage` doc with `_id = use-case-<slug>`.
 * Asset uploads are cached by URL within a single run so duplicates upload
 * once.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/use-case-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/use-case-import/import-to-sanity.mjs       # parse + log only
 *   LIMIT=1   node scripts/use-case-import/import-to-sanity.mjs       # import first N
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

const { useCases } = JSON.parse(
  readFileSync(here("use-case-sanity.json"), "utf8"),
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

async function resolveItemImage(item) {
  if (!item.framerImageUrl) {
    delete item.framerImageUrl;
    delete item.framerImageAlt;
    return;
  }
  const url = item.framerImageUrl;
  const alt = item.framerImageAlt;
  const assetId = await uploadFromUrl(url, "image");
  delete item.framerImageUrl;
  delete item.framerImageAlt;
  if (assetId) {
    item.image = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      ...(alt ? { alt } : {}),
    };
  } else {
    console.warn(`  ! item image dropped (upload failed): ${url}`);
  }
}

function safeId(id) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function upsertUseCases() {
  let count = 0;
  for (const item of useCases) {
    if (count >= LIMIT) break;
    count++;
    console.log(
      `[${count}/${Math.min(useCases.length, LIMIT)}] ${item.slug.current}`,
    );

    let thumbnail;
    if (item.framerThumbnailUrl) {
      const assetId = await uploadFromUrl(item.framerThumbnailUrl, "image");
      thumbnail = imageRef(assetId, {
        alt: item.framerThumbnailAlt || undefined,
      });
    }

    let icon;
    if (item.framerIconUrl) {
      const assetId = await uploadFromUrl(item.framerIconUrl, "image");
      icon = imageRef(assetId, {
        alt: item.framerIconAlt || undefined,
      });
    }

    if (item.problemSection?.items) {
      for (const sub of item.problemSection.items) {
        await resolveItemImage(sub);
      }
    }
    if (item.solutionSection?.items) {
      for (const sub of item.solutionSection.items) {
        await resolveItemImage(sub);
      }
    }
    if (item.testimonials) {
      for (const sub of item.testimonials) {
        await resolveItemImage(sub);
      }
    }

    const {
      framerThumbnailUrl,
      framerThumbnailAlt,
      framerIconUrl,
      framerIconAlt,
      ...rest
    } = item;
    void framerThumbnailUrl;
    void framerThumbnailAlt;
    void framerIconUrl;
    void framerIconAlt;

    const doc = {
      ...rest,
      _id: safeId(item._id),
      slug: { _type: "slug", current: safeId(item.slug.current) },
      ...(thumbnail ? { thumbnail } : {}),
      ...(icon ? { icon } : {}),
    };

    if (DRY_RUN) {
      console.log(`  [dry] useCasePage ${doc._id}`);
    } else {
      await client.createOrReplace(doc);
      console.log(`  ✓ useCasePage ${doc._id}`);
    }
  }
}

async function main() {
  console.log(
    `${DRY_RUN ? "DRY RUN — " : ""}importing ${Math.min(
      useCases.length,
      LIMIT,
    )} useCasePage docs`,
  );
  await upsertUseCases();
  console.log(`Done. ${assetCache.size} unique asset URLs processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
