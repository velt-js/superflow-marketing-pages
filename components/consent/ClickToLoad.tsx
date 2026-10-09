"use client";

// Click-to-load wrapper for third-party embeds (Calendly, Tally).
//
// An embed is a page from another company inside ours: it sets that
// company's cookies and, in Calendly's case, pulls in several more vendors
// (Stripe, Segment, Sprig, Braze). None of that may load before the visitor
// asks for it, so the embed renders only after they click the button. The
// click is the consent for that one embed; nothing is remembered across pages.

import { useState, type ReactNode } from "react";
import styles from "./ClickToLoad.module.css";

export function ClickToLoad({
  title,
  provider,
  buttonLabel,
  minHeight,
  children,
}: {
  title: string;
  /** Who serves the embed, named in the notice, e.g. "Calendly". */
  provider: string;
  buttonLabel: string;
  minHeight: number;
  children: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  if (loaded) return <>{children}</>;
  return (
    <div className={styles.placeholder} style={{ minHeight }} data-click-to-load={provider}>
      <p className={styles.title}>{title}</p>
      <p className={styles.note}>
        This loads {provider}, which may set its own cookies and collect information about your visit.
      </p>
      <button type="button" className={styles.button} onClick={() => setLoaded(true)}>
        {buttonLabel}
      </button>
    </div>
  );
}
