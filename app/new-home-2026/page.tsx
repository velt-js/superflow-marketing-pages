// /new-home-2026 - draft of the next homepage, built from the October 2026
// stages/product/pricing report. Copy lives in components/home-new-2026/
// content.ts, which the Markdown copy reads too. Kept noindex and out of the
// sitemap until it replaces app/page.tsx.

import SiteNav from "@/components/home-2026/SiteNav";
import Hero from "@/components/home-2026/Hero";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import TrustSection from "@/components/home-2026/TrustSection";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import SiteFooter from "@/components/home-2026/SiteFooter";
import { BULK_SITE_PRICE_LABEL } from "@/components/pricing-2026/ai-credits-data";
import IntercomButton from "@/components/home/IntercomButton";
import {
  AgentsSection,
  BuildOrBuySection,
  CompareSection,
  ReportSection,
  StagesSection,
  WhatYouGetSection,
  WhyNowSection,
} from "@/components/home-new-2026/Sections";
import {
  HERO_HEADLINE_LINES,
  HERO_SUBHEAD,
  FIRST_SCAN_AGENTS,
  NEW_HOME_PATH,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  buildNewHomeFaq,
} from "@/components/home-new-2026/content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: NEW_HOME_PATH,
  noindex: true,
});

const FAQ_ITEMS = buildNewHomeFaq(BULK_SITE_PRICE_LABEL);

export default function NewHomePage() {
  return (
    <main>
      <SiteNav />
      <Hero
        headlineLines={HERO_HEADLINE_LINES}
        subhead={HERO_SUBHEAD}
        staticArtifact="new-home-agents"
        staticArtifactLight
        compactHeadline
        agentLabels={FIRST_SCAN_AGENTS}
      />
      <StagesSection />
      <WhyNowSection />
      <WhatYouGetSection />
      <AgentsSection />
      <ReportSection />
      <CompareSection />
      <BuildOrBuySection />
      <TestimonialsSection />
      <TrustSection />
      <IntegrationsSection />
      <FaqSection items={FAQ_ITEMS} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
