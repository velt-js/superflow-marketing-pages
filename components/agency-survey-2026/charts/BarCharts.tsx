// Bar-based chart pieces for the survey report. Server components - plain
// HTML/CSS marks, every row direct-labeled with its category and value, so
// each chart doubles as its own table view.

import styles from "./Charts.module.css";
import type { ShareRow, UsePayRow } from "@/lib/agency-tools-survey/report-data";

export function StatTiles({
  tiles,
}: {
  tiles: { value: string; label: string }[];
}) {
  return (
    <div className={styles.statRow}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.statTile}>
          <span className={styles.statValue}>{tile.value}</span>
          <span className={styles.statLabel}>{tile.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Horizontal bar list for one single-series question. Bars share a common
 * 0-100% scale so shares stay comparable across rows.
 */
export function BarList({ rows }: { rows: ShareRow[] }) {
  return (
    <div className={styles.barList}>
      {rows.map((row) => (
        <div key={row.label} className={styles.barRow}>
          <span className={styles.barLabel}>{row.label}</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${row.pct}%` }} />
          </div>
          <span className={styles.barValue}>{row.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Use-vs-pay paired bars (two series, so a legend is present and both bars
 * are value-labeled). The two fills of one entity sit 2px apart per the
 * spacer rule.
 */
export function UsePayBars({ rows }: { rows: UsePayRow[] }) {
  return (
    <div>
      <ul className={styles.legend}>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatch} aria-hidden="true" />
          Use it
        </li>
        <li className={styles.legendItem}>
          <span
            className={`${styles.legendSwatch} ${styles.legendSwatchS2}`}
            aria-hidden="true"
          />
          Pay for it
        </li>
      </ul>
      <div className={styles.pairedList}>
        {rows.map((row) => (
          <div key={row.name} className={styles.pairedRow}>
            <span className={styles.pairedName}>{row.name}</span>
            <div className={styles.pairedBars}>
              <div className={styles.pairedBarLine}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${row.usePct}%` }}
                  />
                </div>
                <span className={styles.barValue}>{row.usePct}%</span>
              </div>
              <div className={styles.pairedBarLine}>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFillS2}`}
                    style={{ width: `${row.payPct}%` }}
                  />
                </div>
                <span className={styles.barValue}>{row.payPct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
