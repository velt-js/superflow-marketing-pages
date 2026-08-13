"use client";

// The Alt Text Generator.
//
// URL form in, one row per image out. The design rule that matters most here
// is the one everybody else gets wrong: MISSING ALT AND EMPTY ALT ARE NOT THE
// SAME THING.
//
//   <img src="cat.jpg">            no alt attribute. A bug. A screen reader
//                                  is left reading out the filename.
//   <img src="swirl.png" alt="">   an empty alt attribute. Correct HTML, and
//                                  a deliberate instruction to skip a purely
//                                  decorative image.
//
// A tool that reports both as "no alt text" tells people to fill in the
// second one, which makes the page worse. So the two render differently, and
// an image the model judges decorative gets "should stay empty" rather than a
// sentence to paste in.
//
// The other rule: these are drafts. Alt text is contextual, and the model
// cannot see how the image is used on the page. The UI says so where somebody
// is about to copy, not only in the FAQ.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./AltText.module.css";

const SLUG = "alt-text-generator";
const ENDPOINT = "/api/tools/alt-text-generator";

type AltTextImage = {
  src: string;
  hadAlt: boolean;
  currentAlt: string;
  suggestedAlt: string;
  isDecorative: boolean;
  skippedReason?: string;
};

type AltTextCounts = {
  found: number;
  analyzed: number;
  missingAlt: number;
  skipped: number;
};

/** What the endpoint returns. Failures carry `error`. */
type AltTextPayload = {
  url?: string;
  requestedUrl?: string;
  httpStatus?: number;
  images?: AltTextImage[];
  counts?: AltTextCounts;
  model?: string;
  costMicroUsd?: number;
  durationMs?: number;
  checkedAt?: string;
  cached?: boolean;
  ageSeconds?: number;
  error?: string;
  errorCode?: string;
};

type SuccessResult = AltTextPayload & {
  url: string;
  images: AltTextImage[];
  counts: AltTextCounts;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult }
  /** `calm` marks the expected states: a spent budget, a used-up hour. */
  | { phase: "error"; message: string; code: string; calm: boolean };

/** Backend codes that are normal operating states rather than faults. */
const CALM_CODES = new Set(["budget-exhausted", "rate-limited"]);

/** How one image row should read. */
type RowStatus = "skipped" | "missing" | "empty" | "present";

/** Plain-words copy for each reason an image never reached the model. */
const SKIP_REASONS: Record<string, string> = {
  "over-image-cap": "Past the 10 image limit for one run.",
  "unsupported-content-type":
    "Not a photo or raster image, so there was nothing for the model to look at.",
  "tracking-pixel": "Looks like a tracking pixel rather than content.",
  "too-large": "The file was too large to send to the model.",
  "fetch-failed": "We could not download the image file.",
  "data-uri": "The image is embedded in the page rather than hosted as a file.",
};

/**
 * Decodes the HTML entities that survive in an attribute value.
 *
 * The backend returns `src` exactly as it appears in the page source, so a
 * query string arrives as `a=1&amp;b=2`. Handing that to an img tag requests
 * a parameter literally called `amp;b`, so it is decoded once for display and
 * re-escaped when we write HTML back out.
 *
 * @param value - A raw attribute value from the page source.
 */
function decodeEntities(value: string): string {
  try {
    return value
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  } catch {
    return value;
  }
}

/**
 * Escapes a string for use inside a double-quoted HTML attribute.
 *
 * @param value - Text to escape.
 */
function escapeAttribute(value: string): string {
  try {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  } catch {
    return value;
  }
}

/**
 * Classifies one image for display.
 *
 * @param image - One entry from the report.
 */
function statusOf(image: AltTextImage): RowStatus {
  try {
    if (image.skippedReason) return "skipped";
    if (!image.hadAlt) return "missing";
    if (image.currentAlt.trim().length === 0) return "empty";
    return "present";
  } catch {
    return "present";
  }
}

/**
 * True when the row has something worth copying.
 *
 * A decorative image does not: the right answer for it is an empty alt, and
 * offering a sentence next to it would invite exactly the wrong edit.
 *
 * @param image - One entry from the report.
 */
