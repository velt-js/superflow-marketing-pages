import type { CSSProperties, ReactElement } from "react";
import {
  formatBugDate,
  categoryColor,
  type BugBookEntryDetail,
} from "@/lib/bug-book";
import { SparkleGlyph } from "./Chips";
import styles from "./BugSceneMock.module.css";

// Staged recreation of "the moment": a generic wireframe website in a
// browser frame with the entry's first comment pinned on it, in
// Superflow's comment UI. Each category gets its own wireframe FLOW -
// checkout steps, pricing tiers, a form, a phone frame - so the scene
// reads like the actual part of the site where the bug happened. No real
// screenshots exist on these pages by design (they contain customer
// PII) - the wireframes are deliberately abstract and the URL bar is
// drawn redacted, so the scene demos the product without re-identifying
// anyone.

const CAPTION = "Staged recreation. The real screenshot stays redacted.";
const REDACTED_URL_BLOCKS = "█████████";

/** The comment to stage: first thread comment, else the agent finding. */
function pickStagedComment(entry: BugBookEntryDetail): {
  speaker: string;
  text: string;
  isAgent: boolean;
} | null {
  const first = entry.thread?.[0];
  if (first) {
    return {
      speaker: first.speaker,
      text: first.text,
      isAgent: entry.source === "agent",
    };
  }
  if (entry.finding?.description) {
    return {
      speaker: entry.agentName ?? "Superflow Agent",
      text: entry.finding.description,
      isAgent: true,
    };
  }
  return null;
}

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
 * Per-category scene + where the pin anchors within it. Anchors are
 * percentages of the frame so scenes stay pinned sensibly as they scale.
 */
const SCENES: Record<
  string,
  { Scene: (props: SceneProps) => ReactElement; anchor: CSSProperties }
> = {
  "UI/UX": { Scene: UiUxScene, anchor: { left: "44%", top: "56%" } },
  Copy: { Scene: CopyScene, anchor: { left: "30%", top: "66%" } },
  Content: { Scene: ContentScene, anchor: { left: "34%", top: "44%" } },
  Links: { Scene: LinksScene, anchor: { left: "34%", top: "58%" } },
  Mobile: { Scene: MobileScene, anchor: { left: "56%", top: "40%" } },
  Interactions: { Scene: InteractionsScene, anchor: { left: "40%", top: "62%" } },
  Checkout: { Scene: CheckoutScene, anchor: { left: "48%", top: "64%" } },
  Pricing: { Scene: PricingScene, anchor: { left: "48%", top: "42%" } },
  Performance: { Scene: PerformanceScene, anchor: { left: "44%", top: "48%" } },
  "Feature Request": {
    Scene: FeatureRequestScene,
    anchor: { left: "44%", top: "46%" },
  },
  Security: { Scene: SecurityScene, anchor: { left: "42%", top: "52%" } },
};

/**
 * Wireframe site + pinned comment hero visual for the detail page.
 * Decorative wireframe is aria-hidden; the comment text itself is
 * repeated in the thread/finding section below, so the whole figure is
 * presented as an illustration.
 */
export default function BugSceneMock({
  entry,
}: {
  entry: BugBookEntryDetail;
}) {
  const staged = pickStagedComment(entry);
  if (!staged) return null;

  const { accent, tint } = categoryColor(entry.category);
  const { Scene, anchor } = SCENES[entry.category] ?? SCENES["UI/UX"];
  const initial = (staged.speaker[0] ?? "?").toUpperCase();
  const dateLabel = formatBugDate(entry.date);

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

        {/* Category-specific wireframe flow - no real brand */}
        <div className={styles.site} aria-hidden="true">
          <Scene accent={accent} />
        </div>

        {/* The pinned Superflow comment */}
        <div className={styles.commentAnchor} style={anchor}>
          <span
            className={styles.pin}
            style={{ background: accent }}
            aria-hidden="true"
          >
            1
          </span>
          <div className={styles.popover}>
            <div className={styles.popoverHeader}>
              {staged.isAgent ? (
                <span className={styles.agentAvatar} aria-hidden="true">
                  <SparkleGlyph size={13} />
                </span>
              ) : (
                <span className={styles.avatar} aria-hidden="true">
                  {initial}
                </span>
              )}
              <span className={styles.speaker}>{staged.speaker}</span>
              {dateLabel ? (
                <span className={styles.commentDate}>{dateLabel}</span>
              ) : null}
            </div>
            <p className={styles.commentText}>{staged.text}</p>
            {entry.thread?.[0]?.attachment ? (
              <span className={styles.commentAttachment}>
                {entry.thread[0].attachment === "screen recording"
                  ? "🎥 screen recording"
                  : "📎 screenshot"}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{CAPTION}</figcaption>
    </figure>
  );
}
