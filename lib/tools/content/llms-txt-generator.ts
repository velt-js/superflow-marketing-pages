// Content for the llms-txt-generator tool.
//
// Read by both app/tools/llms-txt-generator/page.tsx and the .md copy served
// at /tools/llms-txt-generator.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const LLMS_TXT_GENERATOR_CONTENT: ToolContent = {
  slug: "llms-txt-generator",
  title: "llms.txt Generator",
  subhead:
    "Generate a spec-correct llms.txt and llms-full.txt for any site, then publish them at your site root.",
  description:
    "Free llms.txt generator. Paste a site URL and get both files the llmstxt.org convention describes: llms.txt, an index of your pages, and llms-full.txt with the page content inlined. Deterministic, no AI model involved. No login, no ads.",
  howItWorks: [
    {
      title: "Paste your site URL",
      body: "We read the homepage, then robots.txt, then the sitemaps it points at. Sites without a sitemap fall back to the links on the homepage.",
    },
    {
      title: "We build the inventory",
      body: "Discovered pages are grouped into sections from their URL paths, and titled from their slugs. Top level pages sit in a section called Core.",
    },
    {
      title: "Copy or download both files",
      body: "llms.txt is the index. llms-full.txt is the same site with page content converted to Markdown and inlined. Each has its own copy and download button.",
    },
  ],
  faq: [
    {
      question: "What is llms.txt?",
      answer:
        "A proposed convention, published at llmstxt.org, for a plain text file at your site root that tells a language model what your site contains. The format is small: one H1 with the site name, a blockquote summary, then H2 sections of Markdown links. A companion file, llms-full.txt, inlines the page content so a model can read the site without fetching each page.",
    },
    {
      question: "Is llms.txt a standard? Does anything actually read it?",
      answer:
        "No, and honestly, not much yet. It is a proposal by one author, not a specification any company has agreed to follow, and no major AI provider has publicly committed to reading it. Some documentation platforms and AI coding tools do look for it. Treat this the way you would treat any low cost bet: publishing the file takes a few minutes and cannot hurt you, and if adoption grows you already have one. Anyone telling you it guarantees anything is guessing.",
    },
    {
      question: "Where do I put the files?",
      answer:
        "At your site root, so they answer at https://yoursite.com/llms.txt and https://yoursite.com/llms-full.txt. Serve them as plain text. On most static hosts that means dropping them in the public folder. On a CMS you may need a route or a redirect. Nothing else about your site needs to change.",
    },
    {
      question: "Does this use an AI model?",
      answer:
        "No. Despite the name, no model runs at any point. The name refers to the output file, not the method. Generation is a deterministic transform of your own site inventory: titles come from your page titles and URL slugs, sections come from your URL paths, and content comes from a mechanical HTML to Markdown conversion. Two runs over an unchanged site produce the same bytes, which also means nothing is invented about your site.",
    },
    {
      question: "Why does it say fewer pages were included than found?",
      answer:
        "Because they are different jobs. Discovery lists up to 200 same-origin URLs, and every one of those appears in llms.txt as a link. Inlining content is far more expensive, so llms-full.txt includes up to 15 pages and stops at an 800 KB budget. On a site larger than that you get a real, valid, partial file. The page shows both numbers so you know which you have.",
    },
    {
      question: "Should I edit the output before publishing it?",
      answer:
        "Usually yes. The generator works from your URL structure, which is a decent proxy for importance but not the same thing. Read the summary line, reorder sections so the pages you most want understood come first, and delete anything that is noise. The file is yours. This tool gets you to a correct starting point in seconds instead of an hour.",
    },
    {
      question: "Do you store my site data?",
      answer:
        "We cache each result for 24 hours, keyed on the URL, so repeat runs and shared links load instantly. Nothing is stored beyond that cache. No account, no email, and no history of what you generated.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our servers. Guarded fetches of your homepage, robots.txt, your sitemaps, and the pages selected for inlining.",
    },
    {
      label: "AI involvement",
      value:
        "None. Generation is a deterministic transform of your site's own inventory, so it costs nothing to run and produces the same output every time for an unchanged site.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/llms-txt-generator with a JSON body of {"url": "example.com"}. Returns {"ok": true, "report": {...}} where report carries llmsTxt, llmsFullTxt, siteName, pagesDiscovered, pagesIncluded, and truncated. Failures return {"ok": false, "code": "...", "message": "..."}, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The two generated files, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "Discovery caps",
      value:
        "Up to 200 same-origin URLs, from up to 5 sitemap candidates and 5 child sitemaps of a sitemap index.",
    },
    {
      label: "Inlining caps",
      value:
        "Up to 15 pages inlined into llms-full.txt, an 800 KB total budget, and 200 KB per page. Runs stop starting new fetches after about 22 seconds.",
    },
    {
      label: "Where the files go",
      value:
        "Your site root: https://yoursite.com/llms.txt and https://yoursite.com/llms-full.txt, served as plain text.",
    },
  ],
};
