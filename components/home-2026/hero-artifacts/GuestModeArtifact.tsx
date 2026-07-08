import type { ReactNode, SVGProps } from "react";
import styles from "./GuestModeArtifact.module.css";
import HeroCommentComposer from "./CommentComposer";

/**
 * Hero tab artifact — "Guest Mode".
 * Figma: node 754:2924 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * Recreates, as a static visual mock, the browser window a guest sees on a
 * Superflow-enabled site: a chrome bar with navigation icons + a "YOUR-SITE.COM"
 * address pill, a dashed selection region beside gray skeleton content, a
 * floating comment composer ("Client here! Can we change this ima"), a
 * "You are a guest / Login" pill and the Superflow floating toolbar.
 *
 * Every glyph below is inlined from the exact Figma vector geometry (exported
 * as SVG from node 754:2924) so the icons match the design pixel-for-pixel;
 * each icon's `viewBox` windows into its native Figma coordinate cell.
 *
 * The root element is the white inner card; the shared `.window` frame in
 * {@link HeroWorkflowShowcase} supplies the surrounding 2px black reveal.
 */

const ADDRESS_TEXT = "YOUR-SITE.COM";
const GUEST_TEXT = "You are a guest";
const LOGIN_TEXT = "Login";
const INBOX_COUNT = "24";
const ALERT_COUNT = "4";

/** A locally-drawn SVG icon accepting a pixel size plus native SVG props. */
type LocalIconProps = SVGProps<SVGSVGElement> & { size?: number };

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
 * Left chevron — the browser "back" affordance (Figma node 759:3621).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ChevronLeftIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="0 0 16 16" strokeWidth={1.11111} {...props}>
      <path d="M10 4L6 8L10 12" />
    </StrokeIcon>
  );
}

