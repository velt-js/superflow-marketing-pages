import type { CSSProperties, ReactNode } from "react";
import { PdfFile } from "../hero-artifacts/MemoryUploadArtifact";
import {
  ClientColumn,
  MemoryCard,
  AGENCY_RULES_LABEL,
  CLIENT_ONE_ACCENT,
  CLIENT_ONE_LABEL,
  CLIENT_TWO_ACCENT,
  CLIENT_TWO_LABEL,
  ORG_MEMORY_LABEL,
} from "./MemoryScopeParts";
import styles from "./MemoryScopedThreeArtifact.module.css";

/**
 * Feature-section app-window artifact — "Scoped three ways" (memory feature
 * page, `block-holds` block, `scoped-three-ways` tab).
 *
 * Tells the "memory is scoped three ways" story in one static frame. The same
 * client columns as the "Per-client memory" artifact (Client 01 / Client 02 →
 * "32 Learnings in Memory") now merge downward: both memory cards feed a single
 * inverted-cup connector whose stem drops into an "Organization Memory" card.
 * A dog-eared "Agency Rules" file sheet sits to the left of that card and wires
 * into it with a short horizontal line — agency-wide rules plus every client's
 * learnings both rolling up into the org-level memory.
 *
 * Reuse over re-invention: the client columns, the memory cards and the org
 * card are the shared {@link ClientColumn} / {@link MemoryCard} pieces from
 * {@link ./MemoryScopeParts} (built on the site's {@link MemoryPill} card); the
 * "Agency Rules" sheet is the shared dog-eared {@link PdfFile} (relabelled with
 * a unique gradient/filter `idPrefix`). Only the 2→1 merge connector, the
 * agency-rules connector line and the left-anchored layout are authored here.
 *
 * The scene is left-anchored inside the shared white panel screen and lets the
 * second client column bleed off the right edge, matching the reference design.
 * A subtle rise/fade entrance replays on tab mount and rests settled under
 * `prefers-reduced-motion: reduce`, so this can be a server component. Geometry
 * mirrors Figma node 925:2667 (file aVubXS2jMWMDlRK42zvgoy).
 */

/** Root attribute used to locate the artifact for screenshots/registry lookup. */
const DATA_ARTIFACT = "memory-scoped-three";

/** Width (px) of the wider org-level memory card. */
const ORG_CARD_WIDTH = 312.5;

/** Width (px) of the dog-eared "Agency Rules" file sheet. */
const AGENCY_FILE_WIDTH = 106;

/** Compact, dark, centred two-line wordmark for the "Agency Rules" sheet. */
const AGENCY_LABEL_STYLE: CSSProperties = {
  color: "#1e1e1f",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
  letterSpacing: "-0.3px",
  textAlign: "center",
  padding: "0 14px",
  transform: "none",
  whiteSpace: "normal",
};

/**
 * The 2→1 merge connector: an inverted cup whose two shoulders rise to each
 * memory card's bottom-centre, meeting at a rounded horizontal bar, then a
 * single stem drops toward the Organization Memory card. Adapted from the
 * one-to-many branch in the "Upload once" hero artifact (reversed so two client
 * memories feed one org memory). Local coords map the shoulders to the two card
 * centres so the connector is not stretched and its rounded corners stay crisp.
 *
 * @returns The merge `<svg>` element, or `null` on failure.
 */
function MergeConnector(): ReactNode {
  try {
    return (
      <svg
        className={styles.mergeSvg}
        viewBox="0 0 352 165"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Cup: shoulders at each memory-card centre (x=0, x=352) drop to a
            rounded-corner horizontal bar. */}
        <path
          d="M0 0 V40 Q0 80 40 80 H312 Q352 80 352 40 V0"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Stem: drops from the cup's centre down to the org card. */}
        <path d="M176 80 V165" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Scoped three ways" feature-section artifact.
 *
 * @returns The client-columns + merge + org-memory + agency-rules scene, or
 *   `null` on failure.
 */
export default function MemoryScopedThreeArtifact(): ReactNode {
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

          <div className={styles.merge}>
            <MergeConnector />
          </div>

          <div className={styles.agencyFile}>
            <PdfFile
              label={AGENCY_RULES_LABEL}
              idPrefix="agencyRules"
              width={AGENCY_FILE_WIDTH}
              labelStyle={AGENCY_LABEL_STYLE}
            />
          </div>

          <span className={styles.agencyConnector} aria-hidden="true" />

          <div className={styles.orgCard}>
            <MemoryCard label={ORG_MEMORY_LABEL} width={ORG_CARD_WIDTH} />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
