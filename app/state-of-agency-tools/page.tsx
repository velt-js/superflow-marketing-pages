// State of Agency Tools 2026 - survey landing page.
//
// The questionnaire is a Tally form embedded here rather than a custom form
// with its own database: the form is commodity infrastructure, the report is
// the asset. Decision rationale and the Tally build guide live in ./README.md.

import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import {
  BallpenIcon,
  DevicesIcon,
  LayoutKanbanIcon,
  LockIcon,
  MessageIcon,
  SparklesIcon,
} from "@/components/home-2026/HeroIcons";
import { TallyEmbed } from "@/components/agency-survey-2026/TallyEmbed";
import {
  BarsMotif,
  QuadrantMotif,
  RankingMotif,
  UsePayMotif,
} from "@/components/agency-survey-2026/ReportPeekMotifs";
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
  { Icon: DevicesIcon, title: "Your building stack", hint: "Platforms, design, video" },
  { Icon: MessageIcon, title: "Client review", hint: "Feedback, revisions, QA" },
  { Icon: LayoutKanbanIcon, title: "Running the agency", hint: "PM, finance, payroll, CRM" },
  { Icon: SparklesIcon, title: "The AI section", hint: "What you use vs pay for" },
  { Icon: BallpenIcon, title: "The fun one", hint: "The tool you resent" },
  { Icon: LockIcon, title: "Nothing invasive", hint: "Aggregates only, email optional" },
];

const REPORT_PEEK = [
  { Motif: QuadrantMotif, label: "Would-choose-again quadrants" },
  { Motif: BarsMotif, label: "Ops, finance and payroll stacks" },
  { Motif: UsePayMotif, label: "The AI use-vs-pay gap" },
  { Motif: RankingMotif, label: "The most resented tool" },
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
      <SiteNav solidAtTop />

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
            28 quick questions, plus a few extras for the services you offer.
          </p>
          <div className={styles.askGrid}>
            {WHAT_WE_ASK.map(({ Icon, title, hint }) => (
              <div key={title} className={styles.askCard}>
                <span className={styles.askGlyph}>
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className={styles.askCardTitle}>{title}</h3>
                  <p className={styles.askCardBody}>{hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.h2}>What you get</h2>
          <p className={styles.sectionLede} style={{ margin: 0 }}>
            The full report, free, before it is public.
          </p>
          <div className={styles.peekGrid}>
            {REPORT_PEEK.map(({ Motif, label }) => (
              <div key={label} className={styles.peekCard}>
                <span className={styles.peekMotif}>
                  <Motif />
                </span>
                <p className={styles.peekLabel}>{label}</p>
              </div>
            ))}
          </div>
          <Link href={REPORT_PATH} className={styles.ctaSecondaryLink}>
            Preview the report format (sample data)
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
