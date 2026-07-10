import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";
import type { CommentsFeatureArtifactProps } from "./CommentsFeatureArtifacts";
import type { AgentCommentCardProps } from "./AgentCommentCard";

/** Default `data-artifact` hook for the durable pinned-comment surface. */
const DEFAULT_DATA_ARTIFACT = "pinned-comments";

/** Props for {@link PinnedCommentsArtifact}. */
export interface PinnedCommentsArtifactProps extends CommentsFeatureArtifactProps {
  /**
   * Overrides the root's `data-artifact` hook. Defaults to "pinned-comments" so
   * the existing feature mock and hero "Pin an element" usage are unchanged; a
   * reuse (e.g. the memory "Proactive suggestions" hero tab) can pass a distinct
   * value so its rendered root stays individually targetable.
   */
  dataArtifact?: string;
  /**
   * When provided, the pinned popover renders the shared agent-finding card
   * (agent name + agent mark + approve/reject) instead of the threaded human
   * comment — forwarded verbatim to {@link PinnedCommentScene}. Omit it (the
   * default) to keep the original human "Pinned Comments" dialog, so the
   * existing feature/hero usages render exactly as before.
   */
  agentCard?: Partial<AgentCommentCardProps>;
}

/**
 * Feature-section app-window artifact — "Pinned Comments".
 *
 * A live web page with a comment pinned to a specific element: the shared
 * {@link PinnedCommentScene} draws the browser chrome, the dashed selected
 * element, the purple teardrop avatar pin and the comment dialog (Open status,
 * Milton / @Mark / "1 Reply"). Auto Screenshot renders the very same scene with
 * the screenshot flag on, so the two views stay pixel-in-sync.
 *
 * The default renders the human "Pinned Comments" dialog. Passing
 * {@link PinnedCommentsArtifactProps.agentCard} swaps that popover for the
 * shared agent-finding card (used by the memory "Proactive suggestions" hero
 * tab, where Superflow Memory proactively pins a flag) without affecting the
 * default human-comment behaviour.
 *
 * @param props - Optional shared artifact props (`hero`), plus the optional
 *   `dataArtifact` override and `agentCard` config.
 * @returns The Pinned Comments window contents, filling its container.
 */
export default function PinnedCommentsArtifact({
  hero = false,
  dataArtifact = DEFAULT_DATA_ARTIFACT,
  agentCard,
}: PinnedCommentsArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact={dataArtifact}
        hero={hero}
        agentCard={agentCard}
      />
    );
  } catch {
    return null;
  }
}
