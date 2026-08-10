// /calculator - 2026 redesign. Replaces the legacy dark Framer-derived
// Calculator with the homepage's interactive ROI calculator
// (home-2026/CostSection: presets + three sliders driving the billings
// readout) and adds ROI explainer content: the math, what each output
// means, the flat AI-credits cost against it, and an FAQ that also
// feeds FAQPage JSON-LD.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import CostSection from "@/components/home-2026/CostSection";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import {
  RoiHowItWorks,
  RoiOutputs,
  RoiCost,
} from "@/components/calculator-2026/RoiSections";
import { CALCULATOR_FAQ_ITEMS } from "@/components/calculator-2026/faq-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { JsonLd } from "@/app/_seo/JsonLd";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "See What Slow Reviews Cost You";
const HERO_SUBHEADING =
  "Three sliders, your numbers. AI agents take the first QA pass, your team takes the hours back, and the calculator shows the billings you recover in a year.";

const PAGE_TITLE = "Agency ROI Calculator";
const PAGE_DESCRIPTION =
  "See what slow reviews cost you. Drag three sliders and watch the billings recovered per year: AI agents take the first QA pass and hand the hours back.";

const CALCULATOR_FAQ_SCHEMA = buildFaqPageSchema(CALCULATOR_FAQ_ITEMS);

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/calculator",
  ogImage: PAGE_OG_IMAGES.calculator,
});

export default function CalculatorPage() {
  return (
    <main>
      <PageJsonLd
        name={`${PAGE_TITLE} | Superflow`}
        description={PAGE_DESCRIPTION}
        path="/calculator"
        trail={[{ name: PAGE_TITLE, url: `${SITE_URL}/calculator` }]}
      />
      <JsonLd id="ld-calculator-faq" data={CALCULATOR_FAQ_SCHEMA} />

      <SiteNav />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />

      <CostSection />
      <RoiHowItWorks />
      <RoiOutputs />
      <RoiCost />

      <TestimonialsSection />
      <FaqSection items={CALCULATOR_FAQ_ITEMS} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
