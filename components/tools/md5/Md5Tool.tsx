"use client";

// MD5 Hash Generator.
//
// Client-side for the same reason the Markdown Viewer is: most of what a
// public hash tool gets pasted into is an email, a token, or a password, and
// shipping those to a server so it can run six lines of arithmetic is a bad
// trade. The /tools/md5 API route stays for programmatic callers.

import { useCallback, useMemo, useState } from "react";
import { md5 } from "@/lib/tools/md5/md5";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./Md5.module.css";

const SLUG = "md5-hash-generator";

/** Past this the keystroke-by-keystroke rehash starts to stutter. */
const MAX_CHARS = 500_000;

export function Md5Tool() {
  const { trackEvent } = useAnalytics();
  const [text, setText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [uppercase, setUppercase] = useState<boolean>(false);

  const digest = useMemo(() => {
    const hex = md5(text);
    return uppercase ? hex.toUpperCase() : hex;
  }, [text, uppercase]);

  const byteLength = useMemo(() => {
    try {
      return new TextEncoder().encode(text).length;
    } catch {
      return 0;
    }
  }, [text]);

  const onCopy = useCallback(() => {
    try {
      void navigator.clipboard.writeText(digest);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      trackEvent(AnalyticsEvents.TOOL_RESULT, { tool: SLUG, action: "copy" });
    } catch {
      // Clipboard permission denied. The value is selectable either way.
    }
  }, [digest, trackEvent]);

  return (
    <div className={styles.tool}>
      <label className={styles.label} htmlFor="md5-input">
        Text to hash
      </label>
      <textarea
        id="md5-input"
        className={styles.input}
        value={text}
        spellCheck={false}
        rows={6}
        placeholder="Type or paste anything. The hash updates as you type."
        onChange={(event) => setText(event.target.value.slice(0, MAX_CHARS))}
      />

      <div className={styles.resultRow}>
        <div className={styles.result}>
          <span className={styles.resultLabel}>MD5</span>
          {/* Always rendered, including for empty input: the hash of the
              empty string is a real answer people come here for. */}
          <output className={styles.digest}>{digest}</output>
        </div>
        <button type="button" className={styles.copyButton} onClick={onCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={styles.meta}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(event) => setUppercase(event.target.checked)}
          />
          Uppercase
        </label>
        <span>
          {byteLength.toLocaleString()} {byteLength === 1 ? "byte" : "bytes"} of
          UTF-8
        </span>
      </div>

      <div className={styles.warning} role="note">
        <strong>MD5 is not secure.</strong> Collisions have been cheap for
        twenty years, so never use it for passwords, signatures, or anything
        that has to prove authenticity. It is still the right tool for
        checksums, cache keys, dedupe keys, and Gravatar identifiers, which is
        almost certainly why you are here.
      </div>

      <p className={styles.privacy}>
        Hashing runs in your browser. Your text is never uploaded, never
        logged, and never leaves this tab.
      </p>

      <details className={styles.api}>
        <summary>Use it from the command line</summary>
        <p>
          The same hash is available as an API, which is handy in a script or
          for an AI agent. No key, no signup.
        </p>
        <pre className={styles.code}>
          <code>{`curl 'https://usesuperflow.ai/tools/md5?text=hello'

curl -X POST https://usesuperflow.ai/tools/md5 \\
  -H 'Content-Type: application/json' \\
  -d '{"text":"hello"}'`}</code>
        </pre>
        <p>
          Responds with <code>{`{ "md5", "algorithm", "bytes" }`}</code>. Input
          is capped at 1 MB.
        </p>
      </details>
    </div>
  );
}
