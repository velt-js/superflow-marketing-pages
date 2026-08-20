"use client";

// The Full Page Screenshot tool.
//
// URL form in, one very tall PNG out. Three things drive the design:
//
// 1. THE IMAGE IS THE PRODUCT. It renders as a plain <img>, not next/image,
//    because the file lives in a Google Cloud Storage bucket and next/image
//    would need that host added to remotePatterns before it would load at
//    all. A plain tag also means no re-encoding of a capture the visitor is
//    about to download.
// 2. THE LINK EXPIRES. The bucket URL is signed and dies about 24 hours after
//    the capture. Saying so once, plainly, next to the download button is the
//    difference between a tool people trust and an image that silently 404s
//    next week.
// 3. A CAPTURE IS TALLER THAN A SCREEN. The default view is a scrollable
//    frame, so the page layout survives a 20,000 pixel image, with a toggle
//    for anyone who wants the whole thing laid out down the page.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { ShareResult } from "@/components/tools/share/ShareResult";
import { screenshotSnapshot } from "@/lib/tools/share/build";
import styles from "./Screenshot.module.css";

const SLUG = "full-page-screenshot";
const ENDPOINT = "/api/tools/full-page-screenshot";

/** What the endpoint returns. Failures carry `error`, results carry a URL. */
type ScreenshotPayload = {
  imageUrl?: string;
  expiresAt?: string | number;
  bytes?: number;
  width?: number;
  height?: number;
  deviceType?: string;
  durationMs?: number;
  url?: string;
  requestedUrl?: string;
  capturedAt?: string;
  cached?: boolean;
  ageSeconds?: number;
  error?: string;
  errorCode?: string;
};

type SuccessResult = ScreenshotPayload & { imageUrl: string; url: string };

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult }
  | { phase: "error"; message: string; code: string };

/** How the image itself is behaving, tracked separately from the run. */
type ImageState = "loading" | "loaded" | "failed";

/**
 * Formats a byte count the way a person reads it.
 *
 * @param bytes - Size in bytes.
 */
function formatBytes(bytes: number): string {
  try {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
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
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } catch {
    return "recently";
  }
}

/**
 * Turns the backend's expiry into epoch milliseconds.
 *
 * It sends epoch milliseconds today and could reasonably send ISO 8601
 * tomorrow, so both are read rather than assuming one.
 *
 * @param expiresAt - Whatever the backend sent.
 */
