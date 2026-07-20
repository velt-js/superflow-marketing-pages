import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import FaqSection from "@/components/home-2026/FaqSection";

import styles from "./comparison.module.css";
import {
  ComparisonAnchorChips,
  ComparisonDimensionSection,
  ComparisonRelatedLinks,
  ComparisonScorecardTable,
  ComparisonSmartLink,
  ComparisonSources,
  CTA_MICROCOPY,
  SIGNUP_URL,
} from "./ComparisonSections";
import type { ComparisonArbiterDoc } from "./types";

/**
 * The arbiter class: /preview/comparison/<x>-vs-<y>. Neutral body: no
 * Prevents lines, no qualifier, no logo strip, no CTAs in the hero, and
 * Superflow appears exactly once, in the third-option module, after a
 * rendered disclosure in the hero.
 */
export default function ComparisonArbiterPageBody({
  doc,
}: {
  doc: ComparisonArbiterDoc;
}) {
  const leftName = doc?.toolLeftName ?? "Tool X";
  const rightName = doc?.toolRightName ?? "Tool Y";

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
          {doc?.disclosure ? (
            <p className={styles.disclosure}>{doc.disclosure}</p>
          ) : null}
          {doc?.dateline ? (
            <p className={styles.heroDateline}>{doc.dateline}</p>
          ) : null}
          <ComparisonAnchorChips dimensions={doc?.dimensions} />
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

      {doc?.shortAnswerPickLeft || doc?.shortAnswerPickRight ? (
        <section className={`${styles.section} ${styles.sectionNarrow}`}>
          <p className={styles.sectionKicker}>The short answer</p>
          <div className={styles.shortAnswerCard}>
            {doc?.shortAnswerPickLeft ? (
              <p className={styles.shortAnswerLine}>
                <strong>Pick {leftName}</strong> {doc.shortAnswerPickLeft}
              </p>
            ) : null}
            {doc?.shortAnswerPickRight ? (
              <p className={styles.shortAnswerLine}>
                <strong>Pick {rightName}</strong> {doc.shortAnswerPickRight}
              </p>
            ) : null}
            {doc?.shortAnswerShared ? (
              <p className={styles.shortAnswerLine}>{doc.shortAnswerShared}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {doc?.dimensions && doc.dimensions.length > 0 ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>The dimensions</p>
          <h2 className={styles.sectionHeading}>
            {leftName} vs {rightName}, dimension by dimension.
          </h2>
          {doc.dimensions.map((dimension) => (
            <ComparisonDimensionSection
              key={dimension.label}
              dimension={dimension}
              leftName={leftName}
              rightName={rightName}
            />
          ))}
        </section>
      ) : null}

      {doc?.scorecard && doc.scorecard.length > 0 ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>The scorecard</p>
          <h2 className={styles.sectionHeading}>
            {leftName} vs {rightName}, row by row.
          </h2>
          <ComparisonScorecardTable
            rows={doc.scorecard}
            leftName={leftName}
            rightName={rightName}
          />
          <ComparisonSources
            factsCheckedAt={doc?.factsCheckedAt}
            sourceUrls={doc?.sourceUrls}
          />
        </section>
      ) : null}

      {doc?.pricingNote ? (
        <section className={`${styles.section} ${styles.sectionNarrow}`}>
          <p className={styles.sectionKicker}>Pricing, side by side</p>
          <h2 className={styles.sectionHeading}>
            The sticker and the math are different numbers.
          </h2>
          <p className={styles.bodyText}>{doc.pricingNote}</p>
        </section>
      ) : null}

      {doc?.thirdOptionBody ? (
        <section className={`${styles.section} ${styles.sectionNarrow}`}>
          <p className={styles.sectionKicker}>The third option</p>
          <div className={styles.thirdOption}>
            <p className={styles.bodyText}>{doc.thirdOptionBody}</p>
            {doc?.thirdOptionLinks && doc.thirdOptionLinks.length > 0 ? (
              <div className={styles.entryLinks}>
                {doc.thirdOptionLinks.map((link) => (
                  <ComparisonSmartLink
                    key={`${link.label}-${link.href}`}
                    link={link}
                    className={styles.inlineLink}
                  />
                ))}
              </div>
            ) : null}
            <div>
              <a className={styles.ctaPrimary} href={SIGNUP_URL} style={{ background: "#1a78e0", color: "#ffffff" }}>
                Start free
              </a>
            </div>
            <p className={styles.criteriaLine}>{CTA_MICROCOPY}</p>
          </div>
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

      <SiteFooter />
    </div>
  );
}
