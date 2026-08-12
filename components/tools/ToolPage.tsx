import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import styles from "./Tools.module.css";
import { ToolFaq, type ToolFaqItem } from "./ToolFaq";
import { RelatedTools } from "./RelatedTools";
import { CtaLink } from "./CtaLink";
import { ToolViewTracker } from "./ToolViewTracker";

export type HowItWorksStep = {
  title: string;
  body: string;
};

export type ToolPageProps = {
  /** Registry slug. Drives analytics, UTM attribution, and related tools. */
  slug: string;
  h1: string;
  subhead: string;
  /** Small pill above the H1. */
  eyebrow?: string;
  /** The interactive tool. Rendered directly under the subhead. */
  children: React.ReactNode;
  /** Exactly three steps, per the page template in the brief. */
  howItWorks: HowItWorksStep[];
  /** The unique 300 to 500 word section. Prose, not marketing. */
  whyThisMatters: React.ReactNode;
  /** Four to six entries. The same array feeds FAQPage schema. */
  faq: ToolFaqItem[];
  /** Closing CTA copy. */
  footerCta: { heading: string; body: string; linkText: string };
};

/**
 * The page template every tool shares: H1, one-line subhead, the tool above
 * the fold, how it works in three steps, a unique "why this matters"
 * section, an FAQ, the related-tools mesh, and one closing CTA.
 *
 * The privacy line is not optional and not a prop. Every tool states the same
 * thing in the same place, because "we do not store your data" is only
 * credible if it is never quietly dropped from a page.
 *
 * @param props - See ToolPageProps.
 */
export function ToolPage({
  slug,
  h1,
  subhead,
  eyebrow,
  children,
  howItWorks,
  whyThisMatters,
  faq,
  footerCta,
}: ToolPageProps) {
  return (
    <div className={styles.page}>
      <SiteNav />
      <ToolViewTracker slug={slug} />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h1 className={styles.h1}>{h1}</h1>
          <p className={styles.subhead}>{subhead}</p>
          <p className={styles.privacyLine}>
            Free, no login, no email. We do not store the URLs you submit or
            the results beyond a 24 hour cache.
          </p>
        </div>
      </header>

      <section className={styles.toolSlot}>
        <div className={styles.toolInner}>{children}</div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>How it works</h2>
          <ol className={styles.steps}>
            {howItWorks.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.prose}>{whyThisMatters}</div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Common questions</h2>
          <ToolFaq items={faq} />
        </div>
      </section>

      <RelatedTools slug={slug} />

      <section className={styles.footerCta}>
        <div className={styles.footerCtaInner}>
          <h2 className={styles.footerCtaHeading}>{footerCta.heading}</h2>
          <p className={styles.footerCtaBody}>{footerCta.body}</p>
          <CtaLink slug={slug} placement="page-footer" variant="button">
            {footerCta.linkText}
          </CtaLink>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
