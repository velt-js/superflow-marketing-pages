import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";

/**
 * Feature-section app-window artifact — "Pinned Comments".
 *
 * A live web page with a comment pinned to a specific element: the shared
 * {@link PinnedCommentScene} draws the browser chrome, the dashed selected
 * element, the purple teardrop avatar pin and the comment dialog (Open status,
 * Milton / @Mark / "1 Reply"). Auto Screenshot renders the very same scene with
 * the screenshot flag on, so the two views stay pixel-in-sync.
 *
 * @returns The Pinned Comments window contents, filling its container.
 */
export default function PinnedCommentsArtifact(): ReactNode {
  try {
    return <PinnedCommentScene dataArtifact="pinned-comments" />;
  } catch {
    return null;
  }
}
