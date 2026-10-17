// /state-of-website-qa: The State of Website QA 2026.
//
// An industry report built from Superflow review data, traded for an email.
// Every number and line of report copy comes from lib/website-qa-report, the
// same module the Markdown copy and the lead email read. The interactive
// parts (benchmark, form, share buttons) are small client islands; the rest
// is server-rendered and static.
//
// Next year's edition takes this path; move this one to
// /state-of-website-qa/2026 then.

import Image from "next/image";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import { Benchmark } from "@/components/website-qa-report-2026/Benchmark";
import { CopyCitation, FindingShare } from "@/components/website-qa-report-2026/CopyButton";
import { ReportForm } from "@/components/website-qa-report-2026/ReportForm";
import { ReportViewTracker } from "@/components/website-qa-report-2026/ReportViewTracker";
import styles from "@/components/website-qa-report-2026/Report.module.css";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { ORG_NAME, SITE_URL } from "@/app/_seo/schema";
import {
  CITATION,
  CONTENTS,
  DATA_SOURCE_LINE,
  DATA_STRIP,
  DATE_PUBLISHED,
  FAQ,
  FINDINGS,
  METHODOLOGY,
  PAGE_IMAGE_SIZE,
  REPORT_FILES,
  REPORT_PATH,
  REPORT_TITLE,
  REPORT_URL,
  findingAnchor,
} from "@/lib/website-qa-report/report";

const DESCRIPTION =
  "How agencies really ship websites, from 505,857 real review comments. Benchmarks on review rounds, copy edits, links and more. Free report.";

export const metadata = buildPageMetadata({
  title: REPORT_TITLE,
  description: DESCRIPTION,
  path: REPORT_PATH,
  ogImage: REPORT_FILES.og,
});

/** Ids of the two form copies. The benchmark scrolls to the first. */
const HERO_FORM_ID = "report-form";
const CTA_FORM_ID = "get-the-report";

/** LinkedIn's composer, prefilled with the finding and its link. */
function linkedInShareUrl(text: string, url: string): string {
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${text}\n\n${url}`)}`;
}

const REPORT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Report",
  "@id": `${REPORT_URL}#report`,
  name: REPORT_TITLE,
  headline: REPORT_TITLE,
  description: DESCRIPTION,
  url: REPORT_URL,
  datePublished: DATE_PUBLISHED,
  inLanguage: "en",
  image: `${SITE_URL}${REPORT_FILES.cover}`,
  numberOfPages: 12,
  isAccessibleForFree: true,
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
  },
};

