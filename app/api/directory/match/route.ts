// POST /api/directory/match
//
// A founder describes a project; three agencies get the brief.
//
//   { "founderName": "...", "founderEmail": "...", "company": "...",
//     "category": "web-design", "budget": "10k-25k", "timeline": "4-8",
//     "brief": "..." }
//
// WHAT HAPPENS, AND IN WHAT ORDER
//
//   1. Cap the founder's day (3 requests - see ./match-store.ts).
//   2. Validate. A brief with no category or no email is not routable.
//   3. Pick three agencies (lib/directory/matching.ts).
//   4. Save the request. BEFORE the emails, so a request that was routed
//      is always a request we can count.
//   5. Email the agencies, then the founder, then post to Slack.
//
// Steps 4 and 5 fail independently and neither failure is raised to the
// founder once the agencies have been mailed: from their side the thing
// they asked for has happened, and an error page would be a lie. Every
// one of those failures is logged, and the Slack post is the backstop
// that puts a human on it.

import type { NextRequest } from "next/server";

import { findBudgetBand, findTimelineBand, toPlatform } from "@/lib/directory/claim-fields";
import { DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import { sendEmail, sendEmails } from "@/lib/directory/email";
import {
  buildAgencyMatchEmail,
  buildFounderMatchEmail,
  buildMatchSlackMessage,
} from "@/lib/directory/email-templates";
import { getAllEnrichedAgencies } from "@/lib/directory/listing";
import { routeMatchRequest } from "@/lib/directory/matching";
import {
  checkMatchQuota,
  newMatchRequestId,
  saveMatchRequest,
} from "@/lib/directory/match-store";
import { postToSlack } from "@/lib/directory/slack";
import { agencyPath } from "@/lib/directory/agencies";
import { BRIEF_MAX_CHARS } from "@/lib/directory/claim-fields";
import { clampText } from "@/lib/directory/text";
import type { MatchRequest } from "@/lib/directory/types";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_PREFIX = "[directory/match]";

/** Same shape check the claim flow uses. Not RFC 5322 - just enough to
 *  catch a typo before three agencies reply into a void. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/** Shortest brief worth sending to three agencies. Below this there is
 *  nothing for them to respond to, and a one-word brief costs the founder
 *  their credibility with all three at once. */
const MIN_BRIEF_CHARS = 40;

/**
 * Builds a JSON response with this endpoint's standard headers.
 *
 * @param body - The response body.
 * @param status - HTTP status.
 * @returns The response.
 */
function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

/**
 * Normalises a company URL without rejecting a founder over a scheme.
 *
 * @param value - Whatever was typed.
 * @returns An absolute https URL, or null.
 */
function toCompanyUrl(value: unknown): string | null {
  try {
    const raw = String(value ?? "").trim();
    if (!raw) return null;
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Routes a founder's project brief to three agencies.
 *
 * @param request - The incoming request.
 * @returns A JSON response naming the agencies it went to.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const limit = await applyRateLimit({
      tool: "directory-match",
      ip: clientIpFrom(request.headers),
      tier: "heavy",
    });
    if (!limit.allowed) return json({ ok: false, error: limit.message }, 429);

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    const founderEmail = String(body?.founderEmail ?? "").trim().toLowerCase();
    if (!EMAIL_SHAPE.test(founderEmail)) {
      return json({ ok: false, field: "founderEmail", error: "Enter a valid email address." }, 422);
    }

    const founderName = clampText(String(body?.founderName ?? ""), 80);
    if (!founderName) {
      return json({ ok: false, field: "founderName", error: "Tell us your name." }, 422);
    }

    const company = clampText(String(body?.company ?? ""), 80);
    if (!company) {
      return json({ ok: false, field: "company", error: "Tell us your company name." }, 422);
    }

    const category = DIRECTORY_CATEGORIES.find(
      (entry) => entry.slug === String(body?.category ?? "").trim(),
    );
    if (!category) {
      return json({ ok: false, field: "category", error: "Pick a category." }, 422);
    }

    const budgetBand = findBudgetBand(String(body?.budget ?? ""));
    if (!budgetBand) {
      return json({ ok: false, field: "budget", error: "Pick a budget range." }, 422);
    }

    const timelineBand = findTimelineBand(String(body?.timeline ?? ""));
    if (!timelineBand) {
      return json({ ok: false, field: "timeline", error: "Pick a timeline." }, 422);
    }

    const brief = clampText(String(body?.brief ?? ""), BRIEF_MAX_CHARS);
    if (!brief || brief.length < MIN_BRIEF_CHARS) {
      return json(
        {
          ok: false,
          field: "brief",
          error: `Give the agencies something to work with - a sentence or two at least.`,
        },
        422,
      );
    }

    // The cap is checked AFTER validation so a founder does not spend an
    // allowance on a submission that was never going to be routed.
    const quota = await checkMatchQuota(founderEmail);
    if (!quota.allowed) {
      return json(
        {
          ok: false,
          code: "rate_limited",
          error: `You have sent ${quota.limit} requests today, which is the daily limit. It keeps agency inboxes worth opening. Try again tomorrow, or reply to one of the emails you already have.`,
        },
        429,
      );
    }

    const pinnedSlug = clampText(String(body?.pinnedAgency ?? ""), 120);
    const platformPref = toPlatform(String(body?.platform ?? ""));

    const requestRecord: MatchRequest = {
      id: newMatchRequestId(),
      createdAt: new Date().toISOString(),
      founderName,
      founderEmail,
      company,
      companyUrl: toCompanyUrl(body?.companyUrl),
      ycBatch: clampText(String(body?.ycBatch ?? ""), 12),
      category: category.slug,
      budgetUsd: budgetBand.ceilingUsd,
      budgetBucket: budgetBand.id,
      timelineWeeks: timelineBand.weeks,
      timelineBucket: timelineBand.id,
      platformPref,
      brief,
      status: "new",
      routedAgencySlugs: [],
      source: clampText(String(body?.source ?? ""), 60) ?? "directory",
    };

    const agencies = await getAllEnrichedAgencies();
    const routing = routeMatchRequest(agencies, requestRecord, pinnedSlug);

    if (routing.routed.length === 0) {
      // Still recorded. A category that cannot fill a single slot is the
      // most valuable thing this endpoint can tell us, and dropping it on
      // the floor is how it stays unnoticed.
      requestRecord.status = "new";
      await saveMatchRequest(requestRecord);
      await postToSlack(
        buildMatchSlackMessage({
          request: requestRecord,
          agencies: [],
          usedFallbacks: false,
          budgetLabel: budgetBand.label,
          timelineLabel: timelineBand.label,
        }),
      );
      return json(
        {
          ok: false,
          code: "no_match",
          error:
            "No agency in that category matches those constraints right now. We have logged it and will come back to you by email.",
        },
        200,
      );
    }

    const routedAgencies = routing.routed.map((entry) => entry.agency);
    requestRecord.routedAgencySlugs = routedAgencies.map((agency) => agency.slug);
    requestRecord.status = "routed";

    const stored = await saveMatchRequest(requestRecord);
    if (!stored) console.error(`${LOG_PREFIX} could not store request ${requestRecord.id}`);

    const agencyMessages = routing.routed
      .filter((entry) => Boolean(entry.contactEmail))
      .map((entry) =>
        buildAgencyMatchEmail({
          agency: entry.agency,
          to: entry.contactEmail as string,
          request: requestRecord,
          budgetLabel: budgetBand.label,
          timelineLabel: timelineBand.label,
          isUnclaimed: !entry.agency.claimed,
        }),
      );

    const agencyResults = await sendEmails(agencyMessages);
    const delivered = agencyResults.filter((result) => result.ok).length;
    for (const result of agencyResults) {
      if (!result.ok) console.error(`${LOG_PREFIX} agency send failed: ${result.detail}`);
    }

    const founderResult = await sendEmail(
      buildFounderMatchEmail({
        request: requestRecord,
        agencies: routedAgencies,
        usedFallbacks: routing.usedFallbacks,
      }),
    );
    if (!founderResult.ok) {
      console.error(`${LOG_PREFIX} founder send failed: ${founderResult.detail}`);
    }

    await postToSlack(
      buildMatchSlackMessage({
        request: requestRecord,
        agencies: routedAgencies,
        usedFallbacks: routing.usedFallbacks,
        budgetLabel: budgetBand.label,
        timelineLabel: timelineBand.label,
      }),
    );

    console.log(
      `${LOG_PREFIX} ${requestRecord.id}: ${routing.qualifiedCount} qualified, ${routedAgencies.length} routed, ${delivered} emailed`,
    );

    return json({
      ok: true,
      id: requestRecord.id,
      usedFallbacks: routing.usedFallbacks,
      agencies: routedAgencies.map((agency) => ({
        slug: agency.slug,
        name: agency.name,
        path: agencyPath(agency.slug),
      })),
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} failed:`, error);
    return json({ ok: false, error: "Something went wrong. Try again in a minute." }, 500);
  }
}
