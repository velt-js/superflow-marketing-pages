import FAQ from "./FAQ";
import CTABanner from "./CTABanner";

export default function DarkSection() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-[120px] py-[80px]"
      style={{ background: "#121212" }}
    >
      <FAQ />
      <CTABanner />
    </section>
  );
}
