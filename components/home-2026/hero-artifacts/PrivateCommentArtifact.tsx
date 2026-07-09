import type { ReactNode } from "react";
import styles from "./PrivateCommentArtifact.module.css";
import HeroCommentComposer from "./CommentComposer";

/**
 * Hero tab artifact — "Private Comments".
 * Figma: node 759:3734 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * A static visual mock of a mock browser window: browser chrome bar, a page
 * body with a team-only ("Visible to → Only your Team") comment composer, a
 * dashed selection region with skeleton content, a centered "Private Mode
 * Enabled" pill and a floating dark product toolbar.
 *
 * Every glyph is an inline SVG whose geometry, stroke width and viewBox were
 * exported directly from the Figma node so the icons match the design exactly.
 *
 * The root element is the white inner card; the shared `.window` frame in
 * {@link HeroWorkflowShowcase} supplies the surrounding 2px black reveal. The
 * navy outer border is part of THIS artifact and is drawn as an inset frame.
 */

const ADDRESS_LABEL = "your-site.com";
const PRIVATE_MODE_LABEL = "Private Mode Enabled";
const INBOX_COUNT = "24";
const ALERT_COUNT = "4";

/* Comment-composer content — the navy "Visible to → Only your Team" header,
   the "@Mark, Lets make sure we updat" draft and the team member's avatar. */
const VISIBLE_TO_LABEL = "Visible to";
const TEAM_LABEL = "Only your Team";
const COMPOSER_MENTION = "@Mark";
const COMPOSER_TEXT = ", Lets make sure we updat";
const COMPOSER_AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";

/** Shared props for every inline icon: an optional pixel size and class. */
type IconProps = {
  /** Rendered width/height in pixels. */
  size?: number;
  className?: string;
};

type StrokeIconProps = IconProps & {
  viewBox: string;
  strokeWidth: number;
  defaultSize: number;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  children: ReactNode;
};

type FillIconProps = IconProps & {
  viewBox: string;
  defaultSize: number;
  children: ReactNode;
};

/**
 * Stroke-icon wrapper: draws outlined glyphs in `currentColor` with rounded
 * caps. viewBox and stroke width are passed per icon so each matches the value
 * exported from Figma exactly.
 *
 * @param props - Geometry, sizing and child path nodes.
 * @returns The configured `<svg>` element.
 */
function StrokeIcon({
  viewBox,
  strokeWidth,
  defaultSize,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  size,
  className,
  children,
}: StrokeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? defaultSize}
      height={size ?? defaultSize}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * Fill-icon wrapper: draws solid glyphs in `currentColor`.
 *
 * @param props - Geometry, sizing and child path nodes.
 * @returns The configured `<svg>` element.
 */
function FillIcon({ viewBox, defaultSize, size, className, children }: FillIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? defaultSize}
      height={size ?? defaultSize}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Browser back chevron (Figma tabler-icon-chevron-left). */
function ChevronLeftIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M10 4L6 8L10 12" />
    </StrokeIcon>
  );
}

/** Browser forward chevron (Figma tabler-icon-chevron-right). */
function ChevronRightIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M6 4L10 8L6 12" />
    </StrokeIcon>
  );
}

/** Browser reload icon (Figma tabler-icon-reload). */
function ReloadIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M13.2894 8.69411C13.1635 9.65408 12.7786 10.5617 12.1761 11.3196C11.5736 12.0774 10.7762 12.657 9.86933 12.9961C8.96247 13.3352 7.98041 13.4211 7.02846 13.2445C6.07652 13.0679 5.1906 12.6355 4.46573 11.9937C3.74085 11.3518 3.20437 10.5248 2.91381 9.60121C2.62325 8.67765 2.58957 7.69241 2.81639 6.75117C3.04322 5.80992 3.52198 4.94818 4.20134 4.25835C4.8807 3.56852 5.73503 3.07663 6.67269 2.83544C9.27203 2.16878 11.9627 3.50678 12.956 6.00011M13.3346 2.66675V6.00008H10.0013" />
    </StrokeIcon>
  );
}

/** Browser bookmark icon (Figma tabler-icon-bookmark). */
function BookmarkIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 16 16" strokeWidth={1.11111} defaultSize={16} {...props}>
      <path d="M12 4.66667V14L8 11.3333L4 14V4.66667C4 3.95942 4.28095 3.28115 4.78105 2.78105C5.28115 2.28095 5.95942 2 6.66667 2H9.33333C10.0406 2 10.7189 2.28095 11.219 2.78105C11.719 3.28115 12 3.95942 12 4.66667Z" />
    </StrokeIcon>
  );
}

