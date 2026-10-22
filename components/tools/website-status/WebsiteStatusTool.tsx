"use client";

// The Website Status Checker.
//
// URL form in, a verdict out. Two ways to arrive:
//
//   1. The tool page, empty. The visitor types a URL, the browser POSTs it to
//      the endpoint, and the card renders. The address bar is then moved to
//      the result's own page so a refresh re-checks and the link is shareable.
//   2. The shareable status page, where the server has ALREADY run the check
//      before this component loads. It arrives with `initialReport` and
//      renders the card at once; "Check again" re-runs through the endpoint
//      without a page load.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  statusPagePathFor,
  type SiteStatusReport,
} from "@/lib/tools/website-status/shared";
import { StatusResultCard } from "./StatusResultCard";
import styles from "./WebsiteStatus.module.css";

const SLUG = "website-status-checker";
const ENDPOINT = "/api/tools/website-status-checker";

/** What the endpoint returns. Failures carry `error`. */
type StatusPayload = Partial<SiteStatusReport> & {
  submittedUrl?: string;
  error?: string;
  errorCode?: string;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; report: SiteStatusReport }
  | { phase: "error"; message: string };

/**
 * The Website Status Checker: URL form, a verdict, and the facts behind it.
 *
 * @param props.initialUrl - Pre-fills the form (the shareable page's URL).
 * @param props.initialReport - A check the server already ran for this page.
 */
export function WebsiteStatusTool({
  initialUrl = "",
  initialReport,
}: {
  initialUrl?: string;
  initialReport?: SiteStatusReport;
}) {
  const [inputValue, setInputValue] = useState(initialUrl);
  const [state, setState] = useState<RunState>(
    initialReport ? { phase: "done", report: initialReport } : { phase: "idle" },
  );
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the check against the endpoint.
   *
   * @param url - The URL to check.
   */
  const run = useCallback(
    async (url: string) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({ phase: "error", message: "Enter a URL to check." });
        return;
      }
      // Keeps the form in step with a run that did not start from it (the
      // ?url= auto-run, or "Check again" after a scheme fallback).
      setInputValue(trimmed);

      setState({ phase: "running" });
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG });

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const payload = (await response.json()) as StatusPayload;

        if (payload.error || !payload.verdict) {
          setState({
            phase: "error",
            message: payload.error ?? "The check did not return a result. Try again.",
          });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: SLUG,
            code: payload.errorCode ?? "unknown",
          });
          return;
        }

        const report = payload as SiteStatusReport;
        setState({ phase: "done", report });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          verdict: report.verdict,
          httpStatus: report.httpStatus ?? 0,
          reason: report.reason ?? "",
        });

        // Move the address bar to the result's own page so a refresh runs
        // the check again and the link is shareable. replaceState keeps
        // back sane.
        try {
          const sharePath = statusPagePathFor(report.requestedUrl);
          if (sharePath) window.history.replaceState(null, "", sharePath);
        } catch {
          // A history failure must not lose the result.
        }
      } catch {
        setState({
          phase: "error",
          message:
            "We could not reach the checker. Check your connection and try again.",
        });
        trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: SLUG, code: "network" });
      }
    },
    [trackEvent],
  );

  // Auto-run when the tool page is opened with a ?url=, the convention the
  // other checkers use for a shared link. The status page itself arrives
  // with the server's report instead and never auto-runs.
  useEffect(() => {
    if (autoRan.current || initialReport) return;
    autoRan.current = true;
    try {
      const fromQuery = new URL(window.location.href).searchParams.get("url");
      // Deferred a tick: the run starts network work and sets state, which
      // belongs after the commit, not inside the effect body.
      if (fromQuery) queueMicrotask(() => void run(fromQuery));
    } catch {
      // No query, no auto-run.
    }
  }, [run, initialReport]);

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
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourwebsite.com"
          aria-label="Website URL"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isRunning}
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={isRunning || inputValue.trim().length === 0}
        >
          {isRunning ? "Checking..." : "Check status"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Requesting the page from our server.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <StatusResultCard
          report={state.report}
          actions={
            <ResultActions
              report={state.report}
              onRerun={() => void run(state.report.requestedUrl)}
            />
          }
        />
      ) : null}
    </div>
  );
}

/** Check again, open the site, and copy the result's own link. */
function ResultActions({
  report,
  onRerun,
}: {
  report: SiteStatusReport;
  onRerun: () => void;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();
  const sharePath = statusPagePathFor(report.requestedUrl);

  /** Copies the shareable status page link. */
  async function copyLink() {
    try {
      if (!sharePath) throw new Error("no share path");
      await navigator.clipboard.writeText(new URL(sharePath, window.location.origin).toString());
      setCopyState("copied");
      trackEvent(AnalyticsEvents.DOWNLOAD, { tool: SLUG, kind: "copy", label: "share-link" });
    } catch {
      setCopyState("failed");
    } finally {
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  return (
    <>
      <button type="button" className={styles.ghostButton} onClick={onRerun}>
        Check again
      </button>
      <a
        className={styles.ghostButton}
        href={report.requestedUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        Open the site
      </a>
      {sharePath ? (
        <button
          type="button"
          className={styles.ghostButton}
          onClick={copyLink}
          aria-live="polite"
        >
          {copyState === "copied"
            ? "Link copied"
            : copyState === "failed"
              ? "Press Ctrl C"
              : "Copy status link"}
        </button>
      ) : null}
    </>
  );
}
