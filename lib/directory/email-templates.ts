// The words the directory sends.
//
// Five messages, and every one of them is read by someone who did not ask
// to hear from us today. They are written as short notes from a person,
// because that is what they are, and because a magic link that reads like
// marketing is a magic link that gets reported as phishing.
//
// Rules the templates keep:
//
//   * Say what this is and why it arrived, in the first line. An agency
//     that gets a project request has usually forgotten the campaign
//     email from three weeks ago.
//   * One link, one job. A claim email offers the claim link and nothing
//     else; the moment there are two calls to action, neither happens.
//   * Never dress up a fallback. A founder routed to unclaimed listings
//     is told so, because finding out later is worse.
//   * Plain text, no tracking pixels, no HTML. See ./email.ts.

import { agencyPath } from "./agencies";
import { DIRECTORY_BASE_PATH } from "./constants";
import { EMAIL_SIGNATURE, emailUrl, type EmailMessage } from "./email";
import type { EnrichedAgency } from "./enrich";
import type { Agency, MatchRequest } from "./types";

/**
 * Formats a whole-dollar figure for an email, e.g. "$25,000".
 *
 * @param amount - The figure, or null.
 * @returns The formatted figure, or "not stated".
 */
function money(amount: number | null): string {
  try {
    if (typeof amount !== "number") return "not stated";
    return `$${amount.toLocaleString("en-US")}`;
  } catch {
    return "not stated";
  }
}

/**
 * The magic-link email that opens a claim.
 *
 * @param params - Agency, token, and whether this is a first claim or an
 *                  edit of one already made.
 * @returns The message to send.
 */
export function buildClaimLinkEmail(params: {
  agency: Agency;
  to: string;
  token: string;
  isEdit: boolean;
}): EmailMessage {
  const { agency, to, token, isEdit } = params;
  const link = emailUrl(`${DIRECTORY_BASE_PATH}/claim/${token}`);
  const profile = emailUrl(agencyPath(agency.slug));

  const opening = isEdit
    ? `Here is your link to edit ${agency.name}'s listing in the Superflow agency directory.`
    : `You asked to claim ${agency.name}'s listing in the Superflow agency directory. Here is your link.`;

  return {
    to,
    subject: isEdit
      ? `Edit ${agency.name}'s directory listing`
      : `Claim ${agency.name}'s directory listing`,
    text: [
      opening,
      "",
      link,
      "",
      "The link works once and expires in 24 hours.",
      "",
      "It takes about two minutes. What you fill in is what founders filter on: minimum budget, typical timeline, the platforms you build on, and what kind of work you say no to.",
      "",
      `Your listing today: ${profile}`,
      "",
      "If you did not request this, ignore it. Nothing changes until somebody opens that link.",
      "",
      EMAIL_SIGNATURE,
    ].join("\n"),
  };
}

/**
 * The confirmation an agency gets after claiming, carrying its answers
 * back to it.
 *
 * The answers are repeated in full on purpose. The live claim layer is a
 * cache of record (see ./claims.ts), so this email is the agency's own
 * copy of what it told us - and it is also the fastest way for somebody
 * to spot that they typed 2500 when they meant 25000.
 *
 * @param params - The agency and its now-live claim.
 * @returns The message to send.
 */
export function buildClaimConfirmationEmail(params: {
  agency: EnrichedAgency;
  to: string;
}): EmailMessage {
  const { agency, to } = params;
  const profile = emailUrl(agencyPath(agency.slug));
  const editLink = emailUrl(`${DIRECTORY_BASE_PATH}/edit?agency=${agency.slug}`);

  const facts = [
    `Minimum budget: ${money(agency.minBudgetUsd)}`,
    `Typical project: ${
      agency.typicalBudgetMin || agency.typicalBudgetMax
        ? `${money(agency.typicalBudgetMin)} to ${money(agency.typicalBudgetMax)}`
        : "not stated"
    }`,
    `Typical timeline: ${
      agency.typicalTimelineWeeks ? `${agency.typicalTimelineWeeks} weeks` : "not stated"
    }`,
    `Platforms: ${agency.platforms.length > 0 ? agency.platforms.join(", ") : "not stated"}`,
    `Reply time: ${
      agency.responseSlaDays ? `${agency.responseSlaDays} business days` : "not stated"
    }`,
    `Accepting projects: ${agency.acceptingProjects ? "yes" : "no"}`,
    `YC offer: ${agency.ycOffer || "none"}`,
  ];

  return {
    to,
    subject: `${agency.name} is live in the Superflow directory`,
    text: [
      `${agency.name}'s listing is claimed and live.`,
      "",
      profile,
      "",
      "Here is what it now says:",
      "",
      ...facts.map((fact) => `  ${fact}`),
      "",
      agency.verified
        ? "It carries a Verified badge, because you claimed it from an address at your own domain."
        : "",
      "",
      `To change any of it, request a new link here: ${editLink}`,
      "",
      "When a founder's project matches, we send you the brief and their email directly. Nothing to log into.",
      "",
      EMAIL_SIGNATURE,
    ]
      .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
      .join("\n"),
  };
}

