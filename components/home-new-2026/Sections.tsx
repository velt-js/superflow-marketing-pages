import type { ComponentType } from "react";
import styles from "./Sections.module.css";
import StageProgress from "./StageProgress";
import { AgentIcon, agentColors } from "./AgentIcons";
import {
  AGENTS,
  AGENT_GROUPS,
  ALTERNATIVES,
  BENEFITS,
  BUILD_OR_BUY,
  BUILD_OR_BUY_HEADLINE,
  BUILD_OR_BUY_SUB,
  FIRST_SCAN_AGENT_COUNT,
  REPORT_POINTS,
  STAGES,
  STAGES_HEADLINE_LINES,
  STAGES_SUB,
  WHY_NOW,
  type Benefit,
  type BuildOrBuyItem,
  type Stage,
} from "./content";
import {
  AccessibilityBenefitVisual,
  AfterLaunchVisual,
  AgentsBenefitVisual,
  BeforeHandoffVisual,
  ClientMemoryVisual,
  ClientReportVisual,
  FigmaBenefitVisual,
  HandoffVisual,
  McpBenefitVisual,
  MonitoringBenefitVisual,
  ReportBenefitVisual,
  TunedVisual,
  WorkspaceMemoryVisual,
} from "./Visuals";

const STAGE_VISUALS: Readonly<Record<Stage["id"], ComponentType>> = {
  before: BeforeHandoffVisual,
  handoff: HandoffVisual,
  after: AfterLaunchVisual,
};

const BENEFIT_VISUALS: Readonly<Record<Benefit["id"], ComponentType>> = {
  agents: AgentsBenefitVisual,
  report: ReportBenefitVisual,
  monitoring: MonitoringBenefitVisual,
  accessibility: AccessibilityBenefitVisual,
  mcp: McpBenefitVisual,
  figma: FigmaBenefitVisual,
};

/** One color per stage, shared by the tracker nodes and the stage eyebrows. */
const STAGE_COLORS: Readonly<Record<Stage["id"], string>> = {
  before: "#1a78e0",
  handoff: "#0f9d58",
  after: "#7c3aed",
};

const BUILD_OR_BUY_VISUALS: Readonly<Record<BuildOrBuyItem["id"], ComponentType>> = {
  tuned: TunedVisual,
  client: ClientMemoryVisual,
  workspace: WorkspaceMemoryVisual,
};

function Tick() {
  return (
    <span className={styles.tick} aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function Cross() {
  return (
    <span className={styles.cross} aria-hidden="true">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </span>
  );
}

/** 02 / Stages: before handoff, at handoff, after launch. */
export function StagesSection() {
  return (
    <section className={styles.section} id="stages">
      <div className={`${styles.inner} ${styles.stagesGrid}`}>
        <div className={styles.stagesIntro}>
          <h2 className={styles.h2}>
            {STAGES_HEADLINE_LINES.map((line, index) => (
              <span key={line} className={styles.line}>
                {line}
                {index < STAGES_HEADLINE_LINES.length - 1 ? " " : null}
              </span>
            ))}
          </h2>
          <p className={styles.sub}>{STAGES_SUB}</p>
          <StageProgress
            steps={STAGES.map((stage) => ({
              id: `stage-${stage.id}`,
              title: stage.title,
              audience: stage.audience,
              color: STAGE_COLORS[stage.id],
            }))}
          />
        </div>
        <ol className={styles.stageList}>
          {STAGES.map((stage) => {
            const Visual = STAGE_VISUALS[stage.id];
            return (
              <li key={stage.id} id={`stage-${stage.id}`} className={styles.stage}>
                <span className={styles.eyebrow} style={{ color: STAGE_COLORS[stage.id] }}>
                  {stage.audience}
                </span>
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

/** 03 / What you get: six cards, visual on top, copy below. */
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
                <Visual />
                <div className={styles.benefitBody}>
                  <h3 className={styles.cardTitle}>{benefit.title}</h3>
                  <p className={styles.cardText}>{benefit.line}</p>
                </div>
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
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 05 / The 13 agents as icon tiles, grouped by when they start. */
export function AgentsSection() {
  return (
    <section className={styles.section} id="agents">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>
          {AGENTS.length} agents. {FIRST_SCAN_AGENT_COUNT} run on the first scan.
        </h2>
        <p className={`${styles.sub} ${styles.center}`}>Each agent is a set of pass or fail checks.</p>

        <div className={styles.agentGroups}>
          {AGENT_GROUPS.map((group) => {
            const agents = AGENTS.filter((agent) => agent.start === group.start);
            return (
              <div key={group.start} className={styles.agentGroup}>
                <h3 className={styles.groupHead}>
                  {group.label}
                  <span className={styles.groupCount}>{agents.length}</span>
                </h3>
                <ul className={styles.agentTiles}>
                  {agents.map((agent) => (
                    <li key={agent.name} className={styles.agentTile}>
                      <span className={styles.agentIcon} style={{ background: agentColors(agent.name).tint }}>
                        <AgentIcon name={agent.name} size={20} />
                      </span>
                      <span className={styles.agentText}>
                        <b>{agent.name}</b>
                        <span>{agent.checks}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
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
        <div>
          <h2 className={styles.h2}>The report your client reads</h2>
          <p className={styles.sub}>Send it at handoff. Send it every week after launch.</p>
          <ul className={styles.checkList}>
            {REPORT_POINTS.map((point) => (
              <li key={point}>
                <Tick />
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

/** 07 / Today's tools next to Superflow, one row each. */
export function CompareSection() {
  return (
    <section className={styles.section} id="compare">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>How Superflow compares</h2>
        <div className={styles.compare} role="table" aria-label="Superflow compared with what agencies use today">
          <div className={styles.compareHead} role="row">
            <span role="columnheader">What agencies use today</span>
            <span role="columnheader">With Superflow</span>
          </div>
          {ALTERNATIVES.map((alt) => (
            <div key={alt.name} className={styles.compareRow} role="row">
              <div className={styles.compareOld} role="cell">
                <b>{alt.name}</b>
                <span>
                  <Cross />
                  {alt.gap}
                </span>
              </div>
              <div className={styles.compareNew} role="cell">
                <Tick />
                {alt.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 08 / Build or buy: what the agents already know. */
export function BuildOrBuySection() {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="build-or-buy">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>{BUILD_OR_BUY_HEADLINE}</h2>
        <p className={`${styles.sub} ${styles.center}`}>{BUILD_OR_BUY_SUB}</p>
        <ul className={styles.benefitGrid}>
          {BUILD_OR_BUY.map((item) => {
            const Visual = BUILD_OR_BUY_VISUALS[item.id];
            return (
              <li key={item.id} className={styles.benefit}>
                <Visual />
                <div className={styles.benefitBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardText}>{item.line}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
