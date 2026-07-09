import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";

/**
 * Feature-section app-window artifact — "Versioning".
 *
 * Visualises "every thread keeps the page versions it spanned, so you can tell
 * which version a comment was about". Rather than a bespoke duplicate surface,
 * this is a thin configuration over the shared {@link PinnedCommentScene} (the
 * same scene behind Pinned Comments / Auto Screenshot / Live Site): its
 * `versions` prop turns on the left rail of stacked VERSION buttons — the top
 * one active (accent-filled), the rest muted history — while the pinned comment
 * keeps the scene's default durable-thread copy ("Milton — 2w (EDITED): Let’s
 * update this @Mark · 1 Reply").
 *
 * @returns The Versioning window contents, filling its container.
 */

/** Version rail labels, newest → oldest; the first is the active version. */
const VERSION_LABELS: readonly string[] = [
  "VERSION 4",
  "VERSION 3",
  "VERSION 2",
  "VERSION 1",
];

/**
 * Render the "Versioning" feature-section artifact.
 *
 * @returns The versioning scene contents, filling its container.
 */
export default function VersioningArtifact(): ReactNode {
  try {
    return (
      <PinnedCommentScene dataArtifact="versioning" versions={VERSION_LABELS} />
    );
  } catch {
    return null;
  }
}
