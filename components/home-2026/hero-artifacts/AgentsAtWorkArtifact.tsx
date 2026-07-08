import type { ReactElement, ReactNode, SVGProps } from "react";
import Image from "next/image";
import heroStyles from "../Hero.module.css";

/**
 * Hero tab artifact — "Agents at Work".
 * Figma: node 751:1918 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * Renders the QA workflow canvas that sits inside the shared black window
 * frame on the /home-preview hero: a left workspace rail, a header with the
 * workflow title + Share / Run actions, and a dotted-grid canvas showing the
 * site → update → checks node graph.
 *
 * Every icon below is an EXACT inline copy of the corresponding Figma vector
 * (exported as SVG from node 751:1918), so the artifact matches the design
 * pixel-for-pixel. Stroke icons draw with `currentColor` so they inherit the
 * surrounding element's color; the site favicon is self-colored.
 *
 * The root element is the white inner card; the shared `.window` frame in
 * {@link HeroWorkflowShowcase} supplies the surrounding 2px black reveal.
 */

/** Props shared by the locally-defined inline icons. */
type LocalIconProps = SVGProps<SVGSVGElement> & {
  /** Rendered width/height in pixels. */
  size?: number;
};

/** A locally-defined inline icon component. */
type LocalIconComponent = (props: LocalIconProps) => ReactElement;

/** A left-rail workspace icon. */
type RailItem = {
  id: string;
  Icon: LocalIconComponent;
  active?: boolean;
};

/** A check pill in the workflow canvas. */
type WorkflowCheck = {
  label: string;
  Icon: LocalIconComponent;
  className: string;
};

const BRAND_MARK_SRC = "/images/home-2026/hero/superflow-mark.png";
const WORKFLOW_TITLE = "QA First Draft";
const TRIGGERED_BY = "Bob Belcher";
const TRIGGERED_AGO = "2m";
const SITE_NAME = "your-site";
const SITE_TLD = ".com";
const UPDATE_LABEL = "New Update";
const SHARE_LABEL = "Share";
const RUN_LABEL = "Run Workflow";

const RAIL_ICON_SIZE = 16;
const NODE_ICON_SIZE = 20;
const HEADER_ICON_SIZE = 16;
const PILL_ICON_SIZE = 20;

/** Figma icon coordinate systems + stroke weights (kept 1:1 with the export). */
const VIEW_BOX_16 = "0 0 16 16";
const VIEW_BOX_20 = "0 0 20 20";
const STROKE_16 = 1.33333;
const STROKE_20 = 1.66667;
const STROKE_SETTINGS = 1.11111;

/** Rail icon tints from Figma (#9DA1AF idle, near-white on the active chip). */
const RAIL_ICON_COLOR = "#9da1af";
const RAIL_ICON_ACTIVE_COLOR = "#feffff";

/**
 * Shared wrapper for the Tabler-style stroke icons exported from Figma. Draws
 * with `fill: none` + `stroke: currentColor` and rounded caps/joins so each
 * icon only needs to declare its `viewBox`, stroke weight and path geometry.
 *
 * @param props - Native SVG props plus `size`, `viewBox`, `strokeWidth` and the
 *   path children to render.
 * @returns The configured `<svg>` wrapper.
 */
function StrokeIcon({
  size = RAIL_ICON_SIZE,
  viewBox,
  strokeWidth,
  children,
  ...rest
}: LocalIconProps & {
  viewBox: string;
  strokeWidth: number | string;
  children: ReactNode;
}) {
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
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Rail "Home" icon (Figma `home`, node 751:2097). */
function HomeIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M2 6.00065L8 1.33398L14 6.00065V13.334C14 13.6876 13.8595 14.0267 13.6095 14.2768C13.3594 14.5268 13.0203 14.6673 12.6667 14.6673H3.33333C2.97971 14.6673 2.64057 14.5268 2.39052 14.2768C2.14048 14.0267 2 13.6876 2 13.334V6.00065Z" />
      <path d="M6 14.6667V8H10V14.6667" />
    </StrokeIcon>
  );
}

/** Rail analytics icon — three bars (Figma `Frame`, node 751:2101). */
function AnalyticsIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M12 13.3333V6.66663" />
      <path d="M8 13.3333V2.66663" />
      <path d="M4 13.3334V9.33337" />
    </StrokeIcon>
  );
}

