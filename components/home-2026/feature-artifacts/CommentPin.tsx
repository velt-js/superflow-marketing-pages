import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import styles from "./CommentPin.module.css";

/**
 * Shared "dropped comment" pin — a purple teardrop marker (round except a
 * pointed bottom-left corner) wrapping a circular avatar. This is the single
 * source of truth for the pin visual used both by the Pinned/Private comment
 * feature scene ({@link PinnedCommentScene}) and by the "Agents at Work" hero
 * artifact, so the two stay pixel-identical.
 *
 * The avatar can be:
 * - a photo/graphic (the default, driven by {@link CommentPinProps.avatarSrc}),
 * - an arbitrary white glyph drawn directly on the tone teardrop (pass
 *   {@link CommentPinProps.glyph} — e.g. the agent app icon used by the
 *   agent-finding scene and the "Run on Demand" hero artifact), or
 * - a single-character glyph on a white disc (set
 *   {@link CommentPinProps.hasImage} to false) — the character reads in the
 *   {@link CommentPinProps.tone} color, matching the look the pin had before the
 *   photo swap.
 *
 * The component owns ONLY the pin visual (teardrop container + avatar).
 * Absolute position, z-index and entrance animation differ per consumer and are
 * layered on via the {@link CommentPinProps.className} the caller passes (CSS
 * module class merging), never hardcoded here.
 */

/** Canonical teardrop fill (Superflow brand purple). */
const DEFAULT_TONE = "#635cf4";

/** Default avatar diameter in pixels. */
const DEFAULT_SIZE = 28;

/** Fallback glyph shown in character mode when none is supplied. */
const DEFAULT_CHARACTER = "A";

/** Ratio of glyph font-size to avatar diameter (≈12px at the 26px pin). */
const CHARACTER_FONT_RATIO = 0.46;

/** Props for {@link CommentPin}. */
export interface CommentPinProps {
  /**
   * Avatar image rendered inside the teardrop. Required when {@link hasImage}
   * is true; ignored (and safely optional) in character mode.
   */
  avatarSrc?: string;
  /** Consumer-supplied class for absolute position / z-index / entrance animation. */
  className?: string;
  /** Avatar diameter in px (default 28). */
  size?: number;
  /** Teardrop fill color — also the character color in character mode (default #635cf4). */
  tone?: string;
  /** Decorative by default. */
  alt?: string;
  /**
   * When true (default) render the {@link avatarSrc} image. When false, render a
   * single-character avatar ({@link character}) on a white disc instead.
   */
  hasImage?: boolean;
  /** Single character shown in character mode (default "A"). */
  character?: string;
  /**
   * An arbitrary glyph (e.g. an app icon) drawn centered in white directly on
   * the {@link tone} teardrop — no inner disc. Takes priority over every other
   * avatar mode. The glyph should scale to fill its box (the caller sizes it via
   * {@link size}).
   */
  glyph?: ReactNode;
}

/**
 * Render the shared teardrop comment pin.
 *
 * @param props - Avatar source, an optional positioning/animation class, the
 *   avatar diameter, the teardrop tone, the (decorative) alt text, the image /
 *   character toggle and the character-mode glyph.
 * @returns The pin element, or null if rendering fails.
 */
export default function CommentPin({
  avatarSrc,
  className,
  size = DEFAULT_SIZE,
  tone = DEFAULT_TONE,
  alt = "",
  hasImage = true,
  character = DEFAULT_CHARACTER,
  glyph,
}: CommentPinProps): ReactNode {
  try {
    const pinClassName = className ? `${styles.pin} ${className}` : styles.pin;
    const pinStyle = { "--pin-tone": tone } as CSSProperties;
    // Fall back to the character avatar whenever no image source is available,
    // so an omitted avatarSrc in image mode never crashes the render.
    const showImage = !glyph && hasImage && Boolean(avatarSrc);
    // next/image refuses to run SVGs through the optimizer (needs
    // dangerouslyAllowSVG); serve them raw instead of forcing a global config.
    const isSvg = avatarSrc?.toLowerCase().endsWith(".svg") ?? false;

    let avatar: ReactNode;
    if (glyph) {
      avatar = (
        <span className={styles.pinGlyph} style={{ width: size, height: size }}>
          {glyph}
        </span>
      );
    } else if (showImage) {
      avatar = (
        <Image
          className={styles.pinAvatar}
          src={avatarSrc as string}
          alt={alt}
          width={size}
          height={size}
          unoptimized={isSvg}
          style={{ width: size, height: size }}
        />
      );
    } else {
      avatar = (
        <span
          className={styles.pinChar}
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * CHARACTER_FONT_RATIO),
          }}
        >
          {character}
        </span>
      );
    }

    return (
      <span className={pinClassName} style={pinStyle} aria-hidden="true">
        {avatar}
      </span>
    );
  } catch {
    return null;
  }
}
