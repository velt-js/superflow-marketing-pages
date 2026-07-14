"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./RecordWalkthroughArtifact.module.css";

/**
 * Feature-section artifact — "Record Walkthrough".
 *
 * Matches the Figma comp (node 859:1485): the scene sits directly on a flat
 * white surface — a grey media placeholder top-left, skeleton copy to its
 * right, and a compact glowing indigo webcam bubble under its bottom-left
 * corner. The bubble plays a muted, looping webcam clip so it feels live
 * (holding on a poster frame under reduced motion).
 *
 * The two status elements share one anchor (overlapping the webcam bubble's
 * bottom edge) and play as one looping sequence:
 * 1. Countdown — a white pill counts "Starting Recording in 3 → 2 → 1".
 * 2. Recording — the pill is replaced in place by a same-sized control bar
 *    (purple screen-share badge, mm:ss timer ticking up from 00:00, pause
 *    bars, coral stop square, grey "×"), then the loop restarts.
 *
 * Under `prefers-reduced-motion: reduce` the interval never starts; the
 * recording bar is shown statically (00:42), matching the Figma comp.
 */

const DATA_ARTIFACT = "record-walkthrough";
const COUNTDOWN_PREFIX = "Starting Recording in";

/** Looping, muted webcam clip that makes the bubble feel live. */
const WEBCAM_VIDEO_SRC = "/videos/home-2026/record-walkthrough.mp4";
/** Still frame shown before the clip loads and when motion is reduced. */
const WEBCAM_POSTER_SRC = "/images/home-2026/record-walkthrough/webcam-poster.jpg";
/** Indigo Superflow live-cursor riding the bubble's top-left as it roams. */
const CURSOR_SRC = "/images/home-2026/record-walkthrough/cursor.svg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Wall-clock length of one sequence tick, in milliseconds. */
const TICK_MS = 1000;
/** Seconds spent in the countdown phase (the pill counts 3 → 2 → 1). */
const COUNTDOWN_SECONDS = 3;
/** Seconds spent recording before the loop restarts from the countdown. */
const RECORDING_SECONDS = 12;
/** Total loop length across both phases. */
const LOOP_SECONDS = COUNTDOWN_SECONDS + RECORDING_SECONDS;
/** Frozen countdown number shown when motion is reduced (matches the comp). */
const STATIC_COUNTDOWN_VALUE = COUNTDOWN_SECONDS;
/** Frozen timer value shown when motion is reduced (matches the comp). */
const STATIC_ELAPSED_SECONDS = 42;

const SECONDS_PER_MINUTE = 60;
const TIME_PAD_LENGTH = 2;
const TIME_PAD_CHAR = "0";

/** Carries the roam duration (synced to the recording phase) into the module. */
interface RoamerStyle extends CSSProperties {
  "--rw-roam-duration": string;
}

/**
 * Format a whole number of seconds as a zero-padded mm:ss timer.
 *
 * @param totalSeconds - Elapsed seconds (negatives and fractions are clamped).
 * @returns The timer label, e.g. "00:42".
 */
function formatTimer(totalSeconds: number): string {
  try {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / SECONDS_PER_MINUTE);
    const seconds = safeSeconds % SECONDS_PER_MINUTE;
    const paddedMinutes = String(minutes).padStart(TIME_PAD_LENGTH, TIME_PAD_CHAR);
    const paddedSeconds = String(seconds).padStart(TIME_PAD_LENGTH, TIME_PAD_CHAR);
    return `${paddedMinutes}:${paddedSeconds}`;
  } catch {
    return "00:00";
  }
}

/**
 * Screen-share glyph (monitor with an out-going arrow) for the pill badges.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The screen-share `<svg>` element, or null on failure.
 */
