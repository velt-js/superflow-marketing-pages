"use client";

// Mounts the Amplitude route-change page-view side effect. Rendered from
// app/layout.tsx inside a <Suspense> boundary because usePageView() reads
// useSearchParams(), which opts its subtree into dynamic rendering.
//
// Kept separate from PageviewTracker (GTM/GA4): those skip the first
// run because their SDKs auto-fire the initial pageview, whereas Amplitude
// autocapture pageViews is disabled, so Amplitude must track the entry page.

import { usePageView } from "@/lib/analytics/use-page-view";

/**
 * Renders nothing; wires up Amplitude page-view tracking for the app. The
 * hook is called unconditionally (React Rules of Hooks); its own effect
 * handles error catching internally.
 *
 * @returns Always `null`.
 */
export function AmplitudePageView() {
  usePageView();
  return null;
}
