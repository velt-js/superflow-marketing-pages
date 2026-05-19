"use client";

import { useEffect, useState } from "react";

/**
 * Probe the page background under the nav and report whether the section
 * currently behind it is "dark" or "light", so the nav can flip text/fill
 * colors as the user scrolls between zebra-striped sections.
 *
 * Mirrors the velt-marketing-pages `Nav.tsx` pattern: sample a few points
 * just below the nav with `elementsFromPoint`, read their computed
 * background color, and pick the most opaque non-transparent one.
 */
export function useNavTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let raf = 0;

    const luminance = (r: number, g: number, b: number) =>
      (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    const parseRgb = (str: string): [number, number, number, number] | null => {
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
      const [r, g, b, a = 1] = parts;
      return [r, g, b, a];
    };

    const probe = () => {
      const y = 40;
      const xs = [
        Math.round(window.innerWidth * 0.25),
        Math.round(window.innerWidth * 0.5),
        Math.round(window.innerWidth * 0.75),
      ];
      let lum = 0;
      let weight = 0;
      for (const x of xs) {
        const els = document.elementsFromPoint(x, y);
        for (const el of els) {
          if (!(el instanceof HTMLElement)) continue;
          if (el.tagName === "NAV" || el.closest("nav")) continue;
          const bg = getComputedStyle(el).backgroundColor;
          const rgba = parseRgb(bg);
          if (!rgba) continue;
          const [r, g, b, a] = rgba;
          if (a < 0.05) continue;
          lum += luminance(r, g, b) * a;
          weight += a;
          break;
        }
      }
      const avg = weight > 0 ? lum / weight : 0;
      setTheme(avg > 0.55 ? "light" : "dark");
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(probe);
    };

    probe();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return theme;
}
