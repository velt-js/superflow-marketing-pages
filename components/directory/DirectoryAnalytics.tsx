"use client";

// Fires one Amplitude event when a directory page is first seen.
//
// A client component doing nothing but tracking, rather than tracking
// from inside the page components, for one reason: every page under
// /directory is a SERVER component, and the ones that matter here
// (category listings, agency profiles) are statically rendered. Adding
// `"use client"` to any of them to get a `useEffect` would move the whole
// card grid into the browser bundle and out of the server HTML, which is
// the one thing the listing page's SEO contract forbids.
//
// So this mounts alongside the content, renders nothing, and reports.

import { useEffect, useRef } from "react";

import { analytics } from "@/lib/analytics/analytics-service";

/**
 * Reports a page-scoped directory event exactly once per mount.
 *
 * Guarded with a ref rather than an empty dependency array alone: React
 * runs effects twice in development Strict Mode, and a doubled
 * `profile_viewed` would quietly inflate every funnel denominator in the
 * dashboard.
 *
 * @param props - Component props.
 * @param props.event - The event name, from `AnalyticsEvents`.
 * @param props.properties - Event properties.
 */
export default function DirectoryAnalytics({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  const reported = useRef(false);

  useEffect(() => {
    try {
      if (reported.current) return;
      reported.current = true;
      analytics.trackEvent(event, properties ?? {});
    } catch {
      // Analytics must never break a page.
    }
  }, [event, properties]);

  return null;
}
