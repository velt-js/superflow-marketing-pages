import type { ReactNode } from "react";
import styles from "./IntegrationsArtifact.module.css";
import HeroCommentComposer from "./CommentComposer";

/**
 * Hero tab artifact — "Integrations".
 * Figma: node 758:3037 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * A static, chrome-less composition rendered on the white inner card: a comment
 * composer popover on the left, a curved SVG connector, and a Kanban board on
 * the right whose integration-logo row + "Open" / "In Progress" columns bleed
 * off the right edge (clipped by the root's `overflow: hidden`).
 *
 * The root element is the white inner card; the shared `.window` frame in
 * {@link HeroWorkflowShowcase} supplies the surrounding 2px black reveal, so no
 * browser chrome or workspace rail is drawn here.
 */

const MENTION = "@Mark";
const REPLY_LABEL = "1 Reply";
const EDITED_LABEL = "(EDITED)";
const ONLY_VISIBLE_TO = "Only visible to";
const YOUR_TEAM = "Your Team";
const COMPOSER_TEXT = "Lets update the image ";
/* Composer header — the navy "Visible to → Only your Team" strip. */
const COMPOSER_VISIBLE_TO = "Visible to";
const COMPOSER_TEAM = "Only your Team";
const OPEN_LABEL = "Open";
const IN_PROGRESS_LABEL = "In Progress";
const IN_PROGRESS_STATUS = "In progress";

/* Two-way sync demo — the reply added on the Kanban board that syncs back into
   the comment on the left. */
const REPLY_AUTHOR = "Mark";
const REPLY_INITIAL = "M";
const REPLY_TIME = "now";
const REPLY_BODY = "On it! Updating the image now";
const SYNCED_LABEL = "Synced";

/* The left composer submits into this posted comment; its body matches the
   composer draft and the board's "Lets update the image" card. */
const COMMENT_AUTHOR = "Emma";
const COMMENT_INITIAL = "E";
const COMMENT_TIME = "now";

/* Curved connector geometry, shared by the drawn stroke and both "sync" pulses:
   a forward pulse (composer → board, Phase 1) and a reverse pulse
   (board → composer, Phase 2) travel this same path in opposite directions. */
const CONNECTOR_PATH = "M0 180 H44 Q68 180 68 156 V28 Q68 4 92 4 H162";

/** Size (px) accepted by every local inline glyph. */
type GlyphProps = {
  /** Rendered width/height in pixels. */
  size: number;
};

/** Props for the shared stroked-glyph wrapper. */
type StrokeGlyphProps = GlyphProps & {
  /** Cropped user-space viewBox that frames the exact Figma geometry. */
  viewBox: string;
  /** Stroke width in the viewBox's user units, matching the Figma export. */
  strokeWidth: number;
  /** One or more `<path>` children carrying the exact geometry. */
  children: ReactNode;
};

/**
 * Wrapper for monochrome line glyphs exported from Figma. Renders the exact
 * path geometry with `currentColor` so surrounding CSS controls the color.
 *
 * @param props - viewBox, stroke width, render size, and path children.
 * @returns The inline SVG element.
 */
