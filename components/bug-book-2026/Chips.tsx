import { categoryColor, severityColor } from "@/lib/bug-book";
import styles from "./Chips.module.css";

/** Category chip — tinted pill in the category's accent color. */
export function CategoryChip({ category }: { category: string }) {
  const { accent, tint } = categoryColor(category);
  return (
    <span
      className={styles.chip}
      style={{ color: accent, background: tint }}
      aria-label={`Category: ${category}`}
    >
      {category}
    </span>
  );
}

/** Severity chip — color-coded dot + label (Critical red → Mild slate). */
export function SeverityChip({ severity }: { severity: string }) {
  const { accent, tint } = severityColor(severity);
  return (
    <span
      className={styles.chip}
      style={{ color: accent, background: tint }}
      aria-label={`Severity: ${severity}`}
    >
      <span
        className={styles.dot}
        style={{ background: accent }}
        aria-hidden="true"
      />
      {severity}
    </span>
  );
}

/** Human avatar-circle glyph. */
function HumanGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="4" r="2.4" fill="currentColor" />
      <path
        d="M1.6 11c.5-2.3 2.3-3.5 4.4-3.5s3.9 1.2 4.4 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Agent sparkle glyph. */
export function SparkleGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 .8 7.3 4.2 10.8 5.5 7.3 6.8 6 10.2 4.7 6.8 1.2 5.5 4.7 4.2Z"
        fill="currentColor"
      />
      <path d="M10.2 8.6l.55 1.45L12.2 10.6l-1.45.55-.55 1.45" fill="none" />
    </svg>
  );
}

/**
 * Source badge — human = avatar-circle glyph, agent = sparkle in the
 * Superflow accent.
 */
export function SourceBadge({
  source,
  label,
}: {
  source: "human" | "agent";
  label?: string;
}) {
  const text = label ?? (source === "agent" ? "Superflow Agent" : "Review");
  return (
    <span
      className={source === "agent" ? styles.sourceAgent : styles.sourceHuman}
      aria-label={`Caught by: ${text}`}
    >
      {source === "agent" ? <SparkleGlyph /> : <HumanGlyph />}
      {text}
    </span>
  );
}

/** Status pill: ✅ tint for Resolved, 🟡 for Open / In progress. */
export function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const resolved = status === "Resolved";
  return (
    <span className={resolved ? styles.statusResolved : styles.statusOpen}>
      <span
        className={styles.dot}
        style={{ background: resolved ? "#16a34a" : "#d5a106" }}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

/** Small neutral tag for editorial flag labels ("Our own site 😳", …). */
export function FlagTag({ label }: { label: string }) {
  return <span className={styles.flagTag}>{label}</span>;
}
