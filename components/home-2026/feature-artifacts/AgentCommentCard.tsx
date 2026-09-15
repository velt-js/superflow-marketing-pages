import type { ReactNode } from "react";
import Image from "next/image";
import SuperflowBrandMark from "./SuperflowBrandMark";
import SuperflowAgentDotsMark from "./SuperflowAgentDotsMark";
import styles from "./AgentCommentCard.module.css";

/**
 * Shared "agent comment" card for the 2026 homepage / feature-page artifacts.
 *
 * Reproduces the Figma agent-finding card (node `894:1118`): a header with the
 * Superflow brand-mark avatar, the agent name and a relative time + overflow
 * menu; a title + description body; and a footer whose right side carries the
 * green "approve" and coral "reject" actions (an optional reply row sits on the
 * left). Every posted agent finding on the marketing site should compose from
 * this component instead of hand-rolling the card markup.
 *
 * The card is presentational (no client state) and prop-driven; positioning and
 * sizing are left to the caller via {@link AgentCommentCardProps.className}. The
 * default 24px avatar is the Superflow dots mark on a purple gradient; pass
 * {@link AgentCommentCardProps.avatarSrc} to show a specific agent image.
 */

/** Accessible label for the approve action. */
const APPROVE_LABEL = "Approve";
/** Accessible label for the reject action. */
const REJECT_LABEL = "Reject";
/** Accessible label for the header overflow menu. */
const MENU_LABEL = "More options";

/** Diameter (px) of the avatar (brand mark or image). */
const AVATAR_SIZE = 24;
/** Icon size (px) for the approve/reject action buttons. */
const ACTION_ICON_SIZE = 18;
/** Icon size (px) for the header overflow-menu dots. */
const MENU_ICON_SIZE = 16;
/** Icon size (px) for the optional reply-row arrow. */
const REPLY_ICON_SIZE = 16;

/**
 * Tabler `check` glyph shown inside the green approve button.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The check `<svg>` element.
 */
function CheckIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12.5L9.5 17L19 7" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Tabler `x` glyph shown inside the coral reject button.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The close `<svg>` element.
 */
function XIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M17 7L7 17M7 7L17 17" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Tabler `dots` glyph (three horizontal dots) for the header overflow menu.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The dots `<svg>` element.
 */
function DotsIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Reply arrow glyph shown beside the optional footer reply label.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The reply-arrow `<svg>` element.
 */
function ReplyIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M9 7L4 11L9 15" />
        <path d="M4 11H14A5 5 0 0 1 19 16V18" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Which default mark fills the gradient avatar tile when no image is given. */
export type AgentAvatarVariant = "brand" | "agentDots";

/**
 * Render the card avatar: an agent image when {@link avatarSrc} is supplied,
 * otherwise the gradient tile with either the six-dot Superflow brand mark
 * (default) or the four-dot multicolor agent mark ({@link variant}).
 *
 * @param root0 - Avatar props.
 * @param root0.avatarSrc - Optional agent image source.
 * @param root0.agentName - Agent name, used as the image alt text.
 * @param root0.variant - Which default mark to draw in the tile.
 * @returns The avatar node.
 */
function AgentAvatar({
  avatarSrc,
  agentName,
  variant,
}: {
  avatarSrc?: string;
  agentName: string;
  variant: AgentAvatarVariant;
}): ReactNode {
  try {
    if (avatarSrc) {
      return (
        <Image
          className={styles.avatarImage}
          src={avatarSrc}
          alt={agentName}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
        />
      );
    }

    return (
      <span className={styles.brandAvatar} aria-hidden="true">
        {variant === "agentDots" ? (
          <SuperflowAgentDotsMark className={styles.brandMarkGlyph} />
        ) : (
          <SuperflowBrandMark className={styles.brandMarkGlyph} />
        )}
      </span>
    );
  } catch {
    return null;
  }
}

