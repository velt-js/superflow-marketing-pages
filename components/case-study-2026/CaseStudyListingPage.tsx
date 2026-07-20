import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import CaseStudyGrid from "./CaseStudyGrid";
import type { CaseStudyListItem } from "@/sanity/lib/queries";

/** Props for {@link CaseStudyListingPage}. */
export interface CaseStudyListingPageProps {
  /** Hero headline. */
  heading: string;
  /** Hero support copy. */
  subheading: string;
  /** The case-study documents to render in the grid. */
  items: CaseStudyListItem[];
}

/**
 * 2026-styled `/case-study` index page: the shared `SiteNav`/`SiteFooter`
 * chrome around the compact gradient `ListingHero`, a dedicated logo-led
 * case-study card grid, and the homepage's testimonials section for social
 * proof. Replaces the old dark `components/listing/ListingPage` composition,
 * which is left in place untouched.
 *
 * @param props - Hero copy and the case-study list items.
 */
export default function CaseStudyListingPage({
  heading,
  subheading,
  items,
}: CaseStudyListingPageProps) {
  return (
    <main>
      <SiteNav />
      <ListingHero heading={heading} subheading={subheading} />
      <CaseStudyGrid items={items ?? []} />
      <TestimonialsSection />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
