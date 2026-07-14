import type { ReactNode } from "react";
import PinnedCommentScene from "./PinnedCommentScene";

/** Optional shared props for the comments feature artifacts. */
export interface CommentsFeatureArtifactProps {
  /**
   * When true, the artifact is being fitted into the hero product window: the
   * panel-width browser chrome is suppressed so `CommentsHeroFit` can supply a
   * full-width chrome band. Feature-section usage omits this, so the artifact
   * renders unchanged. Defaults to false.
   */
  hero?: boolean;
}

/** Shared reply data for the comments feature artifacts. */
const EMMA_REPLY = {
  author: "Emma",
  timeAgo: "2w",
  edited: true,
  bodyText: "Cool, I will look into it",
  avatarInitial: "E",
  avatarTone: "orange" as const,
};

/** Reply body typed + posted by the animated Thread Comments artifact. */
const THREAD_REPLY_TEXT = "Cool, I will look into it";

/** The freshly-posted reply shown after the Thread Comments typing sequence. */
const THREAD_REPLY = {
  author: "Emma",
  timeAgo: "now",
  bodyText: THREAD_REPLY_TEXT,
  avatarInitial: "E",
  avatarTone: "orange" as const,
};

/**
 * Status menu options shown by the task-management artifact. "Resolved" is the
 * target the "status" choreography's pointer lands on before the pill swaps.
 */
const STATUS_OPTIONS = [
  { label: "Open", tone: "open" as const },
  { label: "In Progress", tone: "progress" as const },
  { label: "Resolved", tone: "done" as const, target: true },
];

/** Mention suggestions shown by the mentions artifact. */
const MENTION_SUGGESTIONS = [
  {
    name: "Emma",
    email: "emma@usesuperflow.com",
    avatarInitial: "E",
    avatarTone: "orange" as const,
    active: true,
  },
  {
    name: "Arnold",
    email: "arnold@usesuperflow.com",
    avatarInitial: "A",
    avatarTone: "orange" as const,
  },
  {
    name: "Jackson",
    email: "jackson@usesuperflow.com",
    avatarInitial: "J",
    avatarTone: "green" as const,
  },
];

/** Read-receipt people shown by the reactions/read-receipts artifact. */
const READ_RECEIPTS = [
  {
    name: "Emma Belcher",
    timeAgo: "2m ago",
    avatarInitial: "E",
    avatarTone: "orange" as const,
  },
  {
    name: "Marcus Pesto",
    timeAgo: "2m ago",
    avatarInitial: "M",
    avatarTone: "green" as const,
  },
  {
    name: "Leon Maurtis",
    timeAgo: "2m ago",
    avatarInitial: "L",
    avatarTone: "gray" as const,
  },
  {
    name: "Emma Belcher",
    timeAgo: "2m ago",
    avatarInitial: "E",
    avatarTone: "orange" as const,
  },
];

/**
 * Render the "Text Comments" feature-group artifact.
 *
 * @param props - Optional shared artifact props (e.g. `hero`).
 * @returns The text comments scene.
 */
export function TextCommentsArtifact({
  hero = false,
}: CommentsFeatureArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="text-comments"
        threadVariant="text"
        mention="@Mark"
        replyLabel="1 Reply"
        textSelectAnimation
        hero={hero}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Thread Comments" feature-group artifact.
 *
 * @param props - Optional shared artifact props (e.g. `hero`).
 * @returns The threaded comments scene.
 */
export function ThreadCommentsArtifact({
  hero = false,
}: CommentsFeatureArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="thread-comments"
        threadVariant="threaded"
        mention="@Emma"
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          animation: "thread-reply",
          replies: [THREAD_REPLY],
          composer: {
            text: THREAD_REPLY_TEXT,
            placeholder: "Reply...",
            typing: true,
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Tracking & Task Management" feature-group artifact.
 *
 * @param props - Optional shared artifact props (e.g. `hero`).
 * @returns The tracking/task management scene.
 */
export function TrackingTaskManagementArtifact({
  hero = false,
}: CommentsFeatureArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="tracking-task-management"
        threadVariant="threaded"
        mention="@Emma"
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          animation: "status",
          statusOptions: STATUS_OPTIONS,
          replies: [EMMA_REPLY],
          composer: { placeholder: "Reply..." },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Robust Anchor" feature-group artifact.
 *
 * @returns The robust anchor scene.
 */
export function RobustAnchorArtifact(): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="robust-anchor"
        threadVariant="robust"
        viewSwitcher
        mention="@Mark"
        replyLabel="1 Reply"
      />
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Attachment" feature-group artifact.
 *
 * @param props - Optional shared artifact props (e.g. `hero`).
 * @returns The attachment scene.
 */
export function AttachmentCommentsArtifact({
  hero = false,
}: CommentsFeatureArtifactProps = {}): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="comment-attachment"
        threadVariant="threaded"
        mention="@Emma"
        replyLabel={undefined}
        hero={hero}
        cardProps={{
          animation: "attachment",
          attachment: {
            fileName: "some_pdf_name_o...pdf",
            sizeLabel: "12MB",
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Mentions" feature-group artifact.
 *
 * @returns The mentions scene.
 */
export function MentionsCommentsArtifact(): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="comment-mentions"
        threadVariant="threaded"
        mention="@Emma"
        replyLabel={undefined}
        cardProps={{
          animation: "mentions",
          composer: {
            text: "Any update @",
            active: true,
            tools: true,
            typing: true,
            mentionSuggestions: MENTION_SUGGESTIONS,
          },
        }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Reaction & Read Receipt" feature-group artifact.
 *
 * @returns The reactions/read receipts scene.
 */
export function ReactionReadReceiptArtifact(): ReactNode {
  try {
    return (
      <PinnedCommentScene
        dataArtifact="reaction-read-receipt"
        threadVariant="threaded"
        mention="@Emma"
        edited={false}
        replyLabel={undefined}
        cardProps={{
          animation: "reactions",
          showReadReceiptBadge: true,
          reactions: [{ emoji: "👍", count: 1, active: true }],
          showAddReaction: true,
          readReceipts: READ_RECEIPTS,
          showReadReceiptPanel: true,
        }}
      />
    );
  } catch {
    return null;
  }
}
