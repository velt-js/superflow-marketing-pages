#!/usr/bin/env node
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

const path = "public/images/review/featurecards/c1-pdf.png";
const body = readFileSync(resolve(path));
const asset = await client.assets.upload("image", body, { filename: basename(path) });
console.log("uploaded:", asset._id);

const docs = await client.fetch(
  `*[_type == "reviewPage" && feature == "pdf"]{ _id, featureCards }`,
);
for (const doc of docs) {
  const cards = doc.featureCards?.cards?.slice() ?? [];
  if (!cards[0]) {
    console.log(`- ${doc._id}: no slot-0`);
    continue;
  }
  cards[0] = {
    ...cards[0],
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
  };
  await client.patch(doc._id).set({ "featureCards.cards": cards }).commit();
  console.log("✓", doc._id);
}
