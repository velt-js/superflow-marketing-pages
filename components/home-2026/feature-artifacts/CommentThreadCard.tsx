import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./CommentThreadCard.module.css";
import FakeCursor from "./FakeCursor";
import {
  AudioPlayer,
  VideoAttachment,
  type AudioPlayerProps,
  type VideoAttachmentProps,
} from "./RecordingMedia";

/**
 * Shared "posted comment" thread card for the feature-section artifacts.
 *
 * Reproduces the Superflow comment popover seen in the Pinned Comments / Auto
 * Screenshot views: an optional action header (a "status" pill, a flag pill and
 * a resolve check), an author row (photo or initial avatar + name / time /
 * "(EDITED)"), the comment body with an optional purple "@mention" chip,
 * optional attachments, reactions, read receipts, threaded replies, a composer
 * and an optional reply row.
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

/** Default text inside the inline reply composer. */
const DEFAULT_COMPOSER_PLACEHOLDER = "Reply...";

/** Label used by the add-reaction affordance. */
const ADD_REACTION_LABEL = "Add reaction";

/** Tabler `arrow-forward` reply glyph geometry (exact Figma vector). */
const REPLY_ICON_PATHS: readonly string[] = [
  "M38 173.835L41.3333 170.501L38 167.168",
  "M30.668 177.833V173.167C30.668 172.459 30.9489 171.781 31.449 171.281C31.9491 170.781 32.6274 170.5 33.3346 170.5H41.3346",
];

/**
 * Tabler `file-type-pdf` glyph (exact Figma vector `858:1310`, 32.2 viewBox):
 * a document with a folded corner and the "PDF" lettering. Coloured by CSS.
 */
const PDF_ICON_PATH =
  "M18.4723 5.83631V10.398C18.4723 10.7004 18.5925 10.9905 18.8064 11.2044C19.0202 11.4182 19.3103 11.5384 19.6128 11.5384H24.1744M24.1744 16.1001V11.5384L18.4723 5.83631H10.4894C9.88451 5.83631 9.30437 6.07661 8.87663 6.50435C8.44889 6.93209 8.20859 7.51223 8.20859 8.11714V16.1001M8.20859 22.9426H9.91922C10.3729 22.9426 10.808 22.7623 11.1288 22.4415C11.4496 22.1207 11.6298 21.6856 11.6298 21.2319C11.6298 20.7782 11.4496 20.3431 11.1288 20.0223C10.808 19.7015 10.3729 19.5213 9.91922 19.5213H8.20859V26.3638M21.8936 22.9426H24.1744M25.3148 19.5213H21.8936V26.3638M15.0511 19.5213V26.3638H16.1915C16.7964 26.3638 17.3766 26.1235 17.8043 25.6958C18.232 25.268 18.4723 24.6879 18.4723 24.083V21.8021C18.4723 21.1972 18.232 20.6171 17.8043 20.1893C17.3766 19.7616 16.7964 19.5213 16.1915 19.5213H15.0511Z";

/** Tabler `x` remove glyph (exact Figma vector `858:1317`, 20.7 viewBox). */
const REMOVE_ICON_PATH =
  "M15.5234 5.17498L5.17344 15.525M5.17344 5.17498L15.5234 15.525";

/**
 * Composer toolbar glyphs (exact Figma vectors from `859:1569`, all 24 viewBox):
 * text-format, mention (@), attachment (paperclip), microphone, video, and
 * screen-share. Rendered muted grey by CSS.
 */
