"use client";

import { useId, useState } from "react";
import styles from "./Tools.module.css";

export type ToolFaqItem = {
  question: string;
  /** Plain text so the same array can feed FAQPage schema without a flatten. */
  answer: string;
};

/**
 * Accordion FAQ for tool pages.
 *
 * The answers are plain strings on purpose: the page also passes the same
 * array to `buildFaqPageSchema`, and a ReactNode answer would mean
 * maintaining two copies of the text that could drift apart.
 *
 * @param props - The FAQ entries.
 */
export function ToolFaq({ items }: { items: ToolFaqItem[] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  /**
   * Toggles a panel, closing whichever one was open.
   *
   * @param index - The item that was clicked.
   */
  function toggle(index: number) {
    try {
      setOpenIndex((current) => (current === index ? null : index));
    } catch {
      setOpenIndex(null);
    }
  }

  return (
    <div className={styles.faqList}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question} className={styles.faqItem}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={buttonId}
                className={styles.faqButton}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                {item.question}
                <svg
                  className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </h3>
            {isOpen ? (
              <p
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={styles.faqAnswer}
              >
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
