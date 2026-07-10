import type { ReactNode } from "react";
import AskAiArtifact from "../feature-artifacts/AskAiArtifact";

/**
 * Hero-window fit wrappers for the Ask AI feature page hero tabs.
 *
 * Rather than authoring duplicate hero artifacts, the Ask AI hero tabs reuse
 * the same variant-driven {@link AskAiArtifact} the feature section renders
 * (single source of truth). Each wrapper renders the artifact with its opt-in
 * `hero` prop (which re-centers and widens the chat column for the wider hero
 * product window) plus the tab's `variant`. The default "Ask the review
 * history" tab reuses `HeroAskAiArtifact` from `MemoryHeroFit`, so only the
 * four non-default variants live here.
 */

/**
 * Hero "Per-client" tab — a ranking of which clients draw the most review
 * rounds, fitted to the hero product window.
 *
 * @returns The per-client Ask AI hero scene, or `null` on failure.
 */
export function HeroAskAiPerClientArtifact(): ReactNode {
  try {
    return <AskAiArtifact hero variant="ask-ai-per-client" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Cross-project" tab — recurring patterns that repeat across every
 * project, fitted to the hero product window.
 *
 * @returns The cross-project Ask AI hero scene, or `null` on failure.
 */
export function HeroAskAiCrossProjectArtifact(): ReactNode {
  try {
    return <AskAiArtifact hero variant="ask-ai-cross-project" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Analytics on demand" tab — a breakdown generated from the last six
 * months of reviews, fitted to the hero product window.
 *
 * @returns The analytics Ask AI hero scene, or `null` on failure.
 */
export function HeroAskAiAnalyticsArtifact(): ReactNode {
  try {
    return <AskAiArtifact hero variant="ask-ai-analytics" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Ops signals" tab — a daily digest of signals needing attention across
 * every review, fitted to the hero product window.
 *
 * @returns The ops-signals Ask AI hero scene, or `null` on failure.
 */
export function HeroAskAiOpsSignalsArtifact(): ReactNode {
  try {
    return <AskAiArtifact hero variant="ask-ai-ops-signals" />;
  } catch {
    return null;
  }
}
