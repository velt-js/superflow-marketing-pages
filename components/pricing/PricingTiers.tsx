"use client";

// Three pricing tier cards for /pricing — mirrors velt.dev/pricing #cards.
// Black-on-black cards with a Tabler icon at the top, title + subtitle,
// full-width CTA, and a circle-check bullet list. The middle "Growth" card
// gets a purple→cyan gradient ring, drawn as an absolutely positioned
// sibling of the card with `inset: -3px` so it shows as a 3px outline.
//
// Two bullets on the Hacker tier carry a hover tooltip (CSS-only) — these
// match the info-pop affordance shown on the live site for "100 MADs" and
// "For Dev Environments Only".
//
// Cards fade-up on viewport enter via IntersectionObserver. Pure CSS
// transition; no framer-motion.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { TIERS, type Tier, type TierBullet } from "./pricing-data";

const PRIMARY = "#625df5"; // brand purple — solid CTA fill
const SECONDARY_BORDER = "#262291"; // dark purple — outlined CTA border
const CARD_BORDER = "#1c1c1c";
const CARD_BG = "#000";
const HIGHLIGHT_GRADIENT =
  "linear-gradient(180deg, rgb(85, 0, 255) 0%, rgb(29, 221, 255) 100%)";
const BULLET_FILL = "#1DDE84";

// Per-tier icon stroke colors — matches the live site (orange / cyan /
// magenta) instead of the previous all-white treatment.
const ICON_COLOR: Record<Tier["icon"], string> = {
  code: "#FFB46E",
  "trending-up": "#20D4FF",
  "world-longitude": "#FF74F6",
};

// --- Tabler icons (inlined) --------------------------------------------------

type IconProps = { size?: number };

function IconCode({ size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 8l-4 4l4 4" />
      <path d="M17 8l4 4l-4 4" />
      <path d="M14 4l-4 16" />
    </svg>
  );
}

function IconTrendingUp({ size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 17l6 -6l4 4l8 -8" />
      <path d="M14 7l7 0l0 7" />
    </svg>
  );
}

function IconWorldLongitude({ size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
      <path d="M11.5 3a17 17 0 0 0 0 18" />
      <path d="M12.5 3a17 17 0 0 1 0 18" />
    </svg>
  );
}

const ICONS: Record<Tier["icon"], (p: IconProps) => React.ReactElement> = {
  code: IconCode,
  "trending-up": IconTrendingUp,
  "world-longitude": IconWorldLongitude,
};

function CheckBullet() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <circle cx="12" cy="12" r="10" fill={BULLET_FILL} />
      <path
        d="M7.5 12.5l3 3 6-6"
        fill="none"
        stroke="#fff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoGlyph() {
  // Subtle "info" affordance shown next to bullets that carry a tooltip,
  // so users have a hover hint that there's more context.
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, opacity: 0.5 }}
    >
      <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.6" />
      <path
        d="M12 11v5"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8.2" r="1" fill="#fff" />
    </svg>
  );
}

// --- Bullet ------------------------------------------------------------------

function BulletRow({ bullet }: { bullet: TierBullet }) {
  return (
    <li
      className="flex items-start font-urbanist tier-bullet"
      style={{
        gap: 10,
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: "-0.03em",
        position: "relative",
      }}
    >
      <CheckBullet />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {bullet.text}
        {bullet.tooltip ? (
          <>
            <InfoGlyph />
            <span className="tier-bullet-tooltip" role="tooltip">
              {bullet.tooltip}
            </span>
          </>
        ) : null}
      </span>
    </li>
  );
}

// --- Card --------------------------------------------------------------------

function TierCard({
  tier,
  index,
  visible,
}: {
  tier: Tier;
  index: number;
  visible: boolean;
}) {
  const highlighted = !!tier.highlighted;
  const Icon = ICONS[tier.icon];
  const iconColor = ICON_COLOR[tier.icon];
  const external = tier.cta.href.startsWith("http");

  return (
    <div
      className="relative flex w-full"
      style={{
        minWidth: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 520ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${index * 90}ms`,
      }}
    >
      {highlighted && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -3,
            background: HIGHLIGHT_GRADIENT,
            borderRadius: 27,
            pointerEvents: "none",
          }}
        />
      )}
      <article
        className="relative flex flex-col w-full"
        style={{
          background: CARD_BG,
          border: highlighted
            ? `2px solid ${CARD_BORDER}`
            : `1px solid ${CARD_BORDER}`,
          borderRadius: 24,
          padding: 32,
          gap: 36,
        }}
      >
        <div className="flex flex-col" style={{ gap: 24 }}>
          <div className="flex flex-col" style={{ gap: 16 }}>
            <span style={{ color: iconColor, width: 32, height: 32 }}>
              <Icon size={32} />
            </span>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <h3
                className="font-urbanist"
                style={{
                  color: "#fff",
                  fontSize: "clamp(22px, 2.6vw, 32px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  textTransform: "capitalize",
                  margin: 0,
                }}
              >
                {tier.name}
              </h3>
              <p
                className="font-urbanist"
                style={{
                  color: "#fff",
                  opacity: 0.52,
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  margin: 0,
                }}
              >
                {tier.blurb}
              </p>
            </div>
          </div>

          <Link
            href={tier.cta.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener" : undefined}
            className="flex items-center justify-center font-urbanist"
            style={{
              width: "100%",
              padding: "8px 16px",
              borderRadius: 6,
              background: highlighted ? PRIMARY : "transparent",
              border: highlighted
                ? "1.5px solid transparent"
                : `1.5px solid ${SECONDARY_BORDER}`,
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              textDecoration: "none",
            }}
          >
            {tier.cta.label}
          </Link>
        </div>

        <ul
          className="flex flex-col"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            gap: 12,
          }}
        >
          {tier.bullets.map((bullet) => (
            <BulletRow key={bullet.text} bullet={bullet} />
          ))}
        </ul>
      </article>
    </div>
  );
}

export function PricingTiers() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center bg-black full-bleed-bg px-6 lg:px-20 pt-5 pb-4"
    >
      <style>{`
        .tier-bullet .tier-bullet-tooltip {
          position: absolute;
          left: 26px;
          bottom: calc(100% + 8px);
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.01em;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #2a2a2a;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          white-space: normal;
          width: max-content;
          max-width: 240px;
          opacity: 0;
          transform: translateY(4px);
          pointer-events: none;
          transition: opacity 140ms ease, transform 140ms ease;
          z-index: 5;
        }
        .tier-bullet:hover .tier-bullet-tooltip,
        .tier-bullet:focus-within .tier-bullet-tooltip {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <div
        className="grid grid-cols-1 lg:grid-cols-3 w-full"
        style={{
          maxWidth: 1280,
          gap: 10,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {TIERS.map((tier, i) => (
          <TierCard key={tier.id} tier={tier} index={i} visible={visible} />
        ))}
      </div>
    </section>
  );
}
