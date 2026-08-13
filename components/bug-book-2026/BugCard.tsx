import Link from "next/link";
import {
  cardCtaLabel,
  formatBugDate,
  RAGE_METER_MIN,
  type BugBookListEntry,
} from "@/lib/bug-book";
import BugThumbnail from "./BugThumbnail";
import { CategoryChip, SeverityChip, SourceBadge, VibeBadge } from "./Chips";
import RageMeter from "./RageMeter";
import styles from "./BugCard.module.css";

function ArrowIcon() {
  return (
    <svg
      className={styles.ctaIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One Bug Book card — used by the /bug-book grid and the detail page's
 * "More from the Bug Book" section. Whole card links to the entry.
 */
export default function BugCard({ entry }: { entry: BugBookListEntry }) {
  const dateLabel = formatBugDate(entry.date);
  const metaParts = [
    entry.siteDescriptor,
    entry.sitePlatform,
    dateLabel,
  ].filter(Boolean);

  return (
    <Link href={`/bug-book/${entry.slug}`} className={styles.card}>
      <BugThumbnail category={entry.category} />
      <div className={styles.body}>
        <div className={styles.badges}>
          <VibeBadge vibe={entry.vibe} sassType={entry.sassType} />
          <CategoryChip category={entry.category} />
          <SeverityChip severity={entry.severity} />
          <SourceBadge
            source={entry.source}
            label={entry.source === "agent" ? "Agent" : "Review"}
          />
          {entry.rageLevel >= RAGE_METER_MIN ? (
            <RageMeter level={entry.rageLevel} compact />
          ) : null}
        </div>
        <h3 className={styles.headline}>{entry.headline}</h3>
        {entry.hook ? <p className={styles.hook}>{entry.hook}</p> : null}
        <div className={styles.footer}>
          {metaParts.length > 0 ? (
            <p className={styles.meta}>{metaParts.join(" · ")}</p>
          ) : null}
          <span className={styles.cta}>
            {cardCtaLabel(entry.source)}
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
