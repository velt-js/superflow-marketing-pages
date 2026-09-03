// Content for the review-like-yc-partner hub.
//
// THIS TOOL HAS NO BACKEND AGENT OF ITS OWN, on purpose.
//
// It is the umbrella page for the four partner lenses: it renders the same card
// picker they do, defaulted to Aaron Epstein, and posts to whichever partner is
// selected. A fifth "generic YC partner" agent would have to be a blend of four
// specific lenses, and a blend of four opinionated reviewers is a bland one —
// the exact generic-web-review failure the persona instructions exist to
// prevent. So the hub sells the choice and the partners do the reviewing.
//
// See the framing note on review-like-aaron-epstein.ts for the affiliation
// fence, which applies to this page more than to any of them, because this is
// the page whose title says "YC".

import type { ToolContent } from "./types";

export const REVIEW_LIKE_YC_PARTNER_CONTENT: ToolContent = {
  slug: "review-like-yc-partner",
  title: "Review like a YC Partner",
  subhead:
    "Paste a URL and get your landing page reviewed through four different YC partner lenses — communication, conversion, distribution, and the idea underneath. Pick a partner, or run all four over the same page.",
  description:
    "Free landing page review through four YC partner lenses: Aaron Epstein on communication and design, Pete Koomen on conversion, Gustaf Alströmer on distribution, and Jared Friedman on the idea. They disagree with each other, which is the point of running more than one. Interpretations of published talks, not impersonations, and not affiliated with Y Combinator. No login, no email.",
  howItWorks: [
    {
      title: "Pick a partner",
      body: "Four lenses, four different questions about the same page: does it communicate, does it convert, does it have a customer, and is there a real idea underneath. Switching partner does not lose your URL or the review you are reading.",
    },
    {
      title: "Paste any URL",
      body: "We load that one page — its text, its markup, a screenshot, and for two of the lenses the type sizes and colours the browser actually resolved. No login and no email.",
    },
    {
      title: "Run more than one",
      body: "The four disagree on purpose. A page that passes the design review can fail the idea review outright, and that gap is usually the most useful thing you learn here.",
    },
  ],
  faq: [
    {
      question: "Is this affiliated with Y Combinator?",
      answer:
        "No. Superflow is not affiliated with, endorsed by, or connected to Y Combinator or any of its partners. These are review lenses we built from material YC and the partners published publicly, and every source is cited under the result so you can check our work against it.",
    },
    {
      question: "Are these real YC partners reviewing my page?",
      answer:
        "No, and the tool will not claim otherwise. Each lens is assembled from the public record of one partner's documented approach — YC talks, the Design Review series, and published essays. None of them writes as the person, states what they would have said about your page, or invents a quotation.",
    },
    {
      question: "Which partner should I pick?",
      answer:
        "If you are not sure what your page is doing wrong, start with Aaron Epstein — communication failures are the most common and the most expensive. If your page is clear but nobody signs up, use Pete Koomen. If you cannot say who your first customer is, use Gustaf Alströmer. If you suspect the problem is upstream of the page entirely, use Jared Friedman.",
    },
    {
      question: "Why four partners instead of one YC lens?",
      answer:
        "Because a single blended lens would be worse than any of the four. What makes a review useful is a specific opinion consistently applied, and averaging four opinionated reviewers produces the generic page critique you can already get from any checker. Keeping them separate also means they can disagree, and the disagreement is informative.",
    },
    {
      question: "Why these four partners?",
      answer:
        "Each has a substantial, citable body of published material on a question a landing page can actually answer, and the four questions barely overlap. Aaron Epstein hosts YC's Design Review, which is literally the task this tool performs. Pete Koomen co-founded Optimizely. Gustaf Alströmer led growth at Airbnb. Jared Friedman wrote YC's material on evaluating startup ideas.",
    },
    {
      question: "Can I run all four over the same URL?",
      answer:
        "Yes, and it is the intended use. Switching partner posts to that partner's endpoint without navigating away, so you can run four lenses over one URL without re-typing it. Each partner has its own hourly budget and its own 24 hour cache.",
    },
  ],
  facts: [
    {
      label: "Lens sources",
      value:
        "YC's Design Review series, YC Startup School talks on first customers, talking to users and startup ideas, YC's Requests for Startups, and the partners' own published essays. Each partner page cites its own sources under the result.",
    },
    {
      label: "Affiliation",
      value:
        "None. Superflow is not affiliated with or endorsed by Y Combinator or any of the partners named here.",
    },
    {
      label: "API",
      value:
        'This hub has no endpoint of its own. Each lens has one: POST /api/tools/review-like-aaron-epstein, /api/tools/review-like-pete-koomen, /api/tools/review-like-gustaf-alstromer or /api/tools/review-like-jared-friedman, with a JSON body of {"url": "example.com"}.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP, per partner." },
    {
      label: "Stored data",
      value:
        "The review, cached for 24 hours keyed on the URL and the partner. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "The one page you submit: its visible text, its markup, a screenshot, and — for the Aaron Epstein and Pete Koomen lenses — the type sizes, colours and spacing the browser resolved.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page. No lens here has knowledge of your company, your traffic, your funnel or your competitors, and none will predict a conversion lift or judge whether your idea will work. SEO, accessibility and performance are covered by other tools here.",
    },
  ],
};