/** Upload / share-out icon on the chrome bar (Figma tabler-icon-share-2). */
function ShareExportIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 18 18" strokeWidth={1.5} defaultSize={18} {...props}>
      <path d="M6 6.75H5.25C4.85218 6.75 4.47064 6.90804 4.18934 7.18934C3.90804 7.47064 3.75 7.85218 3.75 8.25V14.25C3.75 14.6478 3.90804 15.0294 4.18934 15.3107C4.47064 15.592 4.85218 15.75 5.25 15.75H12.75C13.1478 15.75 13.5294 15.592 13.8107 15.3107C14.092 15.0294 14.25 14.6478 14.25 14.25V8.25C14.25 7.85218 14.092 7.47064 13.8107 7.18934C13.5294 6.90804 13.1478 6.75 12.75 6.75H12M9 10.5V2.25M11.25 4.5L9 2.25L6.75 4.5" />
    </StrokeIcon>
  );
}

/** Hamburger menu icon on the chrome bar (Figma tabler-icon-menu-2). */
function MenuIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 18 18" strokeWidth={1.5} defaultSize={18} {...props}>
      <path d="M3 4.5H15M3 9H15M3 13.5H15" />
    </StrokeIcon>
  );
}

/** Toolbar lock toggle glyph (Figma tabler-icon-lock). */
function LockIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 18 18" strokeWidth={1.5} defaultSize={18} {...props}>
      <path d="M6 8.25V5.25C6 4.45435 6.31607 3.69129 6.87868 3.12868C7.44129 2.56607 8.20435 2.25 9 2.25C9.79565 2.25 10.5587 2.56607 11.1213 3.12868C11.6839 3.69129 12 4.45435 12 5.25V8.25M3.75 9.75C3.75 9.35218 3.90804 8.97064 4.18934 8.68934C4.47064 8.40804 4.85218 8.25 5.25 8.25H12.75C13.1478 8.25 13.5294 8.40804 13.8107 8.68934C14.092 8.97064 14.25 9.35218 14.25 9.75V14.25C14.25 14.6478 14.092 15.0294 13.8107 15.3107C13.5294 15.592 13.1478 15.75 12.75 15.75H5.25C4.85218 15.75 4.47064 15.592 4.18934 15.3107C3.90804 15.0294 3.75 14.6478 3.75 14.25V9.75ZM8.25 12C8.25 12.1989 8.32902 12.3897 8.46967 12.5303C8.61032 12.671 8.80109 12.75 9 12.75C9.19891 12.75 9.38968 12.671 9.53033 12.5303C9.67098 12.3897 9.75 12.1989 9.75 12C9.75 11.8011 9.67098 11.6103 9.53033 11.4697C9.38968 11.329 9.19891 11.25 9 11.25C8.80109 11.25 8.61032 11.329 8.46967 11.4697C8.32902 11.6103 8.25 11.8011 8.25 12Z" />
    </StrokeIcon>
  );
}

/**
 * Toolbar active comment bubble glyph — a rounded speech bubble with a pointed
 * bottom-left corner (Figma icons/Comment/Line). Mirrors the Guest Mode active
 * comment treatment: butt caps + miter joins keep the tail corner crisp.
 */
function CommentBubbleIcon(props: IconProps) {
  return (
    <StrokeIcon
      viewBox="11.5 7 18 18"
      strokeWidth={2}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      defaultSize={18}
      {...props}
    >
      <path d="M20.5 8C24.9183 8 28.5 11.5817 28.5 16C28.5 20.4183 24.9183 24 20.5 24H13.5C12.9477 24 12.5 23.5523 12.5 23V16C12.5 11.5817 16.0817 8 20.5 8Z" />
    </StrokeIcon>
  );
}

/** Toolbar huddle / headphones glyph (Figma icons/Huddle/Line). */
function HeadphonesIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 24 24" strokeWidth={1.7} defaultSize={22} {...props}>
      <path d="M3.86719 12.9896V10.818C3.86719 6.50023 7.36742 3 11.6852 3C16.0029 3 19.5031 6.50023 19.5031 10.818V13.5716" />
      <path d="M3 16.8987V15.6326C3 13.7136 4.55566 12.158 6.47466 12.158C7.43416 12.158 8.21199 12.9358 8.21199 13.8953V18.636C8.21199 19.5955 7.43416 20.3734 6.47466 20.3734C4.55566 20.3734 3 18.8177 3 16.8987Z" />
      <path d="M20.375 16.8987V15.6326C20.375 13.7136 18.8193 12.158 16.9003 12.158C15.9408 12.158 15.163 12.9358 15.163 13.8953V18.636C15.163 19.5955 15.9408 20.3733 16.9003 20.3733C18.8193 20.3733 20.375 18.8177 20.375 16.8987Z" />
    </StrokeIcon>
  );
}

