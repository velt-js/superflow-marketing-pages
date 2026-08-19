// The persona roster, shared by every review page.
//
// ONE SOURCE OF TRUTH, because it is read by three things that must agree: the
// dropdown on each review page, the route each page posts to, and the registry
// entry that gives each persona its own URL. Each `slug` is simultaneously the
// page path, the API route, the free-tool id, and the backend agent id — they
// are deliberately the same string end to end, so a mismatch is impossible
// rather than merely unlikely.
//
// The dropdown does NOT navigate. Picking a persona changes which endpoint the
// form posts to, so a visitor can run four lenses over the same URL without
// re-typing it or losing the result they are reading.

export type PersonaOption = {
  /** Page path, API route, free-tool id and agent id, all the same string. */
  slug: string;
  /** Name as it appears in the dropdown. */
  name: string;
  /** One line under the picker, so the choice is informed rather than a guess. */
  lens: string;
  /**
   * False when the lens is assembled from the public record rather than from
   * writing the person published themselves. Those personas render an
   * interpretive framing line — see `provenanceFor`.
   */
  firstPartyCorpus: boolean;
};

export const PERSONAS: readonly PersonaOption[] = [
  {
    slug: "review-like-paul-graham",
    name: "Paul Graham",
    lens: "Clarity, a specific user, plain language, and whether anyone can try it",
    firstPartyCorpus: true,
  },
  {
    slug: "review-like-steve-jobs",
    name: "Steve Jobs",
    lens: "Focus, simplicity, and what you could remove",
    firstPartyCorpus: false,
  },
  {
    slug: "review-like-peter-thiel",
    name: "Peter Thiel",
    lens: "Monopoly or commodity, 10x or incremental, and what you believe that others don't",
    firstPartyCorpus: true,
  },
  {
    slug: "review-like-elon-musk",
    name: "Elon Musk",
    lens: "Question the requirement, delete the part, and how long until it works",
    firstPartyCorpus: false,
  },
  {
    slug: "review-like-travis-kalanick",
    name: "Travis Kalanick",
    lens: "Time to first value, friction, and how a two-sided market starts",
    firstPartyCorpus: false,
  },
];

/**
 * Looks a persona up by slug.
 *
 * @param slug - The persona slug.
 */
export function personaBySlug(slug: string): PersonaOption | undefined {
  try {
    return PERSONAS.find((persona) => persona.slug === slug);
  } catch {
    return undefined;
  }
}

/**
 * The provenance line shown above a result for one persona.
 *
 * Not decoration, and not a disclaimer to be trimmed for length: for a lens
 * assembled from the public record it is the difference between applying
 * documented principles and putting words in a real person's mouth. The
 * backend carries the matching fence (`firstPartyCorpus: false` changes the
 * attribution paragraph in the prompt). If one side loses it, pull both.
 *
 * Because the dropdown can switch persona without leaving the page, this MUST
 * be derived from the selected persona rather than fixed per page — a static
 * line would show Paul Graham's framing over a Steve Jobs review.
 *
 * @param slug - The selected persona slug.
 */
export function provenanceFor(slug: string): string {
  try {
    const persona = personaBySlug(slug);
    if (!persona) return "";

    if (persona.firstPartyCorpus) {
      return `This is a review lens distilled from ${persona.name}'s own published writing — the recurring tests applied to your page. It is not ${persona.name}, it does not speak as ${persona.name}, and it does not quote ${persona.name}.`;
    }

    return `This applies principles assembled from the public record of ${persona.name}'s documented approach — talks, interviews, and published material. It is an interpretation of a body of work, not the person. It does not speak as ${persona.name}, does not claim what ${persona.name} would have said, and does not quote ${persona.name}.`;
  } catch {
    return "";
  }
}
