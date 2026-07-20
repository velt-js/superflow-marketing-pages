import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import IntercomButton from "@/components/home/IntercomButton";
import ChecklistHero from "./ChecklistHero";
import ChecklistMainImage from "./ChecklistMainImage";
import ChecklistWhatHow from "./ChecklistWhatHow";
import ChecklistSection from "./ChecklistSection";
import ChecklistEndNote from "./ChecklistEndNote";
import type { ChecklistDoc } from "@/lib/checklist-types";

/**
 * 2026-style checklist detail template: the shared SiteNav/SiteFooter chrome
 * around the gradient hero (with its floating doc-download card), the doc's
 * screenshot and what/how intro copy, the checklist sections as light rows,
 * the closing end note, and the homepage testimonials for social proof.
 * Replaces `components/checklist/ChecklistDetailPage.tsx` (the old dark
 * theme), which is left in place untouched.
 *
 * @param props.doc - The resolved `checklistPage` Sanity document.
 * @returns The page body, or `null` on failure.
 */
export default function ChecklistDetailPage({ doc }: { doc: ChecklistDoc }) {
  try {
    return (
      <main>
        <SiteNav />
        <ChecklistHero doc={doc} />
        {doc?.mainSection ? (
          <ChecklistMainImage section={doc.mainSection} />
        ) : null}
        <ChecklistWhatHow doc={doc} />
        {(doc?.sections ?? []).map((section, sectionIndex) => (
          <ChecklistSection key={sectionIndex} section={section} />
        ))}
        {doc?.endNote ? <ChecklistEndNote endNote={doc.endNote} /> : null}
        <TestimonialsSection />
        <SiteFooter />
        <IntercomButton />
      </main>
    );
  } catch {
    return null;
  }
}