/** Small solid downward caret beside the huddle control (Figma Arrow Down Simple). */
function ArrowDownIcon(props: IconProps) {
  return (
    <FillIcon viewBox="0 0 16 16" defaultSize={16} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.8047 6.5286C10.5444 6.26825 10.1223 6.26825 9.86193 6.5286L8 8.39052L6.13807 6.5286C5.87772 6.26825 5.45561 6.26825 5.19526 6.5286C4.93491 6.78894 4.93491 7.21105 5.19526 7.4714L7.5286 9.80474C7.78894 10.0651 8.21105 10.0651 8.4714 9.80474L10.8047 7.4714C11.0651 7.21105 11.0651 6.78894 10.8047 6.5286Z"
      />
    </FillIcon>
  );
}

/** Toolbar inbox tray glyph (Figma heroicons:inbox). */
function InboxIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 24 24" strokeWidth={1.5} defaultSize={22} {...props}>
      <path d="M2.25 13.5H6.11C6.5278 13.5001 6.93731 13.6165 7.29267 13.8363C7.64803 14.056 7.9352 14.3703 8.122 14.744L8.378 15.256C8.56488 15.6299 8.8522 15.9443 9.20775 16.164C9.5633 16.3837 9.97303 16.5001 10.391 16.5H13.609C14.027 16.5001 14.4367 16.3837 14.7922 16.164C15.1478 15.9443 15.4351 15.6299 15.622 15.256L15.878 14.744C16.0649 14.3701 16.3522 14.0557 16.7078 13.836C17.0633 13.6163 17.473 13.4999 17.891 13.5H21.75M2.25 13.838V18C2.25 18.5967 2.48705 19.169 2.90901 19.591C3.33097 20.0129 3.90326 20.25 4.5 20.25H19.5C20.0967 20.25 20.669 20.0129 21.091 19.591C21.5129 19.169 21.75 18.5967 21.75 18V13.838C21.75 13.614 21.716 13.391 21.65 13.177L19.24 5.338C19.0985 4.87824 18.8133 4.47595 18.4264 4.19015C18.0394 3.90435 17.5711 3.75009 17.09 3.75H6.911C6.42995 3.75009 5.96159 3.90435 5.57464 4.19015C5.1877 4.47595 4.90254 4.87824 4.761 5.338L2.35 13.177C2.28394 13.3911 2.25023 13.6139 2.25 13.838Z" />
    </StrokeIcon>
  );
}

/** Toolbar issues / warning glyph (Figma tabler-icon-alert-triangle). */
function AlertTriangleIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 19 19" strokeWidth={1.58333} defaultSize={19} {...props}>
      <path d="M9.5026 7.12511V10.2918M9.5026 12.6668H9.51052M8.20625 2.84294L1.789 13.5574C1.65671 13.7865 1.5867 14.0462 1.58594 14.3107C1.58519 14.5753 1.6537 14.8354 1.78468 15.0653C1.91566 15.2951 2.10453 15.4867 2.33251 15.6209C2.56049 15.7551 2.81963 15.8273 3.08416 15.8302H15.9202C16.1847 15.8272 16.4437 15.755 16.6715 15.6208C16.8994 15.4867 17.0882 15.2952 17.2192 15.0655C17.3501 14.8357 17.4187 14.5757 17.418 14.3113C17.4174 14.0469 17.3475 13.7872 17.2154 13.5582L10.7982 2.84215C10.6631 2.6193 10.473 2.43503 10.2459 2.30714C10.0189 2.17925 9.76277 2.11206 9.50221 2.11206C9.24165 2.11206 8.98549 2.17925 8.75848 2.30714C8.53146 2.43503 8.34126 2.6193 8.20625 2.84215V2.84294Z" />
    </StrokeIcon>
  );
}

/** Toolbar share (network) glyph (Figma tabler-icon-share). */
function ShareIcon(props: IconProps) {
  return (
    <StrokeIcon viewBox="0 0 24 24" strokeWidth={1.5} defaultSize={22} {...props}>
      <path d="M9.02773 10.8299L14.9677 7.76995M9.02773 13.1699L14.9677 16.2299M3.89844 11.9999C3.89844 12.716 4.1829 13.4027 4.68925 13.9091C5.1956 14.4154 5.88235 14.6999 6.59844 14.6999C7.31452 14.6999 8.00128 14.4154 8.50763 13.9091C9.01397 13.4027 9.29844 12.716 9.29844 11.9999C9.29844 11.2838 9.01397 10.5971 8.50763 10.0907C8.00128 9.58437 7.31452 9.2999 6.59844 9.2999C5.88235 9.2999 5.1956 9.58437 4.68925 10.0907C4.1829 10.5971 3.89844 11.2838 3.89844 11.9999ZM14.6984 6.5999C14.6984 7.31599 14.9829 8.00274 15.4892 8.50909C15.9956 9.01544 16.6824 9.2999 17.3984 9.2999C18.1145 9.2999 18.8013 9.01544 19.3076 8.50909C19.814 8.00274 20.0984 7.31599 20.0984 6.5999C20.0984 5.88382 19.814 5.19706 19.3076 4.69071C18.8013 4.18437 18.1145 3.8999 17.3984 3.8999C16.6824 3.8999 15.9956 4.18437 15.4892 4.69071C14.9829 5.19706 14.6984 5.88382 14.6984 6.5999ZM14.6984 17.3999C14.6984 18.116 14.9829 18.8027 15.4892 19.3091C15.9956 19.8154 16.6824 20.0999 17.3984 20.0999C18.1145 20.0999 18.8013 19.8154 19.3076 19.3091C19.814 18.8027 20.0984 18.116 20.0984 17.3999C20.0984 16.6838 19.814 15.9971 19.3076 15.4907C18.8013 14.9844 18.1145 14.6999 17.3984 14.6999C16.6824 14.6999 15.9956 14.9844 15.4892 15.4907C14.9829 15.9971 14.6984 16.6838 14.6984 17.3999Z" />
    </StrokeIcon>
  );
}

