import type { CSSProperties, ReactElement } from "react";
import {
  formatBugDate,
  categoryColor,
  type BugBookEntryDetail,
  type BugThreadComment,
} from "@/lib/bug-book";
import { SparkleGlyph } from "./Chips";
import styles from "./BugSceneMock.module.css";

// Staged recreation of "the moment": a generic wireframe website in a
// browser frame with the ENTIRE conversation pinned on it in Superflow's
// comment UI - this is the page's one centerpiece, there is no separate
// thread section. Each category gets its own wireframe FLOW (checkout
// steps, pricing tiers, a form, a phone frame) so the scene reads like
// the actual part of the site where the bug happened. Agent entries
// show the structured finding report in the popover instead. No real
// screenshots exist on these pages by design (they contain customer
// PII) - the wireframes are deliberately abstract and the URL bar is
// drawn redacted, so the scene demos the product without re-identifying
// anyone.

const CAPTION = "Staged recreation. The real screenshot stays redacted.";
const REDACTED_URL_BLOCKS = "█████████";
const SUGGESTED_FIX_LABEL = "Suggested fix";

/** Avatar gradients cycled across distinct human speakers, in order of
    first appearance - matches the two-tone system used site-wide. */
const SPEAKER_GRADIENTS = [
  "linear-gradient(135deg, #2d9aff, #8480ff)",
  "linear-gradient(135deg, #fc6cba, #ffad61)",
  "linear-gradient(135deg, #0d9488, #4dd5ff)",
  "linear-gradient(135deg, #8455f6, #fc6cba)",
];

type SceneProps = { accent: string };

/** Shared wireframe header row: logo, nav items, CTA. */
function SiteHeader({ accent }: SceneProps) {
  return (
    <div className={styles.siteHeader}>
      <span className={styles.siteLogo} style={{ background: accent }} />
      <span className={styles.siteNavItem} />
      <span className={styles.siteNavItem} />
      <span className={styles.siteNavItem} />
      <span className={styles.siteCta} style={{ background: accent }} />
    </div>
  );
}

/** UI/UX - a card grid where one card sits visibly out of alignment. */
function UiUxScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.heroLines}>
        <span className={styles.lineWide} />
        <span className={styles.lineMid} />
      </div>
      <div className={styles.cardRow}>
        <span className={styles.wfCard} />
        <span className={`${styles.wfCard} ${styles.wfCardOff}`} />
        <span className={styles.wfCard} />
      </div>
    </>
  );
}

/** Copy - an article block ending in a big text button (where typos live). */
function CopyScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.heroLines}>
        <span className={styles.lineWide} />
        <span className={styles.lineMid} />
        <span className={styles.lineNarrow} />
        <span className={styles.lineMid} />
      </div>
      <span className={styles.textButton} style={{ background: accent }}>
        <span className={styles.textButtonLine} />
      </span>
    </>
  );
}

/** Content - an image placeholder beside copy lines. */
function ContentScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.mediaRow}>
        <span className={styles.imagePlaceholder}>
          <svg viewBox="0 0 48 34" className={styles.imageGlyph} aria-hidden="true">
            <circle cx="14" cy="11" r="4" fill="currentColor" />
            <path d="M6 28l12-12 8 8 8-9 10 13Z" fill="currentColor" />
          </svg>
        </span>
        <div className={styles.heroLines}>
          <span className={styles.lineWide} />
          <span className={styles.lineMid} />
          <span className={styles.lineNarrow} />
        </div>
      </div>
    </>
  );
}

/** Links - a link list with one visibly broken row. */
function LinksScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.linkList}>
        <span className={styles.linkRow} />
        <span className={styles.linkRow} />
        <span className={`${styles.linkRow} ${styles.linkRowBroken}`}>404</span>
        <span className={styles.linkRow} />
      </div>
    </>
  );
}

/** Mobile - a phone frame with the page squeezed inside. */
function MobileScene({ accent }: SceneProps) {
  return (
    <div className={styles.phoneWrap}>
      <div className={styles.phone}>
        <span className={styles.phoneLogo} style={{ background: accent }} />
        <span className={styles.lineWide} />
        <span className={styles.lineMid} />
        <span className={styles.phoneBlock} />
        <span className={styles.lineNarrow} />
        <span className={styles.phoneHomeBar} />
      </div>
    </div>
  );
}

/** Interactions - a form flow: fields, then the button that won't behave. */
function InteractionsScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.formCard}>
        <span className={styles.fieldLabel} />
        <span className={styles.field} />
        <span className={styles.fieldLabel} />
        <span className={styles.field} />
        <span className={styles.formButton} style={{ background: accent }} />
        <svg viewBox="0 0 20 22" className={styles.cursorGlyph} aria-hidden="true">
          <path
            d="M3 2l7 17 2.4-7 7-2.2Z"
            fill="#16171a"
            stroke="#ffffff"
            strokeWidth="1.6"
          />
        </svg>
      </div>
    </>
  );
}

