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
        {doc.slug === "project-managers" && (
          <section className="container-page py-12">
            <h2 className="text-2xl font-semibold">Choosing a project management tool?</h2>
            <p className="mt-3">
              Compare workflows and collaboration options in our guide to{" "}
              <a className="underline" href="/blog/top-13-asana-alternatives-for-project-management-in-startups-and-agencies">
                13 Asana alternatives for startups and agencies
              </a>.
            </p>
          </section>
        )}
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