/** Props for {@link AgentCommentCard}. */
export interface AgentCommentCardProps {
  /** Class applied to the card root, used to position/size it. */
  className?: string;
  /** Agent name shown in the header (e.g. "Grammar Check"). */
  agentName: string;
  /** Relative timestamp shown in the header (e.g. "3h"). */
  timeAgo: string;
  /** Bold finding title. */
  title: string;
  /**
   * Supporting description shown under the title. Pass an empty string to omit
   * the description line entirely (e.g. a one-line proactive flag).
   */
  description: string;
  /**
   * Optional agent avatar image. When omitted, a gradient tile with the
   * {@link avatarVariant} mark is rendered instead.
   */
  avatarSrc?: string;
  /**
   * Which default mark fills the gradient avatar tile when {@link avatarSrc} is
   * omitted: the six-dot Superflow brand mark ("brand", default) or the
   * four-dot multicolor agent mark ("agentDots"). Defaults to "brand".
   */
  avatarVariant?: AgentAvatarVariant;
  /**
   * Optional reply-row label (e.g. "1 Reply"). When omitted, the footer keeps
   * the approve/reject actions right-aligned with no reply row (matching Figma).
   */
  replyLabel?: string;
  /** Whether the approve/reject actions are shown. Defaults to true. */
  showActions?: boolean;
  /** Whether the header overflow-menu dots are shown. Defaults to true. */
  showMenu?: boolean;
  /**
   * Whether the approve/reject actions are real buttons. Marketing surfaces
   * that only illustrate a finding (agent cards, scaled artifact mocks) pass
   * false so the actions render as decorative marks: no dead controls in the
   * tab order and no undersized tap targets. Defaults to true.
   */
  interactive?: boolean;
}

/**
 * Render the shared agent comment card (header + title/description + footer
 * approve/reject actions). See {@link AgentCommentCardProps} for the content
 * and layout hooks.
 *
 * @param props - The card content and optional positioning class.
 * @returns The agent comment card element.
 */
export default function AgentCommentCard({
  className,
  agentName,
  timeAgo,
  title,
  description,
  avatarSrc,
  avatarVariant = "brand",
  replyLabel,
  showActions = true,
  showMenu = true,
  interactive = true,
}: AgentCommentCardProps): ReactNode {
  try {
    const rootClassName = className ? `${styles.card} ${className}` : styles.card;

    return (
      <article className={rootClassName}>
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.identity}>
              <AgentAvatar
                avatarSrc={avatarSrc}
                agentName={agentName}
                variant={avatarVariant}
              />
              <span className={styles.agentName}>{agentName}</span>
            </span>
            <span className={styles.headerMeta}>
              <span className={styles.time}>{timeAgo}</span>
              {showMenu ? (
                <button
                  type="button"
                  className={styles.menuButton}
                  aria-label={MENU_LABEL}
                >
                  <DotsIcon size={MENU_ICON_SIZE} />
                </button>
              ) : null}
            </span>
          </div>

          <div className={styles.content}>
            <p className={styles.title}>{title}</p>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
        </div>

        <div className={styles.footer}>
          {replyLabel ? (
            <span className={styles.reply}>
              <ReplyIcon size={REPLY_ICON_SIZE} />
              <span className={styles.replyText}>{replyLabel}</span>
            </span>
          ) : (
            <span className={styles.footerSpacer} aria-hidden="true" />
          )}

          {showActions && interactive ? (
            <span className={styles.actions}>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.approve}`}
                aria-label={APPROVE_LABEL}
              >
                <CheckIcon size={ACTION_ICON_SIZE} />
              </button>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.reject}`}
                aria-label={REJECT_LABEL}
              >
                <XIcon size={ACTION_ICON_SIZE} />
              </button>
            </span>
          ) : null}
          {showActions && !interactive ? (
            <span className={styles.actions} aria-hidden="true">
              <span className={`${styles.actionButton} ${styles.approve}`}>
                <CheckIcon size={ACTION_ICON_SIZE} />
              </span>
              <span className={`${styles.actionButton} ${styles.reject}`}>
                <XIcon size={ACTION_ICON_SIZE} />
              </span>
            </span>
          ) : null}
        </div>
      </article>
    );
  } catch {
    return null;
  }
}
