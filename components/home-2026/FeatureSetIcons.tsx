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
