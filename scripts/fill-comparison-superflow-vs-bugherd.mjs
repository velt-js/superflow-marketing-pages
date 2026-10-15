#!/usr/bin/env node
/**
 * Fill the comparison fields added in PR #135 on the Superflow vs BugHerd
 * page, and replace the two verdicts that leaked editor notes onto the live
 * page ("if it resolves even, it renders even").
 *
 * What it writes, and where each fact comes from:
 *
 *   pickSuperflow / pickCompetitor - restate claims already on the page
 *     (agents, link sign-off; BugHerd's Jira and Trello sync, its lower
 *     small-team price).
 *   preparedBy / methodNote        - the byline.
 *   superflowPlan                  - from the feature table in
 *     components/pricing/pricing-data.ts (what /pricing renders), only on
 *     the four dimensions that table covers. "Client says yes", "Where you
 *     review" and "What it remembers" are not in it, so they stay empty
 *     rather than guessed.
 *   leftSources                    - usesuperflow.ai/pricing on those same
 *     four dimensions, documented only, checked on CHECKED_ON. No BugHerd
 *     rows: its facts were checked in July 2026 without a recorded day, and
 *     the field needs one.
 *
 * Verdicts are replaced only while they still hold the old text, so an
 * editor's later change is never overwritten. Safe to run twice.
 *
 * Usage:
 *   DRY_RUN=1 node scripts/fill-comparison-superflow-vs-bugherd.mjs
 *   node --env-file=.env.local scripts/fill-comparison-superflow-vs-bugherd.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: DRY_RUN ? undefined : token,
  useCdn: false,
});

const DOC_ID = "comparisonPreviewVsPage-superflow-vs-bugherd";
const CHECKED_ON = "2026-10-15";
const PRICING_URL = "https://usesuperflow.ai/pricing";

const TOP_LEVEL = {
  pickSuperflow:
    "if you want agents to check every site change against your QA checklist before a person looks, and your client to sign off from a link with no account.",
  pickCompetitor:
    "if a careful human pass is enough, your team runs on Jira or Trello, and you want a lower price for a small team.",
  preparedBy: "the Superflow team",
  methodNote:
    "BugHerd facts checked against bugherd.com and bugherd.com/pricing in July 2026. Superflow plan limits checked against usesuperflow.ai/pricing in October 2026.",
};

/** Dimension key -> lowest plan that covers every fact on the Superflow card. */
const PLANS = {
  "k-dimensions0": "starter", // agents run every scan on every plan
  "k-dimensions3": "scale", // private comments
  "k-dimensions4": "growth", // automated screenshot; recordings are every plan
  "k-dimensions6": "scale", // custom statuses, Asana / Monday / ClickUp
};

/** Dimension key -> [old verdict, new verdict]. */
const VERDICTS = {
  "k-dimensions2": [
    "Both review the live site. Behind logins, the BugHerd side is pending verification; if it resolves even, it renders even.",
    "Both review the live site. Behind logins and SSO, the BugHerd side is not yet verified.",
  ],
  "k-dimensions3": [
    "Renders as a difference only if the BugHerd side resolves to one.",
    "Superflow keeps internal notes away from the client. Whether BugHerd can is not yet verified.",
  ],
};

async function main() {
  const doc = await client.fetch(`*[_id == $id][0]{ _id, dimensions[]{ _key, verdict } }`, {
    id: DOC_ID,
  });
  if (!doc) {
    console.error(`No document ${DOC_ID}.`);
    process.exit(1);
  }

  const set = { ...TOP_LEVEL };
  for (const [key, plan] of Object.entries(PLANS)) {
    set[`dimensions[_key=="${key}"].superflowPlan`] = plan;
    set[`dimensions[_key=="${key}"].leftSources`] = [
      {
        _key: `pricing-${CHECKED_ON}`,
        _type: "comparisonPreviewClaimSource",
        url: PRICING_URL,
        checkedOn: CHECKED_ON,
        method: "documented",
      },
    ];
  }
  for (const [key, [oldText, newText]] of Object.entries(VERDICTS)) {
    const current = (doc.dimensions ?? []).find((d) => d._key === key)?.verdict;
    if (current === oldText) {
      set[`dimensions[_key=="${key}"].verdict`] = newText;
    } else {
      console.log(`Skip verdict ${key}: text has changed since this script was written.`);
    }
  }

  console.log(JSON.stringify(set, null, 2));
  if (DRY_RUN) {
    console.log("DRY_RUN: nothing written.");
    return;
  }
  await client.patch(DOC_ID).set(set).commit();
  console.log(`Patched ${DOC_ID}. Request the page twice, or fire the revalidate webhook, to see it.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
