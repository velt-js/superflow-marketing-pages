import Link from "next/link";
import {
  categoryColor,
  formatBugDate,
  RAGE_METER_MIN,
  severityColor,
  type BugBookListEntry,
} from "@/lib/bug-book";
import BugQuoteVisual from "./BugQuoteVisual";
import { VibeBadge } from "./Chips";
import RageMeter from "./RageMeter";
import styles from "./BugCard.module.css";

// Card = a quote visual + a short text block, following Spur's
// thumbnail-then-minimal-text rhythm. The visual is the entry's real
// pull-quote on a vibe-tinted gradient rather than an illustration:
// generated art would be decoration, the quote is the actual product.
// Severity and source are filter axes, not scanning aids, so they shrink
// to a dot and a glyph in the meta line instead of taking chips.

function ArrowIcon() {
  return (
    <svg
      className={styles.arrow}
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tiny sparkle marking an agent catch in the meta line. */
function AgentGlyph() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 .8 7.3 4.2 10.8 5.5 7.3 6.8 6 10.2 4.7 6.8 1.2 5.5 4.7 4.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * One Bug Book card - used by the /bug-book grid and the detail page's
 * "More from the Bug Book" section. Whole card links to the entry.
 */
export default function BugCard({ entry }: { entry: BugBookListEntry }) {
  const { accent } = categoryColor(entry.category);
  const sev = severityColor(entry.severity);
  const dateLabel = formatBugDate(entry.date);

  return (
    <Link
      href={`/bug-book/${entry.slug}`}
      className={styles.card}
      style={{ ["--bug-accent" as string]: accent }}
    >
      {entry.pullQuote ? (
        <BugQuoteVisual
          quote={entry.pullQuote}
          vibe={entry.vibe}
          attribution={entry.pullQuoteSpeaker}
        />
      ) : null}

      <div className={styles.body}>
        <div className={styles.top}>
          <VibeBadge vibe={entry.vibe} sassType={entry.sassType} />
          {entry.rageLevel >= RAGE_METER_MIN ? (
            <RageMeter level={entry.rageLevel} compact />
          ) : null}
        </div>

        <h3 className={styles.headline}>{entry.headline}</h3>

        <div className={styles.footer}>
          <p className={styles.meta}>
            <span className={styles.category} style={{ color: accent }}>
              {entry.category}
            </span>
            <span
              className={styles.severity}
              title={`Severity: ${entry.severity}`}
            >
              <span
                className={styles.severityDot}
                style={{ background: sev.accent }}
                aria-hidden="true"
              />
              {entry.severity}
            </span>
            {entry.source === "agent" ? (
              <span className={styles.agent}>
                <AgentGlyph />
                Agent
              </span>
            ) : null}
          </p>
          <p className={styles.site}>
            {[entry.siteDescriptor, dateLabel].filter(Boolean).join(" · ")}
            <ArrowIcon />
          </p>
        </div>
      </div>
    </Link>
  );
}
