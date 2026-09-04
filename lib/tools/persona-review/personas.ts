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
  /**
   * Which picker a persona belongs to.
   *
   * The roster is now two cohorts that do not mix on screen: the historical
   * figures, which have always shared one dropdown, and the YC partners, which
   * render as photo cards. Without this the YC pages would offer Steve Jobs in
   * a lineup captioned "currently serving partners", and the historical pages
   * would grow to a nine-item dropdown nobody reads to the bottom of.
   */
  group: PersonaGroup;
  /**
   * Job title, shown under the name in the card picker. Present only for
   * personas that have a current, checkable role — a title on a retired or
   * deceased figure would be a claim about the present that is not true.
   */
  role?: string;
  /**
   * Path to the headshot under /public, for the card picker.
   *
   * These are real photographs of living people, self-hosted from the source
   * each partner's employer publishes. A persona with a photo therefore MUST
   * carry the interpretive provenance line — see `provenanceFor` — because a
   * face next to a critique implies authorship far more strongly than a name
   * does, and that is exactly the implication the line exists to refuse.
   */
  photo?: string;
  /**
   * Citations for this lens, rendered under a result.
   *
   * They live on the PERSONA rather than on the page because the picker can
   * switch lens without navigating: a page-level list stayed fixed while the
   * provenance line above it changed, so a Steve Jobs review rendered under a
   * heading citing Paul Graham's essays. Mirrors `ReviewPersona.sources` in the
   * backend, which is where these lists are also kept honest.
   */
  sources: { title: string; url: string }[];
};

/** The two cohorts. See `PersonaOption.group`. */
export type PersonaGroup = "historical" | "yc";

