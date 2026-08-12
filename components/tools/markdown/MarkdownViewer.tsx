"use client";

// The Markdown Viewer.
//
// Everything runs in the browser. There is no API route behind this tool and
// no network request carrying the document anywhere, which is the difference
// between claiming privacy and having it. That is also why there is no "load
// from URL" field: fetching a URL needs a server-side proxy for CORS, and the
// moment that exists the promise on the page stops being true.

import { useCallback, useMemo, useRef, useState } from "react";
import { parseMarkdown } from "@/lib/tools/markdown/parse";
import { MarkdownRender } from "./MarkdownRender";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import styles from "./Markdown.module.css";

const SLUG = "markdown-viewer";

/** Refuses to render a file large enough to lock up the tab. */
const MAX_CHARS = 2_000_000;

const SAMPLE = `# Markdown Viewer

Paste Markdown on the left, read it on the right. Nothing is uploaded.

## What it handles

- Headings, with an outline you can jump around
- **Bold**, *italic*, ~~strikethrough~~, and \`inline code\`
- Links, images, blockquotes, and horizontal rules
- Tables and fenced code blocks

| Feature | Supported |
| --- | --- |
| Tables | Yes |
| Nested lists | Yes |

> Blockquotes work too, including nested blocks.

\`\`\`ts
const greeting: string = "fenced code keeps its formatting";
\`\`\`
`;

export function MarkdownViewer() {
  const { trackEvent } = useAnalytics();
  const [source, setSource] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [dragging, setDragging] = useState<boolean>(false);
  const [tooLarge, setTooLarge] = useState<boolean>(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseMarkdown(source), [source]);

  /**
   * Reads a dropped or chosen file into state.
   *
   * @param file - The file the user supplied.
   */
  const readFile = useCallback((file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        if (text.length > MAX_CHARS) {
          setTooLarge(true);
          return;
        }
        setTooLarge(false);
        setSource(text);
        setFileName(file.name);
        trackEvent(AnalyticsEvents.TOOL_RUN, { tool: SLUG, source: "file" });
      };
      reader.readAsText(file);
    } catch {
      setTooLarge(false);
    }
  }, [trackEvent]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const stats = useMemo(() => {
    const headings = parsed.outline.length;
    return `${parsed.wordCount.toLocaleString()} ${parsed.wordCount === 1 ? "word" : "words"} · ${headings} ${headings === 1 ? "heading" : "headings"}`;
  }, [parsed]);

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => fileInput.current?.click()}
        >
          Open a .md file
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setSource(SAMPLE);
            setFileName("");
            setTooLarge(false);
          }}
        >
          Load a sample
        </button>
        {source.length > 0 && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setSource("");
              setFileName("");
              setTooLarge(false);
            }}
          >
            Clear
          </button>
        )}
        <span className={styles.stats}>
          {fileName && <strong>{fileName}</strong>}
          {source.length > 0 ? stats : "Nothing loaded"}
        </span>
        <input
          ref={fileInput}
          type="file"
          accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
          className={styles.hiddenInput}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) readFile(file);
          }}
        />
      </div>

      {tooLarge && (
        <p className={styles.notice} role="status">
          That file is larger than 2 MB, which would lock up the tab. Try a
          smaller one.
        </p>
      )}

      <div
        className={`${styles.panes} ${dragging ? styles.dragging : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className={styles.pane}>
          <label className={styles.paneLabel} htmlFor="markdown-source">
            Markdown
          </label>
          <textarea
            id="markdown-source"
            className={styles.editor}
            value={source}
            spellCheck={false}
            placeholder="Paste Markdown here, or drop a .md file anywhere on this panel."
            onChange={(event) => {
              setSource(event.target.value.slice(0, MAX_CHARS));
              setTooLarge(false);
            }}
          />
        </div>

        <div className={styles.pane}>
          <span className={styles.paneLabel}>Preview</span>
          <div className={styles.preview}>
            {source.trim().length === 0 ? (
              <p className={styles.empty}>
                The rendered document appears here as you type.
              </p>
            ) : (
              <MarkdownRender blocks={parsed.blocks} />
            )}
          </div>
        </div>
      </div>

      {parsed.outline.length > 1 && (
        <nav className={styles.outline} aria-label="Document outline">
          <span className={styles.outlineLabel}>Outline</span>
          <ul>
            {parsed.outline.map((entry) => (
              <li key={entry.slug} data-level={entry.level}>
                <a href={`#${entry.slug}`}>{entry.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <p className={styles.privacy}>
        This tool runs entirely in your browser. Your document is never
        uploaded, never logged, and never leaves this tab. You can disconnect
        from the network and it still works.
      </p>
    </div>
  );
}
