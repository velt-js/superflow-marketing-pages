import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import LogoBar from "@/components/home/LogoBar";
import HeroShowcase from "@/components/home/HeroShowcase";
import EliminateRedundant from "@/components/home/EliminateRedundant";
import Testimonial from "@/components/home/Testimonial";
import ConsistentCollab from "@/components/home/ConsistentCollab";
import WorkflowStats from "@/components/home/WorkflowStats";
import FeatureCards from "@/components/home/FeatureCards";
import DarkSection from "@/components/home/DarkSection";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";

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
      <FeatureCards />
      <DarkSection />
      <Footer />
      <IntercomButton />
    </main>
  );
}
