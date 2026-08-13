// Content for the json-ld-generator tool.
//
// Read by both app/tools/json-ld-generator/page.tsx and the .md copy served
// at /tools/json-ld-generator.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const JSON_LD_GENERATOR_CONTENT: ToolContent = {
  slug: "json-ld-generator",
  title: "JSON-LD Generator",
  subhead:
    "Give it a page URL and it writes the schema.org block for that page, then runs a validator over its own output before you see it.",
  description:
    "Free JSON-LD generator. Reads a page, picks the schema.org type that matches it, and writes a block grounded in what the page actually says. Validates its own output and shows you every check. Copy the script tag and paste it in. No login, no ads.",
  howItWorks: [
    {
      title: "Paste the page you want marked up",
      body: "The generator reads that page and nothing else. A page with real content on it produces a much better block than a thin landing page.",
    },
    {
      title: "It picks a type and writes the block",
      body: "A model chooses the schema.org type that fits the page, then fills it in using only what the page states. Anything it cannot find on the page is left out.",
    },
    {
      title: "Read the checks, then copy",
      body: "The same validator that powers our JSON-LD Validator runs over the generated block. Read what it says, then copy the script tag into your page.",
    },
  ],
  faq: [
    {
      question: "Can I trust markup that a model wrote?",
      answer:
        "Read it before you ship it. That is not a disclaimer, it is the workflow. The block is grounded in the text of your page, so most of it will be right, but you are the only one who can confirm that a description matches your intent or that a type is the one you meant. Structured data is a claim you are making to search engines about your own site, and it should be a claim you have read.",
    },
    {
      question: "Will it invent a rating or a review count?",
      answer:
        "It is instructed not to, and this is the single most important rule the tool follows. A fabricated aggregateRating is not a harmless embellishment. It is markup that contradicts the page, Google treats that as spam, and the penalty lands on the whole site rather than the one page. If your page does not state a rating, the generated block will not contain one.",
    },
    {
      question: "Why does it validate its own output?",
      answer:
        "Because generation and correctness are different problems. A model can produce something that reads perfectly and still miss a property Google requires, or use a date format that gets discarded. Running the checks afterwards turns that from something you find out months later into something you see before you paste.",
    },
    {
      question: "What if the type it chose is not the one I wanted?",
      answer:
        "Change it. The block is yours once you copy it, and the type is the first line. If a page is genuinely two things, an article that also answers questions for example, it is normal to ship two blocks. The validator will tell you if they end up contradicting each other.",
    },
    {
      question: "Where do I put the block?",
      answer:
        "Inside the head of the page, as a script tag with type application/ld+json. Copy the script tag button gives you exactly that. Most CMS platforms also have a field for custom head code or for schema markup, and pasting it there works the same way. It does not have to be in the head to be read, but that is the convention and it is the easiest place to find later.",
    },
    {
      question: "Does this cost anything?",
      answer:
        "Not for you. It costs us a few cents per run, because a model reads the page and writes the block. That is why there is a monthly ceiling on the whole tool. If you see a message saying the budget for this month is used up, nothing is broken. It means the ceiling did its job, and the tool comes back next month.",
    },
    {
      question: "Do you store the pages I generate for?",
      answer:
        "The generated block is cached for 24 hours against the URL, so opening the same page again does not pay for another run. Nothing else is kept. There is no account, no email, and no history.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On Superflow's servers. The page is fetched and read there, then an AI model writes the block.",
    },
    {
      label: "AI model",
      value:
        "Claude Opus. The generated markup is machine written and should be read before it is published.",
    },
    {
      label: "Monthly cap",
      value:
        "The tool has a monthly spend ceiling and fails closed when it is reached. That is reported as a plain message, not an error.",
    },
    {
      label: "Stored data",
      value:
        "The generated block is cached for 24 hours against the URL. Nothing else is stored.",
    },
    {
      label: "Rate limit",
      value:
        "10 runs per hour per IP. Cached results do not count against it.",
    },
    {
      label: "Grounding rule",
      value:
        "The model is instructed to omit any property it cannot support from the page. Ratings and review counts are never invented.",
    },
    {
      label: "API",
      value:
        "POST /api/tools/json-ld-generator with a JSON body of { url }. The response carries the generated block and its validation.",
    },
  ],
};
