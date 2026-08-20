"use client";

// The JSON-LD Generator.
//
// URL in, a block of markup out. The markup is the whole product, so it is
// the first thing on the page after the form, it is one selectable code
// block, and there are two copy buttons: the bare JSON for a CMS field that
// wraps it for you, and the whole script tag for pasting into HTML.
//
// Two things are stated rather than implied. The block was written by a
// model, so it needs reading before it ships. And the engine ran its own
// validator over what it just wrote, so those checks are shown in full,
// including the ones that only warn.
//
// A `budget-exhausted` run is rendered as a plain message, not as an error.
// The monthly ceiling working is the system behaving correctly, and a red
// alert would tell the visitor that something is broken when nothing is.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  JSON_LD_CATEGORY_IDS,
  groupChecksByCategory,
  type JsonLdCategoryId,
  type JsonLdCheck,
  type JsonLdCheckStatus,
  type JsonLdGeneratorReport,
} from "@/lib/tools/json-ld/types";
import { ShareResult } from "@/components/tools/share/ShareResult";
import { jsonLdGeneratorSnapshot } from "@/lib/tools/share/build";
import styles from "./JsonLdGenerator.module.css";

const SLUG = "json-ld-generator";
const ENDPOINT = "/api/tools/json-ld-generator";

/** The code the backend uses when the monthly model spend is used up. */
const BUDGET_CODE = "budget-exhausted";

/** What the endpoint returns. */
type GeneratorResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  report?: JsonLdGeneratorReport;
  cached?: boolean;
  ageSeconds?: number;
};

type SuccessResult = {
  report: JsonLdGeneratorReport;
  cached: boolean;
  ageSeconds: number;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult }
  /** `calm` is the budget ceiling: expected behaviour, not a fault. */
  | { phase: "error"; message: string; calm: boolean };

const STATUS_LABELS: Record<JsonLdCheckStatus, string> = {
  pass: "Pass",
  warn: "Warning",
  fail: "Fail",
};

const CATEGORY_LABELS: Record<JsonLdCategoryId, string> = {
  syntax: "Syntax",
  eligibility: "Eligibility",
  values: "Values",
  coherence: "Coherence",
};

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
 * Wraps the generated JSON in the script tag a page needs.
 *
 * @param jsonLdString - The pretty-printed block.
 */
function asScriptTag(jsonLdString: string): string {
  try {
    return `<script type="application/ld+json">\n${jsonLdString}\n</script>`;
  } catch {
    return jsonLdString;
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
  primary,
}: {
  value: string;
  label: string;
  analyticsLabel: string;
  primary?: boolean;
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
      className={primary ? styles.primaryButton : styles.ghostButton}
      onClick={copy}
      aria-live="polite"
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl C" : label}
    </button>
  );
}

/** One check the engine ran against its own output. */
function CheckRow({ check }: { check: JsonLdCheck }) {
  return (
    <li className={styles.check}>
      <div className={styles.checkHead}>
        <StatusChip status={check.status} />
        <span className={styles.checkTitle}>{check.title}</span>
      </div>
      {check.status === "pass" ? null : (
        <>
          {check.why ? <p className={styles.checkWhy}>{check.why}</p> : null}
          {check.fix ? <p className={styles.checkFix}>{check.fix}</p> : null}
          {check.fixSnippet ? (
            <pre className={styles.snippet}>
              <code>{check.fixSnippet}</code>
            </pre>
          ) : null}
        </>
      )}
    </li>
  );
}

/**
 * The JSON-LD Generator: URL form, then the markup and its own validation.
 */