/**
 * Right chevron — the browser "forward" affordance (Figma node 759:3623).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ChevronRightIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="28 0 16 16" strokeWidth={1.11111} {...props}>
      <path d="M34 4L38 8L34 12" />
    </StrokeIcon>
  );
}

/**
 * Circular reload arrow — the browser "refresh" affordance (node 759:3625).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ReloadIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="56 0 16 16" strokeWidth={1.11111} {...props}>
      <path d="M69.2894 8.69399C69.1635 9.65396 68.7786 10.5616 68.1761 11.3194C67.5736 12.0773 66.7762 12.6569 65.8693 12.996C64.9625 13.3351 63.9804 13.421 63.0285 13.2444C62.0765 13.0678 61.1906 12.6354 60.4657 11.9935C59.7409 11.3517 59.2044 10.5247 58.9138 9.60109C58.6232 8.67753 58.5896 7.69229 58.8164 6.75105C59.0432 5.8098 59.522 4.94805 60.2013 4.25823C60.8807 3.5684 61.735 3.07651 62.6727 2.83532C65.272 2.16866 67.9627 3.50666 68.956 5.99999M69.3346 2.66663V5.99996H66.0013" />
    </StrokeIcon>
  );
}

/**
 * Bookmark ribbon — the browser "save page" affordance (node 759:3627).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function BookmarkIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="84 0 16 16" strokeWidth={1.11111} {...props}>
      <path d="M96 4.66667V14L92 11.3333L88 14V4.66667C88 3.95942 88.281 3.28115 88.781 2.78105C89.2811 2.28095 89.9594 2 90.6667 2H93.3333C94.0406 2 94.7189 2.28095 95.219 2.78105C95.719 3.28115 96 3.95942 96 4.66667Z" />
    </StrokeIcon>
  );
}

/**
 * Box-with-up-arrow share glyph on the right of the chrome bar (node 759:3617).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ShareBoxIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="0 0 18 18" strokeWidth={1.5} {...props}>
      <path d="M6 6.75H5.25C4.85218 6.75 4.47064 6.90804 4.18934 7.18934C3.90804 7.47064 3.75 7.85218 3.75 8.25V14.25C3.75 14.6478 3.90804 15.0294 4.18934 15.3107C4.47064 15.592 4.85218 15.75 5.25 15.75H12.75C13.1478 15.75 13.5294 15.592 13.8107 15.3107C14.092 15.0294 14.25 14.6478 14.25 14.25V8.25C14.25 7.85218 14.092 7.47064 13.8107 7.18934C13.5294 6.90804 13.1478 6.75 12.75 6.75H12M9 10.5V2.25M11.25 4.5L9 2.25L6.75 4.5" />
    </StrokeIcon>
  );
}

/**
 * Hamburger glyph — the chrome bar menu (Figma node 759:3615).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function MenuIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="30 0 18 18" strokeWidth={1.5} {...props}>
      <path d="M33 4.5H45M33 9H45M33 13.5H45" />
    </StrokeIcon>
  );
}

/**
 * Rounded speech bubble with a pointed bottom-left corner — the toolbar's
 * active comment button glyph (Figma node 759:3879).
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
 * Headphones glyph — the toolbar's huddle control (Figma node 759:3544).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function HuddleIcon(props: LocalIconProps) {
  return (
    <StrokeIcon
      viewBox="52 4 24 24"
      strokeWidth={1.7}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      {...props}
    >
      <path d="M55.8672 16.9896V14.818C55.8672 10.5002 59.3674 7 63.6852 7C68.0029 7 71.5031 10.5002 71.5031 14.818V17.5716" />
      <path d="M55 20.8987V19.6326C55 17.7136 56.5557 16.158 58.4747 16.158C59.4342 16.158 60.212 16.9358 60.212 17.8953V22.636C60.212 23.5955 59.4342 24.3734 58.4747 24.3734C56.5557 24.3734 55 22.8177 55 20.8987Z" />
      <path d="M72.375 20.8987V19.6326C72.375 17.7136 70.8193 16.158 68.9003 16.158C67.9408 16.158 67.163 16.9358 67.163 17.8953V22.636C67.163 23.5955 67.9408 24.3733 68.9003 24.3733C70.8193 24.3733 72.375 22.8177 72.375 20.8987Z" />
    </StrokeIcon>
  );
}

/**
 * Small filled chevron beside the huddle control (Figma node 759:3545).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function HuddleArrowIcon(props: LocalIconProps) {
  return (
    <FillIcon viewBox="76 8 16 16" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M86.8047 14.5286C86.5444 14.2682 86.1223 14.2682 85.8619 14.5286L84 16.3905L82.1381 14.5286C81.8777 14.2682 81.4556 14.2682 81.1953 14.5286C80.9349 14.7889 80.9349 15.2111 81.1953 15.4714L83.5286 17.8047C83.7889 18.0651 84.2111 18.0651 84.4714 17.8047L86.8047 15.4714C87.0651 15.2111 87.0651 14.7889 86.8047 14.5286Z"
      />
    </FillIcon>
  );
}

/**
 * Inbox tray glyph — the toolbar's inbox button (Figma node 759:3549).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function InboxIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="12 4 24 24" strokeWidth={1.5} {...props}>
      <path d="M14.25 17.5H18.11C18.5278 17.5001 18.9373 17.6165 19.2927 17.8363C19.648 18.056 19.9352 18.3703 20.122 18.744L20.378 19.256C20.5649 19.6299 20.8522 19.9443 21.2078 20.164C21.5633 20.3837 21.973 20.5001 22.391 20.5H25.609C26.027 20.5001 26.4367 20.3837 26.7922 20.164C27.1478 19.9443 27.4351 19.6299 27.622 19.256L27.878 18.744C28.0649 18.3701 28.3522 18.0557 28.7078 17.836C29.0633 17.6163 29.473 17.4999 29.891 17.5H33.75M14.25 17.838V22C14.25 22.5967 14.4871 23.169 14.909 23.591C15.331 24.0129 15.9033 24.25 16.5 24.25H31.5C32.0967 24.25 32.669 24.0129 33.091 23.591C33.5129 23.169 33.75 22.5967 33.75 22V17.838C33.75 17.614 33.716 17.391 33.65 17.177L31.24 9.338C31.0985 8.87824 30.8133 8.47595 30.4264 8.19015C30.0394 7.90435 29.5711 7.75009 29.09 7.75H18.911C18.4299 7.75009 17.9616 7.90435 17.5746 8.19015C17.1877 8.47595 16.9025 8.87824 16.761 9.338L14.35 17.177C14.2839 17.3911 14.2502 17.6139 14.25 17.838Z" />
    </StrokeIcon>
  );
}

/**
 * Warning triangle glyph — the toolbar's alerts button (Figma node 759:3557).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function AlertTriangleIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="81 6.5 19 19" strokeWidth={1.58333} {...props}>
      <path d="M90.5026 13.6251V16.7918M90.5026 19.1668H90.5105M89.2062 9.34294L82.789 20.0574C82.6567 20.2865 82.5867 20.5462 82.5859 20.8107C82.5852 21.0753 82.6537 21.3354 82.7847 21.5653C82.9157 21.7951 83.1045 21.9867 83.3325 22.1209C83.5605 22.2551 83.8196 22.3273 84.0842 22.3302H96.9202C97.1847 22.3272 97.4437 22.255 97.6715 22.1208C97.8994 21.9867 98.0882 21.7952 98.2192 21.5655C98.3501 21.3357 98.4187 21.0757 98.418 20.8113C98.4174 20.5469 98.3475 20.2872 98.2154 20.0582L91.7982 9.34215C91.6631 9.1193 91.473 8.93503 91.2459 8.80714C91.0189 8.67925 90.7628 8.61206 90.5022 8.61206C90.2416 8.61206 89.9855 8.67925 89.7585 8.80714C89.5315 8.93503 89.3413 9.1193 89.2062 9.34215V9.34294Z" />
    </StrokeIcon>
  );
}

/**
 * Connected-nodes share glyph — the toolbar's share button (node 759:3566).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function ShareNodesIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox="4 4 24 24" strokeWidth={1.5} {...props}>
      <path d="M13.0277 14.8299L18.9677 11.7699M13.0277 17.1699L18.9677 20.2299M7.89844 15.9999C7.89844 16.716 8.1829 17.4027 8.68925 17.9091C9.1956 18.4154 9.88235 18.6999 10.5984 18.6999C11.3145 18.6999 12.0013 18.4154 12.5076 17.9091C13.014 17.4027 13.2984 16.716 13.2984 15.9999C13.2984 15.2838 13.014 14.5971 12.5076 14.0907C12.0013 13.5844 11.3145 13.2999 10.5984 13.2999C9.88235 13.2999 9.1956 13.5844 8.68925 14.0907C8.1829 14.5971 7.89844 15.2838 7.89844 15.9999ZM18.6984 10.5999C18.6984 11.316 18.9829 12.0027 19.4892 12.5091C19.9956 13.0154 20.6824 13.2999 21.3984 13.2999C22.1145 13.2999 22.8013 13.0154 23.3076 12.5091C23.814 12.0027 24.0984 11.316 24.0984 10.5999C24.0984 9.88382 23.814 9.19706 23.3076 8.69071C22.8013 8.18437 22.1145 7.8999 21.3984 7.8999C20.6824 7.8999 19.9956 8.18437 19.4892 8.69071C18.9829 9.19706 18.6984 9.88382 18.6984 10.5999ZM18.6984 21.3999C18.6984 22.116 18.9829 22.8027 19.4892 23.3091C19.9956 23.8154 20.6824 24.0999 21.3984 24.0999C22.1145 24.0999 22.8013 23.8154 23.3076 23.3091C23.814 22.8027 24.0984 22.116 24.0984 21.3999C24.0984 20.6838 23.814 19.9971 23.3076 19.4907C22.8013 18.9844 22.1145 18.6999 21.3984 18.6999C20.6824 18.6999 19.9956 18.9844 19.4892 19.4907C18.9829 19.9971 18.6984 20.6838 18.6984 21.3999Z" />
    </StrokeIcon>
  );
}

/**
 * Vertical three-dot glyph — the toolbar's overflow menu (node 759:3571).
 *
 * @param props - Local icon props.
 * @returns The rendered icon.
 */
