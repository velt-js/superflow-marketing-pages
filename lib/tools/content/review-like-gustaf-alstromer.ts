// Content for the review-like-gustaf-alstromer tool.
//
// See the framing note on review-like-aaron-epstein.ts. Same fence, same
// reason: a serving YC partner, a real photograph, and no affiliation.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_GUSTAF_ALSTROMER_CONTENT: ToolContent = {
  slug: "review-like-gustaf-alstromer",
  title: "Review like Gustaf Alströmer",
  subhead:
    "Paste a URL and get your page judged on distribution: whether it names a first customer you could actually go find, whether the copy sounds like it came from talking to users, and whether anyone would come back after the first visit.",
  description:
    "Free landing page review through the growth lens of YC partner and former Airbnb growth lead Gustaf Alströmer. Asks who your first customer is, whether your copy came from user conversations or from a whiteboard, what channel the page is built for, and why anyone would return. An interpretation of published talks, not an impersonation, and not affiliated with Y Combinator. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page — its text, its markup and a screenshot. No login and no email.",
    },
    {
      title: "Eight distribution tests",
      body: "Can you name the first customer this page would win. Does the copy show evidence of real user contact. What channel is this page built for. Why would anyone come back. Is there a way to start before the product is finished. Is there proof someone already uses this. Is it narrow enough. How far is arriving from getting value.",
    },
    {
      title: "Get the segment and the rewrite",
      body: "You get the specific segment the lens would pick if it had to pick one, based only on what is on the page — and the sentences that would have to change to speak to them.",
    },
  ],
  faq: [
    {
      question: "Is this Gustaf Alströmer reviewing my page?",
      answer:
        "No, and the tool will not claim otherwise. This is a review lens assembled from the public record of his approach — his YC Startup School talks on getting your first customers and talking to users, and his growth AMA. It never writes as him, never states what he would have said about your page, and never invents a quotation.",
    },
    {
      question: "Is this affiliated with Y Combinator?",
      answer:
        "No. Superflow is not affiliated with, endorsed by, or connected to Y Combinator or any of its partners. Every source the lens draws on is cited under the result.",
    },
    {
      question: "How can a growth review work from one page with no analytics?",
      answer:
        "It cannot, and the lens is built around that limit rather than pretending past it. Every test below is rewritten as something the page itself evidences: the segment it names, the channel it implies, whether the copy reads as though it came out of ten user conversations. Anything that would need a dashboard to answer — your actual retention, your channel mix, your conversion rate — is deliberately not in the lens, because a reviewer asked to judge it from a landing page will invent something that sounds right.",
    },
    {
      question: "What is the 'talked to users' test?",
      answer:
        "It looks for the marks real user contact leaves on copy: the problem stated in the words a user would use, a specific workflow described accurately, an objection answered before it is raised, a named job title. Pages written from a feature list read differently from pages written after ten conversations, and the difference is visible.",
    },
    {
      question: "Why does it keep telling me to narrow down?",
      answer:
        "Because that is the principle. A page that serves six industries and five roles is usually a page whose team does not yet know who it is for, and breadth makes it weaker for every one of those groups. If your page is already narrow, it will say so and stay quiet rather than inventing findings.",
    },
    {
      question: "How is this different from the other YC partner reviews?",
      answer:
        "Aaron Epstein asks whether the page communicates and Pete Koomen asks whether it converts. Both can pass on a page that has no route to a customer. This one asks the question that comes next: supposing the page is clear and converts, how does anybody end up on it, and what happens to the one person who does.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "The public record of Gustaf Alströmer's growth advice: his YC Startup School talks on getting your first customers and on talking to users, and his growth AMA on the YC blog. This is an interpretation of published material, not the person, and the tool never speaks as him.",
    },
    {
      label: "Affiliation",
      value:
        "None. Superflow is not affiliated with or endorsed by Y Combinator or Gustaf Alströmer.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-gustaf-alstromer with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
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
        "The one page you submit: its visible text, its markup and a screenshot. Whether a first customer is nameable, evidence of user contact in the copy, the channel the page fits, the reason to return, a non-self-serve way to start, checkable proof, breadth of claim, and the distance between arriving and getting value.",
    },
    {
      label: "What it does not check",
      value:
        "Your actual traffic, retention, conversion rate or channel mix — it cannot see any of them and will not guess. It does not review design or typography, and it does not check SEO, accessibility, or performance.",
    },
  ],
};
