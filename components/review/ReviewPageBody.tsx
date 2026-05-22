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
import WebsiteFirstCard from "./WebsiteFirstCard";
import ReviewWebsiteFuture, { type WebsiteFutureTab } from "./ReviewWebsiteFuture";
import ReviewWebsiteInstall from "./ReviewWebsiteInstall";

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
  websiteFuture?: {
    headingLine1?: string | null;
    subheading?: string | null;
    tabs?: WebsiteFutureTab[] | null;
  } | null;
  websiteInstall?: {
    headingLine1?: string | null;
    headingLine2?: string | null;
    subheading?: string | null;
    logosSrc?: string | null;
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

// Slug → hero MP4 mapping. Lives in code rather than Sanity since the assets
// are bundled with the app (public/videos/feature-hero). Returns null if the
// page is not one of the 5 feature pages.
const SHARED_FEATURE_CARD_SVGS = {
  manage: "/images/sections/feature-cards/manage-prioritize.svg",
  approvals: "/images/sections/feature-cards/get-approvals.svg",
  sync: "/images/sections/feature-cards/sync-tools.svg",
} as const;

const REVIEW_PIXELS_SVG: Record<ReviewPageDoc["feature"], string | null> = {
  image: "/images/sections/feature-cards/review-pixels-image.svg",
  video: "/images/sections/feature-cards/review-pixels-video.svg",
  lottie: "/images/sections/feature-cards/review-pixels-lottie.svg",
  pdf: "/images/sections/feature-cards/review-pixels-pdf.svg",
  // null → website-review uses the interactive WebsiteFirstCard with tab-switched SVGs
  website: null,
};

const FEATURE_HERO_VIDEOS: Record<string, string> = {
  "image-review": "/videos/feature-hero/image-review.mp4",
  "video-review": "/videos/feature-hero/video-review.mp4",
  "lottie-review": "/videos/feature-hero/lottie-review.mp4",
  "pdf-review": "/videos/feature-hero/pdf-review.mp4",
  "website-review": "/videos/feature-hero/website-review.mp4",
};

export function ReviewPageBody({ doc }: { doc: ReviewPageDoc | null }) {
  if (!doc?.hero?.headlineLine1) notFound();

  const isWebsite = doc.feature === "website";
  const showWebsiteFirstCard = isWebsite && (doc.featureCards?.cards?.[0] != null);
  const firstFeatureCard = doc.featureCards?.cards?.[0];

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
        heroVideoSrc={FEATURE_HERO_VIDEOS[doc.slug] ?? null}
      />
      <LogoBar />
      <HeroShowcase />
      <WorkflowStats />
      <FeatureCards
        cards={doc.featureCards?.cards ?? undefined}
        integrationLogos={doc.featureCards?.integrationLogos ?? undefined}
        integrationsCtaLabel={doc.featureCards?.integrationsCtaLabel ?? undefined}
        integrationsCtaHref={doc.featureCards?.integrationsCtaHref ?? undefined}
        fullCardSvgs={[
          REVIEW_PIXELS_SVG[doc.feature],
          SHARED_FEATURE_CARD_SVGS.manage,
          SHARED_FEATURE_CARD_SVGS.approvals,
          SHARED_FEATURE_CARD_SVGS.sync,
        ]}
        firstCardOverride={
          showWebsiteFirstCard && firstFeatureCard ? (
            <WebsiteFirstCard
              titleLine1={firstFeatureCard.titleLine1}
              titleLine2={firstFeatureCard.titleLine2 ?? undefined}
              subtitle={firstFeatureCard.subtitle}
            />
          ) : undefined
        }
      />
      {isWebsite && doc.websiteFuture?.tabs?.length ? (
        <ReviewWebsiteFuture
          headingLine1={doc.websiteFuture.headingLine1 ?? "Superflow is built for the future"}
          subheading={doc.websiteFuture.subheading ?? undefined}
          tabs={doc.websiteFuture.tabs}
        />
      ) : null}
      {isWebsite && doc.websiteInstall?.logosSrc ? (
        <ReviewWebsiteInstall
          headingLine1={doc.websiteInstall.headingLine1 ?? "Install Anywhere."}
          headingLine2={doc.websiteInstall.headingLine2 ?? "In Seconds."}
          subheading={doc.websiteInstall.subheading ?? undefined}
          logosSrc={doc.websiteInstall.logosSrc}
        />
      ) : null}
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
