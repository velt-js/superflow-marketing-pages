// Current questionnaire: published Tally form ODqdPK, verified 2026-09-08.
// Sample fixtures stay visibly labeled and noindex until real results replace them.
import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import styles from "@/components/agency-survey-2026/Survey.module.css";
import reportStyles from "@/components/agency-survey-2026/Report.module.css";
import chartStyles from "@/components/agency-survey-2026/charts/Charts.module.css";
import { BarList, UsePayBars } from "@/components/agency-survey-2026/charts/BarCharts";
import { REPORT_DATA, assistantUsePay } from "@/lib/agency-tools-survey/report-data";
import type { ShareChart } from "@/lib/agency-tools-survey/report-data";
import { REPORT_PATH, SURVEY_PATH } from "@/lib/agency-tools-survey/config";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

const TITLE = REPORT_DATA.sample
  ? "State of Agency Tools 2026: Sample Report"
  : "State of Agency Tools 2026 Report";
const DESCRIPTION = REPORT_DATA.sample
  ? "An illustrative report preview, not survey findings. Explore agency stacks, CRM, outreach, support, review and AI tools, with question-specific denominators."
  : "Agency tool adoption across creative work, operations, CRM, outreach, client support, review and AI, plus whole-stack satisfaction and tool value.";

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: REPORT_PATH,
  noindex: REPORT_DATA.sample,
});

function QuestionChart({ chart, sample }: { chart: ShareChart; sample: boolean }) {
  return (
    <div className={chartStyles.chartCard} id={chart.id}>
      <h3 className={chartStyles.chartCardTitle}>{chart.title}</h3>
      <p className={chartStyles.chartCardSubtitle}>
        {sample ? "Illustrative sample · " : ""}n={chart.answered}. {chart.audience}.
        {chart.multiple ? " Multiple selections allowed; totals may exceed 100%." : " One answer per respondent."}
      </p>
      <BarList rows={chart.rows} />
    </div>
  );
}

function AssistantCharts({ sample }: { sample: boolean }) {
  const rows = REPORT_DATA.aiAssistants;
  return (
    <div className={chartStyles.chartCard} style={{ marginBottom: 16 }}>
      <h3 className={chartStyles.chartCardTitle}>AI assistants: use and agency-paid use</h3>
      <p className={chartStyles.chartCardSubtitle}>
        {sample ? "Illustrative sample. " : ""}
        Percent of respondents who answered each assistant&apos;s row. Used includes all
        three used statuses. Agency-paid includes reimbursed accounts and paid bundles.
      </p>
      <UsePayBars rows={rows.map((row) => ({
        ...assistantUsePay(row), name: `${row.name} (n=${row.answered})`,
      }))} />
      <details className={chartStyles.tableToggle}>
        <summary>View all four response statuses and sample sizes</summary>
        <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="AI assistant response counts">
          <table className={chartStyles.dataTable} style={{ minWidth: 640 }}>
            <caption>
              {sample ? "Illustrative counts. " : "Response counts. "}
              One status per assistant; n excludes skipped rows.
            </caption>
            <thead>
              <tr>
                <th scope="col">Assistant</th>
                <th scope="col">n</th>
                <th scope="col">Not used</th>
                <th scope="col">Used, agency-paid</th>
                <th scope="col">Used, not agency-paid</th>
                <th scope="col">Used, payment unknown</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row">{row.name}</th>
                  <td>{row.answered}</td>
                  <td>{row.notUsed}</td>
                  <td>{row.agencyPaid}</td>
                  <td>{row.notAgencyPaid}</td>
                  <td>{row.paymentUnknown}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className={chartStyles.chartCardSubtitle} style={{ margin: "16px 0 0" }}>
        Not agency-paid does not necessarily mean free: an individual may pay personally.
        Unknown payment is kept separate. A skipped row is not counted as non-use.
      </p>
    </div>
  );
}

