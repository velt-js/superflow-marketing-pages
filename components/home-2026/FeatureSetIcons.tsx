/**
 * Inline SVG icon set for the "04 / Feature Set" section.
 *
 * The Figma design uses Tabler icons; the exact paths are inlined here
 * (24×24 viewBox) so no icon dependency is added. Stroke icons use a 2px
 * round stroke; the few filled icons are listed in FILLED_ICONS. Every icon
 * inherits its colour from the surrounding text via `currentColor`.
 */

/** Tabler path data keyed by the icon name used in the section config. */
const ICON_PATHS = {
  "arrow-right": ["M5 12l14 0", "M13 18l6 -6", "M13 6l6 6"],
  checks: ["M7 12l5 5l10 -10", "M2 12l5 5m5 -5l5 -5"],
  ballpen: [
    "M14 6l7 7l-4 4",
    "M5.828 18.172a2.828 2.828 0 0 0 4 0l10.586 -10.586a2 2 0 0 0 0 -2.829l-1.171 -1.171a2 2 0 0 0 -2.829 0l-10.586 10.586a2.828 2.828 0 0 0 0 4",
    "M4 20l1.768 -1.768",
  ],
  brain: [
    "M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8",
    "M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8",
    "M17.5 16a3.5 3.5 0 0 0 0 -7h-.5",
    "M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0",
    "M6.5 16a3.5 3.5 0 0 1 0 -7h.5",
    "M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10",
  ],
  terminal: ["M5 7l5 5l-5 5", "M12 19l7 0"],
  "lock-open": [
    "M3 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -6",
    "M9 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",
    "M13 11v-4a4 4 0 1 1 8 0v4",
  ],
  click: [
    "M3 12l3 0",
    "M12 3l0 3",
    "M7.8 7.8l-2.2 -2.2",
    "M16.2 7.8l2.2 -2.2",
    "M7.8 16.2l-2.2 2.2",
    "M12 12l9 3l-4 2l-2 4l-3 -9",
  ],
  grain: [
    "M3.5 9.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M8.5 4.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M8.5 14.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M3.5 19.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M13.5 9.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M18.5 4.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M13.5 19.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M18.5 14.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
  ],
  lego: [
    "M9.5 11l.01 0",
    "M14.5 11l.01 0",
    "M9.5 15a3.5 3.5 0 0 0 5 0",
    "M7 5h1v-2h8v2h1a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3v1h-10v-1a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3",
  ],
  plug: [
    "M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054",
    "M4 20l3.5 -3.5",
    "M15 4l-3.5 3.5",
    "M20 9l-3.5 3.5",
  ],
  "layout-sidebar-left-expand": [
    "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",
    "M9 4v16",
    "M14 10l2 2l-2 2",
  ],
  "layout-dashboard": [
    "M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1",
    "M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1",
    "M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1",
    "M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1",
  ],
  settings: [
    "M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033",
    "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  ],
  bolt: ["M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"],
  "dots-vertical": [
    "M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
  ],
  history: ["M12 8l0 4l2 2", "M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"],
  refresh: [
    "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4",
    "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4",
  ],
  sparkles: [
    "M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6",
  ],
  "player-play": [
    "M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z",
  ],
  share: [
    "M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
    "M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
    "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
    "M8.7 10.7l6.6 -3.4",
    "M8.7 13.3l6.6 3.4",
  ],
  "brand-speedtest": ["M5.636 19.364a9 9 0 1 1 12.728 0", "M16 9l-4 4"],
  link: [
    "M9 15l6 -6",
    "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464",
    "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463",
  ],
  "code-asterisk": [
    "M6 19a2 2 0 0 1 -2 -2v-4l-1 -1l1 -1v-4a2 2 0 0 1 2 -2",
    "M12 11.875l3 -1.687",
    "M12 11.875v3.375",
    "M12 11.875l-3 -1.687",
    "M12 11.875l3 1.688",
    "M12 8.5v3.375",
    "M12 11.875l-3 1.688",
    "M18 19a2 2 0 0 0 2 -2v-4l1 -1l-1 -1v-4a2 2 0 0 0 -2 -2",
  ],
  "dots-grid": [
    "M3.5 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M10 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M16.5 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M3.5 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M16.5 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M3.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M10 18.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M16.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
  ],
  robot: [
    "M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4",
    "M12 2v2",
    "M9 12v9",
    "M15 12v9",
    "M5 16l4 -2",
    "M15 14l4 2",
    "M9 18h6",
    "M10 8v.01",
    "M14 8v.01",
  ],
  database: [
    "M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0",
    "M4 6v6a8 3 0 0 0 16 0v-6",
    "M4 12v6a8 3 0 0 0 16 0v-6",
  ],
  "message-chatbot": [
    "M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12",
    "M9.5 9h.01",
    "M14.5 9h.01",
    "M9.5 13a3.5 3.5 0 0 0 5 0",
  ],
  "message-circle": [
    "M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1",
  ],
  "message-pin": [
    "M8 9h8",
    "M8 13h6",
    "M12.007 18.596l-4.007 2.404v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5",
    "M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879",
    "M19 18v.01",
  ],
  pin: [
    "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4",
    "M9 15l-4.5 4.5",
    "M14.5 4l5.5 5.5",
  ],
  camera: [
    "M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2",
    "M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0",
  ],
  lock: [
    "M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6",
    "M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",
    "M8 11v-4a4 4 0 1 1 8 0v4",
  ],
  world: [
    "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",
    "M3.6 9h16.8",
    "M3.6 15h16.8",
    "M11.5 3a17 17 0 0 0 0 18",
    "M12.5 3a17 17 0 0 1 0 18",
  ],
  send: [
    "M10 14l11 -11",
    "M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5",
  ],
  "user-check": [
    "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0",
    "M6 21v-2a4 4 0 0 1 4 -4h4",
    "M15 19l2 2l4 -4",
  ],
  devices: [
    "M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10",
    "M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9",
    "M16 9h2",
  ],
  video: [
    "M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4",
    "M3 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8",
  ],
  "list-check": [
    "M3.5 5.5l1.5 1.5l2.5 -2.5",
    "M3.5 11.5l1.5 1.5l2.5 -2.5",
    "M3.5 17.5l1.5 1.5l2.5 -2.5",
    "M11 6l9 0",
    "M11 12l9 0",
    "M11 18l9 0",
  ],
  "circle-check": [
    "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M9 12l2 2l4 -4",
  ],
  route: [
    "M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",
    "M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4",
    "M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5",
  ],
  "layout-kanban": [
    "M4 4l6 0",
    "M14 4l6 0",
    "M4 10a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -8",
    "M14 10a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2",
  ],
  // Artist palette — the branding / white-label glyph, mirrored from
  // PaletteIcon in HeroIcons.tsx so both icon sets stay visually consistent.
  palette: [
    "M12 21a9 9 0 0 1 0 -18a9 8 0 0 1 9 8a4.5 4 0 0 1 -4.5 4h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25",
    "M8.5 10.5a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",
    "M12.5 7.5a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",
    "M16.5 10.5a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",
  ],
  "eye-off": [
    "M10.585 10.587a2 2 0 0 0 2.829 2.828",
    "M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87",
    "M3 3l18 18",
  ],
} as const;

/** Icons drawn as solid fills instead of 2px strokes. */
const FILLED_ICONS: ReadonlySet<string> = new Set(["player-play", "dots-grid"]);

/** Union of every icon name available in this section. */
export type FeatureSetIconName = keyof typeof ICON_PATHS;

interface FeatureSetIconProps {
  name: FeatureSetIconName;
  /** Rendered width & height in pixels. */
  size?: number;
  className?: string;
}

/**
 * Renders a single inline icon. Returns `null` for an unknown name so a
 * mistyped config value never throws at render time.
 *
 * @param props - Icon name, optional pixel size and optional class name.
 */
export function FeatureSetIcon({ name, size = 24, className }: FeatureSetIconProps) {
  const paths = ICON_PATHS?.[name];
  if (!paths) {
    return null;
  }

  const isFilled = FILLED_ICONS.has(name);

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={isFilled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((definition, index) => (
        <path key={`${name}-${index}`} d={definition} />
      ))}
    </svg>
  );
}
