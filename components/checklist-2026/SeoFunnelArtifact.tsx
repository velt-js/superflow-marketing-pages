import styles from "./SeoFunnelArtifact.module.css";

/**
 * Light-mode SEO conversion-funnel artifact for the checklist main-image
 * section. Hand-built replacement for the CMS's dark funnel bitmap
 * (Impressions → SEO Discovery → Browsing → Search → Convert), drawn flat
 * with no shadows: a tapering gradient funnel with the "SEO Discovery"
 * stage highlighted green and its "10% increase" callout.
 */

/** One labelled stage column across the funnel. */
interface FunnelStage {
  id: string;
  label: string;
  /** Tabler icon path data (24 × 24 viewBox, stroke geometry). */
  iconPaths: readonly string[];
  /** Marks the highlighted (green) stage. */
  highlighted?: boolean;
}

/** The five funnel stages, left to right. */
const STAGES: readonly FunnelStage[] = [
  {
    id: "impressions",
    label: "Impressions",
    iconPaths: [
      "M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",
      "M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6",
    ],
  },
  {
    id: "seo-discovery",
    label: "SEO Discovery",
    highlighted: true,
    iconPaths: [
      "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
      "M9 12l2 2l4 -4",
    ],
  },
  {
    id: "browsing",
    label: "Browsing",
    iconPaths: [
      "M7.904 17.563a1.2 1.2 0 0 0 2.228 .308l2.09 -3.093l4.907 4.907a1.067 1.067 0 0 0 1.509 0l1.047 -1.047a1.067 1.067 0 0 0 0 -1.509l-4.907 -4.907l3.113 -2.09a1.2 1.2 0 0 0 -.309 -2.228l-13.582 -3.904l3.904 13.563z",
    ],
  },
  {
    id: "search",
    label: "Search",
    iconPaths: [
      "M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",
      "M21 21l-6 -6",
    ],
  },
  {
    id: "convert",
    label: "Convert",
    iconPaths: ["M3 17l6 -6l4 4l8 -8", "M14 7l7 0l0 7"],
  },
];

/** Copy for the highlighted stage's uplift callout. */
const INCREASE_LABEL = "10% increase";

/** Tabler "trending-up" glyph for the uplift callout. */
const INCREASE_ICON_PATHS = ["M3 17l6 -6l4 4l8 -8", "M14 7l7 0l0 7"] as const;

/**
 * A small Tabler stroke icon rendered from path data, colored via
 * `currentColor` so the parent label sets the tint.
 *
 * @param props.paths - The icon's Tabler path data.
 */
function FunnelStageIcon({ paths }: { paths: readonly string[] }) {
  try {
    return (
      <svg
        className={styles.stageIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The flat SVG funnel: three nested tapering bands sharing one left-to-right
 * gradient (violet → pink → green through the highlighted stage → amber),
 * with a soft green tint band over the SEO Discovery column.
 */
function FunnelBands() {
  try {
    return (
      <svg
        className={styles.funnelSvg}
        viewBox="0 0 1080 380"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sf-seo-funnel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8f8ff5" />
            <stop offset="0.16" stopColor="#ef8cc6" />
            <stop offset="0.22" stopColor="#3ecf8e" />
            <stop offset="0.38" stopColor="#3ecf8e" />
            <stop offset="0.46" stopColor="#f6b264" />
            <stop offset="1" stopColor="#f59f3b" />
          </linearGradient>
        </defs>

        {/* Green tint over the highlighted SEO Discovery column. */}
        <rect x="216" y="0" width="216" height="380" fill="#3ecf8e" opacity="0.08" />

        {/* Column separators. */}
        <g stroke="#e7e7ee" strokeWidth="1">
          <line x1="216" y1="0" x2="216" y2="380" />
          <line x1="432" y1="0" x2="432" y2="380" />
          <line x1="648" y1="0" x2="648" y2="380" />
          <line x1="864" y1="0" x2="864" y2="380" />
        </g>

        {/* Outer band. */}
        <path
          d="M0 40 C200 50 400 95 560 130 C720 158 900 172 1080 176 L1080 204 C900 208 720 222 560 250 C400 285 200 330 0 340 Z"
          fill="url(#sf-seo-funnel)"
          opacity="0.22"
        />
        {/* Middle band. */}
        <path
          d="M0 85 C220 95 400 115 560 145 C720 163 900 175 1080 179 L1080 201 C900 205 720 217 560 235 C400 265 220 285 0 295 Z"
          fill="url(#sf-seo-funnel)"
          opacity="0.45"
        />
        {/* Core band. */}
        <path
          d="M0 135 C240 140 420 150 560 162 C740 172 920 180 1080 182 L1080 198 C920 200 740 208 560 218 C420 230 240 240 0 245 Z"
          fill="url(#sf-seo-funnel)"
          opacity="0.9"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The full funnel artifact: stage labels across the top (highlighted stage
 * in green with its uplift callout) over the flat gradient funnel. Purely
 * decorative — hidden from the accessibility tree.
 */
export default function SeoFunnelArtifact() {
  try {
    return (
      <div className={styles.artifact} aria-hidden="true" data-artifact="seo-funnel">
        <div className={styles.labels}>
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className={
                stage.highlighted
                  ? `${styles.stage} ${styles.stageHighlighted}`
                  : styles.stage
              }
            >
              <span className={styles.stageLabel}>
                <FunnelStageIcon paths={stage.iconPaths} />
                {stage.label}
              </span>
              {stage.highlighted ? (
                <span className={styles.increase}>
                  <FunnelStageIcon paths={INCREASE_ICON_PATHS} />
                  {INCREASE_LABEL}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <FunnelBands />
      </div>
    );
  } catch {
    return null;
  }
}
