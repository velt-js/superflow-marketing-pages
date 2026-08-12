"use client";

// The UTM Builder.
//
// Runs entirely in the browser. A campaign URL routinely carries the name of
// an unannounced launch, a partner nobody has signed yet, or a landing page
// that is not public, and none of that has any business being posted to a
// server so it can be joined with an ampersand.
//
// The convention is the feature. Joining five inputs is trivial; getting a
// whole team to produce "facebook" rather than "Facebook", "FaceBook", and
// "facebook " is what decides whether the report has one row or four.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCampaignUrl,
  parseCampaignUrl,
  channelForMedium,
  buildCsv,
  normalizeValue,
  DEFAULT_CONVENTION,
  EMPTY_PARAMS,
  UTM_FIELDS,
  UTM_QUERY_KEYS,
  type UtmConvention,
  type UtmParams,
  type UtmField,
  type SavedLink,
} from "@/lib/tools/utm/build";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./Utm.module.css";

const SLUG = "utm-builder";

/** Where the convention is remembered. Values only, never a built URL. */
const CONVENTION_STORAGE_KEY = "superflow.tools.utm.convention";

/** Common placements, each landing in a channel GA4 actually recognises. */
const PRESETS: Array<{ label: string; source: string; medium: string }> = [
  { label: "Email newsletter", source: "newsletter", medium: "email" },
  { label: "Google Ads", source: "google", medium: "cpc" },
  { label: "Meta Ads", source: "facebook", medium: "paid_social" },
  { label: "LinkedIn post", source: "linkedin", medium: "social" },
  { label: "X post", source: "x", medium: "social" },
  { label: "Partner", source: "partner", medium: "affiliate" },
];

const FIELD_CONFIG: Array<{
  field: UtmField;
  label: string;
  hint: string;
  placeholder: string;
  required: boolean;
}> = [
  {
    field: "source",
    label: "Source",
    hint: "where it comes from",
    placeholder: "newsletter",
    required: true,
  },
  {
    field: "medium",
    label: "Medium",
    hint: "what kind of link",
    placeholder: "email",
    required: true,
  },
  {
    field: "campaign",
    label: "Campaign",
    hint: "what it is part of",
    placeholder: "spring-launch",
    required: false,
  },
  {
    field: "content",
    label: "Content",
    hint: "which link on the page",
    placeholder: "hero-button",
    required: false,
  },
  {
    field: "term",
    label: "Term",
    hint: "paid search keyword",
    placeholder: "running shoes",
    required: false,
  },
  {
    field: "id",
    label: "Campaign ID",
    hint: "for cost import",
    placeholder: "spring-2026-01",
    required: false,
  },
];

/**
 * Reads a saved convention, ignoring anything that does not match the shape.
 *
 * @param raw - The stored JSON string.
 */
function parseStoredConvention(raw: string): UtmConvention | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const value = parsed as Record<string, unknown>;
    const caseRule = value.caseRule;
    const spaceRule = value.spaceRule;
    if (caseRule !== "lower" && caseRule !== "preserve") return null;
    if (
      spaceRule !== "underscore" &&
      spaceRule !== "hyphen" &&
      spaceRule !== "preserve"
    ) {
      return null;
    }
    return {
      caseRule,
      spaceRule,
      stripPunctuation: value.stripPunctuation !== false,
    };
  } catch {
    return null;
  }
}

