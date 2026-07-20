import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import FaqSection, { type FaqItem } from "@/components/home-2026/FaqSection";
import IntercomButton from "@/components/home/IntercomButton";
import CaseStudyHero from "./CaseStudyHero";
import CaseStudyOverview from "./CaseStudyOverview";
import CaseStudyBarriers from "./CaseStudyBarriers";
import CaseStudySolutions from "./CaseStudySolutions";
import CaseStudyResults from "./CaseStudyResults";
import CaseStudyTestimonial from "./CaseStudyTestimonial";
import type { CaseStudyConfig } from "@/lib/case-study-data";

/** Props for {@link CaseStudyDetailPage}. */
export interface CaseStudyDetailPageProps {
  /** The case study's section data — the same `CaseStudyConfig` the old dark
      `components/case-study/CaseStudyPage` consumed, so the route's Sanity
      mapping stays untouched. */
  config: CaseStudyConfig;
  /** Optional company logo URL, shown in the hero's white chip. */
  logo?: string;
}

/**
 * Strip HTML tags so rich-text FAQ answers render as plain text — mirrors the
 * `stripHtml` used for the JSON-LD payload in `app/case-study/[slug]/page.tsx`.
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
 * Map the config's `faq` entries onto `FaqSection`'s item shape, dropping any
 * entry without a question or answer.
 *
 * @param config - The case study's section data.
 * @returns The FAQ items, or an empty array when the doc supplies none (the
 *   FAQ section is skipped entirely in that case — case-study pages only
 *   show their own questions, not the homepage defaults).
 */
function toFaqItems(config: CaseStudyConfig): FaqItem[] {
  try {
    return (config?.faq ?? [])
      .filter((item) => Boolean(item?.q))
      .map((item) => ({
        question: item.q,
        answer: stripHtml(item?.a ?? ""),
      }))
      .filter((item) => Boolean(item.answer));
  } catch {
    return [];
  }
}

/**
 * 2026-style /case-study/[slug] detail template: the blue-gradient hero
 * (company logo + headline + summary + meta card), white sections retelling
 * the doc's problem/solution overview, barriers, solution rows and results
 * as light cards with serif ink headings, the customer's own testimonial as
 * a light card, an optional FAQ accordion, and the shared site chrome (nav +
 * footer). Replaces the old dark `components/case-study/CaseStudyPage`
 * composition; the shared homepage `TestimonialsSection` is intentionally
 * omitted here because each case study ships its own testimonial.
 *
 * @param props.config - The case study's section data.
 * @param props.logo - Optional company logo URL for the hero chip.
 */
export default function CaseStudyDetailPage({
  config,
  logo,
}: CaseStudyDetailPageProps) {
  const faqItems = toFaqItems(config);

  return (
    <main>
      <SiteNav />
      <CaseStudyHero hero={config?.hero} logo={logo} />
      <CaseStudyOverview {...config?.problemSolution} />
      <CaseStudyBarriers {...config?.barriers} />
      <CaseStudySolutions {...config?.solutions} />
      <CaseStudyResults {...config?.results} />
      <CaseStudyTestimonial {...config?.testimonial} />
      {faqItems.length > 0 ? <FaqSection items={faqItems} /> : null}
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