/** Checkout - the flow itself: step dots, order summary, pay button. */
function CheckoutScene({ accent }: SceneProps) {
  return (
    <>
      <div className={styles.steps}>
        <span className={styles.stepDone} style={{ background: accent }} />
        <span className={styles.stepBar} style={{ background: accent }} />
        <span className={styles.stepDone} style={{ background: accent }} />
        <span className={styles.stepBarIdle} />
        <span className={styles.stepIdle} />
      </div>
      <div className={styles.formCard}>
        <span className={styles.summaryRow} />
        <span className={styles.summaryRow} />
        <span className={styles.summaryRowShort} />
        <span className={styles.summaryTotal} />
        <span className={styles.formButton} style={{ background: accent }} />
      </div>
    </>
  );
}

/** Pricing - three tier cards, the middle one emphasized. */
function PricingScene({ accent }: SceneProps) {
  return (
    <>
      <div className={styles.heroLinesCenter}>
        <span className={styles.lineMid} />
      </div>
      <div className={styles.cardRow}>
        <span className={styles.tierCard}>
          <span className={styles.tierPrice} />
          <span className={styles.tierLine} />
          <span className={styles.tierLine} />
        </span>
        <span
          className={`${styles.tierCard} ${styles.tierCardHot}`}
          style={{ borderColor: accent }}
        >
          <span className={styles.tierPrice} style={{ background: accent }} />
          <span className={styles.tierLine} />
          <span className={styles.tierLine} />
        </span>
        <span className={styles.tierCard}>
          <span className={styles.tierPrice} />
          <span className={styles.tierLine} />
          <span className={styles.tierLine} />
        </span>
      </div>
    </>
  );
}

/** Performance - a page stuck mid-load: progress bar, spinner, skeletons. */
function PerformanceScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.loadingWrap}>
        <span className={styles.progressTrack}>
          <span className={styles.progressFill} style={{ background: accent }} />
        </span>
        <span className={styles.spinner} style={{ borderTopColor: accent }} />
        <span className={styles.lineWide} />
        <span className={styles.lineMid} />
      </div>
    </>
  );
}

/** Feature Request - a settings panel with toggle rows. */
function FeatureRequestScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.formCard}>
        <span className={styles.toggleRow}>
          <span className={styles.fieldLabel} />
          <span className={styles.toggleOn} style={{ background: accent }} />
        </span>
        <span className={styles.toggleRow}>
          <span className={styles.fieldLabel} />
          <span className={styles.toggleOff} />
        </span>
        <span className={styles.toggleRow}>
          <span className={styles.fieldLabel} />
          <span className={styles.toggleOff} />
        </span>
      </div>
    </>
  );
}

/** Security - a code panel with a redacted key row. */
function SecurityScene({ accent }: SceneProps) {
  return (
    <>
      <SiteHeader accent={accent} />
      <div className={styles.codeCard}>
        <span className={styles.codeLine} />
        <span className={styles.codeKeyRow} style={{ color: accent }}>
          api_key = ••••••••••••••••
        </span>
        <span className={styles.codeLine} />
        <span className={styles.codeLineShort} />
      </div>
    </>
  );
}

/**
 * Per-category scene + where the pinned thread anchors within the frame.
 * The anchor is in normal flow (stacked over the wireframe via grid), so
 * long threads stretch the frame instead of overflowing it.
 */
const SCENES: Record<
  string,
  { Scene: (props: SceneProps) => ReactElement; anchor: CSSProperties }
> = {
  "UI/UX": { Scene: UiUxScene, anchor: { marginLeft: "42%", marginTop: 190 } },
  Copy: { Scene: CopyScene, anchor: { marginLeft: "30%", marginTop: 240 } },
  Content: { Scene: ContentScene, anchor: { marginLeft: "36%", marginTop: 150 } },
  Links: { Scene: LinksScene, anchor: { marginLeft: "34%", marginTop: 190 } },
  Mobile: { Scene: MobileScene, anchor: { marginLeft: "54%", marginTop: 130 } },
  Interactions: {
    Scene: InteractionsScene,
    anchor: { marginLeft: "40%", marginTop: 210 },
  },
  Checkout: {
    Scene: CheckoutScene,
    anchor: { marginLeft: "46%", marginTop: 220 },
  },
  Pricing: { Scene: PricingScene, anchor: { marginLeft: "46%", marginTop: 140 } },
  Performance: {
    Scene: PerformanceScene,
    anchor: { marginLeft: "42%", marginTop: 160 },
  },
  "Feature Request": {
    Scene: FeatureRequestScene,
    anchor: { marginLeft: "42%", marginTop: 150 },
  },
  Security: {
    Scene: SecurityScene,
    anchor: { marginLeft: "40%", marginTop: 180 },
  },
};

function AttachmentChip({
  attachment,
}: {
  attachment: NonNullable<BugThreadComment["attachment"]>;
}) {
  return (
    <span
      className={styles.commentAttachment}
      title="Redacted - media not shown"
    >
      {attachment === "screen recording"
        ? "🎥 screen recording"
        : "📎 screenshot"}
    </span>
  );
}

