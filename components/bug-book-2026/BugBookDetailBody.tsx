import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import {
  formatBugDate,
  metaBarFlagLabels,
  RAGE_METER_MIN,
  type BugBookEntryDetail,
  type BugBookListEntry,
} from "@/lib/bug-book";
import BugCard from "./BugCard";
import BugBookCta from "./BugBookCta";
import BugSceneMock from "./BugSceneMock";
import {
  CategoryChip,
  FlagTag,
  SeverityChip,
  SourceBadge,
  StatusPill,
} from "./Chips";
import RageMeter from "./RageMeter";
import styles from "./BugBookDetailBody.module.css";

const AGENTS_PAGE_HREF = "/ai-review-agents";
const CAPTURED_HEADING = "What Superflow captured automatically";
const CAPTURED_FOOTNOTE =
  'Every Superflow comment ships with this context - no "what browser were you on?" follow-ups.';
const CAPTURED_FOOTNOTE_AGENT =
  "Every agent finding ships with this context - structured, sourced, and ready to fix.";
const RELATED_HEADING = "More from the Bug Book";
const WHY_HEADING = "Why it matters";

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The product pitch smuggled into the story — real auto-captured context.
 * Two tiers: the cards lead with what a reader scans for (issue type,
 * client/site type, platform); environment details (browser, OS, device)
 * sit in a smaller muted row underneath — captured, but not the headline.
 */
function CapturedGrid({ entry }: { entry: BugBookEntryDetail }) {
  const isAgent = entry.source === "agent";
  const primary: { label: string; value?: string }[] = isAgent
    ? [
        { label: "Issue type", value: entry.finding?.issueType ?? entry.category },
        { label: "Agent", value: entry.agentName },
        {
          label: "Confidence",
          value:
            entry.finding?.confidence != null
              ? `${entry.finding.confidence}%`
              : undefined,
        },
        { label: "Client type", value: entry.site?.industry },
        { label: "Site", value: entry.site?.descriptor },
        { label: "Platform", value: entry.site?.platform },
      ]
    : [
        { label: "Issue type", value: entry.category },
        { label: "Client type", value: entry.site?.industry },
        { label: "Site", value: entry.site?.descriptor },
        { label: "Platform", value: entry.site?.platform },
      ];

  const secondary: { label: string; value?: string }[] = [
    { label: "Browser", value: entry.captured?.browser },
    { label: "OS", value: entry.captured?.os },
    { label: "Device", value: entry.captured?.device },
    { label: "Date", value: formatBugDate(entry.date) },
    { label: "Status", value: entry.status },
  ];

  const filledPrimary = primary.filter((cell) => cell.value);
  const filledSecondary = secondary.filter((cell) => cell.value);
  if (filledPrimary.length === 0 && filledSecondary.length === 0) return null;

  return (
    <section className={styles.capturedSection}>
      <h2 className={styles.sectionHeading}>{CAPTURED_HEADING}</h2>
      {filledPrimary.length > 0 ? (
        <dl className={styles.capturedGrid}>
          {filledPrimary.map((cell) => (
            <div key={cell.label} className={styles.capturedCell}>
              <dt className={styles.capturedLabel}>{cell.label}</dt>
              <dd className={styles.capturedValue}>{cell.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {filledSecondary.length > 0 ? (
        <dl className={styles.capturedSecondary}>
          {filledSecondary.map((cell) => (
            <div key={cell.label} className={styles.capturedSecondaryItem}>
              <dt className={styles.capturedSecondaryLabel}>{cell.label}</dt>
              <dd className={styles.capturedSecondaryValue}>{cell.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className={styles.capturedFootnote}>
        {isAgent ? CAPTURED_FOOTNOTE_AGENT : CAPTURED_FOOTNOTE}
      </p>
    </section>
  );
}

/**
 * Full presentation layer for /bug-book/[slug]. Server-rendered — no
 * client state. `related` is computed by the route (same category first,
 * then same source, self excluded).
 */
export default function BugBookDetailBody({
  entry,
  related,
}: {
  entry: BugBookEntryDetail;
  related: BugBookListEntry[];
}) {
  const resolved = entry.status === "Resolved";
  const flagLabels = metaBarFlagLabels(entry.flags);

  return (
    <main className={styles.page}>
      <SiteNav solidAtTop />

      <article className={styles.article}>
        <div className={styles.articleInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/bug-book" className={styles.backLink}>
              <BackArrow />
              Bug Book
            </Link>
          </nav>

          <div className={styles.metaBar}>
            {entry.site?.descriptor ? (
              <span className={styles.metaSite}>{entry.site.descriptor}</span>
            ) : null}
            <CategoryChip category={entry.category} />
            <SeverityChip severity={entry.severity} />
            {entry.source === "agent" && entry.agentName ? (
              <Link href={AGENTS_PAGE_HREF} className={styles.agentLink}>
                <SourceBadge source="agent" label={entry.agentName} />
              </Link>
            ) : (
              <SourceBadge
                source={entry.source}
                label={entry.sourceLabel}
              />
            )}
            <StatusPill status={entry.status} />
            {flagLabels.map((label) => (
              <FlagTag key={label} label={label} />
            ))}
            <span className={styles.metaDate}>{formatBugDate(entry.date)}</span>
          </div>

          <header className={styles.hero}>
            <h1 className={styles.headline}>{entry.headline}</h1>
            {entry.rageLevel >= RAGE_METER_MIN ? (
              <div className={styles.heroRage}>
                <RageMeter level={entry.rageLevel} />
              </div>
            ) : null}
            {entry.hook ? <p className={styles.hook}>{entry.hook}</p> : null}
          </header>

          {/* Sassy entries lead with the punchline - it lands harder
              before the context than after it. */}
          {entry.vibe === "sass" && entry.pullQuote ? (
            <blockquote className={styles.sassQuote}>
              {entry.pullQuote}
            </blockquote>
          ) : null}

          <BugSceneMock entry={entry} />

          <CapturedGrid entry={entry} />

          {entry.whyItMatters ? (
            <section className={styles.whySection}>
              <h2 className={styles.sectionHeading}>{WHY_HEADING}</h2>
              <blockquote className={styles.whyQuote}>
                {entry.whyItMatters}
              </blockquote>
            </section>
          ) : null}

          {entry.outcome ? (
            <aside
              className={resolved ? styles.outcomeResolved : styles.outcomeOpen}
            >
              <span aria-hidden="true">{resolved ? "✅" : "🟡"}</span>
              <p className={styles.outcomeText}>{entry.outcome}</p>
            </aside>
          ) : null}
        </div>
      </article>

      {related.length > 0 ? (
        <section className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedHeading}>{RELATED_HEADING}</h2>
            <ul className={styles.relatedGrid}>
              {related.map((relatedEntry) => (
                <li key={relatedEntry._id} className={styles.relatedItem}>
                  <BugCard entry={relatedEntry} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <BugBookCta />
      <SiteFooter />
    </main>
  );
}
