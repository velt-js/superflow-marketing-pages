import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import BrowserChrome from "../feature-artifacts/BrowserChrome";
import CommentPin from "../feature-artifacts/CommentPin";
import styles from "./AgentsAtWorkArtifact.module.css";

/**
 * Hero tab artifact — "Agents at Work".
 *
 * A browser window showing a live website wireframe that QA agents are
 * reviewing in real time. Three labelled agent cursors (Superflow-style
 * multiplayer pointers) fly in one after another, "select" a target element
 * (a headline typo, a broken nav link, an image missing alt text) and drop a
 * comment pinned to it — exactly the way a human reviewer would with Superflow.
 *
 * Each agent's cursor, selection sweep and comment are anchored to their target
 * element in normal document flow, so the whole scene tracks the real (fluid)
 * window width. Everything is CSS-only and replays on tab mount. Reduced-motion
 * rests in the finished state (all comments dropped).
 */

const ADDRESS = "northwind.com";

/** Brand wordmark + nav labels for the mocked site. */
const BRAND = "Northwind";
const NAV_FEATURES = "Features";
const NAV_PRICING = "Pricing";
const NAV_DOCS = "Docs";
const CTA_LABEL = "Get started";

/** Hero copy. The headline carries a deliberate typo for the Spell Check agent. */
const EYEBROW = "SHIP FASTER";
const HEADLINE_LEAD = "Design, review and";
const HEADLINE_TAIL = "ship sites ";
const HEADLINE_TYPO = "effortlesly";
const SUBHEAD = "The collaborative platform for modern web teams.";
const HERO_PRIMARY = "Get a demo";
const HERO_SECONDARY = "Watch video";

/** Agent identities (label shown on the cursor + as the comment author). */
const SPELL_AGENT = "Spell Check";
const LINKS_AGENT = "Broken Links";
const ALT_AGENT = "Alt Text";

/** Agent findings (the dropped comment body). */
const SPELL_FINDING = "Typo — \u201Ceffortlessly\u201D";
const LINKS_FINDING = "Broken link · returns 404";
const ALT_FINDING = "Image is missing alt text";

/** Agent tones (mirror the hero check palette + brand purple). */
const SPELL_TONE = "#3555dd";
const LINKS_TONE = "#038e31";
const ALT_TONE = "#625df5";

const NOW_LABEL = "now";

/** Avatar for the AI agents (no real photo). A generated gradient blob shared
 * by both the dropped pin and each comment bubble's author avatar, in place of
 * the person photo used by the canonical Pinned/Private comment pin. */
const AGENT_AVATAR = "/images/home-2026/hero/agent-avatar.svg";

/** Diameter (px) of the comment bubble's author avatar. */
const COMMENT_AVATAR_SIZE = 26;

/**
 * One positioned agent finding overlaid on the reviewed website. Each entry
 * fills one of the artifact's three fixed target slots, in order: the headline
 * word (0), the nav link (1) and the hero media (2). Only the fields the
 * dropped-comment card actually renders are configurable — the shared gradient
 * avatar and the settled-scene layout are fixed, and the card offers no
 * approve/reject or status treatment (that lives on {@link AgentCommentCard}).
 */
export interface AgentReviewComment {
  /** Agent name shown on the fly-in cursor pill and as the comment author. */
  agentName: string;
  /** Timestamp label in the comment header (defaults to {@link NOW_LABEL}). */
  timeLabel?: string;
  /** The finding text rendered as the comment body. */
  text: string;
  /**
   * Optional cursor arrow + label-pill accent tone. Defaults to the built-in
   * tone of the slot the finding fills, so overriding it is never required.
   */
  tone?: string;
}

/** Props for the "Agents at Work" artifact. */
export interface AgentsAtWorkArtifactProps {
  /**
   * Overrides for the up-to-three positioned agent findings, in target order
   * (headline word, nav link, hero media). Provide fewer entries to render
   * fewer findings — the remaining target slots simply show no cursor or
   * comment while the site chrome stays intact. Omit entirely to keep the
   * default spell-check / broken-link / alt-text findings.
   */
  comments?: ReadonlyArray<AgentReviewComment>;
}

/**
 * Default findings, in slot order. These reproduce the artifact's original
 * hard-coded content exactly so every consumer that renders it without a
 * `comments` prop is unchanged.
 */
