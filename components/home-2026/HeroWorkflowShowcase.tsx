"use client";

import Image from "next/image";
import { useState, type ComponentType, type SVGProps } from "react";
import styles from "./Hero.module.css";
import {
  BallpenIcon,
  BoltIcon,
  CheckIcon,
  CodeAsteriskIcon,
  GrainIcon,
  KeyIcon,
  LayoutDashboardIcon,
  LayoutSidebarIcon,
  LinkIcon,
  ListCheckIcon,
  LockIcon,
  MessageIcon,
  PinIcon,
  PlugIcon,
  RobotIcon,
  SettingsIcon,
  ShareIcon,
  SpeedtestIcon,
  UserCheckIcon,
  WandIcon,
  resolveHeroTabIcon,
} from "./HeroIcons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

/** A capability tab rendered above the product window. */
type ShowcaseTab = {
  id: string;
  label: string;
  Icon: IconComponent;
};

/**
 * A CMS-authored hero tab. Icons are referenced by their registry `name`
 * (resolved via {@link resolveHeroTabIcon}) rather than a component, so the
 * shape can travel from Sanity.
 */
export type HeroCmsTab = {
  id: string;
  label: string;
  icon: string;
};

/** A right-hand workflow check node inside the product canvas. */
type WorkflowCheck = {
  label: string;
  Icon: IconComponent;
  className: string;
};

const QA_WORKFLOW_ID = "qa-workflow";

/** Selects which per-page tab preset renders above the product window. */
export type HeroWorkflowVariant = "home" | "comments" | "review-agents";

/** Default preset — the /home-preview homepage tabs. Must stay unchanged. */
const HOME_TABS: readonly ShowcaseTab[] = [
  { id: QA_WORKFLOW_ID, label: "Agents at Work", Icon: RobotIcon },
  { id: "agents", label: "Build Agents", Icon: WandIcon },
  { id: "anonymous-login", label: "Guest Mode", Icon: KeyIcon },
  { id: "private-comment", label: "Private Comments", Icon: LockIcon },
  { id: "integrations", label: "Integrations", Icon: PlugIcon },
];

/** Tab preset for the /preview/features/review-agents feature page. */
const REVIEW_AGENTS_TABS: readonly ShowcaseTab[] = [
  { id: "build-from-checklist", label: "Build agents from a checklist", Icon: RobotIcon },
  { id: "built-in-checks", label: "Built-in checks", Icon: CheckIcon },
  { id: "findings-as-comments", label: "Findings as comments", Icon: MessageIcon },
  { id: "run-on-demand", label: "Run on demand", Icon: BoltIcon },
  { id: "human-signs-off", label: "Human signs off", Icon: UserCheckIcon },
];

/** Tab preset for the /preview/features/comments feature page. */
const COMMENTS_TABS: readonly ShowcaseTab[] = [
  { id: "pin-an-element", label: "Pin an element", Icon: PinIcon },
  { id: "select-the-words", label: "Select the words", Icon: BallpenIcon },
  { id: "thread-it", label: "Thread it", Icon: MessageIcon },
  { id: "carry-the-context", label: "Carry the context", Icon: ShareIcon },
  { id: "track-it", label: "Track it", Icon: ListCheckIcon },
];

/** Lookup from page variant to its tab preset. */
const TAB_PRESETS: Readonly<Record<HeroWorkflowVariant, readonly ShowcaseTab[]>> = {
  home: HOME_TABS,
  comments: COMMENTS_TABS,
  "review-agents": REVIEW_AGENTS_TABS,
};

/**
 * Resolve the tab preset for a given page variant, falling back to the home
 * preset when the variant is unknown.
 *
 * @param variant - The requested page variant.
 * @returns The tab list to render above the product window.
 */
function resolveTabs(variant: HeroWorkflowVariant): readonly ShowcaseTab[] {
  try {
    return TAB_PRESETS[variant] ?? HOME_TABS;
  } catch {
    return HOME_TABS;
  }
}

/**
 * Map CMS-authored hero tabs onto the internal {@link ShowcaseTab} shape,
 * resolving each icon name through the registry. Tabs without a label are
 * dropped so a partial CMS entry never renders an empty chip.
 *
 * @param cmsTabs - The tabs authored on the `featurePage.hero.tabs` field.
 * @returns The renderable tab list, or `null` when none are usable.
 */
function toShowcaseTabs(
  cmsTabs: readonly HeroCmsTab[] | null | undefined,
): readonly ShowcaseTab[] | null {
  try {
    if (!cmsTabs || cmsTabs.length === 0) {
      return null;
    }
    const mapped = cmsTabs
      .filter((cmsTab) => Boolean(cmsTab?.label))
      .map((cmsTab, index) => ({
        id: cmsTab?.id ?? `hero-tab-${index}`,
        label: cmsTab.label,
        Icon: resolveHeroTabIcon(cmsTab?.icon),
      }));
    return mapped.length > 0 ? mapped : null;
  } catch {
    return null;
  }
}

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

/** Props for {@link HeroWorkflowShowcase}. */
export interface HeroWorkflowShowcaseProps {
  /**
   * Which per-page tab preset to render above the product window. Only the tab
   * labels/icons change; the window, rail and canvas stay identical. Defaults
   * to "home" (the /home-preview homepage tabs).
   */
  variant?: HeroWorkflowVariant;
  /**
   * CMS-authored tabs. When provided and non-empty, these render above the
   * product window INSTEAD of the `variant` preset; the window, rail and
   * canvas stay identical. Falls back to the `variant` preset when absent.
   */
  tabs?: readonly HeroCmsTab[] | null;
}

/**
 * Interactive product showcase: a row of capability tabs sitting on top of a
 * mocked "app window" that illustrates a QA workflow. Tabs are selectable and
 * carry hover states; the workflow canvas itself is a lightweight CSS mock
 * (the real product screenshot asset is not yet available).
 *
 * @param props - Optional per-page overrides; defaults reproduce the
 *   /home-preview homepage tabs exactly.
 */
export default function HeroWorkflowShowcase({
  variant = "home",
  tabs: cmsTabs,
}: HeroWorkflowShowcaseProps = {}) {
  const tabs = toShowcaseTabs(cmsTabs) ?? resolveTabs(variant);
  const firstTabId = tabs[0]?.id ?? QA_WORKFLOW_ID;
  const [activeTabId, setActiveTabId] = useState<string>(firstTabId);
  const isFirstTabActive = activeTabId === firstTabId;

  /**
   * Mark the given tab as active.
   * @param tabId - Identifier of the tab that was clicked.
   */
  function handleSelectTab(tabId: string) {
    try {
      setActiveTabId(tabId);
    } catch {
      setActiveTabId(firstTabId);
    }
  }

  return (
    <div className={styles.showcase}>
      <div
        className={`${styles.tabs} ${isFirstTabActive ? "" : styles.tabsInset}`}
        role="tablist"
        aria-label="Product capabilities"
      >
        {tabs.map((tab) => {
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
