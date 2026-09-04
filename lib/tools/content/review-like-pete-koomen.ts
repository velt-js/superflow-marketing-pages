// Content for the review-like-pete-koomen tool.
//
// See the framing note on review-like-aaron-epstein.ts. Same fence, same
// reason: a serving YC partner, a real photograph, and no affiliation.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_PETE_KOOMEN_CONTENT: ToolContent = {
  slug: "review-like-pete-koomen",
  title: "Review like Pete Koomen",
  subhead:
    "Paste a URL and get your page judged as a conversion experiment: how many steps to the moment your product becomes obviously useful, what friction sits in the way, and whether this page makes a claim you could actually test.",
  description:
    "Free landing page review through the conversion lens of YC partner and Optimizely co-founder Pete Koomen. Counts the steps to your Aha moment, the required fields in your signup, and the audiences your hero is trying to serve at once. Tells you what it would test first. An interpretation of published material, not an impersonation, and not affiliated with Y Combinator. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page — its text, its markup, a screenshot, and the type sizes and colours the browser actually resolved. No login and no email.",
    },
    {
      title: "Eight tests, and most of them are counts",
      body: "Steps to the Aha moment. Required signup fields. Whether the page makes one falsifiable claim. How many audiences the hero serves. Whether the primary action is singular. Whether the value fits above the fold. Whether AI is doing the work or decorating. Whether proof sits where the doubt is.",
    },
    {
      title: "Get the one change to ship this week",
      body: "The findings come back with the numbers behind them — five fields, four competing buttons, seven steps — and the single change worth shipping first, phrased as the variant rather than as advice to go test something.",
    },
  ],
  faq: [
    {
      question: "Is this Pete Koomen reviewing my page?",
      answer:
        "No, and the tool will not claim otherwise. This is a review lens assembled from the public record: YC's Design Review episodes he appears in, and his own published essays. It never writes as him, never states what he would have said about your page, and never invents a quotation.",
    },
    {
      question: "Is this affiliated with Y Combinator?",
      answer:
        "No. Superflow is not affiliated with, endorsed by, or connected to Y Combinator or any of its partners. Every source the lens draws on is cited under the result so you can check it.",
    },
    {
      question: "Will it tell me how much more I would convert?",
      answer:
        "No, and it is built specifically not to. It can see one page and has no baseline, no traffic and no funnel data, so any percentage it gave you would be fabricated. What it will do is count the things it can actually count — steps, fields, competing actions — and tell you which one it would change first.",
    },
    {
      question: "What is the 'Aha moment' test?",
      answer:
        "It traces the shortest path from your page to the moment a visitor sees the product do the useful thing, and counts every discrete step along the way: click, form, email confirmation, onboarding screen, empty state. Most pages are further from that moment than their team believes, and an empty dashboard is a common place to stop counting too early.",
    },
    {
      question: "What is the AI question about?",
      answer:
        "Drawn from his essay on AI products built in the shape of the thing they replaced. If your product involves AI, the lens asks whether the model is doing the work or whether AI has been added as a feature — a chat box in the corner, a sparkle icon on an existing button. A page that would read identically with the word AI deleted from every sentence fails that test.",
    },
    {
      question: "How is this different from the other YC partner reviews?",
      answer:
        "Aaron Epstein's lens asks whether the page communicates. This one takes the page as a machine and asks how many steps it costs a visitor to get value, and what you would test to find out. Gustaf Alströmer asks who your first customer is; Jared Friedman asks whether there is a real problem underneath any of it.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "The public record of Pete Koomen's conversion work: YC's Design Review conversion episode, the Design Review series, and his published essay on AI product shape. This is an interpretation of published material, not the person, and the tool never speaks as him.",
    },
    {
      label: "Affiliation",
      value:
        "None. Superflow is not affiliated with or endorsed by Y Combinator or Pete Koomen.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-pete-koomen with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup, a screenshot, and the type sizes, colours and spacing the browser resolved. Steps to value, signup friction, claim testability, audience count, primary action, above-the-fold value, AI framing, and proof placement.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page. It has no access to your analytics, your funnel, your traffic or your conversion rate, and it will never predict a lift percentage. It does not check SEO, accessibility, or performance — other tools here do that.",
    },
  ],
};
