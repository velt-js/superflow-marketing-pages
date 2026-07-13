"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./BlueprintFrame.module.css";

/** Fraction of the frame that must be visible before the draw-in entrance plays. */
const VISIBILITY_THRESHOLD = 0.2;

/** Optional per-section overrides for the frame geometry (CSS lengths/colors). */
export interface BlueprintFrameProps {
  /** Vertical inset of the horizontal rules from the section's top/bottom edges. */
  insetY?: string;
  /** Horizontal inset of the vertical rules from the viewport edges. */
  insetX?: string;
  /** Rule-line (and bolt-ring) color. */
  lineColor?: string;
}

/**
 * Shared decorative "blueprint" frame: full-bleed crossing rule-lines with a
 * small registration "bolt" at each of the four intersections, drawn in on
 * scroll. Extracted from the homepage Solution section so every surface renders
 * the identical frame from one source (markup + CSS + reveal behavior). Its
 * root self-observes and, once partially visible, adds the reveal class that
 * drives the one-shot draw-in. Non-interactive and hidden from assistive tech.
 *
 * @param props - Optional geometry overrides; omit to match the homepage frame.
 * @returns The blueprint-frame element, or `null` on failure.
 */
export default function BlueprintFrame({
  insetY,
  insetX,
  lineColor,
}: BlueprintFrameProps = {}): ReactNode {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    try {
      const frameElement = frameRef.current;
      if (!frameElement) {
        return undefined;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setIsRevealed(true);
            observer.disconnect();
          }
        },
        { threshold: VISIBILITY_THRESHOLD },
      );

      observer.observe(frameElement);
      return () => observer.disconnect();
    } catch {
      // If observation fails, reveal immediately so the frame never stays hidden.
      setIsRevealed(true);
      return undefined;
    }
  }, []);

  const frameClassName = isRevealed
    ? `${styles.frame} ${styles.revealed}`
    : styles.frame;

  const frameStyle = {
    ...(insetY ? { "--bp-frame-inset-y": insetY } : {}),
    ...(insetX ? { "--bp-frame-inset-x": insetX } : {}),
    ...(lineColor ? { "--bp-frame-line": lineColor } : {}),
  } as CSSProperties;

  return (
    <div
      ref={frameRef}
      className={frameClassName}
      style={frameStyle}
      aria-hidden="true"
    >
      <span className={`${styles.frameLineHorizontal} ${styles.frameLineTop}`} />
      <span className={`${styles.frameLineHorizontal} ${styles.frameLineBottom}`} />
      <span className={`${styles.frameLineVertical} ${styles.frameLineLeft}`} />
      <span className={`${styles.frameLineVertical} ${styles.frameLineRight}`} />
      <span className={`${styles.corner} ${styles.cornerTopLeft}`} />
      <span className={`${styles.corner} ${styles.cornerTopRight}`} />
      <span className={`${styles.corner} ${styles.cornerBottomLeft}`} />
      <span className={`${styles.corner} ${styles.cornerBottomRight}`} />
    </div>
  );
}
