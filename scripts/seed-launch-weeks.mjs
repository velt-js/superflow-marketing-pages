#!/usr/bin/env node
/**
 * Seed launchWeek documents in Sanity with the data from the previously
 * static /launch-week page. Weeks 02-04 ship without features — the site
 * shows the "Features will be revealed on first day" fallback until
 * marketing fills them in via Studio. Feature images are uploaded later
 * in Studio too.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-launch-weeks.mjs
 *   DRY_RUN=1 node scripts/seed-launch-weeks.mjs
 *
 * UNPUBLISH_BLOG=1 additionally deletes the PUBLISHED Custom Status post
 * (one-off cleanup of the earlier dummy seed). Never set it after marketing
 * has published the real post — it would take the post off the live site.
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

const CUSTOM_STATUS_BLOG_ID = "blogPost-launch-custom-status";

async function uploadAsset(localPath) {
  if (DRY_RUN) {
    return {
      _type: "image",
      asset: { _type: "reference", _ref: `image-dry-${basename(localPath)}` },
    };
  }
  const body = readFileSync(resolve(localPath));
  const asset = await client.assets.upload("image", body, {
    filename: basename(localPath),
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

function bodyImage(key, image, alt, caption) {
  return { _type: "blogBodyImage", _key: key, asset: image.asset, alt, caption };
}

/**
 * Portable-text block builder. `parts` is a string or an array of strings
 * and `{ text, href }` link segments; keys are derived from `key` so reruns
 * stay deterministic.
 */
function block(key, parts, opts = {}) {
  const segments = Array.isArray(parts) ? parts : [parts];
  const markDefs = [];
  const children = segments.map((part, index) => {
    if (typeof part === "string") {
      return { _type: "span", _key: `${key}-s${index}`, text: part, marks: [] };
    }
    const defKey = `${key}-l${index}`;
    markDefs.push({ _type: "link", _key: defKey, href: part.href });
    return { _type: "span", _key: `${key}-s${index}`, text: part.text, marks: [defKey] };
  });
  return {
    _type: "block",
    _key: key,
    style: opts.style ?? "normal",
    markDefs,
    children,
    ...(opts.list ? { listItem: opts.list, level: 1 } : {}),
  };
}

const SETTINGS_URL = "https://app.usesuperflow.com/settings/advanced-features";

// Launch post for the Week 01 "Custom Status" card. Seeded as a DRAFT
// (drafts. prefix) so it stays off the live site until marketing hits
// Publish in Studio; the card's weak reference resolves to null until then,
// keeping the Read More button disabled.
function buildCustomStatusBlog({ heroImage, addImage, deleteImage }) {
  return {
  _id: `drafts.${CUSTOM_STATUS_BLOG_ID}`,
  _type: "blogPost",
  title: "Introducing Custom Status: Bring Your Own Review Workflow to Superflow",
  slug: { _type: "slug", current: "introducing-custom-status" },
  description:
    "Create custom comment statuses in Superflow that match your agency's internal review stages, and track every comment on the kanban board in your portal.",
  publishedAt: "2026-06-22T09:00:00Z",
  readTime: "3 min read",
  tags: ["launch-week", "product-update", "custom-status"],
  metaTitle: "Introducing Custom Status | Superflow",
  metaDescription:
    "Custom Status lets agencies create their own comment statuses in Superflow, matching internal QA stages and tracking them on the portal kanban board.",
  featuredImage: heroImage,
  body: [
    block("cs-intro1", [
      "Every agency runs reviews a little differently. Some pass work through internal QA before the client ever sees it; others route feedback through design review, dev handoff, and a final sign-off. Until now, Superflow comments only spoke one language: ours. Today, as the first release of ",
      { text: "Launch Week 01", href: "https://usesuperflow.com/launch-week" },
      ", they speak yours.",
    ]),
    block("cs-what-h", "What is Custom Status?", { style: "h2" }),
    block(
      "cs-what-p1",
      "Custom Status lets you create personalized comment statuses that fit your internal workflow. When anyone adds a comment on a review, they can pick your custom status straight from the comment header, and every comment shows up under that status on the kanban board inside the Superflow portal.",
    ),
    block(
      "cs-what-p2",
      "Your review stages, your names, your colors. Visible to everyone, on every project.",
    ),
    block("cs-why-h", "Why we built it", { style: "h2" }),
    block(
      "cs-why-p1",
      "Agencies told us the same thing again and again: they already had review stages built to support their internal QA process. But those stages lived in their task management tool, while the actual review happened in Superflow. Feedback had to be mentally translated between the two on every pass.",
    ),
    block(
      "cs-why-p2",
      "Custom Status closes that gap. Bring the stages your team already uses into your website review tool, and let comments move through your pipeline without leaving the page being reviewed.",
    ),
    block("cs-who-h", "Who is it for?", { style: "h2" }),
    block(
      "cs-who-p1",
      "It's built first for agencies with custom stages in their workflows, but any team whose review process goes beyond a simple open/resolved will feel at home: in-house design teams, marketing teams running CRO experiments, or dev shops with a formal QA pass.",
    ),
    block("cs-add-h", "How to add a custom status", { style: "h2" }),
    block("cs-add-1", [
      "Go to ",
      { text: "Settings → Advanced Features", href: SETTINGS_URL },
      " in the Superflow portal.",
    ], { list: "number" }),
    block("cs-add-2", "Under Comment Settings, toggle on Enable custom status.", { list: "number" }),
    block("cs-add-3", "Click “Add New”.", { list: "number" }),
    block("cs-add-4", "Choose a name, color, and icon for your new status, then save it.", { list: "number" }),
    block("cs-add-5", "Open any project and your new status is ready to use from the comment header.", { list: "number" }),
    bodyImage(
      "cs-add-img",
      addImage,
      "Add Status modal in Superflow with fields for status name, type, color, and icon",
      "Pick a name, color, and icon for your new status.",
    ),
    block(
      "cs-add-note",
      "Heads-up: a status can't be edited once it's created, so double-check the name, color, and icon before you save.",
    ),
    block("cs-del-h", "How to delete a status", { style: "h2" }),
    block("cs-del-1", [
      "Go to ",
      { text: "Settings → Advanced Features", href: SETTINGS_URL },
      ".",
    ], { list: "number" }),
    block("cs-del-2", "Scroll to the Custom Status section.", { list: "number" }),
    block("cs-del-3", "Click the status you want to delete.", { list: "number" }),
    block(
      "cs-del-4",
      "Choose where existing comments should be reassigned once the status is gone, so nothing gets lost.",
      { list: "number" },
    ),
    bodyImage(
      "cs-del-img",
      deleteImage,
      "Reassign Status modal in Superflow showing comments moving from a deleted status to Open",
      "Reassign comments to another status before deleting.",
    ),
    block("cs-del-note", "Note: the default statuses can't be deleted."),
    block("cs-cta-h", "Try it today", { style: "h2" }),
    block("cs-cta-p1", [
      "Custom Status is live now for all Superflow workspaces, and it's just day one. Two more features land this week as part of ",
      { text: "Launch Week 01", href: "https://usesuperflow.com/launch-week" },
      ": Feedback Screenshots on June 24 and In-App Notifications on June 26.",
    ]),
    block("cs-cta-p2", [
      { text: "Try Superflow for free", href: "https://app.usesuperflow.com/signup" },
      " and make your review workflow speak your team's language.",
    ]),
  ],
  };
}

