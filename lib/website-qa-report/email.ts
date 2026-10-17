// The one email a State of Website QA lead receives.
//
// The copy lives here rather than in a Customer.io template so it is reviewed
// with the page it belongs to. The request overrides the template's subject
// and body; the template only has to exist (see customerio.ts).

import { SITE_URL } from "@/app/_seo/schema";
import {
  EMAIL_DOWNLOAD_PATH,
  EMAIL_HIGHLIGHTS,
  EMAIL_SOURCE,
  REPORT_TITLE,
  signupUrl,
} from "./report";

export const EMAIL_SUBJECT = `Your copy: ${REPORT_TITLE}`;

export type LeadEmail = {
  subject: string;
  html: string;
  text: string;
  downloadUrl: string;
  scanUrl: string;
};

/** Escapes text for an HTML body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds the email.
 *
 * @param leadId - Opaque id for this lead, so a download from the email can be
 *                 counted without putting the address in a URL.
 */
export function buildLeadEmail(leadId: string): LeadEmail {
  const download = new URL(`${SITE_URL}${EMAIL_DOWNLOAD_PATH}`);
  download.searchParams.set("source", EMAIL_SOURCE);
  download.searchParams.set("lid", leadId);
  const downloadUrl = download.toString();
  const scanUrl = signupUrl({ source: EMAIL_SOURCE });

  const text = [
    "Hi,",
    "",
    `Here's your report: Download ${REPORT_TITLE}`,
    downloadUrl,
    "",
    "Three numbers that surprised us:",
    ...EMAIL_HIGHLIGHTS.map((line) => `- ${line}`),
    "",
    "If you want to see what an AI QA teammate catches on one of your sites,",
    "you can start free with 500 AI credits: Scan your website",
    scanUrl,
    "",
    "Rakesh",
    "Founder, Superflow",
  ].join("\n");

  const p = 'style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#16171a"';
  const a = 'style="color:#433df3;font-weight:600"';
  const html = [
    '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px">',
    `<p ${p}>Hi,</p>`,
    `<p ${p}>Here's your report: <a ${a} href="${escapeHtml(downloadUrl)}">Download ${escapeHtml(REPORT_TITLE)}</a></p>`,
    `<p ${p}>Three numbers that surprised us:</p>`,
    '<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.6;color:#16171a">',
    ...EMAIL_HIGHLIGHTS.map((line) => `<li>${escapeHtml(line)}</li>`),
    "</ul>",
    `<p ${p}>If you want to see what an AI QA teammate catches on one of your sites, you can start free with 500 AI credits: <a ${a} href="${escapeHtml(scanUrl)}">Scan your website</a></p>`,
    `<p ${p}>Rakesh<br>Founder, Superflow</p>`,
    "</div>",
  ].join("\n");

  return { subject: EMAIL_SUBJECT, html, text, downloadUrl, scanUrl };
}
