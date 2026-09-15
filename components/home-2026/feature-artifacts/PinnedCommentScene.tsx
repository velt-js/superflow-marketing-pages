import type { ReactNode } from "react";
import styles from "./PinnedCommentScene.module.css";
import PinScene from "./PinScene";
import type { AddressAlign } from "./BrowserChrome";
import CommentThreadCard, { type CommentThreadCardProps } from "./CommentThreadCard";
import AgentCommentCard, { type AgentCommentCardProps } from "./AgentCommentCard";
import CommentPin from "./CommentPin";
import LegoFaceIcon from "./LegoFaceIcon";

/**
 * Shared scene for the "Pinned Comments", "Auto Screenshot" and "Live Site"
 * feature-section artifacts. All three are the same surface — a live page
 * ({@link PinScene}) with a comment pinned to the dashed element: a purple
 * teardrop avatar pin anchored at the comment card's corner, plus the
 * {@link CommentThreadCard} dialog (status/flag/resolve header, author row,
 * "@mention" body and reply row).
 *
 * The variants are thin prop flips over this one component:
 * - Auto Screenshot embeds the auto-captured page snapshot inside the card
 *   ({@link PinnedCommentSceneProps.screenshot}).
 * - Live Site turns on the chrome's green "Live" pill and the stale "Static
 *   copy" ghost card ({@link PinnedCommentSceneProps.live}) and overrides the
 *   comment copy to read against the live build.
 * - Versioning turns on the left VERSION rail ({@link
 *   PinnedCommentSceneProps.versions}); the comment shifts right to stay
 *   centred on the widened element.
 * The comment author, time, body and mention are all configurable so a variant
 * need not fork the scene just to change a line of copy.
 */

const AVATAR_SRC = "/images/home-2026/hero/private-avatar.png";
const STATUS_LABEL = "Open";
const DEFAULT_AUTHOR = "Milton";
const DEFAULT_TIME_AGO = "2w";
const DEFAULT_COMMENT_TEXT = "Let\u2019s update this";
const DEFAULT_MENTION = "@Mark";
const DEFAULT_REPLY_LABEL = "1 Reply";

/** Fallbacks for the agent-finding card when a field is not supplied. */
const DEFAULT_AGENT_NAME = "Agent";
const DEFAULT_AGENT_TIME = "3h";
/** Default avatar mark for the agent finding (four-dot multicolor agent mark). */
const DEFAULT_AGENT_AVATAR_VARIANT = "agentDots" as const;

/** Teardrop fill + avatar size of the agent pin (matches the RunOnDemand pin). */
const AGENT_PIN_TONE = "#6a5cf6";
const PIN_SIZE = 28;

/** Positioning preset for the pinned comment group. */
export type PinnedCommentThreadVariant = "default" | "text" | "threaded" | "robust";

/** Props for {@link PinnedCommentScene}. */
export interface PinnedCommentSceneProps {
  /**
   * Value for the root's `data-artifact` hook, distinguishing the views
   * (e.g. "pinned-comments", "auto-screenshot" or "live-site").
   */
  dataArtifact: string;
  /**
   * When true, the comment embeds the auto-captured page snapshot inside the
   * card (the Auto Screenshot view). Defaults to false (plain Pinned Comments).
   */
  screenshot?: boolean;
  /**
   * When true, render the Live Site variant: the chrome shows a lowercase live
   * URL with a green "Live" pill and a stale "Static copy" ghost card peeks out
   * from behind the selected element. Defaults to false.
   */
  live?: boolean;
  /**
   * When provided (and non-empty), render the Versioning variant: a left rail
   * of stacked VERSION buttons (first active, rest muted). Omit to leave the
   * plain scene untouched.
   */
  versions?: readonly string[];
  /** Comment author's name. Defaults to "Milton". */
  author?: string;
  /** Relative timestamp shown after the author. Defaults to "2w". */
  timeAgo?: string;
  /** Whether the comment shows the muted "(EDITED)" tag. Defaults to true. */
  edited?: boolean;
  /** The comment body text. Defaults to "Let’s update this". */
  bodyText?: string;
  /** Optional purple "@mention" chip. Defaults to "@Mark". */
  mention?: string;
  /**
   * Reply-row label. When omitted, the durable-comment variant ("default")
   * falls back to "1 Reply"; the comments-feature variants (text / threaded /
   * robust) show no reply row unless one is passed explicitly.
   */
  replyLabel?: string;
  /** Optional alternate positioning/width preset for comments-feature artifacts. */
  threadVariant?: PinnedCommentThreadVariant;
  /** Optional list/grid switcher on the page scene (Robust Anchor artifact). */
  viewSwitcher?: boolean;
  /**
   * When true (with `threadVariant="text"`), play the opt-in text-selection
   * choreography: the highlighted run is swept in yellow like a dragged
   * selection, then the pin drops onto it and the comment card unfolds. Other
   * consumers omit this and keep the shared entrance, so they are unaffected.
   * Defaults to false.
   */
  textSelectAnimation?: boolean;
  /**
   * When true, suppress the panel-width browser chrome so the scene can be
   * fitted into the hero product window (via `CommentsHeroFit`), which renders
   * its own full-width chrome band on top. Feature-section usage omits this, so
   * the chrome renders unchanged. Defaults to false.
   */
  hero?: boolean;
  /** Optional prop overrides for the shared comment dialog. */
  cardProps?: Partial<CommentThreadCardProps>;
  /**
   * Optional address for the page's browser chrome (forwarded to {@link PinScene}).
   * Lets consumers such as the authenticated-pages behind-login scenes show the
   * real login domain instead of the generic placeholder.
   */
  address?: string;
  /** Alignment of the chrome address. Forwarded to {@link PinScene}. */
  addressAlign?: AddressAlign;
  /**
   * When provided, the pinned popover renders the {@link AgentCommentCard}
   * (an AI-agent finding with approve/reject actions) instead of the threaded
   * {@link CommentThreadCard}, and the teardrop pin swaps its person photo for
   * the white {@link LegoFaceIcon} agent glyph — matching the "Run on Demand"
   * hero artifact. The card avatar defaults to the four-dot `agentDots` mark.
   * The rest of the scene (page surface) is unchanged. Used by the "Findings"
   * tab on the review-agents feature page.
   */
  agentCard?: Partial<AgentCommentCardProps>;
}