/** Rail "Lego" blocks icon (Figma `tabler-icon-lego`, node 751:2129). */
function LegoIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M6.33464 7.33333H6.3413M9.66797 7.33333H9.67464M6.33464 10C6.55189 10.2217 6.8112 10.3979 7.09739 10.5181C7.38357 10.6384 7.69088 10.7003 8.0013 10.7003C8.31173 10.7003 8.61903 10.6384 8.90522 10.5181C9.1914 10.3979 9.45072 10.2217 9.66797 10M4.66797 3.33333H5.33464V2H10.668V3.33333H11.3346C11.8651 3.33333 12.3738 3.54405 12.7488 3.91912C13.1239 4.29419 13.3346 4.8029 13.3346 5.33333V11.3333C13.3346 11.8638 13.1239 12.3725 12.7488 12.7475C12.3738 13.1226 11.8651 13.3333 11.3346 13.3333V14H4.66797V13.3333C4.13754 13.3333 3.62883 13.1226 3.25376 12.7475C2.87868 12.3725 2.66797 11.8638 2.66797 11.3333V5.33333C2.66797 4.8029 2.87868 4.29419 3.25376 3.91912C3.62883 3.54405 4.13754 3.33333 4.66797 3.33333Z" />
    </StrokeIcon>
  );
}

/** Rail active "Checks" icon — double tick (Figma `tabler-icon-checks`, node 751:2121). */
function ChecksIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M4.66536 8.00002L7.9987 11.3334L14.6654 4.66669M1.33203 8.00002L4.66536 11.3334M7.9987 8.00002L11.332 4.66669" />
    </StrokeIcon>
  );
}

/** Rail "User" icon (Figma `tabler-icon-user`, node 751:2109). */
function UserIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M5.33594 4.66667C5.33594 5.37391 5.61689 6.05219 6.11699 6.55229C6.61708 7.05238 7.29536 7.33333 8.0026 7.33333C8.70985 7.33333 9.38813 7.05238 9.88822 6.55229C10.3883 6.05219 10.6693 5.37391 10.6693 4.66667C10.6693 3.95942 10.3883 3.28115 9.88822 2.78105C9.38813 2.28095 8.70985 2 8.0026 2C7.29536 2 6.61708 2.28095 6.11699 2.78105C5.61689 3.28115 5.33594 3.95942 5.33594 4.66667Z" />
      <path d="M12.7613 14.2966C12.7613 14.2966 12.7923 13.8196 12.5932 13.1661C12.394 12.5126 12.0576 11.9091 11.6065 11.396C11.1554 10.8829 10.6 10.4721 9.97734 10.1909C9.3547 9.90976 8.67921 9.76476 7.99602 9.76563C7.31284 9.7665 6.63772 9.9132 6.01579 10.1959C5.39386 10.4787 4.83946 10.891 4.38966 11.4052C3.93986 11.9194 3.60502 12.5237 3.40753 13.1777C3.21005 13.8317 3.24449 14.3087 3.24449 14.3087" />
    </StrokeIcon>
  );
}

/** Rail "Settings" gear icon (Figma `tabler-icon-settings`, node 751:2113). */
function SettingsIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_SETTINGS} {...props}>
      <path d="M6.88333 2.878C7.16733 1.70733 8.83267 1.70733 9.11667 2.878C9.15928 3.05387 9.24281 3.21719 9.36047 3.35467C9.47813 3.49215 9.62659 3.5999 9.79377 3.66916C9.96094 3.73843 10.1421 3.76723 10.3225 3.75325C10.5029 3.73926 10.6775 3.68287 10.832 3.58867C11.8607 2.962 13.0387 4.13933 12.412 5.16867C12.3179 5.3231 12.2616 5.49756 12.2477 5.67785C12.2337 5.85814 12.2625 6.03918 12.3317 6.20625C12.4009 6.37333 12.5085 6.52172 12.6458 6.63937C12.7831 6.75702 12.9463 6.8406 13.122 6.88333C14.2927 7.16733 14.2927 8.83267 13.122 9.11667C12.9461 9.15928 12.7828 9.24281 12.6453 9.36047C12.5079 9.47813 12.4001 9.62659 12.3308 9.79377C12.2616 9.96094 12.2328 10.1421 12.2468 10.3225C12.2607 10.5029 12.3171 10.6775 12.4113 10.832C13.038 11.8607 11.8607 13.0387 10.8313 12.412C10.6769 12.3179 10.5024 12.2616 10.3222 12.2477C10.1419 12.2337 9.96082 12.2625 9.79375 12.3317C9.62667 12.4009 9.47828 12.5085 9.36063 12.6458C9.24298 12.7831 9.1594 12.9463 9.11667 13.122C8.83267 14.2927 7.16733 14.2927 6.88333 13.122C6.84072 12.9461 6.75719 12.7828 6.63953 12.6453C6.52187 12.5079 6.37341 12.4001 6.20623 12.3308C6.03906 12.2616 5.85789 12.2328 5.67748 12.2468C5.49706 12.2607 5.3225 12.3171 5.168 12.4113C4.13933 13.038 2.96133 11.8607 3.588 10.8313C3.68207 10.6769 3.73837 10.5024 3.75232 10.3222C3.76628 10.1419 3.7375 9.96082 3.66831 9.79375C3.59913 9.62667 3.49151 9.47828 3.35418 9.36063C3.21686 9.24298 3.05371 9.1594 2.878 9.11667C1.70733 8.83267 1.70733 7.16733 2.878 6.88333C3.05387 6.84072 3.21719 6.75719 3.35467 6.63953C3.49215 6.52187 3.5999 6.37341 3.66916 6.20623C3.73843 6.03906 3.76723 5.85789 3.75325 5.67748C3.73926 5.49706 3.68287 5.3225 3.58867 5.168C2.962 4.13933 4.13933 2.96133 5.16867 3.588C5.83533 3.99333 6.69933 3.63467 6.88333 2.878Z" />
      <path d="M6 8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6C7.46957 6 6.96086 6.21071 6.58579 6.58579C6.21071 6.96086 6 7.46957 6 8Z" />
    </StrokeIcon>
  );
}

