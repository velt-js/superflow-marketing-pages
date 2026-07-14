import type { ReactNode } from "react";
import styles from "./IntegrationsHubHeroArtifact.module.css";

/**
 * Hero artifact for the /preview/integrations hub.
 * Figma: node 958:3400 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * A static, chrome-less composition on the white hero card: a review comment
 * (left, inside a dashed "selected element" frame) travels — along dashed
 * connectors — into Slack (a channel event card) and onto a project board
 * (Monday: an "Open" status pill + an "Item Moved" event card). It tells the
 * page's core story: one review, mirrored into the tools a team already runs.
 *
 * Authored at a fixed desktop geometry inside {@link styles.stage}; the root is
 * a query container so the whole composition scales down proportionally on
 * narrow viewports without reflowing (mirrors IntegrationsArtifact).
 */

const COMMENT_AUTHOR = "Milton";
const COMMENT_TIME = "2w";
const COMMENT_EDITED = "(EDITED)";
const COMMENT_BODY = "Let\u2019s update this ";
const MENTION = "@Emma";
const OPEN_LABEL = "Open";

const SLACK_CHANNEL = "#acme-delivery";
const SLACK_EVENT_PREFIX = "Comment Added to ";
const SLACK_EVENT_CHANNEL = "#acme-deliery";

const BOARD_EVENT_LABEL = "Item Moved";
const BOARD_EVENT_BODY = "Let\u2019s update this ";

/** Size (px) accepted by every local inline glyph. */
type GlyphProps = {
  /** Rendered width/height in pixels. */
  size: number;
};

/**
 * The multi-color Slack mark, drawn with its own brand fills.
 *
 * @param props - The rendered square size in pixels.
 * @returns The inline Slack SVG, or `null` on failure.
 */
function SlackMark({ size }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 122.8 122.8"
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
 * The Monday.com mark — three diagonal red / yellow / green strokes.
 *
 * @param props - The rendered square size in pixels.
 * @returns The inline Monday SVG, or `null` on failure.
 */
function MondayMark({ size }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="259.188 11.938 39.188 39.188"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#F62B54"
          d="M263.942 43.2761C262.264 43.2761 260.587 42.345 259.656 40.8552C258.724 39.3654 258.91 37.5032 259.842 36.0134L268.6 22.2329C269.532 20.7431 271.209 19.812 272.887 19.812C274.564 19.812 276.241 20.9294 277.173 22.4191C277.918 23.9089 277.918 25.7711 276.986 27.2609L268.228 41.0414C267.296 42.345 265.619 43.2761 263.942 43.2761Z"
        />
        <path
          fill="#FFCC00"
          d="M279.039 43.2763C277.175 43.2763 275.684 42.3452 274.753 40.8554C274.007 39.1794 274.007 37.3172 274.939 35.8274L283.697 22.0469C284.629 20.5571 286.306 19.626 287.984 19.626C289.847 19.626 291.338 20.7433 292.27 22.2331C293.015 23.7229 293.015 25.5851 291.897 27.0749L283.138 40.8554C282.207 42.3452 280.716 43.2763 279.039 43.2763Z"
        />
        <path
          fill="#00CA72"
          d="M293.758 43.4624C296.228 43.4624 298.23 41.4614 298.23 38.993C298.23 36.5247 296.228 34.5237 293.758 34.5237C291.288 34.5237 289.285 36.5247 289.285 38.993C289.285 41.4614 291.288 43.4624 293.758 43.4624Z"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Hollow clock ring inside the comment's "Open" status chip. */
function ClockGlyph({ size }: GlyphProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Priority flag glyph inside the comment header. */
function FlagGlyph({ size }: GlyphProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 14V3" />
      <path d="M4 4h7l-1.2 2.2L11 8.4H4" />
    </svg>
  );
}

/** Downward chevron used inside the comment's status / priority chips. */
function ChevronGlyph({ size }: GlyphProps): ReactNode {
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
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Open-status ring shown before the board's orange "Open" pill label. */
function OpenRingGlyph({ size }: GlyphProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="9" cy="9" r="7" />
    </svg>
  );
}

/**
 * Render the integrations-hub hero artifact.
 *
 * @returns The comment → Slack → board composition, or `null` on failure.
 */
export default function IntegrationsHubHeroArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="integrations-hub">
        <div className={styles.stage}>
          {/* Faint page-content skeleton sitting behind the comment. */}
          <div className={styles.skeletonTop} aria-hidden="true">
            <span className={styles.skelBlg} />
            <span className={`${styles.skelLg} ${styles.skelLgShort}`} />
          </div>
          <div className={styles.skeletonBottom} aria-hidden="true">
            <span className={styles.skelSm} />
            <span className={`${styles.skelSm} ${styles.skelSmShort}`} />
            <span className={styles.skelSm} />
          </div>

          {/* Dashed "selected element" frame. */}
          <div className={styles.selection} aria-hidden="true" />

          {/* Dashed connectors: comment → Slack → board. */}
          <span className={`${styles.connector} ${styles.connectorOne}`} aria-hidden="true" />
          <span className={`${styles.connector} ${styles.connectorTwo}`} aria-hidden="true" />

          {/* Left: the review comment inside the selected frame. */}
          <div className={styles.commentGroup}>
            <span className={styles.commentPin} aria-hidden="true">
              <span className={styles.commentPinDot} />
            </span>
            <article className={styles.commentCard}>
              <div className={styles.commentBar}>
                <span className={styles.statusChip}>
                  <ClockGlyph size={14} />
                  {OPEN_LABEL}
                  <ChevronGlyph size={14} />
                </span>
                <span className={styles.priorityChip}>
                  <FlagGlyph size={14} />
                  <ChevronGlyph size={14} />
                </span>
                <span className={styles.commentCheck} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                </span>
              </div>
              <div className={styles.commentThread}>
                <span className={styles.commentAvatar} aria-hidden="true" />
                <span className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>{COMMENT_AUTHOR}</span>
                  <span className={styles.commentTime}>{COMMENT_TIME}</span>
                  <span className={styles.commentEdited}>{COMMENT_EDITED}</span>
                </span>
              </div>
              <p className={styles.commentBody}>
                {COMMENT_BODY}
                <span className={styles.mention}>{MENTION}</span>
              </p>
            </article>
          </div>

          {/* Slack app tile + its channel event card. */}
          <span className={`${styles.appTile} ${styles.appSlack}`} aria-hidden="true">
            <SlackMark size={44} />
            <span className={styles.appDot} />
          </span>
          <article className={styles.eventCard} data-event="slack">
            <span className={styles.eventHighlight} aria-hidden="true" />
            <span className={styles.eventLabel}>{SLACK_CHANNEL}</span>
            <p className={styles.eventBody}>
              {SLACK_EVENT_PREFIX}
              <span className={styles.eventAccentGreen}>{SLACK_EVENT_CHANNEL}</span>
            </p>
          </article>

          {/* Monday app tile, the "Open" status pill and its board event card. */}
          <span className={`${styles.appTile} ${styles.appMonday}`} aria-hidden="true">
            <MondayMark size={40} />
          </span>
          <span className={styles.boardPill}>
            <OpenRingGlyph size={16} />
            {OPEN_LABEL}
          </span>
          <article className={styles.eventCard} data-event="board">
            <span className={styles.eventLabel}>{BOARD_EVENT_LABEL}</span>
            <p className={styles.eventBody}>
              {BOARD_EVENT_BODY}
              <span className={styles.eventAccentInk}>{MENTION}</span>
            </p>
          </article>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
