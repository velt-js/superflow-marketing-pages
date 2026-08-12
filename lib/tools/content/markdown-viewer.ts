// Content for the markdown-viewer tool.
//
// Read by both app/tools/markdown-viewer/page.tsx and the .md copy served at
// /tools/markdown-viewer.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const MARKDOWN_VIEWER_CONTENT: ToolContent = {
  slug: "markdown-viewer",
  title: "Markdown Viewer",
  subhead: "Open and read any Markdown file. Paste it or drop it in, and it renders as you type. Nothing is uploaded.",
  description: "Free online Markdown viewer and preview. Open .md files, paste Markdown, and read it rendered with tables, code blocks, and an outline. Runs entirely in your browser. No login, no ads, no upload.",
  howItWorks: [
  {
    title: "Paste or drop",
    body: "Paste Markdown into the left panel, or drop a .md file anywhere on it.",
  },
  {
    title: "It renders as you type",
    body: "The preview updates on every keystroke, with tables, fenced code, and nested lists laid out properly.",
  },
  {
    title: "Nothing is sent anywhere",
    body: "Parsing and rendering both happen in your browser. There is no upload step because there is no server to upload to.",
  },
  ],
  faq: [
  {
    question: "How do I open a .md file?",
    answer:
      "Click Open a .md file, or drag the file onto the panel. It is read by your browser and rendered on the spot. You can also paste Markdown straight into the left panel.",
  },
  {
    question: "Is my document uploaded anywhere?",
    answer:
      "No. There is no server behind this tool. The parser and the renderer both run in your browser, so the document never travels anywhere. You can turn off your network connection and the tool still works, which is the simplest way to check that claim for yourself.",
  },
  {
    question: "What Markdown does it support?",
    answer:
      "Headings, bold, italic, strikethrough, inline code, links, images, blockquotes, ordered and unordered lists including nesting, horizontal rules, fenced code blocks, and tables. Bare URLs become clickable without link syntax.",
  },
  {
    question: "Why does a link in my document not work?",
    answer:
      "Links are limited to http, https, mailto, in-page anchors, and site-relative paths. Anything else, including javascript: URLs, renders as plain text instead of a clickable link. A Markdown document can carry a script in a link, and a viewer that follows it would run a stranger's code in your browser.",
  },
  {
    question: "Can I use this to preview a README before pushing it?",
    answer:
      "Yes, and it is one of the more common reasons people reach for it. The rendering follows CommonMark, so what you see here is close to what GitHub will show. Platform-specific extensions like GitHub task lists and alert callouts are not rendered specially.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Two megabytes. Past that the browser starts to stutter while re-rendering on every keystroke, so the tool declines rather than locking up your tab.",
  },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "Entirely in the browser. There is no server behind this tool, so the document never travels anywhere. It works with the network disconnected.",
    },
    { label: "Size limit", value: "2 MB of Markdown." },
    {
      label: "Supported syntax",
      value:
        "Headings, bold, italic, strikethrough, inline code, links, images, blockquotes, nested ordered and unordered lists, horizontal rules, fenced code blocks, and tables. Bare URLs become links.",
    },
    {
      label: "Link safety",
      value:
        "Links are limited to http, https, mailto, in-page anchors, and site-relative paths. Anything else renders as plain text. The parser never produces HTML.",
    },
  ],
};
