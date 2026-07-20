import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import type {
  PersonaListItem,
  SanityUserPersonaDoc,
} from "@/lib/sanity-adapters/user-persona";
import { mapUserPersonaDocToPageContent } from "./adapter";
import PersonaHero from "./PersonaHero";
import PersonaProblemSection from "./PersonaProblemSection";
import PersonaShowcaseSection from "./PersonaShowcaseSection";
import PersonaFeatureRows from "./PersonaFeatureRows";
import RelatedPersonas from "./RelatedPersonas";

/** Props for {@link UserPersonaDetailPage}. */
export interface UserPersonaDetailPageProps {
  /** The resolved `userPersonaPage` Sanity document. */
  doc: SanityUserPersonaDoc;
  /** Every published persona listing entry, used for the related-personas grid. */
  siblings?: PersonaListItem[];
}

/**
 * 2026-style composition for the `/user-persona/[slug]` detail template:
 * SiteNav → compact hero → problem → showcase → feature rows →
 * related personas → testimonials → FAQ → SiteFooter. Mirrors the section
 * order + reused chrome established by `components/feature-2026/FeaturePageBody.tsx`.
 *
 * @param props - The raw Sanity document and its sibling persona listings.
 */
export default function UserPersonaDetailPage({
  doc,
  siblings = [],
}: UserPersonaDetailPageProps) {
  try {
    const content = mapUserPersonaDocToPageContent(doc, siblings);

    return (
      <main>
        <SiteNav />
        <PersonaHero content={content.hero} />
        <PersonaProblemSection content={content.problem} />
        <PersonaShowcaseSection content={content.showcase} />
        <PersonaFeatureRows rows={content.featureRows} />
        <RelatedPersonas content={content.related} />
        <TestimonialsSection />
        <FaqSection items={content.faq} />
        <SiteFooter />
      </main>
    );
  } catch {
    return null;
  }
}
