// Deciding who may claim a listing, and what they may put on it.
//
// This is the security boundary of the claim flow and the only place that
// judgement is made. The API routes call in here; the forms mirror the
// same limits for a good typing experience but are not trusted, because
// a form is a suggestion.
//
// The whole verification claim is narrow and worth stating exactly: a
// verified listing means SOMEBODY WHO RECEIVES MAIL AT THE AGENCY'S OWN
// DOMAIN filled this form in. It is not a statement that they are
// authorised internally, that the agency is any good, or that anything on
// the listing is true. The badge copy has to keep matching that.

import {
  BUDGET_MAX_USD,
  DECLINES_MAX_CHARS,
  DESCRIPTION_MAX_CHARS,
  RESPONSE_SLA_OPTIONS,
  SERVICES_MAX,
  SERVICE_TAG_MAX_CHARS,
  STARTUP_CLIENTS_MAX,
  STARTUP_CLIENT_MAX_CHARS,
  TIMELINE_MAX_WEEKS,
  YC_OFFER_MAX_CHARS,
  toPlatform,
} from "./claim-fields";
import { clampText } from "./text";
import type { Agency, AgencyClaim, AgencyPlatform } from "./types";

/**
 * Public email hosts, which can never verify a listing.
 *
 * Without this, `gmail.com` would "match" any agency whose own website is
 * on Gmail (none) - but more importantly the error message has to be
 * different. "Use an email at studio.com" is right for someone typing
 * their personal Gmail; it would be nonsense if the agency's domain
 * genuinely were a free host.
 */
const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "gmx.de",
  "mail.com",
  "yandex.com",
  "qq.com",
  "163.com",
]);

/** Shape an address has to have before it is worth looking at. Not RFC
 *  5322 - that grammar accepts addresses no mail server would - just
 *  enough to catch a typo before a message is sent into a void. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/**
 * The registrable domain of a host, as this codebase means it: the last
 * two labels, lowercased, no `www.`.
 *
 * Deliberately the same naive rule the importers use for `Agency.domain`,
 * because this has to COMPARE against that field and a cleverer rule here
 * would disagree with it. It is wrong for multi-part public suffixes
 * (`studio.co.uk` reduces to `co.uk`), which is why
 * `emailDomainMatchesAgency` compares full hosts and suffixes rather than
 * relying on this alone.
 *
 * @param value - A hostname, URL or email domain.
 * @returns The lowercased host with any `www.` removed, or null.
 */
function normalizeHost(value: string | null | undefined): string | null {
  try {
    let host = value?.trim().toLowerCase();
    if (!host) return null;
    if (host.includes("@")) host = host.split("@").pop() ?? "";
    if (host.includes("//")) host = new URL(host).hostname;
    host = host.replace(/^www\./, "").replace(/\/.*$/, "");
    return host || null;
  } catch {
    return null;
  }
}

/** Why an email cannot claim a listing. */
export type ClaimEmailRejection =
  | "invalid"
  | "public_mailbox"
  | "domain_mismatch"
  | "no_agency_domain";

/** Outcome of checking a claiming address. */
export type ClaimEmailCheck =
  | { ok: true; email: string; verified: true }
  | { ok: false; reason: ClaimEmailRejection; expectedDomain: string | null };

/**
 * The domain a claiming address has to be at, for display in the error.
 *
 * @param agency - The agency being claimed.
 * @returns The registrable domain, or null when the record has none.
 */
export function expectedClaimDomain(agency: Agency | null | undefined): string | null {
  try {
    return normalizeHost(agency?.domain ?? agency?.website ?? null);
  } catch {
    return null;
  }
}

/**
 * Whether an email host belongs to the agency.
 *
 * Accepts an exact match and a subdomain of it (`hello@mail.studio.com`
 * claiming `studio.com`), because agencies routinely send from a
 * subdomain. Does NOT accept the reverse, or a domain that merely ends in
 * the same string: `notstudio.com` must not claim `studio.com`, which a
 * bare `endsWith` would allow.
 *
 * @param emailHost - Host from the claiming address.
 * @param agencyHost - The agency's own registrable domain.
 * @returns True when the two are the same organisation.
 */
