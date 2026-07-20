"use client";

// Feature comparison table — 2026 light restyle of
// components/pricing/PricingComparisonTable. Same data
// (components/pricing/pricing-data.ts) and billing context; the rainbow
// per-section accents give way to the 2026 monochrome + single-accent
// palette, and check/cross circles become a green Tabler check and a
// muted dash.
//
// Desktop (≥1280px): one label column + four tier columns, with the tier
// header pinned under the fixed SiteNav and collapsible sticky section
// headers. Below 1280px: a per-tier accordion (one <details> per tier).

import { Fragment, useEffect, useRef, useState } from "react";
import {
  SECTIONS,
  TIERS,
  APP_URL,
  type CellValue,
  type Tier,
} from "@/components/pricing/pricing-data";
import { useBilling, type BillingPeriod } from "@/components/pricing/BillingContext";
import styles from "./PricingComparisonTable.module.css";

/** Height of the fixed SiteNav; sticky offsets stack beneath it. */
const NAV_OFFSET = 70;

/** Per-tier CTA shown in the comparison-table column headers. */
const HEADER_CTA: Record<Tier["id"], { label: string; href: string }> = {
  starter: { label: "Start Free Trial", href: APP_URL },
  growth: { label: "Start Free Trial", href: APP_URL },
  scale: { label: "Start Free Trial", href: APP_URL },
  enterprise: { label: "Book Demo", href: "/book-demo" },
};

/**
 * The short price line shown in a tier's column header.
 *
 * @param tier - The tier whose price is displayed.
 * @param billing - The active billing period.
 * @returns The display string and an optional "/seat/mo" suffix.
 */
function headerPrice(
  tier: Tier,
  billing: BillingPeriod,
): { display: string; suffix?: string } {
  try {
    if (tier?.customPrice) {
      return { display: tier.monthlyPrice };
    }
    const price = billing === "annual" ? tier.annualPrice : tier.monthlyPrice;
    return { display: `$${price}`, suffix: "/seat/mo" };
  } catch {
    return { display: "" };
  }
}

