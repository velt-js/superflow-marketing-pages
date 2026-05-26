#!/usr/bin/env node
/**
 * Import transformed Alternative docs into Sanity.
 *
 * Reads scripts/user-persona-import/framer-up-sanity.json. Recursively walks
 * each doc; any node with `framerImageUrl` or `framerFileUrl` triggers a
 * download + upload to Sanity (assets cached by URL within the run). The
 * marker is replaced with a proper Sanity asset reference. Then
 * createOrReplace persists the doc keyed `up-<slug>`.
 *
 * Filename extension is preserved on upload, so SVGs land as SVGs.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/user-persona-import/import-to-sanity.mjs
 *   DRY_RUN=1 node scripts/user-persona-import/import-to-sanity.mjs
 *   LIMIT=1   node scripts/user-persona-import/import-to-sanity.mjs
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

const docs = JSON.parse(readFileSync(here("framer-up-sanity.json"), "utf8"));

const assetCache = new Map(); // url → Sanity asset _id (or null on failure)

function safeFilename(url) {
  const tail = url.split("/").pop()?.split("?")[0] || "asset";
  // ensure it has an extension; Sanity uses it to detect mime
  return tail.includes(".") ? tail : `${tail}.bin`;
}

async function uploadFromUrl(url, kind) {
  if (!url) return null;
  if (assetCache.has(url)) return assetCache.get(url);
  if (DRY_RUN) {
    const fake = `${kind}-dry-${assetCache.size}`;
    assetCache.set(url, fake);
    return fake;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`    ! fetch ${res.status} for ${url}`);
      assetCache.set(url, null);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const filename = safeFilename(url);
    const asset = await client.assets.upload(kind, buf, { filename });
    assetCache.set(url, asset._id);
    return asset._id;
  } catch (err) {
    console.warn(`    ! upload failed ${url}: ${err.message}`);
    assetCache.set(url, null);
    return null;
  }
}

async function resolveAssetMarker(node) {
  if (node.framerImageUrl) {
    const id = await uploadFromUrl(node.framerImageUrl, "image");
    delete node.framerImageUrl;
    if (id) {
      node._type = "image";
      node.asset = { _type: "reference", _ref: id };
    }
  } else if (node.framerFileUrl) {
    const id = await uploadFromUrl(node.framerFileUrl, "file");
    delete node.framerFileUrl;
    if (id) {
      node._type = "file";
      node.asset = { _type: "reference", _ref: id };
    }
  }
}

async function walkAndResolve(value) {
  if (Array.isArray(value)) {
    for (const item of value) await walkAndResolve(item);
    return;
  }
  if (value && typeof value === "object") {
    await resolveAssetMarker(value);
    for (const v of Object.values(value)) await walkAndResolve(v);
  }
}

async function main() {
  let n = 0;
  for (const doc of docs) {
    if (n >= LIMIT) break;
    n++;
    console.log(`[${n}/${Math.min(docs.length, LIMIT)}] ${doc.slug}`);
    await walkAndResolve(doc);

    // Reshape slug into Sanity slug type
    const toPersist = {
      ...doc,
      slug: { _type: "slug", current: doc.slug },
    };

    if (DRY_RUN) {
      console.log(`  [dry] userPersonaPage ${doc._id}`);
    } else {
      await client.createOrReplace(toPersist);
      console.log(`  ✓ userPersonaPage ${doc._id}`);
    }
  }
  console.log(`Done. ${assetCache.size} unique asset URLs processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
