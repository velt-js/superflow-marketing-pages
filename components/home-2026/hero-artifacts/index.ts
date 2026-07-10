import type { ComponentType } from "react";
import AgentsAtWorkArtifact from "./AgentsAtWorkArtifact";
import BuildAgentsArtifact from "./BuildAgentsArtifact";
import BuiltInChecksArtifact from "./BuiltInChecksArtifact";
import GuestModeArtifact from "./GuestModeArtifact";
import PrivateCommentArtifact from "./PrivateCommentArtifact";
import IntegrationsArtifact from "./IntegrationsArtifact";
import RunOnDemandArtifact from "./RunOnDemandArtifact";
import MemoryUploadArtifact from "./MemoryUploadArtifact";
import AppliedToNextAssetArtifact from "./AppliedToNextAssetArtifact";
import {
  HeroClientMemoryArtifact,
  HeroAskAiArtifact,
  HeroMemoryProactiveArtifact,
} from "./MemoryHeroFit";
import {
  HeroAskAiPerClientArtifact,
  HeroAskAiCrossProjectArtifact,
  HeroAskAiAnalyticsArtifact,
  HeroAskAiOpsSignalsArtifact,
} from "./AskAiHeroFit";
import {
  HeroCarryTheContextArtifact,
  HeroPinAnElementArtifact,
  HeroSelectTheWordsArtifact,
  HeroThreadItArtifact,
  HeroTrackItArtifact,
} from "./CommentsHeroFit";

/**
 * Registry of per-tab hero artifacts, keyed by the tab `id` (see `HOME_TABS`
 * and `COMMENTS_TABS` in {@link HeroWorkflowShowcase}, plus the CMS-derived tab
 * slugs). When the active tab id is present here, its artifact renders inside
 * the shared black window frame; otherwise the showcase falls back to its
 * generic workflow window (used by tab presets whose ids are not in this map).
 *
 * The homepage artifacts each own a bespoke file (+ CSS module); the comments
 * hero tabs instead reuse the feature-section comment artifacts verbatim,
 * fitted to the hero window via `CommentsHeroFit` (single source of truth).
 */
export const HERO_ARTIFACTS: Readonly<Record<string, ComponentType>> = {
  "qa-workflow": AgentsAtWorkArtifact,
  agents: BuildAgentsArtifact,
  "anonymous-login": GuestModeArtifact,
  "private-comment": PrivateCommentArtifact,
  integrations: IntegrationsArtifact,
  // Comments feature page tabs (COMMENTS_TABS ids / CMS "comments" showcase).
  "pin-an-element": HeroPinAnElementArtifact,
  "select-the-words": HeroSelectTheWordsArtifact,
  "thread-it": HeroThreadItArtifact,
  "carry-the-context": HeroCarryTheContextArtifact,
  "track-it": HeroTrackItArtifact,
  // Review Agents feature page tabs (REVIEW_AGENTS_TABS ids / CMS
  // "review-agents" showcase). Reuse existing hero artifacts verbatim, plus the
  // bespoke Built-in checks agents screen and the Run on Demand run screen.
  "build-from-checklist": BuildAgentsArtifact,
  "built-in-checks": BuiltInChecksArtifact,
  "findings-as-comments": AgentsAtWorkArtifact,
  "run-on-demand": RunOnDemandArtifact,
  "human-signs-off": HeroTrackItArtifact,
  // Memory feature page tabs (CMS "memory" hero.tabs slugs). "Learned from
  // reviews" reuses the homepage "memory" feature artifact, "Powers Ask AI"
  // reuses the homepage "ask-ai" feature artifact, and "Proactive suggestions"
  // reuses the "Pinned Comments" artifact with a Superflow Memory agent comment;
  // "Applied to the next asset" and "Upload once" are bespoke windows.
  "upload-once": MemoryUploadArtifact,
  "learned-from-reviews": HeroClientMemoryArtifact,
  "applied-to-the-next-asset": AppliedToNextAssetArtifact,
  "proactive-suggestions": HeroMemoryProactiveArtifact,
  "powers-ask-ai": HeroAskAiArtifact,
  // Ask AI feature page hero tabs (CMS "ask-ai" hero.tabs slugs). Each reuses
  // the variant-driven Ask AI feature artifact fitted to the hero window; the
  // default "Ask the review history" tab reuses the copy-issues breakdown.
  "ask-the-review-history": HeroAskAiArtifact,
  "per-client": HeroAskAiPerClientArtifact,
  "cross-project": HeroAskAiCrossProjectArtifact,
  "analytics-on-demand": HeroAskAiAnalyticsArtifact,
  "ops-signals": HeroAskAiOpsSignalsArtifact,
};