/** Header "Share" icon (Figma `tabler-icon-share`, node 751:1941). */
function ShareIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M5.80013 7.13333L10.2001 4.86666M5.80013 8.86666L10.2001 11.1333M2 8C2 8.53043 2.21071 9.03914 2.58579 9.41421C2.96086 9.78929 3.46957 10 4 10C4.53043 10 5.03914 9.78929 5.41421 9.41421C5.78929 9.03914 6 8.53043 6 8C6 7.46957 5.78929 6.96086 5.41421 6.58579C5.03914 6.21071 4.53043 6 4 6C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8ZM10 4C10 4.53043 10.2107 5.03914 10.5858 5.41421C10.9609 5.78929 11.4696 6 12 6C12.5304 6 13.0391 5.78929 13.4142 5.41421C13.7893 5.03914 14 4.53043 14 4C14 3.46957 13.7893 2.96086 13.4142 2.58579C13.0391 2.21071 12.5304 2 12 2C11.4696 2 10.9609 2.21071 10.5858 2.58579C10.2107 2.96086 10 3.46957 10 4ZM10 12C10 12.5304 10.2107 13.0391 10.5858 13.4142C10.9609 13.7893 11.4696 14 12 14C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12C14 11.4696 13.7893 10.9609 13.4142 10.5858C13.0391 10.2107 12.5304 10 12 10C11.4696 10 10.9609 10.2107 10.5858 10.5858C10.2107 10.9609 10 11.4696 10 12Z" />
    </StrokeIcon>
  );
}

/** Header "Run Workflow" bolt (Figma `tabler-icon-bolt`, node 751:1945, 16px). */
function BoltHeaderIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_16} strokeWidth={STROKE_16} {...props}>
      <path d="M8.66536 2V6.66667H12.6654L7.33203 14V9.33333H3.33203L8.66536 2Z" />
    </StrokeIcon>
  );
}

/** Canvas "New Update" bolt (Figma `tabler-icon-bolt`, node 751:1955, 20px). */
function BoltNodeIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_20} strokeWidth={STROKE_20} {...props}>
      <path d="M10.8307 2.5V8.33333H15.8307L9.16406 17.5V11.6667H4.16406L10.8307 2.5Z" />
    </StrokeIcon>
  );
}

/** Performance pill speedometer (Figma `tabler-icon-brand-speedtest`, node 751:1959). */
function SpeedtestIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_20} strokeWidth={STROKE_20} {...props}>
      <path d="M4.69667 16.1366C3.64779 15.0877 2.93349 13.7514 2.64411 12.2965C2.35473 10.8417 2.50326 9.33367 3.07092 7.96323C3.63858 6.59279 4.59987 5.42145 5.83324 4.59735C7.0666 3.77324 8.51665 3.33337 10 3.33337C11.4834 3.33337 12.9334 3.77324 14.1668 4.59735C15.4001 5.42145 16.3614 6.59279 16.9291 7.96323C17.4968 9.33367 17.6453 10.8417 17.3559 12.2965C17.0665 13.7514 16.3522 15.0877 15.3033 16.1366M13.3333 7.49999L10 10.8333" />
    </StrokeIcon>
  );
}

