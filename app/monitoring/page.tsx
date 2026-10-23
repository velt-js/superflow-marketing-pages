// /monitoring - the always-on monitoring feature page. Copy lives in
// components/monitoring-2026/content.ts, which the Markdown copy reads too.
// Built from the same section components as the 2026 homepage.

import SiteNav from "@/components/home-2026/SiteNav";
import Hero from "@/components/home-2026/Hero";
import GetStarted from "@/components/home-2026/GetStarted";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import TrustSection from "@/components/home-2026/TrustSection";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import { FIRST_SCAN_AGENTS } from "@/components/home-new-2026/content";
import { BULK_SITE_PRICE_LABEL } from "@/components/pricing-2026/ai-credits-data";
import {
  MaintenanceReportSection,
  MonitoringBenefitsSection,
  MonitoringPriceSection,
  SchedulesSection,
} from "@/components/monitoring-2026/Sections";
import {
  HERO_HEADLINE_LINES,
  HERO_SUBHEAD,
  MONITORING_PATH,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  STEPS,
  STEPS_HEADING,
  STEPS_SUB,
  buildMonitoringFaq,
} from "@/components/monitoring-2026/content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { JsonLd } from "@/app/_seo/JsonLd";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: MONITORING_PATH,
});

const FAQ_ITEMS = buildMonitoringFaq(BULK_SITE_PRICE_LABEL);
const FAQ_SCHEMA = buildFaqPageSchema(FAQ_ITEMS);

export default function MonitoringPage() {
  return (
    <main>
      <PageJsonLd
        name={`${PAGE_TITLE} | Superflow`}
        description={PAGE_DESCRIPTION}
        path={MONITORING_PATH}
        trail={[{ name: "Monitoring", url: `${SITE_URL}${MONITORING_PATH}` }]}
      />
      <JsonLd id="ld-faq-monitoring" data={FAQ_SCHEMA} />
      <SiteNav />
      <Hero
        headlineLines={HERO_HEADLINE_LINES}
        subhead={HERO_SUBHEAD}
        staticArtifact="monitoring"
        staticArtifactLight
        compactHeadline
        agentLabels={FIRST_SCAN_AGENTS}
      />
      <GetStarted heading={STEPS_HEADING} subheading={STEPS_SUB} steps={STEPS} hidePlatforms />
      <MonitoringBenefitsSection />
      <SchedulesSection />
      <MaintenanceReportSection />
      <MonitoringPriceSection />
      <TestimonialsSection />
      <TrustSection />
      <IntegrationsSection />
      <FaqSection items={FAQ_ITEMS} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
