import type { ReactNode, SVGProps } from "react";
import styles from "./PrivateArtifact.module.css";
import HeroCommentComposer from "../hero-artifacts/CommentComposer";
import BrowserChrome from "./BrowserChrome";

/**
 * Feature-section app-window artifact — "Private".
 *
 * Internal-only notes the client never sees: a live page (browser chrome) with
 * a selected element carrying a team-only comment via the shared hero
 * {@link HeroCommentComposer} ("Visible to → Only your Team"), a "Private Mode
 * Enabled" pill and a compact dark product toolbar whose lock toggle is on.
 * Mirrors the Private Comments hero artifact's language, conveying "internal
 * notes your team sees and the client never does."
 *
 * Authored left-anchored at the design's native type scale inside the ~631px
 * visible panel frame (the panel window is a wider 1204px that intentionally
 * clips off the right). The composer + chrome are shared components; the dark
 * toolbar is a compact, purpose-built version of the hero toolbar (the hero's
 * full toolbar lives privately in its own file and is intentionally untouched).
 */

const VISIBLE_TO_LABEL = "Visible to";
const TEAM_LABEL = "Only your Team";
const COMPOSER_MENTION = "@Mark";
const COMPOSER_TEXT = ", keep this note internal";
const COMPOSER_AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";
const PRIVATE_MODE_LABEL = "Private Mode Enabled";
const INBOX_COUNT = "24";
const ALERT_COUNT = "4";

/** A locally-drawn SVG icon accepting a pixel size plus native SVG props. */
type LocalIconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Shared stroke-icon wrapper (Tabler grid defaults: 24px viewBox, rounded
 * caps, `currentColor` strokes). Callers override `viewBox`/`strokeWidth` to
 * window into each glyph's native Figma coordinate cell.
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
 * Toolbar lock toggle glyph (Figma tabler-icon-lock).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function LockIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="0 0 18 18" strokeWidth={1.5} {...props}>
      <path d="M6 8.25V5.25C6 4.45435 6.31607 3.69129 6.87868 3.12868C7.44129 2.56607 8.20435 2.25 9 2.25C9.79565 2.25 10.5587 2.56607 11.1213 3.12868C11.6839 3.69129 12 4.45435 12 5.25V8.25M3.75 9.75C3.75 9.35218 3.90804 8.97064 4.18934 8.68934C4.47064 8.40804 4.85218 8.25 5.25 8.25H12.75C13.1478 8.25 13.5294 8.40804 13.8107 8.68934C14.092 8.97064 14.25 9.35218 14.25 9.75V14.25C14.25 14.6478 14.092 15.0294 13.8107 15.3107C13.5294 15.592 13.1478 15.75 12.75 15.75H5.25C4.85218 15.75 4.47064 15.592 4.18934 15.3107C3.90804 15.0294 3.75 14.6478 3.75 14.25V9.75ZM8.25 12C8.25 12.1989 8.32902 12.3897 8.46967 12.5303C8.61032 12.671 8.80109 12.75 9 12.75C9.19891 12.75 9.38968 12.671 9.53033 12.5303C9.67098 12.3897 9.75 12.1989 9.75 12C9.75 11.8011 9.67098 11.6103 9.53033 11.4697C9.38968 11.329 9.19891 11.25 9 11.25C8.80109 11.25 8.61032 11.329 8.46967 11.4697C8.32902 11.6103 8.25 11.8011 8.25 12Z" />
    </StrokeIcon>
  );
}

