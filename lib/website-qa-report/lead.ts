// Parsing and validation for the State of Website QA lead form.
//
// Shared by the API route only; the client does its own light checks for
// instant feedback, and this is the copy that decides.

import {
  LEAD_PAGE,
  isBenchmarkAnswer,
  isRoleValue,
  type BenchmarkAnswer,
  type RoleValue,
} from "./report";

/** A validated lead, ready to store. */
export type Lead = {
  email: string;
  website: string;
  role: RoleValue | "";
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
  benchmark_rounds: BenchmarkAnswer | "";
  page: string;
};

export type LeadFieldErrors = Partial<Record<"email" | "website", string>>;

export type ParsedLead =
  | { ok: true; lead: Lead; honeypot: boolean }
  | { ok: false; errors: LeadFieldErrors };

/** Name of the honeypot input. Real people never see or fill it. */
export const HONEYPOT_FIELD = "company_fax";

const MAX_EMAIL = 254;
const MAX_WEBSITE = 200;
const MAX_ATTRIBUTION = 120;
const MAX_REFERRER = 500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const WEBSITE_PATTERN = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

/** Reads one string field, trimmed, with control characters removed. */
function text(input: Record<string, unknown>, key: string, max: number): string {
  try {
    const value = input[key];
    if (typeof value !== "string") return "";
    // eslint-disable-next-line no-control-regex
    const stripped = value.replace(/[\u0000-\u001f\u007f]/g, "");
    return stripped.trim().slice(0, max);
  } catch {
    return "";
  }
}

/**
 * Pulls source and UTM values out of a page URL. Used when the browser posted
 * the form without JavaScript, so the hidden fields could not be filled, but
 * the Referer header still carries the query string the visitor arrived with.
 *
 * @param pageUrl - The Referer header, if any.
 */
export function attributionFromPageUrl(pageUrl: string | null): Partial<Lead> {
  try {
    if (!pageUrl) return {};
    const url = new URL(pageUrl);
    const read = (key: string) =>
      (url.searchParams.get(key) ?? "").trim().slice(0, MAX_ATTRIBUTION);
    return {
      source: read("source"),
      utm_source: read("utm_source"),
      utm_medium: read("utm_medium"),
      utm_campaign: read("utm_campaign"),
    };
  } catch {
    return {};
  }
}

/**
 * Validates a submitted form.
 *
 * @param input - The posted fields, from JSON or form encoding.
 * @param fallback - Attribution to use where the hidden fields are empty.
 */
export function parseLead(
  input: Record<string, unknown>,
  fallback: Partial<Lead> = {},
): ParsedLead {
  try {
    const errors: LeadFieldErrors = {};

    const email = text(input, "email", MAX_EMAIL + 1).toLowerCase();
    if (!email) {
      errors.email = "Enter your work email.";
    } else if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid email, like you@youragency.com.";
    }

    const website = text(input, "website", MAX_WEBSITE + 1);
    if (website && (website.length > MAX_WEBSITE || !WEBSITE_PATTERN.test(website))) {
      errors.website = "Enter a website like youragency.com, or leave it blank.";
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const role = text(input, "role", 40);
    const rounds = text(input, "benchmark_rounds", 8);
    const pick = (key: keyof Lead) =>
      text(input, key, MAX_ATTRIBUTION) || String(fallback[key] ?? "");

    return {
      ok: true,
      honeypot: text(input, HONEYPOT_FIELD, 200).length > 0,
      lead: {
        email,
        website,
        role: isRoleValue(role) ? role : "",
        source: pick("source") || "direct",
        utm_source: pick("utm_source"),
        utm_medium: pick("utm_medium"),
        utm_campaign: pick("utm_campaign"),
        referrer: text(input, "referrer", MAX_REFERRER),
        benchmark_rounds: isBenchmarkAnswer(rounds) ? rounds : "",
        page: LEAD_PAGE,
      },
    };
  } catch {
    return { ok: false, errors: { email: "Enter your work email." } };
  }
}