/** The full conversation inside the popover, Superflow-comment style. */
function ThreadPopover({ entry }: { entry: BugBookEntryDetail }) {
  const thread = entry.thread ?? [];
  const dateLabel = formatBugDate(entry.date);
  const speakerOrder: string[] = [];
  for (const comment of thread) {
    if (!speakerOrder.includes(comment.speaker)) {
      speakerOrder.push(comment.speaker);
    }
  }

  return (
    <ol className={styles.threadList}>
      {thread.map((comment, i) => {
        const speakerIndex = speakerOrder.indexOf(comment.speaker);
        const gradient =
          SPEAKER_GRADIENTS[speakerIndex % SPEAKER_GRADIENTS.length];
        const initial = (comment.speaker[0] ?? "?").toUpperCase();
        return (
          <li key={i} className={styles.threadItem}>
            <div className={styles.popoverHeader}>
              <span
                className={styles.avatar}
                style={{ background: gradient }}
                aria-hidden="true"
              >
                {initial}
              </span>
              <span className={styles.speaker}>{comment.speaker}</span>
              {i === 0 && dateLabel ? (
                <span className={styles.commentDate}>{dateLabel}</span>
              ) : null}
            </div>
            <p className={styles.commentText}>{comment.text}</p>
            {comment.attachment ? (
              <AttachmentChip attachment={comment.attachment} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** The full agent report inside the popover: finding, fix, confidence. */
function FindingPopover({ entry }: { entry: BugBookEntryDetail }) {
  const finding = entry.finding;
  if (!finding) return null;
  const dateLabel = formatBugDate(entry.date);
  const confidence =
    finding.confidence != null
      ? Math.max(0, Math.min(100, finding.confidence))
      : null;

  return (
    <div className={styles.findingBody}>
      <div className={styles.popoverHeader}>
        <span className={styles.agentAvatar} aria-hidden="true">
          <SparkleGlyph size={13} />
        </span>
        <span className={styles.speaker}>
          {entry.agentName ?? "Superflow Agent"}
        </span>
        {dateLabel ? (
          <span className={styles.commentDate}>{dateLabel}</span>
        ) : null}
      </div>
      {finding.title ? (
        <p className={styles.findingTitle}>{finding.title}</p>
      ) : null}
      {finding.description ? (
        <p className={styles.commentText}>{finding.description}</p>
      ) : null}
      {finding.suggestion ? (
        <div className={styles.suggestionBlock}>
          <span className={styles.suggestionLabel}>{SUGGESTED_FIX_LABEL}</span>
          <span className={styles.suggestionText}>{finding.suggestion}</span>
        </div>
      ) : null}
      {finding.issueType || confidence != null ? (
        <div className={styles.findingFooter}>
          {finding.issueType ? (
            <span className={styles.issueType}>{finding.issueType}</span>
          ) : null}
          {confidence != null ? (
            <span
              className={styles.confidence}
              aria-label={`Confidence: ${confidence}%`}
            >
              <span className={styles.confidenceTrack} aria-hidden="true">
                <span
                  className={styles.confidenceFill}
                  style={{ width: `${confidence}%` }}
                />
              </span>
              {confidence}% confident
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Wireframe site + pinned full-thread visual: THE centerpiece of the
 * detail page. The decorative wireframe is aria-hidden; the thread
 * itself is real content (an <ol> for screen readers), so it lives
 * only here.
 */
export default function BugSceneMock({
  entry,
}: {
  entry: BugBookEntryDetail;
}) {
  const isAgent = entry.source === "agent" && entry.finding;
  const hasThread = (entry.thread?.length ?? 0) > 0;
  if (!isAgent && !hasThread) return null;

  const { accent, tint } = categoryColor(entry.category);
  const { Scene, anchor } = SCENES[entry.category] ?? SCENES["UI/UX"];

  return (
    <figure className={styles.figure}>
      <div className={styles.frame} style={{ background: tint }}>
        {/* Browser chrome with a redacted URL */}
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.urlBar}>
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="none"
              aria-hidden="true"
            >
              <rect x="1" y="5" width="8" height="6" rx="1.5" fill="#a3a8b3" />
              <path
                d="M3 5V3.5a2 2 0 0 1 4 0V5"
                stroke="#a3a8b3"
                strokeWidth="1.4"
                fill="none"
              />
            </svg>
            https://{REDACTED_URL_BLOCKS}.com
          </span>
        </div>

        <div className={styles.stage}>
          {/* Category-specific wireframe flow - no real brand */}
          <div className={styles.site} aria-hidden="true">
            <Scene accent={accent} />
          </div>

          {/* The pinned Superflow thread / agent report */}
          <div className={styles.commentAnchor} style={anchor}>
            <span
              className={styles.pin}
              style={{ background: accent }}
              aria-hidden="true"
            >
              1
            </span>
            <div className={styles.popover}>
              {isAgent ? (
                <FindingPopover entry={entry} />
              ) : (
                <ThreadPopover entry={entry} />
              )}
            </div>
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{CAPTION}</figcaption>
    </figure>
  );
}
