import type { ChecklistDoc } from "@/lib/checklist-types";
import styles from "./ChecklistWhatHow.module.css";

/**
 * A single centred copy block: serif ink heading over muted body copy.
 *
 * @param props.title - The block heading.
 * @param props.body - The block body copy.
 * @returns The block, or `null` when both fields are empty or on failure.
 */
function WhatHowBlock({ title, body }: { title?: string; body?: string }) {
  try {
    if (!title && !body) {
      return null;
    }
    return (
      <div className={styles.block}>
        {title ? <h2 className={styles.heading}>{title}</h2> : null}
        {body ? <p className={styles.body}>{body}</p> : null}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-style "what is this checklist / how to use it" section: the doc's two
 * intro copy blocks, centred on white with single-colour serif headings.
 * Replaces `components/checklist/ChecklistWhatHow.tsx`.
 *
 * @param props.doc - The resolved `checklistPage` Sanity document.
 * @returns The section, or `null` when the doc has neither block or on failure.
 */
export default function ChecklistWhatHow({ doc }: { doc: ChecklistDoc }) {
  try {
    const hasWhat = Boolean(doc?.whatTitle || doc?.whatDescription);
    const hasHow = Boolean(doc?.howTitle || doc?.howDescription);
    if (!hasWhat && !hasHow) {
      return null;
    }

    return (
      <section className={styles.section} data-section="checklist-what-how">
        <div className={styles.inner}>
          <WhatHowBlock title={doc?.whatTitle} body={doc?.whatDescription} />
          <WhatHowBlock title={doc?.howTitle} body={doc?.howDescription} />
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
