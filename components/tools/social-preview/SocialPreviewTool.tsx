"use client";

// The Social Preview Checker.
//
// URL in, one mock card per platform out. The product IS the cards, so
// everything else on the page exists to answer the two questions a card
// raises: which tag did that text come from, and what will the platform do
// with it. Those sit directly under each card rather than in a separate
// section, because "title from og:title" is only useful next to the title it
// explains.
//
// Nothing here decides anything. The engine resolves each field, names its
// source tag, marks truncation, and writes the notes. This file draws them.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  tagLabel,
  type FindingSeverity,
  type PlatformPreview,
  type PreviewField,
  type PreviewNote,
  type SocialPreviewFinding,
  type SocialPreviewReport,
} from "@/lib/tools/social-preview/report";
import { PreviewCard, type ImageOutcome } from "./PreviewCard";
import styles from "./SocialPreview.module.css";

const SLUG = "social-preview-checker";
const ENDPOINT = "/api/tools/social-preview";

/** What the endpoint returns. */
type ApiResponse =
  | {
      ok: true;
      report: SocialPreviewReport;
      cached: boolean;
      ageSeconds: number;
    }
  | { ok: false; code: string; message: string };

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | {
      phase: "done";
      report: SocialPreviewReport;
      cached: boolean;
      ageSeconds: number;
      raw: string;
    }
  | { phase: "error"; message: string };

/** Plain-words name for each layout, shown as a chip on the platform block. */
const LAYOUT_LABELS: Record<string, string> = {
  "large-image": "Large image card",
  thumbnail: "Small thumbnail card",
  "text-only": "Text only, no image",
};

/** Failures first, then warnings, then the rest. */
const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const SEVERITY_LABELS: Record<FindingSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
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
 * Formats a cache age as a phrase.
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
 * How much of a field the platform will hide, stated from the numbers the
 * engine sent rather than from a limits table of our own. The engine owns the
 * per-platform limits, dates them, and already writes them into its notes, so
 * a second copy here would drift the first time a platform changed.
 *
 * @param field - A field the engine marked as truncated.
 */
function cutPhrase(field: PreviewField): string {
  try {
    const hidden = Math.max(0, field.originalLength - field.value.length);
    return `Cut from ${field.originalLength} characters, about ${hidden} hidden`;
  } catch {
    return "Cut short";
  }
}

/** Tick, exclamation, or cross, matching a note's status. */
function NoteGlyph({ status }: { status: PreviewNote["status"] }) {
  const tone =
    status === "fail"
      ? styles.noteFail
      : status === "pass"
        ? styles.notePass
        : styles.noteWarn;
  return (
    <span className={`${styles.noteDot} ${tone}`} aria-hidden="true">
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {status === "pass" ? (
          <path d="M20 6 9 17l-5-5" />
        ) : status === "fail" ? (
          <path d="M18 6 6 18M6 6l12 12" />
        ) : (
          <path d="M12 7v6M12 17h.01" />
        )}
      </svg>
    </span>
  );
}

/**
 * One row of the "where each field came from" list. The tag name is the
 * actionable half: it is what you search your own page source for.
 *
 * @param props - The field, its label, and an optional trailing chip.
 */
function ProvenanceRow({
  label,
  field,
  extra,
}: {
  label: string;
  field: PreviewField;
  extra?: React.ReactNode;
}) {
  return (
    <li className={styles.provRow}>
      <span className={styles.provLabel}>{label}</span>
      {field.from.length > 0 ? (
        <span className={styles.provValue}>
          from <code className={styles.tagRef}>{field.from}</code>
        </span>
      ) : (
        <span className={styles.provMissing}>no tag found</span>
      )}
      {field.truncated ? (
        <span className={styles.cutChip}>{cutPhrase(field)}</span>
      ) : null}
      {extra}
    </li>
  );
}

/**
 * One platform: the card, then where each field came from, then what the
 * platform will do about it.
 *
 * @param props - The preview to render.
 */
