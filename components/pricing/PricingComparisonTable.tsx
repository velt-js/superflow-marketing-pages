"use client";

// Long sectioned feature-comparison table for /pricing — Figma 217:8994.
//
// Layout: 1280-wide table with one wide label column on the left + three
// equal tier columns. The tier-header row pins under the Nav for the
// whole table via `position: sticky`. Each section label is itself
// sticky (offset = nav + tier-header height) AND clickable to collapse
// its rows. Mirrors the live velt.dev/pricing interaction.
//
// Mobile (<lg): renders a vertical accordion — one <details> per tier
// listing its feature values. This avoids overflow-x-auto + sticky
// conflicts and gives a readable single-column layout.

import { Fragment, useEffect, useRef, useState } from "react";

import { SECTIONS, TIERS, type CellValue, type Tier } from "./pricing-data";

// Per-tier CTA shown ONLY in the comparison-table column headers (matches
// Figma 217:9637 / 9642 / 9647 — Hacker says "Get Started", Growth and
// Enterprise say "Book Demo"). Distinct from the tier-card CTAs above
// (which still use tier.cta.label / tier.cta.href).
const HEADER_CTA: Record<Tier["id"], { label: string; href: string }> = {
  hacker: { label: "Get Started", href: "https://console.velt.dev/" },
  growth: { label: "Book Demo", href: "/book-demo" },
  enterprise: { label: "Book Demo", href: "/book-demo" },
};

const NAV_OFFSET = 57; // matches components/home/Nav.tsx height
const LABEL_COL = 420;
const TIER_COL = 286;
const ROW_PAD_Y = 18;
const DIVIDER = "1px solid #f0f0f0";

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

function RowInfoGlyph() {
  // Small ⓘ next to certain row labels (e.g. "MADs"). Mirrors the live
  // velt.dev/pricing affordance — sits inline with the label, hover
  // shows the tooltip on the parent <span class="row-label">.
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, opacity: 0.45 }}
    >
      <circle cx="12" cy="12" r="9" stroke="#666" strokeWidth="1.6" />
      <path d="M12 11v5" stroke="#666" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8.2" r="1" fill="#666" />
    </svg>
  );
}

// --- Desktop header ---------------------------------------------------------
//
// Per Figma 217:9637 (Hacker) / 9642 (Growth) / 9647 (Enterprise):
//   stack of [tier name, price, button], gap 12, items centered.
//   - Tier name: Urbanist 400, 16px, black
//   - Price:     Urbanist 700, 20px, black
//   - Button:    full-width OF an inner 108px content stack, 1px border
//                rgba(0,0,0,0.08), radius 8, padding 8/12, label
//                Urbanist 400, 16px, black.

function TierHeaderRow() {
  return (
    <div
      role="row"
      className="grid"
      style={{
        gridTemplateColumns: `${LABEL_COL}px repeat(3, ${TIER_COL}px)`,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "28px 24px",
        gap: 0,
        alignItems: "stretch",
      }}
    >
      <div />
      {TIERS.map((tier) => {
        const cta = HEADER_CTA[tier.id];
        const external = cta.href.startsWith("http");
        return (
          <div
            key={tier.id}
            role="columnheader"
            className="flex flex-col items-center text-center"
            style={{ width: "100%" }}
          >
            <div
              className="flex flex-col items-center"
              style={{ width: 108, gap: 12 }}
            >
              <span
                className="font-urbanist"
                style={{
                  color: "#000",
                  fontSize: 18,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {tier.name}
              </span>
              <span
                className="font-urbanist"
                style={{
                  color: "#000",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {tier.price}
              </span>
              <a
                href={cta.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="font-urbanist flex items-center justify-center"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 8,
                  background: "#fff",
                  color: "#000",
                  fontSize: 16,
                  fontWeight: 400,
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

function MobileAccordion() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {TIERS.map((tier, tierIdx) => {
        const cta = HEADER_CTA[tier.id];
        const external = cta.href.startsWith("http");
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
                  style={{ color: "#000", fontSize: 18, lineHeight: 1.2 }}
                >
                  {tier.name}
                </span>
                <span
                  className="font-urbanist font-bold"
                  style={{ color: "#000", fontSize: 20, lineHeight: 1.2 }}
                >
                  {tier.price}
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
                          {row.tooltip ? (
                            <span
                              className="font-urbanist"
                              style={{ color: "#9ca3af", fontSize: 12, display: "block", lineHeight: 1.3 }}
                            >
                              {row.tooltip}
                            </span>
                          ) : null}
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
      style={{ borderRadius: 52 }}
    >
      <style>{`
        .row-label-wrap .row-tooltip {
          position: absolute;
          left: 0;
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
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          width: max-content;
          max-width: 260px;
          opacity: 0;
          transform: translateY(4px);
          pointer-events: none;
          transition: opacity 140ms ease, transform 140ms ease;
          z-index: 20;
        }
        .row-label-wrap:hover .row-tooltip {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Mobile: per-tier accordion */}
      <div className="lg:hidden w-full max-w-[600px]">
        <MobileAccordion />
      </div>

      {/* Desktop: full comparison table */}
      <div
        // No `overflow: hidden` or `border-radius` here — both would
        // break `position: sticky` for descendants and / or visually
        // box the table. Live velt.dev/pricing renders the table flat
        // on the page background, no card chrome.
        className="relative hidden lg:block w-full max-w-[1280px]"
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
          <TierHeaderRow />
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
                      fontSize: 22,
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
                      gridTemplateColumns: `${LABEL_COL}px repeat(3, ${TIER_COL}px)`,
                      padding: `${ROW_PAD_Y}px 24px`,
                      borderBottom:
                        i === section.rows.length - 1 ? "none" : DIVIDER,
                      gap: 0,
                      minHeight: 56,
                      background: "#fff",
                    }}
                  >
                    <div className="flex flex-col" style={{ gap: 2 }}>
                      <span
                        className="row-label-wrap font-urbanist font-medium"
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#111",
                          fontSize: 18,
                          lineHeight: 1.4,
                          width: "fit-content",
                        }}
                      >
                        {row.label}
                        {row.tooltip ? (
                          <>
                            <RowInfoGlyph />
                            <span
                              className="row-tooltip"
                              role="tooltip"
                            >
                              {row.tooltip}
                            </span>
                          </>
                        ) : null}
                      </span>
                      {row.sublabel ? (
                        <span
                          className="font-urbanist font-medium"
                          style={{
                            color: "#9ca3af",
                            fontSize: 15,
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