const DEFAULT_COMMENTS: ReadonlyArray<AgentReviewComment> = [
  { agentName: SPELL_AGENT, text: SPELL_FINDING, tone: SPELL_TONE },
  { agentName: LINKS_AGENT, text: LINKS_FINDING, tone: LINKS_TONE },
  { agentName: ALT_AGENT, text: ALT_FINDING, tone: ALT_TONE },
];

/** Props for the reusable Superflow-style agent cursor. */
type AgentCursorProps = {
  /** Agent tone (arrow fill + label pill background). */
  tone: string;
  /** Agent name shown on the label pill. */
  label: string;
  /** Positioning + animation class from the module. */
  className: string;
};

/**
 * Render a Superflow-style multiplayer cursor: a tone-filled arrow with a white
 * edge and a rounded name pill tucked to its lower-right.
 *
 * @param props - Tone, label and the positioning/animation class.
 * @returns The cursor element.
 */
function AgentCursor({ tone, label, className }: AgentCursorProps): ReactNode {
  try {
    return (
      <span
        className={`${styles.cursor} ${className}`}
        style={{ "--tone": tone } as CSSProperties}
        aria-hidden="true"
      >
        <svg
          className={styles.cursorArrow}
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M15.9231 18.0296C16.0985 18.4505 15.9299 20.0447 15 20.4142C14.0701 20.7837 12.882 20.4142 12.882 20.4142L10.726 16.1024L7 19.8284V3L18.4142 14.4142H14.1615C14.3702 14.8144 15.7003 17.4948 15.9231 18.0296Z"
            fill={tone}
            stroke="#ffffff"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.cursorLabel}>{label}</span>
      </span>
    );
  } catch {
    return null;
  }
}

/** Props for the compact dropped-comment bubble. */
type AgentCommentProps = {
  /** Comment author / agent name. */
  name: string;
  /** The finding text. */
  text: string;
  /** Positioning + animation class from the module. */
  className: string;
  /** Timestamp label beside the name (defaults to {@link NOW_LABEL}). */
  time?: string;
};

/**
 * Render a compact "dropped comment" bubble: the shared gradient agent avatar,
 * the agent name + timestamp and the finding text.
 *
 * @param props - Author name, finding text, timestamp label and position.
 * @returns The comment bubble element.
 */