function StrokeGlyph({ viewBox, strokeWidth, size, children }: StrokeGlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Props for the shared filled-glyph wrapper. */
type FillGlyphProps = GlyphProps & {
  /** Cropped user-space viewBox that frames the exact Figma geometry. */
  viewBox: string;
  /** One or more `<path>` children carrying the exact geometry. */
  children: ReactNode;
};

/**
 * Wrapper for monochrome filled glyphs exported from Figma, drawn with
 * `currentColor` so surrounding CSS controls the color.
 *
 * @param props - viewBox, render size, and path children.
 * @returns The inline SVG element.
 */
function FillGlyph({ viewBox, size, children }: FillGlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Open padlock — composer "Visible to" header (Figma tabler-icon-lock-open-2). */
function LockOpenIcon({ size }: GlyphProps) {
  return (
    <StrokeGlyph viewBox="28 16 16 16" strokeWidth={1.33333} size={size}>
      <path d="M36.6667 23.8333V21.1667C36.6667 20.4594 36.9476 19.7811 37.4477 19.281C37.9478 18.781 38.6261 18.5 39.3333 18.5C40.0406 18.5 40.7189 18.781 41.219 19.281C41.719 19.7811 42 20.4594 42 21.1667V23.8333M30 25.1667C30 24.813 30.1405 24.4739 30.3905 24.2239C30.6406 23.9738 30.9797 23.8333 31.3333 23.8333H38C38.3536 23.8333 38.6928 23.9738 38.9428 24.2239C39.1929 24.4739 39.3333 24.813 39.3333 25.1667V29.1667C39.3333 29.5203 39.1929 29.8594 38.9428 30.1095C38.6928 30.3595 38.3536 30.5 38 30.5H31.3333C30.9797 30.5 30.6406 30.3595 30.3905 30.1095C30.1405 29.8594 30 29.5203 30 29.1667V25.1667ZM34 27.1667C34 27.3435 34.0702 27.513 34.1953 27.6381C34.3203 27.7631 34.4899 27.8333 34.6667 27.8333C34.8435 27.8333 35.013 27.7631 35.1381 27.6381C35.2631 27.513 35.3333 27.3435 35.3333 27.1667C35.3333 26.9899 35.2631 26.8203 35.1381 26.6953C35.013 26.5702 34.8435 26.5 34.6667 26.5C34.4899 26.5 34.3203 26.5702 34.1953 26.6953C34.0702 26.8203 34 26.9899 34 27.1667Z" />
    </StrokeGlyph>
  );
}

/** Closed padlock — private comment header (Figma tabler-icon-lock). */
function LockClosedIcon({ size }: GlyphProps) {
  return (
    <StrokeGlyph viewBox="16 12 16 16" strokeWidth={1.33333} size={size}>
      <path d="M21.332 19.8333V17.1667C21.332 16.4594 21.613 15.7811 22.1131 15.281C22.6132 14.781 23.2915 14.5 23.9987 14.5C24.7059 14.5 25.3842 14.781 25.8843 15.281C26.3844 15.7811 26.6654 16.4594 26.6654 17.1667V19.8333M19.332 21.1667C19.332 20.813 19.4725 20.4739 19.7226 20.2239C19.9726 19.9738 20.3117 19.8333 20.6654 19.8333H27.332C27.6857 19.8333 28.0248 19.9738 28.2748 20.2239C28.5249 20.4739 28.6654 20.813 28.6654 21.1667V25.1667C28.6654 25.5203 28.5249 25.8594 28.2748 26.1095C28.0248 26.3595 27.6857 26.5 27.332 26.5H20.6654C20.3117 26.5 19.9726 26.3595 19.7226 26.1095C19.4725 25.8594 19.332 25.5203 19.332 25.1667V21.1667ZM23.332 23.1667C23.332 23.3435 23.4023 23.513 23.5273 23.6381C23.6523 23.7631 23.8219 23.8333 23.9987 23.8333C24.1755 23.8333 24.3451 23.7631 24.4701 23.6381C24.5951 23.513 24.6654 23.3435 24.6654 23.1667C24.6654 22.9899 24.5951 22.8203 24.4701 22.6953C24.3451 22.5702 24.1755 22.5 23.9987 22.5C23.8219 22.5 23.6523 22.5702 23.5273 22.6953C23.4023 22.8203 23.332 22.9899 23.332 23.1667Z" />
    </StrokeGlyph>
  );
}

/** Downward chevron in the navy visibility chips (Figma tabler-icon-chevron-down). */
function ChevronDownGlyph({ size }: GlyphProps) {
  return (
    <StrokeGlyph viewBox="245 17.5 14 14" strokeWidth={1.16667} size={size}>
      <path d="M248.5 22.75L252 26.25L255.5 22.75" />
    </StrokeGlyph>
  );
}

/** Sports-flag priority glyph — comment priority chip (Figma icons/Sports-flag). */
function FlagIcon({ size }: GlyphProps) {
  return (
    <FillGlyph viewBox="132 28 16 16" size={size}>
      <path d="M135.668 28.6667C135.668 28.2985 135.966 28 136.335 28C136.703 28 137.001 28.2985 137.001 28.6667V43.3333C137.001 43.7015 136.703 44 136.335 44C135.966 44 135.668 43.7015 135.668 43.3333V28.6667Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M140.448 37.3333H135.668V29.3333H139.668C140.539 29.3333 141.28 29.8898 141.554 30.6666H144.844C145.835 30.6666 146.48 31.7097 146.036 32.5962L145.001 34.6666L146.036 36.737C146.48 37.6235 145.835 38.6666 144.844 38.6666H142.335C141.464 38.6666 140.723 38.11 140.448 37.3333ZM137.001 30.6666H139.668C140.036 30.6666 140.335 30.9651 140.335 31.3333V35.9999H137.001V30.6666ZM141.668 36.6666C141.668 37.0348 141.966 37.3333 142.335 37.3333H144.844L143.511 34.6666L144.844 31.9999H141.668V36.6666Z" />
    </FillGlyph>
  );
}

/** Clock ring inside the "Open" / "In progress" status chips (Figma icons/Clock). */
function ClockIcon({ size }: GlyphProps) {
  return (
    <FillGlyph viewBox="36 28 16 16" size={size}>
      <path fillRule="evenodd" clipRule="evenodd" d="M43.9987 41.3333C46.9442 41.3333 49.332 38.9454 49.332 35.9999C49.332 33.0544 46.9442 30.6666 43.9987 30.6666C41.0532 30.6666 38.6654 33.0544 38.6654 35.9999C38.6654 38.9454 41.0532 41.3333 43.9987 41.3333ZM43.9987 42.6666C47.6806 42.6666 50.6654 39.6818 50.6654 35.9999C50.6654 32.318 47.6806 29.3333 43.9987 29.3333C40.3168 29.3333 37.332 32.318 37.332 35.9999C37.332 39.6818 40.3168 42.6666 43.9987 42.6666Z" />
    </FillGlyph>
  );
}

/** Filled dropdown chevron inside the status / priority chips (Figma Arrow Down). */
function ChipChevronIcon({ size }: GlyphProps) {
  return (
    <FillGlyph viewBox="89 24 24 24" size={size}>
      <path d="M105.207 33.7929C104.817 33.4024 104.183 33.4024 103.793 33.7929L101 36.5858L98.2071 33.7929C97.8166 33.4024 97.1834 33.4024 96.7929 33.7929C96.4024 34.1834 96.4024 34.8166 96.7929 35.2071L100.293 38.7071C100.683 39.0976 101.317 39.0976 101.707 38.7071L105.207 35.2071C105.598 34.8166 105.598 34.1834 105.207 33.7929Z" />
    </FillGlyph>
  );
}

/** Hollow circle marking the "Open" board column (Figma tabler-icon-circle). */
function CircleIcon({ size }: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 24 24" strokeWidth={2} size={size}>
      <path d="M3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 10.8181 3.23279 9.64778 3.68508 8.55585C4.13738 7.46392 4.80031 6.47177 5.63604 5.63604C6.47177 4.80031 7.46392 4.13738 8.55585 3.68508C9.64778 3.23279 10.8181 3 12 3C13.1819 3 14.3522 3.23279 15.4442 3.68508C16.5361 4.13738 17.5282 4.80031 18.364 5.63604C19.1997 6.47177 19.8626 7.46392 20.3149 8.55585C20.7672 9.64778 21 10.8181 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442Z" />
    </StrokeGlyph>
  );
}

/** Dashed progress circle marking the "In Progress" column (Figma tabler-icon-progress). */
function ProgressIcon({ size }: GlyphProps) {
  return (
    <StrokeGlyph viewBox="0 0 24 24" strokeWidth={2} size={size}>
      <path d="M9.99953 20.7771C9.12914 20.5797 8.29321 20.2531 7.51953 19.8081M14 3.2229C15.9882 3.67697 17.7632 4.79259 19.0347 6.38711C20.3061 7.98162 20.9984 9.96055 20.9984 11.9999C20.9984 14.0392 20.3061 16.0182 19.0347 17.6127C17.7632 19.2072 15.9882 20.3228 14 20.7769M4.57856 17.093C4.03307 16.3004 3.61876 15.4252 3.35156 14.501M3.125 10.5C3.285 9.55002 3.593 8.65002 4.025 7.82502L4.194 7.52002M6.90625 4.5789C7.8419 3.9348 8.89157 3.47462 9.99925 3.2229" />
    </StrokeGlyph>
  );
}

/** Horizontal three-dot "more" glyph in the card action bar (Figma). */
function DotsIcon({ size }: GlyphProps) {
  return (
    <FillGlyph viewBox="260 26 20 20" size={size}>
      <path d="M264.167 34.332C263.25 34.332 262.5 35.082 262.5 35.9987C262.5 36.9154 263.25 37.6654 264.167 37.6654C265.083 37.6654 265.833 36.9154 265.833 35.9987C265.833 35.082 265.083 34.332 264.167 34.332ZM275.833 34.332C274.917 34.332 274.167 35.082 274.167 35.9987C274.167 36.9154 274.917 37.6654 275.833 37.6654C276.75 37.6654 277.5 36.9154 277.5 35.9987C277.5 35.082 276.75 34.332 275.833 34.332ZM270 34.332C269.083 34.332 268.333 35.082 268.333 35.9987C268.333 36.9154 269.083 37.6654 270 37.6654C270.917 37.6654 271.667 36.9154 271.667 35.9987C271.667 35.082 270.917 34.332 270 34.332Z" />
    </FillGlyph>
  );
}

/** Assign / share glyph — middle card action (Figma). */
function AssignIcon({ size }: GlyphProps) {
  return (
    <FillGlyph viewBox="298 28 16 16" size={size}>
      <path fillRule="evenodd" clipRule="evenodd" d="M302.157 28.5049C302.133 28.51 302.014 28.5301 301.893 28.5497C300.837 28.7205 299.861 29.4524 299.359 30.4502C299.234 30.6989 299.104 31.0831 299.045 31.3784C298.985 31.683 298.985 40.3108 299.045 40.6154C299.188 41.3336 299.517 41.9526 300.029 42.4647C300.436 42.8722 300.894 43.1555 301.419 43.3256C301.899 43.4809 301.991 43.4891 303.259 43.4891H304.434L304.553 43.4104C304.736 43.2893 304.811 43.146 304.811 42.9173C304.811 42.6887 304.736 42.5453 304.553 42.4242L304.434 42.3455L303.273 42.3286C302.052 42.3109 302.025 42.3081 301.632 42.1588C301.1 41.9564 300.534 41.3934 300.338 40.8707C300.167 40.4129 300.178 40.747 300.178 35.9969C300.178 31.2468 300.167 31.5809 300.338 31.1231C300.547 30.5656 301.12 30.0173 301.714 29.8071C302.13 29.6599 302.163 29.6586 305.339 29.6689C308.553 29.6794 308.337 29.6688 308.791 29.8384C309.019 29.9237 309.359 30.1507 309.561 30.3527C309.763 30.5547 309.99 30.8945 310.075 31.1226C310.231 31.5392 310.231 31.5376 310.248 32.8739L310.265 34.1348L310.335 34.2468C310.373 34.3084 310.458 34.3941 310.523 34.4374C310.622 34.5029 310.674 34.516 310.837 34.516C310.999 34.516 311.051 34.5029 311.151 34.4374C311.216 34.3941 311.301 34.3084 311.339 34.2468L311.409 34.1348V32.8593C311.409 31.89 311.399 31.5344 311.368 31.3784C311.09 29.974 310.074 28.9182 308.667 28.5695C308.422 28.5089 308.361 28.5076 305.309 28.5018C303.6 28.4985 302.181 28.4999 302.157 28.5049ZM305.799 30.8673C305.667 30.9076 305.481 31.1014 305.443 31.2372C305.426 31.2998 305.412 31.6244 305.412 31.9734C305.412 32.7316 305.446 32.9349 305.637 33.3284C305.75 33.5613 305.814 33.6484 306.025 33.8593C306.235 34.07 306.323 34.1339 306.555 34.2471C306.967 34.4475 307.166 34.4781 307.984 34.4668L308.657 34.4574L308.775 34.3787C308.959 34.2571 309.033 34.1144 309.033 33.8834C309.033 33.7234 309.02 33.6705 308.955 33.5718C308.911 33.5065 308.826 33.4216 308.764 33.3834C308.656 33.3165 308.625 33.3132 307.948 33.2988C307.315 33.2852 307.231 33.2776 307.111 33.2223C306.916 33.1328 306.774 32.9949 306.681 32.8059C306.6 32.6409 306.599 32.6327 306.585 31.9356C306.571 31.2588 306.567 31.2275 306.501 31.1199C306.362 30.8974 306.058 30.788 305.799 30.8673ZM311.372 35.1497C310.983 35.2144 310.535 35.4264 310.176 35.7155C309.857 35.9717 308.622 37.227 308.452 37.4677C308.282 37.708 308.105 38.0846 308.033 38.3575C307.96 38.6347 307.96 39.2178 308.033 39.4864C308.143 39.8923 308.441 40.3816 308.661 40.5185C308.824 40.6198 309.112 40.6146 309.274 40.5074C309.458 40.3853 309.532 40.2433 309.532 40.0094C309.532 39.8346 309.522 39.8007 309.436 39.6869C309.384 39.6169 309.298 39.474 309.246 39.3691C309.159 39.1949 309.151 39.1559 309.153 38.9146C309.157 38.4126 309.268 38.2459 310.255 37.2696C311.043 36.4885 311.146 36.4117 311.521 36.3176C312.114 36.1688 312.763 36.642 312.821 37.2659C312.853 37.6138 312.721 37.95 312.408 38.3102C312.221 38.527 312.173 38.6446 312.193 38.8468C312.219 39.1185 312.438 39.3292 312.729 39.362C312.83 39.3733 312.894 39.3595 313.014 39.3006C313.342 39.1404 313.785 38.4832 313.928 37.9469C314.08 37.3768 313.988 36.7383 313.677 36.209C313.55 35.9936 313.127 35.5706 312.912 35.444C312.439 35.1662 311.896 35.0624 311.372 35.1497ZM310.423 38.1471C310.352 38.1846 310.255 38.2715 310.206 38.3402C310.129 38.4494 310.118 38.4903 310.118 38.6643C310.118 38.846 310.128 38.8773 310.227 39.021C310.536 39.4698 310.56 39.8775 310.304 40.3344C310.176 40.5636 308.718 42.0217 308.488 42.15C307.995 42.4261 307.485 42.3718 307.117 42.0041C306.836 41.723 306.734 41.3616 306.831 40.9843C306.891 40.75 307.003 40.5523 307.212 40.3107C307.4 40.0939 307.447 39.9764 307.428 39.7742C307.402 39.5024 307.183 39.2917 306.892 39.259C306.791 39.2476 306.727 39.2615 306.607 39.3204C306.279 39.4806 305.835 40.1377 305.692 40.674C305.541 41.2442 305.633 41.8826 305.944 42.4119C306.07 42.6273 306.494 43.0504 306.709 43.177C307.238 43.488 307.877 43.5804 308.447 43.4284C308.693 43.3628 309.077 43.1783 309.307 43.0145C309.528 42.858 310.61 41.8056 310.953 41.4139C311.632 40.64 311.829 39.7239 311.496 38.8919C311.229 38.2242 310.818 37.939 310.423 38.1471Z" />
    </FillGlyph>
  );
}

/** Checkmark — trailing "resolve" card action (Figma). */
function CheckIcon({ size }: GlyphProps) {
  return (
    <FillGlyph viewBox="338 31 12 10" size={size}>
      <path fillRule="evenodd" clipRule="evenodd" d="M349.587 32.0761C349.912 32.4015 349.912 32.9292 349.587 33.2546L342.92 39.9213C342.595 40.2467 342.067 40.2467 341.741 39.9213L338.408 36.588C338.083 36.2625 338.083 35.7349 338.408 35.4094C338.734 35.084 339.261 35.084 339.587 35.4094L342.331 38.1535L348.408 32.0761C348.734 31.7507 349.261 31.7507 349.587 32.0761Z" />
    </FillGlyph>
  );
}

/** Reply arrow used by the "1 Reply" footer action (Figma arrow-back-up). */
function ReplyIcon({ size }: GlyphProps) {
  return (
    <StrokeGlyph viewBox="28 164 16 16" strokeWidth={1.33333} size={size}>
      <path d="M38 173.835L41.3333 170.501L38 167.168" />
      <path d="M30.668 177.833V173.167C30.668 172.459 30.9489 171.781 31.449 171.281C31.9491 170.781 32.6274 170.5 33.3346 170.5H41.3346" />
    </StrokeGlyph>
  );
}

/** Asana — three coral dots masked from a warm radial gradient (exact Figma vector). */
function AsanaLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="38.586 17.925 35.081 35.021" fill="none" aria-hidden="true">
      <defs>
        <radialGradient
          id="integrations-asana"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(56.1473 35.4204) rotate(-90) scale(17.5032 17.5336)"
        >
          <stop stopColor="#FFB900" />
          <stop offset="0.6" stopColor="#F95D8F" />
          <stop offset="0.9991" stopColor="#F95353" />
        </radialGradient>
        <mask
          id="integrations-asana-mask"
          maskUnits="userSpaceOnUse"
          x="38"
          y="17"
          width="36"
          height="36"
        >
          <path fill="#ffffff" d="M63.0922 25.2028C63.0922 29.0331 59.9678 32.1521 56.1308 32.1521C52.2938 32.1521 49.1694 29.0331 49.1694 25.2028C49.1694 21.3724 52.2938 18.2534 56.1308 18.2534C60.0226 18.2534 63.0922 21.3177 63.0922 25.2028ZM47.0864 33.8484C43.2494 33.8484 40.125 36.9674 40.125 40.7978C40.125 44.6282 43.2494 47.7472 47.0864 47.7472C50.9234 47.7472 54.0479 44.6282 54.0479 40.7978C54.0479 36.9674 50.9782 33.8484 47.0864 33.8484ZM65.1752 33.8484C61.3382 33.8484 58.2137 36.9674 58.2137 40.7978C58.2137 44.6282 61.3382 47.7472 65.1752 47.7472C69.0122 47.7472 72.1366 44.6282 72.1366 40.7978C72.1366 36.9674 69.067 33.8484 65.1752 33.8484Z" />
        </mask>
      </defs>
      <g mask="url(#integrations-asana-mask)">
        <path fill="url(#integrations-asana)" d="M56.1265 17.9255C65.8287 17.9255 73.6671 25.7504 73.6671 35.4357C73.6671 45.1211 65.8287 52.9459 56.1265 52.9459C46.4244 52.9459 38.5859 45.1211 38.5859 35.4357C38.6408 25.7504 46.4792 17.9255 56.1265 17.9255Z" />
      </g>
    </svg>
  );
}

