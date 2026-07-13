"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./ScreenshotArtifact.module.css";
import BrowserChrome from "./BrowserChrome";
import CommentPin from "./CommentPin";
import CommentThreadCard from "./CommentThreadCard";
import PinnedCommentScene from "./PinnedCommentScene";

/**
 * Feature/hero artifact — "Screenshots".
 *
 * The screenshots story is: the moment you comment, Superflow captures the page
 * as the reviewer saw it. That snapshot outlives the page — when the live page
 * changes and the comment's anchor is lost, the snapshot still shows the
 * original. It works on public and gated pages (no browser extension), the
 * client sees the same snapshot from their link (no account, from their phone),
 * and the review record keeps every page comment by comment.
 *
 * One variant-driven component covers every beat (mirrors
 * {@link AuthenticatedPagesArtifact} / `PrivateCommentArtifact`):
 *
 *  - `capture`      — a reviewed page + a pinned comment whose card embeds the
 *                     auto-captured page snapshot with a green "Snapshot saved"
 *                     badge (the page star).
 *  - `no-extension` — the same capture, foregrounding a "Captured from the site
 *                     · no extension" chip.
 *  - `then-and-now` — the differentiator: the live page (changed, the element
 *                     edited away → anchor lost) beside the saved snapshot that
 *                     still shows the original + comment.
 *  - `full-page`    — a tall full-page snapshot (the whole page, not a crop)
 *                     with a comment pinned partway down.
 *  - `client-view`  — a phone showing the same snapshot from the client's link,
 *                     no account.
 *  - `record`       — a review record: rows of snapshot thumbnail + comment +
 *                     status (Open / Approved) so approvals carry their context.
 *
 * Every surface is a minimal CSS wireframe (no drop shadows — borders only) and
 * all entrances are gated behind `prefers-reduced-motion`; the settled state is
 * the base CSS, so screenshots always capture the finished composition.
 */

/** Which screenshots scene to render. */
export type ScreenshotVariant =
  | "capture"
  | "no-extension"
  | "then-and-now"
  | "full-page"
  | "client-view"
  | "record";

/* ------------------------------------------------------------------ *
 * Copy-string constants (per the repo's repeated-string rule).        *
 * ------------------------------------------------------------------ */

/** Reviewer avatar reused across the pinned comments (shared with PinScene). */
const AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";

const SITE_URL = "your-site.com";
const REVIEW_AUTHOR = "Milton";
const REVIEW_TIME = "2w";
const REVIEW_BODY = "Let\u2019s update this";
const REVIEW_MENTION = "@Mark";
const REVIEW_STATUS = "Open";
const REVIEW_REPLY = "1 Reply";

/** Green "snapshot saved" badge copy + the capture timestamp. */
const SNAPSHOT_SAVED = "Snapshot saved";
const CAPTURE_TIME = "just now";

/** Height (px) of the snapshot thumbnail embedded in the capture comment card. */
const CAPTURE_SHOT_HEIGHT = 138;

/* then-and-now */
const NOW_LABEL = "Now \u00b7 live page";
const THEN_LABEL = "Then \u00b7 snapshot";
const ANCHOR_LOST_LABEL = "Anchor lost";
const THEN_NOW_CAPTION = "The page changed. The snapshot didn\u2019t.";

/* no-extension */
const NO_EXTENSION_LABEL = "Captured from the site \u00b7 no extension";

/* full-page */
const FULL_PAGE_RIBBON = "Full page";
const FULL_PAGE_CAPTION = "The whole page, captured \u2014 not a crop.";

/* client-view */
const CLIENT_NO_ACCOUNT = "No account \u00b7 from their phone";
const CLIENT_SAME_SNAPSHOT = "Same snapshot";
const CLIENT_CAPTION = "Your client opens the same snapshot from their link.";
const CLIENT_LINK_LABEL = "Review link";
const CLIENT_LINK_URL = "your-site.com/r/9f2c";
const CLIENT_LINK_SENT = "Sent to client";

