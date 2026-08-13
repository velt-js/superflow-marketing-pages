// Content for the full-page-screenshot tool.
//
// Read by both app/tools/full-page-screenshot/page.tsx and the .md copy
// served at /tools/full-page-screenshot.md, so the two can never disagree.
//
// This tool is the one exception to the site-wide "we store nothing" line:
// the capture is a file, and a file has to live somewhere. The facts table
// says so plainly, including how long the link lasts. An agent reading this
// document should come away knowing the image link dies in about a day.

import type { ToolContent } from "./types";

export const FULL_PAGE_SCREENSHOT_CONTENT: ToolContent = {
  slug: "full-page-screenshot",
  title: "Full Page Screenshot",
  subhead:
    "Capture any page from top to bottom in a real browser. No watermark, no extension, no signup.",
  description:
    "Free full page screenshot tool. Paste a URL and get the whole page as one PNG, captured in a real browser that scrolls to load lazy images. No watermark, no login, no height cap.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We open the page in a real headless browser at a desktop viewport, the same way a visitor would see it.",
    },
    {
      title: "We scroll the whole page",
      body: "The browser scrolls to the bottom before capturing, so images and sections that only load when they come into view are actually in the shot.",
    },
    {
      title: "Download the PNG",
      body: "You get one image of the entire page. Download it straight away, because the link we give you stops working after about 24 hours.",
    },
  ],
  faq: [
    {
      question: "How long does the image link last?",
      answer:
        "About 24 hours. The capture is stored in our own cloud bucket and the link we hand you is signed with an expiry, so it stops working roughly a day after the capture. Download the PNG if you need to keep it, or paste the URL again later to take a fresh capture. We show the remaining time next to the download button so it is never a surprise.",
    },
    {
      question: "Do you watermark the image?",
      answer:
        "No. The PNG is exactly what the browser rendered, with nothing added. There is no logo, no border, and no upsell strip along the bottom. It is also not capped in height, so a long landing page comes back as one tall image rather than the first screen.",
    },
    {
      question: "Why do some screenshot tools return a mostly blank page?",
      answer:
        "Because they capture without scrolling. Most modern sites only load images and sections when they scroll into view, so a browser that captures immediately gets placeholders for everything below the fold. We scroll to the bottom of the page first and wait for the network to settle, which is why the capture takes a few seconds rather than being instant.",
    },
    {
      question: "What size is the capture?",
      answer:
        "The viewport is a standard desktop width, and the height is however tall the page turns out to be. A short page comes back near screen size. A long one can be many thousands of pixels tall, which is why the tool shows it in a scrollable frame with a button to lay it out full height.",
    },
    {
      question: "Can it capture a page behind a login?",
      answer:
        "No. The browser we use has no session, no cookies from you, and no way to sign in, so it sees exactly what a logged out visitor sees. A page that requires a login will come back as the login screen. The same goes for content behind a paywall or a country block.",
    },
    {
      question: "Why did my capture fail?",
      answer:
        "The usual reasons are a site that blocks automated browsers, a page that never finishes loading, or a URL that is not reachable from the public internet. When that happens we say which one it was rather than handing back an empty image. Very heavy pages sometimes need a second attempt.",
    },
    {
      question: "Do you store the pages I capture?",
      answer:
        "The PNG is stored in our bucket so we have somewhere to serve it from, and its link expires in about 24 hours. We also keep the result of the run for one hour so a repeat request for the same URL does not re-run the browser. There is no account, no email, and no history of what you captured.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no watermark." },
    {
      label: "Where it runs",
      value:
        "On our servers. A real headless browser loads the page, scrolls to the bottom so lazy content renders, and captures the full height as one PNG.",
    },
    {
      label: "Stored data",
      value:
        "The PNG is stored in our own cloud bucket, and the link to it expires about 24 hours after the capture. The run result is cached for one hour, keyed on the URL. Nothing else is kept, and there is no account or history.",
    },
    {
      label: "Link expiry",
      value:
        "About 24 hours. This is a signed storage link, not a permanent URL. Download the file if you need it beyond that, or run the capture again for a fresh link.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/full-page-screenshot with a JSON body of {"url": "example.com"}. Returns JSON with imageUrl, expiresAt, bytes, width, height, and deviceType. Failures come back as JSON with an error field, never a bare 500.',
    },
    { label: "Rate limit", value: "10 captures per hour per IP." },
    {
      label: "Output",
      value:
        "One PNG of the entire page at a desktop viewport width, full height, no watermark and no height cap.",
    },
    {
      label: "What it cannot capture",
      value:
        "Anything behind a login, a paywall, or a country block, because the browser has no session of yours. Sites that refuse automated browsers. Pages that never finish loading.",
    },
  ],
};
