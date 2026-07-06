import type { CSSProperties } from "react";
import styles from "./FeatureSet.module.css";
import { FeatureSetIcon } from "./FeatureSetIcons";

const WORKFLOW_TITLE = "New Website Workflow";
const SKELETON_CARD_COUNT = 7;

/** Colored check pills on the workflow canvas, straight from Figma. */
const WORKFLOW_CHECKS = [
  { label: "Performance Check", color: "#ff5744", icon: "brand-speedtest", top: 121 },
  { label: "Grammar & Spell Check", color: "#3555dd", icon: "ballpen", top: 183 },
  { label: "Broken Link Check", color: "#038e31", icon: "link", top: 245 },
  { label: "SEO Best Practices", color: "#b26d0a", icon: "code-asterisk", top: 304 },
] as const;

/**
 * Dashed branch curves fanning from the "New Update" node (y=103 in the SVG's
 * local space) to each check pill's vertical centre (10 / 72 / 134 / 193).
 */
const BRANCH_PATHS = [
  "M0 103 C 60 103, 70 10, 136 10",
  "M0 103 C 60 103, 70 72, 136 72",
  "M0 103 C 60 103, 70 134, 136 134",
  "M0 103 C 60 103, 70 193, 136 193",
];

/** Small multi-coloured product logo shown at the top of the mock sidebar. */
function WorkflowLogo() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true" focusable="false">
      <circle cx="5" cy="4.5" r="3" fill="#ff5744" />
      <circle cx="13" cy="4.5" r="3" fill="#4093ee" />
      <circle cx="5" cy="11.5" r="3" fill="#ffb02e" />
      <circle cx="13" cy="11.5" r="3" fill="#109534" />
    </svg>
  );
}

/**
 * The "New Website Workflow" app mock used by the Pinned Comments,
 * Guest & Private and Custom Statuses blocks: icon sidebar, workflow header
 * with Share / Run Workflow actions, and a dot-grid canvas with connected
 * workflow nodes. Reproduced in CSS + inline SVG per the Figma design; the
 * right-hand portion is intentionally clipped by the card edge.
 */
export function FeatureSetWorkflowMock() {
  return (
    <div className={styles.wfScreen}>
      <div className={styles.wfSidebar}>
        <span className={styles.wfSidebarItem}>
          <WorkflowLogo />
        </span>
        <span className={styles.wfSidebarItem}>
          <FeatureSetIcon name="layout-sidebar-left-expand" size={18} />
        </span>
        <span className={styles.wfSidebarItem}>
          <FeatureSetIcon name="layout-dashboard" size={18} />
        </span>
        <span className={`${styles.wfSidebarItem} ${styles.wfSidebarItemActive}`}>
          <FeatureSetIcon name="grain" size={18} />
        </span>
        <span className={styles.wfSidebarItem}>
          <FeatureSetIcon name="settings" size={18} />
        </span>
      </div>

      <div className={styles.wfMain}>
        <div className={styles.wfHeader}>
          <div>
            <p className={styles.wfTitle}>{WORKFLOW_TITLE}</p>
            <p className={styles.wfMeta}>
              <span className={styles.wfMetaStrong}>Mike</span>
              {" triggered "}
              <span className={styles.wfMetaStrong}>2m</span>
              {" ago"}
            </p>
          </div>
          <div className={styles.wfActions}>
            <span className={`${styles.wfButton} ${styles.wfButtonGhost}`}>
              <FeatureSetIcon name="share" size={16} />
              Share
            </span>
            <span className={`${styles.wfButton} ${styles.wfButtonDark}`}>
              <FeatureSetIcon name="bolt" size={16} />
              Run Workflow
            </span>
          </div>
        </div>

        <div className={styles.wfCanvas}>
          <span className={`${styles.wfNode} ${styles.wfNodeDark}`}>
            <span className={styles.wfNodeGlobe}>
              <FeatureSetIcon name="bolt" size={12} />
            </span>
            your-site
            <span className={styles.wfNodeDomainSuffix}>.com</span>
          </span>

          <span className={styles.wfConnector} aria-hidden="true" />

          <span className={`${styles.wfNode} ${styles.wfNodeLight}`}>
            <FeatureSetIcon name="bolt" size={20} />
            New Update
          </span>

          <svg
            className={styles.wfBranch}
            width="136"
            height="210"
            viewBox="0 0 136 210"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            {BRANCH_PATHS.map((definition) => (
              <path
                key={definition}
                d={definition}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {WORKFLOW_CHECKS.map((check) => (
            <span
              key={check.label}
              className={styles.wfCheck}
              style={{ top: check.top, "--wf-check-color": check.color } as CSSProperties}
            >
              <FeatureSetIcon name={check.icon} size={20} />
              {check.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A skeleton agent card: light-gray rounded bars matching the Figma layout. */
function AgentSkeletonCard() {
  return (
    <div className={`${styles.agCard} ${styles.agSkeleton}`} aria-hidden="true">
      <div className={styles.agCardTop}>
        <span className={`${styles.agSkelShape} ${styles.agSkelIcon}`} />
        <div className={styles.agCardText}>
          <div className={`${styles.agSkelShape} ${styles.agSkelTitle}`} />
          <div className={`${styles.agSkelShape} ${styles.agSkelSub}`} />
        </div>
        <span className={`${styles.agSkelShape} ${styles.agSkelKebab}`} />
      </div>
      <div className={styles.agCardFooter}>
        <div className={styles.agMeta}>
          <span className={`${styles.agSkelShape} ${styles.agSkelBarShort}`} />
          <span className={`${styles.agSkelShape} ${styles.agSkelBarLong}`} />
        </div>
        <div className={styles.agActions}>
          <span className={`${styles.agSkelShape} ${styles.agSkelCircle}`} />
          <span className={`${styles.agSkelShape} ${styles.agSkelCircle}`} />
        </div>
      </div>
    </div>
  );
}

/**
 * The AI-agent gallery mock used by the "AI Review Agent" block: a fully
 * rendered "Spell Check" agent card followed by skeleton placeholder cards,
 * laid out on the same two-column grid as the Figma design (the second
 * column bleeds off the card edge).
 */
export function FeatureSetAgentGalleryMock() {
  return (
    <div className={styles.agGrid}>
      <div className={styles.agCard}>
        <div className={styles.agCardTop}>
          <span className={styles.agIcon}>
            <FeatureSetIcon name="dots-grid" size={28} />
          </span>
          <div className={styles.agCardText}>
            <p className={styles.agCardTitle}>Spell Check</p>
            <p className={styles.agCardSub}>Finds spelling mistakes and typos in …</p>
          </div>
          <span className={styles.agKebab}>
            <FeatureSetIcon name="dots-vertical" size={18} />
          </span>
        </div>
        <div className={styles.agCardFooter}>
          <div className={styles.agMeta}>
            <span className={styles.agMetaItem}>
              <FeatureSetIcon name="refresh" size={14} className={styles.agMetaIconBlue} />
              1d ago
            </span>
            <span className={styles.agMetaItem}>
              <FeatureSetIcon name="sparkles" size={14} className={styles.agMetaIconOrange} />
              Used 23 times
            </span>
          </div>
          <div className={styles.agActions}>
            <span className={`${styles.agCircle} ${styles.agCircleGhost}`}>
              <FeatureSetIcon name="history" size={16} />
            </span>
            <span className={`${styles.agCircle} ${styles.agCircleDark}`}>
              <FeatureSetIcon name="player-play" size={12} />
            </span>
          </div>
        </div>
      </div>

      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <AgentSkeletonCard key={`agent-skeleton-${index}`} />
      ))}
    </div>
  );
}