function hostBelongsTo(emailHost: string, agencyHost: string): boolean {
  try {
    if (emailHost === agencyHost) return true;
    return emailHost.endsWith(`.${agencyHost}`);
  } catch {
    return false;
  }
}

/**
 * Checks whether an address may claim an agency's listing.
 *
 * @param email - The address entered on the claim form.
 * @param agency - The agency being claimed.
 * @returns Acceptance, or the reason and the domain to show in the error.
 */
export function checkClaimEmail(
  email: string | null | undefined,
  agency: Agency | null | undefined,
): ClaimEmailCheck {
  try {
    const normalized = email?.trim().toLowerCase() ?? "";
    const expectedDomain = expectedClaimDomain(agency);

    if (!EMAIL_SHAPE.test(normalized)) {
      return { ok: false, reason: "invalid", expectedDomain };
    }

    const emailHost = normalizeHost(normalized);
    if (!emailHost) return { ok: false, reason: "invalid", expectedDomain };

    if (PUBLIC_EMAIL_DOMAINS.has(emailHost)) {
      return { ok: false, reason: "public_mailbox", expectedDomain };
    }

    // A record with no website cannot be domain-verified at all. Rather
    // than accept anything (which would make the Verified badge a lie for
    // that listing), the flow routes these to the manual override.
    if (!expectedDomain) {
      return { ok: false, reason: "no_agency_domain", expectedDomain: null };
    }

    if (!hostBelongsTo(emailHost, expectedDomain)) {
      return { ok: false, reason: "domain_mismatch", expectedDomain };
    }

    return { ok: true, email: normalized, verified: true };
  } catch {
    return { ok: false, reason: "invalid", expectedDomain: null };
  }
}

/**
 * Parses a number out of a form value, refusing anything outside range.
 *
 * Returns null for an empty value AND for an out-of-range one, because
 * both mean "we have no usable figure". Storing a rejected number would
 * put a listing into budget filters it does not belong in.
 *
 * @param value - The raw submitted value.
 * @param max - Largest accepted value.
 * @returns A whole number in range, or null.
 */
