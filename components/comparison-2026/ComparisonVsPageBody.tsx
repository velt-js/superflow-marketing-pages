import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import FaqSection from "@/components/home-2026/FaqSection";

import styles from "./comparison.module.css";
import ComparisonArtifactWindow from "./ComparisonArtifact";
import {
  ComparisonCriteriaGrid,
  ComparisonDimensionSection,
  ComparisonFinalCta,
  ComparisonRelatedLinks,
  ComparisonScorecardTable,
  ComparisonSmartLink,
  ComparisonSources,
  SuperflowPricingSummary,
  ToolNameWithLogo,
  criteriaItemsFromDimensions,
} from "./ComparisonSections";
import type { ComparisonVsDoc } from "./types";

const SUPERFLOW_NAME = "Superflow";

/**
 * The head-to-head class: /comparisons/superflow-vs-<x>.
 * Section order per the Figma 1061 redesign: split hero (kicker + serif
 * headline left, secondary + qualifier right), the agents-at-work product
 * window (captioned by heroCaption), the blueprint-framed criteria grid,
 * the dimension panels (Superflow left, competitor right), scorecard recap,
 * pricing, switching, the honest close, FAQ, related, final CTA.
 */
export default function ComparisonVsPageBody({ doc }: { doc: ComparisonVsDoc }) {
  const competitorName = doc?.competitorName ?? "The competitor";

  return (
    <div className={styles.page}>
      <SiteNav />

      <header className={styles.hero}>
        <div className={`${styles.heroInner} ${styles.heroInnerWide}`}>
          <div className={styles.heroSplit}>
            <div className={styles.heroSplitMain}>
              {doc?.kicker ? (
                <p className={styles.heroKicker}>{doc.kicker}</p>
              ) : null}
              <h1 className={styles.heroHeadline}>
                {doc?.headline ?? doc?.title}
              </h1>
            </div>
            <div className={styles.heroSplitAside}>
              {doc?.secondary ? (
                <p className={styles.heroStandfirst}>{doc.secondary}</p>
              ) : null}
              {doc?.qualifier ? (
                <p className={styles.heroQualifier}>{doc.qualifier}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

      <div className={styles.heroArtifact}>
        <ComparisonArtifactWindow
          name="agents-at-work"
          caption={doc?.heroCaption}
        />
      </div>

      <ComparisonCriteriaGrid
        items={criteriaItemsFromDimensions(doc?.dimensions)}
      />

      {doc?.dimensions && doc.dimensions.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.dimensionStack}>
            {doc.dimensions.map((dimension, dimensionIndex) => (
              <ComparisonDimensionSection
                key={dimension.label}
                dimension={dimension}
                leftName={SUPERFLOW_NAME}
                rightName={competitorName}
                leadSide="left"
                index={dimensionIndex}
              />
            ))}
          </div>
        </section>
      ) : null}

      {doc?.scorecard && doc.scorecard.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionCentered}`}>
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
        <section className={styles.section}>
          <p className={styles.sectionKicker}>What it costs</p>
          <h2 className={styles.sectionHeading}>Pricing, plainly.</h2>
          <div className={styles.cardPair}>
            {doc?.pricingCompetitor ? (
              <div className={styles.factCard}>
                <p className={styles.factCardName}>
                  <ToolNameWithLogo name={competitorName} size={24} />
                </p>
                <p className={styles.bodyText}>{doc.pricingCompetitor}</p>
              </div>
            ) : null}
            <div className={`${styles.factCard} ${styles.factCardLead}`}>
              <p className={styles.factCardName}>
                <ToolNameWithLogo name={SUPERFLOW_NAME} size={24} />
              </p>
              <SuperflowPricingSummary />
            </div>
          </div>
        </section>
      ) : null}

      {doc?.switchingLines && doc.switchingLines.length > 0 ? (
        <section className={styles.section}>
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
        <section className={styles.section}>
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
