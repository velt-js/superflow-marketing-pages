"use client";

import Image from "next/image";
import { useId, useState } from "react";
import styles from "./FaqSection.module.css";
import { FAQ_ITEMS, type FaqItem } from "./faq-data";

// FAQ_ITEMS/FaqItem live in the server-safe ./faq-data module (see the note
// there) and are re-exported here so existing client-side importers keep the
// same import path. Server Components must import them from ./faq-data
// directly — a re-export from this "use client" module still crosses the
// client boundary and yields a proxy instead of the real array.
export { FAQ_ITEMS };
export type { FaqItem };

const HEADING_TEXT = "Frequently Asked Questions";
const CONTACT_PROMPT = "Have Questions? Reach out to";
const CONTACT_EMAIL = "emma@usesuperflow.com";
/** Assets exported from Figma node 582:6439. */
const DOODLE_SRC = "/images/home-2026/faq/question-doodle.svg";
const AVATAR_SRC = "/images/home-2026/faq/emma-avatar.png";

/**
 * Inline "plus" icon (Tabler style) used as the accordion indicator. The parent
 * rotates it 45° into an "×" via CSS when its item is expanded.
 */
function FaqSectionPlusIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

type FaqSectionAccordionItemProps = {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  baseId: string;
  onToggle: (index: number) => void;
};

/**
 * A single expandable/collapsible FAQ row rendered as an accessible disclosure:
 * a heading-wrapped button (aria-expanded / aria-controls) paired with a labelled
 * answer region that animates open.
 */
function FaqSectionAccordionItem({
  item,
  index,
  isOpen,
  baseId,
  onToggle,
}: FaqSectionAccordionItemProps) {
  const triggerId = `${baseId}-trigger-${index}`;
  const panelId = `${baseId}-panel-${index}`;
  const itemClassName = isOpen ? `${styles.item} ${styles.itemOpen}` : styles.item;
  const panelClassName = isOpen ? `${styles.panel} ${styles.panelOpen}` : styles.panel;

  return (
    <li className={itemClassName}>
      <h3 className={styles.headingWrapper}>
        <button
          type="button"
          id={triggerId}
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(index)}
        >
          <span className={styles.question}>{item?.question}</span>
          <FaqSectionPlusIcon />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={panelClassName}
      >
        <div className={styles.panelInner}>
          <p className={styles.answer}>{item?.answer}</p>
        </div>
      </div>
    </li>
  );
}

/**
 * Per-page overrides for the FAQ section. Omit a field to use the homepage
 * default (so /home-preview renders unchanged).
 */
export interface FaqSectionProps {
  heading?: string;
  items?: FaqItem[];
}

/**
 * 09 / FAQ — the 2026 homepage FAQ section. Renders an intro column (heading +
 * contact) alongside a single-open, keyboard-accessible accordion of questions.
 *
 * @param props - Optional per-page overrides; defaults reproduce the
 *   /home-preview homepage exactly.
 */
export default function FaqSection({ heading, items }: FaqSectionProps = {}) {
  const headingText = heading ?? HEADING_TEXT;
  const faqItems = items && items.length > 0 ? items : FAQ_ITEMS;
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  /**
   * Toggle a row: reopening the active row collapses it, otherwise the clicked
   * row opens and any previously open row closes (single-open accordion).
   */
  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.card}>
        <div className={styles.intro}>
          <div className={styles.introTop}>
            <Image
              className={styles.doodle}
              src={DOODLE_SRC}
              alt=""
              width={117}
              height={89}
            />
            <h2 id={headingId} className={styles.heading}>
              {headingText}
            </h2>
          </div>
          <div className={styles.contact}>
            <p className={styles.contactLabel}>{CONTACT_PROMPT}</p>
            <div className={styles.contactRow}>
              <Image
                className={styles.avatar}
                src={AVATAR_SRC}
                alt=""
                width={24}
                height={24}
              />
              <a className={styles.contactEmail} href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
        <ul className={styles.list}>
          {faqItems.map((item, index) => (
            <FaqSectionAccordionItem
              key={item?.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              baseId={baseId}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
