import type { ComponentType, ReactNode, SVGProps } from "react";
import Image from "next/image";
import styles from "./CommentComposer.module.css";

/**
 * Shared hero comment composer — the floating "comment input box" seen across
 * the Guest Mode, Private Comments and Integrations hero artifacts.
 *
 * Extracted verbatim from the original Guest Mode artifact (Figma node
 * 754:2924, file aVubXS2jMWMDlRK42zvgoy) so the three tabs render the identical
 * composer. The glyph geometry below is inlined from the exact Figma vectors.
 *
 * The component renders the ringed avatar chip + the white composer card, laid
 * out as a horizontal group. Positioning is left to the caller: pass an
 * absolute-positioning class through {@link HeroCommentComposerProps.className}
 * and it is applied to the group's root element.
 */

const DEFAULT_COMMENT_TEXT = "Client here! Can we change this ima";
const DEFAULT_AVATAR_SRC = "/images/home-2026/hero/guest-avatar.png";
const AVATAR_SIZE = 26;
const INCOGNITO_GLYPH_SIZE = 17;

/** A locally-drawn SVG icon accepting a pixel size plus native SVG props. */
type LocalIconProps = SVGProps<SVGSVGElement> & { size?: number };

/** A composer tool-row icon component. */
type ComposerToolIcon = ComponentType<LocalIconProps>;

/**
 * Shared stroke-icon wrapper. Defaults match the Tabler grid (24px viewBox,
 * rounded caps, `currentColor` strokes); callers override `viewBox` and
 * `strokeWidth` to window into each glyph's native Figma coordinate cell.
 *
 * @param props - Size, viewBox/stroke overrides, path children and SVG attrs.
 * @returns The configured stroked `<svg>` element.
 */
function StrokeIcon({ size = 24, children, ...rest }: LocalIconProps) {
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
      {...rest}
    >
      {children}
    </svg>
  );
}

/**
 * Shared fill-icon wrapper for solid glyphs (drawn with `currentColor`).
 *
 * @param props - Size, viewBox, path children and native SVG attributes.
 * @returns The configured filled `<svg>` element.
 */
