// Content for the markdown-for-agents tool.
//
// Read by both app/tools/markdown-for-agents/page.tsx and the .md copy served
// at /tools/markdown-for-agents.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const MARKDOWN_FOR_AGENTS_CONTENT: ToolContent = {
  slug: "markdown-for-agents",
  title: "Markdown for Agents",
  subhead:
    "Turn any page into clean Markdown an AI agent can actually read, with the nav, footer, and scripts stripped out.",
  description:
    "Free HTML to Markdown converter built for AI agents. Paste a URL and get a clean Markdown copy of the page with navigation, headers, footers, and scripts removed. Copy it, download it, or publish it next to your HTML. No login, no ads.",
  howItWorks: [
    {
      title: "Paste a page URL",
      body: "We fetch that one page the way a browser would, following redirects along the way. Nothing is crawled and nothing else is touched.",
    },
    {
      title: "We strip the chrome",
      body: "Navigation, headers, footers, sidebars, scripts, styles, and embedded frames come out. What is left is the content, converted to CommonMark with links and images resolved to absolute URLs.",
    },
    {
      title: "Copy, download, or check the preview",
      body: "Take the raw Markdown, save it as a .md file, or switch to the rendered preview to see what an agent will read before you publish it.",
    },
  ],
  faq: [
    {
      question: "Why would I want a Markdown copy of my page?",
      answer:
        "Because that is closer to what a model actually consumes. An HTML page is mostly not content: navigation, cookie banners, analytics snippets, and layout markup often outweigh the words on the page. Every one of those tokens costs money and attention in an AI pipeline, and some of them actively mislead a model about what the page is for. Markdown keeps the headings, lists, tables, and links, and drops the rest.",
    },
    {
      question: "What exactly gets removed?",
      answer:
        "Navigation, header, footer, and sidebar regions, plus scripts, styles, noscript blocks, templates, inline SVG, and embedded frames. Everything else is converted: headings, paragraphs, lists, tables, blockquotes, code blocks, links, and images. Links and image sources are rewritten to absolute URLs so the document still works once it leaves your site.",
    },
    {
      question: "The output is missing content that is on the page. Why?",
      answer:
        "We read the HTML your server returns, not a rendered browser page. If your content is built in the browser by JavaScript, a raw fetch sees the empty shell around it. Server rendered and statically generated pages convert completely. Single page apps that render everything client side may convert to almost nothing, and that is a useful signal in itself, because most AI crawlers do not run JavaScript either.",
    },
    {
      question: "Is a site allowed to serve Markdown copies of its pages?",
      answer:
        "Yes, and a growing number do. The usual pattern is to publish the Markdown at the same path with a .md suffix and point at it from the HTML page with a link tag using rel=alternate and type=text/markdown. This site does exactly that: every tool page here has a Markdown copy at /tools/<slug>.md. There is no standard forcing anyone to honour it, but it costs nothing to serve and it is trivially easy for an agent to find.",
    },
    {
      question: "How big a page can it handle?",
      answer:
        "We read up to 3 MB of HTML and emit up to 1.5 MB of Markdown. Past that the document is cut at a line boundary and a note is appended saying so, rather than the whole run failing. A partial document is useful to an agent. An error is not. The page tells you when this happens.",
    },
    {
      question: "What if the site blocks the request?",
      answer:
        "Some sites sit behind bot protection that answers automated requests with an error, usually HTTP 403. When that happens we say so plainly instead of reporting that the page has no content. Your own site will rarely do this to you, and if it does, that is worth knowing, because the same protection is answering AI crawlers the same way.",
    },
    {
      question: "Do you store the pages I convert?",
      answer:
        "We cache each result for 24 hours, keyed on the URL, so repeat runs and shared links load instantly. Nothing is stored beyond that cache. No account, no email, and no history of what you converted.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our servers. One guarded fetch of the page you submit, then a mechanical HTML to Markdown conversion. No AI model is involved, so the output does not vary between runs.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/markdown-for-agents with a JSON body of {"url": "example.com"}. Returns {"ok": true, "report": {...}} where report carries markdown, title, description, wordCount, bytes, and truncated. Failures return {"ok": false, "code": "...", "message": "..."}, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The converted document, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "Size caps",
      value:
        "Up to 3 MB of HTML read per page, and up to 1.5 MB of Markdown emitted. A longer page is cut at a line boundary and the result is marked truncated.",
    },
    {
      label: "What gets stripped",
      value:
        "Navigation, header, footer, and aside regions, scripts, styles, noscript, template, inline SVG, and iframes.",
    },
    {
      label: "What it cannot see",
      value:
        "Content rendered in the browser by JavaScript. We read the HTML the server returns, which is also what most AI crawlers read.",
    },
  ],
};
