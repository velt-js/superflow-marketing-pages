"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./AnalyticsArtifact.module.css";
import FakeCursor from "./FakeCursor";

/**
 * Feature-section artifact — "Analytics".
 *
 * A stylized Superflow Analytics dashboard window: an app header ("Analytics" +
 * the Overview / For me / People / Past Data tab row + a "Last 7 Days" range
 * pill) over a body chosen by {@link AnalyticsVariant}. The marketing star is
 * the curated insight feed — cards that carry the pattern, what it means, and a
 * one-click action — but the same window also renders the classic dashboard
 * views (a multi-series status line chart, metric cards, ranked project/people
 * lists) so the page reads as one product surfaced different ways.
 *
 * Everything is authored at the product's native type scale and fills the shared
 * feature-panel screen (1204×602) or the wider hero window via the `hero` prop.
 * All motion (chart draw-in, insight cursor press, filter re-curate) is gated
 * behind `prefers-reduced-motion` in the CSS module; the components themselves
 * render a settled state.
 */

/* --------------------------------------------------------------- constants */

/** Shared palette — brand indigo plus the status/severity hues. */
const COLOR_INDIGO = "#5b53f0";
const COLOR_GREEN = "#109534";
const COLOR_AMBER = "#f4ad3b";
const COLOR_ORANGE = "#e0820a";
const COLOR_RED = "#ff5352";
const COLOR_PURPLE = "#a560ff";

/** Product-chrome tab labels (the four real Analytics tabs). */
const CHROME_TABS: readonly string[] = [
  "Overview",
  "For me",
  "People",
  "Past Data",
];

/** Range pill copy shown top-right of the chrome. */
const RANGE_LABEL = "Last 7 Days";

/** Default input/answer strings reused across variants. */
const INSIGHTS_KICKER = "This week";
const INSIGHTS_COUNT_NOTE = "3 curated";

/** Tabler `bolt` — the one-click action button glyph. */
const BOLT_PATHS: readonly string[] = ["M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"];

/** Tabler `pin` — the pin-to-morning-view control glyph. */
const PIN_PATHS: readonly string[] = [
  "M9 4v6l-2 4v2h10v-2l-2 -4v-6",
  "M12 16l0 5",
  "M8 4l8 0",
];

/** Tabler `check` — the applied/settled state glyph. */
const CHECK_PATHS: readonly string[] = ["M5 12l5 5l10 -10"];

/** Tabler `arrow-right` — the lightweight feed action affordance. */
const ARROW_RIGHT_PATHS: readonly string[] = [
  "M5 12l14 0",
  "M13 18l6 -6",
  "M13 6l6 6",
];

/** Tabler `chevron-down` — the range-pill affordance. */
const CHEVRON_PATHS: readonly string[] = ["M6 9l6 6l6 -6"];

/** Tabler `world` — the project-row (site) leading glyph. */
const GLOBE_PATHS: readonly string[] = [
  "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",
  "M3.6 9h16.8",
  "M3.6 15h16.8",
  "M11.5 3a17 17 0 0 0 0 18",
  "M12.5 3a17 17 0 0 1 0 18",
];

/** Tabler `file` — the project-row (document) leading glyph. */
const FILE_PATHS: readonly string[] = [
  "M14 3v4a1 1 0 0 0 1 1h4",
  "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",
];

/* ------------------------------------------------------------- data models */

/** A single big-number metric (stat card or resolution-row entry). */
interface Stat {
  id: string;
  value: string;
  label: string;
}

/** One curated insight: the pattern, what it means, and its one-click action. */
interface Insight {
  id: string;
  accent: string;
  kicker: string;
  /** The headline pattern (accepts inline emphasis). */
  pattern: ReactNode;
  /** The plain-language interpretation ("what it means"). */
  meaning: string;
  /** The one-click action button label. */
  action: string;
}

/** One row of a ranked list (top projects / top people). */
interface RankedRow {
  id: string;
  /** Leading glyph kind, or an initials avatar. */
  lead: "globe" | "file" | "avatar";
  /** Avatar tint + initials (only when `lead === "avatar"`). */
  avatarColor?: string;
  initials?: string;
  label: string;
  /** Right-aligned value (e.g. "3 Open / 0 In Progress", "54s"). */
  value: ReactNode;
}

/** One proportional ranking bar (team load). */
interface RankingRow {
  id: string;
  color: string;
  label: string;
  value: number;
  display: string;
}

/** One line-chart series: a label, colour and per-point values. */
interface LineSeries {
  id: string;
  label: string;
  color: string;
  points: readonly number[];
}

