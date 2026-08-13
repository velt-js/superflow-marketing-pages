// Content for the utm-builder tool.
//
// Read by both app/tools/utm-builder/page.tsx and the .md copy served at
// /tools/utm-builder.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const UTM_BUILDER_CONTENT: ToolContent = {
  slug: "utm-builder",
  title: "UTM Builder",
  subhead: "Build campaign URLs that follow one convention, and see which GA4 channel each link will land in before you send it.",
  description: "Free UTM builder and campaign URL generator. Enforces a tagging convention across your team, shows the GA4 channel each link lands in, warns about the mistakes that break reporting, and builds links in bulk. Runs in your browser. No login, no ads.",
  howItWorks: [
  {
    title: "Paste the destination",
    body: "Any page URL. Existing tags on it can be loaded into the fields rather than duplicated.",
  },
  {
    title: "Fill in the placement",
    body: "Source and medium at minimum. Your convention is applied as you type, and each field shows the tag it will actually produce.",
  },
  {
    title: "Check the warnings, then copy",
    body: "The tool flags unrecognised mediums, personal data, and internal-link tagging before the link goes out. Add several to build a set.",
  },
  ],
  faq: [
  {
    question: "Which UTM parameters do I actually need?",
    answer:
      "Source and medium. Without both, GA4 cannot place the visit in a channel and it usually ends up reported as direct. Campaign is strongly recommended because it is how you group placements together. Term and content are optional, and content is the one most people underuse: it is how you tell the hero button apart from the footer link in the same email.",
  },
  {
    question: "Why does capitalisation matter so much?",
    answer:
      "Analytics tools treat values as literal strings. Facebook, facebook, and FaceBook are three separate rows in your report, splitting one campaign's numbers three ways. Nothing warns you, and it is only obvious months later when the totals look wrong. Forcing lowercase is the single highest-value rule a team can agree on, which is why it is the default here.",
  },
  {
    question: "What does the channel line under Medium mean?",
    answer:
      "GA4 sorts traffic into default channel groups, and for most channels the decision comes from utm_medium alone. If you use a medium GA4 does not recognise, like newsletter or partner-blog, the traffic lands in Unassigned where nobody looks. This tool tells you which channel you are about to land in while you can still change it. Paid is the one exception: GA4 needs the source too, because it splits paid into Search, Social, Video, and Shopping.",
  },
  {
    question: "Should I put UTM tags on links inside my own site?",
    answer:
      "No. This is the most expensive UTM mistake there is. A tagged internal link starts a brand new session and overwrites the source that originally brought the person in, so a visitor who arrived from a paid ad and clicked a tagged nav link gets attributed to the nav link instead. Use UTMs only on links that bring someone in from outside.",
  },
  {
    question: "Can I build a lot of links at once?",
    answer:
      "Yes. Build one, click Add to list, change the source or the placement, and add the next. When you are done you can copy them all or download a CSV with one row per link and a column per parameter, which drops straight into a campaign tracker.",
  },
  {
    question: "Are my URLs sent anywhere?",
    answer:
      "Not from this page. The builder runs in your browser, so a URL you type here has nowhere to go. Campaign URLs give away more than people realise, including launches that have not been announced and partners who have not signed, which is why it works that way. Only your convention settings are saved, in your own browser. There is a separate endpoint for scripts and agents that cannot run a browser: it does the same pure transform on our side and stores nothing, but anything you send it does leave your machine, so prefer this page when you have the choice.",
  },
  {
    question: "What is utm_id for?",
    answer:
      "It matches a link to a campaign row when you import ad cost data into GA4. If you are not importing cost data, leave it empty. It is not a general purpose identifier and it should never carry anything personal.",
  },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "The tool on this page runs entirely in the browser: the URLs you build there are never uploaded or logged. The same builder is also published as an endpoint for scripts and agents, which does the identical pure transform on our side and stores nothing — but if you can use the page, use the page.",
    },
    {
      label: "Stored data",
      value:
        "Only the tagging convention, in the visitor's own browser localStorage. Never a built URL.",
    },
    {
      label: "Required parameters",
      value: "utm_source and utm_medium. utm_campaign is strongly recommended.",
    },
    {
      label: "Parameters written",
      value: "utm_source, utm_medium, utm_campaign, utm_id, utm_term, utm_content. Empty fields are omitted rather than written blank.",
    },
    {
      label: "Bulk output",
      value: "Add links to a list, then copy all or download a CSV with one row per link and a column per parameter.",
    },
  ],
};
