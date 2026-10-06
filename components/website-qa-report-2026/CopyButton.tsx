"use client";

// Copy-to-clipboard buttons: the finding share links and the citation.

import { useRef, useState } from "react";
import { QaReportEvents } from "@/lib/analytics/events";
import { trackReport } from "./report-store";
import styles from "./Report.module.css";

/** Copies text, falling back to a hidden textarea where the API is missing. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context. Try the old way.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function useCopy(): [boolean, (text: string) => Promise<boolean>] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy(text: string) {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    }
    return ok;
  }

  return [copied, copy];
}

/** "Copy" on the citation box. */
export function CopyCitation({ text }: { text: string }) {
  const [copied, copy] = useCopy();
  try {
    return (
      <button type="button" className={styles.secondaryButton} onClick={() => copy(text)}>
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    );
  } catch {
    return null;
  }
}

/** "Copy link" and "Share on LinkedIn" under a finding. */
export function FindingShare({
  finding,
  url,
  linkedInUrl,
}: {
  finding: number;
  url: string;
  linkedInUrl: string;
}) {
  const [copied, copy] = useCopy();
  try {
    return (
      <div className={styles.share}>
        <button
          type="button"
          className={styles.shareLink}
          onClick={async () => {
            await copy(url);
            trackReport(QaReportEvents.FINDING_SHARED, { finding, channel: "copy_link" });
          }}
        >
          <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
        </button>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.shareLink}
          onClick={() =>
            trackReport(QaReportEvents.FINDING_SHARED, { finding, channel: "linkedin" })
          }
        >
          Share on LinkedIn
        </a>
      </div>
    );
  } catch {
    return null;
  }
}