export default function AgencyToolsReportPage() {
  const data = REPORT_DATA;
  return (
    <div className={styles.page}>
      <SiteNav solidAtTop />
      {data.sample ? (
        <div className={reportStyles.sampleBanner}>
          <p className={reportStyles.sampleBannerText}>
            Sample report, not survey findings. Every number is illustrative.
            Real results are planned for {data.publishedLabel}.{" "}
            <Link href={SURVEY_PATH}>Contribute your agency&apos;s experience</Link>.
          </p>
        </div>
      ) : null}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{data.sample ? "Example report · Sample data" : "The report"}</span>
          <h1 className={styles.h1}>State of Agency Tools 2026</h1>
          <p className={styles.subhead}>
            The tools behind agency work, from creative production to sales,
            client support and AI. What teams use, who pays, and which stacks they would keep.
          </p>
          <p className={reportStyles.reportMeta}>
            {data.sample
              ? `Illustrative dataset: ${data.respondents} fictional responses · Full report planned for ${data.publishedLabel}`
              : `${data.respondents} responses · Published ${data.publishedLabel}`}
          </p>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="reading-the-report">
        <div className={styles.sectionInner}>
          <h2 className={styles.h2} id="reading-the-report">How to read this report</h2>
          <p className={styles.sectionLede}>
            Each chart names its audience and answer count. Service-specific questions,
            the optional eight-question business-tools section and conditional follow-ups
            have different denominators. Multiple-choice tool lists allow more than one selection.
            Skipped questions are excluded; explicit none and not-sure answers remain visible.
          </p>
          <nav aria-label="Report sections" style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px" }}>
            {data.sections.map((section) => (
              <a key={section.id} href={`#section-${section.id}`} className={styles.ctaSecondaryLink}>
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {data.sections.map((section, index) => (
        <section
          key={section.id}
          id={`section-${section.id}`}
          aria-labelledby={`heading-${section.id}`}
          className={`${styles.section} ${index % 2 === 0 ? styles.sectionAlt : ""}`}
          style={{ scrollMarginTop: 88 }}
        >
          <div className={styles.sectionInner}>
            <h2 className={styles.h2} id={`heading-${section.id}`}>{section.title}</h2>
            <p className={reportStyles.headlineStat}>{section.description}</p>
            {section.id === "ai" ? <AssistantCharts sample={data.sample} /> : null}
            <div className={chartStyles.chartGrid2}>
              {section.charts.map((chart) => (
                <QuestionChart key={chart.id} chart={chart} sample={data.sample} />
              ))}
              {section.id === "value" ? (
                <div className={chartStyles.chartCard}>
                  <h3 className={chartStyles.chartCardTitle}>Tools that feel least worth the cost</h3>
                  <p className={chartStyles.chartCardSubtitle}>
                    {data.sample ? "Illustrative sample · " : ""}n={data.leastValue.answered} write-in answers.
                    Mentions, not satisfaction scores or market-wide rankings.
                    {data.sample ? " Generic names are placeholders, not ratings of real vendors." : ""}
                  </p>
                  <ol className={reportStyles.resentList}>
                    {data.leastValue.tools.map((tool) => (
                      <li key={tool.name} className={reportStyles.resentItem}>
                        <span className={reportStyles.resentName}>{tool.name}</span>
                        <span className={reportStyles.resentMentions}>{tool.mentions} mentions</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>About the sample and publication</h2>
          <p className={styles.sectionLede}>
            {data.sample ? "This preview uses invented data to demonstrate the report format. " : ""}
            The survey also collects role, team size, services, location, optional revenue
            and industry focus. Published comparisons should identify their audience and
            sample size, avoid identifying individual agencies, and not present a
            self-selected sample as representative of every agency.
          </p>
          <p className={styles.sectionLede}>
            Report delivery and Superflow setup help are separate opt-ins.
            Contact details and product follow-up answers are not published in the report.
          </p>
        </div>
      </section>
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.h2}>Add your agency&apos;s experience</h2>
          <p className={styles.sectionLede} style={{ margin: 0 }}>
            Mostly multiple choice. Contact details are optional.
            Request the free report for {data.publishedLabel} at the end.
          </p>
          <Link href={SURVEY_PATH} className={styles.ctaLink}>Take the survey</Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
