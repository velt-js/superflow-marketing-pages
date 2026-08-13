"use client";

// The JSON-LD Validator.
//
// URL form in, four category cards out, then the issues under the category
// they belong to, then a per-type eligibility table.
//
// The design rule carried over from the engine: never report absence as a
// fact you are sure of. When a page has no structured data the tool says so
// once, plainly, and does not dress it up as a score. When the engine could
// not read the page it says that instead, because "we found nothing" and "we
// could not look" are different answers and only one of them is about the
// visitor's site.
//
// Categories come from the report's own roll-up, which counts passes. The
// issue list comes from the findings, which only carry failures and warnings.
// Both are rendered, so a category can honestly say "4 passed, 1 failed" and
// then show the one that failed.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  JSON_LD_CATEGORY_IDS,
  checksForValidatorReport,
  groupChecksByCategory,
  type JsonLdCategoryId,
  type JsonLdCategoryScore,
  type JsonLdCheck,
  type JsonLdCheckStatus,
  type JsonLdEnvelopeFinding,
  type JsonLdTypeEligibility,
  type JsonLdValidatorReport,
} from "@/lib/tools/json-ld/types";
import styles from "./JsonLdValidator.module.css";

const SLUG = "json-ld-validator";
const ENDPOINT = "/api/tools/json-ld-validator";

/** What the endpoint returns. */
type ValidatorResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  report?: JsonLdValidatorReport;
  findings?: JsonLdEnvelopeFinding[];
  totalFindings?: number;
  cached?: boolean;
  ageSeconds?: number;
};

type SuccessResult = {
  report: JsonLdValidatorReport;
  checks: JsonLdCheck[];
  cached: boolean;
  ageSeconds: number;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult }
  | { phase: "error"; message: string };

const STATUS_LABELS: Record<JsonLdCheckStatus, string> = {
  pass: "Pass",
  warn: "Warning",
  fail: "Fail",
};

/** Fallback copy for a category the report did not send a roll-up for. */
const CATEGORY_FALLBACK: Record<JsonLdCategoryId, { label: string; question: string }> = {
  syntax: { label: "Syntax", question: "Does it parse?" },
  eligibility: { label: "Eligibility", question: "Will it earn a rich result?" },
  values: { label: "Values", question: "Are the values in the right format?" },
  coherence: { label: "Coherence", question: "Do the blocks agree with each other?" },
};

/**
 * The hostname of a URL, for display.
 *
 * @param url - Any absolute URL.
 */
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Formats a cache age as a phrase. Plain words, no em dashes.
 *
 * @param ageSeconds - Seconds since the result was produced.
 */
