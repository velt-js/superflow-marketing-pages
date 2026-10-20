import shared from "@/components/home-new-2026/Visuals.module.css";
import { AGENTS } from "@/components/home-new-2026/content";
import { AgentIcon, agentColors } from "@/components/home-new-2026/AgentIcons";
import styles from "./Visuals.module.css";

/*
 * Card visuals for /monitoring that the homepage does not already have: the
 * per-site agent switches and the schedule picker. Both are decorative; the
 * card copy carries the meaning. They share the homepage card frame
 * (`cardVisual` in home-new-2026/Visuals.module.css) so the two pages match.
 */

/** Agent switches for one site: the first-scan seven on, the rest off. */
export function AgentSwitchesVisual() {
  const shown = AGENTS.slice(0, 5);
  return (
    <div className={shared.cardVisual} aria-hidden="true">
      <ul className={styles.switches}>
        {shown.map((agent) => {
          const on = agent.start === "first-scan";
          return (
            <li key={agent.name} className={styles.switchRow}>
              <span className={styles.switchIcon} style={{ background: agentColors(agent.name).tint }}>
                <AgentIcon name={agent.name} size={14} />
              </span>
              <span className={styles.switchName}>{agent.name}</span>
              <span className={`${styles.switch} ${on ? styles.switchOn : ""}`}>
                <span className={styles.knob} />
              </span>
            </li>
          );
        })}
        <li className={styles.switchMore}>+ {AGENTS.length - shown.length} more agents</li>
      </ul>
    </div>
  );
}

/** Schedule picker with "Weekly" chosen and the next run shown. */
export function ScheduleVisual() {
  return (
    <div className={shared.cardVisual} aria-hidden="true">
      <div className={styles.schedule}>
        <span className={styles.segmented}>
          <span>Daily</span>
          <span className={styles.segmentOn}>Weekly</span>
          <span>Monthly</span>
        </span>
        <span className={styles.calendar}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <span key={`${day}-${index}`} className={index === 4 ? styles.dayOn : styles.day}>
              {day}
            </span>
          ))}
        </span>
        <span className={styles.nextRun}>
          <b>Next run</b>
          <span>Friday 6:00 · report goes to Dana</span>
        </span>
      </div>
    </div>
  );
}