/* record */
const RECORD_TITLE = "Review record";
const RECORD_SUBTITLE = "Every comment, with the page it was left on";
const STATUS_OPEN = "Open";
const STATUS_APPROVED = "Approved";

/** One row of the review-record list. */
interface RecordRow {
  /** Unique key + comment title. */
  title: string;
  /** Relative timestamp. */
  time: string;
  /** Status pill state. */
  status: "open" | "approved";
  /** Entrance-stagger delay in ms. */
  delayMs: number;
}

const RECORD_ROWS: readonly RecordRow[] = [
  { title: "Homepage hero", time: "2w", status: "approved", delayMs: 120 },
  { title: "Pricing table", time: "1w", status: "approved", delayMs: 240 },
  { title: "Footer links", time: "3d", status: "open", delayMs: 360 },
];

/* ------------------------------------------------------------------ *
 * Inline glyphs.                                                       *
 * ------------------------------------------------------------------ */

/** Shared props for the inline stroke glyphs. */
interface GlyphProps {
  /** Rendered width/height in pixels. */
  size?: number;
  /** Optional class applied to the `<svg>`. */
  className?: string;
}

/**
 * Camera glyph (Tabler `camera`) used on the "snapshot saved" badges.
 *
 * @param root0 - Sizing + class props.
 * @param root0.size - Rendered width/height in px.
 * @param root0.className - Optional class on the svg.
 * @returns The camera `<svg>`, or `null` on failure.
 */
