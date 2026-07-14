// FAQ content for the 2026 homepage, kept in a server-safe module (NO
// "use client") so both the client <FaqSection> and Server Components can
// import it. Server Components need the real array to build the FAQPage
// JSON-LD via buildFaqPageSchema — importing it from the "use client"
// FaqSection module would hand back a client-reference proxy (not the array),
// which silently serialises to an empty `{}` schema.

export type FaqItem = {
  question: string;
  answer: string;
};

/* All questions and answers are verbatim from the reference home.html
   `faqData` array (source of truth), in the reference's order. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Does the AI replace my reviewers?",
    answer:
      "No. AI does the first pass and catches the obvious stuff. Your team and your client still review the work and sign off. The call always stays human.",
  },
  {
    question: "What can the agents check?",
    answer:
      "Broken links, brand colors and fonts against the client's guide, spelling, accessibility basics, and SEO, plus any rule from your own QA checklist.",
  },
  {
    question: "Can I build agents from my own QA checklist?",
    answer:
      "Yes. Paste your checklist in and Superflow turns it into agents that check for it on every asset. No engineer needed.",
  },
  {
    question: "Do my clients need an account?",
    answer:
      "No. They open a link, click the spot, and type. No signup, no app, no training.",
  },
  {
    question: "Can it really review a live website?",
    answer:
      "Yes. Agents check a live or staging site directly and pin findings to the exact element. Notes stay anchored through redeploys.",
  },
  {
    question: "Where does my data live, and is it used to train models?",
    answer:
      "Each client's data is isolated to your agency. Nothing is used to train models across customers.",
  },
  {
    question: "Can I review emails, PDFs, and ads, not just websites?",
    answer:
      "Yes. Superflow reviews websites, emails, PDFs, images, and ads, anywhere your team already ships client work.",
  },
  {
    question: "How is this different from Markup.io, Pastel, or BugHerd?",
    answer:
      "Those tools are manual by design: a person marks up a screenshot by hand. Superflow's AI reviews the work first, then your team and your client decide.",
  },
  {
    question: "What does it cost?",
    answer:
      "Plans run from a free start for solo studios to Enterprise with SSO and SCIM for larger teams. Start free, no credit card.",
  },
];
