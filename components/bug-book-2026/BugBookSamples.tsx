import { categoryColor, severityColor, type BugBookSample } from "@/lib/bug-book";
import { SparkleGlyph } from "./Chips";
import styles from "./BugBookSamples.module.css";

// "New agents on the beat" - a band for capabilities too new to have real
// catches yet (AEO). Deliberately separate from the collection grid: never
// filtered, sorted, routed, or indexed, and every card carries a SAMPLE
// ribbon, so the "every bug in the book is a real catch" claim holds.

const HEADING = "New agents on the beat";
const SUBHEAD =
  "Fresh checks our newest agents run. Sample reports below - real catches coming soon.";
const RIBBON_LABEL = "SAMPLE";
const SUGGESTED_FIX_LABEL = "Suggested fix";

function SampleCard({ sample }: { sample: BugBookSample }) {
  const { accent, tint } = categoryColor(sample.category);
  const sev = severityColor(sample.severity);
  const finding = sample.finding;
  const confidence =
    finding.confidence != null
      ? Math.max(0, Math.min(100, finding.confidence))
      : null;

  return (
    <article className={styles.card}>
      <span className={styles.ribbon} style={{ background: accent }}>
        {RIBBON_LABEL}
      </span>

      <div className={styles.header}>
        <span
          className={styles.agent}
          style={{ color: accent, background: tint }}
        >
          <SparkleGlyph size={13} />
          {sample.agentName}
        </span>
        <span
          className={styles.severity}
          style={{ color: sev.accent, background: sev.tint }}
          aria-label={`Severity: ${sample.severity}`}
        >
          {sample.severity}
        </span>
      </div>

      <h3 className={styles.headline}>{sample.headline}</h3>
      {sample.hook ? <p className={styles.hook}>{sample.hook}</p> : null}

      <div className={styles.report}>
        {finding.title ? (
          <p className={styles.findingTitle}>{finding.title}</p>
        ) : null}
        {finding.description ? (
          <p className={styles.findingDescription}>{finding.description}</p>
        ) : null}
        {finding.suggestion ? (
          <div className={styles.suggestionBlock} style={{ borderColor: accent }}>
            <span className={styles.suggestionLabel} style={{ color: accent }}>
              {SUGGESTED_FIX_LABEL}
            </span>
            <span className={styles.suggestionText}>{finding.suggestion}</span>
          </div>
        ) : null}
        {finding.issueType || confidence != null ? (
          <div className={styles.reportFooter}>
            {finding.issueType ? (
              <span className={styles.issueType}>{finding.issueType}</span>
            ) : null}
            {confidence != null ? (
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
                {confidence}% confident
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {sample.note ? <p className={styles.note}>{sample.note}</p> : null}
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
