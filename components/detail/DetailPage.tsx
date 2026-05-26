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
  const dark = config.theme === "dark";
  return (
    <main className={dark ? "bg-[#010001]" : undefined}>
      <Nav />
      <DetailHero {...config.hero} />
      <ProblemSection {...config.problem} dark={dark} />
      <ShowcaseMedia {...config.showcase} dark={dark} />
      {config.features.map((feature, index) => (
        <FeatureRow key={feature.title} {...feature} reverse={index % 2 === 1} dark={dark} />
      ))}
      <RelatedWays {...config.related} dark={dark} />
      <div className="bg-[#121212]">
        <CustomerLoveCarousel roundedTop={dark} />
        <DarkSection />
      </div>
      <Footer />
      <IntercomButton />
    </main>
  );
}
