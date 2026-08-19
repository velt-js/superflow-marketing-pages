// Content for the review-like-steve-jobs tool.
//
// NOTE ON FRAMING: this lens is built from the public record rather than from
// the man's own writing, and the copy below says so in the subhead, the FAQ and
// the facts. That is not legal boilerplate to be trimmed — it is what keeps the
// tool from reading as words put in a real person's mouth. The backend carries
// the same fence (`firstPartyCorpus: false`). If one side drops it, pull both.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_STEVE_JOBS_CONTENT: ToolContent = {
  slug: "review-like-steve-jobs",
  title: "Review like Steve Jobs",
  subhead:
    "Paste a URL and get your page judged on the product principles Apple made famous: focus, simplicity, and starting from what the person actually gets.",
  description:
    "Free page review through the product principles Apple made famous under Steve Jobs. Checks whether you say it in human terms, whether the page decided what NOT to say, whether the product is visible, and what you could remove. An interpretation of a public body of work, not an impersonation. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page — its text, its markup, a screenshot, and the type sizes and colours the browser actually resolved. No login and no email.",
    },
    {
      title: "Nine principles, applied to your page",
      body: "Focus, human units over specs, experience before technology, one decision, showing the product, and craft in the details nobody would have checked. Every finding has to point at something really on the page.",
    },
    {
      title: "Get the verdict and what to cut",
      body: "Most findings make the page smaller. You get the list of what to remove, the claim to lead with, and the one button worth keeping.",
    },
  ],
  faq: [
    {
      question: "Is this what Steve Jobs would say about my page?",
      answer:
        "No, and the tool will not claim otherwise. He published no body of writing, so this lens is assembled from the public record — keynotes, on-stage interviews, and Apple's own published design copy. It is an interpretation of a documented approach to products, made by us. It never writes as him, never states what he would have said, and never invents quotations. If you want a lens built from someone's own prose, the Paul Graham review is exactly that.",
    },
    {
      question: "What does it actually check?",
      answer:
        "Whether your capability is stated in terms a person can picture rather than in specs. How many different things the page claims to be. Whether it opens with the experience or with the technology. What could be removed with nothing lost. Whether one call to action is obviously primary. Whether the real product is visible. Whether the first sixty seconds after signup are shown. Whether there is craft in the details that carry no functional requirement. And whether the copy reads as though it was written by a committee.",
    },
    {
      question: "How is this different from the Paul Graham review?",
      answer:
        "They disagree, which is the point of running both. The Paul Graham lens is about what the page says — clarity, a specific user, plain language, whether you can try the thing. This one is about focus and product taste — what to remove, what to lead with, whether the page made a decision. A page can pass one and fail the other.",
    },
    {
      question: "Why does it keep telling me to delete things?",
      answer:
        "Because that is the principle. Focus is deciding what not to say, and most marketing pages accumulate sections rather than choosing between them. If your page is already tight, it will say so and stay quiet rather than inventing findings.",
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
        "The public record of Apple's product principles under Steve Jobs: the 1977 Apple II brochure, the WWDC 1997 closing Q&A, the October 2001 iPod introduction, and the 2005 Stanford commencement address. This is an interpretation of a public body of work, not the person, and the tool never speaks as him.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-steve-jobs with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup, a screenshot, and the type sizes, colours and spacing the browser resolved. Focus, human framing, experience-before-technology, simplicity, a single primary action, whether the product is shown, and craft.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page. It has no knowledge of your company, your roadmap, or your competitors. It does not check SEO, accessibility, or performance — other tools here do that.",
    },
  ],
};
