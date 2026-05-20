import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import CaseStudyHero from "./CaseStudyHero";
import CaseStudyProblemSolution from "./CaseStudyProblemSolution";
import CaseStudyBarriers from "./CaseStudyBarriers";
import CaseStudySolutions from "./CaseStudySolutions";
import CaseStudyResults from "./CaseStudyResults";
import CaseStudyTestimonial from "./CaseStudyTestimonial";
import type { CaseStudyConfig } from "@/lib/case-study-data";

export default function CaseStudyPage({ config }: { config: CaseStudyConfig }) {
  return (
    <main>
      <Nav />
      <CaseStudyHero {...config.hero} />
      <CaseStudyProblemSolution {...config.problemSolution} />
      <CaseStudyBarriers {...config.barriers} />
      <CaseStudySolutions {...config.solutions} />
      <CaseStudyResults {...config.results} />
      <CaseStudyTestimonial {...config.testimonial} />
      <DarkSection faqItems={config.faq} />
      <Footer />
      <IntercomButton />
    </main>
  );
}
