import type { ReactNode } from "react";
import AnalyticsArtifact from "../feature-artifacts/AnalyticsArtifact";

/**
 * Hero-window fit wrappers for the Analytics feature page hero tabs.
 *
 * Rather than authoring duplicate hero artifacts, the Analytics hero tabs reuse
 * the same variant-driven {@link AnalyticsArtifact} the feature section renders
 * (single source of truth). Each wrapper renders the artifact with its opt-in
 * `hero` prop (which widens + centers the dashboard for the wider hero product
 * window) plus the tab's `variant`. Registered in `HERO_ARTIFACTS` by the
 * CMS-derived hero-tab slug.
 */

/**
 * Hero "The week's insights" tab — the curated insight feed (the page star),
 * fitted to the hero product window.
 *
 * @returns The insight-feed analytics hero scene, or `null` on failure.
 */
export function HeroAnalyticsInsightsArtifact(): ReactNode {
  try {
    return <AnalyticsArtifact hero variant="analytics-insights" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Act on one" tab — a single insight whose action button is pressed by
 * the cursor and flips to "Applied", fitted to the hero product window.
 *
 * @returns The act-on-one analytics hero scene, or `null` on failure.
 */
export function HeroAnalyticsActArtifact(): ReactNode {
  try {
    return <AnalyticsArtifact hero variant="analytics-act" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Customers" tab — a per-client trend chart plus a per-client rollup
 * list, fitted to the hero product window.
 *
 * @returns The customers analytics hero scene, or `null` on failure.
 */
export function HeroAnalyticsCustomersArtifact(): ReactNode {
  try {
    return <AnalyticsArtifact hero variant="analytics-customers" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Team" tab — review-load ranking bars with the "no per-person score"
 * caption, fitted to the hero product window.
 *
 * @returns The team analytics hero scene, or `null` on failure.
 */
export function HeroAnalyticsTeamArtifact(): ReactNode {
  try {
    return <AnalyticsArtifact hero variant="analytics-team" />;
  } catch {
    return null;
  }
}

/**
 * Hero "For Me" tab — personal stat cards, the resolution row and the "awaiting
 * your response" list, fitted to the hero product window.
 *
 * @returns The for-me analytics hero scene, or `null` on failure.
 */
export function HeroAnalyticsForMeArtifact(): ReactNode {
  try {
    return <AnalyticsArtifact hero variant="analytics-for-me" />;
  } catch {
    return null;
  }
}
