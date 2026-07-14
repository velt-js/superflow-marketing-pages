import type { ReactNode } from "react";
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

/** Agent identity + finding copy shown on the card. */
const AGENT_NAME = "Grammar Check";
const AGENT_TIME = "3h";
const FINDING_TITLE = "Typo in the hero headline";
const FINDING_DESCRIPTION =
  "\u201Ceffortlesly\u201D is misspelled \u2014 it should read \u201Ceffortlessly.\u201D";

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
        }}
      />
    );
  } catch {
    return null;
  }
}
