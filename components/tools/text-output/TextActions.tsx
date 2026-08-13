"use client";

// Copy and download buttons for a block of generated text.
//
// Both tools in this pair produce text the visitor came here to take away, so
// getting it out of the page is the product rather than a nicety. Sharing the
// two buttons keeps their failure behaviour identical: one implementation, one
// set of edge cases, no chance of the llms.txt copy button silently behaving
// differently from the Markdown one.
//
// Clipboard writes fail for reasons the visitor cannot fix: a non-secure
// origin, a locked-down in-app browser, a denied permission prompt. None of
// those are worth an alert, and none of them are worth throwing, because the
// text is sitting right there and selectable. The button says so and moves on.

import { useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./TextOutput.module.css";

/**
 * Copies a string to the clipboard, flashing the button to confirm.
 *
 * @param props - The text, its button label, and analytics attribution.
 */
export function CopyTextButton({
  value,
  label = "Copy",
  tool,
  analyticsLabel,
  primary = false,
}: {
  value: string;
  label?: string;
  /** Registry slug, so every event carries `{ tool }`. */
  tool: string;
  /** What to call this text in analytics, e.g. "llms.txt". */
  analyticsLabel?: string;
  /** Renders as the filled button. Use for the main output. */
  primary?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      trackEvent(AnalyticsEvents.DOWNLOAD, {
        tool,
        kind: "copy",
        label: analyticsLabel ?? label,
      });
    } catch {
      // Nothing broke that the visitor can act on, and the text is still
      // selectable. Say which keys to press instead of raising an error.
      setState("failed");
    } finally {
      window.setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.action} ${primary ? styles.actionPrimary : ""}`}
      onClick={copy}
      aria-live="polite"
    >
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Press Ctrl C"
          : label}
    </button>
  );
}

/**
 * Saves a string to a file.
 *
 * The anchor is added to the document before the click and removed after.
 * Detached anchors do fire in Chromium, but the attached form is the one that
 * behaves the same everywhere, and this button is the whole point of the page.
 *
 * @param props - The text, the filename to save it under, and attribution.
 */
export function DownloadTextButton({
  value,
  fileName,
  label,
  tool,
  mimeType = "text/markdown;charset=utf-8",
  primary = false,
}: {
  value: string;
  /** Exactly what the file should be called, extension included. */
  fileName: string;
  label: string;
  /** Registry slug, so every event carries `{ tool }`. */
  tool: string;
  mimeType?: string;
  /** Renders as the filled button. */
  primary?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const { trackEvent } = useAnalytics();

  /** Builds a Blob, clicks a download link, then releases the object URL. */
  function download() {
    let href = "";
    try {
      const blob = new Blob([value], { type: mimeType });
      href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = fileName;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setFailed(false);
      trackEvent(AnalyticsEvents.DOWNLOAD, {
        tool,
        kind: "file",
        label: fileName,
        bytes: value.length,
      });
    } catch {
      // Blob or download unavailable. Copy still works, so say that.
      setFailed(true);
      window.setTimeout(() => setFailed(false), 3000);
    } finally {
      // Chromium reads the blob during click dispatch, so revoking once the
      // click has returned is safe and keeps the object out of memory.
      if (href) URL.revokeObjectURL(href);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.action} ${primary ? styles.actionPrimary : ""}`}
      onClick={download}
      aria-live="polite"
    >
      {failed ? "Use copy instead" : label}
    </button>
  );
}