/** Trello — blue rounded card with two columns (exact Figma vector). */
function TrelloLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="158.422 18.672 25.756 25.713" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="integrations-trello"
          gradientUnits="userSpaceOnUse"
          x1="171.308"
          y1="44.4446"
          x2="171.308"
          y2="18.6719"
        >
          <stop stopColor="#0052CC" />
          <stop offset="1" stopColor="#2684FF" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" clipRule="evenodd" fill="url(#integrations-trello)" d="M181.133 18.6719H161.467C159.775 18.6719 158.422 20.0252 158.422 21.7169V41.3404C158.422 43.032 159.775 44.3854 161.467 44.3854H181.09C182.782 44.3854 184.135 43.032 184.135 41.3404V21.7592C184.178 20.0252 182.824 18.6719 181.133 18.6719ZM169.502 37.2381C169.502 37.7878 169.037 38.2531 168.487 38.2531H164.216C163.666 38.2531 163.201 37.7878 163.201 37.2381V24.4659C163.201 23.9161 163.666 23.4509 164.216 23.4509H168.53C169.079 23.4509 169.545 23.9161 169.545 24.4659V37.2381H169.502ZM179.441 31.3595C179.441 31.9093 179.018 32.3745 178.426 32.4168C178.426 32.4168 178.426 32.4168 178.384 32.4168H174.112C173.562 32.4168 173.097 31.9516 173.097 31.4018V24.4659C173.097 23.9161 173.562 23.4509 174.112 23.4509H178.426C178.976 23.4509 179.441 23.9161 179.441 24.4659V31.3595Z" />
    </svg>
  );
}

