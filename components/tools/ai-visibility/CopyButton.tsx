"use client";

import { useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./Report.module.css";

/**
 * Copy-to-clipboard button used on every fix snippet.
 *
 * Falls back to selecting nothing and showing a failure state rather than
 * throwing when the Clipboard API is unavailable, which happens on
 * non-secure origins and in some in-app browsers.
 *
 * @param props - The text to copy and what to call it in analytics.
 */
export function CopyButton({
  value,
  label = "Copy",
  analyticsLabel,
  className,
}: {
  value: string;
  label?: string;
  analyticsLabel?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      trackEvent(AnalyticsEvents.DOWNLOAD, {
        tool: "ai-visibility-checker",
        kind: "copy",
        label: analyticsLabel ?? label,
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
      className={className ?? styles.copyButton}
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
