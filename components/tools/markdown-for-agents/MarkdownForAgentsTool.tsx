"use client";

// Markdown for Agents.
//
// URL in, a Markdown document out. The document is the product, so everything
// on this screen is arranged around getting it into the visitor's hands:
// copy, download, and a rendered preview so they can check the conversion
// before they publish it anywhere.
//
// The preview reuses the parser and renderer built for the Markdown Viewer.
// That parser produces a token tree and never produces HTML, and the renderer
// turns tokens into React elements, so a converted page containing a script
// tag renders those characters instead of executing them. No Markdown
// dependency, no dangerouslySetInnerHTML, no sanitizer to keep in sync.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { parseMarkdown } from "@/lib/tools/markdown/parse";
import { MarkdownRender } from "@/components/tools/markdown/MarkdownRender";
import {
  CopyTextButton,
  DownloadTextButton,
} from "@/components/tools/text-output/TextActions";
import type { MarkdownForAgentsReport } from "@/lib/tools/free-tools/reports";
import styles from "./MarkdownForAgents.module.css";
import { runToolRequest, ToolRunError } from "@/lib/tools/client/run-tool";

const SLUG = "markdown-for-agents";
const ENDPOINT = "/api/tools/markdown-for-agents";

/** What the endpoint returns. `ok` is the discriminator. */
type ApiPayload = {
  ok?: boolean;
  code?: string;
  message?: string;
  report?: MarkdownForAgentsReport;
  cached?: boolean;
  ageSeconds?: number;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | {
      phase: "done";
      report: MarkdownForAgentsReport;
      cached: boolean;
      ageSeconds: number;
    }
  | { phase: "error"; message: string };

type View = "raw" | "preview";

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
 * A filename for the downloaded document, derived from the page URL so a
 * folder full of them stays readable.
 *
 * @param url - The page that was converted.
 */
function fileNameFor(url: string): string {
  try {
    const parsed = new URL(url);
    const raw = `${parsed.hostname}${parsed.pathname}`;
    const slug = raw
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80);
    return `${slug || "page"}.md`;
  } catch {
    return "page.md";
  }
}

/**
 * A byte count in words a person reads rather than parses.
 *
 * @param bytes - Size of the document.
 */
