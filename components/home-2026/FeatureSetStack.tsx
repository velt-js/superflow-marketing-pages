"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./FeatureSet.module.css";
import FeatureSetBlock, { type FeatureSetBlockData } from "./FeatureSetBlock";

/** Depth at which a stacked card has fully faded out (two cards behind). */
const MAX_STACK_DEPTH = 2;
/** Scale removed while a card recedes to depth 1 (1 → 0.96). */
const BEHIND_SCALE_STEP = 0.04;
/** Extra scale removed while the card fades from depth 1 to 2. */
const GONE_SCALE_STEP = 0.04;

interface FeatureSetStackProps {
  blocks: FeatureSetBlockData[];
}

/** CSS custom property carrying each card's position in the scroll stack. */
interface FeatureSetSlotStyle extends CSSProperties {
  "--stack-index": number;
}

/** Clamps a number into the [0, 1] range. */
function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/**
 * Renders the feature cards as a scroll-driven deck. The SLOT wrappers are
 * the sticky elements — their containing block is the tall `.blocks`
 * container, so an earlier card stays pinned (with a 24px staggered top
 * offset providing the peek) for the rest of the section while later slots
 * scroll up and cover it. An rAF-throttled scroll handler measures how far
 * each following card has covered its predecessor and writes per-slot
 * `--stack-scale` / `--stack-opacity` variables: depth 0→1 shrinks the
 * pinned card subtly to ~0.96 (stacked behind, top edge peeking), depth 1→2
 * fades it out entirely, so at most the active card plus one previous card
 * are visible. The CSS only applies pinning and the variables on desktop
 * outside prefers-reduced-motion; other contexts scroll normally.
 *
 * @param props - The block configs to render, in stack order.
 */
export default function FeatureSetStack({ blocks }: FeatureSetStackProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let frameId = 0;

    /**
     * Coverage progress (0..1) of `slots[index]` sliding over its
     * predecessor. Uses the slot's flow position (offsetTop within the
     * container) rather than its client rect, because the slot itself pins
     * once sticky and its rect stops tracking scroll.
     */
    const measureCoverage = (
      slots: HTMLDivElement[],
      index: number,
      containerTop: number,
    ) => {
      if (index === 0) {
        return 0;
      }

      const slot = slots[index];
      const previousSlot = slots[index - 1];
      if (!slot || !previousSlot) {
        return 0;
      }

      // Pinned offsets come from the computed sticky `top`, so JS stays in
      // sync with the CSS min()/max() formula automatically.
      const previousTop = parseFloat(window.getComputedStyle(previousSlot).top) || 0;
      const ownTop = parseFloat(window.getComputedStyle(slot).top) || 0;
      const previousCard = previousSlot.firstElementChild as HTMLElement | null;
      const previousHeight = previousCard?.offsetHeight ?? previousSlot.offsetHeight;

      const coverStart = previousTop + previousHeight;
      const coverEnd = ownTop;
      const travel = coverStart - coverEnd;
      if (travel <= 0) {
        return 0;
      }

      const visualTop = Math.max(containerTop + slot.offsetTop, coverEnd);
      return clamp01((coverStart - visualTop) / travel);
    };

    const update = () => {
      frameId = 0;
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const containerTop = container.getBoundingClientRect().top;
      const slots = slotRefs.current.filter(
        (slot): slot is HTMLDivElement => slot !== null,
      );

      const coverage = slots.map((_slot, index) =>
        measureCoverage(slots, index, containerTop),
      );

      slots.forEach((slot, index) => {
        let depth = 0;
        for (let nextIndex = index + 1; nextIndex < slots.length; nextIndex += 1) {
          depth += coverage[nextIndex];
        }
        depth = Math.min(MAX_STACK_DEPTH, depth);

        const behindProgress = clamp01(depth);
        const goneProgress = clamp01(depth - 1);
        const scale =
          1 - BEHIND_SCALE_STEP * behindProgress - GONE_SCALE_STEP * goneProgress;
        const opacity = 1 - goneProgress;

        slot.style.setProperty("--stack-scale", scale.toFixed(4));
        slot.style.setProperty("--stack-opacity", opacity.toFixed(4));
      });
    };

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [blocks]);

  return (
    <div className={styles.blocks} ref={containerRef}>
      {blocks?.map((block, blockIndex) => {
        const slotStyle: FeatureSetSlotStyle = { "--stack-index": blockIndex };
        return (
          <div
            key={block.id}
            className={styles.blockSlot}
            style={slotStyle}
            ref={(element) => {
              slotRefs.current[blockIndex] = element;
            }}
          >
            <FeatureSetBlock data={block} />
          </div>
        );
      })}
    </div>
  );
}
