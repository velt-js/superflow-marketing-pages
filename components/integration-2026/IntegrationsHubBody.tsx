// IntegrationsHubBody — composition for the /preview/integrations hub.
//
// Reuses the 2026 homepage sections, mirroring the integration detail pages.
// The tool catalog is rendered with the shared FeatureSet: each family is a
// block whose tabs are list-only links to /preview/integrations/<slug>. No
// bespoke catalog/matrix UI is introduced — consistency over new components.
// Section order: hero → solution → catalog (FeatureSet) → industry solutions →
// integrations strip → faq → footer.

import Hero from "@/components/home-2026/Hero";
import SolutionSection from "@/components/home-2026/SolutionSection";
import FeatureSet from "@/components/home-2026/FeatureSet";
import SolutionsSection from "@/components/home-2026/SolutionsSection";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";
import FaqSection, { type FaqItem } from "@/components/home-2026/FaqSection";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";

import {
  toFeatureSetBlock,
  mapHeroTabs,
  type IntegrationPageBlock,
} from "./IntegrationPageBody";

/** Shape returned by getIntegrationPreviewHub (all sections optional). */
export interface IntegrationsHubDoc {
  _id: string;
  title: string;
  hero?: {
    kicker?: string | null;
    headlineLines?: string[] | null;
    subhead?: string | null;
    showcase?: "workflow" | "comments" | "review-agents" | null;
    tabs?: { label?: string | null; icon?: string | null }[] | null;
  } | null;
  solution?: {
    heading?: string | null;
    subheading?: string | null;
    variant?: "checklist" | "comments" | null;
  } | null;
  catalog?: {
    headerTitle?: string | null;
    journeyStart?: string | null;
    journeyEnd?: string | null;
    blocks?: IntegrationPageBlock[] | null;
  } | null;
  faq?: {
    heading?: string | null;
    items?: FaqItem[] | null;
  } | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}

interface IntegrationsHubBodyProps {
  doc: IntegrationsHubDoc;
}

/**
 * Render the CMS-driven integrations hub from an `integrationPreviewHub`
 * document, reusing the shared 2026 home sections.
 *
 * @param props - The resolved Sanity hub document to render.
 */
export default function IntegrationsHubBody({ doc }: IntegrationsHubBodyProps) {
  const heroHeadlineLines = doc?.hero?.headlineLines ?? undefined;
  const heroSubhead = doc?.hero?.subhead ?? undefined;
  const heroShowcase = doc?.hero?.showcase ?? undefined;
  const heroTabs = mapHeroTabs(doc?.hero?.tabs);

  const solutionHeading = doc?.solution?.heading ?? undefined;
  const solutionSubheading = doc?.solution?.subheading ?? undefined;
  const solutionVariant = doc?.solution?.variant ?? undefined;

  const catalogBlocks = (doc?.catalog?.blocks ?? [])
    .filter((block) => Boolean(block?.title))
    .map(toFeatureSetBlock);

  const faqItems = doc?.faq?.items ?? undefined;
  const faqHeading = doc?.faq?.heading ?? undefined;

  return (
    <main>
      <SiteNav />
      <Hero
        headlineLines={heroHeadlineLines}
        subhead={heroSubhead}
        variant="feature"
        showcase={heroShowcase}
        tabs={heroTabs}
      />
      <SolutionSection
        heading={solutionHeading}
        subheading={solutionSubheading}
        variant={solutionVariant}
      />
      <FeatureSet
        headerTitle={doc?.catalog?.headerTitle ?? undefined}
        journeyStart={doc?.catalog?.journeyStart ?? undefined}
        journeyEnd={doc?.catalog?.journeyEnd ?? undefined}
        blocks={catalogBlocks.length > 0 ? catalogBlocks : undefined}
      />
      <SolutionsSection />
      <IntegrationsSection />
      <FaqSection heading={faqHeading} items={faqItems} />
      <SiteFooter />
    </main>
  );
}
