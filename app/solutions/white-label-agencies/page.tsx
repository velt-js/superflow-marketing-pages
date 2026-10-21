// /solutions/white-label-agencies: the white-label offer. Not a pack page, so
// it has its own route and composes the shared 2026 sections directly: hero
// (with the branded-toolbar visual), the four steps, what you get, what
// clients never see, resell, client sign-off, proof, cost, FAQ, other
// solutions. Copy lives in components/solutions-2026/white-label-content.ts.

import Hero from "@/components/home-2026/Hero";
import GetStarted from "@/components/home-2026/GetStarted";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ClientSignOffSection from "@/components/solutions-2026/ClientSignOffSection";
import ProofSection from "@/components/solutions-2026/ProofSection";
import RelatedSolutions from "@/components/solutions-2026/RelatedSolutions";
import ResellSection from "@/components/solutions-2026/ResellSection";
import SolutionAnalytics from "@/components/solutions-2026/SolutionAnalytics";
import SolutionCostSection from "@/components/solutions-2026/SolutionCostSection";
import SolutionFaq from "@/components/solutions-2026/SolutionFaq";
import {
  WhiteLabelBenefitsSection,
  WhiteLabelNeverSeeSection,
} from "@/components/solutions-2026/WhiteLabelSections";
import { buildSolutionFaqItems } from "@/components/solutions-2026/solution-faq-data";
import { getSolutionOgImage } from "@/components/solutions-2026/og-images";
import {
  CLIENT_LINE,
  COST_LINES,
  FAQ,
  HERO_HEADLINE_LINES,
  HERO_SUBHEAD,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  RELATED_SLUGS,
  RESELL,
  STEPS,
  STEPS_HEADING,
  STEPS_SUB,
  WHITE_LABEL_NAV_LABEL,
  WHITE_LABEL_SLUG,
} from "@/components/solutions-2026/white-label-content";
import { resolveSolutionSummaries } from "@/lib/solutions/resolve";
import { SOLUTIONS_BASE_PATH, solutionPath } from "@/lib/solutions/seed";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { ORG_ID, SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

export const revalidate = 60;

const INDEX_LABEL = "Solutions";
const PATH = solutionPath(WHITE_LABEL_SLUG);
const PROOF = "wonderist-review";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PATH,
  ogImage: getSolutionOgImage(WHITE_LABEL_SLUG),
});

const FAQ_SCHEMA = buildFaqPageSchema(buildSolutionFaqItems(FAQ));

const SOFTWARE_SCHEMA: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: PAGE_TITLE.replace(/\s*\|\s*Superflow\s*$/i, ""),
  url: `${SITE_URL}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: PAGE_DESCRIPTION,
  creator: { "@id": ORG_ID },
};

export default async function WhiteLabelAgenciesPage() {
  const summaries = await resolveSolutionSummaries();

  return (
    <>
      <PageJsonLd
        name={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path={PATH}
        trail={[
          { name: INDEX_LABEL, url: `${SITE_URL}${SOLUTIONS_BASE_PATH}` },
          { name: WHITE_LABEL_NAV_LABEL, url: `${SITE_URL}${PATH}` },
        ]}
      />
      <JsonLd id={`ld-software-solution-${WHITE_LABEL_SLUG}`} data={SOFTWARE_SCHEMA} />
      <JsonLd id={`ld-faq-solution-${WHITE_LABEL_SLUG}`} data={FAQ_SCHEMA} />
      <main>
        <SolutionAnalytics slug={WHITE_LABEL_SLUG} />
        <SiteNav />
        <Hero
          variant="feature"
          headlineLines={HERO_HEADLINE_LINES}
          subhead={HERO_SUBHEAD}
          staticArtifact="white-label"
          staticArtifactFlat
        />
        <GetStarted heading={STEPS_HEADING} subheading={STEPS_SUB} steps={STEPS} />
        <WhiteLabelBenefitsSection />
        <WhiteLabelNeverSeeSection />
        <ResellSection resell={RESELL} />
        <ClientSignOffSection clientLine={CLIENT_LINE} />
        <ProofSection proof={PROOF} />
        <SolutionCostSection cost={COST_LINES} />
        <SolutionFaq faq={FAQ} />
        <RelatedSolutions
          page={{ slug: WHITE_LABEL_SLUG, kind: "agency", related: [...RELATED_SLUGS] }}
          summaries={summaries}
        />
        <SiteFooter />
        <IntercomButton />
      </main>
    </>
  );
}