function AgentComment({
  name,
  text,
  className,
  time = NOW_LABEL,
}: AgentCommentProps): ReactNode {
  try {
    return (
      <div className={`${styles.comment} ${className}`} aria-hidden="true">
        <span className={styles.commentAvatar}>
          <Image
            className={styles.commentAvatarImg}
            src={AGENT_AVATAR}
            alt=""
            width={COMMENT_AVATAR_SIZE}
            height={COMMENT_AVATAR_SIZE}
            unoptimized
          />
        </span>
        <div className={styles.commentBody}>
          <span className={styles.commentHead}>
            <span className={styles.commentName}>{name}</span>
            <span className={styles.commentTime}>{time}</span>
          </span>
          <span className={styles.commentText}>{text}</span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Agents at Work" hero artifact.
 *
 * The three positioned agent findings (headline word, nav link, hero media)
 * default to the built-in spell-check / broken-link / alt-text copy, but a
 * caller can pass {@link AgentsAtWorkArtifactProps.comments} to relabel them
 * (e.g. memory-grounded findings) or render fewer of them. The reviewed-site
 * chrome is always drawn regardless of how many findings are shown.
 *
 * @param props - Optional per-slot finding overrides.
 * @returns The reviewed-website window contents.
 */
export default function AgentsAtWorkArtifact({
  comments,
}: AgentsAtWorkArtifactProps = {}): ReactNode {
  try {
    // Slot order maps to the three fixed targets below: 0 = headline word,
    // 1 = nav link, 2 = hero media. A missing slot renders no finding but keeps
    // its target element (site chrome) intact.
    const resolvedComments = comments ?? DEFAULT_COMMENTS;
    const spellComment = resolvedComments?.[0];
    const linksComment = resolvedComments?.[1];
    const altComment = resolvedComments?.[2];

    return (
      <div className={styles.root} data-artifact="agents-at-work">
        <div className={styles.chromeWrap}>
          <BrowserChrome className={styles.chrome} address={ADDRESS} />
        </div>

        <div className={styles.viewport}>
          <div className={styles.site}>
            {/* --- site nav --- */}
            <nav className={styles.nav}>
              <span className={styles.brand}>
                <span className={styles.brandMark} aria-hidden="true" />
                {BRAND}
              </span>
              <span className={styles.navLinks}>
                <span className={styles.navLink}>{NAV_FEATURES}</span>
                {/* Nav-link agent target (slot 1) */}
                <span className={styles.navTarget}>
                  <span className={styles.targetText}>{NAV_PRICING}</span>
                  {linksComment ? (
                    <>
                      <span className={`${styles.sel} ${styles.selLink}`} aria-hidden="true" />
                      <AgentComment
                        name={linksComment.agentName}
                        text={linksComment.text}
                        time={linksComment.timeLabel}
                        className={styles.commentLink}
                      />
                      <AgentCursor
                        tone={linksComment.tone ?? LINKS_TONE}
                        label={linksComment.agentName}
                        className={styles.cursorLink}
                      />
                    </>
                  ) : null}
                </span>
                <span className={styles.navLink}>{NAV_DOCS}</span>
              </span>
              <span className={styles.cta}>{CTA_LABEL}</span>
            </nav>

            {/* --- hero --- */}
            <div className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>{EYEBROW}</span>
                {/* Decorative mock-website headline — intentionally NOT an <h1>.
                    This artifact embeds inside real pages (homepage hero, the
                    review-agents feature hero, and the Webflow/WordPress/GTM
                    install pages via the "review-agents" feature mock), so a
                    real heading here produces a duplicate document H1. */}
                <div className={styles.headline}>
                  {HEADLINE_LEAD}
                  <br />
                  {HEADLINE_TAIL}
                  {/* Headline-word agent target (slot 0) */}
                  <span className={styles.wordTarget}>
                    <span className={styles.targetText}>{HEADLINE_TYPO}</span>
                    {spellComment ? (
                      <>
                        <span className={`${styles.sel} ${styles.selWord}`} aria-hidden="true" />
                        <AgentComment
                          name={spellComment.agentName}
                          text={spellComment.text}
                          time={spellComment.timeLabel}
                          className={styles.commentSpell}
                        />
                        <AgentCursor
                          tone={spellComment.tone ?? SPELL_TONE}
                          label={spellComment.agentName}
                          className={styles.cursorSpell}
                        />
                      </>
                    ) : null}
                  </span>
                </div>
                <p className={styles.subhead}>{SUBHEAD}</p>
                <div className={styles.heroButtons}>
                  <span className={`${styles.btn} ${styles.btnPrimary}`}>{HERO_PRIMARY}</span>
                  <span className={`${styles.btn} ${styles.btnGhost}`}>{HERO_SECONDARY}</span>
                </div>
              </div>

              {/* Hero-media agent target (slot 2) */}
              <div className={styles.heroMediaTarget}>
                <div className={styles.heroMedia}>
                  <svg
                    className={styles.mediaIcon}
                    width={40}
                    height={40}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2.5" />
                    <circle cx="8.5" cy="9.5" r="1.5" />
                    <path d="M21 15L16 10L5 20" />
                  </svg>
                </div>
                {altComment ? (
                  <>
                    <span className={`${styles.sel} ${styles.selImg}`} aria-hidden="true" />
                    <CommentPin avatarSrc={AGENT_AVATAR} className={styles.pin} size={26} />
                    <AgentComment
                      name={altComment.agentName}
                      text={altComment.text}
                      time={altComment.timeLabel}
                      className={styles.commentAlt}
                    />
                    <AgentCursor
                      tone={altComment.tone ?? ALT_TONE}
                      label={altComment.agentName}
                      className={styles.cursorAlt}
                    />
                  </>
                ) : null}
              </div>
            </div>

            {/* --- feature row (wireframe filler) --- */}
            <div className={styles.features}>
              {[0, 1, 2].map((cardIndex) => (
                <div key={`feature-${cardIndex}`} className={styles.featureCard} aria-hidden="true">
                  <span className={styles.featureThumb} />
                  <span className={styles.featureTitle} />
                  <span className={styles.featureLine} />
                  <span className={`${styles.featureLine} ${styles.featureLineShort}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
