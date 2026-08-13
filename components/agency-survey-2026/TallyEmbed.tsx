"use client";

// Tally embed for the State of Agency Tools survey.
//
// Tally's embed.js resizes the iframe to the current question
// (dynamicHeight), which matters for a one-question-per-screen form. The
// script reads iframes by data-tally-src and assigns src itself - but if it
// never loads (ad blockers commonly block widget scripts), an iframe with
// only data-tally-src stays blank forever. So the frame keeps a real src as
// well: the form always renders at the reserved min-height with internal
// scrolling, and embed.js upgrades it to auto-resize when it loads.

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

  const embedUrl = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;

  return (
    <iframe
      src={embedUrl}
      data-tally-src={embedUrl}
      className={styles.embedFrame}
      loading="lazy"
      title="State of Agency Tools 2026 survey"
    />
  );
}
