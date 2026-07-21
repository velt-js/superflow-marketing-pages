import type { ReactNode } from "react";
import IntegrationsArtifact from "./IntegrationsArtifact";

/**
 * ClickUp integration-page hero artifact — the shared "task and comment sync"
 * {@link IntegrationsArtifact} (composer wired to a Kanban board) restricted to
 * a single ClickUp mark on top of the board, matching the Monday page design.
 *
 * A thin zero-prop wrapper so it can be registered in the hero static-artifact
 * map (`STATIC_HERO_ARTIFACTS` in `Hero.tsx`) and rendered on the flat hero
 * card without a tab strip.
 */

/** Logo ids kept in the board's top row (ClickUp only). */
const CLICKUP_LOGO_IDS: readonly string[] = ["clickup"];

/**
 * Render the ClickUp-only variant of the integrations sync artifact.
 *
 * @returns The sync composition with only the ClickUp logo, or `null` on failure.
 */
export default function IntegrationsClickUpArtifact(): ReactNode {
  try {
    return <IntegrationsArtifact logoIds={CLICKUP_LOGO_IDS} />;
  } catch {
    return null;
  }
}
