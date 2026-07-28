"use client";

import Image from "next/image";
import type { CSSProperties, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./IntegrationsSection.module.css";

/** How much of the section must be visible before the entrance reveal plays. */
const REVEAL_THRESHOLD = 0.2;

/** Copy lifted verbatim from Figma node 582:5822. */
const SECTION_TITLE = "Works with your existing tools";
const SECTION_SUBTITLE = "12 integrations verified, two-way where it counts";
const CTA_LABEL = "View All Integrations";

/**
 * Public integrations index. Also the fallback link for chips that don't have
 * a dedicated detail page yet (mid-migration), so every pill stays clickable.
 */
const INTEGRATIONS_INDEX_HREF = "/integrations";
const CTA_HREF = INTEGRATIONS_INDEX_HREF;

/** Base path for integration logos exported from Figma node 582:5822. */
const ASSET_BASE = "/images/home-2026/integrations";

/** Suffix appended to logo accessible labels. */
const LOGO_LABEL_SUFFIX = "logo";

/** Stroked glyphs used where a connector has no brand logo. */
type GlyphName = "webhook" | "cloud" | "mail";

interface IntegrationItem {
  /** Brand/name; rendered as the chip label and accessible label. */
  name: string;
  /** Brand logo asset; items without one use a {@link GlyphName} glyph. */
  logo?: string;
  /** Stroked glyph shown for logo-less connectors (Webhooks / REST API / Email). */
  glyph?: GlyphName;
  /**
   * Detail page for this connector. Omitted where no public page exists yet;
   * those chips fall back to {@link INTEGRATIONS_INDEX_HREF}.
   */
  href?: string;
}

interface IntegrationCategory {
  id: string;
  label: string;
  /** Accent used for the dot marker on logo-less chips and chip hover. */
  accent: string;
  items: IntegrationItem[];
}

/**
 * Categories mirror the four groups from Figma, ordered lightest-first.
 * Item counts back the "12 integrations" claim (Delivery 3 + Installation 4 +
 * Task Management 5); the Developer row lists API surfaces rather than
 * integrations, so it is excluded from that count.
 */
const CATEGORIES: readonly IntegrationCategory[] = [
  {
    id: "developer",
    label: "Developer",
    accent: "#5514e1",
    items: [
      { name: "Webhooks", glyph: "webhook" },
      { name: "REST API", glyph: "cloud" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    accent: "#139956",
    items: [
      {
        name: "Slack",
        logo: `${ASSET_BASE}/slack.png`,
        href: `${INTEGRATIONS_INDEX_HREF}/slack`,
      },
      { name: "Email", glyph: "mail" },
      { name: "WhatsApp", logo: `${ASSET_BASE}/whatsapp.png` },
    ],
  },
  {
    id: "installation",
    label: "Installation",
    accent: "#e17a14",
    items: [
      { name: "Framer", logo: `${ASSET_BASE}/framer.png` },
      {
        name: "WordPress",
        logo: `${ASSET_BASE}/wordpress.png`,
        href: `${INTEGRATIONS_INDEX_HREF}/wordpress`,
      },
      {
        name: "Webflow",
        logo: `${ASSET_BASE}/webflow.png`,
        href: `${INTEGRATIONS_INDEX_HREF}/webflow`,
      },
      {
        name: "Shopify",
        logo: `${ASSET_BASE}/shopify.svg`,
        href: `${INTEGRATIONS_INDEX_HREF}/shopify`,
      },
    ],
  },
  {
    id: "task-management",
    label: "Task Management",
    // Deepened from the Figma yellow so the accent stays legible as a thin
    // hover border / dot on a white chip.
    accent: "#c99a06",
    items: [
      {
        name: "Asana",
        logo: `${ASSET_BASE}/asana.png`,
        href: `${INTEGRATIONS_INDEX_HREF}/asana`,
      },
      { name: "Trello", logo: `${ASSET_BASE}/trello.png` },
      {
        name: "Monday.com",
        logo: `${ASSET_BASE}/monday.png`,
        href: `${INTEGRATIONS_INDEX_HREF}/monday`,
      },
      {
        name: "ClickUp",
        logo: `${ASSET_BASE}/clickup.png`,
        href: `${INTEGRATIONS_INDEX_HREF}/clickup`,
      },
      { name: "Jira", logo: `${ASSET_BASE}/jira.svg` },
    ],
  },
] as const;

interface GlyphDefinition {
  viewBox: string;
  strokeWidth: number;
  /** Explicit stroke colour (Figma brand colours for these glyphs). */
  stroke: string;
  paths: readonly string[];
}

/** Stroke definitions for the logo-less chip glyphs (lifted from Figma). */
const GLYPH_DEFINITIONS: Record<GlyphName, GlyphDefinition> = {
  // Webhook artwork supplied by design (brand-blue stroke per Figma).
  webhook: {
    viewBox: "0 0 48 48",
    strokeWidth: 3.8,
    stroke: "#1868DA",
    paths: [
      "M10.4628 27.1093C9.34229 27.8115 8.42435 28.7939 7.79972 29.9594C7.17509 31.125 6.86539 32.4334 6.90123 33.7553C6.93707 35.0772 7.3172 36.3668 8.00406 37.4968C8.69093 38.6269 9.66075 39.5581 10.8177 40.1985C11.9746 40.839 13.2787 41.1664 14.6009 41.1486C15.9232 41.1308 17.2179 40.7682 18.3572 40.0968C19.4964 39.4254 20.4408 38.4684 21.0969 37.3202C21.7531 36.1721 22.0983 34.8727 22.0984 33.5503H33.4984M29.8238 40.2034C30.839 40.7637 31.9688 41.0843 33.1269 41.1406C34.285 41.197 35.4407 40.9876 36.5054 40.5285C37.5701 40.0695 38.5157 39.3729 39.2697 38.4921C40.0237 37.6113 40.5662 36.5696 40.8557 35.4468C41.1451 34.3241 41.1738 33.15 40.9396 32.0144C40.7054 30.8788 40.2145 29.8119 39.5044 28.8953C38.7943 27.9787 37.8839 27.2367 36.8429 26.7261C35.8019 26.2156 34.6579 25.9499 33.4984 25.9496C32.157 25.9496 30.7928 26.2897 29.6984 26.8996L23.9984 16.4496M31.5984 16.4496C31.5984 14.434 30.7977 12.5009 29.3724 11.0756C27.9472 9.65032 26.0141 8.84961 23.9984 8.84961C21.9828 8.84961 20.0497 9.65032 18.6244 11.0756C17.1991 12.5009 16.3984 14.434 16.3984 16.4496C16.3984 19.311 17.8614 21.8038 20.1984 23.0996L14.4984 33.5496",
    ],
  },
  // "REST API" cloud glyph (Figma pink).
  cloud: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    stroke: "#f5325b",
    paths: [
      "M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878",
    ],
  },
  mail: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    stroke: "#f5325b",
    paths: [
      "M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z",
      "M3 7l9 6l9 -6",
    ],
  },
};

/**
 * Renders a stroked glyph for chips without a brand logo (Webhooks / REST API
 * / Email).
 * @param glyph - Which glyph to draw.
 */
function GlyphIcon({ glyph }: { glyph: GlyphName }): ReactElement {
  const definition = GLYPH_DEFINITIONS[glyph];

  return (
    <svg
      className={styles.glyphIcon}
      viewBox={definition?.viewBox}
      fill="none"
      stroke={definition?.stroke}
      strokeWidth={definition?.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {definition?.paths?.map((pathData) => (
        <path key={pathData} d={pathData} />
      ))}
    </svg>
  );
}

/**
 * Renders one integration chip as a link: a brand logo, or a stroked glyph for
 * logo-less entries (Webhooks / REST API / Email), paired with its label.
 * Deep-links to the connector's detail page when one exists, otherwise to the
 * integrations index.
 * @param item - The integration entry to render.
 */
function IntegrationChip({ item }: { item: IntegrationItem }): ReactElement {
  const href = item?.href ?? INTEGRATIONS_INDEX_HREF;

  return (
    <li className={styles.chipItem}>
      <a className={styles.chip} href={href}>
        <span className={styles.chipIcon} aria-hidden="true">
          {item?.logo ? (
            <Image
              className={styles.logoImage}
              src={item.logo}
              alt={`${item?.name} ${LOGO_LABEL_SUFFIX}`}
              width={40}
              height={40}
            />
          ) : item?.glyph ? (
            <GlyphIcon glyph={item.glyph} />
          ) : (
            <span className={styles.dot} />
          )}
        </span>
        <span className={styles.chipLabel}>{item?.name}</span>
      </a>
    </li>
  );
}

/**
 * Per-category class carrying the entrance-reveal stagger delay (see CSS).
 */
const PLACEMENT_CLASSES: Record<string, string> = {
  developer: styles.placeDeveloper,
  delivery: styles.placeDelivery,
  installation: styles.placeInstallation,
  "task-management": styles.placeTaskManagement,
};

/**
 * Renders a single category row: a tracked uppercase label on the left and a
 * cluster of wrapping integration chips on the right, separated from its
 * neighbours by a hairline divider.
 * @param category - The category to render.
 */
function CategoryRow({ category }: { category: IntegrationCategory }): ReactElement {
  const rowStyle = { "--accent": category.accent } as CSSProperties;
  const placementClass = PLACEMENT_CLASSES[category.id] ?? "";

  return (
    <div className={`${styles.row} ${placementClass}`} style={rowStyle}>
      <dt className={styles.rowLabel}>{category.label}</dt>
      <dd className={styles.rowValue}>
        <ul className={styles.chips}>
          {category.items?.map((item) => (
            <IntegrationChip key={item.name} item={item} />
          ))}
        </ul>
      </dd>
    </div>
  );
}

/**
 * 08 / Integrations — marketing homepage section (2026 redesign).
 *
 * Presents the "Works with your existing tools" headline, a supporting line,
 * a link to the full integrations index, and the integrations grouped as
 * editorial rows: each category is a tracked uppercase label on the left with
 * its tools as wrapping chips on the right, split by hairline dividers.
 *
 * A client boundary is used only for the play-once entrance reveal: an
 * IntersectionObserver flips a class when the section scrolls into view and
 * CSS staggers the rows in with a fade + blur + drift (suppressed under
 * prefers-reduced-motion).
 */
export default function IntegrationsSection(): ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(sectionElement);
    return () => observer.disconnect();
  }, []);

  const sectionClassName = isRevealed
    ? `${styles.section} ${styles.revealed}`
    : styles.section;

  return (
    <section
      ref={sectionRef}
      className={sectionClassName}
      data-section="integrations"
      aria-labelledby="integrations-title"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="integrations-title" className={styles.title}>
            {SECTION_TITLE}
          </h2>
          <div className={styles.headerAside}>
            <p className={styles.subtitle}>{SECTION_SUBTITLE}</p>
            <a className={styles.cta} href={CTA_HREF}>
              {CTA_LABEL}
            </a>
          </div>
        </header>
        <dl className={styles.rows}>
          {CATEGORIES.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </dl>
      </div>
    </section>
  );
}
