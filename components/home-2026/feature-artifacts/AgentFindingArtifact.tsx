import type { ReactNode } from "react";
import { findLibraryAgent } from "@/lib/solutions/agent-library";
import PinnedCommentScene from "./PinnedCommentScene";
import type { CommentsFeatureArtifactProps } from "./CommentsFeatureArtifacts";

/**
 * Feature-section app-window artifact — "Agent Finding".
 *
 * The same pinned-comment surface as {@link PinnedCommentScene} (browser
 * chrome, dashed selected element and the teardrop pin — here carrying the white
 * Lego-face agent glyph, matching the "Run on Demand" hero artifact), but the
 * popover is the {@link AgentCommentCard} — an AI-agent finding with a title, a
 * short description and green approve / coral reject actions — instead of the
 * threaded human comment. Used by the review-agents feature page's "Findings"
 * tab, where each issue lands as a pinned finding the reviewer accepts or
 * dismisses.
 *
 * @param props - Optional shared artifact props (e.g. `hero`).
 * @returns The agent-finding window contents, filling its container.
 */

/**
 * Agent identity + finding copy shown on the card: the Palette Guard finding
 * from the shared agent library, so the example matches the findings the
 * home hero and the "What your agents catch" section show.
 */
const AGENT_NAME = "Palette Guard";
const AGENT_TIME = "3h";
const FINDING_TITLE = "Primary button is off the brand palette";
const FINDING_DESCRIPTION =
  findLibraryAgent(AGENT_NAME)?.finding ??
  "Primary button uses #2F80ED. The brand guide allows #1E5BB8.";

export default function AgentFindingArtifact({
  hero = false,
}: CommentsFeatureArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="agent-finding"
        hero={hero}
        agentCard={{
          agentName: AGENT_NAME,
          timeAgo: AGENT_TIME,
          title: FINDING_TITLE,
          description: FINDING_DESCRIPTION,
          avatarVariant: "agentDots",
          // Illustrative: the approve/reject marks are not live controls.
          interactive: false,
        }}
      />
    );
  } catch {
    return null;
  }
}