function DotsVerticalIcon(props: LocalIconProps) {
  return (
    <FillIcon viewBox="44 4 24 24" {...props}>
      <path d="M54 23C54 24.1 54.9 25 56 25C57.1 25 58 24.1 58 23C58 21.9 57.1 21 56 21C54.9 21 54 21.9 54 23ZM54 9C54 10.1 54.9 11 56 11C57.1 11 58 10.1 58 9C58 7.9 57.1 7 56 7C54.9 7 54 7.9 54 9ZM54 16C54 17.1 54.9 18 56 18C57.1 18 58 17.1 58 16C58 14.9 57.1 14 56 14C54.9 14 54 14.9 54 16Z" />
    </FillIcon>
  );
}

/**
 * The Superflow brand mark — four brand-colored petals (Figma node 759:3529).
 *
 * @param props - Local icon props.
 * @returns The rendered mark.
 */
function SuperflowMark({ size = 24, ...rest }: LocalIconProps) {
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
 * Render the browser chrome bar (navigation icons, address pill, actions).
 *
 * @returns The chrome bar element.
 */
function ChromeBar() {
  return (
    <div className={styles.chrome}>
      <div className={styles.chromeNav}>
        <ChevronLeftIcon size={16} />
        <ChevronRightIcon size={16} className={styles.chromeForward} />
        <ReloadIcon size={16} />
        <BookmarkIcon size={16} />
      </div>
      <div className={styles.address}>
        <span className={styles.addressText}>{ADDRESS_TEXT}</span>
      </div>
      <div className={styles.chromeActions}>
        <ShareBoxIcon size={18} />
        <MenuIcon size={18} />
      </div>
    </div>
  );
}

/**
 * Render the dashed selection region alongside the gray skeleton content that
 * fills the mocked guest page body.
 *
 * @returns The page-body element group.
 */
function PageBody() {
  return (
    <>
      <div className={styles.dashedRegion} />
      <div className={styles.skeletonTop}>
        <div className={styles.skelBlock} />
        <div className={`${styles.skelBlock} ${styles.skelBlockNarrow}`} />
      </div>
      <div className={styles.skeletonBottom}>
        <div className={styles.skelLine} />
        <div className={`${styles.skelLine} ${styles.skelLineNarrow}`} />
        <div className={styles.skelLine} />
      </div>
    </>
  );
}

/** A toolbar button paired with a count label (inbox / alerts). */
type CountedToolButton = {
  icon: ReactNode;
  count: string;
};

/**
 * Render the Superflow floating toolbar with the brand mark, comment/huddle
 * controls, inbox + alert counters and the share/overflow actions.
 *
 * @returns The floating toolbar element.
 */
function FloatingToolbar() {
  const inboxButton: CountedToolButton = {
    icon: (
      <span className={styles.inboxWrap}>
        <InboxIcon size={24} />
        <span className={styles.inboxDot} aria-hidden="true" />
      </span>
    ),
    count: INBOX_COUNT,
  };
  const alertButton: CountedToolButton = {
    icon: <AlertTriangleIcon size={19} />,
    count: ALERT_COUNT,
  };

  return (
    <div className={styles.toolbar}>
      <span className={styles.logoMark}>
        <SuperflowMark size={28} />
      </span>
      <span className={styles.toolbarDivider} aria-hidden="true" />
      <span className={styles.toolCommentBtn}>
        <CommentBubbleIcon size={18} />
      </span>
      <span className={styles.toolBtn}>
        <HuddleIcon size={24} />
        <HuddleArrowIcon size={16} />
      </span>
      <span className={styles.toolbarDivider} aria-hidden="true" />
      {[inboxButton, alertButton].map((toolButton) => (
        <span key={`count-${toolButton?.count}`} className={styles.toolBtn}>
          {toolButton?.icon}
          <span className={styles.count}>{toolButton?.count}</span>
        </span>
      ))}
      <span className={styles.toolbarDivider} aria-hidden="true" />
      <span className={styles.toolIconBtn}>
        <ShareNodesIcon size={24} />
      </span>
      <span className={styles.toolIconBtn}>
        <DotsVerticalIcon size={24} />
      </span>
    </div>
  );
}

/**
 * Render the "Guest Mode" hero artifact.
 *
 * @returns The Guest Mode window contents.
 */
export default function GuestModeArtifact() {
  return (
    <div className={styles.root} data-artifact="guest-mode">
      <ChromeBar />
      <PageBody />
      <HeroCommentComposer className={styles.popover} />
      <div className={styles.guestPill}>
        <span className={styles.guestPillText}>{GUEST_TEXT}</span>
        <span className={styles.loginButton}>{LOGIN_TEXT}</span>
      </div>
      <FloatingToolbar />
    </div>
  );
}
