"use client";

import { useState, type CSSProperties } from "react";
import styles from "./FeatureSet.module.css";
import { FeatureSetIcon, type FeatureSetIconName } from "./FeatureSetIcons";
import {
  FeatureSetAgentGalleryMock,
  FeatureSetWorkflowMock,
} from "./FeatureSetMocks";

const FEATURES_LABEL = "Features that help";

/** App-window mock variants available to a block, keyed by config name. */
const MOCKS = {
  "agent-gallery": FeatureSetAgentGalleryMock,
  workflow: FeatureSetWorkflowMock,
} as const;

/** Name of an app-window mock a block can show inside its white screen. */
export type FeatureSetMockName = keyof typeof MOCKS;

/** A selectable tab on a block's app window. */
export interface FeatureSetTab {
  label: string;
  icon: FeatureSetIconName;
  /** Primary statement line shown in the window header for this view. */
  oneLiner: string;
  /** "Without it…" line naming what you lose without this view. */
  loss: string;
  /** Destination for the "Features that help" arrow link (defaults to "#"). */
  href?: string;
  /**
   * When true, the entry appears in the "Features that help" list only — it
   * gets no window tab and does not swap the app window on hover (it is just a
   * link to its own page).
   */
  listOnly?: boolean;
  /**
   * When true, activating this tab collapses the first tab down to icon-only
   * (its label is hidden) to make room in the strip.
   */
  collapsesFirstTab?: boolean;
}

/** Fallback destination when a tab has no dedicated feature page yet. */
const FEATURE_LINK_FALLBACK = "#";

/** Config describing one feature block. */
export interface FeatureSetBlockData {
  id: string;
  /** Brand accent colour (hex); the window frame is this mixed 30% into black. */
  accent: string;
  /** Very light background wash (rgba) layered over the card gradient. */
  tint: string;
  icon: FeatureSetIconName;
  title: string;
  description: string;
  /**
   * All window tabs in order; the first is active by default. These also power
   * the "Features that help" list on the left — hovering a row activates the
   * matching tab, and its arrow links through to that feature's page.
   */
  tabs: FeatureSetTab[];
  /** Index of the initially active tab (defaults to 0). */
  initialTabIndex?: number;
  /** Which app-window mock to render inside the white screen. */
  mock: FeatureSetMockName;
}

interface FeatureSetBlockProps {
  data: FeatureSetBlockData;
}

/** CSS custom properties carrying the per-block accent + tint into the module. */
interface FeatureSetBlockStyle extends CSSProperties {
  "--feature-accent": string;
  "--feature-tint": string;
}

/**
 * Renders one feature block: a text column (icon, heading, description and a
 * "features that help" list) beside a browser-style tabbed app window. The
 * dark active tab merges seamlessly into the window frame; when a non-first
 * tab is selected it sits raised between the light tabs with concave flares
 * on both sides, and the window's top-left corner rounds itself since the
 * active tab no longer occupies it. Tabs are clickable (visual state only —
 * the window mock is shared across tabs). Every per-block variation flows
 * through the config object, so each block is one instance of this component.
 *
 * @param props - The block configuration to render.
 */
export default function FeatureSetBlock({ data }: FeatureSetBlockProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(data?.initialTabIndex ?? 0);

  const blockStyle: FeatureSetBlockStyle = {
    "--feature-accent": data?.accent,
    "--feature-tint": data?.tint,
  };

  const MockContent = MOCKS[data?.mock] ?? FeatureSetWorkflowMock;

  const activeTab = data?.tabs?.[activeTabIndex];

  // The active tab can ask the first tab to shrink to icon-only (e.g. Live),
  // freeing horizontal room in the strip.
  const collapseFirstTab = Boolean(activeTab?.collapsesFirstTab);

  const windowClass =
    activeTabIndex === 0
      ? styles.panelWindow
      : `${styles.panelWindow} ${styles.panelWindowRounded}`;

  return (
    <article className={styles.block} style={blockStyle}>
      <div className={styles.blockText}>
        <span className={styles.blockIcon}>
          <FeatureSetIcon name={data?.icon} size={48} />
        </span>
        <h3 className={styles.blockTitle}>{data?.title}</h3>
        <p className={styles.blockDescription}>{data?.description}</p>

        <div className={styles.blockFeatures}>
          <p className={styles.blockFeaturesLabel}>{FEATURES_LABEL}</p>
          <ul className={styles.blockFeatureList}>
            {data?.tabs?.map((tab, tabIndex) => {
              const isActive = !tab.listOnly && tabIndex === activeTabIndex;
              const linkClass = isActive
                ? `${styles.featureLink} ${styles.featureLinkActive}`
                : styles.featureLink;
              // List-only entries don't own a window view, so hovering them
              // shouldn't swap the panel — they're just links.
              const activateTab = tab.listOnly
                ? undefined
                : () => setActiveTabIndex(tabIndex);

              return (
                <li key={tab.label} className={styles.blockFeatureItem}>
                  <a
                    className={linkClass}
                    href={tab.href ?? FEATURE_LINK_FALLBACK}
                    onMouseEnter={activateTab}
                    onFocus={activateTab}
                  >
                    <span className={styles.featureIcon}>
                      <FeatureSetIcon name={tab.icon} size={18} />
                    </span>
                    <span className={styles.featureLabel}>{tab.label}</span>
                    <span className={styles.featureArrow} aria-hidden="true">
                      <FeatureSetIcon name="arrow-right" size={18} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTabs} role="tablist">
          {data?.tabs?.map((tab, tabIndex) => {
            if (tab.listOnly) {
              return null;
            }
            const isActive = tabIndex === activeTabIndex;
            // First tab drops its label when the active tab requests the room.
            const iconOnly = collapseFirstTab && tabIndex === 0 && !isActive;
            const activeClass =
              tabIndex === 0
                ? styles.panelTabActive
                : `${styles.panelTabActive} ${styles.panelTabActiveRaised}`;
            const inactiveClass = iconOnly
              ? `${styles.panelTab} ${styles.panelTabIconOnly}`
              : styles.panelTab;

            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={iconOnly ? tab.label : undefined}
                title={iconOnly ? tab.label : undefined}
                className={isActive ? activeClass : inactiveClass}
                onClick={() => setActiveTabIndex(tabIndex)}
                onMouseEnter={() => setActiveTabIndex(tabIndex)}
                onFocus={() => setActiveTabIndex(tabIndex)}
              >
                {isActive ? (
                  <span className={styles.panelTabActiveIcon}>
                    <FeatureSetIcon name={tab.icon} size={16} />
                  </span>
                ) : (
                  <FeatureSetIcon name={tab.icon} size={16} />
                )}
                {iconOnly ? null : tab.label}
              </button>
            );
          })}
        </div>

        <div className={windowClass}>
          <div className={styles.panelCaption}>
            {/* Keyed by tab so the line remounts and its entrance replays. */}
            <p
              key={activeTab?.label}
              className={`${styles.panelOneLiner} ${styles.panelSwapIn}`}
            >
              {activeTab?.oneLiner}
            </p>
            {/* Loss line hidden for now; re-enable to show the "Without it…" copy.
            <p className={styles.panelLoss}>{activeTab?.loss}</p>
            */}
          </div>
          <div className={styles.panelScreen}>
            <div
              key={activeTabIndex}
              className={`${styles.panelScreenInner} ${styles.panelSwapIn}`}
            >
              <MockContent />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.blockFade} aria-hidden="true" />
    </article>
  );
}
