"use client";

// ReviewWebsiteFuture — "Superflow is built for the future" tabbed section.
// Used only on /website-review. Tabs swap the inner mock image.
// Visual reference: Figma 28:569.

import { useState, type ReactNode } from "react";
import Image from "next/image";

export type WebsiteFutureTab = {
  label: string;
  iconName?: string;
  imageSrc: string;
};

export type ReviewWebsiteFutureProps = {
  headingLine1: string;
  subheading?: string;
  tabs: WebsiteFutureTab[];
};

// Mini Tabler-style icons used on the tab pills. Only the 4 we need today.
const ICONS: Record<string, ReactNode> = {
  "grid-dots": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />))}
    </svg>
  ),
  "app-window": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M6 8h.01M10 8h.01" />
    </svg>
  ),
  devices: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="13" y="8" width="8" height="12" rx="1" />
      <path d="M18 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
    </svg>
  ),
  "lock-password": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  ),
};

export default function ReviewWebsiteFuture({ headingLine1, subheading, tabs }: ReviewWebsiteFutureProps) {
  const [active, setActive] = useState(0);
  if (!tabs?.length) return null;
  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <section className="bg-white px-6 lg:px-12 py-[80px] lg:py-[120px]">
      <div className="mx-auto max-w-[1000px] flex flex-col items-center gap-[40px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            className="font-bold"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "#111",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: 820,
            }}
          >
            {headingLine1}
          </h2>
          {subheading ? (
            <p
              className="mx-auto"
              style={{
                fontFamily: "var(--font-poppins)",
                color: "rgba(17,17,17,0.6)",
                fontSize: 18,
                lineHeight: 1.5,
                maxWidth: 700,
              }}
            >
              {subheading}
            </p>
          ) : null}
        </div>

        {/* Tab strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-[#f5f5f7] p-1">
          {tabs.map((t, i) => {
            const isActive = i === active;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setActive(i)}
                className="flex items-center gap-2 rounded-full px-4 py-3 transition-colors"
                style={{
                  background: isActive ? "#fff" : "transparent",
                  color: isActive ? "#111" : "rgba(17,17,17,0.55)",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 16,
                  boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.08)" : undefined,
                }}
              >
                {t.iconName && ICONS[t.iconName] ? (
                  <span style={{ color: isActive ? "#3772fe" : "currentColor", display: "inline-flex" }}>
                    {ICONS[t.iconName]}
                  </span>
                ) : null}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active tab content */}
        <div className="w-full bg-[#f8f8fa] p-6 lg:p-10 flex items-center justify-center rounded-[32px]" style={{ minHeight: 480 }}>
          {current?.imageSrc ? (
            <Image
              src={current.imageSrc}
              alt={current.label}
              width={836}
              height={483}
              className="w-full h-auto max-w-[836px] object-contain rounded-[32px] lg:rounded-[80px]"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
