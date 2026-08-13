// State of Agency Tools 2026 - results report.
//
// Renders whatever lib/agency-tools-survey/report-data.ts exports. While
// that file's `sample` flag is true the page shows a sample-data banner and
// stays noindex; publishing the real results in November is a data swap,
// not a rebuild. Update pipeline: ../README.md.
//
// Section order mirrors the survey: the stack, ops & money, new business,
// client management, review & QA, AI. Review is deliberately ONE section
// among several rather than the spine of the page - a broad industry
// report is what agencies want to read (and share); a report that bends
// every section back to review reads as a pitch and gets ignored.

import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import styles from "@/components/agency-survey-2026/Survey.module.css";
import reportStyles from "@/components/agency-survey-2026/Report.module.css";
import chartStyles from "@/components/agency-survey-2026/charts/Charts.module.css";
import {
  BarList,
  StatTiles,
  UsePayBars,
} from "@/components/agency-survey-2026/charts/BarCharts";
import { QuadrantChart } from "@/components/agency-survey-2026/charts/QuadrantChart";
import { REPORT_DATA } from "@/lib/agency-tools-survey/report-data";
import {
  REPORT_PATH,
  SURVEY_PATH,
} from "@/lib/agency-tools-survey/config";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

const TITLE = "State of Agency Tools 2026 Report";
const DESCRIPTION =
  "What 500+ agencies really run on: website platforms, PM, time tracking, accounting, payroll, CRM, proposals, client comms, review, and AI - including the use-vs-pay gap and the most resented tool in agency life.";

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: REPORT_PATH,
  // Noindex while the numbers are sample data. Flip together with
  // REPORT_DATA.sample when the real results land.
  noindex: REPORT_DATA.sample,
});