/**
 * The brief, as an agency receives it.
 *
 * Carries the founder's address rather than routing replies through us.
 * An agency that has to answer through a middleman answers slower, and
 * the founder came here to talk to agencies.
 *
 * @param params - The routed agency, the request, and whether the listing
 *                  is unclaimed (which adds the claim nudge).
 * @returns The message to send.
 */
export function buildAgencyMatchEmail(params: {
  agency: EnrichedAgency;
  to: string;
  request: MatchRequest;
  budgetLabel: string;
  timelineLabel: string;
  isUnclaimed: boolean;
}): EmailMessage {
  const { agency, to, request, budgetLabel, timelineLabel, isUnclaimed } = params;
  const claimLink = emailUrl(`${DIRECTORY_BASE_PATH}/claim?agency=${agency.slug}`);

  const founderLine = request.ycBatch
    ? `${request.founderName}, ${request.company} (YC ${request.ycBatch})`
    : `${request.founderName}, ${request.company}`;

  return {
    to,
    subject: `Project request from a YC founder: ${request.company}`,
    // reply-to is the founder, so hitting reply goes straight to them.
    replyTo: request.founderEmail,
    text: [
      `A founder picked ${agency.name} out of the Superflow agency directory. Their brief is below, and their email is on this message, so you can reply straight to them.`,
      "",
      `From: ${founderLine}`,
      request.companyUrl ? `Site: ${request.companyUrl}` : "",
      `Email: ${request.founderEmail}`,
      "",
      `Budget: ${budgetLabel}`,
      `Timeline: ${timelineLabel}`,
      request.platformPref ? `Platform: ${request.platformPref}` : "",
      "",
      "Brief:",
      request.brief,
      "",
      "We sent this to three agencies, so speed matters.",
      isUnclaimed
        ? `\nClaim your listing to set your budget and get better matched: ${claimLink}`
        : "",
      "",
      EMAIL_SIGNATURE,
    ]
      .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
      .join("\n"),
  };
}

/**
 * The confirmation a founder gets, naming the three agencies.
 *
 * @param params - The request and the agencies it was routed to.
 * @returns The message to send.
 */
export function buildFounderMatchEmail(params: {
  request: MatchRequest;
  agencies: EnrichedAgency[];
  usedFallbacks: boolean;
}): EmailMessage {
  const { request, agencies, usedFallbacks } = params;

  const lines = agencies.map((agency) => {
    const facts = [
      agency.minBudgetUsd ? `from ${money(agency.minBudgetUsd)}` : null,
      agency.typicalTimelineWeeks ? `~${agency.typicalTimelineWeeks} weeks` : null,
      agency.platforms.length > 0 ? agency.platforms.join("/") : null,
    ].filter(Boolean);
    return [
      `  ${agency.name}${facts.length > 0 ? ` (${facts.join(", ")})` : ""}`,
      `  ${emailUrl(agencyPath(agency.slug))}`,
      agency.ycOffer ? `  YC offer: ${agency.ycOffer}` : "",
      "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  return {
    to: request.founderEmail,
    subject: `Your ${agencies.length === 1 ? "agency" : `${agencies.length} agencies`} for ${request.company}`,
    text: [
      `Thanks ${request.founderName.split(" ")[0] || "there"} - your brief is with ${agencies.length === 1 ? "one agency" : `these ${agencies.length}`}:`,
      "",
      ...lines,
      "They have your brief and your email, and they will reach out directly. Most reply within a few days.",
      usedFallbacks
        ? "\nA note on honesty: not all of these have claimed their listing yet, so their budgets and timelines are what their source directory published rather than what they told us. Worth confirming the numbers on your first call."
        : "",
      "",
      "If none of them fit, reply to this and tell me why. That is the most useful thing you can send me.",
      "",
      EMAIL_SIGNATURE,
    ]
      .filter((line, index, lines2) => !(line === "" && lines2[index - 1] === ""))
      .join("\n"),
  };
}

/**
 * The Slack post for a routed request.
 *
 * @param params - The request, the agencies it went to, and whether the
 *                  list was padded with unclaimed listings.
 * @returns Slack-flavoured markdown.
 */
export function buildMatchSlackMessage(params: {
  request: MatchRequest;
  agencies: EnrichedAgency[];
  usedFallbacks: boolean;
  budgetLabel: string;
  timelineLabel: string;
}): string {
  const { request, agencies, usedFallbacks, budgetLabel, timelineLabel } = params;
  const names = agencies
    .map((agency) => `${agency.name}${agency.claimed ? "" : " (unclaimed)"}`)
    .join(", ");

  return [
    `*New directory match request* - ${request.company}${request.ycBatch ? ` (YC ${request.ycBatch})` : ""}`,
    `${request.founderName} <${request.founderEmail}>${request.companyUrl ? ` | ${request.companyUrl}` : ""}`,
    `${request.category} | ${budgetLabel} | ${timelineLabel}${request.platformPref ? ` | ${request.platformPref}` : ""}`,
    `Routed to: ${names || "nobody - no agency qualified"}`,
    usedFallbacks ? "_Fewer than three claimed agencies qualified; unclaimed listings filled the gap._" : "",
    `> ${request.brief.slice(0, 400)}${request.brief.length > 400 ? "..." : ""}`,
  ]
    .filter(Boolean)
    .join("\n");
}
