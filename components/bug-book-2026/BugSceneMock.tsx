import {
  formatBugDate,
  categoryColor,
  type BugBookEntryDetail,
} from "@/lib/bug-book";
import { SparkleGlyph } from "./Chips";
import styles from "./BugSceneMock.module.css";

// Staged recreation of "the moment": a generic wireframe website in a
// browser frame with the entry's first comment pinned on it, in
// Superflow's comment UI. No real screenshots exist on these pages by
// design (they contain customer PII) - the wireframe is deliberately
// abstract and the URL bar is drawn redacted, so the scene demos the
// product without re-identifying anyone.

const CAPTION = "Staged recreation. The real screenshot stays redacted.";
const REDACTED_URL_BLOCKS = "█████████";

/** The comment to stage: first thread comment, else the agent finding. */
function pickStagedComment(entry: BugBookEntryDetail): {
  speaker: string;
  text: string;
  isAgent: boolean;
} | null {
  const first = entry.thread?.[0];
  if (first) {
    return {
      speaker: first.speaker,
      text: first.text,
      isAgent: entry.source === "agent",
    };
  }
  if (entry.finding?.description) {
    return {
      speaker: entry.agentName ?? "Superflow Agent",
      text: entry.finding.description,
      isAgent: true,
    };
  }
  return null;
}

/**
 * Wireframe site + pinned comment hero visual for the detail page.
 * Decorative wireframe is aria-hidden; the comment text itself is
 * repeated in the thread/finding section below, so the whole figure is
 * presented as an illustration.
 */
export default function BugSceneMock({
  entry,
}: {
  entry: BugBookEntryDetail;
}) {
  const staged = pickStagedComment(entry);
  if (!staged) return null;

  const { accent, tint } = categoryColor(entry.category);
  const initial = (staged.speaker[0] ?? "?").toUpperCase();
  const dateLabel = formatBugDate(entry.date);

  return (
    <figure className={styles.figure}>
      <div className={styles.frame} style={{ background: tint }}>
        {/* Browser chrome with a redacted URL */}
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.urlBar}>
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="none"
              aria-hidden="true"
            >
              <rect x="1" y="5" width="8" height="6" rx="1.5" fill="#a3a8b3" />
              <path
                d="M3 5V3.5a2 2 0 0 1 4 0V5"
                stroke="#a3a8b3"
                strokeWidth="1.4"
                fill="none"
              />
            </svg>
            https://{REDACTED_URL_BLOCKS}.com
          </span>
        </div>

        {/* Generic wireframe page - category-tinted, no real brand */}
        <div className={styles.site} aria-hidden="true">
          <div className={styles.siteHeader}>
            <span className={styles.siteLogo} style={{ background: accent }} />
            <span className={styles.siteNavItem} />
            <span className={styles.siteNavItem} />
            <span className={styles.siteNavItem} />
            <span className={styles.siteCta} style={{ background: accent }} />
          </div>
          <div className={styles.siteHero}>
            <span className={styles.siteHeadline} />
            <span className={styles.siteHeadlineShort} />
            <span className={styles.siteSub} />
          </div>
          <div className={styles.siteCards}>
            <span className={styles.siteCard} />
            <span className={styles.siteCard} />
            <span className={styles.siteCard} />
          </div>
        </div>

        {/* The pinned Superflow comment */}
        <div className={styles.commentAnchor}>
          <span
            className={styles.pin}
            style={{ background: accent }}
            aria-hidden="true"
          >
            1
          </span>
          <div className={styles.popover}>
            <div className={styles.popoverHeader}>
              {staged.isAgent ? (
                <span className={styles.agentAvatar} aria-hidden="true">
                  <SparkleGlyph size={13} />
                </span>
              ) : (
                <span className={styles.avatar} aria-hidden="true">
                  {initial}
                </span>
              )}
              <span className={styles.speaker}>{staged.speaker}</span>
              {dateLabel ? (
                <span className={styles.commentDate}>{dateLabel}</span>
              ) : null}
            </div>
            <p className={styles.commentText}>{staged.text}</p>
            {entry.thread?.[0]?.attachment ? (
              <span className={styles.commentAttachment}>
                {entry.thread[0].attachment === "screen recording"
                  ? "🎥 screen recording"
                  : "📎 screenshot"}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{CAPTION}</figcaption>
    </figure>
  );
}
