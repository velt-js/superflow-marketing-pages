import type { ReactNode } from "react";
import ReviewWorkflowArtifact from "../feature-artifacts/ReviewWorkflowArtifact";

/**
 * Hero-window fit wrappers for the Review Workflows feature page hero tabs.
 *
 * Each reuses the same variant-driven {@link ReviewWorkflowArtifact} the feature
 * section renders (single source of truth), passing its `hero` prop so the
 * flow-builder canvas is re-centred and trimmed for the fully-visible hero
 * product window. The five hero tabs walk the page's lead beats: the full
 * sample flow (the star), the push that starts it, building a step in the
 * visual builder, setting a transition condition, and the client gate that
 * closes every flow.
 *
 * These are registered under the page-scoped `review-workflows` key rather than
 * the global `HERO_ARTIFACTS` map because the labels slugify to generic ids
 * (e.g. "build-a-step") that other pages could also claim; the scope keeps them
 * bound to this page without touching its CMS labels.
 */

/**
 * Hero "The sample flow" tab — the full path: push trigger → AI agent pass →
 * condition → team review → client gate (humans and agents in one flow).
 *
 * @returns The sample-flow hero scene, or `null` on failure.
 */
export function HeroReviewWorkflowSampleArtifact(): ReactNode {
  try {
    return <ReviewWorkflowArtifact hero variant="sample-flow" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Triggered by a push" tab — a new deploy lands on the trigger and starts
 * the flow on its own.
 *
 * @returns The push-trigger hero scene, or `null` on failure.
 */
export function HeroReviewWorkflowPushArtifact(): ReactNode {
  try {
    return <ReviewWorkflowArtifact hero variant="push-trigger" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Build a step" tab — the visual builder: a step palette and a cursor
 * dragging a reviewer step into a dashed slot in the flow.
 *
 * @returns The build-step hero scene, or `null` on failure.
 */
export function HeroReviewWorkflowBuilderArtifact(): ReactNode {
  try {
    return <ReviewWorkflowArtifact hero variant="build-step" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Set a condition" tab — a transition's rule editor: work moves forward
 * only when the listed criteria are met.
 *
 * @returns The condition hero scene, or `null` on failure.
 */
export function HeroReviewWorkflowConditionArtifact(): ReactNode {
  try {
    return <ReviewWorkflowArtifact hero variant="condition" />;
  } catch {
    return null;
  }
}

/**
 * Hero "The client gate" tab — the last node: the client approves from a
 * no-account link (a recorded yes).
 *
 * @returns The client-gate hero scene, or `null` on failure.
 */
export function HeroReviewWorkflowGateArtifact(): ReactNode {
  try {
    return <ReviewWorkflowArtifact hero variant="client-gate" />;
  } catch {
    return null;
  }
}
