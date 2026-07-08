import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./CommentThreadCard.module.css";

/**
 * Shared "posted comment" thread card for the feature-section artifacts.
 *
 * Reproduces the Superflow comment popover seen in the Pinned Comments / Auto
 * Screenshot views: an optional action header (a "status" pill, a flag pill and
 * a resolve check), an author row (photo or initial avatar + name / time /
 * "(EDITED)"), the comment body with an optional purple "@mention" chip, an
 * optional embedded page screenshot and an optional reply row.
 *
 * Every section is prop-driven so the same component renders both the plain
 * Pinned Comments card and the Auto Screenshot card (which only adds the
 * embedded screenshot). Positioning/sizing is left to the caller via
 * {@link CommentThreadCardProps.className}.
 */

const EDITED_LABEL = "(EDITED)";

/** Default height (px) of the embedded screenshot attachment block. */
const DEFAULT_SCREENSHOT_HEIGHT = 132;

/** Default avatar image size (px) rendered inside the header. */
const AVATAR_IMAGE_SIZE = 30;

/** Tabler `arrow-forward` reply glyph geometry (exact Figma vector). */
const REPLY_ICON_PATHS: readonly string[] = [
  "M38 173.835L41.3333 170.501L38 167.168",
  "M30.668 177.833V173.167C30.668 172.459 30.9489 171.781 31.449 171.281C31.9491 170.781 32.6274 170.5 33.3346 170.5H41.3346",
];

/** Available circular avatar fills, matching the hero comment-card tones. */
export type AvatarTone = "green" | "orange" | "gray";

/** Where a {@link CommentThreadCardProps.mention} sits around the body text. */
export type MentionPlacement = "start" | "end";

/** Colour tone of the header status pill. */
export type StatusTone = "open" | "progress";

/** Maps each avatar tone to its CSS-module fill class. */
const AVATAR_TONE_CLASS: Readonly<Record<AvatarTone, string>> = {
  green: styles.avatarGreen,
  orange: styles.avatarOrange,
  gray: styles.avatarGray,
};

/** Props for {@link CommentThreadCard}. */
export interface CommentThreadCardProps {
  /** Class applied to the card root, used to position/size it. */
  className?: string;
  /**
   * Optional avatar image source (e.g. a reviewer photo). When provided it
   * takes precedence over {@link avatarInitial}.
   */
  avatarSrc?: string;
  /** Character rendered inside the circular avatar when no image is supplied. */
  avatarInitial?: string;
  /** Avatar fill tone for the initial fallback. Defaults to "gray". */
  avatarTone?: AvatarTone;
  /** Comment author's name. */
  author: string;
  /** Relative timestamp shown after the author (e.g. "2w"). */
  timeAgo: string;
  /** When true, renders the muted "(EDITED)" tag. */
  edited?: boolean;
  /** The comment body text. */
  bodyText: string;
  /** Optional purple "@mention" chip rendered alongside the body. */
  mention?: string;
  /** Where the mention sits relative to the body text. Defaults to "end". */
  mentionPlacement?: MentionPlacement;
  /**
   * Optional status label (e.g. "Open"). When provided, the action header is
   * rendered: the status pill plus, by default, a flag pill and a resolve check.
   */
  status?: string;
  /** Colour tone of the status pill. Defaults to "open" (purple). */
  statusTone?: StatusTone;
  /** Whether the header's flag pill is shown. Defaults to true with a status. */
  showFlag?: boolean;
  /** Whether the header's resolve check is shown. Defaults to true with a status. */
  resolvable?: boolean;
  /**
   * When true, an embedded page-snapshot block is rendered inside the thread.
   * A plain neutral placeholder is shown unless {@link screenshotSrc} is given.
   */
  showScreenshot?: boolean;
  /** Optional screenshot image source rendered inside the snapshot block. */
  screenshotSrc?: string;
  /**
   * Height (px) of the embedded screenshot block. Defaults to
   * {@link DEFAULT_SCREENSHOT_HEIGHT}.
   */
  screenshotHeight?: number;
  /** Optional reply-row label (e.g. "1 Reply"). Omit to hide the reply row. */
  replyLabel?: string;
  /**
   * When true, the card drops its drop-shadow in favour of a subtle border
   * (used by the board-style Kanban cards). Defaults to false (shadow).
   */
  flat?: boolean;
}

