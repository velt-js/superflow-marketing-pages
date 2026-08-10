// /book-demo — 2026 light redesign: gradient hero + inline Calendly
// scheduler + homepage testimonials for social proof.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import CalendlyEmbed from "@/components/book-demo-2026/CalendlyEmbed";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";

const HERO_HEADING = "Book a demo";
const HERO_SUBHEADING =
  "Select a date and time to get on a call with Superflow for a personalized walkthrough";

// This route previously exported no metadata at all, so it inherited the
// root layout's site-wide title, description, and canonical. Declaring it
// here gives the page its own canonical and social card.
export const metadata = buildPageMetadata({
  title: "Book a Demo",
  description:
    "Pick a time for a personalized Superflow walkthrough. See how agencies and marketing teams review websites, video, PDFs, and images 10x faster.",
  path: "/book-demo",
  ogImage: PAGE_OG_IMAGES.bookDemo,
});

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