function PlatformBlock({ preview }: { preview: PlatformPreview }) {
  const [image, setImage] = useState<ImageOutcome | null>(null);

  const handleImageOutcome = useCallback((outcome: ImageOutcome) => {
    // Several cards render the same URL. They agree, so the first answer
    // stands and the rest are ignored.
    setImage((current) => current ?? outcome);
  }, []);

  const layoutLabel =
    preview.platform === "google"
      ? "Search snippet"
      : (LAYOUT_LABELS[preview.layout] ?? preview.layout);

  const notes = preview.notes.filter((note) => note.message.length > 0);

  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <h4 className={styles.blockName}>{preview.platformName}</h4>
        <span className={styles.layoutChip}>{layoutLabel}</span>
        {preview.willRenderCard ? null : (
          <span className={`${styles.layoutChip} ${styles.noCardChip}`}>
            No card
          </span>
        )}
      </div>

      <div className={styles.stage}>
        <PreviewCard preview={preview} onImageOutcome={handleImageOutcome} />
      </div>

      <ul className={styles.provenance}>
        <ProvenanceRow label="Title" field={preview.title} />
        <ProvenanceRow label="Description" field={preview.description} />
        <ProvenanceRow
          label="Image"
          field={preview.image}
          extra={
            image?.loaded && image.width > 0 ? (
              <span className={styles.dimChip}>
                {image.width} x {image.height}
              </span>
            ) : null
          }
        />
      </ul>

      {notes.length > 0 ? (
        <ul className={styles.notes}>
          {notes.map((note) => (
            <li key={note.id} className={styles.note}>
              <NoteGlyph status={note.status} />
              <span>{note.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.allClear}>Nothing to fix for this platform.</p>
      )}
    </section>
  );
}

/** The page-level findings, worst first, each with its fix. */
function FindingsList({ findings }: { findings: SocialPreviewFinding[] }) {
  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <div className={styles.findings}>
      {sorted.map((finding) => (
        <article key={finding.id} className={styles.finding}>
          <div className={styles.findingHead}>
            <span
              className={`${styles.severity} ${
                finding.severity === "critical" || finding.severity === "high"
                  ? styles.severityHigh
                  : finding.severity === "medium"
                    ? styles.severityMedium
                    : styles.severityLow
              }`}
            >
              {SEVERITY_LABELS[finding.severity]}
            </span>
            <h4 className={styles.findingTitle}>{finding.title}</h4>
          </div>
          <p className={styles.findingBody}>{finding.description}</p>
        </article>
      ))}
    </div>
  );
}

/**
 * Sort rank for a tag key, so the page tags come before the Open Graph block
 * and the Open Graph block before the Twitter one.
 *
 * @param key - The engine's key, e.g. "ogSiteName".
 */
function tagRank(key: string): number {
  if (key.startsWith("twitter")) return 2;
  if (key.startsWith("og")) return 1;
  return 0;
}

/** Every tag the page actually declares, as the engine read them. */
function TagsTable({ tags }: { tags: Record<string, string> }) {
  const rows = Object.entries(tags).sort(([a], [b]) => {
    const rank = tagRank(a) - tagRank(b);
    return rank !== 0 ? rank : a.localeCompare(b);
  });

  return (
    <details className={styles.tagsDetails}>
      <summary className={styles.tagsSummary}>
        Tags this page declares ({rows.length})
      </summary>
      {rows.length === 0 ? (
        <p className={styles.tagsEmpty}>
          The page declares none of the tags these platforms read. Every card
          above is built from whatever each platform could fall back to.
        </p>
      ) : (
        <div className={styles.tagsTableScroll}>
          <table className={styles.tagsTable}>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([key, value]) => (
                <tr key={key}>
                  <td>
                    <code className={styles.tagRef}>{tagLabel(key)}</code>
                  </td>
                  <td className={styles.tagValue}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}

/** Copies the raw report JSON, for scripts and bug reports. */
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
 * The Social Preview Checker: URL form, then one card per platform.
 */
export function SocialPreviewTool() {
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
        const payload = (await response.json()) as ApiResponse;

        if (!payload.ok) {
          setState({ phase: "error", message: payload.message });
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: SLUG,
            code: payload.code,
          });
          return;
        }

        setState({
          phase: "done",
          report: payload.report,
          cached: payload.cached === true,
          ageSeconds: payload.ageSeconds ?? 0,
          raw: JSON.stringify(payload.report, null, 2),
        });
        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: SLUG,
          cached: payload.cached === true,
          platformsChecked: payload.report.summary.platformsChecked,
          platformsWithImage: payload.report.summary.platformsWithImage,
          failed: payload.report.summary.failed,
          warnings: payload.report.summary.warnings,
          findings: payload.report.totalFindings,
        });

        // Put the checked URL in the address bar so the result survives a
        // refresh and the page is shareable. replaceState keeps back sane.
        try {
          const next = new URL(window.location.href);
          next.searchParams.set("url", payload.report.url || trimmed);
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
          placeholder="yourwebsite.com/blog/your-post"
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
          {isRunning ? "Checking..." : "Show my previews"}
        </button>
      </form>

      {isRunning ? (
        <p className={styles.runningHint} aria-live="polite">
          Reading the page and working out what each platform will show.
        </p>
      ) : null}

      {state.phase === "error" ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      {state.phase === "done" ? (
        <ReportView
          report={state.report}
          cached={state.cached}
          ageSeconds={state.ageSeconds}
          raw={state.raw}
          onRerun={() => void run(state.report.url || state.report.requestedUrl, true)}
        />
      ) : null}
    </div>
  );
}

/** The full report for one successful run. */
function ReportView({
  report,
  cached,
  ageSeconds,
  raw,
  onRerun,
}: {
  report: SocialPreviewReport;
  cached: boolean;
  ageSeconds: number;
  raw: string;
  onRerun: () => void;
}) {
  const { summary } = report;

  return (
    <div className={styles.result}>
      <div className={styles.resultHead}>
        <div className={styles.resultMeta}>
          <p className={styles.resultHost}>
            {hostnameOf(report.url || report.requestedUrl)}
          </p>
          <p className={styles.resultChecked}>
            {cached
              ? `Cached result, checked ${formatAge(ageSeconds)}`
              : "Checked just now"}
          </p>
        </div>
        <div className={styles.resultActions}>
          <CopyJsonButton raw={raw} />
          {cached ? (
            <button type="button" className={styles.ghostButton} onClick={onRerun}>
              Check again fresh
            </button>
          ) : null}
        </div>
      </div>

      {report.httpStatus >= 400 ? (
        <p className={styles.notice}>
          The page answered with HTTP {report.httpStatus}. The previews below
          were built from whatever it returned, which may be an error page.
          Platforms would read the same thing.
        </p>
      ) : null}

      <div className={styles.summary}>
        <div className={styles.summaryCell}>
          <p className={styles.summaryValue}>{summary.platformsChecked}</p>
          <p className={styles.summaryLabel}>Platforms checked</p>
        </div>
        <div className={styles.summaryCell}>
          <p className={styles.summaryValue}>
            {summary.platformsWithImage} of {summary.platformsChecked}
          </p>
          <p className={styles.summaryLabel}>Will show an image</p>
        </div>
        <div className={`${styles.summaryCell} ${styles.summaryWarn}`}>
          <p className={styles.summaryValue}>{summary.warnings}</p>
          <p className={styles.summaryLabel}>Platforms with a warning</p>
        </div>
        <div className={`${styles.summaryCell} ${styles.summaryFail}`}>
          <p className={styles.summaryValue}>{summary.failed}</p>
          <p className={styles.summaryLabel}>Platforms with a failure</p>
        </div>
      </div>

      <section>
        <h3 className={styles.sectionTitle}>What each platform will show</h3>
        <p className={styles.sectionLead}>
          Every platform reads a different set of tags in a different order, so
          these cards are not six copies of one answer. Under each card is the
          tag each line came from, which is what tells you where to make a
          change.
        </p>
        <div className={styles.cardGrid}>
          {report.previews.map((preview) => (
            <PlatformBlock key={preview.platform} preview={preview} />
          ))}
        </div>
      </section>

      {report.findings.length > 0 ? (
        <section>
          <h3 className={styles.sectionTitle}>
            Fix these on the page ({report.findings.length})
          </h3>
          <p className={styles.sectionLead}>
            These are page-level problems, so each one changes several cards at
            once.
          </p>
          <FindingsList findings={report.findings} />
        </section>
      ) : null}

      <TagsTable tags={report.tags} />

      {report.requirementsReviewedOn.length > 0 ||
      report.scopeDeclaration.notChecked.length > 0 ? (
        <p className={styles.scope}>
          {report.requirementsReviewedOn.length > 0
            ? `Platform rules last reviewed on ${report.requirementsReviewedOn}. `
            : ""}
          {report.scopeDeclaration.notChecked.length > 0
            ? `This check reads the page tags only. It does not check ${report.scopeDeclaration.notChecked.join(
                " or ",
              )}.`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
