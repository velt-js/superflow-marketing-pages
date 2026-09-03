// SolutionPageBody: composition for /solutions/<slug> pages.
//
// One template, many data files (spec section 2). Reuses the 2026 home
// sections wherever an equivalent exists and adds the pack, human, resell
// and cost sections that only the solutions pages need. Section order, top
// to bottom: hero, the pack, what stays human, resell (optional), how the
// client signs off, how it runs, proof, what it costs, FAQ, other solutions,
// then the footer, which carries the final trial CTA.

import type { ReactNode } from "react";
import Hero from "@/components/home-2026/Hero";
import type {
  HeroAgentFinding,
  HeroCmsTab,
} from "@/components/home-2026/HeroWorkflowShowcase";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import type { SolutionPage, SolutionSummary } from "@/lib/solutions/types";
import ClientSignOffSection from "./ClientSignOffSection";
import HowItRunsSection from "./HowItRunsSection";
import HumanSection from "./HumanSection";
import PackSection from "./PackSection";
import ProofSection from "./ProofSection";
import RelatedSolutions from "./RelatedSolutions";
import ResellSection from "./ResellSection";
import SolutionAnalytics from "./SolutionAnalytics";
import SolutionCostSection from "./SolutionCostSection";
import SolutionFaq from "./SolutionFaq";

/** Hero tabs shared by every solutions page (spec S1). */
const HERO_TABS: readonly HeroCmsTab[] = [
  { id: "qa-workflow", label: "Agents at work", icon: "robot" },
  { id: "agents", label: "Build agents", icon: "wand" },
  {
    id: "anonymous-login",
    label: "Client approves from a link",
    icon: "user-check",
  },
];

/** The hero artifact has three finding slots. */
const HERO_FINDING_SLOTS = 3;

/**
 * The findings the hero artifact shows: the first three pack agents' name
 * and finding, from page data.
 *
 * @param page - The page being rendered.
 * @returns Up to three findings.
 */
function toHeroFindings(page: SolutionPage): HeroAgentFinding[] {
  try {
    return (page?.pack?.agents ?? [])
      .filter((agent) => Boolean(agent?.name) && Boolean(agent?.finding))
      .slice(0, HERO_FINDING_SLOTS)
      .map((agent) => ({ agentName: agent.name, text: agent.finding }));
  } catch {
    return [];
  }
}

/** Props for {@link SolutionPageBody}. */
export interface SolutionPageBodyProps {
  /** The resolved page (CMS document or seed). */
  page: SolutionPage;
  /**
   * Known solution summaries for the "Other solutions" links (CMS merged
   * over seed). Falls back to the seed summaries when omitted.
   */
  summaries?: readonly SolutionSummary[];
}

/**
 * Render a full solutions page from its data.
 *
 * @param props - The page and the known summaries.
 * @returns The page body.
 */
export default function SolutionPageBody({
  page,
  summaries,
}: SolutionPageBodyProps): ReactNode {
  const agentFindings = toHeroFindings(page);

  return (
    <main>
      <SolutionAnalytics slug={page.slug} />
      <SiteNav />
      <Hero
        variant="solution"
        headlineLines={page.hero?.h1 ? [page.hero.h1] : undefined}
        subhead={page.hero?.sub || undefined}
        tabs={HERO_TABS}
        agentFindings={agentFindings}
      />
      <PackSection pack={page.pack} slug={page.slug} />
      <HumanSection human={page.human} />
      {page.resell ? <ResellSection resell={page.resell} /> : null}
      <ClientSignOffSection clientLine={page.hero?.clientLine} />
      <HowItRunsSection platformsFirst={page.platformsFirst} />
      <ProofSection proof={page.proof} />
      <SolutionCostSection cost={page.cost} />
      <SolutionFaq faq={page.faq} />
      <RelatedSolutions page={page} summaries={summaries} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