/** Monday.com — three diagonal red / yellow / green marks (exact Figma vector). */
function MondayLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="259.188 11.938 39.188 39.188" fill="none" aria-hidden="true">
      <path fill="#F62B54" d="M263.942 43.2761C262.264 43.2761 260.587 42.345 259.656 40.8552C258.724 39.3654 258.91 37.5032 259.842 36.0134L268.6 22.2329C269.532 20.7431 271.209 19.812 272.887 19.812C274.564 19.812 276.241 20.9294 277.173 22.4191C277.918 23.9089 277.918 25.7711 276.986 27.2609L268.228 41.0414C267.296 42.345 265.619 43.2761 263.942 43.2761Z" />
      <path fill="#FFCC00" d="M279.039 43.2763C277.175 43.2763 275.684 42.3452 274.753 40.8554C274.007 39.1794 274.007 37.3172 274.939 35.8274L283.697 22.0469C284.629 20.5571 286.306 19.626 287.984 19.626C289.847 19.626 291.338 20.7433 292.27 22.2331C293.015 23.7229 293.015 25.5851 291.897 27.0749L283.138 40.8554C282.207 42.3452 280.716 43.2763 279.039 43.2763Z" />
      <path fill="#00CA72" d="M293.758 43.4624C296.228 43.4624 298.23 41.4614 298.23 38.993C298.23 36.5247 296.228 34.5237 293.758 34.5237C291.288 34.5237 289.285 36.5247 289.285 38.993C289.285 41.4614 291.288 43.4624 293.758 43.4624Z" />
    </svg>
  );
}