function ScreenShareGlyph({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
        <path d="M7 20h10" />
        <path d="M9 16v4" />
        <path d="M15 16v4" />
        <path d="M17 4h4v4" />
        <path d="M16 9l5 -5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Pause glyph — two slim rounded vertical bars — on the recording control bar.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The pause `<svg>` element, or null on failure.
 */
function PauseGlyph({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="5.5" y="4" width="3" height="12" rx="1.5" />
        <rect x="11.5" y="4" width="3" height="12" rx="1.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Close glyph — a thin grey "×" — trailing both status elements.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The close `<svg>` element, or null on failure.
 */
function CloseGlyph({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 6l12 12M18 6l-12 12" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Record Walkthrough" feature-section artifact.
 *
 * @returns The screen-recording scene looping between the countdown pill and
 *   the recording control bar, filling its container.
 */
export default function RecordWalkthroughArtifact(): ReactNode {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      const media = window.matchMedia(REDUCED_MOTION_QUERY);
      const applyPreference = (): void => {
        try {
          setReducedMotion(media.matches);
        } catch {
          setReducedMotion(false);
        }
      };
      applyPreference();
      media.addEventListener("change", applyPreference);
      return () => media.removeEventListener("change", applyPreference);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    try {
      if (reducedMotion) {
        return undefined;
      }
      const intervalId = window.setInterval(() => {
        try {
          setStep((previous) => (previous + 1) % LOOP_SECONDS);
        } catch {
          setStep(0);
        }
      }, TICK_MS);
      return () => window.clearInterval(intervalId);
    } catch {
      return undefined;
    }
  }, [reducedMotion]);

  // Keep the webcam clip playing, but hold on the poster frame when the user
  // prefers reduced motion.
  useEffect(() => {
    try {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      if (reducedMotion) {
        video.pause();
      } else {
        const playback = video.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => undefined);
        }
      }
    } catch {
      /* Autoplay may be blocked; the poster frame remains as a fallback. */
    }
  }, [reducedMotion]);

  try {
    const inCountdownPhase = step < COUNTDOWN_SECONDS;
    // The pill and bar share one anchor, so only ever show one at a time.
    // Reduced motion settles on the recording bar (static 00:42).
    const showCountdown = !reducedMotion && inCountdownPhase;
    const showRecording = reducedMotion || !inCountdownPhase;

    // The webcam only roams once recording starts; it stays docked at home
    // through the countdown. One roam pass fills the recording window.
    const roaming = !reducedMotion && !inCountdownPhase;
    const roamerClassName = roaming
      ? `${styles.roamer} ${styles.roaming}`
      : styles.roamer;
    const roamerStyle: RoamerStyle = {
      "--rw-roam-duration": `${RECORDING_SECONDS}s`,
    };

    const countdownValue = reducedMotion
      ? STATIC_COUNTDOWN_VALUE
      : Math.max(1, COUNTDOWN_SECONDS - step);
    const elapsedSeconds = reducedMotion
      ? STATIC_ELAPSED_SECONDS
      : Math.max(0, step - COUNTDOWN_SECONDS);
    const timerLabel = formatTimer(elapsedSeconds);

    const countdownClassName = showCountdown
      ? styles.countdownPill
      : `${styles.countdownPill} ${styles.statusHidden}`;
    const recordingClassName = showRecording
      ? styles.recordingBar
      : `${styles.recordingBar} ${styles.statusHidden}`;

    return (
      <div className={styles.root} data-artifact={DATA_ARTIFACT}>
        <div className={styles.body} aria-hidden="true">
          <span className={styles.mediaBlock} />
          <div className={styles.skeletonHeadings}>
            <span className={styles.skeletonHeading} />
            <span className={`${styles.skeletonHeading} ${styles.skeletonHeadingShort}`} />
          </div>
          <div className={styles.skeletonLines}>
            <span className={styles.skeletonLine} />
            <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
            <span className={styles.skeletonLine} />
          </div>
        </div>

        {/* The recording toolbar stays put; only the webcam bubble and its
            cursor roam the browser on a CSS timeline, then reset. */}
        <div className={styles.recorderGroup}>
          <div className={roamerClassName} style={roamerStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.cursor}
              src={CURSOR_SRC}
              alt=""
              aria-hidden="true"
            />

            <div className={styles.webcam} aria-hidden="true">
              <span className={styles.webcamGlow} />
              <span className={styles.webcamRing} />
              <span className={styles.webcamPhoto}>
                <video
                  ref={videoRef}
                  className={styles.webcamVideo}
                  src={WEBCAM_VIDEO_SRC}
                  poster={WEBCAM_POSTER_SRC}
                  autoPlay={!reducedMotion}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </span>
            </div>
          </div>

          {/* Countdown pill, sitting where the webcam bubble docks at home. */}
          <div className={countdownClassName}>
            <span className={styles.badge}>
              <ScreenShareGlyph size={17} />
            </span>
            <span className={styles.countdownText}>
              {COUNTDOWN_PREFIX}{" "}
              {/* Keyed so the number pops on each 3 → 2 → 1 change. */}
              <span key={countdownValue} className={styles.countdownValue}>
                {countdownValue}
              </span>
            </span>
            <span className={styles.close}>
              <CloseGlyph size={16} />
            </span>
          </div>

          {/* Recording control bar — drops in exactly where the pill was. */}
          <div className={recordingClassName}>
            <span className={styles.badgeSmall}>
              <ScreenShareGlyph size={17} />
            </span>
            <span className={styles.timer}>{timerLabel}</span>
            <span className={styles.control}>
              <PauseGlyph size={18} />
            </span>
            <span className={styles.stopSquare} />
            <span className={styles.closeSmall}>
              <CloseGlyph size={16} />
            </span>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
