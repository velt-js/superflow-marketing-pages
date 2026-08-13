"use client";

// Tally embed for the State of Agency Tools survey.
//
// Tally's embed.js resizes the iframe to the current question
// (dynamicHeight), which matters for a one-question-per-screen form: without
// it the frame is either a scrolling box or a fixed guess. The script reads
// iframes by data-tally-src, so the src attribute is set by the script after
// load; the min-height on the frame reserves space until then.

import { useEffect } from "react";
import styles from "./Survey.module.css";

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

const EMBED_SCRIPT_SRC = "https://tally.so/widgets/embed.js";

export function TallyEmbed({ formId }: { formId: string }) {
  useEffect(() => {
    if (window.Tally) {
      window.Tally.loadEmbeds();
      return;
    }
    const existing = document.querySelector(
      `script[src="${EMBED_SCRIPT_SRC}"]`,
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = () => window.Tally?.loadEmbeds();
    document.body.appendChild(script);
  }, []);

  return (
    <iframe
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
      className={styles.embedFrame}
      loading="lazy"
      title="State of Agency Tools 2026 survey"
    />
  );
}