/**
 * Empty status circle glyph shown inside the "Open" pill.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The circle `<svg>` element.
 */
function StatusCircleIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="8" cy="8" r="6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Small downward chevron used inside the header pills.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The chevron `<svg>` element.
 */
function ChevronDownIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 6L8 10L12 6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Pennant flag glyph shown inside the header's flag pill.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The flag `<svg>` element.
 */
function FlagIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
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
        <path d="M4 14V2.5" />
        <path d="M4 3H12L10.2 5.5L12 8H4" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Resolve checkmark shown at the far right of the header.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The check `<svg>` element.
 */
function CheckIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 10.5L8 14.5L16 5.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Reply arrow glyph used by the reply row.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The reply-arrow `<svg>` element.
 */
function ReplyIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="28 164 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {REPLY_ICON_PATHS.map((definition) => (
          <path key={definition} d={definition} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render a posted comment thread card: an optional action header (status pill,
 * flag pill, resolve check), an avatar/author row, the comment body with an
 * optional mention chip, an optional embedded screenshot and an optional reply
 * row.
 *
 * @param props - The comment content and optional positioning class.
 * @returns The comment card element.
 */
export default function CommentThreadCard({
  className,
  avatarSrc,
  avatarInitial,
  avatarTone = "gray",
  author,
  timeAgo,
  edited = false,
  bodyText,
  mention,
  mentionPlacement = "end",
  status,
  statusTone = "open",
  showFlag = true,
  resolvable = true,
  showScreenshot = false,
  screenshotSrc,
  screenshotHeight = DEFAULT_SCREENSHOT_HEIGHT,
  replyLabel,
  flat = false,
}: CommentThreadCardProps): ReactNode {
  try {
    const baseClassName = flat ? `${styles.card} ${styles.cardFlat}` : styles.card;
    const rootClassName = className ? `${baseClassName} ${className}` : baseClassName;
    const avatarToneClass = AVATAR_TONE_CLASS?.[avatarTone] ?? styles.avatarGray;
    const mentionNode = mention ? (
      <span className={styles.mention}>{mention}</span>
    ) : null;

    return (
      <article className={rootClassName}>
        {status ? (
          <div className={styles.actions}>
            <span
              className={
                statusTone === "progress"
                  ? `${styles.statusPill} ${styles.statusProgress}`
                  : styles.statusPill
              }
            >
              <StatusCircleIcon size={14} />
              <span className={styles.statusText}>{status}</span>
              <ChevronDownIcon size={14} />
            </span>
            {showFlag ? (
              <span className={styles.flagPill}>
                <FlagIcon size={14} />
                <ChevronDownIcon size={14} />
              </span>
            ) : null}
            {resolvable ? (
              <span className={styles.resolve}>
                <CheckIcon size={18} />
              </span>
            ) : null}
          </div>
        ) : null}

        <div className={styles.head}>
          {avatarSrc ? (
            <Image
              className={styles.avatarImage}
              src={avatarSrc}
              alt=""
              width={AVATAR_IMAGE_SIZE}
              height={AVATAR_IMAGE_SIZE}
            />
          ) : (
            <span className={`${styles.avatar} ${avatarToneClass}`} aria-hidden="true">
              {avatarInitial}
            </span>
          )}
          <span className={styles.meta}>
            <span className={styles.author}>{author}</span>
            <span className={styles.time}>{timeAgo}</span>
            {edited ? <span className={styles.edited}>{EDITED_LABEL}</span> : null}
          </span>
        </div>

        <p className={styles.body}>
          {mention && mentionPlacement === "start" ? mentionNode : null}
          <span className={styles.bodyText}>{bodyText}</span>
          {mention && mentionPlacement === "end" ? mentionNode : null}
        </p>

        {showScreenshot ? (
          <div
            className={styles.attachment}
            style={{ height: screenshotHeight }}
            aria-hidden="true"
          >
            {screenshotSrc ? (
              <Image
                className={styles.attachmentImage}
                src={screenshotSrc}
                alt=""
                fill
                sizes="360px"
              />
            ) : null}
          </div>
        ) : null}

        {replyLabel ? (
          <div className={styles.reply}>
            <ReplyIcon size={16} />
            <span className={styles.replyText}>{replyLabel}</span>
          </div>
        ) : null}
      </article>
    );
  } catch {
    return null;
  }
}
