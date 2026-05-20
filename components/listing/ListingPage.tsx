import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import ListingHero from "./ListingHero";
import ListingGrid from "./ListingGrid";
import type { ListingPageConfig } from "@/lib/listing-data";

export default function ListingPage({ config }: { config: ListingPageConfig }) {
  return (
    <main>
      <Nav />
      <ListingHero {...config.hero} />
      <ListingGrid variant={config.grid.variant} items={config.grid.items} />
      <DarkSection withTopCurve />
      <Footer />
      <IntercomButton />
    </main>
  );
}
