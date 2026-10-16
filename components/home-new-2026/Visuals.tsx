import styles from "./Visuals.module.css";
import { AGENTS, AGENT_START_LABELS, type AgentStart } from "./content";

/*
 * HTML visuals for /new-home-2026: one per stage, one per "What you get" card,
 * plus the full client report. Every visual is decorative (aria-hidden): the
 * heading and line beside it carry the meaning. All sample data belongs to one
 * made-up client, Bright Smile Dental, so the page tells one story.
 */

const CLIENT = "Bright Smile Dental";
const AGENCY = "Northwind Studio";

/* ------------------------------------------------------------------ stages */

/** Before handoff: agents pin staging, the team accepts, rejects, or assigns. */
export function BeforeHandoffVisual() {
  const rows = [
    { tone: "link", source: "Link Checker", issue: "Footer link goes to a 404", state: "accept" },
    { tone: "proof", source: "Proofreader", issue: "Lorem Ipsum on /services", state: "assign" },
    { tone: "mcp", source: "Claude Code · MCP", issue: "Form has no label", state: "open" },
  ] as const;

  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.split}>
        <div className={styles.miniBrowser}>
          <div className={styles.miniChrome}>
            <span className={styles.stagingTag}>Staging</span>
            <span className={styles.miniUrl}>staging.brightsmile.com</span>
          </div>
          <div className={styles.miniPage}>
            <span className={styles.skelTitle} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineShort} />
            <span className={styles.skelButton} />
            <span className={styles.skelGrid}>
              <i />
              <i />
              <i />
            </span>
            <span className={`${styles.miniPin} ${styles.tone_link}`} style={{ left: "62%", top: "78%" }}>1</span>
            <span className={`${styles.miniPin} ${styles.tone_proof}`} style={{ left: "70%", top: "14%" }}>2</span>
            <span className={`${styles.miniPin} ${styles.tone_mcp}`} style={{ left: "34%", top: "48%" }}>3</span>
          </div>
        </div>

        <ul className={styles.findingList}>
          {rows.map((row, index) => (
            <li key={row.issue} className={styles.findingRow}>
              <span className={styles.findingHead}>
                <span className={`${styles.miniDot} ${styles[`tone_${row.tone}`]}`}>{index + 1}</span>
                <span className={styles.findingSource}>{row.source}</span>
              </span>
              <span className={styles.findingIssue}>{row.issue}</span>
              <span className={styles.findingActions}>
                <span className={row.state === "accept" ? styles.chipOn : styles.chip}>
                  {row.state === "accept" ? "✓ Accepted" : "Accept"}
                </span>
                <span className={styles.chip}>Reject</span>
                <span className={row.state === "assign" ? styles.chipOn : styles.chip}>
                  {row.state === "assign" ? "→ Sam" : "Assign"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** At handoff: one link, no login, the client approves on the page. */
export function HandoffVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.handoff}>
        <div className={styles.shareBar}>
          <span className={styles.shareIcon}>🔗</span>
          <span className={styles.shareUrl}>review.brightsmile.com</span>
          <span className={styles.noLogin}>No login</span>
        </div>

        <div className={styles.reviewCard}>
          <div className={styles.reviewHead}>
            <span>
              <span className={styles.reviewEyebrow}>Handoff review</span>
              <span className={styles.reviewTitle}>{CLIENT}</span>
            </span>
            <span className={styles.agencyMark}>{AGENCY}</span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.stat}>
              <b>42</b>Found
            </span>
            <span className={styles.stat}>
              <b>42</b>Fixed
            </span>
            <span className={styles.stat}>
              <b>0</b>Open
            </span>
          </div>

          <div className={styles.suggestion}>
            <span className={styles.avatar}>D</span>
            <span>
              <span className={styles.suggestionWho}>Dana suggested an edit</span>
              <span className={styles.suggestionText}>
                <s>Book now</s> → Book a visit
              </span>
            </span>
          </div>

          <div className={styles.approve}>
            <span className={styles.approveIdle}>Approve site</span>
            <span className={styles.approveDone}>✓ Approved by Dana</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** After launch: reruns on change and weekly, fixes confirmed by rescan. */
export function AfterLaunchVisual() {
  const events = [
    { tone: "bad", when: "Mon 9:14", what: "/pricing changed", note: "2 checks failed" },
    { tone: "good", when: "Mon 11:40", what: "Fix pushed", note: "Rescan passed · resolved" },
    { tone: "good", when: "Wed 3:02", what: "/blog/new-post published", note: "All checks passed" },
    { tone: "info", when: "Fri 6:00", what: "Weekly full run", note: "1,420 checks · score 98" },
  ] as const;

  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.timelineWrap}>
        <ol className={styles.timeline}>
          {events.map((event) => (
            <li key={event.when} className={styles.timelineItem}>
              <span className={`${styles.timelineDot} ${styles[`dot_${event.tone}`]}`} />
              <span className={styles.timelineWhen}>{event.when}</span>
              <span className={styles.timelineWhat}>{event.what}</span>
              <span className={`${styles.timelineNote} ${styles[`note_${event.tone}`]}`}>{event.note}</span>
            </li>
          ))}
        </ol>
        <div className={styles.reportSent}>
          <span className={styles.reportSentIcon}>✉</span>
          Weekly report sent to {CLIENT}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- what you get */

const START_CLASS: Readonly<Record<AgentStart, string>> = {
  "first-scan": styles.agentOn,
  "one-click": styles.agentClick,
  upload: styles.agentUpload,
};

export function AgentsVisual() {
  return (
    <div className={styles.square} aria-hidden="true">
      <ul className={styles.agentGrid}>
        {AGENTS.map((agent) => (
          <li key={agent.name} className={`${styles.agentChip} ${START_CLASS[agent.start]}`}>
            <span className={styles.agentDot} />
            {agent.name}
          </li>
        ))}
      </ul>
      <div className={styles.agentLegend}>
        {(Object.keys(AGENT_START_LABELS) as AgentStart[]).map((start) => (
          <span key={start} className={`${styles.legendItem} ${START_CLASS[start]}`}>
            <span className={styles.agentDot} />
            {AGENT_START_LABELS[start]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ReportVisual() {
  return (
    <div className={styles.square} aria-hidden="true">
      <div className={styles.miniReport}>
        <span className={styles.agencyMark}>{AGENCY}</span>
        <span className={styles.miniReportTitle}>Weekly QA report</span>
        <span className={styles.miniReportClient}>{CLIENT}</span>
        <span className={styles.scoreBig}>
          98<small>/100</small>
        </span>
        <span className={styles.miniStats}>
          <span>
            <b>12</b> pages changed
          </span>
          <span>
            <b>1,420</b> checks run
          </span>
          <span>
            <b>3</b> issues fixed
          </span>
        </span>
        <span className={styles.shareButton}>Share with client</span>
      </div>
    </div>
  );
}

export function MonitoringVisual() {
  // Score per day for two weeks: dips when a page changes, back up after a fix.
  const scores = [96, 96, 97, 91, 97, 97, 98, 98, 94, 98, 98, 98, 99, 98];
  const max = 100;
  const min = 85;
  const points = scores
    .map((score, index) => {
      const x = (index / (scores.length - 1)) * 200;
      const y = 60 - ((score - min) / (max - min)) * 56;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className={styles.square} aria-hidden="true">
      <div className={styles.monitor}>
        <span className={styles.monitorHead}>
          <span className={styles.liveDot} />
          Checking {CLIENT}
        </span>
        <svg className={styles.spark} viewBox="0 0 200 64" preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke="#1a78e0" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <ul className={styles.monitorRows}>
          <li>
            <span>On every change</span>
            <b>Rerun</b>
          </li>
          <li>
            <span>Every week</span>
            <b>Full run</b>
          </li>
          <li>
            <span>Last run</span>
            <b>8 min ago</b>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function AccessibilityVisual() {
  const rows = [
    { group: "Easier to read", detail: "Contrast fixed on 6 pages", ok: true },
    { group: "Easier to use without a mouse", detail: "Focus shows on every form", ok: true },
    { group: "Images described", detail: "3 images need alt text", ok: false },
  ];
  return (
    <div className={styles.square} aria-hidden="true">
      <div className={styles.a11y}>
        <span className={styles.levels}>
          <span>A</span>
          <span className={styles.levelOn}>AA</span>
          <span>AAA</span>
        </span>
        <ul className={styles.a11yRows}>
          {rows.map((row) => (
            <li key={row.group}>
              <span className={row.ok ? styles.okMark : styles.failMark}>{row.ok ? "✓" : "!"}</span>
              <span>
                <b>{row.group}</b>
                <span>{row.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function McpVisual() {
  return (
    <div className={styles.square} aria-hidden="true">
      <div className={styles.terminal}>
        <span className={styles.termBar}>
          <i />
          <i />
          <i />
          <span>Claude Code</span>
        </span>
        <span className={styles.termLine}>
          <span className={styles.termPrompt}>›</span> fix open issues on /pricing
        </span>
        <span className={styles.termLine}>
          <span className={styles.termTool}>superflow.query</span> 3 open
        </span>
        <span className={styles.termLine}>
          <span className={styles.termDim}>editing</span> pricing.tsx
        </span>
        <span className={styles.termLine}>
          <span className={styles.termTool}>superflow.resolve</span> rescan
        </span>
        <span className={`${styles.termLine} ${styles.termOk}`}>✓ 3 checks pass. Resolved.</span>
      </div>
    </div>
  );
}

export function FigmaVisual() {
  return (
    <div className={styles.square} aria-hidden="true">
      <div className={styles.figma}>
        <div className={`${styles.frameBox} ${styles.frameDesign}`}>
          <span className={styles.frameLabel}>Figma</span>
          <span className={styles.skelTitle} />
          <span className={styles.skelLine} />
          <span className={styles.skelButton} />
        </div>
        <div className={`${styles.frameBox} ${styles.frameBuilt}`}>
          <span className={styles.frameLabel}>Live</span>
          <span className={styles.skelTitle} />
          <span className={styles.skelLine} />
          <span className={`${styles.skelButton} ${styles.skelButtonOff}`} />
          <span className={styles.measure}>32px in design · 24px live</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ report */

export function ClientReportVisual() {
  const counts = [
    { label: "Found", value: 5 },
    { label: "Fixed", value: 3 },
    { label: "Confirmed", value: 3 },
    { label: "Open", value: 2 },
  ];
  const better = [
    { what: "Easier to read", where: "Contrast fixed on 6 pages" },
    { what: "Easier to use without a mouse", where: "Booking form" },
    { what: "Links work", where: "4 dead links fixed in the footer" },
  ];

  return (
    <div className={styles.report} aria-hidden="true">
      <div className={styles.reportTop}>
        <span className={styles.agencyMarkLarge}>{AGENCY}</span>
        <span className={styles.reportMeta}>
          Weekly QA report · {CLIENT} · Oct 12 to 18
        </span>
      </div>

      <div className={styles.reportNumbers}>
        <div className={styles.reportScore}>
          <span className={styles.reportLabel}>Site score</span>
          <span className={styles.reportScoreValue}>
            98<small>/100</small>
          </span>
          <span className={styles.trendUp}>▲ 4 since last week</span>
        </div>
        <div className={styles.reportWork}>
          <span className={styles.reportLabel}>Work done this week</span>
          <span className={styles.workRow}>
            <span>
              <b>12</b>pages changed
            </span>
            <span>
              <b>1,420</b>checks run
            </span>
            <span>
              <b>3</b>issues fixed
            </span>
          </span>
        </div>
      </div>

      <div className={styles.countRow}>
        {counts.map((count) => (
          <span key={count.label} className={styles.count}>
            <b>{count.value}</b>
            {count.label}
          </span>
        ))}
      </div>

      <div className={styles.reportBody}>
        <div className={styles.betterList}>
          <span className={styles.reportLabel}>What got better</span>
          {better.map((row) => (
            <span key={row.what} className={styles.betterRow}>
              <span className={styles.okMark}>✓</span>
              <span>
                <b>{row.what}</b>
                <span>{row.where}</span>
              </span>
            </span>
          ))}
        </div>
        <div className={styles.beforeAfter}>
          <span className={styles.reportLabel}>Before and after</span>
          <span className={styles.baPair}>
            <span className={`${styles.baShot} ${styles.baBefore}`}>
              <i />
              <i />
              <em>Before</em>
            </span>
            <span className={`${styles.baShot} ${styles.baAfter}`}>
              <i />
              <i />
              <em>After</em>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