/** ClickUp — two-tone gradient peaks mark (exact Figma vector). */
function ClickUpLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="362 12.25 37.125 37.125" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="integrations-clickup-a"
          gradientUnits="userSpaceOnUse"
          x1="370.578"
          y1="39.9558"
          x2="392.252"
          y2="39.9558"
        >
          <stop stopColor="#8930FD" />
          <stop offset="1" stopColor="#49CCF9" />
        </linearGradient>
        <linearGradient
          id="integrations-clickup-b"
          gradientUnits="userSpaceOnUse"
          x1="371.049"
          y1="24.9023"
          x2="391.816"
          y2="24.9023"
        >
          <stop stopColor="#FF02F0" />
          <stop offset="1" stopColor="#FFC800" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" clipRule="evenodd" fill="url(#integrations-clickup-a)" d="M370.578 38.49L374.57 35.4094C376.704 38.1741 378.956 39.4774 381.446 39.4774C383.936 39.4774 386.149 38.2136 388.164 35.4489L392.234 38.4505C389.31 42.4 385.674 44.4932 381.446 44.4932C377.257 44.4932 373.582 42.4 370.578 38.49Z" />
      <path fillRule="evenodd" clipRule="evenodd" fill="url(#integrations-clickup-b)" d="M381.444 25.181L374.331 31.3027L371.051 27.4717L381.484 18.5063L391.838 27.4717L388.518 31.2632L381.444 25.181Z" />
    </svg>
  );
}