function CameraIcon({ size = 13, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Check glyph used on the "Approved" record pill.
 *
 * @param root0 - Sizing + class props.
 * @param root0.size - Rendered width/height in px.
 * @param root0.className - Optional class on the svg.
 * @returns The check `<svg>`, or `null` on failure.
 */
function CheckIcon({ size = 12, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M5 12l5 5l9 -9" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Link/chain glyph (Tabler `link`) used on the client-view "Review link" card.
 *
 * @param root0 - Sizing + class props.
 * @param root0.size - Rendered width/height in px.
 * @param root0.className - Optional class on the svg.
 * @returns The link `<svg>`, or `null` on failure.
 */
function LinkIcon({ size = 13, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M9 15l6 -6" />
        <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
        <path d="M13 18l-.397 .534a5 5 0 0 1 -7.127 -7.071l.524 -.463" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Right-pointing arrow glyph for the client-view "review link → phone" flow.
 *
 * @param root0 - Sizing + class props.
 * @param root0.size - Rendered width/height in px.
 * @param root0.className - Optional class on the svg.
 * @returns The arrow `<svg>`, or `null` on failure.
 */
function ArrowGlyph({ size = 20, className }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M5 12h14" />
        <path d="M13 6l6 6l-6 6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Build the inline style that staggers one element's entrance.
 *
 * @param delayMs - Milliseconds to wait before this item animates in.
 * @returns The inline style setting the stagger custom property.
 */
function delayStyle(delayMs: number): CSSProperties {
  try {
    return { "--ss-delay": `${delayMs}ms` } as CSSProperties;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ *
 * Shared wireframe surfaces.                                           *
 * ------------------------------------------------------------------ */

/** Props for {@link SnapThumb}. */
interface SnapThumbProps {
  /** When true, show the green camera "Snapshot saved" badge. */
  badge?: boolean;
  /** Optional timestamp appended to the badge (e.g. "just now"). */
  timeLabel?: string;
  /** Optional positioning/size class. */
  className?: string;
}

/**
 * A minimal captured-page thumbnail — a slim chrome bar over a media block and
 * two skeleton lines. Embedded inside the comment card's snapshot slot and
 * reused in the review-record rows so "the captured page" reads identically
 * everywhere.
 *
 * @param root0 - Badge toggle, badge timestamp and positioning class.
 * @param root0.badge - Whether the green "Snapshot saved" badge is shown.
 * @param root0.timeLabel - Optional timestamp appended to the badge.
 * @param root0.className - Optional positioning/size class.
 * @returns The thumbnail element, or `null` on failure.
 */
function SnapThumb({ badge = false, timeLabel, className }: SnapThumbProps): ReactNode {
  try {
    const rootClass = className ? `${styles.snap} ${className}` : styles.snap;
    return (
      <div className={rootClass}>
        <div className={styles.snapBar} aria-hidden="true">
          <span className={styles.snapDot} />
          <span className={styles.snapDot} />
          <span className={styles.snapDot} />
        </div>
        <div className={styles.snapBody} aria-hidden="true">
          <span className={styles.snapMedia} />
          <span className={styles.snapCol}>
            <span className={styles.snapLine} />
            <span className={`${styles.snapLine} ${styles.snapLineShort}`} />
            <span className={styles.snapLine} />
          </span>
        </div>
        {badge ? (
          <span className={styles.snapBadge}>
            <CameraIcon size={12} />
            {SNAPSHOT_SAVED}
            {timeLabel ? ` \u00b7 ${timeLabel}` : ""}
          </span>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}

/** Body layout options for {@link PageMock}. */
interface PageBodyProps {
  /** When true, the reviewed element carries the dashed selection outline. */
  selected?: boolean;
  /** When true, render the "changed" layout (the element has been edited away). */
  changed?: boolean;
  /** When true, drop the pin as faded with an "anchor lost" tag (changed pages). */
  pinLost?: boolean;
  /** When true, anchor a solid comment pin on the reviewed element. */
  pin?: boolean;
  /** When true, render extra rows for the tall full-page mock. */
  tall?: boolean;
}

/**
 * The wireframe body of a page mock: a media block (optionally dashed-selected)
 * beside skeleton copy, with an optional comment pin. The `changed` layout
 * swaps the reviewed element for a different block and leaves a dashed
 * "anchor lost" ghost where the original element used to be.
 *
 * @param root0 - The body layout flags.
 * @returns The page-body element, or `null` on failure.
 */
function PageBody({
  selected = false,
  changed = false,
  pinLost = false,
  pin = false,
  tall = false,
}: PageBodyProps): ReactNode {
  try {
    const mediaClass = [styles.pageMedia];
    if (selected) {
      mediaClass.push(styles.pageMediaSelected);
    }
    if (changed) {
      mediaClass.push(styles.pageMediaChanged);
    }
    return (
      <div className={`${styles.pageBody}${tall ? ` ${styles.pageBodyTall}` : ""}`}>
        <div className={styles.pageRow}>
          <span className={mediaClass.join(" ")} aria-hidden="true">
            {pinLost ? (
              <span className={styles.anchorGhost} aria-hidden="true">
                <span className={styles.anchorGhostTag}>{ANCHOR_LOST_LABEL}</span>
              </span>
            ) : null}
          </span>
          <span className={styles.pageCol} aria-hidden="true">
            <span className={`${styles.pageLine} ${styles.pageLineTall}`} />
            <span className={styles.pageLine} />
            <span className={`${styles.pageLine} ${styles.pageLineShort}`} />
          </span>

          {pin ? (
            <CommentPin
              avatarSrc={AVATAR_SRC}
              className={pinLost ? `${styles.pagePin} ${styles.pagePinLost}` : styles.pagePin}
              size={26}
            />
          ) : null}
        </div>

        {tall ? (
          <>
            <span className={`${styles.pageLine} ${styles.pageLineWide}`} aria-hidden="true" />
            <div className={styles.pageTiles} aria-hidden="true">
              <span className={styles.pageTile} />
              <span className={styles.pageTile} />
              <span className={styles.pageTile} />
            </div>
            <span className={`${styles.pageLine} ${styles.pageLineWide}`} aria-hidden="true" />
            <span className={`${styles.pageLine} ${styles.pageLineShort}`} aria-hidden="true" />
          </>
        ) : null}
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link PageMock}. */
interface PageMockProps {
  /** Address shown in the reused browser chrome. */
  address?: string;
  /** When true, the chrome shows the green "Live" pill. */
  live?: boolean;
  /** Optional caption label rendered above the window (e.g. "Now"). */
  caption?: string;
  /** Whether the caption reads as the "live/now" tone (amber) vs snapshot (green). */
  captionTone?: "now" | "then";
  /** When true, a green camera "Snapshot" ribbon sits on the window. */
  ribbon?: string;
  /** Body layout flags forwarded to {@link PageBody}. */
  body?: PageBodyProps;
  /** Optional positioning/size class. */
  className?: string;
}

/**
 * A browser window wireframe: the shared {@link BrowserChrome} band over a
 * {@link PageBody}, with an optional caption label and a "Snapshot" ribbon.
 * Borders only, no drop shadow.
 *
 * @param root0 - The chrome address/live flag, caption, ribbon and body flags.
 * @returns The page-window element, or `null` on failure.
 */
function PageMock({
  address = SITE_URL,
  live = false,
  caption,
  captionTone = "now",
  ribbon,
  body,
  className,
}: PageMockProps): ReactNode {
  try {
    const rootClass = className ? `${styles.page} ${className}` : styles.page;
    const captionClass =
      captionTone === "then"
        ? `${styles.pageCaption} ${styles.pageCaptionThen}`
        : `${styles.pageCaption} ${styles.pageCaptionNow}`;
    return (
      <div className={styles.pageWrap}>
        {caption ? <span className={captionClass}>{caption}</span> : null}
        <div className={rootClass}>
          <BrowserChrome address={address} liveTag={live} showActions={false} />
          <PageBody {...body} />
          {ribbon ? (
            <span className={styles.pageRibbon}>
              <CameraIcon size={12} />
              {ribbon}
            </span>
          ) : null}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link ReviewComment}. */
interface ReviewCommentProps {
  /** Positioning class for the group. */
  className?: string;
  /** Comment author. Defaults to "Milton". */
  author?: string;
  /** Relative timestamp. Defaults to "2w". */
  timeAgo?: string;
  /** Comment body. Defaults to the shared review copy. */
  bodyText?: string;
  /** Optional embedded snapshot node (the captured page). */
  screenshotNode?: ReactNode;
  /** Reply-row label. Defaults to "1 Reply"; pass "" to hide. */
  replyLabel?: string;
}

/**
 * A pinned review comment — the shared {@link CommentPin} teardrop anchored to
 * the corner of the shared {@link CommentThreadCard}. Reuses the exact comments
 * dialog (status header, photo avatar, "@mention" body, reply row); when a
 * `screenshotNode` is supplied it renders inside the card's snapshot slot.
 *
 * @param root0 - The positioning class, copy and optional embedded snapshot.
 * @returns The pinned comment group, or `null` on failure.
 */
function ReviewComment({
  className,
  author = REVIEW_AUTHOR,
  timeAgo = REVIEW_TIME,
  bodyText = REVIEW_BODY,
  screenshotNode,
  replyLabel = REVIEW_REPLY,
}: ReviewCommentProps): ReactNode {
  try {
    const groupClass = className
      ? `${styles.commentGroup} ${className}`
      : styles.commentGroup;
    return (
      <div className={groupClass}>
        <CommentPin avatarSrc={AVATAR_SRC} className={styles.commentPin} size={28} />
        <CommentThreadCard
          className={styles.commentCard}
          flat
          avatarSrc={AVATAR_SRC}
          author={author}
          timeAgo={timeAgo}
          edited
          bodyText={bodyText}
          mention={REVIEW_MENTION}
          status={REVIEW_STATUS}
          showScreenshot={Boolean(screenshotNode)}
          screenshotNode={screenshotNode}
          replyLabel={replyLabel || undefined}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: capture / no-extension                                        *
 * ------------------------------------------------------------------ */

/**
 * `capture` / `no-extension` scene — reuses the exact comments-page surface
 * ({@link PinnedCommentScene}, the same one the "Auto Screenshot" tab renders):
 * a top-anchored browser chrome bar bleeding off the right panel edge, the
 * dashed selected element, and the pinned comment card — with the auto-captured
 * page snapshot embedded in the card via {@link SnapThumb} (green "Snapshot
 * saved · just now" badge). The `no-extension` variant adds a bottom "Captured
 * from the site · no extension" caption chip. This keeps the browser frame
 * identical to the comments page rather than a bespoke centred window.
 *
 * @param root0 - The scene props.
 * @param root0.noExtension - Whether to show the no-extension chip.
 * @returns The capture scene, or `null` on failure.
 */
function CaptureScene({ noExtension = false }: { noExtension?: boolean }): ReactNode {
  try {
    return (
      <div
        className={styles.captureRoot}
        data-artifact={noExtension ? "screenshot-no-extension" : "screenshot-capture"}
        data-variant={noExtension ? "no-extension" : "capture"}
      >
        <PinnedCommentScene
          dataArtifact={noExtension ? "screenshot-no-extension-page" : "screenshot-capture-page"}
          screenshot
          cardProps={{
            screenshotNode: <SnapThumb badge timeLabel={CAPTURE_TIME} />,
            screenshotHeight: CAPTURE_SHOT_HEIGHT,
          }}
        />
        {noExtension ? (
          <span className={styles.captureChip}>
            <CameraIcon size={13} />
            {NO_EXTENSION_LABEL}
          </span>
        ) : null}
        <div className={styles.captureFade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Hero-window variant of the capture scene. The comments-page
 * {@link PinnedCommentScene} is authored as a left-anchored full-bleed canvas
 * that only fits the feature panel, so the fully-visible hero window instead
 * shows a centred browser window ({@link PageMock}) beside the pinned comment
 * card carrying the same embedded snapshot.
 *
 * @param root0 - The scene props.
 * @param root0.noExtension - Whether to show the no-extension chip.
 * @returns The hero capture scene, or `null` on failure.
 */
function CaptureHeroScene({ noExtension = false }: { noExtension?: boolean }): ReactNode {
  try {
    return (
      <div className={styles.captureScene}>
        <div className={styles.captureItem} style={delayStyle(80)}>
          <PageMock body={{ selected: true }} />
        </div>

        {noExtension ? (
          <span className={styles.captureChipHero} style={delayStyle(220)}>
            <CameraIcon size={13} />
            {NO_EXTENSION_LABEL}
          </span>
        ) : null}

        <div className={styles.captureComment} style={delayStyle(noExtension ? 360 : 300)}>
          <ReviewComment
            screenshotNode={<SnapThumb badge timeLabel={CAPTURE_TIME} />}
          />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: then-and-now                                                  *
 * ------------------------------------------------------------------ */

/**
 * `then-and-now` scene — the live page (changed, the reviewed element edited
 * away so its anchor is lost) beside the saved snapshot that still shows the
 * original page and the comment. The differentiator for the page.
 *
 * @returns The then-and-now scene, or `null` on failure.
 */
function ThenAndNowScene(): ReactNode {
  try {
    return (
      <div className={styles.thenNowScene}>
        <div className={styles.thenNowPair}>
          <div className={styles.thenNowItem} style={delayStyle(100)}>
            <PageMock
              address={SITE_URL}
              live
              caption={NOW_LABEL}
              captionTone="now"
              body={{ changed: true, pinLost: true }}
            />
          </div>

          <div className={styles.thenNowItem} style={delayStyle(260)}>
            <PageMock
              address={SITE_URL}
              caption={THEN_LABEL}
              captionTone="then"
              ribbon={SNAPSHOT_SAVED}
              body={{ selected: true, pin: true }}
            />
          </div>
        </div>
        <p className={styles.sceneCaption} style={delayStyle(440)}>
          {THEN_NOW_CAPTION}
        </p>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: full-page                                                     *
 * ------------------------------------------------------------------ */

/**
 * `full-page` scene — a tall full-page snapshot (the whole page, not a crop)
 * inside a scrollable-looking frame with a "Full page" ribbon and a comment
 * pinned partway down.
 *
 * @returns The full-page scene, or `null` on failure.
 */
function FullPageScene(): ReactNode {
  try {
    return (
      <div className={styles.fullScene}>
        <div className={styles.fullFrame} style={delayStyle(100)}>
          <PageMock
            address={SITE_URL}
            ribbon={FULL_PAGE_RIBBON}
            body={{ selected: true, pin: true, tall: true }}
            className={styles.fullPage}
          />
          <span className={styles.fullScrollTrack} aria-hidden="true">
            <span className={styles.fullScrollThumb} />
          </span>
        </div>
        <p className={styles.sceneCaption} style={delayStyle(320)}>
          {FULL_PAGE_CAPTION}
        </p>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: client-view                                                   *
 * ------------------------------------------------------------------ */

/**
 * `client-view` scene — a phone shows the same snapshot from the client's
 * review link, with "No account · from their phone" and a green "Same snapshot"
 * chip. Conveys the client sees exactly what the reviewer captured.
 *
 * @param root0 - The scene props.
 * @param root0.hero - Whether the hero-window fit is active.
 * @returns The client-view scene, or `null` on failure.
 */
function ClientViewScene({ hero = false }: { hero?: boolean }): ReactNode {
  try {
    return (
      <div className={styles.clientScene}>
        <div className={styles.clientFlow}>
          <div className={styles.clientShare} style={delayStyle(80)}>
            <span className={styles.clientShareLabel}>
              <LinkIcon size={13} className={styles.clientShareLinkIcon} />
              {CLIENT_LINK_LABEL}
            </span>
            <span className={styles.clientShareUrl}>{CLIENT_LINK_URL}</span>
            <span className={styles.clientShareSent}>
              <CheckIcon size={11} />
              {CLIENT_LINK_SENT}
            </span>
          </div>

          <span className={styles.clientArrow} style={delayStyle(180)} aria-hidden="true">
            <ArrowGlyph size={20} />
          </span>

          <div className={styles.phone} style={delayStyle(260)}>
            <span className={styles.phoneNotch} aria-hidden="true" />
            <div className={styles.phoneScreen}>
              <span className={styles.phoneNoAccount}>{CLIENT_NO_ACCOUNT}</span>
              <SnapThumb className={styles.phoneSnap} />
              <span className={styles.phoneSameSnap}>
                <CameraIcon size={12} />
                {CLIENT_SAME_SNAPSHOT}
              </span>
              <div className={styles.phoneComment}>
                <span className={styles.phoneAvatar} aria-hidden="true" />
                <span className={styles.phoneCommentBody}>
                  <span className={styles.phoneCommentLine} />
                  <span className={`${styles.phoneCommentLine} ${styles.phoneCommentLineShort}`} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {hero ? null : (
          <p className={styles.sceneCaption} style={delayStyle(360)}>
            {CLIENT_CAPTION}
          </p>
        )}
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene: record                                                        *
 * ------------------------------------------------------------------ */

/**
 * `record` scene — a review-record card: rows of snapshot thumbnail + comment
 * title + timestamp + status pill (Open / Approved). Conveys the record keeps
 * every page as the reviewer saw it, comment by comment.
 *
 * @returns The record scene, or `null` on failure.
 */
function RecordScene(): ReactNode {
  try {
    return (
      <div className={styles.recordScene}>
        <div className={styles.recordCard} style={delayStyle(60)}>
          <div className={styles.recordHead}>
            <span className={styles.recordTitle}>{RECORD_TITLE}</span>
            <span className={styles.recordSubtitle}>{RECORD_SUBTITLE}</span>
          </div>
          <ul className={styles.recordList}>
            {RECORD_ROWS.map((row) => (
              <li
                key={row.title}
                className={styles.recordRow}
                style={delayStyle(row.delayMs)}
              >
                <SnapThumb className={styles.recordThumb} />
                <span className={styles.recordText}>
                  <span className={styles.recordRowTitle}>{row.title}</span>
                  <span className={styles.recordRowTime}>{row.time}</span>
                </span>
                {row.status === "approved" ? (
                  <span className={`${styles.recordStatus} ${styles.recordStatusApproved}`}>
                    <CheckIcon size={12} />
                    {STATUS_APPROVED}
                  </span>
                ) : (
                  <span className={`${styles.recordStatus} ${styles.recordStatusOpen}`}>
                    {STATUS_OPEN}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene router + root.                                                 *
 * ------------------------------------------------------------------ */

/**
 * Resolve which scene body to render for a screenshots variant.
 *
 * @param variant - The requested scene variant.
 * @param hero - Whether the hero-window fit is active.
 * @returns The scene node for the variant, or `null` on failure.
 */
function renderScene(variant: ScreenshotVariant, hero: boolean): ReactNode {
  try {
    switch (variant) {
      case "no-extension":
        return <CaptureHeroScene noExtension />;
      case "then-and-now":
        return <ThenAndNowScene />;
      case "full-page":
        return <FullPageScene />;
      case "client-view":
        return <ClientViewScene hero={hero} />;
      case "record":
        return <RecordScene />;
      default:
        return <CaptureHeroScene />;
    }
  } catch {
    return null;
  }
}

/** Props for {@link ScreenshotArtifact}. */
export interface ScreenshotArtifactProps {
  /** Which scene to render. Defaults to `capture`. */
  variant?: ScreenshotVariant;
  /** Hero-window fit (centres the scene + trims height for the hero frame). */
  hero?: boolean;
}

/**
 * Render the Screenshots artifact for the given variant.
 *
 * @param props - The variant + hero-fit flag.
 * @returns The artifact, or `null` on failure.
 */
export default function ScreenshotArtifact({
  variant = "capture",
  hero = false,
}: ScreenshotArtifactProps = {}): ReactNode {
  try {
    // Capture + no-extension reuse the comments-page PinnedCommentScene surface
    // for the feature panel (a top-anchored chrome bar bleeding off the right,
    // matching the comments page). That scene owns its own full-bleed layout, so
    // it bypasses the centred stage. The fully-visible hero window cannot fit the
    // left-anchored canvas, so hero capture falls through to the centred
    // PageMock scene (CaptureHeroScene) via the stage below.
    if (!hero && (variant === "capture" || variant === "no-extension")) {
      return <CaptureScene noExtension={variant === "no-extension"} />;
    }
    return (
      <div
        className={`${styles.sceneRoot}${hero ? ` ${styles.hero}` : ""}`}
        data-artifact={`screenshot-${variant}`}
        data-variant={variant}
        {...(hero ? { "data-hero": "" } : {})}
      >
        <div className={styles.stage}>{renderScene(variant, hero)}</div>
        <div className={styles.fade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Zero-prop wrapper exports (one per variant for the feature registry).*
 * ------------------------------------------------------------------ */

/**
 * Feature-panel wrapper — the comment-time capture scene.
 * @returns The capture artifact.
 */
export function ScreenshotCaptureArtifact(): ReactNode {
  return <ScreenshotArtifact variant="capture" />;
}

/**
 * Feature-panel wrapper — the no-extension capture scene.
 * @returns The no-extension artifact.
 */
export function ScreenshotNoExtensionArtifact(): ReactNode {
  return <ScreenshotArtifact variant="no-extension" />;
}

/**
 * Feature-panel wrapper — the then-and-now (page-changed) scene.
 * @returns The then-and-now artifact.
 */
export function ScreenshotThenAndNowArtifact(): ReactNode {
  return <ScreenshotArtifact variant="then-and-now" />;
}

/**
 * Feature-panel wrapper — the full-page capture scene.
 * @returns The full-page artifact.
 */
export function ScreenshotFullPageArtifact(): ReactNode {
  return <ScreenshotArtifact variant="full-page" />;
}

/**
 * Feature-panel wrapper — the client-visible phone scene.
 * @returns The client-view artifact.
 */
export function ScreenshotClientViewArtifact(): ReactNode {
  return <ScreenshotArtifact variant="client-view" />;
}

/**
 * Feature-panel wrapper — the review-record scene.
 * @returns The record artifact.
 */
export function ScreenshotRecordArtifact(): ReactNode {
  return <ScreenshotArtifact variant="record" />;
}