function expiryMs(expiresAt: string | number | undefined): number | null {
  try {
    if (typeof expiresAt === "number" && Number.isFinite(expiresAt)) {
      return expiresAt;
    }
    if (typeof expiresAt === "string" && expiresAt.length > 0) {
      const parsed = Date.parse(expiresAt);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * How long the link has left, in words. Returns null when there is no usable
 * expiry, so the caller can fall back to the flat "about 24 hours" line
 * rather than printing a wrong number.
 *
 * @param expiresAt - Whatever the backend sent.
 */
function timeLeftPhrase(expiresAt: string | number | undefined): string | null {
  try {
    const target = expiryMs(expiresAt);
    if (target === null) return null;
    const remainingMs = target - Date.now();
    if (remainingMs <= 0) return "expired";
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    if (hours >= 1) return `about ${hours} ${hours === 1 ? "hour" : "hours"}`;
    const minutes = Math.max(1, Math.round(remainingMs / (60 * 1000)));
    return `about ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  } catch {
    return null;
  }
}

/**
 * A filename for the download, derived from the captured host and the date.
 *
 * @param url - The URL that was captured.
 */
function downloadName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const date = new Date().toISOString().slice(0, 10);
    return `${host}-full-page-${date}.png`;
  } catch {
    return "full-page-screenshot.png";
  }
}

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

/** Copies the signed link, with the expiry stated next to the button. */
function CopyLinkButton({ imageUrl }: { imageUrl: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setState("copied");
      trackEvent(AnalyticsEvents.SHARE_CLICK, {
        tool: SLUG,
        kind: "copy",
        label: "image-link",
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
          : "Copy image link"}
    </button>
  );
}

/**
 * The Full Page Screenshot tool: URL form, then the capture.
 */
export function ScreenshotTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const [imageState, setImageState] = useState<ImageState>("loading");
  const [expanded, setExpanded] = useState(false);
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the capture against the endpoint.
   *
   * @param url - The URL to capture.
   * @param refresh - True to bypass the cache and take a fresh capture.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({
          phase: "error",
          message: "Enter a URL to capture.",
          code: "empty",
        });
        return;
      }

      setState({ phase: "running" });
      setImageState("loading");
      setExpanded(false);
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG, refresh });

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed, refresh }),
        });
        const payload = (await response.json()) as ScreenshotPayload;

        if (payload.error || !payload.imageUrl) {
          const message =
            payload.error ??
            "The capture finished but no image came back. Try again in a moment.";
          setState({
            phase: "error",
            message,
            code: payload.errorCode ?? "unknown",
          });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: SLUG,
            code: payload.errorCode ?? "unknown",
          });
          return;
        }

        const result = payload as SuccessResult;
        setState({ phase: "done", result });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          cached: result.cached === true,
          bytes: result.bytes ?? 0,
          height: result.height ?? 0,
          deviceType: result.deviceType ?? "unknown",
        });

        // Put the captured URL in the address bar so a refresh keeps the
        // result. replaceState keeps the back button sane.
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
            "We could not reach the screenshot service. Check your connection and try again.",
          code: "network",
        });
        trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: SLUG, code: "network" });
      }
    },
    [trackEvent],
  );

  // Auto-run when the page is opened with a ?url=, which is what makes a
  // shared link work.
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
          {isRunning ? "Capturing..." : "Capture the page"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Loading the page in a real browser and scrolling to the bottom so
          lazy images load. This takes a few seconds.
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
          imageState={imageState}
          onImageState={setImageState}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((value) => !value)}
          onRecapture={() => void run(state.result.url, true)}
        />
      ) : null}
    </div>
  );
}

/** The capture, its facts, and the two things you can do with it. */
function ResultView({
  result,
  imageState,
  onImageState,
  expanded,
  onToggleExpanded,
  onRecapture,
}: {
  result: SuccessResult;
  imageState: ImageState;
  onImageState: (next: ImageState) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  onRecapture: () => void;
}) {
  const { trackEvent } = useAnalytics();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const timeLeft = timeLeftPhrase(result.expiresAt);
  const linkExpired = timeLeft === "expired";

  // The JSX onLoad and onError below are the normal path. This effect is the
  // backstop for the case they cannot cover: an image that already finished,
  // successfully or not, before React attached its handlers. A complete image
  // with a zero natural width is a failed one, and without this check it
  // would sit there as an empty frame with no explanation.
  useEffect(() => {
    const element = imgRef.current;
    if (!element) return undefined;

    if (element.complete) {
      onImageState(element.naturalWidth > 0 ? "loaded" : "failed");
      return undefined;
    }

    /** Marks the image as loaded. */
    const handleLoad = () => onImageState("loaded");
    /** Marks the image as failed. */
    const handleError = () => onImageState("failed");

    element.addEventListener("load", handleLoad);
    element.addEventListener("error", handleError);
    return () => {
      element.removeEventListener("load", handleLoad);
      element.removeEventListener("error", handleError);
    };
  }, [result.imageUrl, onImageState]);

  const dimensions =
    result.width && result.height
      ? `${result.width} by ${result.height} pixels`
      : result.height
        ? `${result.height} pixels tall`
        : null;

  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultHost}>{hostnameOf(result.url)}</p>
          <p className={styles.resultChecked}>
            {result.cached
              ? `Captured ${formatAge(result.ageSeconds ?? 0)}`
              : "Captured just now"}
          </p>
        </div>
        <div className={styles.resultActions}>
          <a
            className={styles.primaryButton}
            href={result.imageUrl}
            download={downloadName(result.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent(AnalyticsEvents.DOWNLOAD, {
                tool: SLUG,
                kind: "image",
                bytes: result.bytes ?? 0,
              })
            }
          >
            Download PNG
          </a>
          <CopyLinkButton imageUrl={result.imageUrl} />
          <button
            type="button"
            className={styles.ghostButton}
            onClick={onRecapture}
          >
            Capture again
          </button>
        </div>
      </div>

      {/* The single most important sentence on this page. A capture whose
          link quietly dies is worse than no capture, so the expiry is stated
          next to the download button, not buried in the FAQ. */}
      <p
        className={`${styles.expiryNote} ${
          linkExpired ? styles.expiryNoteStale : ""
        }`}
      >
        {linkExpired ? (
          <>
            This image link has expired. Capture the page again to get a fresh
            one.
          </>
        ) : (
          <>
            This image link works for {timeLeft ?? "about 24 hours"} and then
            stops working. Download the file if you need to keep it.
          </>
        )}
      </p>

      <dl className={styles.factGrid}>
        {dimensions ? (
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Size on screen</dt>
            <dd className={styles.factValue}>{dimensions}</dd>
          </div>
        ) : null}
        {result.bytes ? (
          <div className={styles.fact}>
            <dt className={styles.factLabel}>File size</dt>
            <dd className={styles.factValue}>{formatBytes(result.bytes)}</dd>
          </div>
        ) : null}
        {result.deviceType ? (
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Viewport</dt>
            <dd className={styles.factValue}>{result.deviceType}</dd>
          </div>
        ) : null}
        {result.durationMs ? (
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Capture time</dt>
            <dd className={styles.factValue}>
              {(result.durationMs / 1000).toFixed(1)} seconds
            </dd>
          </div>
        ) : null}
      </dl>

      <div className={styles.viewerHead}>
        <p className={styles.viewerHint}>
          {expanded
            ? "Showing the whole capture down the page."
            : "Scroll inside the frame to see the whole page."}
        </p>
        <button
          type="button"
          className={styles.ghostButton}
          onClick={onToggleExpanded}
          aria-expanded={expanded}
        >
          {expanded ? "Fit to frame" : "Show full height"}
        </button>
      </div>

      {/* A broken image icon tells the visitor nothing. An expired or blocked
          link gets words instead. */}
      {imageState === "failed" ? (
        <p className={styles.imageError} role="alert">
          The image did not load. The link may have expired, or your network
          may be blocking our storage bucket. Capture the page again to get a
          fresh link.
        </p>
      ) : null}

      <div
        className={`${styles.viewer} ${expanded ? styles.viewerExpanded : ""} ${
          imageState === "failed" ? styles.viewerHidden : ""
        }`}
      >
        {/* Plain img on purpose: the file is on a storage bucket that
            next/image is not configured for, and re-encoding a capture the
            visitor is about to download would be pointless. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          className={styles.image}
          src={result.imageUrl}
          alt={`Full page screenshot of ${hostnameOf(result.url)}`}
          width={result.width}
          height={result.height}
          onLoad={() => onImageState("loaded")}
          onError={() => onImageState("failed")}
        />
      </div>

      {/* The share card describes the capture rather than showing it: the PNG
          lives behind a signed URL that expires in 24 hours, and a card that
          404s a week after it was posted is worse than one without the
          picture. The permalink re-captures, so it never goes stale. */}
      <ShareResult snapshot={screenshotSnapshot(result)} />
    </div>
  );
}
