// Content for the review-like-aaron-epstein tool.
//
// NOTE ON FRAMING, AND IT IS SHARPER HERE THAN ON THE HISTORICAL PERSONAS:
// Aaron Epstein is a living, currently-serving partner at Y Combinator, a firm
// we have no relationship with, and this page carries his photograph. The
// not-affiliated line and the interpretive provenance are therefore not legal
// boilerplate to be trimmed for length — they are the difference between
// applying documented principles and implying an endorsement. The backend
// carries the matching fence (`firstPartyCorpus: false`). If one side drops it,
// pull both.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_AARON_EPSTEIN_CONTENT: ToolContent = {
  slug: "review-like-aaron-epstein",
  title: "Review like Aaron Epstein",
  subhead:
    "Paste a URL and get your landing page reviewed the way YC's Design Review does it: one clear call to action, copy that is clear before it is clever, and how fast a stranger gets to see the product actually work.",
  description:
    "Free landing page review through the principles YC partner Aaron Epstein applies in YC's Design Review series. Checks whether you have one call to action, whether your copy is too clever to land, how many scrolls before anyone sees the product work, and whether a carousel is hiding your best line. An interpretation of published talks, not an impersonation, and not affiliated with Y Combinator. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page — its text, its markup, a screenshot, and the type sizes and colours the browser actually resolved. No login and no email.",
    },
    {
      title: "Eight tests, applied to your page",
      body: "One call to action and nothing competing with it. Clever copy that backfires. How far down before a feat of strength. Whether the page says what you think it says. Demos that confuse. Carousels that bury your best content. Whether the way in is obvious. Whether the craft signals a real company.",
    },
    {
      title: "Get the verdict and the rewrite",
      body: "You get the single change worth making first, then the rest in severity order — with the rewritten headline rather than a note asking for a better one.",
    },
  ],
  faq: [
    {
      question: "Is this Aaron Epstein reviewing my page?",
      answer:
        "No, and the tool will not claim otherwise. This is a review lens assembled from the public record of his approach — YC's Design Review series, which he hosts, plus his Startup School talks. It never writes as him, never states what he would have said about your page, and never invents a quotation. It is our interpretation of published material.",
    },
    {
      question: "Is this affiliated with Y Combinator?",
      answer:
        "No. Superflow is not affiliated with, endorsed by, or connected to Y Combinator or any of its partners. We built this lens from material YC published publicly, and we cite every source under the result so you can check our work against it.",
    },
    {
      question: "Why this partner for a landing page review?",
      answer:
        "Because the corpus is the task. Aaron Epstein hosts YC's Design Review, a published series in which he loads a real startup's landing page and says what is wrong with it. That is exactly what this tool does, grounded in a record of him doing it. No other lens on this site has that property.",
    },
    {
      question: "What does it actually check?",
      answer:
        "Whether one call to action is obviously primary or three compete. Whether the headline is clever at the cost of being clear. How many scrolls before you see the product do something — a live demo, real output, an actual screenshot. Whether a stranger reading only the hero would correctly describe your product. Whether your demo clarifies or confuses. Whether a carousel or scroll animation is hiding your most important claim. Whether the route to using the product is visible. And whether the design signals care.",
    },
    {
      question: "How is this different from the other YC partner reviews?",
      answer:
        "They ask different questions and they will disagree. This one is about communication and design — does the page land. Pete Koomen's is about conversion — how many steps to value and what you would test. Gustaf Alströmer's is about distribution — who your first customer is. Jared Friedman's is about the idea underneath. A page can pass this one and fail all three.",
    },
    {
      question: "Does it look at the design or just the words?",
      answer:
        "Both. Alongside the text and the screenshot it reads the styles the browser actually resolved, so when it says your page renders five heading sizes with no system, that is a measurement rather than a guess from an image.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "The public record of Aaron Epstein's landing page critiques: YC's Design Review series, the conversion and AI-website episodes, and his Startup School talk on converting customers with cold email. This is an interpretation of published material, not the person, and the tool never speaks as him.",
    },
    {
      label: "Affiliation",
      value:
        "None. Superflow is not affiliated with or endorsed by Y Combinator or Aaron Epstein.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-aaron-epstein with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The review, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "The one page you submit: its visible text, its markup, a screenshot, and the type sizes, colours and spacing the browser resolved. Competing calls to action, clarity of the headline, time to a product demonstration, carousel and animation traps, and design craft.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page. It has no knowledge of your company, your traffic, or your conversion rate, and it will not predict a conversion lift. It does not check SEO, accessibility, or performance — other tools here do that.",
    },
  ],
};
