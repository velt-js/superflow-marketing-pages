import Image from "next/image";
import type { ChecklistMainSection } from "@/lib/checklist-types";
import SeoFunnelArtifact from "./SeoFunnelArtifact";
import styles from "./ChecklistMainImage.module.css";

/** Section text that maps to the hand-built SEO funnel artifact. */
const SEO_FUNNEL_PATTERN = /seo|funnel|conversion|cro/;

/**
 * Whether the section's copy identifies it as the SEO conversion-funnel
 * visual, in which case the light-mode `SeoFunnelArtifact` replaces the
 * CMS's dark funnel bitmap.
 *
 * @param section - The checklist doc's `mainSection` value.
 * @returns `true` when the artifact should render instead of the image.
 */
function shouldUseSeoFunnelArtifact(section: ChecklistMainSection): boolean {
  try {
    const sectionText = `${section?.subText ?? ""} ${section?.caption ?? ""}`
      .toLowerCase()
      .trim();
    return sectionText.length > 0 && SEO_FUNNEL_PATTERN.test(sectionText);
  } catch {
    return false;
  }
}

/**
 * 2026-style checklist main-image section: the doc's hero visual inside
 * a light hairline-bordered card, under a serif ink heading and muted mono
 * caption. For the SEO funnel visual it renders the hand-built light-mode
 * `SeoFunnelArtifact` instead of the CMS's dark bitmap. Replaces the old
 * full-bleed black band from `components/checklist/ChecklistMainImage.tsx`.
 *
 * @param props.section - The checklist doc's `mainSection` value.
 * @returns The section, or `null` when it has nothing to show or on failure.
 */
export default function ChecklistMainImage({
  section,
}: {
  section: ChecklistMainSection;
}) {
  try {
    if (!section?.image && !section?.subText && !section?.caption) {
      return null;
    }

    const useFunnelArtifact = shouldUseSeoFunnelArtifact(section);

    return (
      <section className={styles.section} data-section="checklist-main-image">
        <div className={styles.inner}>
          {section?.subText ? (
            <h2 className={styles.heading}>{section.subText}</h2>
          ) : null}
          {section?.caption ? (
            <p className={styles.caption}>{section.caption}</p>
          ) : null}
          {useFunnelArtifact ? (
            <div className={`${styles.imageFrame} ${styles.imageFrameFlat}`}>
              <SeoFunnelArtifact />
            </div>
          ) : section?.image ? (
            <div className={styles.imageFrame}>
              <Image
                src={section.image}
                alt={section?.subText || ""}
                width={2400}
                height={1100}
                className={styles.image}
                sizes="(max-width: 1128px) 100vw, 1080px"
                priority={false}
                unoptimized
              />
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