/** Grammar pill pen (Figma `tabler-icon-ballpen`, node 751:1963). */
function BallpenIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_20} strokeWidth={STROKE_20} {...props}>
      <path d="M11.6654 4.99999L17.4987 10.8333L14.1654 14.1667M3.33203 16.6667L4.80536 15.1933M4.85505 15.1433C5.0739 15.3622 5.33373 15.5359 5.6197 15.6544C5.90567 15.7729 6.21218 15.8338 6.52172 15.8338C6.83126 15.8338 7.13777 15.7729 7.42374 15.6544C7.70971 15.5359 7.96954 15.3622 8.18839 15.1433L17.0101 6.32167C17.1649 6.16689 17.2877 5.98313 17.3715 5.78088C17.4553 5.57862 17.4984 5.36184 17.4984 5.14292C17.4984 4.92399 17.4553 4.70721 17.3715 4.50495C17.2877 4.3027 17.1649 4.11894 17.0101 3.96417L16.0342 2.98833C15.8794 2.8335 15.6957 2.71067 15.4934 2.62687C15.2912 2.54307 15.0744 2.49994 14.8555 2.49994C14.6365 2.49994 14.4198 2.54307 14.2175 2.62687C14.0153 2.71067 13.8315 2.8335 13.6767 2.98833L4.85505 11.81C4.63614 12.0288 4.46249 12.2887 4.34401 12.5746C4.22553 12.8606 4.16455 13.1671 4.16455 13.4767C4.16455 13.7862 4.22553 14.0927 4.34401 14.3787C4.46249 14.6647 4.63614 14.9245 4.85505 15.1433Z" />
    </StrokeIcon>
  );
}

/** Broken-link pill chain (Figma `tabler-icon-link`, node 751:1967). */
function LinkIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_20} strokeWidth={STROKE_20} {...props}>
      <path d="M7.4987 12.5L12.4987 7.49999M9.16536 4.99999L9.5512 4.55332C10.3327 3.77193 11.3926 3.33299 12.4977 3.33307C13.6029 3.33315 14.6627 3.77224 15.4441 4.55374C16.2255 5.33524 16.6644 6.39515 16.6644 7.50028C16.6643 8.60542 16.2252 9.66526 15.4437 10.4467L14.9987 10.8333M10.8321 15L10.5013 15.445C9.71069 16.2268 8.64364 16.6653 7.53173 16.6653C6.41983 16.6653 5.35278 16.2268 4.56215 15.445C4.17245 15.0597 3.86306 14.6008 3.65191 14.0951C3.44076 13.5894 3.33203 13.0468 3.33203 12.4987C3.33203 11.9507 3.44076 11.4081 3.65191 10.9024C3.86306 10.3966 4.17245 9.93782 4.56215 9.55249L4.99882 9.16666" />
    </StrokeIcon>
  );
}

/** SEO pill code-asterisk (Figma `tabler-icon-code-asterisk`, node 751:1971). */
function CodeAsteriskIcon(props: LocalIconProps) {
  return (
    <StrokeIcon viewBox={VIEW_BOX_20} strokeWidth={STROKE_20} {...props}>
      <path d="M5 15.8334C4.55797 15.8334 4.13405 15.6578 3.82149 15.3452C3.50893 15.0326 3.33333 14.6087 3.33333 14.1667V10.8334L2.5 10L3.33333 9.16669V5.83335C3.33333 5.39133 3.50893 4.9674 3.82149 4.65484C4.13405 4.34228 4.55797 4.16669 5 4.16669M10 9.89584L12.5 8.49001M10 9.89584V12.7084M10 9.89584L7.5 8.49001M10 9.89584L12.5 11.3025M10 9.89584V7.08335M10 9.89584L7.5 11.3025M15 15.8334C15.442 15.8334 15.866 15.6578 16.1785 15.3452C16.4911 15.0326 16.6667 14.6087 16.6667 14.1667V10.8334L17.5 10L16.6667 9.16669V5.83335C16.6667 5.39133 16.4911 4.9674 16.1785 4.65484C15.866 4.34228 15.442 4.16669 15 4.16669" />
    </StrokeIcon>
  );
}

/**
 * The `your-site.com` source-node favicon (Figma `tabler-icon-bolt`, node
 * 751:1950). Despite the layer name it is a glossy blue sphere, not a bolt:
 * a `#48A8F0` disc with a blurred dark-blue shadow (top-left) and a blurred
 * white highlight (bottom-right). Self-colored so it keeps its blue tint
 * against the dark node while the label stays white.
 *
 * @param props - Native SVG props plus an optional pixel `size`.
 * @returns The favicon `<svg>`.
 */
