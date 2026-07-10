import type { ReactNode } from "react";
import {
  ClientColumn,
  CLIENT_ONE_ACCENT,
  CLIENT_ONE_LABEL,
  CLIENT_TWO_ACCENT,
  CLIENT_TWO_LABEL,
} from "./MemoryScopeParts";
import styles from "./MemoryPerClientArtifact.module.css";

/**
 * Feature-section app-window artifact — "Per-client memory" (memory feature
 * page, `block-holds` block, `per-client-memory` tab).
 *
 * Tells the "every client's memory is its own" story in one static frame: a row
 * of client columns, each a rounded lavender client card (a coloured Tabler
 * glyph + "Client NN") dropping a short connector into that client's white
 * "32 Learnings in Memory" card. The columns are left-anchored inside the
 * shared white panel screen and the second column bleeds off the right edge,
 * exactly as in the reference design.
 *
 * Reuse over re-invention: the client cards, connectors and memory cards are
 * the shared {@link ClientColumn} pieces from {@link ./MemoryScopeParts} (which
 * in turn reuse the site's {@link MemoryPill} `card` for the memory card).
 * Nothing bespoke is authored here beyond the left-anchored two-column layout,
 * so this artifact and its "Scoped three ways" sibling stay in visual lockstep.
 *
 * The scene is static; a subtle rise/fade entrance replays on tab mount and is
 * disabled under `prefers-reduced-motion: reduce`, so it can be a server
 * component.
 */

/** Root attribute used to locate the artifact for screenshots/registry lookup. */
const DATA_ARTIFACT = "memory-per-client";

/**
 * Render the "Per-client memory" feature-section artifact.
 *
 * @returns The two client-column scene, or `null` on failure.
 */
export default function MemoryPerClientArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact={DATA_ARTIFACT}>
        <div className={styles.stage}>
          <div className={styles.columns}>
            <ClientColumn
              icon="heart"
              label={CLIENT_ONE_LABEL}
              accent={CLIENT_ONE_ACCENT}
            />
            <ClientColumn
              icon="mood-wink"
              label={CLIENT_TWO_LABEL}
              accent={CLIENT_TWO_ACCENT}
            />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
