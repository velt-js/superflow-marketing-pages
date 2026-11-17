"use client";

// The Open Graph Video Checker.
//
// URL form in; a verdict, the video itself, the check list, and the tags out.
// Three rules carried over from the engine:
//
//   1. The headline answer is the visitor's question: does this link share as
//      a playable video. Yes or no, in the largest type on the page.
//   2. Nothing is asserted that was not fetched. Each video row shows what
//      the file really is, read from its own header, beside what the tags
//      claim it is.
//   3. The player is the real thing. The <video> below points straight at the
//      og:video address with og:image as its poster, sized from the declared
//      width and height, which is what a platform does. If it plays here, the
//      file is fine; if it sits black, so will the card.
//
// next/image and a proxy are deliberately not used, for the same reason as
// the Favicon Checker: these are arbitrary third-party hosts, and re-hosting
// would show a copy rather than what a platform will load.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type {
  CheckStatus,
  OgVideo,
  OgVideoCheck,
  OgVideoReport,
  VideoFormat,
} from "@/lib/toolkit/og-video";
import styles from "./OgVideo.module.css";

const SLUG = "og-video-checker";
const ENDPOINT = "/api/tools/og-video-checker";

/** What the endpoint returns. Failures carry `error`. */
type OgVideoPayload = Partial<OgVideoReport> & {
  url?: string;
  requestedUrl?: string;
  status?: number;
  fetchedAt?: string;
  cached?: boolean;
  ageSeconds?: number;
  error?: string;
  errorCode?: string;
};

