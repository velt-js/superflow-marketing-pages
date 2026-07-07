"use client";

import { useState, type ReactNode } from "react";
import styles from "./HeroBrowserShowcase.module.css";

/** Which page's tab preset the showcase renders. */
export type HeroBrowserVariant = "comments" | "review-agents";

/** Footer treatment rendered inside the pinned comment card per active tab. */
type CommentFooterKind =
  | "reply"
  | "selection"
  | "thread"
  | "context"
  | "resolved";

/** A capability tab and the browser/comment state it drives. */
type BrowserTab = {
  /** Stable identifier used for tab selection + React keys. */
  id: string;
  /** Visible tab label. */
  label: string;
  /** Status appended after the domain in the browser bar, e.g. "element pinned". */
  status: string;
  /** Body copy shown in the pinned comment card. */
  comment: string;
  /** Which footer element renders beneath the comment body. */
  footer: CommentFooterKind;
};

const SITE_DOMAIN = "drlin.com";
const TRY_FREE_LABEL = "Try this free";
const COMMENT_AUTHOR = "Mike";
const COMMENT_TIME = "2m";

/* The "Comments" page preset: pin/select/thread/context/track. Each tab
   re-labels the browser status and swaps the pinned comment's body + footer
   so the window reads as a live pin-a-comment flow. */
const COMMENTS_TABS: readonly BrowserTab[] = [
  {
    id: "pin",
    label: "Pin an element",
    status: "element pinned",
    comment: "This CTA needs more contrast — it's hard to read on mobile.",
    footer: "reply",
  },
  {
    id: "select",
    label: "Select the words",
    status: "text selected",
    comment: "Reword this headline, it reads a little generic.",
    footer: "selection",
  },
  {
    id: "thread",
    label: "Thread it",
    status: "thread started",
    comment: "Agreed. Let's try a punchier verb up top.",
    footer: "thread",
  },
  {
    id: "context",
    label: "Carry the context",
    status: "context attached",
    comment: "Matching the latest Figma frame — attached for reference.",
    footer: "context",
  },
  {
    id: "track",
    label: "Track it",
    status: "marked resolved",
    comment: "Updated the copy and shipped it live.",
    footer: "resolved",
  },
];

/* The "Review Agents" page preset. Same window UI as the comments preset —
   only the tab labels and their browser status / comment copy differ (the
   findings land as comments pinned on the live site). */
const REVIEW_AGENTS_TABS: readonly BrowserTab[] = [
  {
    id: "build",
    label: "Build agents from a checklist",
    status: "checklist → agents",
    comment: "Turned your 42-point QA checklist into a team of agents.",
    footer: "context",
  },
  {
    id: "built-in",
    label: "Built-in checks",
    status: "checks ready",
    comment: "Performance, broken links, grammar and SEO — on by default.",
    footer: "reply",
  },
  {
    id: "findings",
    label: "Findings as comments",
    status: "3 findings posted",
    comment: "Found 3 broken links and 2 slow pages in this section.",
    footer: "thread",
  },
  {
    id: "run",
    label: "Run on demand",
    status: "run triggered",
    comment: "Re-ran every check on the latest deploy.",
    footer: "reply",
  },
  {
    id: "sign-off",
    label: "Human signs off",
    status: "approved",
    comment: "Looks great — approved this page for launch.",
    footer: "resolved",
  },
];

const TAB_PRESETS: Record<HeroBrowserVariant, readonly BrowserTab[]> = {
  comments: COMMENTS_TABS,
  "review-agents": REVIEW_AGENTS_TABS,
};

/**
 * Render the footer element for the pinned comment card based on the active
 * tab. Kept side-effect free so it can be called during render.
 *
 * @param footer - Which footer treatment the active tab requests.
 */