function toBoundedInteger(value: unknown, max: number): number | null {
  try {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Math.round(Number(value));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Normalises a list of short free-text tags.
 *
 * @param value - The raw submitted value: an array, or a comma-separated
 *                 string (which is what a tag input posts).
 * @param maxItems - Cap on the list.
 * @param maxChars - Cap on each entry.
 * @returns Trimmed, de-duplicated, capped entries.
 */
function toTagList(value: unknown, maxItems: number, maxChars: number): string[] {
  try {
    const raw = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : [];
    const seen = new Set<string>();
    const tags: string[] = [];
    for (const entry of raw) {
      const tag = clampText(typeof entry === "string" ? entry : String(entry ?? ""), maxChars);
      if (!tag) continue;
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
      if (tags.length >= maxItems) break;
    }
    return tags;
  } catch {
    return [];
  }
}

/** Everything the enrich form can submit. Every field optional: an agency
 *  that only wants to state a budget should not have to fill in nine
 *  other boxes to do it. */
export interface ClaimSubmission {
  description?: unknown;
  minBudgetUsd?: unknown;
  typicalBudgetMin?: unknown;
  typicalBudgetMax?: unknown;
  typicalTimelineWeeks?: unknown;
  platforms?: unknown;
  services?: unknown;
  declines?: unknown;
  startupClients?: unknown;
  ycOffer?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  responseSlaDays?: unknown;
  acceptingProjects?: unknown;
  primaryCategory?: unknown;
}

/**
 * Turns a submission into a stored claim.
 *
 * Coerces rather than rejects wherever it safely can - an agency that
 * typed "$25,000" into a number field should get a claim, not an error -
 * and drops anything it cannot make sense of. The one thing it will not
 * do is invent: a field it cannot parse becomes null, never a guess.
 *
 * @param params - The agency, the verified claiming address, the raw
 *                  submission, and the existing claim to build on.
 * @returns A complete, storable claim.
 */
export function buildClaimFromSubmission(params: {
  agency: Agency;
  email: string;
  verified: boolean;
  submission: ClaimSubmission;
  existing: AgencyClaim;
}): AgencyClaim {
  const { agency, email, verified, submission, existing } = params;
  const now = new Date().toISOString();

  const platforms = (() => {
    try {
      const raw = Array.isArray(submission.platforms)
        ? submission.platforms
        : typeof submission.platforms === "string"
          ? submission.platforms.split(",")
          : [];
      const parsed = raw
        .map((entry) => toPlatform(typeof entry === "string" ? entry : String(entry ?? "")))
        .filter((platform): platform is AgencyPlatform => platform !== null);
      return Array.from(new Set(parsed));
    } catch {
      return [];
    }
  })();

  const responseSlaDays = (() => {
    try {
      const parsed = Math.round(Number(submission.responseSlaDays));
      return RESPONSE_SLA_OPTIONS.includes(parsed) ? parsed : null;
    } catch {
      return null;
    }
  })();

  const typicalBudgetMin = toBoundedInteger(submission.typicalBudgetMin, BUDGET_MAX_USD);
  const typicalBudgetMaxRaw = toBoundedInteger(submission.typicalBudgetMax, BUDGET_MAX_USD);
  // A range whose top is below its bottom is a typo, not a range. Keeping
  // the pair only when it is coherent stops the profile printing
  // "$50,000 to $5,000".
  const rangeIsCoherent =
    typicalBudgetMin === null || typicalBudgetMaxRaw === null || typicalBudgetMaxRaw >= typicalBudgetMin;

  const contactEmail = (() => {
    try {
      const submitted = String(submission.contactEmail ?? "").trim().toLowerCase();
      // Any working address is fine here - it is where leads go, not a
      // credential - but it still has to look like an address, and it
      // falls back to the one that proved domain control.
      return EMAIL_SHAPE.test(submitted) ? submitted : email;
    } catch {
      return email;
    }
  })();

  return {
    ...existing,
    slug: agency.slug,
    claimed: true,
    claimedAt: existing.claimedAt ?? now,
    claimedByEmail: email,
    verified,
    description: clampText(
      typeof submission.description === "string" ? submission.description : null,
      DESCRIPTION_MAX_CHARS,
    ),
    minBudgetUsd: toBoundedInteger(submission.minBudgetUsd, BUDGET_MAX_USD),
    typicalBudgetMin,
    typicalBudgetMax: rangeIsCoherent ? typicalBudgetMaxRaw : null,
    typicalTimelineWeeks: toBoundedInteger(submission.typicalTimelineWeeks, TIMELINE_MAX_WEEKS),
    platforms,
    services: toTagList(submission.services, SERVICES_MAX, SERVICE_TAG_MAX_CHARS),
    declines: clampText(
      typeof submission.declines === "string" ? submission.declines : null,
      DECLINES_MAX_CHARS,
    ),
    startupClients: toTagList(
      submission.startupClients,
      STARTUP_CLIENTS_MAX,
      STARTUP_CLIENT_MAX_CHARS,
    ),
    ycOffer: clampText(
      typeof submission.ycOffer === "string" ? submission.ycOffer : null,
      YC_OFFER_MAX_CHARS,
    ),
    contactEmail,
    contactName: clampText(
      typeof submission.contactName === "string" ? submission.contactName : null,
      80,
    ),
    responseSlaDays,
    // Only an explicit false turns this off. A checkbox that did not
    // reach the server (an older browser, a partial submission) must not
    // be read as "we are full" and quietly stop the agency's leads.
    acceptingProjects: submission.acceptingProjects !== false,
    updatedByAgencyAt: now,
    primaryCategory:
      typeof submission.primaryCategory === "string" && submission.primaryCategory.trim()
        ? submission.primaryCategory.trim()
        : existing.primaryCategory,
    sourceNote: existing.sourceNote ?? "Claimed via /directory/claim.",
  };
}