function FillIcon({ size = 24, children, ...rest }: LocalIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/**
 * Text-format glyph — the composer's text-style tool (Figma node 761:1429).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function TextFormatIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="4 4 24 24" strokeWidth={1.04167} {...props}>
      <path d="M13 19V12C13 11.2044 13.3161 10.4413 13.8787 9.87868C14.4413 9.31607 15.2044 9 16 9C16.7956 9 17.5587 9.31607 18.1213 9.87868C18.6839 10.4413 19 11.2044 19 12V19M13 15H19M9 23H23" />
    </StrokeIcon>
  );
}

/**
 * "@" glyph — the composer's mention tool (Figma node 761:1432).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function AtIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="40 4 24 24" strokeWidth={1.04167} {...props}>
      <path d="M55.3333 16.0096C55.3333 16.8937 54.9821 17.7415 54.357 18.3667C53.7319 18.9918 52.8841 19.343 52 19.343C51.1159 19.343 50.2681 18.9918 49.643 18.3667C49.0179 17.7415 48.6667 16.8937 48.6667 16.0096C48.6667 15.1256 49.0179 14.2777 49.643 13.6526C50.2681 13.0275 51.1159 12.6763 52 12.6763C52.8841 12.6763 53.7319 13.0275 54.357 13.6526C54.9821 14.2777 55.3333 15.1256 55.3333 16.0096ZM55.3333 16.0096L55.3333 17.2596C55.3333 17.8122 55.5528 18.3421 55.9435 18.7328C56.3342 19.1235 56.8641 19.343 57.4167 19.343C57.9692 19.343 58.4991 19.1235 58.8898 18.7328C59.2805 18.3421 59.5 17.8122 59.5 17.2596V16.0096C59.5021 14.3981 58.985 12.8287 58.0253 11.534C57.0657 10.2393 55.7145 9.2881 54.172 8.82139C52.6295 8.35468 50.9776 8.39724 49.4612 8.94277C47.9448 9.48831 46.6444 10.5078 45.7527 11.8502C44.861 13.1926 44.4254 14.7865 44.5105 16.3959C44.5955 18.0052 45.1967 19.5443 46.225 20.7853C47.2532 22.0262 48.6538 22.9029 50.2193 23.2855C51.7848 23.6682 53.4319 23.5364 54.9167 22.9096" />
    </StrokeIcon>
  );
}

/**
 * Paperclip glyph — the composer's attachment tool (Figma node 761:1435).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function PaperclipIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="76 4 24 24" strokeWidth={1.25} {...props}>
      <path d="M90.3243 12.2701L85.4579 17.1365C85.1601 17.4344 84.9928 17.8383 84.9928 18.2595C84.9928 18.6807 85.1601 19.0847 85.4579 19.3826C85.7558 19.6804 86.1597 19.8477 86.581 19.8477C87.0022 19.8477 87.4061 19.6804 87.704 19.3826L92.5704 14.5161C93.1661 13.9205 93.5007 13.1125 93.5007 12.2701C93.5007 11.4277 93.1661 10.6198 92.5704 10.0241C91.9747 9.4284 91.1668 9.09375 90.3243 9.09375C89.4819 9.09375 88.674 9.4284 88.0783 10.0241L83.2119 14.8905C82.3184 15.784 81.8164 16.9959 81.8164 18.2595C81.8164 19.5232 82.3184 20.7351 83.2119 21.6286C84.1054 22.5221 85.3173 23.0241 86.581 23.0241C87.8446 23.0241 89.0565 22.5221 89.95 21.6286L94.8164 16.7622" />
    </StrokeIcon>
  );
}

/**
 * Microphone glyph — the composer's voice-note tool (Figma node 761:1438).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function MicrophoneIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="112 4 24 24" strokeWidth={1.25} {...props}>
      <path d="M129 14.4291C129 15.7552 128.473 17.027 127.536 17.9647C126.598 18.9023 125.326 19.4291 124 19.4291C122.674 19.4291 121.402 18.9023 120.464 17.9647C119.527 17.027 119 15.7552 119 14.4291M124 19.4291V22.2863M121.143 22.2863H126.857M121.857 10.8577C121.857 10.2894 122.083 9.74434 122.485 9.34247C122.887 8.94061 123.432 8.71484 124 8.71484C124.568 8.71484 125.113 8.94061 125.515 9.34247C125.917 9.74434 126.143 10.2894 126.143 10.8577V14.4291C126.143 14.9975 125.917 15.5425 125.515 15.9444C125.113 16.3462 124.568 16.572 124 16.572C123.432 16.572 122.887 16.3462 122.485 15.9444C122.083 15.5425 121.857 14.9975 121.857 14.4291V10.8577Z" />
    </StrokeIcon>
  );
}

/**
 * Video-camera glyph — the composer's video tool (Figma node 761:1441).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function VideoIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="148 4 24 24" strokeWidth={1.25} {...props}>
      <path d="M162.667 14.2241L166.714 12.201C166.849 12.1333 167 12.1013 167.151 12.1081C167.302 12.1149 167.449 12.1603 167.578 12.2399C167.707 12.3195 167.814 12.4307 167.887 12.563C167.961 12.6952 168 12.8442 168 12.9956V19.0081C168 19.1595 167.961 19.3084 167.887 19.4407C167.814 19.573 167.707 19.6842 167.578 19.7638C167.449 19.8434 167.302 19.8888 167.151 19.8956C167 19.9024 166.849 19.8704 166.714 19.8027L162.667 17.7796V14.2241Z" />
      <path d="M152 12.4457C152 11.9743 152.187 11.5221 152.521 11.1887C152.854 10.8553 153.306 10.668 153.778 10.668H160.889C161.36 10.668 161.813 10.8553 162.146 11.1887C162.479 11.5221 162.667 11.9743 162.667 12.4457V19.5569C162.667 20.0284 162.479 20.4805 162.146 20.8139C161.813 21.1473 161.36 21.3346 160.889 21.3346H153.778C153.306 21.3346 152.854 21.1473 152.521 20.8139C152.187 20.4805 152 20.0284 152 19.5569V12.4457Z" />
    </StrokeIcon>
  );
}

/**
 * Screen-share glyph — the composer's screen-capture tool (node 761:1444).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ScreenShareIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="184 4 24 24" strokeWidth={1.25} {...props}>
      <path d="M202.5 16.0017V18.1684C202.5 18.3599 202.424 18.5436 202.288 18.6791C202.153 18.8145 201.969 18.8906 201.778 18.8906H190.222C190.031 18.8906 189.847 18.8145 189.712 18.6791C189.576 18.5436 189.5 18.3599 189.5 18.1684V10.9462C189.5 10.7546 189.576 10.5709 189.712 10.4355C189.847 10.3 190.031 10.224 190.222 10.224H196.722M192.389 21.7795H199.611M193.833 18.8906V21.7795M198.167 18.8906V21.7795M202 13.0017C200.865 13.0017 199.944 12.0814 199.944 10.9462C199.944 9.81093 200.865 8.89062 202 8.89062C203.135 8.89062 204.056 9.81093 204.056 10.9462C204.056 12.0814 203.135 13.0017 202 13.0017Z" />
    </StrokeIcon>
  );
}

/**
 * Send paper-plane — the composer's purple send button (Figma node 761:1447).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function SendArrowIcon(props: LocalIconProps) {
  return (
    <FillIcon viewBox="8 8 14 14" {...props}>
      <path d="M20.1398 13.9146L10.7269 9.84069C10.3303 9.66903 9.88231 9.74455 9.55772 10.0376C9.23313 10.3308 9.09736 10.7825 9.20346 11.2164L10.0413 14.6435H14.1435C14.3322 14.6435 14.4853 14.8031 14.4853 15C14.4853 15.1969 14.3322 15.3565 14.1435 15.3565H10.0413L9.20346 18.7836C9.09736 19.2176 9.2331 19.6692 9.55772 19.9624C9.88297 20.2561 10.331 20.3306 10.7269 20.1593L20.1398 16.0854C20.5684 15.8999 20.8346 15.484 20.8346 15C20.8346 14.516 20.5684 14.1002 20.1398 13.9146Z" />
    </FillIcon>
  );
}

/**
 * Open padlock — the composer's "Visible to" header lock, shown when the
 * surface is not locked (Figma tabler-icon-lock-open-2, node 758:3037).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function LockOpenIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="28 16 16 16" strokeWidth={1.33333} {...props}>
      <path d="M36.6667 23.8333V21.1667C36.6667 20.4594 36.9476 19.7811 37.4477 19.281C37.9478 18.781 38.6261 18.5 39.3333 18.5C40.0406 18.5 40.7189 18.781 41.219 19.281C41.719 19.7811 42 20.4594 42 21.1667V23.8333M30 25.1667C30 24.813 30.1405 24.4739 30.3905 24.2239C30.6406 23.9738 30.9797 23.8333 31.3333 23.8333H38C38.3536 23.8333 38.6928 23.9738 38.9428 24.2239C39.1929 24.4739 39.3333 24.813 39.3333 25.1667V29.1667C39.3333 29.5203 39.1929 29.8594 38.9428 30.1095C38.6928 30.3595 38.3536 30.5 38 30.5H31.3333C30.9797 30.5 30.6406 30.3595 30.3905 30.1095C30.1405 29.8594 30 29.5203 30 29.1667V25.1667ZM34 27.1667C34 27.3435 34.0702 27.513 34.1953 27.6381C34.3203 27.7631 34.4899 27.8333 34.6667 27.8333C34.8435 27.8333 35.013 27.7631 35.1381 27.6381C35.2631 27.513 35.3333 27.3435 35.3333 27.1667C35.3333 26.9899 35.2631 26.8203 35.1381 26.6953C35.013 26.5702 34.8435 26.5 34.6667 26.5C34.4899 26.5 34.3203 26.5702 34.1953 26.6953C34.0702 26.8203 34 26.9899 34 27.1667Z" />
    </StrokeIcon>
  );
}

/**
 * Closed padlock — the composer's "Visible to" header lock, shown when the
 * surface is locked (Figma tabler-icon-lock, node 758:3037).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function LockClosedIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="16 12 16 16" strokeWidth={1.33333} {...props}>
      <path d="M21.332 19.8333V17.1667C21.332 16.4594 21.613 15.7811 22.1131 15.281C22.6132 14.781 23.2915 14.5 23.9987 14.5C24.7059 14.5 25.3842 14.781 25.8843 15.281C26.3844 15.7811 26.6654 16.4594 26.6654 17.1667V19.8333M19.332 21.1667C19.332 20.813 19.4725 20.4739 19.7226 20.2239C19.9726 19.9738 20.3117 19.8333 20.6654 19.8333H27.332C27.6857 19.8333 28.0248 19.9738 28.2748 20.2239C28.5249 20.4739 28.6654 20.813 28.6654 21.1667V25.1667C28.6654 25.5203 28.5249 25.8594 28.2748 26.1095C28.0248 26.3595 27.6857 26.5 27.332 26.5H20.6654C20.3117 26.5 19.9726 26.3595 19.7226 26.1095C19.4725 25.8594 19.332 25.5203 19.332 25.1667V21.1667ZM23.332 23.1667C23.332 23.3435 23.4023 23.513 23.5273 23.6381C23.6523 23.7631 23.8219 23.8333 23.9987 23.8333C24.1755 23.8333 24.3451 23.7631 24.4701 23.6381C24.5951 23.513 24.6654 23.3435 24.6654 23.1667C24.6654 22.9899 24.5951 22.8203 24.4701 22.6953C24.3451 22.5702 24.1755 22.5 23.9987 22.5C23.8219 22.5 23.6523 22.5702 23.5273 22.6953C23.4023 22.8203 23.332 22.9899 23.332 23.1667Z" />
    </StrokeIcon>
  );
}

/**
 * Downward chevron inside the header's team chip (Figma tabler-icon-chevron-
 * down, node 758:3037).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ChevronDownIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="245 17.5 14 14" strokeWidth={1.16667} {...props}>
      <path d="M248.5 22.75L252 26.25L255.5 22.75" />
    </StrokeIcon>
  );
}

/**
 * Spy glyph (fedora + sunglasses) — the "incognito" avatar shown in place of a
 * photo when the commenter is an anonymous guest. Geometry is the Tabler `spy`
 * icon (24×24 grid, 2px stroke), which matches {@link StrokeIcon}'s defaults.
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function IncognitoIcon(props: LocalIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 11h18" />
      <path d="M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4" />
      <path d="M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M10 17h4" />
    </StrokeIcon>
  );
}

/** Composer tool-row icons, left-to-right, matching the Figma node. */
const COMPOSER_TOOLS: readonly ComposerToolIcon[] = [
  TextFormatIcon,
  AtIcon,
  PaperclipIcon,
  MicrophoneIcon,
  VideoIcon,
  ScreenShareIcon,
];

/**
 * Navy "Visible to → <team>" header strip drawn above the composer body. Omit
 * the whole object (default) for the header-less Guest Mode composer.
 */
export interface HeroComposerHeader {
  /** Leading label, e.g. "Visible to". */
  label: string;
  /** Team name shown inside the trailing chip, e.g. "Only your Team". */
  team: string;
  /** When true, renders a closed padlock; otherwise an open padlock. */
  locked?: boolean;
}

/** Image avatar shown inside the composer's ringed pin chip. */
export interface HeroComposerAvatar {
  /** Avatar image source. */
  src: string;
  /** Accessible alt text. Defaults to empty (decorative). */
  alt?: string;
}

/**
 * Sentinel for the anonymous "incognito" avatar: a spy glyph (fedora +
 * sunglasses) on a white disc, used when the commenter is a guest with no
 * identity/photo (Guest Mode).
 */
export const INCOGNITO_AVATAR = "incognito" as const;

/** The set of accepted avatar values for the composer's pin chip. */
export type HeroComposerAvatarInput =
  | HeroComposerAvatar
  | typeof INCOGNITO_AVATAR
  | null;

/** Where the {@link HeroCommentComposerProps.mention} sits around the text. */
export type MentionPlacement = "start" | "end";

/** Which side of the card the avatar pin sits on. */
export type AvatarSide = "left" | "right";

/** Props for {@link HeroCommentComposer}. */
export interface HeroCommentComposerProps {
  /**
   * Optional class applied to the composer group's root element. Callers use
   * this to absolutely position the composer within their own artifact frame.
   */
  className?: string;
  /**
   * Optional navy "Visible to → Team" header. Omit (default) to render no
   * header, exactly as the Guest Mode composer does.
   */
  header?: HeroComposerHeader;
  /**
   * Optional extra class applied to the header element, so a caller can animate
   * the header in (e.g. the Private Comments "private mode enabled" reveal).
   */
  headerClassName?: string;
  /** Typed comment shown before the caret. Defaults to the guest sample text. */
  commentText?: string;
  /** Optional purple "@mention" rendered alongside {@link commentText}. */
  mention?: string;
  /** Where the mention sits relative to the text. Defaults to "end". */
  mentionPlacement?: MentionPlacement;
  /**
   * Avatar pin content. Pass an image config, `"incognito"` (or the exported
   * {@link INCOGNITO_AVATAR}) for the anonymous spy-glyph disc used by guests,
   * or `null` for the gradient placeholder disc (as in Integrations). Defaults
   * to the guest avatar image.
   */
  avatar?: HeroComposerAvatarInput;
  /** Which side the avatar pin sits on. Defaults to "left". */
  avatarSide?: AvatarSide;
  /**
   * When true, use the accent (solid purple) card border + purple caret, as in
   * the Integrations composer. Defaults to false.
   */
  accent?: boolean;
}

/**
 * Render the floating comment composer popover: ringed avatar, an optional navy
 * visibility header, typed text with a caret, a tool row and the purple send
 * button. All surface-specific content (header, mention, avatar, accent) is
 * prop-driven; the defaults reproduce the Guest Mode composer byte-for-byte.
 *
 * @param props - Optional positioning class and header/comment/avatar overrides.
 * @returns The composer popover element.
 */
export default function HeroCommentComposer({
  className,
  header,
  headerClassName,
  commentText = DEFAULT_COMMENT_TEXT,
  mention,
  mentionPlacement = "end",
  avatar,
  avatarSide = "left",
  accent = false,
}: HeroCommentComposerProps = {}) {
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const HeaderLockIcon = header?.locked ? LockClosedIcon : LockOpenIcon;
  const useIncognitoAvatar = avatar === INCOGNITO_AVATAR;
  const useGradientAvatar = avatar === null;
  const avatarConfig =
    typeof avatar === "object" && avatar !== null ? avatar : null;
  const avatarSrc = avatarConfig?.src ?? DEFAULT_AVATAR_SRC;
  const avatarAlt = avatarConfig?.alt ?? "";
  const avatarChipClassName =
    avatarSide === "right"
      ? `${styles.avatarChip} ${styles.avatarChipRight}`
      : styles.avatarChip;
  const cardClassName = accent ? `${styles.card} ${styles.cardAccent}` : styles.card;
  const caretClassName = accent ? `${styles.caret} ${styles.caretAccent}` : styles.caret;

  let avatarInner: ReactNode;
  if (useIncognitoAvatar) {
    avatarInner = (
      <span className={styles.avatarIncognito}>
        <IncognitoIcon size={INCOGNITO_GLYPH_SIZE} />
      </span>
    );
  } else if (useGradientAvatar) {
    avatarInner = <span className={styles.avatarPlaceholder} aria-hidden="true" />;
  } else {
    avatarInner = (
      <Image
        className={styles.avatar}
        src={avatarSrc}
        alt={avatarAlt}
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
      />
    );
  }

  const avatarNode = <div className={avatarChipClassName}>{avatarInner}</div>;

  const cardNode = (
    <div className={cardClassName}>
      {header ? (
        <div className={headerClassName ? `${styles.header} ${headerClassName}` : styles.header}>
          <HeaderLockIcon size={16} />
          <span className={styles.headerLabel}>{header.label}</span>
          <span className={styles.teamChip}>
            <span className={styles.teamChipText}>{header.team}</span>
            <ChevronDownIcon size={14} />
          </span>
        </div>
      ) : null}
      <div className={styles.text}>
        {mention && mentionPlacement === "start" ? (
          <span className={styles.mention}>{mention}</span>
        ) : null}
        <span className={styles.typed}>{commentText}</span>
        {mention && mentionPlacement === "end" ? (
          <span className={styles.mention}>{mention}</span>
        ) : null}
        <span className={caretClassName} aria-hidden="true" />
      </div>
      <div className={styles.divider} aria-hidden="true" />
      <div className={styles.bar}>
        <div className={styles.tools}>
          {COMPOSER_TOOLS.map((ToolIcon, toolIndex) => (
            <span key={`tool-${toolIndex}`} className={styles.tool}>
              <ToolIcon size={24} />
            </span>
          ))}
        </div>
        <span className={styles.sendButton}>
          <SendArrowIcon size={14} />
        </span>
      </div>
    </div>
  );

  return (
    <div className={rootClassName}>
      {avatarSide === "right" ? (
        <>
          {cardNode}
          {avatarNode}
        </>
      ) : (
        <>
          {avatarNode}
          {cardNode}
        </>
      )}
    </div>
  );
}
