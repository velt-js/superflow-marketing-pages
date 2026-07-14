import type { CSSProperties, ReactElement } from "react";
import styles from "./SolutionsSection.module.css";

const SECTION_HEADING = "Built for the work you already ship.";
const SECTION_SUBHEAD =
  "From regulated healthcare copy to fast-moving agency work, Superflow's AI review fits the way your team already ships.";
const HEADING_ID = "solutions-section-heading";

/** A single audience "stamp" ticket: per-industry icon, label, pastel tint. */
interface SolutionCard {
  id: string;
  label: string;
  href: string;
  /** Soft pastel ticket fill. */
  tint: string;
  /** Per-industry icon stroke color, tuned to the tint. */
  iconColor: string;
  icon: ReactElement;
}

// Card copy, icon glyphs and on-canvas order mirror the reference stamp mock
// (reading order, left-to-right). Each ticket gets a pale pastel tint plus a
// matching per-industry icon color; icons are Tabler stroke glyphs drawn with
// currentColor.
const SOLUTION_CARDS: SolutionCard[] = [
  {
    id: "dental",
    label: "Dental Marketing Agencies",
    href: "#",
    tint: "#fcf5fc",
    iconColor: "#dc3ac5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5.5c-1.074 -1.514 -2.582 -2.5 -4.5 -2.5c-2.261 0 -3.938 1.686 -4.5 4c-.454 2.19 1 5.5 2 7c.66 .99 .955 3.02 1.5 5c.492 1.784 1 3 2 3s1.5 -1 2 -3c.5 -2 1 -3 2 -3s1.5 1 2 3c.5 2 1 3 2 3s1.5 -1.5 2 -3c.545 -1.98 .84 -4.01 1.5 -5c1 -1.5 2.454 -4.81 2 -7c-.562 -2.314 -2.239 -4 -4.5 -4c-1.918 0 -3.426 .986 -4.5 2.5z" />
      </svg>
    ),
  },
  {
    id: "medical",
    label: "Medical and healthcare content",
    href: "#",
    tint: "#f6f5fe",
    iconColor: "#5434e3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566z" />
      </svg>
    ),
  },
  {
    id: "home-services",
    label: "Home-services marketing",
    href: "#",
    tint: "#f4faf5",
    iconColor: "#2ca23d",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
      </svg>
    ),
  },
  {
    id: "real-estate",
    label: "Real estate marketing",
    href: "#",
    tint: "#fcf9f5",
    iconColor: "#d6903d",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21l18 0" />
        <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 8l1 0" />
        <path d="M9 12l1 0" />
        <path d="M9 16l1 0" />
        <path d="M14 8l1 0" />
        <path d="M14 12l1 0" />
        <path d="M14 16l1 0" />
      </svg>
    ),
  },
  {
    id: "in-house",
    label: "In-house content and brand teams",
    href: "#",
    tint: "#fcf4fb",
    iconColor: "#cb2cb4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 3v7h6l-8 11v-7h-6l8 -11z" />
      </svg>
    ),
  },
  {
    id: "freelancers",
    label: "Freelancers and studios",
    href: "#",
    tint: "#f6f4fc",
    iconColor: "#4c2ed3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
      </svg>
    ),
  },
];

/**
 * Solutions — "Built for the work you already ship." A centered editorial
 * header (Adamina serif heading + supporting line) over a row of pastel
 * postage-stamp "tickets" (specs mirrored from Figma node 638:8167). Each
 * near-square ticket is clipped by a single-path SVG stamp mask (semicircular
 * notches on every edge, clean rounded corners), with a top-left per-industry
 * icon and a bottom-left label. Adjacent tickets overlap horizontally with a
 * subtle vertical zig-zag; hovering one brings it to the front with a soft
 * scale + shadow — all CSS, so this stays a server component. The overlapped
 * row collapses to a plain 3 -> 2 -> 1 grid on narrower widths.
 */
export default function SolutionsSection() {
  return (
    <section
      className={styles.section}
      data-section="solutions"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {SECTION_HEADING}
          </h2>
          <p className={styles.subhead}>{SECTION_SUBHEAD}</p>
        </header>

        <ul className={styles.grid}>
          {SOLUTION_CARDS.map((card) => {
            const ticketStyle = {
              "--ticket-tint": card.tint,
              "--ticket-icon": card.iconColor,
            } as CSSProperties;
            return (
              <li key={card.id} className={styles.cell}>
                <a className={styles.ticket} href={card.href} style={ticketStyle}>
                  <span className={styles.icon}>{card.icon}</span>
                  <h3 className={styles.label}>{card.label}</h3>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
