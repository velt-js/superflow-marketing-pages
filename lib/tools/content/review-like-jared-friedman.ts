// Content for the review-like-jared-friedman tool.
//
// See the framing note on review-like-aaron-epstein.ts. Same fence, same
// reason: a serving YC partner, a real photograph, and no affiliation.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_JARED_FRIEDMAN_CONTENT: ToolContent = {
  slug: "review-like-jared-friedman",
  title: "Review like Jared Friedman",
  subhead:
    "Paste a URL and get the idea underneath your page pressure-tested: is a real problem stated, who has it, what do they do about it today, and does the page read as a solution in search of a problem.",
  description:
    "Free landing page review through the idea-evaluation lens of YC Managing Partner Jared Friedman. Checks whether your page states a problem at all, whether it leads with a technology instead, who is hurt by it and how badly, and whether the idea survives being retold. An interpretation of published talks, not an impersonation, and not affiliated with Y Combinator. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page — its text, its markup and a screenshot. No login and no email.",
    },
    {
      title: "Seven tests on the idea, not the design",
      body: "Is a problem actually stated. Does the page lead with a technology and reverse-engineer a use for it. Is someone specific hurt, badly. Is the current alternative acknowledged. Could you repeat the idea after one read. Is there any reason to believe this team. Does the page admit what it does not do.",
    },
    {
      title: "Get the questions your page cannot answer",
      body: "For each one, what would have to be on the page to answer it. The lens is careful to separate 'the idea might be wrong' from 'the page does not say' — it can only judge the second.",
    },
  ],
  faq: [
    {
      question: "Is this Jared Friedman evaluating my startup?",
      answer:
        "No, on both counts. It is not him — the lens is assembled from the public record of his YC talks on getting and evaluating startup ideas, and it never writes as him or invents a quotation. And it is not evaluating your startup: it is reading one marketing page and asking what that page claims about the problem.",
    },
    {
      question: "Is this affiliated with Y Combinator?",
      answer:
        "No. Superflow is not affiliated with, endorsed by, or connected to Y Combinator or any of its partners. Every source the lens draws on is cited under the result.",
    },
    {
      question: "Will it tell me if my idea is good?",
      answer:
        "No, and this is the tightest fence on the whole roster. Evaluating an idea properly needs the market, the founders and the competition; this tool has a marketing page. So every test judges what the page CLAIMS about the problem, not whether the idea works. 'This page never states a problem' is answerable from the page. 'This market is too small' is not, and the lens will not say it.",
    },
    {
      question: "What is the 'solution in search of a problem' test?",
      answer:
        "It asks whether the page leads with a technology or with a situation — and whether the page would still exist, in this form, if the technology it is built on had never been invented. A headline that names AI, agents or a model, with the problem reverse-engineered in the section below, is the shape this test is looking for.",
    },
    {
      question: "Why does it care what people do today?",
      answer:
        "Because the real competitor is almost always the status quo — a spreadsheet, an agency, or nothing at all. Pages written as though the problem is currently unsolved lose to the thing the reader already uses, and they lose without the reader ever articulating why.",
    },
    {
      question: "How is this different from the other YC partner reviews?",
      answer:
        "It is the one most likely to disagree with the rest. The design and conversion lenses can pass a page that is beautifully clear about a product nobody needs. This one reads the same page and asks whether there is a real problem underneath it, which is a harsher question and a different one.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "The public record of Jared Friedman's writing and talks on startup ideas: his YC Startup School talk on how to get startup ideas, YC's talk on getting AI startup ideas, and YC's Requests for Startups. This is an interpretation of published material, not the person, and the tool never speaks as him.",
    },
    {
      label: "Affiliation",
      value:
        "None. Superflow is not affiliated with or endorsed by Y Combinator or Jared Friedman.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-jared-friedman with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup and a screenshot. Whether a problem is stated, whether the framing is technology-first, who is hurt and how badly, whether the existing alternative is acknowledged, whether the idea is repeatable, whether the team is justified, and whether any limit is drawn.",
    },
    {
      label: "What it does not check",
      value:
        "Whether the idea is good, the market is big, or the company will work — it has one page and no market data, and it will not pretend otherwise. It does not review design, copy polish or conversion, and it does not check SEO, accessibility, or performance.",
    },
  ],
};
