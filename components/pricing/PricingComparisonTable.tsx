"use client";

// Long sectioned feature-comparison table for /pricing.
//
// Layout: 1280-wide table with one label column on the left + four equal
// tier columns. The tier-header row pins under the Nav for the whole
// table via `position: sticky`. Each section label is itself sticky
// (offset = nav + tier-header height) AND clickable to collapse its
// rows. Mirrors the live usesuperflow.com/pricing interaction.
//
// Mobile (<lg): renders a vertical accordion — one <details> per tier
// listing its feature values. This avoids overflow-x-auto + sticky
// conflicts and gives a readable single-column layout.

import { Fragment, useEffect, useRef, useState } from "react";

import { SECTIONS, TIERS, APP_URL, type CellValue, type Tier } from "./pricing-data";
import { useBilling, type BillingPeriod } from "./BillingContext";

// Per-tier CTA + price label shown ONLY in the comparison-table column
// headers. Distinct from the tier-card CTAs above (which still use
// tier.cta.label / tier.cta.href).
const HEADER_CTA: Record<Tier["id"], { label: string; href: string }> = {
  starter: { label: "Start Free Trial", href: APP_URL },
  growth: { label: "Start Free Trial", href: APP_URL },
  scale: { label: "Start Free Trial", href: APP_URL },
  enterprise: { label: "Book Demo", href: "/book-demo" },
};

const NAV_OFFSET = 57; // matches components/home/Nav.tsx height
const ROW_PAD_Y = 18;
const DIVIDER = "1px solid #f0f0f0";

// Responsive column template — label gets a flexible min-width and the
// four tier columns split the remaining space equally. Using fr/minmax
// instead of fixed pixels lets the table fit at any viewport ≥ xl
// without clipping or horizontal scroll.
const GRID_TEMPLATE = "minmax(220px, 1.4fr) repeat(4, minmax(0, 1fr))";

function headerPrice(
  tier: Tier,
  billing: BillingPeriod,
): { display: string; suffix?: string } {
  if (tier.customPrice) return { display: tier.monthlyPrice };
  const price = billing === "annual" ? tier.annualPrice : tier.monthlyPrice;
  return { display: `$${price}`, suffix: "/seat/mo" };
}

// --- Icons -------------------------------------------------------------------

function CheckCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#10b981" />
      <path
        d="M7.5 12.5l3 3 6-6"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <path
        d="M8 8l8 8M16 8l-8 8"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Cell({ value }: { value: CellValue }) {
  if (value.kind === "check") return <CheckCircle />;
  if (value.kind === "x") return <CrossCircle />;
  return (
    <div className="flex flex-col items-center text-center" style={{ gap: 2 }}>
      <span
        className="font-urbanist font-medium"
        style={{ color: "#1f2937", fontSize: 18, lineHeight: 1.4 }}
      >
        {value.value}
      </span>
      {value.sub ? (
        <span
          className="font-urbanist"
          style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.3 }}
        >
          {value.sub}
        </span>
      ) : null}
    </div>
  );
}

