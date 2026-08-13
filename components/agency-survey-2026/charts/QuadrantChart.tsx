// Usage vs would-choose-again scatter ("the quadrant") for website platforms
// and PM tools. Server component, inline SVG. Every point is direct-labeled
// (single series, so no legend), the grid is recessive, and a dashed line at
// 50% marks the loyalty midline. A <details> table mirrors the data for
// screen readers and anyone who wants exact numbers.

import styles from "./Charts.module.css";
import type { QuadrantPoint } from "@/lib/agency-tools-survey/report-data";

const WIDTH = 640;
const HEIGHT = 440;
const MARGIN = { top: 16, right: 110, bottom: 44, left: 44 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

export function QuadrantChart({
  title,
  subtitle,
  points,
  usageLabel,
}: {
  title: string;
  subtitle: string;
  points: QuadrantPoint[];
  /** Column header for the usage share in the table view. */
  usageLabel: string;
}) {
  // Round the x domain up past the largest value so right-side labels have
  // headroom. The y domain stays 0-100: choose-again is a rate, and a
  // truncated rate axis exaggerates gaps.
  const xMax = Math.ceil(Math.max(...points.map((p) => p.usagePct)) / 10) * 10 + 10;
  const x = (v: number) => MARGIN.left + (v / xMax) * INNER_W;
  const y = (v: number) => MARGIN.top + ((100 - v) / 100) * INNER_H;

  const xTicks = Array.from({ length: xMax / 10 + 1 }, (_, i) => i * 10);
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <figure className={styles.quadrantFigure}>
      <figcaption>
        <span className={styles.quadrantTitle} style={{ display: "block" }}>
          {title}
        </span>
        <span className={styles.quadrantSubtitle} style={{ display: "block" }}>
          {subtitle}
        </span>
      </figcaption>
      <svg
        className={styles.quadrantSvg}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}. ${subtitle}. Exact values in the table below.`}
      >
        {/* Grid */}
        {yTicks.map((t) => (
          <line
            key={`y${t}`}
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--viz-grid)"
            strokeWidth="1"
          />
        ))}
        {/* Loyalty midline */}
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={y(50)}
          y2={y(50)}
          stroke="var(--s-ink-faint)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Axis tick labels */}
        {xTicks.map((t) => (
          <text
            key={`xt${t}`}
            x={x(t)}
            y={HEIGHT - MARGIN.bottom + 18}
            textAnchor="middle"
            fontSize="11"
            fill="var(--s-ink-faint)"
          >
            {t}
          </text>
        ))}
        {yTicks.map((t) => (
          <text
            key={`yt${t}`}
            x={MARGIN.left - 8}
            y={y(t) + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--s-ink-faint)"
          >
            {t}
          </text>
        ))}
        {/* Axis titles */}
        <text
          x={MARGIN.left + INNER_W / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          fontSize="12"
          fill="var(--s-ink-soft)"
        >
          Share of agencies using it (%)
        </text>
        <text
          x={MARGIN.left}
          y={MARGIN.top - 2}
          textAnchor="start"
          fontSize="12"
          fill="var(--s-ink-soft)"
        >
          Would choose it again (%)
        </text>
        {/* Points + direct labels */}
        {points.map((p) => {
          const px = x(p.usagePct);
          const py = y(p.chooseAgainPct);
          const labelRight = px < WIDTH - MARGIN.right - 20;
          return (
            <g key={p.name}>
              <circle
                cx={px}
                cy={py}
                r="5"
                fill="var(--viz-s1)"
                stroke="var(--s-panel)"
                strokeWidth="2"
              />
              <text
                x={labelRight ? px + 10 : px - 10}
                y={py + 4}
                textAnchor={labelRight ? "start" : "end"}
                fontSize="12"
                fill="var(--s-ink)"
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      <details className={styles.tableToggle}>
        <summary>View as table</summary>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th scope="col">Tool</th>
              <th scope="col">{usageLabel}</th>
              <th scope="col">Would choose again</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.usagePct}%</td>
                <td>{p.chooseAgainPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
