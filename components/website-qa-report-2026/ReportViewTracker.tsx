"use client";

// Fires `qa_report_viewed` once per page load, with the visitor's source,
// UTM values and referrer. Renders nothing.

import { useEffect } from "react";
import { QaReportEvents } from "@/lib/analytics/events";
import { getAttribution, trackReport } from "./report-store";

export function ReportViewTracker() {
  useEffect(() => {
    try {
      const { utm_source, utm_medium, utm_campaign, referrer } = getAttribution();
      trackReport(QaReportEvents.VIEWED, { utm_source, utm_medium, utm_campaign, referrer });
    } catch {
      // Analytics never breaks the page.
    }
  }, []);

  return null;
}
