"use client";

// The embeddable badge offer, shown under a result that earned one.
//
// THE DEAL
//
// The site owner gets a small mark for their footer or their README. We get a
// link from a real site, on a page that already cares about the thing we
// check. Nobody is tricked: the badge links to the live result, so anybody who
// doubts it clicks through and sees the run.
//
// WHY AN UNEARNED RESULT STILL SEES THIS BLOCK
//
// Because "you are three fixes away from this" is the most useful thing the
// tool can say to somebody who just got bad news, and hiding the badge
// entirely would make it invisible to exactly the people who would work for
// it. So a result that has not earned the badge sees the badge it could have,
// greyed, and the reason it is not available yet. What it does NOT get is a
// snippet, because there is nothing honest to paste.
//
// WHY THE PREVIEW IS THE LIVE ENDPOINT
//
// The image below is the same URL the snippet embeds, not a local mock. If the
// badge endpoint is wrong about this result, the visitor sees that here rather
// than after pasting it into their site.

import { useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  BADGE_HEIGHT,
  BADGE_WIDTH,
  badgeAltText,
  badgeEmbedHtml,
  badgeEmbedMarkdown,
  badgeImageUrl,
  badgeRequirement,
  offersBadge,
} from "@/lib/tools/share/links";
import type { ShareSnapshot } from "@/lib/tools/share/types";
import styles from "./Share.module.css";

/** How long the copy button stays in its confirmed state. */
const FLASH_MS = 2000;

/** Which snippet the visitor is looking at. */
type Format = "html" | "markdown";

/**
 * The badge block for one result.
 *
 * Renders nothing at all for a tool that does not offer a badge, which is most
 * of them: see `BADGE_TOOLS`.
 *
 * @param props - The snapshot, and the origin the parent resolved after mount
 *   so both blocks build identical URLs.
 */
export function EmbedBadge({
  snapshot,
  origin,
}: {
  snapshot: ShareSnapshot;
  origin?: string;
}) {
  const { trackEvent } = useAnalytics();
  const [format, setFormat] = useState<Format>("html");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  if (!offersBadge(snapshot.slug)) return null;

  const earned = snapshot.badge !== null;
  const imageUrl = badgeImageUrl(
    { slug: snapshot.slug, targetUrl: snapshot.targetUrl, theme },
    origin,
  );
  const snippet =
    format === "html"
      ? badgeEmbedHtml(snapshot, origin, theme)
      : badgeEmbedMarkdown(snapshot, origin, theme);

  /** Copies the snippet, flashing the button to confirm. */
  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied("done");
      trackEvent(AnalyticsEvents.SHARE_CLICK, {
        tool: snapshot.slug,
        channel: `badge-${format}`,
      });
    } catch {
      setCopied("failed");
    } finally {
      window.setTimeout(() => setCopied("idle"), FLASH_MS);
    }
  }

  return (
    <div className={styles.badgeBlock}>
      <div className={styles.badgeHead}>
        <h4 className={styles.badgeHeading}>
          {earned ? "Put this on your site" : "The badge you could earn"}
        </h4>
        <p className={styles.badgeLead}>
          {earned
            ? "The badge reads the current result every time it loads, so it stays true on its own and updates when you re-run the check. It links back to this report."
            : `This badge is only offered for ${badgeRequirement(snapshot.slug)}, so it means something wherever it appears. Fix what is listed above, re-run the check, and the snippet appears here.`}
        </p>
      </div>

      <div className={styles.badgeRow}>
        <div
          className={`${styles.badgePreview} ${earned ? "" : styles.badgeUnearned} ${theme === "dark" ? styles.badgePreviewDark : ""}`}
        >
          {/* A plain <img>: an SVG served from our own route, sized exactly as
              embedded, with nothing for the image optimizer to do. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={badgeAltText(snapshot)}
            width={BADGE_WIDTH}
            height={BADGE_HEIGHT}
            loading="lazy"
          />
        </div>

        {earned ? (
          <div className={styles.badgeControls}>
            <div className={styles.segmented} role="group" aria-label="Theme">
              <button
                type="button"
                className={`${styles.segment} ${theme === "light" ? styles.segmentOn : ""}`}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                Light
              </button>
              <button
                type="button"
                className={`${styles.segment} ${theme === "dark" ? styles.segmentOn : ""}`}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                Dark
              </button>
            </div>

            <div className={styles.segmented} role="group" aria-label="Format">
              <button
                type="button"
                className={`${styles.segment} ${format === "html" ? styles.segmentOn : ""}`}
                onClick={() => setFormat("html")}
                aria-pressed={format === "html"}
              >
                HTML
              </button>
              <button
                type="button"
                className={`${styles.segment} ${format === "markdown" ? styles.segmentOn : ""}`}
                onClick={() => setFormat("markdown")}
                aria-pressed={format === "markdown"}
              >
                Markdown
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {earned ? (
        <div className={styles.snippetWrap}>
          <pre className={styles.snippet}>
            <code>{snippet}</code>
          </pre>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => void copySnippet()}
            aria-live="polite"
          >
            {copied === "done"
              ? "Copied"
              : copied === "failed"
                ? "Press Ctrl C"
                : `Copy ${format === "html" ? "HTML" : "Markdown"}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
