"use client";

// Four pricing tier cards for /pricing — mirrors usesuperflow.com/pricing.
// Black-on-black cards with the tier name in the tier accent color, the
// price block (monthly or annual), an outline CTA button, and a bulleted
// feature list. The Growth tier is the "Most Popular" — it gets a pink
// "Loved by 100+ Agencies" badge above the card and a gradient ring.
//
// A single billing toggle ("Monthly | Annually (2 Months Free)") sits
// above the cards and is the only client-state driver — when Annual is
// selected, paid tiers show the discounted per-month price next to the
// struck-through monthly equivalent.
//
// Cards fade-up on viewport enter via IntersectionObserver. Pure CSS
// transition; no framer-motion.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toInternalHref } from "@/lib/links";

import { TIERS, type Tier, type TierBullet } from "./pricing-data";
import { useBilling, type BillingPeriod } from "./BillingContext";

const PRIMARY = "#625df5"; // brand purple - solid CTA fill
const SECONDARY_BORDER = "#262291"; // dark purple - outlined CTA border
const CARD_BORDER = "#1c1c1c";
const CARD_BG = "#000";
const HIGHLIGHT_GRADIENT =
  "linear-gradient(180deg, rgb(85, 0, 255) 0%, rgb(29, 221, 255) 100%)";
const BULLET_FILL = "#1DDE84";
const BADGE_GRADIENT =
  "linear-gradient(101deg, #ff3c7a 0%, #ff7a4a 100%)";

// --- Check bullet ------------------------------------------------------------

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

function HeartGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"
        fill="#fff"
      />
    </svg>
  );
}

// --- Bullet ------------------------------------------------------------------

function BulletRow({ bullet }: { bullet: TierBullet }) {
  if (bullet.divider) {
    return (
      <li
        className="font-urbanist"
        style={{
          color: "#fff",
          opacity: 0.6,
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          listStyle: "none",
          marginTop: 4,
          marginBottom: 2,
        }}
      >
        {bullet.text}
      </li>
    );
  }
  return (
    <li
      className="flex items-start font-urbanist"
      style={{
        gap: 10,
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: "-0.03em",
        listStyle: "none",
      }}
    >
      <CheckBullet />
      <span>{bullet.text}</span>
    </li>
  );
}

// --- Price block -------------------------------------------------------------

function PriceBlock({
  tier,
  billing,
}: {
  tier: Tier;
  billing: BillingPeriod;
}) {
  if (tier.customPrice) {
    return (
      <div className="flex flex-col" style={{ gap: 4 }}>
        <span
          className="font-urbanist"
          style={{
            color: "#fff",
            fontSize: "clamp(28px, 3.2vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {tier.monthlyPrice}
        </span>
        <span
          className="font-urbanist"
          style={{
            color: "#fff",
            opacity: 0.55,
            fontSize: "clamp(12px, 1.1vw, 14px)",
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
          }}
        >
          Custom
        </span>
      </div>
    );
  }

  const isAnnual = billing === "annual";
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const showStrike = isAnnual && !!tier.annualStrikePrice;
  const suffix = isAnnual
    ? "per seat, per month, billed yearly"
    : "per seat, per month";

  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <span
          className="font-urbanist"
          style={{
            color: "#fff",
            fontSize: "clamp(28px, 3.2vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          ${price}
        </span>
        {showStrike ? (
          <span
            className="font-urbanist"
            style={{
              color: "#fff",
              opacity: 0.45,
              fontSize: "clamp(14px, 1.6vw, 20px)",
              fontWeight: 500,
              lineHeight: 1.2,
              textDecoration: "line-through",
              textDecorationColor: "rgba(255,255,255,0.55)",
            }}
          >
            ${tier.annualStrikePrice}
          </span>
        ) : null}
      </div>
      <span
        className="font-urbanist"
        style={{
          color: "#fff",
          opacity: 0.55,
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
        }}
      >
        {suffix}
      </span>
    </div>
  );
}

// --- Card --------------------------------------------------------------------

function TierCard({
  tier,
  index,
  visible,
  billing,
}: {
  tier: Tier;
  index: number;
  visible: boolean;
  billing: BillingPeriod;
}) {
  const highlighted = !!tier.highlighted;
  const external = tier.cta.href.startsWith("http");

  return (
    <div
      className="relative flex flex-col w-full"
      style={{
        minWidth: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition:
          "opacity 520ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${index * 90}ms`,
      }}
    >
      {tier.badge ? (
        <div
          className="flex items-center justify-center font-urbanist"
          style={{
            alignSelf: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 999,
            background: BADGE_GRADIENT,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            marginBottom: 10,
            whiteSpace: "nowrap",
          }}
        >
          <HeartGlyph />
          {tier.badge}
        </div>
      ) : (
        <div aria-hidden style={{ height: 36 }} />
      )}

      <div className="relative flex w-full" style={{ flex: 1 }}>
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
            padding: 28,
            gap: 28,
          }}
        >
          <div className="flex flex-col" style={{ gap: 20 }}>
            <h3
              className="font-urbanist"
              style={{
                color: tier.accent,
                fontSize: "clamp(22px, 2.4vw, 28px)",
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {tier.name}
            </h3>

            <PriceBlock tier={tier} billing={billing} />

            {tier.trialLabel ? (
              <span
                className="font-urbanist"
                style={{
                  color: "#fff",
                  opacity: 0.55,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {tier.trialLabel}
              </span>
            ) : null}

            <Link
              href={toInternalHref(tier.cta.href) ?? "#"}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener" : undefined}
              className="flex items-center justify-center font-urbanist"
              style={{
                width: "100%",
                padding: "10px 16px",
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
    </div>
  );
}

// --- Toggle ------------------------------------------------------------------

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (next: BillingPeriod) => void;
}) {
  const isAnnual = value === "annual";
  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      className="flex items-center font-urbanist"
      style={{
        gap: 6,
        padding: 4,
        border: "1px solid #1c1c1c",
        background: "#0a0a0a",
        borderRadius: 999,
      }}
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isAnnual}
        onClick={() => onChange("monthly")}
        style={{
          padding: "8px 18px",
          borderRadius: 999,
          background: !isAnnual ? "#1c1c1c" : "transparent",
          color: "#fff",
          opacity: !isAnnual ? 1 : 0.65,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          border: 0,
          cursor: "pointer",
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={isAnnual}
        onClick={() => onChange("annual")}
        className="flex items-center"
        style={{
          gap: 8,
          padding: "8px 18px",
          borderRadius: 999,
          background: isAnnual ? "#1c1c1c" : "transparent",
          color: "#fff",
          opacity: isAnnual ? 1 : 0.65,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          border: 0,
          cursor: "pointer",
        }}
      >
        Annually
        <span
          style={{
            color: "#20D4FF",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          (2 Months Free)
        </span>
      </button>
    </div>
  );
}

// --- Section -----------------------------------------------------------------

export function PricingTiers() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { billing, setBilling } = useBilling();

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
      className="flex flex-col items-center bg-black full-bleed-bg px-6 lg:px-20 pt-5 pb-10"
    >
      <div
        className="flex justify-center w-full"
        style={{ marginBottom: 28 }}
      >
        <BillingToggle value={billing} onChange={setBilling} />
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full"
        style={{
          maxWidth: 1280,
          gap: 10,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {TIERS.map((tier, i) => (
          <TierCard
            key={tier.id}
            tier={tier}
            index={i}
            visible={visible}
            billing={billing}
          />
        ))}
      </div>
    </section>
  );
}
