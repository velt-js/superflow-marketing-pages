"use client";

// The Tech Stack Detector.
//
// URL form in, grouped findings out. The design rule carried over from the
// detection engine: never flatten confidence. Every item renders its
// evidence string and a chip that says whether the signal was a unique
// fingerprint ("detected") or a strong but shareable one ("likely"), so the
// tool cannot overstate what it found.
//
// The engine's `crawlerNote` strings are written for the AI Visibility
// Checker and reference that tool's readability score, so this UI renders
// its own render-mode copy instead. The note still travels in the raw JSON.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type {
  Confidence,
  DetectedItem,
  DetectionResult,
  RenderMode,
} from "@/lib/toolkit/detect";
import { ShareResult } from "@/components/tools/share/ShareResult";
import { techStackSnapshot } from "@/lib/tools/share/build";
import styles from "./TechStack.module.css";

const SLUG = "tech-stack-detector";
const ENDPOINT = "/api/tools/tech-stack";

/** What the endpoint returns. Failures carry `error`; success carries the
 *  detection fields. A bot-blocked fetch carries both, since headers still
 *  yield honest findings. */
type TechStackPayload = Partial<DetectionResult> & {
  url?: string;
  requestedUrl?: string;
  status?: number;
  truncated?: boolean;
  fetchedAt?: string;
  cached?: boolean;
  ageSeconds?: number;
  error?: string;
  errorCode?: string;
};

type SuccessResult = DetectionResult & {
  url: string;
  requestedUrl: string;
  status: number;
  truncated: boolean;
  fetchedAt: string;
  cached: boolean;
  ageSeconds: number;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult; raw: string }
  | {
      phase: "error";
      message: string;
      /** Header-only findings on a bot-blocked fetch. */
      headerFindings: DetectedItem[];
    };

const CONFIDENCE_COPY: Record<Confidence, { label: string; title: string }> = {
  detected: {
    label: "Detected",
    title: "Matched a fingerprint only this product produces.",
  },
  likely: {
    label: "Likely",
    title: "Matched a strong signal that other products can share.",
  },
};

/** Render-mode copy written for this tool. Plain words, no score talk. */
const RENDER_MODE_COPY: Record<RenderMode, { label: string; body: string }> = {
  server: {
    label: "Server rendered",
    body: "The HTML arrives complete from the server. Crawlers and agents that skip JavaScript still get the content.",
  },
  client: {
    label: "Browser rendered",
    body: "The HTML arrives mostly empty and JavaScript builds the page in the browser. Anything that skips JavaScript sees little.",
  },
  hybrid: {
    label: "Mixed rendering",
    body: "Some content is in the HTML the server sends. Some is built by JavaScript afterwards, where a raw fetch cannot see it.",
  },
  unknown: {
    label: "Not clear",
    body: "One fetch was not enough to tell how this page builds its HTML.",
  },
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

/** The detected-vs-likely chip. The two are visually distinct on purpose. */
function ConfidenceChip({ confidence }: { confidence: Confidence }) {
  const copy = CONFIDENCE_COPY[confidence] ?? CONFIDENCE_COPY.likely;
  return (
    <span
      className={`${styles.chip} ${
        confidence === "detected" ? styles.chipDetected : styles.chipLikely
      }`}
      title={copy.title}
    >
      {copy.label}
    </span>
  );
}

/** One detected item: name, confidence chip, and the evidence we matched. */
function ItemRow({ item }: { item: DetectedItem }) {
  return (
    <li className={styles.item}>
      <span className={styles.itemHead}>
        <span className={styles.itemName}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.name}
            </a>
          ) : (
            item.name
          )}
        </span>
        <ConfidenceChip confidence={item.confidence} />
      </span>
      <span className={styles.itemEvidence}>{item.evidence}</span>
    </li>
  );
}

/** A titled group of items. Renders nothing when the group is empty. */
function ItemGroup({ title, items }: { title: string; items: DetectedItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>
        {title} <span className={styles.groupCount}>{items.length}</span>
      </h3>
      <ul className={styles.itemList}>
        {items.map((item) => (
          <ItemRow key={`${item.name}:${item.evidence}`} item={item} />
        ))}
      </ul>
    </section>
  );
}

