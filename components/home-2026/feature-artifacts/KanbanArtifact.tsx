import type { ReactNode } from "react";
import styles from "./KanbanArtifact.module.css";
import CommentThreadCard from "./CommentThreadCard";

/**
 * Feature-section app-window artifact — "Kanban".
 *
 * A built-in board: an "Open" column (four cards) and an "In Progress" column
 * (three cards) that bleeds off the right edge, each card reusing the shared
 * {@link CommentThreadCard} in its minimal, header-less form (just avatar,
 * author and body — no status pill or reply row). Conveys "a built-in kanban
 * board, or sync with the one you already run." Cards rise in with a small
 * stagger on mount.
 */

const OPEN_LABEL = "Open";
const IN_PROGRESS_LABEL = "In Progress";
const MENTION = "@Mark";
const GUEST_TEXT = "Client here! Can we change this";
const EMMA_TEXT = "Let\u2019s update the image";
const PRIYA_TEXT = "Logo feels too small";
const DEVON_TEXT = "Can we bump the padding";
const ROMULUS_TEXT = "Can we tone this down";
const AVA_TEXT = "Fixing the hero copy";
const LEO_TEXT = "On the mobile nav now";

/**
 * Hollow circle marking the "Open" column (Figma tabler-icon-circle).
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The circle `<svg>` element.
 */
function CircleIcon({ size }: { size: number }): ReactNode {
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
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Dashed progress circle marking the "In Progress" column (Figma tabler-icon-progress).
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The progress `<svg>` element.
 */
function ProgressIcon({ size }: { size: number }): ReactNode {
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
      >
        <path d="M9.99953 20.7771C9.12914 20.5797 8.29321 20.2531 7.51953 19.8081M14 3.2229C15.9882 3.67697 17.7632 4.79259 19.0347 6.38711C20.3061 7.98162 20.9984 9.96055 20.9984 11.9999C20.9984 14.0392 20.3061 16.0182 19.0347 17.6127C17.7632 19.2072 15.9882 20.3228 14 20.7769M4.57856 17.093C4.03307 16.3004 3.61876 15.4252 3.35156 14.501M3.125 10.5C3.285 9.55002 3.593 8.65002 4.025 7.82502L4.194 7.52002M6.90625 4.5789C7.8419 3.9348 8.89157 3.47462 9.99925 3.2229" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Kanban" feature-section artifact.
 *
 * @returns The kanban board contents, filling its container.
 */
export default function KanbanArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="kanban">
        {/* Open column */}
        <div className={`${styles.columnHeader} ${styles.columnOpen}`}>
          <span className={styles.iconOpen}>
            <CircleIcon size={22} />
          </span>
          <h3 className={styles.columnTitle}>{OPEN_LABEL}</h3>
          <span className={styles.count}>4</span>
        </div>

        <div className={`${styles.card} ${styles.openA}`}>
          <CommentThreadCard
            flat
            avatarInitial="G"
            avatarTone="orange"
            author="Guest"
            timeAgo="1h"
            bodyText={GUEST_TEXT}
          />
        </div>

        <div className={`${styles.card} ${styles.openB}`}>
          <CommentThreadCard
            flat
            avatarInitial="E"
            avatarTone="gray"
            author="Emma"
            timeAgo="2w"
            edited
            bodyText={EMMA_TEXT}
            mention={MENTION}
          />
        </div>

        <div className={`${styles.card} ${styles.openC}`}>
          <CommentThreadCard
            flat
            avatarInitial="P"
            avatarTone="green"
            author="Priya"
            timeAgo="3h"
            bodyText={PRIYA_TEXT}
          />
        </div>

        <div className={`${styles.card} ${styles.openD}`}>
          <CommentThreadCard
            flat
            avatarInitial="D"
            avatarTone="orange"
            author="Devon"
            timeAgo="1d"
            bodyText={DEVON_TEXT}
          />
        </div>

        {/* In Progress column (bleeds off the right edge) */}
        <div className={`${styles.columnHeader} ${styles.columnProgress}`}>
          <span className={styles.iconProgress}>
            <ProgressIcon size={22} />
          </span>
          <h3 className={styles.columnTitle}>{IN_PROGRESS_LABEL}</h3>
          <span className={styles.count}>3</span>
        </div>

        <div className={`${styles.card} ${styles.progressA}`}>
          <CommentThreadCard
            flat
            avatarInitial="R"
            avatarTone="green"
            author="Romulus"
            timeAgo="2w"
            edited
            bodyText={ROMULUS_TEXT}
            mention={MENTION}
          />
        </div>

        <div className={`${styles.card} ${styles.progressB}`}>
          <CommentThreadCard
            flat
            avatarInitial="A"
            avatarTone="gray"
            author="Ava"
            timeAgo="4h"
            bodyText={AVA_TEXT}
          />
        </div>

        <div className={`${styles.card} ${styles.progressC}`}>
          <CommentThreadCard
            flat
            avatarInitial="L"
            avatarTone="orange"
            author="Leo"
            timeAgo="6h"
            bodyText={LEO_TEXT}
          />
        </div>

        <div className={styles.fade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}