function renderCommentFooter(footer: CommentFooterKind): ReactNode {
  try {
    switch (footer) {
      case "reply":
        return (
          <div className={styles.replyField}>
            <span className={styles.replyPlaceholder}>Reply…</span>
            <span className={styles.replySend} aria-hidden="true">
              <SendGlyph />
            </span>
          </div>
        );
      case "selection":
        return (
          <span className={styles.selectionChip}>
            <span className={styles.selectionMark} aria-hidden="true" />
            “Ship faster with Superflow”
          </span>
        );
      case "thread":
        return (
          <div className={styles.threadReply}>
            <span className={styles.threadAvatar} aria-hidden="true" />
            <span className={styles.threadText}>
              <span className={styles.threadName}>Sam</span> On it ✍️
            </span>
          </div>
        );
      case "context":
        return (
          <span className={styles.contextChip}>
            <span className={styles.contextThumb} aria-hidden="true" />
            QA-Checklist.xlsx
          </span>
        );
      case "resolved":
        return (
          <span className={styles.resolvedBadge}>
            <CheckGlyph />
            Resolved
          </span>
        );
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Props for the browser-window hero showcase. */
export interface HeroBrowserShowcaseProps {
  /** Tab preset to render. Defaults to the Comments page preset. */
  variant?: HeroBrowserVariant;
}

/**
 * A shared hero product showcase: a row of capability tabs over a dark browser
 * window showing a comment pinned onto a live site. Selecting a tab re-labels
 * the browser status and swaps the pinned comment's body + footer.
 *
 * The window UI is identical across pages; only the tab preset differs
 * (`comments` vs `review-agents`). Feature pages opt in via `hero.showcase`.
 * This is a self-contained CSS mock (no product screenshot asset needed).
 *
 * @param props - Selects which tab preset renders.
 */
export default function HeroBrowserShowcase({
  variant = "comments",
}: HeroBrowserShowcaseProps = {}): ReactNode {
  const tabs = TAB_PRESETS[variant] ?? COMMENTS_TABS;
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  /**
   * Mark the given tab as active, falling back to the first tab on error.
   * @param tabId - Identifier of the tab that was activated.
   */
  function handleSelectTab(tabId: string): void {
    try {
      setActiveTabId(tabId);
    } catch {
      setActiveTabId(tabs[0].id);
    }
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.tabs} role="tablist" aria-label="Product capabilities">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => handleSelectTab(tab.id)}
              onMouseEnter={() => handleSelectTab(tab.id)}
              onFocus={() => handleSelectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={styles.window}>
        <div className={styles.bar}>
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.url}>
            {SITE_DOMAIN}
            <span className={styles.urlStatus}>{` · ${activeTab.status}`}</span>
          </span>
          <button type="button" className={styles.tryFree}>
            {TRY_FREE_LABEL}
          </button>
        </div>

        <div className={styles.viewport}>
          <div className={styles.site} aria-hidden="true">
            <div className={styles.siteNav}>
              <span className={styles.siteLogo} />
              <span className={styles.siteLinks}>
                <span />
                <span />
                <span />
              </span>
              <span className={styles.siteCta} />
            </div>
            <div className={styles.siteHero}>
              <div className={styles.siteCopy}>
                <span className={styles.siteHeadline} />
                <span className={`${styles.siteHeadline} ${styles.siteHeadlineShort}`} />
                <span className={styles.siteText} />
                <span className={`${styles.siteText} ${styles.siteTextShort}`} />
                <span
                  className={`${styles.siteButton} ${
                    activeTab.id === tabs[0].id ? styles.siteButtonPinned : ""
                  }`}
                />
              </div>
              <div className={styles.siteArt} />
            </div>
          </div>

          <span className={styles.pin} aria-hidden="true">
            <span className={styles.pinAvatar} />
          </span>

          <article className={styles.card}>
            <header className={styles.cardHead}>
              <span className={styles.cardAvatar} aria-hidden="true" />
              <span className={styles.cardMeta}>
                <span className={styles.cardName}>{COMMENT_AUTHOR}</span>
                <span className={styles.cardTime}>{COMMENT_TIME}</span>
              </span>
            </header>
            <p className={styles.cardBody}>{activeTab.comment}</p>
            <div className={styles.cardFooter}>
              {renderCommentFooter(activeTab.footer)}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

/** Paper-plane send glyph for the reply field. */
function SendGlyph(): ReactNode {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 14l11 -11" />
      <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
    </svg>
  );
}

/** Check glyph for the resolved badge. */
function CheckGlyph(): ReactNode {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12l5 5l9 -9" />
    </svg>
  );
}
