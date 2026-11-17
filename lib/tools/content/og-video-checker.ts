// Content for the og-video-checker tool.
//
// Read by both app/tools/og-video-checker/page.tsx and the .md copy served
// at /tools/og-video-checker.md, so the two can never disagree.

import { OG_VIDEO_RULES_REVIEWED } from "@/lib/toolkit/og-video";
import type { ToolContent } from "./types";

export const OG_VIDEO_CHECKER_CONTENT: ToolContent = {
  slug: "og-video-checker",
  title: "Open Graph Video Checker",
  subhead:
    "Paste a URL and find out whether its og:video actually plays when the link is shared. We fetch the video itself, not just the tag.",
  description:
    "Free og:video checker. Tests whether your Open Graph video loads, is a real MP4, streams on iPhone, and has the tags X and Google read instead.",
  howItWorks: [
    {
      title: "Paste a page URL",
      body: "The page that carries the og:video tags, not the video file. No login and no email.",
    },
    {
      title: "We read the tags, then fetch the video",
      body: "Every og:video and its type, size, and secure_url, read the way ogp.me defines them. Then we fetch the first part of the video and the share image and read what they really are from their own bytes.",
    },
    {
      title: "See it play, and see what to fix",
      body: "The video loads in a player sized the way a platform sizes it, beside a check list that says what each reader will do and the one line that fixes each problem.",
    },
  ],
  faq: [
    {
      question: "What is og:video?",
      answer:
        "It is the Open Graph tag that tells a platform a page has a video, and where the file is. It is defined on ogp.me alongside og:title and og:image, with structured properties for the details: og:video:secure_url for an https address, og:video:type for the format, and og:video:width and og:video:height for the size. The spec has not changed since it was published, so there is no new version to migrate to. What has changed is which platforms read it, and how strictly.",
    },
    {
      question: "My og:video tag is there. Why does the link still show a still image?",
      answer:
        "Usually for one of four reasons, and this tool checks each. The address does not serve a video (a 404, or a catch-all route answering with an HTML page). The format is not one a browser plays on its own, such as an HLS playlist or an old Flash file. The video is on http, which browsers block inside an https page. Or the platform reads a different tag: X never reads og:video and needs a player card, and Google reads a VideoObject in JSON-LD.",
    },
    {
      question: "Does X (Twitter) use og:video?",
      answer:
        "No. X plays video in a card only through twitter:card set to player, with twitter:player pointing at an https page that plays the video and twitter:player:width and twitter:player:height giving its size. Without that, X shows the image. The check list says which card X will build from your page.",
    },
    {
      question: "Does Google use og:video?",
      answer:
        "No. Google finds videos from a VideoObject in the page's structured data. It requires name, thumbnailUrl and uploadDate, and works best with contentUrl pointing at the file. We read the page's JSON-LD and report whether that object is there and complete.",
    },
    {
      question: "What should og:video:type be?",
      answer:
        'The real format of the file: video/mp4 for an MP4, video/webm for WebM, or text/html when og:video points at a player page. The example on ogp.me still uses application/x-shockwave-flash, and that line gets copied. Flash has not run anywhere since the end of 2020, so a platform that trusts it will not play your video. We compare the tag against the file\'s own header and flag any mismatch.',
    },
    {
      question: "Why does my video play in Chrome but not on an iPhone?",
      answer:
        "Most often because the server ignores byte-range requests. Safari asks for a video in pieces and will not play an MP4 from a server that answers with the whole file instead. We send the same kind of request and report what came back. Files on most object stores and CDNs are fine; files streamed through your own app server often are not.",
    },
    {
      question: "What does fast start mean?",
      answer:
        "An MP4 keeps an index of the video (the moov box) either before or after the video data. When it comes after, a player has to download the whole file before it can show the first frame, so a shared preview sits on a spinner. Moving it to the front is a one-line ffmpeg command with -movflags +faststart, and nothing is re-encoded. We read the start of the file to see which way round yours is.",
    },
    {
      question: "Do you download my video?",
      answer:
        "Only the first 512 KB of it, which is where the format, the size, and the index live. Nothing is stored except the report, which is cached for 24 hours keyed on the page URL. The player on the result loads the video in your browser straight from your server.",
    },
    {
      question: "Can I call this from a script?",
      answer:
        'Yes. Send a POST to /api/tools/og-video-checker with a JSON body like {"url": "example.com/video"} and you get the same JSON the page renders: every og:video with what the file really is, the share image, the X and Google tags, and every check with its fix. It is also an MCP tool, check_og_video. The limit is 60 runs per hour per IP.',
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. One fetch of the page you submit, then the first 512 KB of up to three og:video addresses and the first 256 KB of og:image. The player on the result loads in your browser from your own server.",
    },
    {
      label: "Spec",
      value:
        "og:video and its structured properties as defined on ogp.me, including the array rule: each og:video starts a new video and the properties after it belong to it. The spec has had no new release; this tool follows the published one.",
    },
    {
      label: "What it checks",
      value:
        "That og:video is declared and resolves; that the address serves a real video or player page, read from the file header; https; og:video:type against the real format; a format browsers play inline; declared width and height against the file's own size; byte-range support; MP4 fast start; og:image as the poster; og:type; video:duration against the file's length; the X player card; and a Google VideoObject.",
    },
    {
      label: "What it does not check",
      value:
        "What is in the video, its codecs beyond the container, its bitrate, or captions. It does not crawl the site and does not log in.",
    },
    {
      label: "Rules last reviewed",
      value: `${OG_VIDEO_RULES_REVIEWED}. Every result carries this date.`,
    },
    {
      label: "API",
      value:
        'POST /api/tools/og-video-checker with a JSON body of {"url": "example.com/video"}. Returns the same JSON the page shows. Failures come back as JSON with an error and an errorCode, never a bare 500.',
    },
    { label: "Rate limit", value: "60 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The report, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
  ],
};
