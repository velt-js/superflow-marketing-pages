// Content for the review-like-peter-thiel tool.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_PETER_THIEL_CONTENT: ToolContent = {
  slug: "review-like-peter-thiel",
  title: "Review like Peter Thiel",
  subhead:
    "Paste a URL and get your page judged on the questions from Zero to One: are you a monopoly or a commodity, are you 10x better or 30% better, and does your page say anything anyone would argue with?",
  description:
    "Free page review through the positioning questions from Zero to One. Checks whether you claim a category of one or a slice of a crowded market, whether your improvement is an order of magnitude, and whether you state a secret most people would dispute. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page the way a browser would — its text, its markup, and a screenshot. No login and no email.",
    },
    {
      title: "Seven positioning questions",
      body: "Monopoly or competition, the secret, 10x or incremental, definite or indefinite optimism, distribution, vertical or horizontal progress, and durability.",
    },
    {
      title: "Get the argument",
      body: "The verdict, then each finding framed as an argument: what your page implies, why that is the wrong claim to be making, and what to claim instead.",
    },
  ],
  faq: [
    {
      question: "Is this actually Peter Thiel?",
      answer:
        "No. It is a review lens distilled from his published writing — Zero to One, the Wall Street Journal essay, and the Stanford lecture notes the book came from. It applies the arguments in those to your page. It never writes as him, never claims to know what he would say, and never invents quotations.",
    },
    {
      question: "What does it actually check?",
      answer:
        "Whether your positioning claims a category of one or a share of a crowded market. Whether the page states anything a well-informed reader would actually dispute. Whether your improvement claim is an order of magnitude or a percentage. Whether the future you describe is specific enough to be wrong. Whether distribution appears on the page at all. Whether this is a new thing or a better-managed version of an existing one. And whether any stated advantage compounds.",
    },
    {
      question: "Why does it object to my comparison table?",
      answer:
        "Because a comparison table concedes that you are in a crowded market and competing on features within it. The argument in Zero to One is that competition erodes the profits that make a company worth building. A table is often the single clearest signal that a page has accepted the market's framing rather than defining its own.",
    },
    {
      question: "Does it have political opinions?",
      answer:
        "No. The lens is scoped to positioning, markets and claims — the parts of his published writing that bear on what a landing page is doing. It is instructed to have no view on anything else, and a web page could not evidence one anyway.",
    },
    {
      question: "How is this different from the Paul Graham review?",
      answer:
        "Paul Graham asks whether your page is clear and honest and built for someone specific. This one asks whether what you are building is worth building — whether the claim is big enough, different enough, and durable enough. A page can be beautifully clear about a commodity.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "Distilled from Zero to One (2014), the Wall Street Journal essay \"Competition Is for Losers\" (2014), and the CS183 Stanford lecture notes (2012). Citations are shown on the page.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-peter-thiel with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup, and a screenshot. Positioning, differentiation, magnitude of the improvement claim, specificity about the future, distribution, and durability of advantage.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page. It has no knowledge of your market, your competitors, your funding, or your traffic, and it will not invent them. It does not check SEO, accessibility, or performance.",
    },
  ],
};
