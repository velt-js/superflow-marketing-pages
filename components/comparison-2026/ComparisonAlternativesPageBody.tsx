import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import FaqSection from "@/components/home-2026/FaqSection";

import styles from "./comparison.module.css";
import {
  ComparisonCtas,
  ComparisonFinalCta,
  ComparisonRelatedLinks,
  ComparisonScorecardTable,
  ComparisonSmartLink,
  ComparisonSources,
  ToolNameWithLogo,
} from "./ComparisonSections";
import type { ComparisonAlternativesDoc } from "./types";

const SUPERFLOW_NAME = "Superflow";

/**
 * The listicle class: /preview/comparison/<x>-alternative. SERP-shaped:
 * hero, the eight judging criteria, Superflow as entry #1 with the canonical
 * scorecard, honest fact-gated entries for the real players, the "stay on
 * {X}" entry, FAQ, related, final CTA.
 */
export default function ComparisonAlternativesPageBody({
  doc,
}: {
  doc: ComparisonAlternativesDoc;
}) {
  const anchorName = doc?.anchorName ?? "the anchor tool";

  return (
    <div className={styles.page}>
      <SiteNav />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {doc?.kicker ? <p className={styles.heroKicker}>{doc.kicker}</p> : null}
          <h1 className={styles.heroHeadline}>{doc?.headline ?? doc?.title}</h1>
          {doc?.standfirst ? (
            <p className={styles.heroSecondary}>{doc.standfirst}</p>
          ) : null}
          {doc?.dateline ? (
            <p className={styles.heroDateline}>{doc.dateline}</p>
          ) : null}
          <ComparisonCtas />
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

      {doc?.criteria && doc.criteria.length > 0 ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>How we judged</p>
          <h2 className={styles.sectionHeading}>
            Eight questions, asked of every option.
          </h2>
          <ul className={styles.criteriaGrid}>
            {doc.criteria.map((criterion) => (
              <li key={criterion.label} className={styles.criteriaItem}>
                <span>
                  <span className={styles.criteriaLabel}>{criterion.label}</span>
                  {criterion.line ? (
                    <>
                      {" "}
                      <span className={styles.criteriaLine}>
                        {criterion.line}
                      </span>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {doc?.superflowHeadline ? (
        <section className={styles.section}>
          <div className={`${styles.entryCard} ${styles.entryCardLead}`}>
            <span className={styles.entryRank}>Entry 01</span>
            <h2 className={styles.entryName}>{doc.superflowHeadline}</h2>
            {doc?.superflowBody ? (
              <p className={styles.entryRow}>{doc.superflowBody}</p>
            ) : null}
            {doc?.superflowBestFor ? (
              <p className={styles.entryRow}>
                <strong>Best for:</strong> {doc.superflowBestFor}
              </p>
            ) : null}
            {doc?.superflowScorecard && doc.superflowScorecard.length > 0 ? (
              <ComparisonScorecardTable
                rows={doc.superflowScorecard}
                leftName={anchorName}
                rightName={SUPERFLOW_NAME}
                superflowColumn="right"
              />
            ) : null}
            {doc?.superflowHonestLimit ? (
              <p className={styles.entryRow}>
                <strong>Honest limit:</strong> {doc.superflowHonestLimit}
              </p>
            ) : null}
            {doc?.superflowLinks && doc.superflowLinks.length > 0 ? (
              <div className={styles.entryLinks}>
                {doc.superflowLinks.map((link) => (
                  <ComparisonSmartLink
                    key={`${link.label}-${link.href}`}
                    link={link}
                    className={styles.inlineLink}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {(doc?.entries ?? []).map((entry, entryIndex) => (
            <div key={entry.name} className={styles.entryCard}>
              <span className={styles.entryRank}>
                Entry {String(entryIndex + 2).padStart(2, "0")}
              </span>
              <h2 className={styles.entryName}>
                <ToolNameWithLogo name={entry.name} size={24} />
              </h2>
              {entry?.bestFor ? (
                <p className={styles.entryRow}>
                  <strong>Best for:</strong> {entry.bestFor}
                </p>
              ) : null}
              {entry?.standout ? (
                <p className={styles.entryRow}>
                  <strong>Standout:</strong> {entry.standout}
                </p>
              ) : null}
              {entry?.limits ? (
                <p className={styles.entryRow}>
                  <strong>Limits:</strong> {entry.limits}
                </p>
              ) : null}
              {entry?.vsAnchor ? (
                <p className={styles.entryRow}>
                  <strong>Vs {anchorName}:</strong> {entry.vsAnchor}
                </p>
              ) : null}
            </div>
          ))}

          {doc?.stayHeading || doc?.stayBody || doc?.stayLine ? (
            <div className={styles.entryCard}>
              {doc?.stayHeading ? (
                <h2 className={styles.entryName}>{doc.stayHeading}</h2>
              ) : null}
              {doc?.stayBody ? (
                <p className={styles.entryRow}>{doc.stayBody}</p>
              ) : null}
              {doc?.stayLine ? (
                <p className={styles.stayLine}>{doc.stayLine}</p>
              ) : null}
            </div>
          ) : null}

          <ComparisonSources
            factsCheckedAt={doc?.factsCheckedAt}
            sourceUrls={doc?.sourceUrls}
          />
        </section>
      ) : null}

      {doc?.faq && doc.faq.length > 0 ? (
        <FaqSection items={doc.faq} />
      ) : null}

      {doc?.related && doc.related.length > 0 ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>Related</p>
          <ComparisonRelatedLinks links={doc.related} />
        </section>
      ) : null}

      <ComparisonFinalCta
        headline={doc?.finalCtaHeadline ?? doc?.superflowHeadline}
      />

      <SiteFooter />
    </div>
  );
}
