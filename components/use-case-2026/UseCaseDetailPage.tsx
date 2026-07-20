import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import FaqSection, { type FaqItem } from "@/components/home-2026/FaqSection";
import UseCaseHero from "./UseCaseHero";
import UseCaseProblemSection from "./UseCaseProblemSection";
import UseCaseSolutionSection from "./UseCaseSolutionSection";
import UseCaseRelatedSection from "./UseCaseRelatedSection";
import type { UseCaseDoc, UseCaseRelatedItem } from "@/lib/use-case-types";

/** Props for the {@link UseCaseDetailPage} 2026 template composition. */
export interface UseCaseDetailPageProps {
  doc: UseCaseDoc;
  related: UseCaseRelatedItem[];
}

/**
 * Strip HTML tags so rich-text FAQ answers render as plain text — mirrors the
 * `stripHtml` used for the JSON-LD payload in `app/use-case/[slug]/page.tsx`.
 * `FaqSection` renders `answer` inside a plain `<p>`, so any markup left in
 * would show as literal tags rather than being interpreted.
 *
 * @param html - Raw HTML or plain text string.
 * @returns Plain text with HTML tags removed and whitespace normalised.
 */
function stripHtml(html: string): string {
  try {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return html;
  }
}

/**
 * Map the doc's `faq` entries onto `FaqSection`'s item shape, dropping any
 * entry without a question and stripping HTML from the answer.
 *
 * @param doc - The resolved use-case document.
 * @returns The FAQ items, or `undefined` when the doc supplies none (so
 *   `FaqSection` falls back to its own default questions).
 */
function toFaqItems(doc: UseCaseDoc): FaqItem[] | undefined {
  try {
    const items = (doc?.faq ?? [])
      .filter((item) => Boolean(item?.question))
      .map((item) => ({
        question: item.question,
        answer: stripHtml(item?.answer ?? ""),
      }))
      .filter((item) => Boolean(item.answer));

    return items.length > 0 ? items : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 2026-style /use-case/[slug] detail template: the blue-gradient hero, a
 * light-theme problem/solution retelling of the doc's copy, a related-use-
 * cases card grid, the shared testimonials section and FAQ accordion, and the
 * shared site chrome (nav + footer). Mirrors the composition established by
 * `components/feature-2026/FeaturePageBody.tsx` for template-page bodies.
 *
 * @param props.doc - The resolved `useCasePage` Sanity document.
 * @param props.related - Sibling use-case pages to cross-link.
 */
export default function UseCaseDetailPage({
  doc,
  related,
}: UseCaseDetailPageProps) {
  const faqItems = toFaqItems(doc);

  return (
    <main>
      <SiteNav />
      <UseCaseHero doc={doc} />
      {doc?.problemSection ? (
        <UseCaseProblemSection
          section={doc.problemSection}
          explanationTitle={doc?.explanationTitle}
        />
      ) : null}
      {doc?.solutionSection ? (
        <UseCaseSolutionSection section={doc.solutionSection} />
      ) : null}
      {related?.length > 0 ? (
        <UseCaseRelatedSection items={related} />
      ) : null}
      <TestimonialsSection />
      <FaqSection items={faqItems} />
      <SiteFooter />
    </main>
  );
}
