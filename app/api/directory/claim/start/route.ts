// POST /api/directory/claim/start
//
// Step one of the claim flow: an agency types a work email, we check it
// belongs to the agency's own domain, and we mail them a magic link.
//
//   { "slug": "locomotive", "email": "hello@locomotive.ca", "edit": false }
//
// WHAT THIS ENDPOINT WILL NOT DO
//
// It will not tell a caller whether an address exists, whether a listing
// is already claimed, or who claimed it. Every successful call returns
// the same body regardless, because the alternative turns the endpoint
// into an oracle: "is anyone at acme.com in your directory" answered by
// anyone who asks. The ONE thing it does discriminate on is the domain
// rule, because that failure is the whole point of the step - an agency
// typing their Gmail has to be told to use their work address, or they
// simply give up.
//
// The token is created BEFORE the mail is sent and the mail failing is
// reported honestly. An agency told "check your inbox" over a failed send
// does not come back.

import type { NextRequest } from "next/server";

import { getAgencyBySlug } from "@/lib/directory/agencies";
import { checkClaimEmail, expectedClaimDomain } from "@/lib/directory/claim-validation";
import { createClaimToken } from "@/lib/directory/claim-tokens";
import { claimsArePersistent, getClaim } from "@/lib/directory/claims";
import { emailIsConfigured, sendEmail } from "@/lib/directory/email";
import { buildClaimLinkEmail } from "@/lib/directory/email-templates";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";

/** Reads a JSON body and talks to KV and an email provider. */
export const runtime = "nodejs";

/** Never cached: every call has a side effect. */
export const dynamic = "force-dynamic";

const LOG_PREFIX = "[directory/claim/start]";

/** Rate-limit bucket. `heavy` (10/hour/IP) rather than `light`: each call
 *  can send an email to an address the caller chose, and that is the
 *  budget worth being strict with. */
const RATE_TIER = "heavy" as const;

/** Where an agency with an edge case (several domains, an agency of
 *  record, a rebrand) is sent. A human reads these. */
const OVERRIDE_MAILBOX = "emma@usesuperflow.ai";

/**
 * Builds a JSON response with the headers this endpoint always sends.
 *
 * @param body - The response body.
 * @param status - HTTP status.
 * @returns The response.
 */
function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

/**
 * The message shown when an address cannot claim a listing.
 *
 * Written to be actionable in one read. The domain-mismatch copy names
 * both the domain we want and the agency we think they are, because the
 * commonest cause of this error is not a mistake at all - it is somebody
 * claiming the wrong listing.
 *
 * @param reason - Why the address was refused.
 * @param domain - The agency's own domain, when known.
 * @param agencyName - The agency being claimed.
 * @returns A sentence for the form to render.
 */
function rejectionMessage(
  reason: string,
  domain: string | null,
  agencyName: string,
): string {
  switch (reason) {
    case "public_mailbox":
      return domain
        ? `That looks like a personal address. Use an email at ${domain} so we can verify you run ${agencyName}.`
        : `Use your work email address so we can verify you run ${agencyName}.`;
    case "domain_mismatch":
      return `Use an email at ${domain} so we can verify you run ${agencyName}.`;
    case "no_agency_domain":
      return `We do not have a website on record for ${agencyName}, so we cannot verify a work address automatically. Email us and we will sort it out by hand.`;
    default:
      return "That does not look like an email address. Check it and try again.";
  }
}

