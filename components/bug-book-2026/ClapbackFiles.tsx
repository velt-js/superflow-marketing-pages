import Link from "next/link";
import {
  vibeBadgeLabel,
  vibeMeta,
  type BugBookListEntry,
} from "@/lib/bug-book";
import styles from "./ClapbackFiles.module.css";

// "The Clapback Files" - a strip above the main grid featuring the
// sassiest threads, with the punchline itself as the card's primary text
// in large type. Each card is a self-contained, shareable quote; the
// headline drops to a caption underneath.

const HEADING = "The Clapback Files";
/* Not every featured line is a reply, so the subhead promises the lines
   rather than the comebacks. */
const SUBHEAD =
  "The lines we could not stop reading. Every one typed by a real person, on a real site, in a real review.";
const CTA_LABEL = "Read the thread";

/**
 * Hand-picked, in this order. Editorial judgement beats "first four
 * sassy entries" here - the funniest lines are spread across vibes, and
 * two of these are comedy rather than sass.
 */
const FEATURED_SLUGS = [
  "its-centered",
  "you-just-have-to-persevere",
  "make-the-logo-bigger",
  "wife-hates-the-hair",
  "its-2025-you-never-know",
];

/** How many auto-picked cards to fall back to if the picks go missing. */
const FALLBACK_COUNT = 4;

/**
 * Resolves the featured slugs in order, dropping any that have been
 * rotated to the bench or lost their quote. Falls back to the sassiest
 * entries so the strip degrades instead of vanishing.
 */
function pickClapbacks(entries: BugBookListEntry[]): BugBookListEntry[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const featured = FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (entry): entry is BugBookListEntry => Boolean(entry?.pullQuote),
  );
  if (featured.length > 0) return featured;
  return entries
    .filter((entry) => entry.vibe === "sass" && entry.pullQuote)
    .slice(0, FALLBACK_COUNT);
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
            // Sassy cards show their sub-type; the rest show their vibe.
            const typeLabel = vibeBadgeLabel(entry.vibe, entry.sassType);
            const typeEmoji = vibeMeta(entry.vibe)?.emoji ?? "";
            return (
              <li key={entry._id} className={styles.item}>
                <Link
                  href={`/bug-book/${entry.slug}`}
                  className={styles.card}
                >
                  <QuoteMark />
                  <blockquote className={styles.quote}>
                    {entry.pullQuote}
                  </blockquote>
                  <p className={styles.caption}>{entry.headline}</p>
                  <div className={styles.footer}>
                    {typeLabel ? (
                      <span className={styles.typeTag}>
                        {typeEmoji} {typeLabel}
                      </span>
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
