// /book-demo — 2026 light redesign: gradient hero + inline Calendly
// scheduler + homepage testimonials for social proof.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import CalendlyEmbed from "@/components/book-demo-2026/CalendlyEmbed";

const HERO_HEADING = "Book a demo";
const HERO_SUBHEADING =
  "Select a date and time to get on a call with Superflow for a personalized walkthrough";

export default function BookDemoPage() {
  return (
    <main>
      <SiteNav />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />
      <CalendlyEmbed />
      <TestimonialsSection />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
