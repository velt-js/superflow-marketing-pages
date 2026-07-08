import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./PinnedCommentScene.module.css";
import PinScene from "./PinScene";
import CommentThreadCard from "./CommentThreadCard";

/**
 * Shared scene for the "Pinned Comments" and "Auto Screenshot" feature-section
 * artifacts. Both views are identical — a live page ({@link PinScene}) with a
 * comment pinned to the dashed element: a purple teardrop avatar pin anchored
 * at the comment card's corner, plus the {@link CommentThreadCard} dialog
 * (status/flag/resolve header, author row, "@mention" body and reply row).
 *
 * The only difference is Auto Screenshot embeds the auto-captured page snapshot
 * inside the same card, so the two artifacts render this one component and just
 * flip the {@link PinnedCommentSceneProps.screenshot} prop.
 */

const AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";
const STATUS_LABEL = "Open";
const AUTHOR_NAME = "Milton";
const TIME_AGO = "2w";
const COMMENT_TEXT = "Let\u2019s update this";
const COMMENT_MENTION = "@Mark";
const REPLY_LABEL = "1 Reply";

/** Props for {@link PinnedCommentScene}. */
export interface PinnedCommentSceneProps {
  /**
   * Value for the root's `data-artifact` hook, distinguishing the two views
   * (e.g. "pinned-comments" or "auto-screenshot").
   */
  dataArtifact: string;
  /**
   * When true, the comment embeds the auto-captured page snapshot inside the
   * card (the Auto Screenshot view). Defaults to false (plain Pinned Comments).
   */
  screenshot?: boolean;
}

/**
 * Render the shared pinned-comment scene.
 *
 * @param props - The artifact hook and screenshot toggle.
 * @returns The scene contents, filling its container.
 */
export default function PinnedCommentScene({
  dataArtifact,
  screenshot = false,
}: PinnedCommentSceneProps): ReactNode {
  try {
    const threadClassName = screenshot
      ? `${styles.thread} ${styles.threadShot}`
      : styles.thread;

    return (
      <div className={styles.root} data-artifact={dataArtifact}>
        <PinScene />

        <div className={threadClassName}>
          <span className={styles.pin} aria-hidden="true">
            <Image
              className={styles.pinAvatar}
              src={AVATAR_SRC}
              alt=""
              width={28}
              height={28}
            />
          </span>

          <CommentThreadCard
            className={styles.card}
            avatarSrc={AVATAR_SRC}
            author={AUTHOR_NAME}
            timeAgo={TIME_AGO}
            edited
            bodyText={COMMENT_TEXT}
            mention={COMMENT_MENTION}
            status={STATUS_LABEL}
            showScreenshot={screenshot}
            replyLabel={REPLY_LABEL}
          />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
