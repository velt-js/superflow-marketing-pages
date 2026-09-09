// Server-rendered charts. Values are labeled in text as well as shown by bars.
import styles from "./Charts.module.css";
import type { ShareRow, UsePayRow } from "@/lib/agency-tools-survey/report-data";

export function StatTiles({ tiles }: { tiles: { value: string; label: string }[] }) {
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

/** All bars share a 0-100% scale. */
export function BarList({ rows }: { rows: ShareRow[] }) {
  return (
    <div className={styles.barList}>
      {rows.map((row) => (
        <div key={row.label} className={styles.barRow}>
          <span className={styles.barLabel}>{row.label}</span>
          <div className={styles.barTrack} aria-hidden="true">
            <div className={styles.barFill} style={{ width: `${row.pct}%` }} />
          </div>
          <span className={styles.barValue}>{row.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/** Agency-paid use is a subset of use, not the complement of free use. */
export function UsePayBars({ rows }: { rows: UsePayRow[] }) {
  return (
    <div>
      <ul className={styles.legend}>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatch} aria-hidden="true" />
          Use for agency work
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSwatchS2}`} aria-hidden="true" />
          Used, agency-paid
        </li>
      </ul>
      <div className={styles.pairedList}>
        {rows.map((row) => (
          <div key={row.name} className={styles.pairedRow}
            role="img" aria-label={`${row.name}: ${row.usePct}% use for agency work; ${row.payPct}% use with agency payment`}>
            <span className={styles.pairedName}>{row.name}</span>
            <div className={styles.pairedBars}>
              <div className={styles.pairedBarLine}>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${row.usePct}%` }} />
                </div>
                <span className={styles.barValue}>{row.usePct}%</span>
              </div>
              <div className={styles.pairedBarLine}>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.barFillS2}`} style={{ width: `${row.payPct}%` }} />
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
