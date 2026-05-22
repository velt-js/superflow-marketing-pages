import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import LogoBar from "@/components/home/LogoBar";
import HeroShowcase from "@/components/home/HeroShowcase";
import EliminateRedundant from "@/components/home/EliminateRedundant";
import Testimonial from "@/components/home/Testimonial";
import ConsistentCollab from "@/components/home/ConsistentCollab";
import WorkflowStats from "@/components/home/WorkflowStats";
import FeatureCards, { type FeatureCardOverride } from "@/components/home/FeatureCards";
import CollaborationTools from "@/components/home/CollaborationTools";
import WhatElse from "@/components/home/WhatElse";
import SuperSecure from "@/components/home/SuperSecure";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import DarkSection from "@/components/home/DarkSection";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";

// Title, description, openGraph, and twitter all inherited from the root
// layout (app/layout.tsx) which already encodes the usesuperflow.com home-
// page values. Only the canonical URL is page-specific.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const HOME_CARDS: FeatureCardOverride[] = [
  {
    type: "simple",
    iconType: "comment",
    title: "Review creative assets\nwith precision",
    subtitle: "Comment directly on assets for clearer feedback",
    imageSrc: "/images/sections/home-cards/review-creative-assets.png",
    cursors: [
      { side: "left", label: "Designer", color: "#4dd5ff", topPct: 25 },
      { side: "right", label: "Photographer", color: "#3772ff", textColor: "#fff", topPct: 55 },
    ],
  },
  {
    type: "integrationIcons",
    iconType: "prioritize",
    title: "Manage, prioritize\n& assign",
    subtitle: "Use our built-in task manager or integrate your own.",
    imageSrc: "/images/sections/home-cards/manage-prioritize.png",
    imageAspectRatio: "1460/620",
    cursors: [
      { side: "left", label: "Manager", color: "#ff62a4", textColor: "#fff", topPct: 50 },
      { side: "right", label: "Team Lead", color: "#ffcd2e", topPct: 25 },
    ],
  },
  {
    type: "simple",
    iconType: "approve",
    title: "Get approvals\nat hyper speed",
    subtitle: "Built-in approvals for less back-and-forth-ing.",
    imageSrc: "/images/sections/home-cards/get-approvals.png",
    cursors: [
      { side: "left", label: "Client", color: "#b1ff4d", topPct: 20 },
      { side: "right", label: "Designer", color: "#ff62a4", topPct: 60 },
    ],
  },
  {
    type: "integrationPills",
    iconType: "integrate",
    title: "Sync with\nyour tools",
    subtitle: "Seamlessly integrate your Slack or favorite task manager",
    imageSrc: "/images/sections/home-cards/sync-with-tools.png",
    imageAspectRatio: "1400/300",
    cursors: [
      { side: "left", label: "Manager", color: "#ff9e2c", topPct: 30 },
      { side: "right", label: "Team Lead", color: "#ffcd2e", topPct: 60 },
    ],
  },
];

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <LogoBar />
      <HeroShowcase />
      <EliminateRedundant />
      <Testimonial
        name="Riley Hennigh"
        role="Product Designer @Headway.io"
        headline="Everybody has loved how easy it is to get started"
        quote='"Superflow has enabled fast feedback from stakeholders"'
        avatar="/images/sections/riley.png"
      />
      <ConsistentCollab />
      <WorkflowStats />
      <FeatureCards cards={HOME_CARDS} />
      <Testimonial
        name="Calbie Creative"
        role="Digital Designer @Calbie Creative"
        headline="No more juggling multiple feedback"
        quote='"Highly recommended for an efficient and open-door workflow!"'
        avatar="/images/sections/calbie-creative.png"
      />
      <CollaborationTools />
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
      <IntercomButton />
    </main>
  );
}
