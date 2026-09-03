import type { ReactNode } from "react";
import FaqSection from "@/components/home-2026/FaqSection";
import {
  buildSolutionFaqItems,
  type SolutionFaqEntry,
} from "./solution-faq-data";

/** Props for {@link SolutionFaq}. */
export interface SolutionFaqProps {
  /** The page's own three questions. */
  faq?: readonly SolutionFaqEntry[] | null;
}

/**
 * S8, FAQ: the shared home FAQ accordion with the page's three questions
 * followed by the three shared ones.
 *
 * @param props - The page's questions.
 * @returns The section, or null when nothing resolves.
 */
export default function SolutionFaq({ faq }: SolutionFaqProps): ReactNode {
  const items = buildSolutionFaqItems(faq);
  if (items.length === 0) {
    return null;
  }
  return <FaqSection items={items} />;
}
