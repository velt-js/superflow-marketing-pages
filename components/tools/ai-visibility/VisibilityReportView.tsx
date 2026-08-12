"use client";

import styles from "./Report.module.css";
import { ScoreDial } from "./ScoreDial";
import { FindingCard } from "./FindingCard";
import { CopyButton } from "./CopyButton";
import { colorForScore, STATUS_ORDER, verdictFor } from "./status";
import { CtaLink } from "@/components/tools/CtaLink";
import { formatCacheAge } from "@/lib/toolkit/cache";
import {
  gradeFor,
  type CategoryId,
  type CategoryScore,
  type VisibilityReport,
} from "@/lib/tools/ai-visibility/types";

/** One of the four category summary cards. */
function CategoryCard({ category }: { category: CategoryScore }) {
  const percent =
    category.maxPoints === 0
      ? 0
      : Math.round((category.points / category.maxPoints) * 100);
  const color = colorForScore(percent);

  return (
    <div className={styles.categoryCard}>
      <p className={styles.categoryLabel}>{category.label}</p>
      <p className={styles.categoryQuestion}>{category.question}</p>
      <div>
        <span className={styles.categoryScore} style={{ color }}>
          {category.points}
        </span>
        <span className={styles.categoryOutOf}>/ {category.maxPoints}</span>
      </div>
      <div className={styles.categoryTrack}>
        <div
          className={styles.categoryFill}
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <div className={styles.categoryCounts}>
        {category.passCount > 0 ? <span>{category.passCount} pass</span> : null}
        {category.warnCount > 0 ? <span>{category.warnCount} warn</span> : null}
        {category.failCount > 0 ? <span>{category.failCount} fail</span> : null}
      </div>
    </div>
  );
}

/**
 * The full report: score header, category cards, then the findings grouped by
 * category with one contextual CTA under each group.
 *
 * When `focus` is set, only that category is shown and the headline score is
 * that category's own percentage. The sibling robots.txt page uses this: a
 * page that only reports on crawler access must not show a score that a
 * JavaScript-rendering check contributed to.
 *
 * @param props - The report, its cache age, the tool slug, and the re-run
 *   handler.
 */
export function VisibilityReportView({
  report,
  ageSeconds,
  cached,
  onRerun,
  isRunning,
  slug,
  focus,
}: {
  report: VisibilityReport;
  ageSeconds: number;
  cached: boolean;
  onRerun: () => void;
  isRunning: boolean;
  slug: string;
  focus?: CategoryId;
}) {
  const shownCategories = focus
    ? report.categories.filter((category) => category.id === focus)
    : report.categories;

  const focused = focus ? shownCategories[0] : undefined;

  // In focus mode the dial reports the category as a percentage of its own
  // scorable points, so "27 of 35" reads as 77 rather than as a 100-point
  // score the page did not measure.
  const headlineScore =
    focused && focused.maxPoints > 0
      ? Math.round((focused.points / focused.maxPoints) * 100)
      : report.score;

  const headlineGrade = focused ? gradeFor(headlineScore) : report.grade;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tools/${slug}?url=${encodeURIComponent(report.finalUrl)}`
      : "";

  // The site's own icon. Older reports predate this field, so guard for it.
  const faviconUrl = report.faviconUrl ?? null;

  return (
    <div className={styles.wrap}>
      <div className={styles.scoreCard}>
        <ScoreDial
          score={headlineScore}
          scoredOutOf={focused ? 100 : report.scoredOutOf}
        />

        <div className={styles.scoreMeta}>
          <h2 className={styles.scoreHost}>
            {faviconUrl ? (
              // A plain <img>, not next/image: the host is arbitrary user
              // input, so it can never match a configured remotePattern. The
              // onError handler hides it when the site has no icon at all,
              // rather than leaving a broken-image glyph in the heading.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.favicon}
                src={faviconUrl}
                alt=""
                width={20}
                height={20}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            {report.hostname}
            <span
              className={styles.gradeChip}
              style={{ background: colorForScore(headlineScore) }}
            >
              {headlineGrade}
            </span>
          </h2>

          <p className={styles.scoreSummary}>
            {focused
              ? `${focused.label}: ${focused.points} of ${focused.maxPoints} points. ${focused.question}`
              : verdictFor(report.score)}
          </p>

          <div className={styles.scoreActions}>
            <CopyButton
              value={shareUrl}
              label="Copy share link"
              analyticsLabel="share-link"
              className={styles.ghostButton}
            />
            <button
              type="button"
              className={styles.ghostButton}
              onClick={onRerun}
              disabled={isRunning}
            >
              {isRunning ? "Checking..." : "Re-run"}
            </button>
            <span className={styles.checkedAt}>
              {cached
                ? `Checked ${formatCacheAge(ageSeconds)}`
                : "Checked just now"}
            </span>
          </div>

          {report.redirects.length > 0 ? (
            <p className={styles.redirects} style={{ marginTop: 10 }}>
              Followed {report.redirects.length}{" "}
              {report.redirects.length === 1 ? "redirect" : "redirects"} to{" "}
              {report.finalUrl}
            </p>
          ) : null}
        </div>

        {report.screenshot ? (
          // Also a plain <img>: the source is an inline data URI produced by
          // the render service, which next/image has nothing to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.thumbnail}
            src={`data:image/png;base64,${report.screenshot}`}
            alt={`Screenshot of ${report.hostname}`}
            width={168}
            height={112}
          />
        ) : null}
      </div>

      {report.degraded.map((notice) => (
        <p key={notice.message} className={styles.notice}>
          {notice.message}{" "}
          Those checks are marked &quot;not checked&quot; below, and they are
          left out of the score rather than counted against you.
        </p>
      ))}

      {focus ? null : (
        <div className={styles.categories}>
          {report.categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      <div>
        <h2 className={styles.findingsHeading}>What we found</h2>
        <p className={styles.findingsLead}>
          {focus
            ? "Every check that affects whether AI systems can reach your site. Failures first."
            : "Twelve checks, grouped by what they affect. Failures first."}
        </p>

        {shownCategories.map((category) => {
          const findings = report.findings
            .filter((finding) => finding.category === category.id)
            .sort(
              (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
            );

          if (findings.length === 0) return null;

          return (
            <section key={category.id}>
              <div className={styles.groupHeading}>
                <h3 className={styles.groupTitle}>{category.label}</h3>
                <span className={styles.groupQuestion}>
                  {category.question}
                </span>
              </div>

              <div className={styles.findingList}>
                {findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))}
              </div>

              <p className={styles.categoryCta}>
                {category.ctaText}{" "}
                <CtaLink slug={slug} placement={`category-${category.id}`}>
                  Get started
                </CtaLink>
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