function formatAge(ageSeconds: number): string {
  try {
    if (ageSeconds < 60) return "just now";
    const minutes = Math.floor(ageSeconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } catch {
    return "recently";
  }
}

/**
 * Builds the plain-text report the copy button writes to the clipboard.
 *
 * Written to be pasted into a ticket or a message to whoever owns the site,
 * so it leads with the URL and keeps every fix next to the thing it fixes.
 *
 * @param result - The successful run.
 */
function buildTextReport(result: SuccessResult): string {
  try {
    const { report, checks } = result;
    const lines: string[] = [];

    lines.push(`Structured data report for ${report.finalUrl}`);
    lines.push("");
    lines.push(
      `Blocks found: ${report.blockCount}${
        report.invalidBlockCount > 0
          ? ` (${report.invalidBlockCount} did not parse)`
          : ""
      }`,
    );
    lines.push(
      `Types declared: ${
        report.declaredTypes.length > 0 ? report.declaredTypes.join(", ") : "none"
      }`,
    );
    lines.push(`Issues: ${checks.filter((check) => check.status !== "pass").length}`);
    lines.push("");

    for (const category of JSON_LD_CATEGORY_IDS) {
      const score = report.categories?.find((entry) => entry.id === category);
      const meta = CATEGORY_FALLBACK[category];
      const items = checks.filter((check) => check.category === category);
      lines.push(
        `${meta.label} (${meta.question}) ${score ? `${score.passCount} passed, ${score.warnCount} warnings, ${score.failCount} failed` : ""}`.trim(),
      );
      if (items.length === 0) {
        lines.push("  Nothing to fix.");
      }
      for (const item of items) {
        lines.push(`  [${STATUS_LABELS[item.status]}] ${item.title}`);
        if (item.why) lines.push(`    Why: ${item.why}`);
        if (item.fix) lines.push(`    Fix: ${item.fix}`);
      }
      lines.push("");
    }

    if (report.eligibility.length > 0) {
      lines.push("Rich result eligibility");
      for (const entry of report.eligibility) {
        lines.push(
          `  ${entry.type}: ${entry.eligible ? "has everything required" : "missing required properties"}`,
        );
        if (entry.missingRequired.length > 0) {
          lines.push(`    Required, missing: ${entry.missingRequired.join(", ")}`);
        }
        if (entry.missingRecommended.length > 0) {
          lines.push(
            `    Recommended, missing: ${entry.missingRecommended.join(", ")}`,
          );
        }
      }
      lines.push("");
    }

    lines.push("Checked with the Superflow JSON-LD Validator.");
    return lines.join("\n");
  } catch {
    return "";
  }
}

/** The pass, warning, or fail chip. The three read differently at a glance. */
function StatusChip({ status }: { status: JsonLdCheckStatus }) {
  const className =
    status === "pass"
      ? styles.chipPass
      : status === "warn"
        ? styles.chipWarn
        : styles.chipFail;
  return <span className={`${styles.chip} ${className}`}>{STATUS_LABELS[status]}</span>;
}

/** Copies arbitrary text, flashing the button state. */
function CopyButton({
  value,
  label,
  analyticsLabel,
}: {
  value: string;
  label: string;
  analyticsLabel: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      trackEvent(AnalyticsEvents.DOWNLOAD, {
        tool: SLUG,
        kind: "copy",
        label: analyticsLabel,
      });
    } catch {
      setState("failed");
    } finally {
      window.setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      className={styles.ghostButton}
      onClick={copy}
      aria-live="polite"
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl C" : label}
    </button>
  );
}

/** One category: the question it answers, its counts, and its issues. */
function CategoryCard({
  score,
  categoryId,
  checks,
}: {
  score: JsonLdCategoryScore | undefined;
  categoryId: JsonLdCategoryId;
  checks: JsonLdCheck[];
}) {
  const meta = CATEGORY_FALLBACK[categoryId];
  const label = score?.label ?? meta.label;
  const question = score?.question ?? meta.question;
  const failCount = score?.failCount ?? checks.filter((c) => c.status === "fail").length;
  const warnCount = score?.warnCount ?? checks.filter((c) => c.status === "warn").length;
  const passCount = score?.passCount ?? 0;

  const issues = checks.filter((check) => check.status !== "pass");

  return (
    <section className={styles.category}>
      <header className={styles.categoryHead}>
        <div className={styles.categoryTitleWrap}>
          <h3 className={styles.categoryTitle}>{label}</h3>
          <p className={styles.categoryQuestion}>{question}</p>
        </div>
        <div className={styles.counts}>
          <span className={`${styles.count} ${styles.countPass}`}>
            {passCount} passed
          </span>
          <span className={`${styles.count} ${styles.countWarn}`}>
            {warnCount} {warnCount === 1 ? "warning" : "warnings"}
          </span>
          <span className={`${styles.count} ${styles.countFail}`}>
            {failCount} failed
          </span>
        </div>
      </header>

      {issues.length === 0 ? (
        <p className={styles.categoryClear}>Nothing to fix here.</p>
      ) : (
        <ul className={styles.checkList}>
          {issues.map((check) => (
            <li key={check.id} className={styles.check}>
              <div className={styles.checkHead}>
                <StatusChip status={check.status} />
                <span className={styles.checkTitle}>{check.title}</span>
              </div>
              {check.why ? <p className={styles.checkWhy}>{check.why}</p> : null}
              {check.fix ? <p className={styles.checkFix}>{check.fix}</p> : null}
              {check.fixSnippet ? (
                <pre className={styles.snippet}>
                  <code>{check.fixSnippet}</code>
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** One type's rich-result verdict: what Google wants against what is there. */
function EligibilityRow({ entry }: { entry: JsonLdTypeEligibility }) {
  return (
    <li className={styles.eligibilityRow}>
      <div className={styles.eligibilityHead}>
        <span className={styles.eligibilityType}>{entry.type}</span>
        <StatusChip status={entry.eligible ? "pass" : "fail"} />
        {entry.googleSupported ? null : (
          <span className={styles.mutedNote}>
            Google has no rich result for this type
          </span>
        )}
      </div>
      {entry.missingRequired.length > 0 ? (
        <p className={styles.eligibilityLine}>
          <span className={styles.eligibilityLabel}>Required, missing:</span>{" "}
          <code className={styles.propList}>{entry.missingRequired.join(", ")}</code>
        </p>
      ) : (
        <p className={styles.eligibilityLine}>
          <span className={styles.eligibilityLabel}>Required:</span> all present.
        </p>
      )}
      {entry.missingRecommended.length > 0 ? (
        <p className={styles.eligibilityLine}>
          <span className={styles.eligibilityLabel}>Recommended, missing:</span>{" "}
          <code className={styles.propList}>
            {entry.missingRecommended.join(", ")}
          </code>
        </p>
      ) : null}
    </li>
  );
}

/**
 * The JSON-LD Validator: URL form, then the report.
 */
export function JsonLdValidatorTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the check against the endpoint.
   *
   * @param url - The URL to check.
   * @param refresh - True to bypass the 24 hour cache.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({ phase: "error", message: "Enter a URL to check." });
        return;
      }

      setState({ phase: "running" });
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG, refresh });

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed, refresh }),
        });
        const payload = (await response.json()) as ValidatorResponse;

        if (payload.ok !== true || !payload.report) {
          const message =
            payload.message ??
            "Something went wrong running the check. Try again in a moment.";
          setState({ phase: "error", message });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: SLUG,
            code: payload.code ?? "unknown",
          });
          return;
        }

        const report = payload.report;
        const checks = checksForValidatorReport({
          report,
          envelopeFindings: payload.findings ?? [],
        });

        setState({
          phase: "done",
          result: {
            report,
            checks,
            cached: payload.cached === true,
            ageSeconds: payload.ageSeconds ?? 0,
          },
        });

        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          blockCount: report.blockCount,
          typeCount: report.declaredTypes.length,
          issueCount: checks.filter((check) => check.status !== "pass").length,
          noStructuredData: report.noStructuredData === true,
          cached: payload.cached === true,
        });

        // Put the checked URL in the address bar so the result survives a
        // refresh and the page is shareable. replaceState keeps back sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", report.finalUrl);
          window.history.replaceState(null, "", next.toString());
        } catch {
          // A history failure must not lose the result.
        }
      } catch {
        setState({
          phase: "error",
          message:
            "We could not reach the validator. Check your connection and try again.",
        });
        trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: SLUG, code: "network" });
      }
    },
    [trackEvent],
  );

  // Auto-run when the page is opened with a ?url=, which is what makes a
  // shared result link work.
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    try {
      const fromQuery = new URL(window.location.href).searchParams.get("url");
      if (fromQuery) {
        setInputValue(fromQuery);
        void run(fromQuery);
      }
    } catch {
      // No query, no auto-run.
    }
  }, [run]);

  /** Submits the form. */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void run(inputValue);
  }

  return (
    <div className={styles.tool}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="yourwebsite.com/a-page"
          aria-label="Page URL"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isRunning}
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={isRunning || inputValue.trim().length === 0}
        >
          {isRunning ? "Checking..." : "Check the markup"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Opening the page in a browser and reading every JSON-LD block on it.
          This takes a few seconds.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <ResultView
          result={state.result}
          onRerun={() => void run(state.result.report.finalUrl, true)}
        />
      ) : null}
    </div>
  );
}

