import SiteNav from "@/components/home-2026/SiteNav";
import Hero from "@/components/home-2026/Hero";
import ProblemSection from "@/components/home-2026/ProblemSection";
import SolutionSection from "@/components/home-2026/SolutionSection";
import FeatureSet from "@/components/home-2026/FeatureSet";
import GetStarted from "@/components/home-2026/GetStarted";
import CostSection from "@/components/home-2026/CostSection";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import TrustSection from "@/components/home-2026/TrustSection";
import SolutionsSection from "@/components/home-2026/SolutionsSection";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import { FAQ_ITEMS } from "@/components/home-2026/faq-data";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { JsonLd } from "@/app/_seo/JsonLd";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import {
  ORG_DESCRIPTION,
  ORG_ID,
  ORG_OG_IMAGE,
  ORG_SAME_AS,
  SITE_TITLE_WITH_BRAND,
  SITE_URL,
  buildFaqPageSchema,
} from "@/app/_seo/schema";

// The 2026 homepage (v4.1). Title/description come from the shared
// positioning constants in app/_seo/schema.ts, which also feed the
// site-wide defaults in app/layout.tsx, the Organization JSON-LD, and the
// web app manifest. The helper emits the canonical, og:image,
// twitter:image, and index directives. metadataBase, icons, and the
// site-wide Organization/WebSite JSON-LD stay inherited from
// app/layout.tsx.
//
// NOTE: app/page.tsx shares the ROOT route segment with app/layout.tsx, so the
// layout's `title.template` ("%s | Superflow") does NOT apply here (Next.js only
// applies a template to CHILD segments). We therefore pass the brand suffix in
// the title ourselves — buildPageMetadata detects it and emits an absolute
// title so the tab reads exactly "The QA agents for your website | Superflow".
const PAGE_TITLE_WITH_BRAND = SITE_TITLE_WITH_BRAND;
const PAGE_DESCRIPTION = ORG_DESCRIPTION;

export const metadata = buildPageMetadata({
  title: PAGE_TITLE_WITH_BRAND,
  description: PAGE_DESCRIPTION,
  path: "/",
});

const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Superflow",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: ORG_DESCRIPTION,
  image: ORG_OG_IMAGE,
  // Tiers: Starter ($0), Growth ($24/seat/mo annual), Scale ($28/seat/mo annual),
  // Enterprise (custom — excluded from highPrice per schema best-practice).
  // offerCount = 4 (all four published tiers including Enterprise).
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "28",
    offerCount: 4,
  },
  sameAs: ORG_SAME_AS,
  creator: { "@id": ORG_ID },
};

const FAQ_SCHEMA = buildFaqPageSchema(FAQ_ITEMS);

export default function HomePage() {
  return (
    <main>
      <PageJsonLd
        name={PAGE_TITLE_WITH_BRAND}
        description={PAGE_DESCRIPTION}
        path="/"
      />
      <JsonLd id="ld-software-application" data={SOFTWARE_APPLICATION_SCHEMA} />
      <JsonLd id="ld-faq-home" data={FAQ_SCHEMA} />
      <SiteNav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeatureSet />
      <GetStarted />
      <CostSection />
      <TestimonialsSection />
      <TrustSection />
      <SolutionsSection />
      <IntegrationsSection />
      <FaqSection />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