const WEEKS = [
  {
    slug: "01",
    startDate: "2026-06-22",
    endDate: "2026-06-26",
    subtitle: "Experience the latest from Superflow",
    features: [
      { title: "Custom Status", date: "2026-06-22", blogRef: CUSTOM_STATUS_BLOG_ID },
      { title: "Feedback Screenshots", date: "2026-06-24" },
      { title: "In-App Notification", date: "2026-06-26" },
    ],
  },
  {
    slug: "02",
    startDate: "2026-06-29",
    endDate: "2026-07-03",
    subtitle: "Collaboration gets a serious upgrade",
    features: [],
  },
  {
    slug: "03",
    startDate: "2026-07-06",
    endDate: "2026-07-10",
    subtitle: "Faster reviews, fewer round-trips",
    features: [],
  },
  {
    slug: "04",
    startDate: "2026-07-13",
    endDate: "2026-07-17",
    subtitle: "Our biggest launch week yet",
    features: [],
  },
];

function buildDoc(week) {
  return {
    _id: `launchWeek-${week.slug}`,
    _type: "launchWeek",
    title: `Launch Week ${week.slug}`,
    slug: { _type: "slug", current: week.slug },
    startDate: week.startDate,
    endDate: week.endDate,
    subtitle: week.subtitle,
    features: week.features.map((feature, index) => ({
      _type: "launchWeekFeature",
      _key: `feature-${week.slug}-${index}`,
      title: feature.title,
      date: feature.date,
      ...(feature.blogRef
        ? { blog: { _type: "reference", _ref: feature.blogRef, _weak: true } }
        : {}),
    })),
  };
}

async function main() {
  const blogDoc = buildCustomStatusBlog({
    heroImage: await uploadAsset("public/images/custom-status/Blog Hero.png"),
    addImage: await uploadAsset("public/images/custom-status/Add.png"),
    deleteImage: await uploadAsset("public/images/custom-status/Delete.png"),
  });
  if (DRY_RUN) {
    console.log(`[dry-run] createOrReplace ${blogDoc._id}`);
  } else {
    const blogResult = await client.createOrReplace(blogDoc);
    console.log(`createOrReplace ${blogResult._id} ok`);
  }
  for (const week of WEEKS) {
    const doc = buildDoc(week);
    if (DRY_RUN) {
      console.log(`[dry-run] createOrReplace ${doc._id}`);
      console.log(JSON.stringify(doc, null, 2));
      continue;
    }
    const result = await client.createOrReplace(doc);
    console.log(`createOrReplace ${result._id} ok`);
  }
  if (process.env.UNPUBLISH_BLOG === "1" && !DRY_RUN) {
    await client.delete(CUSTOM_STATUS_BLOG_ID);
    console.log(`deleted published ${CUSTOM_STATUS_BLOG_ID}`);
  }
  console.log(DRY_RUN ? "Dry run complete." : "Seeded launch weeks.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
