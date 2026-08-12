"use client";

import { useEffect, useRef } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";

/**
 * Fires `toolView` once per mount.
 *
 * Separate from the site-wide pageview tracker because the tools funnel is
 * reported on its own (views, runs, results, shares), and mixing it into
 * generic pageviews would make the conversion rates unreadable.
 *
 * @param props - The tool's registry slug.
 */
export function ToolViewTracker({ slug }: { slug: string }) {
  const { trackEvent } = useAnalytics();
  const sent = useRef(false);

  useEffect(() => {
    try {
      // React 18 and later mount effects twice in development. Without this
      // guard every local view double-counts.
      if (sent.current) return;
      sent.current = true;
      trackEvent(AnalyticsEvents.TOOL_VIEW, { tool: slug });
    } catch {
      // Analytics must never break a page render.
    }
  }, [slug, trackEvent]);

  return null;
}
