"use client";

// The Favicon Checker.
//
// URL form in, a verdict and a check list out. Two design rules carried over
// from the engine:
//
//   1. The headline answer is binary, because the visitor's question is
//      binary. "Does my favicon work" gets yes or no in the largest type on
//      the page, and the fifteen supporting checks sit under it.
//   2. Nothing is asserted that was not fetched. Every icon row renders the
//      real format, the real byte size, and the real pixel dimensions read
//      out of the file header, next to the `sizes` the HTML claimed. Where
//      those two disagree, seeing them side by side IS the finding.
//
// The icon previews are <img> tags pointed straight at the checked site's
// own URLs, so what you see is the file a browser would load, not a copy we
// re-hosted. next/image is deliberately not used: these are arbitrary
// third-party hosts, and routing them through the optimizer would mean
// either an allowlist that cannot exist or a proxy we do not want to run.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type {
  CheckStatus,
  FaviconCheck,
  FaviconIcon,
  FaviconReport,
  IconKind,
} from "@/lib/toolkit/favicon";
import styles from "./Favicon.module.css";

const SLUG = "favicon-checker";
const ENDPOINT = "/api/tools/favicon-checker";

/** What the endpoint returns. Failures carry `error`. */
type FaviconPayload = Partial<FaviconReport> & {
  url?: string;
  requestedUrl?: string;
  status?: number;
  fetchedAt?: string;
  cached?: boolean;
  ageSeconds?: number;
  error?: string;
  errorCode?: string;
};

type SuccessResult = FaviconReport & {
  url: string;
  requestedUrl: string;
  status: number;
  fetchedAt: string;
  cached: boolean;
  ageSeconds: number;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult; raw: string }
  | { phase: "error"; message: string };

/** The glyph and label for each check status. */
const STATUS_COPY: Record<CheckStatus, { glyph: string; label: string }> = {
  pass: { glyph: "✓", label: "Pass" },
  warn: { glyph: "!", label: "Worth fixing" },
  fail: { glyph: "✕", label: "Broken" },
};

