import { categoryColor, severityColor, type BugBookSample } from "@/lib/bug-book";
import { SparkleGlyph } from "./Chips";
import styles from "./BugBookSamples.module.css";

// "New agents on the beat" - a band for capabilities too new to have real
// catches yet (AEO). Deliberately separate from the collection grid: never
// filtered, sorted, routed, or indexed, and every card carries a SAMPLE
// ribbon, so the "every bug in the book is a real catch" claim holds.
//
// Kept deliberately short. The full agent report (description, why it
// matters, the per-card illustrative note) made each card four
// paragraphs, which nobody reads in a footer band - the ribbon and the
// band subhead already say "sample", so the card only needs the finding
// and the fix.

const HEADING = "New agents on the beat";
const SUBHEAD =
  "Fresh checks our newest agents run. Sample reports below - real catches coming soon.";
const RIBBON_LABEL = "SAMPLE";
const FIX_LABEL = "Fix";

function SampleCard({ sample }: { sample: BugBookSample }) {
  const { accent, tint } = categoryColor(sample.category);
  const sev = severityColor(sample.severity);
  const confidence =
    sample.finding.confidence != null
      ? Math.max(0, Math.min(100, sample.finding.confidence))
      : null;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span
          className={styles.agent}
          style={{ color: accent, background: tint }}
        >
          <SparkleGlyph size={12} />
          {sample.agentName}
        </span>
        <span
          className={styles.severity}
          style={{ color: sev.accent }}
          aria-label={`Severity: ${sample.severity}`}
        >
          {sample.severity}
        </span>
        <span className={styles.ribbon} style={{ background: accent }}>
          {RIBBON_LABEL}
        </span>
      </div>

      <h3 className={styles.headline}>{sample.headline}</h3>
      {sample.hook ? <p className={styles.hook}>{sample.hook}</p> : null}

      {sample.finding.suggestion ? (
        <p className={styles.fix}>
          <span className={styles.fixLabel} style={{ color: accent }}>
            {FIX_LABEL}
          </span>
          {sample.finding.suggestion}
        </p>
      ) : null}

      {confidence != null ? (
        <div className={styles.footer}>
          {sample.finding.issueType ? (
            <span className={styles.issueType}>{sample.finding.issueType}</span>
          ) : null}
          <span
            className={styles.confidence}
            style={{ color: accent }}
            aria-label={`Confidence: ${confidence}%`}
          >
            <span className={styles.confidenceTrack} aria-hidden="true">
              <span
                className={styles.confidenceFill}
                style={{ width: `${confidence}%`, background: accent }}
              />
            </span>
            {confidence}%
          </span>
        </div>
      ) : null}
    </article>
  );
}

/** The samples band. Renders nothing when there are no samples. */
export default function BugBookSamples({
  samples,
}: {
  samples: BugBookSample[];
}) {
  if (samples.length === 0) return null;

  return (
    <section className={styles.band} aria-labelledby="bug-book-samples-heading">
      <div className={styles.inner}>
        <header className={styles.bandHeader}>
          <h2 className={styles.heading} id="bug-book-samples-heading">
            {HEADING}
          </h2>
          <p className={styles.subhead}>{SUBHEAD}</p>
        </header>
        <ul className={styles.grid}>
          {samples.map((sample) => (
            <li key={sample._id} className={styles.item}>
              <SampleCard sample={sample} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