/**
 * Render the shared pinned-comment scene.
 *
 * @param props - The artifact hook, the screenshot/live toggles and the
 *   configurable comment copy.
 * @returns The scene contents, filling its container.
 */
export default function PinnedCommentScene({
  dataArtifact,
  screenshot = false,
  live = false,
  versions,
  author = DEFAULT_AUTHOR,
  timeAgo = DEFAULT_TIME_AGO,
  edited = true,
  bodyText = DEFAULT_COMMENT_TEXT,
  mention = DEFAULT_MENTION,
  replyLabel,
  threadVariant = "default",
  viewSwitcher = false,
  hero = false,
  textSelectAnimation = false,
  cardProps,
  agentCard,
  address,
  addressAlign,
}: PinnedCommentSceneProps): ReactNode {
  try {
    const isTextSelect = threadVariant === "text";
    const animateTextSelect = textSelectAnimation && isTextSelect;
    // Only the durable-comment scene (Pinned/Auto/Versioning/Live) defaults to
    // a "1 Reply" row. The comments-feature variants end on their own trailing
    // element (composer, attachment, reactions), so they show a reply row only
    // when the caller passes one explicitly.
    const resolvedReplyLabel =
      replyLabel !== undefined
        ? replyLabel
        : threadVariant === "default"
          ? DEFAULT_REPLY_LABEL
          : undefined;
    const threadClassNames = [styles.thread];
    if (screenshot) {
      threadClassNames.push(styles.threadShot);
    } else if (versions?.length) {
      threadClassNames.push(styles.threadVersions);
    }
    if (isTextSelect) {
      threadClassNames.push(styles.threadText);
    } else if (threadVariant === "threaded") {
      threadClassNames.push(styles.threadThreaded);
    } else if (threadVariant === "robust") {
      threadClassNames.push(styles.threadRobust);
    }
    if (animateTextSelect) {
      threadClassNames.push(styles.threadTextAnim);
    }
    // The agent-finding card is a touch wider than the threaded dialog, so its
    // thread group widens to the card's native width.
    if (agentCard) {
      threadClassNames.push(styles.threadAgent);
    }
    const threadClassName = threadClassNames.join(" ");
    const { className: cardOverrideClassName, ...resolvedCardProps } = cardProps ?? {};
    const cardClassName = cardOverrideClassName
      ? `${styles.card} ${cardOverrideClassName}`
      : styles.card;
    const agentCardClassName = agentCard?.className
      ? `${styles.card} ${agentCard.className}`
      : styles.card;

    return (
      <div className={styles.root} data-artifact={dataArtifact}>
        <PinScene
          live={live}
          versions={versions}
          viewSwitcher={viewSwitcher}
          textSelect={isTextSelect}
          textSelectAnimate={animateTextSelect}
          hero={hero}
          address={address}
          addressAlign={addressAlign}
        />

        <div className={threadClassName}>
          {agentCard ? (
            <CommentPin
              className={styles.pin}
              size={PIN_SIZE}
              tone={AGENT_PIN_TONE}
              glyph={<LegoFaceIcon size={PIN_SIZE} />}
            />
          ) : (
            <CommentPin avatarSrc={AVATAR_SRC} className={styles.pin} size={PIN_SIZE} />
          )}

          {agentCard ? (
            <AgentCommentCard
              className={agentCardClassName}
              agentName={agentCard.agentName ?? DEFAULT_AGENT_NAME}
              timeAgo={agentCard.timeAgo ?? DEFAULT_AGENT_TIME}
              title={agentCard.title ?? ""}
              description={agentCard.description ?? ""}
              avatarSrc={agentCard.avatarSrc}
              avatarVariant={agentCard.avatarVariant ?? DEFAULT_AGENT_AVATAR_VARIANT}
              replyLabel={agentCard.replyLabel}
              showActions={agentCard.showActions}
              showMenu={agentCard.showMenu}
              interactive={agentCard.interactive}
            />
          ) : (
            <CommentThreadCard
              className={cardClassName}
              avatarSrc={AVATAR_SRC}
              author={author}
              timeAgo={timeAgo}
              edited={edited}
              bodyText={bodyText}
              mention={mention}
              status={STATUS_LABEL}
              showScreenshot={screenshot}
              replyLabel={resolvedReplyLabel}
              {...resolvedCardProps}
            />
          )}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
