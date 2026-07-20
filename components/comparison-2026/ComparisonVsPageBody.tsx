import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import FaqSection from "@/components/home-2026/FaqSection";

import styles from "./comparison.module.css";
import {
  ComparisonAnchorChips,
  ComparisonCtas,
  ComparisonDimensionSection,
  ComparisonFinalCta,
  ComparisonRelatedLinks,
  ComparisonScorecardTable,
  ComparisonSmartLink,
  ComparisonSources,
  ToolNameWithLogo,
} from "./ComparisonSections";
import type { ComparisonVsDoc } from "./types";

const SUPERFLOW_NAME = "Superflow";

/**
 * The head-to-head class: /preview/comparison/superflow-vs-<x>.
 * Section order per the July 2026 vs-x template: compressed hero, dimensions
 * (Superflow left, competitor right), scorecard recap, pricing, switching,
 * the honest close, FAQ, related, final CTA (H1 echo).
 */
export default function ComparisonVsPageBody({ doc }: { doc: ComparisonVsDoc }) {
  const competitorName = doc?.competitorName ?? "The competitor";

  return (
    <div className={styles.page}>
      <SiteNav />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {doc?.kicker ? <p className={styles.heroKicker}>{doc.kicker}</p> : null}
          <h1 className={styles.heroHeadline}>{doc?.headline ?? doc?.title}</h1>
          {doc?.secondary ? (
            <p className={styles.heroSecondary}>{doc.secondary}</p>
          ) : null}
          {doc?.prevents && doc.prevents.length > 0 ? (
            <ul className={styles.heroPrevents}>
              {doc.prevents.map((line) => (
                <li key={line} className={styles.heroPreventsItem}>
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
          {doc?.qualifier ? (
            <p className={styles.heroQualifier}>{doc.qualifier}</p>
          ) : null}
          <ComparisonCtas />
          <ComparisonAnchorChips dimensions={doc?.dimensions} />
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

      {doc?.dimensions && doc.dimensions.length > 0 ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>The dimensions</p>
          <h2 className={styles.sectionHeading}>
            {SUPERFLOW_NAME} vs {competitorName}, by the job.
          </h2>
          {doc.dimensions.map((dimension) => (
            <ComparisonDimensionSection
              key={dimension.label}
              dimension={dimension}
              leftName={SUPERFLOW_NAME}
              rightName={competitorName}
              leadSide="left"
            />
          ))}
        </section>
      ) : null}

      {doc?.scorecard && doc.scorecard.length > 0 ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>The scorecard</p>
          <h2 className={styles.sectionHeading}>
            {SUPERFLOW_NAME} vs {competitorName}.
          </h2>
          {doc?.scorecardKicker ? (
            <p className={styles.sectionLead}>{doc.scorecardKicker}</p>
          ) : null}
          <ComparisonScorecardTable
            rows={doc.scorecard}
            leftName={competitorName}
            rightName={SUPERFLOW_NAME}
            superflowColumn="right"
          />
          <ComparisonSources
            factsCheckedAt={doc?.factsCheckedAt}
            sourceUrls={doc?.sourceUrls}
          />
        </section>
      ) : null}

      {doc?.pricingCompetitor || doc?.pricingSuperflow ? (
        <section className={`${styles.section} ${styles.sectionNarrow}`}>
          <p className={styles.sectionKicker}>What it costs</p>
          <h2 className={styles.sectionHeading}>Pricing, plainly.</h2>
          <div className={styles.cardPair}>
            {doc?.pricingCompetitor ? (
              <div className={styles.factCard}>
                <p className={styles.factCardName}>
                  <ToolNameWithLogo name={competitorName} />
                </p>
                <p className={styles.bodyText}>{doc.pricingCompetitor}</p>
              </div>
            ) : null}
            {doc?.pricingSuperflow ? (
              <div className={`${styles.factCard} ${styles.factCardLead}`}>
                <p className={styles.factCardName}>
                  <ToolNameWithLogo name={SUPERFLOW_NAME} />
                </p>
                <p className={styles.bodyText}>{doc.pricingSuperflow}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {doc?.switchingLines && doc.switchingLines.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionNarrow}`}>
          <p className={styles.sectionKicker}>Switching</p>
          <h2 className={styles.sectionHeading}>
            Switching is an afternoon, not a migration.
          </h2>
          <ul className={styles.factList}>
            {doc.switchingLines.map((line) => (
              <li key={line} className={styles.factItem}>
                {line}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {doc?.honestCloseStrengths || doc?.stayLine ? (
        <section className={`${styles.section} ${styles.sectionNarrow}`}>
          <p className={styles.sectionKicker}>The honest close</p>
          <h2 className={styles.sectionHeading}>
            What {competitorName} gets right.
          </h2>
          <div className={styles.honestCard}>
            {doc?.honestCloseStrengths ? (
              <p className={styles.bodyText}>{doc.honestCloseStrengths}</p>
            ) : null}
            {doc?.stayLine ? (
              <p className={styles.stayLine}>{doc.stayLine}</p>
            ) : null}
            {doc?.fieldLink ? (
              <ComparisonSmartLink
                link={doc.fieldLink}
                className={styles.inlineLink}
              />
            ) : null}
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

      <ComparisonFinalCta headline={doc?.headline} />

      <SiteFooter />
    </div>
  );
}