/** Linear — indigo app tile with the layered mark (exact Figma vector). */
function LinearLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="466.887 19.635 23.667 23.667" fill="none" aria-hidden="true">
      <path fill="#1868DB" d="M466.887 25.5518C466.887 22.284 469.536 19.635 472.804 19.635H484.637C487.905 19.635 490.554 22.284 490.554 25.5518V37.3854C490.554 40.6531 487.905 43.3022 484.637 43.3022H472.804C469.536 43.3022 466.887 40.6531 466.887 37.3854V25.5518Z" />
      <path fill="#ffffff" d="M475.737 34.9435H474.403C472.392 34.9435 470.949 33.7116 470.949 31.9077H478.12C478.491 31.9077 478.732 32.1716 478.732 32.5456V39.7612C476.939 39.7612 475.737 38.3092 475.737 36.2854V34.9435ZM479.278 31.3577H477.945C475.934 31.3577 474.491 30.1478 474.491 28.3439H481.661C482.033 28.3439 482.295 28.5858 482.295 28.9598V36.1754C480.503 36.1754 479.278 34.7235 479.278 32.6996V31.3577ZM482.842 27.7939H481.508C479.497 27.7939 478.054 26.562 478.054 24.7581H485.225C485.596 24.7581 485.837 25.022 485.837 25.374V32.5896C484.044 32.5896 482.842 31.1377 482.842 29.1138V27.7939Z" />
    </svg>
  );
}

/** One integration-logo chip in the board's top row. */
type LogoChip = {
  id: string;
  Logo: (props: { size?: number }) => ReactNode;
  width: number;
  height: number;
  logoSize: number;
};

const LOGO_CHIPS: readonly LogoChip[] = [
  { id: "asana", Logo: AsanaLogo, width: 110, height: 60.5, logoSize: 30 },
  { id: "trello", Logo: TrelloLogo, width: 100, height: 55, logoSize: 28 },
  { id: "monday", Logo: MondayLogo, width: 95, height: 52.25, logoSize: 28 },
  { id: "clickup", Logo: ClickUpLogo, width: 90, height: 49.5, logoSize: 28 },
  { id: "linear", Logo: LinearLogo, width: 85, height: 46.75, logoSize: 26 },
];

/** Visual tone of a comment's status chip. */
type CardStatus = "open" | "progress";

/** Available circular avatar fills. */
type AvatarTone = "orange" | "green" | "gray" | "purple";

/** A reply nested inside a Kanban comment card (the two-way sync payoff). */
type CommentReplyData = {
  author: string;
  time: string;
  avatarTone: AvatarTone;
  /** Initial rendered inside the reply avatar. */
  avatarInitial: string;
  bodyText: string;
};

/** Mark's reply, shown on the board card and synced into the left comment. */
const MARK_REPLY: CommentReplyData = {
  author: REPLY_AUTHOR,
  time: REPLY_TIME,
  avatarTone: "purple",
  avatarInitial: REPLY_INITIAL,
  bodyText: REPLY_BODY,
};

/** Declarative description of one Kanban comment card. */
type CommentCardData = {
  id: string;
  positionClass: string;
  /** Navy "only visible to" strip shown above the card header (private cards). */
  isPrivate?: boolean;
  status: CardStatus;
  avatarTone: AvatarTone;
  /** Initial rendered inside the avatar; omitted for photo placeholders. */
  avatarInitial?: string;
  author: string;
  time: string;
  isEdited?: boolean;
  bodyText: string;
  /** Optional trailing "@mention" highlighted after {@link bodyText}. */
  bodyMention?: string;
  /**
   * Optional reply that animates open inside the card. When present the card
   * reveals this reply (in place of the static "1 Reply" footer) to show a
   * reply being added on the board and synced across to the composer.
   */
  reply?: CommentReplyData;
};

