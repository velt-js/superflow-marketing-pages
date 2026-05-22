import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import Calculator from "@/components/calculator/Calculator";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Cost Calculator",
  description:
    "See how much money your team loses on slow feedback loops. Drag the slider, pick the roles, watch the number climb.",
  path: "/calculator",
});

export default function CalculatorPage() {
  return (
    <main>
      <Nav />
      <Calculator />
      <Footer />
      <IntercomButton />
    </main>
  );
}
