import type { ReactNode } from "react";
import styles from "./AllDevicesArtifact.module.css";
import BrowserChrome from "./BrowserChrome";
import CommentThreadCard from "./CommentThreadCard";

/**
 * Feature-section app-window artifact — "All Devices".
 *
 * Shows the same review happening on two device frames — a large desktop
 * browser window (which bleeds off the right edge) and a phone sitting in front
 * of it — each carrying a Superflow comment (the shared {@link CommentThreadCard},
 * scaled to fit the frame). Conveys "both views, findings tagged by device."
 */

const AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";
const AUTHOR_NAME = "Milton";
const TIME_AGO = "2w";
const COMMENT_TEXT = "Let\u2019s update this";
const COMMENT_MENTION = "@Mark";
const STATUS_LABEL = "Open";
const REPLY_LABEL = "1 Reply";

/**
 * Render the "All Devices" feature-section artifact.
 *
 * @returns The All Devices window contents, filling its container.
 */
export default function AllDevicesArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="all-devices">
        {/* Desktop browser window (sits behind the phone, bleeds off the right). */}
        <div className={styles.desktop}>
          <BrowserChrome className={styles.desktopChrome} address="your-site.com" />
          <div className={styles.desktopBody} aria-hidden="true">
            <span className={styles.pageBlock} />
            <span className={`${styles.pageBar} ${styles.pageBarShort}`} />
            <span className={styles.pageBar} />
          </div>

          <div className={styles.desktopComment}>
            <CommentThreadCard
              avatarSrc={AVATAR_SRC}
              author={AUTHOR_NAME}
              timeAgo={TIME_AGO}
              edited
              bodyText={COMMENT_TEXT}
              mention={COMMENT_MENTION}
              status={STATUS_LABEL}
              replyLabel={REPLY_LABEL}
            />
          </div>
        </div>

        {/* Phone (sits in front, bleeding slightly off the bottom). */}
        <div className={styles.mobile}>
          <div className={styles.mobileScreen}>
            <span className={styles.notch} aria-hidden="true" />
            <div className={styles.mobileBody} aria-hidden="true">
              <span className={styles.mobileHero} />
              <span className={styles.pageBar} />
              <span className={`${styles.pageBar} ${styles.pageBarShort}`} />
            </div>

            <div className={styles.mobileComment}>
              <CommentThreadCard
                avatarSrc={AVATAR_SRC}
                author={AUTHOR_NAME}
                timeAgo={TIME_AGO}
                bodyText={COMMENT_TEXT}
                mention={COMMENT_MENTION}
                replyLabel={REPLY_LABEL}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
