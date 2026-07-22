import Image from "next/image";
import Link from "next/link";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import FaqSection from "@/components/home-2026/FaqSection";

import styles from "./comparison.module.css";
import ComparisonArtifactWindow from "./ComparisonArtifact";
import {
  ComparisonCriteriaGrid,
  ComparisonDimensionSection,
  ComparisonPricingNote,
  ComparisonRelatedLinks,
  ComparisonScorecardTable,
  ComparisonSources,
  criteriaItemsFromDimensions,
  splitSentences,
  CTA_MICROCOPY,
  SIGNUP_URL,
} from "./ComparisonSections";
import { getToolLogoSrc } from "./toolLogos";
import type { ComparisonArbiterDoc } from "./types";

/**
 * One hero "Pick X" card (Figma 1061:2142): the tool's logo, a bold
 * "Pick {name}" title and the pick line from the doc.
 */
function HeroPickCard({ name, line }: { name: string; line: string }) {
  const logoSrc = getToolLogoSrc(name);
  return (
    <div className={styles.pickCard}>
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          className={styles.pickCardLogo}
          unoptimized
        />
      ) : null}
      <div className={styles.pickCardBody}>
        <p className={styles.pickCardTitle}>Pick {name}</p>
        <p className={styles.pickCardLine}>{line}</p>
      </div>
    </div>
  );
}

/** Tabler `chevron-right` glyph for the third-option vs links. */
function ChevronRightIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6l-6 6" />
    </svg>
  );
}

/**
 * The third-option module (Figma 1067:1017): a soft blue rounded panel with
 * a serif headline (the body's first sentence), the remaining pitch, a dark
 * "Start Free" pill, and the Superflow-vs links bottom-left, while the
 * agents-at-work product window bleeds off the panel's right edge.
 */
function ThirdOptionPanel({
  body,
  links,
}: {
  body: string;
  links?: ComparisonArbiterDoc["thirdOptionLinks"];
}) {
  const sentences = splitSentences(body);
  const headline = sentences[0] ?? body;
  const pitch = sentences.slice(1).join(" ");

  return (
    <div className={styles.thirdOptionPanel}>
      <div className={styles.thirdOptionIntro}>
        <div className={styles.thirdOptionCopy}>
          <h2 className={styles.thirdOptionHeadline}>{headline}</h2>
          {pitch ? <p className={styles.thirdOptionPitch}>{pitch}</p> : null}
          <div>
            <a className={styles.thirdOptionCta} href={SIGNUP_URL}>
              Start Free
            </a>
          </div>
          <p className={styles.thirdOptionFine}>{CTA_MICROCOPY}</p>
        </div>
        {links && links.length > 0 ? (
          <div className={styles.thirdOptionLinks}>
            {links.map((link) =>
              link?.href?.startsWith("/") ? (
                <Link
                  key={`${link.label}-${link.href}`}
                  className={styles.thirdOptionLink}
                  href={link.href}
                >
                  {link.label}
                  <ChevronRightIcon />
                </Link>
              ) : (
                <a
                  key={`${link.label}-${link.href}`}
                  className={styles.thirdOptionLink}
                  href={link?.href}
                  rel="nofollow noopener"
                >
                  {link.label}
                  <ChevronRightIcon />
                </a>
              ),
            )}
          </div>
        ) : null}
      </div>
      <div className={styles.thirdOptionArt}>
        <ComparisonArtifactWindow name="agents-at-work" caption="" />
      </div>
    </div>
  );
}

/**
 * The arbiter class: /preview/comparison/<x>-vs-<y>. Neutral body per the
 * Figma 1061 redesign: a split hero (kicker + serif headline left, standfirst
 * right) with the short-answer "Pick X / Pick Y" cards and the rendered
 * disclosure + dateline beneath, the blueprint-framed criteria grid, the
 * dimension panels, scorecard, pricing note, and the third-option module —
 * the only place Superflow appears.
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
            {doc?.standfirst ? (
              <p className={styles.heroStandfirst}>{doc.standfirst}</p>
            ) : null}
          </div>

          {doc?.shortAnswerPickLeft || doc?.shortAnswerPickRight ? (
            <div className={styles.pickCardsWrap}>
              {doc?.shortAnswerPickLeft ? (
                <HeroPickCard name={leftName} line={doc.shortAnswerPickLeft} />
              ) : null}
              {doc?.shortAnswerPickRight ? (
                <HeroPickCard
                  name={rightName}
                  line={doc.shortAnswerPickRight}
                />
              ) : null}
            </div>
          ) : null}

          <div className={styles.heroFootnotes}>
            {doc?.shortAnswerShared ? (
              <p className={styles.heroFootnoteLead}>{doc.shortAnswerShared}</p>
            ) : null}
            {doc?.disclosure ? (
              <p className={styles.heroFootnoteLead}>{doc.disclosure}</p>
            ) : null}
            {doc?.dateline ? (
              <p className={styles.heroFootnoteFine}>{doc.dateline}</p>
            ) : null}
          </div>
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

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
                leftName={leftName}
                rightName={rightName}
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
        <section className={styles.section}>
          <p className={styles.sectionKicker}>Pricing, side by side</p>
          <h2 className={styles.sectionHeading}>
            The sticker and the math are different numbers.
          </h2>
          <ComparisonPricingNote
            note={doc.pricingNote}
            leftName={leftName}
            rightName={rightName}
          />
        </section>
      ) : null}

      {doc?.thirdOptionBody ? (
        <section className={styles.section}>
          <p className={styles.sectionKicker}>The third option</p>
          <ThirdOptionPanel
            body={doc.thirdOptionBody}
            links={doc?.thirdOptionLinks}
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

      <SiteFooter />
    </div>
  );
}