const COMPOSER_TOOL_ICON_PATHS: Readonly<Record<string, readonly string[]>> = {
  text: ["M9 15V8C9 7.20435 9.31607 6.44129 9.87868 5.87868C10.4413 5.31607 11.2044 5 12 5C12.7956 5 13.5587 5.31607 14.1213 5.87868C14.6839 6.44129 15 7.20435 15 8V15M9 11H15M5 19H19"],
  at: ["M15.3333 12.0096C15.3333 12.8937 14.9821 13.7415 14.357 14.3667C13.7319 14.9918 12.8841 15.343 12 15.343C11.1159 15.343 10.2681 14.9918 9.64298 14.3667C9.01785 13.7415 8.66667 12.8937 8.66667 12.0096C8.66667 11.1256 9.01785 10.2777 9.64298 9.65261C10.2681 9.02749 11.1159 8.6763 12 8.6763C12.8841 8.6763 13.7319 9.02749 14.357 9.65261C14.9821 10.2777 15.3333 11.1256 15.3333 12.0096ZM15.3333 12.0096L15.3333 13.2596C15.3333 13.8122 15.5528 14.3421 15.9435 14.7328C16.3342 15.1235 16.8641 15.343 17.4167 15.343C17.9692 15.343 18.4991 15.1235 18.8898 14.7328C19.2805 14.3421 19.5 13.8122 19.5 13.2596V12.0096C19.5021 10.3981 18.985 8.82867 18.0253 7.53396C17.0657 6.23926 15.7145 5.2881 14.172 4.82139C12.6295 4.35468 10.9776 4.39724 9.46119 4.94277C7.94475 5.48831 6.64437 6.50779 5.75267 7.8502C4.86097 9.19261 4.42539 10.7865 4.51046 12.3959C4.59553 14.0052 5.19671 15.5443 6.22496 16.7853C7.25321 18.0262 8.65382 18.9029 10.2193 19.2855C11.7848 19.6682 13.4319 19.5364 14.9167 18.9096"],
  paperclip: ["M14.3259 8.27012L9.45953 13.1365C9.16169 13.4344 8.99436 13.8383 8.99436 14.2595C8.99436 14.6807 9.16169 15.0847 9.45953 15.3826C9.75737 15.6804 10.1613 15.8477 10.5825 15.8477C11.0038 15.8477 11.4077 15.6804 11.7056 15.3826L16.572 10.5161C17.1676 9.92046 17.5023 9.11254 17.5023 8.27012C17.5023 7.42769 17.1676 6.61977 16.572 6.02409C15.9763 5.4284 15.1684 5.09375 14.3259 5.09375C13.4835 5.09375 12.6756 5.4284 12.0799 6.02409L7.2135 10.8905C6.31997 11.784 5.81799 12.9959 5.81799 14.2595C5.81799 15.5232 6.31997 16.7351 7.2135 17.6286C8.10702 18.5221 9.31891 19.0241 10.5825 19.0241C11.8462 19.0241 13.0581 18.5221 13.9516 17.6286L18.818 12.7622"],
  microphone: ["M17 10.4291C17 11.7552 16.4732 13.027 15.5355 13.9647C14.5979 14.9023 13.3261 15.4291 12 15.4291C10.6739 15.4291 9.40215 14.9023 8.46447 13.9647C7.52678 13.027 7 11.7552 7 10.4291M12 15.4291V18.2863M9.14286 18.2863H14.8571M9.85714 6.8577C9.85714 6.28938 10.0829 5.74434 10.4848 5.34247C10.8866 4.94061 11.4317 4.71484 12 4.71484C12.5683 4.71484 13.1134 4.94061 13.5152 5.34247C13.9171 5.74434 14.1429 6.28938 14.1429 6.8577V10.4291C14.1429 10.9975 13.9171 11.5425 13.5152 11.9444C13.1134 12.3462 12.5683 12.572 12 12.572C11.4317 12.572 10.8866 12.3462 10.4848 11.9444C10.0829 11.5425 9.85714 10.9975 9.85714 10.4291V6.8577Z"],
  video: [
    "M14.6667 10.2241L18.7138 8.20095C18.8493 8.13325 18.9998 8.10129 19.1511 8.10811C19.3024 8.11492 19.4495 8.16028 19.5783 8.23989C19.7072 8.3195 19.8135 8.43071 19.8873 8.56297C19.9611 8.69523 19.9999 8.84416 20 8.99562V15.0081C19.9999 15.1595 19.9611 15.3084 19.8873 15.4407C19.8135 15.573 19.7072 15.6842 19.5783 15.7638C19.4495 15.8434 19.3024 15.8888 19.1511 15.8956C18.9998 15.9024 18.8493 15.8704 18.7138 15.8027L14.6667 13.7796V10.2241Z",
    "M4 8.44575C4 7.97425 4.1873 7.52207 4.5207 7.18867C4.8541 6.85527 5.30628 6.66797 5.77778 6.66797H12.8889C13.3604 6.66797 13.8126 6.85527 14.146 7.18867C14.4794 7.52207 14.6667 7.97425 14.6667 8.44575V15.5569C14.6667 16.0284 14.4794 16.4805 14.146 16.8139C13.8126 17.1473 13.3604 17.3346 12.8889 17.3346H5.77778C5.30628 17.3346 4.8541 17.1473 4.5207 16.8139C4.1873 16.4805 4 16.0284 4 15.5569V8.44575Z",
  ],
  screenShare: ["M18.5 12.0017V14.1684C18.5 14.3599 18.4239 14.5436 18.2885 14.6791C18.153 14.8145 17.9693 14.8906 17.7778 14.8906H6.22222C6.03068 14.8906 5.84698 14.8145 5.71153 14.6791C5.57609 14.5436 5.5 14.3599 5.5 14.1684V6.94617C5.5 6.75463 5.57609 6.57093 5.71153 6.43549C5.84698 6.30004 6.03068 6.22395 6.22222 6.22395H12.7222M8.38889 17.7795H15.6111M9.83333 14.8906V17.7795M14.1667 14.8906V17.7795M18 9.00172C16.8648 9.00172 15.9445 8.08142 15.9445 6.94617C15.9445 5.81093 16.8648 4.89062 18 4.89062C19.1352 4.89062 20.0555 5.81093 20.0555 6.94617C20.0555 8.08142 19.1352 9.00172 18 9.00172Z"],
};

