"use client";

import { useEffect, useRef } from "react";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/use-analytics";

/** Props for {@link SolutionAnalytics}. */
export interface SolutionAnalyticsProps {
  /** The solution page slug, attached to the event as `slug`. */
  slug: string;
}

/**
 * Fires `solutions_page_viewed { slug }` once when a solutions page mounts
 * (spec section 8). Renders nothing. The ref guard keeps React's development
 * double-mount from sending the event twice.
 *
 * @param props - The page slug.
 * @returns null.
 */
export default function SolutionAnalytics({ slug }: SolutionAnalyticsProps) {
  const { trackEvent } = useAnalytics();
  const hasFired = useRef<boolean>(false);

  useEffect(() => {
    try {
      if (hasFired.current) {
        return;
      }
      hasFired.current = true;
      trackEvent(AnalyticsEvents.SOLUTIONS_PAGE_VIEWED, { slug });
    } catch {
      // Analytics must never break the page.
    }
  }, [slug, trackEvent]);

  return null;
}
