import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "./ListingHero";
import ListingGrid from "./ListingGrid";
import type { ListingPageConfig } from "@/lib/listing-data";

/** Props for {@link ListingPage}. */
export interface ListingPageProps {
  /** Hero copy + grid items, shared with the legacy dark listing page so the
      `/use-case` and `/user-persona` routes need no data-shape changes. */
  config: ListingPageConfig;
  /**
   * Whether to render the homepage testimonials section below the grid.
   *
   * Defaults to `true`, so every existing caller keeps the section without
   * passing anything. Opt-out rather than opt-in on purpose: the section is
   * the social proof this shell was built to carry, and a caller that wants
   * it gone should have to say so explicitly.
   *
   * `/directory` passes `false`. The testimonials are about agencies using
   * Superflow, which reads as an endorsement of the listed agencies when it
   * sits directly under a directory of them - a claim the directory does not
   * make and cannot support. The other callers (`/use-case`,
   * `/user-persona`, `/checklist`) list our own content, where the section
   * is straightforwardly about us and stays.
   */
  showTestimonials?: boolean;
}

/**
 * 2026-styled page shell for the `/use-case`, `/user-persona`, `/checklist`
 * and `/directory` listing pages: the shared `SiteNav`/`SiteFooter` chrome
 * around this feature's own compact gradient hero and card grid, plus
 * (unless `showTestimonials` is false) the homepage's testimonials section
 * for social proof. Replaces `components/listing/ListingPage.tsx` (the old
 * dark theme), which is left in place for any callers not yet migrated.
 *
 * @param props - The listing's hero/grid config.
 * @param props.config - Hero copy and grid items.
 * @param props.showTestimonials - Set false to omit the testimonials
 *                                 section. Defaults to true.
 */
export default function ListingPage({
  config,
  showTestimonials = true,
}: ListingPageProps) {
  return (
    <main>
      <SiteNav />
      <ListingHero
        heading={config?.hero?.heading}
        subheading={config?.hero?.subheading}
        ctaText={config?.hero?.ctaText}
        ctaHref={config?.hero?.ctaHref}
      />
      <ListingGrid items={config?.grid?.items ?? []} />
      {showTestimonials && <TestimonialsSection />}
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
