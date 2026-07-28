import type { ReactNode } from "react";
import styles from "./RecordingsArtifacts.module.css";
import PinnedCommentScene from "./PinnedCommentScene";
import { RecordingPill, VideoAttachment } from "./RecordingMedia";
import ReviewToolbar from "./ReviewToolbar";
import { SuperflowFlowerMark } from "./WhiteLabelArtifact";
import { COMPOSER_TOOLS, SendArrowIcon } from "../hero-artifacts/CommentComposer";

/**
 * Recordings feature-page artifacts.
 *
 * The whole pitch of the Recordings page is that a recording is *just a comment*:
 * you record your screen, camera or voice from the review toolbar and the clip
 * lands as a pinned comment on the work. So most of these artifacts are thin
 * configurations over the shared {@link PinnedCommentScene} — the same reviewed
 * page + pinned dialog the Comments page uses — with the clip supplied through
 * the comment card's new `mediaAttachment` prop (an {@link AudioPlayer} or
 * {@link VideoAttachment} rendered inside the dialog). Two beats are bespoke:
 * the review-toolbar composer captured mid-recording ("no separate app") and the
 * client watching the clip from their phone ("the client watches").
 *
 * All motion is inherited from the shared pieces (the scene's entrance, the
 * waveform pulse), which already rest settled under `prefers-reduced-motion`.
 */

/** Reused assets: a page screenshot poster + the shared webcam clip/poster. */
const SCREEN_POSTER = "/images/home-2026/feature-set/workflow-dashboard.png";
const WEBCAM_POSTER = "/images/home-2026/record-walkthrough/webcam-poster.jpg";
const WEBCAM_VIDEO = "/videos/home-2026/record-walkthrough.mp4";

/** Recording filenames shown on the video cards. */
const SCREEN_CLIP_NAME = "Screen walkthrough.mp4";
const CAMERA_CLIP_NAME = "Shrey's Recording.mp4";

/** Client-link domain shown in the phone chrome. */
const CLIENT_DOMAIN = "acme-client.com";
const CLIENT_NO_ACCOUNT = "No account";
const CLIENT_CAPTION = "Playing from your link - no login, no app.";

/** Composer copy for the "record from the toolbar" beat. */
const COMPOSER_TYPED_TEXT = "Quick note on this section";
const COMPOSER_TIMER = "00:16";

/** Shared props for the recordings artifacts. */
export interface RecordingsArtifactProps {
  /**
   * When true, the artifact is being fitted into the hero product window: the
   * scene's panel-width browser chrome is suppressed (so `RecordingsHeroFit` can
   * paint a full-width chrome band) and the bespoke scenes centre themselves.
   * Feature-section usage omits this. Defaults to false.
   */
  hero?: boolean;
}

/**
 * "Screen recordings" — a screen recording lands as a pinned comment on the
 * reviewed page (a video card carrying the captured screen).
 *
 * @param props - Optional shared props (e.g. `hero`).
 * @returns The screen-recording scene, or `null` on failure.
 */
