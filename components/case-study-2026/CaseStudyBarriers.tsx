import Image from "next/image";
import CaseStudySectionHeading from "./CaseStudySectionHeading";
import BarrierArtifact, { resolveBarrierArtifact } from "./BarrierArtifacts";
import type {
  CaseStudyBarrierCard,
  CaseStudyBarriersData,
} from "@/lib/case-study-data";
import styles from "./CaseStudyBarriers.module.css";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "case-study-barriers-heading";

/**
 * One barrier card: an illustration in a soft frame above the barrier
 * caption in semibold ink. Captions matching a known barrier render a
 * hand-built light artifact (see ./BarrierArtifacts) instead of the CMS
 * image — the CMS ships dark-theme illustrations that wash out on the
 * light frame. Light replacement for the old dark `BarrierCard`.
 *
 * @param props.card - The barrier's image and caption.
 */
function CaseStudyBarrierCardItem({ card }: { card: CaseStudyBarrierCard }) {
  try {
    const artifact = resolveBarrierArtifact(card?.caption);
    return (
      <li className={styles.card}>
        {artifact ? (
          <div className={styles.cardImageFrame}>
            <BarrierArtifact artifact={artifact} />
          </div>
        ) : card?.image ? (
          <div className={styles.cardImageFrame}>
            <Image
              className={styles.cardImage}
              src={card.image}
              alt={card?.imageAlt || card?.caption || ""}
              fill
              sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
            />
          </div>
        ) : null}
        {card?.caption ? (
          <p className={styles.cardCaption}>{card.caption}</p>
        ) : null}
      </li>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-styled "barriers" section: a serif ink heading over a light card grid
 * of the customer's pre-Superflow pain points. Replaces the old dark
 * `components/case-study/CaseStudyBarriers` composition.
 *
 * @param props - The doc's barriers copy and cards (same shape the old dark
 *   section consumed).
 */
export default function CaseStudyBarriers(props: CaseStudyBarriersData) {
  try {
    const cards = props?.cards ?? [];
    if (cards.length === 0 && !props?.heading && !props?.subtitle) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="case-study-barriers"
        aria-labelledby={props?.heading ? HEADING_ID : undefined}
      >
        <div className={styles.inner}>
          <CaseStudySectionHeading
            heading={props?.heading}
            subtitle={props?.subtitle}
            headingId={HEADING_ID}
          />
          {cards.length > 0 ? (
            <ul className={styles.grid}>
              {cards.map((card) => (
                <CaseStudyBarrierCardItem key={card?.number} card={card} />
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