export const PERSONAS: readonly PersonaOption[] = [
  {
    slug: "review-like-paul-graham",
    name: "Paul Graham",
    lens: "Clarity, a specific user, plain language, and whether anyone can try it",
    firstPartyCorpus: true,
    group: "historical",
    sources: [
      { title: "Startups in 13 Sentences", url: "https://www.paulgraham.com/13sentences.html" },
      { title: "Write Like You Talk", url: "https://www.paulgraham.com/talk.html" },
      { title: "Write Simply", url: "https://www.paulgraham.com/simply.html" },
      { title: "Writing, Briefly", url: "https://www.paulgraham.com/writing44.html" },
      { title: "Taste for Makers", url: "https://www.paulgraham.com/taste.html" },
      { title: "Schlep Blindness", url: "https://www.paulgraham.com/schlep.html" },
      { title: "The 18 Mistakes That Kill Startups", url: "https://www.paulgraham.com/startupmistakes.html" },
      { title: "Be Good", url: "https://www.paulgraham.com/good.html" },
    ],
  },
  {
    slug: "review-like-steve-jobs",
    name: "Steve Jobs",
    lens: "Focus, simplicity, and what you could remove",
    firstPartyCorpus: false,
    group: "historical",
    sources: [
      { title: "Apple II brochure, 1977 — “Simplicity is the ultimate sophistication”", url: "https://www.apple.com/" },
      { title: "WWDC 1997 closing Q&A — start with the customer experience", url: "https://www.youtube.com/watch?v=oeqPrUmVz-o" },
      { title: "Apple Special Event, October 2001 — “1,000 songs in your pocket”", url: "https://www.youtube.com/watch?v=kN0SVBCJqLs" },
      { title: "Stanford commencement address, 2005", url: "https://news.stanford.edu/2005/06/12/youve-got-find-love-jobs-says/" },
    ],
  },
  {
    slug: "review-like-peter-thiel",
    name: "Peter Thiel",
    lens: "Monopoly or commodity, 10x or incremental, and what you believe that others don't",
    firstPartyCorpus: true,
    group: "historical",
    sources: [
      { title: "Zero to One (2014)", url: "https://en.wikipedia.org/wiki/Zero_to_One" },
      { title: "Competition Is for Losers, Wall Street Journal, 2014", url: "https://www.wsj.com/articles/peter-thiel-competition-is-for-losers-1410535536" },
      { title: "CS183: Startup — Stanford lecture notes, 2012", url: "https://blakemasters.com/peter-thiels-cs183-startup" },
    ],
  },
  {
    slug: "review-like-elon-musk",
    name: "Elon Musk",
    lens: "Question the requirement, delete the part, and how long until it works",
    firstPartyCorpus: false,
    group: "historical",
    sources: [
      { title: "Starbase tour with Everyday Astronaut, 2021 — the five-step algorithm", url: "https://www.youtube.com/watch?v=t705r8ICkRw" },
      { title: "TED interview on first-principles reasoning", url: "https://www.ted.com/talks/elon_musk_the_future_we_re_building_and_boring" },
    ],
  },
  {
    slug: "review-like-travis-kalanick",
    name: "Travis Kalanick",
    lens: "Time to first value, friction, and how a two-sided market starts",
    firstPartyCorpus: false,
    group: "historical",
    sources: [
      { title: "Early Uber product history and the launch playbook (public reporting)", url: "https://en.wikipedia.org/wiki/Uber" },
      { title: "TED talk on the original product insight", url: "https://www.ted.com/talks/travis_kalanick_uber_s_plan_to_get_more_people_into_fewer_cars" },
    ],
  },

  // ── The YC partners ────────────────────────────────────────────────────
  //
  // Four currently-serving partners, each with a genuinely different question
  // about the same page: does it communicate, does it convert, does it have a
  // customer, and is there an idea underneath it. Ordered as a review would
  // run — message first, then conversion, then distribution, then the idea.
  //
  // `firstPartyCorpus` is FALSE for all four even though each corpus is the
  // partner's own talk or essay, because the model's own definition puts talks
  // and interviews on the public-record side. That is also the framing these
  // four need most: they are alive, employed, and named on a commercial page.
  {
    slug: "review-like-aaron-epstein",
    name: "Aaron Epstein",
    role: "YC General Partner",
    lens: "One call to action, clear before clever, and how fast you see the product work",
    firstPartyCorpus: false,
    group: "yc",
    photo: "/images/tools/personas/aaron-epstein.jpg",
    sources: [
      { title: "YC Design Review (series)", url: "https://www.ycombinator.com/library/carousel/Design%20Review" },
      { title: "Design Review: How to convert more visitors into customers", url: "https://www.ycombinator.com/blog/design-review-tips-for-increasing-conversions" },
      { title: "Design Review: critiquing AI startup websites", url: "https://www.ycombinator.com/blog/design-review-watch-aaron-and-garry" },
      { title: "How to Convert Customers With Cold Emails", url: "https://www.ycombinator.com/library/LZ-how-to-convert-customers-with-cold-emails" },
    ],
  },
  {
    slug: "review-like-pete-koomen",
    name: "Pete Koomen",
    role: "YC General Partner",
    lens: "Steps to the Aha moment, signup friction, and what you would test first",
    firstPartyCorpus: false,
    group: "yc",
    photo: "/images/tools/personas/pete-koomen.png",
    sources: [
      { title: "Design Review: How to convert more visitors into customers", url: "https://www.ycombinator.com/blog/design-review-tips-for-increasing-conversions" },
      { title: "YC Design Review (series)", url: "https://www.ycombinator.com/library/carousel/Design%20Review" },
      { title: "AI Horseless Carriages", url: "https://koomen.dev/essays/horseless-carriages/" },
    ],
  },
  {
    slug: "review-like-gustaf-alstromer",
    name: "Gustaf Alströmer",
    role: "YC General Partner",
    lens: "Who your first customer is, and whether this copy came from talking to them",
    firstPartyCorpus: false,
    group: "yc",
    photo: "/images/tools/personas/gustaf-alstromer.png",
    sources: [
      { title: "How to Get Your First Customers", url: "https://www.ycombinator.com/library/Ip-how-to-get-your-first-customers" },
      { title: "How to Talk to Users (Startup School)", url: "https://www.ycombinator.com/library/6O-how-to-talk-to-users" },
      { title: "Growth AMA with YC Partner Gustaf Alströmer", url: "https://www.ycombinator.com/blog/growth-ama-with-yc-partner-gustaf-alstromer/" },
    ],
  },
  {
    slug: "review-like-jared-friedman",
    name: "Jared Friedman",
    role: "YC Managing Partner",
    lens: "Is a real problem stated, who has it, and what they do about it today",
    firstPartyCorpus: false,
    group: "yc",
    photo: "/images/tools/personas/jared-friedman.jpg",
    sources: [
      { title: "How to Get Startup Ideas (Startup School)", url: "https://www.ycombinator.com/library/8g-how-to-get-startup-ideas" },
      { title: "How To Get AI Startup Ideas", url: "https://www.ycombinator.com/library/M8-how-to-get-ai-startup-ideas" },
      { title: "YC Requests for Startups", url: "https://www.ycombinator.com/rfs" },
    ],
  },
];

/**
 * The personas in one cohort, in roster order.
 *
 * @param group - The cohort to list.
 */
export function personasInGroup(group: PersonaGroup): PersonaOption[] {
  try {
    return PERSONAS.filter((persona) => persona.group === group);
  } catch {
    return [];
  }
}

/**
 * The citations for one lens.
 *
 * Derived from the persona that PRODUCED a result rather than from the page it
 * is rendered on — see `PersonaOption.sources`.
 *
 * @param slug - The persona slug.
 */
export function sourcesFor(slug: string): { title: string; url: string }[] {
  try {
    return personaBySlug(slug)?.sources ?? [];
  } catch {
    return [];
  }
}

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
