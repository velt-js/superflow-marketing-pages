// Content for the favicon-checker tool.
//
// Read by both app/tools/favicon-checker/page.tsx and the .md copy served at
// /tools/favicon-checker.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const FAVICON_CHECKER_CONTENT: ToolContent = {
  slug: "favicon-checker",
  title: "Favicon Checker",
  subhead:
    "Paste a URL and find out whether your favicon actually works. We fetch every icon the page declares and read the real file, not just the HTML.",
  description:
    "Free favicon checker. Test whether your favicon really loads: every declared icon is fetched and its real format, size, and pixel dimensions are read from the file. Catches the 200-that-returns-HTML that other checkers pass. No login, no ads.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We fetch the page the way a browser would and read every icon declaration out of its head: rel=icon, apple-touch-icon, mask-icon, and the web app manifest.",
    },
    {
      title: "We fetch every icon",
      body: "Each declared icon, the manifest, and the implicit /favicon.ico are fetched for real. We read the format and the pixel dimensions from the file's own header rather than trusting the HTML or the content type.",
    },
    {
      title: "Read what is broken",
      body: "You get a yes or no on whether a browser gets an icon at all, then a check per problem with the exact fix. Copy the raw JSON if you want the result in a script.",
    },
  ],
  faq: [
    {
      question: "Why does my favicon work locally but not in production?",
      answer:
        "Almost always one of three things, and this tool tells you which. The file was never deployed, so the path 404s on production only. The path is right in development because a dev server serves the whole public directory and the production host does not. Or your app has a catch-all route that answers every unmatched path with the app shell, so /favicon.ico returns HTTP 200 with an HTML page. That third one is the nastiest, because every checker that only reads the status code calls it a pass.",
    },
    {
      question: "My favicon returns HTTP 200. Why do you still say it is broken?",
      answer:
        "Because we look at the bytes. A single-page app with a catch-all route answers /favicon.ico with 200 and hands back index.html, and some servers even label it image/x-icon. The status code says fine, the content type can say fine, and the browser still gets HTML where it wanted an image and shows the blank page glyph. We read the first bytes of every file we fetch and identify the real format from its header, so an HTML page pretending to be an icon is reported as exactly that.",
    },
    {
      question: "Do I still need a favicon.ico if I declare a PNG or an SVG?",
      answer:
        "For browsers, no. A declared PNG or SVG is what a modern browser will use. But plenty of things that link to your site are not browsers: RSS readers, chat clients unfurling a link, older feed tools, and some crawlers request /favicon.ico at the site root and try nothing else. An .ico at the root costs a few kilobytes and covers all of them, so we flag a missing one as worth fixing rather than as broken.",
    },
    {
      question: "What size should my favicon be?",
      answer:
        "An SVG is the best answer, because it scales to any density and sidesteps the question. If you are serving raster, 32x32 is the practical floor: retina tabs, the bookmark bar, and the history list all render above 16x16, so a 16-only icon is upscaled and looks soft. Add a 180x180 PNG for apple-touch-icon, because that is the size iOS renders on the home screen, and 192x192 plus 512x512 in the manifest, because Chrome requires both before it will offer to install the site.",
    },
    {
      question: "Why does it say my sizes attribute is wrong?",
      answer:
        "Because we compared it to the file. The sizes attribute is copied between projects more than almost any other piece of markup, so a link that says sizes=\"180x180\" pointing at the 57x57 file from an old export is common. It matters because browsers pick which icon to download from that attribute: a wrong value makes a browser choose a file that is not the size it wanted, then scale it. We read the real dimensions out of the PNG or ICO header and show both numbers next to each other.",
    },
    {
      question: "Does this check a favicon behind a login?",
      answer:
        "No. We make one ordinary request for the page and then a request per icon, all unauthenticated, exactly as a first-time visitor or a crawler would. If your site requires a session to serve the page, we see whatever an anonymous request gets. That is usually the right thing to test anyway, since the favicon has to work for people who are not logged in.",
    },
    {
      question: "Do you store the URLs I check?",
      answer:
        "We cache each result for 24 hours, keyed on the URL, so repeat checks and shared links load instantly. Nothing is stored beyond that cache. No account, no email, and no history of what you checked.",
    },
    {
      question: "Can I call this from a script?",
      answer:
        'Yes. Send a POST to /api/tools/favicon-checker with a JSON body like {"url": "example.com"} and you get the same JSON the page renders, including every check and every icon we fetched. The limit is 60 runs per hour per IP. The copy JSON button on any result shows you the exact shape.',
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. One fetch of the page you submit, then one fetch per declared icon, the web app manifest, and /favicon.ico. Nothing runs in your browser except the form and the icon previews, which load from the checked site directly.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/favicon-checker with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with an error field, never a bare 500.',
    },
    { label: "Rate limit", value: "60 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The check result, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "Whether any icon loads at all; every rel=icon, apple-touch-icon, and mask-icon declaration; the implicit /favicon.ico; the web app manifest and its icons; the real format and pixel size of every file; sizes attributes that disagree with the file; icons served over http on an https page; icon links sitting outside head; and theme-color.",
    },
    {
      label: "How the format is determined",
      value:
        "From the file's own header bytes, not from the Content-Type header and not from the file extension. A server returning an HTML page at an icon path is reported as broken even when it answers HTTP 200 and claims an image content type.",
    },
    {
      label: "Limits",
      value:
        "Up to 12 icons are fetched per run, and up to 6 of them from the manifest. Anything beyond that is reported as unchecked rather than silently dropped. Icons that only exist after JavaScript runs are not visible to a raw fetch.",
    },
  ],
};
