#!/usr/bin/env node
/**
 * Re-upload the "Comments in context" collab preview for the image-review
 * and lottie-files-review docs after the source PNGs were updated, without
 * disturbing any other fields. Safer than re-running the full seed scripts.
 *
 * Usage:
 *   SANITY_API_TOKEN=... node scripts/patch-collab-preview-1.mjs
 *   DRY_RUN=1 node scripts/patch-collab-preview-1.mjs
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

const CARD_KEY = "comments-in-context";

const TARGETS = [
  {
    docId: "reviewPage-image-review",
    file: "public/images/review/collab/preview-1.png",
  },
  {
    docId: "reviewPage-lottie-files-review",
    file: "public/images/review/collab/preview-1-lottie.png",
  },
];

async function uploadAsset(localPath) {
  if (DRY_RUN) {
    return {
      _type: "image",
      asset: { _type: "reference", _ref: `image-dry-${basename(localPath)}` },
    };
  }
  const absPath = resolve(localPath);
  const body = readFileSync(absPath);
  const asset = await client.assets.upload("image", body, {
    filename: basename(localPath),
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  for (const { docId, file } of TARGETS) {
    const image = await uploadAsset(file);
    if (DRY_RUN) {
      console.log(`Would patch ${docId} collab[${CARD_KEY}].preview =`, image);
      continue;
    }
    const res = await client
      .patch(docId)
      .set({ [`collaborationTools.cards[_key=="${CARD_KEY}"].preview`]: image })
      .commit();
    console.log(`Patched ${res._id} (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
