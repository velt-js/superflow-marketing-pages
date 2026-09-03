"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Report.module.css";
import { VisibilityReportView } from "./VisibilityReportView";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type {
  CategoryId,
  VisibilityReport,
} from "@/lib/tools/ai-visibility/types";
import { runToolRequest, ToolRunError } from "@/lib/tools/client/run-tool";

const ENDPOINT = "/api/tools/ai-visibility";

/**
 * Progress stages, in the order the engine actually performs them. The bar is
 * time-driven because the endpoint answers once rather than streaming, so
 * these are labels for work genuinely in flight, never claims that a stage
 * has produced a result.
 */
const STAGES: Array<{ atMs: number; label: string }> = [
  { atMs: 0, label: "Fetching the page as a browser" },
  { atMs: 1200, label: "Reading robots.txt and checking every AI crawler" },
  { atMs: 3000, label: "Requesting the page as GPTBot to test your firewall" },
  { atMs: 5200, label: "Looking for llms.txt and your sitemap" },
  { atMs: 7500, label: "Rendering the page to measure JavaScript dependency" },
  { atMs: 11_000, label: "Scoring structure and identity" },
];

type RunState =
  | { phase: "idle" }
  | { phase: "running"; startedAt: number }
  | {
      phase: "done";
      report: VisibilityReport;
      cached: boolean;
      ageSeconds: number;
    }
  | { phase: "error"; message: string };

/**
 * The AI Visibility Checker: URL form, progress, and report.
 *
 * Both this tool and the robots.txt sibling page run the same engine. The
 * sibling passes `focus="access"` so it reports only the crawler-access
 * checks, and its own `slug` so share links and CTA attribution point at the
 * page the visitor is actually on.
 *
 * @param props - Slug, optional focus, and a pre-fetched report for shared
 *   links.
 */
export function VisibilityTool({
  slug = "ai-visibility-checker",
  focus,
  submitLabel = "Check my site",
  initialUrl = "",
  initialReport = null,
  initialAgeSeconds = 0,
}: {
  slug?: string;
  focus?: CategoryId;
  submitLabel?: string;
  initialUrl?: string;
  initialReport?: VisibilityReport | null;
  initialAgeSeconds?: number;
}) {
  const [inputValue, setInputValue] = useState(initialUrl);
  const [state, setState] = useState<RunState>(
    initialReport
      ? {
          phase: "done",
          report: initialReport,
          cached: true,
          ageSeconds: initialAgeSeconds,
        }
      : { phase: "idle" },
  );
  const [stageLabel, setStageLabel] = useState(STAGES[0].label);
  const [elapsed, setElapsed] = useState(0);

  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the check against the endpoint.
   *
   * @param url - The URL to check.
   * @param refresh - True to bypass the cache.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({ phase: "error", message: "Enter a URL to check." });
        return;
      }

      setState({ phase: "running", startedAt: Date.now() });
      setElapsed(0);
      setStageLabel(STAGES[0].label);
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: slug, refresh });

      try {
        // The waiting happens here rather than on the server: these runs can
        // outlast what one serverless request may hold open. See
        // lib/tools/client/run-tool.ts.
        const payload = await runToolRequest<
          | {
              ok: true;
              report: VisibilityReport;
              cached: boolean;
              ageSeconds: number;
            }
          | { ok: false; code: string; message: string }
        >({
          endpoint: ENDPOINT,
          body: { url: trimmed, refresh },
        });

        if (!payload.ok) {
          setState({ phase: "error", message: payload.message });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: slug,
            code: payload.code,
          });
          return;
        }

        setState({
          phase: "done",
          report: payload.report,
          cached: payload.cached,
          ageSeconds: payload.ageSeconds,
        });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: slug,
          score: payload.report.score,
          grade: payload.report.grade,
          platform: payload.report.detection.platform,
          cached: payload.cached,
        });

        // Put the checked URL in the address bar so the page is shareable and
        // survives a refresh. `replaceState` keeps the back button sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", payload.report.finalUrl);
          window.history.replaceState(null, "", next.toString());
        } catch {
          // A history failure must not lose the result.
        }
      } catch (error) {
        // A run that never answered carries its own copy; anything else is a
        // connection problem and reads as one.
        const runError = error instanceof ToolRunError ? error : null;
        setState({
          phase: "error",
          message:
            runError?.message ??
            "We could not reach the checker. Check your connection and try again.",
        });
        trackEvent(AnalyticsEvents.TOOL_ERROR, {
          tool: slug,
          code: runError?.code ?? "network",
        });
      }
    },
    [trackEvent, slug],
  );

  // Auto-run when the page is opened with a ?url= that had no cached report
  // to server-render. This is what makes a shared link work.
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    if (initialUrl && !initialReport) {
      void run(initialUrl);
    }
  }, [initialUrl, initialReport, run]);

  // Drive the progress labels while a run is in flight.
  useEffect(() => {
    if (state.phase !== "running") return;

    const timer = window.setInterval(() => {
      const ms = Date.now() - state.startedAt;
      setElapsed(ms);
      const stage = [...STAGES].reverse().find((item) => ms >= item.atMs);
      if (stage) setStageLabel(stage.label);
    }, 250);

    return () => window.clearInterval(timer);
  }, [state]);

  /** Submits the form. */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void run(inputValue);
  }

  // Cap the bar at 95 percent so it never sits at 100 while still waiting.
  const progressPercent = Math.min(95, Math.round((elapsed / 15_000) * 100));

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          inputMode="url"
          autoComplete="url"
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
          {isRunning ? "Checking..." : submitLabel}
        </button>
      </form>

      {state.phase === "error" ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      {isRunning ? (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={styles.progressLabel} aria-live="polite">
            {stageLabel}
          </p>
        </div>
      ) : null}

      {state.phase === "done" ? (
        <VisibilityReportView
          report={state.report}
          cached={state.cached}
          ageSeconds={state.ageSeconds}
          isRunning={false}
          slug={slug}
          focus={focus}
          onRerun={() => void run(state.report.finalUrl, true)}
        />
      ) : null}
    </div>
  );
}
