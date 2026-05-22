#!/usr/bin/env node
/**
 * Re-seed the collaborationTools card-1 preview image for every reviewPage
 * doc, using the per-feature variant under public/images/review/collab/.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-collab-preview-1.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error("Set SANITY_API_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId: "sckr62cw",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const FEATURE_TO_PATH = {
  image: "public/images/review/collab/preview-1.png",
  lottie: "public/images/review/collab/preview-1-lottie.png",
  pdf: "public/images/review/collab/preview-1-pdf.png",
  video: "public/images/review/collab/preview-1-video.png",
  website: "public/images/review/collab/preview-1-website.png",
};

async function uploadAsset(localPath) {
  const body = readFileSync(resolve(localPath));
  const asset = await client.assets.upload("image", body, {
    filename: basename(localPath),
  });
  return asset._id;
}

const assetByFeature = {};
for (const [feature, path] of Object.entries(FEATURE_TO_PATH)) {
  assetByFeature[feature] = await uploadAsset(path);
  console.log(`uploaded ${feature} → ${assetByFeature[feature]}`);
}

const docs = await client.fetch(
  `*[_type == "reviewPage"]{ _id, feature, collaborationTools }`,
);
console.log(`fetched ${docs.length} doc(s)`);

for (const doc of docs) {
  const cards = doc.collaborationTools?.cards?.slice() ?? [];
  if (!cards[0]) {
    console.log(`- ${doc._id}: no collab card 1, skipping`);
    continue;
  }
  const assetId = assetByFeature[doc.feature];
  if (!assetId) {
    console.log(`- ${doc._id}: unknown feature "${doc.feature}", skipping`);
    continue;
  }
  cards[0] = {
    ...cards[0],
    preview: { _type: "image", asset: { _type: "reference", _ref: assetId } },
  };
  await client
    .patch(doc._id)
    .set({ "collaborationTools.cards": cards })
    .commit();
  console.log(`✓ ${doc._id} (feature=${doc.feature})`);
}
