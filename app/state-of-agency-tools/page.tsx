// State of Agency Tools 2026 - survey landing page.
//
// The questionnaire is a Tally form embedded here rather than a custom form
// with its own database: the form is commodity infrastructure, the report is
// the asset. Decision rationale and the Tally build guide live in ./README.md.

import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import { TallyEmbed } from "@/components/agency-survey-2026/TallyEmbed";
import styles from "@/components/agency-survey-2026/Survey.module.css";
import {
  REPORT_PATH,
  SURVEY_PATH,
  TALLY_FORM_ID,
} from "@/lib/agency-tools-survey/config";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const TITLE = "State of Agency Tools 2026";
const DESCRIPTION =
  "How does your stack compare to 500+ agencies? A 5-minute, all-taps survey on the tools agencies really use: platforms, client review, PM, money ops, and AI. Get the full report first, free, in November.";

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: SURVEY_PATH,
});

const WHAT_WE_ASK = [
  {
    title: "Your building stack",
    body: "The platforms you build client sites on, the design and video tools behind them, and whether you would pick them again.",
  },
  {
    title: "Client review and approval",
    body: "How feedback actually reaches you, how many revision rounds a typical website takes, and whether anything gets QA'd before launch.",
  },
  {
    title: "Running the agency",
    body: "PM tools, time and profitability tracking, AI notetakers, and where the day-to-day client conversation really happens.",
  },
  {
    title: "The AI section",
    body: "Which assistants your team uses vs actually pays for, which creative tools made the cut, and how much client work AI touches today.",
  },
  {
    title: "The fun one",
    body: "One open question: which tool do you resent paying for? The answers become the report's most quoted chart.",
  },
  {
    title: "Nothing invasive",
    body: "Revenue and region are optional and reported in aggregate only. Your email is only used to send you the report early.",
  },
];

export default function StateOfAgencyToolsPage() {
  return (
    <div className={styles.page}>
      <PageJsonLd
        name={`${TITLE} | Superflow`}
        description={DESCRIPTION}
        path={SURVEY_PATH}
        trail={[
          { name: TITLE, url: `${SITE_URL}${SURVEY_PATH}` },
        ]}
      />
      <SiteNav />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>State of Agency Tools 2026</span>
          <h1 className={styles.h1}>
            How does your stack compare to 500+ agencies?
          </h1>
          <p className={styles.subhead}>
            5 minutes, all taps. Every question is a single click except one.
            Get the full report first, free, in November.
          </p>
          <p className={styles.privacyLine}>
            Anonymous by default. Results are published in aggregate only.
          </p>
        </div>
      </header>

      <section className={styles.embedSlot}>
        <div className={styles.embedInner}>
          {TALLY_FORM_ID ? (
            <TallyEmbed formId={TALLY_FORM_ID} />
          ) : (
            <div className={styles.comingSoon}>
              <h2 className={styles.comingSoonTitle}>
                The survey opens shortly
              </h2>
              <p className={styles.comingSoonBody}>
                We are putting the final questions in place. Check back in a
                few days, or see below what the survey covers and what you
                get for taking it.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>What we ask</h2>
          <p className={styles.sectionLede}>
            23 quick questions everyone sees, plus a few extras that only
            appear for the services you actually offer. No essays, no traps.
          </p>
          <div className={styles.askGrid}>
            {WHAT_WE_ASK.map((card) => (
              <div key={card.title} className={styles.askCard}>
                <h3 className={styles.askCardTitle}>{card.title}</h3>
                <p className={styles.askCardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.h2}>What you get</h2>
          <p className={styles.sectionLede} style={{ margin: 0 }}>
            The full report, free, before it is public: most-used vs
            would-choose-again quadrants for website platforms and PM tools,
            the revision-rounds benchmark, the AI use-vs-pay gap, and the
            most resented tool in agency life.
          </p>
          <Link href={REPORT_PATH} className={styles.ctaSecondaryLink}>
            Preview the report format (sample data)
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
