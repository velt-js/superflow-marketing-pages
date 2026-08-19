"use client";

// The shared review surface: a URL form in, a verdict and a list of findings
// out. Three tools render it — the two persona reviews and the Lookalike Test —
// because they return the same shape and differ only in what they looked for.
//
// TWO DESIGN RULES CARRIED FROM THE ENGINES
//
// 1. A run with no verdict and no findings is a FAILURE, not an empty success.
//    The route already refuses that case; this component never renders "0
//    findings" as a clean bill of health, because "your page is perfect" and
//    "the run produced nothing" are different answers and only one is about the
//    visitor's page.
// 2. The provenance line is not decoration. For a lens built from someone's
//    public record rather than their own writing, it is what keeps the report
//    from reading as words put in a real person's mouth, and it renders above
//    the findings rather than in a footnote.

import { useCallback, useRef, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type { PersonaFinding } from "@/lib/tools/persona-review/types";
import { PERSONAS, provenanceFor } from "@/lib/tools/persona-review/personas";
import styles from "./ReviewTool.module.css";

/** What every review endpoint returns. */
type ReviewResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  summary?: string;
  findings?: PersonaFinding[];
  totalFindings?: number;
  cached?: boolean;
  ageSeconds?: number;
};

type SuccessResult = {
  summary: string;
  findings: PersonaFinding[];
  cached: boolean;
  /** The lens that produced this result, for attributing it correctly. */
  personaSlug: string;
};

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; result: SuccessResult }
  | { phase: "error"; message: string };

/** One extra input the tool collects beyond the URL. */
export type ReviewExtraField = {
  name: string;
  label: string;
  placeholder?: string;
  /** Rendered under the field, for the thing the label cannot say. */
  hint?: string;
  /**
   * Present for a dropdown. Absent for a free-text input.
   *
   * A select is the right control whenever the accepted values are a closed set
   * the backend already knows — the benchmark packs. A text box for a closed
   * set invites a typo that silently falls back to a default, which a visitor
   * reads as the tool ignoring them.
   */
  options?: { value: string; label: string }[];
};

export type ReviewToolProps = {
  /**
   * Tool slug. For a persona review this is the DEFAULT dropdown selection,
   * not a fixed destination — the picker can change where the form posts.
   */
  slug: string;
  /** Placeholder for the URL input. */
  placeholder?: string;
  /** Button label while idle. */
  actionLabel: string;
  /** Shown above the findings whenever a result is on screen. */
  provenance?: string;
  /** Citations for the lens, rendered under the result. */
  sources?: { title: string; url: string }[];
  /** Extra inputs posted alongside the URL. */
  extraFields?: ReviewExtraField[];
  /**
   * Renders the persona picker, letting a visitor run any lens from this page.
   * The page's own `slug` is the default selection.
   *
   * Switching persona posts to that persona's endpoint rather than navigating,
   * so a visitor can run five lenses over one URL without re-typing it — which
   * is the whole reason to have a picker instead of five separate visits.
   */
  showPersonaPicker?: boolean;
};

/** Severity order, worst first. Findings are grouped, not sorted by arrival. */
const SEVERITY_ORDER: PersonaFinding["severity"][] = ["high", "medium", "low"];

const SEVERITY_LABEL: Record<PersonaFinding["severity"], string> = {
  high: "Fix this",
  medium: "Worth changing",
  low: "Polish",
};

