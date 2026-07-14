import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./RecordingMedia.module.css";

/**
 * Shared recording-media primitives for the Recordings feature page.
 *
 * These reproduce the three Superflow recording surfaces from Figma
 * (`955:2693` audio, `955:3832` video, `955:2770` composer): a voice-note audio
 * player pill (with an optional caption + transcript), a video attachment card,
 * and the "recording in progress" pill shown inside the review-toolbar composer.
 *
 * Every piece is prop-driven and presentational (no client hooks), so it renders
 * from both server and client components — the same way {@link ReviewToolbar}
 * does — and drops straight into the shared {@link CommentThreadCard} via its
 * `mediaAttachment` prop. The waveform is CSS-only: bars left of the play head
 * are indigo (played), the rest muted grey; a gentle pulse plays on the played
 * bars unless the viewer prefers reduced motion.
 */

/** Superflow indigo used for the play head, ring and CC active state. */
const INDIGO = "#625df5";

/** Label shown by the transcript "show more" affordance. */
const SHOW_MORE_LABEL = "show more";

/** Default played fraction of a settled waveform (0–1). */
const DEFAULT_PROGRESS = 0.44;

/**
 * A single avatar fill tone, matching the comment-card avatar tones so the
 * recording author disc looks native beside a threaded comment.
 */
export type RecordingAvatarTone = "green" | "orange" | "gray";

/** Maps an avatar tone to its CSS-module fill class. */
const AVATAR_TONE_CLASS: Readonly<Record<RecordingAvatarTone, string>> = {
  green: styles.avatarGreen,
  orange: styles.avatarOrange,
  gray: styles.avatarGray,
};

/**
 * Deterministic waveform bar pattern (height in px, `dot` = a short round tick).
 * Hand-tuned to echo the Figma waveform: clusters of tall bars broken up by
 * single dots so it reads as a real voice trace rather than a uniform equaliser.
 */
const WAVEFORM_BARS: readonly { height: number; dot?: boolean }[] = [
  { height: 14 },
  { height: 22 },
  { height: 10 },
  { height: 26 },
  { height: 18 },
  { height: 24 },
  { height: 12 },
  { height: 20 },
  { height: 5, dot: true },
  { height: 16 },
  { height: 5, dot: true },
  { height: 22 },
  { height: 13 },
  { height: 5, dot: true },
  { height: 19 },
  { height: 11 },
  { height: 24 },
  { height: 9 },
  { height: 5, dot: true },
  { height: 17 },
  { height: 23 },
  { height: 12 },
  { height: 5, dot: true },
  { height: 20 },
  { height: 15 },
  { height: 25 },
  { height: 10 },
  { height: 18 },
  { height: 5, dot: true },
  { height: 21 },
  { height: 13 },
  { height: 16 },
];

/** Shared glyph props: a pixel size and optional class. */
interface GlyphProps {
  /** Rendered width/height in pixels. */
  size?: number;
  className?: string;
}

/**
 * Play triangle glyph (filled), used by the video card's play button.
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The play `<svg>`, or `null` on failure.
 */
