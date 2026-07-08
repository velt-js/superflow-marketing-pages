import type { ComponentType } from "react";
import AgentsAtWorkArtifact from "./AgentsAtWorkArtifact";
import BuildAgentsArtifact from "./BuildAgentsArtifact";
import GuestModeArtifact from "./GuestModeArtifact";
import PrivateCommentArtifact from "./PrivateCommentArtifact";
import IntegrationsArtifact from "./IntegrationsArtifact";

/**
 * Registry of per-tab hero artifacts, keyed by the homepage tab `id` (see
 * `HOME_TABS` in {@link HeroWorkflowShowcase}). When the active tab id is
 * present here, its artifact renders inside the shared black window frame;
 * otherwise the showcase falls back to its generic workflow window (used by
 * the feature-page and CMS tab presets, whose ids are not in this map).
 *
 * Each artifact owns its own file (+ CSS module) so they can be authored
 * independently without touching shared files.
 */
export const HERO_ARTIFACTS: Readonly<Record<string, ComponentType>> = {
  "qa-workflow": AgentsAtWorkArtifact,
  agents: BuildAgentsArtifact,
  "anonymous-login": GuestModeArtifact,
  "private-comment": PrivateCommentArtifact,
  integrations: IntegrationsArtifact,
};
