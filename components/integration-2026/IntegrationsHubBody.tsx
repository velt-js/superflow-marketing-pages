// IntegrationsHubBody — composition for the /preview/integrations hub.
//
// Hand-authored, prop-driven sections built from the system-of-record spec
// (superflow-page-integrations-list.md). Hero copy falls back to the CMS
// document when present. Section order:
//   hero (+ logo strip) → problem (with Kanban board) → integrations catalog
//   (the shared home-2026 IntegrationsSection) → how it works → capability
//   matrix → connector behavior → related → trust strip → FAQ → footer.

import Hero from "@/components/home-2026/Hero";
import FaqSection, { type FaqItem } from "@/components/home-2026/FaqSection";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";

import {
  IntegrationsProblem,
  IntegrationsHowItWorks,
  IntegrationsMatrix,
  IntegrationsRelated,
  IntegrationsTrustStrip,
} from "./IntegrationsHubSections";
import IntegrationsConnectors from "./IntegrationsConnectors";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";

/** Hero headline, split one line per array entry (fallback when CMS is empty). */
const HERO_HEADLINE_LINES: readonly string[] = [
  "Connect the tools",
  "you already run.",
];

/** Hero supporting copy shown in the feature-variant right column. */
const HERO_SUBHEAD =
  "Comments land in Slack. Sign-offs close Asana, Monday, and ClickUp tasks, two-way. Webhooks cover the rest. Nobody checks one more tab.";

/** FAQ heading for the integrations hub. */
const FAQ_HEADING = "Integrations, answered";

/**
 * Integrations FAQ (system of record). Exported so the page's FAQPage JSON-LD
 * mirrors the visible questions exactly.
 */
export const INTEGRATION_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Which tools does Superflow connect to?",
    answer:
      "Today: Slack, Asana, Monday, ClickUp, Webflow, WordPress, Google Tag Manager, GitHub, Vercel, webhooks, and a REST API. This list is always current.",
  },
  {
    question: "Two-way, or just notifications?",
    answer:
      "Two-way where the tool supports it. A sign-off in Superflow closes the task. A status change on your board reflects back. Each connector's page says exactly which way its data flows.",
  },
  {
    question: "My site isn't on any of these platforms. Can I still install Superflow?",
    answer:
      "Yes. Any website takes the snippet: paste one line, or send the setup steps to your developer. Custom stacks, headless sites, and anything with GTM all work.",
  },
  {
    question: "My workflow tool isn't listed. Am I stuck?",
    answer:
      "No. Webhooks push every review event anywhere, and the REST API writes back in.",
  },
  {
    question: "Will my client see our Slack messages?",
    answer:
      "No. Client and guest activity stays out of internal channels unless you explicitly map it. The client sees the review, never the plumbing.",
  },
  {
    question: "What happens if a connector breaks?",
    answer:
      "The review keeps working in-app. The event queues and retries, and the workspace admin gets a banner. An integration outage never blocks a sign-off.",
  },
  {
    question: "Do I need a developer to set this up?",
    answer:
      "No. Connect and map from settings. The REST API and webhooks exist for the one team in twenty that wants a custom pipeline.",
  },
  {
    question: "What do integrations cost?",
    answer:
      "Included from the Growth plan. Okta, SAML, and SCIM are Enterprise. See /pricing for the breakdown.",
  },
];

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
 * Render the integrations hub. Hero copy is CMS-driven with spec fallbacks;
 * every other section is hand-authored from the system-of-record spec.
 *
 * @param props - The resolved Sanity hub document to render.
 */
export default function IntegrationsHubBody({ doc }: IntegrationsHubBodyProps) {
  const heroHeadlineLines =
    doc?.hero?.headlineLines && doc.hero.headlineLines.length > 0
      ? doc.hero.headlineLines
      : HERO_HEADLINE_LINES;
  const heroSubhead = doc?.hero?.subhead ?? HERO_SUBHEAD;

  const faqItems =
    doc?.faq?.items && doc.faq.items.length > 0
      ? doc.faq.items
      : INTEGRATION_FAQ_ITEMS;
  const faqHeading = doc?.faq?.heading ?? FAQ_HEADING;

  return (
    <main>
      <SiteNav />
      <Hero
        headlineLines={heroHeadlineLines}
        subhead={heroSubhead}
        variant="feature"
        background="sunset"
        staticArtifact="integrations-hub"
      />
      <IntegrationsProblem />
      <IntegrationsSection />
      <IntegrationsHowItWorks />
      <IntegrationsMatrix />
      <IntegrationsConnectors />
      <IntegrationsRelated />
      <IntegrationsTrustStrip />
      <FaqSection heading={faqHeading} items={faqItems} />
      <SiteFooter />
    </main>
  );
}
