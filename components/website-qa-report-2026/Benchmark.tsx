"use client";

// "How does your agency compare?" - the review-rounds benchmark.
//
// Client-side only. The answer is saved for the session and sent with the
// form if the visitor submits it.

import { QaReportEvents } from "@/lib/analytics/events";
import { BENCHMARK_BUCKETS } from "@/lib/website-qa-report/report";
import { setBenchmark, trackReport, useReportState } from "./report-store";
import styles from "./Report.module.css";

/** Scrolls to the hero form and puts the cursor in its email field. */
function goToForm(formId: string): void {
  try {
    const form = document.getElementById(formId);
    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    const field = form.querySelector<HTMLElement>("input[name=email], a[download]");
    field?.focus({ preventScroll: true });
  } catch {
    // The anchor link still works.
  }
}

export function Benchmark({ formId }: { formId: string }) {
  const { benchmark } = useReportState();

  try {
    const picked = BENCHMARK_BUCKETS.find((bucket) => bucket.id === benchmark);
    const total = BENCHMARK_BUCKETS.reduce((sum, bucket) => sum + bucket.share, 0);

    return (
      <div className={styles.benchmark}>
        <p className={styles.benchmarkQuestion} id="benchmark-question">
          How many review rounds does a typical site take before launch?
        </p>
        <div className={styles.benchmarkChoices} role="group" aria-labelledby="benchmark-question">
          {BENCHMARK_BUCKETS.map((bucket) => (
            <button
              key={bucket.id}
              type="button"
              className={styles.choice}
              aria-pressed={benchmark === bucket.id}
              onClick={() => {
                setBenchmark(bucket.id);
                trackReport(QaReportEvents.BENCHMARK_ANSWERED, { answer: bucket.id });
              }}
            >
              {bucket.label}
            </button>
          ))}
        </div>

        {picked ? (
          <div className={styles.benchmarkResult}>
            <div
              className={styles.bar}
              role="img"
              aria-label={BENCHMARK_BUCKETS.map(
                (bucket) => `${bucket.label} rounds: ${bucket.share}% of sites`,
              ).join(". ")}
            >
              {BENCHMARK_BUCKETS.map((bucket) => (
                <div
                  key={bucket.id}
                  className={styles.barSegment}
                  data-active={bucket.id === picked.id ? "true" : undefined}
                  style={{ flexGrow: bucket.share / total }}
                >
                  <span className={styles.barValue}>{bucket.share}%</span>
                </div>
              ))}
            </div>
            <div className={styles.barLegend} aria-hidden="true">
              {BENCHMARK_BUCKETS.map((bucket) => (
                <span
                  key={bucket.id}
                  style={{ flexGrow: bucket.share / total }}
                  data-active={bucket.id === picked.id ? "true" : undefined}
                >
                  {bucket.label} rounds
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Always rendered, so the answer is announced when it fills in. */}
        <p className={styles.benchmarkLine} role="status">
          {picked?.result ?? ""}
        </p>

        {picked ? (
          <div className={styles.benchmarkResult}>
            <p className={styles.benchmarkNext}>
              The full report shows what fills those rounds, and which parts don&apos;t need a
              person.
            </p>
            <a
              href={`#${formId}`}
              className={styles.primaryButton}
              onClick={(event) => {
                event.preventDefault();
                goToForm(formId);
              }}
            >
              Get the report
            </a>
          </div>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}
