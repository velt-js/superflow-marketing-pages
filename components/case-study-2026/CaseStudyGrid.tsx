import Image from "next/image";
import Link from "next/link";
import CategoryGlyph from "@/components/shared-2026/CategoryGlyph";
import type { CaseStudyListItem } from "@/sanity/lib/queries";
import styles from "./CaseStudyGrid.module.css";

/** Pixel size the card's company logo renders at. */
const LOGO_SIZE = 44;
/** Pixel size the fallback category glyph renders at, matching ListingGrid. */
const GLYPH_SIZE = 32;
/** CTA label shown at the bottom of every card. */
const CARD_CTA_TEXT = "Read case study";

/** Props for {@link CaseStudyGrid}. */
export interface CaseStudyGridProps {
  /** The case-study documents to render as cards. */
  items: CaseStudyListItem[];
}

/**
 * Renders a case-study card's leading mark: the customer's company logo when
 * the CMS ships one (brand marks are colourful and read fine on light cards),
 * otherwise a colourful Tabler {@link CategoryGlyph} resolved from the title —
 * never a dark icon disc.
 *
 * @param item - The case-study list item whose mark should be rendered.
 */
function CaseStudyGridCardMark({ item }: { item: CaseStudyListItem }) {
  try {
    const logoUrl = item?.logo ?? item?.thumbnail;
    if (logoUrl) {
      return (
        <Image
          className={styles.logoImage}
          src={logoUrl}
          alt=""
          width={LOGO_SIZE}
          height={LOGO_SIZE}
        />
      );
    }
    return <CategoryGlyph label={item?.title} size={GLYPH_SIZE} />;
  } catch {
    return null;
  }
}

/**
 * A single case-study card: company logo, semibold title, muted summary and
 * an accent CTA line, with the whole card acting as the link — the canonical
 * 2026 card idiom from `components/feature-2026/RelatedCapabilities.tsx`.
 *
 * @param item - The case-study list item to render.
 */
function CaseStudyGridCard({ item }: { item: CaseStudyListItem }) {
  try {
    return (
      <Link href={`/case-study/${item?.slug}`} className={styles.card}>
        <span className={styles.logo} aria-hidden="true">
          <CaseStudyGridCardMark item={item} />
        </span>
        <span className={styles.cardText}>
          <span className={styles.cardTitle}>{item?.title}</span>
          {item?.description ? (
            <span className={styles.cardDesc}>{item.description}</span>
          ) : null}
        </span>
        <span className={styles.cardCta}>{CARD_CTA_TEXT}</span>
      </Link>
    );
  } catch {
    return null;
  }
}

/**
 * Responsive case-study listing grid (3 columns desktop → 2 tablet →
 * 1 mobile) for the `/case-study` index page. Light-theme replacement for
 * the old dark `components/listing/ListingGrid` cards, built dedicated to
 * case studies so each card can lead with the customer's company logo.
 *
 * @param props - The case-study list items to render.
 */
export default function CaseStudyGrid({ items }: CaseStudyGridProps) {
  try {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <section className={styles.section} data-section="case-study-grid">
        <div className={styles.inner}>
          <ul className={styles.grid}>
            {items.map((item) => (
              <li key={item?._id ?? item?.slug} className={styles.item}>
                <CaseStudyGridCard item={item} />
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
