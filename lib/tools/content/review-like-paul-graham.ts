// Content for the review-like-paul-graham tool.
//
// Read by both app/tools/review-like-paul-graham/page.tsx and the .md copy, so
// the two can never disagree.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_PAUL_GRAHAM_CONTENT: ToolContent = {
  slug: "review-like-paul-graham",
  title: "Review like Paul Graham",
  subhead:
    "Paste a URL and get your page judged on the things Paul Graham actually tests for: whether a stranger can tell what it is, whether it is built for someone specific, and whether the words sound like a person.",
  description:
    "Free page review through a lens distilled from Paul Graham's essays. Checks whether your hero says what the product is, whether you named a specific user, whether anyone can try it without booking a call, and whether the copy reads like speech. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page the way a browser would — its text, its markup, and a screenshot. No login and no email.",
    },
    {
      title: "Nine tests, applied to your page",
      body: "The lens is nine recurring heuristics drawn from the essays, filtered down to the ones a single page can actually show evidence for. Every finding has to quote something on your page.",
    },
    {
      title: "Get the verdict and the rewrites",
      body: "One sentence on the most important thing, then the findings — each with the exact sentence it objects to and, for copy problems, the sentence we would have written instead.",
    },
  ],
  faq: [
    {
      question: "Is this actually Paul Graham?",
      answer:
        "No, and it does not pretend to be. It is a review lens distilled from his published essays — the recurring tests he applies, written down and applied to your page. It never writes as him, never claims to know what he would say, and never invents quotations. The essays it was built from are listed on the page, so you can check the lens against the source.",
    },
    {
      question: "Why does it ignore my SEO and accessibility?",
      answer:
        "Because that is not this lens. Any checker will tell you about contrast ratios and meta tags, and we have other free tools that do exactly that. This one answers a different question: would a specific reader, with a specific set of opinions about startups, think your page is clear? A finding that is not from that lens is left out on purpose.",
    },
    {
      question: "What does it actually check?",
      answer:
        "Whether the hero says what the product is without scrolling. Whether the page names a specific user or hedges to everyone. Whether there is a way to try the thing without booking a call. Whether the sentences are ones you would say out loud. Whether fancy phrasing is hiding the absence of a claim. Whether the hard questions — pricing, limits, what it does not do — are answered or avoided. Whether the page stands on its own rather than on a comparison.",
    },
    {
      question: "Why are some of his best-known ideas missing?",
      answer:
        "Because a web page cannot show evidence for them. \"Pick good cofounders\" and \"get ramen profitable\" are central to his thinking and completely invisible from a landing page, so asking a model to judge them would produce invented findings. The lens is deliberately limited to what your page can actually demonstrate.",
    },
    {
      question: "Will it just tell me my page is bad?",
      answer:
        "It will tell you what it finds, and if a test passes it says nothing rather than manufacturing a finding to fill the list. It is direct — that is the point of the lens — but it is aimed at the page, not at you, and every finding comes with the concrete change.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "Distilled from Paul Graham's own essays, including Startups in 13 Sentences, Write Simply, Write Like You Talk, Writing Briefly, Taste for Makers, Schlep Blindness, The 18 Mistakes That Kill Startups, and Be Good. The full citation list is on the page.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-paul-graham with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup, and a screenshot of it. Clarity, audience, whether the product can be tried, plain language, concreteness, whether the unglamorous questions are answered, and visual simplicity.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page. It has no knowledge of your company, your funding, your traffic, or your competitors, and it will not crawl the rest of your site. It also does not check SEO, accessibility, or performance — other tools here do that.",
    },
  ],
};
