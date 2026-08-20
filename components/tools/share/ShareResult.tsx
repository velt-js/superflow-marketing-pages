"use client";

// The "Share this result" block that closes every tool result.
//
// WHY THIS EXISTS
//
// A result that only lives in the tab it was run in is a dead end. Somebody
// checks their site, learns something worth telling a colleague, and has
// nothing to send but a screenshot. The permalink and the card fix that, and
// this block is where the visitor finds out they exist: without it the address
// bar is technically shareable and nobody notices.
//
// WHAT IT SHOWS
//
// The permalink, a copy button, the two places these actually get shared, and
// a thumbnail of the card the link will unfurl as. The thumbnail is not
// decoration: it is the reason to send the link rather than a screenshot, and
// it is also the honest thing to show, because it is exactly what the person
// on the other end will see.
//
// ORIGIN
//
// Every URL here is absolute, because they are read by other people's
// machines. The live origin is read from `window` after mount so a preview
// deploy shares itself rather than production, and the first render uses the
// canonical site URL so the markup is stable between server and client.

import { useEffect, useState } from "react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  linkedInShareUrl,
  resultPermalink,
  shareCardUrl,
  xShareUrl,
} from "@/lib/tools/share/links";
import type { ShareSnapshot } from "@/lib/tools/share/types";
import { EmbedBadge } from "./EmbedBadge";
import styles from "./Share.module.css";

/** How long the copy button stays in its confirmed state. */
const FLASH_MS = 2000;

/**
 * The share block for one result.
 *
 * @param props - The snapshot to share.
 */
export function ShareResult({ snapshot }: { snapshot: ShareSnapshot }) {
  const { trackEvent } = useAnalytics();
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  // Read the live origin only after mount. Doing it during render would make
  // the server and client markup disagree on a preview deploy.
  useEffect(() => {
    try {
      setOrigin(window.location.origin);
    } catch {
      // Leaves the canonical site URL in place, which is still correct.
    }
  }, []);

  const permalink = resultPermalink(snapshot, origin);
  const cardUrl = shareCardUrl(snapshot, origin);

  /** Copies the permalink, flashing the button to confirm. */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(permalink);
      setCopied("done");
      trackEvent(AnalyticsEvents.SHARE_CLICK, {
        tool: snapshot.slug,
        channel: "copy-link",
      });
    } catch {
      // A clipboard write fails for reasons the visitor cannot fix: a
      // non-secure origin, an in-app browser, a denied permission. The link is
      // selectable in the field beside the button, so say which keys to press.
      setCopied("failed");
    } finally {
      window.setTimeout(() => setCopied("idle"), FLASH_MS);
    }
  }

  /**
   * Records an outbound share.
   *
   * @param channel - Where the visitor is sharing to.
   */
  function trackShare(channel: string) {
    trackEvent(AnalyticsEvents.SHARE_CLICK, { tool: snapshot.slug, channel });
  }

  return (
    <section className={styles.wrap} aria-label="Share this result">
      <div className={styles.head}>
        <h3 className={styles.heading}>Share this result</h3>
        <p className={styles.lead}>
          This link opens the same report for anybody, and re-runs the check
          once the cached result has expired, so it never shows a result that
          stopped being true.
        </p>
      </div>

      <div className={styles.body}>
        <div className={styles.actions}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Permalink</span>
            <input
              className={styles.input}
              type="text"
              readOnly
              value={permalink}
              // Selecting the whole link on focus makes the manual copy path
              // one keystroke rather than a drag.
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Permalink to this result"
            />
          </label>

          <div className={styles.buttons}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => void copyLink()}
              aria-live="polite"
            >
              {copied === "done"
                ? "Copied"
                : copied === "failed"
                  ? "Press Ctrl C"
                  : "Copy link"}
            </button>
            <a
              className={styles.button}
              href={xShareUrl(snapshot, permalink)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShare("x")}
            >
              Share on X
            </a>
            <a
              className={styles.button}
              href={linkedInShareUrl(permalink)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShare("linkedin")}
            >
              Share on LinkedIn
            </a>
          </div>
        </div>

        <figure className={styles.cardFigure}>
          {/* A plain <img>: this is a generated card from our own API route
              whose query string changes on every run, so there is nothing for
              the image optimizer to cache usefully. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.cardImage}
            src={cardUrl}
            alt={`Preview of the card this link unfurls as: ${snapshot.headline}`}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            loading="lazy"
          />
          <figcaption className={styles.cardCaption}>
            What people see when you paste the link
          </figcaption>
        </figure>
      </div>

      <EmbedBadge snapshot={snapshot} origin={origin} />
    </section>
  );
}
