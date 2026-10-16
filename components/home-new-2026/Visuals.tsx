import styles from "./Visuals.module.css";
import { AGENTS } from "./content";
import { AgentIcon, agentColors } from "./AgentIcons";

/*
 * HTML visuals for /new-home-2026: one per stage, one per "What you get" card,
 * plus the full client report. Every visual is decorative (aria-hidden): the
 * heading and line beside it carry the meaning. All sample data belongs to one
 * made-up client, Bright Smile Dental, so the page tells one story.
 *
 * Animations are CSS only. Each element's base style is its END state, so
 * reduced motion (animations off) still shows the finished picture.
 */

const CLIENT = "Bright Smile Dental";
const AGENCY = "Northwind Studio";

function CheckGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function CursorGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="#111111" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ stages */

/** Before handoff: an agent pins one issue on staging; the PM accepts it. */
export function BeforeHandoffVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.browser}>
        <div className={styles.chrome}>
          <span className={styles.stagingTag}>Staging</span>
          <span className={styles.url}>staging.brightsmile.com</span>
        </div>
        <div className={styles.page}>
          <span className={styles.skelTitle} />
          <span className={styles.skelLine} />
          <span className={styles.skelLineShort} />
          <span className={styles.anchor}>
            <span className={styles.skelButton}>Book a visit</span>
            <span className={styles.pin}>
              <span className={styles.pinMark}>
                <AgentIcon name="Link Checker" size={12} />
              </span>
              <span className={styles.pinDone}>
                <CheckGlyph size={8} />
              </span>
            </span>
          </span>
          <span className={styles.skelCards}>
            <i />
            <i />
            <i />
          </span>

          <div className={styles.finding}>
            <span className={styles.findingAgent}>
              <AgentIcon name="Link Checker" size={14} />
              Link Checker
            </span>
            <span className={styles.findingIssue}>Button goes to a 404</span>
            <span className={styles.findingFoot}>
              <span className={styles.findingActions}>
                <span className={`${styles.btn} ${styles.btnDark} ${styles.press}`}>Accept</span>
                <span className={styles.btn}>Reject</span>
                <span className={styles.btn}>Assign</span>
              </span>
              <span className={styles.findingStatus}>
                <CheckGlyph size={10} /> Accepted · assigned to Sam
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** At handoff: one link, no login, the client approves. */
export function HandoffVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.handoff}>
        <div className={styles.handoffHead}>
          <span className={styles.clientMark}>BS</span>
          <span className={styles.handoffTitle}>
            <b>{CLIENT}</b>
            <span>Ready for your review</span>
          </span>
        </div>

        <div className={styles.handoffRow}>
          <span className={styles.okDot}>
            <CheckGlyph size={10} />
          </span>
          42 issues found and fixed
        </div>

        <div className={styles.linkPill}>
          <span>review.brightsmile.com</span>
          <span className={styles.noLogin}>No login</span>
        </div>

        <div className={styles.approve}>
          <span className={styles.approveIdle}>Approve site</span>
          <span className={styles.approveDone}>
            <CheckGlyph size={12} /> Approved by Dana
          </span>
          <span className={styles.handoffCursor}>
            <CursorGlyph />
          </span>
        </div>
      </div>
    </div>
  );
}

