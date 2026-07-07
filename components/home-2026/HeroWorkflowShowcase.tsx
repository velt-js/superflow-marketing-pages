"use client";

import Image from "next/image";
import { useState, type ComponentType, type SVGProps } from "react";
import styles from "./Hero.module.css";
import {
  BallpenIcon,
  BoltIcon,
  CodeAsteriskIcon,
  GrainIcon,
  KeyIcon,
  LayoutDashboardIcon,
  LayoutSidebarIcon,
  LinkIcon,
  LockIcon,
  PlugIcon,
  RobotIcon,
  SettingsIcon,
  ShareIcon,
  SpeedtestIcon,
  WandIcon,
} from "./HeroIcons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

/** A capability tab rendered above the product window. */
type ShowcaseTab = {
  id: string;
  label: string;
  Icon: IconComponent;
};

/** A right-hand workflow check node inside the product canvas. */
type WorkflowCheck = {
  label: string;
  Icon: IconComponent;
  className: string;
};

const QA_WORKFLOW_ID = "qa-workflow";

const SHOWCASE_TABS: readonly ShowcaseTab[] = [
  { id: QA_WORKFLOW_ID, label: "Agents at Work", Icon: RobotIcon },
  { id: "agents", label: "Build Agents", Icon: WandIcon },
  { id: "anonymous-login", label: "Guest Mode", Icon: KeyIcon },
  { id: "private-comment", label: "Private Comments", Icon: LockIcon },
  { id: "integrations", label: "Integrations", Icon: PlugIcon },
];

const RAIL_ITEMS: readonly { id: string; Icon: IconComponent; active?: boolean }[] = [
  { id: "sidebar", Icon: LayoutSidebarIcon },
  { id: "dashboard", Icon: LayoutDashboardIcon },
  { id: "flows", Icon: GrainIcon, active: true },
  { id: "settings", Icon: SettingsIcon },
];

const WORKFLOW_CHECKS: readonly WorkflowCheck[] = [
  { label: "Performance", Icon: SpeedtestIcon, className: styles.pillPerf },
  { label: "Grammar and Spelling", Icon: BallpenIcon, className: styles.pillGrammar },
  { label: "Broken Links", Icon: LinkIcon, className: styles.pillBroken },
  { label: "SEO Basics", Icon: CodeAsteriskIcon, className: styles.pillSeo },
];

/** Transparent Superflow logo mark cropped from Figma's raw source sprite. */
const BRAND_MARK_SRC = "/images/home-2026/hero/superflow-mark.png";
const WORKFLOW_TITLE = "New Website Workflow";
const SITE_NAME = "your-site";
const SITE_TLD = ".com";
const UPDATE_LABEL = "New Update";
const SHARE_LABEL = "Share";
const RUN_LABEL = "Run Workflow";

/**
 * Interactive product showcase: a row of capability tabs sitting on top of a
 * mocked "app window" that illustrates a QA workflow. Tabs are selectable and
 * carry hover states; the workflow canvas itself is a lightweight CSS mock
 * (the real product screenshot asset is not yet available).
 */
export default function HeroWorkflowShowcase() {
  const [activeTabId, setActiveTabId] = useState<string>(QA_WORKFLOW_ID);
  const isFirstTabActive = activeTabId === SHOWCASE_TABS[0]?.id;

  /**
   * Mark the given tab as active.
   * @param tabId - Identifier of the tab that was clicked.
   */
  function handleSelectTab(tabId: string) {
    try {
      setActiveTabId(tabId);
    } catch {
      setActiveTabId(QA_WORKFLOW_ID);
    }
  }

  return (
    <div className={styles.showcase}>
      <div
        className={`${styles.tabs} ${isFirstTabActive ? "" : styles.tabsInset}`}
        role="tablist"
        aria-label="Product capabilities"
      >
        {SHOWCASE_TABS.map((tab) => {
          const isActive = tab?.id === activeTabId;
          const TabIcon = tab?.Icon;
          return (
            <button
              key={tab?.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => handleSelectTab(tab?.id)}
              onMouseEnter={() => handleSelectTab(tab?.id)}
              onFocus={() => handleSelectTab(tab?.id)}
            >
              {isActive ? (
                <span className={styles.tabMark}>
                  <TabIcon size={16} />
                </span>
              ) : (
                <TabIcon size={16} />
              )}
              {tab?.label}
            </button>
          );
        })}
      </div>

      <div className={`${styles.window} ${isFirstTabActive ? styles.windowMerged : ""}`}>
        <div className={styles.windowInner}>
          <nav className={styles.rail} aria-label="Workspace navigation">
            <span className={styles.railItem} aria-hidden="true">
              <Image
                className={styles.railMark}
                src={BRAND_MARK_SRC}
                alt=""
                width={18}
                height={17}
              />
            </span>
            {RAIL_ITEMS.map((item) => {
              const RailIcon = item?.Icon;
              return (
                <button
                  key={item?.id}
                  type="button"
                  className={`${styles.railItem} ${
                    item?.active ? styles.railItemActive : ""
                  }`}
                >
                  <RailIcon size={18} />
                </button>
              );
            })}
          </nav>

          <div className={styles.canvasWrap}>
            <header className={styles.windowHeader}>
              <div>
                <h3 className={styles.windowTitle}>{WORKFLOW_TITLE}</h3>
                <p className={styles.windowMeta}>
                  <span className={styles.windowMetaStrong}>Mike</span>
                  {" triggered "}
                  <span className={styles.windowMetaStrong}>2m</span>
                  {" ago"}
                </p>
              </div>
              <div className={styles.windowActions}>
                <button type="button" className={`${styles.actionButton} ${styles.actionShare}`}>
                  <ShareIcon size={16} />
                  {SHARE_LABEL}
                </button>
                <button type="button" className={`${styles.actionButton} ${styles.actionRun}`}>
                  <BoltIcon size={16} />
                  {RUN_LABEL}
                </button>
              </div>
            </header>

            <div className={styles.canvas}>
              <div className={styles.canvasSources}>
                <span className={`${styles.node} ${styles.nodeSite}`}>
                  <BoltIcon size={20} />
                  <span>
                    {SITE_NAME}
                    <span className={styles.nodeSiteTld}>{SITE_TLD}</span>
                  </span>
                </span>
                <span className={styles.connector} aria-hidden="true" />
                <span className={`${styles.node} ${styles.nodeUpdate}`}>
                  <BoltIcon size={20} />
                  {UPDATE_LABEL}
                </span>
              </div>

              <div className={styles.canvasChecks}>
                {WORKFLOW_CHECKS.map((check) => {
                  const CheckPillIcon = check?.Icon;
                  return (
                    <span key={check?.label} className={`${styles.pill} ${check?.className}`}>
                      <CheckPillIcon size={20} />
                      {check?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
