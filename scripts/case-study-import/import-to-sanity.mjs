#!/usr/bin/env node
/**
 * Import the transformed Framer case-study data into Sanity.
 *
 * Reads scripts/case-study-import/case-study-sanity.json. For each case
 * study: upload thumbnail, customer logo, every problem-section image,
 * every solution-section mp4 video, and the testimonial avatar; then
 * `createOrReplace` the `caseStudyPage` doc with
 * `_id = case-study-<slug>`. Asset uploads are cached by URL within a
 * single run so duplicates upload once.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/case-study-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/case-study-import/import-to-sanity.mjs       # parse + log only
 *   LIMIT=1   node scripts/case-study-import/import-to-sanity.mjs       # import first N
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

const { caseStudies } = JSON.parse(
  readFileSync(here("case-study-sanity.json"), "utf8"),
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

function fileRef(assetId) {
  return assetId
    ? { _type: "file", asset: { _type: "reference", _ref: assetId } }
    : undefined;
}

async function resolveProblemItemImage(item) {
  const url = item.framerImageUrl;
  const alt = item.framerImageAlt;
  delete item.framerImageUrl;
  delete item.framerImageAlt;
  if (!url) return;
  const assetId = await uploadFromUrl(url, "image");
  if (assetId) {
    item.image = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      ...(alt ? { alt } : {}),
    };
  } else {
    console.warn(`  ! problem image dropped (upload failed): ${url}`);
  }
}

async function resolveSolutionItemVideo(item) {
  const url = item.framerVideoUrl;
  delete item.framerVideoUrl;
  if (!url) return;
  const assetId = await uploadFromUrl(url, "file");
  if (assetId) {
    item.video = fileRef(assetId);
  } else {
    console.warn(`  ! solution video dropped (upload failed): ${url}`);
  }
}

async function resolveTestimonialImage(testimonial) {
  const url = testimonial.framerProfileImageUrl;
  const alt = testimonial.framerProfileImageAlt;
  delete testimonial.framerProfileImageUrl;
  delete testimonial.framerProfileImageAlt;
  if (!url) return;
  const assetId = await uploadFromUrl(url, "image");
  if (assetId) {
    testimonial.profileImage = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      ...(alt ? { alt } : {}),
    };
  } else {
    console.warn(`  ! testimonial image dropped (upload failed): ${url}`);
  }
}

function safeId(id) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function upsertCaseStudies() {
  let count = 0;
  for (const item of caseStudies) {
    if (count >= LIMIT) break;
    count++;
    console.log(
      `[${count}/${Math.min(caseStudies.length, LIMIT)}] ${item.slug.current}`,
    );

    let thumbnail;
    if (item.framerThumbnailUrl) {
      const assetId = await uploadFromUrl(item.framerThumbnailUrl, "image");
      thumbnail = imageRef(assetId, {
        alt: item.framerThumbnailAlt || undefined,
      });
    }

    let logo;
    if (item.framerLogoUrl) {
      const assetId = await uploadFromUrl(item.framerLogoUrl, "image");
      logo = imageRef(assetId, {
        alt: item.framerLogoAlt || undefined,
      });
    }

    if (item.problemSection?.items) {
      for (const sub of item.problemSection.items) {
        await resolveProblemItemImage(sub);
      }
    }
    if (item.solutionSection?.items) {
      for (const sub of item.solutionSection.items) {
        await resolveSolutionItemVideo(sub);
      }
    }
    if (item.testimonial) {
      await resolveTestimonialImage(item.testimonial);
    }

    const {
      framerThumbnailUrl,
      framerThumbnailAlt,
      framerLogoUrl,
      framerLogoAlt,
      ...rest
    } = item;
    void framerThumbnailUrl;
    void framerThumbnailAlt;
    void framerLogoUrl;
    void framerLogoAlt;

    const doc = {
      ...rest,
      _id: safeId(item._id),
      slug: { _type: "slug", current: safeId(item.slug.current) },
      ...(thumbnail ? { thumbnail } : {}),
      ...(logo ? { logo } : {}),
    };

    if (DRY_RUN) {
      console.log(`  [dry] caseStudyPage ${doc._id}`);
    } else {
      await client.createOrReplace(doc);
      console.log(`  ✓ caseStudyPage ${doc._id}`);
    }
  }
}

async function main() {
  console.log(
    `${DRY_RUN ? "DRY RUN — " : ""}importing ${Math.min(
      caseStudies.length,
      LIMIT,
    )} caseStudyPage docs`,
  );
  await upsertCaseStudies();
  console.log(`Done. ${assetCache.size} unique asset URLs processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