/** Ordered composer toolbar keys, matching the Figma left-group order. */
const COMPOSER_TOOL_ORDER: readonly (keyof typeof COMPOSER_TOOL_ICON_PATHS)[] = [
  "text",
  "at",
  "paperclip",
  "microphone",
  "video",
  "screenShare",
];

/** Available circular avatar fills, matching the hero comment-card tones. */
export type AvatarTone = "green" | "orange" | "gray";

/** Where a {@link CommentThreadCardProps.mention} sits around the body text. */
export type MentionPlacement = "start" | "end";

/** Colour tone of the header status pill. */
export type StatusTone = "open" | "progress";

/** Label shown by the resolved header pill after the status choreography. */
const RESOLVED_STATUS_LABEL = "Resolved";

/** One row in the status dropdown under the "Open" pill. */
export interface StatusMenuOption {
  /** Row label (e.g. "Open", "In Progress", "Resolved"). */
  label: string;
  /** Row tone: purple (open), amber (progress) or green (done). */
  tone: StatusTone | "done";
  /**
   * When true (used by the "status" choreography), the row is highlighted as the
   * pointer lands on it just before the dropdown closes.
   */
  target?: boolean;
}

/**
 * A CSS-only choreography the card can play (replays whenever the tab remounts):
 * - "mentions": the composer types an "@" trigger, then the mention dropdown opens.
 * - "thread-reply": the composer types a reply, then the reply posts into the thread.
 * - "reactions": a pointer reacts with 👍, then opens the read-receipt panel.
 * - "attachment": a PDF file glyph drops in, then the styled file chip reveals.
 * - "status": a pointer opens the status dropdown, picks "Resolved", and the
 *   header pill swaps from "Open" (purple) to "Resolved" (green).
 */
export type CommentAnimation =
  | "mentions"
  | "thread-reply"
  | "reactions"
  | "attachment"
  | "status";

/** A nested reply rendered below the main comment. */
export interface CommentThreadReply {
  /** Optional avatar image source. */
  avatarSrc?: string;
  /** Fallback character rendered when no image source is supplied. */
  avatarInitial?: string;
  /** Fallback avatar fill tone. Defaults to "gray". */
  avatarTone?: AvatarTone;
  /** Reply author's name. */
  author: string;
  /** Relative timestamp shown after the author. */
  timeAgo: string;
  /** When true, renders the muted "(EDITED)" tag. */
  edited?: boolean;
  /** Reply body text. */
  bodyText: string;
  /** Optional purple mention chip. */
  mention?: string;
  /** Mention placement around the body text. Defaults to "end". */
  mentionPlacement?: MentionPlacement;
  /** Optional recording (voice note / video) rendered inside this reply. */
  mediaAttachment?: CommentMediaAttachment;
}

/** File attachment rendered inside the comment dialog. */
export interface CommentAttachment {
  /** Display file name, usually truncated by CSS. */
  fileName: string;
  /** File-size label, e.g. "12MB". */
  sizeLabel: string;
  /** Whether a remove X affordance is shown. Defaults to true. */
  removable?: boolean;
}

/**
 * A recording rendered inside the comment dialog via the shared
 * {@link AudioPlayer} / {@link VideoAttachment} primitives. This is what makes a
 * recording "just a comment": the clip lives in the thread like any other body.
 * The `kind` discriminant picks which primitive renders; the remaining fields
 * are forwarded straight through to it.
 */