export function ReviewTool({
  slug,
  placeholder = "yoursite.com",
  actionLabel,
  provenance,
  sources = [],
  extraFields = [],
  showPersonaPicker = false,
}: ReviewToolProps) {
  const [url, setUrl] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  // Which lens runs. Defaults to the page's own persona; the picker changes it.
  const [personaSlug, setPersonaSlug] = useState(slug);
  const [state, setState] = useState<RunState>({ phase: "idle" });
  const { trackEvent } = useAnalytics();

  // The endpoint, and the identity a result is attributed to. Without the
  // picker this is just the page's slug.
  const activeSlug = showPersonaPicker ? personaSlug : slug;

  // Guards against a second submit while one is in flight. A review takes tens
  // of seconds, which is long enough for an impatient second click to spend
  // another slot of the visitor's hourly budget on the same question.
  const inFlight = useRef(false);

  const run = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const trimmed = url.trim();
      if (trimmed.length === 0 || inFlight.current) return;

      inFlight.current = true;
      setState({ phase: "running" });
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: activeSlug });

      try {
        const body: Record<string, unknown> = { url: trimmed };
        for (const field of extraFields) {
          const value = (extras[field.name] ?? "").trim();
          if (value.length > 0) body[field.name] = value;
        }

        const response = await fetch(`/api/tools/${activeSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const payload = (await response.json()) as ReviewResponse;

        if (!payload?.ok) {
          const message =
            payload?.message ?? "Something went wrong. Try again in a moment.";
          trackEvent(AnalyticsEvents.TOOL_ERROR, {
            tool: activeSlug,
            code: payload?.code ?? "unknown",
          });
          setState({ phase: "error", message });
          return;
        }

        const result: SuccessResult = {
          summary: payload.summary ?? "",
          findings: Array.isArray(payload.findings) ? payload.findings : [],
          cached: payload.cached === true,
          // Stamped with the lens that PRODUCED it, not the one currently
          // selected. Otherwise changing the dropdown after a run silently
          // re-labels a finished review as someone else's.
          personaSlug: activeSlug,
        };

        trackEvent(AnalyticsEvents.TOOL_RESULT, {
          tool: activeSlug,
          findings: result.findings.length,
          cached: result.cached,
        });
        setState({ phase: "done", result });
      } catch {
        trackEvent(AnalyticsEvents.TOOL_ERROR, { tool: activeSlug, code: "network" });
        setState({
          phase: "error",
          message: "Could not reach the review. Try again in a moment.",
        });
      } finally {
        inFlight.current = false;
      }
    },
    [url, extras, extraFields, activeSlug, trackEvent],
  );

  const running = state.phase === "running";

  return (
    <div className={styles.tool}>
      <form className={styles.form} onSubmit={run}>
        {showPersonaPicker && (
          <label className={styles.persona}>
            <span className={styles.personaLabel}>Review like</span>
            <select
              className={styles.personaSelect}
              value={personaSlug}
              onChange={(event) => setPersonaSlug(event.target.value)}
              disabled={running}
            >
              {PERSONAS.map((persona) => (
                <option key={persona.slug} value={persona.slug}>
                  {persona.name}
                </option>
              ))}
            </select>
            <span className={styles.personaLens}>
              {PERSONAS.find((persona) => persona.slug === personaSlug)?.lens}
            </span>
          </label>
        )}

        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-label="URL to review"
            disabled={running}
          />
          <button
            className={styles.submit}
            type="submit"
            disabled={running || url.trim().length === 0}
          >
            {running ? "Reading the page…" : actionLabel}
          </button>
        </div>

        {extraFields.length > 0 && (
          <div className={styles.extras}>
            {extraFields.map((field) => (
              <label key={field.name} className={styles.extra}>
                <span className={styles.extraLabel}>{field.label}</span>
                {field.options ? (
                  <select
                    className={styles.extraSelect}
                    value={extras[field.name] ?? ""}
                    onChange={(event) =>
                      setExtras((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    disabled={running}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={styles.extraInput}
                    type="text"
                    placeholder={field.placeholder}
                    value={extras[field.name] ?? ""}
                    onChange={(event) =>
                      setExtras((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    disabled={running}
                  />
                )}
                {field.hint && (
                  <span className={styles.extraHint}>{field.hint}</span>
                )}
              </label>
            ))}
          </div>
        )}
      </form>

      {running && (
        <p className={styles.status} role="status">
          Loading the page, taking a screenshot, and reading it. This takes
          under a minute.
        </p>
      )}

      {state.phase === "error" && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      {state.phase === "done" && (
        <ReviewResult
          result={state.result}
          // Derived from the lens that PRODUCED the result when a picker is on
          // screen: a line fixed to the page would show one persona's framing
          // over another persona's review, which for the public-record lenses
          // is exactly the claim they exist to prevent.
          provenance={
            showPersonaPicker
              ? provenanceFor(state.result.personaSlug)
              : provenance
          }
          sources={sources}
        />
      )}
    </div>
  );
}

/** The verdict, the findings, and where the lens came from. */
function ReviewResult({
  result,
  provenance,
  sources,
}: {
  result: SuccessResult;
  provenance?: string;
  sources: { title: string; url: string }[];
}) {
  const grouped = SEVERITY_ORDER.map((severity) => ({
    severity,
    findings: result.findings.filter((finding) => finding.severity === severity),
  })).filter((group) => group.findings.length > 0);

  return (
    <section className={styles.result}>
      {provenance && <p className={styles.provenance}>{provenance}</p>}

      {result.summary.length > 0 && (
        <blockquote className={styles.verdict}>{result.summary}</blockquote>
      )}

      {/* Only reachable when there IS a summary: the route refuses a run with
          neither, so this never renders as a clean bill of health. */}
      {result.findings.length === 0 ? (
        <p className={styles.nothing}>
          Nothing else flagged. The verdict above is the whole review.
        </p>
      ) : (
        grouped.map((group) => (
          <div key={group.severity} className={styles.group}>
            <h3 className={styles.groupTitle}>
              {SEVERITY_LABEL[group.severity]}
              <span className={styles.groupCount}>{group.findings.length}</span>
            </h3>
            <ul className={styles.findings}>
              {group.findings.map((finding, index) => (
                <li
                  key={`${group.severity}-${index}-${finding.title}`}
                  className={styles.finding}
                >
                  <h4 className={styles.findingTitle}>{finding.title}</h4>
                  {finding.targetText && (
                    <p className={styles.quote}>“{finding.targetText}”</p>
                  )}
                  {finding.description && (
                    <p className={styles.findingBody}>{finding.description}</p>
                  )}
                  {finding.suggestion && (
                    <p className={styles.suggestion}>
                      <span className={styles.suggestionLabel}>Instead</span>
                      {finding.suggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {sources.length > 0 && (
        <footer className={styles.sources}>
          <h4 className={styles.sourcesTitle}>The lens comes from</h4>
          <ul className={styles.sourceList}>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noopener noreferrer" target="_blank">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}

      {result.cached && (
        <p className={styles.cached}>
          Served from a cached run of this URL from the last 24 hours.
        </p>
      )}
    </section>
  );
}
