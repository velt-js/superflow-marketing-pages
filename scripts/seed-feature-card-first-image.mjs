#!/usr/bin/env node
/**
 * Replace the slot-0 (Review pixels) image on every reviewPage doc with
 * the correct per-feature artwork.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-card-first-image.mjs
 *   DRY_RUN=1 node scripts/seed-feature-card-first-image.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const DRY_RUN = process.env.DRY_RUN === "1";
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

const FEATURE_TO_PATH = {
  image: "public/review/hero/image-hero.png",
  lottie: "public/images/review/featurecards/c1-lottie.png",
  pdf: "public/images/review/featurecards/c1-pdf.png",
  video: "public/images/review/featurecards/c1-video.png",
  website: "public/images/review/featurecards/c1-website-1.png",
};

async function uploadAsset(localPath) {
  if (DRY_RUN) return `image-dry-${basename(localPath)}`;
  const absPath = resolve(localPath);
  const body = readFileSync(absPath);
  const asset = await client.assets.upload("image", body, {
    filename: basename(localPath),
  });
  return asset._id;
}

function imageRef(assetId) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

async function main() {
  console.log("Uploading per-feature slot-0 images…");
  const assetByFeature = {};
  for (const [feature, path] of Object.entries(FEATURE_TO_PATH)) {
    assetByFeature[feature] = await uploadAsset(path);
    console.log(`  ${feature} → ${assetByFeature[feature]}`);
  }

  console.log("Fetching reviewPage docs…");
  const docs = DRY_RUN
    ? Object.keys(FEATURE_TO_PATH).map((f) => ({
        _id: `DRY_RUN-${f}`,
        feature: f,
        featureCards: { cards: [{}] },
      }))
    : await client.fetch(`*[_type == "reviewPage"]{ _id, feature, featureCards }`);
  console.log(`  fetched ${docs.length} doc(s)`);

  for (const doc of docs) {
    if (!doc.featureCards?.cards?.[0]) {
      console.log(`- ${doc._id}: no slot-0 card, skipping`);
      continue;
    }
    const assetId = assetByFeature[doc.feature];
    if (!assetId) {
      console.log(`- ${doc._id}: unknown feature "${doc.feature}", skipping`);
      continue;
    }
    const cards = doc.featureCards.cards.slice();
    cards[0] = { ...cards[0], image: imageRef(assetId) };

    if (DRY_RUN) {
      console.log(`- ${doc._id}: would set slot-0 image to ${assetId}`);
      continue;
    }
    await client
      .patch(doc._id)
      .set({ "featureCards.cards": cards })
      .commit();
    console.log(`✓ Patched ${doc._id} (feature=${doc.feature})`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
