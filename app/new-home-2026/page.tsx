// /new-home-2026 - draft of the next homepage, built from the October 2026
// stages/product/pricing report. Copy lives in components/home-new-2026/
// content.ts, which the Markdown copy reads too. Kept noindex and out of the
// sitemap until it replaces app/page.tsx.

import SiteNav from "@/components/home-2026/SiteNav";
import Hero from "@/components/home-2026/Hero";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import {
  AgentsSection,
  CompareSection,
  ReportSection,
  StagesSection,
  WhatYouGetSection,
  WhyNowSection,
} from "@/components/home-new-2026/Sections";
import {
  HERO_HEADLINE_LINES,
  HERO_SUBHEAD,
  NEW_HOME_PATH,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from "@/components/home-new-2026/content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: NEW_HOME_PATH,
  noindex: true,
});

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
      />
      <StagesSection />
      <WhatYouGetSection />
      <WhyNowSection />
      <AgentsSection />
      <ReportSection />
      <CompareSection />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
