import type { ReactNode } from "react";
import TestimonialsSection, {
  type TestimonialsProof,
} from "@/components/home-2026/TestimonialsSection";
import type { SolutionProof } from "@/lib/solutions/types";

/** The proof values the testimonials section knows how to render. */
const KNOWN_PROOF: readonly TestimonialsProof[] = [
  "wonderist-review",
  "headway",
  "harvey",
  "metrics-only",
];

/** Props for {@link ProofSection}. */
export interface ProofSectionProps {
  /** Which testimonial the page shows, from page data. */
  proof?: SolutionProof | string | null;
}

/**
 * S6, proof: the shared testimonials section showing the one testimonial the
 * page data picks, plus the metric strip. An unknown value renders the
 * metrics alone. A quote is never invented.
 *
 * @param props - The page's proof choice.
 * @returns The section.
 */
export default function ProofSection({ proof }: ProofSectionProps): ReactNode {
  const resolved: TestimonialsProof = KNOWN_PROOF.includes(
    proof as TestimonialsProof,
  )
    ? (proof as TestimonialsProof)
    : "metrics-only";
  return <TestimonialsSection proof={resolved} />;
}
