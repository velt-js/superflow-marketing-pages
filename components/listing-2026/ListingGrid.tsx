import Link from "next/link";
import CategoryGlyph from "@/components/shared-2026/CategoryGlyph";
import type { ListingItem } from "@/components/listing/ListingGrid";
import { toInternalHref } from "@/lib/links";
import styles from "./ListingGrid.module.css";

/** Pixel size the card glyph renders at, matching the RelatedCapabilities glyph. */
const ICON_SIZE = 32;

/** Props for {@link ListingGrid}. */
export interface ListingGridProps {
  /** The listing items to render as cards; reuses the legacy `ListingItem` shape
      (title/subtitle/icon/iconNode/href/cta) so `lib/listing-data.ts` and the
      Sanity-driven mapping in the two app pages need no changes. */
  items: ListingItem[];
}

/**
 * Renders a listing item's icon: an `iconNode` (a pre-built React node) wins,
 * otherwise a colourful Tabler {@link CategoryGlyph} resolved from the title.
 * The CMS's flat white-stroke `icon` images are intentionally ignored — they
 * were designed for the old dark cards and needed an invert/dark-chip hack on
 * light ones.
 *
 * @param item - The listing item whose icon should be rendered.
 */
function ListingGridCardIcon({ item }: { item: ListingItem }) {
  try {
    if (item?.iconNode) {
      return <>{item.iconNode}</>;
    }
    return <CategoryGlyph label={item?.title} size={ICON_SIZE} />;
  } catch {
    return null;
  }
}

/**
 * A single listing card: a colourful category glyph, bold title and muted
 * description, with the whole card acting as the link — the canonical 2026
 * card idiom from `components/feature-2026/RelatedCapabilities.tsx`.
 *
 * @param item - The listing item to render.
 */
function ListingGridCard({ item }: { item: ListingItem }) {
  const resolvedHref = toInternalHref(item?.href) ?? item?.href ?? "#";

  return (
    <Link href={resolvedHref} className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        <ListingGridCardIcon item={item} />
      </span>
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
 * @param props - The items to render.
 */
export default function ListingGrid({ items }: ListingGridProps) {
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
                <ListingGridCard item={item} />
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
