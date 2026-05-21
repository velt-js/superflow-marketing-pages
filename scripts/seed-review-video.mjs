#!/usr/bin/env node
/**
 * Seed reviewPage-video-review in Sanity, including the two per-feature
 * sections (FeatureCards + CollaborationTools). Initial uploads mirror
 * the current Superflow homepage defaults so /image-review renders
 * identically before/after the CMS migration; per-feature swaps happen
 * by editing the doc in Sanity Studio after seeding.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-review-image.mjs
 *   DRY_RUN=1 node scripts/seed-review-image.mjs
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
  const heroMedia = await uploadAsset("public/review/hero/image-hero.png");

  // FeatureCards — 4 hero composites re-exported from Figma 18:3443 +
  // integrations footer logos.
  const fcReview = "public/images/review/featurecards";
  const fcLogos = "public/images/sections/featurecards";
  const card1Image = await uploadAsset(`${fcReview}/c1-video.png`);
  const card2Image = await uploadAsset(`${fcReview}/c2-hero.png`);
  const card3Image = await uploadAsset(`${fcReview}/c3-hero.png`);
  const card4Image = await uploadAsset(`${fcReview}/c4-hero.png`);
  const mondayLogo = await uploadAsset(`${fcLogos}/monday.png`);
  const clickupLogo = await uploadAsset(`${fcLogos}/clickup.png`);
  const slackLogo = await uploadAsset(`${fcLogos}/slack.png`);
  const asanaLogo = await uploadAsset(`${fcLogos}/asana.png`);

  // CollaborationTools — icons + previews come from the Superflow homepage
  // (`public/images/sections/collaboration/`) so they render in color on
  // hover via the component's `grayscale group-hover:grayscale-0` filter.
  // Exception: C1's preview has no color counterpart on the homepage, so
  // it keeps the Figma-exported placeholder under public/images/review/collab/.
  const cHome = "public/images/sections/collaboration";
  const cFig = "public/images/review/collab";
  const collab = [
    {
      title: "Comments in context",
      body: "Pin comments directly to frames & elements for clearer feedback",
      icon: `${cHome}/icon-comments.png`,
      preview: `${cFig}/preview-1-video.png`,
    },
    {
      title: "Record richer feedback",
      body: "Direct comment with Loom-style recordings without leaving the app",
      icon: `${cHome}/icon-record.png`,
      preview: `${cHome}/record-richer-feedback.png`,
    },
    {
      title: "Private & Guest Mode",
      body: "Keep wires from crossing: Clients use guest mode while your team goes private",
      icon: `${cHome}/icon-incognito.png`,
      preview: `${cHome}/private-guest-mode.png`,
    },
    {
      title: "Review from wherever",
      body: "Works across all devices for seamless reviews on your time",
      icon: `${cHome}/icon-devices.png`,
      preview: `${cHome}/review-from-wherever.png`,
    },
    {
      title: "Who's doing what?",
      body: "Free built-in task management with Slack and email notifications",
      icon: `${cHome}/icon-tasks.png`,
      preview: `${cHome}/whos-doing-what.png`,
    },
    {
      title: "Versioning",
      body: "Go from final to final final without losing a single comment",
      icon: `${cHome}/icon-versions.png`,
      preview: `${cHome}/versioning.png`,
    },
  ];
  const collabCards = [];
  for (const c of collab) {
    collabCards.push({
      _key: c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: c.title,
      body: c.body,
      icon: await uploadAsset(c.icon),
      preview: await uploadAsset(c.preview),
    });
  }

  const doc = {
    _id: "reviewPage-video-review",
    _type: "reviewPage",
    title: "Video Review",
    slug: { _type: "slug", current: "video-review" },
    feature: "video",
    hero: {
      headlineLine1: "Ship Video Assets",
      subheading: "Get approved with fewer rounds of reviews. Get back to creating.",
      personaLeft: { label: "Editor", color: "#3DB7E4" },
      personaRight: { label: "Director", color: "#E934BF" },
      primaryCta: { label: "Try Demo", href: "/demo" },
      secondaryCta: { label: "Upload Now For Free", href: "/book-demo" },
      heroMedia,
    },
    featureCards: {
      eyebrow: "Image Review",
      heading: "Everything you need to ship images faster",
      cards: [
        {
          _key: "fc-1",
          titleLine1: "Review pixels",
          titleLine2: "with precision",
          subtitle: "Comment directly on elements for clearer feedback",
          image: card1Image,
        },
        {
          _key: "fc-2",
          titleLine1: "Manage, prioritize",
          titleLine2: "& assign",
          subtitle: "Use our built-in task manager or integrate your own.",
          image: card2Image,
        },
        {
          _key: "fc-3",
          titleLine1: "Get approvals",
          titleLine2: "at hyper speed",
          subtitle: "Built-in approvals for less back-and-forth-ing.",
          image: card3Image,
        },
        {
          _key: "fc-4",
          titleLine1: "Sync with",
          titleLine2: "your tools",
          subtitle: "Seamlessly integrate your Slack or favorite task manager",
          image: card4Image,
        },
      ],
      integrationLogos: [
        { _key: "monday", name: "Monday.com", logo: mondayLogo, href: "https://monday.com" },
        { _key: "clickup", name: "ClickUp", logo: clickupLogo, href: "https://clickup.com" },
        { _key: "slack", name: "Slack", logo: slackLogo, href: "https://slack.com" },
        { _key: "asana", name: "Asana", logo: asanaLogo, href: "https://asana.com" },
      ],
      integrationsCtaLabel: "View Integrations",
      integrationsCtaHref: "/integrations",
    },
    collaborationTools: {
      headingLine1: "Collaboration tools",
      headingLine2: "for faster teamwork",
      cards: collabCards,
      ctaLabel: "Try Now For Free",
      ctaHref: "/book-demo",
    },
    faqFormatsAnswer: "MP4, MOV, AVI, WebM and HEVC.",
    metaTitle: "Video Review — Superflow by Velt",
    metaDescription:
      "Ship video assets impossibly fast. Comment, prioritise, approve and sync video reviews with your existing tools.",
  };

  if (DRY_RUN) {
    console.log(JSON.stringify(doc, null, 2));
    return;
  }
  const res = await client.createOrReplace(doc);
  console.log("Seeded:", res._id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
