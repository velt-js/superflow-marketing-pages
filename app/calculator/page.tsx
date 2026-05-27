import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import Calculator from "@/components/calculator/Calculator";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Creative Review ROI Calculator",
  description:
    "Calculate the cost of slow feedback loops on your creative team. Drag the slider, pick the roles, watch the number climb.",
  path: "/calculator",
});

export default function CalculatorPage() {
  return (
    <main>
      <PageJsonLd
        name="Creative Review ROI Calculator | Superflow"
        description="Calculate the cost of slow feedback loops on your creative team. Drag the slider, pick the roles, watch the number climb."
        path="/calculator"
        trail={[{ name: "Creative Review ROI Calculator", url: `${SITE_URL}/calculator` }]}
      />
      <Nav />
      <Calculator />
      <Footer />
      <IntercomButton />
    </main>
  );
}
