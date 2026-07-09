import type { ComponentType } from "react";
import AgentsAtWorkArtifact from "./AgentsAtWorkArtifact";
import BuildAgentsArtifact from "./BuildAgentsArtifact";
import GuestModeArtifact from "./GuestModeArtifact";
import PrivateCommentArtifact from "./PrivateCommentArtifact";
import IntegrationsArtifact from "./IntegrationsArtifact";
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
};