function formatBytes(bytes: number): string {
  try {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return `${bytes} bytes`;
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
    if (minutes < 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } catch {
    return "recently";
  }
}

export function MarkdownForAgentsTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const [view, setView] = useState<View>("raw");
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";
  const report = state.phase === "done" ? state.report : null;

  // Parsing a 1.5 MB document is not free, so it only happens when the
  // preview is actually on screen.
  const parsed = useMemo(() => {
    if (!report || view !== "preview") return null;
    return parseMarkdown(report.markdown);
  }, [report, view]);

  /**
   * Runs the conversion against the endpoint.
   *
   * @param url - The page to convert.
   * @param refresh - True to bypass the 24 hour cache.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({ phase: "error", message: "Enter a URL to convert." });
        return;
      }

      setState({ phase: "running" });
      setView("raw");
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG, refresh });

      try {
        // The waiting happens here rather than on the server: these runs can
        // outlast what one serverless request may hold open. See
        // lib/tools/client/run-tool.ts.
        const payload = await runToolRequest<ApiPayload>({
          endpoint: ENDPOINT,
          body: { url: trimmed, refresh },
        });

        if (payload.ok !== true || !payload.report) {
          const message =
            payload.message ??
            "Something went wrong converting that page. Try again in a moment.";
          setState({ phase: "error", message });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: SLUG,
            code: payload.code ?? "unknown",
          });
          return;
        }

        setState({
          phase: "done",
          report: payload.report,
          cached: payload.cached === true,
          ageSeconds: payload.ageSeconds ?? 0,
        });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          cached: payload.cached === true,
          wordCount: payload.report.wordCount,
          bytes: payload.report.bytes,
          truncated: payload.report.truncated,
        });

        // Put the converted URL in the address bar so the result survives a
        // refresh and the page is shareable. replaceState keeps back sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", payload.report.url || trimmed);
          window.history.replaceState(null, "", next.toString());
        } catch {
          // A history failure must not lose the document.
        }
      } catch (error) {
        // A run that never answered carries its own copy; anything else is a
        // connection problem and reads as one.
        const runError = error instanceof ToolRunError ? error : null;
        setState({
          phase: "error",
          message:
            runError?.message ??
            "We could not reach the converter. Check your connection and try again.",
        });
        trackEvent(AnalyticsEvents.TOOL_ERROR, {
          tool: SLUG,
          code: runError?.code ?? "network",
        });
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
          placeholder="yourwebsite.com/pricing"
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
          {isRunning ? "Converting..." : "Convert to Markdown"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Fetching the page and converting it. This usually takes a few seconds.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <ResultView
          report={state.report}
          cached={state.cached}
          ageSeconds={state.ageSeconds}
          view={view}
          onViewChange={setView}
          previewBlocks={parsed?.blocks ?? null}
          onRerun={() => void run(state.report.url || inputValue, true)}
        />
      ) : null}
    </div>
  );
}

/** The document, its stats, and everything you can do with it. */
function ResultView({
  report,
  cached,
  ageSeconds,
  view,
  onViewChange,
  previewBlocks,
  onRerun,
}: {
  report: MarkdownForAgentsReport;
  cached: boolean;
  ageSeconds: number;
  view: View;
  onViewChange: (next: View) => void;
  previewBlocks: ReturnType<typeof parseMarkdown>["blocks"] | null;
  onRerun: () => void;
}) {
  const fileName = fileNameFor(report.url || report.requestedUrl);

  return (
    <div className={styles.result} data-testid="markdown-result">
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultTitle}>
            {report.title || hostnameOf(report.url || report.requestedUrl)}
          </p>
          <p className={styles.resultSub}>
            {hostnameOf(report.url || report.requestedUrl)}
            {cached
              ? ` · Cached, converted ${formatAge(ageSeconds)}`
              : " · Converted just now"}
          </p>
        </div>
        <div className={styles.resultActions}>
          <CopyTextButton
            value={report.markdown}
            label="Copy Markdown"
            tool={SLUG}
            analyticsLabel="markdown"
            primary
          />
          <DownloadTextButton
            value={report.markdown}
            fileName={fileName}
            label="Download .md"
            tool={SLUG}
          />
          {cached ? (
            <button
              type="button"
              className={styles.ghostButton}
              onClick={onRerun}
            >
              Convert again fresh
            </button>
          ) : null}
        </div>
      </div>

      {report.truncated ? (
        <p className={styles.notice}>
          This page is longer than the size limit, so the document below stops
          part way through. A note saying the same thing is included at the end
          of the file.
        </p>
      ) : null}

      {report.httpStatus >= 400 ? (
        <p className={styles.notice}>
          The page answered with HTTP {report.httpStatus}, so this may be an
          error page rather than the content you wanted.
        </p>
      ) : null}

      <div className={styles.statsRow}>
        <span className={styles.stat}>
          <strong>{report.wordCount.toLocaleString()}</strong> words
        </span>
        <span className={styles.stat}>
          <strong>{formatBytes(report.bytes)}</strong>
        </span>
        <span className={styles.stat}>
          Saves as <strong>{fileName}</strong>
        </span>
      </div>

      <div className={styles.viewSwitch} role="tablist" aria-label="Output view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "raw"}
          className={`${styles.viewTab} ${view === "raw" ? styles.viewTabActive : ""}`}
          onClick={() => onViewChange("raw")}
        >
          Markdown
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "preview"}
          className={`${styles.viewTab} ${view === "preview" ? styles.viewTabActive : ""}`}
          onClick={() => onViewChange("preview")}
        >
          Preview
        </button>
      </div>

      {view === "raw" ? (
        <textarea
          className={styles.output}
          data-testid="markdown-output"
          readOnly
          spellCheck={false}
          aria-label="Converted Markdown"
          value={report.markdown}
        />
      ) : (
        <div className={styles.preview} data-testid="markdown-preview">
          {previewBlocks ? <MarkdownRender blocks={previewBlocks} /> : null}
        </div>
      )}

      {report.description ? (
        <p className={styles.metaLine}>
          Page description: {report.description}
        </p>
      ) : null}
    </div>
  );
}
