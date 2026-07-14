import type { ReactNode } from "react";
import { fitToHeroWindow } from "./CommentsHeroFit";
import {
  RecordingsScreenArtifact,
  RecordingsVoiceArtifact,
  RecordingsCameraArtifact,
  RecordingsPinnedArtifact,
  RecordingsClientArtifact,
} from "../feature-artifacts/RecordingsArtifacts";

/**
 * Hero-window fit wrappers for the Recordings feature page hero tabs.
 *
 * Like the comments hero tabs, the recordings hero reuses the same feature
 * artifacts the feature section renders (single source of truth). The four
 * page-based beats — record the screen, say it in voice, on camera, it's a
 * comment — are {@link PinnedCommentScene} scenes authored for the feature
 * panel canvas, so they reuse the shared {@link fitToHeroWindow} frame
 * (full-width browser chrome + Superflow floating toolbar over the zoomed-out
 * page). The fifth beat — "the client watches" — is a phone, not a website
 * page, so it renders on its own centred (its `hero` prop centres the phone in
 * the window) without the chrome/toolbar band.
 */

/**
 * Hero "Record the screen" tab — the screen recording pinned as a comment,
 * fitted to the hero window.
 *
 * @returns The fitted screen-recording scene, or `null` on failure.
 */
export function HeroRecordingsScreenArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<RecordingsScreenArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "Say it in voice" tab — the voice note pinned as a comment (audio player
 * + caption + transcript), fitted to the hero window.
 *
 * @returns The fitted voice-note scene, or `null` on failure.
 */
export function HeroRecordingsVoiceArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<RecordingsVoiceArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "On camera" tab — the camera recording pinned as a comment (live webcam
 * video card), fitted to the hero window.
 *
 * @returns The fitted camera-recording scene, or `null` on failure.
 */
export function HeroRecordingsCameraArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<RecordingsCameraArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "It's a comment" tab — the recording behaving like any comment (pinned,
 * status pill, resolve, reply row), fitted to the hero window.
 *
 * @returns The fitted pinned-recording scene, or `null` on failure.
 */
export function HeroRecordingsPinnedArtifact(): ReactNode {
  try {
    return fitToHeroWindow(<RecordingsPinnedArtifact hero />);
  } catch {
    return null;
  }
}

/**
 * Hero "The client watches" tab — the client playing the recording from their
 * link on a phone (no account, no app). Rendered on its own, centred in the
 * hero window (no browser chrome / toolbar band, since it's a phone).
 *
 * @returns The centred client-playback scene, or `null` on failure.
 */
export function HeroRecordingsClientArtifact(): ReactNode {
  try {
    return <RecordingsClientArtifact hero />;
  } catch {
    return null;
  }
}
