import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import ListingHero from "@/components/listing-2026/ListingHero";
import { findToolContent } from "@/lib/tools/content";
import { toolPath } from "@/lib/tools/registry";
import { apiForTool, isToolApiAvailable } from "@/lib/tools/api-catalog";
import styles from "./Tools.module.css";
import { ToolFaq, type ToolFaqItem } from "./ToolFaq";
import { ToolApiDocs } from "./ToolApiDocs";
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
  /** Label on the disclosure that holds `whyThisMatters`. */
  whyThisMattersLabel?: string;
  /** Four to six entries. The same array feeds FAQPage schema. */
  faq: ToolFaqItem[];
  /** Closing CTA copy. */
  footerCta: { heading: string; body: string; linkText: string };
};

/**
 * The page template every tool shares.
 *
 * WHAT CHANGED, AND WHY
 *
 * This used to be six full-height bands below the tool: three steps, a
 * 500-word essay, an FAQ, the API, related tools, and a CTA immediately above
 * the footer's own CTA. Every one of them was justifiable on its own and the
 * result was a page where the tool — the only reason anybody came — was a
 * sliver at the top of a very long scroll.
 *
 * So the long-form copy and the API reference now sit behind disclosures,
 * closed. The text is still in the document, which is what it was written
 * for; it just no longer costs a screen each to scroll past. The closing CTA
 * is a slim band rather than a full section, because the site footer already
 * carries the tall trial card and two stacked CTAs read as neither.
 *
 * The hero is the shared 2026 `ListingHero`, so a tool page opens exactly
 * like every other page on the site rather than in this feature's own idiom.
 * The privacy line is not optional and not a prop: every tool states the same
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
  whyThisMattersLabel = "Why this matters",
  faq,
  footerCta,
}: ToolPageProps) {
  // Tools with a shared content module also publish a Markdown copy of this
  // page. Advertising it costs one line and saves an agent guessing the URL.
  const markdownPath = findToolContent(slug) ? `${toolPath(slug)}.md` : null;

  // Tools with a published endpoint say so in the same breath, because the
  // visitor most likely to want it is the one about to run this by hand for
  // the twentieth URL.
  const api = apiForTool(slug);
  const hasApi = api !== undefined && isToolApiAvailable(api);

  return (
    <div className={styles.page}>
      {/* React hoists this into <head>. rel="alternate" is how a machine
          discovers the Markdown copy without us inventing a convention. */}
      {markdownPath ? (
        <link rel="alternate" type="text/markdown" href={markdownPath} />
      ) : null}
      {/* No `solidAtTop`: the hero below is the site's blue gradient, which is
          what the transparent bar with white links is designed for. */}
      <SiteNav />
      <ToolViewTracker slug={slug} />

      <ListingHero
        eyebrow={eyebrow}
        heading={h1}
        subheading={subhead}
        hideCta
        tight
        footnote={
          <>
            Free, no login, no email. Nothing stored beyond a 24 hour cache.
            {markdownPath ? (
              <>
                {" "}
                <a href={markdownPath}>Markdown copy</a>
              </>
            ) : null}
            {/* The separator carries the leading space, so a tool with an API
                and no Markdown copy does not run the link into the sentence. */}
            {hasApi ? (
              <>
                {markdownPath ? " · " : " "}
                <a href="#api">API and MCP</a>
              </>
            ) : null}
          </>
        }
      />

      <section className={styles.toolSlot}>
        <div className={styles.toolInner}>{children}</div>
      </section>

      <section className={styles.section}>
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

          {/* The long read, folded away. Open by choice, not by scrolling. */}
          <details className={`${styles.disclosure} ${styles.sectionSpacer}`}>
            <summary className={styles.disclosureSummary}>
              {whyThisMattersLabel}
            </summary>
            <div className={styles.disclosureBody}>
              <div className={styles.prose}>{whyThisMatters}</div>
            </div>
          </details>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Common questions</h2>
          <ToolFaq items={faq} />
        </div>
      </section>

      <ToolApiDocs slug={slug} />

      <RelatedTools slug={slug} />

      <section className={styles.footerCta}>
        <div className={styles.footerCtaInner}>
          <div className={styles.footerCtaText}>
            <h2 className={styles.footerCtaHeading}>{footerCta.heading}</h2>
            <p className={styles.footerCtaBody}>{footerCta.body}</p>
          </div>
          <CtaLink slug={slug} placement="page-footer" variant="button">
            {footerCta.linkText}
          </CtaLink>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