/** The full report view for one successful run. */
function ResultView({
  result,
  onRerun,
}: {
  result: SuccessResult;
  onRerun: () => void;
}) {
  const { report, checks } = result;
  const grouped = groupChecksByCategory(checks);
  const issueCount = checks.filter((check) => check.status !== "pass").length;

  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultHost}>{hostnameOf(report.finalUrl)}</p>
          <p className={styles.resultChecked}>
            {result.cached
              ? `Cached result, checked ${formatAge(result.ageSeconds)}`
              : "Checked just now"}
          </p>
        </div>
        <div className={styles.resultActions}>
          <CopyButton
            value={buildTextReport(result)}
            label="Copy report"
            analyticsLabel="text-report"
          />
          <button type="button" className={styles.ghostButton} onClick={onRerun}>
            Check again fresh
          </button>
        </div>
      </div>

      <div className={styles.headlineGrid}>
        <section className={styles.headlineCard}>
          <h3 className={styles.headlineLabel}>Blocks found</h3>
          <p className={styles.headlineValue}>{report.blockCount}</p>
          <p className={styles.headlineDetail}>
            {report.invalidBlockCount > 0
              ? `${report.invalidBlockCount} of them did not parse as JSON, so nothing reads them.`
              : "Every block on the page parsed as JSON."}
          </p>
        </section>
        <section className={styles.headlineCard}>
          <h3 className={styles.headlineLabel}>Issues</h3>
          <p className={styles.headlineValue}>{issueCount}</p>
          <p className={styles.headlineDetail}>
            {issueCount === 0
              ? "Nothing failed and nothing warned."
              : "Each one is listed under the question it belongs to, with the fix."}
          </p>
        </section>
      </div>

      {report.noStructuredData ? (
        <p className={styles.notice}>
          This page has no JSON-LD on it. Nothing tells a search or answer
          engine what the page is about, so everything has to be inferred from
          the text. The generator builds a starting block from the page
          content if you want one.
        </p>
      ) : null}

      {report.declaredTypes.length > 0 ? (
        <section className={styles.typesCard}>
          <h3 className={styles.sectionTitle}>Types declared on this page</h3>
          <ul className={styles.typeList}>
            {report.declaredTypes.map((type) => (
              <li key={type} className={styles.typeChip}>
                {type}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.categoryGrid}>
        {JSON_LD_CATEGORY_IDS.map((categoryId) => (
          <CategoryCard
            key={categoryId}
            categoryId={categoryId}
            score={report.categories?.find((entry) => entry.id === categoryId)}
            checks={grouped[categoryId]}
          />
        ))}
      </div>

      {report.eligibility.length > 0 ? (
        <section className={styles.eligibilityCard}>
          <h3 className={styles.sectionTitle}>Rich result eligibility</h3>
          <p className={styles.sectionLead}>
            What Google requires for each type you declared, against what this
            page actually has. Missing a required property means no rich
            result, however valid the markup is.
          </p>
          <ul className={styles.eligibilityList}>
            {report.eligibility.map((entry) => (
              <EligibilityRow key={entry.type} entry={entry} />
            ))}
          </ul>
        </section>
      ) : null}

      {report.scopeDeclaration ? (
        <p className={styles.scopeNote}>
          Checked: {report.scopeDeclaration.checked.join(", ")}. Not checked:{" "}
          {report.scopeDeclaration.notChecked.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
