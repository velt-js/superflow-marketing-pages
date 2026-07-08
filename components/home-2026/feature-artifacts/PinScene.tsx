import type { ReactNode } from "react";
import styles from "./PinScene.module.css";
import BrowserChrome from "./BrowserChrome";

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
 */

const ADDRESS = "YOUR-SITE.COM";

/**
 * Render the shared chrome + dashed selected element + skeleton content blocks.
 *
 * @returns The pinned-comment page scene fragment.
 */
export default function PinScene(): ReactNode {
  try {
    return (
      <>
        <BrowserChrome
          className={styles.chrome}
          address={ADDRESS}
          addressAlign="right"
          showActions={false}
        />

        <div className={styles.heroElement} aria-hidden="true" />

        <div className={styles.contentBlocks} aria-hidden="true">
          <span className={styles.contentBlock} />
          <span className={`${styles.contentBlock} ${styles.contentBlockTall}`} />
        </div>
      </>
    );
  } catch {
    return null;
  }
}
