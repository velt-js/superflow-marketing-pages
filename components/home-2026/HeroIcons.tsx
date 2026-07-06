import type { SVGProps } from "react";

/**
 * Shared inline SVG icon set for the 2026 Hero section.
 *
 * These mirror the Tabler-style line icons referenced in the Figma design
 * (node 582:1898). All icons draw with `currentColor` so they inherit color
 * from surrounding CSS, and accept the full set of native SVG props.
 */

const DEFAULT_ICON_SIZE = 24;
const STROKE_WIDTH = 2;

type IconProps = SVGProps<SVGSVGElement> & {
  /** Rendered width/height in pixels. Defaults to 24. */
  size?: number;
};

/**
 * Base wrapper that applies the shared Tabler icon attributes (24px grid,
 * rounded stroke caps, no fill) so individual icons only declare their paths.
 */
function IconBase({ size = DEFAULT_ICON_SIZE, children, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
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

/** Downward chevron — used by nav dropdown triggers and the checks toggle. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9l6 6l6 -6" />
    </IconBase>
  );
}

/** Globe / longitude icon shown inside the website URL input. */
export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
    </IconBase>
  );
}

/** Checkmark used inside the "checks to perform" list for selected items. */
export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12l5 5l9 -9" />
    </IconBase>
  );
}

/** Interlocking blocks icon representing the "Agents" tab. */
export function LegoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.5 11l0 -2a1.5 1.5 0 0 1 3 0v.5a1.5 1.5 0 0 0 3 0v1.5" />
      <path d="M6 11h12a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
    </IconBase>
  );
}

/** Key icon representing the "Anonymous Login" tab. */
export function KeyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16.5 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0 -5" />
      <path d="M14.7 11.3l-8.7 8.7l0 -3l-2 0l0 -2l3 -3" />
    </IconBase>
  );
}

/** Padlock icon representing the "Private Comment" tab. */
export function LockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 11m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
      <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
      <path d="M12 15v2" />
    </IconBase>
  );
}

/** Plug icon representing the "Integrations" tab. */
export function PlugIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215z" />
      <path d="M4 20l3.5 -3.5" />
      <path d="M15 4l-3.5 3.5" />
      <path d="M20 9l-3.5 3.5" />
    </IconBase>
  );
}

/** Grain mark — seven filled dots in a 2-3-2 hex layout, per the Figma tab chip. */
export function GrainIcon({ size = DEFAULT_ICON_SIZE, ...rest }: IconProps) {
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
      <circle cx="9" cy="6.5" r="2.1" />
      <circle cx="15" cy="6.5" r="2.1" />
      <circle cx="6" cy="12" r="2.1" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="18" cy="12" r="2.1" />
      <circle cx="9" cy="17.5" r="2.1" />
      <circle cx="15" cy="17.5" r="2.1" />
    </svg>
  );
}

/** Sidebar-expand icon in the product window's left rail. */
export function LayoutSidebarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
      <path d="M9 4v16" />
    </IconBase>
  );
}

/** Dashboard-grid icon in the product window's left rail. */
export function LayoutDashboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h6v8h-6z" />
      <path d="M4 16h6v4h-6z" />
      <path d="M14 12h6v8h-6z" />
      <path d="M14 4h6v4h-6z" />
    </IconBase>
  );
}

/** Settings gear icon in the product window's left rail. */
export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    </IconBase>
  );
}

/** Share icon used on the product window's "Share" button. */
export function ShareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M8.7 10.7l6.6 -3.4" />
      <path d="M8.7 13.3l6.6 3.4" />
    </IconBase>
  );
}

/** Lightning bolt — used on run/trigger actions and workflow source nodes. */
export function BoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />
    </IconBase>
  );
}

/** Speedometer icon for the "Performance Check" workflow node. */
export function SpeedtestIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.636 19.364a9 9 0 1 1 12.728 0" />
      <path d="M12 12l3 -3" />
    </IconBase>
  );
}

/** Pen icon for the "Grammar & Spell Check" workflow node. */
export function BallpenIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 6l4 4l-10 10l-4 0l0 -4z" />
      <path d="M13 7l4 4" />
      <path d="M4 20l4 -4" />
    </IconBase>
  );
}

/** Chain-link icon for the "Broken Link Check" workflow node. */
export function LinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
      <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
    </IconBase>
  );
}

/** Code-with-asterisk icon for the "SEO Best Practices" workflow node. */
export function CodeAsteriskIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M17 8l4 4l-4 4" />
      <path d="M7 8l-4 4l4 4" />
      <path d="M12 8v8" />
      <path d="M9.5 9.5l5 5" />
      <path d="M14.5 9.5l-5 5" />
    </IconBase>
  );
}
