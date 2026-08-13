// Content for the alt-text-generator tool.
//
// Read by both app/tools/alt-text-generator/page.tsx and the .md copy served
// at /tools/alt-text-generator.md, so the two can never disagree.
//
// Two facts an agent reading this needs and would otherwise guess wrong: the
// suggestions come from an AI model on a capped monthly budget, and only the
// first ten images on a page are analysed.

import type { ToolContent } from "./types";

export const ALT_TEXT_GENERATOR_CONTENT: ToolContent = {
  slug: "alt-text-generator",
  title: "Alt Text Generator",
  subhead:
    "Paste a URL and get a draft alt text for every image on the page, with the missing ones called out first.",
  description:
    "Free alt text generator. Paste a URL and an AI model writes draft alt text for the images on that page. Missing alt and empty alt are reported separately, because they are not the same thing.",
  howItWorks: [
    {
      title: "Paste any page URL",
      body: "We read the page as it is served and collect every image on it, along with the alt attribute each one already has.",
    },
    {
      title: "A model looks at the images",
      body: "The first ten images are shown to a vision model, which writes a draft alt text for each one and flags the images that look purely decorative.",
    },
    {
      title: "Review, then copy",
      body: "Every image gets a row showing what it has today and what we suggest. Copy one line, or copy the whole set as image tags.",
    },
  ],
  faq: [
    {
      question: "What is the difference between missing alt and empty alt?",
      answer:
        'An image with no alt attribute at all is a bug. A screen reader that meets one usually falls back to reading the file name out loud, which is useless. An image with alt="" is different: that is valid HTML and it is a deliberate instruction to skip the image, which is exactly right for a decorative flourish or a spacer. Most tools report both as "no alt text" and push you to fill in the second one, which makes the page worse. This tool reports them separately and never suggests text for an image it judges decorative.',
    },
    {
      question: "How many images does it analyse?",
      answer:
        "Up to 10 per run. Every image on the page is listed with the alt it currently has, but only the first ten are sent to the model. The rest are marked as skipped so you can see they were found rather than missed. Images that are not photos, like SVG icons and tracking pixels, are skipped too, and the row says why.",
    },
    {
      question: "Are the suggestions good enough to ship as they are?",
      answer:
        "They are a strong first draft, not a final answer. Alt text depends on context that a model cannot see from the image file alone: whether the picture is the only thing inside a link, whether the caption underneath already says the same words, whether the point of the image is the chart or the person holding it. Read each line before you paste it. The ones that need the most attention are images that carry meaning, like charts, diagrams, and screenshots.",
    },
    {
      question: "Which model writes them?",
      answer:
        "A Claude Haiku vision model. Each result page names the exact model it used, so you always know what wrote the text in front of you.",
    },
    {
      question: "Why did I get a message about a spending cap?",
      answer:
        "Because the suggestions cost real money to produce, the tool runs against a fixed monthly budget and stops when that budget is spent, rather than quietly billing more. If you see that message, the tool is working as designed and it will come back when the budget resets. Nothing is wrong with your page or your URL.",
    },
    {
      question: "Does it find images added by JavaScript?",
      answer:
        "No. We read the page as the server sends it, so images that a script injects after the page loads are not in what we see. Carousels and galleries that build themselves in the browser are the common case. If a page shows far fewer images here than you expect, that is usually why.",
    },
    {
      question: "Do you store the URLs I check?",
      answer:
        "We cache each result for 24 hours, keyed on the URL, so a repeat check or a shared link does not pay for the model twice. The images themselves are never copied or stored, only read. No account, no email, and no history of what you checked.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our servers. We read the page HTML, collect the images, and send the first ten to an AI vision model that writes the drafts.",
    },
    {
      label: "AI model",
      value:
        "A Claude Haiku vision model writes the suggestions. Every result names the exact model used. The suggestions are drafts for a human to review, not finished copy.",
    },
    {
      label: "Monthly budget",
      value:
        "Model spend is capped per month and fails closed. When the cap is reached the tool says so plainly and stops running until the budget resets. It never falls back to invented text.",
    },
    {
      label: "Images per run",
      value:
        "Up to 10 are sent to the model. Every image found is still listed with the alt it has today, and skipped rows say why they were skipped.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/alt-text-generator with a JSON body of {"url": "example.com"}. Returns JSON with images, counts, and the model name. Each image carries src, hadAlt, currentAlt, suggestedAlt, isDecorative, and an optional skippedReason. Failures come back as JSON with an error field, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The result, cached for 24 hours keyed on the URL. The image files themselves are read, never copied or stored.",
    },
    {
      label: "What it cannot see",
      value:
        "Images added by JavaScript after the page loads. Pages behind a login. Anything past the first 10 images in one run.",
    },
  ],
};
