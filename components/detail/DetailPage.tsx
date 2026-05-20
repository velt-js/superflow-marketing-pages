import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import DetailHero from "./DetailHero";
import ProblemSection from "./ProblemSection";
import ShowcaseMedia from "./ShowcaseMedia";
import FeatureRow from "./FeatureRow";
import RelatedWays from "./RelatedWays";
import type { DetailPageConfig } from "@/lib/detail-data";

export default function DetailPage({ config }: { config: DetailPageConfig }) {
  return (
    <main>
      <Nav />
      <DetailHero {...config.hero} />
      <ProblemSection {...config.problem} />
      <ShowcaseMedia {...config.showcase} />
      {config.features.map((feature, index) => (
        <FeatureRow key={feature.title} {...feature} reverse={index % 2 === 1} />
      ))}
      <RelatedWays {...config.related} />
      <div className="bg-[#121212]">
        <CustomerLoveCarousel />
        <DarkSection />
      </div>
      <Footer />
      <IntercomButton />
    </main>
  );
}
