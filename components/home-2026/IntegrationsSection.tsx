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
const CTA_HREF = "/integrations";

/** Base path for integration logos exported from Figma node 582:5822. */
const ASSET_BASE = "/images/home-2026/integrations";

/** Suffix appended to logo accessible labels. */
const LOGO_LABEL_SUFFIX = "logo";

/** Small tabler-style glyphs rendered inside each category tab. */
type TabIconName = "code" | "plug" | "send" | "list";

/** Tabler-style glyphs used where Figma draws an icon instead of a brand logo. */
type GlyphName = "mail" | "cloud" | "webhook";

interface IntegrationItem {
  /** Brand/name; rendered as the tile caption and accessible label. */
  name: string;
  /** Brand logo asset (omitted when Figma draws a plain glyph instead). */
  logo?: string;
  /** Inline glyph used when there is no brand logo (Email, REST API, WEB HOOKS). */
  glyph?: GlyphName;
}

interface IntegrationCategory {
  id: string;
  label: string;
  icon: TabIconName;
  /** Bright accent used for the header icon chip. */
  accent: string;
  /** Glyph colour that keeps enough contrast against the accent chip. */
  glyph: string;
  items: IntegrationItem[];
}

/**
 * Categories mirror the four folder cards in Figma, ordered so the lighter
 * cards (Developer, Delivery) sit in the first grid row. Item counts match
 * the "12 integrations" claim (Installation 4 + Delivery 3 + Task Management
 * 5); the Developer card lists API surfaces rather than integrations.
 */
const CATEGORIES: readonly IntegrationCategory[] = [
  {
    id: "developer",
    label: "Developer",
    icon: "code",
    accent: "#5514e1",
    glyph: "#ffffff",
    items: [
      { name: "WEB HOOKS", glyph: "webhook" },
      { name: "REST API", glyph: "cloud" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: "send",
    accent: "#139956",
    glyph: "#ffffff",
    items: [
      { name: "Slack", logo: `${ASSET_BASE}/slack.png` },
      { name: "Email", glyph: "mail" },
      { name: "WhatsApp", logo: `${ASSET_BASE}/whatsapp.png` },
    ],
  },
  {
    id: "installation",
    label: "Installation",
    icon: "plug",
    accent: "#e17a14",
    glyph: "#ffffff",
    items: [
      { name: "Framer", logo: `${ASSET_BASE}/framer.png` },
      { name: "WordPress", logo: `${ASSET_BASE}/wordpress.png` },
      { name: "Webflow", logo: `${ASSET_BASE}/webflow.png` },
      { name: "Shopify", logo: `${ASSET_BASE}/shopify.svg` },
    ],
  },
  {
    id: "task-management",
    label: "Task Management",
    icon: "list",
    accent: "#f9d834",
    glyph: "#1e1e1f",
    items: [
      { name: "Asana", logo: `${ASSET_BASE}/asana.png` },
      { name: "Trello", logo: `${ASSET_BASE}/trello.png` },
      { name: "Monday.com", logo: `${ASSET_BASE}/monday.png` },
      { name: "ClickUp", logo: `${ASSET_BASE}/clickup.png` },
      { name: "Jira", logo: `${ASSET_BASE}/jira.svg` },
    ],
  },
] as const;

interface GlyphDefinition {
  viewBox: string;
  strokeWidth: number;
  /** Explicit stroke colour; falls back to currentColor (the card accent). */
  stroke?: string;
  paths: readonly string[];
}

/** Stroke definitions for the non-brand tile glyphs. */
const GLYPH_DEFINITIONS: Record<GlyphName, GlyphDefinition> = {
  mail: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    stroke: "#f5325b",
    paths: [
      "M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z",
      "M3 7l9 6l9 -6",
    ],
  },
  cloud: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    stroke: "#f5325b",
    paths: [
      "M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878",
    ],
  },
  // Webhook artwork supplied by design (brand-blue stroke per Figma).
  webhook: {
    viewBox: "0 0 48 48",
    strokeWidth: 3.8,
    stroke: "#1868DA",
    paths: [
      "M10.4628 27.1093C9.34229 27.8115 8.42435 28.7939 7.79972 29.9594C7.17509 31.125 6.86539 32.4334 6.90123 33.7553C6.93707 35.0772 7.3172 36.3668 8.00406 37.4968C8.69093 38.6269 9.66075 39.5581 10.8177 40.1985C11.9746 40.839 13.2787 41.1664 14.6009 41.1486C15.9232 41.1308 17.2179 40.7682 18.3572 40.0968C19.4964 39.4254 20.4408 38.4684 21.0969 37.3202C21.7531 36.1721 22.0983 34.8727 22.0984 33.5503H33.4984M29.8238 40.2034C30.839 40.7637 31.9688 41.0843 33.1269 41.1406C34.285 41.197 35.4407 40.9876 36.5054 40.5285C37.5701 40.0695 38.5157 39.3729 39.2697 38.4921C40.0237 37.6113 40.5662 36.5696 40.8557 35.4468C41.1451 34.3241 41.1738 33.15 40.9396 32.0144C40.7054 30.8788 40.2145 29.8119 39.5044 28.8953C38.7943 27.9787 37.8839 27.2367 36.8429 26.7261C35.8019 26.2156 34.6579 25.9499 33.4984 25.9496C32.157 25.9496 30.7928 26.2897 29.6984 26.8996L23.9984 16.4496M31.5984 16.4496C31.5984 14.434 30.7977 12.5009 29.3724 11.0756C27.9472 9.65032 26.0141 8.84961 23.9984 8.84961C21.9828 8.84961 20.0497 9.65032 18.6244 11.0756C17.1991 12.5009 16.3984 14.434 16.3984 16.4496C16.3984 19.311 17.8614 21.8038 20.1984 23.0996L14.4984 33.5496",
    ],
  },
};

