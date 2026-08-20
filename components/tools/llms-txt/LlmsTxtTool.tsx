"use client";

// llms.txt Generator.
//
// Two documents come back from one run, and they are not interchangeable:
// llms.txt is a short index of links, llms-full.txt is the same site with the
// page content inlined and is usually a hundred times larger. Showing them in
// one scrolling column would invite people to copy the wrong one, so each gets
// its own tab with its own copy and download buttons and its own filename.
//
// The pages discovered against pages included numbers are on screen for the
// same reason. A run over a 200 page site that inlines 15 of them has produced
// something useful and partial, and the visitor should learn that here rather
// than after publishing the file.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  CopyTextButton,
  DownloadTextButton,
} from "@/components/tools/text-output/TextActions";
import type { LlmsTxtReport } from "@/lib/tools/free-tools/reports";
import { ShareResult } from "@/components/tools/share/ShareResult";
import { llmsTxtSnapshot } from "@/lib/tools/share/build";
import styles from "./LlmsTxt.module.css";

const SLUG = "llms-txt-generator";
const ENDPOINT = "/api/tools/llms-txt-generator";

/** What the endpoint returns. `ok` is the discriminator. */
type ApiPayload = {
  ok?: boolean;
  code?: string;
  message?: string;
  report?: LlmsTxtReport;
  cached?: boolean;
  ageSeconds?: number;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | {
      phase: "done";
      report: LlmsTxtReport;
      cached: boolean;
      ageSeconds: number;
    }
  | { phase: "error"; message: string };

type Tab = "index" | "full";

/** The two files, in the order the spec introduces them. */
const TABS: ReadonlyArray<{ id: Tab; fileName: string }> = [
  { id: "index", fileName: "llms.txt" },
  { id: "full", fileName: "llms-full.txt" },
];

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
 * The site root a generated file belongs at, as a full URL to show the
 * visitor. This is the question everybody asks next.
 *
 * @param url - Any URL from the run.
 * @param fileName - The file to place, e.g. "llms.txt".
 */
function rootPathFor(url: string, fileName: string): string {
  try {
    return new URL(`/${fileName}`, url).toString();
  } catch {
    return `https://yoursite.com/${fileName}`;
  }
}

/**
 * A byte count in words a person reads rather than parses.
 *
 * @param text - The document to measure.
 */
function formatSize(text: string): string {
  try {
    const bytes = new TextEncoder().encode(text).length;
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return `${text.length} characters`;
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

export function LlmsTxtTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const [tab, setTab] = useState<Tab>("index");
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the generator against the endpoint.
   *
   * @param url - The site to inventory.
   * @param refresh - True to bypass the 24 hour cache.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({ phase: "error", message: "Enter a site URL." });
        return;
      }

      setState({ phase: "running" });
      setTab("index");
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG, refresh });

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed, refresh }),
        });
        const payload = (await response.json()) as ApiPayload;

        if (payload.ok !== true || !payload.report) {
          const message =
            payload.message ??
            "Something went wrong generating those files. Try again in a moment.";
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
          pagesDiscovered: payload.report.pagesDiscovered,
          pagesIncluded: payload.report.pagesIncluded,
          truncated: payload.report.truncated,
        });

        // Put the site in the address bar so the result survives a refresh
        // and the page is shareable. replaceState keeps back sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", payload.report.url || trimmed);
          window.history.replaceState(null, "", next.toString());
        } catch {
          // A history failure must not lose the documents.
        }
      } catch {
        setState({
          phase: "error",
          message:
            "We could not reach the generator. Check your connection and try again.",
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
          placeholder="yourwebsite.com"
          aria-label="Site URL"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isRunning}
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={isRunning || inputValue.trim().length === 0}
        >
          {isRunning ? "Generating..." : "Generate llms.txt"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Reading robots.txt and your sitemaps, then converting pages. This
          takes up to half a minute on a large site.
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
          tab={tab}
          onTabChange={setTab}
          onRerun={() => void run(state.report.url || inputValue, true)}
        />
      ) : null}
    </div>
  );
}

