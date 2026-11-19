import styles from "./HeroMonitoringArtifact.module.css";

/**
 * Hero visual for /monitoring: the monitoring view for one agency. A list of
 * client sites on the left, each with its score and schedule, and the open
 * site on the right with its score over time, the next run, and the report
 * going to the client.
 *
 * Static apart from a live dot and a score that ticks up once. CSS only, so it
 * renders on the server. Authored at a fixed 1120x480 stage that steps down
 * with container queries.
 */

const SITES = [
  { name: "brightsmile.com", client: "Bright Smile Dental", score: 98, schedule: "Weekly", tone: "good" },
  { name: "oakandiron.co", client: "Oak & Iron Furniture", score: 92, schedule: "Daily", tone: "good" },
  { name: "harborlaw.com", client: "Harbor Law Group", score: 81, schedule: "Monthly", tone: "warn" },
  { name: "peakfitstudio.com", client: "Peak Fit Studio", score: 96, schedule: "Weekly", tone: "good" },
] as const;

/* Score per run for the open site, oldest first. */
const RUNS = [91, 93, 93, 94, 90, 95, 96, 96, 94, 97, 98, 98];

function CheckGlyph({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function HeroMonitoringArtifact() {
  const points = RUNS.map((score, index) => {
    const x = (index / (RUNS.length - 1)) * 300;
    const y = 70 - ((score - 86) / 14) * 60;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const circumference = 2 * Math.PI * 34;

  return (
    <div className={styles.root}>
      <div
        className={styles.frame}
        role="img"
        aria-label="Monitoring view: four client sites with their scores and schedules, and one site open showing its score over time, the next run, and the report sent to the client."
      >
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.sidebar}>
            <div className={styles.sidebarHead}>
              <span>Monitoring</span>
              <span className={styles.count}>4 sites on</span>
            </div>
            <ul className={styles.siteList}>
              {SITES.map((site, index) => (
                <li key={site.name} className={`${styles.site} ${index === 0 ? styles.siteOpen : ""}`}>
                  <span className={styles.siteText}>
                    <b>{site.name}</b>
                    <span>{site.client}</span>
                  </span>
                  <span className={styles.siteMeta}>
                    <span className={`${styles.siteScore} ${styles[`tone_${site.tone}`]}`}>{site.score}</span>
                    <span className={styles.siteSchedule}>{site.schedule}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.detail}>
            <div className={styles.detailHead}>
              <span className={styles.detailTitle}>
                <b>brightsmile.com</b>
                <span>Bright Smile Dental · Weekly, Fridays 6:00</span>
              </span>
              <span className={styles.toggle}>
                <span className={styles.toggleKnob} />
                On
              </span>
            </div>

            <div className={styles.detailBody}>
              <div className={styles.scoreCard}>
                <span className={styles.ring}>
                  <svg width="84" height="84" viewBox="0 0 84 84">
                    <circle cx="42" cy="42" r="34" fill="none" stroke="#e9f9ef" strokeWidth="7" />
                    <circle
                      cx="42"
                      cy="42"
                      r="34"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${(circumference * 98) / 100} ${circumference}`}
                      transform="rotate(-90 42 42)"
                      className={styles.ringArc}
                    />
                  </svg>
                  <b>98</b>
                </span>
                <span className={styles.scoreText}>
                  <span className={styles.label}>Site score</span>
                  <span className={styles.up}>▲ 4 since last run</span>
                </span>
              </div>

              <div className={styles.chartCard}>
                <span className={styles.label}>Last 12 runs</span>
                <span className={styles.chartWrap}>
                  <svg className={styles.chart} viewBox="0 0 300 74" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="mon-hero-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a78e0" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#1a78e0" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points={`0,74 ${points} 300,74`} fill="url(#mon-hero-fill)" />
                    <polyline points={points} fill="none" stroke="#1a78e0" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <span className={styles.chartDot} />
                </span>
              </div>

              <div className={styles.agentsCard}>
                <span className={styles.label}>Agents on this site</span>
                <ul className={styles.agentChips}>
                  {["Link Checker", "Image Inspector", "Mobile Inspector", "Accessibility", "AI Visibility", "Proofreader", "Consistency Checker"].map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                  <li className={styles.chipMore}>+ 6 more</li>
                </ul>
              </div>

              <div className={styles.runsCard}>
                <span className={styles.runRow}>
                  <span className={styles.liveDot} />
                  <span>
                    <b>Checking now</b>
                    <span>12 pages changed since Monday</span>
                  </span>
                </span>
                <span className={styles.runRow}>
                  <span className={styles.sentDot}>
                    <CheckGlyph />
                  </span>
                  <span>
                    <b>Report sent to Dana</b>
                    <span>Fri 6:04 · dana@brightsmile.com</span>
                  </span>
                </span>
                <span className={styles.runRow}>
                  <span className={styles.nextDot} />
                  <span>
                    <b>Next run</b>
                    <span>Fri 6:00 · then every week</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