const COMMENT_CARDS: readonly CommentCardData[] = [
  {
    id: "emma",
    positionClass: styles.cardOpenA,
    status: "open",
    avatarTone: "gray",
    author: "Emma",
    time: "2w",
    isEdited: true,
    bodyText: COMPOSER_TEXT,
    bodyMention: MENTION,
    reply: MARK_REPLY,
  },
  {
    id: "guest",
    positionClass: styles.cardOpenB,
    status: "open",
    avatarTone: "orange",
    avatarInitial: "G",
    author: "Guest",
    time: "1h",
    bodyText: "Client here! Can we change this image",
  },
  {
    id: "romulus",
    positionClass: styles.cardProgress,
    isPrivate: true,
    status: "progress",
    avatarTone: "green",
    avatarInitial: "R",
    author: "Romulus",
    time: "2w",
    isEdited: true,
    bodyText: "Can we tone this down ",
    bodyMention: MENTION,
  },
];

const AVATAR_TONE_CLASS: Readonly<Record<AvatarTone, string>> = {
  orange: styles.avatarOrange,
  green: styles.avatarGreen,
  gray: styles.avatarGray,
  purple: styles.avatarPurple,
};

/**
 * Navy "visible to" header strip shared by the composer and private cards.
 *
 * @param props.label - Leading label (e.g. "Visible to").
 * @param props.team - Team name shown inside the trailing chip.
 * @param props.locked - When true, renders a closed padlock; otherwise open.
 * @returns The dark header row.
 */
function VisibilityHeader({
  label,
  team,
  locked,
}: {
  label: string;
  team: string;
  locked: boolean;
}) {
  const VisibilityIcon = locked ? LockClosedIcon : LockOpenIcon;
  return (
    <div className={styles.privateHeader}>
      <VisibilityIcon size={16} />
      <span className={styles.privateLabel}>{label}</span>
      <span className={styles.teamChip}>
        <span className={styles.teamChipText}>{team}</span>
        <ChevronDownGlyph size={14} />
      </span>
    </div>
  );
}

/**
 * The trailing "more actions" cluster (react / edit / resolve) shared by every
 * card header, rendered as static, non-interactive marks.
 *
 * @returns The three round action glyphs.
 */
function CardActions() {
  return (
    <div className={styles.moreGroup}>
      <span className={styles.moreBtn}>
        <DotsIcon size={16} />
      </span>
      <span className={styles.moreBtn}>
        <AssignIcon size={16} />
      </span>
      <span className={styles.moreBtn}>
        <CheckIcon size={16} />
      </span>
    </div>
  );
}

/**
 * A reply that animates open inside a Kanban comment card. Represents a reply
 * added on the connected board tool, revealing to convey the two-way sync.
 *
 * @param props.reply - The reply's author, avatar tone/initial and body text.
 * @returns The nested, revealed reply thread.
 */
function CardReply({ reply, synced = false }: { reply: CommentReplyData; synced?: boolean }) {
  const avatarClass = AVATAR_TONE_CLASS?.[reply?.avatarTone] ?? styles.avatarGray;
  const rootClass = synced ? `${styles.cardReply} ${styles.cardReplySynced}` : styles.cardReply;
  return (
    <div className={rootClass}>
      <div className={styles.threadHead}>
        <span className={`${styles.avatarSm} ${avatarClass}`}>{reply?.avatarInitial ?? ""}</span>
        <span className={styles.threadMeta}>
          <span className={styles.replyAuthor}>{reply?.author}</span>
          <span className={styles.timeAgo}>{reply?.time}</span>
          {synced ? <span className={styles.syncedTag}>{SYNCED_LABEL}</span> : null}
        </span>
      </div>
      <p className={styles.replyBody}>{reply?.bodyText}</p>
    </div>
  );
}

/**
 * Render a single Kanban comment card from its {@link CommentCardData}.
 *
 * @param props.card - The declarative card configuration.
 * @returns The positioned comment card element.
 */
function CommentCard({ card }: { card: CommentCardData }) {
  const statusClass = card?.status === "open" ? styles.statusOpen : styles.statusProgress;
  const statusLabel = card?.status === "open" ? OPEN_LABEL : IN_PROGRESS_STATUS;
  const avatarClass = AVATAR_TONE_CLASS?.[card?.avatarTone] ?? styles.avatarGray;
  return (
    <article className={`${styles.card} ${card?.positionClass}`}>
      {card?.isPrivate ? (
        <VisibilityHeader label={ONLY_VISIBLE_TO} team={YOUR_TEAM} locked={true} />
      ) : null}

      <div className={styles.cardBar}>
        <div className={styles.cardBarGroup}>
          <span className={`${styles.statusChip} ${statusClass}`}>
            <ClockIcon size={16} />
            {statusLabel}
            <ChipChevronIcon size={24} />
          </span>
          <span className={styles.priorityChip}>
            <FlagIcon size={16} />
            <ChipChevronIcon size={24} />
          </span>
        </div>
        <CardActions />
      </div>

      <div className={styles.thread}>
        <div className={styles.threadHead}>
          <span className={`${styles.avatar} ${avatarClass}`}>{card?.avatarInitial ?? ""}</span>
          <span className={styles.threadMeta}>
            <span className={styles.authorName}>{card?.author}</span>
            <span className={styles.timeAgo}>{card?.time}</span>
            {card?.isEdited ? <span className={styles.edited}>{EDITED_LABEL}</span> : null}
          </span>
        </div>
        <p className={styles.commentBody}>
          {card?.bodyText}
          {card?.bodyMention ? <span className={styles.mention}>{card?.bodyMention}</span> : null}
        </p>
      </div>

      {card?.reply ? (
        <CardReply reply={card.reply} />
      ) : (
        <div className={styles.replyRow}>
          <ReplyIcon size={16} />
          <span className={styles.replyText}>{REPLY_LABEL}</span>
        </div>
      )}
    </article>
  );
}