export type CommentMediaAttachment =
  | ({ kind: "audio" } & AudioPlayerProps)
  | ({ kind: "video" } & VideoAttachmentProps);

/** One emoji reaction chip. */
export interface CommentReaction {
  /** Emoji glyph shown in the chip. */
  emoji: string;
  /** Numeric count shown after the emoji. */
  count: number;
  /** Active chips use the purple outline treatment. */
  active?: boolean;
}

/** One mention suggestion shown under an active composer. */
export interface MentionSuggestion {
  /** Person name. */
  name: string;
  /** Secondary email/subtitle text. */
  email: string;
  /** Optional image avatar. */
  avatarSrc?: string;
  /** Initial fallback. */
  avatarInitial?: string;
  /** Fallback avatar tone. Defaults to "gray". */
  avatarTone?: AvatarTone;
  /** Selected row uses a light neutral background. */
  active?: boolean;
}

/** Inline composer shown at the bottom of a comment dialog. */
export interface CommentComposerDraft {
  /** Typed text shown before the caret. */
  text?: string;
  /** Placeholder shown when no typed text is supplied. */
  placeholder?: string;
  /** When true, uses the solid purple focused border. */
  active?: boolean;
  /** Optional mention suggestions popover. */
  mentionSuggestions?: readonly MentionSuggestion[];
  /** When true, renders the toolbar row from the richer composer design. */
  tools?: boolean;
  /**
   * When true, the {@link text} is revealed with a left-to-right typing wipe and
   * a blinking caret (driven by the card's {@link CommentThreadCardProps.animation}
   * scope). A placeholder layer is kept ready so a "submit" step can clear it.
   */
  typing?: boolean;
}

/** One person in the read-receipt popover. */
export interface ReadReceiptPerson {
  /** Person name. */
  name: string;
  /** Relative read time. */
  timeAgo: string;
  /** Optional image avatar. */
  avatarSrc?: string;
  /** Initial fallback. */
  avatarInitial?: string;
  /** Fallback avatar tone. Defaults to "gray". */
  avatarTone?: AvatarTone;
}

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
   * Optional arbitrary content rendered inside the embedded snapshot block
   * instead of an image (e.g. a CSS wireframe "captured page"). Takes
   * precedence over {@link screenshotSrc} when both are supplied. Lets the
   * Screenshots artifacts embed a live page mock rather than a raster image.
   */
  screenshotNode?: ReactNode;
  /**
   * Height (px) of the embedded screenshot block. Defaults to
   * {@link DEFAULT_SCREENSHOT_HEIGHT}.
   */
  screenshotHeight?: number;
  /** Optional reply-row label (e.g. "1 Reply"). Omit to hide the reply row. */
  replyLabel?: string;
  /** Nested thread replies rendered below the main comment. */
  replies?: readonly CommentThreadReply[];
  /** Optional file attachment row. */
  attachment?: CommentAttachment;
  /**
   * Optional recording (voice note / video) rendered inside the comment body,
   * between the body text and any file attachment. This is how a screen, camera
   * or voice recording lands as "just a comment" on the Recordings feature page.
   */
  mediaAttachment?: CommentMediaAttachment;
  /** Optional reaction chips rendered below the comment body. */
  reactions?: readonly CommentReaction[];
  /** Whether the add-reaction button is shown beside reaction chips. */
  showAddReaction?: boolean;
  /** Optional inline composer rendered inside the dialog. */
  composer?: CommentComposerDraft;
  /** Status dropdown options rendered under the status pill. */
  statusOptions?: readonly StatusMenuOption[];
  /** Whether a compact read badge is shown after the timestamp. */
  showReadReceiptBadge?: boolean;
  /** People shown in the read-receipt popover. */
  readReceipts?: readonly ReadReceiptPerson[];
  /** Whether the read-receipt popover is visible. */
  showReadReceiptPanel?: boolean;
  /**
   * When true, the card drops its drop-shadow in favour of a subtle border
   * (used by the board-style Kanban cards). Defaults to false (shadow).
   */
  flat?: boolean;
  /**
   * Optional CSS-only choreography played on mount (and replayed whenever the
   * feature tab remounts). Static consumers omit this and render unchanged; the
   * comments feature artifacts opt in per {@link CommentAnimation}.
   */
  animation?: CommentAnimation;
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
 * Clock glyph shown beside the "In Progress" status-menu option.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The clock `<svg>` element.
 */
