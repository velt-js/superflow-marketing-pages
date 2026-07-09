import type { ReactNode } from "react";
import styles from "./PinScene.module.css";
import BrowserChrome from "./BrowserChrome";
import FakeCursor from "./FakeCursor";

/**
 * Shared "pinned comment" page scene for the Durable Comments feature-section
 * artifacts (Pinned Comments + Auto Screenshot). Renders the common product
 * surface both sit on: a wide browser {@link BrowserChrome} bar whose address
 * pill intentionally bleeds off the right panel edge, a dashed purple-selected
 * target element and a couple of skeleton content blocks to its right.
 *
 * There is no separate numbered pin badge — each artifact's own comment (its
 * purple teardrop avatar + dialog, overlaid by {@link PinnedCommentScene})
 * serves as the anchor, so the comment itself reads as "pinned to the element".
 * Factored out so both artifacts stay pixel-in-sync (same chrome, selection and
 * entrance animations). Elements are absolutely positioned relative to the
 * artifact root at native pixel coordinates, left-anchored inside the visible
 * panel frame (the panel window is a wider 1204px that intentionally clips off
 * the right).
 *
 * The "Live Site" view opts into a thin variant via {@link PinSceneProps.live}:
 * the chrome shows a lowercase live URL with a green "Live" pill, and a dimmed,
 * grayscale "Static copy · 2w ago" card peeks out from behind the selected
 * element — the frozen screenshot the comment would otherwise be stuck on — so
 * the crisp live surface reads as the real thing by contrast.
 *
 * The "Versioning" view opts into a second thin variant via
 * {@link PinSceneProps.versions}: a left rail of stacked VERSION buttons (the
 * first is the active/accent version, the rest muted history) overlays the page
 * column, and the selected element + content shift right to clear the rail.
 */

const ADDRESS = "YOUR-SITE.COM";
const LIVE_ADDRESS = "your-site.com";
const STALE_LABEL = "Static copy";
const STALE_STAMP = "2w ago";

const LIST_VIEW_LABEL = "List View";
const GRID_VIEW_LABEL = "Grid View";

/**
 * Robust Anchor reflow items, top→bottom in list order. The first is the
 * "selected" element the comment is pinned to; it holds its top-left corner
 * across the list→grid switch so the comment stays anchored while the others
 * fly into their grid slots. Order maps to the `.reflowItemN` position classes.
 */
const REFLOW_ITEMS: readonly { id: string; selected?: boolean }[] = [
  { id: "anchored", selected: true },
  { id: "beta" },
  { id: "gamma" },
  { id: "delta" },
];

/**
 * List-view rows glyph for the Robust Anchor view switcher.
 *
 * @returns The list `<svg>` element.
 */
function ListViewIcon(): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5.5 4H13.5" />
        <path d="M5.5 8H13.5" />
        <path d="M5.5 12H13.5" />
        <path d="M2.5 4H2.51" />
        <path d="M2.5 8H2.51" />
        <path d="M2.5 12H2.51" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Grid-view cells glyph for the Robust Anchor view switcher.
 *
 * @returns The grid `<svg>` element.
 */
function GridViewIcon(): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" />
        <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" />
        <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" />
        <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Props for {@link PinScene}. */
export interface PinSceneProps {
  /**
   * When true, render the "Live Site" variant: a lowercase live URL with the
   * chrome's green "Live" pill and a stale "Static copy" ghost card behind the
   * selected element. Defaults to false (the plain durable-comments surface).
   */
  live?: boolean;
  /**
   * When provided (and non-empty), render the "Versioning" variant: a left rail
   * of stacked VERSION buttons is drawn over the page column and the selected
   * element + content shift right to clear it. The first label is the active
   * (accent-filled) version; the rest are muted history. Omit to leave the
   * plain scene (Pinned Comments / Auto Screenshot / Live Site) untouched.
   */
  versions?: readonly string[];
  /**
   * When true, render the List/Grid switcher and card-grid skeleton used by the
   * "Robust Anchor" comments artifact. Defaults to false.
   */
  viewSwitcher?: boolean;
  /**
   * When true, render the "text selection" surface used by the "Text Comments"
   * artifact: a page content block, a highlighted text run the comment is
   * pinned to, and skeleton copy lines — instead of the dashed selected element.
   * Defaults to false.
   */
  textSelect?: boolean;
  /**
   * When true (and {@link textSelect} is set), play the opt-in text-selection
   * choreography: the highlighted run settles on a warm marker yellow and is
   * revealed left→right like a dragged selection, with a {@link FakeCursor}
   * gliding in to "select" the copy. Defaults to false (the run renders in its
   * static peach resting state, so other consumers are unaffected).
   */
  textSelectAnimate?: boolean;
  /**
   * When true, suppress the panel-width browser chrome. Used only when the scene
   * is fitted into the hero product window (via `CommentsHeroFit`), which renders
   * its own full-width chrome band on top instead of this left-anchored 676px bar
   * (which is authored to bleed off the narrower feature panel's right edge).
   * Feature-section usage omits this so the chrome renders unchanged. Defaults to
   * false.
   */
  hero?: boolean;
}

