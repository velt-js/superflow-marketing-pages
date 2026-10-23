"use client";

import { useEffect, useState, type CSSProperties } from "react";
import shared from "@/components/home-new-2026/Visuals.module.css";
import { AGENTS } from "@/components/home-new-2026/content";
import { AgentIcon, agentColors } from "@/components/home-new-2026/AgentIcons";
import styles from "./Visuals.module.css";
import { SCHEDULES, type Schedule } from "./content";

/*
 * Card visuals for /monitoring. Two are small working controls (the agent
 * switches and the schedule picker) and two replay a short animation (the
 * score line drawing in, the report ring filling). They share the homepage
 * card frame (`cardVisual` in home-new-2026/Visuals.module.css) so the two
 * pages match. Under reduced motion the animations stop on their end state.
 */

/** How often the looping visuals replay, in ms. */
const LOOP_MS = 6000;

const SHOWN_AGENTS = AGENTS.slice(0, 5);

/** Agent switches for one site. Click to turn an agent on or off. */
export function AgentSwitchesVisual() {
  const [on, setOn] = useState<boolean[]>(() => SHOWN_AGENTS.map((agent) => agent.start === "first-scan"));
  const onCount = on.filter(Boolean).length;

  function toggle(index: number) {
    try {
      setOn((previous) => previous.map((value, i) => (i === index ? !value : value)));
    } catch {
      // Leave the switches as they are.
    }
  }

  return (
    <div className={shared.cardVisual}>
      <ul className={styles.switches} aria-label="Agents on this site">
        {SHOWN_AGENTS.map((agent, index) => (
          <li key={agent.name} className={styles.switchRow}>
            <span className={styles.switchIcon} style={{ background: agentColors(agent.name).tint }} aria-hidden="true">
              <AgentIcon name={agent.name} size={14} />
            </span>
            <span className={styles.switchName}>{agent.name}</span>
            <button
              type="button"
              role="switch"
              aria-checked={on[index]}
              aria-label={`${agent.name} ${on[index] ? "on" : "off"}`}
              className={`${styles.switch} ${on[index] ? styles.switchOn : ""}`}
              style={{ animationDelay: `${index * 120}ms` }}
              onClick={() => toggle(index)}
            >
              <span className={styles.knob} />
            </button>
          </li>
        ))}
        <li className={styles.switchMore} aria-live="polite">
          {onCount} of {SHOWN_AGENTS.length} on · + {AGENTS.length - SHOWN_AGENTS.length} more agents
        </li>
      </ul>
    </div>
  );
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const NEXT_RUN: Readonly<Record<Schedule["id"], string>> = {
  daily: "Tomorrow 6:00 · report goes to Dana",
  weekly: "Friday 6:00 · report goes to Dana",
  monthly: "Nov 1, 6:00 · report goes to Dana",
};

/** Schedule picker. Click Daily, Weekly or Monthly to see the next run. */
export function ScheduleVisual() {
  const [schedule, setSchedule] = useState<Schedule["id"]>("weekly");

  function isDayOn(index: number): boolean {
    if (schedule === "daily") return true;
    if (schedule === "weekly") return index === 4;
    return false;
  }

  return (
    <div className={shared.cardVisual}>
      <div className={styles.schedule}>
        <div className={styles.segmented} role="radiogroup" aria-label="Schedule">
          {SCHEDULES.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={schedule === option.id}
              className={schedule === option.id ? styles.segmentOn : styles.segment}
              onClick={() => setSchedule(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className={styles.calendar} aria-hidden="true">
          {DAYS.map((day, index) => (
            <span key={`${day}-${index}`} className={isDayOn(index) ? styles.dayOn : styles.day}>
              {day}
            </span>
          ))}
        </span>
        {schedule === "monthly" ? (
          <span className={styles.monthChip} aria-hidden="true">
            1st of every month
          </span>
        ) : null}
        <span className={styles.nextRun} aria-live="polite">
          <b>Next run</b>
          <span>{NEXT_RUN[schedule]}</span>
        </span>
      </div>
    </div>
  );
}

const SCORES = [96, 96, 97, 91, 97, 97, 98, 98, 94, 98, 98, 99];

/** The score line draws in from left to right, then replays. */
export function ScoreLineVisual() {
  const points = SCORES.map((score, index) => {
    const x = (index / (SCORES.length - 1)) * 200;
    const y = 54 - ((score - 86) / 14) * 46;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const loop = useLoop();

  return (
    <div className={shared.cardVisual} aria-hidden="true">
      <div key={loop} className={styles.monitor}>
        <span className={styles.monitorHead}>
          <span>brightsmile.com</span>
          <span className={styles.liveTag}>
            <span className={styles.liveDot} />
            Checking
          </span>
        </span>
        <span className={styles.sparkWrap}>
          <svg className={styles.spark} viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mon-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a78e0" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1a78e0" stopOpacity="0" />
              </linearGradient>
              <clipPath id="mon-spark-clip">
                <rect className={styles.sparkReveal} x="0" y="0" width="200" height="60" />
              </clipPath>
            </defs>
            <g clipPath="url(#mon-spark-clip)">
              <polygon points={`0,60 ${line} 200,60`} fill="url(#mon-spark-fill)" />
              <polyline
                points={line}
                fill="none"
                stroke="#1a78e0"
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                className={styles.sparkLine}
              />
            </g>
          </svg>
          <span className={styles.sparkDot} style={{ top: `${((last[1] / 60) * 100).toFixed(1)}%` }} />
        </span>
        <span className={styles.monitorFoot}>
          <span className={styles.scoreNow}>
            <b>{SCORES[SCORES.length - 1]}</b> now
          </span>
          <span>Last check 8 min ago</span>
        </span>
      </div>
    </div>
  );
}

/** The report ring fills to 98 and the number counts up, then replays. */
export function ReportScoreVisual() {
  const target = 98;
  const loop = useLoop();
  const value = useCountUp(target, 1400, loop);
  const circumference = 2 * Math.PI * 26;

  return (
    <div className={shared.cardVisual} aria-hidden="true">
      <div key={loop} className={styles.reportCard}>
        <span className={styles.agency}>Northwind Studio</span>
        <div className={styles.reportCardBody}>
          <span className={styles.ring}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#e9f9ef" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#16a34a"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * target) / 100}
                transform="rotate(-90 32 32)"
                className={styles.ringArc}
                style={{ "--arc-start": circumference } as CSSProperties}
              />
            </svg>
            <b>{value}</b>
          </span>
          <span className={styles.reportCardText}>
            <b>Weekly QA report</b>
            <span>Bright Smile Dental</span>
            <span className={styles.fixedLine}>3 issues fixed</span>
          </span>
        </div>
        <span className={styles.sentLine}>Sent to dana@brightsmile.com</span>
      </div>
    </div>
  );
}

/** A counter that ticks every LOOP_MS so a visual can restart its animation. */
function useLoop(): number {
  const [loop, setLoop] = useState<number>(0);
  useEffect(() => {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    } catch {
      // Treat an unknown preference as "animate".
    }
    const id = window.setInterval(() => setLoop((n) => n + 1), LOOP_MS);
    return () => window.clearInterval(id);
  }, []);
  return loop;
}

/** Counts from 0 to `target` over `durationMs`, restarting whenever `key` changes. */
function useCountUp(target: number, durationMs: number, key: number): number {
  const [value, setValue] = useState<number>(target);
  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    // Under reduced motion the value stays at the target it started on.
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, key]);
  return value;
}
