import type { ComponentType } from "react";
import styles from "./Sections.module.css";
import {
  AGENTS,
  AGENT_START_LABELS,
  ALTERNATIVES,
  BENEFITS,
  FIRST_SCAN_AGENT_COUNT,
  REPORT_POINTS,
  STAGES,
  STAGES_HEADLINE_LINES,
  SUPERFLOW_ROW,
  WHY_NOW,
  type Benefit,
  type Stage,
} from "./content";
import {
  AccessibilityVisual,
  AfterLaunchVisual,
  AgentsVisual,
  BeforeHandoffVisual,
  ClientReportVisual,
  FigmaVisual,
  HandoffVisual,
  McpVisual,
  MonitoringVisual,
  ReportVisual,
} from "./Visuals";

const STAGE_VISUALS: Readonly<Record<Stage["id"], ComponentType>> = {
  before: BeforeHandoffVisual,
  handoff: HandoffVisual,
  after: AfterLaunchVisual,
};

const BENEFIT_VISUALS: Readonly<Record<Benefit["id"], ComponentType>> = {
  agents: AgentsVisual,
  report: ReportVisual,
  monitoring: MonitoringVisual,
  accessibility: AccessibilityVisual,
  mcp: McpVisual,
  figma: FigmaVisual,
};

/** Multi-line serif heading; a trailing space keeps the text from joining. */
function LinedHeading({ lines, className }: { lines: readonly string[]; className: string }) {
  return (
    <h2 className={className}>
      {lines.map((line, index) => (
        <span key={line} className={styles.line}>
          {line}
          {index < lines.length - 1 ? " " : null}
        </span>
      ))}
    </h2>
  );
}

/** 02 / Stages: before handoff, at handoff, after launch. */
export function StagesSection() {
  return (
    <section className={styles.section} id="stages">
      <div className={`${styles.inner} ${styles.stagesGrid}`}>
        <div className={styles.stagesIntro}>
          <LinedHeading lines={STAGES_HEADLINE_LINES} className={styles.h2} />
        </div>
        <ol className={styles.stageList}>
          {STAGES.map((stage) => {
            const Visual = STAGE_VISUALS[stage.id];
            return (
              <li key={stage.id} className={styles.stage}>
                <span className={styles.audience}>{stage.audience}</span>
                <h3 className={styles.h3}>{stage.title}</h3>
                <p className={styles.text}>{stage.line}</p>
                <Visual />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** 03 / What you get: six cards with a visual each. */
export function WhatYouGetSection() {
  return (
    <section className={styles.section} id="what-you-get">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>What you get</h2>
        <ul className={styles.benefitGrid}>
          {BENEFITS.map((benefit) => {
            const Visual = BENEFIT_VISUALS[benefit.id];
            return (
              <li key={benefit.id} className={styles.benefit}>
                <h3 className={styles.h3}>{benefit.title}</h3>
                <p className={styles.text}>{benefit.line}</p>
                <Visual />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 04 / Why now: four short reasons. */
export function WhyNowSection() {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="why-now">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>Why QA matters more now</h2>
        <ol className={styles.whyGrid}>
          {WHY_NOW.map((item, index) => (
            <li key={item.title} className={styles.why}>
              <span className={styles.whyNumber}>{String(index + 1).padStart(2, "0")}</span>
              <h3 className={styles.whyTitle}>{item.title}</h3>
              <p className={styles.text}>{item.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 05 / The 13 agents, as one table. */
export function AgentsSection() {
  return (
    <section className={styles.section} id="agents">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>
          {AGENTS.length} agents. {FIRST_SCAN_AGENT_COUNT} run on the first scan.
        </h2>
        <p className={`${styles.sub} ${styles.center}`}>
          Each agent is a set of pass or fail checks. Every agent runs at every stage.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.agentTable}>
            <thead>
              <tr>
                <th scope="col">Agent</th>
                <th scope="col">What it checks</th>
                <th scope="col">Starts</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((agent) => (
                <tr key={agent.name}>
                  <th scope="row">{agent.name}</th>
                  <td>{agent.checks}</td>
                  <td>
                    <span className={`${styles.startTag} ${styles[`start_${agent.start.replace("-", "_")}`]}`}>
                      {AGENT_START_LABELS[agent.start]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** 06 / The client report. */
export function ReportSection() {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="report">
      <div className={`${styles.inner} ${styles.reportGrid}`}>
        <div className={styles.reportCopy}>
          <h2 className={styles.h2}>The report your client reads</h2>
          <p className={styles.sub}>Send it at handoff. Send it every week after launch.</p>
          <ul className={styles.checkList}>
            {REPORT_POINTS.map((point) => (
              <li key={point}>
                <span className={styles.tick} aria-hidden="true">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <ClientReportVisual />
      </div>
    </section>
  );
}

/** 07 / What agencies use today, and the gap in each. */
export function CompareSection() {
  return (
    <section className={styles.section} id="compare">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>What agencies use today</h2>
        <div className={styles.compareGrid}>
          {ALTERNATIVES.map((alt) => (
            <div key={alt.name} className={styles.compareCard}>
              <h3 className={styles.compareName}>{alt.name}</h3>
              <p className={styles.compareGap}>
                <span className={styles.cross} aria-hidden="true">
                  ✕
                </span>
                {alt.gap}
              </p>
            </div>
          ))}
          <div className={`${styles.compareCard} ${styles.compareUs}`}>
            <h3 className={styles.compareName}>Superflow</h3>
            <ul className={styles.compareList}>
              {SUPERFLOW_ROW.map((point) => (
                <li key={point}>
                  <span className={styles.tick} aria-hidden="true">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