export default function AgencyToolsReportPage() {
  const data = REPORT_DATA;
  return (
    <div className={styles.page}>
      <SiteNav solidAtTop />

      {data.sample ? (
        <div className={reportStyles.sampleBanner}>
          <p className={reportStyles.sampleBannerText}>
            Sample data. Every number on this page is illustrative, here so
            the report design can be reviewed before responses close. Real
            results publish in {data.publishedLabel}.{" "}
            <Link href={SURVEY_PATH}>Take the survey</Link> to get them
            first.
          </p>
        </div>
      ) : null}

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>The report</span>
          <h1 className={styles.h1}>State of Agency Tools 2026</h1>
          <p className={styles.subhead}>
            What {data.respondents}+ agencies actually run on, from the
            platforms they build in to the tools that pay the team.
          </p>
          <p className={reportStyles.reportMeta}>
            {data.respondents}+ responses · Published {data.publishedLabel}
          </p>
        </div>
      </header>

      {/* Headline tiles pull from four different parts of the business so
          the report opens broad, not on one theme. */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <StatTiles
            tiles={[
              {
                value: `${data.noMarginPct}%`,
                label: "do not know their profit margin per client",
              },
              {
                value: `${data.noCrmPct}%`,
                label: "run new business without a CRM",
              },
              {
                value: `${data.aiTouchesWorkPct}%`,
                label: "have AI touching client deliverable work",
              },
              {
                value: `${data.avgRevisionRounds}`,
                label: "revision rounds on the average website project",
              },
            ]}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Most used vs would choose again</h2>
          <p className={reportStyles.headlineStat}>
            Usage tells you what won the last five years. The loyalty axis,
            would you choose it again, tells you what wins the next five.
            Top-right is the safe zone; bottom-right is installed-base
            resentment.
          </p>
          <div className={chartStyles.chartGrid2}>
            <QuadrantChart
              title="Website platforms"
              subtitle="Usage among agencies that build client sites vs loyalty among each platform's users"
              points={data.platformQuadrant}
              usageLabel="Agencies using it"
            />
            <QuadrantChart
              title="Project management tools"
              subtitle="Usage across all agencies vs loyalty among each tool's users"
              points={data.pmQuadrant}
              usageLabel="Agencies using it"
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Ops and money</h2>
          <p className={reportStyles.headlineStat}>
            The back office is where the spreadsheet keeps winning:{" "}
            <strong>
              {data.timeTracking.find((r) => r.label === "Spreadsheets")?.pct ?? 0}%
              still track time in a spreadsheet
            </strong>
            , and <strong>{data.noMarginPct}%</strong> cannot say what any
            single client earns them.
          </p>
          <div className={chartStyles.chartGrid2}>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Time tracking and resourcing
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.timeTracking} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Do you know your profit margin per client?
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies
              </p>
              <BarList rows={data.marginKnowledge} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Accounting and invoicing
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.accounting} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Paying the team and contractors
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.payroll} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>How new business actually runs</h2>
          <p className={reportStyles.headlineStat}>
            <strong>
              {data.noCrmPct}% of agencies have no CRM at all
            </strong>{" "}
            - the pipeline lives in an inbox - and the most common proposal
            tool is still a document:{" "}
            {data.proposals[0]?.pct}% send{" "}
            {data.proposals[0]?.label.toLowerCase()}.
          </p>
          <div className={chartStyles.chartGrid2}>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Sales pipeline and CRM
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.crm} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Proposals, contracts and e-signatures
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.proposals} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Living with clients</h2>
          <p className={reportStyles.headlineStat}>
            Email still carries the relationship at{" "}
            <strong>{data.clientComms[0]?.pct}% of agencies</strong>, while
            AI notetakers have quietly reached{" "}
            <strong>{data.notetakerAdoptionPct}%</strong> of client calls.
          </p>
          <div className={chartStyles.chartGrid2}>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Where day-to-day client communication happens
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.clientComms} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                AI notetakers on client calls
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.notetakers} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Review, revisions and QA</h2>
          <p className={reportStyles.headlineStat}>
            <strong>
              {data.emailOrScreenshotsPct}% collect creative feedback over
              email or screenshots
            </strong>
            , the average website takes{" "}
            <strong>{data.avgRevisionRounds} rounds of revisions</strong>,
            and <strong>{data.noQaPct}%</strong> ship with no real QA
            process.
          </p>
          <div className={chartStyles.chartGrid2}>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                How client feedback reaches you
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies, multi-select
              </p>
              <BarList rows={data.feedbackChannels} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Rounds of client revisions
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies
              </p>
              <BarList rows={data.revisionRounds} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Do you QA websites before launch?
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies
              </p>
              <BarList rows={data.qaProcess} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>AI: what they use, what they pay for</h2>
          <p className={reportStyles.headlineStat}>
            Nearly everyone uses ChatGPT; the paying is where the market
            actually is (
            <strong>
              {data.llmUsePay[0]?.usePct}% use it, {data.llmUsePay[0]?.payPct}%
              pay
            </strong>
            ). AI touches client work at {data.aiTouchesWorkPct}% of
            agencies, but only{" "}
            <strong>{data.alwaysTellClientsPct}% always tell clients</strong>.
          </p>
          <div className={chartStyles.chartCard}>
            <h3 className={chartStyles.chartCardTitle}>
              AI assistants: use it vs pay for it
            </h3>
            <p className={chartStyles.chartCardSubtitle}>
              Share of agencies, multi-select
            </p>
            <UsePayBars rows={data.llmUsePay} />
          </div>
          <div
            className={chartStyles.chartGrid2}
            style={{ marginTop: "16px" }}
          >
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Share of client work AI touches
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies
              </p>
              <BarList rows={data.aiShare} />
            </div>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Do you tell clients when AI is involved?
              </h3>
              <p className={chartStyles.chartCardSubtitle}>
                Share of agencies
              </p>
              <BarList rows={data.aiDisclosure} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>The most resented tool in agency life</h2>
          <p className={reportStyles.headlineStat}>
            One open question, no options to hide behind: which tool do you
            resent paying for? The most-mentioned answers, counted by hand.
          </p>
          <ol className={reportStyles.resentList}>
            {data.resentedTools.map((tool) => (
              <li key={tool.name} className={reportStyles.resentItem}>
                <span className={reportStyles.resentName}>{tool.name}</span>
                <span className={reportStyles.resentMentions}>
                  {tool.mentions} mentions
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.h2}>Add your stack to the data</h2>
          <p className={styles.sectionLede} style={{ margin: 0 }}>
            The survey takes 5 minutes, every question is a single tap, and
            respondents get the full report before anyone else.
          </p>
          <Link href={SURVEY_PATH} className={styles.ctaLink}>
            Take the survey
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