/**
 * Rounded speech bubble with a pointed bottom-left corner — the toolbar's
 * active comment button glyph (Figma icons/Comment/Line).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function CommentBubbleIcon(props: LocalIconProps) {
  return (
    <StrokeIcon
      viewBox="11.5 7 18 18"
      strokeWidth={2}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      {...props}
    >
      <path d="M20.5 8C24.9183 8 28.5 11.5817 28.5 16C28.5 20.4183 24.9183 24 20.5 24H13.5C12.9477 24 12.5 23.5523 12.5 23V16C12.5 11.5817 16.0817 8 20.5 8Z" />
    </StrokeIcon>
  );
}

/**
 * Inbox tray glyph — the toolbar's inbox button (Figma heroicons:inbox).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function InboxIcon(props: LocalIconProps) {
  return (
    <StrokeIcon strokeWidth={1.5} {...props}>
      <path d="M2.25 13.5H6.11C6.5278 13.5001 6.93731 13.6165 7.29267 13.8363C7.64803 14.056 7.9352 14.3703 8.122 14.744L8.378 15.256C8.56488 15.6299 8.8522 15.9443 9.20775 16.164C9.5633 16.3837 9.97303 16.5001 10.391 16.5H13.609C14.027 16.5001 14.4367 16.3837 14.7922 16.164C15.1478 15.9443 15.4351 15.6299 15.622 15.256L15.878 14.744C16.0649 14.3701 16.3522 14.0557 16.7078 13.836C17.0633 13.6163 17.473 13.4999 17.891 13.5H21.75M2.25 13.838V18C2.25 18.5967 2.48705 19.169 2.90901 19.591C3.33097 20.0129 3.90326 20.25 4.5 20.25H19.5C20.0967 20.25 20.669 20.0129 21.091 19.591C21.5129 19.169 21.75 18.5967 21.75 18V13.838C21.75 13.614 21.716 13.391 21.65 13.177L19.24 5.338C19.0985 4.87824 18.8133 4.47595 18.4264 4.19015C18.0394 3.90435 17.5711 3.75009 17.09 3.75H6.911C6.42995 3.75009 5.96159 3.90435 5.57464 4.19015C5.1877 4.47595 4.90254 4.87824 4.761 5.338L2.35 13.177C2.28394 13.3911 2.25023 13.6139 2.25 13.838Z" />
    </StrokeIcon>
  );
}

/**
 * Warning triangle glyph — the toolbar's alerts button (Figma tabler-icon-
 * alert-triangle).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function AlertTriangleIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="0 0 19 19" strokeWidth={1.58333} {...props}>
      <path d="M9.5026 7.12511V10.2918M9.5026 12.6668H9.51052M8.20625 2.84294L1.789 13.5574C1.65671 13.7865 1.5867 14.0462 1.58594 14.3107C1.58519 14.5753 1.6537 14.8354 1.78468 15.0653C1.91566 15.2951 2.10453 15.4867 2.33251 15.6209C2.56049 15.7551 2.81963 15.8273 3.08416 15.8302H15.9202C16.1847 15.8272 16.4437 15.755 16.6715 15.6208C16.8994 15.4867 17.0882 15.2952 17.2192 15.0655C17.3501 14.8357 17.4187 14.5757 17.418 14.3113C17.4174 14.0469 17.3475 13.7872 17.2154 13.5582L10.7982 2.84215C10.6631 2.6193 10.473 2.43503 10.2459 2.30714C10.0189 2.17925 9.76277 2.11206 9.50221 2.11206C9.24165 2.11206 8.98549 2.17925 8.75848 2.30714C8.53146 2.43503 8.34126 2.6193 8.20625 2.84215V2.84294Z" />
    </StrokeIcon>
  );
}

/**
 * Vertical three-dot glyph — the toolbar's overflow menu (Figma icons/
 * Dropdown/Line).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function DotsVerticalIcon(props: LocalIconProps) {
  return (
    <FillIcon {...props}>
      <path d="M10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19C14 17.9 13.1 17 12 17C10.9 17 10 17.9 10 19ZM10 5C10 6.1 10.9 7 12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3C10.9 3 10 3.9 10 5ZM10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12Z" />
    </FillIcon>
  );
}

/**
 * The Superflow brand mark — four brand-colored petals (exact Figma vectors).
 *
 * @param props - Local icon props.
 * @returns The rendered mark.
 */
