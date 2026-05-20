import FAQ, { type FAQItemProps } from "./FAQ";
import CTABanner from "./CTABanner";

interface DarkSectionProps {
  withTopCurve?: boolean;
  faqItems?: FAQItemProps[];
}

export default function DarkSection({ withTopCurve = false, faqItems }: DarkSectionProps) {
  return (
    <section
      className={`relative flex flex-col items-center justify-center gap-[120px] py-[80px] ${withTopCurve ? "rounded-t-[60px] lg:rounded-t-[80px] -mt-[60px] lg:-mt-[80px]" : ""}`}
      style={{ background: "#121212" }}
    >
      <FAQ items={faqItems} />
      <CTABanner />
    </section>
  );
}
