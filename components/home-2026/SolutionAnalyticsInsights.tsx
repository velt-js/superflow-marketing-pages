"use client";

import type { ReactNode } from "react";
import {
  SolutionInsightsFlow,
  type InsightSpec,
} from "./SolutionAskAiInsights";

/**
 * Analytics "dashboard → curated weekly insight" variant of the Solution-section
 * flow diagram.
 *
 * Reuses the shared {@link SolutionInsightsFlow} (single implementation): a left
 * column of minimal dashboard tiles — the week's status line, rounds-by-client
 * bars and a copy-vs-bug donut — resolves through the dashed data-pulse
 * connector into a single insight card labelled "This week". The card cycles one
 * curated takeaway per tile, highlighting its source, so the raw dashboard reads
 * as "already read for you". All motion is gated behind `prefers-reduced-motion`
 * by the shared flow.
 */

/** Accents shared by each tile's mini chart and its highlighted insight. */
const ACCENT_INDIGO = "#433df3";
const ACCENT_RED = "#ff5352";
const ACCENT_GREEN = "#109534";

/** The three curated weekly insights, one per dashboard tile. */
const ANALYTICS_SPECS: readonly InsightSpec[] = [
  {
    id: "status",
    kind: "line",
    label: "Status this week",
    accent: ACCENT_INDIGO,
    insight: (
      <>
        Open comments are <strong>up 75%</strong> since Tuesday.
      </>
    ),
  },
  {
    id: "rounds",
    kind: "bars",
    label: "Rounds by client",
    accent: ACCENT_RED,
    insight: (
      <>
        <strong>Northwind</strong> takes 2× the review rounds of any other
        client.
      </>
    ),
  },
  {
    id: "mix",
    kind: "donut",
    label: "Copy vs bug",
    accent: ACCENT_GREEN,
    insight: (
      <>
        <strong>68%</strong> of this week&rsquo;s issues are copy, not bugs.
      </>
    ),
  },
];

/**
 * The Analytics Solution flow: minimal dashboard tiles that resolve into a
 * cycling, curated weekly insight card.
 *
 * @returns The analytics insights-flow element.
 */
export default function SolutionAnalyticsInsights(): ReactNode {
  return <SolutionInsightsFlow specs={ANALYTICS_SPECS} insightLabel="This week" />;
}
