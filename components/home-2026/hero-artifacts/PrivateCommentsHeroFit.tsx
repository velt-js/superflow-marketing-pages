import type { ReactNode } from "react";
import PrivateCommentArtifact from "./PrivateCommentArtifact";

/**
 * Hero-window fit wrappers for the Private Comments feature page hero tabs.
 *
 * Each reuses the same variant-driven {@link PrivateCommentArtifact} the feature
 * section renders (single source of truth), passing its `hero` prop so the board
 * is centred and trimmed for the fully-visible hero product window. The three
 * hero tabs map to the page's lead beats: the team-private thread, a just-you
 * note (scope chip reads "Only you") and the client's clean view where the
 * private thread has vanished.
 */

/**
 * Hero "Team-private thread" tab — two teammates disagree in a marked-private
 * thread beside the client thread's one settled reply.
 *
 * @returns The team-private hero scene, or `null` on failure.
 */
export function HeroPrivateTeamThreadArtifact(): ReactNode {
  try {
    return <PrivateCommentArtifact hero variant="team-private" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Just-you notes" tab — a comment scoped to only you, pinned to the
 * element (the scope chip reads "Only you").
 *
 * @returns The just-you hero scene, or `null` on failure.
 */
export function HeroPrivateJustYouArtifact(): ReactNode {
  try {
    return <PrivateCommentArtifact hero variant="just-you" />;
  } catch {
    return null;
  }
}

/**
 * Hero "The client's view" tab — the same element opened from the client's
 * link: the private thread is gone, leaving one clean thread and an Approve cue.
 *
 * @returns The client-view hero scene, or `null` on failure.
 */
export function HeroPrivateClientViewArtifact(): ReactNode {
  try {
    return <PrivateCommentArtifact hero variant="client-view" />;
  } catch {
    return null;
  }
}
