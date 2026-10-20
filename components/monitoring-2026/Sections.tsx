import Link from "next/link";
import type { ComponentType } from "react";
import styles from "@/components/home-new-2026/Sections.module.css";
import { ClientReportVisual, MonitoringBenefitVisual, ReportBenefitVisual } from "@/components/home-new-2026/Visuals";
import { BULK_SITE_PLAN, BULK_SITE_PRICE_LABEL } from "@/components/pricing-2026/ai-credits-data";
import own from "./Sections.module.css";
import { AgentSwitchesVisual, ScheduleVisual } from "./Visuals";
import {
  BENEFITS,
  PRICE_HEADING,
  PRICE_SUB,
  REPORT_HEADING,
  REPORT_POINTS,
  REPORT_SUB,
  SCHEDULES,
  type Benefit,
} from "./content";

/*
 * Sections for /monitoring. They reuse the homepage section styles
 * (home-new-2026/Sections.module.css) so the two pages read as one site; the
 * few extra rules live in ./Sections.module.css.
 */

const BENEFIT_VISUALS: Readonly<Record<Benefit["id"], ComponentType>> = {
  agents: AgentSwitchesVisual,
  schedule: ScheduleVisual,
  score: MonitoringBenefitVisual,
  report: ReportBenefitVisual,
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

/** What you get: four cards, visual on top, copy below. */
export function MonitoringBenefitsSection() {
  return (
    <section className={styles.section} id="what-you-get">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>What you get</h2>
        <ul className={`${styles.benefitGrid} ${own.fourUp}`}>
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

/** The three schedules, one line each. */
export function SchedulesSection() {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="schedules">
      <div className={styles.inner}>
        <h2 className={`${styles.h2} ${styles.center}`}>Pick a schedule per site</h2>
        <p className={`${styles.sub} ${styles.center}`}>Agents also rerun when a page changes, whatever the schedule.</p>
        <ul className={own.schedules}>
          {SCHEDULES.map((schedule) => (
            <li key={schedule.id} className={own.scheduleCard}>
              <span className={own.scheduleLabel}>{schedule.label}</span>
              <p className={styles.cardText}>{schedule.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The maintenance report. */
export function MaintenanceReportSection() {
  return (
    <section className={styles.section} id="report">
      <div className={`${styles.inner} ${styles.reportGrid}`}>
        <div>
          <h2 className={styles.h2}>{REPORT_HEADING}</h2>
          <p className={styles.sub}>{REPORT_SUB}</p>
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

/** One flat rate per site, read from the pricing data. */
export function MonitoringPriceSection() {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="price">
      <div className={`${styles.inner} ${own.price}`}>
        <div className={own.priceCard}>
          <span className={own.priceAmount}>{BULK_SITE_PRICE_LABEL}</span>
          <h2 className={own.priceTitle}>{PRICE_HEADING}</h2>
          <p className={styles.cardText}>{PRICE_SUB}</p>
          <ul className={styles.checkList}>
            {BULK_SITE_PLAN.includes.map((line) => (
              <li key={line}>
                <Tick />
                {line}
              </li>
            ))}
          </ul>
          <Link href="/pricing" className={own.priceLink}>
            See all plans
          </Link>
        </div>
      </div>
    </section>
  );
}
