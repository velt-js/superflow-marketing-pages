import type { ReactNode } from "react";
import styles from "./IntegrationsArtifact.module.css";
import CommentThreadCard from "./CommentThreadCard";
import {
  AsanaLogo,
  ClickUpLogo,
  LinearLogo,
  MondayLogo,
  SlackLogo,
  TrelloLogo,
  type BrandLogoProps,
} from "./BrandLogos";

/**
 * Feature-section app-window artifact — "Integrations".
 *
 * A Superflow task (the shared {@link CommentThreadCard}) on the left, linked by
 * a curved connector to a cluster of integration logo chips on the right that
 * bleeds off the edge — conveying "one-click installs; tasks sync to Slack,
 * Asana, Monday, ClickUp." The task rises in, the connector draws, then the
 * logo chips pop in with a small stagger on mount.
 */

const AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";
const AUTHOR_NAME = "Milton";
const TIME_AGO = "2w";
const COMMENT_TEXT = "Let\u2019s update the image";
const MENTION = "@Mark";
const STATUS_LABEL = "Open";
const REPLY_LABEL = "1 Reply";

/** One integration-logo chip in the cluster. */
interface LogoChip {
  id: string;
  Logo: (props: BrandLogoProps) => ReactNode;
  width: number;
  height: number;
  logoSize: number;
}

/** Uniform chip footprint so the cluster tiles into an even grid. */
const CHIP_WIDTH = 96;
const CHIP_HEIGHT = 60;

/* Row-major order (3 per row): the two visible columns carry the four tools
   named in the copy (Asana, Slack / Monday, ClickUp); Trello + Linear sit in
   the third column that bleeds off the right edge. */
const LOGO_CHIPS: readonly LogoChip[] = [
  { id: "asana", Logo: AsanaLogo, width: CHIP_WIDTH, height: CHIP_HEIGHT, logoSize: 32 },
  { id: "slack", Logo: SlackLogo, width: CHIP_WIDTH, height: CHIP_HEIGHT, logoSize: 28 },
  { id: "trello", Logo: TrelloLogo, width: CHIP_WIDTH, height: CHIP_HEIGHT, logoSize: 27 },
  { id: "monday", Logo: MondayLogo, width: CHIP_WIDTH, height: CHIP_HEIGHT, logoSize: 30 },
  { id: "clickup", Logo: ClickUpLogo, width: CHIP_WIDTH, height: CHIP_HEIGHT, logoSize: 28 },
  { id: "linear", Logo: LinearLogo, width: CHIP_WIDTH, height: CHIP_HEIGHT, logoSize: 26 },
];

/**
 * Render the "Integrations" feature-section artifact.
 *
 * @returns The task card + connector + logo cluster composition.
 */
export default function IntegrationsArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="integrations">
        {/* Curved connector bridging the task card's right edge and the logo
            cluster's left edge (the task "syncs" into the tools). Rendered 1:1
            (viewBox == CSS size) so both endpoints land exactly on the edges. */}
        <svg className={styles.connector} viewBox="0 0 44 70" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="feat-integrations-connector" gradientUnits="userSpaceOnUse" x1="2" y1="62" x2="42" y2="8">
              <stop offset="0" stopColor="#e17a14" stopOpacity="0.85" />
              <stop offset="1" stopColor="#e17a14" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            className={styles.connectorPath}
            stroke="url(#feat-integrations-connector)"
            d="M2 62 C 22 62, 22 8, 42 8"
          />
          <circle className={styles.connectorNode} cx="2" cy="62" r="3.5" fill="#e17a14" />
        </svg>

        <div className={styles.card}>
          <CommentThreadCard
            avatarSrc={AVATAR_SRC}
            author={AUTHOR_NAME}
            timeAgo={TIME_AGO}
            edited
            bodyText={COMMENT_TEXT}
            mention={MENTION}
            status={STATUS_LABEL}
            replyLabel={REPLY_LABEL}
          />
        </div>

        <div className={styles.logos}>
          {LOGO_CHIPS.map((chip) => {
            const ChipLogo = chip?.Logo;
            return (
              <span
                key={chip?.id}
                className={styles.logoChip}
                style={{ width: chip?.width, height: chip?.height }}
              >
                <ChipLogo size={chip?.logoSize} />
              </span>
            );
          })}
        </div>

        <div className={styles.fade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}
