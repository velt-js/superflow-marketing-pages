// Content for the lookalike-test tool.

import type { ToolContent } from "./types";

export const LOOKALIKE_TEST_CONTENT: ToolContent = {
  slug: "lookalike-test",
  title: "Lookalike Test",
  subhead:
    "Paste your URL, pick a benchmark or name the sites you admire, and see exactly where your page's structure, copy and layout differ from theirs.",
  description:
    "Free design comparison tool. See how your page's structure, hero, calls to action, navigation and density compare against a curated benchmark set or against sites you name, with the numbers on both sides and what to change. No login, no email.",
  howItWorks: [
    {
      title: "Give us your page, and a benchmark",
      body: "Pick a curated pack — modern developer tools, or SaaS marketing pages — or name up to three sites you want to be measured against.",
    },
    {
      title: "We measure both sides",
      body: "Your page gets the full treatment: text, markup, a screenshot, and the type sizes and colours the browser actually resolved. The reference sites are measured for structure and copy.",
    },
    {
      title: "Get the differences, with numbers",
      body: "Not a score. A list of concrete differences — your hero is 61 words, the benchmark runs 21 to 38 — with what to change for each.",
    },
  ],
  faq: [
    {
      question: "Will this just tell me to look like Linear?",
      answer:
        "No, and it is built specifically to avoid that. Every benchmark separates the patterns that transfer — how a page is organised, how much it says, how it asks for the click — from the identity that does not, meaning palette, typefaces, illustration style and copy voice. The tool is instructed never to recommend adopting those, and if your own visual identity is stronger than the benchmark's it will say so.",
    },
    {
      question: "Can I compare against any site, or only your presets?",
      answer:
        "Either. Name up to three sites and we fingerprint them at run time, or pick a curated pack we measured in advance. Named sites win when you supply both.",
    },
    {
      question: "Why does it say 'not measured' for some reference fields?",
      answer:
        "Because we read sites you name from their raw HTML rather than rendering them, so we can count their sections, nav entries, hero length and buttons, but we cannot see their colours or type scale. Rather than guess, we mark those as not measured and the review is forbidden from comparing against them. Curated packs were measured with a browser in advance, so they carry more. Either way, your own page is always measured properly.",
    },
    {
      question: "Why only three comparison sites?",
      answer:
        "Each one is a real page fetch on top of loading and screenshotting your own page. Three is enough to see a pattern rather than one site's quirks, and it keeps a single run from turning into a crawl of somebody else's site.",
    },
    {
      question: "Is a lower difference count better?",
      answer:
        "Not necessarily, and the tool does not give you a score for exactly that reason. Some differences are yours on purpose. What it gives you is the list, with the number on both sides, so you can decide which ones you meant.",
    },
  ],
  facts: [
    {
      label: "Benchmarks",
      value:
        "Two curated packs — modern developer tools (Linear, Stripe, Vercel) and SaaS marketing pages (Notion, Figma, Loom) — measured 2026-08-18, or up to three sites you name.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/lookalike-test with a JSON body of {"url": "example.com"} plus an optional "packId" or "compareUrls" array. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The comparison, cached for 24 hours keyed on the URL and the benchmark. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "Structure and section count, hero length and whether the product is shown, call-to-action count and labels, navigation size, type scale and palette on your page, and total page density — each against the benchmark's equivalent.",
    },
    {
      label: "What it does not check",
      value:
        "The rendered colours or type scale of sites you name, since those are read from raw HTML. It does not crawl beyond the pages given, does not log in, and does not judge your brand identity against anyone else's.",
    },
  ],
};