/**
 * Starts a claim (or an edit) by mailing a magic link.
 *
 * @param request - The incoming request.
 * @returns A JSON response.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const limit = await applyRateLimit({
      tool: "directory-claim",
      ip: clientIpFrom(request.headers),
      tier: RATE_TIER,
    });
    if (!limit.allowed) {
      return json({ ok: false, error: limit.message }, 429);
    }

    const body = (await request.json().catch(() => null)) as {
      slug?: string;
      email?: string;
      edit?: boolean;
    } | null;

    const slug = body?.slug?.trim();
    const agency = slug ? getAgencyBySlug(slug) : undefined;
    if (!agency) {
      return json({ ok: false, error: "We could not find that agency." }, 404);
    }

    const check = checkClaimEmail(body?.email, agency);
    if (!check.ok) {
      return json(
        {
          ok: false,
          code: check.reason,
          error: rejectionMessage(check.reason, check.expectedDomain, agency.name),
          expectedDomain: check.expectedDomain,
          overrideMailto: buildOverrideMailto(agency.name, slug ?? ""),
        },
        422,
      );
    }

    // Refuse before writing anything if the claim could not survive being
    // written, or if the link could not be sent. Both of those end with
    // an agency having done the work for nothing, which is the one
    // outcome this flow cannot afford.
    if (!claimsArePersistent()) {
      console.error(`${LOG_PREFIX} refused: no shared KV store configured`);
      return json(
        {
          ok: false,
          code: "unavailable",
          error: "Claiming is temporarily unavailable. Email us and we will update your listing by hand.",
          overrideMailto: buildOverrideMailto(agency.name, agency.slug),
        },
        503,
      );
    }
    if (!emailIsConfigured()) {
      console.error(`${LOG_PREFIX} refused: no transactional email provider configured`);
      return json(
        {
          ok: false,
          code: "unavailable",
          error: "We cannot send the link right now. Email us and we will update your listing by hand.",
          overrideMailto: buildOverrideMailto(agency.name, agency.slug),
        },
        503,
      );
    }

    const token = await createClaimToken({
      agencySlug: agency.slug,
      email: check.email,
      verified: check.verified,
    });
    if (!token) {
      console.error(`${LOG_PREFIX} token write failed for ${agency.slug}`);
      return json(
        { ok: false, code: "unavailable", error: "Something went wrong on our side. Try again in a minute." },
        503,
      );
    }

    const existing = await getClaim(agency.slug);
    const sent = await sendEmail(
      buildClaimLinkEmail({
        agency,
        to: check.email,
        token,
        // "Edit" phrasing when the listing is already claimed, whoever
        // asked for the link: an agency that claimed last month and comes
        // back should not be told it is claiming for the first time.
        isEdit: body?.edit === true || existing?.claimed === true,
      }),
    );

    if (!sent.ok) {
      console.error(`${LOG_PREFIX} send failed (${sent.reason}): ${sent.detail}`);
      return json(
        {
          ok: false,
          code: "send_failed",
          error: "We could not send the link. Check the address, or email us and we will do it by hand.",
          overrideMailto: buildOverrideMailto(agency.name, agency.slug),
        },
        502,
      );
    }

    return json({ ok: true, sentTo: maskEmail(check.email) });
  } catch (error) {
    console.error(`${LOG_PREFIX} failed:`, error);
    return json({ ok: false, error: "Something went wrong. Try again in a minute." }, 500);
  }
}

/**
 * Builds the manual-override mailto for agencies the domain rule cannot
 * serve - several domains, an agency of record, a rebrand mid-flight.
 *
 * A real escape hatch rather than a dead end: the rule is strict because
 * the badge has to mean something, and a strict rule without a human path
 * around it just loses the listings it cannot classify.
 *
 * @param agencyName - The agency being claimed.
 * @param slug - Its slug, so the reply lands on the right record.
 * @returns A mailto: URL.
 */
function buildOverrideMailto(agencyName: string, slug: string): string {
  try {
    const subject = encodeURIComponent(`Claim ${agencyName} (${slug})`);
    const body = encodeURIComponent(
      [
        `I run ${agencyName} and would like to claim its listing in the Superflow directory.`,
        "",
        "The email domain I can verify from is:",
        "",
        "(If your agency uses several domains or trades under another name, say so here and we will sort it out.)",
      ].join("\n"),
    );
    return `mailto:${OVERRIDE_MAILBOX}?subject=${subject}&body=${body}`;
  } catch {
    return `mailto:${OVERRIDE_MAILBOX}`;
  }
}

/**
 * Masks an address for the success message.
 *
 * The form already knows what was typed, so this is not hiding anything
 * from the person who typed it - it keeps a full address out of a
 * response body that a shared screen or a proxy log might carry.
 *
 * @param email - The address mailed.
 * @returns e.g. "h***o@locomotive.ca".
 */
function maskEmail(email: string): string {
  try {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  } catch {
    return email;
  }
}