function Chevron({ open, color }: { open: boolean; color: string }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden
      style={{
        flexShrink: 0,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 180ms ease",
      }}
    >
      <path
        d="M1 1l5 5 5-5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Desktop header ---------------------------------------------------------

function TierHeaderRow({ billing }: { billing: BillingPeriod }) {
  return (
    <div
      role="row"
      className="grid"
      style={{
        gridTemplateColumns: GRID_TEMPLATE,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "28px 24px",
        gap: 0,
        alignItems: "stretch",
      }}
    >
      <div
        className="flex items-center font-urbanist"
        style={{
          color: "#111",
          fontSize: "clamp(14px, 1.2vw, 16px)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        All Plans
      </div>
      {TIERS.map((tier) => {
        const cta = HEADER_CTA[tier.id];
        const external = cta.href.startsWith("http");
        const price = headerPrice(tier, billing);
        return (
          <div
            key={tier.id}
            role="columnheader"
            className="flex flex-col items-center text-center"
            style={{ minWidth: 0, padding: "0 8px" }}
          >
            <div
              className="flex flex-col items-center"
              style={{ width: "100%", maxWidth: 160, gap: 10 }}
            >
              <span
                className="font-urbanist"
                style={{
                  color: tier.accent,
                  fontSize: "clamp(14px, 1.2vw, 16px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {tier.name}
              </span>
              <div
                className="flex items-baseline"
                style={{ gap: 4 }}
              >
                <span
                  className="font-urbanist"
                  style={{
                    color: "#000",
                    fontSize: "clamp(18px, 1.7vw, 22px)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {price.display}
                </span>
                {price.suffix ? (
                  <span
                    className="font-urbanist"
                    style={{
                      color: "#6b7280",
                      fontSize: "clamp(11px, 0.9vw, 12px)",
                      fontWeight: 500,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {price.suffix}
                  </span>
                ) : null}
              </div>
              <a
                href={cta.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="font-urbanist flex items-center justify-center"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 8,
                  background: "#fff",
                  color: "#000",
                  fontSize: "clamp(12px, 1vw, 13px)",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {cta.label}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Mobile accordion -------------------------------------------------------
//
// One <details> per tier. Inside each tier: every section heading followed
// by its rows as label + value pairs stacked vertically. First tier open by
// default so crawlers see content without JS.

function MobileAccordion({ billing }: { billing: BillingPeriod }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {TIERS.map((tier, tierIdx) => {
        const cta = HEADER_CTA[tier.id];
        const external = cta.href.startsWith("http");
        const price = headerPrice(tier, billing);
        return (
          <details
            key={tier.id}
            open={tierIdx === 0}
            className="group"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <summary
              className="flex items-center justify-between cursor-pointer list-none"
              style={{ padding: "16px 20px", gap: 12 }}
            >
              <div className="flex flex-col" style={{ gap: 2 }}>
                <span
                  className="font-urbanist font-semibold"
                  style={{ color: tier.accent, fontSize: 18, lineHeight: 1.2 }}
                >
                  {tier.name}
                </span>
                <span
                  className="font-urbanist font-bold"
                  style={{ color: "#000", fontSize: 20, lineHeight: 1.2 }}
                >
                  {price.suffix
                    ? `${price.display} ${price.suffix}`
                    : price.display}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={cta.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener" : undefined}
                  className="font-urbanist flex items-center justify-center"
                  style={{
                    padding: "6px 14px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#000",
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                  onClick={(evt) => evt.stopPropagation()}
                >
                  {cta.label}
                </a>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="transition-transform duration-200 group-open:rotate-180 shrink-0"
                >
                  <path d="M6 9l6 6l6 -6" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </summary>

            <div style={{ borderTop: "1px solid #e5e7eb" }}>
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <div
                    style={{
                      padding: "12px 20px 8px",
                      borderTop: `2px solid ${section.accent}`,
                    }}
                  >
                    <span
                      className="font-urbanist font-bold"
                      style={{
                        color: section.accent,
                        fontSize: 14,
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        textTransform: "uppercase",
                      }}
                    >
                      {section.title}
                    </span>
                  </div>
                  {section.rows.map((row, rowIdx) => (
                    <div
                      key={`${section.title}-${rowIdx}`}
                      className="flex items-center justify-between"
                      style={{
                        padding: "10px 20px",
                        borderBottom: rowIdx === section.rows.length - 1 ? "none" : DIVIDER,
                        gap: 12,
                        minHeight: 44,
                      }}
                    >
                      <div className="flex flex-col" style={{ gap: 2, flex: 1 }}>
                        <span
                          className="font-urbanist font-medium"
                          style={{ color: "#111", fontSize: 14, lineHeight: 1.4 }}
                        >
                          {row.label}
                        </span>
                        {row.sublabel ? (
                          <span
                            className="font-urbanist font-medium"
                            style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.3 }}
                          >
                            {row.sublabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-end shrink-0">
                        <Cell value={row.values[tierIdx]} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

// --- Body -------------------------------------------------------------------

export function PricingComparisonTable() {
  const tierHeaderRef = useRef<HTMLDivElement>(null);
  const [tierHeaderH, setTierHeaderH] = useState(120);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { billing } = useBilling();

  // Measure the tier-header height so we can offset each section header's
  // sticky `top` and keep them stacked correctly under the Nav.
  useEffect(() => {
    const el = tierHeaderRef.current;
    if (!el) return;
    const update = () => setTierHeaderH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggle = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  return (
    <section
      // `data-outcomes` is the Nav's "light-start" marker. /pricing has
      // dark sections (tier cards, YC callout, TrustedLogos) directly
      // below the hero, so the default post-hero flip would make the
      // nav white over those dark blocks. Anchoring the marker here
      // keeps the nav dark until the comparison table reaches the nav
      // strip, then it flips back to dark again at the "Our Customers
      // Trust Us" carousel ([data-getstarted]).
      data-outcomes
      className="flex flex-col items-center bg-white full-bleed-bg px-6 lg:px-20 py-16 lg:py-[100px]"
    >
      {/* Mobile + tablet + narrow desktop: per-tier accordion. The full
          4-column comparison table needs enough horizontal room to read
          comfortably, so we hold the accordion all the way up to `xl`
          (1280px) — between `lg` (1024) and `xl` the cramped table was
          breaking. */}
      <div className="xl:hidden w-full max-w-[600px]">
        <MobileAccordion billing={billing} />
      </div>

      {/* Desktop (xl+): full comparison table */}
      <div
        // No `overflow: hidden` or `border-radius` here — both would
        // break `position: sticky` for descendants and / or visually
        // box the table. Live usesuperflow.com/pricing renders the
        // table flat on the page background, no card chrome.
        className="relative hidden xl:block w-full max-w-[1280px]"
      >
        {/* Sticky tier header — pins under the Nav for the whole table. */}
        <div
          ref={tierHeaderRef}
          style={{
            position: "sticky",
            top: NAV_OFFSET,
            zIndex: 10,
            background: "#fff",
          }}
        >
          <TierHeaderRow billing={billing} />
        </div>

        {SECTIONS.map((section) => {
          const open = !collapsed.has(section.title);
          return (
            <Fragment key={section.title}>
              {/* Sticky wrapper around the section button. Sticky on a
                  div (not the button itself) avoids `<button>` quirks
                  with sticky in some engines and uses Fragment as the
                  parent so all section headers share one scroll
                  container — that's what gives the stacked-sticky
                  "next section pushes out previous" behaviour. */}
              <div
                style={{
                  position: "sticky",
                  top: NAV_OFFSET + tierHeaderH,
                  zIndex: 5,
                  background: "#fff",
                  // Thin accent-coloured rule above each section, matching
                  // the live treatment (no grey strip / no bottom divider).
                  borderTop: `1px solid ${section.accent}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(section.title)}
                  aria-expanded={open}
                  className="flex items-center w-full"
                  style={{
                    width: "100%",
                    padding: "28px 24px",
                    gap: 8,
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    font: "inherit",
                    justifyContent: "flex-start",
                  }}
                >
                  <span
                    className="font-urbanist font-bold"
                    style={{
                      color: section.accent,
                      fontSize: "clamp(18px, 1.8vw, 22px)",
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {section.title}
                  </span>
                  <Chevron open={open} color={section.accent} />
                </button>
              </div>

              {open &&
                section.rows.map((row, i) => (
                  <div
                    key={`${section.title}-${i}`}
                    role="row"
                    className="grid items-center"
                    style={{
                      gridTemplateColumns: GRID_TEMPLATE,
                      padding: `${ROW_PAD_Y}px 24px`,
                      borderBottom:
                        i === section.rows.length - 1 ? "none" : DIVIDER,
                      gap: 0,
                      minHeight: 56,
                      background: "#fff",
                    }}
                  >
                    <div className="flex flex-col" style={{ gap: 2, minWidth: 0, paddingRight: 16 }}>
                      <span
                        className="font-urbanist font-medium"
                        style={{
                          color: "#111",
                          fontSize: "clamp(14px, 1.3vw, 17px)",
                          lineHeight: 1.4,
                        }}
                      >
                        {row.label}
                      </span>
                      {row.sublabel ? (
                        <span
                          className="font-urbanist font-medium"
                          style={{
                            color: "#9ca3af",
                            fontSize: "clamp(12px, 1.1vw, 15px)",
                            lineHeight: 1.3,
                          }}
                        >
                          {row.sublabel}
                        </span>
                      ) : null}
                    </div>
                    {row.values.map((value, vi) => (
                      <div
                        key={vi}
                        role="cell"
                        className="flex items-center justify-center"
                      >
                        <Cell value={value} />
                      </div>
                    ))}
                  </div>
                ))}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
