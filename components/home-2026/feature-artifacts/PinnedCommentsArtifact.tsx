import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";
import type { CommentsFeatureArtifactProps } from "./CommentsFeatureArtifacts";

/**
 * Feature-section app-window artifact — "Pinned Comments".
 *
 * A live web page with a comment pinned to a specific element: the shared
 * {@link PinnedCommentScene} draws the browser chrome, the dashed selected
 * element, the purple teardrop avatar pin and the comment dialog (Open status,
 * Milton / @Mark / "1 Reply"). Auto Screenshot renders the very same scene with
 * the screenshot flag on, so the two views stay pixel-in-sync.
 *
 * @param props - Optional shared artifact props (e.g. `hero`).
 * @returns The Pinned Comments window contents, filling its container.
 */
export default function PinnedCommentsArtifact({
  hero = false,
}: CommentsFeatureArtifactProps = {}): ReactNode {
  try {
    return <PinnedCommentScene dataArtifact="pinned-comments" hero={hero} />;
  } catch {
    return null;
  }
}