/**
 * The composer's draft submitted into a posted comment. It cross-fades in as the
 * composer sends, and Mark's reply — mirrored from the Kanban board — animates
 * open nested inside it (after a reverse pulse travels the connector) rather than
 * appearing as a detached bubble below the input.
 *
 * @returns The positioned posted comment with its nested synced reply.
 */
function PostedComment() {
  return (
    <article className={styles.postedComment}>
      <div className={styles.cardBar}>
        <div className={styles.cardBarGroup}>
          <span className={`${styles.statusChip} ${styles.statusOpen}`}>
            <ClockIcon size={16} />
            {OPEN_LABEL}
            <ChipChevronIcon size={24} />
          </span>
          <span className={styles.priorityChip}>
            <FlagIcon size={16} />
            <ChipChevronIcon size={24} />
          </span>
        </div>
        <CardActions />
      </div>

      <div className={styles.thread}>
        <div className={styles.threadHead}>
          <span className={`${styles.avatar} ${styles.avatarGray}`}>{COMMENT_INITIAL}</span>
          <span className={styles.threadMeta}>
            <span className={styles.authorName}>{COMMENT_AUTHOR}</span>
            <span className={styles.timeAgo}>{COMMENT_TIME}</span>
          </span>
        </div>
        <p className={styles.commentBody}>
          {COMPOSER_TEXT}
          <span className={styles.mention}>{MENTION}</span>
        </p>
      </div>
      <CardReply reply={MARK_REPLY} synced={true} />
    </article>
  );
}

/**
 * Render the "Integrations" hero artifact.
 *
 * @returns The composer + connector + Kanban board composition.
 */
export default function IntegrationsArtifact() {
  return (
    <div className={styles.root} data-artifact="integrations">
      {/* Fixed-ratio stage holding the desktop-native absolute composition; it
          scales down proportionally (see the container queries in the CSS) so
          the whole composer + board stay visible and centred at any width. */}
      <div className={styles.stage}>
      {/* Curved connector from the composer up into the board; the stroke fades
          from solid near the composer (bottom-left) to transparent at the
          board end (top-right) via a linear-gradient stroke. */}
      <svg
        className={styles.connector}
        viewBox="0 0 162 190"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="integrations-connector"
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
          stroke="url(#integrations-connector)"
          d={CONNECTOR_PATH}
        />
        {/* Phase 1 — forward "sync" pulse: a dot travels composer → board as the
            submitted comment lands on the connected board (keyPoints 0 → 1).
            Begins as the composer sends; its arrival cues the matching board
            card's entrance (see `.cardOpenB` / `integCardLand`). */}
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

        {/* Phase 2 — reverse "sync" pulse: a dot travels back board → composer
            (keyPoints 1 → 0) as the board reply syncs into the comment on the
            left. Delayed until Phase 1 has clearly settled; its arrival cues the
            synced reply reveal (see `.cardReplySynced`). */}
        <circle className={styles.syncPulse} r="4" fill="#625df5" opacity="0">
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.12;0.85;1"
            dur="0.65s"
            begin="2.55s"
            repeatCount="1"
          />
          <animateMotion
            dur="0.65s"
            begin="2.55s"
            repeatCount="1"
            keyPoints="1;0"
            keyTimes="0;1"
            calcMode="linear"
            path={CONNECTOR_PATH}
          />
        </circle>
      </svg>

      {/* Kanban board panel (bleeds off the right edge). */}
      <div className={styles.board} aria-hidden="true" />

      <div className={styles.logos}>
        {LOGO_CHIPS.map((chip) => {
          const ChipLogo = chip?.Logo;
          return (
            <span
              key={chip?.id}
              className={styles.logoChip}
              style={{ width: chip?.width, height: chip?.height }}
            >
              <ChipLogo size={chip?.logoSize} />
            </span>
          );
        })}
      </div>

      <div className={`${styles.columnHeader} ${styles.columnOpen}`}>
        <span className={styles.columnIconOpen}>
          <CircleIcon size={24} />
        </span>
        <h3 className={styles.columnTitle}>{OPEN_LABEL}</h3>
      </div>

      <div className={`${styles.columnHeader} ${styles.columnProgress}`}>
        <span className={styles.columnIconProgress}>
          <ProgressIcon size={24} />
        </span>
        <h3 className={styles.columnTitle}>{IN_PROGRESS_LABEL}</h3>
      </div>

      {COMMENT_CARDS.map((card) => (
        <CommentCard key={card?.id} card={card} />
      ))}

      {/* Fade the clipped board cards into the bottom edge. */}
      <div className={styles.fade} aria-hidden="true" />

      {/* Comment composer popover on the left (shared component); it sends and
          cross-fades into the posted comment below. */}
      <HeroCommentComposer
        className={styles.composer}
        header={{ label: COMPOSER_VISIBLE_TO, team: COMPOSER_TEAM }}
        commentText={COMPOSER_TEXT}
        mention={MENTION}
        avatar={null}
        accent
      />

      {/* The composer's submitted comment, with the board reply synced inside. */}
      <PostedComment />
      </div>
    </div>
  );
}
