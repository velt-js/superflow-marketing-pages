import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";

/**
 * Feature-section app-window artifact — "Auto Screenshot".
 *
 * Identical to Pinned Comments — the same shared {@link PinnedCommentScene}
 * (browser chrome, dashed selected element, teardrop avatar pin and comment
 * dialog) — with the auto-captured page snapshot embedded inside the same
 * comment card. Rendered by flipping the scene's `screenshot` prop, conveying
 * "every comment captures the page as it looked, so context never gets lost."
 *
 * @returns The Auto Screenshot window contents, filling its container.
 */
export default function AutoScreenshotArtifact(): ReactNode {
  try {
    return <PinnedCommentScene dataArtifact="auto-screenshot" screenshot />;
  } catch {
    return null;
  }
}