/** Toolbar overflow (three vertical dots) glyph (Figma icons/Dropdown/Line). */
function DotsVerticalIcon(props: IconProps) {
  return (
    <FillIcon viewBox="0 0 24 24" defaultSize={22} {...props}>
      <path d="M10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19C14 17.9 13.1 17 12 17C10.9 17 10 17.9 10 19ZM10 5C10 6.1 10.9 7 12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3C10.9 3 10 3.9 10 5ZM10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12Z" />
    </FillIcon>
  );
}

/** Superflow brand mark — four brand-colored petals, exact vectors from Figma. */
function SuperflowLogo({ size = 32, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
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
 * Render the "Private Comments" hero artifact.
 *
 * @returns The mock browser window contents for the Private Comments tab.
 */
export default function PrivateCommentArtifact() {
  return (
    <div className={styles.root} data-artifact="private-comment">
      <div className={styles.pageBlock} aria-hidden="true" />

      <div className={styles.rightTop} aria-hidden="true">
        <div className={styles.dashedBox} />
        <div className={styles.skeletonBlock} />
      </div>

      <div className={styles.rightBars} aria-hidden="true">
        <span className={styles.bar} />
        <span className={`${styles.bar} ${styles.barShort}`} />
        <span className={styles.bar} />
      </div>

      <header className={styles.chrome}>
        <div className={styles.chromeControls}>
          <ChevronLeftIcon size={16} />
          <ChevronRightIcon size={16} />
          <ReloadIcon size={16} />
          <BookmarkIcon size={16} />
        </div>
        <div className={styles.addressBar}>
          <span className={styles.addressText}>{ADDRESS_LABEL}</span>
        </div>
        <div className={styles.chromeControls}>
          <ShareExportIcon size={18} />
          <MenuIcon size={18} />
        </div>
      </header>

      <HeroCommentComposer
        className={styles.composerGroup}
        header={{ label: VISIBLE_TO_LABEL, team: TEAM_LABEL }}
        headerClassName={styles.composerHeaderReveal}
        mention={COMPOSER_MENTION}
        mentionPlacement="start"
        commentText={COMPOSER_TEXT}
        avatar={{ src: COMPOSER_AVATAR_SRC }}
        avatarSide="right"
      />

      <div className={styles.privatePill}>{PRIVATE_MODE_LABEL}</div>

      <div className={styles.toolbar} role="presentation">
        <span className={styles.toolbarLogo}>
          <SuperflowLogo size={32} />
        </span>
        <span className={styles.toolbarDivider} aria-hidden="true" />

        <span className={styles.lockToggle}>
          <span className={styles.lockKnob}>
            <LockIcon size={18} />
          </span>
        </span>
        <span className={styles.commentButton}>
          <CommentBubbleIcon size={18} />
        </span>
        <span className={styles.huddle}>
          <HeadphonesIcon size={22} />
          <ArrowDownIcon size={16} />
        </span>

        <span className={styles.toolbarDivider} aria-hidden="true" />

        <span className={styles.counter}>
          <span className={styles.inboxWrap}>
            <InboxIcon size={22} />
            <span className={styles.inboxDot} aria-hidden="true" />
          </span>
          <span className={styles.countText}>{INBOX_COUNT}</span>
        </span>
        <span className={styles.counter}>
          <AlertTriangleIcon size={19} />
          <span className={styles.countText}>{ALERT_COUNT}</span>
        </span>

        <span className={styles.toolbarDivider} aria-hidden="true" />

        <span className={styles.toolbarIconButton}>
          <ShareIcon size={22} />
        </span>
        <span className={styles.toolbarAvatar} aria-hidden="true" />
        <span className={styles.toolbarIconButton}>
          <DotsVerticalIcon size={22} />
        </span>
      </div>

      <div className={styles.frame} aria-hidden="true" />
    </div>
  );
}