function PlayGlyph({ size = 18, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M8 5.5c0-.83.9-1.34 1.61-.92l10.2 6c.7.41.7 1.43 0 1.84l-10.2 6C8.9 18.84 8 18.33 8 17.5v-12Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Pause glyph — two slim rounded bars — for the audio/recording controls.
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The pause `<svg>`, or `null` on failure.
 */
function PauseGlyph({ size = 18, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <rect x="6" y="4.5" width="2.8" height="11" rx="1.4" />
        <rect x="11.2" y="4.5" width="2.8" height="11" rx="1.4" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Closed-caption glyph — a rounded rectangle carrying two "c" arcs.
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The CC `<svg>`, or `null` on failure.
 */
function CaptionGlyph({ size = 24, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={(size * 18) / 24}
        viewBox="0 0 24 18"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <rect x="1.5" y="1.5" width="21" height="15" rx="4" />
        <path d="M10 7.2a2.4 2.4 0 0 0-3.8 1.9 2.4 2.4 0 0 0 3.8 1.9" />
        <path d="M18 7.2a2.4 2.4 0 0 0-3.8 1.9 2.4 2.4 0 0 0 3.8 1.9" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Transcript glyph — a clipboard with copy lines (audio player affordance).
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The clipboard `<svg>`, or `null` on failure.
 */
function ClipboardGlyph({ size = 22, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M9 5h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
        <path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Transcript glyph — a document with copy lines (video card affordance).
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The document `<svg>`, or `null` on failure.
 */
function DocumentGlyph({ size = 22, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5-5Z" />
        <path d="M14 4v5h5M9 13h6M9 17h6M9 9h1" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Vertical kebab (three-dot) menu glyph for the video card footer.
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The kebab `<svg>`, or `null` on failure.
 */
function KebabGlyph({ size = 22, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="5.5" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="12" cy="18.5" r="1.7" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Trash glyph — the coral delete affordance on the recording composer pill.
 *
 * @param root0 - Glyph sizing/class props.
 * @returns The trash `<svg>`, or `null` on failure.
 */
function TrashGlyph({ size = 20, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the CSS-only waveform: bars left of the play head are indigo, the rest
 * muted grey. Short entries render as round "dots" like the Figma trace.
 *
 * @param root0 - Waveform props.
 * @param root0.progress - Played fraction (0–1); bars before it read as played.
 * @param root0.className - Optional class applied to the waveform track.
 * @returns The waveform row, or `null` on failure.
 */
function Waveform({
  progress = DEFAULT_PROGRESS,
  className,
}: {
  progress?: number;
  className?: string;
}): ReactNode {
  try {
    const safeProgress = Math.min(1, Math.max(0, progress));
    const playedCount = Math.round(WAVEFORM_BARS.length * safeProgress);
    const trackClassName = className
      ? `${styles.waveform} ${className}`
      : styles.waveform;

    return (
      <span className={trackClassName} aria-hidden="true">
        {WAVEFORM_BARS.map((bar, barIndex) => {
          const played = barIndex < playedCount;
          const barClassName = [
            styles.bar,
            bar.dot ? styles.barDot : "",
            played ? styles.barPlayed : styles.barIdle,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <span
              key={`bar-${barIndex}`}
              className={barClassName}
              style={{ height: bar.dot ? undefined : bar.height, animationDelay: `${barIndex * 60}ms` }}
            />
          );
        })}
      </span>
    );
  } catch {
    return null;
  }
}

/** Props for {@link AudioPlayer}. */
export interface AudioPlayerProps {
  /** Timer label shown beside the control, e.g. "00:16". */
  durationLabel: string;
  /** Played fraction of the waveform (0–1). Defaults to {@link DEFAULT_PROGRESS}. */
  progress?: number;
  /** When true, the control shows pause (playing); otherwise play. Defaults true. */
  playing?: boolean;
  /** When true, the CC toggle uses the active indigo treatment. Defaults true. */
  ccActive?: boolean;
  /** Optional caption shown in a light box below the pill. */
  caption?: string;
  /** Optional transcript paragraph shown (muted) below the caption. */
  transcript?: string;
  /** Optional class applied to the player root (positioning/width). */
  className?: string;
}

/**
 * Voice-note audio player pill (Figma `955:2693`): a play/pause control, a timer,
 * the waveform, a CC toggle and a transcript button — with an optional caption
 * box and truncated transcript ("show more") stacked beneath it.
 *
 * @param props - The audio player configuration.
 * @returns The audio player, or `null` on failure.
 */
export function AudioPlayer({
  durationLabel,
  progress = DEFAULT_PROGRESS,
  playing = true,
  ccActive = true,
  caption,
  transcript,
  className,
}: AudioPlayerProps): ReactNode {
  try {
    const rootClassName = className
      ? `${styles.audioRoot} ${className}`
      : styles.audioRoot;
    const ccClassName = ccActive
      ? `${styles.ccButton} ${styles.ccButtonActive}`
      : styles.ccButton;

    return (
      <div className={rootClassName}>
        <div className={styles.audioPill}>
          <span className={styles.playControl}>
            {playing ? <PauseGlyph size={18} /> : <PlayGlyph size={18} />}
          </span>
          <span className={styles.audioTimer}>{durationLabel}</span>
          <Waveform progress={progress} className={styles.audioWave} />
          <span className={ccClassName}>
            <CaptionGlyph size={24} />
          </span>
          <span className={styles.iconButton}>
            <ClipboardGlyph size={21} />
          </span>
        </div>
        {caption ? <p className={styles.captionBox}>{caption}</p> : null}
        {transcript ? (
          <p className={styles.transcript}>
            {transcript} <span className={styles.showMore}>{SHOW_MORE_LABEL}</span>
          </p>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link VideoAttachment}. */
export interface VideoAttachmentProps {
  /** Recording title shown in the footer, e.g. "Shrey's Recording…". */
  title: string;
  /** Duration label shown inside the play button, e.g. "00:40". */
  durationLabel: string;
  /** Optional poster image src for the thumbnail. */
  posterSrc?: string;
  /** Optional muted looping clip src (plays under the poster for liveliness). */
  videoSrc?: string;
  /** Author initial shown in the footer avatar. Defaults to "S". */
  authorInitial?: string;
  /** Author avatar fill tone. Defaults to "green". */
  authorTone?: RecordingAvatarTone;
  /** Optional class applied to the card root (positioning/width). */
  className?: string;
}

/**
 * Video/screen recording attachment card (Figma `955:3832`): a poster thumbnail
 * with a centred purple play button carrying the duration, above a footer row of
 * the author avatar, the (truncated) title and the CC / transcript / menu icons.
 *
 * @param props - The video attachment configuration.
 * @returns The video card, or `null` on failure.
 */
export function VideoAttachment({
  title,
  durationLabel,
  posterSrc,
  videoSrc,
  authorInitial = "S",
  authorTone = "green",
  className,
}: VideoAttachmentProps): ReactNode {
  try {
    const rootClassName = className
      ? `${styles.videoRoot} ${className}`
      : styles.videoRoot;
    const avatarToneClass = AVATAR_TONE_CLASS?.[authorTone] ?? styles.avatarGreen;

    return (
      <div className={rootClassName}>
        <div className={styles.videoThumb}>
          {videoSrc ? (
            <video
              className={styles.videoMedia}
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : posterSrc ? (
            <Image
              className={styles.videoMedia}
              src={posterSrc}
              alt=""
              fill
              sizes="360px"
            />
          ) : (
            <span className={styles.videoFallback} aria-hidden="true" />
          )}
          <span className={styles.videoScrim} aria-hidden="true" />
          <span className={styles.videoPlay}>
            <PlayGlyph size={17} className={styles.videoPlayIcon} />
            <span className={styles.videoPlayTime}>{durationLabel}</span>
          </span>
        </div>
        <div className={styles.videoFooter}>
          <span className={`${styles.footerAvatar} ${avatarToneClass}`} aria-hidden="true">
            {authorInitial}
          </span>
          <span className={styles.videoTitle}>{title}</span>
          <span className={styles.footerIcons}>
            <span className={styles.footerIcon}>
              <CaptionGlyph size={21} />
            </span>
            <span className={styles.footerIcon}>
              <DocumentGlyph size={19} />
            </span>
            <span className={styles.footerIcon}>
              <KebabGlyph size={20} />
            </span>
          </span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link RecordingPill}. */
export interface RecordingPillProps {
  /** Timer label shown beside the control, e.g. "00:16". */
  durationLabel: string;
  /** Played fraction of the waveform (0–1). */
  progress?: number;
  /** Optional class applied to the pill root. */
  className?: string;
}

/**
 * "Recording in progress" pill shown inside the review-toolbar composer (Figma
 * `955:2770`): a pause control, the running timer, the live waveform and a coral
 * trash button to discard the take.
 *
 * @param props - The recording pill configuration.
 * @returns The recording pill, or `null` on failure.
 */
export function RecordingPill({
  durationLabel,
  progress = 0.4,
  className,
}: RecordingPillProps): ReactNode {
  try {
    const rootClassName = className
      ? `${styles.recordPill} ${className}`
      : styles.recordPill;

    return (
      <div className={rootClassName}>
        <span className={styles.playControl}>
          <PauseGlyph size={18} />
        </span>
        <span className={styles.audioTimer}>{durationLabel}</span>
        <Waveform progress={progress} className={styles.recordWave} />
        <span className={styles.trashButton}>
          <TrashGlyph size={19} />
        </span>
      </div>
    );
  } catch {
    return null;
  }
}
