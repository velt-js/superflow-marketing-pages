// ReviewPageBody — composition for /<feature>-review pages.
//
// Ported from /superflow-marketing-pages homepage. Section order mirrors
// the Superflow live homepage (which the user designated as source of
// truth for these pages). Only the Hero is per-feature (Sanity-driven);
// every other section is the Superflow default.

import { notFound } from "next/navigation";

import CollaborationTools, {
  type CollaborationToolsCardOverride,
} from "@/components/home/CollaborationTools";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import DarkSection from "@/components/home/DarkSection";
import FeatureCards, {
  type FeatureCardOverride,
  type IntegrationLogoOverride,
} from "@/components/home/FeatureCards";
import Footer from "@/components/home/Footer";
import HeroShowcase from "@/components/home/HeroShowcase";
import LogoBar from "@/components/home/LogoBar";
import Nav from "@/components/home/Nav";
import SuperSecure from "@/components/home/SuperSecure";
import Testimonial from "@/components/home/Testimonial";
import WhatElse from "@/components/home/WhatElse";
import WorkflowStats from "@/components/home/WorkflowStats";

import { ReviewHero, type ReviewHeroPersona } from "./ReviewHero";

type CtaLink = {
  label?: string;
  href?: string;
  newTab?: boolean;
};

export type ReviewPageDoc = {
  _id: string;
  title: string;
  slug: string;
  feature: "image" | "video" | "lottie" | "pdf" | "website";
  hero: {
    headlineLine1: string;
    subheading?: string;
    personaLeft?: ReviewHeroPersona | null;
    personaRight?: ReviewHeroPersona | null;
    primaryCta?: CtaLink | null;
    secondaryCta?: CtaLink | null;
    heroMediaSrc?: string | null;
  };
  featureCards?: {
    eyebrow?: string | null;
    heading?: string | null;
    cards?: FeatureCardOverride[] | null;
    integrationLogos?: IntegrationLogoOverride[] | null;
    integrationsCtaLabel?: string | null;
    integrationsCtaHref?: string | null;
  } | null;
  collaborationTools?: {
    headingLine1?: string | null;
    headingLine2?: string | null;
    cards?: CollaborationToolsCardOverride[] | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
  } | null;
  faqFormatsAnswer?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export function ReviewPageBody({ doc }: { doc: ReviewPageDoc | null }) {
  if (!doc?.hero?.headlineLine1) notFound();

  return (
    <main>
      <Nav />
      <ReviewHero
        headlineLine1={doc.hero.headlineLine1}
        subheading={doc.hero.subheading}
        personaLeft={doc.hero.personaLeft ?? undefined}
        personaRight={doc.hero.personaRight ?? undefined}
        primaryCta={doc.hero.primaryCta ?? undefined}
        secondaryCta={doc.hero.secondaryCta ?? undefined}
        heroMediaSrc={doc.hero.heroMediaSrc}
        heroMediaAlt={`${doc.title} preview`}
      />
      <LogoBar />
      <HeroShowcase />
      <WorkflowStats />
      <FeatureCards
        cards={doc.featureCards?.cards ?? undefined}
        integrationLogos={doc.featureCards?.integrationLogos ?? undefined}
        integrationsCtaLabel={doc.featureCards?.integrationsCtaLabel ?? undefined}
        integrationsCtaHref={doc.featureCards?.integrationsCtaHref ?? undefined}
      />
      <Testimonial
        name="Calbie Creative"
        role="Digital Designer @Calbie Creative"
        headline="No more juggling multiple feedback"
        quote='"Highly recommended for an efficient and open-door workflow!"'
        avatar="/images/sections/calbie-creative.png"
      />
      <CollaborationTools
        headingLine1={doc.collaborationTools?.headingLine1 ?? undefined}
        headingLine2={doc.collaborationTools?.headingLine2 ?? undefined}
        cards={doc.collaborationTools?.cards ?? undefined}
        ctaLabel={doc.collaborationTools?.ctaLabel ?? undefined}
        ctaHref={doc.collaborationTools?.ctaHref ?? undefined}
      />
      <Testimonial
        name="Simon Smallchua"
        role="COO @Harvey"
        headline="Clear, Simple & Saves time for everyone involved"
        quote='"It saves time clarifying feedback, assigning tasks, and resolving actions in real-time."'
        avatar="/images/sections/simon-smallchua.png"
      />
      <WhatElse />
      <SuperSecure />
      <CustomerLoveCarousel />
      <DarkSection />
      <Footer />
    </main>
  );
}
