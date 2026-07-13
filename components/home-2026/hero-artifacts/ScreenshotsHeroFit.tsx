import type { ReactNode } from "react";
import ScreenshotArtifact from "../feature-artifacts/ScreenshotArtifact";
import AuthenticatedPagesArtifact from "../feature-artifacts/AuthenticatedPagesArtifact";

/**
 * Hero-window fit wrappers for the Screenshots feature page hero tabs.
 *
 * Each reuses the same variant-driven {@link ScreenshotArtifact} the feature
 * section renders (single source of truth), passing its `hero` prop so the
 * composition is re-centred and enlarged for the fully-visible hero product
 * window. The four hero tabs walk the page's lead beats: the snapshot saved on
 * comment, the page changing (then-and-now), capture behind a password, and the
 * client seeing the same snapshot.
 *
 * These are registered under the page-scoped `screenshots` key rather than the
 * global `HERO_ARTIFACTS` map because the labels slugify to generic ids (e.g.
 * "the-client-s-view" — the same id the private-comments client view already
 * claims globally); the scope keeps them bound to this page without touching
 * its CMS labels.
 */

/**
 * Hero "Comment, snapshot saved" tab — a reviewed page + a pinned comment whose
 * card embeds the auto-captured page snapshot with a green "Snapshot saved"
 * badge.
 *
 * @returns The capture hero scene, or `null` on failure.
 */
export function HeroScreenshotCaptureArtifact(): ReactNode {
  try {
    return <ScreenshotArtifact hero variant="capture" />;
  } catch {
    return null;
  }
}

/**
 * Hero "The page changed" tab — the live page (changed, anchor lost) beside the
 * saved snapshot that still shows the original page and comment.
 *
 * @returns The then-and-now hero scene, or `null` on failure.
 */
export function HeroScreenshotThenAndNowArtifact(): ReactNode {
  try {
    return <ScreenshotArtifact hero variant="then-and-now" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Behind a password" tab — reuses the Authenticated Pages behind-password
 * scene (a gate lifts to reveal the reviewed page), showing capture works on
 * gated pages the same as public ones.
 *
 * @returns The behind-password hero scene, or `null` on failure.
 */
export function HeroScreenshotBehindPasswordArtifact(): ReactNode {
  try {
    return <AuthenticatedPagesArtifact hero variant="behind-password" />;
  } catch {
    return null;
  }
}

/**
 * Hero "The client's view" tab — a phone showing the same snapshot from the
 * client's review link (no account, from their phone).
 *
 * @returns The client-view hero scene, or `null` on failure.
 */
export function HeroScreenshotClientViewArtifact(): ReactNode {
  try {
    return <ScreenshotArtifact hero variant="client-view" />;
  } catch {
    return null;
  }
}
