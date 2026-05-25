import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import DetailHero from "./DetailHero";
import ReasonsGrid from "./ReasonsGrid";
import ComparisonCriterion from "./ComparisonCriterion";
import OverviewTable from "./OverviewTable";
import PricingComparison from "./PricingComparison";
import WhyChooseSection from "./WhyChooseSection";
import type { ComparisonDetailConfig } from "@/lib/detail-data";

export default function ComparisonDetailPage({
  config,
}: {
  config: ComparisonDetailConfig;
}) {
  return (
    <main>
      <Nav />
      <DetailHero {...config.hero} roundedBottom={false} />
      <ReasonsGrid {...config.reasons} />
      <div className="bg-white">
        {config.criteria.map((criterion) => (
          <ComparisonCriterion key={criterion.id} {...criterion} />
        ))}
      </div>
      <OverviewTable {...config.overview} />
      <PricingComparison {...config.pricing} />
      <WhyChooseSection {...config.whyChoose} />
      <DarkSection faqItems={config.faq} />
      <Footer />
      <IntercomButton />
    </main>
  );
}
