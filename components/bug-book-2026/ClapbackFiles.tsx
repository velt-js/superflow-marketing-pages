import Link from "next/link";
import {
  SASS_TYPE_LABELS,
  type BugBookListEntry,
} from "@/lib/bug-book";
import styles from "./ClapbackFiles.module.css";

// "The Clapback Files" - a strip above the main grid featuring the
// sassiest threads, with the punchline itself as the card's primary text
// in large type. Each card is a self-contained, shareable quote; the
// headline drops to a caption underneath.

const HEADING = "The Clapback Files";
const SUBHEAD =
  "The best replies in the book. Every one of these was typed by a real person, on a real site, in a real review.";
const MAX_CARDS = 4;
const CTA_LABEL = "Read the thread";

/** Cards need a quote to be worth showing, so quoteless entries drop out. */
function pickClapbacks(entries: BugBookListEntry[]): BugBookListEntry[] {
  return entries
    .filter((entry) => entry.vibe === "sass" && entry.sassQuote)
    .slice(0, MAX_CARDS);
}

function QuoteMark() {
  return (
    <svg
      className={styles.quoteMark}
      viewBox="0 0 32 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.4 0v9.6c0 6.9-3.9 12.3-10.4 14.4L1 20.4c3.9-1.5 6-3.9 6.3-7.2H0V0h13.4Zm18.6 0v9.6c0 6.9-3.9 12.3-10.4 14.4l-2-3.6c3.9-1.5 6-3.9 6.3-7.2h-7.3V0H32Z" />
    </svg>
  );
}

/**
 * The sassy strip. Renders nothing when the set has no sassy entries
 * with a pull-quote, so it degrades quietly as content rotates.
 */
export default function ClapbackFiles({
  entries,
}: {
  entries: BugBookListEntry[];
}) {
  const clapbacks = pickClapbacks(entries);
  if (clapbacks.length === 0) return null;

  return (
    <section className={styles.strip} aria-labelledby="clapback-files-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.heading} id="clapback-files-heading">
            {HEADING}
          </h2>
          <p className={styles.subhead}>{SUBHEAD}</p>
        </header>
        <ul className={styles.grid}>
          {clapbacks.map((entry) => {
            const typeLabel = entry.sassType
              ? SASS_TYPE_LABELS[entry.sassType]
              : null;
            return (
              <li key={entry._id} className={styles.item}>
                <Link
                  href={`/bug-book/${entry.slug}`}
                  className={styles.card}
                >
                  <QuoteMark />
                  <blockquote className={styles.quote}>
                    {entry.sassQuote}
                  </blockquote>
                  <p className={styles.caption}>{entry.headline}</p>
                  <div className={styles.footer}>
                    {typeLabel ? (
                      <span className={styles.typeTag}>😏 {typeLabel}</span>
                    ) : null}
                    <span className={styles.cta}>{CTA_LABEL} →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
