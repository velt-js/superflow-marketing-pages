// FAQ items for a solutions page (spec S8), kept in a server-safe module (no
// "use client") so the route can build the FAQPage JSON-LD from the same six
// items the client FaqSection renders.

import { FAQ_ITEMS, type FaqItem } from "@/components/home-2026/faq-data";

/** The three shared questions every solutions page appends, by exact match. */
export const SHARED_FAQ_QUESTIONS: readonly string[] = [
  "Does the AI replace my reviewers?",
  "Do my clients need an account?",
  "Can I build agents from my own QA checklist?",
];

/** One page-specific question as stored in page data. */
export interface SolutionFaqEntry {
  q: string;
  a: string;
}

/**
 * The six FAQ items for a page: its own three (q/a mapped to question/answer)
 * followed by the three shared ones pulled from the home FAQ list. Duplicate
 * questions are dropped so a page that repeats a shared question shows it once.
 *
 * @param faq - The page's own questions.
 * @returns The items to render and to emit as FAQPage JSON-LD.
 */
export function buildSolutionFaqItems(
  faq?: readonly SolutionFaqEntry[] | null,
): FaqItem[] {
  try {
    const seen = new Set<string>();
    const items: FaqItem[] = [];

    for (const entry of faq ?? []) {
      const question = entry?.q?.trim();
      const answer = entry?.a?.trim();
      if (!question || !answer || seen.has(question)) {
        continue;
      }
      seen.add(question);
      items.push({ question, answer });
    }

    for (const question of SHARED_FAQ_QUESTIONS) {
      const shared = FAQ_ITEMS.find((item) => item.question === question);
      if (!shared || seen.has(shared.question)) {
        continue;
      }
      seen.add(shared.question);
      items.push(shared);
    }

    return items;
  } catch {
    return [];
  }
}