/**
 * Render the shared chrome + dashed selected element + skeleton content blocks,
 * optionally in the "Live Site" or "Versioning" variant.
 *
 * @param props - The scene props.
 * @param props.live - Whether to render the Live Site variant.
 * @param props.versions - Optional version labels enabling the Versioning rail.
 * @param props.textSelect - Whether to render the text-selection surface.
 * @param props.textSelectAnimate - Whether to play the text-selection sweep.
 * @param props.hero - Whether to suppress the panel chrome for hero-window use.
 * @returns The pinned-comment page scene fragment.
 */
export default function PinScene({
  live = false,
  versions,
  viewSwitcher = false,
  textSelect = false,
  textSelectAnimate = false,
  hero = false,
}: PinSceneProps = {}): ReactNode {
  try {
    const hasVersions = Boolean(versions?.length);
    const heroElementClassName = hasVersions
      ? `${styles.heroElement} ${styles.heroElementVersions}`
      : styles.heroElement;
    const contentBlocksClassName = hasVersions
      ? `${styles.contentBlocks} ${styles.contentBlocksVersions}`
      : styles.contentBlocks;
    const reflowPositionClasses = [
      styles.reflowItem1,
      styles.reflowItem2,
      styles.reflowItem3,
      styles.reflowItem4,
    ];
    const textSelectClassName = textSelectAnimate
      ? `${styles.textSelect} ${styles.textSelectAnim}`
      : styles.textSelect;

    return (
      <>
        {/* In the hero window the fit wrapper renders its own full-width chrome
            band, so this left-anchored panel chrome is suppressed there. */}
        {hero ? null : (
          <BrowserChrome
            className={styles.chrome}
            address={live ? LIVE_ADDRESS : ADDRESS}
            addressAlign={live ? "center" : "right"}
            showActions={false}
            liveTag={live}
            compactAddress={hasVersions}
          />
        )}

        {live ? (
          <>
            <div className={styles.stale} aria-hidden="true" />
            <span className={styles.staleTag}>
              {STALE_LABEL}
              <span className={styles.staleStamp}>{STALE_STAMP}</span>
            </span>
          </>
        ) : null}

        {viewSwitcher ? (
          <div className={styles.reflow} aria-hidden="true">
            <div className={styles.viewSwitch}>
              <span className={`${styles.viewSwitchItem} ${styles.viewSwitchList}`}>
                <span className={styles.viewSwitchIcon}>
                  <ListViewIcon />
                </span>
                {LIST_VIEW_LABEL}
              </span>
              <span className={`${styles.viewSwitchItem} ${styles.viewSwitchGrid}`}>
                <span className={styles.viewSwitchIcon}>
                  <GridViewIcon />
                </span>
                {GRID_VIEW_LABEL}
              </span>
            </div>

            {REFLOW_ITEMS.map((item, index) => {
              const itemClassNames = [styles.reflowItem, reflowPositionClasses[index]];
              if (item?.selected) {
                itemClassNames.push(styles.reflowItemSelected);
              }
              return (
                <span key={item?.id} className={itemClassNames.join(" ")}>
                  <span className={styles.reflowThumb} />
                  <span className={styles.reflowLines}>
                    <span className={styles.reflowBar} />
                    <span className={`${styles.reflowBar} ${styles.reflowBarShort}`} />
                  </span>
                </span>
              );
            })}

            <FakeCursor className={styles.reflowCursor} size={22} />
          </div>
        ) : textSelect ? (
          <div className={textSelectClassName} aria-hidden="true">
            <span className={styles.textSelectBlock} />
            <span className={styles.textHighlight} />
            <span className={styles.textLines}>
              <span className={styles.textLine} />
              <span className={`${styles.textLine} ${styles.textLineShort}`} />
              <span className={styles.textLine} />
            </span>
            {textSelectAnimate ? (
              <FakeCursor className={styles.textSelectCursor} size={22} />
            ) : null}
          </div>
        ) : (
          <>
            <div className={heroElementClassName} aria-hidden="true" />

            <div className={contentBlocksClassName} aria-hidden="true">
              <span className={styles.contentBlock} />
              <span className={`${styles.contentBlock} ${styles.contentBlockTall}`} />
            </div>
          </>
        )}

        {hasVersions ? (
          <div className={styles.versionRail} aria-hidden="true">
            {versions?.map((label, index) => (
              <span
                key={label}
                className={
                  index === 0
                    ? `${styles.versionButton} ${styles.versionButtonActive}`
                    : styles.versionButton
                }
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </>
    );
  } catch {
    return null;
  }
}