export function JsonLdGeneratorTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the generator against the endpoint.
   *
   * @param url - The page to describe.
   * @param refresh - True to bypass the 24 hour cache and generate again.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({
          phase: "error",
          message: "Enter a URL to generate markup for.",
          calm: false,
        });
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
        const payload = (await response.json()) as GeneratorResponse;

        if (payload.ok !== true || !payload.report) {
          const code = payload.code ?? "unknown";
          setState({
            phase: "error",
            message:
              payload.message ??
              "Something went wrong building the markup. Try again in a moment.",
            calm: code === BUDGET_CODE,
          });
          trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: SLUG, code });
          return;
        }

        const report = payload.report;
        setState({
          phase: "done",
          result: {
            report,
            cached: payload.cached === true,
            ageSeconds: payload.ageSeconds ?? 0,
          },
        });

        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          detectedType: report.detectedType,
          validationPassed: report.validation?.passed === true,
          issueCount: (report.validation?.findings ?? []).filter(
            (check) => check.status !== "pass",
          ).length,
          cached: payload.cached === true,
        });

        // Put the URL in the address bar so the result survives a refresh and
        // the page is shareable. replaceState keeps back sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", report.url);
          window.history.replaceState(null, "", next.toString());
        } catch {
          // A history failure must not lose the result.
        }
      } catch {
        setState({
          phase: "error",
          message:
            "We could not reach the generator. Check your connection and try again.",
          calm: false,
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
          {isRunning ? "Writing..." : "Generate the markup"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Reading the page, choosing a type, and writing the block. This takes
          about ten seconds.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <p
          className={state.calm ? styles.calmNotice : styles.formError}
          role={state.calm ? undefined : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <ResultView
          result={state.result}
          onRerun={() => void run(state.result.report.url, true)}
        />
      ) : null}
    </div>
  );
}

/** The markup, then the engine's validation of it. */
function ResultView({
  result,
  onRerun,
}: {
  result: SuccessResult;
  onRerun: () => void;
}) {
  const { report } = result;
  const checks = report.validation?.findings ?? [];
  const grouped = groupChecksByCategory(checks);
  const issues = checks.filter((check) => check.status !== "pass");

  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultLabel}>Detected type</p>
          <p className={styles.resultType}>{report.detectedType}</p>
          <p className={styles.resultChecked}>
            {result.cached
              ? `Generated ${formatAge(result.ageSeconds)}`
              : "Generated just now"}
          </p>
        </div>
        <div className={styles.resultActions}>
          <CopyButton
            value={asScriptTag(report.jsonLdString)}
            label="Copy the script tag"
            analyticsLabel="script-tag"
            primary
          />
          <CopyButton
            value={report.jsonLdString}
            label="Copy JSON only"
            analyticsLabel="json-only"
          />
          <button type="button" className={styles.ghostButton} onClick={onRerun}>
            Generate again
          </button>
        </div>
      </div>

      <p className={styles.aiNotice}>
        A model wrote this from the words on your page. Read it before you ship
        it. It can only describe what the page actually says, and anything it
        could not find on the page has been left out on purpose. If a property
        you expected is missing, that usually means the page does not state it
        anywhere a reader could see.
      </p>

      <section className={styles.codeCard}>
        <div className={styles.codeHead}>
          <h3 className={styles.sectionTitle}>Your markup</h3>
          <span className={styles.codeHint}>
            Paste inside the head of the page, or into your CMS schema field.
          </span>
        </div>
        <pre className={styles.code}>
          <code>{report.jsonLdString}</code>
        </pre>
      </section>

      <section className={styles.validationCard}>
        <h3 className={styles.sectionTitle}>
          What the validator says about this block
        </h3>
        <p className={styles.sectionLead}>
          The generator ran the same checks the JSON-LD Validator runs, against
          the block it just wrote.{" "}
          {issues.length === 0
            ? "Nothing failed and nothing warned."
            : `${issues.length} ${issues.length === 1 ? "check" : "checks"} came back with something worth reading.`}
        </p>

        <div className={styles.categoryGrid}>
          {JSON_LD_CATEGORY_IDS.map((categoryId) => {
            const items = grouped[categoryId];
            if (items.length === 0) return null;
            return (
              <section key={categoryId} className={styles.category}>
                <h4 className={styles.categoryTitle}>
                  {CATEGORY_LABELS[categoryId]}
                </h4>
                <ul className={styles.checkList}>
                  {items.map((check) => (
                    <CheckRow key={check.id} check={check} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      {report.scopeDeclaration ? (
        <p className={styles.scopeNote}>
          Checked: {report.scopeDeclaration.checked.join(", ")}. Not checked:{" "}
          {report.scopeDeclaration.notChecked.join(", ")}.
        </p>
      ) : null}

      <ShareResult snapshot={jsonLdGeneratorSnapshot(report)} />
    </div>
  );
}
