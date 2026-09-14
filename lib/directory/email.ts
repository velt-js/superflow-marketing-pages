// Transactional email for the directory's two flows.
//
// SEPARATE FROM THE OUTBOUND CAMPAIGN, DELIBERATELY
//
// The campaign that asks agencies for their budget goes out of a human
// mailbox that is still warming. Claim links and match requests must not
// share it: a magic link that lands in spam is a claim that never
// happens, and a burst of transactional mail out of a warming mailbox is
// exactly what gets the campaign filtered. So this sends through a
// provider on its own subdomain (mail.usesuperflow.ai), whose reputation
// is ours to build and whose failures are visible here rather than
// showing up a week later as a drop in campaign open rates.
//
// PROVIDER
//
// Resend, over plain `fetch` against its REST API - no npm dependency,
// matching how lib/toolkit/kv.ts talks to Upstash. Swapping to Postmark
// is a change to `deliver` and nothing else.
//
// PLAIN TEXT, NOT HTML
//
// Every message here is a short note from a person: a link to click, or a
// founder's brief. An HTML template would make them look like marketing,
// which is the one thing a magic link must not look like, and would cost
// deliverability on a young sending domain for nothing.

import { SITE_URL } from "@/app/_seo/schema";

/** Resend's send endpoint. */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** How long a single send may take. Both callers are inside a user-facing
 *  request, so this is short enough that a provider outage shows up as a
 *  clear error rather than as a hung form. */
const SEND_TIMEOUT_MS = 8000;

/**
 * Default sender.
 *
 * Signed as Emma because she is who the agencies have been corresponding
 * with, and a claim link arriving from an unfamiliar name reads as
 * phishing. The ADDRESS is on the transactional subdomain even though the
 * name is hers - see this file's header.
 */
const DEFAULT_FROM = "Emma from Superflow <emma@mail.usesuperflow.ai>";

/** Where replies go. A transactional subdomain that bounces replies is a
 *  dead end for an agency answering "wait, what is this?". */
const DEFAULT_REPLY_TO = "emma@usesuperflow.ai";

/** Why a send did not happen. Distinguished because the callers respond
 *  differently: a missing key is our configuration problem and must not
 *  be reported to a visitor as their error. */
export type EmailFailure = "not_configured" | "rejected" | "network";

/** Outcome of a send. */
export type EmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: EmailFailure; detail: string };

/** One message. */
export interface EmailMessage {
  to: string;
  subject: string;
  /** Plain text body. No HTML alternative is sent - see the header. */
  text: string;
  /** Overrides DEFAULT_REPLY_TO. The match emails set this to the
   *  founder's address so an agency can just hit reply. */
  replyTo?: string;
}

/**
 * Whether transactional email is configured.
 *
 * The claim flow checks this BEFORE it writes a token: a claim whose
 * magic link was never sent leaves an agency staring at "check your
 * inbox" forever, which is worse than telling them the truth.
 *
 * @returns True when a send would be attempted.
 */
export function emailIsConfigured(): boolean {
  try {
    return Boolean(process.env.RESEND_API_KEY);
  } catch {
    return false;
  }
}

/**
 * Sends one plain-text message.
 *
 * @param message - The message to send.
 * @returns The outcome. Never throws: every caller has something useful
 *          to do with a failure and nothing useful to do with an
 *          exception mid-request.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { ok: false, reason: "not_configured", detail: "RESEND_API_KEY is not set" };
    }
    const to = message.to?.trim();
    if (!to) return { ok: false, reason: "rejected", detail: "No recipient" };

    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.DIRECTORY_MAIL_FROM || DEFAULT_FROM,
        to: [to],
        subject: message.subject,
        text: message.text,
        reply_to: message.replyTo || process.env.DIRECTORY_MAIL_REPLY_TO || DEFAULT_REPLY_TO,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, reason: "rejected", detail: `${response.status} ${detail.slice(0, 300)}` };
    }

    const payload = (await response.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, id: payload?.id ?? null };
  } catch (error) {
    return {
      ok: false,
      reason: "network",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Sends several messages, reporting each outcome.
 *
 * Used by the match router, where one agency's address bouncing must not
 * stop the other two from being told about the project. Sends in parallel
 * because a founder is waiting on the response.
 *
 * @param messages - The messages to send.
 * @returns One result per message, in order.
 */
export async function sendEmails(messages: EmailMessage[]): Promise<EmailResult[]> {
  try {
    return await Promise.all(messages.map((message) => sendEmail(message)));
  } catch {
    return messages.map(() => ({
      ok: false as const,
      reason: "network" as const,
      detail: "send failed",
    }));
  }
}

/**
 * Builds an absolute URL for a link inside an email.
 *
 * Always absolute and always on the canonical host: a relative link in an
 * email is dead, and a link on a preview host in a magic-link email sends
 * an agency to a deployment that will be gone next week.
 *
 * @param path - Root-relative path, e.g. "/directory/claim/abc".
 * @returns The absolute URL.
 */
export function emailUrl(path: string): string {
  try {
    return new URL(path, SITE_URL).toString();
  } catch {
    return `${SITE_URL}${path}`;
  }
}

/** Sign-off used on every message. Kept here so the three templates
 *  cannot drift into signing as different people. */
export const EMAIL_SIGNATURE = "Emma\nSuperflow\nhttps://usesuperflow.ai/directory";