function ClockIcon({ size }: { size: number }): ReactNode {
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
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5V8L10 9.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Check-in-circle glyph shown beside the "Completed" status-menu option.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The check-circle `<svg>` element.
 */
function CheckCircleIcon({ size }: { size: number }): ReactNode {
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
        <circle cx="8" cy="8" r="6" />
        <path d="M5.5 8L7.25 9.75L10.5 6.25" />
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
 * Double-check glyph used by the read-receipt badge.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The double-check `<svg>` element.
 */
function ReadReceiptIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M2.5 9.5L5.5 12.5L10.5 6.5" />
        <path d="M8 12.5L15.5 5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Smile glyph used by the add-reaction affordance.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The smile `<svg>` element.
 */
function SmileIcon({ size }: { size: number }): ReactNode {
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
        <circle cx="12" cy="12" r="9" />
        <path d="M9 10H9.01" />
        <path d="M15 10H15.01" />
        <path d="M9.5 15C10.2 15.7 11.05 16 12 16C12.95 16 13.8 15.7 14.5 15" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Send glyph used by inline composers.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The send `<svg>` element.
 */
function SendIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M13.8 6.8L3 2.1C2.55 1.91 2.05 2.01 1.7 2.36C1.35 2.72 1.24 3.24 1.43 3.7L2.75 7H7.7C8.08 7 8.38 7.3 8.38 7.68C8.38 8.06 8.08 8.36 7.7 8.36H2.75L1.43 11.65C1.24 12.11 1.35 12.63 1.7 12.99C2.05 13.34 2.55 13.44 3 13.25L13.8 8.55C14.15 8.4 14.38 8.06 14.38 7.68C14.38 7.3 14.15 6.96 13.8 6.8Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Tabler `file-type-pdf` glyph shown inside the styled attachment chip.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The PDF file `<svg>` element (coloured by CSS `currentColor`).
 */
function FileTypePdfIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 32.2 32.2"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.725}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d={PDF_ICON_PATH} />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Tabler `x` glyph used by the attachment chip's remove affordance.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The remove `<svg>` element (coloured by CSS `currentColor`).
 */
function RemoveIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20.7 20.7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.725}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d={REMOVE_ICON_PATH} />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Shared muted-grey composer toolbar glyph (Tabler icons from Figma `859:1569`).
 *
 * @param root0 - The glyph props.
 * @param root0.paths - One or more SVG path definitions (24 viewBox).
 * @param root0.size - Rendered width/height in pixels.
 * @returns The toolbar `<svg>` element (coloured by CSS `currentColor`).
 */
function ComposerToolIcon({
  paths,
  size,
}: {
  paths: readonly string[];
  size: number;
}): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {paths?.map((definition) => (
          <path key={definition} d={definition} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Shared person avatar for replies, mention suggestions and read receipts.
 *
 * @param props - Avatar image/initial content plus sizing classes.
 * @returns The avatar node.
 */
function PersonAvatar({
  avatarSrc,
  avatarInitial,
  avatarTone = "gray",
  className,
  imageClassName,
  size,
}: {
  avatarSrc?: string;
  avatarInitial?: string;
  avatarTone?: AvatarTone;
  className: string;
  imageClassName: string;
  size: number;
}): ReactNode {
  try {
    const avatarToneClass = AVATAR_TONE_CLASS?.[avatarTone] ?? styles.avatarGray;

    if (avatarSrc) {
      return (
        <Image
          className={imageClassName}
          src={avatarSrc}
          alt=""
          width={size}
          height={size}
        />
      );
    }

    return (
      <span className={`${className} ${avatarToneClass}`} aria-hidden="true">
        {avatarInitial}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * Render one comment/reply body row.
 *
 * @param props - Text and optional mention placement.
 * @returns The body paragraph.
 */
function CommentBody({
  bodyText,
  mention,
  mentionPlacement = "end",
  className,
}: {
  bodyText: string;
  mention?: string;
  mentionPlacement?: MentionPlacement;
  className: string;
}): ReactNode {
  try {
    const mentionNode = mention ? <span className={styles.mention}>{mention}</span> : null;

    return (
      <p className={className}>
        {mention && mentionPlacement === "start" ? mentionNode : null}
        <span className={styles.bodyText}>{bodyText}</span>
        {mention && mentionPlacement === "end" ? mentionNode : null}
      </p>
    );
  } catch {
    return null;
  }
}

/**
 * Render the styled PDF file chip (Figma `858:1307`): a purple Tabler
 * `file-type-pdf` glyph, the truncated filename, a muted size subline and a red
 * remove "x". When {@link animate} is set, the card's "attachment" choreography
 * plays first: a {@link FakeCursor} carries a small framed PDF card in and drops
 * it, then the styled chip reveals in place as the dropped card fades out.
 *
 * @param root0 - Attachment props.
 * @param root0.attachment - File metadata.
 * @param root0.animate - Whether to render the cursor + drop-in card layers.
 * @returns The attachment row.
 */
function AttachmentRow({
  attachment,
  animate = false,
}: {
  attachment: CommentAttachment;
  animate?: boolean;
}): ReactNode {
  try {
    const removable = attachment?.removable ?? true;

    return (
      <div className={styles.fileAttachWrap}>
        {animate ? (
          <span className={styles.fileDrop} aria-hidden="true">
            <FileTypePdfIcon size={30} />
          </span>
        ) : null}
        <div className={styles.fileAttachment}>
          <span className={styles.fileLead}>
            <span className={styles.filePdfIcon} aria-hidden="true">
              <FileTypePdfIcon size={34} />
            </span>
            <span className={styles.fileMeta}>
              <span className={styles.fileName}>{attachment?.fileName}</span>
              <span className={styles.fileSize}>{attachment?.sizeLabel}</span>
            </span>
          </span>
          {removable ? (
            <span className={styles.fileRemove} aria-label="Remove attachment">
              <RemoveIcon size={18} />
            </span>
          ) : null}
        </div>
        {animate ? <FakeCursor className={styles.dropCursor} size={22} /> : null}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render a recording (voice note / video) inside the comment body using the
 * shared {@link AudioPlayer} / {@link VideoAttachment} primitives, indented to
 * align under the author name like the file chip and screenshot.
 *
 * @param root0 - Media props.
 * @param root0.media - The recording to render.
 * @returns The media block, or `null` on failure.
 */
function MediaBlock({ media }: { media: CommentMediaAttachment }): ReactNode {
  try {
    return (
      <div className={styles.media}>
        {media?.kind === "audio" ? (
          <AudioPlayer {...media} />
        ) : (
          <VideoAttachment {...media} />
        )}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render reaction chips and an optional add-reaction button.
 *
 * @param root0 - Reaction props.
 * @param root0.reactions - Reaction chip data.
 * @param root0.showAddReaction - Whether to show the add button.
 * @returns The reaction row.
 */
function ReactionRow({
  reactions,
  showAddReaction,
}: {
  reactions?: readonly CommentReaction[];
  showAddReaction?: boolean;
}): ReactNode {
  try {
    if (!reactions?.length && !showAddReaction) {
      return null;
    }

    return (
      <div className={styles.reactions}>
        {reactions?.map((reaction) => (
          <span
            key={`${reaction?.emoji}-${reaction?.count}`}
            className={
              reaction?.active
                ? `${styles.reactionChip} ${styles.reactionChipActive}`
                : styles.reactionChip
            }
          >
            {reaction?.emoji} {reaction?.count}
          </span>
        ))}
        {showAddReaction ? (
          <span className={styles.addReaction} title={ADD_REACTION_LABEL}>
            <SmileIcon size={16} />
          </span>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render a compact inline composer with optional mention suggestions.
 *
 * @param root0 - Composer props.
 * @param root0.composer - Draft/composer state.
 * @returns The composer node.
 */
function InlineComposer({ composer }: { composer: CommentComposerDraft }): ReactNode {
  try {
    const hasTools = Boolean(composer?.tools);
    const composerClassName = [
      styles.composer,
      composer?.active ? styles.composerActive : "",
      hasTools ? styles.composerWithTools : "",
    ]
      .filter(Boolean)
      .join(" ");
    const text = composer?.text ?? "";
    const placeholder = composer?.placeholder ?? DEFAULT_COMPOSER_PLACEHOLDER;
    const isTyping = Boolean(composer?.typing);

    return (
      <div className={styles.composerWrap}>
        <div className={composerClassName}>
          <div className={styles.composerText}>
            {isTyping ? (
              <span className={styles.composerTypeLayer}>
                <span className={styles.composerPlaceholderLayer}>{placeholder}</span>
                <span className={styles.composerTyped}>
                  <span className={styles.composerTypedText}>{text}</span>
                  <span className={styles.composerTypedCaret} aria-hidden="true" />
                </span>
              </span>
            ) : text ? (
              <>
                <span>{text}</span>
                <span className={styles.composerCaret} aria-hidden="true" />
              </>
            ) : (
              <span className={styles.composerPlaceholder}>{placeholder}</span>
            )}
          </div>
          {hasTools ? (
            <div className={styles.composerToolbar} aria-hidden="true">
              <div className={styles.composerToolGroup}>
                {COMPOSER_TOOL_ORDER.map((toolKey) => (
                  <span key={toolKey} className={styles.composerTool}>
                    <ComposerToolIcon
                      paths={COMPOSER_TOOL_ICON_PATHS?.[toolKey] ?? []}
                      size={20}
                    />
                  </span>
                ))}
              </div>
              <span className={styles.composerSend}>
                <SendIcon size={14} />
              </span>
            </div>
          ) : (
            <span className={styles.composerSend}>
              <SendIcon size={14} />
            </span>
          )}
        </div>

        {composer?.mentionSuggestions?.length ? (
          <div className={styles.mentionMenu}>
            {composer.mentionSuggestions.map((suggestion) => (
              <div
                key={`${suggestion?.name}-${suggestion?.email}`}
                className={
                  suggestion?.active
                    ? `${styles.mentionOption} ${styles.mentionOptionActive}`
                    : styles.mentionOption
                }
              >
                <PersonAvatar
                  avatarSrc={suggestion?.avatarSrc}
                  avatarInitial={suggestion?.avatarInitial}
                  avatarTone={suggestion?.avatarTone}
                  className={styles.suggestionAvatar}
                  imageClassName={styles.suggestionAvatarImage}
                  size={28}
                />
                <span className={styles.suggestionMeta}>
                  <span className={styles.suggestionName}>{suggestion?.name}</span>
                  <span className={styles.suggestionEmail}>{suggestion?.email}</span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the status menu used by the task-management artifact.
 *
 * @param root0 - Status option props.
 * @param root0.options - Status options to show.
 * @returns The status menu.
 */
function StatusMenu({
  options,
}: {
  options?: readonly StatusMenuOption[];
}): ReactNode {
  try {
    if (!options?.length) {
      return null;
    }

    return (
      <div className={styles.statusMenu}>
        {options.map((option) => {
          const itemClassNames = [styles.statusMenuItem];
          if (option?.tone === "progress") {
            itemClassNames.push(styles.statusMenuProgress);
          } else if (option?.tone === "done") {
            itemClassNames.push(styles.statusMenuDone);
          }
          if (option?.target) {
            itemClassNames.push(styles.statusMenuTarget);
          }

          return (
            <span key={option?.label} className={itemClassNames.join(" ")}>
              {option?.tone === "progress" ? (
                <ClockIcon size={14} />
              ) : option?.tone === "done" ? (
                <CheckCircleIcon size={14} />
              ) : (
                <StatusCircleIcon size={14} />
              )}
              {option?.label}
            </span>
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the read-receipt popover.
 *
 * @param root0 - Read receipt props.
 * @param root0.people - People to render.
 * @returns The receipt popover.
 */
function ReadReceiptPanel({
  people,
}: {
  people?: readonly ReadReceiptPerson[];
}): ReactNode {
  try {
    if (!people?.length) {
      return null;
    }

    return (
      <div className={styles.readPanel}>
        {people.map((person, index) => (
          <div key={`${person?.name}-${index}`} className={styles.readPerson}>
            <span className={styles.readIdentity}>
              <PersonAvatar
                avatarSrc={person?.avatarSrc}
                avatarInitial={person?.avatarInitial}
                avatarTone={person?.avatarTone}
                className={styles.readAvatar}
                imageClassName={styles.readAvatarImage}
                size={20}
              />
              <span className={styles.readName}>{person?.name}</span>
            </span>
            <span className={styles.readTime}>{person?.timeAgo}</span>
          </div>
        ))}
      </div>
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
  screenshotNode,
  screenshotHeight = DEFAULT_SCREENSHOT_HEIGHT,
  replyLabel,
  replies,
  attachment,
  mediaAttachment,
  reactions,
  showAddReaction = false,
  composer,
  statusOptions,
  showReadReceiptBadge = false,
  readReceipts,
  showReadReceiptPanel = false,
  flat = false,
  animation,
}: CommentThreadCardProps): ReactNode {
  try {
    let baseClassName = flat ? `${styles.card} ${styles.cardFlat}` : styles.card;
    const hasFloatingLayer = Boolean(
      showReadReceiptPanel || statusOptions?.length || composer?.mentionSuggestions?.length,
    );
    if (hasFloatingLayer) {
      baseClassName = `${baseClassName} ${styles.cardWithPopover}`;
    }
    const animationClass =
      animation === "mentions"
        ? styles.animMentions
        : animation === "thread-reply"
          ? styles.animThread
          : animation === "reactions"
            ? styles.animReactions
            : animation === "attachment"
              ? styles.animAttachment
              : animation === "status"
                ? styles.animStatus
                : "";
    if (animationClass) {
      baseClassName = `${baseClassName} ${animationClass}`;
    }
    const isStatusAnim = animation === "status";
    const rootClassName = className ? `${baseClassName} ${className}` : baseClassName;
    const avatarToneClass = AVATAR_TONE_CLASS?.[avatarTone] ?? styles.avatarGray;

    return (
      <article className={rootClassName}>
        {status ? (
          <div className={styles.actions}>
            {isStatusAnim ? (
              <span className={styles.statusSwap}>
                <span className={`${styles.statusPill} ${styles.statusPillOpen}`}>
                  <StatusCircleIcon size={14} />
                  <span className={styles.statusText}>{status}</span>
                  <ChevronDownIcon size={14} />
                </span>
                <span
                  className={`${styles.statusPill} ${styles.statusResolved} ${styles.statusPillResolved}`}
                >
                  <CheckCircleIcon size={14} />
                  <span className={styles.statusText}>{RESOLVED_STATUS_LABEL}</span>
                  <ChevronDownIcon size={14} />
                </span>
              </span>
            ) : (
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
            )}
            <StatusMenu options={statusOptions} />
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
            {showReadReceiptBadge ? (
              <span className={styles.readBadge}>
                <ReadReceiptIcon size={16} />
              </span>
            ) : null}
          </span>
        </div>

        <CommentBody
          className={styles.body}
          bodyText={bodyText}
          mention={mention}
          mentionPlacement={mentionPlacement}
        />

        {mediaAttachment ? <MediaBlock media={mediaAttachment} /> : null}

        {attachment ? (
          <AttachmentRow attachment={attachment} animate={animation === "attachment"} />
        ) : null}

        <ReactionRow reactions={reactions} showAddReaction={showAddReaction} />

        {showScreenshot ? (
          <div
            className={styles.attachment}
            style={{ height: screenshotHeight }}
            aria-hidden="true"
          >
            {screenshotNode ? (
              screenshotNode
            ) : screenshotSrc ? (
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

        {replies?.length ? (
          <div className={styles.replies}>
            {replies.map((reply) => (
              <div key={`${reply?.author}-${reply?.bodyText}`} className={styles.replyCard}>
                <div className={styles.replyHead}>
                  <PersonAvatar
                    avatarSrc={reply?.avatarSrc}
                    avatarInitial={reply?.avatarInitial}
                    avatarTone={reply?.avatarTone}
                    className={styles.replyAvatar}
                    imageClassName={styles.replyAvatarImage}
                    size={28}
                  />
                  <span className={styles.meta}>
                    <span className={styles.author}>{reply?.author}</span>
                    <span className={styles.time}>{reply?.timeAgo}</span>
                    {reply?.edited ? <span className={styles.edited}>{EDITED_LABEL}</span> : null}
                  </span>
                </div>
                <CommentBody
                  className={styles.replyBody}
                  bodyText={reply?.bodyText}
                  mention={reply?.mention}
                  mentionPlacement={reply?.mentionPlacement}
                />
                {reply?.mediaAttachment ? (
                  <MediaBlock media={reply.mediaAttachment} />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {composer ? <InlineComposer composer={composer} /> : null}

        {replyLabel ? (
          <div className={styles.reply}>
            <ReplyIcon size={16} />
            <span className={styles.replyText}>{replyLabel}</span>
          </div>
        ) : null}

        {showReadReceiptPanel ? <ReadReceiptPanel people={readReceipts} /> : null}

        {animation === "reactions" ? (
          <FakeCursor className={styles.reactCursor} size={22} />
        ) : null}

        {isStatusAnim ? <FakeCursor className={styles.statusCursor} size={22} /> : null}
      </article>
    );
  } catch {
    return null;
  }
}
