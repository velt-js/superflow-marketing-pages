// Tiny chart motifs for the survey landing page's "what you get" strip.
// Sketches of the real report charts, drawn with the same validated series
// palette (--viz-s1/s2 from Survey.module.css). Decorative: each card's
// label carries the meaning, so the SVGs are aria-hidden.

const S1 = "var(--viz-s1)";
const S2 = "var(--viz-s2)";
const TRACK = "var(--viz-track)";

function Motif({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 96 56"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Usage-vs-loyalty quadrant: midline + scattered dots. */
export function QuadrantMotif() {
  return (
    <Motif>
      <line x1="6" y1="28" x2="90" y2="28" stroke={TRACK} strokeWidth="2" strokeDasharray="4 4" />
      <line x1="6" y1="50" x2="90" y2="50" stroke={TRACK} strokeWidth="2" />
      {[
        [22, 14],
        [38, 20],
        [60, 10],
        [74, 24],
        [30, 38],
        [66, 42],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill={S1} />
      ))}
    </Motif>
  );
}

/** Revision-rounds benchmark: a small bar distribution. */
export function BarsMotif() {
  return (
    <Motif>
      {[
        [10, 20],
        [26, 34],
        [42, 44],
        [58, 30],
        [74, 14],
      ].map(([x, h]) => (
        <rect key={x} x={x} y={50 - h} width="12" height={h} rx="3" fill={S1} opacity={h === 44 ? 1 : 0.45} />
      ))}
      <line x1="6" y1="50" x2="90" y2="50" stroke={TRACK} strokeWidth="2" />
    </Motif>
  );
}

/** AI use-vs-pay gap: paired horizontal bars, two series. */
export function UsePayMotif() {
  return (
    <Motif>
      {[
        [8, 78, 52],
        [26, 60, 34],
        [44, 42, 18],
      ].map(([y, use, pay]) => (
        <g key={y}>
          <rect x="6" y={y} width={use} height="6" rx="3" fill={S1} />
          <rect x="6" y={y + 8} width={pay} height="6" rx="3" fill={S2} />
        </g>
      ))}
    </Motif>
  );
}

/** Most-resented ranking: podium lines with a #1 dot. */
export function RankingMotif() {
  return (
    <Motif>
      {[
        [10, 64],
        [26, 48],
        [42, 34],
      ].map(([y, w], i) => (
        <g key={y}>
          <circle cx="12" cy={y + 4} r="4.5" fill={i === 0 ? S2 : TRACK} />
          <rect x="22" y={y} width={w} height="8" rx="4" fill={TRACK} />
        </g>
      ))}
    </Motif>
  );
}
