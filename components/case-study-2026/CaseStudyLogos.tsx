import TrustLogoCarousel from "@/components/home-2026/TrustLogoCarousel";
import styles from "./CaseStudyLogos.module.css";

/**
 * Customer logo strip for the `/case-study` index. Reuses the homepage hero's
 * carousel so the two pages always show the same customers, including the
 * ones that have no case study yet.
 */
export default function CaseStudyLogos() {
  return (
    <section className={styles.section} aria-label="Customers">
      <p className={styles.label}>Trusted by teams at</p>
      <TrustLogoCarousel />
    </section>
  );
}