function SuperflowMark({ size = 28, ...rest }: LocalIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M13.4316 3.51909C12.6958 3.20466 11.8819 3.11989 11.0969 3.2759C10.312 3.43192 9.59255 3.82142 9.03308 4.3933C8.46157 4.95285 8.07233 5.67168 7.91623 6.45582C7.76014 7.23996 7.84447 8.05291 8.15818 8.7884C8.45708 9.52946 8.97285 10.1631 9.63803 10.6065C10.3032 11.05 11.0868 11.2825 11.8864 11.2736H15.9223V7.24436C15.9311 6.44498 15.698 5.66158 15.2535 4.99684C14.8091 4.33209 14.1741 3.81701 13.4316 3.51909Z"
        fill="#FFCD2E"
      />
      <path
        d="M28.1321 8.52565C27.188 7.58307 25.9855 6.94115 24.6765 6.68096C23.3675 6.42076 22.0107 6.55396 20.7774 7.06372C19.5441 7.57348 18.4896 8.43695 17.7471 9.54511C17.0046 10.6533 16.6073 11.9564 16.6055 13.29V20.0329H23.3675C24.706 20.0471 26.0176 19.657 27.1306 18.9139C28.2436 18.1707 29.1061 17.1091 29.6052 15.868C30.1269 14.638 30.2654 13.2795 30.0027 11.9697C29.7399 10.6599 29.088 9.45962 28.1321 8.52565Z"
        fill="#FF7162"
      />
      <path
        d="M24.3715 23.2142C24.0727 22.4723 23.5569 21.8378 22.8914 21.3935C22.226 20.9492 21.4419 20.7158 20.6416 20.7238H16.6057V24.7565C16.5973 25.5561 16.8307 26.3395 17.2754 27.0042C17.7201 27.6689 18.3554 28.184 19.098 28.4818C19.5949 28.6906 20.1283 28.7986 20.6674 28.7995C21.3289 28.7928 21.9788 28.6243 22.5601 28.3085C23.1414 27.9928 23.6365 27.5396 24.0019 26.9885C24.3674 26.4374 24.5922 25.8053 24.6566 25.1473C24.721 24.4893 24.6231 23.8256 24.3715 23.2142Z"
        fill="#0DCF82"
      />
      <path
        d="M2.93155 16.1289C2.40623 17.3593 2.26498 18.7195 2.52629 20.0315C2.7876 21.3434 3.43928 22.5459 4.39601 23.4816C5.01327 24.11 5.74925 24.6096 6.56125 24.9516C7.37325 25.2936 8.24513 25.4712 9.12631 25.4739C10.0283 25.4719 10.9209 25.2915 11.7527 24.9432C12.995 24.4447 14.0576 23.5829 14.8013 22.4708C15.5451 21.3586 15.9353 20.0479 15.921 18.7104V11.9606H9.16929C7.83035 11.9467 6.51844 12.3373 5.4054 13.081C4.29236 13.8248 3.4301 14.8872 2.93155 16.1289Z"
        fill="#625DF5"
      />
    </svg>
  );
}

/**
 * Render the compact dark product toolbar: brand mark, an "on" lock toggle,
 * the active comment button, inbox + alert counters and an overflow menu.
 *
 * @returns The floating toolbar element.
 */
function DarkToolbar(): ReactNode {
  return (
    <div className={styles.toolbar} role="presentation">
      <span className={styles.toolbarLogo}>
        <SuperflowMark size={28} />
      </span>
      <span className={styles.toolbarDivider} aria-hidden="true" />

      <span className={styles.lockToggle}>
        <span className={styles.lockKnob}>
          <LockIcon size={16} />
        </span>
      </span>
      <span className={styles.commentButton}>
        <CommentBubbleIcon size={18} />
      </span>

      <span className={styles.toolbarDivider} aria-hidden="true" />

      <span className={styles.counter}>
        <span className={styles.inboxWrap}>
          <InboxIcon size={20} />
          <span className={styles.inboxDot} aria-hidden="true" />
        </span>
        <span className={styles.countText}>{INBOX_COUNT}</span>
      </span>
      <span className={styles.counter}>
        <AlertTriangleIcon size={18} />
        <span className={styles.countText}>{ALERT_COUNT}</span>
      </span>

      <span className={styles.toolbarDivider} aria-hidden="true" />

      <span className={styles.toolbarAvatar} aria-hidden="true" />
      <span className={styles.toolbarIconButton}>
        <DotsVerticalIcon size={20} />
      </span>
    </div>
  );
}

/**
 * Render the "Private" feature-section artifact.
 *
 * @returns The Private window contents, filling its container.
 */
export default function PrivateArtifact(): ReactNode {
  return (
    <div className={styles.root} data-artifact="private-comments">
      <BrowserChrome className={styles.chrome} />

      <div className={styles.pageBlock} aria-hidden="true" />

      <div className={styles.rightTop} aria-hidden="true">
        <div className={styles.dashedBox} />
        <div className={styles.skeletonBlock} />
      </div>

      <div className={styles.rightBars} aria-hidden="true">
        <span className={styles.bar} />
        <span className={`${styles.bar} ${styles.barShort}`} />
      </div>

      <HeroCommentComposer
        className={styles.composerGroup}
        header={{ label: VISIBLE_TO_LABEL, team: TEAM_LABEL }}
        mention={COMPOSER_MENTION}
        mentionPlacement="start"
        commentText={COMPOSER_TEXT}
        avatar={{ src: COMPOSER_AVATAR_SRC }}
        avatarSide="right"
      />

      <div className={styles.toolbarStack}>
        <div className={styles.privatePill}>{PRIVATE_MODE_LABEL}</div>
        <DarkToolbar />
      </div>
    </div>
  );
}
