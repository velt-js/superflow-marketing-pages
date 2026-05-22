#!/usr/bin/env node
/**
 * Migrate all reviewPage docs to the new feature-card schema:
 *   - cardType per slot index (simple / integrationIcons / simple / integrationPills)
 *     plus websiteTabs for slot 0 on website-review only
 *   - iconType per slot index (comment / prioritize / approve / integrate)
 *   - title = `${titleLine1}\n${titleLine2}` (single field)
 *   - imageAspectRatio on slot 1 (1460/620) and slot 3 (1400/300)
 *   - Replace images on slots 1, 2, 3 with the shared home-page assets
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-feature-cards.mjs
 *   DRY_RUN=1 node scripts/migrate-feature-cards.mjs
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

const CARD_TYPES = ["simple", "integrationIcons", "simple", "integrationPills"];
const ICON_TYPES = ["comment", "prioritize", "approve", "integrate"];
const ASPECT_BY_INDEX = { 1: "1460/620", 3: "1400/300" };

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

function joinTitle(card) {
  if (card.title) return card.title;
  const l1 = card.titleLine1 ?? "";
  const l2 = card.titleLine2 ?? "";
  return l2 ? `${l1}\n${l2}` : l1;
}

async function main() {
  console.log("Uploading shared home-page card images…");
  const homeDir = "public/images/sections/home-cards";
  const sharedAssetByIndex = {
    1: await uploadAsset(`${homeDir}/manage-prioritize.png`),
    2: await uploadAsset(`${homeDir}/get-approvals.png`),
    3: await uploadAsset(`${homeDir}/sync-with-tools.png`),
  };
  console.log("  asset IDs:", sharedAssetByIndex);

  console.log("Fetching reviewPage docs…");
  const docs = DRY_RUN
    ? [
        { _id: "DRY_RUN", feature: "lottie", featureCards: { cards: Array(4).fill({}) } },
      ]
    : await client.fetch(
        `*[_type == "reviewPage"]{ _id, slug, feature, featureCards }`,
      );
  console.log(`  fetched ${docs.length} doc(s)`);

  for (const doc of docs) {
    if (!doc.featureCards?.cards?.length) {
      console.log(`- ${doc._id}: no cards, skipping`);
      continue;
    }
    const isWebsite = doc.feature === "website";
    const cards = doc.featureCards.cards;
    const patchedCards = cards.map((card, i) => {
      const next = { ...card };
      next.cardType =
        i === 0 && isWebsite
          ? "websiteTabs"
          : CARD_TYPES[i] ?? CARD_TYPES[CARD_TYPES.length - 1];
      next.iconType = ICON_TYPES[i] ?? ICON_TYPES[ICON_TYPES.length - 1];
      next.title = joinTitle(card);
      delete next.titleLine1;
      delete next.titleLine2;
      if (ASPECT_BY_INDEX[i]) next.imageAspectRatio = ASPECT_BY_INDEX[i];
      if (sharedAssetByIndex[i]) next.image = imageRef(sharedAssetByIndex[i]);
      return next;
    });

    if (DRY_RUN) {
      console.log(`- ${doc._id}: would patch`, JSON.stringify(patchedCards, null, 2));
      continue;
    }
    await client
      .patch(doc._id)
      .set({ "featureCards.cards": patchedCards })
      .commit();
    console.log(`✓ Patched ${doc._id} (${cards.length} cards)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