/** Tabler "check" glyph for included features. */
function ComparisonCheckIcon() {
  return (
    <svg
      className={styles.checkIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

/**
 * A single table cell: a green check, a muted dash (not included) or a
 * text value with an optional muted sub-line.
 *
 * @param props.value - The cell's data value.
 */
function ComparisonCell({ value }: { value: CellValue }) {
  try {
    if (value?.kind === "check") {
      return <ComparisonCheckIcon />;
    }
    if (value?.kind === "x") {
      return (
        <span className={styles.dash} aria-label="Not included">
          &ndash;
        </span>
      );
    }
    return (
      <span className={styles.cellText}>
        <span className={styles.cellValue}>{value?.value}</span>
        {value?.sub ? <span className={styles.cellSub}>{value.sub}</span> : null}
      </span>
    );
  } catch {
    return null;
  }
}

/** Chevron indicator for collapsible section headers. */
function ComparisonChevron({ open }: { open: boolean }) {
  const className = open
    ? `${styles.chevron} ${styles.chevronOpen}`
    : styles.chevron;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6l6 -6" />
    </svg>
  );
}

/**
 * Desktop tier-header row: "All Plans" label plus each tier's name, price
 * and CTA. Pinned under the SiteNav while the table scrolls.
 *
 * @param props.billing - The active billing period.
 */
function ComparisonTierHeader({ billing }: { billing: BillingPeriod }) {
  return (
    <div role="row" className={styles.tierHeader}>
      <div className={styles.tierHeaderLabel}>All Plans</div>
      {TIERS.map((tier) => {
        const cta = HEADER_CTA[tier.id];
        const external = cta.href.startsWith("http");
        const price = headerPrice(tier, billing);
        return (
          <div key={tier.id} role="columnheader" className={styles.tierHeaderCell}>
            <span className={styles.tierHeaderName}>{tier.name}</span>
            <span className={styles.tierHeaderPrice}>
              {price.display}
              {price.suffix ? (
                <span className={styles.tierHeaderSuffix}>{price.suffix}</span>
              ) : null}
            </span>
            <a
              href={cta.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener" : undefined}
              className={styles.tierHeaderCta}
            >
              {cta.label}
            </a>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Sub-1280px layout: one expandable <details> per tier listing every
 * section and row vertically. The first tier is open by default so the
 * content is visible without JS.
 *
 * @param props.billing - The active billing period.
 */
function ComparisonMobileAccordion({ billing }: { billing: BillingPeriod }) {
  return (
    <div className={styles.mobileList}>
      {TIERS.map((tier, tierIndex) => {
        const cta = HEADER_CTA[tier.id];
        const external = cta.href.startsWith("http");
        const price = headerPrice(tier, billing);
        return (
          <details key={tier.id} open={tierIndex === 0} className={styles.mobileTier}>
            <summary className={styles.mobileSummary}>
              <span className={styles.mobileSummaryText}>
                <span className={styles.mobileTierName}>{tier.name}</span>
                <span className={styles.mobileTierPrice}>
                  {price.suffix ? `${price.display} ${price.suffix}` : price.display}
                </span>
              </span>
              <span className={styles.mobileSummaryActions}>
                <a
                  href={cta.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener" : undefined}
                  className={styles.mobileCta}
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                >
                  {cta.label}
                </a>
                <ComparisonChevron open={false} />
              </span>
            </summary>
            <div className={styles.mobileBody}>
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className={styles.mobileSectionTitle}>{section.title}</p>
                  {section.rows.map((row) => (
                    <div key={`${section.title}-${row.label}`} className={styles.mobileRow}>
                      <span className={styles.mobileRowLabel}>
                        {row.label}
                        {row.sublabel ? (
                          <span className={styles.mobileRowSublabel}>{row.sublabel}</span>
                        ) : null}
                      </span>
                      <span className={styles.mobileRowValue}>
                        <ComparisonCell value={row.values[tierIndex]} />
                      </span>
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

/**
 * 2026 feature comparison table for /pricing. Must render inside a
 * `BillingProvider` (shared with the tier cards so prices stay in sync).
 */
export default function PricingComparisonTable() {
  const tierHeaderRef = useRef<HTMLDivElement>(null);
  const [tierHeaderHeight, setTierHeaderHeight] = useState(120);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { billing } = useBilling();

  // Measure the pinned tier header so each section header's sticky `top`
  // stacks exactly beneath it.
  useEffect(() => {
    try {
      const headerElement = tierHeaderRef.current;
      if (!headerElement) {
        return;
      }
      const update = () => setTierHeaderHeight(headerElement.offsetHeight);
      update();
      const observer = new ResizeObserver(update);
      observer.observe(headerElement);
      return () => observer.disconnect();
    } catch {
      return undefined;
    }
  }, []);

  /**
   * Collapse/expand a section by title.
   */
  const toggleSection = (title: string) => {
    try {
      setCollapsed((previous) => {
        const next = new Set(previous);
        if (next.has(title)) {
          next.delete(title);
        } else {
          next.add(title);
        }
        return next;
      });
    } catch {
      // State update failed — leave the section as-is.
    }
  };

  return (
    <section className={styles.section} data-section="pricing-comparison">
      <div className={styles.inner}>
        <h2 className={styles.heading}>
          Compare plans <span className={styles.headingRest}>in detail</span>
        </h2>

        <div className={styles.mobileOnly}>
          <ComparisonMobileAccordion billing={billing} />
        </div>

        <div className={styles.desktopOnly}>
          <div
            ref={tierHeaderRef}
            className={styles.tierHeaderSticky}
            style={{ top: NAV_OFFSET }}
          >
            <ComparisonTierHeader billing={billing} />
          </div>

          {SECTIONS.map((section) => {
            const open = !collapsed.has(section.title);
            return (
              <Fragment key={section.title}>
                <div
                  className={styles.sectionHeaderSticky}
                  style={{ top: NAV_OFFSET + tierHeaderHeight }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    aria-expanded={open}
                    className={styles.sectionToggle}
                  >
                    <span className={styles.sectionTitle}>{section.title}</span>
                    <ComparisonChevron open={open} />
                  </button>
                </div>

                {open
                  ? section.rows.map((row, rowIndex) => (
                      <div
                        key={`${section.title}-${row.label}`}
                        role="row"
                        className={
                          rowIndex === section.rows.length - 1
                            ? `${styles.row} ${styles.rowLast}`
                            : styles.row
                        }
                      >
                        <div className={styles.rowLabelCell}>
                          <span className={styles.rowLabel}>{row.label}</span>
                          {row.sublabel ? (
                            <span className={styles.rowSublabel}>{row.sublabel}</span>
                          ) : null}
                        </div>
                        {row.values.map((value, valueIndex) => (
                          <div key={valueIndex} role="cell" className={styles.rowValueCell}>
                            <ComparisonCell value={value} />
                          </div>
                        ))}
                      </div>
                    ))
                  : null}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
