// Content for the json-ld-validator tool.
//
// Read by both app/tools/json-ld-validator/page.tsx and the .md copy served
// at /tools/json-ld-validator.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const JSON_LD_VALIDATOR_CONTENT: ToolContent = {
  slug: "json-ld-validator",
  title: "JSON-LD Validator",
  subhead:
    "Check the structured data on any page against schema.org, against what Google needs for a rich result, and against the other blocks on the same page.",
  description:
    "Free JSON-LD and structured data validator. Reads the rendered page, so it sees markup injected by Tag Manager and SEO plugins. Groups every check into four questions: does it parse, will it earn a rich result, are the values in the right format, and do the blocks agree with each other. No login, no ads.",
  howItWorks: [
    {
      title: "Paste any page URL",
      body: "One page at a time. Use the page you care about rather than the home page, because most sites mark up different types on different templates.",
    },
    {
      title: "We open the page in a browser",
      body: "Not a raw fetch. Structured data added by Google Tag Manager or an SEO plugin only exists after JavaScript runs, and that is what a search engine sees too.",
    },
    {
      title: "Read the four groups, then the fixes",
      body: "Every check lands in one of four questions, with a pass, a warning, or a failure. Each issue carries the reason it matters and what to change.",
    },
  ],
  faq: [
    {
      question: "How is this different from Google's Rich Results Test?",
      answer:
        "Google's tool answers one question: will this page get a rich result in Google search. That is worth knowing, and it is the only question it answers. It says nothing about types Google has no rich result for, nothing about markup that is valid but contradicts itself, and nothing about whether an answer engine that is not Google can make sense of the page. This tool checks the same rich-result requirements, then keeps going.",
    },
    {
      question: "How is this different from the schema.org validator?",
      answer:
        "The schema.org validator answers whether your vocabulary is legal: real types, real properties, correct nesting. It will happily pass a page where two blocks describe the same product at two different prices, because both blocks are valid on their own. Validity is the floor. Coherence across the whole page is what decides which value a consumer picks.",
    },
    {
      question: "What does the coherence group actually check?",
      answer:
        "Three things no single-block validator can see. Whether two blocks of the same type disagree about a property that identifies the entity, like a name or a price. Whether an @id reference points at something that is defined somewhere on the page. And whether anything on the page says who publishes it, which is what an answer engine needs before it can credit you rather than guess from the domain.",
    },
    {
      question: "Why does it render the page instead of just fetching it?",
      answer:
        "Because a large share of real structured data is injected after load, by a tag manager or by a WordPress SEO plugin. A raw fetch sees none of it and would tell you that you have no structured data when you have plenty. Googlebot runs JavaScript, so the rendered page is the honest input.",
    },
    {
      question: "Does a warning mean my markup is broken?",
      answer:
        "No. A failure means something is missing or wrong and a consumer will drop it. A warning means the markup is valid and will be read, but you are leaving something on the table or leaving a choice to someone else. Recommended properties are the common case. So is a conflict between two blocks that a consumer has to resolve on its own.",
    },
    {
      question: "It says my page has no structured data, but I added some",
      answer:
        "Two things to check. First, whether the markup is on the page you tested rather than on a template that only renders for some URLs. Second, whether whatever injects it ran at all: some tag managers only fire on consent, and if the injection is gated the markup genuinely is not there for a crawler either. If the block is in the HTML and the tool still reports nothing, tell us, because that is a bug on our side.",
    },
    {
      question: "Do you store the URLs I check?",
      answer:
        "Results are cached for 24 hours against the URL, so a shared link opens instantly and a repeat check does not run the whole thing again. Nothing else is kept. There is no account, no email, and no history.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On Superflow's servers. The page is opened in a real browser, so markup injected by JavaScript is included.",
    },
    {
      label: "Stored data",
      value:
        "The report is cached for 24 hours against the URL. Nothing else is stored.",
    },
    {
      label: "Rate limit",
      value:
        "10 runs per hour per IP. Cached results do not count against it.",
    },
    {
      label: "Scope",
      value:
        "One page per run. Every JSON-LD block on that page is read. Microdata and RDFa are not checked.",
    },
    {
      label: "Checks",
      value:
        "Grouped into four questions: syntax (does it parse), eligibility (will it earn a rich result), values (are the formats right), coherence (do the blocks agree).",
    },
    {
      label: "API",
      value:
        "POST /api/tools/json-ld-validator with a JSON body of { url }. The response carries the report and the findings.",
    },
  ],
};
