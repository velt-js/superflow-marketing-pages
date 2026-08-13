// State of Agency Tools 2026 - results report.
//
// Renders whatever lib/agency-tools-survey/report-data.ts exports. While
// that file's `sample` flag is true the page shows a sample-data banner and
// stays noindex; publishing the real results in November is a data swap,
// not a rebuild. Update pipeline: ../README.md.

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
  "What 500+ agencies really use: website platforms, client review workflows, PM tools, money ops, and AI - including the use-vs-pay gap and the most resented tool in agency life.";

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
      <SiteNav />

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
            The tools {data.respondents}+ agencies really use, what they
            would choose again, and where AI actually fits.
          </p>
          <p className={reportStyles.reportMeta}>
            {data.respondents}+ responses · Published {data.publishedLabel}
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <StatTiles
            tiles={[
              {
                value: `${data.emailOrScreenshotsPct}%`,
                label:
                  "still collect website feedback over email and screenshots",
              },
              {
                value: `${data.noQaPct}%`,
                label: "have no real QA process before launch",
              },
              {
                value: `${data.avgRevisionRounds}`,
                label: "revision rounds on the average website project",
              },
              {
                value: `${data.noMarginPct}%`,
                label: "do not know their profit margin per client",
              },
            ]}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>How client feedback really arrives</h2>
          <p className={reportStyles.headlineStat}>
            Multiple answers allowed, so shares sum past 100%. The dedicated
            review tool is still the exception:{" "}
            <strong>
              {data.emailOrScreenshotsPct}% of agencies collect feedback over
              email or screenshots
            </strong>
            , and only{" "}
            {data.feedbackChannels.find(
              (c) => c.label === "A dedicated review tool",
            )?.pct ?? 0}
            % route it through a tool built for review.
          </p>
          <div className={chartStyles.chartCard}>
            <h3 className={chartStyles.chartCardTitle}>
              How does client feedback on creative work usually reach you?
            </h3>
            <p className={chartStyles.chartCardSubtitle}>
              Share of agencies, multi-select
            </p>
            <BarList rows={data.feedbackChannels} />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Revisions and QA</h2>
          <p className={reportStyles.headlineStat}>
            The average website project goes through{" "}
            <strong>{data.avgRevisionRounds} rounds of client revisions</strong>
            , and <strong>{data.noQaPct}%</strong> of agencies ship with no
            real QA process, which includes the {
              data.qaProcess.find(
                (r) => r.label === "The client usually finds the bugs",
              )?.pct ?? 0
            }
            % who admit the client usually finds the bugs.
          </p>
          <div className={chartStyles.chartGrid2}>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Rounds of client revisions on a typical website project
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
          <h2 className={styles.h2}>The AI use-vs-pay gap</h2>
          <p className={reportStyles.headlineStat}>
            Nearly everyone uses ChatGPT. The paying is where the market
            actually is:{" "}
            <strong>
              {data.llmUsePay[0]?.usePct}% use {data.llmUsePay[0]?.name},{" "}
              {data.llmUsePay[0]?.payPct}% pay for it
            </strong>
            .
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
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>How deep AI runs, and who says so</h2>
          <p className={reportStyles.headlineStat}>
            AI touches client deliverables at{" "}
            <strong>{data.aiTouchesWorkPct}% of agencies</strong>, but only{" "}
            <strong>
              {data.alwaysTellClientsPct}% always tell clients
            </strong>{" "}
            when it does.
          </p>
          <div className={chartStyles.chartGrid2}>
            <div className={chartStyles.chartCard}>
              <h3 className={chartStyles.chartCardTitle}>
                Share of client deliverable work AI touches today
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

      <section className={styles.section}>
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
