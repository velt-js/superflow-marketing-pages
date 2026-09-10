"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import AgentCard from "@/components/shared-2026/AgentCard";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  AGENT_CATEGORIES,
  AGENT_CATEGORY_LABELS,
  AGENT_LIBRARY,
  type AgentCategory,
} from "@/lib/solutions/agent-library";
import styles from "./AgentsCatchSection.module.css";

/** Accessible name of the tab strip. */
const TABLIST_LABEL = "Agent categories";

/** Props for {@link AgentsCatchTabs}. */
export interface AgentsCatchTabsProps {
  /** Page identifier attached to the tab and card analytics events. */
  page: string;
}

/**
 * The tab strip of the "What your agents catch" section: one tab for each of
 * the eight shared agent categories, in library order, and one panel of four
 * {@link AgentCard}s under it. Every panel is server rendered and hidden
 * until its tab is active, so all thirty-two findings are in the HTML.
 *
 * Follows the WAI-ARIA tabs pattern: `role="tablist"` / `tab` / `tabpanel`,
 * `aria-selected`, a roving tab stop, and Left / Right / Home / End keys that
 * move and select. Selecting a tab (by click or key) fires
 * `home_agent_tab_clicked` with the category and page.
 *
 * On narrow screens the strip scrolls sideways inside its own container and
 * the cards stack (see the module CSS).
 *
 * @param props - The page the tabs render on.
 * @returns The tab strip and its panels.
 */
export default function AgentsCatchTabs({ page }: AgentsCatchTabsProps): ReactNode {
  const [activeCategory, setActiveCategory] = useState<AgentCategory>(
    AGENT_CATEGORIES[0],
  );
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { trackEvent } = useAnalytics();

  /**
   * Build the DOM id of a category's tab.
   *
   * @param category - The category.
   * @returns The id.
   */
  function tabId(category: AgentCategory): string {
    return `${baseId}-tab-${category}`;
  }

  /**
   * Build the DOM id of a category's panel.
   *
   * @param category - The category.
   * @returns The id.
   */
  function panelId(category: AgentCategory): string {
    return `${baseId}-panel-${category}`;
  }

  /**
   * Select a category, optionally moving keyboard focus to its tab, and
   * report the selection.
   *
   * @param category - The category to show.
   * @param moveFocus - Whether to focus the tab (keyboard navigation).
   */
  function activate(category: AgentCategory, moveFocus: boolean) {
    try {
      setActiveCategory(category);
      if (moveFocus) {
        tabRefs.current[AGENT_CATEGORIES.indexOf(category)]?.focus();
      }
      trackEvent(AnalyticsEvents.HOME_AGENT_TAB_CLICKED, { category, page });
    } catch {
      setActiveCategory(category);
    }
  }

  /**
   * Arrow / Home / End navigation across the strip. Selection follows focus.
   *
   * @param event - The key event from a tab.
   * @param index - Index of the tab that received the key.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = AGENT_CATEGORIES.length;
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % count;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + count) % count;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const next = AGENT_CATEGORIES[nextIndex];
    if (next) {
      activate(next, true);
    }
  }

  return (
    <div className={styles.tabs}>
      <div className={styles.tabsScroller}>
        <div className={styles.tablist} role="tablist" aria-label={TABLIST_LABEL}>
          {AGENT_CATEGORIES.map((category, index) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={tabId(category)}
                aria-selected={isActive}
                aria-controls={panelId(category)}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => activate(category, false)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {AGENT_CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
      </div>

      {AGENT_CATEGORIES.map((category) => {
        const isActive = category === activeCategory;
        return (
          <div
            key={category}
            role="tabpanel"
            id={panelId(category)}
            aria-labelledby={tabId(category)}
            hidden={!isActive}
            className={styles.panel}
          >
            <ul className={styles.cards}>
              {AGENT_LIBRARY[category].map((agent) => (
                <li key={agent.name} className={styles.cardCell}>
                  <AgentCard
                    name={agent.name}
                    checks={agent.checks}
                    finding={agent.finding}
                    page={page}
                    className={styles.card}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