function SiteFaviconIcon({ size = NODE_ICON_SIZE, ...rest }: LocalIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <defs>
        <filter
          id="siteFaviconShadow"
          x="-5.625"
          y="-6.25"
          width="26.25"
          height="26.25"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="3.75" />
        </filter>
        <filter
          id="siteFaviconHighlight"
          x="3.125"
          y="2.5"
          width="25"
          height="25"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="3.75" />
        </filter>
        <clipPath id="siteFaviconClip">
          <rect width="20" height="20" rx="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#siteFaviconClip)">
        <rect width="20" height="20" rx="10" fill="#48a8f0" />
        <circle cx="7.5" cy="6.875" r="5.625" fill="#294086" filter="url(#siteFaviconShadow)" />
        <circle cx="15.625" cy="15" r="5" fill="#fefeff" filter="url(#siteFaviconHighlight)" />
      </g>
    </svg>
  );
}

const RAIL_ITEMS: readonly RailItem[] = [
  { id: "home", Icon: HomeIcon },
  { id: "analytics", Icon: AnalyticsIcon },
  { id: "blocks", Icon: LegoIcon },
  { id: "checks", Icon: ChecksIcon, active: true },
  { id: "user", Icon: UserIcon },
  { id: "settings", Icon: SettingsIcon },
];

const WORKFLOW_CHECKS: readonly WorkflowCheck[] = [
  { label: "Performance Check", Icon: SpeedtestIcon, className: heroStyles.pillPerf },
  { label: "Grammar & Spell Check", Icon: BallpenIcon, className: heroStyles.pillGrammar },
  { label: "Broken Link Check", Icon: LinkIcon, className: heroStyles.pillBroken },
  { label: "SEO Best Practices", Icon: CodeAsteriskIcon, className: heroStyles.pillSeo },
];

/**
 * Render the "Agents at Work" hero artifact.
 *
 * @returns The QA workflow window contents.
 */
export default function AgentsAtWorkArtifact() {
  return (
    <div className={heroStyles.windowInner}>
      <nav className={heroStyles.rail} aria-label="Workspace navigation">
        <span className={heroStyles.railItem} aria-hidden="true">
          <Image
            className={heroStyles.railMark}
            src={BRAND_MARK_SRC}
            alt=""
            width={18}
            height={17}
          />
        </span>
        {RAIL_ITEMS.map((item) => {
          const RailIcon = item?.Icon;
          return (
            <button
              key={item?.id}
              type="button"
              className={`${heroStyles.railItem} ${
                item?.active ? heroStyles.railItemActive : ""
              }`}
            >
              <RailIcon
                size={RAIL_ICON_SIZE}
                style={{ color: item?.active ? RAIL_ICON_ACTIVE_COLOR : RAIL_ICON_COLOR }}
              />
            </button>
          );
        })}
      </nav>

      <div className={heroStyles.canvasWrap}>
        <header className={heroStyles.windowHeader}>
          <div>
            <h3 className={heroStyles.windowTitle}>{WORKFLOW_TITLE}</h3>
            <p className={heroStyles.windowMeta}>
              <span className={heroStyles.windowMetaStrong}>{TRIGGERED_BY}</span>
              {" triggered "}
              <span className={heroStyles.windowMetaStrong}>{TRIGGERED_AGO}</span>
              {" ago"}
            </p>
          </div>
          <div className={heroStyles.windowActions}>
            <button type="button" className={`${heroStyles.actionButton} ${heroStyles.actionShare}`}>
              <ShareIcon size={HEADER_ICON_SIZE} />
              {SHARE_LABEL}
            </button>
            <button type="button" className={`${heroStyles.actionButton} ${heroStyles.actionRun}`}>
              <BoltHeaderIcon size={HEADER_ICON_SIZE} />
              {RUN_LABEL}
            </button>
          </div>
        </header>

        <div className={heroStyles.canvas}>
          <div className={heroStyles.canvasSources}>
            <span className={`${heroStyles.node} ${heroStyles.nodeSite}`}>
              <SiteFaviconIcon size={NODE_ICON_SIZE} />
              <span>
                {SITE_NAME}
                <span className={heroStyles.nodeSiteTld}>{SITE_TLD}</span>
              </span>
            </span>
            <span className={heroStyles.connector} aria-hidden="true" />
            <span className={`${heroStyles.node} ${heroStyles.nodeUpdate}`}>
              <BoltNodeIcon size={NODE_ICON_SIZE} />
              {UPDATE_LABEL}
            </span>
          </div>

          <div className={heroStyles.canvasChecks}>
            {WORKFLOW_CHECKS.map((check) => {
              const CheckPillIcon = check?.Icon;
              return (
                <span key={check?.label} className={`${heroStyles.pill} ${check?.className}`}>
                  <CheckPillIcon size={PILL_ICON_SIZE} />
                  {check?.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
