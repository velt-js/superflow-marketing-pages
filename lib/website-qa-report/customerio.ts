// Customer.io: where State of Website QA leads are stored, and how their one
// email is sent. Customer.io already sends Superflow's transactional email.
//
// Two calls, both plain `fetch`, no SDK:
//
//   1. Store the lead (Track API v2 batch): identify the person by email,
//      then record a `qa_report_requested` event carrying every form field.
//      The event is the lead record. On the person we set only
//      `lead_magnet` and `qa_report_*` attributes, never bare names like
//      `role` or `source`, because the same people may already be product
//      users whose attributes the app owns.
//
//   2. Send the email (Transactional API). The request overrides the
//      template's subject and body with the copy in email.ts, so the template
//      in Customer.io only has to exist and have a verified From address.
//
// Env, set in the deployment (Customer.io > Workspace settings > API
// credentials):
//   CUSTOMERIO_SITE_ID, CUSTOMERIO_TRACK_API_KEY   Track API, stores the lead
//   CUSTOMERIO_APP_API_KEY                         App API, sends the email
//   CUSTOMERIO_QA_REPORT_MESSAGE_ID                transactional message id
//                                                  (or its trigger name)
//   CUSTOMERIO_REGION                              "eu" for EU workspaces;
//                                                  anything else means US
//
// Each half reports `skipped` when its env is missing, so the form still
// works (the visitor still gets the PDF) and the route can log what is off.

import type { Lead } from "./lead";
import type { LeadEmail } from "./email";
import { LEAD_MAGNET } from "./report";

const TIMEOUT_MS = 8000;

export type DeliveryResult = "sent" | "skipped" | "failed";

const IS_EU = (process.env.CUSTOMERIO_REGION ?? "").trim().toLowerCase() === "eu";
const TRACK_ORIGIN = IS_EU ? "https://track-eu.customer.io" : "https://track.customer.io";
const APP_ORIGIN = IS_EU ? "https://api-eu.customer.io" : "https://api.customer.io";

/** The event that marks a report request. */
export const LEAD_EVENT = "qa_report_requested";

/**
 * Stores a lead as a person plus an event.
 *
 * @param lead - The validated form.
 * @param leadId - Opaque id, also carried by the email's download link.
 */
export async function storeLead(lead: Lead, leadId: string): Promise<DeliveryResult> {
  const siteId = process.env.CUSTOMERIO_SITE_ID ?? "";
  const apiKey = process.env.CUSTOMERIO_TRACK_API_KEY ?? "";
  if (!siteId || !apiKey) return "skipped";

  try {
    const identifiers = { email: lead.email };
    const now = Math.floor(Date.now() / 1000);
    const response = await fetch(`${TRACK_ORIGIN}/api/v2/batch`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${siteId}:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batch: [
          {
            type: "person",
            action: "identify",
            identifiers,
            attributes: {
              email: lead.email,
              lead_magnet: LEAD_MAGNET,
              qa_report_requested_at: now,
              qa_report_role: lead.role,
              qa_report_website: lead.website,
              qa_report_source: lead.source,
              qa_report_benchmark_rounds: lead.benchmark_rounds,
            },
          },
          {
            type: "person",
            action: "event",
            identifiers,
            name: LEAD_EVENT,
            id: leadId,
            timestamp: now,
            attributes: { ...lead, lead_magnet: LEAD_MAGNET, lead_id: leadId },
          },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(
        `[qa-report] Customer.io track ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[qa-report] Customer.io track failed:", error);
    return "failed";
  }
}

/**
 * Sends the report email.
 *
 * @param to - The lead's address.
 * @param email - Subject, bodies and links, from email.ts.
 */
export async function sendLeadEmail(to: string, email: LeadEmail): Promise<DeliveryResult> {
  const apiKey = process.env.CUSTOMERIO_APP_API_KEY ?? "";
  const rawMessageId = (process.env.CUSTOMERIO_QA_REPORT_MESSAGE_ID ?? "").trim();
  if (!apiKey || !rawMessageId) return "skipped";

  try {
    const messageId = /^\d+$/.test(rawMessageId) ? Number(rawMessageId) : rawMessageId;
    const response = await fetch(`${APP_ORIGIN}/v1/send/email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactional_message_id: messageId,
        to,
        identifiers: { email: to },
        subject: email.subject,
        body: email.html,
        plaintext_body: email.text,
        message_data: {
          download_url: email.downloadUrl,
          scan_url: email.scanUrl,
          lead_magnet: LEAD_MAGNET,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(
        `[qa-report] Customer.io send ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[qa-report] Customer.io send failed:", error);
    return "failed";
  }
}