/** Copies the raw result JSON, for scripts and bug reports. */
function CopyJsonButton({ raw }: { raw: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(raw);
      setState("copied");
      trackEvent(AnalyticsEvents.DOWNLOAD, {
        tool: SLUG,
        kind: "copy",
        label: "raw-json",
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
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Press Ctrl C"
          : "Copy JSON"}
    </button>
  );
}

/**
 * The Tech Stack Detector: URL form, then findings grouped by category.
 */
export function TechStackTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the detection against the endpoint.
   *
   * @param url - The URL to check.
   * @param refresh - True to bypass the 24 hour cache.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({
          phase: "error",
          message: "Enter a URL to check.",
          headerFindings: [],
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
        const payload = (await response.json()) as TechStackPayload;

        if (payload.error) {
          setState({
            phase: "error",
            message: payload.error,
            headerFindings: payload.errorCode === "blocked" ? (payload.hosting ?? []) : [],
          });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: SLUG,
            code: payload.errorCode ?? "unknown",
          });
          return;
        }

        const result = payload as SuccessResult;
        setState({
          phase: "done",
          result,
          raw: JSON.stringify(payload, null, 2),
        });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          platform: result.platform,
          renderMode: result.renderMode,
          cached: result.cached === true,
          itemCount:
            result.analytics.length +
            result.apps.length +
            result.fonts.length +
            result.hosting.length,
        });

        // Put the checked URL in the address bar so the result survives a
        // refresh and the page is shareable. replaceState keeps back sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", result.url);
          window.history.replaceState(null, "", next.toString());
        } catch {
          // A history failure must not lose the result.
        }
      } catch {
        setState({
          phase: "error",
          message:
            "We could not reach the detector. Check your connection and try again.",
          headerFindings: [],
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
          {isRunning ? "Detecting..." : "Detect the stack"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Fetching the page and reading its HTML and headers.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <div className={styles.errorWrap}>
          <p className={styles.formError} role="alert">
            {state.message}
          </p>
          {state.headerFindings.length > 0 ? (
            <section className={styles.blockedCard}>
              <h3 className={styles.groupTitle}>
                What the response headers still show
              </h3>
              <ul className={styles.itemList}>
                {state.headerFindings.map((item) => (
                  <ItemRow key={`${item.name}:${item.evidence}`} item={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {state.phase === "done" ? (
        <ResultView
          result={state.result}
          raw={state.raw}
          onRerun={() => void run(state.result.url, true)}
        />
      ) : null}
    </div>
  );
}

/** The full findings view for one successful run. */
function ResultView({
  result,
  raw,
  onRerun,
}: {
  result: SuccessResult;
  raw: string;
  onRerun: () => void;
}) {
  const renderCopy = RENDER_MODE_COPY[result.renderMode] ?? RENDER_MODE_COPY.unknown;
  const platformKnown = result.platform !== "unknown";
  const nothingFound =
    !platformKnown &&
    result.theme === null &&
    result.apps.length === 0 &&
    result.analytics.length === 0 &&
    result.fonts.length === 0 &&
    result.hosting.length === 0;

  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultHost}>{hostnameOf(result.url)}</p>
          <p className={styles.resultChecked}>
            {result.cached
              ? `Cached result, checked ${formatAge(result.ageSeconds)}`
              : "Checked just now"}
          </p>
        </div>
        <div className={styles.resultActions}>
          <CopyJsonButton raw={raw} />
          {result.cached ? (
            <button type="button" className={styles.ghostButton} onClick={onRerun}>
              Check again fresh
            </button>
          ) : null}
        </div>
      </div>

      {result.status >= 400 ? (
        <p className={styles.notice}>
          The site answered with HTTP {result.status}. Detection ran on the
          page it returned, which may be an error page.
        </p>
      ) : null}

      {result.truncated ? (
        <p className={styles.notice}>
          The page is larger than our 5 MB read limit, so detection ran on the
          first 5 MB.
        </p>
      ) : null}

      <p className={styles.legend}>
        Detected means a fingerprint only that product produces. Likely means
        a strong signal that other products can share. Each item shows the
        evidence it matched.
      </p>

      <div className={styles.headlineGrid}>
        <section className={styles.headlineCard}>
          <h3 className={styles.headlineLabel}>Platform</h3>
          <p className={styles.headlineValue}>
            {platformKnown ? result.platformName : "Not identified"}
            {result.platformConfidence ? (
              <ConfidenceChip confidence={result.platformConfidence} />
            ) : null}
          </p>
          <p className={styles.headlineDetail}>
            {platformKnown && result.platformEvidence
              ? result.platformEvidence
              : "No platform fingerprint matched. The site may be custom built, or built on something outside our list."}
          </p>
          {result.theme ? (
            <p className={styles.themeRow}>
              Theme: <strong>{result.theme.name}</strong>{" "}
              <ConfidenceChip confidence={result.theme.confidence} />
              <span className={styles.itemEvidence}>{result.theme.evidence}</span>
            </p>
          ) : null}
        </section>

        <section className={styles.headlineCard}>
          <h3 className={styles.headlineLabel}>Rendering</h3>
          <p className={styles.headlineValue}>{renderCopy.label}</p>
          <p className={styles.headlineDetail}>{renderCopy.body}</p>
        </section>
      </div>

      {nothingFound ? (
        <p className={styles.notice}>
          Not much turned up in the raw HTML. That does not mean the site uses
          nothing. Tech loaded at runtime by a script manager is invisible to
          a raw fetch, and some stacks leave no reliable fingerprint.
        </p>
      ) : (
        <div className={styles.groupGrid}>
          <ItemGroup title="Analytics and marketing tags" items={result.analytics} />
          <ItemGroup title="Apps and plugins" items={result.apps} />
          <ItemGroup title="Fonts" items={result.fonts} />
          <ItemGroup title="Hosting and CDN" items={result.hosting} />
        </div>
      )}

      <ShareResult snapshot={techStackSnapshot(result)} />
    </div>
  );
}