export default function StateOfWebsiteQaPage() {
  return (
    <div className={styles.page}>
      <PageJsonLd
        name={`${REPORT_TITLE} | Superflow`}
        description={DESCRIPTION}
        path={REPORT_PATH}
        trail={[{ name: REPORT_TITLE, url: REPORT_URL }]}
      />
      <JsonLd id="ld-report-state-of-website-qa" data={REPORT_SCHEMA} />
      <ReportViewTracker />
      <SiteNav solidAtTop />

      <main>
        {/* 4.1 Hero */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Industry report · 2026</p>
              <h1 className={styles.h1}>{REPORT_TITLE}</h1>
              <p className={styles.subhead}>
                We analyzed 505,857 review comments from 1,200+ agency teams. Here&apos;s how
                agencies really ship websites, and where the hours go.
              </p>
              <div className={styles.formCard}>
                <ReportForm id={HERO_FORM_ID} />
              </div>
            </div>
            <div className={styles.heroCover}>
              <div className={styles.coverDesk}>
                <Image
                  src={REPORT_FILES.cover}
                  alt={`Cover of ${REPORT_TITLE}`}
                  width={PAGE_IMAGE_SIZE.width}
                  height={PAGE_IMAGE_SIZE.height}
                  sizes="(max-width: 900px) 60vw, 380px"
                  priority
                  className={styles.coverImage}
                />
              </div>
            </div>
          </div>
        </header>

        {/* 4.2 Data strip */}
        <section className={styles.strip} aria-label="The data behind the report">
          <div className={styles.stripInner}>
            <dl className={styles.stripGrid}>
              {DATA_STRIP.map((item) => (
                <div key={item.label} className={styles.stripItem}>
                  <dt className={styles.stripLabel}>{item.label}</dt>
                  <dd className={styles.stripValue}>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.stripSource}>{DATA_SOURCE_LINE}</p>
          </div>
        </section>

        {/* 4.3 Benchmark */}
        <section className={styles.section} aria-labelledby="benchmark-heading">
          <div className={styles.sectionInnerNarrow}>
            <h2 id="benchmark-heading" className={styles.h2}>
              How does your agency compare?
            </h2>
            <Benchmark formId={HERO_FORM_ID} />
          </div>
        </section>

        {/* 4.4 Key findings */}
        <section
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="findings-heading"
        >
          <div className={styles.sectionInner}>
            <h2 id="findings-heading" className={styles.h2}>
              Key findings
            </h2>
            <ol className={styles.findings}>
              {FINDINGS.map((finding) => {
                const anchor = findingAnchor(finding.n);
                const url = `${REPORT_URL}#${anchor}`;
                return (
                  <li key={finding.n} id={anchor} className={styles.finding}>
                    <span className={styles.findingNumber} aria-hidden="true">
                      {String(finding.n).padStart(2, "0")}
                    </span>
                    <h3 className={styles.findingHeadline}>{finding.headline}</h3>
                    <p className={styles.findingMeaning}>{finding.meaning}</p>
                    <FindingShare
                      finding={finding.n}
                      url={url}
                      linkedInUrl={linkedInShareUrl(finding.shareText, url)}
                    />
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* 4.5 Inside the report */}
        <section className={styles.section} aria-labelledby="contents-heading">
          <div className={styles.sectionInner}>
            <h2 id="contents-heading" className={styles.h2}>
              Inside the report
            </h2>
            <ol className={styles.contents}>
              {CONTENTS.map((chapter, index) => (
                <li key={chapter} className={styles.contentsItem}>
                  <span className={styles.contentsNumber}>{index + 1}</span>
                  <span>{chapter}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4.6 Page previews */}
        <section className={styles.previewSection} aria-label="Pages from the report">
          <div className={styles.sectionInner}>
            <ul className={styles.previews}>
              {REPORT_FILES.previews.map((preview) => (
                <li key={preview.src} className={styles.preview}>
                  <div className={styles.previewCrop}>
                    <Image
                      src={preview.src}
                      alt={`Report page: ${preview.label}`}
                      width={PAGE_IMAGE_SIZE.width}
                      height={PAGE_IMAGE_SIZE.height}
                      sizes="(max-width: 720px) 80vw, 340px"
                      className={styles.previewImage}
                    />
                  </div>
                  <p className={styles.previewLabel}>{preview.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4.7 Methodology */}
        <section
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="methodology-heading"
        >
          <div className={styles.sectionInnerNarrow}>
            <h2 id="methodology-heading" className={styles.h2}>
              Methodology
            </h2>
            <dl className={styles.method}>
              {METHODOLOGY.map((row) => (
                <div key={row.term} className={styles.methodRow}>
                  <dt className={styles.methodTerm}>{row.term}</dt>
                  <dd className={styles.methodDetail}>{row.detail}</dd>
                </div>
              ))}
            </dl>

            {/* 4.8 Cite this report */}
            <div className={styles.cite}>
              <h3 className={styles.citeTitle}>Cite this report</h3>
              <div className={styles.citeRow}>
                <code className={styles.citeText}>{CITATION}</code>
                <CopyCitation text={CITATION} />
              </div>
            </div>
          </div>
        </section>

        {/* 4.9 FAQ */}
        <section className={styles.section} aria-labelledby="faq-heading">
          <div className={styles.sectionInnerNarrow}>
            <h2 id="faq-heading" className={styles.h2}>
              Questions
            </h2>
            <div className={styles.faq}>
              {FAQ.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{item.question}</summary>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 4.10 Final CTA */}
        <section className={styles.finalCta} aria-labelledby="final-cta-heading">
          <div className={styles.finalInner}>
            <h2 id="final-cta-heading" className={styles.h2}>
              Get the full report.
            </h2>
            <p className={styles.finalLine}>12 pages of real numbers on how agencies ship. Free.</p>
            <div className={styles.formCard}>
              <ReportForm id={CTA_FORM_ID} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
