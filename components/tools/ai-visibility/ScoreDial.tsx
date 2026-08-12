import styles from "./Report.module.css";
import { colorForScore } from "./status";

/** Radius of the dial's stroked circle, in the SVG's own coordinates. */
const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The score dial: a single stroked arc from 0 to `score` percent.
 *
 * Rendered server-side with no animation, because this sits at the top of the
 * result and a spinning number delays the one thing the visitor came for.
 *
 * @param props - The score and the denominator it was scored against.
 */
export function ScoreDial({
  score,
  scoredOutOf = 100,
}: {
  score: number;
  scoredOutOf?: number;
}) {
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : 0;
  const color = colorForScore(safeScore);
  const offset = CIRCUMFERENCE * (1 - safeScore / 100);

  return (
    <div className={styles.dialWrap}>
      <svg
        viewBox="0 0 132 132"
        width="132"
        height="132"
        role="img"
        aria-label={`AI visibility score ${safeScore} out of 100`}
      >
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          stroke="#ececee"
          strokeWidth="10"
        />
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 66 66)"
        />
      </svg>
      <div className={styles.dialText} aria-hidden="true">
        <span className={styles.dialScore} style={{ color }}>
          {safeScore}
        </span>
        <span className={styles.dialOutOf}>
          {scoredOutOf < 100 ? `of ${scoredOutOf} scorable` : "out of 100"}
        </span>
      </div>
    </div>
  );
}
