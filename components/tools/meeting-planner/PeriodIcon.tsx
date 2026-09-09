export type TimePeriod = "day" | "evening" | "overnight";

/** Quiet, decorative cues; the adjacent text also identifies each period. */
export function PeriodIcon({ period }: { period: TimePeriod }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-period-icon={period}
    >
      {period === "day" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      ) : period === "evening" ? (
        <>
          <path d="M7 15a5 5 0 0 1 10 0M3 15h18M5 19h14M12 3v3M4 7l2 2m12 0 2-2" />
        </>
      ) : (
        <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
      )}
    </svg>
  );
}