/** A multi-series line chart with shared x-axis labels. */
interface LineChartData {
  title: string;
  xLabels: readonly string[];
  yTicks: readonly number[];
  series: readonly LineSeries[];
}

/* ------------------------------------------------------------- chart data */

/** Overview "Status Graph" — comment status over the last week. */
const OVERVIEW_CHART: LineChartData = {
  title: "Status Graph",
  xLabels: ["07-03", "07-04", "07-05", "07-06", "07-07", "07-08", "07-09", "07-10"],
  yTicks: [7, 5, 3, 1, 0],
  series: [
    { id: "open", label: "Open", color: COLOR_INDIGO, points: [4, 4, 4, 4, 4, 5, 7, 7] },
    { id: "resolved", label: "Resolved", color: COLOR_GREEN, points: [1, 1, 1, 1, 1, 1, 3, 3] },
    { id: "questionable", label: "Questionable", color: COLOR_AMBER, points: [0, 0, 0, 1, 1, 1, 1, 1] },
    { id: "in-progress", label: "In Progress", color: COLOR_ORANGE, points: [0, 0, 1, 1, 1, 1, 1, 1] },
  ],
};

/** Small per-client trend shown on the Customers view. */
const CUSTOMERS_TREND: LineChartData = {
  title: "Rounds by client",
  xLabels: ["W1", "W2", "W3", "W4"],
  yTicks: [8, 4, 0],
  series: [
    { id: "northwind", label: "Northwind", color: COLOR_RED, points: [4, 5, 6, 8] },
    { id: "acme", label: "Acme", color: COLOR_AMBER, points: [3, 3, 4, 4] },
    { id: "globex", label: "Globex", color: COLOR_PURPLE, points: [2, 2, 3, 3] },
  ],
};

/** Overview stat cards. */
const OVERVIEW_STATS: readonly Stat[] = [
  { id: "added", value: "12", label: "Comments Added" },
  { id: "resolved", value: "4", label: "Comments Resolved" },
  { id: "median", value: "23s", label: "Median Response Time" },
  { id: "p90", value: "56s", label: "P90 Response Time" },
];

/** Overview resolution-time row. */
const RESOLUTION_METRICS: readonly Stat[] = [
  { id: "avg", value: "26d 2h", label: "Average Time" },
  { id: "median", value: "1m 5s", label: "Median Time" },
  { id: "fastest", value: "54s", label: "Fastest" },
  { id: "slowest", value: "104d 1h", label: "Slowest" },
  { id: "p90", value: "104d 1h", label: "P90 Resolution" },
];

/** "For me" personal stat cards. */
const FOR_ME_STATS: readonly Stat[] = [
  { id: "added", value: "0", label: "Comments Added" },
  { id: "resolved", value: "1", label: "Comments Resolved" },
  { id: "median", value: " - ", label: "Median Response" },
  { id: "p90", value: " - ", label: "P90 Response" },
];

/** "For me" — projects awaiting your response. */
const FOR_ME_LIST: readonly RankedRow[] = [
  { id: "mkt", lead: "globe", label: "superflow-marketing-pages.vercel.app", value: <><strong>3</strong> Comments</> },
  { id: "lp", lead: "globe", label: "Velt New LP", value: <><strong>1</strong> Comment</> },
  { id: "demo", lead: "file", label: "demo.superflow", value: <><strong>1</strong> Comment</> },
];

/** Overview — top projects by tasks. */
const TOP_PROJECTS: readonly RankedRow[] = [
  { id: "mkt", lead: "globe", label: "superflow-marketing-pages.vercel.app", value: <><strong>3</strong> Open <span className={styles.rankSub}>/ 0 In Progress</span></> },
  { id: "demo", lead: "file", label: "demo.superflow", value: <><strong>2</strong> Open <span className={styles.rankSub}>/ 1 In Progress</span></> },
  { id: "ai", lead: "globe", label: "AI Review Demo", value: <><strong>1</strong> Open <span className={styles.rankSub}>/ 0 In Progress</span></> },
];

