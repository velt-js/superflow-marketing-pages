import styles from "./HeroAgentsArtifact.module.css";

/**
 * Hero visual for /new-home-2026: agents pin findings on a client page, then a
 * person accepts one, rejects one, and leaves a comment of their own.
 *
 * Pure CSS: every element runs its own keyframes on one shared 16s loop, so it
 * renders on the server and needs no client JS. Under reduced motion the
 * animations are off and the end state shows (see the module's base styles).
 * Authored at a fixed 1120x500 stage that steps down with container queries.
 */

type Finding = {
  key: string;
  agent: string;
  issue: string;
  tone: "link" | "proof" | "consistency" | "mobile";
};

const FINDINGS: readonly Finding[] = [
  { key: "f1", agent: "Link Checker", issue: "“Book a visit” goes to a 404", tone: "link" },
  { key: "f2", agent: "Proofreader", issue: "Typo: “familly”", tone: "proof" },
  { key: "f3", agent: "Consistency Checker", issue: "Button color differs from homepage", tone: "consistency" },
  { key: "f4", agent: "Mobile Inspector", issue: "Button clipped at 375px", tone: "mobile" },
];

/** Small round agent mark used on pins and in the feed. */
function AgentDot({ tone, label }: { tone: Finding["tone"]; label: string }) {
  return (
    <span className={`${styles.dot} ${styles[`tone_${tone}`]}`} aria-hidden="true">
      {label}
    </span>
  );
}

function CursorGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 3l14 7.5-6.2 1.6L10 18.5z"
        fill="#111111"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroAgentsArtifact() {
  return (
    <div className={styles.root}>
      <div
        className={styles.frame}
        role="img"
        aria-label="QA agents pin four issues on a client page. A project manager accepts one, rejects one, and adds a comment."
      >
        <div className={styles.stage} aria-hidden="true">
          {/* ----------------------------------------------- browser */}
          <div className={styles.browser}>
            <div className={styles.chrome}>
              <span className={styles.lights}>
                <i />
                <i />
                <i />
              </span>
              <span className={styles.address}>
                <span className={styles.stagingTag}>Staging</span>
                brightsmile-dental.com
              </span>
              <span className={styles.agentsRunning}>
                <span className={styles.pulse} />6 agents running
              </span>
            </div>

            <div className={styles.page}>
              <div className={styles.siteNav}>
                <span className={styles.siteLogo}>Bright Smile</span>
                <span className={styles.siteLinks}>
                  <span>Services</span>
                  <span>Team</span>
                  <span>Pricing</span>
                </span>
              </div>

              <div className={styles.siteHeadline}>
                Gentle care for
                <br />
                the whole <span className={styles.typo}>familly</span>
              </div>
              <div className={styles.siteSub}>Family dentistry in Austin since 2009.</div>
              <div className={styles.ctaPrimary}>Book a visit</div>
              <div className={styles.ctaSecondary}>Our services</div>

              <div className={styles.photo}>
                <span className={styles.photoSun} />
                <span className={styles.photoHill} />
              </div>

              <div className={styles.cards}>
                {["Cleanings", "Whitening", "Implants"].map((title, index) => (
                  <div key={title} className={styles.card}>
                    <span className={styles.cardTitle}>{title}</span>
                    <span className={styles.cardLine} />
                    <span
                      className={`${styles.cardButton} ${
                        index === 2 ? styles.cardButtonClipped : ""
                      }`}
                    >
                      Learn more
                    </span>
                  </div>
                ))}
              </div>

              {/* Agent pins */}
              <span className={`${styles.pin} ${styles.pin1}`}>
                <AgentDot tone="link" label="1" />
                <span className={`${styles.pinDone} ${styles.pinAccepted}`}>✓</span>
              </span>
              <span className={`${styles.pin} ${styles.pin2}`}>
                <AgentDot tone="proof" label="2" />
              </span>
              <span className={`${styles.pin} ${styles.pin3}`}>
                <AgentDot tone="consistency" label="3" />
                <span className={`${styles.pinDone} ${styles.pinRejected}`}>✕</span>
              </span>
              <span className={`${styles.pin} ${styles.pin4}`}>
                <AgentDot tone="mobile" label="4" />
              </span>

              {/* Popover on pin 1: accepted and assigned */}
              <div className={`${styles.popover} ${styles.popA}`}>
                <span className={styles.popAgent}>
                  <AgentDot tone="link" label="1" /> Link Checker
                </span>
                <span className={styles.popIssue}>“Book a visit” goes to a 404</span>
                <span className={`${styles.popActions} ${styles.actionsA}`}>
                  <span className={`${styles.btn} ${styles.btnAccept} ${styles.pressA}`}>Accept</span>
                  <span className={styles.btn}>Reject</span>
                  <span className={styles.btn}>Assign</span>
                </span>
                <span className={`${styles.popStatus} ${styles.statusA}`}>
                  ✓ Accepted · Assigned to Sam
                </span>
              </div>

              {/* Popover on pin 3: rejected with a reason */}
              <div className={`${styles.popover} ${styles.popB}`}>
                <span className={styles.popAgent}>
                  <AgentDot tone="consistency" label="3" /> Consistency Checker
                </span>
                <span className={styles.popIssue}>Button color differs from homepage</span>
                <span className={`${styles.popActions} ${styles.actionsB}`}>
                  <span className={`${styles.btn} ${styles.btnAccept}`}>Accept</span>
                  <span className={`${styles.btn} ${styles.pressB}`}>Reject</span>
                  <span className={styles.btn}>Assign</span>
                </span>
                <span className={`${styles.popStatus} ${styles.popStatusMuted} ${styles.statusB}`}>
                  ✕ Rejected · On purpose for this campaign
                </span>
              </div>

              {/* Human comment */}
              <span className={styles.humanPin}>P</span>
              <div className={styles.humanBubble}>
                <span className={styles.humanName}>Priya · PM</span>
                Swap in the new team photo here.
              </div>

              <span className={styles.cursor}>
                <CursorGlyph />
                <span className={styles.cursorTag}>Priya</span>
              </span>
            </div>
          </div>

          {/* ----------------------------------------------- feed */}
          <div className={styles.feed}>
            <div className={styles.feedHeader}>
              <span>Findings</span>
              <span className={styles.feedCount}>Your team decides</span>
            </div>
            <ul className={styles.feedList}>
              {FINDINGS.map((finding, index) => (
                <li key={finding.key} className={`${styles.feedItem} ${styles[`feed${index + 1}`]}`}>
                  <AgentDot tone={finding.tone} label={String(index + 1)} />
                  <span className={styles.feedText}>
                    <span className={styles.feedAgent}>{finding.agent}</span>
                    <span className={styles.feedIssue}>{finding.issue}</span>
                  </span>
                </li>
              ))}
              <li className={`${styles.feedItem} ${styles.feedHuman} ${styles.feed5}`}>
                <span className={`${styles.dot} ${styles.dotOk}`}>✓</span>
                <span className={styles.feedText}>
                  <span className={styles.feedAgent}>Priya accepted #1</span>
                  <span className={styles.feedIssue}>Assigned to Sam</span>
                </span>
              </li>
              <li className={`${styles.feedItem} ${styles.feedHuman} ${styles.feed6}`}>
                <span className={`${styles.dot} ${styles.dotNo}`}>✕</span>
                <span className={styles.feedText}>
                  <span className={styles.feedAgent}>Priya rejected #3</span>
                  <span className={styles.feedIssue}>On purpose for this campaign</span>
                </span>
              </li>
              <li className={`${styles.feedItem} ${styles.feedHuman} ${styles.feed7}`}>
                <span className={`${styles.dot} ${styles.dotHuman}`}>P</span>
                <span className={styles.feedText}>
                  <span className={styles.feedAgent}>Priya commented</span>
                  <span className={styles.feedIssue}>Swap in the new team photo here.</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
