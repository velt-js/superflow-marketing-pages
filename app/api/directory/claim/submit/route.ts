// POST /api/directory/claim/submit
//
// Step two of the claim flow: the enrich form posts here with the token
// from the magic link and whatever the agency filled in.
//
//   { "token": "...", "minBudgetUsd": 25000, "platforms": ["webflow"], ... }
//
// The token is the entire authorisation. It was minted against one
// agency slug in step one, and the slug is read OFF THE TOKEN rather than
// out of the body - a body-supplied slug would let anyone holding a valid
// token for their own listing rewrite somebody else's.
//
// Order of operations matters here and is deliberate:
//
//   1. Validate the token.
//   2. Write the claim.
//   3. Only then mark the token used.
//   4. Only then send the confirmation.
//
// A failure at (2) leaves the link live, so the agency can simply submit
// again. Marking the token used first would burn the link on a write that
// never landed, and the agency would have filled the form in for nothing.

import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { agencyPath, getAgencyBySlug } from "@/lib/directory/agencies";
import { buildClaimFromSubmission, type ClaimSubmission } from "@/lib/directory/claim-validation";
import { markClaimTokenUsed, readClaimToken } from "@/lib/directory/claim-tokens";
import { CLAIMS_CACHE_TAG, getClaim, saveLiveClaim } from "@/lib/directory/claims";
import { emptyClaim, enrichAgency, resolveCategories } from "@/lib/directory/enrich";
import { sendEmail } from "@/lib/directory/email";
import { buildClaimConfirmationEmail } from "@/lib/directory/email-templates";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_PREFIX = "[directory/claim/submit]";

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

/** What the page should say for each way a token can be refused. */
const TOKEN_ERRORS: Record<string, string> = {
  missing: "That link is not valid. Request a new one and we will email it over.",
  expired: "That link has expired. Request a new one and we will email it over.",
  used: "That link has already been used. Request a new one to make more changes.",
};

/**
 * Saves an agency's claim.
 *
 * @param request - The incoming request.
 * @returns A JSON response carrying the live profile path on success.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const limit = await applyRateLimit({
      tool: "directory-claim-submit",
      ip: clientIpFrom(request.headers),
      tier: "heavy",
    });
    if (!limit.allowed) return json({ ok: false, error: limit.message }, 429);

    const body = (await request.json().catch(() => null)) as
      | (ClaimSubmission & { token?: string })
      | null;

    const lookup = await readClaimToken(body?.token);
    if (!lookup.ok) {
      return json({ ok: false, code: lookup.reason, error: TOKEN_ERRORS[lookup.reason] }, 401);
    }

    // The slug comes from the TOKEN, never from the request body.
    const agency = getAgencyBySlug(lookup.token.agencySlug);
    if (!agency) {
      return json({ ok: false, error: "We could not find that agency." }, 404);
    }

    const existing = (await getClaim(agency.slug)) ?? emptyClaim(agency.slug);
    const claim = buildClaimFromSubmission({
      agency,
      email: lookup.token.email,
      verified: lookup.token.verified,
      submission: body ?? {},
      existing,
    });

    const saved = await saveLiveClaim(claim);
    if (!saved) {
      console.error(`${LOG_PREFIX} write failed for ${agency.slug}`);
      return json(
        {
          ok: false,
          code: "unavailable",
          error: "We could not save that. Your link still works, so try again in a minute.",
        },
        503,
      );
    }

    await markClaimTokenUsed(lookup.token.token);

    // Push the claim onto the live pages now rather than waiting out the
    // routes' 60-second window. Two separate jobs:
    //
    //   * The TAG drops the cached claim read (see CLAIMS_CACHE_TAG),
    //     without which every page below would regenerate against the
    //     same stale copy it already had.
    //   * The PATHS mark the pages that actually changed as stale, so the
    //     next request to each regenerates instead of serving what it
    //     rendered before the claim existed.
    //
    // Categories are revalidated from the RESOLVED list, so a claim that
    // re-filed the agency refreshes both the category it left and the one
    // it arrived in.
    try {
      // Next 16 requires a cache-life profile here; the single-argument
      // form is deprecated. "max" is the recommended one: it marks the
      // tag stale and serves stale-while-revalidate, so the claim lands
      // on the next visit without a blocking miss for whoever that is.
      revalidateTag(CLAIMS_CACHE_TAG, "max");
      revalidatePath(agencyPath(agency.slug));
      revalidatePath(DIRECTORY_BASE_PATH);
      for (const categorySlug of resolveCategories(agency, claim)) {
        revalidatePath(`${DIRECTORY_BASE_PATH}/${categorySlug}`);
      }
    } catch (revalidateError) {
      // A failed revalidation costs freshness, never correctness: the
      // claim is stored and the pages pick it up on their own schedule.
      console.error(`${LOG_PREFIX} revalidation failed:`, revalidateError);
    }

    // The confirmation is the agency's own copy of what it told us (see
    // buildClaimConfirmationEmail), but the claim is already saved, so a
    // send failure is logged and not raised: telling somebody their
    // submission failed when it did not is the worse error.
    const enriched = enrichAgency(agency, claim);
    const confirmation = await sendEmail(
      buildClaimConfirmationEmail({ agency: enriched, to: lookup.token.email }),
    );
    if (!confirmation.ok) {
      console.error(`${LOG_PREFIX} confirmation send failed: ${confirmation.detail}`);
    }

    return json({
      ok: true,
      slug: agency.slug,
      profilePath: agencyPath(agency.slug),
      verified: claim.verified,
      confirmationSent: confirmation.ok,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} failed:`, error);
    return json({ ok: false, error: "Something went wrong. Try again in a minute." }, 500);
  }
}
