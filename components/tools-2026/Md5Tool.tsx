"use client";

// Interactive MD5 generator for /tools/md5-generator.
//
// Hashes through the site's own /api/tools/md5 endpoint rather than in the
// browser, so the page doubles as a live demo of the API and there is only
// one implementation to keep correct.
//
// The request goes out as POST with a text/plain body: the raw body needs
// neither URL-encoding nor JSON-escaping, so text containing quotes,
// newlines, ampersands or emoji hashes correctly with no escaping layer in
// between.

import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./Md5Tool.module.css";

/** Debounce before hashing, in ms. Long enough to skip most keystrokes. */
const DEBOUNCE_MS = 250;

/** Mirrors the endpoint's own cap, so oversized input fails in the UI. */
const MAX_BYTES = 1024 * 1024;

const API_SNIPPET = `curl -X POST https://usesuperflow.ai/api/tools/md5 \\
  -H 'Content-Type: text/plain' \\
  --data-binary 'hello'

{"md5":"5d41402abc4b2a76b9719d911017c592","algorithm":"md5","bytes":5}`;

type Result =
  | { status: "empty" }
  | { status: "loading" }
  | { status: "done"; md5: string; bytes: number }
  | { status: "error"; message: string };

/**
 * @param props - `hideApiPanel` drops this component's own "Use it as an API"
 *   block, for pages that already carry the shared API and MCP section (see
 *   components/tools/ToolApiDocs.tsx) and would otherwise document the same
 *   endpoint twice on one screen. `bare` drops the section's own padding and
 *   background, for a page that has already put the tool on a card.
 */
export default function Md5Tool({
  hideApiPanel = false,
  bare = false,
}: {
  hideApiPanel?: boolean;
  bare?: boolean;
} = {}) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result>({ status: "empty" });
  const [copied, setCopied] = useState(false);

  // Monotonic request id. Responses that are not from the newest request
  // are dropped, so a slow early request cannot overwrite a later result.
  const requestId = useRef(0);

  useEffect(() => {
    if (text === "") {
      requestId.current += 1;
      setResult({ status: "empty" });
      return;
    }

    const bytes = new TextEncoder().encode(text).length;
    if (bytes > MAX_BYTES) {
      requestId.current += 1;
      setResult({
        status: "error",
        message: `Text is too large: ${bytes.toLocaleString()} bytes, limit is 1 MB.`,
      });
      return;
    }

    const id = ++requestId.current;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResult({ status: "loading" });
      try {
        const response = await fetch("/api/tools/md5", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: text,
          signal: controller.signal,
        });
        const data = await response.json();
        if (id !== requestId.current) return;

        if (!response.ok) {
          setResult({ status: "error", message: data?.error ?? "Something went wrong." });
          return;
        }

        setResult({ status: "done", md5: data.md5, bytes: data.bytes });
      } catch {
        // An aborted request is a superseded one, not a failure worth showing.
        if (id !== requestId.current || controller.signal.aborted) return;
        setResult({ status: "error", message: "Could not reach the hashing endpoint." });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  // Drop the "Copied" confirmation back to "Copy" after a beat.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (result.status !== "done") return;
    try {
      await navigator.clipboard.writeText(result.md5);
      setCopied(true);
    } catch {
      // Clipboard permission denied or unavailable; the digest stays
      // selectable on screen, so there is nothing to recover from.
    }
  }, [result]);

  const charCount = text.length;

  return (
    <section
      className={`${styles.section}${bare ? ` ${styles.sectionBare}` : ""}`}
      data-section="md5-tool"
    >
      <div className={styles.inner}>
        <div className={styles.card}>
          <label className={styles.label} htmlFor="md5-input">
            <span>Your text</span>
            <span className={styles.count}>
              {charCount.toLocaleString()} {charCount === 1 ? "character" : "characters"}
              {result.status === "done" ? ` / ${result.bytes.toLocaleString()} bytes` : ""}
            </span>
          </label>

          <textarea
            id="md5-input"
            className={styles.textarea}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste or type anything. The MD5 hash appears below as you type."
            spellCheck={false}
            autoComplete="off"
          />

          <span className={styles.resultLabel} id="md5-result-label">
            MD5 hash
          </span>

          <div className={styles.resultRow}>
            <output
              className={[
                styles.result,
                result.status === "done" ? "" : styles.resultEmpty,
                result.status === "error" ? styles.resultError : "",
              ]
                .filter(Boolean)
                .join(" ")}
              htmlFor="md5-input"
              aria-labelledby="md5-result-label"
              aria-live="polite"
            >
              {result.status === "empty" && "Waiting for text"}
              {result.status === "loading" && "Hashing"}
              {result.status === "done" && result.md5}
              {result.status === "error" && result.message}
            </output>

            <button
              type="button"
              className={styles.copy}
              onClick={handleCopy}
              disabled={result.status !== "done"}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {hideApiPanel ? null : (
          <div className={styles.api}>
            <h2 className={styles.apiHeading}>Use it as an API</h2>
            <p className={styles.apiCopy}>
              This page calls the same public endpoint you can call yourself. It takes text
              as a query parameter, a JSON body, a form field, or a raw body, and always
              answers with JSON.
            </p>
            <pre className={styles.apiCode}>{API_SNIPPET}</pre>
          </div>
        )}
      </div>
    </section>
  );
}