/** Customers — per-client rollup rows. */
const CUSTOMERS_LIST: readonly RankedRow[] = [
  { id: "northwind", lead: "avatar", avatarColor: COLOR_RED, initials: "NW", label: "Northwind", value: <><strong>42</strong> rounds <span className={styles.rankSub}>· 7d median</span></> },
  { id: "acme", lead: "avatar", avatarColor: COLOR_AMBER, initials: "AC", label: "Acme", value: <><strong>31</strong> rounds <span className={styles.rankSub}>· 3d median</span></> },
  { id: "globex", lead: "avatar", avatarColor: COLOR_PURPLE, initials: "GX", label: "Globex", value: <><strong>24</strong> rounds <span className={styles.rankSub}>· climbing</span></> },
  { id: "vireo", lead: "avatar", avatarColor: COLOR_INDIGO, initials: "VO", label: "Vireo", value: <><strong>18</strong> rounds <span className={styles.rankSub}>· stalled</span></> },
];

/** Team — review load ranking bars. */
const TEAM_ROWS: readonly RankingRow[] = [
  { id: "web", color: COLOR_INDIGO, label: "Web", value: 46, display: "46%" },
  { id: "brand", color: COLOR_AMBER, label: "Brand", value: 29, display: "29%" },
  { id: "growth", color: COLOR_PURPLE, label: "Growth", value: 17, display: "17%" },
  { id: "seo", color: COLOR_GREEN, label: "SEO", value: 8, display: "8%" },
];

/** The three curated insights of the week (the marketing star). */
const INSIGHTS: readonly Insight[] = [
  {
    id: "rounds",
    accent: COLOR_RED,
    kicker: "Review rounds",
    pattern: (
      <>
        <strong>Northwind</strong> takes 2× the review rounds of any other
        client.
      </>
    ),
    meaning: "Mostly brand-tone copy revisions.",
    action: "Add a Brand-Voice agent",
  },
  {
    id: "risk",
    accent: COLOR_AMBER,
    kicker: "At risk",
    pattern: (
      <>
        <strong>Globex</strong> rounds are climbing: 3 → 5 → 7 this month.
      </>
    ),
    meaning: "Reviews stall after the first pass.",
    action: "Nudge the account",
  },
  {
    id: "load",
    accent: COLOR_INDIGO,
    kicker: "Team load",
    pattern: (
      <>
        The <strong>Web team</strong>{" "}
        is carrying 46% of this week&rsquo;s review.
      </>
    ),
    meaning: "Growth and Brand sit well under half.",
    action: "Rebalance the queue",
  },
];

/** One pinned line in the clean "morning view" document. */
interface MorningItem {
  id: string;
  accent: string;
  text: string;
}

/** The pinned insights that make up the morning-view document, newest first. */
const MORNING_ITEMS: readonly MorningItem[] = [
  { id: "rounds", accent: COLOR_RED, text: "Northwind takes 2× the review rounds" },
  { id: "risk", accent: COLOR_AMBER, text: "Globex rounds climbing: 3 → 5 → 7" },
  { id: "load", accent: COLOR_INDIGO, text: "Web team carrying 46% of review" },
];

/** The filter chips shown on the "Filters that re-curate" view. */
const FILTER_CHIPS: readonly { id: string; label: string; active?: boolean }[] = [
  { id: "range", label: "Last 7 Days", active: true },
  { id: "vertical", label: "All verticals" },
  { id: "compare", label: "vs. prev period" },
];

/* --------------------------------------------------------- chart geometry */

/* The viewbox is authored at roughly the on-screen render width (a ~5:1 letterbox)
   so the SVG scales uniformly to its container — no horizontal stretching of the
   lines or vertex dots. */
const PLOT_WIDTH = 1040;
const PLOT_HEIGHT = 210;
const PAD_LEFT = 34;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;

/**
 * Build a smoothed SVG path (cardinal spline) through a list of points, so the
 * multi-series chart reads like the product's rounded lines rather than sharp
 * polylines.
 *
 * @param points - The `[x, y]` vertices in SVG user units.
 * @returns The `d` attribute string, or an empty string on failure.
 */
