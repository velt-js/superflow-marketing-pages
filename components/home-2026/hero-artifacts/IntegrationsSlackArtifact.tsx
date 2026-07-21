import type { ReactNode } from "react";
import styles from "./IntegrationsSlackArtifact.module.css";
import HeroCommentComposer from "./CommentComposer";

/**
 * Slack integration-page hero artifact — the "comment comes to you" demo from
 * superflow-page-integration-slack-v1-1.md: a client comment written in the
 * Superflow composer (left) travels a curved connector into a Slack channel
 * window (right), landing as a message card with the asset thumbnail, actor,
 * deep link to the exact spot, and the Resolve / Reply / Approve action row.
 *
 * Mirrors the composer + connector composition of {@link IntegrationsArtifact}
 * (same 1200×578 stage, container-query scaling, gradient connector + sync
 * pulse) so the two integration heroes read as siblings, but swaps the Kanban
 * board for the Slack message card. Registered as `integrations-slack` in
 * `STATIC_HERO_ARTIFACTS` (Hero.tsx) and rendered on the flat hero card.
 *
 * All motion is CSS/SMIL-only and rests settled under
 * `prefers-reduced-motion: reduce`.
 */

/** The client's comment — typed in the composer, landing in the channel. */
const COMMENT_TEXT = "Client here! Can we change this image";
const CHANNEL_NAME = "#northbeam-reviews";
const ACTOR_NAME = "Guest";
const ACTOR_INITIAL = "G";
const MESSAGE_TIME = "now";
const DEEP_LINK_LABEL = "Open the exact spot";
const ACTION_LABELS: readonly string[] = ["Resolve", "Reply", "Approve"];

/* Curved connector geometry (identical to IntegrationsArtifact so the pulse
   choreography matches): composer (bottom-left) → Slack window (top-right). */
const CONNECTOR_PATH = "M0 180 H44 Q68 180 68 156 V28 Q68 4 92 4 H162";

/** Size (px) accepted by the local inline glyphs. */
interface GlyphProps {
  /** Rendered width/height in pixels. */
  size?: number;
}

/**
 * The multi-color Slack pinwheel mark (channel header), identical geometry to
 * `SlackMark` in `components/integration-2026/IntegrationBrandMarks.tsx`.
 *
 * @param props - Rendered size in pixels.
 * @returns The inline Slack SVG, or `null` on failure.
 */
function SlackLogo({ size = 22 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 122.8 122.8"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
          fill="#e01e5a"
        />
        <path
          d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
          fill="#36c5f0"
        />
        <path
          d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
          fill="#2eb67d"
        />
        <path
          d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
          fill="#ecb22e"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Mountain-and-sun photo glyph drawn inside the asset thumbnail placeholder.
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function PhotoGlyph({ size = 28 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 8h.01" />
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 16l5-5c.9-.87 2.1-.87 3 0l5 5" />
        <path d="M14 14l1-1c.9-.87 2.1-.87 3 0l3 3" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * External-link arrow glyph beside the deep-link text.
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ExternalLinkGlyph({ size = 14 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
        <path d="M11 13l9 -9" />
        <path d="M15 4h5v5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the Slack integration hero artifact: composer → connector → Slack
 * channel window with the landed message card and its action row.
 *
 * @returns The composition, or `null` on failure.
 */
export default function IntegrationsSlackArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="integrations-slack">
        {/* Fixed-ratio stage holding the desktop-native absolute composition;
            it scales down proportionally (container queries in the CSS) so the
            composer + Slack window stay visible and centred at any width. */}
        <div className={styles.stage}>
          {/* Curved connector from the composer up into the Slack window; the
              stroke fades from solid (composer end) to transparent. */}
          <svg
            className={styles.connector}
            viewBox="0 0 162 190"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="integrations-slack-connector"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="180"
                x2="162"
                y2="4"
              >
                <stop offset="0" stopColor="#625df5" stopOpacity="0.7" />
                <stop offset="0.45" stopColor="#625df5" stopOpacity="0.5" />
                <stop offset="1" stopColor="#625df5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className={styles.connectorPath}
              stroke="url(#integrations-slack-connector)"
              d={CONNECTOR_PATH}
            />
            {/* Forward "sync" pulse: the comment travels composer → channel;
                its arrival cues the message card's entrance. */}
            <circle className={styles.syncPulse} r="4" fill="#625df5" opacity="0">
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.12;0.85;1"
                dur="0.6s"
                begin="0.9s"
                repeatCount="1"
              />
              <animateMotion
                dur="0.6s"
                begin="0.9s"
                repeatCount="1"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
                path={CONNECTOR_PATH}
              />
            </circle>
          </svg>

          {/* Slack channel window (bleeds off the right edge). */}
          <div className={styles.slackWindow}>
            <div className={styles.channelBar}>
              <span className={styles.channelMark}>
                <SlackLogo size={22} />
              </span>
              <span className={styles.channelName}>{CHANNEL_NAME}</span>
            </div>

            {/* The landed message: actor, comment, thumbnail + deep link,
                action row — the build file's Slack message card. */}
            <article className={styles.message}>
              <span className={styles.messageAvatar} aria-hidden="true">
                {ACTOR_INITIAL}
              </span>
              <div className={styles.messageBody}>
                <div className={styles.messageMeta}>
                  <span className={styles.messageAuthor}>{ACTOR_NAME}</span>
                  <span className={styles.messageTime}>{MESSAGE_TIME}</span>
                </div>
                <p className={styles.messageText}>{COMMENT_TEXT}</p>
                <div className={styles.attachment}>
                  <span className={styles.thumb} aria-hidden="true">
                    <PhotoGlyph size={30} />
                  </span>
                  <span className={styles.deepLink}>
                    {DEEP_LINK_LABEL}
                    <ExternalLinkGlyph size={14} />
                  </span>
                </div>
                <div className={styles.actionRow}>
                  {ACTION_LABELS.map((label, actionIndex) => (
                    <span
                      key={label}
                      className={
                        actionIndex === ACTION_LABELS.length - 1
                          ? `${styles.actionButton} ${styles.actionPrimary}`
                          : styles.actionButton
                      }
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </div>

          {/* Comment composer popover on the left (shared component) — the
              client writing the comment that lands in the channel. */}
          <HeroCommentComposer
            className={styles.composer}
            commentText={COMMENT_TEXT}
            accent
          />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
