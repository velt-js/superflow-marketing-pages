import type { ReactNode } from "react";
import IntegrationsArtifact from "./IntegrationsArtifact";

/**
 * Asana integration-page hero artifact — the shared "task and comment sync"
 * {@link IntegrationsArtifact} (composer wired to a Kanban board) restricted to
 * a single Asana mark on top of the board, matching the Monday page design.
 *
 * A thin zero-prop wrapper so it can be registered in the hero static-artifact
 * map (`STATIC_HERO_ARTIFACTS` in `Hero.tsx`) and rendered on the flat hero
 * card without a tab strip.
 */

/** Logo ids kept in the board's top row (Asana only). */
const ASANA_LOGO_IDS: readonly string[] = ["asana"];

/**
 * Render the Asana-only variant of the integrations sync artifact.
 *
 * @returns The sync composition with only the Asana logo, or `null` on failure.
 */
export default function IntegrationsAsanaArtifact(): ReactNode {
  try {
    return <IntegrationsArtifact logoIds={ASANA_LOGO_IDS} />;
  } catch {
    return null;
  }
}