/** Human labels for where an icon was declared. */
const KIND_LABELS: Record<IconKind, string> = {
  icon: "Browser tab",
  "apple-touch-icon": "iOS home screen",
  "mask-icon": "Safari pinned tab",
  "manifest-icon": "Web app manifest",
  implicit: "Root fallback",
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
 * Formats a byte count in the largest unit that stays readable.
 *
 * @param bytes - The count.
 */
function formatBytes(bytes: number): string {
  try {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return `${bytes} B`;
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

/**
 * The real dimensions of an icon, as a display string.
 *
 * An .ico holds several sizes, so it gets the list rather than one number.
 *
 * @param icon - A fetched icon.
 */
function realSizeOf(icon: FaviconIcon): string {
  try {
    const fetched = icon.fetch;
    if (!fetched?.usable) return "";
    if (fetched.format === "svg") return "scalable";
    if (fetched.icoSizes.length > 0) {
      return fetched.icoSizes
        .map((size) => `${size.width}x${size.height}`)
        .join(", ");
    }
    if (fetched.dimensions) {
      return `${fetched.dimensions.width}x${fetched.dimensions.height}`;
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Shortens an href for display.
 *
 * Exists for base64 data URIs: an inlined icon is a single unbroken string
 * that can run to tens of kilobytes, and printing it would bury the rest of
 * the row under a wall of characters that tells the reader nothing.
 *
 * @param href - The href as written in the HTML.
 */
function truncateHref(href: string): string {
  try {
    const LIMIT = 120;
    if (href.length <= LIMIT) return href;
    return `${href.slice(0, LIMIT)}... (${href.length} characters)`;
  } catch {
    return href;
  }
}

/** One check: status glyph, what we found, and what to do about it. */
function CheckRow({ check }: { check: FaviconCheck }) {
  const copy = STATUS_COPY[check.status] ?? STATUS_COPY.warn;
  return (
    <li className={`${styles.check} ${styles[check.status]}`}>
      <span className={styles.checkGlyph} aria-hidden="true">
        {copy.glyph}
      </span>
      <div className={styles.checkBody}>
        <p className={styles.checkTitle}>
          {check.title}
          <span className={styles.srOnly}>. {copy.label}.</span>
        </p>
        <p className={styles.checkDetail}>{check.detail}</p>
        {check.fix ? <p className={styles.checkFix}>{check.fix}</p> : null}
      </div>
    </li>
  );
}

/** One icon: a real preview of the file, then what the file actually is. */
function IconRow({ icon }: { icon: FaviconIcon }) {
  const fetched = icon.fetch;
  const usable = fetched?.usable === true;
  const realSize = realSizeOf(icon);
  const claimed = icon.declaredSizes;

  // Only flag a mismatch when both numbers exist and the file is a raster.
  // An SVG declaring sizes="any" is correct, not inconsistent.
  const mismatch =
    usable &&
    claimed !== null &&
    realSize.length > 0 &&
    realSize !== "scalable" &&
    !realSize.split(", ").some((size) => claimed.split(/\s+/).includes(size));

  return (
    <li className={styles.icon}>
      <span className={`${styles.iconPreview} ${usable ? "" : styles.iconDead}`}>
        {usable && icon.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon.url}
            alt=""
            className={styles.iconImage}
            width={32}
            height={32}
            loading="lazy"
          />
        ) : (
          <span aria-hidden="true">✕</span>
        )}
      </span>

      <div className={styles.iconBody}>
        <p className={styles.iconHead}>
          <span className={styles.iconKind}>
            {KIND_LABELS[icon.kind] ?? icon.kind}
          </span>
          <code className={styles.iconRel}>{icon.rel}</code>
        </p>

        {/* Only http(s) icons get a link. Browsers block top-level
            navigation to a data: URI, so linking one would be a dead click,
            and an inlined icon has no address to visit anyway. */}
        <p className={styles.iconHref}>
          {icon.url?.startsWith("http") ? (
            <a href={icon.url} target="_blank" rel="noopener noreferrer">
              {icon.href}
            </a>
          ) : (
            truncateHref(icon.href)
          )}
        </p>

        {usable ? (
          <p className={styles.iconFacts}>
            <span className={styles.iconFact}>{fetched?.format}</span>
            {realSize ? (
              <span className={styles.iconFact}>{realSize}</span>
            ) : null}
            <span className={styles.iconFact}>
              {formatBytes(fetched?.bytes ?? 0)}
            </span>
            {mismatch ? (
              <span className={styles.iconMismatch}>
                declared {claimed}, actually {realSize}
              </span>
            ) : null}
          </p>
        ) : (
          <p className={styles.iconProblem}>
            {fetched?.problem ?? "This icon was not checked."}
          </p>
        )}
      </div>
    </li>
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
 * The Favicon Checker: URL form, a verdict, the check list, and every icon.
 */
export function FaviconTool() {
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
        const payload = (await response.json()) as FaviconPayload;

        if (payload.error) {
          setState({ phase: "error", message: payload.error });
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
          hasWorkingFavicon: result.hasWorkingFavicon === true,
          cached: result.cached === true,
          failCount: result.counts?.fail ?? 0,
          warnCount: result.counts?.warn ?? 0,
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
            "We could not reach the checker. Check your connection and try again.",
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
          {isRunning ? "Checking..." : "Check the favicon"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Reading the page, then fetching every icon it declares.
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
          raw={state.raw}
          onRerun={() => void run(state.result.url, true)}
        />
      ) : null}
    </div>
  );
}

/** The full result view for one successful run. */
function ResultView({
  result,
  raw,
  onRerun,
}: {
  result: SuccessResult;
  raw: string;
  onRerun: () => void;
}) {
  const checks = result.checks ?? [];
  const icons = result.icons ?? [];
  const counts = result.counts ?? { pass: 0, warn: 0, fail: 0 };
  const working = result.hasWorkingFavicon === true;
  const tabIcon = result.tabIcon ?? null;

  // Broken first, then worth-fixing, then the passes. Somebody who opened
  // this tool has a problem; the problems go at the top.
  const ordered = [...checks].sort((left, right) => {
    const rank: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 };
    return (rank[left.status] ?? 3) - (rank[right.status] ?? 3);
  });

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
            <button
              type="button"
              className={styles.ghostButton}
              onClick={onRerun}
            >
              Check again fresh
            </button>
          ) : null}
        </div>
      </div>

      {/* The verdict. The whole reason somebody opened the tool. */}
      <section
        className={`${styles.verdict} ${working ? styles.verdictGood : styles.verdictBad}`}
      >
        <div className={styles.verdictPreview}>
          {working && tabIcon?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tabIcon.url}
              alt={`Favicon for ${hostnameOf(result.url)}`}
              className={styles.verdictImage}
              width={48}
              height={48}
            />
          ) : (
            <span className={styles.verdictGlyph} aria-hidden="true">
              ✕
            </span>
          )}
        </div>
        <div className={styles.verdictText}>
          <h3 className={styles.verdictHeading}>
            {working
              ? "This site has a working favicon"
              : "This site has no working favicon"}
          </h3>
          <p className={styles.verdictBody}>
            {working
              ? "A browser opening this URL gets a real image. The icon above is the file it would use in a tab."
              : "Nothing this page declares loads as an image, and /favicon.ico does not answer either. A browser tab will show the blank page glyph."}
          </p>
          <p className={styles.verdictCounts}>
            {counts.fail} broken · {counts.warn} worth fixing · {counts.pass}{" "}
            passing
          </p>
        </div>
      </section>

      {result.status >= 400 ? (
        <p className={styles.notice}>
          The site answered with HTTP {result.status}. The check ran on the page
          it returned, which may be an error page rather than the real one.
        </p>
      ) : null}

      {result.notFetchedCount > 0 ? (
        <p className={styles.notice}>
          This page declares more icons than we fetch in one run, so{" "}
          {result.notFetchedCount} were left unchecked. The ones listed below
          are the ones we actually looked at.
        </p>
      ) : null}

      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>What we checked</h3>
        <ul className={styles.checkList}>
          {ordered.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </ul>
      </section>

      {icons.length > 0 ? (
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>
            Every icon we fetched{" "}
            <span className={styles.panelCount}>{icons.length}</span>
          </h3>
          <p className={styles.panelHint}>
            The format, the pixel size, and the byte size below are read out of
            the file itself, not out of the HTML. Where the two disagree, that
            is the finding.
          </p>
          <ul className={styles.iconList}>
            {icons.map((icon) => (
              <IconRow key={`${icon.kind}:${icon.href}`} icon={icon} />
            ))}
          </ul>
        </section>
      ) : null}

      {result.manifest ? (
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>Web app manifest</h3>
          <p className={styles.manifestRow}>
            <a
              href={result.manifest.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.manifest.url}
            </a>
          </p>
          <p className={styles.panelHint}>
            {result.manifest.loaded
              ? `Loaded${result.manifest.name ? ` as "${result.manifest.name}"` : ""}, declaring ${result.manifest.declaredIconCount} ${result.manifest.declaredIconCount === 1 ? "icon" : "icons"}.`
              : (result.manifest.problem ?? "The manifest could not be read.")}
          </p>
        </section>
      ) : null}
    </div>
  );
}
