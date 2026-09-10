import Link from "next/link";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./SolutionsSection.module.css";

const SECTION_HEADING = "Built for the work you already ship.";
const SECTION_SUBHEAD =
  "From regulated healthcare copy to fast-moving agency work, Superflow's AI review fits the way your team already ships.";
const HEADING_ID = "solutions-section-heading";

/** Row labels. The first row groups tickets by who you are, the second by the job. */
const TEAM_ROW_LABEL = "By team";
const JOB_ROW_LABEL = "By job";
const TEAM_ROW_LABEL_ID = "solutions-section-by-team";
const JOB_ROW_LABEL_ID = "solutions-section-by-job";

/**
 * The solutions index. Tickets whose own page ships in batch 2 (real estate,
 * in-house brand teams) point here until then (spec section 1).
 */
const SOLUTIONS_INDEX_HREF = "/solutions";

/** A single audience "stamp" ticket: per-industry icon, label, pastel tint. */
interface SolutionCard {
  id: string;
  label: string;
  /** Internal route the whole ticket links to. */
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
// currentColor. Link targets follow the spec section 1 table.
const SOLUTION_CARDS: SolutionCard[] = [
  {
    id: "dental",
    label: "Dental Marketing Agencies",
    href: "/solutions/dental-marketing-agencies",
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
    href: "/solutions/healthcare-marketing",
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
    href: "/solutions/home-services-marketing",
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
    href: SOLUTIONS_INDEX_HREF,
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
    href: SOLUTIONS_INDEX_HREF,
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
    href: "/solutions/pre-launch-qa",
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

// The "By job" row: the three batch-1 job pages, same ticket component. Icons
// are Tabler stroke glyphs (rocket, calendar-check, arrows-right-left).
const JOB_CARDS: SolutionCard[] = [
  {
    id: "pre-launch-qa",
    label: "Pre-launch QA",
    href: "/solutions/pre-launch-qa",
    tint: "#f3f7fe",
    iconColor: "#2f6fd6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
        <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
        <path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      </svg>
    ),
  },
  {
    id: "site-care",
    label: "Site care",
    href: "/solutions/site-care",
    tint: "#f2fbf8",
    iconColor: "#1a9a7a",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M4 11h16" />
        <path d="M15 19l2 2l4 -4" />
      </svg>
    ),
  },
  {
    id: "website-migration-qa",
    label: "Website migration QA",
    href: "/solutions/website-migration-qa",
    tint: "#fdf6f3",
    iconColor: "#d6553d",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 7l-18 0" />
        <path d="M18 10l3 -3l-3 -3" />
        <path d="M6 20l-3 -3l3 -3" />
        <path d="M3 17l18 0" />
      </svg>
    ),
  },
];

/** Props for {@link SolutionsSection}. All optional; the home render is the default. */
export interface SolutionsSectionProps {
  /** Override the section heading. Defaults to the home copy. */
  heading?: string;
  /** Override the supporting line. Defaults to the home copy. */
  subhead?: string;
  /** Render nothing, for a page that already lists these links elsewhere. */
  hidden?: boolean;
}

/** Props for one labelled row of tickets. */
interface TicketRowProps {
  label: string;
  labelId: string;
  cards: readonly SolutionCard[];
  /**
   * Compact rows (fewer than six tickets) keep the six-row ticket size and
   * center, instead of stretching to fill the width.
   */
  compact?: boolean;
}

/**
 * One labelled row of stamp tickets. Each ticket is a single `Link` covering
 * the whole stamp, so the entire ticket is the click and focus target.
 *
 * @param props - The row label, its id and the tickets to render.
 * @returns The labelled list.
 */
function TicketRow({ label, labelId, cards, compact = false }: TicketRowProps): ReactNode {
  const gridClassName = compact ? `${styles.grid} ${styles.gridCompact}` : styles.grid;
  return (
    <div className={styles.row}>
      <p id={labelId} className={styles.rowLabel}>
        {label}
      </p>
      <ul className={gridClassName} aria-labelledby={labelId}>
        {cards.map((card) => {
          const ticketStyle = {
            "--ticket-tint": card.tint,
            "--ticket-icon": card.iconColor,
          } as CSSProperties;
          return (
            <li key={card.id} className={styles.cell}>
              <Link href={card.href} className={styles.ticket} style={ticketStyle}>
                <span className={styles.icon}>{card.icon}</span>
                <h3 className={styles.label}>{card.label}</h3>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Solutions, "Built for the work you already ship." A centered editorial
 * header (Adamina serif heading + supporting line) over two labelled rows of
 * pastel postage-stamp "tickets" (specs mirrored from Figma node 638:8167):
 * six "By team" tickets and three "By job" tickets. Each near-square ticket is
 * clipped by a single-path SVG stamp mask (semicircular notches on every edge,
 * clean rounded corners), with a top-left icon and a bottom-left label, and is
 * one `Link` to its solutions page. Adjacent tickets overlap horizontally with
 * a subtle vertical zig-zag; hovering or focusing one brings it to the front
 * with a soft scale + shadow, all CSS, so this stays a server component. The
 * overlapped row collapses to a plain 3 -> 2 grid, then a horizontal ticket
 * strip on phones.
 *
 * @param props - Optional heading / subhead overrides, or `hidden` to skip
 *   the section. Omit everything for the home render.
 * @returns The section, or null when hidden.
 */
export default function SolutionsSection({
  heading,
  subhead,
  hidden = false,
}: SolutionsSectionProps = {}): ReactNode {
  if (hidden) {
    return null;
  }

  return (
    <section
      className={styles.section}
      data-section="solutions"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {heading ?? SECTION_HEADING}
          </h2>
          <p className={styles.subhead}>{subhead ?? SECTION_SUBHEAD}</p>
        </header>

        <div className={styles.rows}>
          <TicketRow
            label={TEAM_ROW_LABEL}
            labelId={TEAM_ROW_LABEL_ID}
            cards={SOLUTION_CARDS}
          />
          <TicketRow
            label={JOB_ROW_LABEL}
            labelId={JOB_ROW_LABEL_ID}
            cards={JOB_CARDS}
            compact
          />
        </div>
      </div>
    </section>
  );
}
