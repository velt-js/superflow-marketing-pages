// Content for the review-like-elon-musk tool.
//
// FRAMING NOTE: this lens is built from the public record, not from writing he
// published, so the copy says so. Same fence as the Steve Jobs tool.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_ELON_MUSK_CONTENT: ToolContent = {
  slug: "review-like-elon-musk",
  title: "Review like Elon Musk",
  subhead:
    "Paste a URL and run the five-step engineering algorithm over your page: question the requirement, delete the part, simplify, accelerate, automate — in that order.",
  description:
    "Free page review through the five-step engineering algorithm. Finds the sections that exist because somebody assumed a page needs them, what to delete outright, whether your claims can be checked, and how long it takes before your product does anything. An interpretation of a documented method, not an impersonation. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page the way a browser would — its text, its markup, and a screenshot. No login and no email.",
    },
    {
      title: "The algorithm, applied in order",
      body: "Question the requirement first, then delete, then simplify. Optimising something that should not exist is the most common and most expensive error, so the order matters.",
    },
    {
      title: "Get the delete list",
      body: "Most findings make the page smaller: which sections to remove, which claims cannot be checked, and how many steps stand between a reader and the product working.",
    },
  ],
  faq: [
    {
      question: "Is this what Elon Musk would say about my page?",
      answer:
        "No, and the tool will not claim otherwise. He has published no body of writing, so this lens is assembled from the public record — principally the five-step algorithm he has walked through on camera during the Starbase tours, and the first-principles reasoning he has described in interviews. It never writes as him, never states what he would have said, and never invents quotations.",
    },
    {
      question: "What is the five-step algorithm?",
      answer:
        "Make the requirements less dumb. Delete the part or process. Simplify or optimise. Accelerate cycle time. Automate. The order is the point: most people start at step three, optimising a thing that should have been deleted at step two, and automate at the end something nobody justified at the start.",
    },
    {
      question: "Why does it just tell me to delete things?",
      answer:
        "Because step two comes before step three, and almost no page has had step two applied to it. If your page is already lean, it will say so rather than inventing a deletion. But most landing pages contain at least one section that exists only because pages in that category have one.",
    },
    {
      question: "Does it have opinions about his companies or his posts?",
      answer:
        "No. The lens is scoped to engineering process and the checkability of claims — the parts of the public record that bear on what a landing page is doing. It is instructed to have no view on anything else, and a web page evidences none of it.",
    },
    {
      question: "Why does it keep asking for numbers?",
      answer:
        "Because an engineer reading your page cannot tell whether the product is good if nothing on it can be checked. \"Blazing fast\" is not a claim, it is a mood. A number with a unit is a claim, and a claim is what earns trust.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "The public record of a documented engineering method: the five-step algorithm as walked through in the 2021 Starbase tours, plus publicly described first-principles reasoning. This is an interpretation of a method, not the person, and the tool never speaks as him.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-elon-musk with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup, and a screenshot. Unjustified requirements, what could be deleted, first-principles versus analogy, checkable numbers, steps to first value, stated limits, and premature automation claims.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page, and anything outside engineering process and claims. It does not check SEO, accessibility, performance, or visual polish — other tools here do that.",
    },
  ],
};
