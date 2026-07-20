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
}

/**
 * 2026-styled page shell for the `/use-case` and `/user-persona` listing
 * pages: the shared `SiteNav`/`SiteFooter` chrome around this feature's own
 * compact gradient hero and card grid, plus the homepage's testimonials
 * section for social proof. Replaces `components/listing/ListingPage.tsx`
 * (the old dark theme), which is left in place for any callers not yet
 * migrated.
 *
 * @param props - The listing's hero/grid config.
 */
export default function ListingPage({ config }: ListingPageProps) {
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
      <TestimonialsSection />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
