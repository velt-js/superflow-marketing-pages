import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import DarkSection from "@/components/home/DarkSection";
import ChecklistHero from "./ChecklistHero";
import ChecklistMainImage from "./ChecklistMainImage";
import ChecklistWhatHow from "./ChecklistWhatHow";
import ChecklistSection from "./ChecklistSection";
import ChecklistEndNote from "./ChecklistEndNote";
import type { ChecklistDoc } from "@/lib/checklist-types";

export default function ChecklistDetailPage({ doc }: { doc: ChecklistDoc }) {
  return (
    <main>
      <Nav />
      <ChecklistHero doc={doc} />
      {doc.mainSection && <ChecklistMainImage section={doc.mainSection} />}
      <ChecklistWhatHow doc={doc} />
      {(doc.sections ?? []).map((section, i) => (
        <ChecklistSection key={i} section={section} />
      ))}
      {doc.endNote && <ChecklistEndNote endNote={doc.endNote} />}
      <div className="bg-[#121212]">
        <CustomerLoveCarousel />
      </div>
      <DarkSection />
      <Footer />
      <IntercomButton />
    </main>
  );
}
