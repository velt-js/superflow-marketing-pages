// POST /api/leads/state-of-website-qa
//
// Takes the report form, stores the lead and sends the one email, and hands
// back the PDF link. The site had no lead endpoint before this one.
//
// The rule that shapes everything here: nobody is left without the report.
// Only a field error (bad email, bad website) stops the flow, because the
// person can fix it. A rate limit, a Customer.io outage or a missing env var
// still answers with the download link; the failure is logged instead.
//
// Accepts JSON (the page's script) and plain form posts (a browser running
// stale or no JavaScript, e.g. an old cached page on an iPhone). A form post
// is answered with a 303 straight to the PDF, so it downloads either way.
//
// Never triggers a scan or any product action.

import { NextResponse } from "next/server";
import { kvSlidingWindow } from "@/lib/toolkit/kv";
import { clientIpFrom } from "@/lib/toolkit/ratelimit";
import { HONEYPOT_FIELD, attributionFromPageUrl, parseLead } from "@/lib/website-qa-report/lead";
import { buildLeadEmail } from "@/lib/website-qa-report/email";
import { sendLeadEmail, storeLead } from "@/lib/website-qa-report/customerio";
import { REPORT_FILES, REPORT_PATH } from "@/lib/website-qa-report/report";

export const dynamic = "force-dynamic";

/** Generous for a person, tight for a script. */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxRequests: 10 };

/** Reads the body as a flat object, whatever it was posted as. */
async function readBody(
  request: Request,
): Promise<{ fields: Record<string, unknown>; isForm: boolean }> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const json = (await request.json()) as unknown;
      return {
        fields: json && typeof json === "object" ? (json as Record<string, unknown>) : {},
        isForm: false,
      };
    }
    const form = await request.formData();
    const fields: Record<string, unknown> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") fields[key] = value;
    });
    return { fields, isForm: true };
  } catch {
    return { fields: {}, isForm: !type.includes("application/json") };
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const downloadUrl = REPORT_FILES.pdf;
  const { fields, isForm } = await readBody(request);

  const referer = request.headers.get("referer");
  const parsed = parseLead(fields, attributionFromPageUrl(referer));

  if (!parsed.ok) {
    if (isForm) {
      // Native validation (type=email, required) catches nearly all of this
      // before it is sent. Send the rare miss back to the form.
      return NextResponse.redirect(new URL(`${REPORT_PATH}#get-the-report`, request.url), 303);
    }
    return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });
  }

  const done = (body: Record<string, unknown>, status = 200) =>
    isForm
      ? NextResponse.redirect(new URL(downloadUrl, request.url), 303)
      : NextResponse.json({ ok: true, downloadUrl, ...body }, { status });

  // A bot filled the field people cannot see. Answer exactly as a success
  // would, so it learns nothing, and store nothing.
  if (parsed.honeypot) {
    console.warn(`[qa-report] honeypot (${HONEYPOT_FIELD}) filled, dropped`);
    return done({ emailSent: true });
  }

  const ip = clientIpFrom(request.headers);
  try {
    const limit = await kvSlidingWindow({
      key: `ratelimit:lead:state-of-website-qa:${ip}`,
      ...RATE_LIMIT,
    });
    if (limit.limited) {
      console.warn(`[qa-report] rate limited ${ip}`);
      return done({ emailSent: false, limited: true }, isForm ? 200 : 429);
    }
  } catch {
    // The limiter fails open; so does this.
  }

  const { lead } = parsed;
  const leadId = crypto.randomUUID();
  const email = buildLeadEmail(leadId);
  const [stored, sent] = await Promise.all([
    storeLead(lead, leadId),
    sendLeadEmail(lead.email, email),
  ]);

  if (stored !== "sent" || sent !== "sent") {
    // Logged with the domain only: enough to spot a pattern, no address in
    // the logs.
    console.error(
      `[qa-report] lead ${leadId} (@${lead.email.split("@")[1] ?? "?"}) store=${stored} email=${sent}`,
    );
  }

  return done({ emailSent: sent === "sent", leadId });
}