export function RecordingsScreenArtifact({
  hero = false,
}: RecordingsArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="recordings-screen"
        threadVariant="threaded"
        author="Milton"
        timeAgo="2w"
        edited={false}
        bodyText="Recorded a walkthrough:"
        mention=""
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          mediaAttachment: {
            kind: "video",
            title: SCREEN_CLIP_NAME,
            durationLabel: "01:24",
            posterSrc: SCREEN_POSTER,
            authorInitial: "M",
            authorTone: "gray",
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * "Camera video" — a camera recording (tone matters) lands as a pinned comment,
 * matching the Figma video card with a live webcam thumbnail.
 *
 * @param props - Optional shared props (e.g. `hero`).
 * @returns The camera-recording scene, or `null` on failure.
 */
export function RecordingsCameraArtifact({
  hero = false,
}: RecordingsArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="recordings-camera"
        threadVariant="threaded"
        author="Shrey"
        timeAgo="1w"
        edited={false}
        bodyText="Explaining this on camera:"
        mention=""
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          mediaAttachment: {
            kind: "video",
            title: CAMERA_CLIP_NAME,
            durationLabel: "00:40",
            posterSrc: WEBCAM_POSTER,
            videoSrc: WEBCAM_VIDEO,
            authorInitial: "S",
            authorTone: "green",
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * "Voice notes" — a spoken note lands as a pinned comment: the audio player pill
 * with the auto-caption box and the transcript ("show more").
 *
 * @param props - Optional shared props (e.g. `hero`).
 * @returns The voice-note scene, or `null` on failure.
 */
export function RecordingsVoiceArtifact({
  hero = false,
}: RecordingsArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="recordings-voice"
        threadVariant="threaded"
        author="Milton"
        timeAgo="2w"
        edited={false}
        bodyText="Left a voice note:"
        mention=""
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          mediaAttachment: {
            kind: "audio",
            durationLabel: COMPOSER_TIMER,
            caption: "The padding here feels tight on mobile",
            transcript:
              "Recorded a quick note on the spacing - if the header runs long on smaller screens we should tighten the",
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * "A pinned comment" — the recording behaves like any comment: pinned to the
 * element, with a status pill, a resolve check and a reply thread.
 *
 * @param props - Optional shared props (e.g. `hero`).
 * @returns The pinned-recording scene, or `null` on failure.
 */
export function RecordingsPinnedArtifact({
  hero = false,
}: RecordingsArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="recordings-pinned"
        author="Milton"
        timeAgo="2w"
        edited={false}
        bodyText="Recorded my feedback:"
        mention=""
        replyLabel="1 Reply"
        hero={hero}
        cardProps={{
          mediaAttachment: {
            kind: "video",
            title: SCREEN_CLIP_NAME,
            durationLabel: "00:52",
            posterSrc: SCREEN_POSTER,
            authorInitial: "M",
            authorTone: "gray",
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * "Recordings in threads" — a recording sits in a thread and gets replies: a
 * teammate answers with a voice note of their own.
 *
 * @param props - Optional shared props (e.g. `hero`).
 * @returns The threaded-recordings scene, or `null` on failure.
 */
export function RecordingsThreadArtifact({
  hero = false,
}: RecordingsArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="recordings-thread"
        threadVariant="threaded"
        author="Milton"
        timeAgo="2w"
        edited={false}
        bodyText="Recorded my take:"
        mention=""
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          mediaAttachment: {
            kind: "video",
            title: SCREEN_CLIP_NAME,
            durationLabel: "00:40",
            posterSrc: SCREEN_POSTER,
            authorInitial: "M",
            authorTone: "gray",
          },
          replies: [
            {
              author: "Emma",
              timeAgo: "now",
              avatarInitial: "E",
              avatarTone: "orange",
              bodyText: "On it - replied with a note:",
              mediaAttachment: {
                kind: "audio",
                durationLabel: "00:22",
                ccActive: false,
              },
            },
          ],
          composer: { placeholder: "Reply, or record a note…", tools: true },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Skeleton reviewed-page body shared by the bespoke composer scene — a grey
 * media block and a few copy lines the composer floats over.
 *
 * @returns The skeleton page body.
 */
function ReviewPageSkeleton(): ReactNode {
  try {
    return (
      <div className={styles.pageSkeleton} aria-hidden="true">
        <span className={styles.skelMedia} />
        <span className={styles.skelHeading} />
        <span className={`${styles.skelHeading} ${styles.skelHeadingShort}`} />
        <span className={styles.skelLine} />
        <span className={`${styles.skelLine} ${styles.skelLineShort}`} />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * "No separate app" — the recording is captured straight from the Superflow
 * review toolbar: the shared {@link ReviewToolbar} sits on the reviewed page and
 * the composer that opened from it shows a typed title, the recording-in-progress
 * pill (timer + live waveform + discard), the composer tool row and the send
 * button. No extension, no app switch. Matches Figma `955:2770`.
 *
 * @returns The composer scene, or `null` on failure.
 */
export function RecordingsComposerArtifact(): ReactNode {
  try {
    return (
      <div className={styles.composerRoot} data-artifact="recordings-composer">
        <ReviewPageSkeleton />
        <div className={styles.composerCard}>
          <div className={styles.composerTitle}>
            <span>{COMPOSER_TYPED_TEXT}</span>
            <span className={styles.composerCaret} aria-hidden="true" />
          </div>
          <RecordingPill durationLabel={COMPOSER_TIMER} progress={0.42} />
          <div className={styles.composerDivider} aria-hidden="true" />
          <div className={styles.composerBar}>
            <div className={styles.composerTools}>
              {COMPOSER_TOOLS.slice(1).map((ToolIcon, toolIndex) => (
                <span key={`tool-${toolIndex}`} className={styles.composerTool}>
                  <ToolIcon size={24} />
                </span>
              ))}
            </div>
            <span className={styles.composerSend}>
              <SendArrowIcon size={14} />
            </span>
          </div>
        </div>
        <ReviewToolbar
          className={styles.composerToolbar}
          brandMark={<SuperflowFlowerMark size={28} />}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * "Client playback from the link" / "The client watches" — the client opens the
 * review link on their phone and plays the recording: no account, no app. A
 * phone frame carrying the reviewed page, the video card and a "No account" pill.
 *
 * @param props - Optional shared props (e.g. `hero`, which centres the phone).
 * @returns The client-playback scene, or `null` on failure.
 */
export function RecordingsClientArtifact({
  hero = false,
}: RecordingsArtifactProps = {}): ReactNode {
  try {
    const rootClassName = hero
      ? `${styles.clientRoot} ${styles.clientHero}`
      : styles.clientRoot;

    return (
      <div className={rootClassName} data-artifact="recordings-client">
        <div className={styles.phone}>
          <span className={styles.phoneNotch} aria-hidden="true" />
          <div className={styles.phoneScreen}>
            <span className={styles.phoneStatus} aria-hidden="true" />
            <div className={styles.clientBar}>
              <span className={styles.clientDomain}>{CLIENT_DOMAIN}</span>
              <span className={styles.clientPill}>{CLIENT_NO_ACCOUNT}</span>
            </div>
            <div className={styles.clientPage}>
              <span className={styles.clientHeading} aria-hidden="true" />
              <span className={styles.clientLine} aria-hidden="true" />
              <VideoAttachment
                className={styles.clientVideo}
                title={CAMERA_CLIP_NAME}
                durationLabel="00:40"
                posterSrc={WEBCAM_POSTER}
                videoSrc={WEBCAM_VIDEO}
                authorInitial="S"
                authorTone="green"
              />
              <p className={styles.clientCaption}>{CLIENT_CAPTION}</p>
              <span className={styles.clientLine} aria-hidden="true" />
              <span
                className={`${styles.clientLine} ${styles.clientLineShort}`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