/**
 * Renders a stroked glyph for tiles where Figma draws an icon rather than a
 * brand logo (Email, and the Developer card's REST API / WEB HOOKS tiles).
 * @param glyph - Which glyph to draw.
 */
function GlyphIcon({ glyph }: { glyph: GlyphName }): ReactElement {
  const definition = GLYPH_DEFINITIONS[glyph];

  return (
    <svg
      viewBox={definition?.viewBox}
      fill="none"
      stroke={definition?.stroke ?? "currentColor"}
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

/** Stroke path data for the four tab glyphs (tabler icon geometry). */
const TAB_ICON_PATHS: Record<TabIconName, readonly string[]> = {
  code: ["M7 8l-4 4l4 4", "M17 8l4 4l-4 4", "M14 4l-4 16"],
  plug: [
    "M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054z",
    "M4 20l3.5 -3.5",
    "M15 4l-3.5 3.5",
    "M20 9l-3.5 3.5",
  ],
  send: [
    "M10 14l11 -11",
    "M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5",
  ],
  list: [
    "M13 5h8",
    "M13 9h5",
    "M13 15h8",
    "M13 19h5",
    "M4 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z",
    "M4 14m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z",
  ],
};

/**
 * Renders the small stroked glyph shown inside a category tab.
 * @param iconName - Which tab glyph to draw.
 */
function TabIcon({ iconName }: { iconName: TabIconName }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TAB_ICON_PATHS[iconName]?.map((pathData) => (
        <path key={pathData} d={pathData} />
      ))}
    </svg>
  );
}

/**
 * Renders one integration tile: a brand logo (or a stroked glyph where Figma
 * uses one, e.g. Email / REST API) paired with its mono caption.
 * @param item - The integration entry to render.
 */
function IntegrationTile({ item }: { item: IntegrationItem }): ReactElement {
  return (
    <li className={styles.tile}>
      <span className={styles.tileIcon} aria-hidden="true">
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
        ) : null}
      </span>
      <span className={styles.tileLabel}>{item?.name}</span>
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
 * Renders a single category card: a header row (accent icon chip + label)
 * over a grid of integration tiles.
 * @param category - The category to render.
 */
function CategoryCard({ category }: { category: IntegrationCategory }): ReactElement {
  const cardStyle = {
    "--accent": category.accent,
    "--glyph": category.glyph,
  } as CSSProperties;
  const placementClass = PLACEMENT_CLASSES[category.id] ?? "";

  return (
    <article
      className={`${styles.card} ${placementClass}`}
      style={cardStyle}
      aria-label={category.label}
    >
      <div className={styles.tab}>
        <span className={styles.tabIcon}>
          <TabIcon iconName={category.icon} />
        </span>
        <span className={styles.tabLabel}>{category.label}</span>
      </div>
      <ul className={styles.body} data-cat={category.id}>
        {category.items?.map((item) => (
          <IntegrationTile key={item.name} item={item} />
        ))}
      </ul>
    </article>
  );
}

/**
 * 08 / Integrations — marketing homepage section (2026 redesign).
 *
 * Presents the "Works with your existing tools" headline, a supporting line,
 * a link to the full integrations index, and four folder-style category cards
 * of integrations. The cards sit in a responsive grid below the centered
 * header (2-up ≥768px, single column below).
 *
 * A client boundary is used only for the play-once entrance reveal: an
 * IntersectionObserver flips a class when the section scrolls into view and
 * CSS staggers the cards in with a fade + blur + directional drift
 * (suppressed under prefers-reduced-motion).
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
        <div className={styles.grid}>
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
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