type SuccessResult = OgVideoReport & {
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

/** Short names for each format, for the fact chips. */
const FORMAT_CHIPS: Record<VideoFormat, string> = {
  mp4: "MP4",
  quicktime: "QuickTime",
  webm: "WebM",
  matroska: "Matroska",
  ogg: "Ogg",
  hls: "HLS",
  dash: "DASH",
  "mpeg-ts": "MPEG-TS",
  flv: "Flash video",
  swf: "Flash",
  html: "Player page",
  image: "Image",
  unknown: "Unknown",
};

/** Formats a browser's own <video> element can be handed directly. */
const PLAYS_IN_BROWSER = new Set<VideoFormat>(["mp4", "webm", "quicktime", "ogg"]);

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
 * Formats a length in seconds as m:ss.
 *
 * @param seconds - The length.
 */
function formatDuration(seconds: number): string {
  try {
    const whole = Math.round(seconds);
    const minutes = Math.floor(whole / 60);
    const rest = String(whole % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  } catch {
    return `${seconds}s`;
  }
}

/**
 * Formats a cache age as a phrase.
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
 * The aspect ratio a platform would give the player box: from the tags when
 * they give a usable size, else from the file, else 16:9.
 *
 * @param video - The video, or null.
 */
function aspectOf(video: OgVideo | null): string {
  try {
    const width = Number(video?.declaredWidth);
    const height = Number(video?.declaredHeight);
    if (width > 0 && height > 0) return `${width} / ${height}`;
    const real = video?.probe?.dimensions;
    if (real) return `${real.width} / ${real.height}`;
    return "16 / 9";
  } catch {
    return "16 / 9";
  }
}

/** One check: status glyph, what we found, and what to do about it. */
function CheckRow({ check }: { check: OgVideoCheck }) {
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

/** One og:video declaration: what the tags say, and what the file is. */
function VideoRow({ video }: { video: OgVideo }) {
  const probe = video.probe;
  const usable = probe?.usable === true;
  const address = video.url ?? (video.href || video.secureHref || "");

  return (
    <li className={styles.video}>
      <div className={styles.videoBody}>
        <p className={styles.videoHead}>
          <span className={styles.videoKind}>
            {video.index === 0 ? "First video" : `Video ${video.index + 1}`}
          </span>
          {video.index === 0 ? (
            <code className={styles.videoRel}>the one platforms use</code>
          ) : null}
        </p>

        <p className={styles.videoHref}>
          {video.url?.startsWith("http") ? (
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              {address}
            </a>
          ) : (
            address
          )}
        </p>

        <p className={styles.videoFacts}>
          <span className={styles.videoFact}>
            declared {video.declaredType ?? "no type"}
          </span>
          {video.declaredWidth || video.declaredHeight ? (
            <span className={styles.videoFact}>
              declared {video.declaredWidth ?? "?"}x{video.declaredHeight ?? "?"}
            </span>
          ) : null}
        </p>

        {usable && probe ? (
          <p className={styles.videoFacts} style={{ marginTop: 6 }}>
            <span className={styles.videoFact}>
              is {FORMAT_CHIPS[probe.format] ?? probe.format}
            </span>
            {probe.dimensions ? (
              <span className={styles.videoFact}>
                {probe.dimensions.width}x{probe.dimensions.height}
              </span>
            ) : null}
            {probe.durationSeconds !== null ? (
              <span className={styles.videoFact}>
                {formatDuration(probe.durationSeconds)}
              </span>
            ) : null}
            {probe.totalBytes !== null ? (
              <span className={styles.videoFact}>
                {formatBytes(probe.totalBytes)}
              </span>
            ) : null}
            {probe.rangeSupported === false ? (
              <span className={styles.videoMismatch}>no byte ranges</span>
            ) : null}
            {probe.fastStart === false ? (
              <span className={styles.videoMismatch}>not fast start</span>
            ) : null}
          </p>
        ) : (
          <p className={styles.videoProblem}>
            {probe?.problem ??
              (video.url
                ? "Not fetched. Platforms only use the first video, so we check the first three."
                : "This address could not be resolved against the page.")}
          </p>
        )}
      </div>
    </li>
  );
}

/** The video as a viewer would get it, or the reason there is none. */
function Player({ result }: { result: SuccessResult }) {
  const primary = result.primary ?? null;
  const probe = primary?.probe ?? null;
  const poster = result.image?.usable ? result.image.url : undefined;
  const canPlay =
    probe?.usable === true && PLAYS_IN_BROWSER.has(probe.format) && primary?.url;

  let caption: React.ReactNode;
  let stage: React.ReactNode;

  if (canPlay && primary?.url) {
    stage = (
      <video
        className={styles.playerMedia}
        src={primary.url}
        poster={poster}
        controls
        muted
        playsInline
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    );
    caption =
      "Loaded straight from the og:video address, with og:image as the poster, in a box sized from the tags. This is the file a platform will play.";
  } else {
    stage = poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={styles.playerMedia} src={poster} alt="" />
    ) : (
      <div className={styles.playerEmpty}>
        {primary ? "No video and no image to show." : "This page declares no og:video."}
      </div>
    );
    caption =
      probe?.usable && probe.kind === "player" && primary?.url ? (
        <>
          og:video is a player page, so this is the still that shows until a
          platform embeds it.{" "}
          <a href={primary.url} target="_blank" rel="noopener noreferrer">
            Open the player
          </a>
          .
        </>
      ) : probe?.usable && primary?.url ? (
        <>
          A browser cannot play this format on its own, so this is the still
          most platforms will show instead.{" "}
          <a href={primary.url} target="_blank" rel="noopener noreferrer">
            Open the file
          </a>
          .
        </>
      ) : poster ? (
        "There is no video that loads, so this still is all a shared link will show."
      ) : null;
  }

  return (
    <section className={`${styles.panel} ${styles.player}`}>
      <h3 className={styles.panelTitle}>What a viewer gets</h3>
      <div className={styles.playerStage} style={{ aspectRatio: aspectOf(primary) }}>
        {stage}
      </div>
      {caption ? <p className={styles.playerCaption}>{caption}</p> : null}
    </section>
  );
}

/** One tag and its value, or a note that it is not set. */
function TagRow({ name, value }: { name: string; value: string | null | undefined }) {
  return (
    <>
      <dt>{name}</dt>
      <dd>{value ? value : <span className={styles.tagMissing}>not set</span>}</dd>
    </>
  );
}

/** Every tag a platform reads to build a video card, grouped by reader. */
function TagsPanel({ result }: { result: SuccessResult }) {
  const meta = result.videoMeta;
  const twitter = result.twitter;
  const schema = result.videoObject;
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>The tags we read</h3>
      <p className={styles.panelHint}>
        Three readers, three sets of tags. Open Graph readers (Facebook,
        LinkedIn, Discord, Slack and most others) read og:*. X reads twitter:*.
        Google reads neither, and takes video from a VideoObject in JSON-LD.
      </p>

      <div className={styles.tagGroup}>
        <p className={styles.tagGroupTitle}>Open Graph</p>
        <dl className={styles.tagTable}>
          <TagRow name="og:type" value={result.ogType} />
          <TagRow name="og:title" value={result.title} />
          <TagRow name="og:image" value={result.image?.url} />
          <TagRow name="video:duration" value={meta?.duration} />
          <TagRow name="video:release_date" value={meta?.releaseDate} />
          <TagRow name="video:series" value={meta?.series} />
          <TagRow
            name="video:tag"
            value={meta?.tags?.length ? meta.tags.join(", ") : null}
          />
        </dl>
      </div>

      <div className={styles.tagGroup}>
        <p className={styles.tagGroupTitle}>X</p>
        <dl className={styles.tagTable}>
          <TagRow name="twitter:card" value={twitter?.card} />
          <TagRow name="twitter:player" value={twitter?.player} />
          <TagRow
            name="twitter:player:width"
            value={twitter?.width}
          />
          <TagRow
            name="twitter:player:height"
            value={twitter?.height}
          />
          <TagRow name="twitter:player:stream" value={twitter?.stream} />
          <TagRow name="twitter:image" value={twitter?.image} />
        </dl>
      </div>

      <div className={styles.tagGroup}>
        <p className={styles.tagGroupTitle}>Google (VideoObject)</p>
        {schema ? (
          <dl className={styles.tagTable}>
            <TagRow name="name" value={schema.name} />
            <TagRow name="thumbnailUrl" value={schema.thumbnailUrl} />
            <TagRow name="uploadDate" value={schema.uploadDate} />
            <TagRow name="contentUrl" value={schema.contentUrl} />
            <TagRow name="embedUrl" value={schema.embedUrl} />
            <TagRow name="duration" value={schema.duration} />
          </dl>
        ) : (
          <p className={styles.panelHint} style={{ marginBottom: 0 }}>
            No VideoObject in the page&apos;s JSON-LD.
          </p>
        )}
      </div>
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
 * The Open Graph Video Checker: URL form, verdict, player, checks, and tags.
 */
export function OgVideoTool() {
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
        const payload = (await response.json()) as OgVideoPayload;

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
          hasPlayableVideo: result.hasPlayableVideo === true,
          cached: result.cached === true,
          failCount: result.counts?.fail ?? 0,
          warnCount: result.counts?.warn ?? 0,
        });

        // Put the checked URL in the address bar so the result survives a
        // refresh and the page is shareable.
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
          placeholder="yourwebsite.com/videos/launch"
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
          {isRunning ? "Checking..." : "Check the video"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Reading the page, then fetching the start of the video and the share
          image.
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
  const videos = result.videos ?? [];
  const counts = result.counts ?? { pass: 0, warn: 0, fail: 0 };
  const playable = result.hasPlayableVideo === true;
  const declared = videos.length > 0;

  // Broken first, then worth-fixing, then the passes.
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
        className={`${styles.verdict} ${playable ? styles.verdictGood : styles.verdictBad}`}
      >
        <span className={styles.verdictBadge} aria-hidden="true">
          <span className={styles.verdictGlyph}>{playable ? "▶" : "✕"}</span>
        </span>
        <div className={styles.verdictText}>
          <h3 className={styles.verdictHeading}>
            {playable
              ? "This page shares as a video"
              : declared
                ? "This page's og:video does not load"
                : "This page has no og:video"}
          </h3>
          <p className={styles.verdictBody}>
            {playable
              ? "The first og:video loads, and its bytes really are a video or a player. The checks below say where it will and will not play."
              : declared
                ? "The page declares a video, but the address it gives does not serve one. A shared link will show the image at best."
                : "Nothing in the head declares a video, so a shared link shows a still card on every platform."}
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

      <Player result={result} />

      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>What we checked</h3>
        <ul className={styles.checkList}>
          {ordered.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </ul>
      </section>

      {declared ? (
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>
            Every og:video on the page{" "}
            <span className={styles.panelCount}>{videos.length}</span>
          </h3>
          <p className={styles.panelHint}>
            The &quot;declared&quot; values come from the tags. The rest is
            read from the first bytes of the file itself.
          </p>
          <ul className={styles.videoList}>
            {videos.map((video) => (
              <VideoRow key={video.index} video={video} />
            ))}
          </ul>
        </section>
      ) : null}

      <TagsPanel result={result} />
    </div>
  );
}
