import type { ReactNode } from "react";
import IntegrationsArtifact from "./IntegrationsArtifact";

/**
 * Monday integration-page hero artifact — the shared "task and comment sync"
 * {@link IntegrationsArtifact} (composer wired to a Kanban board) restricted to
 * a single Monday mark on top of the board, per the Monday page design.
 *
 * A thin zero-prop wrapper so it can be registered in the hero static-artifact
 * map (`STATIC_HERO_ARTIFACTS` in `Hero.tsx`) and rendered on the flat hero
 * card without a tab strip.
 */

/** Logo ids kept in the board's top row (Monday only). */
const MONDAY_LOGO_IDS: readonly string[] = ["monday"];

/**
 * Render the Monday-only variant of the integrations sync artifact.
 *
 * @returns The sync composition with only the Monday logo, or `null` on failure.
 */
export default function IntegrationsMondayArtifact(): ReactNode {
  try {
    return <IntegrationsArtifact logoIds={MONDAY_LOGO_IDS} />;
  } catch {
    return null;
  }
}
