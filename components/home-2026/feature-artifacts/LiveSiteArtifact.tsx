import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";

/**
 * Feature-section app-window artifact — "Live Site".
 *
 * Visualises "comment on the real live site, not a stale copy of it". Rather
 * than maintaining a bespoke duplicate surface, this is a thin configuration
 * over the shared {@link PinnedCommentScene} (the same scene behind Pinned
 * Comments / Auto Screenshot): its `live` flag turns on the chrome's green
 * "Live" pill and the dimmed "Static copy · 2w ago" ghost card peeking out from
 * behind the pinned element, and the comment copy is overridden to read against
 * the live build ("Milton — just now: Looks great on the live build @Mark").
 *
 * @returns The Live Site window contents, filling its container.
 */

const AUTHOR_NAME = "Milton";
const TIME_AGO = "just now";
const COMMENT_TEXT = "Looks great on the live build";
const COMMENT_MENTION = "@Mark";

/**
 * Render the "Live Site" feature-section artifact.
 *
 * @returns The live-site scene contents, filling its container.
 */
export default function LiveSiteArtifact(): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="live-site"
        live
        author={AUTHOR_NAME}
        timeAgo={TIME_AGO}
        edited={false}
        bodyText={COMMENT_TEXT}
        mention={COMMENT_MENTION}
      />
    );
  } catch {
    return null;
  }
}