function hasUsableSuggestion(image: AltTextImage): boolean {
  return (
    !image.skippedReason &&
    !image.isDecorative &&
    image.suggestedAlt.trim().length > 0
  );
}

/**
 * The filename at the end of an image URL, for a compact label.
 *
 * @param src - The image URL.
 */
function fileNameOf(src: string): string {
  try {
    const path = new URL(src, "https://example.com").pathname;
    const last = path.split("/").filter(Boolean).pop();
    return last && last.length > 0 ? decodeURIComponent(last) : src;
  } catch {
    return src;
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

/** A small copy button that flashes its state. */
function CopyButton({
  text,
  label,
  variant = "ghost",
  onCopied,
}: {
  text: string;
  label: string;
  variant?: "ghost" | "primary";
  onCopied?: () => void;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      onCopied?.();
    } catch {
      setState("failed");
    } finally {
      window.setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      className={variant === "primary" ? styles.primaryButton : styles.ghostButton}
      onClick={copy}
      aria-live="polite"
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl C" : label}
    </button>
  );
}

/**
 * The image thumbnail, which falls back to words rather than a broken icon.
 *
 * These files are on somebody else's server, so a good share of them will not
 * load: hotlink protection, an expired CDN path, a private network. That is
 * expected here rather than exceptional, which is why the fallback is a
 * deliberate box and not a browser default.
 */
function Thumbnail({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Backstop for an image that finished, successfully or not, before React
  // attached its onError. A complete image with zero natural width failed.
  useEffect(() => {
    const element = imgRef.current;
    if (!element) return undefined;

    if (element.complete && element.naturalWidth === 0) {
      setFailed(true);
      return undefined;
    }

    /** Marks the thumbnail as unavailable. */
    const handleError = () => setFailed(true);
    element.addEventListener("error", handleError);
    return () => element.removeEventListener("error", handleError);
  }, [src]);

  if (failed) {
    return (
      <div className={styles.thumbFallback} aria-hidden="true">
        No preview
      </div>
    );
  }

  return (
    // Plain img on purpose: these files are on somebody else's server, which
    // next/image cannot load without that host in remotePatterns.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      className={styles.thumb}
      src={src}
      alt={`Preview of ${label}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * The Alt Text Generator: URL form, then one row per image.
 */
export function AltTextTool() {
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const { trackEvent } = useAnalytics();
  const autoRan = useRef(false);

  const isRunning = state.phase === "running";

  /**
   * Runs the generator against the endpoint.
   *
   * @param url - The page to read.
   * @param refresh - True to bypass the cache and pay for a fresh run.
   */
  const run = useCallback(
    async (url: string, refresh = false) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) {
        setState({
          phase: "error",
          message: "Enter a URL to check.",
          code: "empty",
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
        const payload = (await response.json()) as AltTextPayload;

        if (payload.error) {
          const code = payload.errorCode ?? "unknown";
          setState({
            phase: "error",
            message: payload.error,
            code,
            calm: CALM_CODES.has(code),
          });
          trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: SLUG, code });
          return;
        }

        const result: SuccessResult = {
          ...payload,
          url: payload.url ?? trimmed,
          images: payload.images ?? [],
          counts:
            payload.counts ??
            { found: 0, analyzed: 0, missingAlt: 0, skipped: 0 },
        };
        setState({ phase: "done", result });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          cached: result.cached === true,
          found: result.counts.found,
          analyzed: result.counts.analyzed,
          missingAlt: result.counts.missingAlt,
        });

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
            "We could not reach the generator. Check your connection and try again.",
          code: "network",
          calm: false,
        });
        trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: SLUG, code: "network" });
      }
    },
    [trackEvent],
  );

  // Auto-run when the page is opened with a ?url=. Shared links land on the
  // 24 hour cache, so this does not re-spend the model budget.
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
          placeholder="yourwebsite.com/page"
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
          {isRunning ? "Reading images..." : "Write the alt text"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Reading the page, collecting the images, and showing the first ten to
          a vision model. This takes a few seconds.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <p
          className={state.calm ? styles.calmNotice : styles.formError}
          role={state.calm ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <ResultView
          result={state.result}
          onRerun={() => void run(state.result.url, true)}
        />
      ) : null}
    </div>
  );
}

/** The counts summary and the rows. */
function ResultView({
  result,
  onRerun,
}: {
  result: SuccessResult;
  onRerun: () => void;
}) {
  const { trackEvent } = useAnalytics();
  const { counts, images } = result;

  // One HTML block for everything worth pasting, decorative images included,
  // because alt="" is the correct markup for those and leaving them out of
  // the block would imply otherwise.
  const htmlBlock = useMemo(() => {
    try {
      return images
        .filter(
          (image) =>
            !image.skippedReason &&
            (image.isDecorative || image.suggestedAlt.trim().length > 0),
        )
        .map((image) => {
          const alt = image.isDecorative ? "" : image.suggestedAlt.trim();
          return `<img src="${escapeAttribute(decodeEntities(image.src))}" alt="${escapeAttribute(alt)}">`;
        })
        .join("\n");
    } catch {
      return "";
    }
  }, [images]);

  if (images.length === 0) {
    return (
      <div className={styles.result}>
        <ResultHead result={result} onRerun={onRerun} />
        <p className={styles.calmNotice}>
          We did not find any images on that page. Nothing to write alt text
          for, which is its own kind of clean bill of health.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.result}>
      <ResultHead result={result} onRerun={onRerun} />

      <dl className={styles.countGrid}>
        <div className={styles.count}>
          <dt className={styles.countLabel}>Images found</dt>
          <dd className={styles.countValue}>{counts.found}</dd>
        </div>
        <div className={styles.count}>
          <dt className={styles.countLabel}>Sent to the model</dt>
          <dd className={styles.countValue}>{counts.analyzed}</dd>
        </div>
        <div className={`${styles.count} ${counts.missingAlt > 0 ? styles.countAlarm : ""}`}>
          <dt className={styles.countLabel}>Missing alt</dt>
          <dd className={styles.countValue}>{counts.missingAlt}</dd>
        </div>
        <div className={styles.count}>
          <dt className={styles.countLabel}>Skipped</dt>
          <dd className={styles.countValue}>{counts.skipped}</dd>
        </div>
      </dl>

      <div className={styles.reviewNote}>
        <p className={styles.reviewNoteBody}>
          <strong>Read these before you ship them.</strong> A model wrote them
          from the image alone. It cannot see that a photo is the only thing
          inside a link, or that the caption underneath already says the same
          words. Alt text depends on how the image is used, so treat every line
          here as a strong first draft.
        </p>
      </div>

      {htmlBlock.length > 0 ? (
        <div className={styles.bulkBar}>
          <p className={styles.bulkLabel}>
            Copy every suggestion as image tags, decorative ones included with
            an empty alt.
          </p>
          <CopyButton
            text={htmlBlock}
            label="Copy all as HTML"
            variant="primary"
            onCopied={() =>
              trackEvent(AnalyticsEvents.DOWNLOAD, {
                tool: SLUG,
                kind: "copy",
                label: "all-html",
              })
            }
          />
        </div>
      ) : null}

      <ul className={styles.rows}>
        {images.map((image, index) => (
          <ImageRow key={`${image.src}:${index}`} image={image} />
        ))}
      </ul>

      <p className={styles.footNote}>
        {result.model ? `Suggestions written by ${result.model}. ` : ""}
        Images are read from the page as it is served, so anything a script
        adds after the page loads is not included.
      </p>
    </div>
  );
}

/** Host, freshness, and the re-run control. */
function ResultHead({
  result,
  onRerun,
}: {
  result: SuccessResult;
  onRerun: () => void;
}) {
  return (
    <div className={styles.resultHead}>
      <div className={styles.resultMeta}>
        <p className={styles.resultHost}>{hostnameOf(result.url)}</p>
        <p className={styles.resultChecked}>
          {result.cached
            ? `Cached result, checked ${formatAge(result.ageSeconds ?? 0)}`
            : "Checked just now"}
        </p>
      </div>
      <div className={styles.resultActions}>
        <button type="button" className={styles.ghostButton} onClick={onRerun}>
          Check again fresh
        </button>
      </div>
    </div>
  );
}

/** One image: preview, what it has today, and what we suggest. */
function ImageRow({ image }: { image: AltTextImage }) {
  const { trackEvent } = useAnalytics();
  const status = statusOf(image);
  const src = decodeEntities(image.src);
  const label = fileNameOf(src);

  return (
    <li className={styles.row}>
      <div className={styles.rowThumb}>
        <Thumbnail src={src} label={label} />
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowHead}>
          <StatusChip status={status} />
          {image.isDecorative && status !== "skipped" ? (
            <span className={`${styles.chip} ${styles.chipDecorative}`}>
              Decorative
            </span>
          ) : null}
          <a
            className={styles.rowSrc}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title={src}
          >
            {label}
          </a>
        </div>

        <div className={styles.field}>
          <p className={styles.fieldLabel}>On the page now</p>
          <p className={styles.fieldValue}>
            <CurrentAlt image={image} status={status} />
          </p>
        </div>

        {status === "skipped" ? (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Not analysed</p>
            <p className={styles.skipReason}>
              {SKIP_REASONS[image.skippedReason ?? ""] ??
                `Skipped: ${(image.skippedReason ?? "no reason given").replace(/-/g, " ")}.`}
            </p>
          </div>
        ) : image.isDecorative ? (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Suggestion</p>
            <p className={styles.decorativeAdvice}>
              This image looks decorative, so its alt should stay empty. Write{" "}
              <code className={styles.code}>alt=&quot;&quot;</code> and a screen
              reader will skip past it instead of reading out a filename.
            </p>
          </div>
        ) : image.suggestedAlt.trim().length > 0 ? (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Suggested alt</p>
            <div className={styles.suggestionRow}>
              <p className={styles.suggestion}>{image.suggestedAlt}</p>
              <CopyButton
                text={image.suggestedAlt}
                label="Copy"
                onCopied={() =>
                  trackEvent(AnalyticsEvents.DOWNLOAD, {
                    tool: SLUG,
                    kind: "copy",
                    label: "one-alt",
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Suggestion</p>
            <p className={styles.skipReason}>
              The model did not return a draft for this one.
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * What the image has today, in words that never conflate the two empties.
 */
function CurrentAlt({
  image,
  status,
}: {
  image: AltTextImage;
  status: RowStatus;
}) {
  if (status === "missing") {
    return (
      <span className={styles.missingValue}>
        No alt attribute at all. A screen reader falls back to reading the file
        name.
      </span>
    );
  }
  if (image.currentAlt.trim().length === 0) {
    return (
      <span className={styles.emptyValue}>
        <code className={styles.code}>alt=&quot;&quot;</code>, an empty alt.
        Somebody marked this image decorative on purpose.
      </span>
    );
  }
  return <span className={styles.currentValue}>{image.currentAlt}</span>;
}

/** The status chip. The four states must read differently at a glance. */
function StatusChip({ status }: { status: RowStatus }) {
  const copy: Record<RowStatus, { label: string; className: string; title: string }> = {
    missing: {
      label: "Missing alt",
      className: styles.chipMissing,
      title: "This image has no alt attribute. That is a bug worth fixing.",
    },
    empty: {
      label: "Empty alt",
      className: styles.chipEmpty,
      title:
        'This image has alt="", which is valid HTML and marks it as decorative.',
    },
    present: {
      label: "Has alt",
      className: styles.chipPresent,
      title: "This image already has alt text.",
    },
    skipped: {
      label: "Skipped",
      className: styles.chipSkipped,
      title: "This image was listed but never sent to the model.",
    },
  };
  const entry = copy[status];
  return (
    <span className={`${styles.chip} ${entry.className}`} title={entry.title}>
      {entry.label}
    </span>
  );
}
