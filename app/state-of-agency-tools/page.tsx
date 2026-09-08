// Published Tally form ODqdPK is the questionnaire source of truth.
// Keep page promises aligned with its questions, routing and contact choices.
import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import {
  BallpenIcon,
  DevicesIcon,
  LayoutKanbanIcon,
  MessageIcon,
  SparklesIcon,
} from "@/components/home-2026/HeroIcons";
import { TallyEmbed } from "@/components/agency-survey-2026/TallyEmbed";
import {
  BarsMotif,
  RankingMotif,
  UsePayMotif,
} from "@/components/agency-survey-2026/ReportPeekMotifs";
import styles from "@/components/agency-survey-2026/Survey.module.css";
import { REPORT_PATH, SURVEY_PATH, TALLY_FORM_ID } from "@/lib/agency-tools-survey/config";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const TITLE = "State of Agency Tools 2026";
const DESCRIPTION =
  "Share your agency's creative, operations, CRM, outreach, client support and AI tools. Get the free State of Agency Tools report in November 2026. Contact details are optional.";

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: SURVEY_PATH,
});

const WHAT_WE_ASK = [
  { Icon: DevicesIcon, title: "Creative and marketing", hint: "Websites, design, video, SEO, social, email" },
  { Icon: LayoutKanbanIcon, title: "Projects and operations", hint: "PM, time tracking, profit, finance, payroll" },
  { Icon: BallpenIcon, title: "Sales tools", hint: "CRM, prospecting, proposals, e-signatures" },
  { Icon: MessageIcon, title: "Client support", hint: "Help desks, shared inboxes, client portals" },
  { Icon: SparklesIcon, title: "AI tools", hint: "Assistants, notetakers, production, who pays" },
  { Icon: MessageIcon, title: "Review and tool value", hint: "Feedback, revisions, checklists, bottlenecks" },
];

const REPORT_PEEK = [
  { Motif: BarsMotif, label: "Tool adoption and stack satisfaction" },
  { Motif: BarsMotif, label: "CRM, outreach and client support" },
  { Motif: UsePayMotif, label: "AI use and agency-paid adoption" },
  { Motif: RankingMotif, label: "Tools that feel least worth the cost" },
];

export default function StateOfAgencyToolsPage() {
  return (
    <div className={styles.page}>
      <PageJsonLd
        name={`${TITLE} | Superflow`}
        description={DESCRIPTION}
        path={SURVEY_PATH}
        trail={[{ name: TITLE, url: `${SITE_URL}${SURVEY_PATH}` }]}
      />
      <SiteNav solidAtTop />
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{TITLE}</span>
          <h1 className={styles.h1}>Which agency tools are worth keeping?</h1>
          <p className={styles.subhead}>
            Share your team&apos;s tools. Get the free report in November 2026.
          </p>
          <p className={styles.privacyLine}>
            By Superflow. Contact details are optional. We publish combined results only.
          </p>
        </div>
      </header>

      <section className={styles.embedSlot} aria-label="Agency tools survey">
        <div className={styles.embedInner}>
          {TALLY_FORM_ID ? (
            <TallyEmbed formId={TALLY_FORM_ID} />
          ) : (
            <div className={styles.comingSoon}>
              <h2 className={styles.comingSoonTitle}>The survey opens shortly</h2>
              <p className={styles.comingSoonBody}>
                See what the survey covers below, or preview the report format.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>What we ask</h2>
          <p className={styles.sectionLede}>
            Mostly multiple choice, with questions matched to your services.
            Skip what you do not know. The eight-question business-tools section is optional.
          </p>
          <div className={styles.askGrid}>
            {WHAT_WE_ASK.map(({ Icon, title, hint }) => (
              <div key={title} className={styles.askCard}>
                <span className={styles.askGlyph}><Icon size={22} /></span>
                <div>
                  <h3 className={styles.askCardTitle}>{title}</h3>
                  <p className={styles.askCardBody}>{hint}</p>
                </div>
              </div>
            ))}
          </div>
          <details className={styles.sectionLede} style={{ margin: "24px 0 0" }}>
            <summary style={{ cursor: "pointer" }}>Your answers and follow-up choices</summary>
            <p>
              You can answer without sharing contact details. If you provide an email,
              it is stored with your response and used only for the follow-up you choose.
              Report delivery and Superflow setup help are separate, optional choices.
              We publish combined findings, not individual answers or email addresses.
            </p>
          </details>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.h2}>What you get</h2>
          <p className={styles.sectionLede} style={{ margin: 0 }}>
            A free report on what agencies use, what they pay for, and which stacks they would choose again.
          </p>
          <div className={styles.peekGrid}>
            {REPORT_PEEK.map(({ Motif, label }) => (
              <div key={label} className={styles.peekCard}>
                <span className={styles.peekMotif}><Motif /></span>
                <p className={styles.peekLabel}>{label}</p>
              </div>
            ))}
          </div>
          <Link href={REPORT_PATH} className={styles.ctaSecondaryLink}>
            Preview the report format (illustrative sample data)
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
