#!/usr/bin/env node
/**
 * Import the transformed Framer integrations data into Sanity.
 *
 * Reads scripts/integrations-import/integrations-sanity.json. For each
 * integration: upload thumbnail, app logo, installation video, and any
 * inline step-body images, then `createOrReplace` the `integrationPage`
 * doc with `_id = integration-<slug>`. Asset uploads are cached by URL
 * within a single run so duplicates upload once.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/integrations-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/integrations-import/import-to-sanity.mjs       # parse + log only
 *   LIMIT=1   node scripts/integrations-import/import-to-sanity.mjs       # import first N
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

const { integrations } = JSON.parse(
  readFileSync(here("integrations-sanity.json"), "utf8"),
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

async function rewriteBodyImages(body) {
  if (!Array.isArray(body)) return;
  for (const node of body) {
    if (node._type === "integrationBodyImage" && node.framerImageUrl) {
      const assetId = await uploadFromUrl(node.framerImageUrl, "image");
      const url = node.framerImageUrl;
      delete node.framerImageUrl;
      if (assetId) {
        node.asset = { _type: "reference", _ref: assetId };
      } else {
        console.warn(`  ! step image dropped (upload failed): ${url}`);
      }
    }
  }
}

async function rewriteSteps(steps) {
  if (!Array.isArray(steps)) return;
  for (const step of steps) {
    await rewriteBodyImages(step.body);
  }
}

function safeId(id) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function upsertIntegrations() {
  let count = 0;
  for (const item of integrations) {
    if (count >= LIMIT) break;
    count++;
    console.log(
      `[${count}/${Math.min(integrations.length, LIMIT)}] ${item.slug.current}`,
    );

    // Top-level assets
    let thumbnail;
    if (item.framerThumbnailUrl) {
      const assetId = await uploadFromUrl(item.framerThumbnailUrl, "image");
      thumbnail = imageRef(assetId, {
        alt: item.framerThumbnailAlt || undefined,
      });
    }

    let appLogo;
    if (item.framerAppLogoUrl) {
      const assetId = await uploadFromUrl(item.framerAppLogoUrl, "image");
      appLogo = imageRef(assetId, {
        alt: item.framerAppLogoAlt || undefined,
      });
    }

    let installationVideoFile;
    if (item.framerInstallationVideoUrl) {
      const assetId = await uploadFromUrl(
        item.framerInstallationVideoUrl,
        "file",
      );
      installationVideoFile = fileRef(assetId);
    }

    // Inline step images
    await rewriteSteps(item.steps);

    const doc = {
      _id: safeId(item._id),
      _type: "integrationPage",
      title: item.title,
      slug: { _type: "slug", current: safeId(item.slug.current) },
      ...(item.metaTitle ? { metaTitle: item.metaTitle } : {}),
      ...(item.metaDescription
        ? { metaDescription: item.metaDescription }
        : {}),
      ...(item.authorName ? { authorName: item.authorName } : {}),
      ...(item.publishedDateText
        ? { publishedDateText: item.publishedDateText }
        : {}),
      ...(item.appName ? { appName: item.appName } : {}),
      ...(typeof item.isTaskApp === "boolean"
        ? { isTaskApp: item.isTaskApp }
        : {}),
      ...(item.linkToApp ? { linkToApp: item.linkToApp } : {}),
      ...(item.installationVideoLink
        ? { installationVideoLink: item.installationVideoLink }
        : {}),
      ...(thumbnail ? { thumbnail } : {}),
      ...(appLogo ? { appLogo } : {}),
      ...(installationVideoFile ? { installationVideoFile } : {}),
      ...(item.description?.length ? { description: item.description } : {}),
      ...(item.overview?.length ? { overview: item.overview } : {}),
      ...(item.steps?.length ? { steps: item.steps } : {}),
    };

    if (DRY_RUN) {
      console.log(`  [dry] integrationPage ${doc._id}`);
    } else {
      await client.createOrReplace(doc);
      console.log(`  ✓ integrationPage ${doc._id}`);
    }
  }
}

async function main() {
  console.log(
    `${DRY_RUN ? "DRY RUN — " : ""}importing ${Math.min(
      integrations.length,
      LIMIT,
    )} integrationPage docs`,
  );
  await upsertIntegrations();
  console.log(`Done. ${assetCache.size} unique asset URLs processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