/** The two documents, their counts, and where to put them. */
function ResultView({
  report,
  cached,
  ageSeconds,
  tab,
  onTabChange,
  onRerun,
}: {
  report: LlmsTxtReport;
  cached: boolean;
  ageSeconds: number;
  tab: Tab;
  onTabChange: (next: Tab) => void;
  onRerun: () => void;
}) {
  const site = report.url || report.requestedUrl;
  const active = useMemo(() => {
    return tab === "index"
      ? {
          fileName: "llms.txt",
          body: report.llmsTxt,
          blurb:
            "An index. One H1 with the site name, a one line summary, then sections of links. This is the file the convention is actually about.",
        }
      : {
          fileName: "llms-full.txt",
          body: report.llmsFullTxt,
          blurb:
            "The same site with each included page converted to Markdown and inlined, so a model can read the content without fetching anything.",
        };
  }, [tab, report.llmsTxt, report.llmsFullTxt]);

  const emptyFull = tab === "full" && active.body.trim().length === 0;

  return (
    <div className={styles.result} data-testid="llms-result">
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultTitle}>
            {report.siteName || hostnameOf(site)}
          </p>
          <p className={styles.resultSub}>
            {hostnameOf(site)}
            {cached
              ? ` · Cached, generated ${formatAge(ageSeconds)}`
              : " · Generated just now"}
          </p>
        </div>
        {cached ? (
          <button type="button" className={styles.ghostButton} onClick={onRerun}>
            Generate again fresh
          </button>
        ) : null}
      </div>

      <div className={styles.statsRow}>
        <span className={styles.stat}>
          <strong>{report.pagesDiscovered.toLocaleString()}</strong> pages found
        </span>
        <span className={styles.stat}>
          <strong>{report.pagesIncluded.toLocaleString()}</strong> pages
          included in llms-full.txt
        </span>
      </div>

      {report.truncated ? (
        <p className={styles.notice}>
          This site has more pages than one run can cover, so the files below
          are a sample rather than the whole site. Use them as a starting point
          and add the pages you care about most.
        </p>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="Generated files">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`${styles.tab} ${tab === entry.id ? styles.tabActive : ""}`}
            onClick={() => onTabChange(entry.id)}
          >
            {entry.fileName}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelMeta}>
            <p className={styles.panelTitle}>{active.fileName}</p>
            <p className={styles.panelBlurb}>{active.blurb}</p>
          </div>
          <div className={styles.panelActions}>
            <CopyTextButton
              value={active.body}
              label="Copy"
              tool={SLUG}
              analyticsLabel={active.fileName}
              primary
            />
            <DownloadTextButton
              value={active.body}
              fileName={active.fileName}
              label={`Download ${active.fileName}`}
              tool={SLUG}
              mimeType="text/plain;charset=utf-8"
            />
          </div>
        </div>

        <p className={styles.placement}>
          Save this at your site root so it answers at{" "}
          <code className={styles.code}>
            {rootPathFor(site, active.fileName)}
          </code>
          . Serve it as plain text. Nothing else needs to change.
        </p>

        {emptyFull ? (
          <p className={styles.notice}>
            No page content could be converted for this site, so llms-full.txt
            is empty. The llms.txt index above is still valid and worth
            publishing on its own.
          </p>
        ) : (
          <textarea
            className={styles.output}
            data-testid={`llms-output-${tab}`}
            readOnly
            spellCheck={false}
            aria-label={active.fileName}
            value={active.body}
          />
        )}

        <p className={styles.sizeLine}>
          {formatSize(active.body)} ·{" "}
          {active.body.split("\n").length.toLocaleString()} lines
        </p>
      </div>

      <ShareResult snapshot={llmsTxtSnapshot(report)} />
    </div>
  );
}
