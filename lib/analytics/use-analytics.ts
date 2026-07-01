"use client";

import { useCallback } from "react";
import { analytics } from "./analytics-service";

const LOG_PREFIX = "[useAnalytics]";

/**
 * Component-facing hook around the analytics singleton. Keeps components
 * decoupled from the Amplitude SDK directly (mirrors the component-vs-service
 * separation used in the source Angular app).
 *
 * @returns Stable `trackEvent` and `trackPage` callbacks.
 */
export function useAnalytics() {
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      try {
        analytics.trackEvent(eventName, properties);
      } catch (error) {
        console.error(`${LOG_PREFIX} trackEvent failed:`, error);
      }
    },
    [],
  );

  const trackPage = useCallback(
    (pageName: string, properties?: Record<string, unknown>) => {
      try {
        analytics.trackPage(pageName, properties);
      } catch (error) {
        console.error(`${LOG_PREFIX} trackPage failed:`, error);
      }
    },
    [],
  );

  return { trackEvent, trackPage };
}
