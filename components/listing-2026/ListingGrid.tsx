import Image from "next/image";
import Link from "next/link";
import type { ListingItem } from "@/components/listing/ListingGrid";
import { toInternalHref } from "@/lib/links";
import styles from "./ListingGrid.module.css";

/** Pixel size the card icon renders at, matching the RelatedCapabilities glyph. */
const ICON_SIZE = 32;

/** Props for {@link ListingGrid}. */
export interface ListingGridProps {
  /** The listing items to render as cards; reuses the legacy `ListingItem` shape
      (title/subtitle/icon/iconNode/href/cta) so `lib/listing-data.ts` and the
      Sanity-driven mapping in the two app pages need no changes. */
  items: ListingItem[];
  /**
   * Inverts raster/SVG icons whose strokes ship light/white (the Framer
   * use-case + user-persona icons were designed for dark cards). Mirrors the
   * legacy grid's `iconInvert` prop so the two app pages pass it unchanged.
   */
  iconInvert?: boolean;
}

/**
 * Renders a listing item's icon, honoring `iconNode` (a pre-built React node)
 * over a plain `icon` image URL. Returns `null` when the item has neither, so
 * cards without an icon render with the same card padding, no empty box.
 *
 * @param item - The listing item whose icon should be rendered.
 * @param invert - Whether to invert a light/white-stroke icon for a light card.
 */
function ListingGridCardIcon({
  item,
  invert,
}: {
  item: ListingItem;
  invert?: boolean;
}) {
  try {
    if (item?.iconNode) {
      return <>{item.iconNode}</>;
    }
    if (item?.icon) {
      return (
        <Image
          src={item.icon}
          alt=""
          width={ICON_SIZE}
          height={ICON_SIZE}
          className={styles.iconImage}
          style={invert ? { filter: "invert(1)" } : undefined}
        />
      );
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * A single listing card: an optional icon, bold title and muted description,
 * with the whole card acting as the link — the canonical 2026 card idiom
 * from `components/feature-2026/RelatedCapabilities.tsx`.
 *
 * @param item - The listing item to render.
 * @param invert - Whether the item's icon needs inverting for a light card.
 */
function ListingGridCard({
  item,
  invert,
}: {
  item: ListingItem;
  invert?: boolean;
}) {
  const resolvedHref = toInternalHref(item?.href) ?? item?.href ?? "#";

  return (
    <Link href={resolvedHref} className={styles.card}>
      {item?.icon || item?.iconNode ? (
        <span className={styles.icon} aria-hidden="true">
          <ListingGridCardIcon item={item} invert={invert} />
        </span>
      ) : null}
      <span className={styles.cardText}>
        <span className={styles.cardTitle}>{item?.title}</span>
        {item?.subtitle ? (
          <span className={styles.cardDesc}>{item.subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * Responsive listing grid (3 columns desktop → 2 tablet → 1 mobile) used by
 * the `/use-case` and `/user-persona` index pages. Replaces the old dark
 * `components/listing/ListingGrid.tsx` with the light 2026 card idiom shared
 * with `components/feature-2026/RelatedCapabilities.tsx`.
 *
 * @param props - The items to render and whether their icons need inverting.
 */
export default function ListingGrid({ items, iconInvert }: ListingGridProps) {
  try {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <section className={styles.section} data-section="listing-grid">
        <div className={styles.inner}>
          <ul className={styles.grid}>
            {items.map((item) => (
              <li key={item?.href ?? item?.title} className={styles.item}>
                <ListingGridCard item={item} invert={iconInvert} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