function buildSmoothPath(points: readonly (readonly [number, number])[]): string {
  try {
    if (!points || points.length === 0) {
      return "";
    }
    if (points.length < 3) {
      return points
        .map((point, index) => `${index === 0 ? "M" : "L"}${point[0]},${point[1]}`)
        .join(" ");
    }
    const tension = 0.1;
    let path = `M${points[0][0]},${points[0][1]}`;
    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[index - 1] ?? points[index];
      const current = points[index];
      const next = points[index + 1];
      const following = points[index + 2] ?? next;
      const cp1x = current[0] + (next[0] - previous[0]) * tension;
      const cp1y = current[1] + (next[1] - previous[1]) * tension;
      const cp2x = next[0] - (following[0] - current[0]) * tension;
      const cp2y = next[1] - (following[1] - current[1]) * tension;
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${next[0]},${next[1]}`;
    }
    return path;
  } catch {
    return "";
  }
}

/* --------------------------------------------------------------- primitives */

/**
 * 24×24 Tabler-style stroke icon (currentColor stroke, round caps/joins).
 *
 * @param props - Rendered pixel size and the list of path definitions.
 * @returns The configured stroke `<svg>` element, or `null` on failure.
 */
function StrokeGlyph({
  size,
  paths,
}: {
  size: number;
  paths: readonly string[];
}): ReactNode {
  try {
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
      >
        {paths?.map((definition) => (
          <path key={definition} d={definition} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/** Small info "ⓘ" mark shown beside product card titles. */
function InfoDot(): ReactNode {
  try {
    return (
      <span className={styles.infoDot} aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * The Analytics app-window header: the "Analytics" title, the four product tabs
 * (one active) and the "Last 7 Days" range pill. The API-key / user-id inputs
 * from the real product are intentionally omitted.
 *
 * @param props.activeTab - Which of {@link CHROME_TABS} renders as selected.
 * @returns The chrome header element, or `null` on failure.
 */
function AnalyticsChrome({ activeTab }: { activeTab: string }): ReactNode {
  try {
    return (
      <header className={styles.chrome}>
        <div className={styles.chromeTop}>
          <span className={styles.chromeTitle}>Analytics</span>
          <span className={styles.rangePill}>
            {RANGE_LABEL}
            <StrokeGlyph size={14} paths={CHEVRON_PATHS} />
          </span>
        </div>
        <nav className={styles.tabRow} aria-label="Analytics views">
          {CHROME_TABS?.map((tab) => {
            const isActive = tab === activeTab;
            const tabClass = isActive
              ? `${styles.chromeTab} ${styles.chromeTabActive}`
              : styles.chromeTab;
            return (
              <span key={tab} className={tabClass}>
                {tab}
              </span>
            );
          })}
        </nav>
      </header>
    );
  } catch {
    return null;
  }
}

/**
 * A titled white dashboard card wrapper (rounded, hairline border) matching the
 * product's card chrome.
 *
 * @param props.title - Optional card title (rendered with an info mark).
 * @param props.right - Optional right-aligned header slot (e.g. "Top 25 People").
 * @param props.children - The card body.
 * @param props.className - Optional extra class for layout tuning.
 * @returns The card element, or `null` on failure.
 */
function Card({
  title,
  right,
  children,
  className,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactNode {
  try {
    const rootClass = className ? `${styles.card} ${className}` : styles.card;
    return (
      <section className={rootClass}>
        {title || right ? (
          <div className={styles.cardHead}>
            {title ? (
              <h4 className={styles.cardTitle}>
                {title}
                <InfoDot />
              </h4>
            ) : (
              <span />
            )}
            {right ? <span className={styles.cardRight}>{right}</span> : null}
          </div>
        ) : null}
        {children}
      </section>
    );
  } catch {
    return null;
  }
}

/**
 * Render a multi-series line chart (smoothed lines + vertex dots + gridlines +
 * axis labels + legend), sized to a `0 0 PLOT_WIDTH PLOT_HEIGHT` viewbox and
 * scaled fluidly to its container.
 *
 * @param props.data - The chart series + axis config.
 * @param props.compact - Drop the y-axis labels for the small trend variant.
 * @returns The chart element, or `null` on failure.
 */
function LineChart({
  data,
  compact = false,
}: {
  data: LineChartData;
  compact?: boolean;
}): ReactNode {
  try {
    const maxTick = data?.yTicks?.[0] ?? 1;
    const safeMax = maxTick > 0 ? maxTick : 1;
    const plotLeft = compact ? 8 : PAD_LEFT;
    const plotWidth = PLOT_WIDTH - plotLeft - PAD_RIGHT;
    const plotHeight = PLOT_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const columns = data?.xLabels?.length ?? 1;
    const stepX = columns > 1 ? plotWidth / (columns - 1) : 0;

    /**
     * Map a data point to its SVG `[x, y]` coordinate.
     * @param index - Column index of the point.
     * @param value - The point's value.
     * @returns The `[x, y]` coordinate pair.
     */
    const toCoord = (index: number, value: number): [number, number] => {
      const posX = plotLeft + index * stepX;
      const posY = PAD_TOP + plotHeight * (1 - value / safeMax);
      return [posX, posY];
    };

    return (
      <div className={styles.chartWrap}>
        <svg
          className={styles.chartSvg}
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={data?.title}
        >
          {data?.yTicks?.map((tick) => {
            const posY = PAD_TOP + plotHeight * (1 - tick / safeMax);
            return (
              <g key={`tick-${tick}`}>
                <line
                  className={styles.chartGrid}
                  x1={plotLeft}
                  y1={posY}
                  x2={PLOT_WIDTH - PAD_RIGHT}
                  y2={posY}
                />
                {compact ? null : (
                  <text className={styles.chartYLabel} x={plotLeft - 8} y={posY + 3}>
                    {tick}
                  </text>
                )}
              </g>
            );
          })}

          {data?.series?.map((serie) => {
            const coords = serie?.points?.map((value, index) =>
              toCoord(index, value),
            );
            const linePath = buildSmoothPath(coords);
            return (
              <g key={serie?.id}>
                <path
                  className={styles.chartLine}
                  d={linePath}
                  fill="none"
                  stroke={serie?.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {coords?.map((coord, index) => (
                  <circle
                    key={`${serie?.id}-${index}`}
                    className={styles.chartDot}
                    cx={coord[0]}
                    cy={coord[1]}
                    r={2.6}
                    fill={serie?.color}
                  />
                ))}
              </g>
            );
          })}

          {data?.xLabels?.map((label, index) => (
            <text
              key={label}
              className={styles.chartXLabel}
              x={plotLeft + index * stepX}
              y={PLOT_HEIGHT - 6}
              textAnchor={
                index === 0
                  ? "start"
                  : index === columns - 1
                    ? "end"
                    : "middle"
              }
            >
              {label}
            </text>
          ))}
        </svg>

        <div className={styles.chartLegend}>
          {data?.series?.map((serie) => (
            <span key={serie?.id} className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                style={{ background: serie?.color }}
                aria-hidden="true"
              />
              {serie?.label}
            </span>
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * A horizontal strip of big-number stat cards (Comments Added, Resolved, …).
 *
 * @param props.stats - The metrics to render, one card each.
 * @returns The stat-card strip, or `null` on failure.
 */
function StatCards({ stats }: { stats: readonly Stat[] }): ReactNode {
  try {
    return (
      <div className={styles.statCards}>
        {stats?.map((stat) => (
          <div key={stat?.id} className={styles.statCard}>
            <span className={styles.statValue}>{stat?.value}</span>
            <span className={styles.statLabel}>
              {stat?.label}
              <InfoDot />
            </span>
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The "Resolution Time" row — a leading label followed by several inline
 * metrics inside one bordered card.
 *
 * @param props.title - The leading row label.
 * @param props.metrics - The inline metrics.
 * @returns The metric row, or `null` on failure.
 */
function MetricRow({
  title,
  metrics,
}: {
  title: string;
  metrics: readonly Stat[];
}): ReactNode {
  try {
    return (
      <div className={styles.metricRow}>
        <span className={styles.metricRowTitle}>
          {title}
          <InfoDot />
        </span>
        <div className={styles.metricRowItems}>
          {metrics?.map((metric) => (
            <span key={metric?.id} className={styles.metricItem}>
              <span className={styles.metricValue}>{metric?.value}</span>
              <span className={styles.metricLabel}>{metric?.label}</span>
            </span>
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the leading glyph/avatar for a ranked-list row.
 *
 * @param props.row - The row whose lead to render.
 * @returns The lead element, or `null` on failure.
 */
function RankLead({ row }: { row: RankedRow }): ReactNode {
  try {
    if (row?.lead === "avatar") {
      return (
        <span
          className={styles.rankAvatar}
          style={{ background: row?.avatarColor ?? COLOR_INDIGO }}
          aria-hidden="true"
        >
          {row?.initials}
        </span>
      );
    }
    return (
      <span className={styles.rankGlyph} aria-hidden="true">
        <StrokeGlyph
          size={17}
          paths={row?.lead === "file" ? FILE_PATHS : GLOBE_PATHS}
        />
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * A ranked list card body: leading glyph/avatar + label + right-aligned value.
 *
 * @param props.rows - The rows to render.
 * @returns The ranked list, or `null` on failure.
 */
function RankedList({ rows }: { rows: readonly RankedRow[] }): ReactNode {
  try {
    return (
      <div className={styles.rankList}>
        {rows?.map((row) => (
          <div key={row?.id} className={styles.rankRow}>
            <RankLead row={row} />
            <span className={styles.rankLabel}>{row?.label}</span>
            <span className={styles.rankValue}>{row?.value}</span>
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Team-load ranking bars: label + proportional track + percentage.
 *
 * @param props.rows - The ranking rows (sized against the largest value).
 * @returns The ranking bars, or `null` on failure.
 */
function RankingBars({ rows }: { rows: readonly RankingRow[] }): ReactNode {
  try {
    const peak = rows?.reduce((max, row) => Math.max(max, row?.value ?? 0), 0);
    const safePeak = peak > 0 ? peak : 1;
    return (
      <div className={styles.rankingBars}>
        {rows?.map((row) => {
          const widthPercent = Math.round(((row?.value ?? 0) / safePeak) * 100);
          return (
            <div key={row?.id} className={styles.rankingBarRow}>
              <span className={styles.rankingBarLabel}>{row?.label}</span>
              <span className={styles.rankingBarTrack} aria-hidden="true">
                <span
                  className={styles.rankingBarFill}
                  style={{ width: `${widthPercent}%`, background: row?.color }}
                />
              </span>
              <span className={styles.rankingBarValue}>{row?.display}</span>
            </div>
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
}

/** Presentation mode for a single {@link InsightCard}. */
type InsightMode = "static" | "act" | "interpretation";

/**
 * Render one curated insight card: a small kicker, the pattern, what it means,
 * and its next step. The feed uses a light text-link action; `act` swaps in a
 * solid button the cursor presses (flips to "Applied"); `interpretation`
 * highlights the "what it means" line.
 *
 * @param props.insight - The insight content.
 * @param props.mode - Which presentation to render (defaults to `static`).
 * @param props.index - Position in a feed, used to stagger the entrance.
 * @returns The insight card, or `null` on failure.
 */
function InsightCard({
  insight,
  mode = "static",
  index = 0,
}: {
  insight: Insight;
  mode?: InsightMode;
  index?: number;
}): ReactNode {
  try {
    const isSolo = mode !== "static";
    const rootClass = isSolo
      ? `${styles.insightCard} ${styles.insightCardSolo}`
      : styles.insightCard;
    const style = {
      "--insight-accent": insight?.accent,
      "--insight-index": index,
    } as CSSProperties;
    return (
      <article className={rootClass} style={style} data-mode={mode}>
        <div className={styles.insightMain}>
          <span className={styles.insightKicker}>
            <span className={styles.insightDot} aria-hidden="true" />
            {insight?.kicker}
          </span>

          <p className={styles.insightPattern}>{insight?.pattern}</p>

          <p
            className={
              mode === "interpretation"
                ? `${styles.insightMeaning} ${styles.insightMeaningHi}`
                : styles.insightMeaning
            }
          >
            {mode === "interpretation" ? (
              <span className={styles.meaningTag}>What it means</span>
            ) : null}
            {insight?.meaning}
          </p>
        </div>

        <div className={styles.insightFoot}>
          {mode === "act" ? (
            <span className={styles.insightAction}>
              <span className={styles.insightActionDefault}>
                <StrokeGlyph size={15} paths={BOLT_PATHS} />
                {insight?.action}
              </span>
              <span className={styles.insightActionDone}>
                <StrokeGlyph size={15} paths={CHECK_PATHS} />
                Applied
              </span>
              <FakeCursor className={styles.insightCursor} size={24} />
            </span>
          ) : (
            <span className={styles.insightActionLink}>
              {insight?.action}
              <StrokeGlyph size={15} paths={ARROW_RIGHT_PATHS} />
            </span>
          )}
        </div>
      </article>
    );
  } catch {
    return null;
  }
}

/**
 * The clean "morning view" document — the calm surface curated insights get
 * pinned to. A light sheet with a header and a few one-line pinned insights
 * (accent dot + short pattern + pin mark); the freshest line is pinned by the
 * cursor on mount. Deliberately low-chrome and low-text.
 *
 * @returns The morning-view document, or `null` on failure.
 */
function MorningDoc(): ReactNode {
  try {
    return (
      <div className={styles.morningDoc}>
        <div className={styles.morningHead}>
          <span className={styles.morningKicker}>Your morning view</span>
          <span className={styles.morningDate}>Monday · Jul 13</span>
        </div>
        <ul className={styles.morningList}>
          {MORNING_ITEMS?.map((item, index) => (
            <li
              key={item?.id}
              className={styles.morningItem}
              style={
                {
                  "--insight-accent": item?.accent,
                  "--insight-index": index,
                } as CSSProperties
              }
              data-fresh={index === 0 ? "true" : undefined}
            >
              <span className={styles.morningDot} aria-hidden="true" />
              <span className={styles.morningText}>{item?.text}</span>
              <span className={styles.morningPin} aria-hidden="true">
                <StrokeGlyph size={14} paths={PIN_PATHS} />
              </span>
            </li>
          ))}
        </ul>
        <FakeCursor className={styles.pinCursor} size={24} />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- variant body */

/**
 * Every selectable Analytics variant. The key doubles as the `data-artifact`
 * hook and the Feature Set `MOCKS` registry key.
 */
export type AnalyticsVariant =
  | "analytics-overview"
  | "analytics-insights"
  | "analytics-act"
  | "analytics-interpretation"
  | "analytics-customers"
  | "analytics-team"
  | "analytics-for-me"
  | "analytics-pin-dismiss"
  | "analytics-filters";

/** The default variant — the curated insight feed (the marketing star). */
const DEFAULT_VARIANT: AnalyticsVariant = "analytics-insights";

/** Which product chrome tab renders active for each variant. */
const CHROME_TAB_FOR_VARIANT: Readonly<Record<AnalyticsVariant, string>> = {
  "analytics-overview": "Overview",
  "analytics-insights": "Overview",
  "analytics-act": "Overview",
  "analytics-interpretation": "Overview",
  "analytics-customers": "People",
  "analytics-team": "People",
  "analytics-for-me": "For me",
  "analytics-pin-dismiss": "Overview",
  "analytics-filters": "Overview",
};

/**
 * The curated insight feed — a lead line plus the three insight cards. This is
 * the page's visual star, so the hero and the "Insights of the week" tab both
 * render it.
 *
 * @returns The insight feed body.
 */
function InsightsFeedBody(): ReactNode {
  try {
    return (
      <div className={styles.insightsFeed}>
        <div className={styles.feedLead}>
          <span className={styles.feedKicker}>{INSIGHTS_KICKER}</span>
          <span className={styles.feedNote}>{INSIGHTS_COUNT_NOTE}</span>
        </div>
        <div className={styles.feedCards}>
          {INSIGHTS?.map((insight, index) => (
            <InsightCard key={insight?.id} insight={insight} index={index} />
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The overview dashboard body — the status line chart, the stat-card strip and
 * the resolution-time row, matching the product's Overview tab.
 *
 * @param props.compact - Trim the chart height for the filters variant.
 * @returns The overview dashboard body.
 */
function OverviewBody({ compact = false }: { compact?: boolean } = {}): ReactNode {
  try {
    return (
      <div className={styles.overview}>
        <Card title={OVERVIEW_CHART.title} className={styles.chartCard}>
          <LineChart data={OVERVIEW_CHART} />
        </Card>
        <StatCards stats={OVERVIEW_STATS} />
        {compact ? null : (
          <MetricRow title="Resolution Time" metrics={RESOLUTION_METRICS} />
        )}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Dispatch to the correct body for a variant.
 *
 * @param props.variant - The active analytics variant.
 * @returns The rendered body, or `null` when unknown / on failure.
 */
function VariantBody({ variant }: { variant: AnalyticsVariant }): ReactNode {
  try {
    if (variant === "analytics-overview") {
      return <OverviewBody />;
    }
    if (variant === "analytics-insights") {
      return <InsightsFeedBody />;
    }
    if (variant === "analytics-act") {
      return (
        <div className={styles.soloWrap}>
          <span className={styles.soloKicker}>One-click action</span>
          <InsightCard insight={INSIGHTS[0]} mode="act" />
        </div>
      );
    }
    if (variant === "analytics-interpretation") {
      return (
        <div className={styles.soloWrap}>
          <span className={styles.soloKicker}>Interpretation included</span>
          <InsightCard insight={INSIGHTS[0]} mode="interpretation" />
        </div>
      );
    }
    if (variant === "analytics-pin-dismiss") {
      return (
        <div className={styles.soloWrap}>
          <span className={styles.soloKicker}>Pin or dismiss</span>
          <MorningDoc />
        </div>
      );
    }
    if (variant === "analytics-customers") {
      return (
        <div className={styles.twoUp}>
          <Card title="Rounds by client" className={styles.chartCard}>
            <LineChart data={CUSTOMERS_TREND} />
          </Card>
          <Card title="Top clients by rounds">
            <RankedList rows={CUSTOMERS_LIST} />
          </Card>
        </div>
      );
    }
    if (variant === "analytics-team") {
      return (
        <div className={styles.soloWrap}>
          <Card title="Review load by team" className={styles.teamCard}>
            <RankingBars rows={TEAM_ROWS} />
            <p className={styles.teamCaption}>
              For allocation and pairing - no per-person score.
            </p>
          </Card>
        </div>
      );
    }
    if (variant === "analytics-for-me") {
      return (
        <div className={styles.forMe}>
          <StatCards stats={FOR_ME_STATS} />
          <MetricRow title="Resolution Time" metrics={RESOLUTION_METRICS} />
          <Card title="Awaiting your response">
            <RankedList rows={FOR_ME_LIST} />
          </Card>
        </div>
      );
    }
    if (variant === "analytics-filters") {
      return (
        <div className={styles.filters}>
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>Filters</span>
            {FILTER_CHIPS?.map((chip) => (
              <span
                key={chip?.id}
                className={
                  chip?.active
                    ? `${styles.filterChip} ${styles.filterChipActive}`
                    : styles.filterChip
                }
              >
                {chip?.label}
                {chip?.active ? (
                  <StrokeGlyph size={12} paths={CHEVRON_PATHS} />
                ) : null}
              </span>
            ))}
            <span className={styles.recurateNote}>re-curating…</span>
          </div>
          <div className={styles.filterResult}>
            <OverviewBody compact />
          </div>
        </div>
      );
    }
    return null;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------- artifact */

/** Props for {@link AnalyticsArtifact}. */
export interface AnalyticsArtifactProps {
  /**
   * Render for the wider, fully-visible hero product window rather than the
   * left-anchored feature-section panel. Defaults to false.
   */
  hero?: boolean;
  /**
   * Which analytics view to render. Defaults to {@link DEFAULT_VARIANT} (the
   * curated insight feed).
   */
  variant?: AnalyticsVariant;
}

/**
 * Render the "Analytics" feature artifact — the Superflow Analytics window with
 * a per-variant body.
 *
 * @param props - Optional {@link AnalyticsArtifactProps}.
 * @returns The analytics window, or `null` on failure.
 */
export default function AnalyticsArtifact({
  hero = false,
  variant = DEFAULT_VARIANT,
}: AnalyticsArtifactProps = {}): ReactNode {
  try {
    const activeTab = CHROME_TAB_FOR_VARIANT[variant] ?? "Overview";
    return (
      <div
        className={styles.root}
        data-artifact={variant}
        data-hero={hero ? "true" : undefined}
      >
        <div className={styles.window}>
          <AnalyticsChrome activeTab={activeTab} />
          <div className={styles.body}>
            <VariantBody variant={variant} />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * "Strategic Overview" variant — the status line chart + stat cards + resolution
 * row (the product's Overview tab).
 *
 * @returns The overview analytics artifact.
 */
export function AnalyticsOverviewArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-overview" />;
}

/**
 * "Insights of the week" variant — the curated insight feed (the star).
 *
 * @returns The insight-feed analytics artifact.
 */
export function AnalyticsInsightsArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-insights" />;
}

/**
 * "One-click actions" variant — a single insight whose action button is pressed
 * by the cursor and flips to "Applied".
 *
 * @returns The act-on-one analytics artifact.
 */
export function AnalyticsActArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-act" />;
}

/**
 * "Interpretation included" variant — a single insight with its "what it means"
 * line highlighted.
 *
 * @returns The interpretation analytics artifact.
 */
export function AnalyticsInterpretationArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-interpretation" />;
}

/**
 * "Customers" variant — a per-client trend chart plus a per-client rollup list.
 *
 * @returns The customers analytics artifact.
 */
export function AnalyticsCustomersArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-customers" />;
}

/**
 * "Team" variant — review-load ranking bars with the "no per-person score"
 * caption.
 *
 * @returns The team analytics artifact.
 */
export function AnalyticsTeamArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-team" />;
}

/**
 * "For Me" variant — personal stat cards, the resolution row and an "awaiting
 * your response" list (the product's For me tab).
 *
 * @returns The for-me analytics artifact.
 */
export function AnalyticsForMeArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-for-me" />;
}

/**
 * "Pin or dismiss" variant — a single insight with pin/dismiss controls; the
 * cursor pins it to the morning view.
 *
 * @returns The pin-or-dismiss analytics artifact.
 */
export function AnalyticsPinDismissArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-pin-dismiss" />;
}

/**
 * "Filters that re-curate" variant — a filter bar over a compact overview that
 * re-curates on filter change.
 *
 * @returns The filters analytics artifact.
 */
export function AnalyticsFiltersArtifact(): ReactNode {
  return <AnalyticsArtifact variant="analytics-filters" />;
}