/** After launch: findings get fixed, then roll up into the weekly report. */
export function AfterLaunchVisual() {
  const chips = [
    { text: "Broken link", page: "/pricing" },
    { text: "Missing alt text", page: "/team" },
    { text: "Typo", page: "/blog/new-post" },
  ];
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.rollup}>
        <ul className={styles.chips}>
          {chips.map((chip, index) => (
            <li key={chip.text} className={`${styles.chip} ${styles[`chip${index + 1}`]}`}>
              <span className={styles.chipText}>
                <b>{chip.text}</b>
                <span>{chip.page}</span>
              </span>
              <span className={styles.chipState}>
                <span className={`${styles.stateOpen} ${styles[`open${index + 1}`]}`}>Open</span>
                <span className={`${styles.stateFixed} ${styles[`fixed${index + 1}`]}`}>
                  <CheckGlyph size={9} /> Fixed
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.weekly}>
          <span className={styles.agency}>{AGENCY}</span>
          <span className={styles.weeklyTitle}>Weekly report</span>
          <span className={styles.weeklyScore}>
            <span className={styles.scoreOld}>94</span>
            <span className={styles.scoreNew}>98</span>
            <small>/100</small>
          </span>
          <span className={styles.weeklyFixed}>
            <span className={styles.fixedOld}>0</span>
            <span className={styles.fixedNew}>3</span>
            issues fixed
          </span>
          <span className={styles.sent}>
            <CheckGlyph size={10} /> Sent to client
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- what you get */

export function AgentsBenefitVisual() {
  const firstScan = AGENTS.filter((agent) => agent.start === "first-scan");
  const later = AGENTS.filter((agent) => agent.start !== "first-scan");
  const tile = (name: string, muted: boolean) => {
    const { tint } = agentColors(name);
    return (
      <span
        key={name}
        className={muted ? `${styles.tile} ${styles.tileMuted}` : styles.tile}
        style={muted ? undefined : { background: tint }}
      >
        <AgentIcon name={name} size={16} />
      </span>
    );
  };
  return (
    <div className={styles.cardVisual} aria-hidden="true">
      <div className={styles.tiles}>
        <div className={styles.tileRow}>{firstScan.map((agent) => tile(agent.name, false))}</div>
        <div className={styles.tileRow}>{later.map((agent) => tile(agent.name, true))}</div>
      </div>
    </div>
  );
}

export function ReportBenefitVisual() {
  const score = 98;
  const circumference = 2 * Math.PI * 26;
  return (
    <div className={styles.cardVisual} aria-hidden="true">
      <div className={styles.reportCard}>
        <span className={styles.agency}>{AGENCY}</span>
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
                strokeDasharray={`${(circumference * score) / 100} ${circumference}`}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <b>{score}</b>
          </span>
          <span className={styles.reportCardText}>
            <b>Weekly QA report</b>
            <span>{CLIENT}</span>
            <span className={styles.greenText}>3 issues fixed</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function MonitoringBenefitVisual() {
  const scores = [96, 96, 97, 91, 97, 97, 98, 98, 94, 98, 98, 99];
  const points = scores.map((score, index) => {
    const x = (index / (scores.length - 1)) * 200;
    const y = 54 - ((score - 86) / 14) * 46;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return (
    <div className={styles.cardVisual} aria-hidden="true">
      <div className={styles.monitor}>
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
            <linearGradient id="nh-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a78e0" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1a78e0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,60 ${line} 200,60`} fill="url(#nh-spark-fill)" />
          <polyline points={line} fill="none" stroke="#1a78e0" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
          <span className={styles.sparkDot} style={{ top: `${((last[1] / 60) * 100).toFixed(1)}%` }} />
        </span>
        <span className={styles.monitorFoot}>Last check 8 min ago</span>
      </div>
    </div>
  );
}

export function AccessibilityBenefitVisual() {
  return (
    <div className={styles.cardVisual} aria-hidden="true">
      <div className={styles.a11y}>
        <span className={styles.levels}>
          <span>A</span>
          <span className={styles.levelOn}>AA</span>
          <span>AAA</span>
        </span>
        <span className={styles.contrastRow}>
          <span className={styles.swatch}>Aa</span>
          <span className={styles.contrastText}>
            <b>Contrast 4.6 : 1</b>
            <span>Easier to read</span>
          </span>
          <span className={styles.passTag}>Passes</span>
        </span>
      </div>
    </div>
  );
}

export function McpBenefitVisual() {
  return (
    <div className={styles.cardVisual} aria-hidden="true">
      <div className={styles.terminal}>
        <span className={styles.termLine}>
          <span className={styles.termPrompt}>›</span> fix open issues on /pricing
        </span>
        <span className={styles.termLine}>
          <span className={styles.termTool}>superflow</span> 3 open issues
        </span>
        <span className={styles.termLine}>
          <span className={styles.termDim}>editing</span> pricing.tsx
        </span>
        <span className={`${styles.termLine} ${styles.termOk}`}>✓ Rescan passed. 3 resolved.</span>
      </div>
    </div>
  );
}

export function FigmaBenefitVisual() {
  return (
    <div className={styles.cardVisual} aria-hidden="true">
      <div className={styles.figma}>
        <span className={styles.skelTitle} />
        <span className={styles.skelLine} />
        <span className={styles.figmaStage}>
          <span className={styles.designGhost} />
          <span className={styles.builtButton}>Book a visit</span>
          <span className={styles.offset}>8px</span>
        </span>
        <span className={styles.figmaLegend}>
          <span className={styles.legendDesign}>Figma</span>
          <span className={styles.legendLive}>Live</span>
        </span>
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
        <span className={styles.agencyLarge}>{AGENCY}</span>
        <span className={styles.reportMeta}>Weekly QA report · {CLIENT} · Oct 12 to 18</span>
      </div>

      <div className={styles.reportNumbers}>
        <div className={styles.reportBox}>
          <span className={styles.reportLabel}>Site score</span>
          <span className={styles.reportScoreValue}>
            98<small>/100</small>
          </span>
          <span className={styles.greenText}>▲ 4 since last week</span>
        </div>
        <div className={styles.reportBox}>
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
              <span className={styles.okDot}>
                <CheckGlyph size={10} />
              </span>
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
