import { rageBand } from "@/lib/bug-book";
import styles from "./RageMeter.module.css";

function Flame({ lit }: { lit: boolean }) {
  return (
    <svg
      className={lit ? styles.flameLit : styles.flameDim}
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 .9c.5 2.4 2 3.6 3.4 4.9 1.4 1.4 2.3 2.8 2.3 4.7A5.6 5.6 0 0 1 7 16a5.6 5.6 0 0 1-5.7-5.5c0-1.3.5-2.6 1.3-3.6 0 0 .2 1 .8 1.7C3.2 5.7 5.6 4 7 .9Z"
        fill="currentColor"
      />
      <path
        d="M7 15.9a3 3 0 0 1-3-3c0-1.7 1.6-2.3 3-4.3 1.4 2 3 2.6 3 4.3a3 3 0 0 1-3 3Z"
        fill="#fff"
        fillOpacity={lit ? 0.55 : 0.7}
      />
    </svg>
  );
}

/**
 * The Superflow-only axis: a 0–10 flame row. Only rendered when
 * `level >= RAGE_METER_MIN` (6) — scarcity makes it funnier — so this
 * component assumes the caller already gated it.
 *
 * `compact` renders 5 flames (card use); the default renders all 10
 * (detail hero).
 */
export default function RageMeter({
  level,
  compact = false,
}: {
  level: number;
  compact?: boolean;
}) {
  const band = rageBand(level);
  const total = compact ? 5 : 10;
  const lit = compact ? Math.round((level / 10) * 5) : level;
  const label = `Rage level ${level}/10 — ${band}`;

  return (
    <span
      className={compact ? styles.meterCompact : styles.meter}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className={styles.flames} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <Flame key={i} lit={i < lit} />
        ))}
      </span>
      <span className={styles.bandLabel} aria-hidden="true">
        {compact ? `${level}/10` : `${level}/10 · ${band}`}
      </span>
    </span>
  );
}
