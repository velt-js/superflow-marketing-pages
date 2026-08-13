"use client";

import { useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./Tools.module.css";

/**
 * A labelled, copyable code block.
 *
 * Used for the curl and MCP snippets on the tool pages and the MCP docs page.
 * Copying is the whole point of these blocks — nobody retypes an install
 * command — so the button is part of the block rather than an afterthought,
 * and it degrades to a "select it yourself" prompt where the Clipboard API is
 * unavailable (non-secure origins, some in-app browsers) rather than throwing.
 *
 * @param props - The label above the block, the code, and analytics context.
 */
export function CodeBlock({
  label,
  code,
  tool,
  language,
}: {
  label?: string;
  code: string;
  /** Registry slug or page name, for the copy event. */
  tool: string;
  /** Shown as a hint in the header, e.g. "bash" or "json". */
  language?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const { trackEvent } = useAnalytics();

  /** Writes to the clipboard and flashes the button state. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
      trackEvent(AnalyticsEvents.DOWNLOAD, {
        tool,
        kind: "copy",
        label: label ?? "code",
      });
    } catch {
      setState("failed");
    } finally {
      window.setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLabel}>
          {label}
          {language ? <span className={styles.codeLang}>{language}</span> : null}
        </span>
        <button
          type="button"
          className={styles.codeCopy}
          onClick={copy}
          aria-live="polite"
        >
          {state === "copied"
            ? "Copied"
            : state === "failed"
              ? "Press Ctrl C"
              : "Copy"}
        </button>
      </div>
      <pre className={styles.code}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
