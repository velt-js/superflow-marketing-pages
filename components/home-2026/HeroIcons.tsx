import type { ComponentType, SVGProps } from "react";

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

/** Hamburger icon — opens the mobile navigation menu. */
export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </IconBase>
  );
}

/** Close (X) icon — dismisses the mobile navigation menu. */
export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
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

/** Robot icon representing the "Agents at Work" tab. */
export function RobotIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4" />
      <path d="M12 2v2" />
      <path d="M9 12v9" />
      <path d="M15 12v9" />
      <path d="M5 16l4 -2" />
      <path d="M15 14l4 2" />
      <path d="M9 18h6" />
      <path d="M10 8v.01" />
      <path d="M14 8v.01" />
    </IconBase>
  );
}

/** Wand icon representing the "Build Agents" tab. */
export function WandIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 21l15 -15l-3 -3l-15 15l3 3" />
      <path d="M15 6l3 3" />
      <path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
      <path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
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

/** Map-pin icon representing the "Pin an element" comments tab. */
export function PinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21c4 -4 6 -7 6 -10a6 6 0 1 0 -12 0c0 3 2 6 6 10" />
      <path d="M12 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    </IconBase>
  );
}

/** Speech-bubble icon representing threaded comments / discussion tabs. */
export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
      <path d="M8 9h8" />
      <path d="M8 13h6" />
    </IconBase>
  );
}

/** User-with-check icon representing the "Human signs off" tab. */
export function UserCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
      <path d="M15 19l2 2l4 -4" />
    </IconBase>
  );
}

/** Checklist icon representing the "Track it" comments tab. */
export function ListCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 5.5l1.5 1.5l2.5 -2.5" />
      <path d="M3.5 11.5l1.5 1.5l2.5 -2.5" />
      <path d="M3.5 17.5l1.5 1.5l2.5 -2.5" />
      <path d="M11 6h9" />
      <path d="M11 12h9" />
      <path d="M11 18h9" />
    </IconBase>
  );
}

/** Open padlock icon — used by "guest mode" / unlocked-access hero tabs. */
export function LockOpenIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -6" />
      <path d="M9 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M13 11v-4a4 4 0 1 1 8 0v4" />
    </IconBase>
  );
}

/** Kanban columns icon — represents the board / pipeline hero tab. */
export function LayoutKanbanIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4l6 0" />
      <path d="M14 4l6 0" />
      <path d="M4 10a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -8" />
      <path d="M14 10a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2" />
    </IconBase>
  );
}

/** Clock-with-arrow icon — represents history / "learned from reviews" tabs. */
export function HistoryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 8l0 4l2 2" />
      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
    </IconBase>
  );
}

/** Camera icon — represents snapshot / screenshot capture hero tabs. */
export function CameraIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
      <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    </IconBase>
  );
}

/** Video-camera icon — represents recordings / walkthrough hero tabs. */
export function VideoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4" />
      <path d="M3 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8" />
    </IconBase>
  );
}

/** Bar-chart icon — represents analytics / insights hero tabs. */
export function ChartBarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
      <path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
      <path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
      <path d="M4 20h14" />
    </IconBase>
  );
}

/** Palette icon — represents branding / white-label hero tabs. */
export function PaletteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21a9 9 0 0 1 0 -18a9 8 0 0 1 9 8a4.5 4 0 0 1 -4.5 4h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25" />
      <path d="M8.5 10.5a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M12.5 7.5a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M16.5 10.5a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
    </IconBase>
  );
}

/** Sparkles icon — represents AI / suggestion hero tabs. */
export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />
    </IconBase>
  );
}

/** Route / flow icon — represents workflow orchestration hero tabs. */
export function RouteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
      <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4" />
      <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5" />
    </IconBase>
  );
}

/** Eye icon — represents visibility / "the client's view" hero tabs. */
export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
      <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
    </IconBase>
  );
}

/** Eye-off icon — represents hidden / private ("not visible") hero tabs. */
export function EyeOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
      <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
      <path d="M3 3l18 18" />
    </IconBase>
  );
}

/** Devices icon — a monitor beside a phone; represents cross-device review. */
export function DevicesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10" />
      <path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9" />
      <path d="M16 9h2" />
    </IconBase>
  );
}

/** A hero-tab icon component: accepts native SVG props plus an optional size. */
export type HeroTabIconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number }
>;

/**
 * Canonical hero-tab icon registry: maps the CMS-authored icon `name` values
 * (see the `featureHeroTab` schema options) to their rendering component.
 * `world` is intentionally aliased to {@link GlobeIcon}.
 */
export const HERO_TAB_ICONS: Readonly<Record<string, HeroTabIconComponent>> = {
  robot: RobotIcon,
  wand: WandIcon,
  key: KeyIcon,
  lock: LockIcon,
  "lock-open": LockOpenIcon,
  plug: PlugIcon,
  grain: GrainIcon,
  bolt: BoltIcon,
  share: ShareIcon,
  check: CheckIcon,
  ballpen: BallpenIcon,
  link: LinkIcon,
  "code-asterisk": CodeAsteriskIcon,
  speedtest: SpeedtestIcon,
  globe: GlobeIcon,
  world: GlobeIcon,
  lego: LegoIcon,
  "layout-sidebar": LayoutSidebarIcon,
  "layout-dashboard": LayoutDashboardIcon,
  "layout-kanban": LayoutKanbanIcon,
  settings: SettingsIcon,
  pin: PinIcon,
  message: MessageIcon,
  "user-check": UserCheckIcon,
  "list-check": ListCheckIcon,
  history: HistoryIcon,
  camera: CameraIcon,
  video: VideoIcon,
  "chart-bar": ChartBarIcon,
  palette: PaletteIcon,
  sparkles: SparklesIcon,
  route: RouteIcon,
  eye: EyeIcon,
  "eye-off": EyeOffIcon,
  devices: DevicesIcon,
};

/** Fallback icon used when a hero-tab icon name is missing or unknown. */
export const DEFAULT_HERO_TAB_ICON: HeroTabIconComponent = GrainIcon;

/**
 * Resolve a hero-tab icon component from its CMS-authored name, falling back
 * to {@link DEFAULT_HERO_TAB_ICON} when the name is absent or unrecognised.
 *
 * @param name - The icon name from the registry (e.g. "robot", "chart-bar").
 * @returns The icon component to render.
 */
export function resolveHeroTabIcon(
  name: string | null | undefined,
): HeroTabIconComponent {
  try {
    return (name && HERO_TAB_ICONS?.[name]) || DEFAULT_HERO_TAB_ICON;
  } catch {
    return DEFAULT_HERO_TAB_ICON;
  }
}
