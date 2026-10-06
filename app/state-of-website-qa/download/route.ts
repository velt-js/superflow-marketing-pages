// GET /state-of-website-qa/download
//
// The download link in the lead email. Counts the download
// (`qa_report_downloaded`, location "email") and redirects to the PDF.
// Downloads from the page itself are counted in the browser instead.

import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/website-qa-report/amplitude-server";
import { EMAIL_SOURCE, REPORT_FILES } from "@/lib/website-qa-report/report";
import { QaReportEvents } from "@/lib/analytics/events";

export const dynamic = "force-dynamic";

/** Keeps a query value short and printable before it reaches analytics. */
function clip(value: string | null, max = 120): string {
  return (value ?? "").replace(/[^\w.:@+-]/g, "").slice(0, max);
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const leadId = clip(url.searchParams.get("lid"), 64);

  await trackServerEvent({
    eventType: QaReportEvents.DOWNLOADED,
    // The lead id ties every click from one email together without putting
    // the address in a URL. A link with no id still counts, anonymously.
    deviceId: leadId ? `qa-report-${leadId}` : `qa-report-email-${crypto.randomUUID()}`,
    properties: {
      source: clip(url.searchParams.get("source")) || EMAIL_SOURCE,
      location: "email",
    },
  });

  const response = NextResponse.redirect(new URL(REPORT_FILES.pdf, request.url), 302);
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
