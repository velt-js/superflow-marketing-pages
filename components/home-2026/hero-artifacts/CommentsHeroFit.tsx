import type { ReactNode } from "react";
import styles from "./CommentsHeroFit.module.css";
import BrowserChrome from "../feature-artifacts/BrowserChrome";
import { FloatingToolbar } from "./GuestModeArtifact";
import PinnedCommentsArtifact from "../feature-artifacts/PinnedCommentsArtifact";
import {
  AttachmentCommentsArtifact,
  TextCommentsArtifact,
  ThreadCommentsArtifact,
  TrackingTaskManagementArtifact,
} from "../feature-artifacts/CommentsFeatureArtifacts";

/**
 * Hero-window fit wrappers for the comments feature page tabs.
 *
 * Rather than authoring duplicate hero artifacts, the comments hero tabs reuse
 * the same comment artifacts the feature section renders (single source of
 * truth). Those artifacts are authored for the feature panel — a 1204 × 602
 * left-anchored surface whose page content (including a 676px browser chrome)
 * bleeds off the right where the narrower feature column clips it. The hero
 * window is a similar size but fully visible, so each artifact is rendered with
 * its `hero` prop (which suppresses the panel chrome) on its native canvas,
 * scaled/offset (see `CommentsHeroFit.module.css`) to sit centered in the hero
 * window; the wrapper then paints its own full-width browser chrome band on top
 * (the shared `BrowserChrome`, matching the home hero "Agents at Work" chrome)
 * plus the home hero Superflow floating toolbar (reused `FloatingToolbar`) at
 * the bottom, so the tab reads as a zoomed-out, comment-enabled website like the
 * home hero Guest/Private artifacts. The artifacts themselves are unchanged, so
 * their feature-section usage is unaffected.
 */

/** Address shown in the hero comments browser chrome. */
const HERO_ADDRESS = "YOUR-SITE.COM";

/**
 * Wrap a feature comment artifact on its native 1204 × 602 canvas — zoomed out
 * and offset to fit the hero window — beneath a full-width browser chrome band
 * and above the shared Superflow floating toolbar.
 *
 * Every comments hero tab depicts a comment-enabled website page, so the toolbar
 * is shown on all of them (matching the home hero look). It is the exact same
 * `FloatingToolbar` the home hero Guest Mode artifact renders — reused, not
 * duplicated — and it self-positions at the bottom-centre of `.fit`.
 *
 * Exported so sibling hero-fit modules (e.g. `MemoryHeroFit`) can reuse the very
 * same chrome/toolbar frame instead of duplicating it.
 *
 * @param artifact - The feature comment artifact element to fit (rendered with
 *   its `hero` prop so its own panel chrome is suppressed).
 * @returns The artifact framed for the hero window, or `null` on failure.
 */
export function fitToHeroWindow(artifact: ReactNode): ReactNode {
  try {
    return (
      <div className={styles.fit}>
        <div className={styles.canvas}>{artifact}</div>
        <div className={styles.chromeWrap}>
          <BrowserChrome address={HERO_ADDRESS} />
        </div>
        <FloatingToolbar />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Hero "Pin an element" tab — reuses the feature "Pinned Comments" artifact (a
 * live page with a comment pinned to a dashed selected element), fitted to the
 * hero window.
 *
 * @returns The fitted pinned-comment scene.
 */
export function HeroPinAnElementArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<PinnedCommentsArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "Select the words" tab — reuses the feature "Text Comments" artifact
 * (a peach text-selection highlight the comment is pinned to), fitted to the
 * hero window.
 *
 * @returns The fitted text-selection scene.
 */
export function HeroSelectTheWordsArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<TextCommentsArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "Thread it" tab — reuses the feature "Thread Comments" artifact (types a
 * reply then posts it into the thread), fitted to the hero window.
 *
 * @returns The fitted threaded-comments scene.
 */
export function HeroThreadItArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<ThreadCommentsArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "Carry the context" tab — reuses the feature "Attachment" artifact (a
 * file/PDF dropped into the conversation so the supporting context travels with
 * the comment), fitted to the hero window.
 *
 * @returns The fitted attachment scene.
 */
export function HeroCarryTheContextArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<AttachmentCommentsArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "Track it" tab — reuses the feature "Tracking & Task Management" artifact
 * (an open status dropdown: Open / In Progress / Completed over the thread),
 * fitted to the hero window.
 *
 * @returns The fitted tracking/task-management scene.
 */
export function HeroTrackItArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<TrackingTaskManagementArtifact hero />);
  } catch {
    return null;
  }
}