export function UtmBuilder() {
  const { trackEvent } = useAnalytics();
  const [url, setUrl] = useState<string>("");
  const [params, setParams] = useState<UtmParams>({ ...EMPTY_PARAMS });
  const [convention, setConvention] = useState<UtmConvention>(DEFAULT_CONVENTION);
  const [saved, setSaved] = useState<SavedLink[]>([]);
  const [copied, setCopied] = useState<string>("");
  const nextKey = useRef<number>(0);
  const ranOnce = useRef<boolean>(false);

  // Read the saved convention after mount rather than during render, so the
  // server and the first client render agree.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONVENTION_STORAGE_KEY);
      if (stored) {
        const parsed = parseStoredConvention(stored);
        if (parsed) setConvention(parsed);
      }
    } catch {
      // Storage blocked. The default convention is a fine place to be.
    }
  }, []);

  const updateConvention = useCallback((next: UtmConvention) => {
    setConvention(next);
    try {
      window.localStorage.setItem(CONVENTION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked. It still applies for this visit.
    }
  }, []);

  const result = useMemo(
    () => buildCampaignUrl({ url, params, convention }),
    [url, params, convention],
  );

  const existingTags = useMemo(() => parseCampaignUrl(url), [url]);

  const channel = useMemo(
    () => channelForMedium(result.normalized.medium),
    [result.normalized.medium],
  );

  const hasErrors = result.issues.some((issue) => issue.level === "error");
  const ready = result.url.length > 0 && !hasErrors;

  // The funnel counts a "run" once a visitor gets a usable link, not on
  // every keystroke.
  useEffect(() => {
    if (ready && !ranOnce.current) {
      ranOnce.current = true;
      trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG });
    }
  }, [ready, trackEvent]);

  const setField = useCallback((field: UtmField, value: string) => {
    setParams((current) => ({ ...current, [field]: value }));
  }, []);

  const copy = useCallback(
    (text: string, token: string, action: string) => {
      try {
        void navigator.clipboard.writeText(text);
        setCopied(token);
        window.setTimeout(() => setCopied(""), 1600);
        trackEvent(AnalyticsEvents.TOOL_RESULT, { tool: SLUG, action });
      } catch {
        // Clipboard permission denied. The text is selectable either way.
      }
    },
    [trackEvent],
  );

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setParams((current) => ({
      ...current,
      source: preset.source,
      medium: preset.medium,
    }));
  }, []);

  const loadExistingTags = useCallback(() => {
    if (!existingTags) return;
    setUrl(existingTags.base);
    setParams(existingTags.params);
  }, [existingTags]);

  const addToList = useCallback(() => {
    if (!ready) return;
    nextKey.current += 1;
    setSaved((current) => [
      ...current,
      {
        key: `link-${nextKey.current}`,
        finalUrl: result.url,
        params: result.normalized,
      },
    ]);
    trackEvent(AnalyticsEvents.TOOL_RESULT, { tool: SLUG, action: "add" });
  }, [ready, result, trackEvent]);

  const downloadCsv = useCallback(() => {
    try {
      const csv = buildCsv(saved);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "campaign-urls.csv";
      anchor.click();
      URL.revokeObjectURL(href);
      trackEvent(AnalyticsEvents.DOWNLOAD, { tool: SLUG, count: saved.length });
    } catch {
      // Blob or download unavailable. Copy all still works.
    }
  }, [saved, trackEvent]);

  return (
    <div className={styles.tool}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="utm-url">
          Destination URL
          <span className={styles.required}>required</span>
        </label>
        <input
          id="utm-url"
          type="text"
          inputMode="url"
          spellCheck={false}
          className={`${styles.input} ${styles.urlInput}`}
          value={url}
          placeholder="https://example.com/pricing"
          onChange={(event) => setUrl(event.target.value)}
        />
        {existingTags && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={loadExistingTags}
          >
            That URL already has tags. Load them into the fields
          </button>
        )}
      </div>

      <div className={styles.presets}>
        <span className={styles.presetsLabel}>Start from</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={styles.preset}
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className={styles.fieldRow}>
        {FIELD_CONFIG.map((config) => {
          const raw = params[config.field];
          const normalized = result.normalized[config.field];
          const changed = raw.trim().length > 0 && normalized !== raw.trim();

          return (
            <div key={config.field} className={styles.field}>
              <label
                className={styles.label}
                htmlFor={`utm-${config.field}`}
              >
                {config.label}
                {config.required ? (
                  <span className={styles.required}>required</span>
                ) : (
                  <span className={styles.labelHint}>{config.hint}</span>
                )}
              </label>
              <input
                id={`utm-${config.field}`}
                type="text"
                spellCheck={false}
                className={styles.input}
                value={raw}
                placeholder={config.placeholder}
                onChange={(event) =>
                  setField(config.field, event.target.value)
                }
              />
              {changed && (
                <span className={styles.normalized}>
                  Tagged as{" "}
                  <span className={styles.normalizedValue}>{normalized}</span>
                </span>
              )}
              {config.field === "medium" && normalized && (
                <span
                  className={`${styles.channel} ${channel ? "" : styles.channelUnknown}`}
                >
                  <span className={styles.channelDot} />
                  {channel
                    ? `Lands in ${channel}`
                    : "GA4 will not recognise this. The traffic lands in Unassigned."}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.result}>
        <span className={styles.resultLabel}>Campaign URL</span>
        {result.url ? (
          <output className={styles.resultUrl}>{result.url}</output>
        ) : (
          <p className={styles.resultEmpty}>
            Add a destination URL, a source, and a medium. The link builds as
            you type.
          </p>
        )}
        <div className={styles.resultActions}>
          <button
            type="button"
            className={styles.button}
            disabled={!ready}
            onClick={() => copy(result.url, "main", "copy")}
          >
            {copied === "main" ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={!ready}
            onClick={addToList}
          >
            Add to list
          </button>
          {ready && (
            <a
              className={styles.secondaryButton}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Open
            </a>
          )}
        </div>
      </div>

      {result.issues.length > 0 && (
        <ul className={styles.issues}>
          {result.issues.map((issue) => (
            <li
              key={issue.id}
              className={`${styles.issue} ${
                issue.level === "error" ? styles.issueError : styles.issueWarning
              }`}
            >
              <span className={styles.issueMark} aria-hidden="true">
                {issue.level === "error" ? "!" : "?"}
              </span>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}

      {ready && result.issues.length === 0 && (
        <p className={styles.allClear} role="status">
          Nothing to flag. The medium is one GA4 groups, there is no personal
          data in the tags, and the values follow your convention.
        </p>
      )}

      {saved.length > 0 && (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <span className={styles.listTitle}>
              {saved.length} {saved.length === 1 ? "link" : "links"} in the list
            </span>
            <div className={styles.listActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  copy(
                    saved.map((link) => link.finalUrl).join("\n"),
                    "all",
                    "copy-all",
                  )
                }
              >
                {copied === "all" ? "Copied" : "Copy all"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={downloadCsv}
              >
                Download CSV
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setSaved([])}
              >
                Clear
              </button>
            </div>
          </div>
          <div className={styles.listTable}>
            {saved.map((link) => (
              <div key={link.key} className={styles.listRow}>
                <span className={styles.listUrl}>{link.finalUrl}</span>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => copy(link.finalUrl, link.key, "copy-row")}
                >
                  {copied === link.key ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  className={styles.listRemove}
                  aria-label="Remove this link"
                  onClick={() =>
                    setSaved((current) =>
                      current.filter((entry) => entry.key !== link.key),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <details className={styles.convention}>
        <summary>Tagging convention</summary>
        <div className={styles.conventionBody}>
          <p className={styles.conventionNote}>
            These rules are applied to every value before it goes in the link,
            so the whole team produces the same tag for the same placement.
            They are remembered in this browser.
          </p>

          <div className={styles.conventionRow}>
            <span className={styles.conventionLabel}>Letter case</span>
            <div className={styles.radioGroup}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="utm-case"
                  checked={convention.caseRule === "lower"}
                  onChange={() =>
                    updateConvention({ ...convention, caseRule: "lower" })
                  }
                />
                Force lowercase
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="utm-case"
                  checked={convention.caseRule === "preserve"}
                  onChange={() =>
                    updateConvention({ ...convention, caseRule: "preserve" })
                  }
                />
                Leave as typed
              </label>
            </div>
          </div>

          <div className={styles.conventionRow}>
            <span className={styles.conventionLabel}>Spaces</span>
            <div className={styles.radioGroup}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="utm-space"
                  checked={convention.spaceRule === "underscore"}
                  onChange={() =>
                    updateConvention({ ...convention, spaceRule: "underscore" })
                  }
                />
                Underscores
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="utm-space"
                  checked={convention.spaceRule === "hyphen"}
                  onChange={() =>
                    updateConvention({ ...convention, spaceRule: "hyphen" })
                  }
                />
                Hyphens
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="utm-space"
                  checked={convention.spaceRule === "preserve"}
                  onChange={() =>
                    updateConvention({ ...convention, spaceRule: "preserve" })
                  }
                />
                Keep spaces
              </label>
            </div>
          </div>

          <div className={styles.conventionRow}>
            <span className={styles.conventionLabel}>Punctuation</span>
            <label className={styles.radio}>
              <input
                type="checkbox"
                checked={convention.stripPunctuation}
                onChange={(event) =>
                  updateConvention({
                    ...convention,
                    stripPunctuation: event.target.checked,
                  })
                }
              />
              Strip accents and symbols
            </label>
          </div>

          <p className={styles.conventionNote}>
            Example with the current rules:{" "}
            <code>Spring Sale 2026!</code> becomes{" "}
            <code>{normalizeValue("Spring Sale 2026!", convention) || "(empty)"}</code>
          </p>

          <p className={styles.conventionNote}>
            Parameters written:{" "}
            {UTM_FIELDS.map((field) => UTM_QUERY_KEYS[field]).join(", ")}. Empty
            fields are left out rather than written blank.
          </p>
        </div>
      </details>

      <p className={styles.privacy}>
        This tool runs entirely in your browser. The URLs you build are never
        uploaded, never logged, and never leave this tab. Only your convention
        settings are saved, in this browser, so you do not have to set them
        again.
      </p>
    </div>
  );
}
